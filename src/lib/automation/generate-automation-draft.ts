import type { ActionExecution, Prisma } from "@prisma/client";
import OpenAI from "openai";

import { validateAutomationDraft } from "@/lib/automation/automation-draft-safety";
import { emailBodyToPlainTextForDraft } from "@/lib/automation/draft-plain-text";
import {
  buildThreadContextBlock,
  loadThreadForReplySuggest,
} from "@/lib/automation/thread-reply-context";
import { checkDailyCap, recordUsage } from "@/lib/ai-usage";
import { DEMO_ACCOUNT_ID, DEMO_USER_ID } from "@/lib/demo/constants";
import { env } from "@/env.js";

const DEFAULT_REPLY_SUGGEST_MODEL = "anthropic/claude-3.5-haiku";

const FOLLOW_UP_DRAFT_SYSTEM = (userDisplayName: string) =>
  `You are drafting a polite follow-up email on behalf of "${userDisplayName}". Use the thread history and the user's prior messages to match tone.

The follow-up is the next outbound message in the thread. Output only the draft: subject line and body.

RULES:
- Subject: Prefer "Re: <original subject>" when replying in-thread.
- Body: Write in first person as "${userDisplayName}". Be brief, professional, and appropriate for a gentle bump or reminder.
- Output format: JSON only, no markdown fences: {"subject":"...","body":"..."}
- Body may be HTML or plain text; keep it suitable for email.
- Do not include meta-commentary.`;

export class AutomationDraftStepError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AutomationDraftStepError";
    this.code = code;
  }
}

export type AutomationDraftPayloadFields = {
  draftSubject: string;
  draftBody: string;
  draftMeta: {
    threadId: string;
    inReplyToInternetMessageId: string;
    lastExternalEmailId: string;
    threadSubject: string;
  };
  draftDecidedAt: string;
};

function isDemoAutomationExecution(execution: {
  userId: string;
  accountId: string;
}): boolean {
  return execution.userId === DEMO_USER_ID || execution.accountId === DEMO_ACCOUNT_ID;
}

function buildDemoDraft(params: {
  lastExternalSubject: string;
  threadSubject: string;
  threadId: string;
  inReplyToInternetMessageId: string;
  lastExternalEmailId: string;
}): AutomationDraftPayloadFields {
  const baseSubject = params.lastExternalSubject.trim() || params.threadSubject || "(No subject)";
  const reSubject = baseSubject.toLowerCase().startsWith("re:")
    ? baseSubject
    : `Re: ${baseSubject}`;
  return {
    draftSubject: reSubject,
    draftBody:
      "Hi,\n\nJust following up on my earlier note. Please let me know if you need anything else from my side.\n\nBest regards",
    draftMeta: {
      threadId: params.threadId,
      inReplyToInternetMessageId: params.inReplyToInternetMessageId,
      lastExternalEmailId: params.lastExternalEmailId,
      threadSubject: params.threadSubject,
    },
    draftDecidedAt: new Date().toISOString(),
  };
}

export async function generateAutomationDraftFields(
  execution: ActionExecution,
): Promise<AutomationDraftPayloadFields> {
  const threadId = execution.threadId;
  if (!threadId) {
    throw new AutomationDraftStepError(
      "missing_thread",
      "Automation draft requires a threadId on the execution",
    );
  }

  const thread = await loadThreadForReplySuggest({
    threadId,
    accountId: execution.accountId,
    userId: execution.userId,
  });
  if (!thread) {
    throw new AutomationDraftStepError(
      "thread_not_found",
      "Thread not found for automation draft",
    );
  }

  const account = thread.account as {
    id: string;
    emailAddress: string;
    name: string | null;
    userId: string;
  };
  const emails = thread.emails as Array<{
    id: string;
    subject: string;
    body: string | null;
    bodySnippet: string | null;
    sentAt: Date;
    internetMessageId: string;
    from: { address: string; name: string | null };
  }>;

  if (emails.length === 0) {
    throw new AutomationDraftStepError("no_messages", "Thread has no messages");
  }

  const accountEmailLower = (account.emailAddress ?? "").toLowerCase();
  const lastMessage = emails[emails.length - 1];
  if (!lastMessage) {
    throw new AutomationDraftStepError("no_messages", "Thread has no messages");
  }
  const lastFromAddress = lastMessage.from?.address?.toLowerCase();
  if (lastFromAddress === accountEmailLower) {
    throw new AutomationDraftStepError(
      "last_from_self",
      "Last message is from the account owner; no external follow-up to draft",
    );
  }

  let lastExternal = lastMessage;
  for (let i = emails.length - 1; i >= 0; i--) {
    const e = emails[i];
    if (e && e.from?.address?.toLowerCase() !== accountEmailLower) {
      lastExternal = e;
      break;
    }
  }

  if (isDemoAutomationExecution(execution)) {
    const draft = buildDemoDraft({
      lastExternalSubject: lastExternal.subject,
      threadSubject: thread.subject ?? lastExternal.subject ?? "(No subject)",
      threadId,
      inReplyToInternetMessageId: lastExternal.internetMessageId,
      lastExternalEmailId: lastExternal.id,
    });
    const safety = validateAutomationDraft({
      draftSubject: draft.draftSubject,
      draftBodyPlain: draft.draftBody,
    });
    if (!safety.ok) {
      throw new AutomationDraftStepError(
        safety.code,
        `Demo draft failed safety: ${safety.message}`,
      );
    }
    return draft;
  }

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AutomationDraftStepError(
      "openrouter_missing",
      "OPENROUTER_API_KEY is not configured",
    );
  }

  const cap = await checkDailyCap(execution.userId, env.AI_DAILY_CAP_TOKENS);
  if (!cap.allowed) {
    throw new AutomationDraftStepError(
      "ai_daily_cap",
      `Daily AI limit reached (${cap.used}/${cap.limit} tokens)`,
    );
  }

  const threadContext = buildThreadContextBlock(emails, accountEmailLower, emails.length);
  const userDisplayName = account.name ?? "User";
  const threadSubjectLine = thread.subject ?? lastMessage.subject ?? "(No subject)";

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
      "X-Title": "VectorMail AI",
    },
  });

  const replyModel = process.env.REPLY_SUGGEST_MODEL?.trim() || DEFAULT_REPLY_SUGGEST_MODEL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50_000);
  let completion: Awaited<ReturnType<typeof openai.chat.completions.create>>;
  try {
    completion = await openai.chat.completions.create(
      {
        model: replyModel,
        messages: [
          { role: "system", content: FOLLOW_UP_DRAFT_SYSTEM(userDisplayName) },
          {
            role: "user",
            content: `Thread subject: ${threadSubjectLine}

Thread messages (in order):
${threadContext}

Draft one follow-up message from ${userDisplayName}. Return only a JSON object with "subject" and "body".`,
          },
        ],
        stream: false,
        response_format: { type: "json_object" },
      },
      { signal: controller.signal },
    );
  } catch (e) {
    const isAbort = e instanceof Error && e.name === "AbortError";
    throw new AutomationDraftStepError(
      isAbort ? "llm_timeout" : "llm_error",
      isAbort ? "Draft generation timed out" : "Draft generation failed",
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const usage = completion.usage;
  recordUsage({
    userId: execution.userId,
    accountId: execution.accountId,
    operation: "automation_draft",
    inputTokens: usage?.prompt_tokens ?? 0,
    outputTokens: usage?.completion_tokens ?? 0,
    model: completion.model ?? undefined,
  });

  let parsed: { subject?: string; body?: string };
  try {
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    parsed = JSON.parse(jsonStr) as { subject?: string; body?: string };
  } catch {
    throw new AutomationDraftStepError("parse_error", "Failed to parse draft JSON from model");
  }

  const draftSubject =
    typeof parsed.subject === "string" && parsed.subject.trim().length > 0
      ? parsed.subject.trim()
      : lastExternal.subject.startsWith("Re:")
        ? lastExternal.subject
        : `Re: ${lastExternal.subject}`;

  const rawBody =
    typeof parsed.body === "string" && parsed.body.length > 0 ? parsed.body : "";
  const draftBody = emailBodyToPlainTextForDraft(rawBody);

  const safety = validateAutomationDraft({ draftSubject, draftBodyPlain: draftBody });
  if (!safety.ok) {
    throw new AutomationDraftStepError(safety.code, safety.message);
  }

  return {
    draftSubject,
    draftBody,
    draftMeta: {
      threadId,
      inReplyToInternetMessageId: lastExternal.internetMessageId,
      lastExternalEmailId: lastExternal.id,
      threadSubject: threadSubjectLine,
    },
    draftDecidedAt: new Date().toISOString(),
  };
}

export function mergeDraftFieldsIntoPayload(
  payload: Prisma.JsonValue,
  fields: AutomationDraftPayloadFields,
): Prisma.InputJsonValue {
  const existing =
    typeof payload === "object" && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : { value: payload };
  return {
    ...existing,
    draftSubject: fields.draftSubject,
    draftBody: fields.draftBody,
    draftMeta: fields.draftMeta,
    draftDecidedAt: fields.draftDecidedAt,
  } as Prisma.InputJsonValue;
}
