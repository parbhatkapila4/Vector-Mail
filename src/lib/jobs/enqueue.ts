
import { inngest } from "@/lib/inngest/client";
import {
  EMAIL_ANALYZE_EVENT,
  SCHEDULED_SEND_PROCESS_EVENT,
  EMAIL_ANALYZE_ACCOUNT_EVENT,
} from "@/lib/inngest/functions";

export async function enqueueEmailAnalysisJobs(
  emailIds: string[],
): Promise<void> {
  if (emailIds.length === 0) return;
  try {
    if (emailIds.length === 1) {
      await inngest.send({
        name: EMAIL_ANALYZE_EVENT,
        data: { emailId: emailIds[0] },
      });
    } else {
      await inngest.send({
        name: EMAIL_ANALYZE_EVENT,
        data: { emailIds },
      });
    }
  } catch (err) {
    console.error("[enqueueEmailAnalysisJobs]", err);
  }
}

export async function enqueueScheduledSendJobs(
  scheduledSendIds: string[],
): Promise<void> {
  if (scheduledSendIds.length === 0) return;
  try {
    await Promise.all(
      scheduledSendIds.map((scheduledSendId) =>
        inngest.send({
          name: SCHEDULED_SEND_PROCESS_EVENT,
          data: { scheduledSendId },
        }),
      ),
    );
  } catch (err) {
    console.error("[enqueueScheduledSendJobs]", err);
    throw err;
  }
}

export async function enqueueBackfillEmbeddingJobs(
  emailIds: string[],
): Promise<number> {
  if (emailIds.length === 0) return 0;
  let enqueued = 0;
  try {
    for (const emailId of emailIds) {
      await inngest.send({
        name: EMAIL_ANALYZE_EVENT,
        data: { emailId },
        id: `backfill-embed-${emailId}`,
      });
      enqueued++;
    }
  } catch (err) {
    console.error("[enqueueBackfillEmbeddingJobs]", err);
    throw err;
  }
  return enqueued;
}

export async function enqueueEmbeddingJobsForAccount(
  accountId: string,
  limit: number = 50,
): Promise<void> {
  try {
    await inngest.send({
      name: EMAIL_ANALYZE_ACCOUNT_EVENT,
      data: { accountId, limit },
    });
  } catch (err) {
    console.error("[enqueueEmbeddingJobsForAccount]", err);
  }
}
