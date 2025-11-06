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

const recentDays = 365;
const similarityThreshold = 0.1;

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

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - recentDays);

    let relevantEmails: any[] = [];

    const senderPattern = /(?:from|by|sent\s+by)\s+([a-zA-Z0-9._-]+)/i;
    const senderMatch = userQuery.match(senderPattern);
    const senderTerm = senderMatch?.[1]?.toLowerCase() || "";

    try {
      const whereConditions: any = {
        thread: {
          accountId: accountId,
        },
      };

      const orConditions: any[] = [];

      if (senderTerm) {
        orConditions.push({
          from: {
            OR: [
              { address: { contains: senderTerm, mode: "insensitive" } },
              { name: { contains: senderTerm, mode: "insensitive" } },
            ],
          },
        });
      }

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

      if (orConditions.length > 0) {
        whereConditions.OR = orConditions;
      }

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

    const filteredEmails = relevantEmails.filter(
      (email) => email.similarity >= similarityThreshold,
    );

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

    const systemPrompt = `You're helping search through emails. ${filteredEmails.length > 0 ? `Found ${filteredEmails.length} emails:` : "No emails found."}

${emailContext
  .map(
    (email, index) => `
${index + 1}. From: ${email.from}
Subject: ${email.subject}
Date: ${new Date(email.date).toLocaleDateString()}
${email.summary ? `Summary: ${email.summary}` : ""}
Preview: ${email.content.substring(0, 300)}...
`,
  )
  .join("\n")}

Answer based on these emails. Be specific about which email you're referencing. If nothing matches well, say so.`;

    if (!env.OPENAI_API_KEY) {
      const resp = filteredEmails.length > 0
        ? `Found ${filteredEmails.length} emails:\n\n${filteredEmails
            .slice(0, 5)
            .map((e, i) => `${i + 1}. ${e.subject} (${e.from?.name || e.from?.address})\n   ${new Date(e.sentAt).toLocaleDateString()}`)
            .join("\n\n")}`
        : "No emails found for that query.";

      return new Response(resp, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    try {
      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });

      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 1000,
        temperature: 0.7,
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
            controller.enqueue(
              encoder.encode("\n\nError streaming response"),
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
      console.error("OpenAI error:", openaiError);
      const resp = filteredEmails.length > 0
        ? `Found ${filteredEmails.length} emails:\n\n${filteredEmails
            .slice(0, 5)
            .map((e, i) => `${i + 1}. ${e.subject} (${e.from?.name || e.from?.address})\n   ${new Date(e.sentAt).toLocaleDateString()}`)
            .join("\n\n")}`
        : "No emails found.";

      return new Response(resp, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }
  } catch (error) {
    console.error("Chat error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

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
