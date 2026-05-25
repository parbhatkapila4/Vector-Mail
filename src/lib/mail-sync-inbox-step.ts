import { Account } from "@/lib/accounts";
import { db } from "@/server/db";
import { serverLog } from "@/lib/logging/server-logger";

export type InboxSyncStepResult = {
  ok: boolean;
  hasMore: boolean;
  continueToken?: string;
  mode?: "delta" | "sync_api" | "chunks" | "sync_api_page" | "list_page";
};

function decodeContinueToken(token: string): {
  pageToken?: string;
  syncApiPageToken?: string;
} {
  try {
    const decoded = JSON.parse(
      Buffer.from(token, "base64url").toString(),
    ) as Record<string, unknown>;
    if (typeof decoded !== "object" || decoded === null) return {};
    return {
      pageToken: typeof decoded.pageToken === "string" ? decoded.pageToken : undefined,
      syncApiPageToken:
        typeof decoded.syncApiPageToken === "string"
          ? decoded.syncApiPageToken
          : undefined,
    };
  } catch {
    return {};
  }
}

function encodeContinueToken(
  pageToken: string,
  syncApiPageToken?: string,
): string {
  return Buffer.from(
    JSON.stringify({
      pageToken,
      sentUseLabel: false,
      sentOmitDate: false,
      sentUseIsOperator: false,
      sentFromMe: false,
      sentUseLabelIds: false,
      ...(syncApiPageToken != null ? { syncApiPageToken } : {}),
    }),
    "utf8",
  ).toString("base64url");
}


const WORKER_LIST_MS = 8_000;
const WORKER_GET_MS = 5_500;
const INBOX_LIST_PAGE_SIZE = 50;
const INBOX_BACKFILL_SAFETY_CAP = 2000;

export async function runInboxSyncOneStep(
  accountId: string,
  continueToken?: string,
): Promise<InboxSyncStepResult> {
  const accountRow = await db.account.findFirst({
    where: { id: accountId },
    select: {
      id: true,
      token: true,
      nextDeltaToken: true,
      needsReconnection: true,
    },
  });

  if (!accountRow?.token?.trim() || accountRow.needsReconnection) {
    return { ok: false, hasMore: false };
  }

  const emailAccount = new Account(accountId, accountRow.token);
  const { syncEmailsToDatabase } = await import("@/lib/sync-to-db");

  if (continueToken) {
    const decoded = decodeContinueToken(continueToken);
    const { syncApiPageToken, pageToken } = decoded;

    if (syncApiPageToken) {
      const syncResult = await emailAccount.getNextPageViaSyncApi(syncApiPageToken);
      if (syncResult.records.length > 0) {
        await syncEmailsToDatabase(syncResult.records, accountId);
      }
      if (syncResult.nextDeltaToken) {
        await db.account
          .update({
            where: { id: accountId },
            data: { nextDeltaToken: syncResult.nextDeltaToken },
          })
          .catch(() => { });
      }
      const hasMore = !!syncResult.nextPageToken;
      return {
        ok: true,
        hasMore,
        continueToken:
          hasMore && syncResult.nextPageToken
            ? encodeContinueToken("", syncResult.nextPageToken)
            : undefined,
        mode: "sync_api_page",
      };
    }

    const page = await emailAccount.fetchInboxPageViaList(
      INBOX_LIST_PAGE_SIZE,
      pageToken,
      WORKER_LIST_MS,
      WORKER_GET_MS,
    );
    const threadCount = await db.thread.count({
      where: { accountId, inboxStatus: true },
    });
    const reachedOldest = !page.nextPageToken;
    const hasMore =
      !reachedOldest && threadCount < INBOX_BACKFILL_SAFETY_CAP;
    if (!hasMore && !accountRow.nextDeltaToken) {
      await emailAccount.establishInboxDeltaToken();
    }
    return {
      ok: true,
      hasMore,
      continueToken: hasMore
        ? encodeContinueToken(page.nextPageToken!, undefined)
        : undefined,
      mode: "list_page",
    };
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const latestInbox = await db.thread.findFirst({
    where: { accountId, inboxStatus: true },
    orderBy: { lastMessageDate: "desc" },
    select: { lastMessageDate: true },
  });
  const inboxStale =
    !latestInbox?.lastMessageDate || latestInbox.lastMessageDate < oneDayAgo;
  const backfillComplete = !!accountRow.nextDeltaToken;

  if (backfillComplete && !inboxStale && accountRow.nextDeltaToken) {
    try {
      const latestSyncResult = await emailAccount.syncLatestEmails();
      if (!latestSyncResult.authError && latestSyncResult.success) {
        await db.account
          .update({
            where: { id: accountId },
            data: { lastInboxSyncAt: new Date() },
          })
          .catch(() => { });
        return { ok: true, hasMore: false, mode: "delta" };
      }
    } catch {
    }
  }

  const page = await emailAccount.fetchInboxPageViaList(
    INBOX_LIST_PAGE_SIZE,
    undefined,
    WORKER_LIST_MS,
    WORKER_GET_MS,
  );
  const newThreadCount = await db.thread.count({
    where: { accountId, inboxStatus: true },
  });
  const reachedOldest = !page.nextPageToken;
  const hasMore =
    !reachedOldest && !backfillComplete && newThreadCount < INBOX_BACKFILL_SAFETY_CAP;
  if (!hasMore && !backfillComplete) {
    await emailAccount.establishInboxDeltaToken();
  }
  return {
    ok: true,
    hasMore,
    continueToken: hasMore
      ? encodeContinueToken(page.nextPageToken!, undefined)
      : undefined,
    mode: "list_page",
  };
}

export async function finalizeInboxSync(accountId: string): Promise<void> {
  const { recalculateAllThreadStatuses } = await import("@/lib/sync-to-db");
  await recalculateAllThreadStatuses(accountId).catch((e) =>
    serverLog.error(
      { err: e instanceof Error ? e.message : String(e), accountId },
      "finalizeInboxSync: recalculateAllThreadStatuses failed",
    ),
  );
  await db.account
    .update({
      where: { id: accountId },
      data: { lastInboxSyncAt: new Date() },
    })
    .catch(() => { });
}
