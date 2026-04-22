import {
  assertValidActionExecutionTransition,
  canTransitionActionExecution,
  InvalidActionExecutionTransitionError,
} from "../../lib/automation/transitions";
import {
  createActionExecution,
  transitionActionExecution,
} from "../../lib/automation/execution";
import {
  blockReasonForSender,
  normalizeAutomationGuardrails,
} from "../../lib/automation/guardrails";

jest.mock("../../server/db", () => ({
  db: {
    actionExecution: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
    },
    thread: {
      findFirst: jest.fn(),
    },
  },
  withDbRetry: async (fn: () => Promise<unknown>) => await fn(),
}));

const { db: mockDb } = jest.requireMock("../../server/db") as {
  db: {
    actionExecution: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    account: { findFirst: jest.Mock };
    thread: { findFirst: jest.Mock };
  };
};

describe("automation hardening", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("transition guards", () => {
    it("allows valid transition pending -> running", () => {
      expect(canTransitionActionExecution("pending", "running")).toBe(true);
      expect(() =>
        assertValidActionExecutionTransition("pending", "running"),
      ).not.toThrow();
    });

    it("rejects invalid transition success -> running", () => {
      expect(canTransitionActionExecution("success", "running")).toBe(false);
      expect(() =>
        assertValidActionExecutionTransition("success", "running"),
      ).toThrow(InvalidActionExecutionTransitionError);
    });
  });

  describe("idempotency behavior", () => {
    it("returns existing execution when idempotency key already exists", async () => {
      const existing = { id: "exec-existing", idempotencyKey: "k1" };
      mockDb.actionExecution.findUnique.mockResolvedValue(existing);

      const result = await createActionExecution({
        userId: "u1",
        accountId: "a1",
        type: "AUTO_FOLLOW_UP",
        modeSnapshot: "assist",
        payload: {},
        idempotencyKey: "k1",
      });

      expect(result).toBe(existing);
      expect(mockDb.actionExecution.create).not.toHaveBeenCalled();
    });
  });

  describe("execution lifecycle state transitions", () => {
    it("increments retryCount on failed -> running transition", async () => {
      mockDb.actionExecution.findFirst.mockResolvedValue({
        id: "exec-1",
        userId: "u1",
        status: "failed",
      });
      mockDb.actionExecution.update.mockResolvedValue({ id: "exec-1" });

      await transitionActionExecution({
        id: "exec-1",
        userId: "u1",
        to: "running",
      });

      expect(mockDb.actionExecution.update).toHaveBeenCalledWith({
        where: { id: "exec-1" },
        data: {
          status: "running",
          retryCount: { increment: 1 },
        },
      });
    });

    it("moves running -> success without retry increment", async () => {
      mockDb.actionExecution.findFirst.mockResolvedValue({
        id: "exec-2",
        userId: "u1",
        status: "running",
      });
      mockDb.actionExecution.update.mockResolvedValue({ id: "exec-2" });

      await transitionActionExecution({
        id: "exec-2",
        userId: "u1",
        to: "success",
      });

      expect(mockDb.actionExecution.update).toHaveBeenCalledWith({
        where: { id: "exec-2" },
        data: {
          status: "success",
        },
      });
    });
  });

  describe("guardrails behavior", () => {
    it("normalizes paused + cap + consent fields", () => {
      const g = normalizeAutomationGuardrails({
        paused: true,
        maxAutoSendsPerDay: 999,
        blockedDomains: ["Example.COM", "@vendor.io"],
        blockedSenderSubstrings: ["NoReply@", " no-reply "],
        autoConsent: {
          acknowledgedAt: "2026-04-21T00:00:00.000Z",
          guardrailsHash: "h1",
        },
      });

      expect(g.paused).toBe(true);
      expect(g.maxAutoSendsPerDay).toBe(50);
      expect(g.blockedDomains).toEqual(["example.com", "vendor.io"]);
      expect(g.blockedSenderSubstrings).toEqual(["noreply@", "no-reply"]);
      expect(g.autoConsentAcknowledgedAt).toBe("2026-04-21T00:00:00.000Z");
      expect(g.autoConsentGuardrailsHash).toBe("h1");
    });

    it("blocks sender by domain and substring", () => {
      const g = normalizeAutomationGuardrails({
        blockedDomains: ["vendor.io"],
        blockedSenderSubstrings: ["noreply@"],
      });
      expect(blockReasonForSender("person@vendor.io", g)).toBe(
        "blocked_domain",
      );
      expect(blockReasonForSender("noreply@product.com", g)).toBe(
        "blocked_sender_substring",
      );
    });
  });
});

