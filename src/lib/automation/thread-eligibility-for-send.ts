import { db, withDbRetry } from "@/server/db";

export type ThreadSendEligibilityOk = {
  ok: true;
  lastExternal: {
    id: string;
    internetMessageId: string;
    from: { address: string; name: string | null };
    replyTo: Array<{ address: string; name: string | null }>;
  };
};

export type ThreadSendEligibilityFail = {
  ok: false;
  reason: string;
};

export type ThreadSendEligibility = ThreadSendEligibilityOk | ThreadSendEligibilityFail;

function threadHasTrashEmail(
  emails: Array<{ sysLabels: string[] }>,
): boolean {
  return emails.some((e) =>
    (e.sysLabels ?? []).some((l) => String(l).toLowerCase() === "trash"),
  );
}

/**
 * Re-fetch thread + messages and match detect.ts-style eligibility before a real automation send.
 */
export async function evaluateThreadEligibilityForAutoFollowUpSend(params: {
  threadId: string;
  accountId: string;
  accountEmailLower: string;
  now: Date;
  expectedLastExternalEmailId: string;
  expectedInReplyToInternetMessageId: string;
  /** When set to `unreplied_external`, align with detect.ts draft filter. */
  detectorReasonCode?: string | null;
}): Promise<ThreadSendEligibility> {
  const thread = await withDbRetry(() =>
    db.thread.findFirst({
      where: { id: params.threadId, accountId: params.accountId },
      select: {
        id: true,
        done: true,
        inboxStatus: true,
        snoozedUntil: true,
        draftStatus: true,
        emails: {
          orderBy: { sentAt: "asc" },
          select: {
            id: true,
            sentAt: true,
            internetMessageId: true,
            sysLabels: true,
            from: { select: { address: true, name: true } },
            replyTo: { select: { address: true, name: true } },
          },
        },
      },
    }),
  );

  if (!thread) {
    return { ok: false, reason: "thread_not_found" };
  }
  if (thread.done) {
    return { ok: false, reason: "thread_done" };
  }
  if (!thread.inboxStatus) {
    return { ok: false, reason: "thread_not_in_inbox" };
  }
  if (thread.snoozedUntil && thread.snoozedUntil > params.now) {
    return { ok: false, reason: "thread_snoozed" };
  }
  if (threadHasTrashEmail(thread.emails)) {
    return { ok: false, reason: "thread_in_trash" };
  }
  if (
    params.detectorReasonCode !== "reminder_due" &&
    thread.draftStatus
  ) {
    return { ok: false, reason: "thread_has_draft" };
  }

  const emails = thread.emails;
  if (emails.length === 0) {
    return { ok: false, reason: "no_messages" };
  }

  const last = emails[emails.length - 1];
  if (!last?.from?.address) {
    return { ok: false, reason: "last_message_invalid" };
  }

  if (last.from.address.toLowerCase() === params.accountEmailLower) {
    return { ok: false, reason: "user_already_replied" };
  }

  let lastExternal = last;
  for (let i = emails.length - 1; i >= 0; i--) {
    const e = emails[i];
    if (!e) continue;
    if (e.from.address.toLowerCase() !== params.accountEmailLower) {
      lastExternal = e;
      break;
    }
  }

  if (lastExternal.id !== params.expectedLastExternalEmailId) {
    return { ok: false, reason: "thread_changed_last_external_mismatch" };
  }
  if (lastExternal.internetMessageId !== params.expectedInReplyToInternetMessageId) {
    return { ok: false, reason: "thread_changed_in_reply_to_mismatch" };
  }

  return {
    ok: true,
    lastExternal: {
      id: lastExternal.id,
      internetMessageId: lastExternal.internetMessageId,
      from: lastExternal.from,
      replyTo: lastExternal.replyTo,
    },
  };
}
