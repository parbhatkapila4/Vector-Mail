-- AlterTable
ALTER TABLE "Thread"
ADD COLUMN "remindAt" TIMESTAMP(3);
-- AlterTable
ALTER TABLE "Thread"
ADD COLUMN "remindIfNoReplySince" TIMESTAMP(3);
-- CreateIndex
CREATE INDEX "Thread_remindAt_idx" ON "Thread"("remindAt");