import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { env } from "@/env.js";
import {
  storeSearchResults,
  getStoredEmails,
  touchChatSession,
  getSearchSessionMemory,
  updateSearchSessionMemory,
} from "@/lib/chat-session";
import { tryResolveLastSelectedEmail } from "@/lib/ai-search-memory";
import { buildSourcesFooter } from "@/lib/ai-search-explainable";
import { detectIntent } from "@/lib/intent-detection";
import {
  selectEmails,
  formatEmailOptions,
  pickMatchesForFollowUp,
  formatEmailOptionsWithReasons,
} from "@/lib/email-selection";
import { generateConversationalSummary } from "@/lib/conversational-summary";
import { getSummarySourceExcerpts } from "@/lib/summary-explainability";
import { searchEmailsByVector } from "@/lib/vector-search";
import { withRequestId } from "@/lib/logging/with-request-id";
import { checkDailyCap, recordUsage } from "@/lib/ai-usage";
import { checkUserRateLimit } from "@/lib/rate-limit";
import {
  appendStructuredJsonFence,
  type InboxAssistantTurn,
} from "@/lib/inbox-chat-structured";
import type { EmailAddress, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function structuredPlainResponse(body: string, turn: InboxAssistantTurn) {
  return new Response(appendStructuredJsonFence(body, turn), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

function turnSingleThread(args: {
  summaryLine: string;
  actionBullets: string[];
  threadId?: string;
  chipLabel: string;
  reason?: string;
  confidence?: "High" | "Medium" | "Low";
}): InboxAssistantTurn {
  const { summaryLine, actionBullets, threadId, chipLabel, reason, confidence } = args;
  return {
    summary: summaryLine.slice(0, 500),
    actions: actionBullets.slice(0, 5),
    threads: threadId
      ? [
        {
          threadId,
          label: chipLabel.slice(0, 56),
          reason: reason ?? "Direct match to your question",
          confidence: confidence ?? "High",
        },
      ]
      : [],
  };
}

function turnFromFilteredEmails(
  summary: string,
  actions: string[],
  emails: Array<{
    threadId: string;
    subject: string;
    from?: { name: string | null; address: string };
    sentAt?: Date;
    bodySnippet?: string | null;
  }>,
): InboxAssistantTurn {
  const keywordRe = /\b(deadline|invoice|urgent|asap|contract|legal|board|investor)\b/i;
  const threads = emails.slice(0, 8).map((e) => ({
    threadId: e.threadId,
    label: e.subject.length > 44 ? `${e.subject.slice(0, 44)}…` : e.subject,
    reason: keywordRe.test(`${e.subject} ${e.bodySnippet ?? ""}`)
      ? "Contains urgency or business-critical keywords"
      : e.sentAt
        ? `Recent thread from ${e.from?.name || e.from?.address || "sender"}`
        : "Relevant to your query",
    confidence: keywordRe.test(`${e.subject} ${e.bodySnippet ?? ""}`) ? "High" : "Medium" as "High" | "Medium",
  }));
  return {
    summary: summary.slice(0, 500),
    actions: actions.slice(0, 5),
    threads,
  };
}

function removeAllSymbols(text: string): string {
  text = text.replace(/\*+/g, "");

  text = text.replace(/^\s*-\s+/gm, "");

  text = text.replace(/•/g, "");

  text = text.replace(/^\s*[▪▫◦‣⁃]\s+/gm, "");

  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");

  return text;
}

function appendExplainableFooter<
  T extends {
    subject: string;
    from: { name: string | null; address: string };
    sentAt: Date;
    bodySnippet?: string | null;
  },
>(text: string, explainable: boolean, emails: T[]): string {
  const base = removeAllSymbols(text);
  if (!explainable || emails.length === 0) return base;
  const footer = buildSourcesFooter(
    emails.slice(0, 5).map((e, i) => ({
      index: i + 1,
      subject: e.subject || "(No subject)",
      from: e.from.name || e.from.address,
      dateLabel: new Date(e.sentAt).toLocaleDateString(),
      snippet: e.bodySnippet ?? undefined,
    })),
  );
  return base + footer;
}

interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  accountId: string;
  explainableMode?: boolean;
  founderDemo?: boolean;
}

type SearchScopeDecision =
  | "email_search_or_summary"
  | "compose_or_send_email"
  | "out_of_scope";

function isExplicitComposeOrSendRequest(query: string): boolean {
  const lower = query.toLowerCase();
  const hasComposeVerb = /\b(write|draft|compose|generate|create|send)\b/.test(lower);
  const hasEmailContext = /\b(email|mail|message|thread)\b/.test(lower);
  if (!hasComposeVerb) return false;
  return hasEmailContext;
}

async function classifySearchScopeWithLlm(
  query: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  hasStoredResults: boolean,
): Promise<SearchScopeDecision | null> {
  if (!env.OPENROUTER_API_KEY) return null;

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
        "X-Title": "VectorMail AI",
      },
    });

    const recentMessages = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 600),
    }));

    const prompt = `Classify the user's latest message for an EMAIL SEARCH ASSISTANT.

The assistant is allowed to:
- find emails
- filter emails
- summarize emails
- answer follow-up questions about previously listed emails

The assistant is NOT allowed to:
- write/compose/generate emails
- send emails

Be robust to broken English, slang, mixed language, shorthand, and implicit references like "that failed one on march 17".

Return ONLY JSON:
{"decision":"email_search_or_summary"|"compose_or_send_email"|"out_of_scope"}

Context:
- hasStoredResults: ${hasStoredResults ? "true" : "false"}
- recentMessages: ${JSON.stringify(recentMessages)}
- latestUserMessage: ${JSON.stringify(query)}`;

    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-haiku",
      messages: [
        {
          role: "system",
          content:
            "You are an intent classifier. Return only the requested JSON object.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 40,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(content) as { decision?: SearchScopeDecision };
    if (
      parsed.decision === "email_search_or_summary" ||
      parsed.decision === "compose_or_send_email" ||
      parsed.decision === "out_of_scope"
    ) {
      return parsed.decision;
    }
    return null;
  } catch (error) {
    console.warn("[Chat] Scope classification failed:", error);
    return null;
  }
}

async function generateGeneralAssistanceReply(
  query: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userId: string,
  accountId: string | null,
): Promise<string | null> {
  if (!env.OPENROUTER_API_KEY) return null;

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
        "X-Title": "VectorMail AI",
      },
    });

    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-haiku",
      messages: [
        {
          role: "system",
          content:
            "You are Inbox Brain, a helpful assistant inside an email product. Answer user requests directly and clearly. Refuse only if the user asks you to draft/compose/write/send an email. Keep answers practical and concise.",
        },
        ...messages.slice(-8),
        { role: "user", content: query },
      ],
      max_tokens: 500,
      temperature: 0.6,
    });

    recordUsage({
      userId,
      accountId: accountId ?? undefined,
      operation: "chat",
      inputTokens: completion.usage?.prompt_tokens ?? 0,
      outputTokens: completion.usage?.completion_tokens ?? 0,
      model: completion.model ?? undefined,
    });

    return completion.choices[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    console.warn("[Chat] General fallback response failed:", error);
    return null;
  }
}

function isContextualEmailFollowUp(
  query: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): boolean {
  const lowerQuery = query.toLowerCase().trim();

  if (messages.length < 2) return false;

  const followUpSignal =
    /\b(tell me about|what about|that one|this one|the one|that failed|failed one|on march|on april|on may|on june|on july|on august|on september|on october|on november|on december|on \d{1,2}[-\/]\d{1,2}|from \d{1,2}[-\/]\d{1,2})\b/i.test(
      lowerQuery,
    );

  if (!followUpSignal) return false;

  const recentAssistantContext = messages
    .slice(-6)
    .filter((msg) => msg.role === "assistant")
    .map((msg) => msg.content.toLowerCase())
    .join("\n");

  return (
    recentAssistantContext.includes("failed payments") ||
    recentAssistantContext.includes("from:") ||
    recentAssistantContext.includes("subject:") ||
    recentAssistantContext.includes("would you like a detailed summary") ||
    recentAssistantContext.includes("found ")
  );
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

async function chatPostHandler(req: Request) {
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

    const aiLimit = checkUserRateLimit(userId, "ai");
    if (!aiLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "Too many AI requests. Try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(aiLimit.limit),
            "X-RateLimit-Remaining": String(aiLimit.remaining),
            "Retry-After": "60",
          },
        },
      );
    }

    const cap = await checkDailyCap(userId, env.AI_DAILY_CAP_TOKENS);
    if (!cap.allowed) {
      const { log: auditLog } = await import("@/lib/audit/audit-log");
      auditLog({ userId, action: "ai_cap_exceeded", metadata: {} });
      return new Response(
        JSON.stringify({
          error: "Daily AI limit reached",
          message: `You have used ${cap.used} of ${cap.limit} tokens today. Try again tomorrow.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
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
    const explainableMode = body.explainableMode !== false;
    const founderDemo = body.founderDemo === true;

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

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
      select: { id: true },
    });

    if (!account) {
      console.error(`[Chat API] Account not found. userId: ${userId}, accountId: ${accountId}`);

      const accountExists = await db.account.findFirst({
        where: { id: accountId },
        select: { id: true, userId: true },
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
    if (hasStoredResults) {
      touchChatSession(userId, accountId);
    }
    const contextualFollowUp = isContextualEmailFollowUp(userQuery, messages);
    const heuristicAllowsSearch =
      isFindOrSummarizeQuery(userQuery) || contextualFollowUp;

    if (!heuristicAllowsSearch || isExplicitComposeOrSendRequest(userQuery)) {
      const llmDecision = await classifySearchScopeWithLlm(
        userQuery,
        messages,
        hasStoredResults,
      );
      const shouldRedirect =
        llmDecision === "compose_or_send_email" ||
        isExplicitComposeOrSendRequest(userQuery);

      if (shouldRedirect) {
        const redirectMessage =
          "I can help with everything here except writing or sending emails. For drafting/sending, please use AI Buddy.";

        return structuredPlainResponse(redirectMessage, {
          summary: "Drafting and sending are handled by AI Buddy",
          actions: ["Use AI Buddy in the sidebar to draft or send emails."],
          threads: [],
        });
      }
    }

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
      const memory = getSearchSessionMemory(userId, accountId);
      const fromMemory = tryResolveLastSelectedEmail(
        userQuery,
        storedEmails,
        memory,
      );

      if (fromMemory) {
        try {
          const summary = await generateConversationalSummary(
            {
              subject: fromMemory.subject,
              from: fromMemory.from,
              date: fromMemory.date,
              body: fromMemory.body,
            },
            "auto",
            userQuery,
            { userId, accountId: accountId ?? undefined },
          );
          const excerpts = getSummarySourceExcerpts(
            fromMemory.body ?? "",
            summary,
            2,
          );
          const basedOn =
            excerpts.length > 0 ? `\n\nBased on: "${excerpts[0]}"` : "";
          const rawCore = `${fromMemory.subject}\nFrom: ${fromMemory.from.name || fromMemory.from.address}\nDate: ${new Date(fromMemory.date).toLocaleDateString()}\n\n${summary}${basedOn}`;
          let response = removeAllSymbols(rawCore);
          if (explainableMode) {
            response += buildSourcesFooter([
              {
                index: 1,
                subject: fromMemory.subject || "(No subject)",
                from: fromMemory.from.name || fromMemory.from.address,
                dateLabel: new Date(fromMemory.date).toLocaleDateString(),
                reason: "Last email you asked about in this session",
                snippet: fromMemory.snippet,
              },
            ]);
          }
          updateSearchSessionMemory(userId, accountId, {
            lastSelectedEmailId: fromMemory.id,
            lastAssistantPreview: response.slice(0, 320),
          });
          const head =
            removeAllSymbols(summary).split(/\n/)[0]?.trim().slice(0, 280) ||
            fromMemory.subject;
          return structuredPlainResponse(
            response,
            turnSingleThread({
              summaryLine: head,
              actionBullets: [],
              threadId: fromMemory.threadId,
              chipLabel: fromMemory.subject || "(No subject)",
            }),
          );
        } catch {

        }
      }

      let matches = pickMatchesForFollowUp(
        selectEmails(storedEmails, extractedData || {}),
      );

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
              model: "anthropic/claude-3.5-haiku",
              messages: [
                { role: "system", content: smartSystemPrompt },
                { role: "user", content: userQuery },
              ],
              max_tokens: 10,
              temperature: 0.3,
            });

            recordUsage({
              userId,
              accountId: accountId ?? undefined,
              operation: "chat",
              inputTokens: completion.usage?.prompt_tokens ?? 0,
              outputTokens: completion.usage?.completion_tokens ?? 0,
              model: completion.model ?? undefined,
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
                  { userId, accountId: accountId ?? undefined },
                );

                const excerpts = getSummarySourceExcerpts(
                  selectedEmail.body ?? "",
                  summary,
                  2,
                );
                const basedOn =
                  excerpts.length > 0
                    ? `\n\nBased on: "${excerpts[0]}"`
                    : "";
                const rawResponse = `${selectedEmail.subject}\nFrom: ${selectedEmail.from.name || selectedEmail.from.address}\nDate: ${new Date(selectedEmail.date).toLocaleDateString()}\n\n${summary}${basedOn}`;
                let response = removeAllSymbols(rawResponse);
                if (explainableMode) {
                  response += buildSourcesFooter([
                    {
                      index: 1,
                      subject: selectedEmail.subject || "(No subject)",
                      from:
                        selectedEmail.from.name || selectedEmail.from.address,
                      dateLabel: new Date(
                        selectedEmail.date,
                      ).toLocaleDateString(),
                      reason: "Matched from your prior search list",
                      snippet: selectedEmail.snippet,
                    },
                  ]);
                }
                updateSearchSessionMemory(userId, accountId, {
                  lastSelectedEmailId: selectedEmail.id,
                  lastAssistantPreview: response.slice(0, 320),
                });
                const head =
                  removeAllSymbols(summary).split(/\n/)[0]?.trim().slice(0, 280) ||
                  selectedEmail.subject;
                return structuredPlainResponse(
                  response,
                  turnSingleThread({
                    summaryLine: head,
                    actionBullets: [],
                    threadId: selectedEmail.threadId,
                    chipLabel: selectedEmail.subject || "(No subject)",
                  }),
                );
              }
            }
          } catch (llmError) {
            console.error("LLM fallback error:", llmError);
          }
        }

        const response = `I couldn't find an email matching that description in the previous search results. Could you be more specific, or try a new search?`;
        return structuredPlainResponse(response, {
          summary: "No match in your last search results",
          actions: ["Run a new search or name the sender, date, or subject."],
          threads: [],
        });
      }

      if (matches.length > 1) {
        const options = formatEmailOptionsWithReasons(matches);
        const response = `I'm not fully sure which email you mean. Here are the closest matches:\n\n${options}\n\nReply with "the first one", "the second one", or add more detail (date, sender, or subject).`;
        const threads = matches
          .map((m) => {
            const tid = m.email.threadId;
            if (!tid) return null;
            return {
              threadId: tid,
              label:
                m.email.subject.length > 44
                  ? `${m.email.subject.slice(0, 44)}…`
                  : m.email.subject,
              reason:
                m.matchReason?.slice(0, 120) ??
                "Potential match based on your follow-up description",
              confidence: "Medium" as const,
            };
          })
          .filter(
            (
              x,
            ): x is {
              threadId: string;
              label: string;
              reason: string;
              confidence: "Medium";
            } => x !== null,
          );
        return structuredPlainResponse(response, {
          summary: "Which thread did you mean?",
          actions: [
            'Reply with "the first one" / "second" or tap a thread chip.',
          ],
          threads: threads.slice(0, 8),
        });
      }

      const selectedEmail = matches[0]?.email;
      const topReason = matches[0]?.matchReason;
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
          { userId, accountId: accountId ?? undefined },
        );

        const excerpts = getSummarySourceExcerpts(
          selectedEmail.body ?? "",
          summary,
          2,
        );
        const basedOn =
          excerpts.length > 0 ? `\n\nBased on: "${excerpts[0]}"` : "";
        const rawResponse = `${selectedEmail.subject}\nFrom: ${selectedEmail.from.name || selectedEmail.from.address}\nDate: ${new Date(selectedEmail.date).toLocaleDateString()}\n\n${summary}${basedOn}`;
        let response = removeAllSymbols(rawResponse);
        if (explainableMode) {
          response += buildSourcesFooter([
            {
              index: 1,
              subject: selectedEmail.subject || "(No subject)",
              from: selectedEmail.from.name || selectedEmail.from.address,
              dateLabel: new Date(selectedEmail.date).toLocaleDateString(),
              reason: topReason,
              snippet: selectedEmail.snippet,
            },
          ]);
        }
        updateSearchSessionMemory(userId, accountId, {
          lastSelectedEmailId: selectedEmail.id,
          lastAssistantPreview: response.slice(0, 320),
        });
        const head =
          removeAllSymbols(summary).split(/\n/)[0]?.trim().slice(0, 280) ||
          selectedEmail.subject;
        return structuredPlainResponse(
          response,
          turnSingleThread({
            summaryLine: head,
            actionBullets: [],
            threadId: selectedEmail.threadId,
            chipLabel: selectedEmail.subject || "(No subject)",
          }),
        );
      } catch (summaryError) {
        console.error("Summary generation failed:", summaryError);
        const response = `This email from ${selectedEmail.from.name || selectedEmail.from.address} dated ${new Date(selectedEmail.date).toLocaleDateString()} is about "${selectedEmail.subject}". ${selectedEmail.snippet}...`;
        return structuredPlainResponse(response, {
          summary: `Snippet: ${selectedEmail.subject.slice(0, 80)}`,
          actions: ["Open the thread for the full message."],
          threads: selectedEmail.threadId
            ? [
              {
                threadId: selectedEmail.threadId,
                label:
                  selectedEmail.subject.length > 44
                    ? `${selectedEmail.subject.slice(0, 44)}…`
                    : selectedEmail.subject,
                reason: "Directly selected as the best match for your query",
                confidence: "High",
              },
            ]
            : [],
        });
      }
    }

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - recentDays);

    let relevantEmails: Array<{
      id: string;
      threadId: string;
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
            model: "anthropic/claude-3.5-haiku",
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
          console.warn("Claude failed, retrying with Claude Sonnet:", claudeError);
          understandingResponse = await openai.chat.completions.create({
            model: "anthropic/claude-3.5-haiku",
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

        if (understandingResponse?.usage) {
          recordUsage({
            userId,
            accountId: accountId ?? undefined,
            operation: "chat",
            inputTokens: understandingResponse.usage.prompt_tokens ?? 0,
            outputTokens: understandingResponse.usage.completion_tokens ?? 0,
            model: understandingResponse.model ?? undefined,
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
        threadId: string;
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
          threadId: result.email.threadId,
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
          threadId: email.threadId,
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

    const lowerUserQuery = userQuery.toLowerCase();

    const isDeclinedPaymentsQuery =
      /\b(declined|failed|insufficient|rejected|unsuccessful|could not process)\b/.test(
        lowerUserQuery,
      ) &&
      /\b(payment|payments|receipt|invoice|invoices|subscription|subscriptions|upi|card|debit|debits|charged|charge|charges|billing|debited)\b/.test(
        lowerUserQuery,
      );

    const isHeuristicCategoryQuery =
      isDeclinedPaymentsQuery ||
      /\b(urgent|asap|attention|need a reply|need reply|follow up|follow-up|reply|respond|action required|required)\b/.test(
        lowerUserQuery,
      ) ||
      /\b(order|orders|tracking|shipped|delivery|delivered|dispatch)\b/.test(
        lowerUserQuery,
      ) ||
      /\b(flight|travel|trip|hotel|booking|itinerary|pnr|airline|boarding pass)\b/.test(
        lowerUserQuery,
      ) ||
      /\b(meeting|calendar|invite|appointment|rsvp|scheduled|call)\b/.test(
        lowerUserQuery,
      );

    if (relevantEmails.length === 0 && isHeuristicCategoryQuery) {
      const since = new Date();
      since.setDate(since.getDate() - 90);

      const declineTerms = [
        "declined",
        "failed",
        "insufficient",
        "rejected",
        "unsuccessful",
        "could not process",
        "transaction failed",
        "debit failed",
      ];

      const paymentTerms = [
        "payment",
        "payments",
        "receipt",
        "receipts",
        "invoice",
        "invoices",
        "subscription",
        "subscriptions",
        "billing",
        "upi",
        "card",
        "debit",
        "debited",
        "charged",
        "charge",
        "charges",
        "transaction",
      ];

      const attentionTerms = [
        "urgent",
        "asap",
        "action required",
        "respond",
        "reply",
        "follow up",
        "follow-up",
        "needs attention",
        "overdue",
      ];

      const orderTerms = [
        "order",
        "tracking",
        "shipped",
        "delivery",
        "delivered",
        "dispatch",
      ];

      const travelTerms = [
        "flight",
        "airline",
        "booking",
        "itinerary",
        "pnr",
        "hotel",
        "boarding pass",
        "ticket",
        "reservation",
      ];

      const meetingTerms = [
        "meeting",
        "calendar",
        "invite",
        "invitation",
        "appointment",
        "rsvp",
        "scheduled",
        "schedule",
        "call",
      ];

      let bucketTerms: string[] = [];
      if (isDeclinedPaymentsQuery) {
        bucketTerms = [...declineTerms, ...paymentTerms];
      } else if (/\b(urgent|asap|attention|need a reply|need reply|follow up|follow-up|respond|action required|required)\b/.test(lowerUserQuery)) {
        bucketTerms = attentionTerms;
      } else if (/\b(order|orders|tracking|shipped|delivery|delivered|dispatch)\b/.test(lowerUserQuery)) {
        bucketTerms = orderTerms;
      } else if (/\b(flight|travel|trip|hotel|booking|itinerary|pnr|airline|boarding pass)\b/.test(lowerUserQuery)) {
        bucketTerms = travelTerms;
      } else if (/\b(meeting|calendar|invite|appointment|rsvp|scheduled|call)\b/.test(lowerUserQuery)) {
        bucketTerms = meetingTerms;
      } else {
        if (/\b(payment|receipt|invoice|subscription|upi|card|debit|charged|billing)\b/.test(lowerUserQuery)) {
          bucketTerms = paymentTerms;
        }
      }

      const orConditions: Prisma.EmailWhereInput[] = [];
      for (const t of bucketTerms) {
        orConditions.push(
          { subject: { contains: t, mode: "insensitive" } },
          { bodySnippet: { contains: t, mode: "insensitive" } },
          { summary: { contains: t, mode: "insensitive" } },
        );
      }

      if (orConditions.length > 0) {
        const searchResults = await db.email.findMany({
          where: {
            thread: { accountId: accountId },
            sentAt: { gte: since },
            OR: orConditions,
          },
          include: { from: true, to: true },
          orderBy: { sentAt: "desc" },
          take: 20,
        });

        relevantEmails = searchResults.map((email) => ({
          id: email.id,
          threadId: email.threadId,
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
      }
    }

    let filteredEmails = relevantEmails.filter((email) => {
      const minSimilarity = isHeuristicCategoryQuery ? 0 : similarityThreshold;
      return email.similarity >= minSimilarity;
    });

    let skipLlmStrictFilter = false;

    const hitsText = (e: (typeof filteredEmails)[number]) =>
      `${e.subject}\n${e.summary ?? ""}\n${e.bodySnippet ?? ""}\n${e.body ?? ""}`.toLowerCase();

    if (isDeclinedPaymentsQuery && filteredEmails.length > 0) {
      const declineTerms = [
        "declined",
        "failed",
        "insufficient",
        "rejected",
        "unsuccessful",
        "could not process",
        "transaction failed",
        "debit failed",
      ];
      const paymentTerms = [
        "payment",
        "receipt",
        "invoice",
        "subscription",
        "billing",
        "upi",
        "card",
        "debit",
        "debited",
        "charged",
        "charge",
        "subscription",
      ];

      const heurFiltered = filteredEmails.filter((e) => {
        const t = hitsText(e);
        const hasDecline = declineTerms.some((term) => t.includes(term));
        const hasPayment = paymentTerms.some((term) => t.includes(term));
        return hasDecline && hasPayment;
      });

      if (heurFiltered.length > 0) {
        filteredEmails = heurFiltered;
        skipLlmStrictFilter = true;
      } else {
        const declineOnly = filteredEmails.filter((e) => {
          const t = hitsText(e);
          return declineTerms.some((term) => t.includes(term));
        });

        if (declineOnly.length > 0) {
          filteredEmails = declineOnly;
          skipLlmStrictFilter = true;
        }
      }
    }

    if (!skipLlmStrictFilter && filteredEmails.length > 0) {
      const lower = lowerUserQuery;

      const isNeedAttentionQuery =
        /\b(urgent|asap|attention|need a reply|need reply|needs a reply|need to reply|follow up|follow-up|respond|reply)\b/.test(
          lower,
        ) ||
        /\b(action required|required)\b/.test(lower);
      const attentionTerms = [
        "urgent",
        "asap",
        "action required",
        "respond",
        "reply",
        "follow up",
        "follow-up",
        "needs attention",
        "overdue",
      ];
      const heurAttention = isNeedAttentionQuery
        ? filteredEmails.filter((e) =>
          attentionTerms.some((term) => hitsText(e).includes(term)),
        )
        : [];
      if (heurAttention.length > 0) {
        filteredEmails = heurAttention;
        skipLlmStrictFilter = true;
      }
    }

    if (!skipLlmStrictFilter && filteredEmails.length > 0) {
      const lower = lowerUserQuery;

      const isOrdersQuery =
        /\b(order|orders|tracking|shipped|delivery|delivered|dispatch)\b/.test(
          lower,
        );
      const orderTerms = [
        "order",
        "tracking",
        "shipped",
        "delivery",
        "delivered",
        "dispatch",
        "tracking id",
        "courier",
      ];
      const heurOrders = isOrdersQuery
        ? filteredEmails.filter((e) =>
          orderTerms.some((term) => hitsText(e).includes(term)),
        )
        : [];
      if (heurOrders.length > 0) {
        filteredEmails = heurOrders;
        skipLlmStrictFilter = true;
      }
    }

    if (!skipLlmStrictFilter && filteredEmails.length > 0) {
      const lower = lowerUserQuery;

      const isTravelQuery =
        /\b(flight|travel|trip|hotel|booking|itinerary|pnr|airline|boarding pass)\b/.test(
          lower,
        );
      const travelTerms = [
        "flight",
        "airline",
        "booking",
        "itinerary",
        "pnr",
        "hotel",
        "boarding pass",
        "ticket",
        "reservation",
        "check-in",
      ];
      const heurTravel = isTravelQuery
        ? filteredEmails.filter((e) =>
          travelTerms.some((term) => hitsText(e).includes(term)),
        )
        : [];
      if (heurTravel.length > 0) {
        filteredEmails = heurTravel;
        skipLlmStrictFilter = true;
      }
    }

    if (!skipLlmStrictFilter && filteredEmails.length > 0) {
      const lower = lowerUserQuery;

      const isMeetingsQuery =
        /\b(meeting|meetings|calendar|invite|invitation|appointment|rsvp|scheduled|schedule|call)\b/.test(
          lower,
        );
      const meetingTerms = [
        "meeting",
        "calendar",
        "invite",
        "invitation",
        "appointment",
        "rsvp",
        "scheduled",
        "schedule",
        "call",
        "rescheduled",
      ];
      const heurMeetings = isMeetingsQuery
        ? filteredEmails.filter((e) =>
          meetingTerms.some((term) => hitsText(e).includes(term)),
        )
        : [];
      if (heurMeetings.length > 0) {
        filteredEmails = heurMeetings;
        skipLlmStrictFilter = true;
      }
    }

    if (!skipLlmStrictFilter && filteredEmails.length > 0) {
      const lower = lowerUserQuery;

      const isPaymentsQuery =
        /\b(payment|payments|receipt|receipts|invoice|invoices|subscription|subscriptions|upi|card|debit|debited|charged|charge|billing)\b/.test(
          lower,
        );
      const paymentTerms = [
        "payment",
        "receipt",
        "invoice",
        "subscription",
        "subscriptions",
        "billing",
        "upi",
        "card",
        "debit",
        "debited",
        "charged",
        "charge",
        "transaction",
      ];
      const heurPayments = isPaymentsQuery
        ? filteredEmails.filter((e) =>
          paymentTerms.some((term) => hitsText(e).includes(term)),
        )
        : [];
      if (heurPayments.length > 0) {
        filteredEmails = heurPayments;
        skipLlmStrictFilter = true;
      }
    }

    const shouldRunLlmStrictFilter =
      !isHeuristicCategoryQuery &&
      !skipLlmStrictFilter &&
      filteredEmails.length > 0 &&
      env.OPENROUTER_API_KEY;

    if (shouldRunLlmStrictFilter) {
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
          model: "anthropic/claude-3.5-haiku",
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

        recordUsage({
          userId,
          accountId: accountId ?? undefined,
          operation: "chat",
          inputTokens: filterResponse.usage?.prompt_tokens ?? 0,
          outputTokens: filterResponse.usage?.completion_tokens ?? 0,
          model: filterResponse.model ?? undefined,
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
      threadId: email.threadId,
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
      const generalReply = await generateGeneralAssistanceReply(
        userQuery,
        messages,
        userId,
        accountId,
      );
      if (generalReply) {
        const cleaned = removeAllSymbols(generalReply);
        const headline =
          cleaned.split(/\n/)[0]?.trim().slice(0, 180) ||
          "Answered your request";
        return structuredPlainResponse(cleaned, {
          summary: headline,
          actions: [],
          threads: [],
        });
      }

      const response = "No mails found regarding your query. I'm Sorry!";

      return structuredPlainResponse(response, {
        summary: "No matching threads found",
        actions: ["Try different keywords or widen the date range."],
        threads: [],
      });
    }

    if (isHeuristicCategoryQuery && filteredEmails.length > 0) {
      const top = filteredEmails[0]!;
      const bodyForSummary = (top.body ?? top.bodySnippet ?? "").toString();

      const summary = await generateConversationalSummary(
        {
          subject: top.subject,
          from: { name: top.from.name ?? null, address: top.from.address },
          date: top.sentAt,
          body: bodyForSummary,
        },
        "short",
        undefined,
        { userId, accountId: accountId ?? undefined },
      );

      const excerpts = getSummarySourceExcerpts(bodyForSummary, summary, 1);
      const basedOn =
        excerpts.length > 0 ? `\n\nBased on: "${excerpts[0]}"` : "";

      const rawCore = `${top.subject}\nFrom: ${top.from.name || top.from.address}\nDate: ${new Date(top.sentAt).toLocaleDateString()}\n\n${summary}${basedOn}`;
      let response = removeAllSymbols(rawCore);

      if (explainableMode) {
        response += buildSourcesFooter([
          {
            index: 1,
            subject: top.subject || "(No subject)",
            from: top.from.name || top.from.address,
            dateLabel: new Date(top.sentAt).toLocaleDateString(),
            reason: "Top match for your inbox-intelligence query",
            snippet: top.bodySnippet ?? undefined,
          },
        ]);
      }

      updateSearchSessionMemory(userId, accountId, {
        lastSelectedEmailId: top.id,
        lastAssistantPreview: response.slice(0, 320),
      });

      const head =
        removeAllSymbols(summary).split(/\n/)[0]?.trim().slice(0, 280) ||
        top.subject;
      return structuredPlainResponse(
        response,
        turnSingleThread({
          summaryLine: head,
          actionBullets: [],
          threadId: top.threadId,
          chipLabel: top.subject || "(No subject)",
        }),
      );
    }

    const safetyRails = `
QUALITY AND SAFETY (MANDATORY):
- Only state facts that appear in the email previews or summaries below. Do not invent amounts, dates, senders, or outcomes.
- If the user asks for detail that is not in the provided excerpts, say you only have the preview and suggest they open the thread in the inbox.
- If several emails could match, briefly list the ambiguity and ask which one they mean.
- Never offer to compose, draft, or send email in this assistant; tell them to use AI Buddy for that.
`;

    const founderDemoBlock = founderDemo
      ? `
FOUNDER DEMO MODE:
- Be concise and executive: lead with the answer, then 1-2 supporting bullets from the emails.
- Sound confident only when the evidence is in the previews; otherwise hedge clearly.
`
      : "";

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

FORMATTING RULES - PLAIN TEXT IN THE ANSWER BODY:
- FORBIDDEN in the prose answer: markdown emphasis (* **), bullet dashes (-, •) at line starts, decorative symbols
- For lists in prose, use ONLY numbered lines like 1. 2. 3. or letters a. b. c.
- Keep the answer readable and plain

STRUCTURED OUTPUT (MANDATORY; app relies on this):
After your plain-text answer, append EXACTLY ONE fenced JSON block using ONLY this shape (triple backticks allowed here and nowhere else):
\`\`\`json
{"summary":"One-line executive headline of your answer","actions":["Short actionable bullet if any","..."],"threads":[{"threadId":"<exact ThreadId from email list>","label":"Short chip text (e.g. subject)","reason":"Crisp user-facing why this thread matters","confidence":"High|Medium|Low"}]}
\`\`\`
Rules:
- summary: concise headline; not empty.
- actions: 0-5 short strings; use [] if nothing to recommend.
- threads: up to 8 objects for threads you cite; threadId MUST be copied exactly from "ThreadId:" in the numbered emails below; never invent or guess IDs; use [] if none.
- For each thread object, include:
  - reason: short plain-English justification (no model internals), e.g. "Last message from external sender 3d ago", "Contains deadline/invoice keywords", "Looks newsletter-like".
  - confidence: exactly one of High, Medium, Low.
- The JSON must be valid and on one line or pretty-printed inside the fence.

Found ${filteredEmails.length} email${filteredEmails.length !== 1 ? "s" : ""}:

${emailContext
        .map(
          (email, index) => `
${index + 1}. ThreadId: ${email.threadId}
From: ${email.from}
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

If the user sends a simple greeting (hi, hello, thanks, cool, etc.), respond in a friendly, brief way and remind them you can help find and summarize emails.
${explainableMode ? safetyRails : ""}
${founderDemoBlock}`;

    if (!env.OPENROUTER_API_KEY) {
      let resp =
        filteredEmails.length > 0
          ? `Found ${filteredEmails.length} emails:\n\n${filteredEmails
            .slice(0, 5)
            .map(
              (e, i) =>
                `${i + 1}. ${e.subject} (${e.from?.name || e.from?.address})\n   ${new Date(e.sentAt).toLocaleDateString()}`,
            )
            .join("\n\n")}`
          : "No emails found for that query.";
      if (explainableMode && filteredEmails.length > 0) {
        resp = appendExplainableFooter(resp, true, filteredEmails);
      }

      const turnNoKey: InboxAssistantTurn =
        filteredEmails.length > 0
          ? turnFromFilteredEmails(
            `Found ${filteredEmails.length} emails (connect API for full AI)`,
            ["Open a thread below to read the full message."],
            filteredEmails.slice(0, 8).map((e) => ({
              threadId: e.threadId,
              subject: e.subject,
              from: e.from,
              sentAt: e.sentAt,
              bodySnippet: e.bodySnippet ?? "",
            })),
          )
          : {
            summary: "No emails found for that query",
            actions: [],
            threads: [],
          };

      return structuredPlainResponse(resp, turnNoKey);
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
        model: "anthropic/claude-3.5-haiku",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      });

      const encoder = new TextEncoder();
      let accumulatedRaw = "";
      let accumulatedProcessed = "";
      const explainable = explainableMode;
      const footerEmails = filteredEmails;
      let streamUsage: { prompt_tokens: number; completion_tokens: number } = {
        prompt_tokens: 0,
        completion_tokens: 0,
      };
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                accumulatedRaw += content;
                const fenceIdx = accumulatedRaw.indexOf("```json");
                const prosePart =
                  fenceIdx === -1
                    ? accumulatedRaw
                    : accumulatedRaw.slice(0, fenceIdx);
                const jsonPart =
                  fenceIdx === -1 ? "" : accumulatedRaw.slice(fenceIdx);
                const fullyProcessed =
                  removeAllSymbols(prosePart) + jsonPart;
                const newContent = fullyProcessed.slice(
                  accumulatedProcessed.length,
                );
                if (newContent) {
                  controller.enqueue(encoder.encode(newContent));
                  accumulatedProcessed = fullyProcessed;
                }
              }
              const u = (chunk as { usage?: { prompt_tokens?: number; completion_tokens?: number } }).usage;
              if (u) {
                streamUsage = {
                  prompt_tokens: u.prompt_tokens ?? 0,
                  completion_tokens: u.completion_tokens ?? 0,
                };
              }
            }
          } catch (error) {
            console.error("Streaming error:", error);
            controller.enqueue(encoder.encode("\n\nError streaming response"));
          } finally {
            if (explainable && footerEmails.length > 0) {
              const tail = appendExplainableFooter(
                "",
                true,
                footerEmails,
              ).replace(/^\s+/, "");
              if (tail) {
                controller.enqueue(encoder.encode(tail));
              }
            }
            recordUsage({
              userId,
              accountId: accountId ?? undefined,
              operation: "chat",
              inputTokens: streamUsage.prompt_tokens,
              outputTokens: streamUsage.completion_tokens,
              model: "anthropic/claude-3.5-haiku",
            });
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
      let resp =
        filteredEmails.length > 0
          ? `Found ${filteredEmails.length} emails:\n\n${filteredEmails
            .slice(0, 5)
            .map(
              (e, i) =>
                `${i + 1}. ${e.subject} (${e.from?.name || e.from?.address})\n   ${new Date(e.sentAt).toLocaleDateString()}`,
            )
            .join("\n\n")}`
          : "No emails found.";
      if (explainableMode && filteredEmails.length > 0) {
        resp = appendExplainableFooter(resp, true, filteredEmails);
      }

      const turnErr: InboxAssistantTurn =
        filteredEmails.length > 0
          ? turnFromFilteredEmails(
            "Could not reach the AI model; listing search matches",
            [],
            filteredEmails.slice(0, 8).map((e) => ({
              threadId: e.threadId,
              subject: e.subject,
              from: e.from,
              sentAt: e.sentAt,
              bodySnippet: e.bodySnippet ?? "",
            })),
          )
          : {
            summary: "Search unavailable",
            actions: ["Try again in a moment."],
            threads: [],
          };

      return structuredPlainResponse(resp, turnErr);
    }
  } catch (error) {
    console.error("[Chat API] Unhandled error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

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

export const POST = withRequestId(chatPostHandler);
