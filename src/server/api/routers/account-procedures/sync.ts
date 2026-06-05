import { TRPCError } from "@trpc/server";
import { z } from "zod";
import axios from "axios";

import { protectedProcedure } from "@/server/api/trpc";
import {
  Account,
  isInvalidAurinkoSyncTokenError,
  isTransientMailProviderError,
} from "@/lib/accounts";
import { incrementSyncFailure } from "@/lib/metrics/store";
import { isDemoCall } from "@/lib/demo/predicate";
import { DEMO_USER_ID } from "@/lib/demo/constants";
import { log as auditLog } from "@/lib/audit/audit-log";
import { makeTagLogger } from "@/lib/logging/console-shim";

import { authoriseAccountAccess, type AccountAccess } from "./shared";

const syncLog = makeTagLogger("account-router.sync");

const INBOX_LIST_PAGE_SIZE = 50;
const INBOX_BACKFILL_SAFETY_CAP = 2000;

export const syncProcedures = {
  syncFirstBatchQuick: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return { count: 0 };
      }
      if (!ctx.auth.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to sync emails" });
      }
      let account: AccountAccess;
      try {
        account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found or you don't have access to it" });
      }
      if (!account.token?.trim()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Account token is missing. Please reconnect your account." });
      }
      let emailAccount = new Account(account.id, account.token);
      const tokenExpiredOrExpiringSoon =
        account.tokenExpiresAt &&
        account.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000;
      let refreshedAtRisk = false;
      if (account.needsReconnection || tokenExpiredOrExpiringSoon) {
        const refreshed = await emailAccount.refreshTokenIfPossible();
        refreshedAtRisk = refreshed;
        if (refreshed) {
          const updated = await ctx.db.account.findUnique({
            where: { id: account.id },
            select: { token: true },
          });
          if (updated?.token) {
            account = { ...account, token: updated.token, needsReconnection: false };
            emailAccount = new Account(account.id, account.token);
          }
        }
      }
      if (account.needsReconnection && !refreshedAtRisk) {
        const tokenOk = await emailAccount.ensureValidToken();
        if (!tokenOk) return { count: 0 };
        account = { ...account, needsReconnection: false };
      }
      try {
        const result = await emailAccount.syncFirstBatchQuick();
        await ctx.db.account
          .update({
            where: { id: account.id },
            data: { needsReconnection: false },
          })
          .catch(() => { });
        return { count: result.count };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const timedOut =
            error.code === "ECONNABORTED" ||
            /timeout/i.test(error.message ?? "") ||
            /timed out/i.test(String(error.response?.data ?? ""));
          if (timedOut) {
            syncLog.warn(
              `[syncFirstBatchQuick] Aurinko timeout for account ${account.id} (list/fetch slower than limit). User can use Sync to retry.`,
            );
            throw new TRPCError({
              code: "TIMEOUT",
              message:
                "Initial mail fetch timed out; the provider was slow. Use Sync or wait; your inbox will update when it responds.",
            });
          }
          if (error.response?.status === 401) {
            await ctx.db.account
              .update({
                where: { id: account.id },
                data: { needsReconnection: true },
              })
              .catch(() => { });
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message:
                "Gmail access expired. Use Reconnect once - you stay signed in to VectorMail.",
            });
          }
        }
        throw error;
      }
    }),


  getInboxPreview: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        limit: z.number().min(1).max(50).optional().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return { items: [], needsReconnection: false };
      }
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }
      let account: AccountAccess;
      try {
        account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found or you don't have access to it",
        });
      }
      if (!account.token?.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account token is missing. Please reconnect your account.",
        });
      }

      let emailAccount = new Account(account.id, account.token);
      const tokenExpiredOrExpiringSoon =
        account.tokenExpiresAt &&
        account.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000;
      let refreshedAtRisk = false;
      if (account.needsReconnection || tokenExpiredOrExpiringSoon) {
        const refreshed = await emailAccount.refreshTokenIfPossible();
        refreshedAtRisk = refreshed;
        if (refreshed) {
          const updated = await ctx.db.account.findUnique({
            where: { id: account.id },
            select: { token: true },
          });
          if (updated?.token) {
            account = { ...account, token: updated.token, needsReconnection: false };
            emailAccount = new Account(account.id, account.token);
          }
        }
      }
      if (account.needsReconnection && !refreshedAtRisk) {
        const tokenOk = await emailAccount.ensureValidToken();
        if (!tokenOk) return { items: [], needsReconnection: true };
        account = { ...account, needsReconnection: false };
      }

      try {
        const items = await emailAccount.getInboxPreview(input.limit);
        return { items, needsReconnection: false };
      } catch (error) {
        const ax = axios.isAxiosError(error) ? error : null;
        const status = ax?.response?.status;
        const body = ax?.response?.data as { code?: string } | undefined;
        const tokenDead = body?.code === "token.dead";
        if (status === 401 || tokenDead) {
          await ctx.db.account
            .update({
              where: { id: account.id },
              data: { needsReconnection: true },
            })
            .catch((err) =>
              syncLog.error(`[getInboxPreview] Failed to set needsReconnection:`, err),
            );
          return { items: [], needsReconnection: true };
        }
        throw error;
      }
    }),

  syncEmails: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        forceFullSync: z.boolean().optional().default(false),
        folder: z.enum(["inbox", "sent", "trash"]).optional().default("inbox"),
        continueToken: z.string().optional(),
        syncAllFolders: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return { success: true, message: "Demo mode - no sync", needsReconnection: false };
      }
      if (!ctx.auth.userId) {
        syncLog.error("[syncEmails mutation] User not authenticated");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to sync emails",
        });
      }

      const accountId = input.accountId?.trim() ?? "";
      if (!accountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account ID is required",
        });
      }

      let account: AccountAccess;
      try {
        account = await authoriseAccountAccess(
          accountId,
          ctx.auth.userId,
        );
      } catch (error) {
        syncLog.error(
          "[syncEmails mutation] Account authorization failed:",
          error,
        );
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found or you don't have access to it",
        });
      }

      if (!account.token || account.token.trim().length === 0) {
        syncLog.error(
          `[syncEmails mutation] Account ${account.id} has no token, cannot sync.`,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account token is missing. Please reconnect your account.",
        });
      }

      let emailAccount = new Account(account.id, account.token);
      if (account.needsReconnection) {
        const snap = await ctx.db.account.findFirst({
          where: { id: account.id, userId: ctx.auth.userId },
          select: {
            id: true,
            emailAddress: true,
            name: true,
            token: true,
            nextDeltaToken: true,
            inboxBackfilledAt: true,
            needsReconnection: true,
            tokenExpiresAt: true,
          },
        });
        if (snap) {
          account = snap;
          emailAccount = new Account(account.id, account.token);
        }
      }
      const tokenExpiredOrExpiringSoon =
        account.tokenExpiresAt &&
        account.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000;
      let refreshedAtRisk = false;
      if (account.needsReconnection || tokenExpiredOrExpiringSoon) {
        const refreshed = await emailAccount.refreshTokenIfPossible();
        refreshedAtRisk = refreshed;
        if (refreshed) {
          const updated = await ctx.db.account.findUnique({
            where: { id: account.id },
            select: { token: true },
          });
          if (updated?.token) {
            account = { ...account, token: updated.token, needsReconnection: false };
            emailAccount = new Account(account.id, account.token);
          }
        }
      }
      if (account.needsReconnection && !refreshedAtRisk) {
        const tokenOk = await emailAccount.ensureValidToken();
        if (!tokenOk) {
          return {
            success: false,
            message: "Gmail access expired. Reconnect your mailbox to resume sync.",
            needsReconnection: true,
          };
        }
        account = { ...account, needsReconnection: false };
      }

      const syncStartTime = Date.now();

      const shouldForceFullSync = input.forceFullSync ?? false;
      const folder: "inbox" | "sent" | "trash" = input.folder ?? "inbox";
      const syncAllFolders = input.syncAllFolders ?? false;
      auditLog({
        userId: ctx.auth.userId,
        action: "sync_triggered",
        resourceId: input.accountId,
        metadata: syncAllFolders ? { syncAllFolders: true } : { folder },
      });

      const queueConfiguredForProduction =
        process.env.NODE_ENV === "production" &&
        !!process.env.INNGEST_EVENT_KEY?.trim() &&
        !!process.env.INNGEST_SIGNING_KEY?.trim();

      if (
        queueConfiguredForProduction &&
        !syncAllFolders &&
        !shouldForceFullSync &&
        !input.continueToken &&
        folder === "inbox" &&
        !!account.inboxBackfilledAt &&
        ctx.auth.userId !== DEMO_USER_ID
      ) {
        const { enqueueAccountMailSync } = await import("@/lib/jobs/enqueue");
        const enqueued = await enqueueAccountMailSync(
          account.id,
          ctx.auth.userId,
        );
        if (enqueued) {
          ctx.log?.info(
            { event: "sync_background_enqueued", accountId: account.id },
            "inbox sync delegated to Inngest",
          );
          return {
            success: true,
            background: true,
            message:
              "Sync is running in the background. New mail will appear shortly.",
            needsReconnection: false,
          };
        }
      }

      let currentAccount = account;
      let currentEmailAccount = emailAccount;
      const maxAttempts = 3;
      let lastError: unknown;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        account = currentAccount;
        emailAccount = currentEmailAccount;
        try {
          ctx.log?.info(
            {
              event: "sync_start",
              accountId: account.id,
              ...(attempt > 0 ? { retryAfterRefresh: true } : {}),
              forceFullSync: shouldForceFullSync,
              folder: syncAllFolders ? "all" : folder,
            },
            "sync started",
          );
          if (syncAllFolders) {
            const { recalculateAllThreadStatuses } = await import("@/lib/sync-to-db");
            await emailAccount.syncAllFoldersInParallel();
            await recalculateAllThreadStatuses(account.id);
            const { enqueueEmbeddingJobsForAccount } = await import("@/lib/jobs/enqueue");
            enqueueEmbeddingJobsForAccount(account.id).catch((err) => {
              syncLog.error("[syncEmails] Enqueue embedding jobs failed:", err);
            });
            ctx.log?.info(
              {
                event: "sync_success",
                accountId: account.id,
                folder: "all",
                durationMs: Date.now() - syncStartTime,
                mode: "full_all_folders",
              },
              "sync all folders completed",
            );
            return {
              success: true,
              message: "Inbox, Sent, and Trash synced",
              syncAllFolders: true,
            };
          }

          const decodeContinueToken = (token: string): { pageToken?: string; syncApiPageToken?: string; sentUseLabel?: boolean; sentOmitDate?: boolean; sentUseIsOperator?: boolean; sentFromMe?: boolean; sentUseLabelIds?: boolean } => {
            try {
              const decoded = JSON.parse(Buffer.from(token, "base64url").toString()) as unknown;
              if (typeof decoded !== "object" || decoded === null) return {};
              const d = decoded as { pageToken?: string; syncApiPageToken?: string; sentUseLabel?: boolean; sentOmitDate?: boolean; sentUseIsOperator?: boolean; sentFromMe?: boolean; sentUseLabelIds?: boolean };
              return { pageToken: d.pageToken, syncApiPageToken: d.syncApiPageToken, sentUseLabel: d.sentUseLabel, sentOmitDate: d.sentOmitDate, sentUseIsOperator: d.sentUseIsOperator, sentFromMe: d.sentFromMe, sentUseLabelIds: d.sentUseLabelIds };
            } catch {
              return {};
            }
          };
          const encodeContinueToken = (pageToken: string, sentUseLabel?: boolean, sentOmitDate?: boolean, sentUseIsOperator?: boolean, sentFromMe?: boolean, sentUseLabelIds?: boolean, syncApiPageToken?: string) =>
            Buffer.from(JSON.stringify({ pageToken, sentUseLabel: sentUseLabel ?? false, sentOmitDate: sentOmitDate ?? false, sentUseIsOperator: sentUseIsOperator ?? false, sentFromMe: sentFromMe ?? false, sentUseLabelIds: sentUseLabelIds ?? false, ...(syncApiPageToken != null ? { syncApiPageToken } : {}) }), "utf8").toString("base64url");

          if (folder === "inbox" && !input.continueToken) {
            const result = await emailAccount.fetchInboxPageViaList(
              INBOX_LIST_PAGE_SIZE,
            );
            const threadCount = await ctx.db.thread.count({
              where: { accountId: account.id, inboxStatus: true },
            });
            const hasMore =
              !!result.nextPageToken &&
              !account.inboxBackfilledAt &&
              threadCount < INBOX_BACKFILL_SAFETY_CAP;
            const continueToken = hasMore
              ? encodeContinueToken(result.nextPageToken!, false, false, false, false, false)
              : undefined;
            if (!hasMore && !account.inboxBackfilledAt) {
              if (!account.nextDeltaToken) void emailAccount.establishInboxDeltaToken();
              await ctx.db.account
                .update({
                  where: { id: account.id },
                  data: { inboxBackfilledAt: new Date() },
                })
                .catch(() => { });
            }
            ctx.log?.info(
              {
                event: "sync_success",
                accountId: account.id,
                folder: "inbox",
                durationMs: Date.now() - syncStartTime,
                countSynced: result.fetched,
                threadCount,
                hasMore,
                source: "list_first_page",
              },
              "inbox first page done (list)",
            );
            return {
              success: true,
              message: result.fetched > 0 ? `Synced ${result.fetched} emails` : hasMore ? "Fetching more..." : "No more emails",
              threadCount,
              hasMore,
              continueToken,
            };
          }

          if ((folder === "inbox" || folder === "sent" || folder === "trash") && input.continueToken) {
            const decoded = decodeContinueToken(input.continueToken);
            const { syncApiPageToken } = decoded;
            const { pageToken, sentUseLabel, sentOmitDate, sentUseIsOperator, sentFromMe, sentUseLabelIds } = decoded;

            if (folder === "inbox" && syncApiPageToken) {
              let syncResult: Awaited<ReturnType<typeof emailAccount.getNextPageViaSyncApi>>;
              try {
                syncResult = await emailAccount.getNextPageViaSyncApi(syncApiPageToken);
              } catch (error) {
                if (isInvalidAurinkoSyncTokenError(error)) {
                  await ctx.db.account
                    .update({
                      where: { id: account.id },
                      data: { nextDeltaToken: null },
                    })
                    .catch(() => { });
                  const threadCount = await ctx.db.thread.count({
                    where: { accountId: account.id, inboxStatus: true },
                  });
                  ctx.log?.warn(
                    {
                      event: "sync_chunk_token_invalid_recovered",
                      accountId: account.id,
                      durationMs: Date.now() - syncStartTime,
                    },
                    "sync chunk token invalid; resetting token and continuing without failing UI",
                  );
                  return {
                    success: true,
                    message: "Resynced sync state. Continuing with latest inbox.",
                    threadCount,
                    hasMore: false,
                    continueToken: undefined,
                  };
                }
                throw error;
              }
              if (syncResult.records.length > 0) {
                const { syncEmailsToDatabase } = await import("@/lib/sync-to-db");
                await syncEmailsToDatabase(syncResult.records, account.id);
              }
              if (syncResult.nextDeltaToken) {
                await ctx.db.account.update({
                  where: { id: account.id },
                  data: { nextDeltaToken: syncResult.nextDeltaToken },
                }).catch(() => { });
              }
              const threadCount = await ctx.db.thread.count({
                where: { accountId: account.id, inboxStatus: true },
              });
              const hasMore = !!syncResult.nextPageToken;
              const nextContinueToken = hasMore && syncResult.nextPageToken
                ? encodeContinueToken("", false, false, false, false, false, syncResult.nextPageToken)
                : undefined;
              ctx.log?.info(
                {
                  event: "sync_success",
                  accountId: account.id,
                  folder: "inbox",
                  durationMs: Date.now() - syncStartTime,
                  countSynced: syncResult.records.length,
                  threadCount,
                  hasMore,
                  source: "sync_api",
                },
                "sync chunk done (Sync API)",
              );
              return {
                success: true,
                message: syncResult.records.length > 0 ? `Synced ${syncResult.records.length} emails` : hasMore ? "Fetching moreâ€¦" : "No more emails",
                threadCount,
                hasMore,
                continueToken: nextContinueToken,
              };
            }

            if (folder === "inbox") {
              const page = await emailAccount.fetchInboxPageViaList(
                INBOX_LIST_PAGE_SIZE,
                pageToken,
              );
              const threadCount = await ctx.db.thread.count({
                where: { accountId: account.id, inboxStatus: true },
              });
              const reachedOldest = !page.nextPageToken;
              const hasMore =
                !reachedOldest && threadCount < INBOX_BACKFILL_SAFETY_CAP;
              if (!hasMore) {
                const { recalculateAllThreadStatuses } = await import("@/lib/sync-to-db");
                await recalculateAllThreadStatuses(account.id);
                if (!account.nextDeltaToken) {
                  await emailAccount.establishInboxDeltaToken();
                }
                if (!account.inboxBackfilledAt) {
                  await ctx.db.account
                    .update({
                      where: { id: account.id },
                      data: { inboxBackfilledAt: new Date() },
                    })
                    .catch(() => { });
                }
              }
              const nextContinueToken = hasMore
                ? encodeContinueToken(page.nextPageToken!, false, false, false, false, false)
                : undefined;
              ctx.log?.info(
                {
                  event: "sync_success",
                  accountId: account.id,
                  folder: "inbox",
                  durationMs: Date.now() - syncStartTime,
                  countSynced: page.fetched,
                  threadCount,
                  hasMore,
                  source: "list_chunk",
                },
                "inbox chunk done (list)",
              );
              return {
                success: true,
                message: page.fetched > 0 ? `Synced ${page.fetched} emails` : hasMore ? "Fetching more..." : "No more emails",
                threadCount,
                hasMore,
                continueToken: nextContinueToken,
              };
            }

            const result = await emailAccount.fetchEmailsByFolderOnePage(
              folder,
              pageToken,
              sentUseLabel ?? false,
              folder === "sent" ? (sentOmitDate ?? false) : false,
              folder === "sent" ? (sentUseIsOperator ?? false) : false,
              folder === "sent" ? (sentFromMe ?? false) : false,
              folder === "sent" ? (sentUseLabelIds ?? false) : false,
              false,
              500,
            );
            if (result.emails.length > 0) {
              const { syncEmailsToDatabase } = await import("@/lib/sync-to-db");
              await syncEmailsToDatabase(result.emails, account.id);
            }
            const threadCount = await ctx.db.thread.count({
              where: folder === "trash"
                ? {
                  accountId: account.id,
                  emails: { some: { sysLabels: { hasSome: ["trash"] } } },
                }
                : {
                  accountId: account.id,
                  ...(folder === "sent" ? { sentStatus: true } : { inboxStatus: true }),
                },
            });
            const hasMore =
              folder === "sent" ? result.emails.length > 0 && !!result.nextPageToken : !!result.nextPageToken;
            const continueToken = hasMore ? encodeContinueToken(result.nextPageToken!, result.sentUseLabel, result.sentOmitDate, result.sentUseIsOperator, result.sentFromMe, result.sentUseLabelIds) : undefined;
            ctx.log?.info(
              {
                event: "sync_success",
                accountId: account.id,
                folder,
                durationMs: Date.now() - syncStartTime,
                countSynced: result.emails.length,
                threadCount,
                hasMore,
              },
              "sync chunk done",
            );
            return {
              success: true,
              message: result.emails.length > 0 ? `Synced ${result.emails.length} emails` : hasMore ? "Fetching moreâ€¦" : "No more emails",
              threadCount,
              hasMore,
              continueToken,
            };
          }

          if (
            !shouldForceFullSync &&
            account.nextDeltaToken &&
            folder !== "sent" &&
            folder !== "trash"
          ) {
            syncLog.log(
              `[syncEmails mutation] Attempting lightweight sync using delta token...`,
            );
            try {
              const latestSyncResult = await emailAccount.syncLatestEmails();

              if (latestSyncResult.authError) {
                syncLog.error(
                  `[syncEmails mutation] Authentication error - token is actually dead`,
                );


                const threadCount = await ctx.db.thread.count({
                  where: {
                    accountId: account.id,
                    ...(input.folder === "sent"
                      ? { sentStatus: true }
                      : { inboxStatus: true }),
                  },
                });

                const refreshAccount = new Account(account.id, account.token);
                const refreshed = await refreshAccount.refreshTokenIfPossible();
                if (refreshed) {
                  ctx.log?.info(
                    { event: "sync_token_refreshed", accountId: account.id },
                    "Token refreshed after auth error; next sync will use new token",
                  );
                  return {
                    success: false,
                    message: "Sync failed temporarily. Try again in a moment.",
                    threadCount,
                    needsReconnection: false,
                  };
                }
                ctx.log?.warn(
                  {
                    event: "sync_error",
                    accountId: account.id,
                    durationMs: Date.now() - syncStartTime,
                    error: "auth_error",
                    needsReconnection: true,
                  },
                  "sync auth error",
                );
                incrementSyncFailure();
                await ctx.db.account.update({
                  where: { id: account.id },
                  data: { needsReconnection: true },
                }).catch(err => syncLog.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));
                return {
                  success: false,
                  message: "Sync failed. Try again in a moment.",
                  threadCount,
                  needsReconnection: true,
                };
              }

              if (latestSyncResult.success && latestSyncResult.count > 0) {
                const threadCount = await ctx.db.thread.count({
                  where: {
                    accountId: account.id,
                    ...(input.folder === "sent"
                      ? { sentStatus: true }
                      : { inboxStatus: true }),
                  },
                });
                ctx.log?.info(
                  {
                    event: "sync_success",
                    accountId: account.id,
                    durationMs: Date.now() - syncStartTime,
                    countSynced: latestSyncResult.count,
                    threadCount,
                    mode: "lightweight",
                  },
                  "sync success (lightweight)",
                );
                const { enqueueEmbeddingJobsForAccount } = await import(
                  "@/lib/jobs/enqueue"
                );
                enqueueEmbeddingJobsForAccount(account.id).catch((err) => {
                  syncLog.error("[syncEmails] Enqueue embedding jobs failed:", err);
                });

                return {
                  success: true,
                  message: `Synced ${latestSyncResult.count} new emails`,
                  threadCount,
                };
              } else if (
                latestSyncResult.success &&
                latestSyncResult.count === 0
              ) {
                const threadCount = await ctx.db.thread.count({
                  where: {
                    accountId: account.id,
                    ...(input.folder === "sent"
                      ? { sentStatus: true }
                      : { inboxStatus: true }),
                  },
                });
                ctx.log?.info(
                  {
                    event: "sync_success",
                    accountId: account.id,
                    durationMs: Date.now() - syncStartTime,
                    countSynced: 0,
                    threadCount,
                    mode: "lightweight",
                  },
                  "sync success (no new emails)",
                );
                return {
                  success: true,
                  message: "No new emails to sync",
                  threadCount,
                };
              }
            } catch (lightweightError) {
              if (lightweightError instanceof TRPCError) {
                throw lightweightError;
              }

              const errorMessage =
                lightweightError instanceof Error
                  ? lightweightError.message
                  : String(lightweightError);

              syncLog.error(
                `[syncEmails mutation] Lightweight sync threw an error: ${errorMessage}`,
              );

              if (
                errorMessage.includes("Authentication failed") ||
                errorMessage.includes("Invalid token") ||
                errorMessage.includes("401") ||
                errorMessage.includes("UNAUTHORIZED") ||
                (axios.isAxiosError(lightweightError) &&
                  lightweightError.response?.status === 401)
              ) {
                const refreshAccount = new Account(account.id, account.token);
                const refreshed = await refreshAccount.refreshTokenIfPossible();
                if (refreshed) {
                  ctx.log?.info(
                    { event: "sync_token_refreshed", accountId: account.id },
                    "Token refreshed after lightweight auth error; next sync will use new token",
                  );
                  incrementSyncFailure();
                  return {
                    success: false,
                    message: "Sync failed temporarily. Try again in a moment.",
                    threadCount: 0,
                    needsReconnection: false,
                  };
                }
                syncLog.error(
                  `[syncEmails mutation] Authentication/token error during lightweight sync - account marked for reconnection`,
                );
                await ctx.db.account.update({
                  where: { id: account.id },
                  data: { needsReconnection: true },
                }).catch(err => syncLog.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));
                ctx.log?.warn(
                  {
                    event: "sync_error",
                    accountId: account.id,
                    durationMs: Date.now() - syncStartTime,
                    error: errorMessage,
                    needsReconnection: true,
                  },
                  "sync auth error during lightweight",
                );
                incrementSyncFailure();
                return {
                  success: false,
                  message: "Sync failed. Try again in a moment.",
                  threadCount: 0,
                  needsReconnection: true,
                };
              }

            }
          }

          const syncFolder = input.folder === "sent" ? "sent" : input.folder === "trash" ? "trash" : undefined;
          const accountSyncState = await ctx.db.account.findUnique({
            where: { id: account.id },
            select: { nextDeltaToken: true },
          });
          const mustFullSync =
            shouldForceFullSync || !accountSyncState?.nextDeltaToken;
          const { recalculateAllThreadStatuses } = await import("@/lib/sync-to-db");

          let lastSyncErr: unknown = null;
          try {
            await emailAccount.syncEmails(mustFullSync, syncFolder);
            await recalculateAllThreadStatuses(account.id);
          } catch (firstErr) {
            lastSyncErr = firstErr;
            if (isInvalidAurinkoSyncTokenError(firstErr)) {
              ctx.log?.warn(
                {
                  event: "sync_token_reset_retry",
                  accountId: account.id,
                  phase: "full_sync",
                },
                "invalid Aurinko sync token; cleared delta and retrying full sync once",
              );
              await ctx.db.account
                .update({
                  where: { id: account.id },
                  data: { nextDeltaToken: null },
                })
                .catch((err) =>
                  syncLog.error(
                    `[syncEmails mutation] Failed to clear nextDeltaToken:`,
                    err,
                  ),
                );
              try {
                await emailAccount.syncEmails(true, syncFolder);
                await recalculateAllThreadStatuses(account.id);
                lastSyncErr = null;
              } catch (retryErr) {
                lastSyncErr = retryErr;
              }
            }

            if (lastSyncErr != null) {
              const syncError = lastSyncErr;
              const syncErrorMessage =
                syncError instanceof Error
                  ? syncError.message
                  : String(syncError);

              ctx.log?.error(
                {
                  event: "sync_error",
                  accountId: account.id,
                  durationMs: Date.now() - syncStartTime,
                  error: syncErrorMessage,
                  phase: "full_sync",
                },
                "full sync failed",
              );
              incrementSyncFailure();
              syncLog.error(
                "[syncEmails mutation] Full sync failed:",
                syncErrorMessage,
              );

              if (
                syncErrorMessage.includes("Authentication failed") ||
                syncErrorMessage.includes("401") ||
                (axios.isAxiosError(syncError) &&
                  syncError.response?.status === 401)
              ) {
                const refreshAccount = new Account(account.id, account.token);
                const refreshed = await refreshAccount.refreshTokenIfPossible();
                if (refreshed) {
                  ctx.log?.info(
                    { event: "sync_token_refreshed", accountId: account.id },
                    "Token refreshed after full sync auth error; next sync will use new token",
                  );
                  return {
                    success: false,
                    message: "Sync failed temporarily. Try again in a moment.",
                    threadCount: 0,
                    needsReconnection: false,
                  };
                }
                await ctx.db.account
                  .update({
                    where: { id: account.id },
                    data: { needsReconnection: true },
                  })
                  .catch((err) =>
                    syncLog.error(
                      `[syncEmails mutation] Failed to update needsReconnection:`,
                      err,
                    ),
                  );
                return {
                  success: false,
                  message: "Sync failed. Try again in a moment.",
                  threadCount: 0,
                  needsReconnection: true,
                };
              }

              throw syncError;
            }
          }

          const threadCount = await ctx.db.thread.count({
            where: input.folder === "trash"
              ? {
                accountId: account.id,
                emails: { some: { sysLabels: { hasSome: ["trash"] } } },
              }
              : {
                accountId: account.id,
                ...(input.folder === "sent" ? { sentStatus: true } : { inboxStatus: true }),
              },
          });

          const folderName = input.folder === "sent" ? "sent" : input.folder === "trash" ? "trash" : "inbox";
          ctx.log?.info(
            {
              event: "sync_success",
              accountId: account.id,
              folder: folderName,
              durationMs: Date.now() - syncStartTime,
              threadCount,
              mode: "full",
            },
            "sync completed",
          );
          const { enqueueEmbeddingJobsForAccount } = await import(
            "@/lib/jobs/enqueue"
          );
          enqueueEmbeddingJobsForAccount(account.id).catch((err) => {
            syncLog.error("[syncEmails] Enqueue embedding jobs failed:", err);
          });

          return {
            success: true,
            message: `Emails synced successfully`,
            threadCount,
          };
        } catch (error) {
          lastError = error;
          const durationMs = Date.now() - syncStartTime;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          ctx.log?.error(
            {
              event: "sync_error",
              accountId: account?.id,
              durationMs,
              error: errorMessage,
              attempt: attempt + 1,
              maxAttempts,
            },
            "sync failed",
          );
          incrementSyncFailure();
          syncLog.error("[syncEmails mutation] Email sync failed:", error);
          if (input.continueToken) {
            return {
              success: false as const,
              message: "Couldn't fetch the next page of mail right now.",
              hasMore: false as const,
            };
          }

          if (error instanceof TRPCError) {
            throw error;
          }

          if (isInvalidAurinkoSyncTokenError(error) && account?.id) {
            await ctx.db.account
              .update({
                where: { id: account.id },
                data: { nextDeltaToken: null },
              })
              .catch((err) =>
                syncLog.error(
                  `[syncEmails mutation] Failed to clear nextDeltaToken:`,
                  err,
                ),
              );
            ctx.log?.warn(
              {
                event: "sync_aurinko_token_invalid",
                accountId: account.id,
                durationMs,
              },
              "Aurinko sync token invalid; cleared delta - user can retry Sync",
            );
            return {
              success: false,
              message:
                "Mail sync was out of date with your provider. Tap Sync again.",
              threadCount: 0,
              needsReconnection: false,
            };
          }

          const isAuthError =
            errorMessage.includes("Authentication failed") ||
            errorMessage.includes("401") ||
            (axios.isAxiosError(error) && error.response?.status === 401);

          if (isAuthError && attempt < maxAttempts - 1) {
            const refreshAccount = new Account(account.id, account.token);
            const refreshed = await refreshAccount.refreshTokenIfPossible();
            if (refreshed) {
              const updated = await ctx.db.account.findUnique({
                where: { id: account.id },
                select: { token: true },
              });
              if (updated?.token) {
                ctx.log?.info(
                  { event: "sync_token_refreshed", accountId: account.id },
                  "Token refreshed; retrying sync with new token",
                );
                currentAccount = { ...account, token: updated.token };
                currentEmailAccount = new Account(currentAccount.id, currentAccount.token);
                continue;
              }
            }
          }

          if (isAuthError) {
            ctx.log?.warn(
              {
                event: "sync_error",
                accountId: account.id,
                durationMs,
                error: errorMessage,
                needsReconnection: true,
              },
              "sync failed (auth)",
            );
            await ctx.db.account.update({
              where: { id: account.id },
              data: { needsReconnection: true },
            }).catch(err => syncLog.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));

            return {
              success: false,
              message: "Sync failed. Try again in a moment.",
              threadCount: 0,
              needsReconnection: true,
            };
          }

          if (
            isTransientMailProviderError(error) &&
            attempt < maxAttempts - 1
          ) {
            const delayMs = 1800 * (attempt + 1);
            ctx.log?.warn(
              {
                event: "sync_transient_retry",
                accountId: account.id,
                attempt: attempt + 1,
                maxAttempts,
                delayMs,
              },
              "sync retry after transient provider/network error",
            );
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }

          if (isTransientMailProviderError(error)) {
            throw new TRPCError({
              code: "TIMEOUT",
              message:
                "Mail provider was slow or unavailable. Wait a few seconds and tap Sync again.",
            });
          }

          const safeMessage =
            errorMessage && errorMessage.trim() && !/^unknown\s*error$/i.test(errorMessage)
              ? errorMessage
              : "Sync failed. Please try again in a moment or reconnect your account.";
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: safeMessage,
          });
        }
      }

      throw lastError;
    }),

  processEmailsForAI: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return {
          success: true,
          message: "Demo emails are already indexed.",
        };
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);

      try {
        const { processExistingEmails } = await import(
          "@/lib/process-existing-emails"
        );
        const result = await processExistingEmails(input.accountId, 10);
        if (!result.success) {
          throw new Error(result.error ?? "Email processing failed");
        }
        const message =
          result.totalFailed > 0
            ? `Processed ${result.totalProcessed}, ${result.totalFailed} failed${result.lastError ? `: ${result.lastError.slice(0, 200)}` : ""
            }`
            : `Processed ${result.totalProcessed} emails for AI analysis`;
        return {
          success: true,
          message,
          totalProcessed: result.totalProcessed,
          totalFailed: result.totalFailed,
          lastError: result.lastError ?? null,
        };
      } catch (error) {
        syncLog.error("Email processing failed:", error);
        throw new Error(`Failed to process emails: ${error}`);
      }
    }),

  debugEmails: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return {
          totalEmails: 47,
          processedEmails: 47,
          emails: [],
        };
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);

      try {
        const totalEmails = await ctx.db.email.count({
          where: {
            thread: {
              accountId: input.accountId,
            },
          },
        });

        const processedEmailsResult = await ctx.db.$queryRaw<
          Array<{ count: bigint }>
        >`
          SELECT COUNT(*) as count
          FROM "Email" e
          JOIN "Thread" t ON e."threadId" = t.id
          WHERE t."accountId" = ${input.accountId}
            AND e."summary" IS NOT NULL
            AND e."embedding" IS NOT NULL
        `;
        const processedCount = Number(processedEmailsResult[0]?.count || 0);

        const recentEmails = await ctx.db.email.findMany({
          where: {
            thread: {
              accountId: input.accountId,
            },
          },
          select: {
            id: true,
            subject: true,
            sentAt: true,
            summary: true,
            thread: true,
            from: true,
          },
          orderBy: {
            sentAt: "desc",
          },
          take: 10,
        });

        const emailIds = recentEmails.map((e) => e.id);
        const emailsWithEmbeddings = await ctx.db.$queryRaw<
          Array<{ id: string }>
        >`
          SELECT id
          FROM "Email"
          WHERE id = ANY(${emailIds}::text[])
            AND "summary" IS NOT NULL
            AND "embedding" IS NOT NULL
        `;
        const emailsWithEmbeddingsSet = new Set(
          emailsWithEmbeddings.map((e) => e.id),
        );

        return {
          totalEmails,
          processedEmails: processedCount,
          emails: recentEmails.map((email) => ({
            id: email.id,
            subject: email.subject,
            from: email.from.address,
            sentAt: email.sentAt,
            hasEmbedding: emailsWithEmbeddingsSet.has(email.id),
          })),
        };
      } catch (error) {
        syncLog.error("Debug query failed:", error);
        throw new Error(`Failed to debug emails: ${error}`);
      }
    }),
};
