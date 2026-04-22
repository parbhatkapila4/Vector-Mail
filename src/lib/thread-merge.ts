export type ThreadLike = {
  id: string;
  lastMessageDate?: Date | string | null;
  emails?: Array<{
    sentAt?: Date | string | null;
    receivedAt?: Date | string | null;
  }>;
};

export function getThreadTimestamp(thread: ThreadLike): number {
  const byThreadDate = new Date(thread.lastMessageDate ?? 0).getTime();
  const latestEmail = thread.emails?.[0];
  const byEmailDate = new Date(
    latestEmail?.sentAt ?? latestEmail?.receivedAt ?? 0,
  ).getTime();
  return Math.max(
    Number.isFinite(byThreadDate) ? byThreadDate : 0,
    Number.isFinite(byEmailDate) ? byEmailDate : 0,
  );
}

export function mergeThreadsStable<T extends ThreadLike>(
  incoming: T[],
  existing: T[],
): T[] {
  const byId = new Map<string, T>();
  for (const thread of existing) {
    byId.set(thread.id, thread);
  }
  for (const thread of incoming) {
    byId.set(thread.id, thread);
  }
  return Array.from(byId.values()).sort((a, b) => {
    const timeDiff = getThreadTimestamp(b) - getThreadTimestamp(a);
    if (timeDiff !== 0) return timeDiff;
    return b.id.localeCompare(a.id);
  });
}

