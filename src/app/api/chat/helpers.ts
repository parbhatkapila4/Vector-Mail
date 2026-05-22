import OpenAI from "openai";
import { env } from "@/env.js";
import {
  appendStructuredJsonFence,
  extractInboxAssistantTurn,
  type InboxAssistantTurn,
} from "@/lib/inbox-chat-structured";
import { buildSourcesFooter } from "@/lib/explainability/sources";
import { recordUsage } from "@/lib/ai-usage";

export interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  accountId: string;
  explainableMode?: boolean;
  founderDemo?: boolean;
}

export type SearchScopeDecision =
  | "email_search_or_summary"
  | "compose_or_send_email"
  | "out_of_scope";

export const RECENT_DAYS = 365;
export const SIMILARITY_THRESHOLD = 0.1;
export const VECTOR_SIMILARITY_THRESHOLD = 0.18;
export const REASONING_MODEL_CHAIN = [
  "anthropic/claude-sonnet-4.6",
  "anthropic/claude-sonnet-4-6",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-sonnet-4-5",
  "anthropic/claude-3.7-sonnet",
  "anthropic/claude-3.5-haiku",
] as const;

export async function createCompletionWithModelFallback(
  openai: OpenAI,
  params: Omit<Parameters<OpenAI["chat"]["completions"]["create"]>[0], "model" | "stream"> & {
    stream?: false;
  },
  models: readonly string[] = REASONING_MODEL_CHAIN,
  requestOptions?: Parameters<OpenAI["chat"]["completions"]["create"]>[1],
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  let lastError: unknown = null;
  for (const model of models) {
    try {
      const completion = (await openai.chat.completions.create(
        { ...params, model, stream: false },
        requestOptions,
      )) as OpenAI.Chat.Completions.ChatCompletion;
      return completion;
    } catch (err) {
      lastError = err;
      const errName = (err as { name?: string } | null)?.name;
      if (errName === "AbortError") throw err;
      const status = (err as { status?: number } | null)?.status;
      if (status !== 404 && status !== 400) throw err;
    }
  }
  throw lastError ?? new Error("All models in fallback chain rejected the request");
}

export function structuredPlainResponse(
  body: string,
  turn: InboxAssistantTurn,
) {
  return new Response(appendStructuredJsonFence(body, turn), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

interface TurnSingleThreadArgs {
  summaryLine: string;
  actionBullets: string[];
  threadId?: string;
  chipLabel: string;
  reason?: string;
  confidence?: "High" | "Medium" | "Low";
}

export function turnSingleThread(args: TurnSingleThreadArgs): InboxAssistantTurn {
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

export function turnFromFilteredEmails(
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
    confidence: keywordRe.test(`${e.subject} ${e.bodySnippet ?? ""}`)
      ? ("High" as const)
      : ("Medium" as const),
  }));
  return {
    summary: summary.slice(0, 500),
    actions: actions.slice(0, 5),
    threads,
  };
}

export function removeAllSymbols(text: string): string {
  text = text.replace(/\*+/g, "");
  text = text.replace(/^\s*-\s+/gm, "");
  text = text.replace(/\u2022/g, "");
  text = text.replace(/^\s*[\u2022\u2023\u2026\u25AA\u25AB\u25CB\u25CF\u25E6]\s+/gm, "");
  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");
  return text;
}

export function appendExplainableFooter<
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

export function parseTimeRangeSummaryQuery(
  query: string,
): { days: number } | null {
  const q = query.toLowerCase().trim();

  const hasOverviewIntent =
    /\b(summari[sz]e|summary|summaries|theme|themes|topics|overview|recap|digest|whats\s+in|what'?s\s+in|what\s+(arrived|came|did\s+i\s+get|do\s+i\s+have|happened))\b/.test(
      q,
    );

  const hasAnalyticalIntent =
    /\b(anything|something)\s+(odd|weird|unusual|suspicious|spooky|fishy|off|wrong|strange|interesting|important|urgent|notable|concerning|alarming|worth)\b/.test(
      q,
    ) ||
    /\b(does|do)\s+anything\s+(look|feel|seem|appear)\s+(odd|weird|spooky|off|suspicious|unusual|wrong|fishy|strange|out\s+of\s+place)\b/.test(
      q,
    ) ||
    /\b(what\s+(stands?\s+out|catches\s+your\s+eye|do\s+you\s+notice|should\s+i\s+(know|worry|do|pay\s+attention\s+to|look\s+at)))\b/.test(
      q,
    ) ||
    /\b(any\s+(red\s+flags|patterns|concerns|issues|problems|risks|surprises|anomalies))\b/.test(
      q,
    ) ||
    /\b(scan|review|skim|glance\s+at|look\s+over|look\s+through|go\s+through)\s+(my\s+)?(inbox|mail|emails?|messages?)\b/.test(
      q,
    ) ||
    /\b(spot|find)\s+(anything|something)\b/.test(q);

  const hasRankIntent =
    /\b(rank|stack[\s-]?rank|priorit(?:y|ies|ize|isation|ization))\b/.test(q) ||
    /\bwhat\s+(matters|is\s+important|should\s+i\s+(?:do|focus|read|reply)|deserves?\s+(?:my\s+)?attention)\b/.test(
      q,
    ) ||
    /\b(top|most)\s+(?:\d+\s+)?(?:important|urgent|critical|priorities|things|emails|threads)\b/.test(
      q,
    ) ||
    /\b(focus\s+(?:on|list)|today'?s\s+(?:priorities|focus|stack|brief)|founder\s+view)\b/.test(
      q,
    );

  if (!hasOverviewIntent && !hasAnalyticalIntent && !hasRankIntent) return null;

  const numericRange = q.match(
    /\b(?:last|past|previous)\s+(\d{1,3})\s+(day|days|week|weeks|month|months)\b/,
  );
  if (numericRange) {
    const n = parseInt(numericRange[1]!, 10);
    const unit = numericRange[2]!;
    const mult = unit.startsWith("week") ? 7 : unit.startsWith("month") ? 30 : 1;
    const days = Math.min(365, Math.max(1, n * mult));
    return { days };
  }

  if (/\b(today|so\s+far\s+today)\b/.test(q)) return { days: 1 };
  if (/\byesterday\b/.test(q)) return { days: 2 };
  if (/\b(this\s+week|past\s+week|last\s+week|over\s+the\s+week)\b/.test(q))
    return { days: 7 };
  if (
    /\b(this\s+month|past\s+month|last\s+month|over\s+the\s+month)\b/.test(q)
  )
    return { days: 30 };
  if (/\b(this\s+year|past\s+year|last\s+year)\b/.test(q)) return { days: 365 };
  if (/\b(recent|recently|lately)\b/.test(q)) return { days: 14 };

  if (hasAnalyticalIntent && !hasOverviewIntent) return { days: 30 };
  if (hasRankIntent && !hasOverviewIntent) return { days: 7 };
  return { days: 7 };
}

export function parseInboxStatsQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  return (
    /\bhow\s+many\s+(emails?|mails?|messages?|threads?)\b/.test(q) ||
    /\bhow\s+many\s+can\s+you\s+(read|see|access|find)\b/.test(q) ||
    /\b(total|count)\s+(of\s+)?(my\s+|the\s+)?(emails?|mails?|messages?|inbox)\b/.test(
      q,
    ) ||
    /\b(emails?|mails?|messages?)\s+(in\s+total|total|count)\b/.test(q) ||
    /\bnumber\s+of\s+(emails?|mails?|messages?|threads?)\b/.test(q)
  );
}

export function isExplicitComposeOrSendRequest(query: string): boolean {
  const lower = query.toLowerCase();
  const hasComposeVerb = /\b(write|draft|compose|generate|create|send)\b/.test(lower);
  const hasEmailContext = /\b(email|mail|message|thread)\b/.test(lower);
  if (!hasComposeVerb) return false;
  return hasEmailContext;
}

export function parseReplyIntent(query: string): { body: string } | null {
  const q = query.trim();
  if (q.length < 12) return null;

  if (
    /^\s*(?:what|how|should|when|why|who|where)\b/i.test(q) ||
    /\b(should\s+i|do\s+i\s+need\s+to)\s+(reply|respond|send)\b/i.test(q)
  ) {
    return null;
  }

  const triggerA =
    /^\s*(?:can\s+you\s+|could\s+you\s+|please\s+|pls\s+|just\s+|kindly\s+)?(?:reply|respond|send(?:\s+back)?|write\s+back|shoot\s+back|hit\s+back)\b/i;
  const triggerB =
    /^\s*(?:can\s+you\s+|could\s+you\s+|please\s+|pls\s+|just\s+|kindly\s+)?(?:tell|say(?:\s+back)?|message|ping)\s+(?:to\s+)?(?:them|him|her|'?em|the\s+(?:sender|person|guy|gal|team|user)|this\s+(?:guy|person|sender)|that\s+(?:guy|person|sender))\b/i;

  let triggerMatch = q.match(triggerA);
  let strictAddresseeAlreadyConsumed = false;
  if (!triggerMatch) {
    triggerMatch = q.match(triggerB);
    if (!triggerMatch) return null;
    strictAddresseeAlreadyConsumed = true;
  }

  let tail = q.slice(triggerMatch[0].length);

  if (!strictAddresseeAlreadyConsumed) {
    tail = tail.replace(
      /^\s*(?:to\s+)?(?:them|him|her|'?em|the\s+(?:sender|person|guy|gal|team|user)|this\s+(?:email|thread|message|guy|person|sender|one)|that\s+(?:email|thread|message|one|guy|person)|the\s+(?:email|thread|message))\b/i,
      "",
    );
  }

  tail = tail.replace(
    /^\s*(?:with|saying|that|:|-|-|,)\s+/i,
    "",
  );

  const beforeQuoteStrip = tail;
  tail = tail.replace(/^\s*["'“‘«「]\s*/, "").replace(/\s*["'”’»」]\s*$/, "");
  const wasQuoted = tail !== beforeQuoteStrip.replace(/^\s+|\s+$/g, "");

  tail = tail.trim().replace(/^[,;:.\--]+\s*/, "").replace(/\s*[,;:]+$/, "");

  if (tail.length === 0) return null;

  if (!wasQuoted) {
    if (tail.length < 10) return null;
    if (tail.split(/\s+/).length < 2) return null;
  }

  return { body: tail };
}

export function resolveTargetThreadIdFromMessages(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  storedEmails: Array<{ id: string; threadId?: string }> | null,
): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m || m.role !== "assistant") continue;
    const turn = extractInboxAssistantTurn(m.content);
    if (turn && turn.threads.length > 0) {
      const tid = turn.threads[0]!.threadId;
      if (tid) return tid;
    }
  }
  if (storedEmails && storedEmails.length > 0) {
    for (const e of storedEmails) {
      if (e.threadId) return e.threadId;
    }
  }
  return null;
}

function openRouterClient(): OpenAI | null {
  if (!env.OPENROUTER_API_KEY) return null;
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
      "X-Title": "VectorMail AI",
    },
  });
}

export async function classifySearchScopeWithLlm(
  query: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  hasStoredResults: boolean,
): Promise<SearchScopeDecision | null> {
  const openai = openRouterClient();
  if (!openai) return null;

  try {
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

    const completion = await createCompletionWithModelFallback(openai, {
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
    apiLog.warn("[Chat] Scope classification failed:", error);
    return null;
  }
}

export async function generateGeneralAssistanceReply(
  query: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userId: string,
  accountId: string | null,
): Promise<string | null> {
  const openai = openRouterClient();
  if (!openai) return null;

  try {
    const completion = await createCompletionWithModelFallback(openai, {
      messages: [
        {
          role: "system",
          content:
            [
              "You are Inbox Brain, a helpful assistant embedded in an email product called VectorMail.",
              "",
              "CONTEXT YOU'RE IN:",
              "- The search system already tried to find emails for the user's latest question and returned ZERO matches from their indexed inbox.",
              "- That means: the answer to a literal 'do I have X' question is most likely 'no, not in indexed mail' - but you should still be useful about it.",
              "",
              "ZERO-FABRICATION RULE (highest priority - violating this is unacceptable):",
              "- You can only see the messages in this conversation transcript. NO email data is attached to this request.",
              "- NEVER invent specific email content. Do not make up sender names, sender email addresses, subjects, dates, times, locations, attachment filenames, meeting agendas, body text, or any other email-specific detail. Not as examples, not as 'here's what it might look like', not ever.",
              "- You MAY refer to emails that were explicitly listed earlier in this conversation by the assistant or user (i.e. visible in the messages above). You may NOT extend, embellish, or add details beyond what's already there.",
              "",
              "HOW TO ANSWER 'DO I HAVE ANY X?' QUESTIONS WHEN SEARCH RETURNED NOTHING:",
              "- Be honest and direct: 'I don't see any [meetings / payments / flights / etc.] in your indexed mail for [this week / next week / that timeframe].'",
              "- Then add the SINGLE most useful next step. Examples:",
              "  * Meetings/calendar question → 'If your meetings live on Google Calendar and no invite was emailed to you, I can't see them - your calendar app is the source of truth there. Want me to look for any recent meeting-related emails from a specific person instead?'",
              "  * Flight/travel → 'Confirmations sometimes go to a secondary inbox or the airline app. Try the airline or booking site directly, or tell me the airline/booking ref to search for.'",
              "  * Payment/receipt → 'If the charge was very recent (last few hours) it may not be indexed yet. Otherwise check the bank or biller directly. Want me to look for failed payments or a specific merchant?'",
              "  * Generic 'find X' → suggest narrower search terms or a wider date range, OR ask one clarifying question.",
              "- Keep it to 2-4 sentences. No corporate softening. No 'I apologize'. Talk like a sharp coworker.",
              "",
              "HARD RULES:",
              "- NEVER claim you cannot 'search emails', 'access the inbox', or anything similar in a refusal way. The surrounding system DID search; it returned zero.",
              "- NEVER tell the user to use the search bar themselves. If you want them to try a different search, suggest the exact phrasing they can type next in THIS chat.",
              "- NEVER start with 'I apologize' or 'As an AI assistant'.",
              "- It IS allowed (and good) to suggest external sources (calendar app, bank, airline) when the email channel genuinely doesn't have the data the user is asking for.",
              "",
              "THE ONLY THING YOU REFUSE:",
              "- If the user asks you to draft, compose, write, or send an actual email, briefly say drafting and sending happen in AI Buddy (the sidebar) and stop. Don't apologize.",
              "",
              "Otherwise: answer using ONLY the conversation context above and your general knowledge. Be confident, practical, plain text. No markdown headers, no bullet symbols at line starts.",
            ].join("\n"),
        },
        ...messages.slice(-8),
        { role: "user", content: query },
      ],
      max_tokens: 500,
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

    return completion.choices[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    apiLog.warn("[Chat] General fallback response failed:", error);
    return null;
  }
}

export function isContextualEmailFollowUp(
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

export function isFindOrSummarizeQuery(query: string): boolean {
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

import { makeTagLogger } from "@/lib/logging/console-shim";
const apiLog = makeTagLogger("api.chat-helpers");