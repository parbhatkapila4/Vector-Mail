import { InvalidActionExecutionTransitionError } from "../../lib/automation/transitions";

jest.mock("@/env.js", () => ({
  env: { AUTOMATION_REAL_SEND_ENABLED: true },
}));

jest.mock("@/lib/automation", () => ({
  transitionActionExecution: jest.fn(),
  InvalidActionExecutionTransitionError:
    jest.requireActual("../../lib/automation/transitions")
      .InvalidActionExecutionTransitionError,
}));

jest.mock("@/lib/jobs/run-automation-execution", () => ({
  SEND_OUTCOME_UNKNOWN_REASON: "send_outcome_unknown",
}));

jest.mock("@/lib/audit/audit-log", () => ({ log: jest.fn() }));

jest.mock("@/lib/logging/server-logger", () => ({
  serverLog: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/server/db", () => ({
  db: { actionExecution: { findMany: jest.fn() } },
  withDbRetry: async (fn: () => Promise<unknown>) => await fn(),
}));

import {
  canAutomationExecutionRealSend,
} from "../../lib/automation/automation-real-send-gates";
import { normalizeAutomationGuardrails } from "../../lib/automation/guardrails";
import { sweepStalledAutomationExecutions } from "../../lib/jobs/sweep-stalled-automation-executions";

const { db: mockDb } = jest.requireMock("@/server/db") as {
  db: { actionExecution: { findMany: jest.Mock } };
};
const { transitionActionExecution: mockTransition } = jest.requireMock(
  "@/lib/automation",
) as { transitionActionExecution: jest.Mock };

const guardrails = normalizeAutomationGuardrails({});

function executionRow(overrides: Record<string, unknown> = {}) {
  return {
    type: "AUTO_FOLLOW_UP",
    dryRun: false,
    status: "running",
    modeSnapshot: "auto",
    confidence: 0.9,
    userId: "u1",
    accountId: "a1",
    payload: {},
    sendAttemptedAt: null,
    providerMessageId: null,
    ...overrides,
  } as Parameters<typeof canAutomationExecutionRealSend>[0]["execution"];
}

describe("duplicate send guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("real-send gate", () => {
    it("allows a running row that has not yet claimed the send marker", () => {
      expect(
        canAutomationExecutionRealSend({
          execution: executionRow(),
          accountAutomationMode: "auto",
          guardrails,
        }),
      ).toBe(true);
    });

    it("refuses a running row whose send was attempted but never recorded", () => {
      expect(
        canAutomationExecutionRealSend({
          execution: executionRow({
            sendAttemptedAt: new Date("2026-09-04T10:00:00.000Z"),
            providerMessageId: null,
          }),
          accountAutomationMode: "auto",
          guardrails,
        }),
      ).toBe(false);
    });

    it("does not refuse on the marker alone once a provider id exists", () => {
      expect(
        canAutomationExecutionRealSend({
          execution: executionRow({
            sendAttemptedAt: new Date("2026-09-04T10:00:00.000Z"),
            providerMessageId: "aurinko-123",
          }),
          accountAutomationMode: "auto",
          guardrails,
        }),
      ).toBe(true);
    });
  });

  describe("stalled execution sweeper", () => {
    const now = new Date("2026-09-04T12:00:00.000Z");
    const stale = new Date("2026-09-04T10:00:00.000Z");

    it("reconciles a row that recorded a provider id but never closed out", async () => {
      mockDb.actionExecution.findMany.mockResolvedValue([
        {
          id: "e1",
          userId: "u1",
          accountId: "a1",
          threadId: "t1",
          sendAttemptedAt: stale,
          providerMessageId: "aurinko-123",
          updatedAt: stale,
        },
      ]);

      const result = await sweepStalledAutomationExecutions({ now });

      expect(result.reconciled).toBe(1);
      expect(mockTransition).toHaveBeenCalledWith(
        expect.objectContaining({ id: "e1", to: "success" }),
      );
    });

    it("parks an attempted send with unknown outcome instead of re-sending", async () => {
      mockDb.actionExecution.findMany.mockResolvedValue([
        {
          id: "e2",
          userId: "u1",
          accountId: "a1",
          threadId: "t1",
          sendAttemptedAt: stale,
          providerMessageId: null,
          updatedAt: stale,
        },
      ]);

      const result = await sweepStalledAutomationExecutions({ now });

      expect(result.parkedUnknownOutcome).toBe(1);
      expect(mockTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "e2",
          to: "failed",
          lastError: expect.stringContaining("send_outcome_unknown"),
        }),
      );
    });

    it("parks a row that stalled before the provider was ever called", async () => {
      mockDb.actionExecution.findMany.mockResolvedValue([
        {
          id: "e3",
          userId: "u1",
          accountId: "a1",
          threadId: "t1",
          sendAttemptedAt: null,
          providerMessageId: null,
          updatedAt: stale,
        },
      ]);

      const result = await sweepStalledAutomationExecutions({ now });

      expect(result.parkedBeforeSend).toBe(1);
      expect(mockTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "e3",
          to: "failed",
          lastError: expect.stringContaining("stalled_before_send"),
        }),
      );
    });

    it("skips a row that reached a terminal state mid-sweep", async () => {
      mockDb.actionExecution.findMany.mockResolvedValue([
        {
          id: "e4",
          userId: "u1",
          accountId: "a1",
          threadId: "t1",
          sendAttemptedAt: null,
          providerMessageId: null,
          updatedAt: stale,
        },
      ]);
      mockTransition.mockRejectedValueOnce(
        new InvalidActionExecutionTransitionError("success", "failed"),
      );

      const result = await sweepStalledAutomationExecutions({ now });

      expect(result.skipped).toBe(1);
      expect(result.parkedBeforeSend).toBe(0);
    });
  });
});
