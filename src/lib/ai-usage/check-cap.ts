import { db } from "@/server/db";

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function checkDailyCap(
  userId: string,
  cap: number | undefined,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (cap == null || cap <= 0) {
    return { allowed: true, used: 0, limit: 0 };
  }

  const start = startOfTodayUtc();

  const result = await db.aiUsage.aggregate({
    where: {
      userId,
      createdAt: { gte: start },
    },
    _sum: {
      inputTokens: true,
      outputTokens: true,
    },
  });

  const inputSum = result._sum.inputTokens ?? 0;
  const outputSum = result._sum.outputTokens ?? 0;
  const used = inputSum + outputSum;
  const allowed = used < cap;

  return { allowed, used, limit: cap };
}
