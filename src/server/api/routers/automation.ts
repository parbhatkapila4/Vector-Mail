import { createActionExecution } from "@/lib/automation";
import { transitionActionExecution } from "@/lib/automation";
import { detectAndCreateFollowUpExecutionsForAccount } from "@/lib/automation/detect";
import { log as auditLog } from "@/lib/audit/audit-log";
import { enqueueAutomationExecution } from "@/lib/jobs/enqueue";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const automationRouter = createTRPCRouter({
  getPrefs: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true, automationMode: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      const awaitingApproval = await db.actionExecution.count({
        where: {
          userId,
          accountId: account.id,
          status: "awaiting_approval",
          dryRun: true,
        },
      });
      return {
        accountId: account.id,
        automationMode: account.automationMode,
        awaitingApproval,
      };
    }),

  setMode: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        mode: z.enum(["manual", "assist", "auto"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const updated = await db.account.updateMany({
        where: { id: input.accountId, userId },
        data: { automationMode: input.mode },
      });
      if (updated.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      auditLog({
        userId,
        action: "automation_mode_changed",
        resourceId: input.accountId,
        metadata: { mode: input.mode },
      });
      return { ok: true as const, accountId: input.accountId, mode: input.mode };
    }),

  listPending: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        limit: z.number().min(1).max(50).optional().default(25),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      const rows = await db.actionExecution.findMany({
        where: {
          userId,
          accountId: account.id,
          status: "awaiting_approval",
          dryRun: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        select: {
          id: true,
          type: true,
          status: true,
          modeSnapshot: true,
          confidence: true,
          reason: true,
          payload: true,
          createdAt: true,
          thread: { select: { id: true, subject: true, lastMessageDate: true } },
        },
      });
      return rows.map((r) => {
        const p = r.payload as Record<string, unknown> | null;
        const payloadSubject =
          p && typeof p.subject === "string" ? p.subject : undefined;
        return {
          id: r.id,
          type: r.type,
          status: r.status,
          modeSnapshot: r.modeSnapshot,
          confidence: r.confidence,
          reason: r.reason,
          createdAt: r.createdAt,
          thread: r.thread
            ? {
              id: r.thread.id,
              subject: r.thread.subject,
              lastMessageDate: r.thread.lastMessageDate,
            }
            : null,
          subject: r.thread?.subject ?? payloadSubject ?? "(No subject)",
        };
      });
    }),

  approve: protectedProcedure
    .input(z.object({ executionId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const exec = await db.actionExecution.findFirst({
        where: { id: input.executionId, userId },
        select: { id: true, status: true, dryRun: true },
      });
      if (!exec) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Execution not found" });
      }
      if (!exec.dryRun) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only dry-run executions can be approved in this phase" });
      }
      if (exec.status !== "awaiting_approval") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Execution is not awaiting approval" });
      }

      await transitionActionExecution({
        id: exec.id,
        userId,
        to: "pending",
        lastError: null,
      });

      auditLog({
        userId,
        action: "automation_execution_approved",
        resourceId: exec.id,
      });

      const enqueued = await enqueueAutomationExecution(exec.id);
      if (!enqueued) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to enqueue automation execution" });
      }

      return { ok: true as const, executionId: exec.id };
    }),

  reject: protectedProcedure
    .input(
      z.object({
        executionId: z.string().min(1),
        reason: z.string().min(1).max(400).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const exec = await db.actionExecution.findFirst({
        where: { id: input.executionId, userId },
        select: { id: true, status: true, dryRun: true },
      });
      if (!exec) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Execution not found" });
      }
      if (!exec.dryRun) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only dry-run executions can be rejected in this phase" });
      }
      if (exec.status !== "awaiting_approval") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Execution is not awaiting approval" });
      }

      await transitionActionExecution({
        id: exec.id,
        userId,
        to: "cancelled",
        lastError: input.reason ? `Rejected: ${input.reason}` : "Rejected",
      });

      auditLog({
        userId,
        action: "automation_execution_rejected",
        resourceId: exec.id,
        metadata: { reason: input.reason ?? null },
      });

      return { ok: true as const, executionId: exec.id };
    }),

  runDetectorNow: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true, automationMode: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      if (account.automationMode === "manual") {
        return {
          ok: true as const,
          accountId: account.id,
          mode: account.automationMode,
          scannedThreads: 0,
          eligibleThreads: 0,
          created: 0,
          duplicates: 0,
          skippedRecentOutbound: 0,
          enqueued: 0,
          note: "Detector skipped in manual mode",
        };
      }

      const res = await detectAndCreateFollowUpExecutionsForAccount(account.id);

      auditLog({
        userId,
        action: "automation_detector_run_manual",
        resourceId: account.id,
        metadata: {
          mode: account.automationMode,
          created: res.created,
          duplicates: res.duplicates,
          eligibleThreads: res.eligibleThreads,
          scannedThreads: res.scannedThreads,
          enqueued: res.enqueued,
        },
      });

      return { ok: true as const, mode: account.automationMode, ...res };
    }),

  createDryRunExecution: adminProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        threadId: z.string().min(1).optional(),
        idempotencyKey: z.string().min(1).max(512),
        type: z.string().min(1).max(128),
        payload: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true, automationMode: true },
      });
      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }
      try {
        return await createActionExecution({
          userId,
          accountId: input.accountId,
          threadId: input.threadId,
          type: input.type,
          modeSnapshot: account.automationMode,
          payload: (input.payload ?? {}) as Prisma.InputJsonValue,
          idempotencyKey: input.idempotencyKey,
          dryRun: true,
        });
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Failed to create execution";
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: msg,
        });
      }
    }),
  enqueueDryRunExecution: adminProcedure
    .input(
      z.object({
        executionId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const execution = await db.actionExecution.findFirst({
        where: { id: input.executionId, userId: ctx.auth.userId },
        select: {
          id: true,
          dryRun: true,
          status: true,
        },
      });
      if (!execution) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Action execution not found",
        });
      }
      if (!execution.dryRun) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only dry-run executions can be enqueued in this phase",
        });
      }
      const enqueued = await enqueueAutomationExecution(execution.id);
      if (!enqueued) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enqueue automation execution",
        });
      }
      return {
        ok: true as const,
        executionId: execution.id,
        status: execution.status,
      };
    }),
});
