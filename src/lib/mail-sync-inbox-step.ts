import { Account } from "@/lib/accounts";
import { db } from "@/server/db";

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


const WORKER_SYNC_API_MS_STALE = 8_000;
const WORKER_SYNC_API_MS_FRESH = 6_000;
const WORKER_CHUNK_IDS_STALE = 28;
const WORKER_CHUNK_IDS_FRESH = 40;
const WORKER_LIST_MS = 8_000;
const WORKER_GET_MS = 5_500;

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

    const result = await emailAccount.fetchEmailsByFolderOnePage(
      "inbox",
      pageToken,
      false,
      false,
      false,
      false,
      false,
      false,
      400,
    );
    if (result.emails.length > 0) {
      await syncEmailsToDatabase(result.emails, accountId);
    }
    const hasMore = !!result.nextPageToken;
    return {
      ok: true,
      hasMore,
      continueToken: hasMore
        ? encodeContinueToken(result.nextPageToken!, undefined)
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

  if (!inboxStale && accountRow.nextDeltaToken) {
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

  if (inboxStale) {
    await db.account
      .update({ where: { id: accountId }, data: { nextDeltaToken: null } })
      .catch(() => { });
  }

  const syncApiTimeoutMs = inboxStale
    ? WORKER_SYNC_API_MS_STALE
    : WORKER_SYNC_API_MS_FRESH;
  const syncApiFirstPage =
    await emailAccount.tryGetFirstPageViaSyncApi(syncApiTimeoutMs);

  if (
    syncApiFirstPage &&
    (syncApiFirstPage.records.length > 0 || syncApiFirstPage.nextPageToken)
  ) {
    if (syncApiFirstPage.records.length > 0) {
      await syncEmailsToDatabase(syncApiFirstPage.records, accountId);
    }
    if (syncApiFirstPage.nextDeltaToken) {
      await db.account
        .update({
          where: { id: accountId },
          data: { nextDeltaToken: syncApiFirstPage.nextDeltaToken },
        })
        .catch(() => { });
    }
    const hasMore = !!syncApiFirstPage.nextPageToken;
    return {
      ok: true,
      hasMore,
      continueToken:
        hasMore && syncApiFirstPage.nextPageToken
          ? encodeContinueToken("", syncApiFirstPage.nextPageToken)
          : undefined,
      mode: "sync_api",
    };
  }

  const chunkMaxIds = inboxStale ? WORKER_CHUNK_IDS_STALE : WORKER_CHUNK_IDS_FRESH;
  const result = await emailAccount.fetchInboxFirstPageInChunks(
    chunkMaxIds,
    5,
    WORKER_LIST_MS,
    WORKER_GET_MS,
  );
  const hasMore = !!result.nextPageToken;
  return {
    ok: true,
    hasMore,
    continueToken: hasMore
      ? encodeContinueToken(result.nextPageToken!, undefined)
      : undefined,
    mode: "chunks",
  };
}

export async function finalizeInboxSync(accountId: string): Promise<void> {
  const { recalculateAllThreadStatuses } = await import("@/lib/sync-to-db");
  await recalculateAllThreadStatuses(accountId).catch((e) =>
    console.error("[finalizeInboxSync] recalculateAllThreadStatuses:", e),
  );
  await db.account
    .update({
      where: { id: accountId },
      data: { lastInboxSyncAt: new Date() },
    })
    .catch(() => { });
}
