import { db } from "@/server/db";
import { serverLog } from "@/lib/logging/server-logger";

export interface AuditLogParams {
  userId: string;
  action: string;
  resourceId?: string;
  metadata?: object;
}

export function log(params: AuditLogParams): void {
  const { userId, action, resourceId, metadata } = params;
  db.auditLog
    .create({
      data: {
        userId,
        action,
        resourceId: resourceId ?? null,
        ...(metadata != null && { metadata: metadata as object }),
      },
    })
    .catch((err) => {
      serverLog.error(
        { err: err instanceof Error ? err.message : String(err), action, userId },
        "audit: log persist failed",
      );
    });
}
