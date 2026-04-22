CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ThreadLabel" (
    "threadId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    CONSTRAINT "ThreadLabel_pkey" PRIMARY KEY ("threadId", "labelId")
);
CREATE TABLE "FilterRule" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT,
    "conditionType" TEXT NOT NULL,
    "conditionValue" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FilterRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Label_accountId_name_key" ON "Label"("accountId", "name");
CREATE INDEX "Label_accountId_idx" ON "Label"("accountId");
CREATE INDEX "ThreadLabel_labelId_idx" ON "ThreadLabel"("labelId");
CREATE INDEX "FilterRule_accountId_idx" ON "FilterRule"("accountId");
CREATE INDEX "FilterRule_labelId_idx" ON "FilterRule"("labelId");
ALTER TABLE "Label"
ADD CONSTRAINT "Label_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ThreadLabel"
ADD CONSTRAINT "ThreadLabel_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ThreadLabel"
ADD CONSTRAINT "ThreadLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FilterRule"
ADD CONSTRAINT "FilterRule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FilterRule"
ADD CONSTRAINT "FilterRule_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;