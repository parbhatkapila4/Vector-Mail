import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { env } from "@/env.js";

interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  accountId: string;
}

const SEARCH_CONFIG = {
  RECENT_DAYS: 365,
  SIMILARITY_THRESHOLD: 0.1, // Very low threshold
} as const;

const AI_CONFIG = {
  MODEL: "gpt-3.5-turbo", // Using faster, more reliable model
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
} as const;

export async function POST(req: Request) {
  try {
    const { messages, accountId }: ChatRequest = await req.json();
    const { userId } = await auth();

    console.log("Chat API called with accountId:", accountId);

    if (!userId) {
      console.error("No user ID found in session");
      return new Response("Unauthorized", { status: 401 });
    }
    if (!accountId) {
      console.error("No account ID provided");
      return new Response("Account ID is required", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      console.error("No message content in request");
      return new Response("No message content provided", { status: 400 });
    }

    const userQuery = lastMessage.content;
    console.log("User query:", userQuery);

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    });

    if (!account) {
      console.error("Account not found for ID:", accountId);
      return new Response("Account not found", { status: 404 });
    }

    console.log("Starting email search...");

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - SEARCH_CONFIG.RECENT_DAYS);

    let relevantEmails: any[] = [];

    // Check if query mentions specific sender
    const senderPattern = /(?:from|by|sent\s+by)\s+([a-zA-Z0-9._-]+)/i;
    const senderMatch = userQuery.match(senderPattern);
    const senderTerm = senderMatch?.[1]?.toLowerCase() || "";

    console.log("Searching emails...", { senderTerm, userQuery });

    try {
      // Build search conditions
      const whereConditions: any = {
        thread: {
          accountId: accountId,
        },
      };

      const orConditions: any[] = [];

      // Add sender filter if specified
      if (senderTerm) {
        console.log("Filtering by sender:", senderTerm);
        orConditions.push({
          from: {
            OR: [
              { address: { contains: senderTerm, mode: "insensitive" } },
              { name: { contains: senderTerm, mode: "insensitive" } },
            ],
          },
        });
      }

      // Add general search conditions
      const cleanQuery = userQuery
        .toLowerCase()
        .replace(/from|by|sent/gi, "")
        .trim();
      if (cleanQuery.length > 2) {
        orConditions.push(
          { subject: { contains: cleanQuery, mode: "insensitive" } },
          { bodySnippet: { contains: cleanQuery, mode: "insensitive" } },
        );
      }

      // Apply OR conditions if any
      if (orConditions.length > 0) {
        whereConditions.OR = orConditions;
      }

      console.log("Executing database query...");

      const searchResults = await db.email.findMany({
        where: whereConditions,
        include: {
          from: true,
          to: true,
        },
        orderBy: {
          sentAt: "desc",
        },
        take: 20,
      });

      console.log(`Found ${searchResults.length} emails`);

      relevantEmails = searchResults.map((email: any) => ({
        id: email.id,
        subject: email.subject,
        summary: email.summary,
        body: email.body,
        bodySnippet: email.bodySnippet,
        sentAt: email.sentAt,
        similarity: 0.5,
        from: email.from,
        to: email.to,
      }));
    } catch (searchError) {
      console.error("Search failed:", searchError);
      throw searchError;
    }

    console.log(`Found ${relevantEmails.length} relevant emails`);

    // Filter by similarity threshold
    const filteredEmails = relevantEmails.filter(
      (email) => email.similarity >= SEARCH_CONFIG.SIMILARITY_THRESHOLD,
    );

    console.log(`${filteredEmails.length} emails passed similarity threshold`);

    // Prepare context for AI with more details
    const emailContext = filteredEmails.map((email) => ({
      subject: email.subject,
      content: email.bodySnippet || email.body || "",
      date: email.sentAt.toISOString(),
      summary: email.summary,
      from: email.from
        ? `${email.from.name || ""} <${email.from.address}>`.trim()
        : "Unknown",
      to: email.to
        ? email.to
            .map((t: any) => `${t.name || ""} <${t.address}>`.trim())
            .join(", ")
        : "",
    }));

    const systemPrompt = `You are an AI email assistant. You have access to the user's email context to help answer their questions.

${filteredEmails.length > 0 ? `Found ${filteredEmails.length} relevant emails:` : "No relevant emails found."}

${emailContext
  .map(
    (email, index) => `
Email ${index + 1}:
- From: ${email.from}
- Subject: ${email.subject}
- Date: ${new Date(email.date).toLocaleDateString()}
${email.summary ? `- Summary: ${email.summary}` : ""}
- Content Preview: ${email.content.substring(0, 300)}...
`,
  )
  .join("\n")}

Instructions:
- Answer based on the provided email context above
- Be specific and cite which email(s) you're referring to
- Include sender names when relevant
- If no relevant emails are found, politely let the user know
- Be concise but informative
- Maintain a friendly, helpful tone`;

    if (!env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      // Return a simple response without OpenAI
      const simpleResponse = `I found ${filteredEmails.length} emails matching your query. ${
        filteredEmails.length > 0
          ? `Here they are:\n\n${filteredEmails
              .slice(0, 5)
              .map(
                (e, i) =>
                  `${i + 1}. ${e.subject} (from ${e.from?.name || e.from?.address || "Unknown"})\n   Date: ${new Date(e.sentAt).toLocaleDateString()}`,
              )
              .join("\n\n")}`
          : "Try refining your search query."
      }`;

      return new Response(simpleResponse, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    console.log("Initializing OpenAI with model:", AI_CONFIG.MODEL);

    try {
      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });

      console.log("Creating OpenAI stream...");

      const stream = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: AI_CONFIG.MAX_TOKENS,
        temperature: AI_CONFIG.TEMPERATURE,
        stream: true,
      });

      console.log("Stream created successfully");

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
            controller.enqueue(
              encoder.encode("\n\n[Error occurred while streaming response]"),
            );
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
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      // Fallback to simple response
      const simpleResponse = `I found ${filteredEmails.length} emails matching your query. ${
        filteredEmails.length > 0
          ? `Here they are:\n\n${filteredEmails
              .slice(0, 5)
              .map(
                (e, i) =>
                  `${i + 1}. ${e.subject} (from ${e.from?.name || e.from?.address || "Unknown"})\n   Date: ${new Date(e.sentAt).toLocaleDateString()}`,
              )
              .join("\n\n")}`
          : "Try refining your search query."
      }`;

      return new Response(simpleResponse, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
