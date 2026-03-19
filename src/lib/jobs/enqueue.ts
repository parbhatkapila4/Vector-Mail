import { inngest } from "@/lib/inngest/client";
import {
  EMAIL_ANALYZE_EVENT,
  SCHEDULED_SEND_PROCESS_EVENT,
  EMAIL_ANALYZE_ACCOUNT_EVENT,
  MAIL_SYNC_ACCOUNT_EVENT,
} from "@/lib/inngest/functions";

function canSendToInngest(): boolean {
  return Boolean(process.env.INNGEST_EVENT_KEY?.trim());
}

export async function enqueueEmailAnalysisJobs(
  emailIds: string[],
): Promise<void> {
  if (emailIds.length === 0) return;
  if (!canSendToInngest()) return;
  try {
 
    await Promise.all(
      emailIds.map((emailId) =>
        inngest.send({
          name: EMAIL_ANALYZE_EVENT,
          data: { emailId },
          id: `email-analyze-${emailId}`,
        }),
      ),
    );
  } catch (err) {
    console.error("[enqueueEmailAnalysisJobs]", err);
  }
}

export async function enqueueScheduledSendJobs(
  scheduledSendIds: string[],
): Promise<number> {
  if (scheduledSendIds.length === 0) return 0;
  if (!canSendToInngest()) return 0;
  try {
    await Promise.all(
      scheduledSendIds.map((scheduledSendId) =>
        inngest.send({
          name: SCHEDULED_SEND_PROCESS_EVENT,
          data: { scheduledSendId },
        }),
      ),
    );
    return scheduledSendIds.length;
  } catch (err) {
    console.error("[enqueueScheduledSendJobs]", err);
    throw err;
  }
}

export async function enqueueBackfillEmbeddingJobs(
  emailIds: string[],
): Promise<number> {
  if (emailIds.length === 0) return 0;
  if (!canSendToInngest()) return 0;
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
  if (!canSendToInngest()) return;
  try {
    await inngest.send({
      name: EMAIL_ANALYZE_ACCOUNT_EVENT,
      data: { accountId, limit },
    });
  } catch (err) {
    console.error("[enqueueEmbeddingJobsForAccount]", err);
  }
}


export async function enqueueAccountMailSync(
  accountId: string,
  userId: string,
): Promise<boolean> {
  if (!canSendToInngest()) return false;
  try {
    await inngest.send({
      name: MAIL_SYNC_ACCOUNT_EVENT,
      data: { accountId, userId },
    });
    return true;
  } catch (err) {
    console.error("[enqueueAccountMailSync]", err);
    return false;
  }
}
