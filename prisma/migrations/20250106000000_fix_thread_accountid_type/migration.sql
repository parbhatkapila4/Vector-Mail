ALTER TABLE "Thread" DROP CONSTRAINT IF EXISTS "Thread_accountId_fkey";
DROP INDEX IF EXISTS "Thread_accountId_idx";
ALTER TABLE "Thread"
ADD COLUMN "accountId_new" TEXT;
UPDATE "Thread"
SET "accountId_new" = CAST("accountId" AS TEXT)
WHERE "accountId" IS NOT NULL;
ALTER TABLE "Thread" DROP COLUMN "accountId";
ALTER TABLE "Thread"
    RENAME COLUMN "accountId_new" TO "accountId";
ALTER TABLE "Thread"
ALTER COLUMN "accountId"
SET NOT NULL;
ALTER TABLE "Thread"
ADD CONSTRAINT "Thread_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Thread_accountId_idx" ON "Thread"("accountId");