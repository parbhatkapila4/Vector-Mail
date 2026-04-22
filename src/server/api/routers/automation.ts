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
import { env } from "@/env.js";
import { AUTO_FOLLOW_UP_ACTION_TYPE } from "@/lib/automation/action-types";
import { DEMO_ACCOUNT_ID, DEMO_USER_ID } from "@/lib/demo/constants";
import {
  MAX_ALLOWED_AUTO_SENDS_PER_DAY,
  normalizeAutomationGuardrails,
  toGuardrailsJson,
} from "@/lib/automation/guardrails";

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function endOfTodayExclusive(start: Date): Date {
  return new Date(start.getTime() + 86400000);
}

function guardrailsMaterialHash(input: {
  maxAutoSendsPerDay: number;
  blockedDomains: string[];
  blockedSenderSubstrings: string[];
}): string {
  return JSON.stringify({
    maxAutoSendsPerDay: input.maxAutoSendsPerDay,
    blockedDomains: [...input.blockedDomains].sort(),
    blockedSenderSubstrings: [...input.blockedSenderSubstrings].sort(),
  });
}

function redactSensitiveJson(value: Prisma.JsonValue): Prisma.JsonValue {
  const keyLooksSensitive = (key: string) =>
    /(token|secret|password|authorization|api[-_]?key|refresh|cookie)/i.test(key);
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map((v) => redactSensitiveJson(v as Prisma.JsonValue));
  }
  if (typeof value === "object") {
    const out: Record<string, Prisma.JsonValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (keyLooksSensitive(k)) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = redactSensitiveJson(v as Prisma.JsonValue);
      }
    }
    return out as Prisma.JsonValue;
  }
  if (typeof value === "string" && value.length > 4000) {
    return `${value.slice(0, 4000)}…`;
  }
  return value;
}

const DEMO_AUTOMATION_OUTCOME_SUMMARY = {
  sentRealToday: 1,
  simulatedToday: 2,
  failedToday: 1,
  pendingApproval: 2,
  isDemo: true as const,
};

const DEMO_AUTOMATION_METRICS = {
  actionsExecuted: 3,
  actionsPendingApproval: 2,
  actionsFailed: 1,
  simulatedActions: 4,
  eligibleNeedsReply: 10,
  autoHandledPercent: 30,
  estTimeSavedMinutes: 9,
  llmTokens: 6240,
  estimatedCostUsd: 0.02,
  latencyMs: {
    avg: 1840,
    p50: 1520,
    p95: 3660,
    sampleSize: 14,
  },
  range: {
    startAt: new Date(Date.UTC(2026, 0, 1)).toISOString(),
    endAt: new Date(Date.UTC(2026, 0, 2)).toISOString(),
  },
  isDemo: true as const,
};

const DEMO_AUTOMATION_FAILURES = [
  {
    id: "demo-exec-fail-1",
    updatedAt: new Date().toISOString(),
    lastError: "Pre-send: user_already_replied",
    thread: { id: "demo-thread-4", subject: "Re: Project timeline" },
  },
];

const DEMO_EXECUTION_STATUS = [
  "pending",
  "awaiting_approval",
  "running",
  "success",
  "failed",
  "cancelled",
] as const;

export const automationRouter = createTRPCRouter({
  getGuardrails: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return {
          paused: false,
          maxAutoSendsPerDay: 5,
          blockedDomains: ["example.org"],
          blockedSenderSubstrings: ["noreply@"],
          autoConsentAcknowledgedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          autoConsentGuardrailsHash: guardrailsMaterialHash({
            maxAutoSendsPerDay: 5,
            blockedDomains: ["example.org"],
            blockedSenderSubstrings: ["noreply@"],
          }),
        };
      }
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { automationGuardrails: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      return normalizeAutomationGuardrails(account.automationGuardrails);
    }),

  setGuardrails: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        paused: z.boolean(),
        maxAutoSendsPerDay: z.number().int().min(1).max(MAX_ALLOWED_AUTO_SENDS_PER_DAY),
        blockedDomains: z.array(z.string().min(1).max(200)).max(200).default([]),
        blockedSenderSubstrings: z.array(z.string().min(1).max(200)).max(200).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const existing = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true, automationGuardrails: true },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      const prev = normalizeAutomationGuardrails(existing.automationGuardrails);
      const draft = normalizeAutomationGuardrails({
        paused: input.paused,
        maxAutoSendsPerDay: input.maxAutoSendsPerDay,
        blockedDomains: input.blockedDomains,
        blockedSenderSubstrings: input.blockedSenderSubstrings,
      } as Prisma.JsonValue);
      const prevHash = guardrailsMaterialHash(prev);
      const nextHash = guardrailsMaterialHash(draft);
      const materialChanged = prevHash !== nextHash;
      const next = {
        ...draft,
        autoConsentAcknowledgedAt: materialChanged ? null : prev.autoConsentAcknowledgedAt,
        autoConsentGuardrailsHash: materialChanged ? null : prev.autoConsentGuardrailsHash,
      };

      await db.account.update({
        where: { id: existing.id },
        data: { automationGuardrails: toGuardrailsJson(next) },
      });

      if (prev.paused !== next.paused) {
        auditLog({
          userId,
          action: next.paused ? "automation_paused" : "automation_unpaused",
          resourceId: existing.id,
          metadata: { paused: next.paused },
        });
      }
      if (
        prev.maxAutoSendsPerDay !== next.maxAutoSendsPerDay ||
        JSON.stringify(prev.blockedDomains) !== JSON.stringify(next.blockedDomains) ||
        JSON.stringify(prev.blockedSenderSubstrings) !== JSON.stringify(next.blockedSenderSubstrings)
      ) {
        auditLog({
          userId,
          action: "automation_guardrails_updated",
          resourceId: existing.id,
          metadata: {
            maxAutoSendsPerDay: next.maxAutoSendsPerDay,
            blockedDomainsCount: next.blockedDomains.length,
            blockedSenderSubstringsCount: next.blockedSenderSubstrings.length,
          },
        });
      }
      return { ok: true as const, guardrails: next };
    }),

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
        select: { id: true, automationMode: true, automationGuardrails: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      const guardrails = normalizeAutomationGuardrails(account.automationGuardrails);
      const currentHash = guardrailsMaterialHash(guardrails);
      const hasConsent =
        !!guardrails.autoConsentAcknowledgedAt &&
        guardrails.autoConsentGuardrailsHash === currentHash;
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
        requiresAutoConsent: !hasConsent,
        guardrailPaused: guardrails.paused,
        maxAutoSendsPerDay: guardrails.maxAutoSendsPerDay,
      };
    }),

  setMode: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        mode: z.enum(["manual", "assist", "auto"]),
        autoConsentConfirmed: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true, automationGuardrails: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      const guardrails = normalizeAutomationGuardrails(account.automationGuardrails);
      const currentHash = guardrailsMaterialHash(guardrails);
      const requiresConsent =
        !guardrails.autoConsentAcknowledgedAt ||
        guardrails.autoConsentGuardrailsHash !== currentHash;
      if (input.mode === "auto" && requiresConsent && input.autoConsentConfirmed !== true) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Please acknowledge auto-send consent before enabling Auto mode.",
        });
      }
      const nextGuardrails =
        input.mode === "auto" && requiresConsent && input.autoConsentConfirmed === true
          ? {
            ...guardrails,
            autoConsentAcknowledgedAt: new Date().toISOString(),
            autoConsentGuardrailsHash: currentHash,
          }
          : guardrails;
      await db.account.update({
        where: { id: account.id },
        data: {
          automationMode: input.mode,
          automationGuardrails: toGuardrailsJson(nextGuardrails),
        },
      });
      auditLog({
        userId,
        action: "automation_mode_changed",
        resourceId: input.accountId,
        metadata: { mode: input.mode, autoConsentConfirmed: input.autoConsentConfirmed === true },
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

      const freshPayload = await db.actionExecution.findFirst({
        where: { id: exec.id },
        select: { payload: true },
      });
      const prev = freshPayload?.payload;
      const mergedPayload: Record<string, unknown> =
        typeof prev === "object" && prev !== null && !Array.isArray(prev)
          ? { ...(prev as Record<string, unknown>) }
          : {};
      mergedPayload.automationUserApprovedAt = new Date().toISOString();

      await db.actionExecution.update({
        where: { id: exec.id },
        data: {
          dryRun: env.AUTOMATION_REAL_SEND_ENABLED === true ? false : true,
          payload: mergedPayload as Prisma.InputJsonValue,
        },
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
  getTodaySummary: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return DEMO_AUTOMATION_OUTCOME_SUMMARY;
      }
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      const start = startOfTodayUtc();
      const end = endOfTodayExclusive(start);
      const base = {
        userId,
        accountId: account.id,
        type: AUTO_FOLLOW_UP_ACTION_TYPE,
      } as const;
      const [sentRealToday, simulatedToday, failedToday, pendingApproval] =
        await Promise.all([
          db.actionExecution.count({
            where: {
              ...base,
              status: "success",
              providerMessageId: { not: null },
              updatedAt: { gte: start, lt: end },
            },
          }),
          db.actionExecution.count({
            where: {
              ...base,
              status: "success",
              providerMessageId: null,
              updatedAt: { gte: start, lt: end },
            },
          }),
          db.actionExecution.count({
            where: {
              ...base,
              status: "failed",
              updatedAt: { gte: start, lt: end },
            },
          }),
          db.actionExecution.count({
            where: {
              ...base,
              OR: [
                { status: "awaiting_approval" },
                {
                  status: { in: ["pending", "running"] },
                  OR: [
                    { createdAt: { gte: start, lt: end } },
                    { updatedAt: { gte: start, lt: end } },
                  ],
                },
              ],
            },
          }),
        ]);
      return {
        sentRealToday,
        simulatedToday,
        failedToday,
        pendingApproval,
        isDemo: false as const,
      };
    }),

  getMetrics: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        startAt: z.coerce.date().optional(),
        endAt: z.coerce.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        const start = input.startAt ?? startOfTodayUtc();
        const end = input.endAt ?? endOfTodayExclusive(start);
        return {
          ...DEMO_AUTOMATION_METRICS,
          range: { startAt: start.toISOString(), endAt: end.toISOString() },
        };
      }

      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const start = input.startAt ?? startOfTodayUtc();
      const end = input.endAt ?? endOfTodayExclusive(start);
      const base = {
        userId,
        accountId: account.id,
        type: AUTO_FOLLOW_UP_ACTION_TYPE,
      } as const;

      const [actionsExecuted, simulatedActions, actionsFailed, actionsPendingApproval, eligibleRows, aiUsageRows, latencyRows] =
        await Promise.all([
          db.actionExecution.count({
            where: {
              ...base,
              status: "success",
              providerMessageId: { not: null },
              updatedAt: { gte: start, lt: end },
            },
          }),
          db.actionExecution.count({
            where: {
              ...base,
              status: "success",
              providerMessageId: null,
              updatedAt: { gte: start, lt: end },
            },
          }),
          db.actionExecution.count({
            where: {
              ...base,
              status: "failed",
              updatedAt: { gte: start, lt: end },
            },
          }),
          db.actionExecution.count({
            where: {
              ...base,
              status: "awaiting_approval",
              createdAt: { gte: start, lt: end },
            },
          }),
          db.actionExecution.findMany({
            where: {
              ...base,
              createdAt: { gte: start, lt: end },
              threadId: { not: null },
            },
            select: { threadId: true },
            take: 2000,
          }),
          db.aiUsage.findMany({
            where: {
              userId,
              accountId: account.id,
              operation: "automation_draft",
              createdAt: { gte: start, lt: end },
            },
            select: { inputTokens: true, outputTokens: true },
            take: 5000,
          }),
          db.actionExecution.findMany({
            where: {
              ...base,
              status: { in: ["success", "failed", "cancelled"] },
              updatedAt: { gte: start, lt: end },
            },
            select: { createdAt: true, updatedAt: true },
            take: 5000,
          }),
        ]);

      const eligibleNeedsReply = new Set(
        eligibleRows
          .map((r) => r.threadId)
          .filter((v): v is string => typeof v === "string" && v.length > 0),
      ).size;

      const autoHandledPercent = Math.min(
        100,
        Math.round((actionsExecuted / Math.max(eligibleNeedsReply, 1)) * 100),
      );
      const estTimeSavedMinutes = actionsExecuted * 3;

      const llmTokens = aiUsageRows.reduce(
        (sum, r) => sum + Math.max(0, r.inputTokens) + Math.max(0, r.outputTokens),
        0,
      );
      const estimatedCostUsd = Number(
        (
          aiUsageRows.reduce(
            (sum, r) =>
              sum +
              Math.max(0, r.inputTokens) * 0.00000015 +
              Math.max(0, r.outputTokens) * 0.0000006,
            0,
          )
        ).toFixed(4),
      );

      const durationMs = latencyRows
        .map((r) => Math.max(0, r.updatedAt.getTime() - r.createdAt.getTime()))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
      const sampleSize = durationMs.length;
      const avg = sampleSize > 0
        ? Math.round(durationMs.reduce((s, n) => s + n, 0) / sampleSize)
        : null;
      const percentile = (p: number): number | null => {
        if (sampleSize === 0) return null;
        const idx = Math.min(sampleSize - 1, Math.max(0, Math.ceil((p / 100) * sampleSize) - 1));
        return durationMs[idx] ?? null;
      };

      return {
        actionsExecuted,
        actionsPendingApproval,
        actionsFailed,
        simulatedActions,
        eligibleNeedsReply,
        autoHandledPercent,
        estTimeSavedMinutes,
        llmTokens,
        estimatedCostUsd,
        latencyMs: {
          avg,
          p50: sampleSize >= 20 ? percentile(50) : null,
          p95: sampleSize >= 20 ? percentile(95) : null,
          sampleSize,
        },
        range: { startAt: start.toISOString(), endAt: end.toISOString() },
        isDemo: false as const,
      };
    }),

  listExecutions: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        limit: z.number().min(1).max(100).optional().default(20),
        page: z.number().int().min(0).optional().default(0),
        status: z.enum(DEMO_EXECUTION_STATUS).optional(),
        type: z.string().min(1).max(128).optional(),
        startAt: z.coerce.date().optional(),
        endAt: z.coerce.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const start = input.startAt;
      const end = input.endAt;

      if (userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        const demoItems = [
          {
            id: "demo-exec-1",
            status: "success",
            type: AUTO_FOLLOW_UP_ACTION_TYPE,
            createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 88 * 60 * 1000).toISOString(),
            dryRun: true,
            retryCount: 0,
            providerMessageId: null,
            thread: { id: "demo-thread-1", subject: "Re: Intro call follow-up" },
          },
          {
            id: "demo-exec-2",
            status: "awaiting_approval",
            type: AUTO_FOLLOW_UP_ACTION_TYPE,
            createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
            dryRun: true,
            retryCount: 0,
            providerMessageId: null,
            thread: { id: "demo-thread-2", subject: "Re: Contract details" },
          },
          {
            id: "demo-exec-3",
            status: "failed",
            type: AUTO_FOLLOW_UP_ACTION_TYPE,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
            dryRun: false,
            retryCount: 1,
            providerMessageId: null,
            thread: { id: "demo-thread-3", subject: "Re: Proposal timeline" },
          },
        ] as const;
        return {
          items: demoItems,
          page: input.page,
          limit: input.limit,
          hasMore: false,
          total: demoItems.length,
          isDemo: true as const,
        };
      }

      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const where: Prisma.ActionExecutionWhereInput = {
        userId,
        accountId: account.id,
        ...(input.status ? { status: input.status } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...((start || end)
          ? {
            createdAt: {
              ...(start ? { gte: start } : {}),
              ...(end ? { lt: end } : {}),
            },
          }
          : {}),
      };
      const skip = input.page * input.limit;
      const [total, rows] = await Promise.all([
        db.actionExecution.count({ where }),
        db.actionExecution.findMany({
          where,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip,
          take: input.limit,
          select: {
            id: true,
            status: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            dryRun: true,
            retryCount: true,
            providerMessageId: true,
            thread: { select: { id: true, subject: true } },
          },
        }),
      ]);
      return {
        items: rows.map((r) => ({
          id: r.id,
          status: r.status,
          type: r.type,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          dryRun: r.dryRun,
          retryCount: r.retryCount,
          providerMessageId: r.providerMessageId,
          thread: r.thread ? { id: r.thread.id, subject: r.thread.subject } : null,
        })),
        page: input.page,
        limit: input.limit,
        hasMore: skip + rows.length < total,
        total,
        isDemo: false as const,
      };
    }),

  getExecutionDetail: protectedProcedure
    .input(z.object({ executionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      if (userId === DEMO_USER_ID && input.executionId.startsWith("demo-exec-")) {
        const now = Date.now();
        return {
          id: input.executionId,
          status: input.executionId === "demo-exec-2" ? "awaiting_approval" : input.executionId === "demo-exec-3" ? "failed" : "success",
          type: AUTO_FOLLOW_UP_ACTION_TYPE,
          createdAt: new Date(now - 90 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 88 * 60 * 1000).toISOString(),
          retryCount: input.executionId === "demo-exec-3" ? 1 : 0,
          lastError: input.executionId === "demo-exec-3" ? "Provider timeout while sending follow-up" : null,
          confidence: input.executionId === "demo-exec-1" ? 0.9 : 0.78,
          reason: "Last message was from an external sender and needs a follow-up.",
          dryRun: input.executionId !== "demo-exec-3",
          providerMessageId: input.executionId === "demo-exec-1" ? "demo-provider-1" : null,
          thread: { id: "demo-thread-1", subject: "Re: Intro call follow-up" },
          payload: { detector: "followup-detector:v1", confidenceBand: "HIGH", note: "Demo payload preview" },
          timeline: [
            { at: new Date(now - 90 * 60 * 1000).toISOString(), kind: "status", label: "Created", status: "pending" },
            { at: new Date(now - 89 * 60 * 1000).toISOString(), kind: "audit", label: "Candidate detected", status: null },
            {
              at: new Date(now - 88 * 60 * 1000).toISOString(),
              kind: "status",
              label: input.executionId === "demo-exec-3" ? "Failed" : "Completed",
              status: input.executionId === "demo-exec-3" ? "failed" : "success",
            },
          ],
          isDemo: true as const,
        };
      }

      const execution = await db.actionExecution.findFirst({
        where: { id: input.executionId, userId },
        select: {
          id: true,
          userId: true,
          accountId: true,
          status: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          retryCount: true,
          lastError: true,
          confidence: true,
          reason: true,
          dryRun: true,
          providerMessageId: true,
          payload: true,
          thread: { select: { id: true, subject: true } },
        },
      });
      if (!execution) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Execution not found" });
      }

      const auditRows = await db.auditLog.findMany({
        where: {
          userId,
          resourceId: execution.id,
          action: { startsWith: "automation_" },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
        select: {
          action: true,
          createdAt: true,
          metadata: true,
        },
      });

      const timeline: Array<{
        at: string;
        kind: "status" | "audit";
        label: string;
        status: string | null;
        meta?: Prisma.JsonValue;
      }> = [
          {
            at: execution.createdAt.toISOString(),
            kind: "status",
            label: "Created",
            status: "pending",
          },
        ];
      for (const a of auditRows) {
        timeline.push({
          at: a.createdAt.toISOString(),
          kind: "audit",
          label: a.action.replace(/^automation_/, "").replaceAll("_", " "),
          status: null,
          meta: redactSensitiveJson((a.metadata ?? null) as Prisma.JsonValue),
        });
      }
      if (execution.updatedAt.getTime() !== execution.createdAt.getTime()) {
        timeline.push({
          at: execution.updatedAt.toISOString(),
          kind: "status",
          label: `Status: ${execution.status}`,
          status: execution.status,
        });
      }
      timeline.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

      return {
        id: execution.id,
        status: execution.status,
        type: execution.type,
        createdAt: execution.createdAt.toISOString(),
        updatedAt: execution.updatedAt.toISOString(),
        retryCount: execution.retryCount,
        lastError: execution.lastError,
        confidence: execution.confidence,
        reason: execution.reason,
        dryRun: execution.dryRun,
        providerMessageId: execution.providerMessageId,
        thread: execution.thread
          ? { id: execution.thread.id, subject: execution.thread.subject }
          : null,
        payload: redactSensitiveJson((execution.payload ?? null) as Prisma.JsonValue),
        timeline,
        isDemo: false as const,
      };
    }),

  listRecentFailures: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        limit: z.number().min(1).max(30).optional().default(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        return DEMO_AUTOMATION_FAILURES.map((r) => ({
          ...r,
          lastErrorTruncated: r.lastError.slice(0, 160),
        }));
      }
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
          type: AUTO_FOLLOW_UP_ACTION_TYPE,
          status: "failed",
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit,
        select: {
          id: true,
          lastError: true,
          updatedAt: true,
          thread: { select: { id: true, subject: true } },
        },
      });
      return rows.map((r) => ({
        id: r.id,
        updatedAt: r.updatedAt.toISOString(),
        lastError: r.lastError ?? "",
        lastErrorTruncated: (r.lastError ?? "").slice(0, 160),
        thread: r.thread
          ? { id: r.thread.id, subject: r.thread.subject }
          : null,
      }));
    }),

  getThreadAutoFollowUpBadges: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        threadIds: z.array(z.string().min(1)).max(500),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const ids = [...new Set(input.threadIds)].slice(0, 100);
      if (ids.length === 0) {
        return { byThreadId: {} as Record<string, { lastSuccessAt: string; wasRealSend: boolean }> };
      }
      if (userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        const byThreadId: Record<string, { lastSuccessAt: string; wasRealSend: boolean }> = {};
        const t1 = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const t2 = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
        for (const tid of ["demo-thread-1", "demo-thread-2", "demo-thread-3"]) {
          if (ids.includes(tid)) {
            byThreadId[tid] = {
              lastSuccessAt: tid === "demo-thread-1" ? t1 : t2,
              wasRealSend: tid === "demo-thread-1",
            };
          }
        }
        return { byThreadId };
      }
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
          type: AUTO_FOLLOW_UP_ACTION_TYPE,
          status: "success",
          threadId: { in: ids },
        },
        select: { threadId: true, updatedAt: true, providerMessageId: true },
        orderBy: { updatedAt: "desc" },
        take: 400,
      });
      const byThreadId: Record<string, { lastSuccessAt: string; wasRealSend: boolean }> = {};
      for (const r of rows) {
        if (!r.threadId) continue;
        if (byThreadId[r.threadId]) continue;
        byThreadId[r.threadId] = {
          lastSuccessAt: r.updatedAt.toISOString(),
          wasRealSend: !!(r.providerMessageId && r.providerMessageId.length > 0),
        };
      }
      return { byThreadId };
    }),

  getThreadFollowUpSummary: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        threadId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (userId === DEMO_USER_ID && input.accountId === DEMO_ACCOUNT_ID) {
        if (input.threadId === "demo-thread-1") {
          return {
            lastSuccessAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
            wasRealSend: false,
          };
        }
        return null;
      }
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      const row = await db.actionExecution.findFirst({
        where: {
          userId,
          accountId: account.id,
          threadId: input.threadId,
          type: AUTO_FOLLOW_UP_ACTION_TYPE,
          status: "success",
        },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true, providerMessageId: true },
      });
      if (!row) return null;
      return {
        lastSuccessAt: row.updatedAt.toISOString(),
        wasRealSend: !!(row.providerMessageId && row.providerMessageId.length > 0),
      };
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
