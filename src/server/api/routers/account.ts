import { Account } from "@/lib/accounts";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, withDbRetry } from "@/server/db";
import { emailAddressSchema } from "@/types";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import axios from "axios";

interface AccountAccess {
  id: string;
  emailAddress: string;
  name: string;
  token: string;
  nextDeltaToken: string | null;
  needsReconnection: boolean;
  tokenExpiresAt: Date | null;
}

export const authoriseAccountAccess = async (
  accountId: string,
  userId: string,
): Promise<AccountAccess> => {
  const account = await withDbRetry(() =>
    db.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
        token: true,
        nextDeltaToken: true,
        needsReconnection: true,
        tokenExpiresAt: true,
      },
    }),
  );

  if (!account) {
    throw new Error("Account not found");
  }

  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await withDbRetry(() =>
      ctx.db.account.findMany({
        where: {
          userId: ctx.auth.userId,
        },
        select: {
          id: true,
          emailAddress: true,
          name: true,
          token: true,
          nextDeltaToken: true,
          needsReconnection: true,
          tokenExpiresAt: true,
        },
      }),
    );

    return accounts.map(({ token, nextDeltaToken, ...rest }) => {
      void token;
      void nextDeltaToken;
      return rest;
    });
  }),

  getMyAccount: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (!input.accountId || input.accountId.trim().length === 0) {
        throw new Error("Account ID is required");
      }
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

  scheduleSend: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        scheduledAt: z.date(),
        payload: z.union([
          z.object({
            type: z.literal("rest"),
            accountId: z.string(),
            to: z.array(z.string()),
            subject: z.string(),
            body: z.string(),
            cc: z.array(z.string()).optional(),
            bcc: z.array(z.string()).optional(),
            attachments: z
              .array(
                z.object({
                  name: z.string(),
                  content: z.string(),
                  contentType: z.string(),
                }),
              )
              .optional(),
          }),
          z.object({
            type: z.literal("trpc"),
            accountId: z.string(),
            from: emailAddressSchema,
            to: z.array(emailAddressSchema),
            subject: z.string(),
            body: z.string(),
            threadId: z.string().optional(),
            inReplyTo: z.string().optional(),
            references: z.string().optional(),
            replyTo: emailAddressSchema.optional(),
            cc: z.array(emailAddressSchema).optional(),
            bcc: z.array(emailAddressSchema).optional(),
          }),
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.scheduledAt.getTime() <= Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "scheduledAt must be in the future",
        });
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const created = await ctx.db.scheduledSend.create({
        data: {
          userId: ctx.auth.userId,
          accountId: input.accountId,
          scheduledAt: input.scheduledAt,
          status: "pending",
          payload: input.payload as object,
        },
      });
      return { id: created.id };
    }),

  cancelScheduledSend: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.scheduledSend.findFirst({
        where: { id: input.id, userId: ctx.auth.userId, status: "pending" },
      });
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scheduled send not found or already sent/cancelled",
        });
      }
      await ctx.db.scheduledSend.update({
        where: { id: input.id },
        data: { status: "cancelled" },
      });
      return { success: true };
    }),

  getScheduledSends: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const rows = await ctx.db.scheduledSend.findMany({
        where: {
          accountId: input.accountId,
          userId: ctx.auth.userId,
          status: "pending",
        },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          scheduledAt: true,
          payload: true,
          createdAt: true,
        },
      });
      return rows.map((r) => ({
        id: r.id,
        scheduledAt: r.scheduledAt,
        subject:
          (r.payload && typeof r.payload === "object" && "subject" in r.payload
            ? (r.payload as { subject?: string }).subject
            : undefined) ?? "(no subject)",
        createdAt: r.createdAt,
      }));
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
        accountId: z.string().min(1),
        tab: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.accountId || input.accountId.trim().length === 0) {
        return 0;
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

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

        if (threadCount === 0 && emailBasedCount > 0) {
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
          return emailBasedCount;
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
            inboxStatus: false,
            emails: {
              some: {
                sysLabels: {
                  hasSome: ["trash"],
                },
              },
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
        return await ctx.db.thread.count({
          where: {
            accountId: account.id,
            sentStatus: true,
            inboxStatus: false,
            draftStatus: false,
          },
        });
      }
    }),

  deleteThread: protectedProcedure
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

        console.log(
          `[deleteThread] Found ${emails.length} emails in thread ${input.threadId}`,
        );

        for (const email of emails) {
          const labels = (email.sysLabels as string[]) || [];
          const updatedLabels = labels.filter((label) => label !== "inbox");
          if (!updatedLabels.includes("trash")) {
            updatedLabels.push("trash");
          }

          console.log(`[deleteThread] Updating email ${email.id}:`, {
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

      console.log(`[deleteThread] Thread ${input.threadId} marked as deleted`);

      return { success: true, message: "Thread moved to trash" };
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

  syncEmails: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        forceFullSync: z.boolean().optional().default(false),
        folder: z.enum(["inbox", "sent"]).optional().default("inbox"),
        continueToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        console.error("[syncEmails mutation] User not authenticated");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to sync emails",
        });
      }

      if (!input.accountId || input.accountId.trim().length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account ID is required",
        });
      }

      let account: AccountAccess;
      try {
        account = await authoriseAccountAccess(
          input.accountId,
          ctx.auth.userId,
        );
      } catch (error) {
        console.error(
          "[syncEmails mutation] Account authorization failed:",
          error,
        );
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found or you don't have access to it",
        });
      }

      if (!account.token || account.token.trim().length === 0) {
        console.error(
          `[syncEmails mutation] Account ${account.id} has no token, cannot sync.`,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account token is missing. Please reconnect your account.",
        });
      }

      const emailAccount = new Account(account.id, account.token);

      try {
        const shouldForceFullSync = input.forceFullSync ?? false;
        const folder: "inbox" | "sent" = input.folder ?? "inbox";
        console.log(
          `[syncEmails mutation] Starting sync for account ${account.id}, forceFullSync: ${shouldForceFullSync}, folder: ${folder}`,
        );

        const decodeContinueToken = (token: string): { pageToken?: string; sentUseLabel?: boolean } => {
          try {
            const decoded = JSON.parse(Buffer.from(token, "base64url").toString()) as unknown;
            return typeof decoded === "object" && decoded !== null && "pageToken" in decoded
              ? { pageToken: (decoded as { pageToken?: string }).pageToken, sentUseLabel: (decoded as { sentUseLabel?: boolean }).sentUseLabel }
              : {};
          } catch {
            return {};
          }
        };
        const encodeContinueToken = (pageToken: string, sentUseLabel?: boolean) =>
          Buffer.from(JSON.stringify({ pageToken, sentUseLabel: sentUseLabel ?? false }), "utf8").toString("base64url");

        if (folder === "inbox" || folder === "sent") {
          const { pageToken, sentUseLabel } = input.continueToken ? decodeContinueToken(input.continueToken) : {};
          const result = await emailAccount.fetchEmailsByFolderOnePage(folder, pageToken, sentUseLabel ?? false);
          if (result.emails.length > 0) {
            const { syncEmailsToDatabase } = await import("@/lib/sync-to-db");
            await syncEmailsToDatabase(result.emails, account.id);
          }
          const threadCount = await ctx.db.thread.count({
            where: {
              accountId: account.id,
              ...(folder === "sent" ? { sentStatus: true } : { inboxStatus: true }),
            },
          });
          const hasMore = !!result.nextPageToken;
          const continueToken = hasMore ? encodeContinueToken(result.nextPageToken!, result.sentUseLabel) : undefined;
          console.log(
            `[syncEmails mutation] Chunk done: ${result.emails.length} emails synced, hasMore: ${hasMore}, total ${folder} threads: ${threadCount}`,
          );
          return {
            success: true,
            message: result.emails.length > 0 ? `Synced ${result.emails.length} emails` : hasMore ? "Fetching more…" : "No more emails",
            threadCount,
            hasMore,
            continueToken,
          };
        }

        if (!shouldForceFullSync && account.nextDeltaToken) {
          console.log(
            `[syncEmails mutation] Attempting lightweight sync using delta token...`,
          );
          try {
            console.log(
              `[syncEmails mutation] Calling syncLatestEmails for account ${account.id}...`,
            );
            const latestSyncResult = await emailAccount.syncLatestEmails();

            console.log(
              `[syncEmails mutation] syncLatestEmails returned:`,
              JSON.stringify(latestSyncResult, null, 2),
            );

            if (latestSyncResult.authError) {
              console.error(
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

              return {
                success: false,
                message: "Authentication failed. Your session may have expired.",
                threadCount,
                needsReconnection: true,
              };
            }

            if (latestSyncResult.success && latestSyncResult.count > 0) {
              console.log(
                `[syncEmails mutation] Lightweight sync successful - synced ${latestSyncResult.count} new emails`,
              );

              const threadCount = await ctx.db.thread.count({
                where: {
                  accountId: account.id,
                  ...(input.folder === "sent"
                    ? { sentStatus: true }
                    : { inboxStatus: true }),
                },
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
              console.log(
                `[syncEmails mutation] Lightweight sync completed but no new emails found`,
              );

              const threadCount = await ctx.db.thread.count({
                where: {
                  accountId: account.id,
                  ...(input.folder === "sent"
                    ? { sentStatus: true }
                    : { inboxStatus: true }),
                },
              });

              return {
                success: true,
                message: "No new emails to sync",
                threadCount,
              };
            } else {
              console.log(
                `[syncEmails mutation] Lightweight sync failed (success: false), falling back to full sync...`,
              );
            }
          } catch (lightweightError) {
            if (lightweightError instanceof TRPCError) {
              throw lightweightError;
            }

            const errorMessage =
              lightweightError instanceof Error
                ? lightweightError.message
                : String(lightweightError);

            console.error(
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
              console.error(
                `[syncEmails mutation] Authentication/token error during lightweight sync - account marked for reconnection`,
              );


              await ctx.db.account.update({
                where: { id: account.id },
                data: { needsReconnection: true },
              }).catch(err => console.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));


              return {
                success: false,
                message: "Your account needs to be reconnected. Please click the reconnect button to continue syncing emails.",
                threadCount: 0,
                needsReconnection: true,
              };
            }

            console.log(
              `[syncEmails mutation] Lightweight sync error (non-auth), falling back to full sync: ${errorMessage}`,
            );
          }
        }

        try {

          const folder = input.folder === "sent" ? "sent" : undefined;
          await emailAccount.syncEmails(
            shouldForceFullSync || !account.nextDeltaToken,
            folder,
          );
        } catch (syncError) {
          const syncErrorMessage =
            syncError instanceof Error ? syncError.message : String(syncError);

          console.error(
            "[syncEmails mutation] Full sync failed:",
            syncErrorMessage,
          );

          if (
            syncErrorMessage.includes("Authentication failed") ||
            syncErrorMessage.includes("401") ||
            (axios.isAxiosError(syncError) &&
              syncError.response?.status === 401)
          ) {

            await ctx.db.account.update({
              where: { id: account.id },
              data: { needsReconnection: true },
            }).catch(err => console.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));

            return {
              success: false,
              message: "Your account needs to be reconnected. Please click the reconnect button to continue syncing emails.",
              threadCount: 0,
              needsReconnection: true,
            };
          }

          throw syncError;
        }


        const threadCount = await ctx.db.thread.count({
          where: {
            accountId: account.id,
            ...(input.folder === "sent"
              ? { sentStatus: true }
              : { inboxStatus: true }),
          },
        });

        const folderName = input.folder === "sent" ? "sent" : "inbox";
        console.log(
          `[syncEmails mutation] Sync completed. Found ${threadCount} ${folderName} threads.`,
        );

        return {
          success: true,
          message: `Emails synced successfully`,
          threadCount,
        };
      } catch (error) {
        console.error("[syncEmails mutation] Email sync failed:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        const isAuthError =
          errorMessage.includes("Authentication failed") ||
          errorMessage.includes("401") ||
          (axios.isAxiosError(error) && error.response?.status === 401);

        if (isAuthError) {

          await ctx.db.account.update({
            where: { id: account.id },
            data: { needsReconnection: true },
          }).catch(err => console.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));

          return {
            success: false,
            message: "Your account needs to be reconnected. Please click the reconnect button to continue syncing emails.",
            threadCount: 0,
            needsReconnection: true,
          };
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync emails: ${errorMessage}`,
        });
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

        await processExistingEmails(input.accountId, 10);
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
        console.error("Debug query failed:", error);
        throw new Error(`Failed to debug emails: ${error}`);
      }
    }),

  getThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        tab: z.string(),
        important: z.boolean(),
        unread: z.boolean(),
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.accountId || input.accountId.trim().length === 0) {
        return {
          threads: [],
          nextCursor: undefined,
          syncStatus: { success: true, count: 0 },
          source: "database" as const,
        };
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const { cursor } = input;

      const syncResult = { success: true, count: 0 };

      const limit = Math.min(
        input.tab === "inbox" ? (input.limit ?? 50) : (input.limit ?? 15),
        100,
      );

      const whereClause: Prisma.ThreadWhereInput = {
        accountId: account.id,
      };

      if (input.tab === "inbox") {
        whereClause.inboxStatus = true;
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
        whereClause.inboxStatus = false;
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

      console.log(
        `[getThreads] Query filters:`,
        JSON.stringify(
          { accountId: account.id, tab: input.tab, whereClause },
          null,
          2,
        ),
      );

      let threads: Awaited<
        ReturnType<typeof ctx.db.thread.findMany<{
          include: {
            emails: {
              include: {
                from: true;
                to: true;
                cc: true;
                bcc: true;
                replyTo: true;
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
                  to: true,
                  cc: true,
                  bcc: true,
                  replyTo: true,
                },
                orderBy: { sentAt: "desc" },
                take: 1,
              },
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
      }

      console.log(
        `[getThreads] Initial query returned ${threads.length} threads`,
      );

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
        console.log(
          `[getThreads] Tab: ${input.tab}, AccountId: ${account.id}, Threads found: ${threads.length}, Total threads: ${totalThreadCount}, Sync: ${syncResult.success ? "success" : "failed"}`,
        );
      } else {
        console.log(
          `[getThreads] Tab: ${input.tab}, AccountId: ${account.id}, Threads found: ${threads.length}, Sync: ${syncResult.success ? "success" : "failed"}`,
        );
      }

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
          console.log(`[getThreads] Setting ALL threads to inboxStatus=true`);
          const result = await withDbRetry(() =>
            ctx.db.thread.updateMany({
              where: { accountId: account.id },
              data: { inboxStatus: true },
            }),
          );
          console.log(
            `[getThreads] Updated ${result.count} threads to have inboxStatus=true`,
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
            }),
          );

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

          console.log(
            `[getThreads] Step 3: Last resort - returning ALL threads without filter`,
          );
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
            await withDbRetry(() =>
              ctx.db.thread.updateMany({
                where: { id: { in: allThreads.map((t) => t.id) } },
                data: { inboxStatus: true },
              }),
            );

            const allThreadsNextCursor =
              allThreads.length > limit ? allThreads.pop()?.id : undefined;
            console.log(
              `[getThreads] Step 3: Returning ${allThreads.length} threads (last resort)`,
            );
            return {
              threads: allThreads.slice(0, limit),
              nextCursor: allThreadsNextCursor,
              syncStatus: syncResult,
              source: "database" as const,
            };
          }
        } catch (fixError) {
          console.error(
            `[getThreads] ✗ Error fixing thread status flags:`,
            fixError,
          );
          console.log(
            `[getThreads] Fix failed, trying emergency fallback - returning ALL threads`,
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
              console.log(
                `[getThreads] Emergency fallback returning ${emergencyThreads.length} threads`,
              );
              return {
                threads: emergencyThreads.slice(0, limit),
                nextCursor: emergencyNextCursor,
                syncStatus: syncResult,
                source: "database" as const,
              };
            }
          } catch (emergencyError) {
            console.error(
              `[getThreads] ✗ Emergency fallback also failed:`,
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
        console.log(
          `[getThreads] FINAL FALLBACK: Returning ALL ${totalThreadCount} threads without filter`,
        );
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
          console.log(
            `[getThreads] FINAL FALLBACK: Returning ${allThreadsNoFilter.length} threads`,
          );
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
      try {
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
            bodySnippet: true,
            thread: {
              select: {
                accountId: true,
              },
            },
          },
        });

        if (!existingEmail || existingEmail.thread.accountId !== account.id) {
          console.warn(`Email not found: ${input.emailId}`);
          return {
            body: existingEmail?.bodySnippet || null,
            cached: false,
          };
        }

        const isPlainText =
          existingEmail.body &&
          existingEmail.body.length > 100 &&
          !/<[^>]+>/g.test(existingEmail.body);

        if (
          existingEmail.body &&
          existingEmail.body.length > 100 &&
          !isPlainText
        ) {
          return {
            body: existingEmail.body,
            cached: true,
          };
        }

        try {
          const fullEmail = await emailAccount.getEmailById(input.emailId);

          if (fullEmail?.body && fullEmail.body.trim().length > 0) {
            ctx.db.email
              .update({
                where: { id: input.emailId },
                data: {
                  body: fullEmail.body,
                },
              })
              .catch((updateError) => {
                console.error(
                  `Failed to update email body in DB: ${input.emailId}`,
                  updateError,
                );
              });

            return {
              body: fullEmail.body,
              cached: false,
            };
          } else {
            console.warn(`Email body is empty for: ${input.emailId}`);
            return {
              body: existingEmail.body || existingEmail.bodySnippet || null,
              cached: true,
            };
          }
        } catch (fetchError) {
          console.error(
            `Failed to fetch email body from API: ${input.emailId}`,
            fetchError,
          );
          return {
            body: existingEmail.body || existingEmail.bodySnippet || null,
            cached: true,
          };
        }
      } catch (error) {
        console.error(`Error in getEmailBody for ${input.emailId}:`, error);
        return {
          body: null,
          cached: false,
        };
      }
    }),
});
