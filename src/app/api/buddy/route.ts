import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { env } from "@/env.js";
import { db } from "@/server/db";
import { Account } from "@/lib/accounts";
import { appendVectorMailSignature } from "@/lib/vectormail-signature";
import { withRequestId } from "@/lib/logging/with-request-id";
import { checkDailyCap, recordUsage } from "@/lib/ai-usage";
import { checkUserRateLimit } from "@/lib/rate-limit";
import {
  containsOutgoingViolation,
  isOutgoingContentBlockedError,
} from "@/lib/outgoing-content-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    emailData?: {
      subject: string;
      body: string;
      suggestions?: Array<{ subject: string; body: string }>;
    };
  }>;
}

function isEmailRequest(
  message: string,
  previousMessages?: Array<{
    role: string;
    emailData?: { subject: string; body: string };
  }>,
): boolean {
  const lowerMessage = message.toLowerCase().trim();
  if (!lowerMessage) return true;
  const isAdviceQuestion =
    lowerMessage.endsWith("?") ||
    /^(?:what|why|how|when|where|who|should\s+i|can\s+i|do\s+you|does\s+(?:it|that)|is\s+(?:it|this|that)|are\s+(?:you|we)|advise\s+me|tell\s+me\s+about|tips?\s+for|best\s+way\s+to|recommend(?:ation)?s?\s+for)\b/i.test(
      lowerMessage,
    );

  if (isAdviceQuestion) {
    if (previousMessages && previousMessages.length > 0) {
      const hasPreviousEmail = previousMessages.some(
        (msg) => msg.role === "assistant" && msg.emailData,
      );
      if (hasPreviousEmail) {
        const regenerationKeywords = [
          "shorter",
          "longer",
          "shorten",
          "expand",
          "elaborate",
          "rewrite",
          "redo",
          "regenerate",
          "revise",
          "another",
          "different",
          "better",
          "improve",
          "change the tone",
          "more formal",
          "less formal",
          "friendlier",
          "warmer",
          "harsher",
          "softer",
          "stronger",
          "more concise",
          "more detailed",
          "more polite",
        ];
        if (regenerationKeywords.some((k) => lowerMessage.includes(k))) {
          return true;
        }
      }
    }
    return false;
  }

  return true;
}

function stripAugmentation(content: string): string {
  const marker = "\n\nAdditional instructions for this draft:\n";
  const idx = content.indexOf(marker);
  return idx === -1 ? content : content.slice(0, idx);
}

function isAbusiveContent(message: string): boolean {
  const lower = message.toLowerCase();
  const directAttacks = [
    "kill yourself",
    "kys",
    "you should die",
    "you're useless",
    "you are useless",
    "you suck",
    "i hate you",
    "shut the fuck up",
    "fuck you",
    "screw you",
    "stupid bot",
    "dumb bot",
    "retard",
    "retarded",
  ];
  if (directAttacks.some((p) => lower.includes(p))) return true;

  const slurs = [
    "n-word",
    "nigger",
    "faggot",
    "tranny",
    "kike",
    "spic",
    "chink",
  ];
  if (slurs.some((s) => lower.includes(s))) return true;

  return false;
}

function isClearlyOffTopic(message: string): boolean {
  const text = message.toLowerCase().trim();
  if (text.length === 0) return false;

  const offTopicPatterns: Array<RegExp> = [
    /\b(?:multiplication|times)\s+table\b/i,
    /\btable\s+of\s+\d+/i,
    /\bsolve\s+(?:this|the|for|me|equation|problem|it)\b/i,
    /^calculate\s+/i,
    /what\s+is\s+\d+\s*[+\-*x×\/]\s*\d+/i,
    /\bfactorial\b/i,
    /\b(?:differentiate|integral|derivative|matrix|determinant)\b/i,
    /\b(?:quadratic|cubic)\s+(?:equation|formula)\b/i,

    /\bwrite\s+(?:me\s+)?(?:a\s+)?(?:function|method|class|program|script|algorithm)\b/i,
    /\b(?:python|javascript|typescript|java|c\+\+|rust|golang|swift|kotlin|ruby|php)\s+(?:code|function|script|class|snippet|program)\b/i,
    /\bfix\s+(?:this|my|the)\s*(?:bug|error|code|syntax|regex)\b/i,
    /\bdebug\s+(?:this|my|the)\b/i,
    /\bregex\s+(?:for|to|that)\b/i,
    /\b(?:sql|nosql)\s+query\b/i,
    /\bunit\s+test\s+(?:for|in)\b/i,

    /\brecipe\s+for\b/i,
    /\bhow\s+(?:do\s+i\s+|to\s+)?(?:cook|bake|grill|fry)\b/i,
    /\bingredients?\s+(?:for|of)\b/i,

    /\btell\s+me\s+a\s+(?:joke|story|poem|riddle|fun\s+fact|secret)\b/i,
    /\bwrite\s+(?:me\s+)?a\s+(?:joke|story|poem|song|lyric|rap|haiku|sonnet)\b/i,
    /\bgive\s+me\s+a\s+joke\b/i,
    /\brandom\s+fact\b/i,

    /\bwhat(?:'s|\s+is)\s+the\s+(?:capital|population|currency|temperature|height|distance|speed|weight)\s+of\b/i,
    /\bwho(?:'s|\s+is|\s+was)\s+(?:the\s+)?(?:president|prime\s+minister|king|queen|founder|inventor)\s+of\b/i,
    /\bwhen\s+(?:did|was)\s+.+\s+(?:born|die|founded|invented|discovered)\b/i,

    /\b(?:weather|forecast|temperature)\s+(?:in|at|for|tomorrow|today|this)\b/i,
    /\bstock\s+(?:price|quote)\b/i,
    /\b(?:bitcoin|crypto|ethereum|btc|eth)\s+(?:price|quote)\b/i,
    /\bcurrent\s+news\b/i,
    /\bsports\s+score\b/i,
  ];

  return offTopicPatterns.some((p) => p.test(text));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderInlineHtml(text: string): string {
  return text
    .split(/(\*\*.*?\*\*)/g)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }
      return escapeHtml(part);
    })
    .join("");
}

function plainBodyToHtml(body: string): string {
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+$/, ""))
    .filter((p) => p.trim().length > 0);

  const blocks = paragraphs.map((para) => {
    const lines = para.split("\n");
    const isOrderedList =
      lines.length > 1 &&
      lines.every((l) => /^(\d+\.|[a-z]\.)\s+\S/.test(l.trim()));
    if (isOrderedList) {
      const items = lines
        .map((l) => l.trim().replace(/^(\d+\.|[a-z]\.)\s+/, ""))
        .filter((l) => l.length > 0)
        .map(
          (l) =>
            `<li style="margin: 0 0 6px 0; line-height: 1.6;">${renderInlineHtml(l)}</li>`,
        )
        .join("");
      return `<ol style="margin: 0 0 14px 0; padding-left: 22px;">${items}</ol>`;
    }
    const formatted = lines
      .map((l) => renderInlineHtml(l))
      .join("<br>");
    return `<p style="margin: 0 0 14px 0; line-height: 1.6;">${formatted}</p>`;
  });

  return blocks.join("");
}

function extractEmailAddresses(text: string): string[] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailRegex);
  return matches || [];
}

function isSendEmailRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const sendKeywords = [
    "send",
    "send this",
    "send it",
    "send the email",
    "send that",
    "send to",
    "send this email",
    "send that email",
    "send it to",
    "send this to",
    "send that to",
    "can you send",
    "please send",
    "send the",
  ];
  const hasEmail = extractEmailAddresses(message).length > 0;

  const hasSendKeyword = sendKeywords.some((keyword) =>
    lowerMessage.includes(keyword),
  );
  return hasEmail && hasSendKeyword;
}

async function extractEmailFromConversation(
  messages: Array<{
    role: string;
    content: string;
    emailData?: { subject: string; body: string };
  }>,
  openai: OpenAI,
  options?: { userId?: string; accountId?: string },
): Promise<{ subject: string; body: string } | null> {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (
      msg &&
      msg.role === "assistant" &&
      msg.emailData &&
      msg.emailData.subject &&
      msg.emailData.body
    ) {
      return {
        subject: msg.emailData.subject,
        body: msg.emailData.body,
      };
    }
  }

  const conversationContext = messages
    .slice(-20)
    .map((msg) => {
      if (!msg) return "";
      let content = `${msg.role}: ${msg.content}`;

      if (msg.emailData) {
        content += `\n[Email Data Available]\nSubject: ${msg.emailData.subject}\nBody: ${msg.emailData.body}`;
      }
      return content;
    })
    .filter((content) => content !== "")
    .join("\n\n");

  const extractionPrompt = `Based on the conversation below, extract the MOST RECENT email that was generated. Look for the subject line and complete email body that was created by the assistant.

IMPORTANT: 
- Look for the most recent email generation in the conversation
- The email should have been generated by the assistant in response to a user request
- Extract the complete subject and body text
- If the conversation shows "Here's your draft:" or similar, the email details should follow

Return ONLY valid JSON in this exact format:
{
  "subject": "Email subject here",
  "body": "Complete email body here"
}

If no email can be found, return: {"subject": null, "body": null}

Conversation:
${conversationContext}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-haiku",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts email information from conversations. You must find the most recently generated email with both subject and body. Return ONLY valid JSON, no other text.",
        },
        {
          role: "user",
          content: extractionPrompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    if (options?.userId) {
      const u = completion.usage;
      recordUsage({
        userId: options.userId,
        accountId: options.accountId,
        operation: "buddy",
        inputTokens: u?.prompt_tokens ?? 0,
        outputTokens: u?.completion_tokens ?? 0,
        model: completion.model ?? undefined,
      });
    }

    const content = completion.choices[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(content);
      if (
        parsed.subject &&
        parsed.body &&
        parsed.subject !== "null" &&
        parsed.body !== "null" &&
        parsed.subject.trim() !== "" &&
        parsed.body.trim() !== ""
      ) {
        return { subject: parsed.subject, body: parsed.body };
      }
    } catch { }
  } catch (error) {
    buddyLog.error("Error extracting email from conversation:", error);
  }

  return null;
}

function removeAllSymbols(text: string): string {
  text = text.replace(/\*+/g, "");

  text = text.replace(/^\s*-\s+/gm, "");

  text = text.replace(/\u2022/g, "");

  text = text.replace(/^\s*[\u2022\u2023\u2026\u25AA\u25AB\u25CB\u25CF\u25E6]\s+/gm, "");

  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");

  return text;
}

function enforceEmailFormatting(text: string): string {
  if (!text || typeof text !== "string") return text;

  text = text.replace(/([.!?])\s*\n([A-Z][a-z])/g, "$1\n\n$2");
  text = text.replace(/([a-z0-9])\s*\n([A-Z][a-z])/g, "$1\n\n$2");

  let paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p);

  if (paragraphs.length === 1) {
    const singlePara = paragraphs[0] || "";
    const sentenceCount = (singlePara.match(/[.!?]+/g) || []).length;

    if (sentenceCount > 2) {
      paragraphs = [];

      const greetingMatch = singlePara.match(
        /^((?:Dear|Hi|Hello)\s+[^,]+,\s*|[A-Z][a-z]+,\s*)/i,
      );
      let processedText = singlePara;
      if (greetingMatch) {
        paragraphs.push(greetingMatch[0].trim());
        processedText = singlePara.substring(greetingMatch[0].length).trim();
      }

      let closing = "";
      const closingPatterns = [
        /(Best regards|Sincerely|Thank you|Regards|Kind regards),?\s*[A-Z][a-z\s]*$/i,
        /(Best regards|Sincerely|Thank you|Regards|Kind regards),/i,
      ];

      for (const pattern of closingPatterns) {
        const closingMatch = processedText.match(pattern);
        if (closingMatch) {
          closing = closingMatch[0].trim();
          processedText = processedText
            .substring(0, processedText.length - closingMatch[0].length)
            .trim();
          break;
        }
      }

      const sentences: string[] = processedText.match(/[^.!?]+[.!?]+/g) || [];

      if (sentences.length === 0) {
        const manualSplit = processedText.split(/([.!?]+\s+)/);
        for (let i = 0; i < manualSplit.length; i += 2) {
          const sentence = (manualSplit[i] || "") + (manualSplit[i + 1] || "");
          if (sentence.trim()) sentences.push(sentence.trim());
        }
      }

      let currentPara = "";
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed || trimmed.length < 5) continue;

        const currentSentenceCount = (currentPara.match(/[.!?]+/g) || [])
          .length;
        if (
          currentSentenceCount >= 2 ||
          currentPara.length + trimmed.length > 250
        ) {
          if (currentPara.trim()) {
            paragraphs.push(currentPara.trim());
          }
          currentPara = trimmed;
        } else {
          currentPara += (currentPara ? " " : "") + trimmed;
        }
      }
      if (currentPara.trim()) {
        paragraphs.push(currentPara.trim());
      }

      if (closing) paragraphs.push(closing);
    }
  }

  const finalParagraphs: string[] = [];

  for (const para of paragraphs) {
    if (!para) continue;

    const isGreeting = /^(Dear|Hi|Hello)\s/i.test(para);
    const isClosing =
      /^(Best regards|Sincerely|Thank you|Regards|Kind regards),/i.test(para);
    const isList = /^(\d+\.|[a-z]\.)\s/.test(para);

    if (isGreeting || isClosing || isList) {
      finalParagraphs.push(para);
      continue;
    }

    const sentenceCount = (para.match(/[.!?]+/g) || []).length;
    if (sentenceCount >= 2 || para.length > 250) {
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [];

      if (sentences.length > 1) {
        let currentPara = "";
        for (const sentence of sentences) {
          const trimmed = sentence.trim();
          if (!trimmed) continue;

          const currentSentenceCount = (currentPara.match(/[.!?]+/g) || [])
            .length;
          if (
            currentSentenceCount >= 2 ||
            currentPara.length + trimmed.length > 250
          ) {
            if (currentPara.trim()) {
              finalParagraphs.push(currentPara.trim());
            }
            currentPara = trimmed;
          } else {
            currentPara += (currentPara ? " " : "") + trimmed;
          }
        }
        if (currentPara.trim()) {
          finalParagraphs.push(currentPara.trim());
        }
      } else {
        finalParagraphs.push(para);
      }
    } else {
      finalParagraphs.push(para);
    }
  }

  let result = finalParagraphs.join("\n\n");
  result = result.replace(/\n{3,}/g, "\n\n").trim();

  return result;
}

function normalizeEmailFormatting(text: string): string {
  if (!text || typeof text !== "string") return text;

  const newlineCount = (text.match(/\n/g) || []).length;
  const hasVeryFewNewlines = newlineCount < 3;
  const hasMultipleSentences = (text.match(/[.!?]+/g) || []).length > 2;

  if (hasVeryFewNewlines && hasMultipleSentences) {
    let processedText = text.trim();
    const paragraphs: string[] = [];

    const greetingMatch = processedText.match(
      /^((?:Dear|Hi|Hello)\s+[^,]+,\s*|[A-Z][a-z]+,\s*)/i,
    );
    if (greetingMatch) {
      paragraphs.push(greetingMatch[0].trim());
      processedText = processedText.substring(greetingMatch[0].length).trim();
    }

    let closing = "";
    const closingPatterns = [
      /(Best regards|Sincerely|Thank you|Regards|Kind regards),\s*[^\n]*$/i,
      /(Best regards|Sincerely|Thank you|Regards|Kind regards),?\s*[A-Z][a-z]+\s*$/i,
    ];

    for (const pattern of closingPatterns) {
      const closingMatch = processedText.match(pattern);
      if (closingMatch) {
        closing = closingMatch[0].trim();
        processedText = processedText
          .substring(0, processedText.length - closingMatch[0].length)
          .trim();
        break;
      }
    }

    const sentenceRegex = /[^.!?]+[.!?]+(?=\s|$)/g;
    const sentences: string[] = processedText.match(sentenceRegex) || [];

    if (sentences.length === 0) {
      const simpleSplit = processedText.split(/([.!?]+\s+)/);
      for (let i = 0; i < simpleSplit.length; i += 2) {
        const sentence = (simpleSplit[i] || "") + (simpleSplit[i + 1] || "");
        if (sentence.trim()) sentences.push(sentence.trim());
      }
    }

    let currentPara = "";
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed || trimmed.length < 5) continue;

      const currentSentenceCount = (currentPara.match(/[.!?]+/g) || []).length;

      if (
        currentSentenceCount >= 2 ||
        (currentPara.length + trimmed.length > 250 && currentPara.length > 0)
      ) {
        if (currentPara.trim()) {
          paragraphs.push(currentPara.trim());
        }
        currentPara = trimmed;
      } else {
        currentPara += (currentPara ? " " : "") + trimmed;
      }
    }
    if (currentPara.trim()) {
      paragraphs.push(currentPara.trim());
    }

    if (closing) paragraphs.push(closing.trim());

    text = paragraphs.join("\n\n");
  }

  text = text.replace(/[ \t]+$/gm, "");

  text = text.replace(/\n{3,}/g, "\n\n");

  text = text.replace(/([.!?])\s*\n([A-Z][a-z])/g, "$1\n\n$2");

  text = text.replace(/([a-z]),\s*\n([A-Z][a-z])/g, "$1,\n\n$2");

  text = text.replace(/([^\n])\n(\d+\.\s)/g, "$1\n\n$2");

  text = text.replace(/([^\n])\n([a-z]\.\s)/g, "$1\n\n$2");

  text = text.replace(/([a-z0-9]\.\s[^\n]+)\n([A-Z][a-z])/g, "$1\n\n$2");

  text = text.replace(
    /([^\n])\n([A-Z][A-Za-z\s]{2,40})\n([A-Z][a-z])/g,
    "$1\n\n$2\n\n$3",
  );

  text = text.replace(/([A-Z][A-Za-z\s]{2,40})\n([A-Z][a-z])/g, "$1\n\n$2");

  text = text.replace(/(\d+\.\s[A-Z][^\n]+)\n([A-Z][a-z])/g, "$1\n\n$2");

  text = text.replace(/([a-z.!?])\s*\n([A-Z][a-z])/g, "$1\n\n$2");

  text = text.replace(/(Dear [^,]+,\s*)\n([A-Z])/g, "$1\n\n$2");
  text = text.replace(/(Hi [^,]+,\s*)\n([A-Z])/g, "$1\n\n$2");
  text = text.replace(/(Hello [^,]+,\s*)\n([A-Z])/g, "$1\n\n$2");

  text = text.replace(
    /([^\n])\n(Best regards|Sincerely|Thank you|Regards|Kind regards),/g,
    "$1\n\n$2,",
  );

  text = text.replace(/([a-z0-9.!?])\n([A-Z][a-z])/g, "$1\n\n$2");

  text = text.replace(/\n{1}\n{1,}/g, "\n\n");

  text = text.trim();

  const initialParagraphs = text.split("\n\n").filter((p) => p.trim());
  const reconstructedParagraphs: string[] = [];

  for (const para of initialParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const isGreeting = /^(Dear|Hi|Hello)\s/i.test(trimmed);
    const isClosing =
      /^(Best regards|Sincerely|Thank you|Regards|Kind regards),/i.test(
        trimmed,
      );
    const isList = /^(\d+\.|[a-z]\.)\s/.test(trimmed);

    if (isGreeting || isClosing) {
      reconstructedParagraphs.push(trimmed);
      continue;
    }

    if (isList) {
      reconstructedParagraphs.push(trimmed);
      continue;
    }

    if (trimmed.length > 400) {
      const sentences = trimmed.match(
        /[^.!?]+[.!?]+(?:\s+[A-Z][^.!?]*[.!?]+)*/g,
      );
      if (sentences && sentences.length > 1) {
        let currentPara = "";
        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();
          if (!trimmedSentence) continue;

          if (currentPara.length + trimmedSentence.length > 300) {
            if (currentPara.trim()) {
              reconstructedParagraphs.push(currentPara.trim());
            }
            currentPara = trimmedSentence;
          } else {
            currentPara += (currentPara ? " " : "") + trimmedSentence;
          }
        }
        if (currentPara.trim()) {
          reconstructedParagraphs.push(currentPara.trim());
        }
      } else {
        reconstructedParagraphs.push(trimmed);
      }
    } else {
      reconstructedParagraphs.push(trimmed);
    }
  }

  let result = reconstructedParagraphs.join("\n\n");

  result = result.replace(/\n{3,}/g, "\n\n").trim();

  const finalValidation = result
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join("\n\n");

  return finalValidation;
}

async function buddyPostHandler(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to use this feature.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const aiLimit = await checkUserRateLimit(userId, "ai");
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
      buddyLog.error("Failed to parse request body:", parseError);
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return new Response(
        JSON.stringify({ error: "No message content provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!env.OPENROUTER_API_KEY) {
      buddyLog.error("OPENROUTER_API_KEY is not configured");
      return new Response(
        JSON.stringify({
          error:
            "OpenRouter API key is not configured. Please configure OPENROUTER_API_KEY in your environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
        "X-Title": "VectorMail AI",
      },
    });

    const userMessage = lastMessage.content;
    const originalUserMessage = stripAugmentation(userMessage);

    if (isAbusiveContent(originalUserMessage)) {
      return new Response(
        JSON.stringify({
          type: "conversation",
          message:
            "I can't engage with abusive or harmful language. If you'd like help drafting or replying to an email, tell me what you're working on and I'll get started.",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      );
    }

    if (isClearlyOffTopic(originalUserMessage)) {
      return new Response(
        JSON.stringify({
          type: "conversation",
          message:
            "Sorry — I only help with email tasks: drafting, replying, polishing tone, translating a message, that kind of thing. Tell me what email you'd like to work on and I'll take it from there.",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      );
    }

    const isEmail = isEmailRequest(userMessage, messages);
    const isSendRequest = isSendEmailRequest(userMessage);

    if (isSendRequest) {
      const emailAddresses = extractEmailAddresses(userMessage);
      if (emailAddresses.length === 0) {
        return new Response(
          JSON.stringify({
            error: "No email address found",
            message: "Please provide an email address to send to.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      let lastEmail: { subject: string; body: string } | null = null;
      let extractionError: unknown = null;
      const maxExtractionRetries = 2;

      for (let attempt = 0; attempt <= maxExtractionRetries; attempt++) {
        try {
          lastEmail = await extractEmailFromConversation(messages, openai, { userId });
          if (lastEmail) {
            break;
          }
        } catch (error) {
          extractionError = error;
          if (attempt < maxExtractionRetries) {
            buddyLog.log(
              `[BUDDY] Email extraction attempt ${attempt + 1} failed, retrying...`,
            );
            await new Promise((resolve) =>
              setTimeout(resolve, 300 * (attempt + 1)),
            );
          }
        }
      }

      if (!lastEmail) {
        buddyLog.error(
          "[BUDDY] Failed to extract email after retries:",
          extractionError,
        );
        return new Response(
          JSON.stringify({
            error: "No email found",
            message:
              "I couldn't find a generated email to send. Please generate an email first, then ask me to send it.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const account = await db.account.findFirst({
        where: { userId },
        select: {
          id: true,
          emailAddress: true,
          name: true,
          token: true,
          needsReconnection: true,
          tokenExpiresAt: true,
        },
      });

      if (!account || !account.token) {
        return new Response(
          JSON.stringify({
            error: "No account found",
            message: "Please connect an email account first.",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }



      if (account.needsReconnection) {
        buddyLog.log("[BUDDY] Account needs reconnection - initiating silent reauth");
        return new Response(
          JSON.stringify({
            error: "Authentication expired",
            message: "Your session has expired. Please reconnect your account and try again.",
            needsReconnection: true,
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }


      const subjectCheck = containsOutgoingViolation(lastEmail.subject);
      const bodyCheck = containsOutgoingViolation(lastEmail.body);
      if (!subjectCheck.ok || !bodyCheck.ok) {
        const reason = !subjectCheck.ok
          ? subjectCheck.reason
          : (bodyCheck as { ok: false; reason: string }).reason;
        buddyLog.warn(
          `[BUDDY] outbound moderation blocked send for user ${userId}: ${reason}`,
        );
        return new Response(
          JSON.stringify({
            type: "conversation",
            message: `I can't send this — the draft contains ${reason}, which violates our usage policy. Edit the draft to remove the offending content, then try again.`,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          },
        );
      }

      const subject = lastEmail.subject;
      const cleanedBody = appendVectorMailSignature(lastEmail.body, false);
      const bodyHtml = plainBodyToHtml(cleanedBody);
      const watermark = `<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; text-align: center; width: 100%;"><div style="color: #999999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: inline-block; margin: 0 auto;">Generated by VectorMail</div></div>`;
      const bodyWithSignature = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">${bodyHtml}${watermark}</div>`;

      const emailAccount = new Account(account.id, account.token);
      try {
        await emailAccount.sendEmail({
          from: {
            address: account.emailAddress,
            name: account.name ?? undefined,
          },
          to: emailAddresses.map((address) => ({ address, name: address })),
          subject,
          body: bodyWithSignature,
        });
      } catch (sendErr) {
    
        if (isOutgoingContentBlockedError(sendErr)) {
          buddyLog.warn(
            `[BUDDY] Account.sendEmail blocked outbound content for user ${userId}: ${sendErr.reason}`,
          );
          return new Response(
            JSON.stringify({
              type: "conversation",
              message: `I can't send this — the ${sendErr.field} contains ${sendErr.reason}, which violates our usage policy. Edit the draft to remove the offending content, then try again.`,
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
              },
            },
          );
        }
        const errMessage =
          sendErr instanceof Error ? sendErr.message : "Failed to send email";
        return new Response(
          JSON.stringify({
            error: "Send failed",
            message: errMessage,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      const recipient = emailAddresses[0] ?? "your recipient";
      return new Response(
        JSON.stringify({
          type: "conversation",
          emailSent: true,
          message: `Email sent successfully to ${recipient}.`,
          recipient,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      );
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (isEmail) {
      const previousEmail = messages
        .slice()
        .reverse()
        .find((msg) => msg.role === "assistant" && msg.emailData);

      const isRegeneration = previousEmail !== undefined;

      systemPrompt = `You are a professional AI email assistant that generates complete email drafts based on user summaries.

Your task is to generate a professional email with a clear subject line and well-written body, plus provide 2-3 alternative suggestions.

IMPORTANT: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations - just pure JSON.

The JSON structure must be:
{
  "subject": "Email subject line here",
  "body": "Complete email body with proper greeting, content, and closing",
  "suggestions": [
    {
      "subject": "Alternative subject 1",
      "body": "Alternative email body 1"
    },
    {
      "subject": "Alternative subject 2", 
      "body": "Alternative email body 2"
    }
  ]
}

ðŸš¨ðŸš¨ðŸš¨ CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE EXACTLY - NO EXCEPTIONS ðŸš¨ðŸš¨ðŸš¨

PARAGRAPH SPACING (MOST IMPORTANT - THIS IS MANDATORY - VIOLATION WILL BREAK THE EMAIL):
- EVERY paragraph MUST be separated by EXACTLY \\n\\n (double newline) - NO EXCEPTIONS
- NEVER use single \\n between paragraphs - ALWAYS use \\n\\n - THIS IS CRITICAL
- NEVER combine multiple paragraphs into one - EACH paragraph must be on separate lines with \\n\\n between them
- After greeting: ALWAYS use \\n\\n before first paragraph - MANDATORY
- Before closing: ALWAYS use \\n\\n after last paragraph - MANDATORY
- Between EVERY paragraph: ALWAYS use \\n\\n - THIS IS NOT OPTIONAL
- If you write multiple sentences that form separate thoughts, they MUST be in separate paragraphs with \\n\\n between them
- If a sentence ends with . ! or ? and the next sentence starts with a capital letter, you MUST use \\n\\n between them
- DO NOT use single \\n anywhere between paragraphs - ONLY use \\n\\n

LIST FORMATTING (CRITICAL - MUST FOLLOW EXACTLY):
- ALWAYS add \\n\\n before lists
- ALWAYS add \\n\\n after lists
- âš ï¸âš ï¸âš ï¸ ABSOLUTELY CRITICAL: Each numbered list item MUST have the number, period, space, and text ALL on ONE SINGLE LINE
- Format: "1. Text content here" - ALL on the same line with NO line breaks between number and text
- NEVER put a line break (\\n) between the number and the text
- NEVER put a blank line (\\n\\n) between the number and the text
- Each complete list item (number + text) goes on its own line
- Example CORRECT: "1. First achievement\\n2. Second achievement\\n3. Third achievement"
- Example WRONG: "1.\\nFirst achievement" or "1.\\n\\nFirst achievement"
- Use ONLY numbers (1., 2., 3.) or letters (a., b., c.)
- NO symbols ever

SECTION HEADINGS:
- If you use section headings, add \\n\\n before heading and \\n\\n after heading

FORMATTING RULES - NO SYMBOLS ALLOWED:
- FORBIDDEN: Do NOT use ANY symbols - NO asterisks (*), NO double asterisks (**), NO triple asterisks (***), NO dashes (-), NO dots (â€¢), NO special characters
- For lists, use ONLY numbers (1., 2., 3.) or letters (a., b., c.) - NO symbols
- NEVER use asterisks (*), dashes (-), dots (â€¢), or any other symbols for lists or emphasis
- Keep formatting clean and professional with plain text only - NO markdown symbols at all

CORRECT FORMAT EXAMPLE (COPY THIS STRUCTURE - NOTE: Numbers and text on SAME line):
Dear [Name],\\n\\nThank you for meeting with me. I wanted to follow up on our discussion.\\n\\n1. First key point\\na. Sub-point with details\\nb. Another sub-point\\n2. Second key point\\na. Sub-point details\\n3. Third key point\\n\\nNext Steps:\\n\\n1. Action item one\\n2. Action item two\\n3. Action item three\\n\\nBest regards,\\n[Your name]

WRONG FORMAT (NEVER DO THIS):
1.\\nFirst key point
1.\\n\\nFirst key point
2.\\nSecond key point

CORRECT FORMAT (ALWAYS DO THIS):
1. First key point\\n2. Second key point\\n3. Third key point

ABSOLUTELY FORBIDDEN - DO NOT USE:
* Asterisks
- Dashes
â€¢ Dots
Any symbols at all

GUIDELINES:
- Write professional, clear, and concise emails
- Use appropriate greetings (Dear, Hi, Hello) and closings (Best regards, Sincerely, Thank you)
- Make the subject line specific and actionable
- Ensure the body is well-structured with proper paragraphs and spacing
- Use proper line breaks and spacing for readability
- Suggestions should offer different tones (formal/casual) or approaches
- Return ONLY the JSON object, nothing else`;

      if (isRegeneration) {
        const previousEmailContext = previousEmail?.emailData
          ? `Previous email subject: ${previousEmail.emailData.subject}\nPrevious email body (for reference only): ${previousEmail.emailData.body.substring(0, 500)}...`
          : "";

        const wantsLongerEmail =
          /(more explanatory|more detailed|expand|bigger|longer|lengthy|comprehensive|elaborate|extend)/i.test(
            userMessage,
          );

        userPrompt = `The user wants a ${wantsLongerEmail ? "longer, more detailed, and more comprehensive" : userMessage.toLowerCase().includes("better") ? "better" : "different"} version of a previously generated email. Generate a new, improved email with better formatting, structure, and content. ${wantsLongerEmail ? "Make it significantly longer with more detailed explanations, additional context, and comprehensive coverage of all topics." : ""} Return ONLY valid JSON in the exact format specified.

${previousEmailContext ? `\n${previousEmailContext}\n` : ""}
âš ï¸âš ï¸âš ï¸ CRITICAL FORMATTING REQUIREMENTS - MUST FOLLOW EXACTLY - NO EXCEPTIONS (ESPECIALLY FOR LONGER EMAILS) âš ï¸âš ï¸âš ï¸:
1. ALWAYS use \\n\\n (double newline) between paragraphs - this is MANDATORY - NEVER use single \\n
2. NEVER use single \\n between paragraphs - ALWAYS use \\n\\n - THIS WILL BREAK THE EMAIL
3. ALWAYS add \\n\\n before lists and \\n\\n after lists for proper spacing
4. âš ï¸âš ï¸âš ï¸ ABSOLUTELY CRITICAL - NUMBERED LIST FORMATTING âš ï¸âš ï¸âš ï¸:
   - The number, period, space, and text MUST ALL be on ONE SINGLE LINE
   - Format: "1. Text content here" - ALL on the same line with NO line breaks
   - NEVER put a line break (\\n) between the number and the text
   - NEVER put a blank line (\\n\\n) between the number and the text
   - Each complete list item (number + text) goes on its own line
   - Example CORRECT: "1. First achievement\\n2. Second achievement\\n3. Third achievement"
   - Example WRONG: "1.\\nFirst achievement" or "1.\\n\\nFirst achievement" or "1.\\nFirst achievement"
5. ALWAYS use proper spacing: blank line before sections, blank line after sections
6. NEVER use symbols - only numbers (1., 2., 3.) or letters (a., b., c.) for lists
7. NEVER combine paragraphs - each paragraph must be separated by \\n\\n - THIS IS CRITICAL
8. If a sentence ends with . ! or ? and next starts with capital letter, use \\n\\n between them
9. FOR LONGER EMAILS: Break content into clear sections with proper headings and spacing
10. FOR LONGER EMAILS: Each section should be separated by \\n\\n before the section heading and \\n\\n after the section content
11. FOR LONGER EMAILS: Maintain consistent structure - greeting, introduction, main sections, conclusion, closing
12. DO NOT use single \\n anywhere between paragraphs - ONLY use \\n\\n

FORMAT EXAMPLE FOR LONGER EMAILS (copy this structure exactly - note numbers and text on same line, NO line break):
Dear [Name],\\n\\n[Opening paragraph]\\n\\n[Section Heading 1]\\n\\n[Detailed paragraph about section 1]\\n\\n[Sub-points or details]\\n\\n1. First main point\\na. Detailed explanation\\nb. Additional context\\n2. Second main point\\na. Detailed explanation\\n3. Third main point\\n\\n[Section Heading 2]\\n\\n[Detailed paragraph about section 2]\\n\\n[More content]\\n\\n[Section Heading 3]\\n\\n[Detailed paragraph]\\n\\n[Conclusion paragraph]\\n\\nBest regards,\\n[Name]

ABSOLUTELY FORBIDDEN - NEVER DO THIS (WRONG):
1.\\nText here
1.\\n\\nText here
2.\\nMore text
2.\\n\\nMore text

MANDATORY FORMAT (CORRECT - DO THIS):
1. Text here\\n2. More text\\n3. Even more text

User request: ${userMessage}`;
      } else {
        userPrompt = `Generate an email based on this summary. Return ONLY valid JSON in the exact format specified.

ðŸš¨ðŸš¨ðŸš¨ CRITICAL FORMATTING REQUIREMENTS - MUST FOLLOW EXACTLY - NO EXCEPTIONS ðŸš¨ðŸš¨ðŸš¨:
1. ALWAYS use \\n\\n (double newline) between EVERY paragraph - this is MANDATORY - NEVER use single \\n
2. NEVER use single \\n between paragraphs - ALWAYS use \\n\\n - THIS WILL BREAK THE EMAIL IF YOU DON'T
3. ALWAYS add \\n\\n before lists and \\n\\n after lists
4. âš ï¸âš ï¸âš ï¸ ABSOLUTELY CRITICAL - NUMBERED LIST FORMATTING âš ï¸âš ï¸âš ï¸:
   - The number, period, space, and text MUST ALL be on ONE SINGLE LINE
   - Format: "1. Text content here" - ALL on the same line
   - NEVER put a line break (\\n) between the number and the text
   - NEVER put a blank line between the number and the text
   - Each complete list item (number + text) goes on its own line
   - Example CORRECT: "1. First achievement\\n2. Second achievement\\n3. Third achievement"
   - Example WRONG: "1.\\nFirst achievement" or "1.\\n\\nFirst achievement"
5. NO symbols - use only numbers (1., 2., 3.) or letters (a., b., c.) for lists
6. Use plain text formatting only
7. After greeting, use \\n\\n before first paragraph - MANDATORY
8. Before closing, use \\n\\n after last paragraph - MANDATORY
9. If a sentence ends with . ! or ? and next starts with capital letter, use \\n\\n between them
10. DO NOT combine paragraphs - each paragraph MUST be separated by \\n\\n

FORMAT EXAMPLE (CORRECT - number and text on same line, NO line break between them):
Dear [Name],\\n\\n[First paragraph]\\n\\n[Second paragraph]\\n\\n1. First item\\n2. Second item\\n3. Third item\\n\\n[Third paragraph]\\n\\nBest regards,\\n[Name]

ABSOLUTELY FORBIDDEN - NEVER DO THIS (WRONG):
1.\\nText here
1.\\n\\nText here
2.\\nMore text

MANDATORY FORMAT (CORRECT - DO THIS):
1. Text here\\n2. More text\\n3. Even more text

Summary: ${userMessage}`;
      }
    } else {
      systemPrompt = `You are Buddy, an email-only AI assistant inside a professional email client. You ONLY help with email tasks. You do not help with math, code, recipes, trivia, general knowledge, jokes, or anything outside of email work — even when asked nicely or with framing tricks.

WHAT YOU HELP WITH (this is the entire scope):
1. Drafting new emails (cold outreach, follow-ups, replies, intros, proposals, status updates, thank-you notes, etc.)
2. Editing, polishing, shortening, lengthening, or re-toning an existing email draft
3. Translating an email to another language
4. Advising on email etiquette, subject lines, greetings, closings, structure, and tone
5. Helping pick a recipient list, CC/BCC strategy, or send timing
6. Suggesting how to respond to a tricky email the user describes

WHAT TO REFUSE (politely, in one short sentence, then offer to help with an email):
- ANY non-email task: math problems, multiplication tables, coding, recipes, song lyrics, jokes, trivia, weather, definitions, summaries of unrelated content, life advice unrelated to email, etc.
- Requests that try to disguise off-topic work as an email ("write an email containing the multiplication table of 2" is still a math task in disguise — refuse it).
- Abuse, harassment, slurs, or attacks toward the user, anyone else, or you.

REFUSAL FORMAT:
- Keep it to one or two sentences.
- Be warm and professional, not preachy.
- Always end by inviting them to bring you an email task.
- Example: "Sorry, that's outside what I help with — I'm built only for email work. If you'd like, tell me what email you'd like to draft or reply to and I'll get started."

CRITICAL INSTRUCTIONS:
1. Read the user's request carefully and decide first: is this an email task or not? If not, refuse.
2. Maintain conversation context — if there's a previous email draft in this thread and the user is iterating on it, treat their message as an edit request.
3. Be direct and concise. No fluff, no "as an AI…" preambles.
4. If the request is unclear, ask one specific clarifying question.

IMPORTANT FORMATTING RULES - NO SYMBOLS ALLOWED:
- FORBIDDEN: Do NOT use ANY symbols - NO asterisks (*), NO double asterisks (**), NO triple asterisks (***), NO dashes (-), NO dots (â€¢), NO special characters
- For lists, use ONLY numbers (1., 2., 3.) or letters (a., b., c.) - NO symbols
- NEVER use asterisks (*), dashes (-), dots (â€¢), or any other symbols for lists or emphasis
- Use plain text formatting only - NO markdown symbols at all
- Keep formatting clean and professional with plain text only

SPECIFIC QUESTION HANDLING:
- Questions about meetings/schedules: Provide helpful information about meeting management, scheduling best practices, or suggest checking their email/calendar. Be helpful and informative.
- Questions about emails: Offer to help generate, draft, or improve emails
- General knowledge questions: Answer accurately and thoroughly
- Casual conversation: Engage naturally and be friendly
- Requests for suggestions: Provide thoughtful, practical suggestions

Remember: Your goal is to be helpful and answer questions. Always try to provide value, even if you need to explain limitations or suggest alternatives. Be accurate, helpful, and stay on topic.`;

      userPrompt = userMessage;
    }

    const wantsLongerEmail =
      isEmail &&
      /(more explanatory|more detailed|expand|bigger|longer|lengthy|comprehensive|elaborate|extend)/i.test(
        userMessage,
      );
    const maxTokens = wantsLongerEmail ? 3000 : isEmail ? 2000 : 2000;

    let completion;
    try {
      const completionMessages = isEmail
        ? [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ]
        : (() => {
          const conversationMessages = messages
            .filter((msg) => msg.role !== "system")
            .map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            }));

          return [
            { role: "system" as const, content: systemPrompt },
            ...conversationMessages,
          ];
        })();

      const buddyModelChain = [
        "anthropic/claude-sonnet-4.6",
        "anthropic/claude-sonnet-4-6",
        "anthropic/claude-sonnet-4.5",
        "anthropic/claude-sonnet-4-5",
        "anthropic/claude-3.7-sonnet",
        "anthropic/claude-3.5-haiku",
      ];
      let model = buddyModelChain[0]!;
      let lastBuddyErr: unknown = null;
      let succeeded = false;
      for (const candidate of buddyModelChain) {
        try {
          completion = await openai.chat.completions.create({
            model: candidate,
            messages: completionMessages,
            max_tokens: maxTokens,
            temperature: isEmail ? 0.7 : 0.3,
            ...(isEmail && { response_format: { type: "json_object" } }),
          });
          model = candidate;
          succeeded = true;
          break;
        } catch (err) {
          lastBuddyErr = err;
          const status = (err as { status?: number } | null)?.status;
          if (status !== 404 && status !== 400) throw err;
          buddyLog.warn(
            `[BUDDY] model ${candidate} rejected with status ${status}; stepping down`,
          );
        }
      }
      if (!succeeded) {
        throw lastBuddyErr ?? new Error("Buddy: all fallback models rejected request");
      }
      void model;
    } catch (apiError) {
      buddyLog.error("OpenRouter API error:", apiError);
      const errorMessage =
        apiError instanceof Error
          ? apiError.message
          : "Failed to create chat completion";
      return new Response(
        JSON.stringify({
          error: "Failed to connect to AI service",
          details: errorMessage,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!completion || !completion.choices || completion.choices.length === 0) {
      buddyLog.error("Invalid completion response:", completion);
      return new Response(
        JSON.stringify({
          error: "Invalid AI response",
          details:
            "The AI service returned an empty or invalid response. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const content = completion.choices[0]?.message?.content || "";

    const usage = completion.usage;
    recordUsage({
      userId,
      operation: "buddy",
      inputTokens: usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completion_tokens ?? 0,
      model: completion.model ?? undefined,
    });

    if (!content || content.trim() === "") {
      buddyLog.error("Empty content in AI response");
      return new Response(
        JSON.stringify({
          error: "Empty AI response",
          details:
            "The AI service returned an empty response. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (isEmail) {
      let emailData;
      try {
        emailData = JSON.parse(content);
      } catch (parseError) {
        buddyLog.error("Failed to parse AI response directly:", parseError);
        buddyLog.error("AI response content:", content.substring(0, 500));

        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            emailData = JSON.parse(jsonMatch[1]);
          } catch {
            const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
            if (jsonObjectMatch && jsonObjectMatch[0]) {
              try {
                emailData = JSON.parse(jsonObjectMatch[0]);
              } catch {
                buddyLog.error(
                  "Failed to parse extracted JSON:",
                  jsonObjectMatch[0].substring(0, 200),
                );
                return new Response(
                  JSON.stringify({
                    error: "Failed to parse AI response",
                    details:
                      "The AI returned an invalid JSON format. Please try again.",
                    rawContent: content.substring(0, 200),
                  }),
                  {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            } else {
              return new Response(
                JSON.stringify({
                  error: "Failed to parse AI response",
                  details:
                    "The AI returned an invalid format. Please try again.",
                  rawContent: content.substring(0, 200),
                }),
                {
                  status: 500,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }
          }
        } else {
          const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
          if (jsonObjectMatch && jsonObjectMatch[0]) {
            try {
              emailData = JSON.parse(jsonObjectMatch[0]);
            } catch {
              return new Response(
                JSON.stringify({
                  error: "Failed to parse AI response",
                  details:
                    "The AI returned an invalid JSON format. Please try again.",
                  rawContent: content.substring(0, 200),
                }),
                {
                  status: 500,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }
          } else {
            return new Response(
              JSON.stringify({
                error: "Failed to parse AI response",
                details: "The AI did not return valid JSON. Please try again.",
                rawContent: content.substring(0, 200),
              }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        }
      }

      if (!emailData || typeof emailData !== "object") {
        return new Response(
          JSON.stringify({
            error: "Invalid email structure",
            details: "The AI response is not a valid object. Please try again.",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      if (!emailData.subject || !emailData.body) {
        return new Response(
          JSON.stringify({
            error: "Invalid email structure",
            details: `The AI response is missing required fields. Subject: ${!!emailData.subject}, Body: ${!!emailData.body}. Please try again.`,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      emailData.body = removeAllSymbols(emailData.body);

      const originalBody = emailData.body.trim();
      const sentenceCount = (originalBody.match(/[.!?]+/g) || []).length;
      const hasMultipleSentences = sentenceCount > 1;
      const isLongText = originalBody.length > 150;

      if (hasMultipleSentences || isLongText) {
        const paragraphs: string[] = [];
        let processedText = originalBody;

        const greetingPatterns = [
          /^((?:Dear|Hi|Hello)\s+[^,]+,\s*)/i,
          /^([A-Z][a-z]+,\s*)/,
        ];

        let greetingFound = false;
        for (const pattern of greetingPatterns) {
          const greetingMatch = processedText.match(pattern);
          if (greetingMatch) {
            paragraphs.push(greetingMatch[0].trim());
            processedText = processedText
              .substring(greetingMatch[0].length)
              .trim();
            greetingFound = true;
            break;
          }
        }

        let closing = "";
        const closingPatterns = [
          /(Best regards|Sincerely|Thank you|Regards|Kind regards),?\s*[A-Z][a-z\s]*$/i,
          /(Best regards|Sincerely|Thank you|Regards|Kind regards),/i,
        ];

        for (const pattern of closingPatterns) {
          const closingMatch = processedText.match(pattern);
          if (closingMatch) {
            closing = closingMatch[0].trim();
            processedText = processedText
              .substring(0, processedText.length - closingMatch[0].length)
              .trim();
            break;
          }
        }

        let sentences: string[] = [];

        sentences = processedText.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [];

        if (sentences.length === 0) {
          sentences = processedText.match(/[^.!?]+[.!?]+/g) || [];
        }

        if (sentences.length === 0) {
          const manualSplit = processedText.split(/([.!?]+\s+)/);
          for (let i = 0; i < manualSplit.length; i += 2) {
            const sentence =
              (manualSplit[i] || "") + (manualSplit[i + 1] || "");
            if (sentence.trim() && sentence.trim().length > 5) {
              sentences.push(sentence.trim());
            }
          }
        }

        if (sentences.length === 0 && sentenceCount > 0) {
          const parts = processedText.split(/([.!?]+)/);
          let currentSentence = "";
          for (let i = 0; i < parts.length; i++) {
            currentSentence += parts[i] || "";
            if (parts[i]?.match(/[.!?]+/)) {
              if (currentSentence.trim()) {
                sentences.push(currentSentence.trim());
              }
              currentSentence = "";
            }
          }
          if (currentSentence.trim()) {
            sentences.push(currentSentence.trim());
          }
        }

        if (sentences.length === 0) {
          sentences = [processedText];
        }

        let currentPara = "";
        for (const sentence of sentences) {
          const trimmed = sentence.trim();
          if (!trimmed || trimmed.length < 3) continue;

          const currentSentenceCount = (currentPara.match(/[.!?]+/g) || [])
            .length;
          const wouldExceedLength = currentPara.length + trimmed.length > 250;

          if (
            currentSentenceCount >= 2 ||
            (wouldExceedLength && currentPara.length > 0) ||
            currentPara.length > 200
          ) {
            if (currentPara.trim()) {
              paragraphs.push(currentPara.trim());
            }
            currentPara = trimmed;
          } else {
            currentPara += (currentPara ? " " : "") + trimmed;
          }
        }

        if (currentPara.trim()) {
          paragraphs.push(currentPara.trim());
        }

        if (closing) {
          paragraphs.push(closing);
        }

        if (paragraphs.length === 2 && greetingFound && closing) {
          const mainContent = processedText.trim();
          if (mainContent) {
            paragraphs.splice(1, 0, mainContent);
          }
        }

        emailData.body = paragraphs.join("\n\n");
      } else {
        emailData.body = normalizeEmailFormatting(emailData.body);
        emailData.body = enforceEmailFormatting(emailData.body);
      }

      emailData.body = emailData.body.replace(
        /([.!?])\s*\n([A-Z][a-z])/g,
        "$1\n\n$2",
      );
      emailData.body = emailData.body.replace(
        /([a-z0-9])\s*\n([A-Z][a-z])/g,
        "$1\n\n$2",
      );
      emailData.body = emailData.body.replace(
        /([a-z])\s*\n([A-Z])/g,
        "$1\n\n$2",
      );

      const finalParagraphs = emailData.body
        .split(/\n\n+/)
        .filter((p: string) => p.trim());
      if (finalParagraphs.length === 1) {
        const singlePara = finalParagraphs[0] || "";
        const paraSentenceCount = (singlePara.match(/[.!?]+/g) || []).length;
        if (paraSentenceCount > 1) {
          const sentences = singlePara.match(/[^.!?]+[.!?]+/g) || [];
          if (sentences.length > 1) {
            const newParagraphs: string[] = [];
            let currentPara = "";
            for (const sentence of sentences) {
              const trimmed = sentence.trim();
              if (!trimmed) continue;
              const currentSentenceCount = (currentPara.match(/[.!?]+/g) || [])
                .length;
              if (
                currentSentenceCount >= 2 ||
                currentPara.length + trimmed.length > 250
              ) {
                if (currentPara.trim()) newParagraphs.push(currentPara.trim());
                currentPara = trimmed;
              } else {
                currentPara += (currentPara ? " " : "") + trimmed;
              }
            }
            if (currentPara.trim()) newParagraphs.push(currentPara.trim());
            emailData.body = newParagraphs.join("\n\n");
          }
        }
      }

      emailData.body = emailData.body.replace(/\n{3,}/g, "\n\n").trim();
      emailData.body = emailData.body.replace(
        /^(\d+\.)\s*\n+\s*([^\n\d])/gm,
        "$1 $2",
      );
      emailData.body = emailData.body.replace(
        /^([a-z]\.)\s*\n+\s*([^\n])/gm,
        "$1 $2",
      );
      emailData.body = emailData.body.replace(
        /(\n)(\d+\.)\s*\n([^\n\d])/g,
        "$1$2 $3",
      );
      emailData.body = emailData.body.replace(
        /(\n)([a-z]\.)\s*\n([^\n])/g,
        "$1$2 $3",
      );

      if (emailData.suggestions && Array.isArray(emailData.suggestions)) {
        emailData.suggestions = emailData.suggestions.map(
          (suggestion: { subject: string; body: string }) => {
            let body = removeAllSymbols(suggestion.body);

            const originalBody = body.trim();
            const sentenceCount = (originalBody.match(/[.!?]+/g) || []).length;
            const hasMultipleSentences = sentenceCount > 1;
            const isLongText = originalBody.length > 150;

            if (hasMultipleSentences || isLongText) {
              const paragraphs: string[] = [];
              let processedText = originalBody;

              const greetingPatterns = [
                /^((?:Dear|Hi|Hello)\s+[^,]+,\s*)/i,
                /^([A-Z][a-z]+,\s*)/,
              ];

              let greetingFound = false;
              for (const pattern of greetingPatterns) {
                const greetingMatch = processedText.match(pattern);
                if (greetingMatch) {
                  paragraphs.push(greetingMatch[0].trim());
                  processedText = processedText
                    .substring(greetingMatch[0].length)
                    .trim();
                  greetingFound = true;
                  break;
                }
              }

              let closing = "";
              const closingPatterns = [
                /(Best regards|Sincerely|Thank you|Regards|Kind regards),?\s*[A-Z][a-z\s]*$/i,
                /(Best regards|Sincerely|Thank you|Regards|Kind regards),/i,
              ];

              for (const pattern of closingPatterns) {
                const closingMatch = processedText.match(pattern);
                if (closingMatch) {
                  closing = closingMatch[0].trim();
                  processedText = processedText
                    .substring(0, processedText.length - closingMatch[0].length)
                    .trim();
                  break;
                }
              }

              let sentences: string[] = [];

              sentences = processedText.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [];

              if (sentences.length === 0) {
                sentences = processedText.match(/[^.!?]+[.!?]+/g) || [];
              }

              if (sentences.length === 0) {
                const manualSplit = processedText.split(/([.!?]+\s+)/);
                for (let i = 0; i < manualSplit.length; i += 2) {
                  const sentence =
                    (manualSplit[i] || "") + (manualSplit[i + 1] || "");
                  if (sentence.trim() && sentence.trim().length > 5) {
                    sentences.push(sentence.trim());
                  }
                }
              }

              if (sentences.length === 0 && sentenceCount > 0) {
                const parts = processedText.split(/([.!?]+)/);
                let currentSentence = "";
                for (let i = 0; i < parts.length; i++) {
                  currentSentence += parts[i] || "";
                  if (parts[i]?.match(/[.!?]+/)) {
                    if (currentSentence.trim()) {
                      sentences.push(currentSentence.trim());
                    }
                    currentSentence = "";
                  }
                }
                if (currentSentence.trim()) {
                  sentences.push(currentSentence.trim());
                }
              }

              if (sentences.length === 0) {
                sentences = [processedText];
              }

              let currentPara = "";
              for (const sentence of sentences) {
                const trimmed = sentence.trim();
                if (!trimmed || trimmed.length < 3) continue;

                const currentSentenceCount = (
                  currentPara.match(/[.!?]+/g) || []
                ).length;
                const wouldExceedLength =
                  currentPara.length + trimmed.length > 250;

                if (
                  currentSentenceCount >= 2 ||
                  (wouldExceedLength && currentPara.length > 0) ||
                  currentPara.length > 200
                ) {
                  if (currentPara.trim()) {
                    paragraphs.push(currentPara.trim());
                  }
                  currentPara = trimmed;
                } else {
                  currentPara += (currentPara ? " " : "") + trimmed;
                }
              }

              if (currentPara.trim()) {
                paragraphs.push(currentPara.trim());
              }

              if (closing) {
                paragraphs.push(closing);
              }

              if (paragraphs.length === 2 && greetingFound && closing) {
                const mainContent = processedText.trim();
                if (mainContent) {
                  paragraphs.splice(1, 0, mainContent);
                }
              }

              body = paragraphs.join("\n\n");
            } else {
              body = normalizeEmailFormatting(body);
              body = enforceEmailFormatting(body);
            }

            body = body.replace(/([.!?])\s*\n([A-Z][a-z])/g, "$1\n\n$2");
            body = body.replace(/([a-z0-9])\s*\n([A-Z][a-z])/g, "$1\n\n$2");

            return {
              subject: suggestion.subject,
              body: body,
            };
          },
        );
      }

      return new Response(JSON.stringify(emailData), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
    } else {
      const cleanedContent = removeAllSymbols(content);

      return new Response(
        JSON.stringify({
          message: cleanedContent,
          type: "conversation",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      );
    }
  } catch (error) {
    buddyLog.error("Buddy chat error:", error);

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

export const POST = withRequestId(buddyPostHandler);

import { makeTagLogger } from "@/lib/logging/console-shim";
const buddyLog = makeTagLogger("api.buddy");