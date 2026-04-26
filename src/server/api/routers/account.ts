import {
  Account,
  isInvalidAurinkoSyncTokenError,
  isTransientMailProviderError,
} from "@/lib/accounts";
import { log as auditLog } from "@/lib/audit/audit-log";
import { incrementSyncFailure } from "@/lib/metrics/store";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, withDbRetry } from "@/server/db";
import { emailAddressSchema } from "@/types";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import pLimit from "p-limit";
import { DEMO_ACCOUNT_ID, DEMO_USER_ID, DEMO_EMAIL, DEMO_DISPLAY_NAME } from "@/lib/demo/constants";
import { env } from "@/env.js";
import { checkUserRateLimit } from "@/lib/rate-limit";
import { checkDailyCap, recordUsage } from "@/lib/ai-usage";
import OpenAI from "openai";
import { getDemoThreads, getDemoThreadById, getDemoEmailBody, getDemoScheduledSends, getDemoNudges, getDemoDailyBrief, getDemoThreadBrain, getDemoUpcomingEvents, getDemoLabelsWithCounts } from "@/lib/demo/seed-demo-data";
import { withCache } from "@/lib/cache";

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

type ThreadBrainEmailRow = {
  summary: string | null;
  bodySnippet: string | null;
  from: { address: string; name: string | null };
  sentAt: Date;
};

function buildThreadBrainFallback(
  subject: string,
  emails: ThreadBrainEmailRow[],
  accountEmailLower: string,
): {
  about: string;
  expectedFromMe: string;
  expectedReason: string;
  expectedConfidence: "High" | "Medium" | "Low";
} {
  if (emails.length === 0) {
    return {
      about: subject.slice(0, 400),
      expectedFromMe: "Open the messages below to see what might be needed from you.",
      expectedReason: "No message history available yet in this thread.",
      expectedConfidence: "Low",
    };
  }
  let lastInbound: ThreadBrainEmailRow | null = null;
  for (let i = emails.length - 1; i >= 0; i--) {
    const e = emails[i]!;
    if (e.from.address.toLowerCase() !== accountEmailLower) {
      lastInbound = e;
      break;
    }
  }
  const last = emails[emails.length - 1]!;
  const lastIsInbound =
    last.from.address.toLowerCase() !== accountEmailLower;
  const snippetSource = lastInbound ?? last;
  const snippet =
    snippetSource.summary?.trim() || snippetSource.bodySnippet?.trim() || "";
  const about = `${subject}${snippet ? ` - ${snippet.slice(0, 280)}` : ""}`.slice(
    0,
    480,
  );
  const expectedFromMe = lastIsInbound
    ? "Their latest message may need a reply or action from you."
    : "You sent the latest message; you may be waiting on them.";
  const daysAgo = Math.max(
    0,
    Math.round((Date.now() - new Date(last.sentAt).getTime()) / (24 * 60 * 60 * 1000)),
  );
  const expectedReason = lastIsInbound
    ? `Last message is from an external sender ${daysAgo}d ago.`
    : `Latest message was sent by you ${daysAgo}d ago.`;
  return {
    about,
    expectedFromMe,
    expectedReason,
    expectedConfidence: lastIsInbound ? "High" : "Medium",
  };
}

export const accountRouter = createTRPCRouter({
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.auth.userId === DEMO_USER_ID) {
      return [
        { id: DEMO_ACCOUNT_ID, emailAddress: DEMO_EMAIL, name: DEMO_DISPLAY_NAME },
      ];
    }
    const accounts = await withDbRetry(() =>
      ctx.db.account.findMany({
        where: {
          userId: ctx.auth.userId,
        },
        orderBy: {
          emailAddress: "asc",
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


  getInboxIntelligenceCards: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return {
          cards: [
            {
              id: "payments",
              title: "Payments & receipts",
              count: 4,
              suggestedQuery: "Show receipts and payments",
            },
            {
              id: "travel",
              title: "Travel & flights",
              count: 2,
              suggestedQuery: "Find my flight bookings",
            },
            {
              id: "orders",
              title: "Orders & delivery",
              count: 3,
              suggestedQuery: "Show me emails about orders",
            },
          ],
        };
      }
      try {
        await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const since = new Date();
      since.setDate(since.getDate() - 90);

      const clusterDefs = [
        {
          id: "payments",
          title: "Payments & receipts",
          terms: ["payment", "receipt", "invoice", "upi", "debited", "credited", "transaction"],
          suggestedQuery: "Show receipts and payments",
        },
        {
          id: "travel",
          title: "Travel & flights",
          terms: ["flight", "airline", "booking", "itinerary", "pnr", "hotel"],
          suggestedQuery: "Find my flight bookings",
        },
        {
          id: "orders",
          title: "Orders & delivery",
          terms: ["order", "shipped", "delivery", "tracking", "dispatch"],
          suggestedQuery: "Show me emails about orders",
        },
        {
          id: "failed",
          title: "Failed / declined",
          terms: ["declined", "failed", "unsuccessful", "could not process", "insufficient"],
          suggestedQuery: "Show failed or declined payments from my emails",
        },
      ] as const;

      const cards: Array<{
        id: string;
        title: string;
        count: number;
        suggestedQuery: string;
      }> = [];

      for (const c of clusterDefs) {
        const orConditions: Prisma.EmailWhereInput[] = [];
        for (const t of c.terms) {
          orConditions.push(
            { subject: { contains: t, mode: "insensitive" } },
            { bodySnippet: { contains: t, mode: "insensitive" } },
          );
        }
        const count = await withDbRetry(() =>
          ctx.db.email.count({
            where: {
              thread: { accountId: input.accountId },
              sentAt: { gte: since },
              OR: orConditions,
            },
          }),
        );
        if (count > 0) {
          cards.push({
            id: c.id,
            title: c.title,
            count,
            suggestedQuery: c.suggestedQuery,
          });
        }
      }

      return { cards };
    }),

  getMyAccount: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (!input.accountId || input.accountId.trim().length === 0) {
        throw new Error("Account ID is required");
      }
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return {
          id: DEMO_ACCOUNT_ID,
          emailAddress: DEMO_EMAIL,
          name: DEMO_DISPLAY_NAME,
          token: "",
          nextDeltaToken: null,
          needsReconnection: false,
          tokenExpiresAt: null,
        };
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      return account;
    }),

  getSendingIdentity: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return {
          providerFromName: DEMO_DISPLAY_NAME,
          providerFromAddress: DEMO_EMAIL,
          customFromName: null,
          customFromAddress: null,
          customDomain: null,
          deliverabilityChecklist: null,
        };
      }
      type SendingIdentityRow = {
        emailAddress: string;
        name: string;
        customFromName?: string | null;
        customFromAddress?: string | null;
        customDomain?: string | null;
        deliverabilityChecklist?: unknown;
      };
      const row = (await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: { id: input.accountId, userId: ctx.auth.userId },
          select: {
            emailAddress: true,
            name: true,
            customFromName: true,
            customFromAddress: true,
            customDomain: true,
            deliverabilityChecklist: true,
          } as Record<string, boolean>,
        }),
      )) as SendingIdentityRow | null;
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      return {
        providerFromName: row.name,
        providerFromAddress: row.emailAddress,
        customFromName: row.customFromName,
        customFromAddress: row.customFromAddress,
        customDomain: row.customDomain,
        deliverabilityChecklist: row.deliverabilityChecklist as { spf?: boolean; dkim?: boolean; dmarc?: boolean } | null,
      };
    }),

  updateSendingIdentity: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        customFromName: z.string().max(200).optional().nullable(),
        customFromAddress: z.string().email("Invalid email address").max(320).optional().nullable(),
        customDomain: z.string().max(253).optional().nullable(),
        deliverabilityChecklist: z
          .object({
            spf: z.boolean().optional(),
            dkim: z.boolean().optional(),
            dmarc: z.boolean().optional(),
          })
          .optional()
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Demo account cannot update sending identity." });
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const data: {
        customFromName?: string | null;
        customFromAddress?: string | null;
        customDomain?: string | null;
        deliverabilityChecklist?: unknown;
      } = {};
      if (input.customFromName !== undefined) data.customFromName = input.customFromName;
      if (input.customFromAddress !== undefined) data.customFromAddress = input.customFromAddress;
      if (input.customDomain !== undefined) data.customDomain = input.customDomain;
      if (input.deliverabilityChecklist !== undefined) data.deliverabilityChecklist = input.deliverabilityChecklist;
      if (input.customFromAddress && !input.customDomain) {
        const domain = input.customFromAddress.split("@")[1];
        if (domain) data.customDomain = domain;
      }
      await withDbRetry(() =>
        ctx.db.account.update({
          where: { id: input.accountId },
          data: data as Parameters<typeof ctx.db.account.update>[0]["data"],
        }),
      );
      return { success: true };
    }),

  getDeliverabilityGuidance: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return { hasCustomDomain: false, providerFromAddress: DEMO_EMAIL, spf: "", dkim: "", dmarc: "" };
      }
      type DeliverabilityRow = {
        emailAddress: string;
        provider: string;
        customFromAddress?: string | null;
        customDomain?: string | null;
      };
      const row = (await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: { id: input.accountId, userId: ctx.auth.userId },
          select: { emailAddress: true, customFromAddress: true, customDomain: true, provider: true } as Record<string, boolean>,
        }),
      )) as DeliverabilityRow | null;
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      const hasCustomDomain = !!(row.customDomain ?? (row.customFromAddress && row.customFromAddress.includes("@") && row.customFromAddress.split("@")[1]));
      const provider = (row.provider ?? "").toLowerCase();
      const isGoogle = provider.includes("google") || provider.includes("gmail");
      const spfExample = isGoogle
        ? "v=spf1 include:_spf.google.com ~all"
        : "v=spf1 include:your-mail-provider.com ~all";
      const dmarcExample = "v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com";
      return {
        hasCustomDomain,
        providerFromAddress: row.emailAddress,
        spf: spfExample,
        dkim: "Enable DKIM in your mail provider (Gmail/Office 365) and add the CNAME or TXT records they provide.",
        dmarc: dmarcExample,
      };
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
        trackOpens: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Request access to connect your Gmail to use this feature.",
        });
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      let body = input.body;
      let trackingId: string | null = null;
      if (input.trackOpens) {
        const {
          createTrackingRecord,
          getTrackingPixelUrl,
          injectTrackingPixel,
        } = await import("@/lib/email-open-tracking");
        try {
          trackingId = await createTrackingRecord(account.id);
          const pixelUrl = getTrackingPixelUrl(trackingId);
          body = injectTrackingPixel(input.body, pixelUrl);
        } catch (trackErr) {
          console.error("[sendEmail] Open tracking setup failed:", trackErr);
        }
      }
      const emailAccount = new Account(account.id, account.token);
      const result = await emailAccount.sendEmail({
        ...input,
        body,
      });
      if (trackingId && result?.id) {
        try {
          const { updateTrackingMessageId } = await import(
            "@/lib/email-open-tracking"
          );
          await updateTrackingMessageId(trackingId, String(result.id));
        } catch (updateErr) {
          console.error(
            "[sendEmail] Failed to link tracking to messageId:",
            updateErr,
          );
        }
      }
      auditLog({
        userId: ctx.auth.userId,
        action: "email_sent",
        resourceId: input.threadId ?? (result as { id?: string })?.id ?? undefined,
        metadata: { accountId: input.accountId },
      });
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
            trackOpens: z.boolean().optional(),
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
            trackOpens: z.boolean().optional(),
          }),
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Request access to connect your Gmail to use this feature.",
        });
      }
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
      auditLog({
        userId: ctx.auth.userId,
        action: "scheduled_send_created",
        resourceId: created.id,
        metadata: { accountId: input.accountId, scheduledAt: input.scheduledAt },
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
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        const demo = getDemoScheduledSends();
        return demo.map((r) => ({
          id: r.id,
          scheduledAt: r.scheduledAt,
          subject:
            (r.payload && typeof r.payload === "object" && "subject" in r.payload
              ? (r.payload as { subject?: string }).subject
              : undefined) ?? "(no subject)",
          createdAt: r.createdAt,
        }));
      }
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
        labelId: z.string().min(1).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.accountId || input.accountId.trim().length === 0) {
        return 0;
      }
      if (ctx.auth.userId === DEMO_USER_ID && (input.accountId === DEMO_ACCOUNT_ID || input.accountId === "placeholder")) {
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

  deleteThread: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID) {
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

  archiveThread: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID) {
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
      if (ctx.auth.userId === DEMO_USER_ID) {
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
      if (ctx.auth.userId === DEMO_USER_ID) {
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

  getNudges: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return { nudges: getDemoNudges() };
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const now = new Date();
      const NUDGE_CAP = 15;
      const UNREPLIED_DAYS = 14;
      const unrepliedCutoff = new Date(now);
      unrepliedCutoff.setDate(unrepliedCutoff.getDate() - UNREPLIED_DAYS);

      const nudges: Array<{
        threadId: string;
        type: "REMINDER" | "UNREPLIED";
        reason: string;
        thread?: {
          subject: string;
          lastMessageDate: Date;
          snippet?: string | null;
          remindAt?: Date | null;
        };
      }> = [];

      const dueReminderThreads = await ctx.db.thread.findMany({
        where: {
          accountId: account.id,
          remindAt: { not: null, lte: now },
          emails: {
            none: { sysLabels: { hasSome: ["trash"] } },
          },
        },
        orderBy: { remindAt: "asc" },
        take: NUDGE_CAP,
        select: {
          id: true,
          subject: true,
          lastMessageDate: true,
          remindAt: true,
          emails: {
            orderBy: { sentAt: "desc" },
            take: 1,
            select: { bodySnippet: true },
          },
        },
      });
      for (const t of dueReminderThreads) {
        nudges.push({
          threadId: t.id,
          type: "REMINDER",
          reason: "Reminder",
          thread: {
            subject: t.subject,
            lastMessageDate: t.lastMessageDate,
            snippet: t.emails[0]?.bodySnippet ?? null,
            remindAt: t.remindAt,
          },
        });
      }

      const candidateUnreplied = await ctx.db.thread.findMany({
        where: {
          accountId: account.id,
          inboxStatus: true,
          lastMessageDate: { gte: unrepliedCutoff },
          OR: [
            { snoozedUntil: null },
            { snoozedUntil: { lte: now } },
          ],
          emails: {
            none: { sysLabels: { hasSome: ["trash"] } },
          },
        },
        orderBy: { lastMessageDate: "desc" },
        take: 50,
        select: {
          id: true,
          subject: true,
          lastMessageDate: true,
          emails: {
            orderBy: { sentAt: "desc" },
            take: 1,
            select: {
              bodySnippet: true,
              from: { select: { address: true } },
            },
          },
        },
      });
      const accountEmailLower = account.emailAddress.toLowerCase();
      const unrepliedThreads = candidateUnreplied.filter((t) => {
        const latestEmail = t.emails[0];
        if (!latestEmail?.from?.address) return false;
        return latestEmail.from.address.toLowerCase() !== accountEmailLower;
      });
      const existingReminderIds = new Set(dueReminderThreads.map((t) => t.id));
      let unrepliedAdded = 0;
      for (const t of unrepliedThreads) {
        if (existingReminderIds.has(t.id) || unrepliedAdded >= NUDGE_CAP) break;
        nudges.push({
          threadId: t.id,
          type: "UNREPLIED",
          reason: "You haven't replied",
          thread: {
            subject: t.subject,
            lastMessageDate: t.lastMessageDate,
            snippet: t.emails[0]?.bodySnippet ?? null,
          },
        });
        unrepliedAdded++;
      }

      return { nudges };
    }),

  getDailyBrief: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return getDemoDailyBrief();
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const cacheKey = `dailyBrief:v1:${ctx.auth.userId}:${account.id}`;
      return withCache(
        cacheKey,
        async () => {
          const now = new Date();
          const BRIEF_CAP = 10;
          const UNREPLIED_DAYS = 14;
          const unrepliedCutoff = new Date(now);
          unrepliedCutoff.setDate(unrepliedCutoff.getDate() - UNREPLIED_DAYS);

          type BriefRow = {
            threadId: string;
            subject: string;
            lastMessageDate: Date;
            reason: string;
            confidence?: "High" | "Medium" | "Low";
          };

          const needsReply: BriefRow[] = [];
          const needsIds = new Set<string>();

          const dueReminderThreads = await ctx.db.thread.findMany({
            where: {
              accountId: account.id,
              remindAt: { not: null, lte: now },
              emails: {
                none: { sysLabels: { hasSome: ["trash"] } },
              },
            },
            orderBy: { remindAt: "asc" },
            take: BRIEF_CAP,
            select: {
              id: true,
              subject: true,
              lastMessageDate: true,
            },
          });
          for (const t of dueReminderThreads) {
            if (needsReply.length >= BRIEF_CAP) break;
            needsReply.push({
              threadId: t.id,
              subject: t.subject || "(No subject)",
              lastMessageDate: t.lastMessageDate,
              reason: "Reminder due",
              confidence: "High",
            });
            needsIds.add(t.id);
          }

          const candidateUnreplied = await ctx.db.thread.findMany({
            where: {
              accountId: account.id,
              inboxStatus: true,
              lastMessageDate: { gte: unrepliedCutoff },
              OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
              emails: {
                none: { sysLabels: { hasSome: ["trash"] } },
              },
            },
            orderBy: { lastMessageDate: "desc" },
            take: 50,
            select: {
              id: true,
              subject: true,
              lastMessageDate: true,
              threadLabels: {
                select: { label: { select: { name: true } } },
              },
              emails: {
                orderBy: { sentAt: "desc" },
                take: 1,
                select: {
                  from: { select: { address: true } },
                  subject: true,
                  bodySnippet: true,
                  keywords: true,
                  sysClassifications: true,
                },
              },
            },
          });
          const accountEmailLower = account.emailAddress.toLowerCase();
          for (const t of candidateUnreplied) {
            if (needsReply.length >= BRIEF_CAP) break;
            const latestEmail = t.emails[0];
            if (!latestEmail?.from?.address) continue;
            if (latestEmail.from.address.toLowerCase() === accountEmailLower) continue;
            if (needsIds.has(t.id)) continue;

            const sysC = (latestEmail.sysClassifications ?? []).map((c) =>
              String(c).toLowerCase(),
            );
            const labelNames = t.threadLabels.map((tl) =>
              tl.label.name.toLowerCase(),
            );
            const kw = (latestEmail.keywords ?? []).map((k) =>
              String(k).toLowerCase(),
            );
            const blob = [
              t.subject ?? "",
              latestEmail.subject ?? "",
              latestEmail.bodySnippet ?? "",
              ...kw,
            ]
              .join(" ")
              .toLowerCase();
            const isPromoLike =
              sysC.some((c) =>
                ["promotions", "social", "updates", "forums"].includes(c),
              ) ||
              labelNames.some((n) =>
                /\b(promotion|promotions|newsletter|marketing|unsubscribe|bulk|social|updates|forums)\b/.test(
                  n,
                ),
              ) ||
              /\b(newsletter|promo|promotional|marketing|unsubscribe|sale|offer|discount|deal)\b/.test(
                blob,
              );
            if (isPromoLike) continue;

            needsReply.push({
              threadId: t.id,
              subject: t.subject || "(No subject)",
              lastMessageDate: t.lastMessageDate,
              reason: `Last message from external sender ${Math.max(
                0,
                Math.round(
                  (Date.now() - new Date(t.lastMessageDate).getTime()) /
                  (24 * 60 * 60 * 1000),
                ),
              )}d ago`,
              confidence: "High",
            });
            needsIds.add(t.id);
          }

          const URGENCY_RE = /\b(urgent|asap|immediately|deadline|eod|eow|invoice|contract|legal|litigation|board|investor|due today|time[\s-]?sensitive)\b/i;
          const LOW_SUBJ_RE = /\b(newsletter|digest|weekly wrap|unsubscribe|promo|black\s*friday|\d+%\s*off|sale ends|your receipt is|no[\s-]?reply)\b/i;

          const briefCandidates = await ctx.db.thread.findMany({
            where: {
              accountId: account.id,
              inboxStatus: true,
              OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
              emails: {
                none: { sysLabels: { hasSome: ["trash"] } },
              },
            },
            orderBy: { lastMessageDate: "desc" },
            take: 100,
            select: {
              id: true,
              subject: true,
              lastMessageDate: true,
              threadLabels: {
                select: { label: { select: { name: true } } },
              },
              emails: {
                orderBy: { sentAt: "desc" },
                take: 1,
                select: {
                  subject: true,
                  bodySnippet: true,
                  keywords: true,
                  sysLabels: true,
                  sysClassifications: true,
                  sensitivity: true,
                  meetingMessageMethod: true,
                },
              },
            },
          });

          const important: BriefRow[] = [];
          const lowPriority: BriefRow[] = [];

          const labelImportant = (names: string[]) =>
            names.some((n) => /\bimportant\b/i.test(n));
          const labelLow = (names: string[]) =>
            names.some((n) =>
              /\b(promotion|promotions|newsletter|marketing|unsubscribe|bulk)\b/i.test(n),
            );

          for (const t of briefCandidates) {
            if (needsIds.has(t.id)) continue;
            if (important.length >= BRIEF_CAP && lowPriority.length >= BRIEF_CAP) break;

            const latest = t.emails[0];
            if (!latest) continue;
            const labelNames = t.threadLabels.map((tl) => tl.label.name);
            const sysL = (latest.sysLabels ?? []).map((s) => String(s).toLowerCase());
            const sysC = (latest.sysClassifications ?? []).map((s) =>
              String(s).toLowerCase(),
            );
            const kw = (latest.keywords ?? []).map((k) => String(k).toLowerCase());
            const blob = [t.subject, latest.subject, latest.bodySnippet ?? "", ...kw].join(
              " ",
            );

            let impReason: string | null = null;
            if (labelImportant(labelNames)) impReason = "Marked Important";
            else if (sysL.includes("important") || sysL.includes("starred"))
              impReason = sysL.includes("starred") ? "Starred in Gmail" : "Flagged important";
            else if (
              latest.sensitivity === "confidential" ||
              latest.sensitivity === "private"
            )
              impReason = "Sensitive (confidential / private)";
            else if (latest.meetingMessageMethod)
              impReason = "Calendar meeting or invite";
            else if (kw.some((k) => URGENCY_RE.test(k))) impReason = "Keywords look time-sensitive";
            else if (URGENCY_RE.test(blob)) impReason = "Looks time-sensitive or high-stakes";

            if (impReason) {
              if (important.length < BRIEF_CAP) {
                important.push({
                  threadId: t.id,
                  subject: t.subject || "(No subject)",
                  lastMessageDate: t.lastMessageDate,
                  reason: impReason,
                  confidence:
                    impReason === "Marked Important" ||
                      impReason === "Starred in Gmail" ||
                      impReason === "Flagged important"
                      ? "High"
                      : "Medium",
                });
              }
              continue;
            }

            if (lowPriority.length >= BRIEF_CAP) continue;

            let lowReason: string | null = null;
            if (sysC.includes("promotions")) lowReason = "Promotions category";
            else if (sysC.includes("social")) lowReason = "Social category";
            else if (sysC.includes("forums")) lowReason = "Forums category";
            else if (labelLow(labelNames)) lowReason = "Bulk / marketing label";
            else if (
              kw.some((k) =>
                /\b(newsletter|promotional|marketing|unsubscribe|digest)\b/i.test(k),
              )
            )
              lowReason = "Newsletter or bulk keywords";
            else if (LOW_SUBJ_RE.test(blob)) lowReason = "Likely newsletter or promo";

            if (lowReason) {
              lowPriority.push({
                threadId: t.id,
                subject: t.subject || "(No subject)",
                lastMessageDate: t.lastMessageDate,
                reason: lowReason,
                confidence:
                  lowReason === "Promotions category" ||
                    lowReason === "Social category" ||
                    lowReason === "Forums category"
                    ? "High"
                    : "Medium",
              });
            }
          }

          return { needsReply, important, lowPriority };
        },
        60_000,
      );
    }),

  syncFirstBatchQuick: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
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
            console.warn(
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
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
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
              console.error(`[getInboxPreview] Failed to set needsReconnection:`, err),
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
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return { success: true, message: "Demo mode - no sync", needsReconnection: false };
      }
      if (!ctx.auth.userId) {
        console.error("[syncEmails mutation] User not authenticated");
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
              console.error("[syncEmails] Enqueue embedding jobs failed:", err);
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
            const latestInbox = await ctx.db.thread.findFirst({
              where: { accountId: account.id, inboxStatus: true },
              orderBy: { lastMessageDate: "desc" },
              select: { lastMessageDate: true },
            });
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const inboxStale = !latestInbox?.lastMessageDate || latestInbox.lastMessageDate < oneDayAgo;
            if (inboxStale) {
              await ctx.db.account.update({
                where: { id: account.id },
                data: { nextDeltaToken: null },
              }).catch(() => { });
            }
            const syncApiTimeoutMs = inboxStale ? 52_000 : 10_000;
            const syncApiFirstPage =
              await emailAccount.tryGetFirstPageViaSyncApi(syncApiTimeoutMs);
            if (syncApiFirstPage && (syncApiFirstPage.records.length > 0 || syncApiFirstPage.nextPageToken)) {
              if (syncApiFirstPage.records.length > 0) {
                const { syncEmailsToDatabase } = await import("@/lib/sync-to-db");
                await syncEmailsToDatabase(syncApiFirstPage.records, account.id);
              }
              if (syncApiFirstPage.nextDeltaToken) {
                await ctx.db.account.update({
                  where: { id: account.id },
                  data: { nextDeltaToken: syncApiFirstPage.nextDeltaToken },
                }).catch(() => { });
              }
              const threadCount = await ctx.db.thread.count({
                where: { accountId: account.id, inboxStatus: true },
              });
              const hasMore = !!syncApiFirstPage.nextPageToken;
              const continueToken = hasMore && syncApiFirstPage.nextPageToken
                ? encodeContinueToken("", false, false, false, false, false, syncApiFirstPage.nextPageToken)
                : undefined;
              ctx.log?.info(
                {
                  event: "sync_success",
                  accountId: account.id,
                  folder: "inbox",
                  durationMs: Date.now() - syncStartTime,
                  countSynced: syncApiFirstPage.records.length,
                  threadCount,
                  hasMore,
                  source: "sync_api",
                },
                "inbox first page done (Sync API)",
              );
              return {
                success: true,
                message: syncApiFirstPage.records.length > 0 ? `Synced ${syncApiFirstPage.records.length} emails` : hasMore ? "Fetching more…" : "No more emails",
                threadCount,
                hasMore,
                continueToken,
              };
            }

            const chunkMaxIds = inboxStale ? 36 : 50;
            const result = await emailAccount.fetchInboxFirstPageInChunks(
              chunkMaxIds,
              5,
              inboxStale ? 22_000 : 15_000,
              inboxStale ? 11_000 : 10_000,
            );
            const threadCount = await ctx.db.thread.count({
              where: { accountId: account.id, inboxStatus: true },
            });
            const hasMore = !!result.nextPageToken;
            const continueToken = hasMore
              ? encodeContinueToken(result.nextPageToken!, false, false, false, false, false)
              : undefined;
            ctx.log?.info(
              {
                event: "sync_success",
                accountId: account.id,
                folder: "inbox",
                durationMs: Date.now() - syncStartTime,
                countSynced: result.emails.length,
                threadCount,
                hasMore,
                source: "list_chunks",
              },
              "inbox first page done (chunked)",
            );
            return {
              success: true,
              message: result.emails.length > 0 ? `Synced ${result.emails.length} emails` : hasMore ? "Fetching more…" : "No more emails",
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
                message: syncResult.records.length > 0 ? `Synced ${syncResult.records.length} emails` : hasMore ? "Fetching more…" : "No more emails",
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
              message: result.emails.length > 0 ? `Synced ${result.emails.length} emails` : hasMore ? "Fetching more…" : "No more emails",
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
            console.log(
              `[syncEmails mutation] Attempting lightweight sync using delta token...`,
            );
            try {
              const latestSyncResult = await emailAccount.syncLatestEmails();

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
                }).catch(err => console.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));
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
                  console.error("[syncEmails] Enqueue embedding jobs failed:", err);
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
                console.error(
                  `[syncEmails mutation] Authentication/token error during lightweight sync - account marked for reconnection`,
                );
                await ctx.db.account.update({
                  where: { id: account.id },
                  data: { needsReconnection: true },
                }).catch(err => console.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));
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
                  console.error(
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
                    console.error(
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
            console.error("[syncEmails] Enqueue embedding jobs failed:", err);
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
          console.error("[syncEmails mutation] Email sync failed:", error);

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
                console.error(
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
            }).catch(err => console.error(`[syncEmails mutation] Failed to update needsReconnection:`, err));

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
        };
      }
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
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
        };
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const { cursor } = input;
      const syncResult = { success: true, count: 0 };

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
          const shouldRefreshLatest =
            !latestInboxThread?.lastMessageDate ||
            latestInboxThread.lastMessageDate < staleCutoff;
          if (shouldRefreshLatest && account.token) {
            const emailAccount = new Account(account.id, account.token);
            await emailAccount.fetchAndSyncLatestInboxPage();
          }
        } catch (refreshErr) {
          console.warn(
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
          console.warn("[getThreads] Inbox status fix failed, continuing:", fixErr);
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
          orderBy: [
            { lastMessageDate: "desc" },
            { id: "desc" },
          ],
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
          } catch (repairErr) {
            console.warn("[getThreads] Inbox lastMessageDate repair failed:", repairErr);
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
            };
          }
        } catch (fixError) {
          console.error(
            `[getThreads] ✗ Error fixing thread status flags:`,
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
      if (ctx.auth.userId === DEMO_USER_ID) {
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
            console.error("Enqueue email analysis jobs failed:", err);
          },
        );
      }

      return thread;
    }),

  getThreadBrain: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        accountId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return getDemoThreadBrain(input.threadId);
      }

      let account: AccountAccess;
      try {
        account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found or access denied",
        });
      }

      const thread = await ctx.db.thread.findFirst({
        where: { id: input.threadId, accountId: account.id },
        select: {
          subject: true,
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              summary: true,
              bodySnippet: true,
              sentAt: true,
              from: { select: { address: true, name: true } },
            },
          },
        },
      });

      if (!thread) {
        return {
          about: "This thread is not available right now.",
          expectedFromMe:
            "Try selecting another thread, or refresh the inbox if this was just synced.",
          expectedReason:
            "The thread may have moved accounts or is still loading from sync.",
          expectedConfidence: "Low" as const,
        };
      }

      const accountEmailLower = account.emailAddress.toLowerCase();
      const fallback = buildThreadBrainFallback(
        thread.subject || "(No subject)",
        thread.emails,
        accountEmailLower,
      );

      const aiLimit = checkUserRateLimit(ctx.auth.userId, "ai");
      if (!aiLimit.allowed || !env.OPENROUTER_API_KEY) {
        return fallback;
      }

      const cap = await checkDailyCap(ctx.auth.userId, env.AI_DAILY_CAP_TOKENS);
      if (!cap.allowed) {
        return fallback;
      }

      try {
        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: env.OPENROUTER_API_KEY,
          defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
            "X-Title": "VectorMail AI",
          },
        });

        const lines = thread.emails.map((e, i) => {
          const from = e.from.name || e.from.address;
          const bit = (e.summary || e.bodySnippet || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 220);
          return `${i + 1}. From ${from} | ${bit || "(no preview)"}`;
        });

        const prompt = `The mailbox owner is the account holder (incoming mail is addressed to them).

Thread subject: ${thread.subject}

Messages in chronological order (oldest to newest):
${lines.join("\n")}

Return JSON only with this shape:
{"about":"1-2 sentences: what this thread is about","expectedFromMe":"1-2 sentences: what the mailbox owner should do next (reply, wait, archive, or say if unclear)","expectedReason":"short plain-English why this recommendation matters","expectedConfidence":"High|Medium|Low"}`;

        const completion = await openai.chat.completions.create({
          model: "anthropic/claude-3.5-haiku",
          messages: [
            {
              role: "system",
              content:
                "You triage email threads for the inbox owner. Use only the provided lines. Output valid JSON only.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 220,
          temperature: 0.2,
          response_format: { type: "json_object" },
        });

        recordUsage({
          userId: ctx.auth.userId,
          accountId: account.id,
          operation: "chat",
          inputTokens: completion.usage?.prompt_tokens ?? 0,
          outputTokens: completion.usage?.completion_tokens ?? 0,
          model: completion.model ?? undefined,
        });

        const raw = completion.choices[0]?.message?.content?.trim() ?? "";
        const parsed = JSON.parse(raw) as {
          about?: string;
          expectedFromMe?: string;
          expectedReason?: string;
          expectedConfidence?: string;
        };
        const about = typeof parsed.about === "string" ? parsed.about.trim() : "";
        const expectedFromMe =
          typeof parsed.expectedFromMe === "string"
            ? parsed.expectedFromMe.trim()
            : "";
        const expectedReason =
          typeof parsed.expectedReason === "string"
            ? parsed.expectedReason.trim()
            : fallback.expectedReason;
        const expectedConfidenceRaw =
          typeof parsed.expectedConfidence === "string"
            ? parsed.expectedConfidence.trim()
            : fallback.expectedConfidence;
        const expectedConfidence: "High" | "Medium" | "Low" =
          expectedConfidenceRaw === "High" ||
            expectedConfidenceRaw === "Medium" ||
            expectedConfidenceRaw === "Low"
            ? expectedConfidenceRaw
            : fallback.expectedConfidence;
        if (about.length > 0 && expectedFromMe.length > 0) {
          return {
            about: about.slice(0, 800),
            expectedFromMe: expectedFromMe.slice(0, 800),
            expectedReason: expectedReason.slice(0, 240),
            expectedConfidence,
          };
        }
      } catch (e) {
        console.warn("[getThreadBrain] LLM failed, using fallback", e);
      }

      return fallback;
    }),

  getEventForThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.threadId.startsWith("demo-")) {
        return null;
      }
      const thread = await ctx.db.thread.findUnique({
        where: { id: input.threadId },
        include: {
          emails: {
            orderBy: { sentAt: "desc" },
            take: 1,
            select: {
              id: true,
              subject: true,
              body: true,
              bodySnippet: true,
            },
          },
        },
      });
      if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });

      const userAccountIds = await ctx.db.account
        .findMany({
          where: { userId: ctx.auth.userId },
          select: { id: true },
        })
        .then((rows) => new Set(rows.map((r) => r.id)));
      if (!userAccountIds.has(thread.accountId)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      const email = thread.emails[0];
      if (!email) return null;

      const body = email.body ?? email.bodySnippet ?? "";
      const { extractEventFromEmail } = await import("@/lib/event-extraction");
      const event = await extractEventFromEmail(
        { subject: email.subject, body },
        { userId: ctx.auth.userId, accountId: thread.accountId },
      );
      if (!event) return null;

      return {
        ...event,
        sourceEmailId: email.id,
        sourceThreadId: thread.id,
      };
    }),

  getUpcomingEventsFromEmails: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return { events: getDemoUpcomingEvents() };
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const now = new Date();
      const DAYS = 60;
      const EXTRACTION_CONCURRENCY = 4;
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - DAYS);
      const PROVIDER_LINK_RE =
        /\b(?:https?:\/\/)?(?:meet\.google\.com\/[a-z0-9-]+|[\w.-]+\.zoom\.us\/(?:j|my|w|s)\/[^\s<>"')]+|teams\.microsoft\.com\/l\/meetup-join\/[^\s<>"')]+)\b/i;
      const PROVIDER_HINT_RE =
        /\b(google meet|meet\.google\.com|zoom|teams\.microsoft\.com|microsoft teams)\b/i;

      const inboxEmails = await ctx.db.email.findMany({
        where: {
          sentAt: { gte: cutoff },
          OR: [
            { sysLabels: { hasSome: ["inbox"] } },
            { sysLabels: { hasSome: ["INBOX"] } },
            { sysLabels: { hasSome: ["sent"] } },
            { sysLabels: { hasSome: ["SENT"] } },
          ],
          NOT: {
            OR: [
              { sysLabels: { hasSome: ["trash", "spam", "junk"] } },
              { sysLabels: { hasSome: ["TRASH", "SPAM", "JUNK"] } },
            ],
          },
          thread: {
            accountId: account.id,
          },
        },
        orderBy: { sentAt: "desc" },
        select: {
          id: true,
          subject: true,
          bodySnippet: true,
          from: true,
          keywords: true,
          sysClassifications: true,
          meetingMessageMethod: true,
          sentAt: true,
          threadId: true,
        },
      });

      const candidateEmailIds: string[] = [];
      const candidateMeta = new Map<
        string,
        { threadId: string; sentAt: Date; subject: string; shouldFallbackToHeuristicEvent: boolean }
      >();
      for (const email of inboxEmails) {
        const subject = email.subject ?? "";
        const snippet = email.bodySnippet ?? "";
        const fromName = email.from?.name ?? "";
        const fromAddress = email.from?.address ?? "";
        const blob = `${subject}\n${snippet}\n${fromName}\n${fromAddress}\n${(email.keywords ?? []).join(" ")}`;
        const explicitMeeting = Boolean(email.meetingMessageMethod);
        const hasProviderHint = PROVIDER_HINT_RE.test(blob);
        if (!explicitMeeting && !hasProviderHint) continue;
        const shouldFallbackToHeuristicEvent = explicitMeeting;
        candidateEmailIds.push(email.id);
        candidateMeta.set(email.id, {
          threadId: email.threadId,
          sentAt: email.sentAt,
          subject: subject || "(No subject)",
          shouldFallbackToHeuristicEvent,
        });
      }

      if (candidateEmailIds.length === 0) {
        return { events: [] };
      }

      const candidateEmails = await ctx.db.email.findMany({
        where: { id: { in: candidateEmailIds } },
        select: {
          id: true,
          threadId: true,
          subject: true,
          body: true,
          bodySnippet: true,
          sentAt: true,
          meetingMessageMethod: true,
        },
      });

      const { extractEventFromEmail } = await import("@/lib/event-extraction");
      const limit = pLimit(EXTRACTION_CONCURRENCY);
      const results = await Promise.all(
        candidateEmails.map((email) =>
          limit(async () => {
            const bodyText = `${email.subject ?? ""}\n${email.bodySnippet ?? ""}\n${email.body ?? ""}`;
            const hasProviderLink = PROVIDER_LINK_RE.test(bodyText);
            if (!hasProviderLink) return null;
            const event = await extractEventFromEmail(
              { subject: email.subject, body: email.body ?? email.bodySnippet ?? "" },
              { userId: ctx.auth.userId, accountId: account.id },
            );
            if (event) {
              return {
                ...event,
                sourceEmailId: email.id,
                sourceThreadId: email.threadId,
              };
            }
            const meta = candidateMeta.get(email.id);
            if (email.meetingMessageMethod || meta?.shouldFallbackToHeuristicEvent) {
              return {
                title: email.subject || "Meeting email",
                startAt: email.sentAt.toISOString(),
                endAt: new Date(email.sentAt.getTime() + 60 * 60 * 1000).toISOString(),
                sourceEmailId: email.id,
                sourceThreadId: email.threadId,
              };
            }
            return null;
          }),
        ),
      );
      const events = results.filter((r): r is NonNullable<typeof r> => r !== null);
      const upcoming = events.filter((e) => new Date(e.startAt).getTime() >= now.getTime());
      const past = events.filter((e) => new Date(e.startAt).getTime() < now.getTime());
      upcoming.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      past.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
      const sorted = [...upcoming, ...past];
      const seen = new Set<string>();
      const deduped = sorted.filter((e) => {
        const key = `${e.title.slice(0, 40)}|${new Date(e.startAt).getTime()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      type EventItem = { title: string; startAt: string; endAt?: string; sourceEmailId: string; sourceThreadId: string };
      const saved = await ctx.db.savedCalendarEvent.findMany({
        where: { accountId: account.id, userId: ctx.auth.userId },
        orderBy: { startAt: "desc" },
        take: 30,
      });
      const savedMapped: EventItem[] = saved.map((s: { title: string; startAt: Date; endAt: Date | null; threadId: string }) => ({
        title: s.title,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt?.toISOString(),
        sourceEmailId: "",
        sourceThreadId: s.threadId,
      }));
      const byThread = new Map<string, EventItem>();
      savedMapped.forEach((e) => {
        if (!byThread.has(e.sourceThreadId)) byThread.set(e.sourceThreadId, e);
      });
      deduped.forEach((e) => {
        const existing = byThread.get(e.sourceThreadId);
        if (!existing) {
          byThread.set(e.sourceThreadId, { ...e, sourceEmailId: e.sourceEmailId });
          return;
        }
        const existingTs = new Date(existing.startAt).getTime();
        const nextTs = new Date(e.startAt).getTime();
        if (!Number.isNaN(nextTs) && (Number.isNaN(existingTs) || nextTs > existingTs)) {
          byThread.set(e.sourceThreadId, { ...e, sourceEmailId: e.sourceEmailId });
        }
      });
      const combined = Array.from(byThread.values());
      combined.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      const upcomingOnly = combined.filter((event) => {
        const endTs = event.endAt ? new Date(event.endAt).getTime() : Number.NaN;
        const startTs = new Date(event.startAt).getTime();
        if (Number.isFinite(endTs)) return endTs > now.getTime();
        return startTs > now.getTime();
      });

      return { events: upcomingOnly.slice(0, 20) };
    }),

  saveEventToCalendarList: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        threadId: z.string().min(1),
        title: z.string().min(1),
        startAt: z.string(),
        endAt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return { ok: true };
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const startAt = new Date(input.startAt);
      const endAt = input.endAt ? new Date(input.endAt) : null;
      if (Number.isNaN(startAt.getTime())) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid startAt" });
      await ctx.db.savedCalendarEvent.create({
        data: {
          userId: ctx.auth.userId,
          accountId: input.accountId,
          threadId: input.threadId,
          title: input.title,
          startAt,
          endAt,
        },
      });
      return { ok: true };
    }),

  getEmailBody: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        emailId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        const demo = getDemoEmailBody(input.emailId);
        if (!demo) return { body: null, cached: false };
        return { body: demo.body ?? demo.bodySnippet, cached: true };
      }
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

        const hasUnresolvedCid =
          existingEmail.body && /cid:/i.test(existingEmail.body);

        const looksLikeStrippedMetadata =
          existingEmail.body && /\[image:\s*[^\]]*\]/i.test(existingEmail.body);

        if (
          existingEmail.body &&
          existingEmail.body.length > 100 &&
          !isPlainText &&
          !hasUnresolvedCid &&
          !looksLikeStrippedMetadata
        ) {
          return {
            body: existingEmail.body,
            cached: true,
          };
        }

        try {
          const fullEmail = await emailAccount.getEmailById(input.emailId);

          if (fullEmail?.body && fullEmail.body.trim().length > 0) {
            let bodyToReturn = fullEmail.body;


            if (
              fullEmail.attachments?.length > 0 &&
              typeof bodyToReturn === "string"
            ) {
              for (const att of fullEmail.attachments) {
                if (
                  att.inline &&
                  att.contentId &&
                  att.content &&
                  att.mimeType
                ) {
                  const cidClean = att.contentId.replace(/^<|>$/g, "").trim();
                  if (!cidClean) continue;
                  const dataUrl = `data:${att.mimeType};base64,${att.content}`;
                  const escapedCid = cidClean.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&",
                  );
                  const cidRegex = new RegExp(
                    `cid:<?${escapedCid}>?`,
                    "gi",
                  );
                  bodyToReturn = bodyToReturn.replace(cidRegex, dataUrl);
                }
              }
            }

            ctx.db.email
              .update({
                where: { id: input.emailId },
                data: {
                  body: bodyToReturn,
                },
              })
              .catch((updateError) => {
                console.error(
                  `Failed to update email body in DB: ${input.emailId}`,
                  updateError,
                );
              });

            return {
              body: bodyToReturn,
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

  getEmailOpenByMessageId: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const open = await ctx.db.emailOpen.findFirst({
        where: {
          messageId: input.messageId,
          accountId: input.accountId,
        },
        select: { openedAt: true },
      });
      if (!open?.openedAt) return null;
      return { openedAt: open.openedAt };
    }),


  createLabel: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        name: z.string().min(1).max(100),
        color: z.string().max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      return ctx.db.label.create({
        data: {
          accountId: input.accountId,
          name: input.name.trim(),
          color: input.color ?? undefined,
        },
      });
    }),

  getLabels: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        const withCounts = getDemoLabelsWithCounts();
        return withCounts.map((l) => ({
          id: l.id,
          name: l.name,
          color: l.color,
          accountId: DEMO_ACCOUNT_ID,
          createdAt: l.createdAt,
        }));
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      return ctx.db.label.findMany({
        where: { accountId: input.accountId },
        orderBy: { name: "asc" },
      });
    }),

  getLabelsWithCounts: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.auth.userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return getDemoLabelsWithCounts();
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const labels = await ctx.db.label.findMany({
        where: { accountId: input.accountId },
        orderBy: { name: "asc" },
        include: {
          _count: { select: { threadLabels: true } },
        },
      });
      return labels.map((l) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        createdAt: l.createdAt,
        threadCount: l._count.threadLabels,
      }));
    }),

  updateLabel: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(100).optional(),
        color: z.string().max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const label = await ctx.db.label.findUnique({
        where: { id: input.id },
        select: { accountId: true },
      });
      if (!label) throw new TRPCError({ code: "NOT_FOUND", message: "Label not found" });
      await authoriseAccountAccess(label.accountId, ctx.auth.userId);
      return ctx.db.label.update({
        where: { id: input.id },
        data: {
          ...(input.name !== undefined && { name: input.name.trim() }),
          ...(input.color !== undefined && { color: input.color }),
        },
      });
    }),

  deleteLabel: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const label = await ctx.db.label.findUnique({
        where: { id: input.id },
        select: { accountId: true },
      });
      if (!label) throw new TRPCError({ code: "NOT_FOUND", message: "Label not found" });
      await authoriseAccountAccess(label.accountId, ctx.auth.userId);
      return ctx.db.label.delete({ where: { id: input.id } });
    }),

  setThreadLabels: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        labelIds: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.thread.findUnique({
        where: { id: input.threadId },
        select: { accountId: true },
      });
      if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      await authoriseAccountAccess(thread.accountId, ctx.auth.userId);
      const labels = await ctx.db.label.findMany({
        where: { id: { in: input.labelIds }, accountId: thread.accountId },
        select: { id: true },
      });
      const validIds = new Set(labels.map((l) => l.id));
      await ctx.db.threadLabel.deleteMany({ where: { threadId: input.threadId } });
      if (validIds.size > 0) {
        await ctx.db.threadLabel.createMany({
          data: Array.from(validIds).map((labelId) => ({
            threadId: input.threadId,
            labelId,
          })),
        });
      }
      return { ok: true };
    }),

  addLabelToThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        labelId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.thread.findUnique({
        where: { id: input.threadId },
        select: { accountId: true },
      });
      if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      await authoriseAccountAccess(thread.accountId, ctx.auth.userId);
      const label = await ctx.db.label.findFirst({
        where: { id: input.labelId, accountId: thread.accountId },
      });
      if (!label) throw new TRPCError({ code: "NOT_FOUND", message: "Label not found" });
      await ctx.db.threadLabel.upsert({
        where: {
          threadId_labelId: { threadId: input.threadId, labelId: input.labelId },
        },
        create: { threadId: input.threadId, labelId: input.labelId },
        update: {},
      });
      return { ok: true };
    }),

  removeLabelFromThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        labelId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.thread.findUnique({
        where: { id: input.threadId },
        select: { accountId: true },
      });
      if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      await authoriseAccountAccess(thread.accountId, ctx.auth.userId);
      await ctx.db.threadLabel.deleteMany({
        where: {
          threadId: input.threadId,
          labelId: input.labelId,
        },
      });
      return { ok: true };
    }),

  createFilterRule: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        conditionType: z.literal("TAG_MATCH"),
        conditionValue: z.string().min(1),
        labelId: z.string().min(1),
        name: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const label = await ctx.db.label.findFirst({
        where: { id: input.labelId, accountId: input.accountId },
      });
      if (!label) throw new TRPCError({ code: "NOT_FOUND", message: "Label not found" });
      return ctx.db.filterRule.create({
        data: {
          accountId: input.accountId,
          conditionType: input.conditionType,
          conditionValue: input.conditionValue.trim().toLowerCase(),
          labelId: input.labelId,
          name: input.name?.trim() ?? undefined,
        },
      });
    }),

  getFilterRules: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      return ctx.db.filterRule.findMany({
        where: { accountId: input.accountId },
        include: { label: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  deleteFilterRule: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const rule = await ctx.db.filterRule.findUnique({
        where: { id: input.id },
        select: { accountId: true },
      });
      if (!rule) throw new TRPCError({ code: "NOT_FOUND", message: "Filter rule not found" });
      await authoriseAccountAccess(rule.accountId, ctx.auth.userId);
      return ctx.db.filterRule.delete({ where: { id: input.id } });
    }),

  getDistinctEmailTags: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const rows = await ctx.db.email.findMany({
        where: { thread: { accountId: input.accountId } },
        select: { keywords: true },
      });
      const set = new Set<string>();
      for (const r of rows) {
        for (const k of r.keywords ?? []) {
          if (k && typeof k === "string") set.add(String(k).toLowerCase().trim());
        }
      }
      return Array.from(set).sort();
    }),
});
