import { db } from "@/server/db";
import { Account } from "@/lib/accounts";
import { log as auditLog } from "@/lib/audit/audit-log";
import { sendEmailRest } from "@/lib/send-email-rest";
import { serverLog } from "@/lib/logging/server-logger";

type RestPayload = {
  type: "rest";
  accountId: string;
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  trackOpens?: boolean;
  attachments?: Array<{ name: string; content: string; contentType: string }>;
};

type TrpcPayload = {
  type: "trpc";
  accountId: string;
  from: { address: string; name: string };
  to: Array<{ address: string; name: string }>;
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
  replyTo?: { address: string; name: string };
  cc?: Array<{ address: string; name: string }>;
  bcc?: Array<{ address: string; name: string }>;
  trackOpens?: boolean;
};

type Payload = RestPayload | TrpcPayload;

export async function runScheduledSend(
  scheduledSendId: string,
): Promise<{ ok: boolean; error?: string }> {
  const row = await db.scheduledSend.findFirst({
    where: { id: scheduledSendId },
  });

  if (!row) {
    serverLog.warn(
      { scheduledSendId },
      "runScheduledSend: scheduled send not found",
    );
    return { ok: false, error: "scheduled_send_not_found" };
  }

  if (row.status !== "pending") {
    serverLog.info(
      { scheduledSendId, status: row.status },
      "runScheduledSend: skip non-pending",
    );
    return { ok: true };
  }

  const payload = row.payload as Payload | null;

  if (!payload || typeof payload !== "object" || !("type" in payload)) {
    serverLog.error(
      {
        event: "scheduled_send_failed",
        scheduledSendId: row.id,
        accountId: row.accountId,
        error: "invalid_payload",
      },
      "scheduled send invalid payload",
    );
    await db.scheduledSend.update({
      where: { id: row.id },
      data: { status: "failed" },
    });
    return { ok: false, error: "invalid_payload" };
  }

  const account = await db.account.findFirst({
    where: { id: row.accountId },
    select: {
      id: true,
      token: true,
      emailAddress: true,
      name: true,
    },
  });

  if (!account) {
    serverLog.error(
      {
        event: "scheduled_send_failed",
        scheduledSendId: row.id,
        accountId: row.accountId,
        error: "account_not_found",
      },
      "scheduled send account not found",
    );
    await db.scheduledSend.update({
      where: { id: row.id },
      data: { status: "failed" },
    });
    return { ok: false, error: "account_not_found" };
  }

  let messageId: string | undefined;
  try {
    if (payload.type === "trpc") {
      let body = payload.body;
      let trackingId: string | null = null;
      if (payload.trackOpens) {
        try {
          const {
            createTrackingRecord,
            getTrackingPixelUrl,
            injectTrackingPixel,
          } = await import("@/lib/email-open-tracking");
          trackingId = await createTrackingRecord(account.id);
          const pixelUrl = getTrackingPixelUrl(trackingId);
          body = injectTrackingPixel(payload.body, pixelUrl);
        } catch {
          trackingId = null;
        }
      }
      const emailAccount = new Account(account.id, account.token);
      const result = await emailAccount.sendEmail({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        body,
        threadId: payload.threadId,
        inReplyTo: payload.inReplyTo,
        references: payload.references,
        replyTo: payload.replyTo,
        cc: payload.cc,
        bcc: payload.bcc,
      });
      messageId = (result as { id?: string })?.id;
      if (
        payload.trackOpens &&
        trackingId &&
        (result as { id?: string })?.id
      ) {
        try {
          const { updateTrackingMessageId } = await import(
            "@/lib/email-open-tracking"
          );
          await updateTrackingMessageId(
            trackingId,
            String((result as { id: string }).id),
          );
        } catch {

        }
      }
    } else {
      await sendEmailRest(account, {
        accountId: payload.accountId,
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
        cc: payload.cc,
        bcc: payload.bcc,
        trackOpens: payload.trackOpens,
        attachments: payload.attachments,
      });
    }

    await db.scheduledSend.update({
      where: { id: row.id },
      data: { status: "sent", sentAt: new Date() },
    });
    auditLog({
      userId: row.userId,
      action: "email_sent",
      resourceId: messageId ?? row.id,
      metadata: { accountId: row.accountId, scheduledSendId: row.id },
    });
    return { ok: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    serverLog.error(
      {
        event: "scheduled_send_failed",
        scheduledSendId: row.id,
        accountId: row.accountId,
        error: errorMessage,
      },
      "scheduled send failed",
    );
    await db.scheduledSend.update({
      where: { id: row.id },
      data: { status: "failed" },
    });
    return { ok: false, error: errorMessage };
  }
}
