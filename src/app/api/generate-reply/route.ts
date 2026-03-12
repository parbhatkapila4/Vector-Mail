import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { checkDailyCap, recordUsage } from "@/lib/ai-usage";
import {
  checkUserRateLimit,
  rateLimit429Response,
} from "@/lib/rate-limit";
import { env } from "@/env.js";
import { db } from "@/server/db";
import { DEMO_ACCOUNT_ID, DEMO_USER_ID } from "@/lib/demo/constants";

const DEFAULT_REPLY_SUGGEST_MODEL = "anthropic/claude-3.5-haiku";

const REPLY_SYSTEM = (userDisplayName: string) =>
  `You are writing a reply in the user's voice. Use the full thread history and the user's previous replies in the thread to match their tone and style.

The reply will be sent as the next message in the thread. Output only the reply: a subject line (Re: ...) and the email body.

RULES:
- Subject: Use "Re: <original subject>" if not already present; otherwise keep the existing subject.
- Body: Write in first person as "${userDisplayName}". Match the tone of the user's prior messages in the thread (if any). Be concise and professional.
- Output format: Respond with a JSON object only, no markdown or extra text: {"subject":"Re: ...","body":"<HTML or plain text body>"}
- Body can be HTML (e.g. <p>...</p>) or plain text with line breaks. Prefer HTML for formatting.
- Do not include meta-commentary like "Here is your reply."`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userId === DEMO_USER_ID) {
      return NextResponse.json(
        { error: "Demo mode", message: "Connect your account to use Suggest reply." },
        { status: 403 },
      );
    }

    const aiLimit = checkUserRateLimit(userId, "ai");
    if (!aiLimit.allowed) {
      return rateLimit429Response({
        message: "Too many AI requests. Try again later.",
        remaining: aiLimit.remaining,
        limit: aiLimit.limit,
        retryAfterSec: 60,
      });
    }

    const cap = await checkDailyCap(userId, env.AI_DAILY_CAP_TOKENS);
    if (!cap.allowed) {
      const { log: auditLog } = await import("@/lib/audit/audit-log");
      auditLog({ userId, action: "ai_cap_exceeded", metadata: {} });
      return NextResponse.json(
        {
          error: "Daily AI limit reached",
          message: `You have used ${cap.used} of ${cap.limit} tokens today. Try again tomorrow.`,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { threadId, accountId: bodyAccountId } = body;

    if (!threadId || typeof threadId !== "string") {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 },
      );
    }

    const userAccountIds = await db.account
      .findMany({
        where: { userId },
        select: { id: true },
      })
      .then((rows) => new Set(rows.map((r) => r.id)));

    const thread = await db.thread.findFirst({
      where: { id: threadId },
      include: {
        account: {
          select: { id: true, emailAddress: true, name: true },
        },
        emails: {
          include: { from: true, to: true },
          orderBy: { sentAt: "asc" },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (!userAccountIds.has(thread.accountId)) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (bodyAccountId && bodyAccountId !== thread.accountId) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const account = thread.account as { id: string; emailAddress: string; name: string | null };
    if (account.id === DEMO_ACCOUNT_ID) {
      return NextResponse.json(
        { error: "Demo mode", message: "Connect your account to use Suggest reply." },
        { status: 403 },
      );
    }

    const emails = thread.emails as Array<{
      subject: string;
      body: string | null;
      bodySnippet: string | null;
      sentAt: Date;
      internetMessageId: string;
      from: { address: string; name: string | null };
      to: Array<{ address: string; name: string | null }>;
    }>;

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "Thread has no messages" },
        { status: 400 },
      );
    }

    const accountEmailLower = (account.emailAddress ?? "").toLowerCase();
    const lastMessage = emails[emails.length - 1];
    if (!lastMessage) {
      return NextResponse.json(
        { error: "Thread has no messages" },
        { status: 400 },
      );
    }
    const lastFromAddress = lastMessage.from?.address?.toLowerCase();
    if (lastFromAddress === accountEmailLower) {
      return NextResponse.json(
        { error: "Last message is from you; no reply to suggest." },
        { status: 400 },
      );
    }

    const threadContext = emails
      .map((e, i) => {
        const bodyText = e.body ?? e.bodySnippet ?? "";
        const snippet = bodyText.length > 2000 ? bodyText.slice(0, 2000) + "..." : bodyText;
        const fromAddr = e.from?.address ?? "";
        const isUser = fromAddr.toLowerCase() === accountEmailLower;
        return `[Message ${i + 1}] From: ${e.from?.name ?? e.from?.address ?? fromAddr} <${fromAddr}>${isUser ? " (USER - match this tone)" : ""}
Date: ${new Date(e.sentAt).toISOString()}
Subject: ${e.subject}
Body: ${snippet}`;
      })
      .join("\n\n");

    const userDisplayName = account.name ?? "User";

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
        "X-Title": "VectorMail AI",
      },
    });

    const replyModel =
      process.env.REPLY_SUGGEST_MODEL?.trim() || DEFAULT_REPLY_SUGGEST_MODEL;

    const completion = await openai.chat.completions.create({
      model: replyModel,
      messages: [
        { role: "system", content: REPLY_SYSTEM(userDisplayName) },
        {
          role: "user",
          content: `Thread subject: ${thread.subject ?? lastMessage?.subject ?? "(No subject)"}

Thread messages (in order):
${threadContext}

Generate a single reply as the next message from ${userDisplayName}. Return only a JSON object with "subject" and "body" (no markdown, no code fence).`,
        },
      ],
      stream: false,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const usage = completion.usage;
    recordUsage({
      userId,
      operation: "compose",
      inputTokens: usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completion_tokens ?? 0,
      model: completion.model ?? undefined,
    });

    let parsed: { subject?: string; body?: string };
    try {
      const jsonStr = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(jsonStr) as { subject?: string; body?: string };
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI reply" },
        { status: 500 },
      );
    }

    const subject =
      typeof parsed.subject === "string" && parsed.subject.length > 0
        ? parsed.subject
        : lastMessage.subject.startsWith("Re:")
          ? lastMessage.subject
          : `Re: ${lastMessage.subject}`;
    const bodyText =
      typeof parsed.body === "string" && parsed.body.length > 0
        ? parsed.body
        : "";

    return NextResponse.json({ subject, body: bodyText });
  } catch (error) {
    console.error("Error in generate-reply:", error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
      { status: 500 },
    );
  }
}
