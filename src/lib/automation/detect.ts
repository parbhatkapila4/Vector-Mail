import type { AutomationMode, Prisma } from "@prisma/client";

import { log as auditLog } from "@/lib/audit/audit-log";
import { enqueueAutomationExecution } from "@/lib/jobs/enqueue";
import { decisionForModeAndConfidence } from "@/lib/automation/policy";
import { db, withDbRetry } from "@/server/db";
import { env } from "@/env.js";
import {
  blockReasonForSender,
  normalizeAutomationGuardrails,
} from "@/lib/automation/guardrails";

import { AUTO_FOLLOW_UP_ACTION_TYPE } from "@/lib/automation/action-types";

export { AUTO_FOLLOW_UP_ACTION_TYPE };

const DETECTOR_VERSION = "followup-detector:v1";

const NEEDS_REPLY_UNREPLIED_DAYS = 14;
const FOLLOW_UP_OUTBOUND_COOLDOWN_HOURS = 8;
const IDEMPOTENCY_WINDOW_HOURS = 6;

type DetectResult = {
  accountId: string;
  userId: string;
  modeSnapshot: AutomationMode;
  scannedThreads: number;
  eligibleThreads: number;
  created: number;
  duplicates: number;
  skippedRecentOutbound: number;
  skippedManualMode: number;
  enqueued: number;
};

function bucketKey(now: Date): string {
  const windowMs = IDEMPOTENCY_WINDOW_HOURS * 60 * 60 * 1000;
  const startMs = Math.floor(now.getTime() / windowMs) * windowMs;
  return new Date(startMs).toISOString().slice(0, 13);
}

function idempotencyKeyForFollowUp(params: {
  accountId: string;
  threadId: string;
  bucket: string;
}): string {
  return `${DETECTOR_VERSION}:${AUTO_FOLLOW_UP_ACTION_TYPE}:${params.accountId}:${params.threadId}:${params.bucket}`;
}

function confidenceForReason(reasonCode: "reminder_due" | "unreplied_external"): number {
  return reasonCode === "reminder_due" ? 0.9 : 0.78;
}

function reasonFor(reasonCode: "reminder_due" | "unreplied_external", outboundCooldownHours: number): string {
  if (reasonCode === "reminder_due") {
    return `Reminder is due and you haven't sent a reply in the last ${outboundCooldownHours}h.`;
  }
  return `Last message was from an external sender and you haven't replied in the last ${outboundCooldownHours}h.`;
}

function isUniqueConstraintError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string };
  return e.code === "P2002";
}

export async function detectAndCreateFollowUpExecutionsForAccount(
  accountId: string,
): Promise<DetectResult> {
  const now = new Date();
  const bucket = bucketKey(now);

  const account = await withDbRetry(() =>
    db.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        userId: true,
        emailAddress: true,
        automationMode: true,
        needsReconnection: true,
        automationGuardrails: true,
      },
    }),
  );

  if (!account) {
    throw new Error(`detect follow-up: account not found: ${accountId}`);
  }

  const resultBase: DetectResult = {
    accountId: account.id,
    userId: account.userId,
    modeSnapshot: account.automationMode,
    scannedThreads: 0,
    eligibleThreads: 0,
    created: 0,
    duplicates: 0,
    skippedRecentOutbound: 0,
    skippedManualMode: 0,
    enqueued: 0,
  };

  if (account.automationMode === "manual") {
    return { ...resultBase, skippedManualMode: 1 };
  }

  if (account.needsReconnection) {
    return resultBase;
  }
  const guardrails = normalizeAutomationGuardrails(account.automationGuardrails);
  if (guardrails.paused) {
    return resultBase;
  }

  const accountEmailLower = account.emailAddress.toLowerCase();
  const unrepliedCutoff = new Date(now);
  unrepliedCutoff.setDate(unrepliedCutoff.getDate() - NEEDS_REPLY_UNREPLIED_DAYS);

  const dueReminderThreads = await withDbRetry(() =>
    db.thread.findMany({
      where: {
        accountId: account.id,
        done: false,
        inboxStatus: true,
        remindAt: { not: null, lte: now },
        OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
        emails: {
          none: { sysLabels: { hasSome: ["trash"] } },
        },
      },
      orderBy: { remindAt: "asc" },
      take: 40,
      select: {
        id: true,
        subject: true,
        lastMessageDate: true,
        emails: {
          orderBy: { sentAt: "desc" },
          take: 1,
          select: {
            from: { select: { address: true } },
          },
        },
      },
    }),
  );

  const candidateUnreplied = await withDbRetry(() =>
    db.thread.findMany({
      where: {
        accountId: account.id,
        done: false,
        inboxStatus: true,
        draftStatus: false,
        lastMessageDate: { gte: unrepliedCutoff },
        OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
        emails: {
          none: { sysLabels: { hasSome: ["trash"] } },
        },
      },
      orderBy: { lastMessageDate: "desc" },
      take: 80,
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
            sentAt: true,
            from: { select: { address: true } },
            subject: true,
            bodySnippet: true,
            keywords: true,
            sysClassifications: true,
          },
        },
      },
    }),
  );

  type Candidate = {
    threadId: string;
    subject: string;
    lastMessageDate: Date;
    reasonCode: "reminder_due" | "unreplied_external";
    latestInboundAddress: string | null;
  };

  const candidates: Candidate[] = [];
  const seenThreadIds = new Set<string>();

  for (const t of dueReminderThreads) {
    if (seenThreadIds.has(t.id)) continue;
    const sender = t.emails[0]?.from?.address ?? null;
    if (sender && blockReasonForSender(sender, guardrails)) continue;
    candidates.push({
      threadId: t.id,
      subject: t.subject || "(No subject)",
      lastMessageDate: t.lastMessageDate,
      reasonCode: "reminder_due",
      latestInboundAddress: sender,
    });
    seenThreadIds.add(t.id);
  }

  for (const t of candidateUnreplied) {
    const latestEmail = t.emails[0];
    if (!latestEmail?.from?.address) continue;
    if (latestEmail.from.address.toLowerCase() === accountEmailLower) continue;
    if (seenThreadIds.has(t.id)) continue;

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

    candidates.push({
      threadId: t.id,
      subject: t.subject || "(No subject)",
      lastMessageDate: t.lastMessageDate,
      reasonCode: "unreplied_external",
      latestInboundAddress: latestEmail.from.address,
    });
    seenThreadIds.add(t.id);
  }

  resultBase.scannedThreads = candidates.length;
  if (candidates.length === 0) return resultBase;

  const cooldownSince = new Date(
    now.getTime() - FOLLOW_UP_OUTBOUND_COOLDOWN_HOURS * 60 * 60 * 1000,
  );

  const outbound = await withDbRetry(() =>
    db.email.findMany({
      where: {
        threadId: { in: candidates.map((c) => c.threadId) },
        from: { accountId: account.id, address: { equals: account.emailAddress, mode: "insensitive" } },
        sentAt: { gte: cooldownSince },
      },
      select: { threadId: true, sentAt: true },
      orderBy: { sentAt: "desc" },
      take: 400,
    }),
  );

  const lastOutboundAt = new Map<string, Date>();
  for (const e of outbound) {
    if (!lastOutboundAt.has(e.threadId)) lastOutboundAt.set(e.threadId, e.sentAt);
  }

  const eligible = candidates.filter((c) => !lastOutboundAt.has(c.threadId));
  resultBase.skippedRecentOutbound = candidates.length - eligible.length;
  resultBase.eligibleThreads = eligible.length;
  const sendsToday = await withDbRetry(() =>
    db.actionExecution.count({
      where: {
        userId: account.userId,
        accountId: account.id,
        type: AUTO_FOLLOW_UP_ACTION_TYPE,
        status: "success",
        providerMessageId: { not: null },
        updatedAt: {
          gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
        },
      },
    }),
  );
  const realSendCapReached = sendsToday >= guardrails.maxAutoSendsPerDay;

  for (const c of eligible) {
    const key = idempotencyKeyForFollowUp({
      accountId: account.id,
      threadId: c.threadId,
      bucket,
    });

    const modeSnapshot = account.automationMode;
    const confidence = confidenceForReason(c.reasonCode);
    const decision = decisionForModeAndConfidence(modeSnapshot, confidence);
    const guardrailCancelsRealSendCandidate =
      realSendCapReached &&
      modeSnapshot === "auto" &&
      decision.status === "pending";
    const targetStatus = guardrailCancelsRealSendCandidate ? "cancelled" : decision.status;
    const realSendDryRunOff =
      env.AUTOMATION_REAL_SEND_ENABLED === true &&
      modeSnapshot === "auto" &&
      targetStatus === "pending";
    const payload: Prisma.InputJsonValue = {
      detector: DETECTOR_VERSION,
      detectedAt: now.toISOString(),
      accountId: account.id,
      threadId: c.threadId,
      subject: c.subject,
      lastMessageDate: c.lastMessageDate.toISOString(),
      reasonCode: c.reasonCode,
      confidenceBand: decision.band,
    };

    let createdExecutionId: string | null = null;
    try {
      const created = await withDbRetry(() =>
        db.actionExecution.create({
          data: {
            userId: account.userId,
            accountId: account.id,
            threadId: c.threadId,
            type: AUTO_FOLLOW_UP_ACTION_TYPE,
            status: targetStatus,
            modeSnapshot,
            confidence,
            reason: guardrailCancelsRealSendCandidate
              ? "Guardrail: daily cap reached"
              : reasonFor(c.reasonCode, FOLLOW_UP_OUTBOUND_COOLDOWN_HOURS),
            payload,
            idempotencyKey: key,
            dryRun: !realSendDryRunOff,
          },
          select: { id: true },
        }),
      );
      createdExecutionId = created.id;
      resultBase.created += 1;
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        resultBase.duplicates += 1;
        continue;
      }
      throw err;
    }

    auditLog({
      userId: account.userId,
      action: "automation_candidate_created",
      resourceId: createdExecutionId,
      metadata: {
        accountId: account.id,
        threadId: c.threadId,
        type: AUTO_FOLLOW_UP_ACTION_TYPE,
        modeSnapshot,
        detector: DETECTOR_VERSION,
        idempotencyKey: key,
        status: decision.status,
        ...(guardrailCancelsRealSendCandidate ? { guardrail: "daily_cap_reached" } : {}),
        confidence,
        confidenceBand: decision.band,
      },
    });

    if (modeSnapshot === "auto" && targetStatus === "pending" && createdExecutionId) {
      const enqueued = await enqueueAutomationExecution(createdExecutionId);
      if (enqueued) resultBase.enqueued += 1;
    }
  }

  return resultBase;
}

