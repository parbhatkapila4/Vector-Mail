import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { env } from "@/env.js";
import { storeSearchResults, getStoredEmails } from "@/lib/chat-session";
import { detectIntent } from "@/lib/intent-detection";
import { selectEmails, formatEmailOptions } from "@/lib/email-selection";
import { generateConversationalSummary } from "@/lib/conversational-summary";
import { searchEmailsByVector } from "@/lib/vector-search";
import type { EmailAddress, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function removeAllSymbols(text: string): string {
  text = text.replace(/\*+/g, "");

  text = text.replace(/^\s*-\s+/gm, "");

  text = text.replace(/•/g, "");

  text = text.replace(/^\s*[▪▫◦‣⁃]\s+/gm, "");

  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");

  return text;
}

interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  accountId: string;
}

const recentDays = 365;
const similarityThreshold = 0.1;
const vectorSimilarityThreshold = 0.3;

function isFindOrSummarizeQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();

  if (lowerQuery.length < 2) {
    return true;
  }

  const simpleConversational = [
    /^(hi|hello|hey|hey\s+dude|hey\s+there|greetings|sup|what's\s+up|wassup)$/i,
    /^(thanks|thank\s+you|thx|ty|appreciate\s+it|cheers)$/i,
    /^(cool|nice|awesome|great|ok|okay|sure|alright|sounds\s+good)$/i,
    /^(yes|yeah|yep|yup|no|nope|maybe|sure)$/i,
    /^(bye|goodbye|see\s+ya|later|cya)$/i,
    /^(help|what\s+can\s+you\s+do|what\s+do\s+you\s+do|capabilities)$/i,
  ];

  const isSimpleConversation = simpleConversational.some((pattern) =>
    pattern.test(lowerQuery),
  );
  if (isSimpleConversation) {
    return true;
  }

  const naturalFindPatterns = [
    /^from\s+[\w\s.@-]+\??$/i,
    /\b(emails?|mail|messages?)\s+from\s+/i,
    /^[\w\s.@-]+\??$/i,
    /\b(find|search|show|get|look|fetch|retrieve|display|list)\b/i,
    /\b(mail|email|message|inbox)\s+(from|about|with|regarding|concerning)\b/i,
    /\b(any|all|some|my)\s+(mail|email|message|emails)\b/i,
    /\b(emails?|mail|messages?)\s+(from|about|with|regarding|concerning)\b/i,
    /\b(orders?|flights?|meetings?|payments?|receipts?|bookings?|invoices?|confirmations?)\b/i,
    /\b(what|which|where|when|who|how|do|does|did|is|are|was|were)\s+(mail|email|message|emails)\b/i,
    /\b(do\s+i\s+have|have\s+i|got\s+any)\s+(mail|email|message|emails?)\b/i,
  ];

  const summarizePatterns = [
    /\b(summarize|summary|summarise|summaries)\b/i,
    /\b(what\s+(is|was|does|did|are|were)|tell\s+me\s+about|explain|describe|what\s+about|what's)\b/i,
    /\b(about\s+(this|that|the|it|them))\b/i,
    /\b(the|this|that|one|first|second|third|fourth|fifth)\s+(on|from|dated?|about|email|mail)\b/i,
  ];

  const isFindQuery = naturalFindPatterns.some((pattern) =>
    pattern.test(lowerQuery),
  );

  const isSummarizeQuery = summarizePatterns.some((pattern) =>
    pattern.test(lowerQuery),
  );

  const hasEmailWords =
    /\b(mail|email|message|inbox|emails?|messages?)\b/i.test(lowerQuery);
  const hasActionWords = /\b(from|about|with|regarding|concerning|for)\b/i.test(
    lowerQuery,
  );

  if (/\bfrom\s+[\w\s.@-]+/i.test(lowerQuery)) {
    return true;
  }

  if (
    /^[\w\s.@-]+\??$/i.test(lowerQuery) &&
    lowerQuery.length > 2 &&
    lowerQuery.length < 50
  ) {
    const words = lowerQuery.replace(/[?]/g, "").trim().split(/\s+/);
    if (words.length <= 3) {
      return true;
    }
  }

  if (hasEmailWords && hasActionWords) {
    return true;
  }

  if (
    /^(what|which|where|when|who|how|do|does|did|is|are|was|were)\b/i.test(
      lowerQuery,
    ) &&
    hasEmailWords
  ) {
    return true;
  }

  return isFindQuery || isSummarizeQuery;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error("[Chat API] Unauthorized: No userId found");
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in.", code: "UNAUTHORIZED" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let body: ChatRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[Chat API] Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body", code: "INVALID_REQUEST" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { messages, accountId } = body;

    if (!accountId || accountId.trim() === "") {
      console.error("[Chat API] Account ID is required");
      return new Response(
        JSON.stringify({ error: "Account ID is required. Please select an email account.", code: "MISSING_ACCOUNT_ID" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("[Chat API] Invalid messages array");
      return new Response(
        JSON.stringify({ error: "Messages array is required and must not be empty", code: "INVALID_MESSAGES" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      console.error("[Chat API] No message content provided");
      return new Response(
        JSON.stringify({ error: "No message content provided", code: "MISSING_CONTENT" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userQuery = lastMessage.content;

    if (!isFindOrSummarizeQuery(userQuery)) {
      const redirectMessage =
        "I can only help you find and summarize emails. For other tasks like generating emails, answering general questions, or coding help, please use AI Buddy - he'll surely help you with this. I can't do that here.";

      return new Response(redirectMessage, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    });

    if (!account) {
      console.error(`[Chat API] Account not found. userId: ${userId}, accountId: ${accountId}`);
      
      const accountExists = await db.account.findFirst({
        where: { id: accountId },
        select: { userId: true },
      });
      
      if (accountExists) {
        console.error(`[Chat API] Account exists but belongs to different user: ${accountExists.userId}`);
        return new Response(
          JSON.stringify({ 
            error: "Account not found or access denied. Please reconnect your email account.",
            code: "ACCOUNT_ACCESS_DENIED"
          }),
          { 
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Account not found. Please connect your email account first.",
          code: "ACCOUNT_NOT_FOUND"
        }),
        { 
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const storedEmails = getStoredEmails(userId, accountId);
    const hasStoredResults = storedEmails !== null && storedEmails.length > 0;

    const isNewSearchQuery =
      /^(find|search|show|get|look|fetch|retrieve|display|list|any|all)\s+/i.test(
        userQuery,
      ) ||
      /^from\s+[\w\s.@-]+\??$/i.test(userQuery) ||
      (/^[\w\s.@-]+\??$/i.test(userQuery) &&
        userQuery.length > 2 &&
        userQuery.length < 50) ||
      /\b(orders?|flights?|meetings?|payments?|receipts?|bookings?|invoices?|confirmations?)\b/i.test(
        userQuery,
      ) ||
      /\b(emails?|mail|messages?)\s+from\s+/i.test(userQuery);

    let shouldUseStoredResults = hasStoredResults;
    if (isNewSearchQuery && hasStoredResults) {
      console.log(`[Chat] Detected new search query, clearing stored results`);
      const { clearSession } = await import("@/lib/chat-session");
      clearSession(userId, accountId);
      shouldUseStoredResults = false;
    }

    const intentResult = detectIntent(userQuery, shouldUseStoredResults);
    const { intent, extractedData } = intentResult;

    console.log(
      `[Chat] Intent: ${intent}, Confidence: ${intentResult.confidence}, IsNewSearch: ${isNewSearchQuery}, ShouldUseStored: ${shouldUseStoredResults}, Extracted:`,
      extractedData,
    );

    const hasDateReference = /(\d{1,2}[-\/]\d{1,2})/.test(userQuery);
    const hasConversationalRef =
      /(the|this|that|one)\s+(on|from|dated?|about)/i.test(userQuery);

    const isFollowUpQuery =
      !isNewSearchQuery &&
      shouldUseStoredResults &&
      (intent === "SUMMARIZE" ||
        intent === "SELECT" ||
        (hasDateReference && !isNewSearchQuery) ||
        (hasConversationalRef && !isNewSearchQuery) ||
        (userQuery.toLowerCase().includes("about") && !isNewSearchQuery) ||
        userQuery.toLowerCase().includes("what was") ||
        userQuery.toLowerCase().includes("what is"));

    if (isFollowUpQuery && shouldUseStoredResults && storedEmails) {
      const matches = selectEmails(storedEmails, extractedData || {});

      if (matches.length === 0) {
        if (env.OPENROUTER_API_KEY && storedEmails && storedEmails.length > 0) {
          try {
            const openai = new OpenAI({
              baseURL: "https://openrouter.ai/api/v1",
              apiKey: env.OPENROUTER_API_KEY,
              defaultHeaders: {
                "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
                "X-Title": "VectorMail AI",
              },
            });

            const emailList = storedEmails
              .slice(0, 10)
              .map(
                (email, index) =>
                  `${index + 1}. "${email.subject}" from ${email.from.name || email.from.address} on ${new Date(email.date).toLocaleDateString()}`,
              )
              .join("\n");

            const smartSystemPrompt = `The user asked: "${userQuery}"

I have these emails from a previous search:
${emailList}

The user is asking about one of these emails. Based on their query, which email number do they want? Consider:
- Date references (like "13-12", "13/12", "on 13th", "from 13-12")
- Position references (like "first", "second", "third", "the one", "that one")
- Subject keywords
- Sender references

Respond with ONLY the email number (1, 2, 3, etc.) that best matches their query. If you can't determine, respond with "0".`;

            const completion = await openai.chat.completions.create({
              model: "google/gemini-2.0-flash-exp:free",
              messages: [
                { role: "system", content: smartSystemPrompt },
                { role: "user", content: userQuery },
              ],
              max_tokens: 10,
              temperature: 0.3,
            });

            const llmResponse = completion.choices[0]?.message?.content?.trim();
            const emailNumber = parseInt(llmResponse || "0");

            if (emailNumber > 0 && emailNumber <= storedEmails.length) {
              const selectedEmail = storedEmails[emailNumber - 1];
              if (selectedEmail) {
                const summary = await generateConversationalSummary(
                  {
                    subject: selectedEmail.subject,
                    from: selectedEmail.from,
                    date: selectedEmail.date,
                    body: selectedEmail.body,
                  },
                  "auto",
                  userQuery,
                );

                const rawResponse = `${selectedEmail.subject}\nFrom: ${selectedEmail.from.name || selectedEmail.from.address}\nDate: ${new Date(selectedEmail.date).toLocaleDateString()}\n\n${summary}`;
                const response = removeAllSymbols(rawResponse);
                return new Response(response, {
                  headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "no-cache",
                  },
                });
              }
            }
          } catch (llmError) {
            console.error("LLM fallback error:", llmError);
          }
        }

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
        const summary = await generateConversationalSummary(
          {
            subject: selectedEmail.subject,
            from: selectedEmail.from,
            date: selectedEmail.date,
            body: selectedEmail.body,
          },
          "auto",
          userQuery,
        );

        const rawResponse = `${selectedEmail.subject}\nFrom: ${selectedEmail.from.name || selectedEmail.from.address}\nDate: ${new Date(selectedEmail.date).toLocaleDateString()}\n\n${summary}`;
        const response = removeAllSymbols(rawResponse);
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

    let senderTerm = "";
    const senderPatterns = [
      /(?:from|by|sent\s+by)\s+([a-zA-Z0-9._@\s-]+)/i,
      /^([a-zA-Z0-9._@\s-]+)\??$/i,
    ];

    for (const pattern of senderPatterns) {
      const match = userQuery.match(pattern);
      if (match && match[1]) {
        senderTerm = match[1].trim().toLowerCase().replace(/[?]/g, "");
        if (
          senderTerm.length > 1 &&
          senderTerm.length < 50 &&
          !senderTerm.includes(" ")
        ) {
          break;
        } else if (senderTerm.length > 1 && senderTerm.length < 100) {
          const words = senderTerm.split(/\s+/);
          if (words.length <= 3) {
            break;
          }
        }
        senderTerm = "";
      }
    }

    let understoodQuery = userQuery;
    let queryIntent = "";
    if (env.OPENROUTER_API_KEY) {
      try {
        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: env.OPENROUTER_API_KEY,
          defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
            "X-Title": "VectorMail AI",
          },
        });

        const understandingPrompt = `The user asked: "${userQuery}"

Your task: Understand what the user is REALLY looking for and generate:
1. A clear search query optimized for finding relevant emails
2. A description of what types of emails are relevant

Examples:
- "Find my flight bookings" → Search: "flight booking airline ticket reservation travel" | Relevant: emails about flights, airlines, travel bookings, tickets, reservations, airports
- "Show receipts and payments" → Search: "receipt payment invoice purchase order transaction" | Relevant: emails about payments, receipts, invoices, purchases, transactions, billing
- "What meetings do I have" → Search: "meeting appointment calendar invite schedule" | Relevant: emails about meetings, appointments, calendar invites, scheduling
- "from Joe?" or "from Joe" → Search: "Joe" | Relevant: emails from sender named Joe or email address containing Joe
- "Joe?" or "Luma?" → Search: "Joe" or "Luma" | Relevant: emails from sender with that name

IMPORTANT: If the query is asking about emails from a specific person (like "from Joe?", "Joe?", "emails from John"), the searchQuery should be the person's name, and relevantTypes should indicate "emails from that sender".

Return ONLY a JSON object in this exact format:
{
  "searchQuery": "optimized search terms here",
  "relevantTypes": "description of what emails are relevant",
  "intent": "brief intent description"
}`;

        let understandingResponse;
        try {
          understandingResponse = await openai.chat.completions.create({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              {
                role: "system",
                content:
                  "You are a query understanding assistant. Analyze user queries and generate optimized search terms and relevance criteria. Return ONLY valid JSON.",
              },
              { role: "user", content: understandingPrompt },
            ],
            max_tokens: 200,
            temperature: 0.1,
            response_format: { type: "json_object" },
          });
        } catch (claudeError) {
          console.warn("Claude failed, trying GPT-4o-mini:", claudeError);
          understandingResponse = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a query understanding assistant. Analyze user queries and generate optimized search terms and relevance criteria. Return ONLY valid JSON.",
              },
              { role: "user", content: understandingPrompt },
            ],
            max_tokens: 200,
            temperature: 0.1,
            response_format: { type: "json_object" },
          });
        }

        const understandingContent =
          understandingResponse.choices[0]?.message?.content?.trim();
        if (understandingContent) {
          try {
            const parsed = JSON.parse(understandingContent);
            understoodQuery = parsed.searchQuery || userQuery;
            queryIntent = parsed.relevantTypes || "";

            if (
              senderTerm &&
              !understoodQuery.toLowerCase().includes(senderTerm.toLowerCase())
            ) {
              understoodQuery = senderTerm;
              queryIntent = `emails from sender: ${senderTerm}`;
            }

            console.log(
              `[Query Understanding] Original: "${userQuery}" → Understood: "${understoodQuery}" | Intent: "${queryIntent}" | Sender: "${senderTerm}"`,
            );
          } catch (parseError) {
            console.warn("Failed to parse query understanding:", parseError);
            if (senderTerm) {
              understoodQuery = senderTerm;
              queryIntent = `emails from sender: ${senderTerm}`;
            }
          }
        } else if (senderTerm) {
          understoodQuery = senderTerm;
          queryIntent = `emails from sender: ${senderTerm}`;
        }
      } catch (understandingError) {
        console.warn(
          "Query understanding failed, using original query:",
          understandingError,
        );
      }
    }

    try {
      let vectorSearchResults: Array<{
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

      try {
        let searchQuery = understoodQuery || userQuery;
        if (senderTerm && !understoodQuery) {
          searchQuery = senderTerm;
        }

        const vectorResults = await searchEmailsByVector(
          searchQuery,
          accountId,
          20,
        );

        vectorSearchResults = vectorResults.map((result) => ({
          id: result.email.id,
          subject: result.email.subject,
          summary: result.email.summary,
          body: result.email.body,
          bodySnippet: result.email.bodySnippet,
          sentAt: result.email.sentAt,
          similarity: result.similarity,
          from: result.email.from,
          to: result.email.to,
        }));

        if (senderTerm && vectorSearchResults.length > 0) {
          vectorSearchResults = vectorSearchResults.filter((email) => {
            const fromAddress = email.from.address?.toLowerCase() || "";
            const fromName = email.from.name?.toLowerCase() || "";
            return (
              fromAddress.includes(senderTerm) || fromName.includes(senderTerm)
            );
          });
        }

        vectorSearchResults = vectorSearchResults.filter(
          (email) => email.similarity >= vectorSimilarityThreshold,
        );

        if (vectorSearchResults.length > 0) {
          relevantEmails = vectorSearchResults;
        }
      } catch (vectorError) {
        console.log(
          "Vector search not available or failed, falling back to text search:",
          vectorError,
        );
      }

      if (relevantEmails.length === 0) {
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

        const queryToUse = understoodQuery || userQuery;
        const cleanQuery = queryToUse
          .toLowerCase()
          .replace(
            senderTerm
              ? /^from\s+/gi
              : /from|by|sent|is there|any kind of|mail that|has|something like|and|something|that|this type of|things in/gi,
            "",
          )
          .trim();

        const searchTerms = cleanQuery
          .split(/\s+/)
          .filter(
            (term) => term.length > 2 && term !== senderTerm.toLowerCase(),
          );

        if (searchTerms.length > 0) {
          orConditions.push(
            { subject: { contains: searchTerms[0], mode: "insensitive" } },
            { bodySnippet: { contains: searchTerms[0], mode: "insensitive" } },
            { summary: { contains: searchTerms[0], mode: "insensitive" } },
          );

          if (searchTerms.length > 1) {
            searchTerms.slice(1).forEach((term) => {
              orConditions.push(
                { subject: { contains: term, mode: "insensitive" } },
                { bodySnippet: { contains: term, mode: "insensitive" } },
                { summary: { contains: term, mode: "insensitive" } },
              );
            });
          }
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
      }

      storeSearchResults(userId, accountId, relevantEmails, userQuery);
    } catch (searchError) {
      console.error("Search failed:", searchError);
      throw searchError;
    }

    let filteredEmails = relevantEmails.filter(
      (email) => email.similarity >= similarityThreshold,
    );

    if (filteredEmails.length > 0 && env.OPENROUTER_API_KEY) {
      try {
        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: env.OPENROUTER_API_KEY,
          defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
            "X-Title": "VectorMail AI",
          },
        });

        const emailList = filteredEmails
          .slice(0, 20)
          .map(
            (email, index) =>
              `${index + 1}. Subject: "${email.subject}" | From: ${email.from.name || email.from.address} | Summary: ${email.summary || email.bodySnippet?.substring(0, 150) || "No summary"} | Body snippet: ${email.bodySnippet?.substring(0, 200) || email.body?.substring(0, 200) || "No content"}`,
          )
          .join("\n");

        const filterPrompt = `The user asked: "${userQuery}"
${queryIntent ? `\nWhat the user is looking for: ${queryIntent}` : ""}

Here are emails that were found by the search system:
${emailList}

Your task: Return ONLY the numbers (comma-separated) of emails that are ACTUALLY and DIRECTLY relevant to the user's query. 

CRITICAL RULES - BE EXTREMELY STRICT:
- If the user asked about "flight bookings" or "flights", ONLY include emails about: flights, airlines, travel bookings, tickets, reservations, airports, departures, arrivals, boarding passes. EXCLUDE: job applications, meetings, payments, or any other unrelated topics.
- If the user asked about "orders" or "purchases", ONLY include emails about: orders, purchases, deliveries, shipments, products, shopping. EXCLUDE: anything else.
- If the user asked about "meetings" or "appointments", ONLY include emails about: meetings, appointments, calendar invites, scheduling, calls. EXCLUDE: anything else.
- If the user asked about "payments" or "receipts", ONLY include emails about: payments, receipts, invoices, transactions, billing, purchases. EXCLUDE: anything else.
- Be EXTREMELY strict - if an email is about something completely different (e.g., job applications when user asked about flights), DO NOT include it, even if it was in the search results
- Only include emails where the subject, summary, or content clearly relates to what the user asked for

Return format: Just numbers separated by commas, like: 1,3,5,7
If NONE are relevant, return: 0`;

        const filterResponse = await openai.chat.completions.create({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content:
                "You are an extremely strict email filter. Your ONLY job is to return email numbers that are DIRECTLY and CLEARLY relevant to the user's query. If an email is about something different (e.g., job applications when user asked about flights), exclude it. Be very strict - it's better to return fewer emails than to include irrelevant ones. Return ONLY comma-separated numbers or '0' if none are relevant.",
            },
            { role: "user", content: filterPrompt },
          ],
          max_tokens: 100,
          temperature: 0.1,
        });

        const relevantIndices =
          filterResponse.choices[0]?.message?.content?.trim();
        if (relevantIndices && relevantIndices !== "0") {
          const indices = relevantIndices
            .split(",")
            .map((i) => parseInt(i.trim()) - 1)
            .filter((i) => !isNaN(i) && i >= 0 && i < filteredEmails.length);

          if (indices.length > 0) {
            filteredEmails = indices
              .map((i) => filteredEmails[i])
              .filter(
                (email): email is (typeof filteredEmails)[0] =>
                  email !== undefined,
              );
          } else {
            filteredEmails = [];
          }
        } else if (relevantIndices === "0") {
          filteredEmails = [];
        }
      } catch (filterError) {
        console.log("AI filtering failed, using all results:", filterError);
      }
    }

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
      if (
        !userQuery.toLowerCase().includes("email") &&
        !userQuery.toLowerCase().includes("mail") &&
        !userQuery.toLowerCase().includes("search") &&
        !userQuery.toLowerCase().includes("find") &&
        !userQuery.toLowerCase().includes("show")
      ) {
        const redirectMessage =
          "I can only help you find and summarize emails. For other tasks like generating emails, answering general questions, or coding help, please use AI Buddy - he'll surely help you with this. I can't do that here.";

        return new Response(redirectMessage, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }

      const response = "No mails found regarding your query. I'm Sorry!";

      return new Response(response, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    const systemPrompt = `You are an email assistant that ONLY helps users find and summarize emails. Your capabilities are LIMITED to:

1. Finding Emails: Search and find emails by subject, sender, content, date, or keywords
2. Summarizing Emails: Provide summaries of emails - SHORT (one sentence), MEDIUM (2-3 sentences), or LONG (detailed) based on user preference

IMPORTANT RULES:
- You can ONLY find and summarize emails - nothing else
- If user asks for a "short" summary or says "in short", provide a ONE SENTENCE summary
- If user asks for "detailed", "long", or "full" summary, provide comprehensive 4-6 sentence summary
- If no preference is specified, use 2-3 sentences (medium length)
- Be conversational, friendly, and helpful
- If you don't have enough information, ask clarifying questions
- Always be accurate and reference specific emails when relevant
- Understand informal language and conversational references like "the one on 13-12", "that email", "the third one", etc.
- When user references dates like "13-12", "13/12", "on 13th", understand they mean day-month format
- If user asks about a specific email from the list, provide details about that email
- If the user asks for something that is NOT about finding or summarizing emails, politely redirect them to use AI Buddy for that task

FORMATTING RULES - ABSOLUTELY CRITICAL - NO SYMBOLS ALLOWED:
- FORBIDDEN: Do NOT use ANY symbols - NO asterisks (*), NO double asterisks (**), NO triple asterisks (***), NO dashes (-), NO dots (•), NO special characters
- For lists, use ONLY numbers (1., 2., 3.) or letters (a., b., c.) - NO symbols
- NEVER use asterisks (*), dashes (-), dots (•), or any other symbols for lists or emphasis
- Use plain text formatting only - NO markdown symbols at all
- Keep formatting clean and professional with plain text only

CORRECT LIST FORMAT EXAMPLES:
1. First item
2. Second item
a. Or using letters
b. Another item

ABSOLUTELY FORBIDDEN - DO NOT USE:
* Any asterisk
- Any dash
• Any dot
* For any purpose
* Ever

Found ${filteredEmails.length} email${filteredEmails.length !== 1 ? "s" : ""}:

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

CRITICAL RELEVANCE FILTERING - ABSOLUTELY MANDATORY:
${queryIntent ? `The user is looking for: ${queryIntent}\n` : ""}
- ONLY mention emails that are DIRECTLY and CLEARLY relevant to what the user asked for
- If the user asked about "flight bookings" or "flights", ONLY mention emails about: flights, airlines, travel bookings, tickets, reservations, airports, departures, arrivals, boarding passes
- If the user asked about "orders" or "purchases", ONLY mention emails about: orders, purchases, deliveries, shipments, products, shopping
- If the user asked about "meetings" or "appointments", ONLY mention emails about: meetings, appointments, calendar invites, scheduling, calls
- If the user asked about "payments" or "receipts", ONLY mention emails about: payments, receipts, invoices, transactions, billing, purchases
- DO NOT mention emails that are about completely different topics (e.g., job applications when user asked about flights)
- If an email's subject or content is not clearly related to the user's query, DO NOT mention it
- Be EXTREMELY strict - it's better to say "No mails found" than to mention irrelevant emails

Answer the user's request based on these emails. Be conversational, helpful, and do exactly what they ask. Reference specific emails by number or subject when relevant. If the user asks about "the one on [date]" or similar, identify which email they mean and provide details about it.

IMPORTANT: If none of the emails in the list are actually relevant to the user's query, respond with: "No mails found regarding your query. I'm Sorry!" DO NOT list emails that are not relevant.

If the user sends a simple greeting (hi, hello, thanks, cool, etc.), respond in a friendly, brief way and remind them you can help find and summarize emails.`;

    if (!env.OPENROUTER_API_KEY) {
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
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: env.OPENROUTER_API_KEY,
        defaultHeaders: {
          "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
          "X-Title": "VectorMail AI",
        },
      });

      const stream = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      });

      const encoder = new TextEncoder();
      let accumulatedRaw = "";
      let accumulatedProcessed = "";
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                accumulatedRaw += content;
                const fullyProcessed = removeAllSymbols(accumulatedRaw);
                const newContent = fullyProcessed.slice(
                  accumulatedProcessed.length,
                );
                if (newContent) {
                  controller.enqueue(encoder.encode(newContent));
                  accumulatedProcessed = fullyProcessed;
                }
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
      console.error("OpenRouter error:", openaiError);
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
    console.error("[Chat API] Unhandled error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === "development";

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request. Please try again.",
        details: isDevelopment ? errorMessage : undefined,
        code: "INTERNAL_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
