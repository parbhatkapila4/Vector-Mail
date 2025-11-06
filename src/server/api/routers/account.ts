import { Account } from "@/lib/accounts";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { emailAddressSchema } from "@/types";
import { Prisma } from "@prisma/client";
import { z } from "zod";

interface AccountAccess {
  id: string;
  emailAddress: string;
  name: string;
  token: string;
}

export const authoriseAccountAccess = async (
  accountId: string,
  userId: string,
): Promise<AccountAccess> => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      name: true,
      token: true,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
      },
    });
  }),

  getMyAccount: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      return account;
    }),

  sendEmail: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        from: emailAddressSchema,
        to: z.array(emailAddressSchema),
        subject: z.string(),
        body: z.string(),
        threadId: z.string().optional(),
        replyTo: emailAddressSchema.optional(),
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        inReplyTo: z.string().optional(),
        references: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const emailAccount = new Account(account.token);
      await emailAccount.sendEmail(input);
      return { success: true };
    }),

  getEmailSuggestions: protectedProcedure
    .input(z.object({ accountId: z.string(), query: z.string() }))
    .query(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const contacts = await ctx.db.emailAddress.findMany({
        where: {
          email: {
            thread: {
              accountId: input.accountId,
            },
          },
        },
        distinct: ["address"],
        take: 10,
        orderBy: {
          email: {
            sentAt: "desc",
          },
        },
      });
      return contacts.map((c: any) => ({ name: c.name, address: c.address }));
    }),

  getNumThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "drafts", "sent"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const filters =
        input.tab === "inbox"
          ? { inboxStatus: true, draftStatus: false, sentStatus: false }
          : input.tab === "drafts"
            ? { inboxStatus: false, draftStatus: true, sentStatus: false }
            : { inboxStatus: false, draftStatus: false, sentStatus: true };

      return await ctx.db.thread.count({
        where: {
          accountId: account.id,
          ...filters,
        },
      });
    }),

  syncEmails: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        forceFullSync: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const emailAccount = new Account(account.token);

      try {
        await emailAccount.syncEmails(input.forceFullSync);
        return {
          success: true,
          message: "Emails synced successfully",
        };
      } catch (error) {
        console.error("Email sync failed:", error);
        throw new Error(`Failed to sync emails: ${error}`);
      }
    }),

  processEmailsForAI: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);

      try {
        const { processExistingEmails } = await import(
          "@/lib/process-existing-emails"
        );
        await processExistingEmails(input.accountId, 5);
        return {
          success: true,
          message: "Emails processed for AI analysis",
        };
      } catch (error) {
        console.error("Email processing failed:", error);
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
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);

      try {
        const recentEmails = await ctx.db.email.findMany({
          where: {
            thread: {
              accountId: input.accountId,
            },
          },
          include: {
            thread: true,
            from: true,
          },
          orderBy: {
            sentAt: "desc",
          },
          take: 10,
        });

        return {
          totalEmails: recentEmails.length,
          emails: recentEmails.map((email: any) => ({
            id: email.id,
            subject: email.subject,
            from: email.from.address,
            sentAt: email.sentAt,
            hasEmbedding: !!email.vectorEmbedding,
          })),
        };
      } catch (error) {
        console.error("Debug query failed:", error);
        throw new Error(`Failed to debug emails: ${error}`);
      }
    }),

  getThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        important: z.boolean(),
        unread: z.boolean(),
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const emailAccount = new Account(account.token);

      try {
        await emailAccount.syncEmails(true);
      } catch (error) {
        console.error("Email sync failed:", error);
      }

      const baseFilters: Prisma.ThreadWhereInput = {
        inboxStatus: input.tab === "inbox" ? true : false,
        draftStatus: input.tab === "drafts" ? true : false,
        sentStatus: input.tab === "sent" ? true : false,
      };

      const filters: Prisma.ThreadWhereInput = { ...baseFilters };

      if (input.important) {
        filters.emails = {
          some: {
            sysLabels: {
              has: "important",
            },
          },
        };
      }

      if (input.unread) {
        filters.emails = {
          some: {
            sysLabels: {
              has: "unread",
            },
          },
        };
      }

      const limit = Math.min(input.limit ?? 15, 50);
      const { cursor } = input;

      const threads = await ctx.db.thread.findMany({
        take: limit + 1,
        where: {
          accountId: account.id,
          ...filters,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          lastMessageDate: "desc",
        },
        include: {
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              replyTo: true,
            },
            orderBy: {
              sentAt: "desc",
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (threads.length > limit) {
        const lastThread = threads.pop();
        nextCursor = lastThread?.id;
      }

      return {
        threads,
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
      const thread = await ctx.db.thread.findUnique({
        where: { id: input.threadId },
        include: {
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
        },
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      return thread;
    }),
});
