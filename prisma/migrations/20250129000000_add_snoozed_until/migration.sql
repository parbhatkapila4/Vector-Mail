-- AlterTable
ALTER TABLE "Thread"
ADD COLUMN "snoozedUntil" TIMESTAMP(3);
-- CreateIndex
CREATE INDEX "Thread_snoozedUntil_idx" ON "Thread"("snoozedUntil");