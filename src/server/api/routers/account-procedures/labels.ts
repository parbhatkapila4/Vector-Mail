import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "@/server/api/trpc";
import { isDemoCall } from "@/lib/demo/predicate";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";
import { getDemoLabelsWithCounts } from "@/lib/demo/seed-demo-data";

import { authoriseAccountAccess } from "./shared";

export const labelProcedures = {
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
      if (isDemoCall(ctx, input.accountId)) {
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
      if (isDemoCall(ctx, input.accountId)) {
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
};
