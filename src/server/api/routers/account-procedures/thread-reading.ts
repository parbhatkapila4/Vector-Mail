import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { protectedProcedure } from "@/server/api/trpc";
import { withDbRetry } from "@/server/db";
import { isDemoCall, isDemoCallFor } from "@/lib/demo/predicate";
import {
  DEMO_ACCOUNT_ID,
  DEMO_DISPLAY_NAME,
  DEMO_EMAIL,
} from "@/lib/demo/constants";
import { getDemoThreads, getDemoThreadById } from "@/lib/demo/seed-demo-data";
import { makeTagLogger } from "@/lib/logging/console-shim";

import { authoriseAccountAccess } from "./shared";

const readingLog = makeTagLogger("account-router.thread-reading");
export const threadReadingProcedures = {
  getNumThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        tab: z.string(),
        labelId: z.string().min(1).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.accountId || input.accountId.trim().length === 0) {
        return 0;
      }
      if (isDemoCallFor(ctx, input, (i) => i.accountId === DEMO_ACCOUNT_ID || i.accountId === "placeholder")) {
        if (input.tab === "inbox") return 25;
        if (input.tab === "sent") return 5;
        if (input.tab === "trash") return 3;
        if (input.tab === "label" && input.labelId) {
          const { threads } = getDemoThreads({ tab: "label", limit: 100, labelId: input.labelId });
          return threads.length;
        }
        return 0;
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      if (input.tab === "label" && input.labelId) {
        return await ctx.db.threadLabel.count({
          where: {
            labelId: input.labelId,
            thread: { accountId: account.id },
          },
        });
      }

      if (input.tab === "inbox") {
        const threadCount = await ctx.db.thread.count({
          where: {
            accountId: account.id,
            inboxStatus: true,
            OR: [
              { snoozedUntil: null },
              { snoozedUntil: { lte: new Date() } },
            ],
          },
        });

        const threadsWithInboxEmails = await ctx.db.email.findMany({
          where: {
            thread: {
              accountId: account.id,
            },
            emailLabel: "inbox",
          },
          select: {
            threadId: true,
          },
          distinct: ["threadId"],
        });

        const emailBasedCount = threadsWithInboxEmails.length;

        if (emailBasedCount > threadCount && emailBasedCount > 0) {
          const threadIds = threadsWithInboxEmails.map((e) => e.threadId);
          await ctx.db.thread.updateMany({
            where: {
              id: { in: threadIds },
              accountId: account.id,
            },
            data: {
              inboxStatus: true,
            },
          });
        }

        return Math.max(threadCount, emailBasedCount);
      } else if (input.tab === "snoozed") {
        return await ctx.db.thread.count({
          where: {
            accountId: account.id,
            inboxStatus: true,
            snoozedUntil: { gt: new Date() },
          },
        });
      } else if (input.tab === "reminders") {
        const now = new Date();
        const result = await ctx.db.$queryRaw<
          Array<{ count: bigint }>
        >`SELECT COUNT(*) as count FROM "Thread" WHERE "accountId" = ${account.id} AND "remindAt" IS NOT NULL AND "remindIfNoReplySince" IS NOT NULL AND "remindAt" <= ${now} AND "lastMessageDate" <= "remindIfNoReplySince"`;
        return Number(result[0]?.count ?? 0);
      } else if (input.tab === "drafts") {
        return await ctx.db.thread.count({
          where: {
            accountId: account.id,
            draftStatus: true,
            inboxStatus: false,
            sentStatus: false,
          },
        });
      } else if (input.tab === "trash") {
        return await ctx.db.thread.count({
          where: {
            accountId: account.id,
            emails: {
              some: { sysLabels: { hasSome: ["trash"] } },
            },
          },
        });
      } else if (input.tab === "starred") {
        return await ctx.db.thread.count({
          where: {
            accountId: account.id,
            emails: {
              some: {
                sysLabels: {
                  hasSome: ["flagged"],
                },
              },
            },
          },
        });
      } else if (input.tab === "archive") {
        return await ctx.db.thread.count({
          where: {
            accountId: account.id,
            inboxStatus: false,
            sentStatus: false,
            draftStatus: false,
            emails: {
              none: {
                sysLabels: {
                  hasSome: ["trash"],
                },
              },
            },
          },
        });
      } else {
        const sentThreadCount = await ctx.db.thread.count({
          where: {
            accountId: account.id,
            sentStatus: true,
            inboxStatus: false,
            draftStatus: false,
          },
        });
        const threadsWithSentEmails = await ctx.db.email.findMany({
          where: {
            thread: { accountId: account.id },
            emailLabel: "sent",
          },
          select: { threadId: true },
          distinct: ["threadId"],
        });
        const emailBasedSentCount = threadsWithSentEmails.length;
        return Math.max(sentThreadCount, emailBasedSentCount);
      }
    }),

  getUnifiedThreads: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userAccounts = await withDbRetry(() =>
        ctx.db.account.findMany({
          where: { userId: ctx.auth.userId },
          select: { id: true, emailAddress: true, name: true },
        }),
      );
      const accountIds = userAccounts.map((a) => a.id);
      if (accountIds.length === 0) {
        return {
          threads: [],
          nextCursor: undefined as string | undefined,
        };
      }

      const limit = Math.min(input.limit ?? 50, 100);
      const whereClause: Prisma.ThreadWhereInput = {
        accountId: { in: accountIds },
        inboxStatus: true,
        emails: {
          none: {
            sysLabels: { hasSome: ["trash"] },
          },
        },
        AND: [
          {
            OR: [
              { snoozedUntil: null },
              { snoozedUntil: { lte: new Date() } },
            ],
          },
        ],
      };

      const threads = await ctx.db.thread.findMany({
        take: limit + 1,
        where: whereClause,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: [
          { lastMessageDate: "desc" },
          { id: "desc" },
        ],
        include: {
          account: {
            select: { id: true, emailAddress: true, name: true },
          },
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              replyTo: true,
            },
            orderBy: { sentAt: "desc" },
            take: 1,
          },
          threadLabels: { include: { label: true } },
        },
      });

      let nextCursor: string | undefined;
      if (threads.length > limit) {
        const last = threads.pop();
        nextCursor = last?.id;
      }

      return {
        threads: threads.map((t) => {
          const { account, ...rest } = t;
          return {
            ...rest,
            accountId: t.accountId,
            accountEmail: account.emailAddress,
            accountName: account.name,
          };
        }),
        nextCursor,
      };
    }),

  getThreadById: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx)) {
        const demoThread = getDemoThreadById(input.threadId);
        if (!demoThread) throw new Error("Thread not found");
        const delayMs = 500 + Math.floor(Math.random() * 300);
        await new Promise((r) => setTimeout(r, delayMs));
        return {
          ...demoThread,
          account: {
            id: DEMO_ACCOUNT_ID,
            emailAddress: DEMO_EMAIL,
            name: DEMO_DISPLAY_NAME,
          },
        };
      }

      const thread = await ctx.db.thread.findUnique({
        where: { id: input.threadId },
        include: {
          account: {
            select: { id: true, emailAddress: true, name: true },
          },
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              replyTo: true,
              attachments: true,
            },
            orderBy: {
              sentAt: "asc",
            },
          },
          threadLabels: {
            include: { label: true },
          },
        },
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      const userAccountIds = await ctx.db.account
        .findMany({
          where: { userId: ctx.auth.userId },
          select: { id: true },
        })
        .then((rows) => new Set(rows.map((r) => r.id)));
      if (!userAccountIds.has(thread.accountId)) {
        throw new Error("Thread not found");
      }

      const emailsNeedingAnalysis = thread.emails.filter(
        (email) => !email.summary,
      );
      if (emailsNeedingAnalysis.length > 0) {
        const { enqueueEmailAnalysisJobs } = await import("@/lib/jobs/enqueue");
        enqueueEmailAnalysisJobs(emailsNeedingAnalysis.map((e) => e.id)).catch(
          (err) => {
            readingLog.error("Enqueue email analysis jobs failed:", err);
          },
        );
      }

      return thread;
    }),
};
