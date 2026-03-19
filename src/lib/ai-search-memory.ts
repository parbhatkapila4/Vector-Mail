import type { SearchSessionMemory, StoredEmail } from "./chat-session";

export function tryResolveLastSelectedEmail(
  query: string,
  storedEmails: StoredEmail[],
  memory: SearchSessionMemory | null,
): StoredEmail | null {
  if (!memory?.lastSelectedEmailId || storedEmails.length === 0) return null;

  const q = query.trim();
  if (q.length > 140) return null;

  const referenceCue =
    /\b(that|same|it|this|previous|last|again)\b/i.test(q) ||
    /\b(the|that)\s+one\b/i.test(q);

  if (!referenceCue) return null;

  return (
    storedEmails.find((e) => e.id === memory.lastSelectedEmailId) ?? null
  );
}
