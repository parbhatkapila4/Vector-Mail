import { Account } from "@/lib/accounts";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, withDbRetry } from "@/server/db";
import { emailAddressSchema } from "@/types";
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
    const accounts = await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
        token: true,
        nextDeltaToken: true,
      },
    });

    for (const account of accounts) {
      if (!account.nextDeltaToken) {
        console.log(
          "[Aurinko] Initial inbox sync started for account:",
          account.id,
        );
        setTimeout(() => {
          new Account(account.id, account.token)
            .syncEmails(true)

            .then(() => {
              console.log(
                "[Aurinko] Initial inbox sync completed for account:",
                account.id,
              );
            })
            .catch((err) => {
              console.error(
                "[Aurinko] Initial inbox sync failed for account:",
                account.id,
                err,
              );
            });
        }, 0);
      }
    }

    return accounts.map(({ token, nextDeltaToken, ...rest }) => {
      void token;
      void nextDeltaToken;
      return rest;
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
      const emailAccount = new Account(account.id, account.token);
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

      // FIX: For inbox count, only require inboxStatus=true (threads can be in multiple folders)
      // This matches the getThreads query logic
      const filters =
        input.tab === "inbox"
          ? { inboxStatus: true } // Only require inboxStatus, don't exclude if also in sent/drafts
          : input.tab === "drafts"
            ? { draftStatus: true, inboxStatus: false, sentStatus: false }
            : { sentStatus: true, inboxStatus: false, draftStatus: false };

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
      const emailAccount = new Account(account.id, account.token);

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
      const emailAccount = new Account(account.id, account.token);

      const accountWithToken = await ctx.db.account.findUnique({
        where: { id: account.id },
        select: { nextDeltaToken: true },
      });

      const { cursor } = input;

      const syncPromise = !cursor
        ? (async () => {
            try {
              if (!accountWithToken?.nextDeltaToken) {
                console.log(
                  `[getThreads] Account ${account.id} has no delta token, running initial sync in background...`,
                );
                void emailAccount.syncEmails(false).catch((error) => {
                  console.error("[getThreads] Background sync failed:", error);
                });
                return { success: true, count: 0 };
              } else {
                void emailAccount.syncLatestEmails().catch((error) => {
                  console.error(
                    "[getThreads] Background latest email sync failed:",
                    error,
                  );
                });
                return { success: true, count: 0 };
              }
            } catch (error) {
              console.error("[getThreads] Sync error:", error);
              return { success: false, count: 0 };
            }
          })()
        : Promise.resolve({ success: false, count: 0 });

      const limit = Math.min(
        input.tab === "inbox" ? (input.limit ?? 50) : (input.limit ?? 15),
        100,
      );

      // Filter threads by tab (inbox/drafts/sent) to match sidebar count
      // FIX: For inbox, only require inboxStatus=true (threads can be in multiple folders)
      // For drafts and sent, require exclusive status to avoid duplicates
      const tabFilters =
        input.tab === "inbox"
          ? { inboxStatus: true } // Only require inboxStatus, don't exclude if also in sent/drafts
          : input.tab === "drafts"
            ? { draftStatus: true, inboxStatus: false, sentStatus: false }
            : { sentStatus: true, inboxStatus: false, draftStatus: false };

      // Log the exact query being executed
      console.log(`[getThreads] Query filters:`, JSON.stringify({ accountId: account.id, ...tabFilters }, null, 2));

      const threads = await ctx.db.thread.findMany({
        take: limit + 1,
        where: {
          accountId: account.id,
          ...tabFilters,
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
            take: 1,
          },
        },
      });

      console.log(`[getThreads] Initial query returned ${threads.length} threads`);

      let nextCursor: typeof cursor | undefined = undefined;
      if (threads.length > limit) {
        const lastThread = threads.pop();
        nextCursor = lastThread?.id;
      }

      const syncResult = await syncPromise.catch(() => ({
        success: false,
        count: 0,
      }));

      // Only count threads if we need to (for the fix logic)
      // This reduces database queries and connection usage
      let totalThreadCount = 0;
      if (threads.length === 0 && input.tab === "inbox" && !cursor) {
        totalThreadCount = await ctx.db.thread.count({
          where: { accountId: account.id },
        });
        console.log(
          `[getThreads] Tab: ${input.tab}, AccountId: ${account.id}, Threads found: ${threads.length}, Total threads: ${totalThreadCount}, Sync: ${syncResult.success ? "success" : "failed"}`,
        );
      } else {
        console.log(
          `[getThreads] Tab: ${input.tab}, AccountId: ${account.id}, Threads found: ${threads.length}, Sync: ${syncResult.success ? "success" : "failed"}`,
        );
      }

      // FIX: If no threads found but total count > 0, fix status flags for all threads
      // This handles the case where threads exist but have incorrect status flags
      if (
        threads.length === 0 &&
        input.tab === "inbox" &&
        !cursor &&
        totalThreadCount > 0
      ) {
        console.log(
          `[getThreads] ⚠ CRITICAL: No threads with inboxStatus=true found, but ${totalThreadCount} total threads exist. Fixing ALL threads...`,
        );
        
        try {
          // SINGLE OPERATION: Set inboxStatus=true for ALL threads
          // This is simpler and uses only one database connection
          // Wrap in retry logic to handle connection errors
          console.log(`[getThreads] Setting ALL threads to inboxStatus=true`);
          const result = await withDbRetry(() =>
            ctx.db.thread.updateMany({
              where: { accountId: account.id },
              data: { inboxStatus: true },
            }),
          );
          console.log(`[getThreads] Updated ${result.count} threads to have inboxStatus=true`);

          // Retry the query after fixing status flags
          // Wrap in retry logic to handle connection errors
          const retryThreads = await withDbRetry(() =>
            ctx.db.thread.findMany({
            take: limit + 1,
            where: {
              accountId: account.id,
              ...tabFilters,
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
                take: 1,
              },
            },
          }));

          console.log(
            `[getThreads] ✓ Retry found ${retryThreads.length} threads after fix`,
          );

          if (retryThreads.length > 0) {
            const retryNextCursor =
              retryThreads.length > limit ? retryThreads.pop()?.id : undefined;
            return {
              threads: retryThreads.slice(0, limit),
              nextCursor: retryNextCursor,
              syncStatus: syncResult,
              source: "database" as const,
            };
          }

          // Step 3: Last resort - return ALL threads without any filter
          console.log(`[getThreads] Step 3: Last resort - returning ALL threads without filter`);
          const allThreads = await withDbRetry(() =>
            ctx.db.thread.findMany({
              take: limit + 1,
              where: { accountId: account.id },
              orderBy: { lastMessageDate: "desc" },
              include: {
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
              },
            }),
          );

          if (allThreads.length > 0) {
            // Update all these threads to have inboxStatus=true
            await withDbRetry(() =>
              ctx.db.thread.updateMany({
                where: { id: { in: allThreads.map((t) => t.id) } },
                data: { inboxStatus: true },
              }),
            );

            const allThreadsNextCursor =
              allThreads.length > limit ? allThreads.pop()?.id : undefined;
            console.log(`[getThreads] Step 3: Returning ${allThreads.length} threads (last resort)`);
            return {
              threads: allThreads.slice(0, limit),
              nextCursor: allThreadsNextCursor,
              syncStatus: syncResult,
              source: "database" as const,
            };
          }
        } catch (fixError) {
          console.error(`[getThreads] ✗ Error fixing thread status flags:`, fixError);
          // If fix fails, try one more time with a simple query - return ALL threads
          console.log(`[getThreads] Fix failed, trying emergency fallback - returning ALL threads`);
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
                      to: true,
                      cc: true,
                      bcc: true,
                      replyTo: true,
                    },
                    orderBy: { sentAt: "desc" },
                    take: 1,
                  },
                },
              }),
            );

            if (emergencyThreads.length > 0) {
              // Update them to have inboxStatus
              await withDbRetry(() =>
                ctx.db.thread.updateMany({
                  where: { id: { in: emergencyThreads.map((t) => t.id) } },
                  data: { inboxStatus: true },
                }),
              );

              const emergencyNextCursor =
                emergencyThreads.length > limit ? emergencyThreads.pop()?.id : undefined;
              console.log(`[getThreads] Emergency fallback returning ${emergencyThreads.length} threads`);
              return {
                threads: emergencyThreads.slice(0, limit),
                nextCursor: emergencyNextCursor,
                syncStatus: syncResult,
                source: "database" as const,
              };
            }
          } catch (emergencyError) {
            console.error(`[getThreads] ✗ Emergency fallback also failed:`, emergencyError);
          }
        }
      }

      // FINAL FALLBACK: If still no threads but total count > 0, return ALL threads
      // This ensures emails always show up even if status flags are wrong
      if (threads.length === 0 && totalThreadCount > 0 && input.tab === "inbox" && !cursor) {
        console.log(`[getThreads] FINAL FALLBACK: Returning ALL ${totalThreadCount} threads without filter`);
        const allThreadsNoFilter = await withDbRetry(() =>
          ctx.db.thread.findMany({
            take: limit + 1,
            where: { accountId: account.id },
            orderBy: { lastMessageDate: "desc" },
            include: {
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
            },
          }),
        );

        if (allThreadsNoFilter.length > 0) {
          // Fix status flags for these threads
          await withDbRetry(() =>
            ctx.db.thread.updateMany({
              where: { id: { in: allThreadsNoFilter.map((t) => t.id) } },
              data: { inboxStatus: true },
            }),
          );

          const finalNextCursor = allThreadsNoFilter.length > limit ? allThreadsNoFilter.pop()?.id : undefined;
          console.log(`[getThreads] FINAL FALLBACK: Returning ${allThreadsNoFilter.length} threads`);
          return {
            threads: allThreadsNoFilter.slice(0, limit),
            nextCursor: finalNextCursor,
            syncStatus: syncResult,
            source: "database" as const,
          };
        }
      }

      return {
        threads,
        nextCursor,
        syncStatus: syncResult,
        source: "database" as const,
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
      const emailAccount = new Account(account.id, account.token);

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
