import { db } from "@/server/db";
import { Account } from "@/lib/accounts";
import { appendVectorMailSignature } from "@/lib/vectormail-signature";
import { log as auditLog } from "@/lib/audit/audit-log";
import { DEMO_ACCOUNT_ID, DEMO_USER_ID } from "@/lib/demo/constants";

export type SendReplyFailureReason =
  | "demo"
  | "thread_not_found"
  | "needs_reconnect"
  | "no_messages"
  | "send_failed";

export type SendReplyResult =
  | {
      ok: true;
      toAddress: string;
      toName: string | null;
      subject: string;
    }
  | {
      ok: false;
      reason: SendReplyFailureReason;
      message: string;
    };

export async function sendReplyToThread(opts: {
  userId: string;
  threadId: string;
  body: string;
  source: string;
}): Promise<SendReplyResult> {
  const { userId, threadId, body, source } = opts;

  if (userId === DEMO_USER_ID) {
    return {
      ok: false,
      reason: "demo",
      message: "Demo mode - connect a real mailbox to send replies.",
    };
  }

  const userAccountIds = await db.account
    .findMany({ where: { userId }, select: { id: true } })
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

  if (!thread || !userAccountIds.has(thread.accountId)) {
    return {
      ok: false,
      reason: "thread_not_found",
      message: "Couldn't find that thread on your account.",
    };
  }

  const account = thread.account;
  if (account.id === DEMO_ACCOUNT_ID) {
    return {
      ok: false,
      reason: "demo",
      message: "Demo mode - connect a real mailbox to send replies.",
    };
  }
  if (account.needsReconnection) {
    return {
      ok: false,
      reason: "needs_reconnect",
      message: "Reconnect your mailbox before sending - the auth token expired.",
    };
  }

  const lastEmail = thread.emails[0];
  if (!lastEmail) {
    return {
      ok: false,
      reason: "no_messages",
      message: "That thread has no messages to reply to.",
    };
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

  const subjectRaw = (thread.subject ?? "").trim();
  const subject = /^re:\s/i.test(subjectRaw)
    ? subjectRaw
    : subjectRaw
      ? `Re: ${subjectRaw}`
      : "Re:";

  const bodyWithSignature = appendVectorMailSignature(body.trim(), true);

  try {
    const emailAccount = new Account(account.id, account.token);
    await emailAccount.sendEmail({
      from,
      to,
      subject,
      body: bodyWithSignature,
      inReplyTo,
      threadId,
    });
  } catch (err) {
    return {
      ok: false,
      reason: "send_failed",
      message: err instanceof Error ? err.message : "Send failed.",
    };
  }

  auditLog({
    userId,
    action: "email_sent",
    resourceId: threadId,
    metadata: { accountId: account.id, source },
  });

  return {
    ok: true,
    toAddress: toAddress.address,
    toName: toAddress.name,
    subject,
  };
}
