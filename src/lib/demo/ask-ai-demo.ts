export type AskAiDemoMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export const ASK_AI_GUIDED_STEPS = [
  "What needs my attention today?",
  "Who am I waiting on for a reply?",
  "Summarize the partnership thread",
] as const;

const TODAY_RESPONSE = `Five threads moved into the must-act-today bucket. In order of stakes:

1. Conference talk proposal - speaker confirmation deadline is tomorrow. They asked if you can take the "AI-native architectures" track. One reply unlocks the slot.
2. Founderloop pilot - Alex is waiting on the architecture overview you said you'd send Tuesday. It's been two days; the thread is going cold.
3. Notion partnership - Maya proposed a March co-marketing slot. Her quarter locks Friday. A yes/no closes the loop.
4. Contract redline (Acme MSA) - legal sent the redlines this morning with a Friday signature window. Nothing else is blocking the deal.
5. Search UX feedback - paying customer asked for the roadmap. They renew or churn this month.

Two of those (Founderloop, Notion) have draft replies on Autopilot waiting for your approval.

\`\`\`json
{"summary":"Five threads needing your reply today; two have drafts ready in Autopilot","actions":["Confirm SaaStr slot before tomorrow's deadline","Send the architecture overview to Founderloop","Approve the two Autopilot drafts"],"threads":[{"threadId":"demo-thread-19","label":"Conference talk proposal","reason":"Speaker confirmation deadline tomorrow","confidence":"High"},{"threadId":"demo-thread-1","label":"Founderloop pilot","reason":"You committed to a Tuesday reply; it's now Thursday","confidence":"High"},{"threadId":"demo-thread-11","label":"Notion partnership","reason":"Their quarterly plan locks Friday","confidence":"High"},{"threadId":"demo-thread-24","label":"Acme MSA redline","reason":"Friday signature window","confidence":"High"},{"threadId":"demo-thread-5","label":"Search UX feedback","reason":"Paying customer renewal decision this month","confidence":"Medium"}]}
\`\`\``;

const WAITING_RESPONSE = `Three external threads where the last message went out from you and hasn't come back yet:

1. Investor update - February. Sent four days ago to your investor list. No replies; that's normal for monthly updates.
2. Re: Pricing question - sent yesterday to a prospect who was deciding between Pro and Enterprise. Worth a nudge tomorrow if they're quiet.
3. Re: Engineering hire - reference call. You asked the candidate's manager for a 20-minute call. Two days, no response. Polite ping is reasonable.

I'm not counting bulk senders or threads where they explicitly said "no rush".

\`\`\`json
{"summary":"Three external threads where you sent the last message","actions":["Nudge the pricing prospect tomorrow if they're still quiet","Ping the reference contact with a polite follow-up"],"threads":[{"threadId":"demo-thread-8","label":"Investor update - February","reason":"Sent 4 days ago; normal cadence","confidence":"Medium"},{"threadId":"demo-thread-16","label":"Pricing question","reason":"Prospect decision pending","confidence":"High"},{"threadId":"demo-thread-2","label":"Engineering hire reference","reason":"Two days, no response","confidence":"High"}]}
\`\`\``;

const PARTNERSHIP_RESPONSE = `Notion partnership thread, in one breath: Maya (Partnerships, Notion) proposed a March co-marketing window pairing VectorMail's semantic-search angle with Notion's "AI-first workspace" launch. Five messages so far.

- Their ask: a joint webinar plus one cross-blog feature.
- Open question: who owns the landing page. They suggested co-host; you flagged that as a tracking concern last reply.
- Decision pressure: their quarterly plan locks Friday. After that, the slot rolls to Q3.
- Risk: Maya is leaving for parental leave April 4. If she's not the closer, the thread will get re-routed and slow by 2-3 weeks.

A yes plus a counter on the landing-page question is probably the right move.

\`\`\`json
{"summary":"Notion co-marketing slot for March; quarterly plan locks Friday","actions":["Reply yes-with-counter on landing page ownership","Confirm webinar date before Maya's leave on April 4"],"threads":[{"threadId":"demo-thread-11","label":"Notion partnership","reason":"Their quarterly plan locks Friday","confidence":"High"}]}
\`\`\``;

const CONTRACTS_RESPONSE = `Two contract threads worth your eyes this week:

1. Acme MSA redline - legal sent the marked-up version this morning. Three changes: indemnity cap moved to 12 months ARR, payment terms tightened to net-30, IP carve-out clarified. Friday signature window.
2. Vendor agreement renewal (Linear) - auto-renews in 11 days unless you opt out. Last year's negotiation got you a 14% discount; current usage justifies a similar ask.

Nothing else in legal/contracts territory in the last 90 days that's still open.

\`\`\`json
{"summary":"Two open contract threads: Acme MSA redline and Linear renewal","actions":["Sign or counter the Acme redline by Friday","Open the Linear renewal before the 11-day auto-renew"],"threads":[{"threadId":"demo-thread-24","label":"Acme MSA redline","reason":"Friday signature window","confidence":"High"},{"threadId":"demo-thread-31","label":"Linear renewal","reason":"Auto-renews in 11 days","confidence":"High"}]}
\`\`\``;

const SUMMARY_RESPONSE = `Last 7 days, themes ranked by volume of substantive threads:

1. Sales & customer asks (9 threads) - mostly pricing/feature questions; two are decision-stage prospects worth your attention.
2. Hiring & references (5 threads) - one offer outstanding; two reference calls to schedule.
3. Partnerships (4 threads) - Notion, Linear, Vercel each in different stages; Notion is the time-sensitive one.
4. Engineering (4 threads) - infra postmortem, two hiring loops, one customer-reported bug.
5. Operations (3 threads) - tax filing reminder, payroll setup change, one vendor renewal.

Skipped: 47 newsletter/automated threads.

\`\`\`json
{"summary":"Last 7 days dominated by sales asks and partnerships","actions":["Reply to the two decision-stage prospects","Confirm Notion partnership slot"],"threads":[]}
\`\`\``;

const FALLBACK_RESPONSE = `You're in demo mode, so I'm answering against the sample inbox: 47 emails seeded for two founder personas across sales, partnerships, hiring, and contracts.

In the connected version, I'd run this query through pgvector against your real Gmail and cite the exact threads. The demo answers above (priority list, who you're waiting on, partnership context) are the kind of structured response you'd get back.

\`\`\`json
{"summary":"Demo mode running against sample inbox","actions":["Open Today's Brief or Autopilot to see other intelligence panels","Try one of the suggested questions"],"threads":[]}
\`\`\``;

export function getDemoAskAiResponse(query: string): string {
  const q = query.toLowerCase();
  if (
    q.includes("partnership") ||
    q.includes("notion") ||
    q.includes("co-marketing") ||
    q.includes("co marketing")
  ) {
    return PARTNERSHIP_RESPONSE;
  }
  if (
    q.includes("waiting") ||
    q.includes("reply queue") ||
    q.includes("sent") && q.includes("reply") ||
    q.includes("haven't heard")
  ) {
    return WAITING_RESPONSE;
  }
  if (
    q.includes("today") ||
    q.includes("priorit") ||
    q.includes("attention") ||
    q.includes("matters") ||
    q.includes("stack rank") ||
    q.includes("focus")
  ) {
    return TODAY_RESPONSE;
  }
  if (
    q.includes("contract") ||
    q.includes("msa") ||
    q.includes("legal") ||
    q.includes("redline") ||
    q.includes("renew")
  ) {
    return CONTRACTS_RESPONSE;
  }
  if (
    q.includes("summar") ||
    q.includes("recap") ||
    q.includes("last 7") ||
    q.includes("last 30") ||
    q.includes("week") ||
    q.includes("month")
  ) {
    return SUMMARY_RESPONSE;
  }
  return FALLBACK_RESPONSE;
}

export function buildAskAiDemoMessages(now: number): AskAiDemoMessage[] {
  return [
    {
      id: "demo-1",
      role: "user",
      content: "What needs my attention today?",
      timestamp: now - 180000,
    },
    {
      id: "demo-2",
      role: "assistant",
      content: `Five threads moved into the must-act-today bucket. In order of stakes:

1. Conference talk proposal - speaker confirmation deadline is tomorrow. They asked if you can take the "AI-native architectures" track. One reply unlocks the slot.
2. Founderloop pilot - Alex is waiting on the architecture overview you said you'd send Tuesday. It's been two days; the thread is going cold.
3. Notion partnership - Maya proposed a March co-marketing slot. Her quarter locks Friday. A yes/no closes the loop.
4. Contract redline (Acme MSA) - legal sent the redlines this morning with a Friday signature window. Nothing else is blocking the deal.
5. Search UX feedback - paying customer asked for the roadmap. They renew or churn this month.

Two of those (Founderloop, Notion) have draft replies on Autopilot waiting for your approval.

\`\`\`json
{"summary":"Five threads needing your reply today; two have drafts ready in Autopilot","actions":["Confirm SaaStr slot before tomorrow's deadline","Send the architecture overview to Founderloop","Approve the two Autopilot drafts"],"threads":[{"threadId":"demo-thread-19","label":"Conference talk proposal","reason":"Speaker confirmation deadline tomorrow","confidence":"High"},{"threadId":"demo-thread-1","label":"Founderloop pilot","reason":"You committed to a Tuesday reply; it's now Thursday","confidence":"High"},{"threadId":"demo-thread-11","label":"Notion partnership","reason":"Their quarterly plan locks Friday","confidence":"High"},{"threadId":"demo-thread-24","label":"Acme MSA redline","reason":"Friday signature window","confidence":"High"},{"threadId":"demo-thread-5","label":"Search UX feedback","reason":"Paying customer renewal decision this month","confidence":"Medium"}]}
\`\`\``,
      timestamp: now - 175000,
    },
    {
      id: "demo-3",
      role: "user",
      content: "Who am I waiting on for a reply?",
      timestamp: now - 90000,
    },
    {
      id: "demo-4",
      role: "assistant",
      content: `Three external threads where the last message went out from you and hasn't come back yet:

1. Investor update - February. Sent four days ago to your investor list. No replies; that's normal for monthly updates.
2. Re: Pricing question - sent yesterday to a prospect who was deciding between Pro and Enterprise. Worth a nudge tomorrow if they're quiet.
3. Re: Engineering hire - reference call. You asked the candidate's manager for a 20-minute call. Two days, no response. Polite ping is reasonable.

I'm not counting bulk senders or threads where they explicitly said "no rush".

\`\`\`json
{"summary":"Three external threads where you sent the last message","actions":["Nudge the pricing prospect tomorrow if they're still quiet","Ping the reference contact with a polite follow-up"],"threads":[{"threadId":"demo-thread-8","label":"Investor update - February","reason":"Sent 4 days ago; normal cadence","confidence":"Medium"},{"threadId":"demo-thread-16","label":"Pricing question","reason":"Prospect decision pending","confidence":"High"},{"threadId":"demo-thread-2","label":"Engineering hire reference","reason":"Two days, no response","confidence":"High"}]}
\`\`\``,
      timestamp: now - 85000,
    },
  ];
}
