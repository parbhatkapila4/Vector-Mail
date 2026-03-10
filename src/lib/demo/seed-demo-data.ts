import type { MeetingMessageMethod, Sensitivity } from "@prisma/client";
import { DEMO_ACCOUNT_ID } from "./constants";

type DemoEmailAddress = {
  id: string;
  name: string | null;
  address: string;
  raw: string | null;
  accountId: string;
};

type DemoLabel = {
  id: string;
  name: string;
  color: string | null;
  accountId: string;
  createdAt: Date;
};

type DemoEmail = {
  id: string;
  threadId: string;
  createdTime: Date;
  lastModifiedTime: Date;
  sentAt: Date;
  receivedAt: Date;
  internetMessageId: string;
  subject: string;
  sysLabels: string[];
  keywords: string[];
  sysClassifications: string[];
  sensitivity: Sensitivity;
  meetingMessageMethod: MeetingMessageMethod | null;
  fromId: string;
  hasAttachments: boolean;
  body: string | null;
  bodySnippet: string | null;
  inReplyTo: string | null;
  references: string | null;
  threadIndex: string | null;
  internetHeaders: unknown[];
  nativeProperties: unknown;
  folderId: string | null;
  omitted: string[];
  emailLabel: string;
  summary: string | null;
  from: DemoEmailAddress;
  to: DemoEmailAddress[];
  cc: DemoEmailAddress[];
  bcc: DemoEmailAddress[];
  replyTo: DemoEmailAddress[];
  attachments: unknown[];
};

type DemoThread = {
  id: string;
  subject: string;
  lastMessageDate: Date;
  participantIds: string[];
  accountId: string;
  done: boolean;
  inboxStatus: boolean;
  draftStatus: boolean;
  sentStatus: boolean;
  snoozedUntil: Date | null;
  remindAt: Date | null;
  remindIfNoReplySince: Date | null;
  emails: DemoEmail[];
  threadLabels: { label: DemoLabel }[];
};

function makeAddr(id: string, name: string, address: string): DemoEmailAddress {
  return { id, name, address, raw: null, accountId: DEMO_ACCOUNT_ID };
}

function makeLabel(id: string, name: string, color: string | null): DemoLabel {
  return { id, name, color, accountId: DEMO_ACCOUNT_ID, createdAt: new Date() };
}

function daysAgo(days: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d;
}

const CARD_STYLE =
  "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #202124; max-width: 560px; margin: 0 auto; padding: 32px 40px; background: #ffffff; border: 1px solid #e8eaed; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);";
const EMAIL_WRAP = `<div style='${CARD_STYLE}'>`;
const EMAIL_WRAP_END = "</div>";
function p(text: string, color = "#425466") {
  return `<p style='margin: 0 0 20px 0; font-size: 15px; color: ${color}; line-height: 1.65;'>${text}</p>`;
}
function headline(text: string) {
  return `<h1 style='margin: 0 0 28px 0; font-size: 22px; font-weight: 600; color: #0a2540; line-height: 1.35;'>${text}</h1>`;
}
function brandBlock(name: string, accent = "#0a2540") {
  return [
    "<div style='text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e8eaed;'>",
    `<p style='margin: 0; font-size: 18px; font-weight: 600; color: ${accent};'>${name}</p>`,
    "</div>",
  ].join("");
}
function hr() {
  return "<hr style='border: none; border-top: 1px solid #e6e9eb; margin: 28px 0 20px 0;' />";
}
function signature(name: string, role?: string, email?: string) {
  let s = `<div style='margin-top: 28px; padding-top: 20px; border-top: 1px solid #e8eaed;'><p style='margin: 0; font-size: 15px; color: #202124;'><strong>${name}</strong>`;
  if (role) s += `<br /><span style='font-size: 13px; color: #5f6368;'>${role}</span>`;
  s += "</p>";
  if (email) s += `<p style='margin: 8px 0 0 0; font-size: 12px; color: #9aa0a6;'>${email}</p>`;
  s += "</div>";
  return s;
}
function replyMeta(subject: string) {
  return `<div style='margin-bottom: 24px; padding: 12px 16px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #1a73e8;'><p style='margin: 0; font-size: 13px; color: #5f6368;'>Re: ${subject}</p></div>`;
}
function emailFooter() {
  return `<div style='margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed;'><p style='margin: 0; font-size: 12px; color: #9aa0a6;'>Reply to this email to continue the conversation.</p></div>`;
}
function sectionTitle(text: string) {
  return `<p style='margin: 24px 0 12px 0; font-size: 14px; font-weight: 600; color: #0a2540;'>${text}</p>`;
}
function bullet(text: string) {
  return `<p style='margin: 0 0 8px 0; font-size: 14px; color: #425466; padding-left: 16px; position: relative;'><span style='position: absolute; left: 0;'>·</span>${text}</p>`;
}
function companyEmailFooter(company: string, opts?: { unsubscribe?: boolean; address?: string }) {
  const parts: string[] = [];
  parts.push("<div style='margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8eaed;'>");
  if (opts?.unsubscribe !== false) {
    parts.push("<p style='margin: 0 0 8px 0; font-size: 11px; color: #9aa0a6;'>You're receiving this email because you have an account or subscription with " + company + ".</p>");
    parts.push("<p style='margin: 0 0 16px 0; font-size: 11px;'><a href='#' style='color: #1a73e8; text-decoration: underline;'>Unsubscribe</a> · <a href='#' style='color: #1a73e8; text-decoration: underline;'>Manage preferences</a> · <a href='#' style='color: #1a73e8; text-decoration: underline;'>Privacy policy</a></p>");
  }
  if (opts?.address) {
    parts.push("<p style='margin: 0; font-size: 11px; color: #9aa0a6;'>" + opts.address + "</p>");
  }
  parts.push("</div>");
  return parts.join("");
}
function email(parts: string[]) {
  return EMAIL_WRAP + parts.join("") + EMAIL_WRAP_END;
}

let cachedThreads: DemoThread[] | null = null;
let cachedSentThreads: DemoThread[] | null = null;
let cachedTrashThreads: DemoThread[] | null = null;

function buildDemoThreads(): DemoThread[] {
  if (cachedThreads) return cachedThreads;

  const threads: DemoThread[] = [];
  const labelImportant = makeLabel("demo-lbl-important", "Important", "#ff6b00");
  const labelUpdates = makeLabel("demo-lbl-updates", "Updates", "#1a73e8");
  const labelPromotions = makeLabel("demo-lbl-promotions", "Promotions", "#e37400");

  const threadSpecs: Array<{
    id: string;
    subject: string;
    senderName: string;
    senderEmail: string;
    daysAgo: number;
    hour?: number;
    snippet: string;
    body: string;
    summary: string;
    labels: DemoLabel[];
    read: boolean;
    messageCount?: number;
    replySnippet?: string;
    replyBody?: string;
  }> = [
      {
        id: "demo-thread-1",
        subject: "Quick intro - AI inbox automation",
        senderName: "Alex Rivera",
        senderEmail: "alex@founderloop.com",
        daysAgo: 1,
        hour: 9,
        snippet: "Founder exploring AI inbox automation. Interested in pilot access and integration details.",
        body: email([
          p("Hi,"),
          p("I'm building a small team tool and would love to see how VectorMail handles AI summaries and search. Can we get pilot access? Also curious about your API for integrations."),
          hr(),
          signature("Alex"),
          emailFooter(),
        ]),
        summary: "Founder exploring AI inbox automation and pilot access. Interested in integration details and API. Positive intent; suggest sending architecture overview and scheduling a 30-min call.",
        labels: [labelImportant],
        read: false,
        messageCount: 2,
        replySnippet: "Thanks for reaching out. Here's our architecture overview and a link to book a call.",
        replyBody: email([
          replyMeta("Quick intro - AI inbox automation"),
          p("Hi Alex,"),
          p("Thanks for reaching out. We'd love to help you explore VectorMail for your team."),
          p("Attached is a short architecture overview that covers how we handle AI summaries and search, plus our API for integrations. You can book a 30-min call here: <a href='#' style='color: #1a73e8; text-decoration: underline;'>schedule a call</a> - we'd be happy to walk you through the product and answer any questions about pilot access."),
          hr(),
          signature("VectorMail Team"),
          emailFooter(),
        ]),
      },
      {
        id: "demo-thread-2",
        subject: "YC W24 - Intro and office hours",
        senderName: "YC Community",
        senderEmail: "community@ycombinator.com",
        daysAgo: 2,
        snippet: "Welcome to YC W24. Office hours and resources for the batch.",
        body: email([
          brandBlock("YC"),
          headline("Welcome to the W24 batch"),
          p("Office hours sign-up is now open. Please complete your profile and add your company description by Friday."),
          hr(),
          signature("YC Team"),
        ]),
        summary: "YC onboarding for W24 batch. Action: complete profile and company description by Friday. Neutral, administrative.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-3",
        subject: "Your Stripe receipt - $99.00",
        senderName: "Stripe",
        senderEmail: "receipts@stripe.com",
        daysAgo: 2,
        hour: 14,
        snippet: "Receipt for your subscription payment.",
        body: [
          `<div style='${CARD_STYLE}'>`,
          "<div style='text-align: center; margin-bottom: 32px;'>",
          "<div style='display: inline-block; width: 48px; height: 48px; border-radius: 8px; background: linear-gradient(135deg, #635bff 0%, #0a2540 100%); margin-bottom: 12px;'></div>",
          "<p style='margin: 0; font-size: 18px; font-weight: 600; color: #0a2540;'>Stripe</p>",
          "</div>",
          "<h1 style='margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #0a2540; line-height: 1.3;'>Your VectorMail Pro subscription receipt</h1>",
          "<p style='margin: 0 0 16px 0; font-size: 15px; color: #202124;'>Hello,</p>",
          "<p style='margin: 0 0 16px 0; font-size: 15px; color: #425466;'>You've been charged <strong style='color: #0a2540;'>$99.00</strong> for your VectorMail Pro subscription.</p>",
          "<p style='margin: 0 0 24px 0; font-size: 15px; color: #425466;'>Receipt number: INV-2026-002<br/>Next billing date: March 28, 2026.</p>",
          "<hr style='border: none; border-top: 1px solid #e6e9eb; margin: 32px 0 24px 0;' />",
          "<p style='margin: 0 0 20px 0; font-size: 14px; font-weight: 600; color: #0a2540; text-align: center;'>Choose how to manage your subscription</p>",
          "<div style='text-align: center;'>",
          "<a href='#' style='display: inline-block; margin: 0 6px 12px 0; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #635bff; background: transparent; border: 1.5px solid #635bff; border-radius: 8px; text-decoration: none;'>View invoice</a>",
          "<a href='#' style='display: inline-block; margin: 0 0 12px 6px; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #fff; background: #635bff; border: none; border-radius: 8px; text-decoration: none;'>Manage subscription</a>",
          "</div>",
          "</div>",
        ].join(""),
        summary: "Stripe receipt for $99 subscription. No action required unless disputing. Neutral.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-4",
        subject: "[GitHub] 3 new notifications",
        senderName: "GitHub",
        senderEmail: "notifications@github.com",
        daysAgo: 3,
        snippet: "PR approved, issue mentioned, new comment on vectormail-ai.",
        body: email([
          brandBlock("GitHub"),
          headline("You have 3 new notifications"),
          p("PR #142 was approved."),
          p("You were mentioned in issue #89."),
          p("New comment on vectormail-ai/vectormail-ai."),
          "<div style='text-align: center; margin-top: 24px;'><a href='#' style='display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #fff; background: #24292f; border-radius: 8px; text-decoration: none;'>View notifications</a></div>",
        ]),
        summary: "GitHub digest: PR approval, mention in issue, new comment. Review when convenient. Neutral.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-5",
        subject: "Product feedback - search UX",
        senderName: "Jordan Kim",
        senderEmail: "jordan@startup.io",
        daysAgo: 3,
        hour: 11,
        snippet: "Loving the product. One suggestion: natural language search could show filters.",
        body: email([
          p("Hi team,"),
          p("Really loving VectorMail so far. One suggestion: when I use natural language search, it would be great to see which filters (date, sender) were applied. Would make it easier to refine."),
          hr(),
          signature("Jordan"),
          emailFooter(),
        ]),
        summary: "Positive product feedback. Suggestion: surface applied filters for natural language search. Action: consider UX improvement for filter visibility.",
        labels: [labelImportant],
        read: true,
        messageCount: 2,
        replySnippet: "Thanks! We've added this to our roadmap for next quarter.",
        replyBody: email([
          replyMeta("Product feedback - search UX"),
          p("Hi Jordan,"),
          p("Thanks for the feedback - we really appreciate it. We've added \"surface applied filters for natural language search\" to our roadmap for next quarter."),
          p("We'll notify you when it ships so you can try it out. If you have any other ideas, feel free to reply to this thread."),
          hr(),
          signature("Product Team"),
          emailFooter(),
        ]),
      },
      {
        id: "demo-thread-6",
        subject: "Invitation: Product sync - Tue 2:00 PM",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 4,
        snippet: "You have a meeting invitation for Product sync.",
        body: email([
          brandBlock("Calendar"),
          headline("You're invited: Product sync"),
          p("You have been invited to the following event. Please respond to accept, decline, or suggest another time."),
          sectionTitle("When"),
          p("Tuesday, Mar 25, 2026 · 2:00 PM - 2:30 PM (30 min)"),
          sectionTitle("Where"),
          p("Video call: <a href='#' style='color: #1a73e8; text-decoration: underline;'>Join with Zoom</a><br/>Or dial in: +1 234 567 8900 (PIN: 123 456)"),
          sectionTitle("Description"),
          p("Weekly product sync to align on roadmap, blockers, and customer feedback. Bring updates from your area. Agenda doc will be shared 24 hours before."),
          p("Organizer: Product Team · Calendar: Work"),
          "<div style='text-align: center; margin: 28px 0 24px 0;'><a href='#' style='display: inline-block; margin: 0 6px 12px 0; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #1a73e8; background: transparent; border: 1.5px solid #1a73e8; border-radius: 8px; text-decoration: none;'>Decline</a><a href='#' style='display: inline-block; margin: 0 0 12px 6px; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #fff; background: #1a73e8; border: none; border-radius: 8px; text-decoration: none;'>Accept</a></div>",
          companyEmailFooter("Google Calendar", { address: "Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043." }),
        ]),
        summary: "Meeting invite: Product sync, Tuesday 2 PM, Zoom. Action: accept or decline.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-7",
        subject: "The Batch - Issue #412",
        senderName: "The Batch",
        senderEmail: "newsletter@deeplearning.ai",
        daysAgo: 4,
        hour: 8,
        snippet: "This week: frontier models, RAG best practices, and open-source roundup.",
        body: email([
          brandBlock("The Batch"),
          headline("Issue #412 - This week in AI"),
          p("A weekly newsletter from DeepLearning.AI. Here's what we're covering in this issue."),
          sectionTitle("In this issue"),
          bullet("Frontier model updates: What's new in GPT-5, Claude, and Gemini - and what it means for builders."),
          bullet("RAG best practices for production: Embedding strategies, chunking, and evaluation pipelines that scale."),
          bullet("Open-source roundup: Llama 3.2, Mistral fine-tuning, and new tools we're watching."),
          bullet("From the blog: How to run small models on device without sacrificing quality."),
          sectionTitle("Featured article"),
          p("This week's deep dive: \"Building reliable RAG pipelines\" - from data prep to retrieval and generation. We walk through common failure modes and how to test and monitor your stack in production."),
          p("Plus: Course updates, community highlights, and the usual roundup of papers and releases."),
          "<div style='text-align: center; margin: 28px 0 24px 0;'><a href='#' style='display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 500; color: #fff; background: #0a2540; border-radius: 8px; text-decoration: none;'>Read full issue</a></div>",
          companyEmailFooter("DeepLearning.AI / The Batch", { address: "DeepLearning.AI · Reply to newsletter@deeplearning.ai. You're receiving this because you subscribed to The Batch." }),
        ]),
        summary: "Newsletter digest. No immediate action. Informational.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-8",
        subject: "Investor update - February",
        senderName: "Sam Chen",
        senderEmail: "sam@vcpartners.com",
        daysAgo: 5,
        snippet: "Monthly update: metrics and ask for intro to design partners.",
        body: email([
          headline("Investor update - February"),
          p("Quick update: MRR is up 18% MoM. Pipeline is strong and we're on track for the targets we discussed."),
          p("We're looking for 2-3 design partners in fintech to pilot the new workflow features. If you have any intros to product leads or eng teams in that space, we'd really appreciate an introduction."),
          p("Thanks and talk soon."),
          hr(),
          signature("Sam Chen", "Partner", "sam@vcpartners.com"),
          emailFooter(),
        ]),
        summary: "Investor update: strong MRR growth. Ask: intros to fintech design partners. Action: reply with intros if available. Positive tone.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-9",
        subject: "Re: Support ticket #8842 - Billing",
        senderName: "Support",
        senderEmail: "support@vectormail.app",
        daysAgo: 5,
        hour: 16,
        snippet: "Your billing issue has been resolved. Refund processed.",
        body: email([
          brandBlock("VectorMail Support"),
          headline("Ticket #8842 - Resolved"),
          p("Hi,"),
          p("Your billing issue (ticket #8842) has been resolved. A refund of $99 has been processed and will appear in your account within 5-7 business days."),
          p("We apologize for the inconvenience. If you have any questions or if anything else comes up, please reply to this email and we'll get back to you right away."),
          hr(),
          signature("Support", "VectorMail", "support@vectormail.app"),
          emailFooter(),
        ]),
        summary: "Customer support: billing ticket resolved, refund processed. No further action. Neutral/positive closure.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-10",
        subject: "Feature request: Calendar integration",
        senderName: "Morgan Lee",
        senderEmail: "morgan@producthunt.com",
        daysAgo: 6,
        snippet: "Would love to see calendar integration for meeting detection.",
        body: email([
          p("Hi,"),
          p("Would love to see calendar integration so VectorMail can suggest meeting blocks and detect conflicts. Is this on the roadmap?"),
          hr(),
          signature("Morgan Lee"),
          emailFooter(),
        ]),
        summary: "Feature request: calendar integration for meeting detection and conflict checks. Action: add to roadmap and respond with timeline if planned.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-11",
        subject: "Re: Partnership discussion",
        senderName: "Casey Park",
        senderEmail: "casey@partnerco.com",
        daysAgo: 1,
        hour: 15,
        snippet: "Following up on our call. Next steps and deck attached.",
        body: email([
          p("Great speaking with you. Attached are the next steps and the deck we discussed. Let's schedule follow-up for next week."),
          hr(),
          signature("Casey Park", "Partnerships · PartnerCo", "casey@partnerco.com"),
        ]),
        summary: "Partnership follow-up. Deck attached; action: schedule follow-up for next week. Positive.",
        labels: [labelImportant],
        read: false,
        messageCount: 3,
        replySnippet: "Thanks. I'll review and send over some times.",
        replyBody: email([
          replyMeta("Re: Partnership discussion"),
          p("Thanks Casey."),
          p("I'll review the deck and the next steps you outlined. I'll send over some times for a follow-up next week - will aim for Tuesday or Wednesday if that works on your side."),
          hr(),
          signature("Demo User"),
          emailFooter(),
        ]),
      },
      {
        id: "demo-thread-12",
        subject: "Your weekly digest",
        senderName: "LinkedIn",
        senderEmail: "notifications@linkedin.com",
        daysAgo: 2,
        hour: 7,
        snippet: "Your network activity and job recommendations.",
        body: email([
          brandBlock("LinkedIn"),
          headline("Your weekly digest"),
          p("Here's a summary of your LinkedIn activity and opportunities from the past week."),
          sectionTitle("Your activity this week"),
          p("Your profile was viewed 5 times. You gained 12 new connections. 3 people looked at your recent post about product strategy."),
          sectionTitle("Recommended jobs for you"),
          bullet("Senior Product Manager - Tech Startup (San Francisco) · Applied by 47 others"),
          bullet("Engineering Manager - Platform (Remote) · 2 connections work here"),
          bullet("Head of Product - Series B (New York) · Recommended based on your profile"),
          bullet("Product Lead - Consumer (Austin) · 1 connection works here"),
          bullet("VP Product - Enterprise (Chicago) · Posted 2 days ago"),
          sectionTitle("People you may know"),
          p("Based on your industry and connections: Sarah Chen (Product at Stripe), Mike Torres (Engineering at Notion), and 3 others have been suggested. Building your network can help you discover more opportunities."),
          sectionTitle("Trending in your feed"),
          p("Posts about AI in product development and remote team culture are getting more engagement in your network. Consider sharing your perspective to stay visible."),
          "<div style='text-align: center; margin: 28px 0 24px 0;'><a href='#' style='display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 500; color: #fff; background: #0a66c2; border-radius: 24px; text-decoration: none;'>View all activity</a></div>",
          companyEmailFooter("LinkedIn", { address: "LinkedIn Corporation, 1000 W Maude Ave, Sunnyvale, CA 94085. Reply to notifications@linkedin.com." }),
        ]),
        summary: "LinkedIn weekly digest. No action required. Informational.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-13",
        subject: "Design review - Q1 roadmap",
        senderName: "Taylor Reed",
        senderEmail: "taylor@design.io",
        daysAgo: 3,
        snippet: "Slack and Figma links for Tuesday's design review.",
        body: email([
          headline("Design review - Q1 roadmap"),
          p("Hi everyone,"),
          p("Design review for the Q1 roadmap is scheduled for Tuesday at 10 AM. We'll walk through the updated flows and components and align on any changes before engineering handoff."),
          sectionTitle("Before the meeting"),
          p("Figma: <a href='#' style='color: #1a73e8; text-decoration: underline;'>view file</a>. Slack channel: #design-q1. Please add comments and feedback in Figma or Slack by Monday EOD so we can prioritize discussion points."),
          p("If you can't make it, drop a note in the thread with your feedback and we'll capture it. Recording will be shared afterward."),
          hr(),
          signature("Taylor Reed", "Design", "taylor@design.io"),
          emailFooter(),
        ]),
        summary: "Design review scheduled. Action: add feedback in Figma/Slack before Tuesday 10 AM. Neutral.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-14",
        subject: "Urgent: API rate limit increase",
        senderName: "DevOps",
        senderEmail: "devops@company.com",
        daysAgo: 1,
        hour: 11,
        snippet: "We need to increase API rate limits for the launch.",
        body: email([
          replyMeta("Urgent: API rate limit increase"),
          headline("Ticket #9912 - Rate limit increase request"),
          p("Hi,"),
          p("We're hitting rate limits ahead of launch and need an increase by EOD to avoid blocking our rollout."),
          p("Could you please process ticket #9912 and bump our API limits? We're on the Pro plan and the current cap is too low for the traffic we're expecting this week."),
          p("Thanks in advance."),
          hr(),
          signature("DevOps Team", "Engineering", "devops@company.com"),
          emailFooter(),
        ]),
        summary: "Urgent request: API rate limit increase needed by EOD for launch. Action: process ticket #9912. Urgent.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-15",
        subject: "Welcome to VectorMail",
        senderName: "VectorMail",
        senderEmail: "hello@vectormail.app",
        daysAgo: 7,
        snippet: "Get started with your inbox in minutes.",
        body: email([
          brandBlock("VectorMail"),
          headline("Welcome to VectorMail"),
          p("Thanks for signing up. VectorMail helps you get to inbox zero with AI-powered summaries, smart search, and a cleaner workflow - all in one place."),
          sectionTitle("Get started in 3 steps"),
          bullet("Connect your Gmail - We use secure OAuth. We never store your password."),
          bullet("Let us sync - We'll index your threads and generate summaries. This usually takes a few minutes."),
          bullet("Explore your inbox - Use the sidebar to filter by label, search with natural language, and skim threads via AI summaries."),
          sectionTitle("What you can do with VectorMail"),
          p("Summaries: Every thread gets a short summary, action items, and sentiment so you can triage quickly. Search: Find emails by meaning, not just keywords. Nudges: We'll surface threads that might need a reply. Scheduled sends and more are available on Pro."),
          p("Need help? Reply to this email, check our help center, or join our community. We're here to make your inbox work for you."),
          "<div style='text-align: center; margin: 28px 0 24px 0;'><a href='#' style='display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #fff; background: #1a73e8; border-radius: 8px; text-decoration: none;'>Connect Gmail & get started</a></div>",
          companyEmailFooter("VectorMail", { address: "VectorMail · Reply to hello@vectormail.app for support." }),
        ]),
        summary: "Onboarding email. No action required beyond connecting Gmail. Positive, informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-16",
        subject: "Re: Pricing question",
        senderName: "Riley Adams",
        senderEmail: "riley@startup.co",
        daysAgo: 4,
        snippet: "Thanks for the details. We'll likely sign up next week.",
        body: email([
          p("Thanks for the pricing details. We'll likely sign up for the Team plan next week. Can you send the contract template?"),
          hr(),
          signature("Riley Adams"),
          emailFooter(),
        ]),
        summary: "Prospect moving forward. Action: send contract template for Team plan. Positive.",
        labels: [labelImportant],
        read: true,
        messageCount: 2,
        replySnippet: "Contract template attached. Let me know if you have questions.",
        replyBody: email([
          replyMeta("Re: Pricing question"),
          p("Hi Riley,"),
          p("Contract template attached. It includes the standard terms we discussed - the Team plan pricing, seat count, and the 12-month commitment."),
          p("Let me know if you have any questions or if you'd like to hop on a quick call to walk through anything before you sign."),
          hr(),
          signature("Demo User"),
          emailFooter(),
        ]),
      },
      {
        id: "demo-thread-17",
        subject: "Security alert: New sign-in",
        senderName: "Google",
        senderEmail: "no-reply@accounts.google.com",
        daysAgo: 2,
        hour: 18,
        snippet: "New sign-in to your Google account from Chrome on Windows.",
        body: email([
          brandBlock("Google"),
          headline("New sign-in to your Google account"),
          p("We noticed a new sign-in to your Google account. If this was you, you can ignore this email. If you don't recognize this activity, we recommend securing your account right away."),
          sectionTitle("Sign-in details"),
          p("Date & time: Mar 26, 2026, 6:42 PM PST<br/>Device: Chrome on Windows<br/>Location: San Francisco, CA, United States<br/>IP address: ••••••••••••"),
          sectionTitle("What you can do"),
          p("If this was you: No action needed. You can continue using your account as usual."),
          p("If this wasn't you: We recommend you change your password immediately and review your account activity. Check that your recovery email and phone number are correct so we can reach you if needed."),
          "<div style='text-align: center; margin: 28px 0 24px 0;'><a href='#' style='display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #fff; background: #1a73e8; border-radius: 8px; text-decoration: none;'>Secure account</a></div>",
          p("Google will never ask for your password in an email. If you have questions, visit the Google Account Help Center."),
          companyEmailFooter("Google", { address: "Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043. This email was sent to demo@vectormail.app." }),
        ]),
        summary: "Google security notification. Verify if sign-in was user; if not, secure account. Slightly urgent if unexpected.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-18",
        subject: "Sprint planning - Agenda",
        senderName: "Engineering",
        senderEmail: "eng@company.com",
        daysAgo: 5,
        snippet: "Agenda and doc for sprint planning on Thursday.",
        body: email([
          headline("Sprint planning - Agenda"),
          p("Hi team,"),
          p("Sprint planning is this Thursday at 9 AM. We'll cover retro outcomes, capacity, and sprint goals. Please come prepared with your availability and any blockers."),
          sectionTitle("Agenda"),
          bullet("Retro outcomes (10 min) - Key action items from last sprint."),
          bullet("Capacity & time-off (15 min) - Update the doc with your availability; we'll lock capacity by EOD Wednesday."),
          bullet("Sprint goals & backlog (35 min) - Prioritization and commitment for the next two weeks."),
          p("Doc: <a href='#' style='color: #1a73e8; text-decoration: underline;'>view doc</a>. Add your availability and notes by Wednesday so we can run the meeting efficiently. See you Thursday."),
          hr(),
          signature("Engineering", "eng@company.com"),
          emailFooter(),
        ]),
        summary: "Sprint planning agenda. Action: add availability to doc by Wednesday. Neutral.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-19",
        subject: "Re: Conference talk proposal",
        senderName: "Conference Team",
        senderEmail: "cfp@conference.io",
        daysAgo: 6,
        snippet: "Your proposal has been accepted. Details inside.",
        body: email([
          brandBlock("Conference Team"),
          headline("Your proposal has been accepted"),
          p("Congratulations! The program committee has accepted your talk proposal \"AI for Inbox Zero\" for ProductCon 2026."),
          sectionTitle("Next steps"),
          p("Please confirm your participation by this Friday so we can lock the schedule and send you speaker details. You'll receive logistics (green room, A/V, recording consent) and a draft timeline within a week of confirming."),
          sectionTitle("Session details"),
          p("Track: Product & AI · Format: 25-min talk + 5 min Q&A · Slot: Day 2, 2:00 PM. We'll send a speaker kit and slide template. If you need any accommodations or have questions, reply to this email - we're happy to help."),
          "<div style='text-align: center; margin: 28px 0 24px 0;'><a href='#' style='display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 500; color: #fff; background: #0a2540; border-radius: 8px; text-decoration: none;'>Confirm participation</a></div>",
          companyEmailFooter("ProductCon", { address: "ProductCon 2026 · cfp@conference.io · Reply to this email for speaker questions." }),
        ]),
        summary: "Proposal accepted. Action: confirm by Friday to receive speaker details. Positive.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-20",
        subject: "Invoice #INV-2044",
        senderName: "Vendor Co",
        senderEmail: "billing@vendor.co",
        daysAgo: 3,
        snippet: "Invoice for February services. Due in 14 days.",
        body: email([
          brandBlock("Vendor Co"),
          headline("Invoice #INV-2044"),
          p("Thank you for your business. Please find your invoice for March 2026 services below."),
          sectionTitle("Invoice summary"),
          p("Invoice number: INV-2044<br/>Issue date: Mar 15, 2026<br/>Due date: Mar 1, 2026<br/>Amount due: <strong style='color: #0a2540;'>$2,400.00 USD</strong>"),
          sectionTitle("Line items"),
          bullet("Consulting - Platform integration (40 hrs @ $60/hr) - $2,400.00"),
          p("Payment terms: Net 14. Payment can be made via ACH, wire, or card. Late payments may be subject to a 1.5% monthly fee. If you have questions about this invoice, reply to billing@vendor.co."),
          "<div style='text-align: center; margin: 28px 0 24px 0;'><a href='#' style='display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 500; color: #fff; background: #0a2540; border-radius: 8px; text-decoration: none;'>Pay invoice</a></div>",
          companyEmailFooter("Vendor Co", { address: "Vendor Co · billing@vendor.co · This is an automated message. Do not reply for payment status; use the portal or contact your account manager." }),
        ]),
        summary: "Invoice received. Action: pay within 14 days or delegate. Neutral.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-21",
        subject: "Lunch this week?",
        senderName: "Jamie Fox",
        senderEmail: "jamie@personal.com",
        daysAgo: 1,
        hour: 12,
        snippet: "Free for lunch Thursday or Friday?",
        body: email([
          p("Hey!"),
          p("Are you free for lunch Thursday or Friday? Would love to catch up and hear what you've been working on."),
          p("I'll be around the usual spot downtown - let me know which day works and we can grab a bite."),
          hr(),
          signature("Jamie"),
          emailFooter(),
        ]),
        summary: "Informal lunch invite. Action: reply with availability. Positive, low urgency.",
        labels: [],
        read: false,
      },
      {
        id: "demo-thread-22",
        subject: "Docs feedback - API reference",
        senderName: "Dev Rel",
        senderEmail: "devrel@company.com",
        daysAgo: 4,
        snippet: "Updated API reference is live. Please review.",
        body: email([
          headline("Docs feedback - API reference"),
          p("The updated API reference is live. We've refreshed the auth section and added examples for the new webhook endpoints."),
          p("Please review when you get a chance and send any feedback by EOW so we can ship the final version next week. Thanks!"),
          "<div style='text-align: center; margin-top: 24px;'><a href='#' style='display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #1a73e8; background: transparent; border: 1.5px solid #1a73e8; border-radius: 8px; text-decoration: none;'>View docs</a></div>",
          hr(),
          signature("Dev Rel", "Developer Relations", "devrel@company.com"),
          emailFooter(),
        ]),
        summary: "Docs update. Action: review API reference and send feedback by EOW. Neutral.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-23",
        subject: "Reminder: Team all-hands tomorrow",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 0,
        hour: 9,
        snippet: "Reminder: Team all-hands tomorrow at 10:00 AM.",
        body: email([
          brandBlock("Calendar"),
          headline("Reminder: Team all-hands"),
          p("This is a reminder that you have the following event coming up tomorrow."),
          sectionTitle("Event details"),
          p("Team all-hands<br/>Tomorrow, 10:00 AM - 11:00 AM (1 hour)<br/>Video call: <a href='#' style='color: #1a73e8; text-decoration: underline;'>Join with Google Meet</a><br/>Calendar: Work"),
          sectionTitle("Agenda"),
          p("Agenda and any pre-reads will be shared in #all-hands on Slack by 9 AM. Please join a few minutes early to test your mic and camera."),
          p("You're receiving this because you're invited to this event. To stop these reminders, edit your notification settings in Google Calendar."),
          companyEmailFooter("Google Calendar", { address: "Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043." }),
        ]),
        summary: "Calendar reminder for team all-hands. No action beyond attending. Neutral.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-24",
        subject: "Re: Contract review",
        senderName: "Legal",
        senderEmail: "legal@company.com",
        daysAgo: 2,
        hour: 17,
        snippet: "Contract reviewed. Two minor comments in the doc.",
        body: email([
          replyMeta("Re: Contract review"),
          headline("Contract review complete"),
          p("We've completed our review of the agreement. Overall it looks good."),
          p("There are two minor comments in the doc - please see sections 4.2 and 7.1. We've added notes in the shared document."),
          p("Once those are addressed we're ready to sign. Let us know if you have any questions."),
          hr(),
          signature("Legal", "Legal Team", "legal@company.com"),
          emailFooter(),
        ]),
        summary: "Legal review complete. Action: address comments in sections 4.2 and 7.1 before signing. Neutral.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-25",
        subject: "Your account is in good standing",
        senderName: "VectorMail",
        senderEmail: "billing@vectormail.app",
        daysAgo: 7,
        hour: 8,
        snippet: "Your subscription is active. Next billing date: Mar 28.",
        body: email([
          brandBlock("VectorMail"),
          headline("Your account is in good standing"),
          p("Your VectorMail subscription is active. Next billing date: March 28, 2026."),
          "<div style='text-align: center; margin-top: 24px;'><a href='#' style='display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #fff; background: #1a73e8; border-radius: 8px; text-decoration: none;'>Manage subscription</a></div>",
        ]),
        summary: "Billing status: account in good standing. No action required. Informational.",
        labels: [labelUpdates],
        read: true,
      },
    ];

  for (const spec of threadSpecs) {
    const fromAddr = makeAddr(`demo-from-${spec.id}`, spec.senderName, spec.senderEmail);
    const toAddr = makeAddr(`demo-to-${spec.id}`, "Demo User", "demo@vectormail.app");
    const sentAt = daysAgo(spec.daysAgo, spec.hour ?? 10);
    const emails: DemoEmail[] = [
      {
        id: `demo-email-${spec.id}-1`,
        threadId: spec.id,
        createdTime: sentAt,
        lastModifiedTime: sentAt,
        sentAt,
        receivedAt: sentAt,
        internetMessageId: `<demo-${spec.id}-1@vectormail.app>`,
        subject: spec.subject,
        sysLabels: spec.read ? ["inbox", "read"] : ["inbox"],
        keywords: [],
        sysClassifications: [],
        sensitivity: "normal",
        meetingMessageMethod: null,
        fromId: fromAddr.id,
        hasAttachments: false,
        body: spec.body,
        bodySnippet: spec.snippet,
        inReplyTo: null,
        references: null,
        threadIndex: "0",
        internetHeaders: [],
        nativeProperties: null,
        folderId: null,
        omitted: [],
        emailLabel: "inbox",
        summary: spec.summary,
        from: fromAddr,
        to: [toAddr],
        cc: [],
        bcc: [],
        replyTo: [],
        attachments: [],
      },
    ];

    if (spec.messageCount && spec.replyBody) {
      const replyAt = new Date(sentAt.getTime() + 2 * 60 * 60 * 1000);
      emails.push({
        id: `demo-email-${spec.id}-2`,
        threadId: spec.id,
        createdTime: replyAt,
        lastModifiedTime: replyAt,
        sentAt: replyAt,
        receivedAt: replyAt,
        internetMessageId: `<demo-${spec.id}-2@vectormail.app>`,
        subject: `Re: ${spec.subject}`,
        sysLabels: ["inbox", "read"],
        keywords: [],
        sysClassifications: [],
        sensitivity: "normal",
        meetingMessageMethod: null,
        fromId: toAddr.id,
        hasAttachments: false,
        body: spec.replyBody,
        bodySnippet: spec.replySnippet ?? "",
        inReplyTo: `<demo-${spec.id}-1@vectormail.app>`,
        references: null,
        threadIndex: "1",
        internetHeaders: [],
        nativeProperties: null,
        folderId: null,
        omitted: [],
        emailLabel: "inbox",
        summary: null,
        from: toAddr,
        to: [fromAddr],
        cc: [],
        bcc: [],
        replyTo: [],
        attachments: [],
      });
    }

    if (spec.messageCount === 3) {
      const reply2At = new Date(sentAt.getTime() + 24 * 60 * 60 * 1000);
      const thirdMessageBody = [
        "<div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; font-size: 15px; line-height: 1.65; color: #202124; max-width: 640px;'>",
        "<table cellpadding='0' cellspacing='0' border='0' style='width: 100%; margin-bottom: 20px;'><tr><td style='vertical-align: top; padding-right: 16px;'>",
        "<img src='https://ui-avatars.com/api/?name=Casey+Park&size=56&background=1a73e8&color=fff&bold=true' alt='Casey Park' width='56' height='56' style='border-radius: 50%; display: block;' />",
        "</td><td style='vertical-align: top;'>",
        "<p style='margin: 0 0 16px 0; font-size: 15px; color: #202124;'>Sounds good - I'll hold the slot on my side.</p>",
        "<p style='margin: 0 0 16px 0; font-size: 15px; color: #5f6368;'>Looking forward to the follow-up. If anything comes up before then, just reply to this thread.</p>",
        "</td></tr></table>",
        "<hr style='border: none; border-top: 1px solid #e8eaed; margin: 24px 0 16px 0;' />",
        "<p style='margin: 0; font-size: 15px; color: #202124;'><strong>Casey Park</strong><br /><span style='font-size: 13px; color: #5f6368;'>Partnerships · PartnerCo</span></p>",
        "<p style='margin: 8px 0 0 0; font-size: 12px; color: #9aa0a6;'>casey@partnerco.com</p>",
        "</div>",
      ].join("");
      emails.push({
        id: `demo-email-${spec.id}-3`,
        threadId: spec.id,
        createdTime: reply2At,
        lastModifiedTime: reply2At,
        sentAt: reply2At,
        receivedAt: reply2At,
        internetMessageId: `<demo-${spec.id}-3@vectormail.app>`,
        subject: `Re: ${spec.subject}`,
        sysLabels: ["inbox", "read"],
        keywords: [],
        sysClassifications: [],
        sensitivity: "normal",
        meetingMessageMethod: null,
        fromId: fromAddr.id,
        hasAttachments: false,
        body: thirdMessageBody,
        bodySnippet: "Sounds good - I'll hold the slot on my side. Looking forward to the follow-up.",
        inReplyTo: `<demo-${spec.id}-2@vectormail.app>`,
        references: null,
        threadIndex: "2",
        internetHeaders: [],
        nativeProperties: null,
        folderId: null,
        omitted: [],
        emailLabel: "inbox",
        summary: null,
        from: fromAddr,
        to: [toAddr],
        cc: [],
        bcc: [],
        replyTo: [],
        attachments: [],
      });
    }

    const lastMessageDate = emails[emails.length - 1]!.sentAt;
    threads.push({
      id: spec.id,
      subject: spec.subject,
      lastMessageDate,
      participantIds: [fromAddr.id, toAddr.id],
      accountId: DEMO_ACCOUNT_ID,
      done: false,
      inboxStatus: true,
      draftStatus: false,
      sentStatus: false,
      snoozedUntil: null,
      remindAt: null,
      remindIfNoReplySince: null,
      emails,
      threadLabels: spec.labels.map((l) => ({ label: l })),
    });
  }

  cachedThreads = threads;
  return threads;
}

function buildDemoSentThreads(): DemoThread[] {
  if (cachedSentThreads) return cachedSentThreads;
  const toAddr = makeAddr("demo-to-sent", "Demo User", "demo@vectormail.app");
  const sentSpecs: Array<{ id: string; subject: string; toName: string; toEmail: string; daysAgo: number; body: string }> = [
    { id: "demo-sent-1", subject: "Re: Quick intro - AI inbox automation", toName: "Alex Rivera", toEmail: "alex@founderloop.com", daysAgo: 1, body: "Hi Alex,\n\nThanks for reaching out. Attached is a short architecture overview. You can book a 30-min call here. We'd be happy to walk you through the product.\n\nBest,\nDemo" },
    { id: "demo-sent-2", subject: "Re: Product feedback - search UX", toName: "Jordan Kim", toEmail: "jordan@startup.io", daysAgo: 3, body: "Hi Jordan,\n\nThanks for the feedback - we've added this to our roadmap for next quarter. We'll notify you when it ships.\n\nBest,\nProduct Team" },
    { id: "demo-sent-3", subject: "Re: Partnership discussion", toName: "Casey Park", toEmail: "casey@partnerco.com", daysAgo: 2, body: "Thanks Casey. I'll review the deck and send over some times for next week.\n\nBest," },
    { id: "demo-sent-4", subject: "Re: Pricing question", toName: "Riley Adams", toEmail: "riley@startup.co", daysAgo: 4, body: "Hi Riley,\n\nContract template attached. Let me know if you have any questions.\n\nBest," },
    { id: "demo-sent-5", subject: "Follow-up: Design review", toName: "Taylor Reed", toEmail: "taylor@design.io", daysAgo: 5, body: "Hi Taylor,\n\nAdded my feedback in Figma. See you Tuesday.\n\nThanks," },
  ];
  const threads: DemoThread[] = sentSpecs.map((spec) => {
    const fromAddr = toAddr;
    const recipient = makeAddr(`demo-recipient-${spec.id}`, spec.toName, spec.toEmail);
    const sentAt = daysAgo(spec.daysAgo);
    const email: DemoEmail = {
      id: `demo-email-${spec.id}-1`,
      threadId: spec.id,
      createdTime: sentAt,
      lastModifiedTime: sentAt,
      sentAt,
      receivedAt: sentAt,
      internetMessageId: `<demo-${spec.id}@vectormail.app>`,
      subject: spec.subject,
      sysLabels: ["sent"],
      keywords: [],
      sysClassifications: [],
      sensitivity: "normal",
      meetingMessageMethod: null,
      fromId: fromAddr.id,
      hasAttachments: false,
      body: spec.body,
      bodySnippet: spec.body.slice(0, 80) + "...",
      inReplyTo: null,
      references: null,
      threadIndex: "0",
      internetHeaders: [],
      nativeProperties: null,
      folderId: null,
      omitted: [],
      emailLabel: "sent",
      summary: null,
      from: fromAddr,
      to: [recipient],
      cc: [],
      bcc: [],
      replyTo: [],
      attachments: [],
    };
    return {
      id: spec.id,
      subject: spec.subject,
      lastMessageDate: sentAt,
      participantIds: [fromAddr.id, recipient.id],
      accountId: DEMO_ACCOUNT_ID,
      done: false,
      inboxStatus: false,
      draftStatus: false,
      sentStatus: true,
      snoozedUntil: null,
      remindAt: null,
      remindIfNoReplySince: null,
      emails: [email],
      threadLabels: [],
    };
  });
  cachedSentThreads = threads;
  return threads;
}

function buildDemoTrashThreads(): DemoThread[] {
  if (cachedTrashThreads) return cachedTrashThreads;
  const fromAddr = makeAddr("demo-from-trash", "Old Newsletter", "news@old-service.com");
  const toAddr = makeAddr("demo-to-trash", "Demo User", "demo@vectormail.app");
  const trashSpecs: Array<{ id: string; subject: string; daysAgo: number; snippet: string }> = [
    { id: "demo-trash-1", subject: "Your weekly digest (archived)", daysAgo: 14, snippet: "You have 0 new updates this week." },
    { id: "demo-trash-2", subject: "Promotion - Expired offer", daysAgo: 10, snippet: "This offer has expired." },
    { id: "demo-trash-3", subject: "Re: Old thread you deleted", daysAgo: 7, snippet: "Previous conversation removed." },
  ];
  const threads: DemoThread[] = trashSpecs.map((spec) => {
    const sentAt = daysAgo(spec.daysAgo);
    const email: DemoEmail = {
      id: `demo-email-${spec.id}-1`,
      threadId: spec.id,
      createdTime: sentAt,
      lastModifiedTime: sentAt,
      sentAt,
      receivedAt: sentAt,
      internetMessageId: `<demo-${spec.id}@vectormail.app>`,
      subject: spec.subject,
      sysLabels: ["trash"],
      keywords: [],
      sysClassifications: [],
      sensitivity: "normal",
      meetingMessageMethod: null,
      fromId: fromAddr.id,
      hasAttachments: false,
      body: spec.snippet,
      bodySnippet: spec.snippet,
      inReplyTo: null,
      references: null,
      threadIndex: "0",
      internetHeaders: [],
      nativeProperties: null,
      folderId: null,
      omitted: [],
      emailLabel: "inbox",
      summary: null,
      from: fromAddr,
      to: [toAddr],
      cc: [],
      bcc: [],
      replyTo: [],
      attachments: [],
    };
    return {
      id: spec.id,
      subject: spec.subject,
      lastMessageDate: sentAt,
      participantIds: [fromAddr.id, toAddr.id],
      accountId: DEMO_ACCOUNT_ID,
      done: false,
      inboxStatus: false,
      draftStatus: false,
      sentStatus: false,
      snoozedUntil: null,
      remindAt: null,
      remindIfNoReplySince: null,
      emails: [email],
      threadLabels: [],
    };
  });
  cachedTrashThreads = threads;
  return threads;
}

function getAllDemoThreads(): DemoThread[] {
  return [...buildDemoThreads(), ...buildDemoSentThreads(), ...buildDemoTrashThreads()];
}

export function getDemoThreads(opts: {
  tab: string;
  limit: number;
  cursor?: string | null;
  labelId?: string | null;
}): { threads: DemoThread[]; nextCursor: string | undefined } {
  const pool: DemoThread[] =
    opts.tab === "inbox"
      ? buildDemoThreads()
      : opts.tab === "sent"
        ? buildDemoSentThreads()
        : opts.tab === "trash"
          ? buildDemoTrashThreads()
          : opts.tab === "label" && opts.labelId
            ? buildDemoThreads().filter((t) =>
              t.threadLabels.some((tl) => tl.label.id === opts.labelId),
            )
            : [];
  const sorted = [...pool].sort(
    (a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime(),
  );
  const start = opts.cursor ? sorted.findIndex((t) => t.id === opts.cursor) + 1 : 0;
  const slice = sorted.slice(start, start + opts.limit + 1);
  const hasMore = slice.length > opts.limit;
  const threads = (hasMore ? slice.slice(0, opts.limit) : slice).map((t) => ({
    ...t,
    emails: t.emails.slice(-1),
  }));
  const nextCursor = hasMore ? threads[threads.length - 1]?.id : undefined;
  return { threads, nextCursor };
}

export function getDemoThreadById(threadId: string): DemoThread | null {
  const all = getAllDemoThreads();
  const t = all.find((x) => x.id === threadId) ?? null;
  if (!t) return null;
  return {
    ...t,
    emails: [...t.emails].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    ),
  };
}

export type DemoSearchResult = {
  id: string;
  subject: string;
  snippet: string;
  from: { name: string | null; address: string };
  sentAt: string;
  threadId: string;
  relevanceScore: number;
  matchType: "keyword" | "semantic";
};

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }
  return dp[m]![n]!;
}

function textMatchesTerm(text: string, term: string, typoTolerance = true): boolean {
  if (text.includes(term)) return true;
  if (!typoTolerance || term.length < 4) return false;
  const words = text.replace(/[^a-z0-9\s]/gi, " ").split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (word.length >= term.length - 1 && word.length <= term.length + 1 && editDistance(term, word.toLowerCase()) <= 1) {
      return true;
    }
  }
  return false;
}

export function getDemoSearchResults(query: string, limit: number): DemoSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter((t) => t.length > 0);
  const allThreads = getAllDemoThreads();
  const candidates: { thread: DemoThread; email: DemoEmail }[] = [];

  for (const thread of allThreads) {
    for (const email of thread.emails) {
      const subject = (email.subject ?? "").toLowerCase();
      const snippet = (email.bodySnippet ?? "").toLowerCase();
      const body = (email.body ?? "").toLowerCase().replace(/<[^>]*>/g, " ");
      const fromName = (email.from?.name ?? "").toLowerCase();
      const fromAddr = (email.from?.address ?? "").toLowerCase();
      const combined = `${subject} ${snippet} ${body} ${fromName} ${fromAddr}`;

      const matchesQuery =
        subject.includes(q) ||
        snippet.includes(q) ||
        body.includes(q) ||
        fromName.includes(q) ||
        fromAddr.includes(q) ||
        textMatchesTerm(combined, q);
      const matchesTerms =
        terms.length > 0 &&
        terms.every(
          (t) =>
            subject.includes(t) ||
            snippet.includes(t) ||
            body.includes(t) ||
            fromName.includes(t) ||
            fromAddr.includes(t) ||
            textMatchesTerm(combined, t),
        );
      if (matchesQuery || matchesTerms) {
        candidates.push({ thread, email });
      }
    }
  }

  const scored = candidates.map(({ thread, email }) => {
    let relevanceScore = 0;
    const subject = (email.subject ?? "").toLowerCase();
    const snippet = (email.bodySnippet ?? "").toLowerCase();
    const body = (email.body ?? "").toLowerCase().replace(/<[^>]*>/g, " ");
    const fromName = (email.from?.name ?? "").toLowerCase();
    const fromAddr = (email.from?.address ?? "").toLowerCase();
    const combined = `${subject} ${snippet} ${body} ${fromName} ${fromAddr}`;

    if (fromName.includes(q)) relevanceScore += 15;
    else if (fromAddr.includes(q)) relevanceScore += 14;
    if (subject.includes(q)) relevanceScore += 12;
    if (snippet.includes(q)) relevanceScore += 8;
    if (body.includes(q)) relevanceScore += 6;
    if (textMatchesTerm(combined, q) && !subject.includes(q) && !snippet.includes(q) && !body.includes(q)) relevanceScore += 5;

    for (const term of terms) {
      if (fromName.includes(term)) relevanceScore += 10;
      else if (fromAddr.includes(term)) relevanceScore += 9;
      if (subject.includes(term)) relevanceScore += 7;
      if (snippet.includes(term)) relevanceScore += 4;
      if (body.includes(term)) relevanceScore += 2;
      if (textMatchesTerm(combined, term)) relevanceScore += 3;
    }
    if (terms.length > 0 && terms.every((t) => subject.includes(t) || snippet.includes(t) || body.includes(t) || fromName.includes(t) || fromAddr.includes(t) || textMatchesTerm(combined, t))) {
      relevanceScore += 5;
    }

    const daysSince = (Date.now() - new Date(email.sentAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) relevanceScore += 2;
    else if (daysSince < 30) relevanceScore += 1;

    return {
      id: email.id,
      subject: email.subject ?? "",
      snippet: email.bodySnippet ?? (email.body ? email.body.replace(/<[^>]*>/g, "").substring(0, 200) : "") ?? "",
      from: {
        name: email.from?.name ?? null,
        address: email.from?.address ?? "",
      },
      sentAt: new Date(email.sentAt).toISOString(),
      threadId: thread.id,
      relevanceScore,
      matchType: "keyword" as const,
    };
  });

  return scored
    .filter((r) => r.relevanceScore > 0)
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
      return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
    })
    .slice(0, limit);
}

export function getDemoEmailBody(emailId: string): { body: string | null; bodySnippet: string | null } | null {
  const all = getAllDemoThreads();
  for (const t of all) {
    const email = t.emails.find((e) => e.id === emailId);
    if (email) return { body: email.body, bodySnippet: email.bodySnippet };
  }
  return null;
}

export function getDemoScheduledSends(): Array<{
  id: string;
  scheduledAt: Date;
  payload: unknown;
  createdAt: Date;
}> {
  const now = new Date();
  return [
    {
      id: "demo-sched-1",
      scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      payload: { type: "trpc" as const, accountId: DEMO_ACCOUNT_ID, to: ["alex@founderloop.com"], subject: "Re: Quick intro", body: "..." },
      createdAt: now,
    },
    {
      id: "demo-sched-2",
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      payload: { type: "trpc" as const, accountId: DEMO_ACCOUNT_ID, to: ["team@company.com"], subject: "Weekly update", body: "..." },
      createdAt: now,
    },
    {
      id: "demo-sched-3",
      scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      payload: { type: "trpc" as const, accountId: DEMO_ACCOUNT_ID, to: ["investor@vc.com"], subject: "Monthly metrics", body: "..." },
      createdAt: now,
    },
  ];
}

export function getDemoNudges(): Array<{
  threadId: string;
  type: "REMINDER" | "UNREPLIED";
  reason: string;
  thread?: { subject: string; lastMessageDate: Date; snippet?: string | null; remindAt?: Date | null };
}> {
  const inbox = buildDemoThreads();
  const threadIds = [inbox[0]!.id, inbox[4]!.id, inbox[7]!.id, inbox[9]!.id, inbox[13]!.id];
  const subjects = ["Quick intro - AI inbox automation", "Product feedback - search UX", "Investor update - February", "Feature request: Calendar integration", "Design review - Q1 roadmap"];
  const reasons = ["Reminder", "Unreplied", "Reminder", "Unreplied", "Reminder"];
  const types: Array<"REMINDER" | "UNREPLIED"> = ["REMINDER", "UNREPLIED", "REMINDER", "UNREPLIED", "REMINDER"];
  return threadIds.map((threadId, i) => ({
    threadId,
    type: types[i]!,
    reason: reasons[i]!,
    thread: {
      subject: subjects[i]!,
      lastMessageDate: daysAgo(i + 1),
      snippet: "Follow up on this.",
      remindAt: types[i] === "REMINDER" ? new Date(Date.now() + 60 * 60 * 1000) : null,
    },
  }));
}

export function getDemoLabelsWithCounts(): Array<{
  id: string;
  name: string;
  color: string | null;
  createdAt: Date;
  threadCount: number;
}> {
  const threads = buildDemoThreads();
  const importantId = "demo-lbl-important";
  const updatesId = "demo-lbl-updates";
  const promotionsId = "demo-lbl-promotions";
  let importantCount = 0;
  let updatesCount = 0;
  let promotionsCount = 0;
  for (const t of threads) {
    for (const { label } of t.threadLabels) {
      if (label.id === importantId) importantCount++;
      if (label.id === updatesId) updatesCount++;
      if (label.id === promotionsId) promotionsCount++;
    }
  }
  const now = new Date();
  return [
    { id: importantId, name: "Important", color: "#ff6b00", createdAt: now, threadCount: importantCount },
    { id: promotionsId, name: "Promotions", color: "#e37400", createdAt: now, threadCount: promotionsCount },
    { id: updatesId, name: "Updates", color: "#1a73e8", createdAt: now, threadCount: updatesCount },
  ];
}

export function getDemoUpcomingEvents(): Array<{
  title: string;
  startAt: string;
  endAt?: string;
  location?: string;
  sourceEmailId: string;
  sourceThreadId: string;
}> {
  const inbox = buildDemoThreads();
  const now = new Date();
  const t = (i: number) => inbox[i]!;
  return [
    { title: "Product sync", startAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), endAt: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), location: "Zoom", sourceEmailId: t(5).emails[0]!.id, sourceThreadId: t(5).id },
    { title: "Sprint planning", startAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), endAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), location: "Conference room A", sourceEmailId: t(17).emails[0]!.id, sourceThreadId: t(17).id },
    { title: "Team all-hands", startAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), endAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), sourceEmailId: t(22).emails[0]!.id, sourceThreadId: t(22).id },
    { title: "Design review - Q1 roadmap", startAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), endAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), sourceEmailId: t(12).emails[0]!.id, sourceThreadId: t(12).id },
    { title: "Lunch catch-up", startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), location: "Downtown cafe", sourceEmailId: t(20).emails[0]!.id, sourceThreadId: t(20).id },
  ];
}
