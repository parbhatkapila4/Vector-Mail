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
const MAX_PAYLOAD_CHARS = 800 * 1024;
const MAX_THREADS_TOTAL = 50;

function cacheKey(accountId: string, tab: string, important: boolean, unread: boolean, labelId: string | null): string {
  return `${STORAGE_KEY_PREFIX}-${accountId}-${tab}-${String(important)}-${String(unread)}-${labelId ?? ""}`;
}

function safeSetItem(key: string, payload: StoredThreadsPayload): boolean {
  const str = JSON.stringify(payload);
  if (str.length > MAX_PAYLOAD_CHARS) return false;
  try {
    window.localStorage.setItem(key, str);
    return true;
  } catch {
    return false;
  }
}

export function persistThreads(
  accountId: string,
  tab: string,
  important: boolean,
  unread: boolean,
  labelId: string | null,
  pages: Array<{ threads: unknown[]; nextCursor?: string }>,
): void {
  try {
    if (typeof window === "undefined") return;
    const hasThreads = pages.some((p) => p.threads.length > 0);
    if (!hasThreads) return;

    const key = cacheKey(accountId, tab, important, unread, labelId);
    const base: Omit<StoredThreadsPayload, "pages"> = {
      accountId,
      tab,
      important,
      unread,
      labelId,
      updatedAt: Date.now(),
    };

    const allThreads = pages.flatMap((p) => p.threads).slice(0, MAX_THREADS_TOTAL);
    if (allThreads.length === 0) return;

    const firstPageNextCursor = pages[0]?.nextCursor;
    const pagesToTry: Array<{ threads: unknown[]; nextCursor?: string }>[] = [
      [{ threads: allThreads, nextCursor: firstPageNextCursor }],
      [{ threads: allThreads.slice(0, Math.ceil(allThreads.length / 2)), nextCursor: firstPageNextCursor }],
      [{ threads: allThreads.slice(0, 25), nextCursor: firstPageNextCursor }],
    ];

    for (const p of pagesToTry) {
      const payload: StoredThreadsPayload = { ...base, pages: p };
      if (safeSetItem(key, payload)) return;
    }

    try {
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const k = window.localStorage.key(i);
        if (k?.startsWith(STORAGE_KEY_PREFIX) && k !== key) {
          window.localStorage.removeItem(k);
        }
      }
      const minimal = { ...base, pages: [{ threads: allThreads.slice(0, 5), nextCursor: firstPageNextCursor }] };
      if (safeSetItem(key, minimal)) return;
    } catch {
    }
  } catch {
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
