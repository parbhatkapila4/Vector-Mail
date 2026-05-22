import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "@/server/api/trpc";
import { isDemoCall } from "@/lib/demo/predicate";
import { makeTagLogger } from "@/lib/logging/console-shim";

import { authoriseAccountAccess } from "./shared";

const actionsLog = makeTagLogger("account-router.thread-actions");

export const threadActionProcedures = {
  deleteThread: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoCall(ctx)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Request access to connect your Gmail to use this feature.",
        });
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        include: {
          emails: true,
        },
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      await ctx.db.$transaction(async (tx) => {
        const emails = await tx.email.findMany({
          where: { threadId: input.threadId },
        });

        actionsLog.log(
          `[deleteThread] Found ${emails.length} emails in thread ${input.threadId}`,
        );

        for (const email of emails) {
          const labels = (email.sysLabels as string[]) || [];
          const updatedLabels = labels.filter((label) => label !== "inbox");
          if (!updatedLabels.includes("trash")) {
            updatedLabels.push("trash");
          }

          actionsLog.log(`[deleteThread] Updating email ${email.id}:`, {
            oldLabels: labels,
            newLabels: updatedLabels,
          });

          await tx.email.update({
            where: { id: email.id },
            data: { sysLabels: updatedLabels },
          });
        }

        await tx.thread.update({
          where: { id: input.threadId },
          data: {
            inboxStatus: false,
          },
        });
      });

      actionsLog.log(`[deleteThread] Thread ${input.threadId} marked as deleted`);

      return { success: true, message: "Thread moved to trash" };
    }),

  archiveThread: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoCall(ctx)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Request access to connect your Gmail to use this feature.",
        });
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        include: { emails: true },
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      await ctx.db.$transaction(async (tx) => {
        for (const email of thread.emails) {
          const labels = (email.sysLabels as string[]) || [];
          const updatedLabels = labels.filter((label) => label !== "inbox");
          await tx.email.update({
            where: { id: email.id },
            data: { sysLabels: updatedLabels },
          });
        }
        await tx.thread.update({
          where: { id: input.threadId },
          data: { inboxStatus: false },
        });
      });

      return { success: true, message: "Thread archived" };
    }),

  markThreadRead: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        include: { emails: true },
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      await ctx.db.$transaction(async (tx) => {
        for (const email of thread.emails) {
          const labels = (email.sysLabels as string[]) || [];
          const updatedLabels = labels.filter((label) => label !== "unread");
          await tx.email.update({
            where: { id: email.id },
            data: { sysLabels: updatedLabels },
          });
        }
      });

      return { success: true };
    }),

  markThreadUnread: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        include: {
          emails: {
            orderBy: { sentAt: "desc" },
            take: 1,
          },
        },
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      const latestEmail = thread.emails[0];
      if (latestEmail) {
        const labels = (latestEmail.sysLabels as string[]) || [];
        if (!labels.includes("unread")) {
          await ctx.db.email.update({
            where: { id: latestEmail.id },
            data: { sysLabels: [...labels, "unread"] },
          });
        }
      }

      return { success: true };
    }),

  bulkDeleteThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoCall(ctx)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Request access to connect your Gmail to use this feature.",
        });
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let count = 0;
      for (const threadId of input.threadIds) {
        const thread = await ctx.db.thread.findFirst({
          where: { id: threadId, accountId: account.id },
          include: { emails: true },
        });
        if (!thread) continue;

        await ctx.db.$transaction(async (tx) => {
          for (const email of thread.emails) {
            const labels = (email.sysLabels as string[]) || [];
            const updatedLabels = labels.filter((l) => l !== "inbox");
            if (!updatedLabels.includes("trash")) updatedLabels.push("trash");
            await tx.email.update({
              where: { id: email.id },
              data: { sysLabels: updatedLabels },
            });
          }
          await tx.thread.update({
            where: { id: threadId },
            data: { inboxStatus: false },
          });
        });
        count++;
      }
      return { success: true, count };
    }),

  bulkArchiveThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoCall(ctx)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Request access to connect your Gmail to use this feature.",
        });
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let count = 0;
      for (const threadId of input.threadIds) {
        const thread = await ctx.db.thread.findFirst({
          where: { id: threadId, accountId: account.id },
          include: { emails: true },
        });
        if (!thread) continue;

        await ctx.db.$transaction(async (tx) => {
          for (const email of thread.emails) {
            const labels = (email.sysLabels as string[]) || [];
            const updatedLabels = labels.filter((l) => l !== "inbox");
            await tx.email.update({
              where: { id: email.id },
              data: { sysLabels: updatedLabels },
            });
          }
          await tx.thread.update({
            where: { id: threadId },
            data: { inboxStatus: false },
          });
        });
        count++;
      }
      return { success: true, count };
    }),

  bulkMarkRead: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let count = 0;
      for (const threadId of input.threadIds) {
        const thread = await ctx.db.thread.findFirst({
          where: { id: threadId, accountId: account.id },
          include: { emails: true },
        });
        if (!thread) continue;

        await ctx.db.$transaction(async (tx) => {
          for (const email of thread.emails) {
            const labels = (email.sysLabels as string[]) || [];
            const updatedLabels = labels.filter((l) => l !== "unread");
            await tx.email.update({
              where: { id: email.id },
              data: { sysLabels: updatedLabels },
            });
          }
        });
        count++;
      }
      return { success: true, count };
    }),

  bulkMarkUnread: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let count = 0;
      for (const threadId of input.threadIds) {
        const thread = await ctx.db.thread.findFirst({
          where: { id: threadId, accountId: account.id },
          include: {
            emails: {
              orderBy: { sentAt: "desc" },
              take: 1,
            },
          },
        });
        if (!thread) continue;

        const latestEmail = thread.emails[0];
        if (latestEmail) {
          const labels = (latestEmail.sysLabels as string[]) || [];
          if (!labels.includes("unread")) {
            await ctx.db.email.update({
              where: { id: latestEmail.id },
              data: { sysLabels: [...labels, "unread"] },
            });
          }
        }
        count++;
      }
      return { success: true, count };
    }),

  snoozeThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        accountId: z.string().min(1),
        snoozedUntil: z.string().datetime(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const snoozedUntilDate = new Date(input.snoozedUntil);
      if (snoozedUntilDate.getTime() <= Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please pick a future time",
        });
      }
      await ctx.db.thread.update({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        data: { snoozedUntil: snoozedUntilDate },
      });
      return { success: true };
    }),

  unsnoozeThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        accountId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      await ctx.db.thread.update({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        data: { snoozedUntil: null },
      });
      return { success: true };
    }),

  setReminder: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        accountId: z.string().min(1),
        days: z.number().min(1).max(60),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        select: { id: true, lastMessageDate: true },
      });
      if (!thread) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found",
        });
      }
      const remindAt = new Date();
      remindAt.setDate(remindAt.getDate() + input.days);
      remindAt.setHours(9, 0, 0, 0);
      await ctx.db.thread.update({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        data: {
          remindAt,
          remindIfNoReplySince: thread.lastMessageDate,
        },
      });
      return { success: true };
    }),

  clearReminder: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        accountId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      await ctx.db.thread.update({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        data: { remindAt: null, remindIfNoReplySince: null },
      });
      return { success: true };
    }),
};
