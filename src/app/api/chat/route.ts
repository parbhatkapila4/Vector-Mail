import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { env } from "@/env.js";
import { generateQueryEmbedding } from "@/lib/email-analysis";
import { arrayToVector } from "@/lib/vector-utils";

interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  accountId: string;
}

interface EmailSearchResult {
  id: string;
  subject: string;
  summary: string | null;
  body: string | null;
  bodySnippet: string | null;
  sentAt: Date;
  similarity: number;
}

const SEARCH_CONFIG = {
  VECTOR_SEARCH_LIMIT: 10,
  TEXT_SEARCH_LIMIT: 5,
  RECENT_DAYS: 90,
  SIMILARITY_THRESHOLD: 0.5,
} as const;

const AI_CONFIG = {
  MODEL: "gpt-4",
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
} as const;

export async function POST(req: Request) {
  try {
    const { messages, accountId }: ChatRequest = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!accountId) {
      return new Response("Account ID is required", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return new Response("No message content provided", { status: 400 });
    }

    const userQuery = lastMessage.content;

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    });

    if (!account) {
      return new Response("Account not found", { status: 404 });
    }

    console.log("Generating embedding for query:", userQuery);
    const queryEmbedding = await generateQueryEmbedding(userQuery);
    const queryVector = arrayToVector(queryEmbedding);

    console.log("Searching for relevant emails using semantic similarity...");

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - SEARCH_CONFIG.RECENT_DAYS);

    let relevantEmails: EmailSearchResult[] = [];

    try {
      // Attempt vector search first
      relevantEmails = await db.$queryRaw<EmailSearchResult[]>`
        SELECT 
          e.id,
          e.subject,
          e.summary,
          e.body,
          e."bodySnippet",
          e."sentAt",
          1 - (e.embedding <=> ${queryVector}::vector) as similarity
        FROM "Email" e
        INNER JOIN "Thread" t ON e."threadId" = t.id
        WHERE 
          t."accountId" = ${accountId}
          AND e.embedding IS NOT NULL
          AND e."sentAt" >= ${recentDate}
        ORDER BY e.embedding <=> ${queryVector}::vector
        LIMIT ${SEARCH_CONFIG.VECTOR_SEARCH_LIMIT}
      `;
    } catch (error) {
      console.error("Vector search failed:", error);
    }

    // Fallback to text search if vector search yields no results
    if (relevantEmails.length === 0) {
      console.log("No vector search results, falling back to text search...");

      const searchTerms = userQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 2);

      if (searchTerms.length > 0) {
        try {
          const textSearchResults = await db.email.findMany({
            where: {
              thread: {
                accountId: accountId,
              },
              sentAt: {
                gte: recentDate,
              },
              OR: [
                { subject: { contains: userQuery, mode: "insensitive" } },
                { bodySnippet: { contains: userQuery, mode: "insensitive" } },
                { body: { contains: userQuery, mode: "insensitive" } },
              ],
            },
            include: {
              thread: true,
              from: true,
            },
            orderBy: {
              sentAt: "desc",
            },
            take: SEARCH_CONFIG.TEXT_SEARCH_LIMIT,
          });

          relevantEmails = textSearchResults.map((email: any) => ({
            id: email.id,
            subject: email.subject,
            summary: email.summary,
            body: email.body,
            bodySnippet: email.bodySnippet,
            sentAt: email.sentAt,
            similarity: SEARCH_CONFIG.SIMILARITY_THRESHOLD,
          }));
        } catch (error) {
          console.error("Text search failed:", error);
        }
      }
    }

    console.log(`Found ${relevantEmails.length} relevant emails`);

    // Filter by similarity threshold
    const filteredEmails = relevantEmails.filter(
      (email) => email.similarity >= SEARCH_CONFIG.SIMILARITY_THRESHOLD,
    );

    console.log(`${filteredEmails.length} emails passed similarity threshold`);

    // Prepare context for AI
    const emailContext = filteredEmails.map((email) => ({
      subject: email.subject,
      content: email.bodySnippet || email.body || "",
      date: email.sentAt.toISOString(),
      summary: email.summary,
    }));

    const systemPrompt = `You are an AI email assistant. You have access to the user's email context to help answer their questions.

Email Context:
${emailContext
  .map(
    (email, index) => `
${index + 1}. Subject: ${email.subject}
   Date: ${new Date(email.date).toLocaleDateString()}
   Content: ${email.content.substring(0, 200)}...
   ${email.summary ? `Summary: ${email.summary}` : ""}
`,
  )
  .join("\n")}

Instructions:
- Answer based on the provided email context
- Be helpful and concise
- If no relevant emails are found, say so politely
- Focus on the most recent and relevant information
- Maintain a professional but friendly tone`;

    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const stream = await openai.chat.completions.create({
      model: AI_CONFIG.MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
