import { db } from "@/server/db";
import { serverLog } from "@/lib/logging/server-logger";

export type AiUsageOperation =
  | "chat"
  | "compose"
  | "summary"
  | "embedding"
  | "buddy";

export interface RecordUsageParams {
  userId: string;
  accountId?: string | null;
  operation: AiUsageOperation;
  inputTokens: number;
  outputTokens: number;
  model?: string | null;
}

export function recordUsage(params: RecordUsageParams): void {
  const { userId, accountId, operation, inputTokens, outputTokens, model } =
    params;

  void db.aiUsage
    .create({
      data: {
        userId,
        accountId: accountId ?? undefined,
        operation,
        inputTokens,
        outputTokens,
        model: model ?? undefined,
      },
    })
    .catch((err: unknown) => {
      serverLog.warn(
        { err: err instanceof Error ? err.message : String(err), userId, operation },
        "ai-usage: record failed",
      );
    });
}
