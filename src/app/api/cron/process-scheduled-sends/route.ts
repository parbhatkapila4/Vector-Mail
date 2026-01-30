import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";
import { Account } from "@/lib/accounts";
import { sendEmailRest } from "@/lib/send-email-rest";

export const runtime = "nodejs";
export const maxDuration = 60;

const LIMIT = 50;

function isAuthorized(req: NextRequest): boolean {
  const secret = env.CRON_SECRET;
  if (!secret) {
    console.warn(
      "[process-scheduled-sends] CRON_SECRET not set; route should be protected",
    );
    return false;
  }
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  const headerSecret = req.headers.get("x-cron-secret");
  return bearer === secret || headerSecret === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return processScheduledSends();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return processScheduledSends();
}

async function processScheduledSends() {
  const enableEmailSend =
    env.ENABLE_EMAIL_SEND ?? process.env.ENABLE_EMAIL_SEND === "true";

  if (!enableEmailSend) {
    return NextResponse.json(
      { error: "Email sending is disabled", processed: 0, failed: 0 },
      { status: 403 },
    );
  }

  const now = new Date();
  const due = await db.scheduledSend.findMany({
    where: {
      status: "pending",
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: LIMIT,
  });

  let processed = 0;
  let failed = 0;

  for (const row of due) {
    const payload = row.payload as
      | { type: "rest"; accountId: string; to: string[]; subject: string; body: string; cc?: string[]; bcc?: string[]; attachments?: Array<{ name: string; content: string; contentType: string }> }
      | {
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
      };

    if (!payload || typeof payload !== "object" || !("type" in payload)) {
      console.error(
        `[process-scheduled-sends] Invalid payload for ${row.id}, marking failed`,
      );
      await db.scheduledSend.update({
        where: { id: row.id },
        data: { status: "failed" },
      });
      failed++;
      continue;
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
      console.error(
        `[process-scheduled-sends] Account ${row.accountId} not found for ${row.id}, marking failed`,
      );
      await db.scheduledSend.update({
        where: { id: row.id },
        data: { status: "failed" },
      });
      failed++;
      continue;
    }

    try {
      if (payload.type === "trpc") {
        const emailAccount = new Account(account.id, account.token);
        await emailAccount.sendEmail({
          from: payload.from,
          to: payload.to,
          subject: payload.subject,
          body: payload.body,
          threadId: payload.threadId,
          inReplyTo: payload.inReplyTo,
          references: payload.references,
          replyTo: payload.replyTo,
          cc: payload.cc,
          bcc: payload.bcc,
        });
      } else {
        await sendEmailRest(account, {
          accountId: payload.accountId,
          to: payload.to,
          subject: payload.subject,
          body: payload.body,
          cc: payload.cc,
          bcc: payload.bcc,
          attachments: payload.attachments,
        });
      }

      await db.scheduledSend.update({
        where: { id: row.id },
        data: { status: "sent", sentAt: new Date() },
      });
      processed++;
    } catch (err) {
      console.error(
        `[process-scheduled-sends] Send failed for ${row.id}:`,
        err,
      );
      await db.scheduledSend.update({
        where: { id: row.id },
        data: { status: "failed" },
      });
      failed++;
    }
  }

  return NextResponse.json(
    { processed, failed, due: due.length },
    { status: 200 },
  );
}
