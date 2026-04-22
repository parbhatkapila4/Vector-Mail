import type { ActionExecution, AutomationMode } from "@prisma/client";

import { AUTO_FOLLOW_UP_ACTION_TYPE } from "@/lib/automation/action-types";
import type { AutomationGuardrails } from "@/lib/automation/guardrails";
import { bandForConfidence } from "@/lib/automation/policy";
import { DEMO_ACCOUNT_ID, DEMO_USER_ID } from "@/lib/demo/constants";
import { env } from "@/env.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function automationRealSendEnabled(): boolean {
  return env.AUTOMATION_REAL_SEND_ENABLED === true;
}

/**
 * Whether this execution is allowed to perform a real Aurinko send (all gates except pre-send thread checks).
 */
export function canAutomationExecutionRealSend(params: {
  execution: Pick<
    ActionExecution,
    "type" | "dryRun" | "status" | "modeSnapshot" | "confidence" | "userId" | "accountId" | "payload"
  >;
  accountAutomationMode: AutomationMode;
  guardrails: AutomationGuardrails;
}): boolean {
  const { execution, accountAutomationMode, guardrails } = params;
  if (!automationRealSendEnabled()) return false;
  if (guardrails.paused) return false;
  if (execution.dryRun !== false) return false;
  if (execution.status !== "running") return false;
  if (execution.type !== AUTO_FOLLOW_UP_ACTION_TYPE) return false;
  if (execution.userId === DEMO_USER_ID || execution.accountId === DEMO_ACCOUNT_ID) {
    return false;
  }

  const payload = execution.payload;
  const approvedAt =
    isRecord(payload) && typeof payload.automationUserApprovedAt === "string"
      ? payload.automationUserApprovedAt
      : null;

  if (execution.modeSnapshot === "assist") {
    if (!approvedAt) return false;
    if (accountAutomationMode === "manual") return false;
    return true;
  }

  if (execution.modeSnapshot === "auto") {
    if (bandForConfidence(execution.confidence) !== "HIGH") return false;
    if (accountAutomationMode !== "auto") return false;
    return true;
  }

  return false;
}
