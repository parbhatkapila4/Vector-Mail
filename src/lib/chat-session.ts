export interface StoredEmail {
  id: string;
  subject: string;
  from: {
    name: string | null;
    address: string;
  };
  date: Date;
  snippet: string;
  body: string;
}

interface SessionData {
  emails: StoredEmail[];
  lastSearchQuery?: string;
  timestamp: number;
}

const sessionStore = new Map<string, Map<string, SessionData>>();

const SESSION_TTL = 30 * 60 * 1000;

export function storeSearchResults(
  userId: string,
  accountId: string,
  emails: Array<{
    id: string;
    subject: string;
    from: { name: string | null; address: string };
    sentAt: Date;
    bodySnippet?: string | null;
    body?: string | null;
  }>,
  searchQuery?: string,
): void {
  if (!sessionStore.has(userId)) {
    sessionStore.set(userId, new Map());
  }

  const userSessions = sessionStore.get(userId)!;

  const storedEmails: StoredEmail[] = emails.map((email) => ({
    id: email.id,
    subject: email.subject || "",
    from: email.from,
    date: email.sentAt,
    snippet: email.bodySnippet || email.body?.substring(0, 200) || "",
    body: (email.body || email.bodySnippet || "").substring(0, 5000),
  }));

  userSessions.set(accountId, {
    emails: storedEmails,
    lastSearchQuery: searchQuery,
    timestamp: Date.now(),
  });

  cleanupExpiredSessions();
}

export function getStoredEmails(
  userId: string,
  accountId: string,
): StoredEmail[] | null {
  const userSessions = sessionStore.get(userId);
  if (!userSessions) return null;

  const session = userSessions.get(accountId);
  if (!session) return null;

  if (Date.now() - session.timestamp > SESSION_TTL) {
    userSessions.delete(accountId);
    return null;
  }

  return session.emails;
}

export function clearSession(userId: string, accountId: string): void {
  const userSessions = sessionStore.get(userId);
  if (userSessions) {
    userSessions.delete(accountId);
  }
}

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [userId, userSessions] of sessionStore.entries()) {
    for (const [accountId, session] of userSessions.entries()) {
      if (now - session.timestamp > SESSION_TTL) {
        userSessions.delete(accountId);
      }
    }
    if (userSessions.size === 0) {
      sessionStore.delete(userId);
    }
  }
}
