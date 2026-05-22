import { AUTO_FOLLOW_UP_ACTION_TYPE } from "@/lib/automation/action-types";
import { DEMO_ACCOUNT_ID } from "./constants";

const HOURS_AGO = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const MINS_AGO = (m: number) => new Date(Date.now() - m * 60 * 1000);
const DAYS_AGO = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

export const DEMO_AUTOMATION_OUTCOME_SUMMARY = {
  sentRealToday: 4,
  simulatedToday: 6,
  failedToday: 0,
  pendingApproval: 3,
  isDemo: true as const,
};

export const DEMO_AUTOMATION_METRICS_BASE = {
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
  isDemo: true as const,
};

export const DEMO_AUTOMATION_FAILURES = [
  {
    id: "demo-exec-fail-1",
    updatedAt: new Date().toISOString(),
    lastError: "Pre-send: user_already_replied",
    thread: { id: "demo-thread-4", subject: "Re: Project timeline" },
  },
];

export function getDemoAutomationPrefs() {
  return {
    accountId: DEMO_ACCOUNT_ID,
    automationMode: "assist" as const,
    awaitingApproval: 3,
    requiresAutoConsent: false,
    guardrailPaused: false,
    maxAutoSendsPerDay: 10,
    realSendEnabled: false,
  };
}

export function getDemoAutomationGuardrails(materialHashFn: (g: {
  maxAutoSendsPerDay: number;
  blockedDomains: string[];
  blockedSenderSubstrings: string[];
}) => string) {
  const material = {
    maxAutoSendsPerDay: 5,
    blockedDomains: ["example.org"],
    blockedSenderSubstrings: ["noreply@"],
  };
  return {
    paused: false,
    ...material,
    autoConsentAcknowledgedAt: HOURS_AGO(2).toISOString(),
    autoConsentGuardrailsHash: materialHashFn(material),
  };
}

export function getDemoPendingExecutions() {
  return [
    {
      id: "demo-pending-1",
      type: AUTO_FOLLOW_UP_ACTION_TYPE,
      status: "awaiting_approval" as const,
      modeSnapshot: "assist" as const,
      confidence: 0.92,
      reason:
        "Founder said you'd reply by Tuesday; thread has gone two days quiet.",
      createdAt: MINS_AGO(35),
      thread: {
        id: "demo-thread-1",
        subject: "Quick intro - AI inbox automation",
        lastMessageDate: DAYS_AGO(2),
      },
      subject: "Quick intro - AI inbox automation",
    },
    {
      id: "demo-pending-2",
      type: AUTO_FOLLOW_UP_ACTION_TYPE,
      status: "awaiting_approval" as const,
      modeSnapshot: "assist" as const,
      confidence: 0.87,
      reason:
        "Partnership lead waiting; their quarterly plan locks Friday.",
      createdAt: MINS_AGO(70),
      thread: {
        id: "demo-thread-11",
        subject: "Re: Partnership discussion",
        lastMessageDate: DAYS_AGO(4),
      },
      subject: "Re: Partnership discussion",
    },
    {
      id: "demo-pending-3",
      type: AUTO_FOLLOW_UP_ACTION_TYPE,
      status: "awaiting_approval" as const,
      modeSnapshot: "assist" as const,
      confidence: 0.81,
      reason:
        "Conference deadline tomorrow; speaker slot will lapse otherwise.",
      createdAt: MINS_AGO(110),
      thread: {
        id: "demo-thread-19",
        subject: "Re: Conference talk proposal",
        lastMessageDate: DAYS_AGO(3),
      },
      subject: "Re: Conference talk proposal",
    },
  ];
}

export function getDemoExecutionList(page: number, limit: number) {
  const items = [
    {
      id: "demo-exec-1",
      status: "success",
      type: AUTO_FOLLOW_UP_ACTION_TYPE,
      createdAt: MINS_AGO(90).toISOString(),
      updatedAt: MINS_AGO(88).toISOString(),
      dryRun: true,
      retryCount: 0,
      providerMessageId: null,
      thread: { id: "demo-thread-1", subject: "Re: Intro call follow-up" },
    },
    {
      id: "demo-exec-2",
      status: "awaiting_approval",
      type: AUTO_FOLLOW_UP_ACTION_TYPE,
      createdAt: MINS_AGO(50).toISOString(),
      updatedAt: MINS_AGO(50).toISOString(),
      dryRun: true,
      retryCount: 0,
      providerMessageId: null,
      thread: { id: "demo-thread-2", subject: "Re: Contract details" },
    },
    {
      id: "demo-exec-3",
      status: "failed",
      type: AUTO_FOLLOW_UP_ACTION_TYPE,
      createdAt: MINS_AGO(30).toISOString(),
      updatedAt: MINS_AGO(28).toISOString(),
      dryRun: false,
      retryCount: 1,
      providerMessageId: null,
      thread: { id: "demo-thread-3", subject: "Re: Proposal timeline" },
    },
  ] as const;
  return {
    items,
    page,
    limit,
    hasMore: false,
    total: items.length,
    isDemo: true as const,
  };
}

export function getDemoThreadAutoFollowUpBadges(threadIds: ReadonlyArray<string>) {
  const t1 = HOURS_AGO(2).toISOString();
  const t2 = HOURS_AGO(26).toISOString();
  const byThreadId: Record<string, { lastSuccessAt: string; wasRealSend: boolean }> = {};
  for (const tid of ["demo-thread-1", "demo-thread-2", "demo-thread-3"]) {
    if (threadIds.includes(tid)) {
      byThreadId[tid] = {
        lastSuccessAt: tid === "demo-thread-1" ? t1 : t2,
        wasRealSend: tid === "demo-thread-1",
      };
    }
  }
  return { byThreadId };
}

export function getDemoThreadFollowUpSummary(threadId: string) {
  if (threadId === "demo-thread-1") {
    return {
      lastSuccessAt: MINS_AGO(90).toISOString(),
      wasRealSend: false,
    };
  }
  return null;
}

export function getDemoRecentFailures() {
  return DEMO_AUTOMATION_FAILURES.map((r) => ({
    ...r,
    lastErrorTruncated: r.lastError.slice(0, 160),
  }));
}
