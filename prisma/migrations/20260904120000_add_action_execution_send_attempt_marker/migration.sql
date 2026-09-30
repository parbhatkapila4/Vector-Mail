ALTER TABLE "ActionExecution"
ADD COLUMN "sendAttemptedAt" TIMESTAMP(3);
CREATE INDEX "ActionExecution_status_updatedAt_idx" ON "ActionExecution"("status", "updatedAt");