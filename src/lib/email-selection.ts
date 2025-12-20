import type { StoredEmail } from "./chat-session";

export interface EmailMatch {
  email: StoredEmail;
  matchScore: number;
  matchReason: string;
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
    for (const email of emails) {
      const subjectLower = email.subject.toLowerCase();
      if (subjectLower.includes(keyword)) {
        const score =
          subjectLower === keyword
            ? 1.0
            : subjectLower.startsWith(keyword)
              ? 0.9
              : subjectLower.includes(keyword)
                ? 0.7
                : 0.5;
        matches.push({
          email,
          matchScore: score,
          matchReason: `Subject contains "${criteria.subjectKeyword}"`,
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

    const dateMatch = dateStr.match(
      /(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{2,4}))?/,
    );
    if (dateMatch && dateMatch[1] && dateMatch[2]) {
      const part1 = parseInt(dateMatch[1]);
      const part2 = parseInt(dateMatch[2]);
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : null;

      let day: number;
      let month: number;

      if (part1 > 12) {
        day = part1;
        month = part2 - 1;
      } else if (part2 > 12) {
        day = part2;
        month = part1 - 1;
      } else {
        day = part1;
        month = part2 - 1;
      }

      const currentYear = new Date().getFullYear();
      const targetYear = year ? (year < 100 ? 2000 + year : year) : currentYear;

      let targetDate = new Date(targetYear, month, day);

      if (isNaN(targetDate.getTime()) || (part1 <= 12 && part2 <= 12)) {
        targetDate = new Date(targetYear, part1 - 1, part2);
      }

      if (!isNaN(targetDate.getTime())) {
        const targetYearFinal = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();
        const targetDay = targetDate.getDate();

        for (const email of emails) {
          const emailDate = new Date(email.date);
          const emailYear = emailDate.getFullYear();
          const emailMonth = emailDate.getMonth();
          const emailDay = emailDate.getDate();

          const yearMatches = year === null || emailYear === targetYearFinal;
          const monthMatches = emailMonth === targetMonth;
          const dayMatches = emailDay === targetDay;

          if (yearMatches && monthMatches && dayMatches) {
            matches.push({
              email,
              matchScore: 1.0,
              matchReason: `Date matches ${dateStr}`,
            });
          } else if (!year && monthMatches && dayMatches) {
            matches.push({
              email,
              matchScore: 0.9,
              matchReason: `Date matches ${dateStr} (month and day)`,
            });
          }
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
