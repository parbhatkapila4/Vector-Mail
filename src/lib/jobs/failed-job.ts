import { db } from "@/server/db";

export interface RecordFailedJobParams {
  jobType: string;
  resourceId: string;
  payload?: object;
  errorMessage?: string;
}

export async function recordFailedJob(params: RecordFailedJobParams): Promise<void> {
  const { jobType, resourceId, payload, errorMessage } = params;
  const payloadJson = payload != null ? (payload as object) : undefined;

  await db.failedJob.upsert({
    where: {
      jobType_resourceId: { jobType, resourceId },
    },
    create: {
      jobType,
      resourceId,
      payload: payloadJson,
      errorMessage: errorMessage ?? null,
    },
    update: {
      payload: payloadJson,
      errorMessage: errorMessage ?? undefined,
      updatedAt: new Date(),
    },
  });
}

export interface GetFailedJobCountOptions {
  since?: Date;
}

export async function getFailedJobCount(
  options?: GetFailedJobCountOptions,
): Promise<number> {
  const where =
    options?.since != null
      ? { createdAt: { gte: options.since } }
      : undefined;
  return db.failedJob.count({ where });
}
