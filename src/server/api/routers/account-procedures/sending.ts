import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "@/server/api/trpc";
import { Account } from "@/lib/accounts";
import { log as auditLog } from "@/lib/audit/audit-log";
import { isDemoCall } from "@/lib/demo/predicate";
import { getDemoScheduledSends } from "@/lib/demo/seed-demo-data";
import { emailAddressSchema } from "@/types";
import { makeTagLogger } from "@/lib/logging/console-shim";

import { authoriseAccountAccess } from "./shared";

const sendingLog = makeTagLogger("account-router.sending");
export const sendingProcedures = {
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
          sendingLog.error("[sendEmail] Open tracking setup failed:", trackErr);
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
          sendingLog.error(
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
      if (isDemoCall(ctx)) {
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
      if (isDemoCall(ctx, input.accountId)) {
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
};
