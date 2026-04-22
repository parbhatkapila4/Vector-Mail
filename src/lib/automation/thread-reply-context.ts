import { db } from "@/server/db";

export const REPLY_SUGGEST_MAX_MESSAGES = 8;
export const REPLY_SUGGEST_MAX_CHARS_PER_MESSAGE = 1200;

export type ReplySuggestEmail = {
  subject: string;
  body: string | null;
  bodySnippet: string | null;
  sentAt: Date;
  internetMessageId: string;
  from: { address: string; name: string | null };
};

export function buildThreadContextBlock(
  emails: ReplySuggestEmail[],
  accountEmailLower: string,
  totalEmailCount: number,
): string {
  const recentEmails =
    emails.length > REPLY_SUGGEST_MAX_MESSAGES
      ? emails.slice(-REPLY_SUGGEST_MAX_MESSAGES)
      : emails;
  const startIndex = totalEmailCount - recentEmails.length;
  return recentEmails
    .map((e, i) => {
      const bodyText = e.body ?? e.bodySnippet ?? "";
      const snippet =
        bodyText.length > REPLY_SUGGEST_MAX_CHARS_PER_MESSAGE
          ? bodyText.slice(0, REPLY_SUGGEST_MAX_CHARS_PER_MESSAGE) + "..."
          : bodyText;
      const fromAddr = e.from?.address ?? "";
      const isUser = fromAddr.toLowerCase() === accountEmailLower;
      return `[Message ${startIndex + i + 1}] From: ${e.from?.name ?? e.from?.address ?? fromAddr} <${fromAddr}>${isUser ? " (USER - match this tone)" : ""}
Date: ${new Date(e.sentAt).toISOString()}
Subject: ${e.subject}
Body: ${snippet}`;
    })
    .join("\n\n");
}

export async function loadThreadForReplySuggest(params: {
  threadId: string;
  accountId?: string;
  userId?: string;
}) {
  const thread = await db.thread.findFirst({
    where: {
      id: params.threadId,
      ...(params.accountId ? { accountId: params.accountId } : {}),
    },
    include: {
      account: {
        select: { id: true, emailAddress: true, name: true, userId: true },
      },
      emails: {
        include: { from: true, to: true },
        orderBy: { sentAt: "asc" },
      },
    },
  });
  if (!thread) return null;
  if (params.userId && thread.account.userId !== params.userId) {
    return null;
  }
  if (params.accountId && thread.accountId !== params.accountId) {
    return null;
  }
  return thread;
}
