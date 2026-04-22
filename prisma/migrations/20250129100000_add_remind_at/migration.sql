ALTER TABLE "Thread"
ADD COLUMN "remindAt" TIMESTAMP(3);
ALTER TABLE "Thread"
ADD COLUMN "remindIfNoReplySince" TIMESTAMP(3);
CREATE INDEX "Thread_remindAt_idx" ON "Thread"("remindAt");