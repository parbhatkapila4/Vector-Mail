import type { Prisma } from "@prisma/client";
import type {
  ActionExecutionStatus,
  AutomationMode,
} from "@prisma/client";

import { db, withDbRetry } from "@/server/db";

import { assertValidActionExecutionTransition } from "./transitions";
import type { ActionExecutionType } from "./types";

export type CreateActionExecutionInput = {
  userId: string;
  accountId: string;
  threadId?: string | null;
  type: ActionExecutionType;
  status?: ActionExecutionStatus;
  modeSnapshot: AutomationMode;
  confidence?: number | null;
  reason?: string | null;
  payload: Prisma.InputJsonValue;
  idempotencyKey: string;
  dryRun?: boolean;
  providerMessageId?: string | null;
};

export async function createActionExecution(input: CreateActionExecutionInput) {
  const existing = await withDbRetry(() =>
    db.actionExecution.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    }),
  );
  if (existing) {
    return existing;
  }

  const account = await withDbRetry(() =>
    db.account.findFirst({
      where: { id: input.accountId, userId: input.userId },
      select: { id: true },
    }),
  );
  if (!account) {
    throw new Error("Account not found for user");
  }

  const threadId = input.threadId;
  if (threadId) {
    const thread = await withDbRetry(() =>
      db.thread.findFirst({
        where: { id: threadId, accountId: input.accountId },
        select: { id: true },
      }),
    );
    if (!thread) {
      throw new Error("Thread not found for account");
    }
  }

  return withDbRetry(() =>
    db.actionExecution.create({
      data: {
        userId: input.userId,
        accountId: input.accountId,
        threadId: input.threadId ?? null,
        type: input.type,
        status: input.status ?? "pending",
        modeSnapshot: input.modeSnapshot,
        confidence: input.confidence ?? null,
        reason: input.reason ?? null,
        payload: input.payload,
        idempotencyKey: input.idempotencyKey,
        dryRun: input.dryRun ?? true,
        providerMessageId: input.providerMessageId ?? null,
      },
    }),
  );
}

export type TransitionActionExecutionInput = {
  id: string;
  userId: string;
  to: ActionExecutionStatus;
  lastError?: string | null;
};

export async function transitionActionExecution(
  input: TransitionActionExecutionInput,
) {
  const exec = await withDbRetry(() =>
    db.actionExecution.findFirst({
      where: { id: input.id, userId: input.userId },
    }),
  );
  if (!exec) {
    throw new Error("Action execution not found");
  }

  assertValidActionExecutionTransition(exec.status, input.to);

  const data: Prisma.ActionExecutionUpdateInput = {
    status: input.to,
  };

  if (exec.status === "failed" && input.to === "running") {
    data.retryCount = { increment: 1 };
  }

  if (input.lastError !== undefined) {
    data.lastError = input.lastError;
  }

  return withDbRetry(() =>
    db.actionExecution.update({
      where: { id: input.id },
      data,
    }),
  );
}
