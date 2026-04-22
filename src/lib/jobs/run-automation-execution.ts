import type { Prisma } from "@prisma/client";
import axios from "axios";

import { transitionActionExecution } from "@/lib/automation";
import {
  automationRealSendEnabled,
  canAutomationExecutionRealSend,
} from "@/lib/automation/automation-real-send-gates";
import { AUTO_FOLLOW_UP_ACTION_TYPE } from "@/lib/automation/action-types";
import {
  AutomationDraftStepError,
  generateAutomationDraftFields,
  mergeDraftFieldsIntoPayload,
} from "@/lib/automation/generate-automation-draft";
import {
  blockReasonForSender,
  normalizeAutomationGuardrails,
} from "@/lib/automation/guardrails";
import { evaluateThreadEligibilityForAutoFollowUpSend } from "@/lib/automation/thread-eligibility-for-send";
import { log as auditLog } from "@/lib/audit/audit-log";
import { Account } from "@/lib/accounts";
import { appendVectorMailSignature } from "@/lib/vectormail-signature";
import { db, withDbRetry } from "@/server/db";

const TRANSIENT_ERROR_CODES = new Set(["ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractTransientFailureBudget(payload: Prisma.JsonValue): number {
  if (!isObject(payload)) return 0;
  const direct = payload.simulateTransientFailures;
  if (typeof direct === "number" && Number.isFinite(direct) && direct > 0) {
    return Math.floor(direct);
  }
  const qa = payload.qa;
  if (isObject(qa)) {
    const nested = qa.simulateTransientFailures;
    if (typeof nested === "number" && Number.isFinite(nested) && nested > 0) {
      return Math.floor(nested);
    }
  }
  return 0;
}

function buildPayloadWithStepMeta(
  payload: Prisma.JsonValue | Prisma.InputJsonValue,
  meta: Record<string, unknown>,
): Prisma.InputJsonValue {
  const existing = isObject(payload) ? payload : { value: payload };
  return {
    ...existing,
    dryRunStep: meta,
  } as Prisma.InputJsonValue;
}

function hasCompleteAutomationDraft(payload: Prisma.JsonValue): boolean {
  if (!isObject(payload)) return false;
  const subject = payload.draftSubject;
  const body = payload.draftBody;
  const meta = payload.draftMeta;
  if (typeof subject !== "string" || subject.trim().length === 0) return false;
  if (typeof body !== "string" || body.trim().length === 0) return false;
  if (!isObject(meta)) return false;
  return (
    typeof meta.inReplyToInternetMessageId === "string" &&
    meta.inReplyToInternetMessageId.length > 0 &&
    typeof meta.lastExternalEmailId === "string" &&
    meta.lastExternalEmailId.length > 0
  );
}

function extractAurinkoMessageId(result: unknown): string | null {
  if (!isObject(result)) return null;
  const id = result.id;
  return typeof id === "string" && id.trim().length > 0 ? id.trim() : null;
}

export function isTransientAutomationError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === "object") {
    const e = error as { name?: string; code?: string; message?: string };
    if (e.name === "TransientAutomationExecutionError") return true;
    if (typeof e.code === "string" && TRANSIENT_ERROR_CODES.has(e.code)) return true;
    if (
      typeof e.message === "string" &&
      /timed out|timeout|temporar|rate limit|try again|network/i.test(e.message)
    ) {
      return true;
    }
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 429 || status === 502 || status === 503 || status === 504) return true;
    }
  }
  return false;
}

export class TransientAutomationExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransientAutomationExecutionError";
  }
}

export class AutomationSendPermanentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AutomationSendPermanentError";
  }
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function runAutomationExecutionDryRun(executionId: string): Promise<{
  state: "noop_terminal" | "success" | "cancelled";
}> {
  let execution = await withDbRetry(() =>
    db.actionExecution.findUnique({
      where: { id: executionId },
    }),
  );

  if (!execution) {
    throw new Error(`ActionExecution not found: ${executionId}`);
  }

  if (["success", "failed", "cancelled"].includes(execution.status)) {
    return { state: "noop_terminal" };
  }

  if (execution.providerMessageId && execution.status === "running") {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "success",
      lastError: null,
    });
    return { state: "success" };
  }

  if (execution.status === "pending" || execution.status === "awaiting_approval") {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "running",
      lastError: null,
    });
  }

  execution =
    (await withDbRetry(() =>
      db.actionExecution.findUnique({
        where: { id: executionId },
      }),
    )) ?? execution;

  if (!execution) {
    throw new Error(`ActionExecution not found: ${executionId}`);
  }

  const transientFailureBudget = extractTransientFailureBudget(execution.payload);
  if (execution.retryCount < transientFailureBudget) {
    throw new TransientAutomationExecutionError(
      `Simulated transient dry-run failure ${execution.retryCount + 1}/${transientFailureBudget}`,
    );
  }

  let payloadWithDraft: Prisma.InputJsonValue;
  if (hasCompleteAutomationDraft(execution.payload)) {
    const p = execution.payload;
    payloadWithDraft = (isObject(p) ? p : { value: p }) as Prisma.InputJsonValue;
  } else {
    try {
      const execRow = execution;
      const draftFields = await generateAutomationDraftFields(execRow);
      payloadWithDraft = mergeDraftFieldsIntoPayload(execRow.payload, draftFields);
      await withDbRetry(() =>
        db.actionExecution.update({
          where: { id: execRow.id },
          data: { payload: payloadWithDraft },
        }),
      );
    } catch (e) {
      const err =
        e instanceof AutomationDraftStepError
          ? e
          : new AutomationDraftStepError(
              "draft_step_error",
              e instanceof Error ? e.message : String(e),
            );
      await transitionActionExecution({
        id: execution.id,
        userId: execution.userId,
        to: "failed",
        lastError: `${err.code}: ${err.message}`.slice(0, 1900),
      });
      auditLog({
        userId: execution.userId,
        action: "automation_draft_failed",
        resourceId: execution.id,
        metadata: {
          code: err.code,
          accountId: execution.accountId,
          threadId: execution.threadId,
        },
      });
      throw err;
    }
  }

  execution =
    (await withDbRetry(() =>
      db.actionExecution.findUnique({
        where: { id: executionId },
      }),
    )) ?? execution;

  if (!execution) {
    throw new Error(`ActionExecution not found: ${executionId}`);
  }

  const account = await withDbRetry(() =>
    db.account.findFirst({
      where: { id: execution.accountId, userId: execution.userId },
      select: {
        automationMode: true,
        automationGuardrails: true,
        emailAddress: true,
        name: true,
        token: true,
        customFromName: true,
        customFromAddress: true,
        needsReconnection: true,
      },
    }),
  );

  if (!account) {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "failed",
      lastError: "Account not found for automation execution",
    });
    throw new AutomationSendPermanentError("Account not found for automation execution");
  }
  const guardrails = normalizeAutomationGuardrails(account.automationGuardrails);
  if (guardrails.paused) {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "cancelled",
      lastError: "paused",
    });
    auditLog({
      userId: execution.userId,
      action: "automation_follow_up_cancelled",
      resourceId: execution.id,
      metadata: { reason: "paused", accountId: execution.accountId },
    });
    return { state: "cancelled" };
  }

  const shouldAttemptRealSend =
    execution.type === AUTO_FOLLOW_UP_ACTION_TYPE &&
    canAutomationExecutionRealSend({
      execution,
      accountAutomationMode: account.automationMode,
      guardrails,
    });

  if (!shouldAttemptRealSend) {
    await new Promise((resolve) => setTimeout(resolve, 120));

    const nowIso = new Date().toISOString();
    const simulatedMeta: Record<string, unknown> = {
      actor: "automation.execute",
      stage: "act",
      outcome: "simulated_success",
      processedAt: nowIso,
      executionId: execution.id,
    };
    if (!automationRealSendEnabled()) {
      simulatedMeta.realSendDisabledReason = "AUTOMATION_REAL_SEND_ENABLED=false";
    }

    await withDbRetry(() =>
      db.actionExecution.update({
        where: { id: execution.id },
        data: {
          payload: buildPayloadWithStepMeta(payloadWithDraft, simulatedMeta),
          lastError: null,
        },
      }),
    );

    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "success",
      lastError: null,
    });

    return { state: "success" };
  }

  const threadIdForSend = execution.threadId;
  if (!threadIdForSend) {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "failed",
      lastError: "Real send requires threadId",
    });
    throw new AutomationSendPermanentError("Real send requires threadId");
  }

  const p = payloadWithDraft as Record<string, unknown>;
  const draftMeta = isObject(p.draftMeta) ? p.draftMeta : null;
  const draftSubject = typeof p.draftSubject === "string" ? p.draftSubject : "";
  const draftBody = typeof p.draftBody === "string" ? p.draftBody : "";
  if (!draftMeta || !draftSubject.trim() || !draftBody.trim()) {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "failed",
      lastError: "Missing draft fields for real send",
    });
    throw new AutomationSendPermanentError("Missing draft fields for real send");
  }

  const expectedLastExternalEmailId = String(draftMeta.lastExternalEmailId);
  const expectedInReplyToInternetMessageId = String(draftMeta.inReplyToInternetMessageId);

  const execPayload = execution.payload;
  const detectorReasonCode =
    isObject(execPayload) && typeof execPayload.reasonCode === "string"
      ? execPayload.reasonCode
      : null;

  const eligibility = await evaluateThreadEligibilityForAutoFollowUpSend({
    threadId: threadIdForSend,
    accountId: execution.accountId,
    accountEmailLower: account.emailAddress.toLowerCase(),
    now: new Date(),
    expectedLastExternalEmailId,
    expectedInReplyToInternetMessageId,
    detectorReasonCode,
  });

  if (!eligibility.ok) {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "cancelled",
      lastError: `Pre-send: ${eligibility.reason}`.slice(0, 1900),
    });
    auditLog({
      userId: execution.userId,
      action: "automation_follow_up_cancelled",
      resourceId: execution.id,
      metadata: {
        reason: eligibility.reason,
        accountId: execution.accountId,
        threadId: threadIdForSend,
      },
    });
    return { state: "cancelled" };
  }
  const senderAddress = eligibility.lastExternal.from.address ?? "";
  const senderBlockedReason = blockReasonForSender(senderAddress, guardrails);
  if (senderBlockedReason) {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "cancelled",
      lastError: senderBlockedReason,
    });
    auditLog({
      userId: execution.userId,
      action: "automation_follow_up_cancelled",
      resourceId: execution.id,
      metadata: {
        reason: senderBlockedReason,
        accountId: execution.accountId,
        threadId: threadIdForSend,
      },
    });
    return { state: "cancelled" };
  }

  const sendsToday = await withDbRetry(() =>
    db.actionExecution.count({
      where: {
        userId: execution.userId,
        accountId: execution.accountId,
        type: AUTO_FOLLOW_UP_ACTION_TYPE,
        status: "success",
        providerMessageId: { not: null },
        updatedAt: { gte: startOfTodayUtc() },
      },
    }),
  );
  if (sendsToday >= guardrails.maxAutoSendsPerDay) {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "cancelled",
      lastError: "daily_cap_reached",
    });
    auditLog({
      userId: execution.userId,
      action: "automation_follow_up_cancelled",
      resourceId: execution.id,
      metadata: {
        reason: "daily_cap_reached",
        accountId: execution.accountId,
        maxAutoSendsPerDay: guardrails.maxAutoSendsPerDay,
      },
    });
    return { state: "cancelled" };
  }

  if (account.needsReconnection) {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "failed",
      lastError: "Account needs reconnection before send",
    });
    throw new AutomationSendPermanentError("Account needs reconnection before send");
  }

  const toAddress = eligibility.lastExternal.replyTo?.[0] ?? eligibility.lastExternal.from;
  const to = [
    {
      name: toAddress.name ?? toAddress.address,
      address: toAddress.address,
    },
  ];

  const from = account.customFromAddress
    ? {
        address: account.customFromAddress,
        name: account.customFromName ?? account.name ?? undefined,
      }
    : {
        address: account.emailAddress,
        name: account.name ?? undefined,
      };

  const bodyWithSignature = appendVectorMailSignature(draftBody.trim(), true);

  const emailAccount = new Account(execution.accountId, account.token);
  let sendResult: unknown;
  try {
    sendResult = await emailAccount.sendEmail({
      from,
      to,
      subject: draftSubject.trim(),
      body: bodyWithSignature,
      inReplyTo: expectedInReplyToInternetMessageId,
      threadId: threadIdForSend,
    });
  } catch (err) {
    if (isTransientAutomationError(err)) {
      throw new TransientAutomationExecutionError(
        err instanceof Error ? err.message : String(err),
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "failed",
      lastError: msg.slice(0, 1900),
    });
    auditLog({
      userId: execution.userId,
      action: "automation_follow_up_send_failed",
      resourceId: execution.id,
      metadata: {
        accountId: execution.accountId,
        threadId: threadIdForSend,
        transient: false,
      },
    });
    throw new AutomationSendPermanentError(msg);
  }

  const providerId = extractAurinkoMessageId(sendResult);
  if (!providerId) {
    const msg = "Provider did not return a message id";
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "failed",
      lastError: msg,
    });
    throw new AutomationSendPermanentError(msg);
  }

  const claim = await withDbRetry(() =>
    db.actionExecution.updateMany({
      where: { id: execution.id, providerMessageId: null },
      data: { providerMessageId: providerId },
    }),
  );

  if (claim.count === 0) {
    const existing = await withDbRetry(() =>
      db.actionExecution.findUnique({
        where: { id: execution.id },
        select: { providerMessageId: true, status: true },
      }),
    );
    if (existing?.providerMessageId) {
      if (existing.status === "running") {
        await transitionActionExecution({
          id: execution.id,
          userId: execution.userId,
          to: "success",
          lastError: null,
        });
      }
      return { state: "success" };
    }
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "failed",
      lastError: "Could not record provider message id (race)",
    });
    throw new AutomationSendPermanentError("Could not record provider message id (race)");
  }

  const nowIso = new Date().toISOString();
  const payloadAfterSend = buildPayloadWithStepMeta(payloadWithDraft, {
    actor: "automation.execute",
    stage: "act",
    outcome: "real_sent",
    processedAt: nowIso,
    executionId: execution.id,
    providerMessageId: providerId,
  });

  await withDbRetry(() =>
    db.$transaction([
      db.actionExecution.update({
        where: { id: execution.id },
        data: {
          payload: payloadAfterSend,
          lastError: null,
        },
      }),
      db.thread.update({
        where: { id: threadIdForSend },
        data: { lastAutoFollowUpAt: new Date() },
      }),
    ]),
  );

  await transitionActionExecution({
    id: execution.id,
    userId: execution.userId,
    to: "success",
    lastError: null,
  });

  auditLog({
    userId: execution.userId,
    action: "automation_follow_up_sent",
    resourceId: execution.id,
    metadata: {
      accountId: execution.accountId,
      threadId: threadIdForSend,
      providerMessageId: providerId,
    },
  });

  return { state: "success" };
}
