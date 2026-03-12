import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { Account } from "@/lib/accounts";
import { appendVectorMailSignature } from "@/lib/vectormail-signature";
import { log as auditLog } from "@/lib/audit/audit-log";
import { rateLimit } from "@/lib/rate-limit";
import { DEMO_ACCOUNT_ID, DEMO_USER_ID } from "@/lib/demo/constants";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitRes = rateLimit(req, "emailSend");
    if (rateLimitRes) return rateLimitRes;

    if (userId === DEMO_USER_ID) {
      return NextResponse.json(
        { error: "Demo mode", message: "Connect your account to send emails." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { threadId, subject, body: draftBody } = body;

    if (!threadId || typeof threadId !== "string") {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 },
      );
    }
    if (typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "subject is required" },
        { status: 400 },
      );
    }
    if (typeof draftBody !== "string") {
      return NextResponse.json(
        { error: "body is required" },
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
          select: {
            id: true,
            emailAddress: true,
            name: true,
            token: true,
            customFromName: true,
            customFromAddress: true,
            needsReconnection: true,
          },
        },
        emails: {
          include: { from: true, replyTo: true },
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (!userAccountIds.has(thread.accountId)) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const account = thread.account as {
      id: string;
      emailAddress: string;
      name: string | null;
      token: string;
      customFromName: string | null;
      customFromAddress: string | null;
      needsReconnection: boolean;
    };

    if (account.id === DEMO_ACCOUNT_ID) {
      return NextResponse.json(
        { error: "Demo mode", message: "Connect your account to send emails." },
        { status: 403 },
      );
    }

    if (account.needsReconnection) {
      return NextResponse.json(
        {
          error: "Account needs reconnection",
          message: "Please reconnect your email account before sending.",
        },
        { status: 401 },
      );
    }

    const lastEmail = thread.emails[0] as
      | {
          internetMessageId: string;
          from: { address: string; name: string | null };
          replyTo: Array<{ address: string; name: string | null }>;
        }
      | undefined;

    if (!lastEmail) {
      return NextResponse.json(
        { error: "Thread has no messages" },
        { status: 400 },
      );
    }

    const toAddress = lastEmail.replyTo?.[0] ?? lastEmail.from;
    const to = [
      {
        name: toAddress.name ?? toAddress.address,
        address: toAddress.address,
      },
    ];
    const inReplyTo = lastEmail.internetMessageId ?? undefined;

    const from = account.customFromAddress
      ? {
          address: account.customFromAddress,
          name: account.customFromName ?? account.name ?? undefined,
        }
      : {
          address: account.emailAddress,
          name: account.name ?? undefined,
        };

    const bodyWithSignature = appendVectorMailSignature(draftBody.trim(), true);

    const emailAccount = new Account(account.id, account.token);
    await emailAccount.sendEmail({
      from,
      to,
      subject: subject.trim(),
      body: bodyWithSignature,
      inReplyTo,
      threadId,
    });

    auditLog({
      userId,
      action: "email_sent",
      resourceId: threadId,
      metadata: { accountId: account.id, source: "send_reply" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in send-reply:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send reply";
    return NextResponse.json(
      { error: "Send failed", message },
      { status: 500 },
    );
  }
}
