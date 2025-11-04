import { db } from "@/server/db";
import { generateQueryEmbedding, cosineSimilarity } from "./email-analysis";

export interface SearchResult {
  email: any;
  similarity: number;
  relevanceScore: number;
}

/**
 * Search emails using vector similarity
 */
export async function searchEmailsByVector(
  query: string,
  accountId: string,
  limit: number = 10,
): Promise<SearchResult[]> {
  try {
    console.log(`Searching emails with query: "${query}"`);

    // Generate embedding for the search query
    const queryEmbedding = await generateQueryEmbedding(query);

    if (queryEmbedding.every((val) => val === 0)) {
      console.warn(
        "Query embedding is zero vector, falling back to text search",
      );
      return await fallbackTextSearch(query, accountId, limit);
    }

    // Use raw SQL for vector similarity search
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
      console.log(
        "No emails with embeddings found, falling back to text search",
      );
      return await fallbackTextSearch(query, accountId, limit);
    }

    // Get full email details for the top results
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

    // Map the results with similarity scores
    const emailDistanceMap = new Map(
      emails.map((e: any) => [e.id, e.distance]),
    );

    const results: SearchResult[] = fullEmails
      .map((email: any) => {
        const distance = emailDistanceMap.get(email.id) || 1;
        const similarity = 1 - distance; // Convert distance to similarity (closer to 1 is better)
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
      .filter((result: any) => result.similarity > 0.1) // Filter out very low similarities
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    console.log(`Found ${results.length} relevant emails`);
    return results;
  } catch (error) {
    console.error("Error in vector search:", error);
    // Fallback to text search
    return await fallbackTextSearch(query, accountId, limit);
  }
}

/**
 * Fallback text-based search when vector search fails
 */
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
      // If no meaningful search terms, return recent emails
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
        similarity: 0.5, // Default similarity for recent emails
        relevanceScore: 0.5,
      }));
    }

    // Search in subject, body, and AI summary
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
      take: limit * 2, // Get more results to filter and score
    });

    // Score the results based on text matching
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
    console.error("Error in fallback text search:", error);
    return [];
  }
}

/**
 * Calculate relevance score combining similarity and email properties
 */
function calculateRelevanceScore(
  email: any,
  query: string,
  similarity: number,
): number {
  let score = similarity;

  // Boost score for important emails
  if (email.sysLabels?.includes("important")) {
    score *= 1.3;
  }

  // Boost score for recent emails
  const daysSinceSent =
    (Date.now() - new Date(email.sentAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceSent < 7) {
    score *= 1.2;
  } else if (daysSinceSent < 30) {
    score *= 1.1;
  }

  // Boost score if query terms appear in subject
  const queryLower = query.toLowerCase();
  const subjectLower = email.subject?.toLowerCase() || "";
  if (subjectLower.includes(queryLower)) {
    score *= 1.4;
  }

  // Boost score for emails with AI tags matching query
  const queryTerms = queryLower.split(" ").filter((term) => term.length > 2);
  const matchingTags =
    email.aiTags?.filter((tag: string) =>
      queryTerms.some((term) => tag.includes(term)),
    ) || [];

  if (matchingTags.length > 0) {
    score *= 1.2;
  }

  return score;
}

/**
 * Calculate text-based relevance score
 */
function calculateTextRelevanceScore(
  email: any,
  query: string,
  searchTerms: string[],
): number {
  let score = 0;
  const queryLower = query.toLowerCase();

  // Subject matching (highest weight)
  const subjectLower = email.subject?.toLowerCase() || "";
  if (subjectLower.includes(queryLower)) {
    score += 3;
  } else {
    // Partial subject matching
    const subjectMatches = searchTerms.filter((term) =>
      subjectLower.includes(term),
    ).length;
    score += subjectMatches * 0.5;
  }

  // Body matching
  const bodyLower = (email.body || email.bodySnippet || "").toLowerCase();
  if (bodyLower.includes(queryLower)) {
    score += 2;
  } else {
    const bodyMatches = searchTerms.filter((term) =>
      bodyLower.includes(term),
    ).length;
    score += bodyMatches * 0.3;
  }

  // AI summary matching
  const summaryLower = email.aiSummary?.toLowerCase() || "";
  if (summaryLower.includes(queryLower)) {
    score += 1.5;
  } else {
    const summaryMatches = searchTerms.filter((term) =>
      summaryLower.includes(term),
    ).length;
    score += summaryMatches * 0.2;
  }

  // AI tags matching
  const tagMatches =
    email.aiTags?.filter((tag: string) =>
      searchTerms.some((term) => tag.includes(term)),
    ).length || 0;
  score += tagMatches * 0.4;

  // Recent emails boost
  const daysSinceSent =
    (Date.now() - new Date(email.sentAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceSent < 7) {
    score *= 1.2;
  } else if (daysSinceSent < 30) {
    score *= 1.1;
  }

  // Important emails boost
  if (email.sysLabels?.includes("important")) {
    score *= 1.3;
  }

  return score;
}
