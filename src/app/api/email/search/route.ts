import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { searchEmailsByVector } from "@/lib/vector-search";
import { serverLog } from "@/lib/logging/server-logger";
import { withRequestId } from "@/lib/logging/with-request-id";
import { recordSearchLatency } from "@/lib/metrics/store";
import {
  checkUserRateLimit,
  rateLimit429Response,
} from "@/lib/rate-limit";

async function searchHandler(req: NextRequest | Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchLimit = checkUserRateLimit(userId, "search");
    if (!searchLimit.allowed) {
      return rateLimit429Response({
        message: "Too many search requests. Try again later.",
        remaining: searchLimit.remaining,
        limit: searchLimit.limit,
        retryAfterSec: 60,
      });
    }

    const searchParams =
      "nextUrl" in req && req.nextUrl
        ? req.nextUrl.searchParams
        : new URL(req.url).searchParams;
    const query = searchParams.get("q");
    const accountId = searchParams.get("accountId");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [], count: 0 });
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const startTime = Date.now();
    const searchQuery = query.trim().toLowerCase();

    const keywordResults = await performKeywordSearch(
      searchQuery,
      accountId,
      20,
    );

    const keywordSearchTime = Date.now() - startTime;

    const shouldUseSemanticSearch =
      keywordResults.length < 5 && searchQuery.length > 2;

    let finalResults = keywordResults;

    if (shouldUseSemanticSearch) {
      console.log(
        `[Search] Keyword search returned ${keywordResults.length} results, trying semantic search...`,
      );
      try {
        const semanticResults = await searchEmailsByVector(
          searchQuery,
          accountId,
          10,
        );

        const keywordIds = new Set(keywordResults.map((r) => r.id));
        const additionalSemantic = semanticResults
          .filter((r) => !keywordIds.has(r.email.id))
          .slice(0, 5);

        finalResults = [
          ...keywordResults,
          ...additionalSemantic.map((r) => ({
            id: r.email.id,
            subject: r.email.subject,
            snippet:
              r.email.bodySnippet || r.email.body?.substring(0, 200) || "",
            from: {
              name: r.email.from.name,
              address: r.email.from.address,
            },
            sentAt: r.email.sentAt.toISOString(),
            threadId: r.email.threadId,
            relevanceScore: r.relevanceScore,
            matchType: "semantic" as const,
          })),
        ];
      } catch (semanticError) {
        console.error(
          "[Search] Semantic search failed, using keyword results:",
          semanticError,
        );
      }
    }

    finalResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const limitedResults = finalResults.slice(0, 20);

    const totalTime = Date.now() - startTime;
    recordSearchLatency(totalTime);

    serverLog.info(
      {
        event: "search_complete",
        latencyMs: totalTime,
        resultCount: limitedResults.length,
        searchType: shouldUseSemanticSearch ? "hybrid" : "keyword",
        keywordMs: keywordSearchTime,
      },
      "email search completed",
    );
    console.log(
      `[Search] Query: "${searchQuery}" | Results: ${limitedResults.length} | Time: ${totalTime}ms | Keyword: ${keywordSearchTime}ms`,
    );

    return NextResponse.json(
      {
        results: limitedResults,
        count: limitedResults.length,
        searchTime: totalTime,
        searchType: shouldUseSemanticSearch ? "hybrid" : "keyword",
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60",
        },
      },
    );
  } catch (error) {
    console.error("[Search] Error:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const GET = withRequestId(searchHandler);

async function performKeywordSearch(
  query: string,
  accountId: string,
  limit: number,
): Promise<SearchResult[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const searchTerms = query
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .map((term) => term.trim().toLowerCase());

  if (searchTerms.length === 0) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();

  const orConditions = searchTerms.flatMap((term) => [
    {
      from: {
        name: {
          contains: term,
          mode: "insensitive" as const,
        },
      },
    },
    {
      from: {
        address: {
          contains: term,
          mode: "insensitive" as const,
        },
      },
    },
    {
      subject: {
        contains: term,
        mode: "insensitive" as const,
      },
    },
    {
      bodySnippet: {
        contains: term,
        mode: "insensitive" as const,
      },
    },
    {
      body: {
        contains: term,
        mode: "insensitive" as const,
      },
    },
  ]);

  orConditions.push(
    {
      from: {
        name: {
          contains: queryLower,
          mode: "insensitive" as const,
        },
      },
    },
    {
      from: {
        address: {
          contains: queryLower,
          mode: "insensitive" as const,
        },
      },
    },
    {
      subject: {
        contains: queryLower,
        mode: "insensitive" as const,
      },
    },
    {
      bodySnippet: {
        contains: queryLower,
        mode: "insensitive" as const,
      },
    },
    {
      body: {
        contains: queryLower,
        mode: "insensitive" as const,
      },
    },
  );

  const emails = await db.email.findMany({
    where: {
      thread: {
        accountId: accountId,
      },
      sentAt: {
        gte: thirtyDaysAgo,
      },
      OR: orConditions,
    },
    include: {
      from: true,
      thread: true,
    },
    take: limit * 5,
  });

  const rankedResults = emails.map((email) => {
    let relevanceScore = 0;
    const fromName = (email.from.name || "").toLowerCase();
    const fromAddress = email.from.address.toLowerCase();
    const subject = email.subject.toLowerCase();
    const snippet = (email.bodySnippet || "").toLowerCase();
    const body = (email.body || "").toLowerCase();

    if (fromName.includes(queryLower)) {
      relevanceScore += 15.0;
    } else if (fromAddress.includes(queryLower)) {
      relevanceScore += 14.0;
    }

    if (subject.includes(queryLower)) {
      relevanceScore += 12.0;
    }

    if (snippet.includes(queryLower)) {
      relevanceScore += 8.0;
    }

    if (body.includes(queryLower)) {
      relevanceScore += 6.0;
    }

    let matchingWords = 0;
    for (const term of searchTerms) {
      if (fromName.includes(term)) {
        relevanceScore += 10.0;
        matchingWords++;
      } else if (fromAddress.includes(term)) {
        relevanceScore += 9.0;
        matchingWords++;
      }

      if (subject.includes(term)) {
        relevanceScore += 7.0;
        matchingWords++;
      }

      if (snippet.includes(term)) {
        relevanceScore += 4.0;
        matchingWords++;
      }

      if (body.includes(term)) {
        relevanceScore += 2.0;
        matchingWords++;
      }
    }

    if (matchingWords >= searchTerms.length) {
      relevanceScore += 5.0;
    }

    const daysSinceSent =
      (Date.now() - new Date(email.sentAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceSent < 7) {
      relevanceScore += 2.0;
    } else if (daysSinceSent < 30) {
      relevanceScore += 1.0;
    }

    return {
      email,
      relevanceScore,
    };
  });

  return rankedResults
    .filter((r) => r.relevanceScore > 0)
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      return (
        new Date(b.email.sentAt).getTime() - new Date(a.email.sentAt).getTime()
      );
    })
    .slice(0, limit)
    .map((r) => ({
      id: r.email.id,
      subject: r.email.subject,
      snippet: r.email.bodySnippet || r.email.body?.substring(0, 200) || "",
      from: {
        name: r.email.from.name,
        address: r.email.from.address,
      },
      sentAt: r.email.sentAt.toISOString(),
      threadId: r.email.threadId,
      relevanceScore: r.relevanceScore,
      matchType: "keyword" as const,
    }));
}

interface SearchResult {
  id: string;
  subject: string;
  snippet: string;
  from: {
    name: string | null;
    address: string;
  };
  sentAt: string;
  threadId: string;
  relevanceScore: number;
  matchType: "keyword" | "semantic";
}
