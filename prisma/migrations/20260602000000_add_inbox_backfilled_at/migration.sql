-- Backfill-completion marker, intentionally decoupled from nextDeltaToken.
-- nextDeltaToken means "incremental sync is possible"; it does NOT mean
-- "all history has been downloaded". Conflating the two left accounts whose
-- delta token was set early (legacy Sync API, early establishInboxDeltaToken,
-- or a capped/interrupted walk) permanently unable to backfill the gap.
--
-- This column defaults to NULL for every existing row, which makes each
-- already-synced (and possibly gap-poisoned) account re-walk its inbox list
-- exactly once and fill the gap, then stamp this field at the true bottom.
ALTER TABLE "Account"
ADD COLUMN IF NOT EXISTS "inboxBackfilledAt" TIMESTAMP(3);
