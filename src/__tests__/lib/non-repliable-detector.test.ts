import { isNonRepliable } from "@/lib/automation/non-repliable-detector";

describe("non-repliable detector: sender heuristics", () => {
  const cases: Array<{ name: string; sender: string; skip: boolean }> = [
    { name: "noreply@stripe.com", sender: "noreply@stripe.com", skip: true },
    { name: "no-reply@github.com", sender: "no-reply@github.com", skip: true },
    {
      name: "donotreply@example.com",
      sender: "donotreply@example.com",
      skip: true,
    },
    {
      name: "notifications@linkedin.com",
      sender: "notifications@linkedin.com",
      skip: true,
    },
    {
      name: "alerts@hdfcbank.net",
      sender: "alerts@hdfcbank.net",
      skip: true,
    },
    {
      name: "transactional sender",
      sender: "transactions@razorpay.com",
      skip: true,
    },
    {
      name: "statements@bank.com",
      sender: "statements@chase.com",
      skip: true,
    },
    {
      name: "mailer-daemon",
      sender: "mailer-daemon@googlemail.com",
      skip: true,
    },
    {
      name: "subdomain alerts.",
      sender: "user@alerts.hdfcbank.net",
      skip: true,
    },
    {
      name: "subdomain notifications.",
      sender: "info@notifications.amazon.com",
      skip: true,
    },
    {
      name: "real first.last person",
      sender: "rebecca.shen@anthropic.com",
      skip: false,
    },
    {
      name: "co-founder@startup",
      sender: "alex@stripe.com",
      skip: false,
    },
    {
      name: "single-name personal",
      sender: "rohan@gmail.com",
      skip: false,
    },
  ];

  test.each(cases)("$name", ({ sender, skip }) => {
    const result = isNonRepliable({
      senderAddress: sender,
      subject: "Re: weekly sync",
      bodySnippet: "Sounds great, let's chat Thursday.",
    });
    expect(result.skip).toBe(skip);
    if (skip) expect(result.reason).toBeTruthy();
  });

  it("empty sender is treated as non-repliable", () => {
    const result = isNonRepliable({
      senderAddress: "",
      subject: "Re: weekly sync",
      bodySnippet: "Let's chat.",
    });
    expect(result.skip).toBe(true);
    expect(result.reason).toBe("missing_sender");
  });
});

describe("non-repliable detector: transactional subjects", () => {
  const sender = "support@platform.com";
  const skips: string[] = [
    "Your login code is 137186",
    "Your verification code is 998213",
    "OTP for your transaction",
    "Verify your email address",
    "Confirm your account",
    "Two-factor authentication code",
    "View: Account update for your HDFC Bank A/c",
    "Important: Transaction Decline on your HDFC Bank Debit Card",
    "Payment confirmed for order #82119",
    "Your statement is ready",
    "Credit card statement for May 2026",
    "Your order has been shipped",
    "Order confirmation: 14882",
    "Receipt for your purchase",
    "Password has been changed",
    "New sign-in from Chrome",
    "Suspicious sign-in detected",
    "Welcome to Notion",
    "Your subscription is expiring",
    "Unsubscribe from our newsletter",
  ];

  test.each(skips)("skips: '%s'", (subject) => {
    const result = isNonRepliable({
      senderAddress: sender,
      subject,
      bodySnippet: "",
    });
    expect(result.skip).toBe(true);
  });

  const keeps: string[] = [
    "Re: contract draft",
    "Following up on our call yesterday",
    "Quick question about the proposal",
    "Can we hop on a call this week?",
    "Hiring update - candidates ready for review",
    "Loved your last newsletter",
    "Meeting notes from Tuesday",
    "Met with the Stripe team yesterday",
    "ICICI venture funding update",
    "Question about my credit card setup",
    "INR 50K committed for seed",
    "Wells Fargo introduction",
    "PayPal integration questions",
    "Got the HDFC account opened - next steps?",
  ];

  test.each(keeps)("keeps: '%s'", (subject) => {
    const result = isNonRepliable({
      senderAddress: "rebecca.shen@anthropic.com",
      subject,
      bodySnippet: "",
    });
    expect(result.skip).toBe(false);
  });
});

describe("non-repliable detector: body-head signals", () => {
  it("skips when body says 'do not reply'", () => {
    const result = isNonRepliable({
      senderAddress: "billing@vendor.com",
      subject: "Your monthly summary",
      bodySnippet:
        "Hi customer, here's your usage summary. Please do not reply to this email; this mailbox is not monitored.",
    });
    expect(result.skip).toBe(true);
    expect(result.reason).toBe("automated_body");
  });

  it("skips when body says 'this is an automated message'", () => {
    const result = isNonRepliable({
      senderAddress: "info@somewhere.com",
      subject: "Account notice",
      bodySnippet:
        "This is an automated message. Your account has been updated.",
    });
    expect(result.skip).toBe(true);
  });

  it("keeps when nothing in body screams automated", () => {
    const result = isNonRepliable({
      senderAddress: "rebecca@anthropic.com",
      subject: "Re: agenda for Thursday",
      bodySnippet:
        "Adding three items: pricing review, EU launch, headcount plan.",
    });
    expect(result.skip).toBe(false);
    expect(result.reason).toBeNull();
  });
});
