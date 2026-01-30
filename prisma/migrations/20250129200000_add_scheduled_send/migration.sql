-- CreateTable
CREATE TABLE "ScheduledSend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "payload" JSONB NOT NULL,
    CONSTRAINT "ScheduledSend_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "ScheduledSend_scheduledAt_status_idx" ON "ScheduledSend"("scheduledAt", "status");
-- CreateIndex
CREATE INDEX "ScheduledSend_accountId_idx" ON "ScheduledSend"("accountId");
-- AddForeignKey
ALTER TABLE "ScheduledSend"
ADD CONSTRAINT "ScheduledSend_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;