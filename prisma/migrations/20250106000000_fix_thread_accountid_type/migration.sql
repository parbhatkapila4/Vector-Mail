-- AlterTable: Change Thread.accountId from INTEGER to TEXT to match Account.id (String)
-- This fixes type mismatch that prevents queries from returning results

-- Step 1: Drop foreign key constraint and index first
ALTER TABLE "Thread" DROP CONSTRAINT IF EXISTS "Thread_accountId_fkey";
DROP INDEX IF EXISTS "Thread_accountId_idx";

-- Step 2: Add temporary column with correct type
ALTER TABLE "Thread" ADD COLUMN "accountId_new" TEXT;

-- Step 3: Copy data from old column to new column (convert integer to string)
UPDATE "Thread" SET "accountId_new" = CAST("accountId" AS TEXT) WHERE "accountId" IS NOT NULL;

-- Step 4: Drop old column
ALTER TABLE "Thread" DROP COLUMN "accountId";

-- Step 5: Rename new column to original name
ALTER TABLE "Thread" RENAME COLUMN "accountId_new" TO "accountId";

-- Step 6: Set NOT NULL constraint
ALTER TABLE "Thread" ALTER COLUMN "accountId" SET NOT NULL;

-- Step 7: Re-add foreign key constraint
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Re-add index
CREATE INDEX "Thread_accountId_idx" ON "Thread"("accountId");

