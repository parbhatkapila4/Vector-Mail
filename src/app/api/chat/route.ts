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
import { buildSourcesFooter } from "@/lib/explainability/sources";
import { detectIntent } from "@/lib/intent-detection";
import {
  selectEmails,
  pickMatchesForFollowUp,
  formatEmailOptionsWithReasons,
} from "@/lib/email-selection";
import { generateConversationalSummary } from "@/lib/conversational-summary";
import { getSummarySourceExcerpts } from "@/lib/explainability/summary";
import { searchEmailsByVector } from "@/lib/vector-search";
import { withRequestId } from "@/lib/logging/with-request-id";
import { checkDailyCap, recordUsage } from "@/lib/ai-usage";
import { checkUserRateLimit } from "@/lib/rate-limit";
import type { InboxAssistantTurn } from "@/lib/inbox-chat-structured";
import { buildInboxBrainPrompt } from "./prompt";
import {
  appendExplainableFooter,
  classifySearchScopeWithLlm,
  createCompletionWithModelFallback,
  generateGeneralAssistanceReply,
  isContextualEmailFollowUp,
  isExplicitComposeOrSendRequest,
  isFindOrSummarizeQuery,
  parseInboxStatsQuery,
  parseReplyIntent,
  parseTimeRangeSummaryQuery,
  resolveTargetThreadIdFromMessages,
  REASONING_MODEL_CHAIN,
  removeAllSymbols,
  RECENT_DAYS,
  SIMILARITY_THRESHOLD,
  structuredPlainResponse,
  turnFromFilteredEmails,
  turnSingleThread,
  VECTOR_SIMILARITY_THRESHOLD,
  type ChatRequest,
} from "./helpers";
import type { EmailAddress, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function chatPostHandler(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      chatLog.error("[Chat API] Unauthorized: No userId found");
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
      chatLog.error("[Chat API] Failed to parse request body:", parseError);
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
      chatLog.error("[Chat API] Account ID is required");
      return new Response(
        JSON.stringify({ error: "Account ID is required. Please select an email account.", code: "MISSING_ACCOUNT_ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      chatLog.error("[Chat API] Invalid messages array");
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
      chatLog.error("[Chat API] No message content provided");
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
      chatLog.error(`[Chat API] Account not found. userId: ${userId}, accountId: ${accountId}`);

      const accountExists = await db.account.findFirst({
        where: { id: accountId },
        select: { id: true, userId: true },
      });

      if (accountExists) {
        chatLog.error(`[Chat API] Account exists but belongs to different user: ${accountExists.userId}`);
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
    const replyIntent = parseReplyIntent(userQuery);
    if (replyIntent) {
      const targetThreadId = resolveTargetThreadIdFromMessages(
        messages,
        storedEmails,
      );
      if (!targetThreadId) {
        return structuredPlainResponse(
          "I need to know which thread you mean. Open the email first, or ask me to find it (e.g. 'show the Gumroad email'), then say 'reply with …' again.",
          {
            summary: "No thread to reply to yet",
            actions: [
              "Open a thread, or ask me to find one first.",
              "Then say: reply with \"your message\".",
            ],
            threads: [],
          },
        );
      }

      const { sendReplyToThread } = await import("@/lib/email-reply");
      const result = await sendReplyToThread({
        userId,
        threadId: targetThreadId,
        body: replyIntent.body,
        source: "inbox_brain_chat",
      });

      if (!result.ok) {
        chatLog.warn(
          `[Chat] reply intent failed (${result.reason}) for thread ${targetThreadId}`,
        );
        return structuredPlainResponse(result.message, {
          summary: "Couldn't send the reply",
          actions:
            result.reason === "needs_reconnect"
              ? ["Reconnect the mailbox, then try again."]
              : result.reason === "demo"
                ? ["Connect a real mailbox to send."]
                : ["Try again, or open the thread to send manually."],
          threads: [{ threadId: targetThreadId, label: "Open thread", reason: "Reply attempt", confidence: "High" }],
        });
      }

      const recipient = result.toName
        ? `${result.toName} <${result.toAddress}>`
        : result.toAddress;
      const previewBody =
        replyIntent.body.length > 220
          ? `${replyIntent.body.slice(0, 217)}…`
          : replyIntent.body;
      return structuredPlainResponse(
        `Sent to ${recipient}.\n\n"${previewBody}"`,
        {
          summary: `Sent reply to ${result.toAddress}`,
          actions: ["Open the thread to see your reply in context."],
          threads: [
            {
              threadId: targetThreadId,
              label: result.subject.slice(0, 80),
              reason: "Reply sent from chat",
              confidence: "High",
            },
          ],
        },
      );
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
      chatLog.log(`[Chat] Detected new search query, clearing stored results`);
      const { clearSession } = await import("@/lib/chat-session");
      clearSession(userId, accountId);
      shouldUseStoredResults = false;
    }

    const intentResult = detectIntent(userQuery, shouldUseStoredResults);
    const { intent, extractedData } = intentResult;

    chatLog.log(
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

      const matches = pickMatchesForFollowUp(
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

            const completion = await createCompletionWithModelFallback(openai, {
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
            chatLog.error("LLM fallback error:", llmError);
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
                  ? `${m.email.subject.slice(0, 44)}â€¦`
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
        chatLog.error("Summary generation failed:", summaryError);
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
                    ? `${selectedEmail.subject.slice(0, 44)}â€¦`
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
    recentDate.setDate(recentDate.getDate() - RECENT_DAYS);

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

    if (parseInboxStatsQuery(userQuery)) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const accountScope = { thread: { accountId } } as const;
      const [totalEmails, totalThreads, inboxThreads, last24h, last7d, last30d] =
        await Promise.all([
          db.email.count({ where: accountScope }),
          db.thread.count({ where: { accountId } }),
          db.thread.count({ where: { accountId, inboxStatus: true } }),
          db.email.count({ where: { ...accountScope, sentAt: { gte: dayAgo } } }),
          db.email.count({ where: { ...accountScope, sentAt: { gte: weekAgo } } }),
          db.email.count({ where: { ...accountScope, sentAt: { gte: monthAgo } } }),
        ]);
      const fmt = (n: number) => n.toLocaleString();
      const body = [
        `Across this account I can see ${fmt(totalEmails)} email${totalEmails === 1 ? "" : "s"} in ${fmt(totalThreads)} thread${totalThreads === 1 ? "" : "s"}.`,
        `${fmt(inboxThreads)} are sitting in your inbox right now.`,
        `Recent activity: ${fmt(last24h)} in the last 24h, ${fmt(last7d)} in the last 7 days, ${fmt(last30d)} in the last 30 days.`,
        totalEmails > 0
          ? `Ask me to rank what matters, summarize a window, or find mail from a specific sender - I can search across all of these.`
          : `Nothing has synced yet. Connect a mailbox or let the initial sync finish and I'll come back to life.`,
      ].join(" ");
      return structuredPlainResponse(body, {
        summary: `${fmt(totalEmails)} emails · ${fmt(inboxThreads)} inbox threads`,
        actions: totalEmails > 0
          ? ["Try: rank what matters today.", "Try: summarize the last 7 days."]
          : ["Wait for sync, or connect a mailbox."],
        threads: [],
      });
    }

    const timeRangeSummary = parseTimeRangeSummaryQuery(userQuery);
    let timeRangeSummaryActive = false;
    if (timeRangeSummary) {
      const windows = Array.from(
        new Set([timeRangeSummary.days, 7, 30, 90]),
      ).filter((d) => d >= timeRangeSummary.days);
      const fetchWindow = (days: number) => {
        const since = new Date();
        since.setDate(since.getDate() - days);
        return db.email.findMany({
          where: {
            thread: { accountId: accountId },
            sentAt: { gte: since },
          },
          include: { from: true, to: true },
          orderBy: { sentAt: "desc" },
          take: 80,
        });
      };
      let recentEmails = await fetchWindow(timeRangeSummary.days);
      let usedDays = timeRangeSummary.days;
      if (recentEmails.length === 0) {
        for (const days of windows.slice(1)) {
          recentEmails = await fetchWindow(days);
          if (recentEmails.length > 0) {
            usedDays = days;
            break;
          }
        }
      }

      if (recentEmails.length > 0) {
        relevantEmails = recentEmails.map((email) => ({
          id: email.id,
          threadId: email.threadId,
          subject: email.subject,
          summary: email.summary,
          body: email.body,
          bodySnippet: email.bodySnippet,
          sentAt: email.sentAt,
          similarity: 0.8,
          from: email.from,
          to: email.to,
        }));
        storeSearchResults(userId, accountId, relevantEmails, userQuery);
        timeRangeSummaryActive = true;
        chatLog.log(
          `[Chat] time-range summary: pulled ${relevantEmails.length} emails from last ${usedDays}d (requested ${timeRangeSummary.days}d)`,
        );
      } else {
        const totalCheck = await db.email.count({
          where: { thread: { accountId } },
        });
        const msg = totalCheck > 0
          ? `Your inbox has ${totalCheck.toLocaleString()} email${totalCheck === 1 ? "" : "s"} total, but none in the recent window. Ask me to look further back or for a specific sender.`
          : `Your inbox is empty for this account - nothing has synced yet. Connect a mailbox or wait for the initial sync to finish.`;
        return structuredPlainResponse(msg, {
          summary: totalCheck > 0 ? "Nothing recent" : "Inbox empty",
          actions: totalCheck > 0
            ? ["Try: last 30 days, or a specific sender."]
            : ["Wait for sync, or connect a mailbox."],
          threads: [],
        });
      }
    }

    const senderTermBlocklist = new Set([
      "another",
      "anyone",
      "anything",
      "everyone",
      "everything",
      "him",
      "her",
      "them",
      "us",
      "you",
      "me",
      "this",
      "that",
      "these",
      "those",
      "today",
      "tomorrow",
      "yesterday",
      "morning",
      "evening",
      "night",
      "now",
      "later",
      "earlier",
      "long",
      "short",
      "where",
      "when",
      "what",
      "who",
      "why",
      "how",
      "the",
      "a",
      "an",
      "my",
      "your",
      "our",
      "his",
      "their",
      "real",
      "good",
      "bad",
      "old",
      "new",
      "last",
      "first",
      "second",
      "third",
      "mother",
      "father",
      "brother",
      "sister",
      "friend",
      "people",
      "someone",
      "somebody",
    ]);
    let senderTerm = "";
    const trimmedQuery = userQuery.trim();
    const singleTokenSenderPatterns: RegExp[] = [
      /\b(?:emails?|mail|messages?)\s+from\s+([a-zA-Z0-9._@-]+)\b/i,
      /^from\s+([a-zA-Z0-9._@-]+)\??$/i,
      /^([a-zA-Z0-9._@-]+)\??$/i,
    ];
    for (const pattern of singleTokenSenderPatterns) {
      const match = trimmedQuery.match(pattern);
      if (!match || !match[1]) continue;
      const candidate = match[1].trim().toLowerCase().replace(/[?]/g, "");
      if (candidate.length <= 1 || candidate.length > 50) continue;
      if (candidate.includes(" ")) continue;
      if (senderTermBlocklist.has(candidate)) continue;
      senderTerm = candidate;
      break;
    }

    let understoodQuery = userQuery;
    let queryIntent = "";
    if (env.OPENROUTER_API_KEY && !timeRangeSummaryActive) {
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

Your task: Understand what the user is REALLY looking for and produce a SEMANTIC search expansion for a vector database, plus a relevance description for downstream filtering.

Think about INTENT - not just the literal words. Treat the user like a smart human asking a smart assistant. If they ask "find emails regarding meetings" they want everything that genuinely relates to meetings - calendar invites, scheduling threads, meeting agendas, recaps, reschedules, follow-ups, sync requests, intro chats, etc. - not only the literal word "meeting".

For relevantTypes, capture both the COMMITMENT level the user is asking for:
- "find my X" / "show X" / "what X do I have" → STRICT: actual instances of X
- "anything regarding X" / "emails about X" / "mention of X" / "discuss X" / "related to X" → INCLUSIVE: anything substantively about X
- ambiguous → moderate

SENDER EXTRACTION - important:
If the user is asking about emails from a specific person, company, brand, or service (e.g., "from notion", "any email from cursor", "frrrom stripe", "Anthropic emails"), set "sender" to that name as a SINGLE LOWERCASE TOKEN. Be robust to typos ("frrrom" → still recognize "from"), slang ("brother from another mother" → ignore, it's an expression), and casual phrasing. If no specific sender is mentioned, set "sender" to null.

Examples:
- "Find my flight bookings" → searchQuery: "flight booking airline ticket reservation itinerary boarding pass departure arrival" | sender: null | relevantTypes: "STRICT: actual flight bookings, airline confirmations, e-tickets, itineraries, boarding passes" | intent: "find actual flight bookings"
- "Show receipts and payments" → searchQuery: "receipt payment invoice purchase order transaction billing charge debit subscription" | sender: null | relevantTypes: "STRICT: real transaction records, invoices, payment confirmations" | intent: "find actual payment records"
- "What meetings do I have this week" → searchQuery: "meeting calendar invite scheduled call appointment zoom google meet sync standup" | sender: null | relevantTypes: "STRICT: actual calendar invites, RSVPs, scheduled meetings on the calendar" | intent: "find scheduled meetings"
- "find any mail regarding meetings" → searchQuery: "meeting calendar invite scheduled call appointment agenda recap reschedule sync standup discussion" | sender: null | relevantTypes: "INCLUSIVE: anything substantively about meetings - invites, agendas, recaps, scheduling threads, follow-ups, sync emails, meeting-related discussions" | intent: "find anything related to meetings"
- "anything about hiring or recruiting" → searchQuery: "hiring recruiting candidate interview offer job application resume role position" | sender: null | relevantTypes: "INCLUSIVE: anything substantively about hiring or recruiting - candidates, interviews, offers, job posts, recruiting threads" | intent: "discuss hiring/recruiting"
- "from Joe?" → searchQuery: "joe" | sender: "joe" | relevantTypes: "emails from a sender named Joe or address containing Joe" | intent: "find emails from sender Joe"
- "Brother from another mother, any email from cursor regarding payment?" → searchQuery: "cursor payment invoice billing subscription receipt charge" | sender: "cursor" | relevantTypes: "INCLUSIVE: emails from Cursor about payments/billing" | intent: "find Cursor payment emails"
- "is there any email frrrom notion in my inbox?" → searchQuery: "notion workspace docs productivity team" | sender: "notion" | relevantTypes: "STRICT: emails from Notion the company or addresses containing notion" | intent: "find emails from Notion"
- "any neeon mails about payment?" → searchQuery: "neon database postgres payment billing invoice subscription" | sender: "neon" | relevantTypes: "INCLUSIVE: emails from Neon about payments" | intent: "find Neon payment emails"

Return ONLY a JSON object in this exact format:
{
  "searchQuery": "comma- or space-separated semantic expansion terms (include synonyms)",
  "sender": "lowercase single-token sender name, or null if none",
  "relevantTypes": "STRICT or INCLUSIVE - followed by what to include/exclude",
  "intent": "one-line intent description"
}`;

        const understandingResponse = await createCompletionWithModelFallback(
          openai,
          {
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
          },
        );

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

            const llmSender =
              typeof parsed.sender === "string"
                ? parsed.sender.trim().toLowerCase()
                : "";
            if (
              llmSender.length > 1 &&
              llmSender.length <= 50 &&
              !llmSender.includes(" ") &&
              !senderTermBlocklist.has(llmSender)
            ) {
              senderTerm = llmSender;
            }

            if (
              senderTerm &&
              !understoodQuery.toLowerCase().includes(senderTerm.toLowerCase())
            ) {
              understoodQuery = `${senderTerm} ${understoodQuery}`.trim();
            }

            chatLog.log(
              `[Query Understanding] Original: "${userQuery}" â†’ Understood: "${understoodQuery}" | Intent: "${queryIntent}" | Sender: "${senderTerm}" (regex/LLM merged)`,
            );
          } catch (parseError) {
            chatLog.warn("Failed to parse query understanding:", parseError);
          }
        }
      } catch (understandingError) {
        chatLog.warn(
          "Query understanding failed, using original query:",
          understandingError,
        );
      }
    }

    const VECTOR_TOPUP_THRESHOLD = 5;

    if (!timeRangeSummaryActive) try {
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
          (email) => email.similarity >= VECTOR_SIMILARITY_THRESHOLD,
        );

        if (vectorSearchResults.length > 0) {
          relevantEmails = vectorSearchResults;
        }
      } catch (vectorError) {
        chatLog.log(
          "Vector search not available or failed, falling back to text search:",
          vectorError,
        );
      }

      if (relevantEmails.length < VECTOR_TOPUP_THRESHOLD) {
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

        const stopwords = new Set([
          "the", "a", "an", "and", "or", "but", "not", "is", "are", "was",
          "were", "be", "been", "being", "have", "has", "had", "do", "does",
          "did", "will", "would", "should", "could", "can", "may", "might",
          "must", "shall", "this", "that", "these", "those", "for", "with",
          "about", "regarding", "concerning", "any", "all", "some", "every",
          "each", "what", "which", "who", "whom", "whose", "when", "where",
          "why", "how", "there", "their", "they", "them", "from", "to", "of",
          "in", "on", "at", "by", "as", "into", "onto", "out", "over",
          "under", "again", "further", "then", "once", "email", "emails",
          "mail", "mails", "message", "messages", "inbox", "thread", "threads",
          "tell", "show", "find", "give", "say", "see", "look", "check",
          "search", "fetch", "get", "list", "want", "need", "please", "kindly",
          "hey", "hi", "hello", "yo", "dude", "bro", "brother", "man",
          "mate", "friend", "buddy", "actually", "really", "very", "much",
          "more", "less", "just", "only", "also", "too", "still", "yet",
          "already", "now", "later", "today", "yesterday", "tomorrow",
          "received", "receive", "got", "had", "have", "has",
        ]);
        const searchTerms = cleanQuery
          .split(/\s+/)
          .map((t) => t.replace(/[^\w@.-]/g, ""))
          .filter(
            (term) =>
              term.length > 2 &&
              term !== senderTerm.toLowerCase() &&
              !stopwords.has(term),
          );

        for (const term of searchTerms) {
          orConditions.push(
            { subject: { contains: term, mode: "insensitive" } },
            { bodySnippet: { contains: term, mode: "insensitive" } },
            { summary: { contains: term, mode: "insensitive" } },
            {
              from: {
                OR: [
                  { address: { contains: term, mode: "insensitive" } },
                  { name: { contains: term, mode: "insensitive" } },
                ],
              },
            },
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

        const existingIds = new Set(relevantEmails.map((e) => e.id));
        const textOnly = searchResults
          .filter((email) => !existingIds.has(email.id))
          .map((email) => ({
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
        relevantEmails = [...relevantEmails, ...textOnly].slice(0, 30);
      }

      storeSearchResults(userId, accountId, relevantEmails, userQuery);
    } catch (searchError) {
      chatLog.error("Search failed:", searchError);
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

    if (
      relevantEmails.length < VECTOR_TOPUP_THRESHOLD &&
      isHeuristicCategoryQuery
    ) {
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

        const existingIds = new Set(relevantEmails.map((e) => e.id));
        const categoryOnly = searchResults
          .filter((email) => !existingIds.has(email.id))
          .map((email) => ({
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
        relevantEmails = [...relevantEmails, ...categoryOnly].slice(0, 30);
        storeSearchResults(userId, accountId, relevantEmails, userQuery);
      }
    }

    let filteredEmails = relevantEmails.filter((email) => {
      const minSimilarity = isHeuristicCategoryQuery ? 0 : SIMILARITY_THRESHOLD;
      return email.similarity >= minSimilarity;
    });

    let skipLlmStrictFilter = timeRangeSummaryActive || senderTerm.length > 0;

    if (senderTerm.length > 0 && filteredEmails.length > 0) {
      const senderLower = senderTerm.toLowerCase();
      const senderMatched = filteredEmails.filter((email) => {
        const fromAddress = email.from.address?.toLowerCase() || "";
        const fromName = email.from.name?.toLowerCase() || "";
        return (
          fromAddress.includes(senderLower) || fromName.includes(senderLower)
        );
      });
      if (senderMatched.length > 0) {
        filteredEmails = senderMatched;
        chatLog.log(
          `[Chat] senderTerm "${senderTerm}" filtered ${filteredEmails.length} from-matched candidates from the pool`,
        );
      } else {
        filteredEmails = [];
      }
    }

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
      } else {
        const declineOnly = filteredEmails.filter((e) => {
          const t = hitsText(e);
          return declineTerms.some((term) => t.includes(term));
        });

        if (declineOnly.length > 0) {
          filteredEmails = declineOnly;
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
      }
    }

    const shouldRunLlmStrictFilter =
      !skipLlmStrictFilter &&
      filteredEmails.length > 0 &&
      env.OPENROUTER_API_KEY;

    const preStrictFilterEmails = [...filteredEmails];
    let softMatchMode = false;

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

        const lowerForFilter = userQuery.toLowerCase();
        const inclusivePhrasing =
          /\b(regarding|about|mention(ing|s)?|discuss(ing|es|ed)?|related\s+to|relating\s+to|anything\s+(on|about|regarding)|involv(ing|es|ed)|talk(s|ing|ed)?\s+about|reference[sd]?\s+to|touch(ing|es|ed)?\s+on)\b/.test(
            lowerForFilter,
          );
        const intentSaysStrict =
          typeof queryIntent === "string" && /\bSTRICT\b/i.test(queryIntent);
        const intentSaysInclusive =
          typeof queryIntent === "string" && /\bINCLUSIVE\b/i.test(queryIntent);
        const useInclusiveMode =
          intentSaysInclusive || (inclusivePhrasing && !intentSaysStrict);

        const filterPrompt = `The user asked: "${userQuery}"
${queryIntent ? `\nWhat the user is looking for: ${queryIntent}` : ""}
Mode: ${useInclusiveMode ? "INCLUSIVE" : "STRICT"}

Here are emails that were found by the search system:
${emailList}

Your task: Return the numbers (comma-separated) of emails that are relevant under the chosen Mode.

${useInclusiveMode
            ? `INCLUSIVE MODE rules:
- The user wants ANY email substantively about the topic, not just literal instances of it.
- INCLUDE: invites, confirmations, scheduling threads, agendas, recaps, follow-ups, related discussions, newsletters that meaningfully analyze the topic, emails where the topic is a real focus or thread.
- EXCLUDE: emails where the topic word appears once in totally unrelated content (e.g. a footer keyword, a single tangential reference in a different-subject email).
- When in doubt, INCLUDE. Missing a relevant match is worse than including a borderline one.
- It's OK and expected to return many results when many are relevant.`
            : `STRICT MODE rules:
- The email must BE an instance of what the user asked for, not merely mention it.
- Newsletters, blog posts, how-to guides, and productivity advice are NOT instances of the thing they describe:
   * A Notion newsletter "How to structure team meetings" is NOT a meeting invite.
   * A SaaS marketing email "Tips for managing flight bookings" is NOT a flight booking.
   * A productivity guide "10 ways to track orders" is NOT an order confirmation.
- "meetings" / "appointments": actual calendar invites, RSVPs, meeting confirmations, scheduled calls.
- "flights" / "travel": actual airline tickets, boarding passes, itineraries, hotel reservations.
- "orders" / "purchases": actual order confirmations, shipment notifications.
- "payments" / "receipts": actual transaction records, invoices, billing statements.
- If unsure, EXCLUDE.`}

Return format: Just numbers separated by commas, like: 1,3,5,7
If NONE qualify, return: 0`;

        const filterSystemPrompt = useInclusiveMode
          ? "You are an email relevance verifier in INCLUSIVE mode. The user phrased their question loosely (\"regarding\", \"about\", \"mention\"). Return the indices of every email substantively related to the topic - invites, confirmations, scheduling threads, agendas, recaps, follow-ups, related discussions. When in doubt, INCLUDE. Return ONLY comma-separated indices, or '0' if truly none qualify."
          : "You are an email relevance verifier in STRICT mode. Return ONLY the indices of emails that ARE instances of what the user asked for - not merely mention it. A 'Notion newsletter advising teams to schedule meetings' is NOT relevant to 'do I have meetings this week' because it's a productivity newsletter, not a meeting invite. Calendar invites, RSVPs, scheduled-call notifications, and explicit meeting confirmations ARE relevant. Be ruthless. Return ONLY comma-separated indices, or '0' if none qualify.";

        const filterResponse = await createCompletionWithModelFallback(openai, {
          messages: [
            { role: "system", content: filterSystemPrompt },
            { role: "user", content: filterPrompt },
          ],
          max_tokens: 100,
          temperature: 0,
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
        chatLog.log("AI filtering failed, using all results:", filterError);
      }

      if (filteredEmails.length === 0 && preStrictFilterEmails.length > 0) {
        filteredEmails = preStrictFilterEmails.slice(0, 5);
        softMatchMode = true;
        chatLog.log(
          `[Chat] strict filter emptied candidates; restored ${filteredEmails.length} as soft matches`,
        );
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
      const trimmedQuery = userQuery.trim();
      const isRobotSearchCommand =
        /^(find|search|show|list|fetch|retrieve|display|locate)\s+\S+/i.test(
          trimmedQuery,
        ) ||
        /^from\s+\S+/i.test(trimmedQuery) ||
        /^(any|all)\s+(unread|new|recent|important|emails?|messages?|mail|threads?)\b/i.test(
          trimmedQuery,
        );

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

      const categoryHint = isHeuristicCategoryQuery
        ? /\b(meeting|calendar|invite|appointment|rsvp|scheduled|call)\b/i.test(
          userQuery,
        )
          ? "If your meetings live on Google Calendar but no invite was emailed to you, I won't see them - check your calendar app directly."
          : /\b(flight|travel|trip|hotel|booking|itinerary|pnr|airline)\b/i.test(
            userQuery,
          )
            ? "Try the airline or booking site directly if the confirmation went to a different inbox."
            : /\b(payment|payments|receipt|invoice|subscription|upi|card|debit|charged|billing)\b/i.test(
              userQuery,
            )
              ? "If the charge was very recent it might not be indexed yet, or check the bank/biller directly."
              : "Try widening the date range or check the sending platform directly."
        : "Try different keywords or widen the date range.";

      const fallbackMsg = isRobotSearchCommand
        ? `I searched your indexed mail and didn't find anything matching "${trimmedQuery.slice(0, 160)}". ${categoryHint}`
        : `I couldn't find anything in your indexed mail to answer that. ${categoryHint}`;

      return structuredPlainResponse(fallbackMsg, {
        summary: "No matching threads found",
        actions: [categoryHint],
        threads: [],
      });
    }

    const systemPrompt = buildInboxBrainPrompt({
      emailContext,
      queryIntent,
      explainableMode,
      founderDemo,
      softMatchMode,
    });

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
        maxRetries: 0,
      });

      const inboxBrainModelChain = [
        process.env.INBOX_BRAIN_MODEL?.trim(),
        ...REASONING_MODEL_CHAIN,
      ].filter(Boolean) as string[];

      let stream: Awaited<ReturnType<typeof openai.chat.completions.create>> | null = null;
      let lastModelErr: unknown = null;
      let activeModel: string = inboxBrainModelChain[0] ?? "anthropic/claude-sonnet-4-6";
      for (const candidate of inboxBrainModelChain) {
        if (req.signal.aborted) throw new DOMException("Aborted", "AbortError");
        try {
          stream = await openai.chat.completions.create(
            {
              model: candidate,
              messages: [{ role: "system", content: systemPrompt }, ...messages],
              max_tokens: 1000,
              temperature: 0.3,
              stream: true,
            },
            { signal: req.signal },
          );
          activeModel = candidate;
          break;
        } catch (err) {
          lastModelErr = err;
          const errName = (err as { name?: string } | null)?.name;
          if (errName === "AbortError" || req.signal.aborted) throw err;
          const status = (err as { status?: number } | null)?.status;
          if (status !== 404 && status !== 400) throw err;
        }
      }
      if (!stream) throw lastModelErr ?? new Error("No inbox-brain model available");

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
            chatLog.error("Streaming error:", error);
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
              model: activeModel,
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
      chatLog.error("OpenRouter error:", openaiError);
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
    chatLog.error("[Chat API] Unhandled error:", error);

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

import { makeTagLogger } from "@/lib/logging/console-shim";
const chatLog = makeTagLogger("api.chat");