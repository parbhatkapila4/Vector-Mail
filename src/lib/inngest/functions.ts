import { inngest } from "./client";
import { runEmailAnalysisForOne, runEmailAnalysisForMany } from "@/lib/jobs/run-email-analysis";
import { runScheduledSend } from "@/lib/jobs/run-scheduled-send";
import { backfillEmailAnalysis } from "@/lib/backfill-email-analysis";
import { recordFailedJob } from "@/lib/jobs/failed-job";

export const EMAIL_ANALYZE_EVENT = "email/analyze";

export const SCHEDULED_SEND_PROCESS_EVENT = "scheduled-send/process";

export const EMAIL_ANALYZE_ACCOUNT_EVENT = "email/analyze-account";

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

export const inngestFunctions = [
  emailAnalyzeFunction,
  scheduledSendProcessFunction,
  emailAnalyzeAccountFunction,
];
