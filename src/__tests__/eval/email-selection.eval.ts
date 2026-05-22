import {
  pickMatchesForFollowUp,
  selectEmails,
} from "../../lib/email-selection";
import type { StoredEmail } from "../../lib/chat-session";

const mk = (
  id: string,
  subject: string,
  date: string,
  snippet: string,
  fromName = "Test",
  fromAddress = "t@test.com",
): StoredEmail => ({
  id,
  subject,
  from: { name: fromName, address: fromAddress },
  date: new Date(date),
  snippet,
  body: snippet,
});

describe("email-selection: subject keyword", () => {
  const emails: StoredEmail[] = [
    mk("a", "Q3 board deck draft", "2026-04-01", "first cut of the deck"),
    mk("b", "Q3 board prep notes", "2026-03-28", "logistics for q3 board"),
    mk("c", "Newsletter: weekly digest", "2026-04-02", "this week"),
  ];

  it("matches 'q3 board' to both relevant threads", () => {
    const matches = selectEmails(emails, { subjectKeyword: "q3 board" });
    expect(matches.length).toBeGreaterThanOrEqual(2);
    const ids = matches.map((m) => m.email.id);
    expect(ids).toContain("a");
    expect(ids).toContain("b");
  });

  it("is case-insensitive", () => {
    const lower = selectEmails(emails, { subjectKeyword: "Q3 BOARD" });
    expect(lower.length).toBeGreaterThanOrEqual(2);
  });

  it("falls back to a default-result when no subject matches", () => {
    const matches = selectEmails(emails, { subjectKeyword: "nonexistent topic xyz" });
    expect(matches.length).toBe(1);
    expect(matches[0]?.matchReason).toMatch(/default|first/i);
  });
});

describe("email-selection: sender keyword", () => {
  const emails: StoredEmail[] = [
    mk("a", "Investor update", "2026-04-01", "monthly", "Sequoia LP", "lp@sequoia.com"),
    mk("b", "Welcome to the team", "2026-03-28", "onboarding", "HR", "hr@company.com"),
    mk("c", "Your invoice", "2026-04-02", "due", "Stripe", "billing@stripe.com"),
  ];

  it("matches sender by domain fragment", () => {
    const matches = selectEmails(emails, { senderKeyword: "sequoia" });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.email.id).toBe("a");
  });

  it("matches sender by name fragment", () => {
    const matches = selectEmails(emails, { senderKeyword: "stripe" });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.email.id).toBe("c");
  });
});

describe("email-selection: date filtering", () => {
  const emails: StoredEmail[] = [
    mk("a", "UPI declined", "2026-03-17", "payment failed cred"),
    mk("b", "Hevy subscription", "2026-03-14", "declined renewal"),
    mk("c", "Newsletter", "2026-03-10", "weekly digest"),
  ];

  it("narrows to one match when date is unambiguous", () => {
    const matches = selectEmails(emails, { datePattern: "march 17" });
    const picked = pickMatchesForFollowUp(matches);
    expect(picked.length).toBe(1);
    expect(picked[0]?.email.id).toBe("a");
  });

  it("returns multiple candidates when scores cluster", () => {
    const matches = selectEmails(emails, { subjectKeyword: "declined" });
    const picked = pickMatchesForFollowUp(matches);
    expect(picked.length).toBeGreaterThan(1);
  });

  it("handles numeric date format '17/3'", () => {
    const matches = selectEmails(emails, { datePattern: "17/3" });
    const picked = pickMatchesForFollowUp(matches);
    expect(picked.length).toBe(1);
    expect(picked[0]?.email.id).toBe("a");
  });
});

describe("email-selection: combined filters", () => {
  const emails: StoredEmail[] = [
    mk(
      "a",
      "Re: pricing question",
      "2026-04-15",
      "decision Friday",
      "Prospect",
      "p@prospect.io",
    ),
    mk("b", "Pricing announcement", "2026-04-15", "blog post"),
    mk(
      "c",
      "Re: pricing question",
      "2026-03-20",
      "old thread",
      "Other",
      "o@other.com",
    ),
  ];

  it("combines subject and date to disambiguate", () => {
    const matches = selectEmails(emails, {
      subjectKeyword: "pricing",
      datePattern: "april 15",
    });
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("combines subject and sender to disambiguate", () => {
    const matches = selectEmails(emails, {
      subjectKeyword: "pricing",
      senderKeyword: "prospect",
    });
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const ids = matches.map((m) => m.email.id);
    expect(ids).toContain("a");
  });
});

describe("email-selection: empty / edge cases", () => {
  it("returns nothing for empty input list", () => {
    const matches = selectEmails([], { subjectKeyword: "anything" });
    expect(matches.length).toBe(0);
  });

  it("falls back to a default-result when extractedData has no usable fields", () => {
    const emails = [mk("a", "test", "2026-04-01", "body")];
    const matches = selectEmails(emails, {});
    expect(matches.length).toBe(1);
    expect(matches[0]?.matchReason).toMatch(/default|first/i);
  });
});
