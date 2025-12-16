import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { searchEmailsByVector } from "@/lib/vector-search";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
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

  const queryLower = query.toLowerCase();

  const emails = await db.email.findMany({
    where: {
      thread: {
        accountId: accountId,
      },
      sentAt: {
        gte: thirtyDaysAgo,
      },
      OR: [
        {
          from: {
            name: {
              contains: queryLower,
              mode: "insensitive",
            },
          },
        },

        {
          from: {
            address: {
              contains: queryLower,
              mode: "insensitive",
            },
          },
        },

        {
          subject: {
            contains: queryLower,
            mode: "insensitive",
          },
        },

        {
          bodySnippet: {
            contains: queryLower,
            mode: "insensitive",
          },
        },

        {
          body: {
            contains: queryLower,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      from: true,
      thread: true,
    },
    take: limit * 3,
  });

  const rankedResults = emails.map((email) => {
    let relevanceScore = 0;
    const fromName = (email.from.name || "").toLowerCase();
    const fromAddress = email.from.address.toLowerCase();
    const subject = email.subject.toLowerCase();
    const snippet = (email.bodySnippet || "").toLowerCase();
    const body = (email.body || "").toLowerCase();

    if (fromName.includes(queryLower)) {
      relevanceScore += 10.0;
    } else if (fromAddress.includes(queryLower)) {
      relevanceScore += 9.0;
    } else if (searchTerms[0] && fromName.includes(searchTerms[0])) {
      relevanceScore += 8.0;
    } else if (searchTerms[0] && fromAddress.includes(searchTerms[0])) {
      relevanceScore += 7.0;
    }

    if (subject.includes(queryLower)) {
      relevanceScore += 5.0;
    } else if (searchTerms[0] && subject.includes(searchTerms[0])) {
      relevanceScore += 3.0;
    }

    if (snippet.includes(queryLower)) {
      relevanceScore += 2.0;
    } else if (searchTerms[0] && snippet.includes(searchTerms[0])) {
      relevanceScore += 1.0;
    }

    if (body.includes(queryLower)) {
      relevanceScore += 1.5;
    } else if (searchTerms[0] && body.includes(searchTerms[0])) {
      relevanceScore += 0.5;
    }

    const daysSinceSent =
      (Date.now() - new Date(email.sentAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceSent < 7) {
      relevanceScore += 1.0;
    } else if (daysSinceSent < 30) {
      relevanceScore += 0.5;
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
