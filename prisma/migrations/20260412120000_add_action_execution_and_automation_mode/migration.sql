-- CreateEnum
CREATE TYPE "AutomationMode" AS ENUM ('manual', 'assist', 'auto');
-- CreateEnum
CREATE TYPE "ActionExecutionStatus" AS ENUM (
    'pending',
    'awaiting_approval',
    'running',
    'success',
    'failed',
    'cancelled'
);
-- AlterTable
ALTER TABLE "Account"
ADD COLUMN "automationMode" "AutomationMode" NOT NULL DEFAULT 'manual';
-- CreateTable
CREATE TABLE "ActionExecution" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "threadId" TEXT,
    "type" TEXT NOT NULL,
    "status" "ActionExecutionStatus" NOT NULL DEFAULT 'pending',
    "modeSnapshot" "AutomationMode" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "reason" TEXT,
    "payload" JSONB NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "dryRun" BOOLEAN NOT NULL DEFAULT true,
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ActionExecution_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "ActionExecution_idempotencyKey_key" ON "ActionExecution"("idempotencyKey");
-- CreateIndex
CREATE INDEX "ActionExecution_accountId_createdAt_idx" ON "ActionExecution"("accountId", "createdAt");
-- CreateIndex
CREATE INDEX "ActionExecution_threadId_idx" ON "ActionExecution"("threadId");
-- AddForeignKey
ALTER TABLE "ActionExecution"
ADD CONSTRAINT "ActionExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActionExecution"
ADD CONSTRAINT "ActionExecution_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActionExecution"
ADD CONSTRAINT "ActionExecution_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE
SET NULL ON UPDATE CASCADE;