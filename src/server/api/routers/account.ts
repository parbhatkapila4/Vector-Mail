import { Account } from "@/lib/accounts";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { withDbRetry } from "@/server/db";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { isDemoCall } from "@/lib/demo/predicate";
import { getDemoThreads } from "@/lib/demo/seed-demo-data";
import { makeTagLogger } from "@/lib/logging/console-shim";

const routerLog = makeTagLogger("account-router");

export { authoriseAccountAccess } from "./account-procedures/shared";
import { authoriseAccountAccess } from "./account-procedures/shared";
import { labelProcedures } from "./account-procedures/labels";
import { identityProcedures } from "./account-procedures/identity";
import { sendingProcedures } from "./account-procedures/sending";
import { threadActionProcedures } from "./account-procedures/thread-actions";
import { eventProcedures } from "./account-procedures/events";
import { briefingProcedures } from "./account-procedures/briefing";
import { emailReadingProcedures } from "./account-procedures/email-reading";
import { threadReadingProcedures } from "./account-procedures/thread-reading";
import { syncProcedures } from "./account-procedures/sync";

export const accountRouter = createTRPCRouter({
  ...identityProcedures,
  ...sendingProcedures,
  ...briefingProcedures,
  ...emailReadingProcedures,
  ...threadReadingProcedures,
  ...threadActionProcedures,
  ...syncProcedures,
  getThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        tab: z.string(),
        important: z.boolean(),
        unread: z.boolean(),
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().nullish(),
        labelId: z.string().min(1).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.accountId || input.accountId.trim().length === 0) {
        return {
          threads: [],
          nextCursor: undefined,
          syncStatus: { success: true, count: 0 },
          source: "database" as const,
          backfillComplete: true,
        };
      }
      if (isDemoCall(ctx, input.accountId)) {
        const { threads, nextCursor } = getDemoThreads({
          tab: input.tab,
          limit: input.limit,
          cursor: input.cursor ?? undefined,
          labelId: input.labelId ?? undefined,
        });
        return {
          threads,
          nextCursor,
          syncStatus: { success: true, count: 0 },
          source: "database" as const,
          backfillComplete: true,
        };
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const { cursor } = input;
      const syncResult = { success: true, count: 0 };
      const backfillComplete = !!account.inboxBackfilledAt;

      if (input.tab === "inbox" && !cursor && !input.labelId) {
        try {
          const latestInboxThread = await ctx.db.thread.findFirst({
            where: {
              accountId: account.id,
              inboxStatus: true,
            },
            orderBy: { lastMessageDate: "desc" },
            select: { lastMessageDate: true },
          });
          const staleCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
          const isFirstLoad = !latestInboxThread?.lastMessageDate;
          const shouldRefreshLatest =
            isFirstLoad || latestInboxThread.lastMessageDate < staleCutoff;
          if (shouldRefreshLatest && account.token) {
            const emailAccount = new Account(account.id, account.token);
            await emailAccount
              .fetchAndSyncLatestInboxPage()
              .catch((bgErr) =>
                routerLog.warn(
                  "[getThreads] Latest inbox refresh failed, continuing with DB:",
                  bgErr,
                ),
              );
          }
        } catch (refreshErr) {
          routerLog.warn(
            "[getThreads] Latest inbox refresh before listing failed, continuing with DB:",
            refreshErr,
          );
        }
      }

      const limit = Math.min(
        input.tab === "inbox" ? (input.limit ?? 50) : (input.limit ?? 15),
        100,
      );

      const whereClause: Prisma.ThreadWhereInput = {
        accountId: account.id,
      };

      if (input.labelId) {
        whereClause.threadLabels = {
          some: { labelId: input.labelId },
        };
      }

      if (input.tab === "inbox" || (input.tab === "label" && input.labelId)) {
        if (!cursor) {
          try {
            const threadsWithInboxEmails = await ctx.db.email.findMany({
              where: {
                thread: { accountId: account.id },
                emailLabel: "inbox",
              },
              select: { threadId: true },
              distinct: ["threadId"],
            });
            const inboxThreadCount = await ctx.db.thread.count({
              where: {
                accountId: account.id,
                inboxStatus: true,
                OR: [
                  { snoozedUntil: null },
                  { snoozedUntil: { lte: new Date() } },
                ],
              },
            });
            if (
              threadsWithInboxEmails.length > inboxThreadCount &&
              threadsWithInboxEmails.length > 0
            ) {
              const candidateThreadIds = threadsWithInboxEmails.map((e) => e.threadId);
              const threadsWithTrash = await ctx.db.email.findMany({
                where: {
                  threadId: { in: candidateThreadIds },
                  sysLabels: { hasSome: ["trash"] },
                },
                select: { threadId: true },
                distinct: ["threadId"],
              });
              const trashThreadIds = new Set(threadsWithTrash.map((e) => e.threadId));
              const threadIds = candidateThreadIds.filter((id) => !trashThreadIds.has(id));
              if (threadIds.length > 0) {
                await ctx.db.thread.updateMany({
                  where: {
                    id: { in: threadIds },
                    accountId: account.id,
                  },
                  data: { inboxStatus: true },
                });
              }
            }
          } catch (fixErr) {
            routerLog.warn("[getThreads] Inbox status fix failed, continuing:", fixErr);
          }
        }
        whereClause.inboxStatus = true;
        whereClause.emails = {
          none: {
            sysLabels: {
              hasSome: ["trash"],
            },
          },
        };
        whereClause.AND = [
          {
            OR: [
              { snoozedUntil: null },
              { snoozedUntil: { lte: new Date() } },
            ],
          },
        ];
      } else if (input.tab === "snoozed") {
        whereClause.inboxStatus = true;
        whereClause.snoozedUntil = { gt: new Date() };
      } else if (input.tab === "drafts") {
        whereClause.draftStatus = true;
        whereClause.inboxStatus = false;
        whereClause.sentStatus = false;
      } else if (input.tab === "trash") {
        whereClause.emails = {
          some: {
            sysLabels: {
              hasSome: ["trash"],
            },
          },
        };
      } else if (input.tab === "starred") {
        whereClause.emails = {
          some: {
            sysLabels: {
              hasSome: ["flagged"],
            },
          },
        };
      } else if (input.tab === "archive") {
        whereClause.inboxStatus = false;
        whereClause.sentStatus = false;
        whereClause.draftStatus = false;
        whereClause.emails = {
          none: {
            sysLabels: {
              hasSome: ["trash"],
            },
          },
        };
      } else if (input.tab === "reminders") {
      } else {
        whereClause.OR = [
          {
            sentStatus: true,
            inboxStatus: false,
            draftStatus: false,
          },
          {
            inboxStatus: false,
            draftStatus: false,
            emails: {
              some: { emailLabel: "sent" },
            },
          },
        ];
        delete (whereClause as Record<string, unknown>).sentStatus;
        delete (whereClause as Record<string, unknown>).inboxStatus;
        delete (whereClause as Record<string, unknown>).draftStatus;
      }

      let threads: Awaited<
        ReturnType<typeof ctx.db.thread.findMany<{
          include: {
            emails: {
              include: {
                from: true;
              };
              orderBy: { sentAt: "desc" };
              take: 1;
            };
          };
        }>>
      >;

      if (input.tab === "reminders") {
        const now = new Date();
        const idsResult = cursor
          ? await ctx.db.$queryRaw<
            Array<{ id: string }>
          >`SELECT t.id FROM "Thread" t
  WHERE t."accountId" = ${account.id}
    AND t."remindAt" IS NOT NULL
    AND t."remindIfNoReplySince" IS NOT NULL
    AND t."remindAt" <= ${now}
    AND t."lastMessageDate" <= t."remindIfNoReplySince"
    AND (t."remindAt" > (SELECT "remindAt" FROM "Thread" WHERE "id" = ${cursor})
         OR (t."remindAt" = (SELECT "remindAt" FROM "Thread" WHERE "id" = ${cursor}) AND t."id" > ${cursor}))
  ORDER BY t."remindAt" ASC, t."id" ASC
  LIMIT ${limit + 1}`
          : await ctx.db.$queryRaw<
            Array<{ id: string }>
          >`SELECT t.id FROM "Thread" t
  WHERE t."accountId" = ${account.id}
    AND t."remindAt" IS NOT NULL
    AND t."remindIfNoReplySince" IS NOT NULL
    AND t."remindAt" <= ${now}
    AND t."lastMessageDate" <= t."remindIfNoReplySince"
  ORDER BY t."remindAt" ASC, t."id" ASC
  LIMIT ${limit + 1}`;
        const ids = idsResult.map((r) => r.id);
        if (ids.length === 0) {
          threads = [];
        } else {
          const rows = await ctx.db.thread.findMany({
            where: { id: { in: ids } },
            include: {
              emails: {
                include: {
                  from: true,
                },
                orderBy: { sentAt: "desc" },
                take: 1,
              },
              threadLabels: { include: { label: true } },
            },
          });
          const idOrder = new Map(ids.map((id, i) => [id, i]));
          threads = rows.sort(
            (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0),
          );
        }
      } else if (input.tab === "trash") {
        const idsResult = cursor
          ? await ctx.db.$queryRaw<
            Array<{ id: string }>
          >`SELECT t.id FROM "Thread" t
  INNER JOIN "Email" e ON e."threadId" = t.id
  WHERE t."accountId" = ${account.id}
    AND 'trash' = ANY(e."sysLabels")
    AND (t."lastMessageDate" < (SELECT "lastMessageDate" FROM "Thread" WHERE "id" = ${cursor})
         OR (t."lastMessageDate" = (SELECT "lastMessageDate" FROM "Thread" WHERE "id" = ${cursor}) AND t."id" > ${cursor}))
  GROUP BY t.id, t."lastMessageDate"
  ORDER BY t."lastMessageDate" DESC, t."id" DESC
  LIMIT ${limit + 1}`
          : await ctx.db.$queryRaw<
            Array<{ id: string }>
          >`SELECT t.id FROM "Thread" t
  INNER JOIN "Email" e ON e."threadId" = t.id
  WHERE t."accountId" = ${account.id}
    AND 'trash' = ANY(e."sysLabels")
  GROUP BY t.id, t."lastMessageDate"
  ORDER BY t."lastMessageDate" DESC, t."id" DESC
  LIMIT ${limit + 1}`;
        const ids = idsResult.map((r) => r.id);
        if (ids.length === 0) {
          threads = [];
        } else {
          const rows = await ctx.db.thread.findMany({
            where: { id: { in: ids } },
            include: {
              emails: {
                include: {
                  from: true,
                },
                orderBy: { sentAt: "desc" },
                take: 1,
              },
              threadLabels: { include: { label: true } },
            },
          });
          const idOrder = new Map(ids.map((id, i) => [id, i]));
          threads = rows.sort(
            (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0),
          );
        }
      } else if (input.tab === "sent") {
        const sentWhere: Prisma.ThreadWhereInput = {
          accountId: account.id,
          OR: [
            {
              sentStatus: true,
              inboxStatus: false,
              draftStatus: false,
            },
            {
              inboxStatus: false,
              draftStatus: false,
              emails: { some: { emailLabel: "sent" } },
            },
          ],
        };
        const sentRows = await ctx.db.thread.findMany({
          where: sentWhere,
          select: { id: true },
          orderBy: [
            { lastMessageDate: "desc" },
            { id: "desc" },
          ],
          take: limit + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        const ids = sentRows.map((r) => r.id);
        if (ids.length === 0) {
          threads = [];
        } else {
          const rows = await ctx.db.thread.findMany({
            where: { id: { in: ids } },
            include: {
              emails: {
                include: {
                  from: true,
                },
                orderBy: { sentAt: "desc" },
                take: 1,
              },
              threadLabels: { include: { label: true } },
            },
          });
          const idOrder = new Map(ids.map((id, i) => [id, i]));
          threads = rows.sort(
            (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0),
          );
        }
      } else {
        threads = await ctx.db.thread.findMany({
          take: limit + 1,
          where: whereClause,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          orderBy: [
            { lastMessageDate: "desc" },
            { id: "desc" },
          ],
          include: {
            emails: {
              include: {
                from: true,
              },
              orderBy: {
                sentAt: "desc",
              },
              take: 1,
            },
            threadLabels: { include: { label: true } },
          },
        });
        if (
          input.tab === "inbox" &&
          !cursor &&
          threads.length > 0 &&
          threads[0]?.lastMessageDate &&
          threads[0].lastMessageDate.getTime() < Date.now() - 24 * 60 * 60 * 1000
        ) {
          try {
            const { recalculateAllThreadStatuses } = await import("@/lib/sync-to-db");
            await recalculateAllThreadStatuses(account.id);
            threads = await ctx.db.thread.findMany({
              take: limit + 1,
              where: whereClause,
              orderBy: [
                { lastMessageDate: "desc" },
                { id: "desc" },
              ],
              include: {
                emails: {
                  include: {
                    from: true,
                  },
                  orderBy: { sentAt: "desc" },
                  take: 1,
                },
                threadLabels: { include: { label: true } },
              },
            });
          } catch (repairErr) {
            routerLog.warn("[getThreads] Inbox lastMessageDate repair failed:", repairErr);
          }
        }
      }

      let nextCursor: typeof cursor | undefined = undefined;
      if (threads.length > limit) {
        const lastThread = threads.pop();
        nextCursor = lastThread?.id;
      }

      let totalThreadCount = 0;
      if (threads.length === 0 && input.tab === "inbox" && !cursor) {
        totalThreadCount = await ctx.db.thread.count({
          where: { accountId: account.id },
        });
      }

      if (
        threads.length === 0 &&
        input.tab === "inbox" &&
        !cursor &&
        totalThreadCount > 0
      ) {
        try {
          await withDbRetry(() =>
            ctx.db.thread.updateMany({
              where: { accountId: account.id },
              data: { inboxStatus: true },
            }),
          );

          const retryThreads = await withDbRetry(() =>
            ctx.db.thread.findMany({
              take: limit + 1,
              where: whereClause,
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                lastMessageDate: "desc",
              },
              include: {
                emails: {
                  include: {
                    from: true,
                  },
                  orderBy: {
                    sentAt: "desc",
                  },
                  take: 1,
                },
                threadLabels: { include: { label: true } },
              },
            }),
          );

          if (retryThreads.length > 0) {
            const retryNextCursor =
              retryThreads.length > limit ? retryThreads.pop()?.id : undefined;
            return {
              threads: retryThreads.slice(0, limit),
              nextCursor: retryNextCursor,
              syncStatus: syncResult,
              source: "database" as const,
              backfillComplete,
            };
          }

          const allThreads = await withDbRetry(() =>
            ctx.db.thread.findMany({
              take: limit + 1,
              where: { accountId: account.id },
              orderBy: { lastMessageDate: "desc" },
              include: {
                emails: {
                  include: {
                    from: true,
                  },
                  orderBy: { sentAt: "desc" },
                  take: 1,
                },
                threadLabels: { include: { label: true } },
              },
            }),
          );

          if (allThreads.length > 0) {
            await withDbRetry(() =>
              ctx.db.thread.updateMany({
                where: { id: { in: allThreads.map((t) => t.id) } },
                data: { inboxStatus: true },
              }),
            );

            const allThreadsNextCursor =
              allThreads.length > limit ? allThreads.pop()?.id : undefined;
            return {
              threads: allThreads.slice(0, limit),
              nextCursor: allThreadsNextCursor,
              syncStatus: syncResult,
              source: "database" as const,
              backfillComplete,
            };
          }
        } catch (fixError) {
          routerLog.error(
            `[getThreads] âœ- Error fixing thread status flags:`,
            fixError,
          );
          try {
            const emergencyThreads = await withDbRetry(() =>
              ctx.db.thread.findMany({
                take: limit + 1,
                where: { accountId: account.id },
                orderBy: { lastMessageDate: "desc" },
                include: {
                  emails: {
                    include: {
                      from: true,
                    },
                    orderBy: { sentAt: "desc" },
                    take: 1,
                  },
                  threadLabels: { include: { label: true } },
                },
              }),
            );

            if (emergencyThreads.length > 0) {
              await withDbRetry(() =>
                ctx.db.thread.updateMany({
                  where: { id: { in: emergencyThreads.map((t) => t.id) } },
                  data: { inboxStatus: true },
                }),
              );

              const emergencyNextCursor =
                emergencyThreads.length > limit
                  ? emergencyThreads.pop()?.id
                  : undefined;
              return {
                threads: emergencyThreads.slice(0, limit),
                nextCursor: emergencyNextCursor,
                syncStatus: syncResult,
                source: "database" as const,
                backfillComplete,
              };
            }
          } catch (emergencyError) {
            routerLog.error(
              `[getThreads] âœ- Emergency fallback also failed:`,
              emergencyError,
            );
          }
        }
      }

      if (
        threads.length === 0 &&
        totalThreadCount > 0 &&
        input.tab === "inbox" &&
        !cursor
      ) {
        const allThreadsNoFilter = await withDbRetry(() =>
          ctx.db.thread.findMany({
            take: limit + 1,
            where: { accountId: account.id },
            orderBy: { lastMessageDate: "desc" },
            include: {
              emails: {
                include: {
                  from: true,
                },
                orderBy: { sentAt: "desc" },
                take: 1,
              },
              threadLabels: { include: { label: true } },
            },
          }),
        );

        if (allThreadsNoFilter.length > 0) {
          await withDbRetry(() =>
            ctx.db.thread.updateMany({
              where: { id: { in: allThreadsNoFilter.map((t) => t.id) } },
              data: { inboxStatus: true },
            }),
          );

          const finalNextCursor =
            allThreadsNoFilter.length > limit
              ? allThreadsNoFilter.pop()?.id
              : undefined;
          return {
            threads: allThreadsNoFilter.slice(0, limit),
            nextCursor: finalNextCursor,
            syncStatus: syncResult,
            source: "database" as const,
            backfillComplete,
          };
        }
      }

      return {
        threads,
        nextCursor,
        syncStatus: syncResult,
        source: "database" as const,
        backfillComplete,
      };
    }),
  ...eventProcedures,
  ...labelProcedures,
});
