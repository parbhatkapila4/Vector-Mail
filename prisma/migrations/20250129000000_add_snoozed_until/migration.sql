ALTER TABLE "Thread"
ADD COLUMN "snoozedUntil" TIMESTAMP(3);
CREATE INDEX "Thread_snoozedUntil_idx" ON "Thread"("snoozedUntil");