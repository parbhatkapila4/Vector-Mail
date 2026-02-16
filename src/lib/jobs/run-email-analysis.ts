
import { db } from "@/server/db";
import { analyzeEmail } from "@/lib/email-analysis";
import { arrayToVector } from "@/lib/vector-utils";
import { serverLog } from "@/lib/logging/server-logger";
import type { EmailMessage } from "@/types";

function dbEmailToEmailMessage(email: {
  id: string;
  threadId: string;
  createdTime: Date;
  lastModifiedTime: Date;
  sentAt: Date;
  receivedAt: Date;
  internetMessageId: string;
  subject: string;
  sysLabels: string[] | null;
  keywords: string[] | null;
  sysClassifications: string[] | null;
  sensitivity: string | null;
  meetingMessageMethod: string | null;
  hasAttachments: boolean;
  body: string | null;
  bodySnippet: string | null;
  inReplyTo: string | null;
  references: string | null;
  threadIndex: string | null;
  internetHeaders: unknown;
  nativeProperties: unknown;
  folderId: string | null;
  omitted: string[] | null;
  from: { address: string; name: string | null };
  to: Array<{ address: string; name: string | null }>;
  cc: Array<{ address: string; name: string | null }>;
  bcc: Array<{ address: string; name: string | null }>;
  replyTo: Array<{ address: string; name: string | null }>;
  attachments: Array<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
    inline: boolean;
    contentId: string | null;
    content: string | null;
    contentLocation: string | null;
  }>;
}): EmailMessage {
  return {
    id: email.id,
    threadId: email.threadId,
    createdTime: email.createdTime.toISOString(),
    lastModifiedTime: email.lastModifiedTime.toISOString(),
    sentAt: email.sentAt.toISOString(),
    receivedAt: email.receivedAt.toISOString(),
    internetMessageId: email.internetMessageId,
    subject: email.subject,
    sysLabels: (email.sysLabels ?? []) as EmailMessage["sysLabels"],
    keywords: email.keywords ?? [],
    sysClassifications: (email.sysClassifications ??
      []) as EmailMessage["sysClassifications"],
    sensitivity: (email.sensitivity as EmailMessage["sensitivity"]) ?? "normal",
    meetingMessageMethod: email.meetingMessageMethod as
      | "request"
      | "reply"
      | "cancel"
      | "counter"
      | "other"
      | undefined,
    from: {
      address: email.from.address,
      name: email.from.name ?? "",
    },
    to: email.to.map((t) => ({ address: t.address, name: t.name ?? "" })),
    cc: email.cc.map((c) => ({ address: c.address, name: c.name ?? "" })),
    bcc: email.bcc.map((b) => ({ address: b.address, name: b.name ?? "" })),
    replyTo: email.replyTo.map((r) => ({
      address: r.address,
      name: r.name ?? "",
    })),
    hasAttachments: email.hasAttachments,
    body: email.body ?? undefined,
    bodySnippet: email.bodySnippet ?? undefined,
    attachments: email.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      mimeType: a.mimeType,
      size: a.size,
      inline: a.inline,
      contentId: a.contentId ?? undefined,
      content: a.content ?? undefined,
      contentLocation: a.contentLocation ?? undefined,
    })),
    inReplyTo: email.inReplyTo ?? undefined,
    references: email.references ?? undefined,
    threadIndex: email.threadIndex ?? undefined,
    internetHeaders: (email.internetHeaders ?? []) as EmailMessage["internetHeaders"],
    nativeProperties: (email.nativeProperties ?? {}) as EmailMessage["nativeProperties"],
    folderId: email.folderId ?? undefined,
    omitted: (email.omitted ?? []) as EmailMessage["omitted"],
  };
}

export async function runEmailAnalysisForOne(
  emailId: string,
  options?: { userId?: string; accountId?: string },
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const email = await db.email.findFirst({
    where: { id: emailId },
    include: {
      from: true,
      to: true,
      cc: true,
      bcc: true,
      replyTo: true,
      attachments: true,
    },
  });

  if (!email) {
    serverLog.warn({ emailId }, "runEmailAnalysisForOne: email not found");
    return { ok: false, error: "email_not_found" };
  }

  const embedding = (email as { embedding?: unknown }).embedding;
  const hasEmbedding =
    embedding != null &&
    (typeof embedding !== "string" || (embedding as string).trim().length > 0);
  if (hasEmbedding) {
    serverLog.info(
      { emailId },
      "runEmailAnalysisForOne: embedding already set, skip",
    );
    return { ok: true, skipped: true };
  }

  const start = Date.now();
  try {
    const emailMessage = dbEmailToEmailMessage(email);
    const analysis = await analyzeEmail(emailMessage, options);
    const embeddingVector = arrayToVector(analysis.vectorEmbedding);

    await db.email.update({
      where: { id: emailId },
      data: { summary: analysis.summary, keywords: analysis.tags },
    });
    await db.$executeRaw`
      UPDATE "Email"
      SET embedding = ${embeddingVector}::vector
      WHERE id = ${emailId}
    `;

    serverLog.info(
      {
        event: "embedding_success",
        emailId,
        durationMs: Date.now() - start,
      },
      "runEmailAnalysisForOne: embedding generated",
    );
    return { ok: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    serverLog.error(
      {
        event: "embedding_failure",
        emailId,
        durationMs: Date.now() - start,
        error: errorMessage,
      },
      "runEmailAnalysisForOne: embedding failed",
    );
    return { ok: false, error: errorMessage };
  }
}

export async function runEmailAnalysisForMany(
  emailIds: string[],
  options?: { userId?: string; accountId?: string },
): Promise<{ processed: number; failed: number; skipped: number }> {
  let processed = 0;
  let failed = 0;
  let skipped = 0;
  for (const emailId of emailIds) {
    const result = await runEmailAnalysisForOne(emailId, options);
    if (result.skipped) skipped++;
    else if (result.ok) processed++;
    else failed++;
  }
  return { processed, failed, skipped };
}
