-- AlterTable
ALTER TABLE "Account"
ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;