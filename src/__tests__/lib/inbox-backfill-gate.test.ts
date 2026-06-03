/**
 * Regression guard for the inbox-backfill gap bug.
 *
 * The bug: backfill completion was inferred from the presence of a delta token
 * (`Account.nextDeltaToken`). A delta token is set the moment incremental sync
 * becomes possible — long before the full history has been walked — so any
 * account that obtained a token early was permanently locked out of backfill,
 * leaving a gap (newest days present, months silently missing).
 *
 * The fix: completion is tracked by `Account.inboxBackfilledAt`. A delta token
 * must NEVER stop the history walk. If anyone re-couples the two, these tests
 * fail. See src/lib/mail-sync-inbox-step.ts and the inbox path in
 * src/server/api/routers/account-procedures/sync.ts.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Self-contained mock factories (no outer references) to avoid Jest's
// hoisting TDZ; handles are retrieved after the imports below.
jest.mock("@/server/db", () => ({
  db: {
    account: { findFirst: jest.fn(), update: jest.fn() },
    thread: { count: jest.fn(), findFirst: jest.fn() },
  },
}));
jest.mock("@/lib/accounts", () => {
  const instance = {
    fetchInboxPageViaList: jest.fn(),
    establishInboxDeltaToken: jest.fn(),
    syncLatestEmails: jest.fn(),
    getNextPageViaSyncApi: jest.fn(),
  };
  return { Account: jest.fn(() => instance), __getInstance: () => instance };
});
jest.mock("@/lib/sync-to-db", () => ({
  syncEmailsToDatabase: jest.fn().mockResolvedValue(undefined),
  recalculateAllThreadStatuses: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/lib/logging/server-logger", () => ({
  serverLog: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { runInboxSyncOneStep } from "@/lib/mail-sync-inbox-step";
import { db } from "@/server/db";
import * as accountsMod from "@/lib/accounts";

const mockDb = db as unknown as {
  account: { findFirst: jest.Mock; update: jest.Mock };
  thread: { count: jest.Mock; findFirst: jest.Mock };
};
const mockAccountInstance = (
  accountsMod as unknown as {
    __getInstance: () => {
      fetchInboxPageViaList: jest.Mock;
      establishInboxDeltaToken: jest.Mock;
      syncLatestEmails: jest.Mock;
      getNextPageViaSyncApi: jest.Mock;
    };
  }
).__getInstance();

const ACCOUNT_BASE = {
  id: "acc1",
  token: "tok",
  needsReconnection: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.account.update.mockResolvedValue({});
  mockDb.thread.count.mockResolvedValue(100);
  // Recent latest-inbox date → inbox is NOT stale.
  mockDb.thread.findFirst.mockResolvedValue({ lastMessageDate: new Date() });
  mockAccountInstance.establishInboxDeltaToken.mockResolvedValue(undefined);
});

describe("inbox backfill gate (worker step behavior)", () => {
  it("keeps walking history when a delta token exists but inboxBackfilledAt is null", async () => {
    // The exact poisoned state that used to freeze the inbox forever.
    mockDb.account.findFirst.mockResolvedValue({
      ...ACCOUNT_BASE,
      nextDeltaToken: "delta-token-set-early",
      inboxBackfilledAt: null,
    });
    mockAccountInstance.fetchInboxPageViaList.mockResolvedValue({
      emails: [],
      nextPageToken: "page-2",
      listed: 50,
      fetched: 0,
    });

    const res = await runInboxSyncOneStep("acc1");

    // A delta token must NOT stop the backfill walk.
    expect(res.hasMore).toBe(true);
    expect(res.continueToken).toBeTruthy();
    // It must take the list-walk path, never the delta short-circuit.
    expect(mockAccountInstance.syncLatestEmails).not.toHaveBeenCalled();
    expect(mockAccountInstance.fetchInboxPageViaList).toHaveBeenCalled();
  });

  it("switches to incremental delta sync only once inboxBackfilledAt is set", async () => {
    mockDb.account.findFirst.mockResolvedValue({
      ...ACCOUNT_BASE,
      nextDeltaToken: "delta-token",
      inboxBackfilledAt: new Date(),
    });
    mockAccountInstance.syncLatestEmails.mockResolvedValue({
      success: true,
      authError: false,
      count: 0,
    });

    const res = await runInboxSyncOneStep("acc1");

    expect(res.mode).toBe("delta");
    expect(res.hasMore).toBe(false);
    expect(mockAccountInstance.fetchInboxPageViaList).not.toHaveBeenCalled();
  });

  it("stamps inboxBackfilledAt only when the walk reaches the oldest message", async () => {
    mockDb.account.findFirst.mockResolvedValue({
      ...ACCOUNT_BASE,
      nextDeltaToken: "delta-token",
      inboxBackfilledAt: null,
    });
    mockAccountInstance.fetchInboxPageViaList.mockResolvedValue({
      emails: [],
      nextPageToken: undefined, // no more pages → true bottom of history
      listed: 0,
      fetched: 0,
    });

    const res = await runInboxSyncOneStep("acc1");

    expect(res.hasMore).toBe(false);
    const stamped = mockDb.account.update.mock.calls.some(
      ([arg]: [{ data?: { inboxBackfilledAt?: unknown } }]) =>
        arg?.data?.inboxBackfilledAt instanceof Date,
    );
    expect(stamped).toBe(true);
  });
});

describe("inbox backfill gate (source invariants)", () => {
  const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");
  const stripComments = (src: string) =>
    src
      .split("\n")
      .filter((l) => {
        const t = l.trimStart();
        return !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
      })
      .join("\n");

  it("worker step gates completion on inboxBackfilledAt, not the delta token", () => {
    const src = stripComments(read("src/lib/mail-sync-inbox-step.ts"));
    expect(src).toMatch(/backfillComplete\s*=\s*!!accountRow\.inboxBackfilledAt/);
    expect(src).not.toMatch(/backfillComplete\s*=\s*!!accountRow\.nextDeltaToken/);
  });

  it("tRPC inbox first page gates on inboxBackfilledAt and only delegates once backfilled", () => {
    const src = stripComments(
      read("src/server/api/routers/account-procedures/sync.ts"),
    );
    // First-page hasMore must key off the backfill flag.
    expect(src).toMatch(/!account\.inboxBackfilledAt/);
    // Background-worker delegation must require a completed backfill, so an
    // incomplete inbox is driven inline (the worker returns no continueToken).
    expect(src).toMatch(/!!account\.inboxBackfilledAt/);
  });
});
