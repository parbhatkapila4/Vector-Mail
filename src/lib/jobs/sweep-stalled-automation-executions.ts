import {
  InvalidActionExecutionTransitionError,
  transitionActionExecution,
} from "@/lib/automation";
import { log as auditLog } from "@/lib/audit/audit-log";
import { SEND_OUTCOME_UNKNOWN_REASON } from "@/lib/jobs/run-automation-execution";
import { serverLog } from "@/lib/logging/server-logger";
import { db, withDbRetry } from "@/server/db";

export const STALLED_AUTOMATION_EXECUTION_TIMEOUT_MS = 30 * 60 * 1000;

const STALLED_SWEEP_BATCH_LIMIT = 200;

export type StalledAutomationSweepResult = {
  scanned: number;
  reconciled: number;
  parkedUnknownOutcome: number;
  parkedBeforeSend: number;
  skipped: number;
};

export async function sweepStalledAutomationExecutions(options?: {
  now?: Date;
  timeoutMs?: number;
  limit?: number;
}): Promise<StalledAutomationSweepResult> {
  const now = options?.now ?? new Date();
  const timeoutMs =
    options?.timeoutMs ?? STALLED_AUTOMATION_EXECUTION_TIMEOUT_MS;
  const limit = options?.limit ?? STALLED_SWEEP_BATCH_LIMIT;
  const cutoff = new Date(now.getTime() - timeoutMs);

  const stalled = await withDbRetry(() =>
    db.actionExecution.findMany({
      where: { status: "running", updatedAt: { lt: cutoff } },
      select: {
        id: true,
        userId: true,
        accountId: true,
        threadId: true,
        sendAttemptedAt: true,
        providerMessageId: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "asc" },
      take: limit,
    }),
  );

  const result: StalledAutomationSweepResult = {
    scanned: stalled.length,
    reconciled: 0,
    parkedUnknownOutcome: 0,
    parkedBeforeSend: 0,
    skipped: 0,
  };

  for (const row of stalled) {
    if (row.providerMessageId) {
      if (await settle(row, "success", null)) result.reconciled += 1;
      else result.skipped += 1;
      continue;
    }
    if (row.sendAttemptedAt) {
      const parked = await settle(
        row,
        "failed",
        `${SEND_OUTCOME_UNKNOWN_REASON}: stalled in running since ${row.updatedAt.toISOString()}`,
      );
      if (parked) {
        result.parkedUnknownOutcome += 1;
        auditLog({
          userId: row.userId,
          action: "automation_follow_up_send_outcome_unknown",
          resourceId: row.id,
          metadata: {
            accountId: row.accountId,
            threadId: row.threadId,
            sendAttemptedAt: row.sendAttemptedAt.toISOString(),
            detectedBy: "stalled_execution_sweeper",
          },
        });
      } else {
        result.skipped += 1;
      }
      continue;
    }
    const parked = await settle(
      row,
      "failed",
      `stalled_before_send: no provider call was attempted since ${row.updatedAt.toISOString()}`,
    );
    if (parked) result.parkedBeforeSend += 1;
    else result.skipped += 1;
  }

  return result;
}

async function settle(
  row: { id: string; userId: string },
  to: "success" | "failed",
  lastError: string | null,
): Promise<boolean> {
  try {
    await transitionActionExecution({
      id: row.id,
      userId: row.userId,
      to,
      lastError: lastError === null ? null : lastError.slice(0, 1900),
    });
    return true;
  } catch (err) {
    if (err instanceof InvalidActionExecutionTransitionError) return false;
    serverLog.error(
      {
        executionId: row.id,
        to,
        err: err instanceof Error ? err.message : String(err),
      },
      "sweepStalledAutomationExecutions: could not settle row",
    );
    return false;
  }
}
