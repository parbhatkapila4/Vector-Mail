import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { env } from "@/env.js";
import { storeSearchResults, getStoredEmails } from "@/lib/chat-session";
import { detectIntent } from "@/lib/intent-detection";
import { selectEmails, formatEmailOptions } from "@/lib/email-selection";
import { generateConversationalSummary } from "@/lib/conversational-summary";
import type { EmailAddress, Prisma } from "@prisma/client";

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

    const storedEmails = getStoredEmails(userId, accountId);
    const hasStoredResults = storedEmails !== null && storedEmails.length > 0;

    const intentResult = detectIntent(userQuery, hasStoredResults);
    const { intent, extractedData } = intentResult;

    console.log(
      `[Chat] Intent: ${intent}, Confidence: ${intentResult.confidence}`,
    );

    if ((intent === "SUMMARIZE" || intent === "SELECT") && hasStoredResults) {
      const matches = selectEmails(storedEmails!, extractedData || {});

      if (matches.length === 0) {
        const response = `I couldn't find an email matching that description in the previous search results. Could you be more specific, or try a new search?`;
        return new Response(response, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }

      if (matches.length > 1) {
        const options = formatEmailOptions(matches.map((m) => m.email));
        const response = `I found ${matches.length} emails that might match. Which one do you want?\n\n${options}\n\nYou can say "the first one", "the second one", or describe it more specifically.`;
        return new Response(response, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }

      const selectedEmail = matches[0]?.email;
      if (!selectedEmail) {
        return new Response("No email selected", { status: 400 });
      }
      try {
        const summary = await generateConversationalSummary({
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          date: selectedEmail.date,
          body: selectedEmail.body,
        });

        const response = `**${selectedEmail.subject}**\nFrom: ${selectedEmail.from.name || selectedEmail.from.address}\nDate: ${new Date(selectedEmail.date).toLocaleDateString()}\n\n${summary}`;
        return new Response(response, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } catch (summaryError) {
        console.error("Summary generation failed:", summaryError);
        const response = `This email from ${selectedEmail.from.name || selectedEmail.from.address} dated ${new Date(selectedEmail.date).toLocaleDateString()} is about "${selectedEmail.subject}". ${selectedEmail.snippet}...`;
        return new Response(response, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }
    }

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - recentDays);

    let relevantEmails: Array<{
      id: string;
      subject: string;
      summary: string | null;
      body: string | null;
      bodySnippet: string | null;
      sentAt: Date;
      similarity: number;
      from: EmailAddress;
      to: EmailAddress[];
    }> = [];

    const senderPattern = /(?:from|by|sent\s+by)\s+([a-zA-Z0-9._-]+)/i;
    const senderMatch = userQuery.match(senderPattern);
    const senderTerm = senderMatch?.[1]?.toLowerCase() || "";

    try {
      const whereConditions: Prisma.EmailWhereInput = {
        thread: {
          accountId: accountId,
        },
      };

      const orConditions: Prisma.EmailWhereInput[] = [];

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

      relevantEmails = searchResults.map((email) => ({
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

      storeSearchResults(userId, accountId, relevantEmails, userQuery);
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
            .map((t) => `${t.name || ""} <${t.address}>`.trim())
            .join(", ")
        : "",
    }));

    if (filteredEmails.length === 0) {
      const response = hasStoredResults
        ? `I didn't find any new emails matching that search. However, I have ${storedEmails!.length} emails from a previous search. Would you like me to help you with one of those?`
        : "I couldn't find any emails matching that search. Try different keywords or check if your emails are synced.";

      return new Response(response, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    const systemPrompt = `You're helping search through emails. Found ${filteredEmails.length} email${filteredEmails.length !== 1 ? "s" : ""}:

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

Answer based on these emails. Be conversational and helpful. Reference specific emails by number or subject when relevant. If the user asks follow-up questions like "what was that email about" or "tell me about the first one", acknowledge that you have these results and can help them.`;

    if (!env.OPENAI_API_KEY) {
      const resp =
        filteredEmails.length > 0
          ? `Found ${filteredEmails.length} emails:\n\n${filteredEmails
              .slice(0, 5)
              .map(
                (e, i) =>
                  `${i + 1}. ${e.subject} (${e.from?.name || e.from?.address})\n   ${new Date(e.sentAt).toLocaleDateString()}`,
              )
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
            controller.enqueue(encoder.encode("\n\nError streaming response"));
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
      const resp =
        filteredEmails.length > 0
          ? `Found ${filteredEmails.length} emails:\n\n${filteredEmails
              .slice(0, 5)
              .map(
                (e, i) =>
                  `${i + 1}. ${e.subject} (${e.from?.name || e.from?.address})\n   ${new Date(e.sentAt).toLocaleDateString()}`,
              )
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
