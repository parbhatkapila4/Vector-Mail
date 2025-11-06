import { db } from "@/server/db";
import { generateQueryEmbedding, cosineSimilarity } from "./email-analysis";

export interface SearchResult {
  email: any;
  similarity: number;
  relevanceScore: number;
}

export async function searchEmailsByVector(
  query: string,
  accountId: string,
  limit: number = 10,
): Promise<SearchResult[]> {
  try {
    const queryEmbedding = await generateQueryEmbedding(query);

    if (queryEmbedding.every((val) => val === 0)) {
      console.warn("Empty query embedding, falling back to text search");
      return await fallbackTextSearch(query, accountId, limit);
    }

    const emails = (await db.$queryRaw`
      SELECT 
        e.*,
        (e."vectorEmbedding" <=> ${JSON.stringify(queryEmbedding)}::vector) as distance
      FROM "Email" e
      JOIN "Thread" t ON e."threadId" = t.id
      WHERE t."accountId" = ${accountId}
        AND e."vectorEmbedding" IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${limit * 2}
    `) as any[];

    if (emails.length === 0) {
      return await fallbackTextSearch(query, accountId, limit);
    }

    const topEmailIds = emails.slice(0, limit).map((e: any) => e.id);

    const fullEmails = await db.email.findMany({
      where: {
        id: { in: topEmailIds },
      },
      include: {
        thread: true,
        from: true,
        to: true,
        cc: true,
        attachments: true,
      },
      });

    const emailDistanceMap = new Map(
      emails.map((e: any) => [e.id, e.distance]),
    );

    const results: SearchResult[] = fullEmails
      .map((email: any) => {
        const distance = emailDistanceMap.get(email.id) || 1;
        const similarity = 1 - distance;
        const relevanceScore = calculateRelevanceScore(
          email,
          query,
          similarity,
        );

        return {
          email,
          similarity,
          relevanceScore,
        };
      })
      .filter((result: any) => result.similarity > 0.1)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return results;
  } catch (error) {
    console.error("Vector search error:", error);
    return await fallbackTextSearch(query, accountId, limit);
  }
}

async function fallbackTextSearch(
  query: string,
  accountId: string,
  limit: number = 10,
): Promise<SearchResult[]> {
  try {
    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 2);

    if (searchTerms.length === 0) {
      const emails = await db.email.findMany({
        where: {
          thread: {
            accountId: accountId,
          },
        },
        include: {
          thread: true,
          from: true,
          to: true,
          cc: true,
          attachments: true,
        },
        orderBy: {
          sentAt: "desc",
        },
        take: limit,
      });

      return emails.map((email: any) => ({
        email,
        similarity: 0.5,
        relevanceScore: 0.5,
      }));
    }

    const emails = await db.email.findMany({
      where: {
        thread: {
          accountId: accountId,
        },
        OR: [
          {
            subject: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            body: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            aiSummary: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            aiTags: {
              hasSome: searchTerms,
            },
          },
        ],
      },
      include: {
        thread: true,
        from: true,
        to: true,
        cc: true,
        attachments: true,
      },
      orderBy: {
        sentAt: "desc",
      },
      take: limit * 2,
    });

    const results: SearchResult[] = emails
      .map((email: any) => {
        const relevanceScore = calculateTextRelevanceScore(
          email,
          query,
          searchTerms,
        );
        return {
          email,
          similarity: relevanceScore,
          relevanceScore,
        };
      })
      .filter((result: any) => result.relevanceScore > 0.1)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return results;
  } catch (error) {
    console.error("Fallback search error:", error);
    return [];
  }
}

function calculateRelevanceScore(
  email: any,
  query: string,
  similarity: number,
): number {
  let score = similarity;

  if (email.sysLabels?.includes("important")) score *= 1.3;

  const daysSinceSent =
    (Date.now() - new Date(email.sentAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceSent < 7) score *= 1.2;
  else if (daysSinceSent < 30) score *= 1.1;

  const queryLower = query.toLowerCase();
  const subjectLower = email.subject?.toLowerCase() || "";
  if (subjectLower.includes(queryLower)) score *= 1.4;

  const queryTerms = queryLower.split(" ").filter((term) => term.length > 2);
  const matchingTags =
    email.aiTags?.filter((tag: string) =>
      queryTerms.some((term) => tag.includes(term)),
    ) || [];

  if (matchingTags.length > 0) score *= 1.2;

  return score;
}

function calculateTextRelevanceScore(
  email: any,
  query: string,
  searchTerms: string[],
): number {
  let score = 0;
  const q = query.toLowerCase();

  const subj = email.subject?.toLowerCase() || "";
  if (subj.includes(q)) {
    score += 3;
  } else {
    const subjMatches = searchTerms.filter((term) => subj.includes(term)).length;
    score += subjMatches * 0.5;
  }

  const body = (email.body || email.bodySnippet || "").toLowerCase();
  if (body.includes(q)) {
    score += 2;
  } else {
    const bodyMatches = searchTerms.filter((term) => body.includes(term)).length;
    score += bodyMatches * 0.3;
  }

  const summary = email.aiSummary?.toLowerCase() || "";
  if (summary.includes(q)) {
    score += 1.5;
  } else {
    const summMatches = searchTerms.filter((term) =>
      summary.includes(term),
    ).length;
    score += summMatches * 0.2;
  }

  const tagMatches =
    email.aiTags?.filter((tag: string) =>
      searchTerms.some((term) => tag.includes(term)),
    ).length || 0;
  score += tagMatches * 0.4;

  const daysSinceSent =
    (Date.now() - new Date(email.sentAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceSent < 7) score *= 1.2;
  else if (daysSinceSent < 30) score *= 1.1;

  if (email.sysLabels?.includes("important")) score *= 1.3;

  return score;
}
