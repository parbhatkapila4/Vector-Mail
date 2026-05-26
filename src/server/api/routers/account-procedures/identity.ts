import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "@/server/api/trpc";
import { withDbRetry } from "@/server/db";
import { isDemoCall } from "@/lib/demo/predicate";
import {
  DEMO_ACCOUNT_ID,
  DEMO_DISPLAY_NAME,
  DEMO_EMAIL,
} from "@/lib/demo/constants";

import { authoriseAccountAccess } from "./shared";
export const identityProcedures = {
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    if (isDemoCall(ctx)) {
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

  getMyAccount: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (!input.accountId || input.accountId.trim().length === 0) {
        throw new Error("Account ID is required");
      }
      if (isDemoCall(ctx, input.accountId)) {
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
      if (isDemoCall(ctx, input.accountId)) {
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
      if (isDemoCall(ctx)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Demo account cannot update sending identity." });
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      if (input.customFromAddress) {
        const authedDomain = account.emailAddress
          .split("@")[1]
          ?.toLowerCase()
          .trim();
        const customDomain = input.customFromAddress
          .split("@")[1]
          ?.toLowerCase()
          .trim();
        if (!authedDomain || !customDomain || authedDomain !== customDomain) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Custom From address must be on the same domain as your connected mailbox (@${authedDomain ?? "your domain"}). Cross-domain sending isn't allowed.`,
          });
        }
      }

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

  getBuddyRailStats: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return {
          email: DEMO_EMAIL,
          provider: "gmail",
          lastInboxSyncAt: null as Date | null,
          totalEmails: 0,
          embeddingsCount: 0,
          threadsIndexed: 0,
        };
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);

      type AccountInfoRow = {
        emailAddress: string;
        provider: string;
        lastInboxSyncAt: Date | null;
      };
      const accountRow = (await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: { id: input.accountId, userId: ctx.auth.userId },
          select: {
            emailAddress: true,
            provider: true,
            lastInboxSyncAt: true,
          } as Record<string, boolean>,
        }),
      )) as AccountInfoRow | null;
      if (!accountRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const [totalEmails, threadsIndexed, embeddingResult] = await Promise.all([
        withDbRetry(() =>
          ctx.db.email.count({
            where: { thread: { accountId: input.accountId } },
          }),
        ),
        withDbRetry(() =>
          ctx.db.thread.count({ where: { accountId: input.accountId } }),
        ),
        withDbRetry(() =>
          ctx.db.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*)::bigint AS count
            FROM "Email" e
            JOIN "Thread" t ON t.id = e."threadId"
            WHERE t."accountId" = ${input.accountId}
              AND e."embedding" IS NOT NULL
          `,
        ),
      ]);
      const embeddingsCount = Number(embeddingResult[0]?.count ?? 0);

      return {
        email: accountRow.emailAddress,
        provider: accountRow.provider,
        lastInboxSyncAt: accountRow.lastInboxSyncAt,
        totalEmails,
        embeddingsCount,
        threadsIndexed,
      };
    }),

  getDeliverabilityGuidance: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
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
};
