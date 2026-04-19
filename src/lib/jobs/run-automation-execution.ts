import type { Prisma } from "@prisma/client";

import { transitionActionExecution } from "@/lib/automation";
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
  payload: Prisma.JsonValue,
  meta: Record<string, unknown>,
): Prisma.InputJsonValue {
  const existing = isObject(payload) ? payload : { value: payload };
  return {
    ...existing,
    dryRunStep: meta,
  } as Prisma.InputJsonValue;
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
  }
  return false;
}

export class TransientAutomationExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransientAutomationExecutionError";
  }
}

export async function runAutomationExecutionDryRun(executionId: string): Promise<{
  state: "noop_terminal" | "success";
}> {
  const execution = await withDbRetry(() =>
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

  if (execution.status === "pending" || execution.status === "awaiting_approval") {
    await transitionActionExecution({
      id: execution.id,
      userId: execution.userId,
      to: "running",
      lastError: null,
    });
  }

  const transientFailureBudget = extractTransientFailureBudget(execution.payload);
  if (execution.retryCount < transientFailureBudget) {
    throw new TransientAutomationExecutionError(
      `Simulated transient dry-run failure ${execution.retryCount + 1}/${transientFailureBudget}`,
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 120));

  const nowIso = new Date().toISOString();
  await withDbRetry(() =>
    db.actionExecution.update({
      where: { id: execution.id },
      data: {
        dryRun: true,
        payload: buildPayloadWithStepMeta(execution.payload, {
          actor: "automation.execute",
          stage: "act",
          outcome: "simulated_success",
          processedAt: nowIso,
          executionId: execution.id,
        }),
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

