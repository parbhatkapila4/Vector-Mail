import { mergeThreadsStable } from "../../lib/thread-merge";

type TestThread = {
  id: string;
  lastMessageDate: Date;
  emails: Array<{ sentAt?: Date; receivedAt?: Date }>;
};

function makeThread(id: string, iso: string): TestThread {
  const date = new Date(iso);
  return {
    id,
    lastMessageDate: date,
    emails: [{ sentAt: date }],
  };
}

describe("thread merge", () => {
  it("keeps previously fetched threads when incoming payload is partial", () => {
    const existing = [
      makeThread("thread-new", "2026-04-22T08:00:00.000Z"),
      makeThread("thread-older", "2026-04-20T08:00:00.000Z"),
    ];
    const incoming = [makeThread("thread-new", "2026-04-22T08:00:00.000Z")];

    const merged = mergeThreadsStable(incoming, existing);

    expect(merged.map((t) => t.id)).toEqual(["thread-new", "thread-older"]);
  });

  it("uses latest incoming version for same thread id", () => {
    const existing = [makeThread("thread-1", "2026-04-20T08:00:00.000Z")];
    const incoming = [makeThread("thread-1", "2026-04-22T08:00:00.000Z")];

    const merged = mergeThreadsStable(incoming, existing);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe("thread-1");
    expect(merged[0]?.lastMessageDate.toISOString()).toBe(
      "2026-04-22T08:00:00.000Z",
    );
  });

  it("sorts newest-first after merge", () => {
    const existing = [makeThread("thread-oldest", "2026-04-18T08:00:00.000Z")];
    const incoming = [
      makeThread("thread-middle", "2026-04-21T08:00:00.000Z"),
      makeThread("thread-newest", "2026-04-22T09:00:00.000Z"),
    ];

    const merged = mergeThreadsStable(incoming, existing);

    expect(merged.map((t) => t.id)).toEqual([
      "thread-newest",
      "thread-middle",
      "thread-oldest",
    ]);
  });
});

