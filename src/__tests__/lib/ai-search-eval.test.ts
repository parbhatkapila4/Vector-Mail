import { detectIntent } from "../../lib/intent-detection";
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
): StoredEmail => ({
  id,
  subject,
  from: { name: "Test", address: "t@test.com" },
  date: new Date(date),
  snippet,
  body: snippet,
});

describe("AI Search eval: intent detection", () => {
  it("treats messy follow-up as summarize when session has results", () => {
    const r = detectIntent("tell me about that failed one on march 17", true);
    expect(r.intent).toBe("SUMMARIZE");
  });

  it("treats numeric date follow-up as summarize", () => {
    const r = detectIntent("the one on 17/3", true);
    expect(r.intent).toBe("SUMMARIZE");
    expect(r.extractedData?.datePattern).toBeDefined();
  });
});

describe("AI Search eval: selection & disambiguation", () => {
  const emails: StoredEmail[] = [
    mk("a", "UPI declined", "2026-03-17", "payment failed cred"),
    mk("b", "Hevy subscription", "2026-03-14", "declined renewal"),
    mk("c", "Newsletter", "2026-03-10", "weekly digest"),
  ];

  it("narrows to one match when scores are clearly separated", () => {
    const matches = selectEmails(emails, { datePattern: "march 17" });
    const picked = pickMatchesForFollowUp(matches);
    expect(picked.length).toBe(1);
    expect(picked[0]?.email.id).toBe("a");
  });

  it("returns multiple options when matches are ambiguous", () => {
    const matches = selectEmails(emails, { subjectKeyword: "declined" });
    const picked = pickMatchesForFollowUp(matches);
    expect(picked.length).toBeGreaterThan(1);
  });
});
