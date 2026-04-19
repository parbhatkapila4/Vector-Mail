import type { ActionExecutionStatus } from "@prisma/client";

const ALLOWED: Record<
  ActionExecutionStatus,
  readonly ActionExecutionStatus[]
> = {
  pending: ["awaiting_approval", "running", "cancelled"],
  awaiting_approval: ["pending", "running", "cancelled"],
  running: ["success", "failed", "cancelled"],
  success: [],
  failed: ["running", "cancelled"],
  cancelled: [],
};

export class InvalidActionExecutionTransitionError extends Error {
  constructor(
    readonly from: ActionExecutionStatus,
    readonly to: ActionExecutionStatus,
  ) {
    super(`Invalid action execution transition: ${from} -> ${to}`);
    this.name = "InvalidActionExecutionTransitionError";
  }
}

export function getAllowedActionExecutionTransitions(
  from: ActionExecutionStatus,
): readonly ActionExecutionStatus[] {
  return ALLOWED[from];
}

export function canTransitionActionExecution(
  from: ActionExecutionStatus,
  to: ActionExecutionStatus,
): boolean {
  return ALLOWED[from].includes(to);
}

export function assertValidActionExecutionTransition(
  from: ActionExecutionStatus,
  to: ActionExecutionStatus,
): void {
  if (!canTransitionActionExecution(from, to)) {
    throw new InvalidActionExecutionTransitionError(from, to);
  }
}
