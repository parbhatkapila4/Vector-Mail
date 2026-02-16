import { db } from "@/server/db";

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
      console.error("[audit] log failed:", err);
    });
}
