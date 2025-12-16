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
          accountId: input.accountId,
          sentEmails: {
            some: {
              thread: {
                accountId: input.accountId,
              },
            },
          },
        },
        distinct: ["address"],
        take: 10,
      });
      return contacts.map((c) => ({ name: c.name, address: c.address }));
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
        const { processExistingEmails } =
          await import("@/lib/process-existing-emails");
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
          emails: recentEmails.map((email) => ({
            id: email.id,
            subject: email.subject,
            from: email.from.address,
            sentAt: email.sentAt,
            hasEmbedding: false,
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

      const accountWithToken = await ctx.db.account.findUnique({
        where: { id: account.id },
        select: { nextDeltaToken: true },
      });

      const { cursor } = input;

      const syncPromise = !cursor
        ? (async () => {
            if (!accountWithToken?.nextDeltaToken) {
              console.log(
                `[getThreads] Account ${account.id} has no delta token, running initial sync...`,
              );
              try {
                await emailAccount.syncEmails(false);
                return { success: true, count: 1 };
              } catch (error) {
                console.error("[getThreads] Initial sync failed:", error);
                return { success: false, count: 0 };
              }
            } else {
              return emailAccount.syncLatestEmails().catch((error) => {
                console.error(
                  "[getThreads] Background latest email sync failed:",
                  error,
                );
                return { success: false, count: 0 };
              });
            }
          })()
        : Promise.resolve({ success: false, count: 0 });

      const baseFilters: Prisma.ThreadWhereInput = {
        accountId: account.id,
      };

      if (input.tab === "inbox") {
        baseFilters.inboxStatus = true;
      } else if (input.tab === "drafts") {
        baseFilters.draftStatus = true;
      } else if (input.tab === "sent") {
        baseFilters.sentStatus = true;
      }

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

      const threads = await ctx.db.thread.findMany({
        take: limit + 1,
        where: filters,
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

      const syncResult = await syncPromise;

      const totalThreadCount = await ctx.db.thread.count({
        where: { accountId: account.id },
      });

      console.log(
        `[getThreads] Tab: ${input.tab}, AccountId: ${account.id}, Threads found: ${threads.length}, Total threads in DB: ${totalThreadCount}, Sync: ${syncResult.success ? "success" : "failed"}, Count: ${syncResult.count}`,
      );

      if (
        threads.length === 0 &&
        input.tab === "inbox" &&
        !cursor &&
        totalThreadCount > 0
      ) {
        console.log(
          `[getThreads] No threads with inboxStatus=true, but ${totalThreadCount} total threads exist. Trying fallback query...`,
        );
        const fallbackThreads = await ctx.db.thread.findMany({
          take: limit + 1,
          where: {
            accountId: account.id,
            emails: {
              some: {
                OR: [{ emailLabel: "inbox" }, { sysLabels: { has: "inbox" } }],
              },
            },
          },
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

        if (fallbackThreads.length > 0) {
          console.log(
            `[getThreads] Fallback query found ${fallbackThreads.length} threads - updating status flags...`,
          );
          for (const thread of fallbackThreads) {
            await ctx.db.thread.update({
              where: { id: thread.id },
              data: {
                inboxStatus: true,
                draftStatus: false,
                sentStatus: false,
              },
            });
          }
          const fallbackNextCursor =
            fallbackThreads.length > limit
              ? fallbackThreads.pop()?.id
              : undefined;

          return {
            threads: fallbackThreads.slice(0, limit),
            nextCursor: fallbackNextCursor,
            syncStatus: syncResult,
          };
        } else if (totalThreadCount > 0) {
          console.log(
            `[getThreads] Found ${totalThreadCount} threads but none match inbox filter. Showing first ${limit} threads as fallback...`,
          );
          const allThreads = await ctx.db.thread.findMany({
            take: limit + 1,
            where: {
              accountId: account.id,
            },
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

          if (allThreads.length > 0) {
            for (const thread of allThreads) {
              await ctx.db.thread.update({
                where: { id: thread.id },
                data: {
                  inboxStatus: true,
                },
              });
            }

            const allThreadsNextCursor =
              allThreads.length > limit ? allThreads.pop()?.id : undefined;

            return {
              threads: allThreads.slice(0, limit),
              nextCursor: allThreadsNextCursor,
              syncStatus: syncResult,
            };
          }
        }
      }

      return {
        threads,
        nextCursor,
        syncStatus: syncResult,
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

      const emailsNeedingAnalysis = thread.emails.filter(
        (email) => !email.summary,
      );
      if (emailsNeedingAnalysis.length > 0) {
        const { analyzeEmail } = await import("@/lib/email-analysis");
        const { arrayToVector } = await import("@/lib/vector-utils");
        Promise.all(
          emailsNeedingAnalysis.map(async (email) => {
            try {
              const emailMessage = {
                id: email.id,
                threadId: email.threadId,
                createdTime: email.createdTime.toISOString(),
                lastModifiedTime: email.lastModifiedTime.toISOString(),
                sentAt: email.sentAt.toISOString(),
                receivedAt: email.receivedAt.toISOString(),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels as Array<
                  | "junk"
                  | "trash"
                  | "sent"
                  | "inbox"
                  | "unread"
                  | "flagged"
                  | "important"
                  | "draft"
                >,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications as Array<
                  "personal" | "social" | "promotions" | "updates" | "forums"
                >,
                sensitivity: email.sensitivity,
                meetingMessageMethod:
                  email.meetingMessageMethod === null
                    ? undefined
                    : (email.meetingMessageMethod as
                        | "request"
                        | "reply"
                        | "cancel"
                        | "counter"
                        | "other"
                        | undefined),
                from: {
                  address: email.from.address,
                  name: email.from.name || "",
                },
                to: email.to.map((t) => ({
                  address: t.address,
                  name: t.name || "",
                })),
                cc: email.cc.map((c) => ({
                  address: c.address,
                  name: c.name || "",
                })),
                bcc: email.bcc.map((b) => ({
                  address: b.address,
                  name: b.name || "",
                })),
                replyTo: email.replyTo.map((r) => ({
                  address: r.address,
                  name: r.name || "",
                })),
                hasAttachments: email.hasAttachments,
                body: email.body || undefined,
                bodySnippet: email.bodySnippet || undefined,
                attachments: email.attachments.map((a) => ({
                  id: a.id,
                  name: a.name,
                  mimeType: a.mimeType,
                  size: a.size,
                  inline: a.inline,
                  contentId: a.contentId || undefined,
                  content: a.content || undefined,
                  contentLocation: a.contentLocation || undefined,
                })),
                inReplyTo: email.inReplyTo || undefined,
                references: email.references || undefined,
                threadIndex: email.threadIndex || undefined,
                internetHeaders:
                  (email.internetHeaders as unknown as Array<{
                    name: string;
                    value: string;
                  }>) || [],
                nativeProperties:
                  (email.nativeProperties as unknown as Record<
                    string,
                    string
                  >) || {},
                folderId: email.folderId || undefined,
                omitted: email.omitted as Array<
                  | "threadId"
                  | "body"
                  | "attachments"
                  | "recipients"
                  | "internetHeaders"
                >,
              };

              const analysis = await analyzeEmail(emailMessage);

              await ctx.db.email.update({
                where: { id: email.id },
                data: {
                  summary: analysis.summary,
                  keywords: analysis.tags,
                },
              });

              const embeddingVectorString = arrayToVector(
                analysis.vectorEmbedding,
              );
              await ctx.db.$executeRaw`
                UPDATE "Email" 
                SET embedding = ${embeddingVectorString}::vector
                WHERE id = ${email.id}
              `;
            } catch (error) {
              console.error(
                `Failed to analyze email ${email.id} on-demand:`,
                error,
              );
            }
          }),
        ).catch((error) => {
          console.error("Background email analysis failed:", error);
        });
      }

      return thread;
    }),

  getEmailBody: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        emailId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const emailAccount = new Account(account.token);

      const existingEmail = await ctx.db.email.findUnique({
        where: { id: input.emailId },
        select: {
          id: true,
          body: true,
          thread: {
            select: {
              accountId: true,
            },
          },
        },
      });

      if (!existingEmail || existingEmail.thread.accountId !== account.id) {
        throw new Error("Email not found");
      }

      if (existingEmail.body && existingEmail.body.length > 100) {
        return {
          body: existingEmail.body,
          cached: true,
        };
      }

      const fullEmail = await emailAccount.getEmailById(input.emailId);
      if (!fullEmail || !fullEmail.body) {
        throw new Error("Failed to fetch email body");
      }

      await ctx.db.email.update({
        where: { id: input.emailId },
        data: {
          body: fullEmail.body,
        },
      });

      return {
        body: fullEmail.body,
        cached: false,
      };
    }),
});
