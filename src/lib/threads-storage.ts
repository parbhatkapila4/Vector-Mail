const STORAGE_KEY_PREFIX = "vectormail-threads";

export type StoredThreadsPayload = {
  accountId: string;
  tab: string;
  important: boolean;
  unread: boolean;
  labelId: string | null;
  pages: Array<{ threads: unknown[]; nextCursor?: string }>;
  updatedAt: number;
};

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_AGE_INBOX_MS = 30 * 60 * 1000;

function cacheKey(accountId: string, tab: string, important: boolean, unread: boolean, labelId: string | null): string {
  return `${STORAGE_KEY_PREFIX}-${accountId}-${tab}-${String(important)}-${String(unread)}-${labelId ?? ""}`;
}

export function persistThreads(
  accountId: string,
  tab: string,
  important: boolean,
  unread: boolean,
  labelId: string | null,
  pages: Array<{ threads: unknown[]; nextCursor?: string }>,
): void {
  if (typeof window === "undefined") return;
  const hasThreads = pages.some((p) => p.threads.length > 0);
  if (!hasThreads) return;
  try {
    const key = cacheKey(accountId, tab, important, unread, labelId);
    const payload: StoredThreadsPayload = {
      accountId,
      tab,
      important,
      unread,
      labelId,
      pages,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.warn("[threads-storage] persist failed", e);
  }
}

export function getStoredThreads(
  accountId: string,
  tab: string,
  important: boolean,
  unread: boolean,
  labelId: string | null,
): StoredThreadsPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const key = cacheKey(accountId, tab, important, unread, labelId);
    const raw = window.localStorage.getItem(key);
    if (!raw || !raw.trim()) return null;
    const payload = JSON.parse(raw) as StoredThreadsPayload;
    const age = payload.updatedAt ? Date.now() - payload.updatedAt : Infinity;
    if (age > MAX_AGE_MS) return null;
    if (tab === "inbox" && age > MAX_AGE_INBOX_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
