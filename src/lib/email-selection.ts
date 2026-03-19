import type { StoredEmail } from "./chat-session";

export interface EmailMatch {
  email: StoredEmail;
  matchScore: number;
  matchReason: string;
}

const MONTH_MAP: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

function parseDatePattern(datePattern: string): { day: number; month: number; year?: number } | null {
  const text = datePattern.trim().toLowerCase();

  const numericMatch = text.match(/(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{2,4}))?/);
  if (numericMatch && numericMatch[1] && numericMatch[2]) {
    const part1 = parseInt(numericMatch[1]);
    const part2 = parseInt(numericMatch[2]);
    const yearRaw = numericMatch[3] ? parseInt(numericMatch[3]) : undefined;
    const year = yearRaw ? (yearRaw < 100 ? 2000 + yearRaw : yearRaw) : undefined;

    const day = part1 > 12 ? part1 : part2 > 12 ? part2 : part1;
    const month = part1 > 12 ? part2 - 1 : part2 > 12 ? part1 - 1 : part2 - 1;
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return { day, month, year };
    }
  }

  const monthDayMatch = text.match(
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{2,4}))?\b/i,
  );
  if (monthDayMatch && monthDayMatch[1] && monthDayMatch[2]) {
    const month = MONTH_MAP[monthDayMatch[1].toLowerCase()];
    const day = parseInt(monthDayMatch[2]);
    const yearRaw = monthDayMatch[3] ? parseInt(monthDayMatch[3]) : undefined;
    const year = yearRaw ? (yearRaw < 100 ? 2000 + yearRaw : yearRaw) : undefined;
    if (month !== undefined && day >= 1 && day <= 31) {
      return { day, month, year };
    }
  }

  const dayMonthMatch = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)(?:,?\s*(\d{2,4}))?\b/i,
  );
  if (dayMonthMatch && dayMonthMatch[1] && dayMonthMatch[2]) {
    const day = parseInt(dayMonthMatch[1]);
    const month = MONTH_MAP[dayMonthMatch[2].toLowerCase()];
    const yearRaw = dayMonthMatch[3] ? parseInt(dayMonthMatch[3]) : undefined;
    const year = yearRaw ? (yearRaw < 100 ? 2000 + yearRaw : yearRaw) : undefined;
    if (month !== undefined && day >= 1 && day <= 31) {
      return { day, month, year };
    }
  }

  return null;
}

function extractMeaningfulTokens(text: string): string[] {
  const stopWords = new Set([
    "the", "this", "that", "one", "email", "mail", "message", "about", "from",
    "on", "dated", "regarding", "tell", "me", "what", "is", "was", "it", "a",
    "an", "to", "of", "and", "for", "please",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stopWords.has(t));
}

export function selectEmails(
  emails: StoredEmail[],
  criteria: {
    position?: number;
    subjectKeyword?: string;
    senderKeyword?: string;
    datePattern?: string;
  },
): EmailMatch[] {
  if (emails.length === 0) return [];

  if (criteria.position !== undefined) {
    const email = emails[criteria.position];
    if (email) {
      return [
        {
          email,
          matchScore: 1.0,
          matchReason: `Position ${criteria.position + 1}`,
        },
      ];
    }
  }

  const matches: EmailMatch[] = [];

  if (criteria.subjectKeyword) {
    const keyword = criteria.subjectKeyword.toLowerCase();
    const keywordTokens = extractMeaningfulTokens(keyword);
    for (const email of emails) {
      const subjectLower = email.subject.toLowerCase();
      const snippetLower = (email.snippet || "").toLowerCase();
      const bodyLower = (email.body || "").toLowerCase();
      const hasDirectMatch = subjectLower.includes(keyword);
      const tokenMatches = keywordTokens.filter(
        (token) =>
          subjectLower.includes(token) ||
          snippetLower.includes(token) ||
          bodyLower.includes(token),
      );

      if (hasDirectMatch || tokenMatches.length > 0) {
        const score = hasDirectMatch && subjectLower === keyword
          ? 1.0
          : hasDirectMatch && subjectLower.startsWith(keyword)
            ? 0.9
            : hasDirectMatch && subjectLower.includes(keyword)
              ? 0.7
              : Math.min(0.85, 0.5 + tokenMatches.length * 0.12);
        matches.push({
          email,
          matchScore: score,
          matchReason: hasDirectMatch
            ? `Subject contains "${criteria.subjectKeyword}"`
            : `Subject/content token match: ${tokenMatches.join(", ")}`,
        });
      }
    }
  }

  if (criteria.senderKeyword) {
    const keyword = criteria.senderKeyword.toLowerCase();
    for (const email of emails) {
      const fromName = (email.from.name || "").toLowerCase();
      const fromAddress = email.from.address.toLowerCase();

      if (fromName.includes(keyword) || fromAddress.includes(keyword)) {
        const score =
          fromAddress === keyword
            ? 1.0
            : fromName.includes(keyword)
              ? 0.9
              : fromAddress.includes(keyword)
                ? 0.8
                : 0.6;
        matches.push({
          email,
          matchScore: score,
          matchReason: `From "${email.from.name || email.from.address}"`,
        });
      }
    }
  }

  if (criteria.datePattern) {
    const dateStr = criteria.datePattern;
    const parsed = parseDatePattern(dateStr);
    if (parsed) {
      const { day: targetDay, month: targetMonth, year: targetYear } = parsed;
      for (const email of emails) {
        const emailDate = new Date(email.date);
        const emailYear = emailDate.getFullYear();
        const emailMonth = emailDate.getMonth();
        const emailDay = emailDate.getDate();

        const yearMatches = targetYear === undefined || emailYear === targetYear;
        const monthMatches = emailMonth === targetMonth;
        const dayMatches = emailDay === targetDay;

        if (yearMatches && monthMatches && dayMatches) {
          matches.push({
            email,
            matchScore: targetYear === undefined ? 0.95 : 1.0,
            matchReason: `Date matches ${dateStr}`,
          });
        }
      }
    }
  }

  if (matches.length === 0 && emails.length > 0) {
    const firstEmail = emails[0];
    if (firstEmail) {
      return [
        {
          email: firstEmail,
          matchScore: 0.5,
          matchReason: "First result (default)",
        },
      ];
    }
  }

  const uniqueMatches = new Map<string, EmailMatch>();
  for (const match of matches) {
    const existing = uniqueMatches.get(match.email.id);
    if (!existing || match.matchScore > existing.matchScore) {
      uniqueMatches.set(match.email.id, match);
    }
  }

  return Array.from(uniqueMatches.values()).sort(
    (a, b) => b.matchScore - a.matchScore,
  );
}


export function pickMatchesForFollowUp(matches: EmailMatch[]): EmailMatch[] {
  if (matches.length <= 1) return matches;
  const sorted = [...matches].sort((a, b) => b.matchScore - a.matchScore);
  const first = sorted[0];
  const second = sorted[1];
  if (!first) return [];
  if (!second) return [first];
  if (first.matchScore >= 0.92 || first.matchScore - second.matchScore >= 0.15) {
    return [first];
  }
  return sorted.slice(0, 3);
}

export function formatEmailOptionsWithReasons(matches: EmailMatch[]): string {
  if (matches.length === 0) return "";
  return matches
    .slice(0, 5)
    .map((m, index) => {
      const dateStr = new Date(m.email.date).toLocaleDateString();
      const fromStr = m.email.from.name || m.email.from.address;
      return `${index + 1}. "${m.email.subject}" from ${fromStr} (${dateStr}) — ${m.matchReason}`;
    })
    .join("\n");
}

export function formatEmailOptions(emails: StoredEmail[]): string {
  if (emails.length === 0) return "";

  return emails
    .slice(0, 5)
    .map((email, index) => {
      const dateStr = new Date(email.date).toLocaleDateString();
      const fromStr = email.from.name || email.from.address;
      return `${index + 1}. "${email.subject}" from ${fromStr} (${dateStr})`;
    })
    .join("\n");
}
