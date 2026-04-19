import { inngest } from "./client";
import { runEmailAnalysisForOne, runEmailAnalysisForMany } from "@/lib/jobs/run-email-analysis";
import { runScheduledSend } from "@/lib/jobs/run-scheduled-send";
import {
  isTransientAutomationError,
  runAutomationExecutionDryRun,
} from "@/lib/jobs/run-automation-execution";
import { detectAndCreateFollowUpExecutionsForAccount } from "@/lib/automation/detect";
import { backfillEmailAnalysis } from "@/lib/backfill-email-analysis";
import { recordFailedJob } from "@/lib/jobs/failed-job";
import {
  runInboxSyncOneStep,
  finalizeInboxSync,
} from "@/lib/mail-sync-inbox-step";
import { db } from "@/server/db";

export const EMAIL_ANALYZE_EVENT = "email/analyze";

export const SCHEDULED_SEND_PROCESS_EVENT = "scheduled-send/process";

export const EMAIL_ANALYZE_ACCOUNT_EVENT = "email/analyze-account";

export const MAIL_SYNC_ACCOUNT_EVENT = "mail/sync-account";
export const AUTOMATION_EXECUTE_EVENT = "automation/execute";

const MAX_INBOX_SYNC_STEPS = 120;
const AUTOMATION_EXECUTE_MAX_RETRIES = 3;

//Just a reminder telling that this limit is according to the vercel hobby plan - To all who clone this repo - Author Parbhat kapila
const CRON_STALE_INBOX_SYNC = "30 4 * * *";
const CRON_AUTOMATION_DETECT_FOLLOWUPS = "0 5 * * *"; 

async function recordAndRethrow(
  jobType: string,
  resourceId: string,
  payload: object,
  err: unknown,
): Promise<never> {
  const errorMessage = err instanceof Error ? err.message : String(err);
  try {
    await recordFailedJob({
      jobType,
      resourceId,
      payload,
      errorMessage,
    });
  } catch (recordErr) {
    console.error("[inngest] recordFailedJob error:", recordErr);
  }
  throw err instanceof Error ? err : new Error(errorMessage);
}

export const emailAnalyzeFunction = inngest.createFunction(
  {
    id: "email-analyze",
    name: "Email analysis (embedding + summary)",
    retries: 5,
  },
  { event: EMAIL_ANALYZE_EVENT },
  async ({
    event,
    step,
  }: {
    event: { data: { emailId?: string; emailIds?: string[] } };
    step: { run: <T>(name: string, fn: () => Promise<T>) => Promise<T> };
  }) => {
    const data = event.data as
      | { emailId: string }
      | { emailIds: string[] };

    try {
      if ("emailIds" in data && Array.isArray(data.emailIds)) {
        const result = await step.run("analyze-batch", async () => {
          return await runEmailAnalysisForMany(data.emailIds);
        });
        return {
          processed: result.processed,
          failed: result.failed,
          skipped: result.skipped,
        };
      }

      const emailId =
        "emailId" in data && typeof data.emailId === "string"
          ? data.emailId
          : (data as { emailIds: string[] }).emailIds?.[0];

      if (!emailId) {
        throw new Error("email/analyze: payload must have emailId or emailIds");
      }

      const result = await step.run("analyze-one", async () => {
        return await runEmailAnalysisForOne(emailId);
      });

      if (!result.ok) {
        throw new Error(result.error ?? "analysis failed");
      }
      return { ok: true };
    } catch (err) {
      const jobType = EMAIL_ANALYZE_EVENT;
      const resourceId =
        "emailIds" in data && Array.isArray(data.emailIds)
          ? `batch:${data.emailIds.slice(0, 20).join(",")}${data.emailIds.length > 20 ? "..." : ""}`
          : ("emailId" in data && typeof data.emailId === "string"
            ? data.emailId
            : (data as { emailIds?: string[] }).emailIds?.[0] ?? "unknown");
      await recordAndRethrow(jobType, resourceId, data, err);
    }
  },
);

export const scheduledSendProcessFunction = inngest.createFunction(
  {
    id: "scheduled-send-process",
    name: "Process scheduled send",
    retries: 3,
  },
  { event: SCHEDULED_SEND_PROCESS_EVENT },
  async ({
    event,
    step,
  }: {
    event: { data: { scheduledSendId?: string } };
    step: { run: <T>(name: string, fn: () => Promise<T>) => Promise<T> };
  }) => {
    const eventData = event.data as { scheduledSendId?: string };
    const { scheduledSendId } = eventData;
    if (!scheduledSendId) {
      throw new Error("scheduled-send/process: scheduledSendId required");
    }

    try {
      const result = await step.run("run-send", async () => {
        return await runScheduledSend(scheduledSendId);
      });

      if (!result.ok) {
        throw new Error(result.error ?? "scheduled send failed");
      }
      return { ok: true };
    } catch (err) {
      await recordAndRethrow(
        SCHEDULED_SEND_PROCESS_EVENT,
        scheduledSendId,
        eventData,
        err,
      );
    }
  },
);

export const emailAnalyzeAccountFunction = inngest.createFunction(
  {
    id: "email-analyze-account",
    name: "Email analysis backfill for account",
    retries: 2,
  },
  { event: EMAIL_ANALYZE_ACCOUNT_EVENT },
  async ({
    event,
    step,
  }: {
    event: { data: { accountId?: string; limit?: number } };
    step: { run: <T>(name: string, fn: () => Promise<T>) => Promise<T> };
  }) => {
    const eventData = event.data as { accountId?: string; limit?: number };
    const { accountId, limit } = eventData;
    if (!accountId) {
      throw new Error("email/analyze-account: accountId required");
    }

    try {
      const result = await step.run("backfill", async () => {
        return await backfillEmailAnalysis(accountId, limit ?? 50);
      });

      return {
        processed: result.processed,
        failed: result.failed,
        total: result.total,
      };
    } catch (err) {
      await recordAndRethrow(
        EMAIL_ANALYZE_ACCOUNT_EVENT,
        accountId,
        eventData,
        err,
      );
    }
  },
);

export const mailSyncAccountFunction = inngest.createFunction(
  {
    id: "mail-sync-account",
    name: "Background inbox sync",
    retries: 4,
    concurrency: {
      limit: 1,
      key: "event.data.accountId",
    },
  },
  { event: MAIL_SYNC_ACCOUNT_EVENT },
  async ({
    event,
    step,
  }: {
    event: { data: { accountId?: string; userId?: string } };
    step: {
      run: <T>(name: string, fn: () => Promise<T>) => Promise<T>;
      sleep: (id: string, duration: string) => Promise<void>;
    };
  }) => {
    const { accountId, userId } = event.data;
    if (!accountId?.trim() || !userId?.trim()) {
      throw new Error("mail/sync-account: accountId and userId required");
    }

    const gate = await step.run("verify-account", async () => {
      const row = await db.account.findFirst({
        where: { id: accountId.trim(), userId: userId.trim() },
        select: { id: true, token: true, needsReconnection: true },
      });
      if (!row?.token?.trim()) return { ok: false as const, reason: "no_token" };
      if (row.needsReconnection) return { ok: false as const, reason: "reconnect" };
      return { ok: true as const };
    });
    if (!gate.ok) {
      return { skipped: gate.reason, accountId: accountId.trim() };
    }

    let continueToken: string | undefined;
    for (let i = 0; i < MAX_INBOX_SYNC_STEPS; i++) {
      const r = await step.run(`inbox-step-${i}`, () =>
        runInboxSyncOneStep(accountId.trim(), continueToken),
      );
      if (!r.ok) break;
      continueToken = r.continueToken;
      if (!r.hasMore || !continueToken) {
        break;
      }
      await step.sleep(`pace-${i}`, "750ms");
    }

    await step.run("finalize", () => finalizeInboxSync(accountId.trim()));

    await step.run("enqueue-embeddings", async () => {
      if (!process.env.INNGEST_EVENT_KEY?.trim()) return;
      const { inngest: ing } = await import("./client");
      await ing.send({
        name: EMAIL_ANALYZE_ACCOUNT_EVENT,
        data: { accountId: accountId.trim(), limit: 40 },
      });
    });

    return { ok: true, accountId: accountId.trim() };
  },
);

export const mailSyncStaleAccountsFunction = inngest.createFunction(
  {
    id: "mail-sync-stale-accounts",
    name: "Periodic inbox refresh (stale accounts)",
    retries: 1,
  },
  { cron: CRON_STALE_INBOX_SYNC },
  async ({ step }) => {
    const staleBefore = new Date(Date.now() - 50 * 60 * 1000);
    const accounts = await step.run("pick-accounts", async () => {
      return db.account.findMany({
        where: {
          token: { not: "" },
          needsReconnection: false,
          OR: [
            { lastInboxSyncAt: null },
            { lastInboxSyncAt: { lt: staleBefore } },
          ],
        },
        select: { id: true, userId: true },
        orderBy: [{ lastInboxSyncAt: "asc" }],
        take: 6,
      });
    });

    if (accounts.length === 0) return { enqueued: 0 };
    await step.run("dispatch-sync-jobs", async () => {
      if (!process.env.INNGEST_EVENT_KEY?.trim()) return;
      const { inngest: ing } = await import("./client");
      await Promise.all(
        accounts.map((a) =>
          ing.send({
            name: MAIL_SYNC_ACCOUNT_EVENT,
            data: { accountId: a.id, userId: a.userId },
          }),
        ),
      );
    });

    return { enqueued: accounts.length };
  },
);

export const automationExecuteFunction = inngest.createFunction(
  {
    id: "automation-execute",
    name: "Automation dry-run execution",
    retries: AUTOMATION_EXECUTE_MAX_RETRIES,
    concurrency: {
      limit: 1,
      key: "event.data.executionId",
    },
  },
  { event: AUTOMATION_EXECUTE_EVENT },
  async ({
    event,
    step,
  }: {
    event: { data: { executionId?: string } };
    step: {
      run: <T>(name: string, fn: () => Promise<T>) => Promise<T>;
      sleep: (id: string, duration: string) => Promise<void>;
    };
  }) => {
    const executionId = event.data.executionId?.trim();
    if (!executionId) {
      throw new Error("automation/execute: executionId required");
    }

    try {
      const result = await step.run("run-dry-execution", async () =>
        runAutomationExecutionDryRun(executionId),
      );
      return { ok: true, executionId, state: result.state, dryRun: true };
    } catch (err) {
      const exec = await step.run("load-exec-on-error", async () =>
        db.actionExecution.findUnique({
          where: { id: executionId },
          select: { id: true, userId: true, retryCount: true, status: true },
        }),
      );
      if (!exec) {
        throw err;
      }

      const message = err instanceof Error ? err.message : String(err);
      const isTransient = isTransientAutomationError(err);
      if (!isTransient) {
        await step.run("mark-failed-permanent", async () =>
          db.actionExecution.update({
            where: { id: exec.id },
            data: {
              status: "failed",
              lastError: message.slice(0, 1900),
            },
          }),
        );
        throw err;
      }

      const nextRetryCount = exec.retryCount + 1;
      const maxAttempts = AUTOMATION_EXECUTE_MAX_RETRIES + 1;
      const attemptsExhausted = nextRetryCount >= maxAttempts;
      await step.run("persist-retry-state", async () =>
        db.actionExecution.update({
          where: { id: exec.id },
          data: {
            retryCount: { increment: 1 },
            lastError: message.slice(0, 1900),
            ...(attemptsExhausted ? { status: "failed" } : {}),
          },
        }),
      );

      if (attemptsExhausted) {
        return {
          ok: false,
          executionId,
          state: "failed",
          dryRun: true,
          reason: "max_retries_exhausted",
        };
      }

      const delayMs = Math.min(30_000, 1000 * Math.pow(2, Math.max(0, nextRetryCount - 1)));
      await step.sleep(`retry-backoff-${nextRetryCount}`, `${delayMs}ms`);
      throw err;
    }
  },
);

export const automationDetectFollowUpsFunction = inngest.createFunction(
  {
    id: "automation-detect-followups",
    name: "Automation detector (follow-up candidates)",
    retries: 1,
  },
  { cron: CRON_AUTOMATION_DETECT_FOLLOWUPS },
  async ({ step }) => {
    const accounts = await step.run("pick-accounts", async () => {
      return db.account.findMany({
        where: {
          token: { not: "" },
          needsReconnection: false,
          automationMode: { in: ["assist", "auto"] },
        },
        select: { id: true },
        orderBy: [{ lastInboxSyncAt: "asc" }],
        take: 10,
      });
    });

    if (accounts.length === 0) {
      return { ok: true, scannedAccounts: 0, created: 0, duplicates: 0, enqueued: 0 };
    }

    const totals = await step.run("detect-and-create", async () => {
      let created = 0;
      let duplicates = 0;
      let enqueued = 0;
      let scannedAccounts = 0;
      for (const a of accounts) {
        scannedAccounts += 1;
        const res = await detectAndCreateFollowUpExecutionsForAccount(a.id);
        created += res.created;
        duplicates += res.duplicates;
        enqueued += res.enqueued;
      }
      return { scannedAccounts, created, duplicates, enqueued };
    });

    return { ok: true, ...totals };
  },
);

export const inngestFunctions = [
  emailAnalyzeFunction,
  scheduledSendProcessFunction,
  emailAnalyzeAccountFunction,
  mailSyncAccountFunction,
  mailSyncStaleAccountsFunction,
  automationExecuteFunction,
  automationDetectFollowUpsFunction,
];
