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


const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO_STACK =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

const CARD_PAD_Y = 32;
const CARD_PAD_X = 36;
const CARD_STYLE =
  `font-family: ${FONT_STACK}; font-size: 15px; line-height: 1.55; color: #1f1f1f; max-width: 640px; margin: 0 auto; padding: ${CARD_PAD_Y}px ${CARD_PAD_X}px; background: #ffffff; border: 1px solid #ececec; border-radius: 14px; box-shadow: 0 1px 0 rgba(0,0,0,0.03);`;
const EMAIL_WRAP = `<div style="${CARD_STYLE}">`;
const EMAIL_WRAP_END = "</div>";

type Brand = {
  primary: string;
  text: string;
  accent?: string;
  logo: string;
  footerNote?: string;
};

const BRANDS: Record<string, Brand> = {
  Stripe: {
    primary: "linear-gradient(135deg, #635bff 0%, #4f46e5 100%)",
    text: "#ffffff",
    accent: "#635bff",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 22px; letter-spacing: -0.02em; color: #ffffff;">stripe</span>`,
    footerNote:
      "Stripe, Inc. · 354 Oyster Point Blvd, South San Francisco, CA 94080",
  },
  Google: {
    primary: "#ffffff",
    text: "#202124",
    accent: "#1a73e8",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 500; font-size: 22px; letter-spacing: -0.5px;"><span style="color: #4285f4;">G</span><span style="color: #ea4335;">o</span><span style="color: #fbbc05;">o</span><span style="color: #4285f4;">g</span><span style="color: #34a853;">l</span><span style="color: #ea4335;">e</span></span>`,
    footerNote:
      "Google LLC · 1600 Amphitheatre Parkway, Mountain View, CA 94043",
  },
  Calendar: {
    primary: "#1a73e8",
    text: "#ffffff",
    accent: "#1a73e8",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 28px; height: 28px; background: #ffffff; border-radius: 6px; color: #1a73e8; font-weight: 700; font-size: 13px; text-align: center; line-height: 28px; font-family: ${FONT_STACK};">31</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #ffffff; font-weight: 500; letter-spacing: -0.2px;">Google Calendar</span></span>`,
    footerNote:
      "Google LLC · 1600 Amphitheatre Parkway, Mountain View, CA 94043",
  },
  GitHub: {
    primary: "#24292f",
    text: "#ffffff",
    accent: "#0969da",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px; color: #ffffff;"><svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg><span style="font-family: ${FONT_STACK}; font-size: 16px; font-weight: 600; letter-spacing: -0.2px;">GitHub</span></span>`,
    footerNote:
      "GitHub, Inc. · 88 Colin P Kelly Jr Street, San Francisco, CA 94107",
  },
  LinkedIn: {
    primary: "#0a66c2",
    text: "#ffffff",
    accent: "#0a66c2",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: #ffffff; border-radius: 4px; color: #0a66c2; font-weight: 900; font-size: 14px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">in</span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">LinkedIn</span></span>`,
    footerNote:
      "LinkedIn Corporation · 1000 W Maude Ave, Sunnyvale, CA 94085",
  },
  YC: {
    primary: "#ff6600",
    text: "#ffffff",
    accent: "#ff6600",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 28px; height: 28px; background: #ffffff; border-radius: 4px; color: #ff6600; font-weight: 700; font-size: 18px; text-align: center; line-height: 28px; font-family: ${FONT_STACK};">Y</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #ffffff; font-weight: 600; letter-spacing: -0.3px;">Y Combinator</span></span>`,
    footerNote: "Y Combinator · 320 Pioneer Way, Mountain View, CA 94041",
  },
  "YC Community": {
    primary: "#ff6600",
    text: "#ffffff",
    accent: "#ff6600",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 28px; height: 28px; background: #ffffff; border-radius: 4px; color: #ff6600; font-weight: 700; font-size: 18px; text-align: center; line-height: 28px; font-family: ${FONT_STACK};">Y</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #ffffff; font-weight: 600; letter-spacing: -0.3px;">Y Combinator</span></span>`,
    footerNote: "Y Combinator · 320 Pioneer Way, Mountain View, CA 94041",
  },
  "Startup School": {
    primary: "#ff6600",
    text: "#ffffff",
    accent: "#ff6600",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">Startup School</span>`,
    footerNote: "Y Combinator · 320 Pioneer Way, Mountain View, CA 94041",
  },
  Vercel: {
    primary: "#000000",
    text: "#ffffff",
    accent: "#000000",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px; color: #ffffff;"><svg width="22" height="20" viewBox="0 0 24 22" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.6L24 21.6H0L12 1.6z"/></svg><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; letter-spacing: -0.4px;">Vercel</span></span>`,
    footerNote: "Vercel Inc. · 440 N Barranca Ave #4133, Covina, CA 91723",
  },
  Notion: {
    primary: "#ffffff",
    text: "#000000",
    accent: "#000000",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 28px; height: 28px; background: #ffffff; border: 1px solid #e8e8e8; border-radius: 5px; color: #000000; font-weight: 900; font-size: 18px; text-align: center; line-height: 26px; font-family: 'Georgia', serif;">N</span><span style="font-family: ${FONT_STACK}; font-size: 16px; font-weight: 600; color: #000000; letter-spacing: -0.4px;">Notion</span></span>`,
    footerNote: "Notion Labs Inc. · 2300 Harrison St, San Francisco, CA 94110",
  },
  Linear: {
    primary: "linear-gradient(135deg, #5e6ad2 0%, #4453b4 100%)",
    text: "#ffffff",
    accent: "#5e6ad2",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><svg width="20" height="20" viewBox="0 0 100 100" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M1.2 61.5c.5 1.6 1.1 3.2 1.8 4.7l36-36c-1.5-.7-3.1-1.4-4.7-1.8L1.2 61.5zM0 47.6c.1 1.6.2 3.1.4 4.7L43.3 9.4c-1.6-.2-3.1-.3-4.7-.4L0 47.6zm0-5.5c0 0 0-.1 0-.1L46 0c0 0-.1 0-.1 0-3.3 0-6.5.4-9.6 1.1L1.1 35.9C.4 39 0 42.2 0 45.5l0 .6zm98.4 8.9C95.4 24.9 75.1 4.6 50 1.6L98.4 51zM98.9 56.7c-.1-1.6-.2-3.1-.4-4.7l-31.8 31.8c1.6.2 3.1.3 4.7.4L98.9 56.7zm-1.7 9.2c-.5-1.6-1.1-3.2-1.8-4.7L42.4 81.2c1.5.7 3.1 1.4 4.7 1.8L97.2 65.9zM52 99c-1.7.1-3.3.1-5 .1L48.4 0c1.7 0 3.3 0 5 .1L52 99zm46.9-43c.1-1.7.1-3.3.1-5L0 53c0 1.7 0 3.3.1 5L98.9 56z"/></svg><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.4px;">Linear</span></span>`,
    footerNote: "Linear Orbit, Inc.",
  },
  Slack: {
    primary: "#4a154b",
    text: "#ffffff",
    accent: "#1264a3",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px; color: #ffffff;"><svg width="20" height="20" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path fill="#36c5f0" d="M22 37.5a5.5 5.5 0 1 1-5.5-5.5H22zm2.75 0a5.5 5.5 0 1 1 11 0v13.75a5.5 5.5 0 1 1-11 0z"/><path fill="#2eb67d" d="M30.25 16a5.5 5.5 0 1 1-5.5-5.5V16zm0 2.75a5.5 5.5 0 1 1 0 11H16.5a5.5 5.5 0 1 1 0-11z"/><path fill="#ecb22e" d="M51.5 24.25a5.5 5.5 0 1 1 5.5 5.5h-5.5zm-2.75 0a5.5 5.5 0 1 1-11 0V10.5a5.5 5.5 0 1 1 11 0z"/><path fill="#e01e5a" d="M38 45.75a5.5 5.5 0 1 1 5.5 5.5V45.75zm0-2.75a5.5 5.5 0 1 1 0-11h13.75a5.5 5.5 0 1 1 0 11z"/></svg><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.4px;">Slack</span></span>`,
    footerNote:
      "Slack Technologies, LLC · 500 Howard St, San Francisco, CA 94105",
  },
  AWS: {
    primary: "#232f3e",
    text: "#ffffff",
    accent: "#ff9900",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 12px;"><span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 22px; letter-spacing: -0.5px; color: #ff9900;">aws</span><span style="font-family: ${FONT_STACK}; font-size: 13px; color: #ffffff; opacity: 0.75; letter-spacing: 0.1px; padding-top: 4px;">Amazon Web Services</span></span>`,
    footerNote:
      "Amazon Web Services, Inc. · 410 Terry Ave N, Seattle, WA 98109",
  },
  Cloudflare: {
    primary: "#ffffff",
    text: "#404041",
    accent: "#f48120",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><svg width="24" height="14" viewBox="0 0 40 18" xmlns="http://www.w3.org/2000/svg"><path d="M28 17H10A10 10 0 0110 -3a10 10 0 019.5 7H28a3 3 0 010 6h-1.5L26 13h2a8 8 0 000-16h-8.5l-.3-.8A8 8 0 1010 15h17a1 1 0 100-2H17a3 3 0 110-6h11a8 8 0 010 16z" fill="#f48120"/></svg><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #404041; letter-spacing: -0.4px;">Cloudflare</span></span>`,
    footerNote:
      "Cloudflare, Inc. · 101 Townsend St, San Francisco, CA 94107",
  },
  Datadog: {
    primary: "#632ca6",
    text: "#ffffff",
    accent: "#632ca6",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: #ffffff; border-radius: 6px; color: #632ca6; font-weight: 800; font-size: 16px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">🐶</span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">Datadog</span></span>`,
    footerNote:
      "Datadog, Inc. · 620 8th Avenue, 45th Floor, New York, NY 10018",
  },
  Sentry: {
    primary: "#362d59",
    text: "#ffffff",
    accent: "#7553ff",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><svg width="22" height="20" viewBox="0 0 222 188" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M111 12c-7 0-13 4-16 10L70 65c30 16 51 47 51 84h-21c0-29-17-54-43-66L40 137c-2 4-2 9 0 13s7 6 12 6h64c2-25-12-49-34-61l11-19c30 14 49 45 47 80h36c4 0 9-2 11-6s2-9 0-13L127 22c-3-6-9-10-16-10z"/></svg><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">Sentry</span></span>`,
    footerNote: "Functional Software, Inc. dba Sentry",
  },
  PagerDuty: {
    primary: "#06ac38",
    text: "#ffffff",
    accent: "#06ac38",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: #ffffff; border-radius: 6px; color: #06ac38; font-weight: 800; font-size: 15px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">PD</span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">PagerDuty</span></span>`,
    footerNote: "PagerDuty, Inc. · 600 Townsend St, San Francisco, CA 94103",
  },
  Inngest: {
    primary: "#0f0f17",
    text: "#ffffff",
    accent: "#52d9d3",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 22px; height: 22px; background: linear-gradient(135deg, #52d9d3 0%, #b58af6 100%); border-radius: 6px;"></span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">Inngest</span></span>`,
    footerNote: "Inngest, Inc.",
  },
  Mercury: {
    primary: "#0f1c3f",
    text: "#ffffff",
    accent: "#5b9fff",
    logo:
      `<span style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: 400; color: #ffffff; letter-spacing: -0.5px;">Mercury</span>`,
    footerNote:
      "Mercury · Bank services provided by Choice Financial Group and Evolve Bank & Trust",
  },
  Brex: {
    primary: "#0f0f0f",
    text: "#ffffff",
    accent: "#ff9d4c",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -1px;">Brex</span>`,
    footerNote: "Brex Inc. · 12889 Hennessy Place, Houston, TX 77024",
  },
  Plaid: {
    primary: "#000000",
    text: "#ffffff",
    accent: "#000000",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.7px;">Plaid</span>`,
    footerNote: "Plaid Inc. · 1098 Harrison St, San Francisco, CA 94103",
  },
  Carta: {
    primary: "#0a2540",
    text: "#ffffff",
    accent: "#26a69a",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Carta</span>`,
    footerNote:
      "Carta · 333 Bush St, Floor 23, San Francisco, CA 94104",
  },
  Pulley: {
    primary: "#2f57e4",
    text: "#ffffff",
    accent: "#2f57e4",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Pulley</span>`,
    footerNote: "Pulley · Cap table software for startups",
  },
  AngelList: {
    primary: "#0e0e10",
    text: "#ffffff",
    accent: "#ffffff",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.6px;">AngelList</span>`,
    footerNote: "AngelList · 410 Townsend St, San Francisco, CA 94107",
  },
  Calendly: {
    primary: "#006bff",
    text: "#ffffff",
    accent: "#006bff",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 24px; height: 24px; background: #ffffff; border-radius: 50%;"></span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">Calendly</span></span>`,
    footerNote: "Calendly · 271 17th St NW, Atlanta, GA 30363",
  },
  DocuSign: {
    primary: "#ffcc22",
    text: "#000000",
    accent: "#000000",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 800; font-size: 18px; color: #000000; letter-spacing: -0.5px;">DocuSign</span>`,
    footerNote: "DocuSign, Inc. · 221 Main St, San Francisco, CA 94105",
  },
  Hubspot: {
    primary: "#ff7a59",
    text: "#ffffff",
    accent: "#ff7a59",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">HubSpot</span>`,
    footerNote: "HubSpot, Inc. · 2 Canal Park, Cambridge, MA 02141",
  },
  Mailgun: {
    primary: "#c02c2c",
    text: "#ffffff",
    accent: "#c02c2c",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">Mailgun</span>`,
    footerNote: "Mailgun Technologies, Inc.",
  },
  Twilio: {
    primary: "#f22f46",
    text: "#ffffff",
    accent: "#f22f46",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 800; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">twilio</span>`,
    footerNote:
      "Twilio Inc. · 101 Spear Street, 5th Floor, San Francisco, CA 94105",
  },
  Anthropic: {
    primary: "#f0eee5",
    text: "#191919",
    accent: "#cb785c",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 22px; height: 22px; background: #cb785c; border-radius: 4px; transform: rotate(45deg);"></span><span style="font-family: 'Georgia', serif; font-size: 18px; font-weight: 400; color: #191919; letter-spacing: -0.4px;">Anthropic</span></span>`,
    footerNote: "Anthropic, PBC · 548 Market St, San Francisco, CA 94104",
  },
  OpenAI: {
    primary: "#10a37f",
    text: "#ffffff",
    accent: "#10a37f",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 22px; height: 22px; background: #ffffff; border-radius: 50%;"></span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">OpenAI</span></span>`,
    footerNote: "OpenAI · 3180 18th St, San Francisco, CA 94110",
  },
  OpenRouter: {
    primary: "#6c5dd3",
    text: "#ffffff",
    accent: "#6c5dd3",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.4px;">OpenRouter</span>`,
    footerNote: "OpenRouter",
  },
  Substack: {
    primary: "#ff6719",
    text: "#ffffff",
    accent: "#ff6719",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 22px; height: 22px; background: #ffffff; border-radius: 4px; color: #ff6719; font-weight: 900; font-size: 16px; text-align: center; line-height: 22px; font-family: 'Georgia', serif;">S</span><span style="font-family: 'Georgia', serif; font-size: 18px; font-weight: 600; color: #ffffff; letter-spacing: -0.4px;">Substack</span></span>`,
    footerNote: "Substack Inc. · 548 Market St, San Francisco, CA 94104",
  },
  "Y Combinator": {
    primary: "#ff6600",
    text: "#ffffff",
    accent: "#ff6600",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 28px; height: 28px; background: #ffffff; border-radius: 4px; color: #ff6600; font-weight: 700; font-size: 18px; text-align: center; line-height: 28px; font-family: ${FONT_STACK};">Y</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #ffffff; font-weight: 600; letter-spacing: -0.3px;">Y Combinator</span></span>`,
    footerNote: "Y Combinator · 320 Pioneer Way, Mountain View, CA 94041",
  },
  Glassdoor: {
    primary: "#0caa41",
    text: "#ffffff",
    accent: "#0caa41",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.3px;">Glassdoor</span>`,
    footerNote: "Glassdoor, Inc. · 100 Shoreline Hwy, Mill Valley, CA 94941",
  },
  Lever: {
    primary: "#000000",
    text: "#ffffff",
    accent: "#9b51e0",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">Lever</span>`,
    footerNote: "Lever, Inc. · 425 1st Street, San Francisco, CA 94105",
  },
  Greenhouse: {
    primary: "#218d62",
    text: "#ffffff",
    accent: "#218d62",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.4px;">Greenhouse</span>`,
    footerNote: "Greenhouse Software, Inc.",
  },
  Gusto: {
    primary: "#f45d48",
    text: "#ffffff",
    accent: "#f45d48",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">gusto</span>`,
    footerNote: "Gusto · 525 20th Street, San Francisco, CA 94107",
  },
  "1Password": {
    primary: "#0572ec",
    text: "#ffffff",
    accent: "#0572ec",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 24px; height: 24px; background: #ffffff; border-radius: 4px; color: #0572ec; font-weight: 900; font-size: 13px; text-align: center; line-height: 24px; font-family: ${FONT_STACK};">1P</span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">1Password</span></span>`,
    footerNote:
      "1Password · 4711 Yonge St, 10th Floor, Toronto, ON M2N 6K8",
  },
  Okta: {
    primary: "#007dc1",
    text: "#ffffff",
    accent: "#007dc1",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.5px;">okta</span>`,
    footerNote: "Okta, Inc. · 100 First Street, San Francisco, CA 94105",
  },
  Vanta: {
    primary: "#314CE5",
    text: "#ffffff",
    accent: "#314CE5",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">Vanta</span>`,
    footerNote: "Vanta · 401 California Street, San Francisco, CA 94104",
  },
  HackerOne: {
    primary: "#101115",
    text: "#ffffff",
    accent: "#dd4d4d",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 22px; height: 22px; background: #dd4d4d; border-radius: 4px;"></span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">HackerOne</span></span>`,
    footerNote: "HackerOne, Inc. · 548 Market St, San Francisco, CA 94104",
  },
  Cobalt: {
    primary: "#0a2540",
    text: "#ffffff",
    accent: "#06b6d4",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">Cobalt</span>`,
    footerNote: "Cobalt Labs, Inc.",
  },
  Pilot: {
    primary: "#262626",
    text: "#ffffff",
    accent: "#ffd600",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">Pilot</span>`,
    footerNote: "Pilot.com, Inc.",
  },
  Vitally: {
    primary: "#5b3bff",
    text: "#ffffff",
    accent: "#5b3bff",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">Vitally</span>`,
    footerNote: "Vitally · New York, NY",
  },
  Delighted: {
    primary: "#ff8866",
    text: "#ffffff",
    accent: "#ff8866",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="font-size: 22px;">😊</span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">Delighted</span></span>`,
    footerNote: "Delighted by Qualtrics · Provo, UT",
  },
  USPTO: {
    primary: "#112e51",
    text: "#ffffff",
    accent: "#112e51",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 14px; color: #ffffff; letter-spacing: 0.5px;">UNITED STATES PATENT AND TRADEMARK OFFICE</span>`,
    footerNote: "USPTO · 600 Dulany Street, Alexandria, VA 22314",
  },
  Squadhelp: {
    primary: "#3aaee0",
    text: "#ffffff",
    accent: "#3aaee0",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">Squadhelp</span>`,
    footerNote: "Squadhelp Inc. · Chicago, IL",
  },
  WeWork: {
    primary: "#000000",
    text: "#ffffff",
    accent: "#000000",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.5px;">WeWork</span>`,
    footerNote: "WeWork, Inc. · 75 Rockefeller Plaza, New York, NY 10019",
  },
  Uber: {
    primary: "#000000",
    text: "#ffffff",
    accent: "#000000",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 800; font-size: 18px; color: #ffffff; letter-spacing: -0.5px;">Uber</span>`,
    footerNote: "Uber Technologies, Inc. · 1515 3rd Street, San Francisco, CA 94158",
  },
  "United Airlines": {
    primary: "#0033a0",
    text: "#ffffff",
    accent: "#0033a0",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 16px; color: #ffffff; letter-spacing: 0.3px;">UNITED</span>`,
    footerNote: "United Airlines, Inc. · 233 S Wacker Drive, Chicago, IL 60606",
  },
  "The Standard": {
    primary: "#cc0000",
    text: "#ffffff",
    accent: "#cc0000",
    logo:
      `<span style="font-family: 'Georgia', serif; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: 0.5px;">THE STANDARD</span>`,
    footerNote: "The Standard, High Line · 848 Washington Street, New York, NY",
  },
  "The Batch": {
    primary: "#0a2540",
    text: "#ffffff",
    accent: "#0a8f5c",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="font-family: 'Georgia', serif; font-style: italic; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">The Batch</span></span>`,
    footerNote: "DeepLearning.AI · The Batch",
  },
  "The Information": {
    primary: "#000000",
    text: "#ffffff",
    accent: "#d4af37",
    logo:
      `<span style="font-family: 'Georgia', 'Times New Roman', serif; font-weight: 400; font-size: 20px; color: #ffffff; letter-spacing: -0.3px;">The Information</span>`,
    footerNote: "The Information · 188 King St #503, San Francisco, CA",
  },
  Stratechery: {
    primary: "#1a1a1a",
    text: "#ffffff",
    accent: "#ed1c24",
    logo:
      `<span style="font-family: 'Georgia', 'Times New Roman', serif; font-weight: 400; font-size: 20px; color: #ffffff; letter-spacing: -0.3px;">Stratechery</span>`,
    footerNote: "Stratechery LLC · By Ben Thompson",
  },
  "Lenny's Newsletter": {
    primary: "#fef3c7",
    text: "#1a1a1a",
    accent: "#dc2626",
    logo:
      `<span style="font-family: 'Georgia', serif; font-weight: 700; font-style: italic; font-size: 22px; color: #1a1a1a; letter-spacing: -0.5px;">Lenny's Newsletter</span>`,
    footerNote: "Lenny's Newsletter · by Lenny Rachitsky",
  },
  "First Round Review": {
    primary: "#000000",
    text: "#ffffff",
    accent: "#ed1c24",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.3px;">FIRST ROUND REVIEW</span>`,
    footerNote: "First Round Capital",
  },
  "Not Boring": {
    primary: "#fde047",
    text: "#1a1a1a",
    accent: "#1a1a1a",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 800; font-size: 19px; color: #1a1a1a; letter-spacing: -0.6px;">NOT BORING</span>`,
    footerNote: "Not Boring · by Packy McCormick",
  },
  "Pragmatic Engineer": {
    primary: "#16213e",
    text: "#ffffff",
    accent: "#ee6c4d",
    logo:
      `<span style="font-family: 'Georgia', serif; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">The Pragmatic Engineer</span>`,
    footerNote: "The Pragmatic Engineer · by Gergely Orosz",
  },
  TLDR: {
    primary: "#1a1a1a",
    text: "#ffffff",
    accent: "#ffd600",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 800; font-size: 22px; color: #ffd600; letter-spacing: -0.5px;">TLDR</span>`,
    footerNote: "TLDR Newsletter",
  },
  "Morning Brew": {
    primary: "#fefefe",
    text: "#1a1a1a",
    accent: "#0066ff",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="font-size: 22px;">☕</span><span style="font-family: 'Georgia', serif; font-weight: 700; font-style: italic; font-size: 19px; color: #1a1a1a; letter-spacing: -0.4px;">Morning Brew</span></span>`,
    footerNote: "Morning Brew Inc. · New York, NY",
  },
  "Hacker Newsletter": {
    primary: "#ff6600",
    text: "#ffffff",
    accent: "#ff6600",
    logo:
      `<span style="font-family: ${MONO_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.2px;">Hacker Newsletter</span>`,
    footerNote: "Hacker Newsletter",
  },
  "The Hustle": {
    primary: "#000000",
    text: "#ffffff",
    accent: "#febf00",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 900; font-size: 19px; color: #febf00; letter-spacing: -0.5px;">THE HUSTLE</span>`,
    footerNote: "The Hustle · A HubSpot company",
  },
  "Mind the Product": {
    primary: "#e91e63",
    text: "#ffffff",
    accent: "#e91e63",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.4px;">Mind the Product</span>`,
    footerNote: "Mind the Product",
  },
  "Backstage Capital": {
    primary: "#1a1a1a",
    text: "#ffffff",
    accent: "#1a1a1a",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.3px;">Backstage Capital</span>`,
    footerNote: "Backstage Capital",
  },
  Forbes: {
    primary: "#000000",
    text: "#ffffff",
    accent: "#ed3434",
    logo:
      `<span style="font-family: 'Times New Roman', serif; font-weight: 900; font-size: 22px; color: #ffffff; letter-spacing: -0.5px;">Forbes</span>`,
    footerNote: "Forbes Media",
  },
  TechCrunch: {
    primary: "#00d566",
    text: "#1a1a1a",
    accent: "#1a1a1a",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 800; font-size: 18px; color: #1a1a1a; letter-spacing: -0.5px;">TechCrunch</span>`,
    footerNote: "TechCrunch · Yahoo Inc.",
  },
  "20VC": {
    primary: "#1a1a1a",
    text: "#ffffff",
    accent: "#1a1a1a",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 800; font-size: 19px; color: #ffffff; letter-spacing: -0.5px;">20VC</span>`,
    footerNote: "20VC · The podcast about venture capital",
  },
  SaaStr: {
    primary: "#0a2540",
    text: "#ffffff",
    accent: "#fb923c",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 800; font-size: 19px; color: #ffffff; letter-spacing: -0.5px;">SaaStr</span>`,
    footerNote: "SaaStr · The world's largest community for SaaS founders",
  },
  "AI Engineer Summit": {
    primary: "#0a2540",
    text: "#ffffff",
    accent: "#a78bfa",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.4px;">AI Engineer Summit</span>`,
    footerNote: "AI Engineer Summit",
  },
  "Product Hunt": {
    primary: "#da552f",
    text: "#ffffff",
    accent: "#da552f",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 22px; height: 22px; background: #ffffff; border-radius: 50%; color: #da552f; font-weight: 900; font-size: 13px; text-align: center; line-height: 22px; font-family: ${FONT_STACK};">P</span><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">Product Hunt</span></span>`,
    footerNote: "Product Hunt · 90 Gold Street, San Francisco, CA 94133",
  },
  "GiveDirectly": {
    primary: "#0a3d2a",
    text: "#ffffff",
    accent: "#0a3d2a",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.3px;">GiveDirectly</span>`,
    footerNote: "GiveDirectly · 80 Broad St, Suite 403, New York, NY 10004",
  },
  VectorMail: {
    primary: "#1F3A2E",
    text: "#FBF8F1",
    accent: "#1F3A2E",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: linear-gradient(135deg, #2c5443 0%, #1F3A2E 100%); border-radius: 6px; color: #FBF8F1; font-weight: 800; font-size: 14px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">V</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #FBF8F1; font-weight: 600; letter-spacing: -0.3px;">VectorMail</span></span>`,
    footerNote: "VectorMail · hello@vectormail.app",
  },
  "VectorMail Support": {
    primary: "#1F3A2E",
    text: "#FBF8F1",
    accent: "#1F3A2E",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: linear-gradient(135deg, #2c5443 0%, #1F3A2E 100%); border-radius: 6px; color: #FBF8F1; font-weight: 800; font-size: 14px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">V</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #FBF8F1; font-weight: 600; letter-spacing: -0.3px;">VectorMail · Support</span></span>`,
    footerNote: "VectorMail · support@vectormail.app",
  },
  "VectorMail Product": {
    primary: "#1F3A2E",
    text: "#FBF8F1",
    accent: "#1F3A2E",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: linear-gradient(135deg, #2c5443 0%, #1F3A2E 100%); border-radius: 6px; color: #FBF8F1; font-weight: 800; font-size: 14px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">V</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #FBF8F1; font-weight: 600; letter-spacing: -0.3px;">VectorMail · Product</span></span>`,
    footerNote: "VectorMail",
  },
  "VectorMail Recruiting": {
    primary: "#1F3A2E",
    text: "#FBF8F1",
    accent: "#1F3A2E",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: linear-gradient(135deg, #2c5443 0%, #1F3A2E 100%); border-radius: 6px; color: #FBF8F1; font-weight: 800; font-size: 14px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">V</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #FBF8F1; font-weight: 600; letter-spacing: -0.3px;">VectorMail · Recruiting</span></span>`,
    footerNote: "VectorMail · Internal",
  },
  "VectorMail Oncall": {
    primary: "#0f0f17",
    text: "#ffffff",
    accent: "#dc2626",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 10px; height: 10px; background: #dc2626; border-radius: 50%; box-shadow: 0 0 8px #dc2626;"></span><span style="font-family: ${FONT_STACK}; font-size: 17px; color: #ffffff; font-weight: 600; letter-spacing: -0.3px;">VectorMail · Oncall</span></span>`,
    footerNote: "VectorMail Engineering · Internal",
  },
  "VectorMail Metrics": {
    primary: "#1F3A2E",
    text: "#FBF8F1",
    accent: "#1F3A2E",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: linear-gradient(135deg, #2c5443 0%, #1F3A2E 100%); border-radius: 6px; color: #FBF8F1; font-weight: 800; font-size: 14px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">V</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #FBF8F1; font-weight: 600; letter-spacing: -0.3px;">VectorMail · Metrics</span></span>`,
    footerNote: "VectorMail · Internal metrics",
  },
  "VectorMail Finance": {
    primary: "#1F3A2E",
    text: "#FBF8F1",
    accent: "#1F3A2E",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: linear-gradient(135deg, #2c5443 0%, #1F3A2E 100%); border-radius: 6px; color: #FBF8F1; font-weight: 800; font-size: 14px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">V</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #FBF8F1; font-weight: 600; letter-spacing: -0.3px;">VectorMail · Finance</span></span>`,
    footerNote: "VectorMail · Internal finance",
  },
  "VectorMail · Friday Wins": {
    primary: "#1F3A2E",
    text: "#FBF8F1",
    accent: "#1F3A2E",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="font-size: 16px;">🎉</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #FBF8F1; font-weight: 600; letter-spacing: -0.3px;">VectorMail · Friday Wins</span></span>`,
    footerNote: "VectorMail · Internal",
  },
  Figma: {
    primary: "#0f0f0f",
    text: "#ffffff",
    accent: "#a259ff",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><svg width="16" height="22" viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg"><path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg><span style="font-family: ${FONT_STACK}; font-size: 17px; font-weight: 600; color: #ffffff; letter-spacing: -0.4px;">Figma</span></span>`,
    footerNote: "Figma, Inc. · 116 New Montgomery St, San Francisco, CA 94105",
  },
  Clerk: {
    primary: "#6c47ff",
    text: "#ffffff",
    accent: "#6c47ff",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">Clerk</span>`,
    footerNote: "Clerk · clerk.com",
  },
  United: {
    primary: "#0033a0",
    text: "#ffffff",
    accent: "#0033a0",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 16px; color: #ffffff; letter-spacing: 0.3px;">UNITED</span>`,
    footerNote: "United Airlines, Inc. · 233 S Wacker Drive, Chicago, IL 60606",
  },
  "The Pragmatic Engineer": {
    primary: "#16213e",
    text: "#ffffff",
    accent: "#ee6c4d",
    logo:
      `<span style="font-family: 'Georgia', serif; font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -0.4px;">The Pragmatic Engineer</span>`,
    footerNote: "The Pragmatic Engineer · by Gergely Orosz",
  },
  "Conference Team": {
    primary: "#0a2540",
    text: "#ffffff",
    accent: "#0a2540",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 700; font-size: 17px; color: #ffffff; letter-spacing: -0.4px;">ProductCon 2026</span>`,
    footerNote: "ProductCon · cfp@conference.io",
  },
  "Vendor Co": {
    primary: "#1f2937",
    text: "#ffffff",
    accent: "#1f2937",
    logo:
      `<span style="font-family: ${FONT_STACK}; font-weight: 600; font-size: 16px; color: #ffffff; letter-spacing: -0.3px;">Vendor Co</span>`,
    footerNote: "Vendor Co · billing@vendor.co",
  },
  "VectorMail · Weekly": {
    primary: "#1F3A2E",
    text: "#FBF8F1",
    accent: "#1F3A2E",
    logo:
      `<span style="display: inline-flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 26px; height: 26px; background: linear-gradient(135deg, #2c5443 0%, #1F3A2E 100%); border-radius: 6px; color: #FBF8F1; font-weight: 800; font-size: 14px; text-align: center; line-height: 26px; font-family: ${FONT_STACK};">V</span><span style="font-family: ${FONT_STACK}; font-size: 16px; color: #FBF8F1; font-weight: 600; letter-spacing: -0.3px;">VectorMail · Weekly</span></span>`,
    footerNote: "VectorMail · Weekly digest",
  },
};

function p(text: string, color = "#1f1f1f") {
  return `<p style="margin: 0 0 16px 0; font-size: 15px; color: ${color}; line-height: 1.55;">${text}</p>`;
}

function headline(text: string) {
  return `<h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #0a0a0a; line-height: 1.3; letter-spacing: -0.4px;">${text}</h1>`;
}
function brandBlock(name: string, _accent?: string) {
  const brand = BRANDS[name];
  if (brand) {
    return [
      `<div style="margin: -${CARD_PAD_Y}px -${CARD_PAD_X}px 24px -${CARD_PAD_X}px; padding: 18px ${CARD_PAD_X}px; background: ${brand.primary}; color: ${brand.text}; border-radius: 14px 14px 0 0;">`,
      brand.logo,
      "</div>",
    ].join("");
  }
  return [
    `<div style="margin: -${CARD_PAD_Y}px -${CARD_PAD_X}px 24px -${CARD_PAD_X}px; padding: 16px ${CARD_PAD_X}px; background: #f4f5f7; border-bottom: 1px solid #ececec; border-radius: 14px 14px 0 0;">`,
    `<span style="font-family: ${FONT_STACK}; font-size: 15px; font-weight: 600; color: #1f1f1f; letter-spacing: -0.2px;">${name}</span>`,
    "</div>",
  ].join("");
}

function hr() {
  return `<hr style="border: none; border-top: 1px solid #ececec; margin: 24px 0 20px 0;" />`;
}

function signature(name: string, role?: string, email?: string) {
  const parts: string[] = [];
  parts.push(`<div style="margin: 24px 0 0 0;">`);
  parts.push(
    `<div style="font-size: 15px; font-weight: 600; color: #1f1f1f; line-height: 1.3;">${name}</div>`,
  );
  if (role) {
    parts.push(
      `<div style="font-size: 13px; color: #5f6368; line-height: 1.3; margin-top: 2px;">${role}</div>`,
    );
  }
  if (email) {
    parts.push(
      `<div style="font-size: 13px; line-height: 1.3; margin-top: 4px;"><a href="mailto:${email}" style="color: #1a73e8; text-decoration: none;">${email}</a></div>`,
    );
  }
  parts.push(`</div>`);
  return parts.join("");
}

function replyMeta(subject: string) {
  return `<div style="margin: 0 0 20px 0; padding: 0 0 16px 0; border-bottom: 1px solid #ececec;"><div style="font-size: 12px; color: #80868b; font-family: ${FONT_STACK}; letter-spacing: 0.1px;">Re: ${subject}</div></div>`;
}
function emailFooter() {
  return "";
}

function sectionTitle(text: string) {
  return `<div style="margin: 22px 0 10px 0; font-size: 12px; font-weight: 600; color: #5f6368; text-transform: uppercase; letter-spacing: 0.6px;">${text}</div>`;
}

function bullet(text: string) {
  return `<div style="margin: 0 0 8px 0; font-size: 14.5px; color: #1f1f1f; line-height: 1.5; padding-left: 18px; position: relative;"><span style="position: absolute; left: 0; top: 0; color: #5f6368;">•</span>${text}</div>`;
}
function companyEmailFooter(
  company: string,
  opts?: { unsubscribe?: boolean; address?: string },
) {
  const brand = BRANDS[company];
  const addr = opts?.address ?? brand?.footerNote ?? "";
  const parts: string[] = [];
  parts.push(
    `<div style="margin: 32px -${CARD_PAD_X}px -${CARD_PAD_Y}px -${CARD_PAD_X}px; padding: 20px ${CARD_PAD_X}px; background: #fafafa; border-top: 1px solid #ececec; border-radius: 0 0 14px 14px;">`,
  );
  if (opts?.unsubscribe !== false) {
    parts.push(
      `<div style="font-size: 11px; color: #80868b; line-height: 1.5; margin-bottom: 8px;">You're receiving this email because of your account or subscription with ${company}.</div>`,
    );
    parts.push(
      `<div style="font-size: 11px; line-height: 1.5; margin-bottom: 10px;"><a href="#" style="color: #1a73e8; text-decoration: none;">Unsubscribe</a> · <a href="#" style="color: #1a73e8; text-decoration: none;">Manage preferences</a> · <a href="#" style="color: #1a73e8; text-decoration: none;">Privacy policy</a></div>`,
    );
  }
  if (addr) {
    parts.push(
      `<div style="font-size: 11px; color: #9aa0a6; line-height: 1.5;">${addr}</div>`,
    );
  }
  parts.push("</div>");
  return parts.join("");
}

function email(parts: string[]) {
  return EMAIL_WRAP + parts.join("") + EMAIL_WRAP_END;
}
function metricGrid(items: Array<{ label: string; value: string; sub?: string }>) {
  const cellWidth = `${Math.floor(100 / Math.min(items.length, 3))}%`;
  const cols = items.length >= 3 ? 3 : items.length;
  const rows: string[][] = [];
  for (let i = 0; i < items.length; i += cols) {
    rows.push([]);
    for (let j = 0; j < cols; j++) {
      if (items[i + j]) rows[rows.length - 1]!.push(buildMetricCell(items[i + j]!, cellWidth));
    }
  }
  return `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 16px 0 20px 0; border-collapse: separate; border-spacing: 8px;">${rows
    .map((r) => `<tr>${r.join("")}</tr>`)
    .join("")}</table>`;
}
function buildMetricCell(item: { label: string; value: string; sub?: string }, width: string) {
  return `<td style="width: ${width}; vertical-align: top; padding: 14px 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ececec;"><div style="font-size: 11px; color: #80868b; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase; margin-bottom: 6px;">${item.label}</div><div style="font-size: 20px; color: #0a0a0a; font-weight: 600; line-height: 1.2; letter-spacing: -0.3px;">${item.value}</div>${item.sub ? `<div style="font-size: 12px; color: #5f6368; margin-top: 4px;">${item.sub}</div>` : ""}</td>`;
}

function keyVal(label: string, value: string) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 10px 0;"><tr><td style="font-size: 13px; color: #5f6368; padding: 0; vertical-align: top; width: 40%;">${label}</td><td style="font-size: 14px; color: #1f1f1f; padding: 0; vertical-align: top; font-weight: 500; text-align: right;">${value}</td></tr></table>`;
}
function keyValBlock(items: Array<{ label: string; value: string }>) {
  return `<div style="padding: 16px 18px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ececec; margin: 12px 0 20px 0;">${items.map((i) => keyVal(i.label, i.value)).join("")}</div>`;
}

function ctaButton(
  label: string,
  opts?: { color?: string; variant?: "solid" | "outline"; href?: string },
) {
  const color = opts?.color ?? "#1a73e8";
  const variant = opts?.variant ?? "solid";
  const href = opts?.href ?? "#";
  if (variant === "outline") {
    return `<a href="${href}" style="display: inline-block; padding: 11px 22px; font-size: 14px; font-weight: 500; color: ${color}; background: transparent; border: 1.5px solid ${color}; border-radius: 8px; text-decoration: none; margin: 0 4px 8px 0;">${label}</a>`;
  }
  return `<a href="${href}" style="display: inline-block; padding: 12px 22px; font-size: 14px; font-weight: 500; color: #ffffff; background: ${color}; border: none; border-radius: 8px; text-decoration: none; margin: 0 4px 8px 0;">${label}</a>`;
}
function ctaRow(buttons: string[]) {
  return `<div style="margin: 22px 0 16px 0;">${buttons.join("")}</div>`;
}

function infoCard(content: string, opts?: { accent?: string; tone?: "info" | "warn" | "ok" | "danger" }) {
  const accent =
    opts?.accent ??
    (opts?.tone === "warn"
      ? "#f59e0b"
      : opts?.tone === "ok"
        ? "#10b981"
        : opts?.tone === "danger"
          ? "#dc2626"
          : "#1a73e8");
  return `<div style="margin: 16px 0 20px 0; padding: 14px 16px; background: #f8f9fa; border-left: 3px solid ${accent}; border-radius: 0 8px 8px 0;"><div style="font-size: 14px; color: #1f1f1f; line-height: 1.55;">${content}</div></div>`;
}

function codeBlock(text: string) {
  return `<div style="margin: 12px 0 20px 0; padding: 12px 14px; background: #0d1117; border-radius: 6px; font-family: ${MONO_STACK}; font-size: 13px; color: #c9d1d9; line-height: 1.5; overflow-wrap: break-word;">${text}</div>`;
}
function inlineCode(text: string) {
  return `<span style="font-family: ${MONO_STACK}; font-size: 13.5px; background: #f0f0f0; color: #d63384; padding: 2px 6px; border-radius: 4px;">${text}</span>`;
}

function calendarDateTile(opts: {
  month: string;
  day: string;
  weekday?: string;
  accent?: string;
}) {
  const accent = opts.accent ?? "#1a73e8";
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin: 0 16px 16px 0; display: inline-table; border-collapse: separate;"><tr><td style="padding: 0;"><div style="width: 76px; border: 1px solid #ececec; border-radius: 8px; overflow: hidden; background: #ffffff;"><div style="background: ${accent}; color: #ffffff; padding: 4px 0; font-size: 11px; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: 1px;">${opts.month}</div><div style="padding: 8px 0 6px 0; font-size: 28px; font-weight: 600; color: #1f1f1f; text-align: center; line-height: 1; letter-spacing: -1px;">${opts.day}</div>${opts.weekday ? `<div style="padding: 0 0 6px 0; font-size: 11px; color: #5f6368; text-align: center; letter-spacing: 0.5px;">${opts.weekday.toUpperCase()}</div>` : ""}</div></td></tr></table>`;
}

function profileCard(opts: {
  name: string;
  title?: string;
  company?: string;
  initials?: string;
  accent?: string;
  rightLabel?: string;
}) {
  const accent = opts.accent ?? "#0a66c2";
  const initials =
    opts.initials ??
    opts.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("");
  return `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0; padding: 14px; background: #f8f9fa; border-radius: 10px;"><tr><td style="width: 56px; padding: 0 14px 0 0; vertical-align: middle;"><div style="width: 48px; height: 48px; background: ${accent}; color: #ffffff; border-radius: 50%; font-size: 17px; font-weight: 600; text-align: center; line-height: 48px; font-family: ${FONT_STACK};">${initials}</div></td><td style="vertical-align: middle;"><div style="font-size: 15px; font-weight: 600; color: #1f1f1f; line-height: 1.2;">${opts.name}</div>${opts.title || opts.company ? `<div style="font-size: 13px; color: #5f6368; margin-top: 2px; line-height: 1.3;">${[opts.title, opts.company].filter(Boolean).join(" · ")}</div>` : ""}</td>${opts.rightLabel ? `<td style="vertical-align: middle; text-align: right;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 600; color: ${accent}; background: #ffffff; border: 1px solid ${accent}; border-radius: 12px; letter-spacing: 0.2px;">${opts.rightLabel}</span></td>` : ""}</tr></table>`;
}

function bigStat(label: string, value: string, opts?: { color?: string }) {
  return `<div style="margin: 12px 0 24px 0; padding: 18px 20px; text-align: center; background: #f8f9fa; border-radius: 10px;"><div style="font-size: 12px; color: #5f6368; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">${label}</div><div style="font-size: 32px; color: ${opts?.color ?? "#0a0a0a"}; font-weight: 700; letter-spacing: -1px; line-height: 1.1;">${value}</div></div>`;
}

function statusPill(label: string, opts: { color: string; bg?: string }) {
  const bg = opts.bg ?? `${opts.color}1a`;
  return `<span style="display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 600; color: ${opts.color}; background: ${bg}; border-radius: 12px; letter-spacing: 0.3px; text-transform: uppercase;">${label}</span>`;
}

function prCheckRow(name: string, status: "passed" | "failed" | "running" | "skipped") {
  const icons = {
    passed: { icon: "✓", color: "#1a7f37" },
    failed: { icon: "✗", color: "#cf222e" },
    running: { icon: "●", color: "#bf8700" },
    skipped: { icon: "—", color: "#80868b" },
  } as const;
  const v = icons[status];
  return `<div style="margin: 0 0 6px 0; padding: 8px 12px; background: #ffffff; border: 1px solid #ececec; border-radius: 6px; display: flex; align-items: center; font-size: 13.5px;"><span style="display: inline-block; width: 18px; color: ${v.color}; font-weight: 700;">${v.icon}</span><span style="flex: 1; color: #1f1f1f; font-family: ${MONO_STACK}; font-size: 13px;">${name}</span></div>`;
}

function logRow(time: string, text: string, opts?: { tone?: "info" | "warn" | "ok" | "danger" }) {
  const color =
    opts?.tone === "warn"
      ? "#bf8700"
      : opts?.tone === "ok"
        ? "#1a7f37"
        : opts?.tone === "danger"
          ? "#cf222e"
          : "#1a73e8";
  return `<div style="margin: 0 0 6px 0; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; display: flex; gap: 12px; font-size: 13.5px; align-items: center;"><span style="font-family: ${MONO_STACK}; font-size: 12px; color: ${color}; font-weight: 600; flex-shrink: 0; min-width: 80px;">${time}</span><span style="color: #1f1f1f; flex: 1;">${text}</span></div>`;
}

function listItem(opts: { title: string; meta?: string; href?: string; emoji?: string }) {
  return `<div style="margin: 0 0 14px 0; padding-bottom: 14px; border-bottom: 1px solid #f0f0f0;">${opts.emoji ? `<span style="font-size: 16px; margin-right: 8px;">${opts.emoji}</span>` : ""}<a href="${opts.href ?? "#"}" style="font-size: 15px; font-weight: 600; color: #1f1f1f; text-decoration: none; line-height: 1.4;">${opts.title}</a>${opts.meta ? `<div style="font-size: 12.5px; color: #5f6368; margin-top: 4px; line-height: 1.4;">${opts.meta}</div>` : ""}</div>`;
}

function fineprint(text: string) {
  return `<div style="margin: 16px 0 0 0; font-size: 12px; color: #80868b; line-height: 1.5;">${text}</div>`;
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
          p(
            "I'm Alex — founder of Founderloop, a small team workflow tool serving early-stage startup ops teams. We've been quietly testing AI inbox tools for the last 6 weeks and yours is the one that keeps coming up in our internal Slack.",
          ),
          p(
            "Wanted to skip the lurking and reach out directly. Three things I'd love to learn more about, in priority order:",
          ),
          bullet(
            "<strong>Pilot access for our 9-person team.</strong> We've outgrown Superhuman and our SDRs are drowning in inbound. Would love to start a paid pilot this month if there's bandwidth.",
          ),
          bullet(
            "<strong>How summaries actually work under the hood.</strong> Most of the tools I've evaluated lose context once threads get past ~12 messages. Curious what you do differently — embedding strategy, summarization model, etc.",
          ),
          bullet(
            "<strong>API access.</strong> We'd want to pipe summaries into our own product. Is there a developer tier, and what does the rate-limit shape look like?",
          ),
          p(
            "Happy to share more about Founderloop and how we'd use VectorMail if it helps frame the conversation. Free anytime this week — 15 minutes is fine, or even just a reply to this email with the basics is great.",
          ),
          p("Thanks for building this. The inbox tooling space has needed someone to do it properly for years."),
          hr(),
          signature("Alex Rivera", "Founder & CEO · Founderloop", "alex@founderloop.com"),
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
          brandBlock("YC Community"),
          headline("Welcome to W24 · 247 companies, one batch"),
          p(
            "Hi founder,<br/><br/>Welcome to YC Winter 2024. You're part of a batch of 247 companies that we are absolutely fired up about. Over the next 13 weeks we're going to push you harder than you've ever been pushed, and at the end of it you'll have built more product, talked to more users, and grown faster than you thought possible. Let's get to work.",
          ),
          sectionTitle("Important dates (lock these in your calendar)"),
          keyValBlock([
            { label: "Today", value: "Profile + company description due Friday, EOD PT" },
            { label: "This week", value: "Office hours sign-ups open at 9 AM PT, Wednesday" },
            { label: "Week 2", value: "First Group office hours · meet your group partner" },
            { label: "Week 4", value: "Retreat #1 · Mountain View campus" },
            { label: "Week 6", value: "Demo Day prep begins" },
            { label: "Week 13", value: "Demo Day · investor day" },
          ]),
          sectionTitle("Three things to do this week"),
          bullet(
            "<strong>Finish your Bookface profile.</strong> 90% of the value of YC comes from your batchmates, not from us. Make it easy for them to find you. Take a real photo. Write what you're building in 2 sentences anyone can understand.",
          ),
          bullet(
            "<strong>Book office hours.</strong> Free slots fill within hours of release each Wednesday. You get one weekly slot with your Group Partner and unlimited Office Hours requests across the team. Use them.",
          ),
          bullet(
            "<strong>Join your group Slack.</strong> Invites went out yesterday. Twenty-ish companies, one channel, your closest support network for the next 13 weeks (and probably the next 10 years).",
          ),
          sectionTitle("Tactical resources we'll mention a lot"),
          bullet("YC Startup Library · video archive of every founder talk we've ever recorded."),
          bullet("Bookface · directory of every YC founder, with experiences searchable by tag."),
          bullet("Co-Founder Matching · in case you need one. We strongly prefer two-founder teams."),
          bullet("The Deal · standard YC deal terms, posted publicly so everyone is on equal footing."),
          ctaRow([
            ctaButton("Complete your profile", { color: "#ff6600" }),
            ctaButton("Office hours signups", { color: "#ff6600", variant: "outline" }),
            ctaButton("Open Bookface", { color: "#ff6600", variant: "outline" }),
          ]),
          fineprint(
            "If you have questions or can't access something, reply to this email and someone on the team will help. Welcome again — we believe in you, even on the days you don't.",
          ),
          companyEmailFooter("YC Community"),
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
        body: email([
          brandBlock("Stripe"),
          headline("Receipt from VectorMail"),
          bigStat("Amount paid", "$99.00 USD", { color: "#635bff" }),
          keyValBlock([
            { label: "Description", value: "VectorMail Pro · monthly subscription" },
            { label: "Receipt number", value: "INV-2026-002" },
            { label: "Invoice date", value: "Sunday, May 17, 2026" },
            { label: "Payment method", value: "Visa •• 4242 · exp 08/27" },
            { label: "Billed to", value: "demo@vectormail.app" },
            { label: "Next charge", value: "June 17, 2026 · same amount" },
            { label: "Period", value: "May 17 → June 17, 2026" },
          ]),
          sectionTitle("Summary"),
          keyValBlock([
            { label: "VectorMail Pro × 1", value: "$99.00" },
            { label: "Subtotal", value: "$99.00" },
            { label: "Tax (0.0%)", value: "$0.00" },
            { label: "Total paid", value: "$99.00 USD" },
          ]),
          ctaRow([
            ctaButton("Download invoice", { color: "#635bff", variant: "outline" }),
            ctaButton("Manage subscription", { color: "#635bff" }),
          ]),
          fineprint(
            "Something wrong? Reply to this email or contact us at support@vectormail.app. If you cancel, you'll keep Pro features until the end of the current billing period. Receipts cannot be modified after issue.",
          ),
          companyEmailFooter("Stripe"),
        ]),
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
          headline("3 new notifications across vectormail-ai"),
          p(
            "Catch up on what happened while you were away. Click any notification to jump straight to it on GitHub.",
          ),
          sectionTitle("Review approved · PR #142"),
          infoCard(
            `<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">${statusPill("Approved", { color: "#1f883d" })}<strong>fix(sync): handle Aurinko webhook 429s with exponential backoff</strong></div><div style="font-size: 13px; color: #5f6368;">Reviewer: <strong>marcus-liu</strong> · "ship it — the retry budget is exactly what I'd have asked for"<br/>14 files changed · +228 / −68 · All CI checks passed · Ready to merge to main</div>`,
            { accent: "#1f883d" },
          ),
          sectionTitle("You were mentioned · Issue #89"),
          infoCard(
            `<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">${statusPill("Open", { color: "#bf8700" })}<strong>RFC: replace Pinecone with pgvector at scale</strong></div><div style="font-size: 13px; color: #5f6368;">By <strong>elena-vargas</strong>: "+@you have you seen any concrete numbers on HNSW vs IVFFlat at our scale? Marcus's RFC is leaning HNSW but I want a second read before we commit."<br/>4 replies · 2 reactions · Labels: rfc, search</div>`,
            { accent: "#bf8700" },
          ),
          sectionTitle("New comment · vectormail-ai/vectormail-ai"),
          infoCard(
            `<div style="font-size: 14px; color: #1f1f1f; margin-bottom: 6px;"><strong>nathan-wu-yc</strong> commented on <code>src/lib/embedding/batch.ts</code></div><div style="font-size: 13.5px; color: #5f6368; font-family: ${MONO_STACK};">"This null-check looks defensive but the type guard should make it unreachable. Worth checking if Prisma can ever return null sysLabels — I think it can, and if so we want this at the schema layer, not here."</div>`,
            { accent: "#0969da" },
          ),
          ctaRow([
            ctaButton("View all notifications", { color: "#24292f" }),
            ctaButton("Mark all as read", { color: "#24292f", variant: "outline" }),
          ]),
          fineprint(
            "You're receiving this because you're watching <code>vectormail-ai/vectormail-ai</code>. Manage notification settings on GitHub.",
          ),
          companyEmailFooter("GitHub"),
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
          p(
            "Quick note — I've been using VectorMail every day for the last three weeks and it's the first email tool that's actually changed how I work. The summaries hit, the search hits, the briefs hit. Got my whole product team on the trial now. Thank you.",
          ),
          p(
            "One suggestion that's been bugging me: when I run a natural-language search like <em>'investor emails from last week mentioning the term sheet,'</em> the results are great — but I don't see <strong>which</strong> filters the AI inferred to get me there. Was it filtering by sender domain? Last 7 days? The phrase 'term sheet'? All three?",
          ),
          p(
            "If I could see the inferred filters as chips at the top (with the ability to remove or edit them inline), I could refine the query a lot faster instead of restarting from scratch. Right now if I want to tweak it, I have to retype the whole prompt.",
          ),
          sectionTitle("Concrete example I ran into yesterday"),
          infoCard(
            `Query: <em>"Slack messages from Marcus about the migration this week"</em><br/><br/>Results were great, but the chips I'd want to see:<br/>• <code>sender:Marcus</code> · ✓<br/>• <code>source:Slack</code> · ✓<br/>• <code>contains:"migration"</code> · ✓<br/>• <code>after:2026-05-12</code> · ✓<br/><br/>Removing any one of those inline would let me broaden or narrow the search without losing context.`,
          ),
          p(
            "This isn't a blocker, just the one thing that would make a 9/10 product a 10/10 for me. If it's on the roadmap, what's the timing? If not, want me to put it in your feedback portal?",
          ),
          p("Either way — great work. Keep shipping."),
          hr(),
          signature("Jordan Kim", "Head of Product · startup.io", "jordan@startup.io"),
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
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "19", weekday: "Tue" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">Product sync · weekly</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">2:00 PM – 2:30 PM PT · 30 min</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Recurring · weekly on Tuesday</div></td></tr></table>`,
          p(
            "You've been invited to the recurring Product sync. The agenda doc is shared 24 hours before each meeting — please add updates from your area there if you have any.",
          ),
          sectionTitle("Where"),
          keyValBlock([
            { label: "Video", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">meet.zoom.us/j/812-44-901</a> · pwd: vmprod` },
            { label: "Dial-in", value: "+1 (669) 900-6833 · ID 812 44 901 · PIN 9821" },
            { label: "Organizer", value: "Product Team (product@vectormail.app)" },
            { label: "Calendar", value: "Work" },
          ]),
          sectionTitle("Standing agenda"),
          bullet("Customer feedback from CS, sales, and support (10 min)"),
          bullet("This week's launches + blockers per pod (15 min)"),
          bullet("Next week's priorities + cross-team dependencies (5 min)"),
          sectionTitle("Attendees · 7"),
          profileCard({ name: "Dana Howe", title: "Head of Engineering", initials: "DH", accent: "#4285f4", rightLabel: "Organizer" }),
          profileCard({ name: "Marcus Liu", title: "CTO", initials: "ML", accent: "#34a853", rightLabel: "Accepted" }),
          profileCard({ name: "Aria Singh", title: "Customer Success", initials: "AS", accent: "#fbbc05", rightLabel: "Accepted" }),
          profileCard({ name: "Nathan Wu", title: "Senior Engineer", initials: "NW", accent: "#ea4335", rightLabel: "Tentative" }),
          ctaRow([
            ctaButton("Yes", { color: "#0caa41" }),
            ctaButton("Maybe", { color: "#1a73e8", variant: "outline" }),
            ctaButton("No", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            `Add agenda items in the linked doc by 12 PT Monday. If you can't attend, drop your written update in the doc — we'll incorporate it. Recurring meetings can be updated from your calendar without affecting series.`,
          ),
          companyEmailFooter("Calendar"),
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
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #80868b; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">Issue #412 · May 17, 2026</div>`,
          headline("This week in AI · the practical edge"),
          p(
            "<strong>Dear builders,</strong><br/><br/>The story this week isn't another frontier model release — it's that the practical edge is becoming harder to find and easier to lose. We've got three pieces on what that means for production, one new course, and the usual roundup of papers worth your time. Let's get into it.",
          ),
          sectionTitle("In this issue"),
          listItem({
            title: "Frontier model updates · what changed and what didn't",
            meta: "GPT, Claude, and Gemini all shipped new tiers this week. The benchmarks moved 1-3 points. The practical gap on real workloads is narrowing fast. Here's our take on where each one still leads.",
            emoji: "🧠",
          }),
          listItem({
            title: "RAG best practices for production · 2026 edition",
            meta: "Embedding strategies, chunking heuristics that survive a year in production, and the evaluation pipelines that actually catch regressions. Includes a checklist you can run against your stack today.",
            emoji: "📚",
          }),
          listItem({
            title: "Open-source roundup",
            meta: "Llama 3.2 multimodal, Mistral fine-tuning costs at our scale, and three new local-inference tools we've been keeping an eye on.",
            emoji: "🔧",
          }),
          listItem({
            title: "From the blog · running small models on-device without sacrificing quality",
            meta: "The hard part isn't shrinking the model — it's the eval harness around it. Here's the one we use.",
            emoji: "📱",
          }),
          sectionTitle("Featured · 'Building reliable RAG pipelines'"),
          infoCard(
            `<div style="font-size: 14px; line-height: 1.55;">A walk-through of the failure modes we keep seeing in production RAG: stale embeddings, drift in retrieval quality, evaluation that only measures the happy path. We share the monitoring stack and three eval suites we ship with every project.<br/><br/><a href="#" style="color: #0a8f5c; text-decoration: none; font-weight: 500;">Read the full piece →</a></div>`,
            { accent: "#0a8f5c" },
          ),
          sectionTitle("Papers worth your time this week"),
          bullet("<strong>'Long-context RAG without the regression cliff'</strong> — Stanford NLP. Provides a recipe to keep retrieval quality stable past 200K tokens."),
          bullet("<strong>'Speculative decoding for production agents'</strong> — Anthropic. ~2.4× throughput on multi-tool runs, almost no quality loss."),
          bullet("<strong>'On the limits of synthetic data for instruction tuning'</strong> — DeepMind. Sobering numbers on the cliff after ~30% synthetic mix."),
          sectionTitle("Community + courses"),
          p(
            `Andrew is teaching a new short course this week with NVIDIA: <strong>'Reinforcement Fine-Tuning for Reasoning Models.'</strong> 90 minutes, free, with hands-on notebooks. The first hundred students each week get a Q&A session. <a href="#" style="color: #0a8f5c; text-decoration: none;">Enroll →</a>`,
          ),
          ctaRow([
            ctaButton("Read full issue", { color: "#0a8f5c" }),
            ctaButton("Subscribe a friend", { color: "#0a8f5c", variant: "outline" }),
          ]),
          fineprint(
            "Keep building, and keep us posted on what you ship. — Andrew, John, and the DeepLearning.AI team. You're receiving this because you subscribed to The Batch.",
          ),
          companyEmailFooter("The Batch"),
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
          headline("Monthly investor update · February 2026"),
          p(
            "Hi everyone,<br/><br/>February was the best month of the year so far. We hit our Q1 ARR target a month early, shipped two of the four roadmap milestones, and closed two competitive deals that we've been chasing since November. Below is the data, the wins, the asks, and what we're worried about.",
          ),
          sectionTitle("Metrics"),
          metricGrid([
            { label: "MRR", value: "$184K", sub: "+18% MoM" },
            { label: "ARR", value: "$2.21M", sub: "+22% QoQ" },
            { label: "New logos", value: "9", sub: "vs target 7" },
            { label: "Churn", value: "0.6%", sub: "best month yet" },
            { label: "NRR", value: "117%", sub: "+9pp QoQ" },
            { label: "Pipeline", value: "$640K", sub: "weighted, 60d" },
          ]),
          sectionTitle("Wins"),
          bullet("<strong>Closed Brightlane expansion</strong> (50 → 75 seats, $30K ARR). Their VP Eng called the product 'category-defining' in our renewal call."),
          bullet("<strong>Shipped Buddy v2.</strong> The new streaming responses + multi-step tool use cut median reply latency from 4.2s to 1.1s."),
          bullet("<strong>Cobalt pentest complete</strong> with zero criticals and one resolvable medium. SOC 2 Type II audit period starts May 26."),
          bullet("<strong>Hired Nathan Wu.</strong> Senior backend engineer from Plaid. Starts June 9."),
          sectionTitle("What we're worried about"),
          bullet("Inbound from larger enterprise prospects (300+ headcount) is outpacing our ability to sell to them — we need a second AE within 6 weeks."),
          bullet("AI cost trending toward $11K in May vs $7K budget. Investigating whether to switch to a cheaper embedding model."),
          bullet("Aurinko (our email provider) had two regional outages in February. We're scoping a fallback endpoint."),
          sectionTitle("Asks (in priority order)"),
          bullet("<strong>2-3 design partner intros in fintech.</strong> We have a workflow tool in beta that fits ops-heavy fintechs. If you know a product or eng lead at a Series B-D fintech who'd take a 30-min look, the warm intro would mean a lot."),
          bullet("<strong>One senior backend engineer referral.</strong> We're hiring for the second senior eng on the platform team. Anyone you'd vouch for."),
          bullet("<strong>One go-to-market hire intro.</strong> Looking for our second AE in late Q2 — ideally someone who's sold productivity SaaS into mid-market."),
          p(
            "If you've got a slot, I'd love a 15-minute call to walk through the bottoms-up model for the rest of 2026. Otherwise, replies in this thread are great.",
          ),
          p("Thanks for the support — going to keep building."),
          hr(),
          signature("Sam Chen", "Partner", "sam@vcpartners.com"),
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
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Resolved · No further action</span></div>`,
          headline("Support ticket #8842 — resolved"),
          p(
            "Hi,<br/><br/>Your billing concern raised on Wednesday has been resolved. We re-checked the charge against your subscription history and confirmed you were billed twice for the May cycle. The duplicate charge has been refunded in full.",
          ),
          keyValBlock([
            { label: "Ticket", value: "#8842 · Billing · Severity 2" },
            { label: "Opened by", value: "demo@vectormail.app · 2026-05-14 11:42 PT" },
            { label: "Resolved by", value: "Aria Singh · 2026-05-15 16:14 PT" },
            { label: "Time to resolution", value: "1 day, 4 hours, 32 min" },
            { label: "Refund amount", value: "$99.00 USD" },
            { label: "Refund method", value: "Original card · Visa •• 4242" },
            { label: "Expected arrival", value: "5–7 business days (typically 2–3 for Visa)" },
            { label: "Stripe refund ID", value: "re_3PcL9aE2eZvKYlo2C" },
          ]),
          sectionTitle("Root cause + what we changed"),
          infoCard(
            "On May 12 our billing service retried a failed webhook handoff after Stripe returned a 502. The retry succeeded but the original charge had quietly also gone through. We've added a deduplication key on the Stripe event ID — the same bug can't happen again. We also pulled a report of the last 30 days to confirm yours is the only account that hit this; you are.",
            { tone: "ok" },
          ),
          sectionTitle("Anything else?"),
          p(
            "If you spot anything else odd on your account, reply directly to this email and it goes straight back to me (no queue, no bot). Otherwise: thank you for catching this and surfacing it — it directly led to a permanent fix.",
          ),
          ctaRow([
            ctaButton("View refund receipt", { color: "#1F3A2E" }),
            ctaButton("View billing history", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint(
            "Ticket #8842 will close automatically in 7 days unless you reply. Your satisfaction with this resolution would be appreciated — there's a one-question survey in the dashboard.",
          ),
          companyEmailFooter("VectorMail Support"),
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
          p("Hey team,"),
          p(
            "First — I love the product. Been on Pro for two months and the briefs alone have saved me from missing two investor follow-ups. Worth the price tag a few times over.",
          ),
          p(
            "Wanted to throw a feature request out there since I haven't seen it on the roadmap. <strong>Calendar integration.</strong> Specifically: when I'm composing or scheduling a reply, I'd love VectorMail to know my calendar and:",
          ),
          bullet("Detect when I'm proposing a time that conflicts with an existing event, and warn me inline."),
          bullet("Suggest 2–3 open slots that match the other person's working hours (if I'm replying to a known contact)."),
          bullet("Auto-add a meeting block to my calendar when I send a scheduling reply (Calendly is fine but the back-and-forth before booking is what eats my day)."),
          p(
            "I work across Google Calendar and one shared team calendar in Notion. If you only support one initially, Google Calendar is the higher-priority for me.",
          ),
          p(
            "Is this on the roadmap? Even a 'maybe Q4' would help me decide whether to keep using Calendly's standalone scheduler or wait. Happy to be a design partner on it if useful."),
          hr(),
          signature("Morgan Lee", "Head of Operations · Product Hunt", "morgan@producthunt.com"),
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
          p("Hi,"),
          p(
            "Great call yesterday. The energy on both sides was good and I came away convinced this is worth pursuing seriously. Attached are the two artifacts I promised: the partnership proposal deck and a one-pager summarizing the four next steps we landed on.",
          ),
          sectionTitle("Recap of what we agreed"),
          bullet(
            "<strong>Scope.</strong> Co-marketing partnership tied to a joint customer story (Brightlane is the target case study). VectorMail powers the AI inbox layer, PartnerCo handles the workflow orchestration."),
          bullet(
            "<strong>Commercial shape.</strong> Revenue share on customers we co-source. 60/40 in VectorMail's favor for customers under 100 seats, 50/50 above. No exclusivity either way."),
          bullet("<strong>Joint asset.</strong> A 25-minute webinar in early July with one of your customers and one of ours."),
          bullet("<strong>Timeline.</strong> Sign LOI by end of month, launch the co-marketing motion in mid-June."),
          sectionTitle("Four next steps (owners + dates)"),
          bullet("<strong>You.</strong> Decide whether the rev-share split is workable for your team. Reply by Friday if possible."),
          bullet("<strong>Me.</strong> Send the LOI draft Monday."),
          bullet("<strong>Marketing leads (both sides).</strong> Align on the joint webinar topic and date by next Wednesday."),
          bullet("<strong>Both of us.</strong> Schedule a 30-min follow-up next week to lock the LOI and kick off the webinar working group."),
          p(
            "Let me know your availability next week — I'm wide open Tue afternoon and Thu morning. The deck is attached at the top of the thread. If anything in there is off from how you remember the call, please call it out so we can correct before sharing internally."),
          p("Excited about this one."),
          hr(),
          signature("Casey Park", "Head of Partnerships · PartnerCo", "casey@partnerco.com"),
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
          headline("Your week on LinkedIn"),
          p("Here's a recap of your profile activity, post performance, and the most relevant opportunities from your extended network this week."),
          metricGrid([
            { label: "Profile views", value: "47", sub: "+18% WoW" },
            { label: "Post impressions", value: "12,840", sub: "+34%" },
            { label: "Search appearances", value: "184" },
            { label: "New connections", value: "12" },
            { label: "Followers", value: "+38" },
            { label: "Profile rank", value: "Top 1%", sub: "in your network" },
          ]),
          sectionTitle("Top post this week"),
          infoCard(
            `<div style="font-size: 14px; color: #1f1f1f; margin-bottom: 8px;">"Three things I wish I'd known before I built a 'reads-itself' inbox. Spoiler: the AI is the easy part."</div><div style="font-size: 12.5px; color: #5f6368;">Posted Wednesday · <strong>4,128</strong> impressions · <strong>112</strong> reactions · <strong>34</strong> comments · <strong>18</strong> reposts</div>`,
            { accent: "#0a66c2" },
          ),
          sectionTitle("People who viewed your profile"),
          profileCard({ name: "Sarah Chen", title: "Product · Stripe", initials: "SC", accent: "#0a66c2", rightLabel: "Stripe" }),
          profileCard({ name: "Mike Torres", title: "Engineering Lead · Notion", initials: "MT", accent: "#0a66c2", rightLabel: "Notion" }),
          profileCard({ name: "Dana Howe", title: "Head of Eng · VectorMail", initials: "DH", accent: "#0a66c2", rightLabel: "Your team" }),
          profileCard({ name: "Lina Ortiz", title: "Recruiting · Greenhouse", initials: "LO", accent: "#0a66c2", rightLabel: "Recruiter" }),
          sectionTitle("Roles your profile fits · 5"),
          listItem({
            title: "Head of Engineering · Series B fintech",
            meta: "Remote · San Francisco (preferred) · 2 connections work here · $260K – $340K + equity",
            emoji: "💼",
          }),
          listItem({
            title: "VP Product · AI infrastructure company",
            meta: "Hybrid · NYC · Recommended based on your profile · $280K – $360K",
            emoji: "💼",
          }),
          listItem({
            title: "Founding Engineer · Stealth AI workflow startup",
            meta: "Remote · Applied by 47 others · Equity-heavy comp",
            emoji: "💼",
          }),
          listItem({
            title: "Engineering Manager · Platform · Linear",
            meta: "Remote · 2 connections work here · Posted 3 days ago",
            emoji: "💼",
          }),
          listItem({
            title: "VP Engineering · Series A consumer · Austin",
            meta: "On-site · 1 connection works here · $250K – $310K",
            emoji: "💼",
          }),
          sectionTitle("Trending in your feed"),
          bullet("Posts on agentic infra and on-device AI are getting 2-3× normal engagement in your network."),
          bullet("3 founders you follow posted hiring threads — likely to engage if you comment."),
          bullet("The 'how we built it' format outperforms 'thought leadership' 4:1 this month."),
          ctaRow([
            ctaButton("See full digest", { color: "#0a66c2" }),
            ctaButton("Share an update", { color: "#0a66c2", variant: "outline" }),
          ]),
          fineprint(
            "Digest preferences: weekly · You can unsubscribe from these notifications or set your preferences. LinkedIn Corporation, 1000 W Maude Ave, Sunnyvale, CA 94085.",
          ),
          companyEmailFooter("LinkedIn"),
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
          headline("Design review · Q1 roadmap · Tuesday 10 AM"),
          p("Hi everyone,"),
          p(
            "Quick note ahead of Tuesday's design review. We'll be walking through the updated flows and components for the four Q1 roadmap items, aligning on any changes, and locking the handoff for engineering. The bar for Tuesday is: every item should be ready for engineering to start estimating Wednesday morning.",
          ),
          sectionTitle("What we'll cover (10 AM – 11:15 AM PT)"),
          bullet("<strong>Inbox v3 triage column</strong> — the new sorting model + the brief-card density change. Most likely to need iteration."),
          bullet("<strong>Buddy chat surface</strong> — final pass on the inline reply UI and the new tool-use indicator."),
          bullet("<strong>Settings IA</strong> — the rebuilt nav and the consolidated account/security/billing page."),
          bullet("<strong>Mobile shell</strong> — first proper look at the iOS bottom-tab structure."),
          sectionTitle("Before the meeting (Monday EOD)"),
          bullet(`<strong>Read the doc:</strong> <a href="#" style="color: #1a73e8; text-decoration: none;">Q1 design rationale</a> (8 min read)`),
          bullet(`<strong>Skim the Figma:</strong> <a href="#" style="color: #1a73e8; text-decoration: none;">Q1 — Designs for review</a>. Comments inline are fine.`),
          bullet("<strong>Drop feedback</strong> in <code>#design-q1</code> or directly in Figma. We'll group it on Tuesday so we spend the meeting on disagreements, not introductions."),
          sectionTitle("If you can't make it"),
          p(
            "Drop a written note in the Slack channel with your feedback and we'll capture it as if you were there. The recording will be shared within an hour and we'll DM you for any decisions you should weigh in on async.",
          ),
          p("See you Tuesday."),
          hr(),
          signature("Taylor Reed", "Design Lead · VectorMail", "taylor@design.io"),
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
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Urgent · By EOD today</span></div>`,
          headline("Need an API rate-limit bump before our launch tomorrow"),
          p("Hi VectorMail team,"),
          p(
            "We're going live with our beta tomorrow morning (May 18) and our load tests today started tripping your API rate limits. Right now we're capped at 100 req/min per API key on the Pro plan and we're projecting ~400 req/min sustained during the launch window, with bursts to ~900.",
          ),
          sectionTitle("What we need"),
          keyValBlock([
            { label: "Account", value: "company.com · Pro plan · 18 months tenure" },
            { label: "API key", value: "vmk_prod_••••••••H9wX" },
            { label: "Current limit", value: "100 req/min · 5,000 req/day" },
            { label: "Requested limit", value: "1,500 req/min · 100,000 req/day" },
            { label: "Window needed", value: "May 18 (launch day) → permanent if usage stays" },
            { label: "Ticket", value: "#9912 (filed 4 hours ago, no response yet)" },
          ]),
          sectionTitle("Why this is a hard deadline"),
          infoCard(
            "Press launch is at 9 AM PT tomorrow with a coordinated TechCrunch piece. If our integration hits 429s during peak traffic, our biggest moment of the year fails publicly. We're a paying Pro customer in good standing — this is the kind of bump that should be one-click.",
            { tone: "danger" },
          ),
          sectionTitle("What we've already done"),
          bullet("Filed ticket #9912 at 09:42 PT this morning. No reply yet."),
          bullet("Tried the in-app 'request limit increase' flow — got 'we'll review within 3 business days.'"),
          bullet("Posted in your Discord — got referred back to support."),
          p(
            "Hoping someone senior can step in and just approve this. Happy to upgrade plans if needed, but we shouldn't need to in order to get a one-day burst that any reasonable API would handle gracefully. Marcus on your team has my number if a call is faster.",
          ),
          p("Thanks in advance — we love what you've built and want tomorrow to work."),
          hr(),
          signature("DevOps Team", "Engineering · company.com", "devops@company.com"),
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
          p("Hi,"),
          p(
            "Thanks for sending the pricing breakdown — really helpful to see it side by side. We talked it through internally yesterday and the Team plan is the right fit for us at our current size, with the option to upgrade if we hit the seat ceiling.",
          ),
          sectionTitle("What we'd like to do"),
          bullet("<strong>Plan:</strong> Team · 25 seats to start (we may add 5–10 more in Q3 depending on hiring)"),
          bullet("<strong>Term:</strong> 12 months, annual billing"),
          bullet("<strong>Start date:</strong> Tuesday next week, May 26"),
          bullet("<strong>Payment:</strong> ACH preferred (Net-30 if possible, otherwise upfront is fine)"),
          p(
            "Could you send over the contract template so our legal can review? We're not expecting many edits — your terms looked clean to our paralegal on the initial scan — but we'll mark up anything that stands out and send back within 48 hours.",
          ),
          p(
            "Also: we'd love to keep the rep we worked with through the eval (Aria) as our point of contact post-signature. Is that the standard handoff, or does it shift to CS at signing?",
          ),
          p("Thanks for making this easy. Excited to get the rest of the team onto it."),
          hr(),
          signature("Riley Adams", "Chief of Staff · startup.co", "riley@startup.co"),
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
          headline("New sign-in to your Google Account"),
          p(
            `Hi,<br/><br/>Your Google Account <strong>demo@vectormail.app</strong> was just used to sign in on Chrome on Windows. If this was you, you can safely ignore this email — we send these the first time we see a new device or browser on your account.`,
          ),
          keyValBlock([
            { label: "Device", value: "Windows 11 · Chrome 124" },
            { label: "App", value: "Browser (Gmail web)" },
            { label: "Location", value: "San Francisco, CA, United States" },
            { label: "IP address", value: "73.222.•••.••• (Comcast Cable)" },
            { label: "Date & time", value: "Friday, May 15, 2026 · 6:42 PM PT" },
          ]),
          sectionTitle("If this was you"),
          p(
            "No action needed. You can keep using your account as usual. Google will keep this device flagged as 'recognized' for the next 28 days unless you sign out.",
          ),
          sectionTitle("If this wasn't you"),
          infoCard(
            "Someone may have your password. Change it immediately and review your recent security activity. We'll walk you through revoking access tokens and turning on 2-step verification if it isn't on already.",
            { tone: "danger" },
          ),
          ctaRow([
            ctaButton("Check activity", { color: "#1a73e8" }),
            ctaButton("Don't recognize this", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            "Google will never ask you for your password, verification code, or any other sensitive information by email. To find out more about why we send these alerts, visit the Google Account Help Center.",
          ),
          companyEmailFooter("Google"),
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
          headline("Sprint planning · Thursday 9 AM · prep needed by Wed EOD"),
          p("Hi team,"),
          p(
            "Sprint planning is Thursday 9 AM. The bar for the meeting is: we leave with a committed sprint and every blocker named. To make that happen, we need everyone's availability + headcount blockers in the planning doc by <strong>EOD Wednesday</strong>.",
          ),
          sectionTitle("Agenda · 60 minutes"),
          logRow("0:00 – 0:10", "Retro outcomes — top 3 action items from last sprint, status check", { tone: "info" }),
          logRow("0:10 – 0:25", "Capacity + time-off — update the doc with your availability", { tone: "info" }),
          logRow("0:25 – 0:55", "Sprint goals + backlog — prioritization, commitment for the next two weeks", { tone: "info" }),
          logRow("0:55 – 1:00", "Risks + closing — what could derail this sprint", { tone: "warn" }),
          sectionTitle("Carrying into this sprint (3 items)"),
          bullet("VM-118 · Outlook beta polish — 60% complete, Nathan continuing"),
          bullet("VM-167 · Scheduled-send dashboard — blocked on design, unblocking Tuesday"),
          bullet("VM-174 · Aurinko fallback endpoint switching — needs estimation"),
          sectionTitle("New for triage (you'll see these in the planning doc)"),
          bullet("VM-208 · pgvector migration · final cutover plan (Marcus, big rock)"),
          bullet("VM-211 · Inbox v3 triage column · post-design (engineering for two)"),
          bullet("VM-214 · Buddy v2.1 · streaming tool-use indicator"),
          bullet("VM-219 · SOC 2 evidence collection automation (carryover from Vanta)"),
          p(
            `Doc: <a href="#" style="color: #1a73e8; text-decoration: none; font-weight: 500;">Sprint 11 planning doc</a>. Add your availability, blockers, and any items you want to nominate — we'll group and prioritize before Thursday so the meeting is decisions, not introductions.`,
          ),
          p("See you Thursday."),
          hr(),
          signature("Engineering", "Sprint planning · vectormail-ai", "eng@company.com"),
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
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Accepted · Confirm by Friday</span></div>`,
          headline(`Your proposal "AI for Inbox Zero" has been accepted`),
          p(
            "Congratulations! The ProductCon 2026 program committee unanimously selected your proposal from a pool of 412 submissions. We're excited to have you join the lineup.",
          ),
          sectionTitle("Session details"),
          keyValBlock([
            { label: "Track", value: "Product & AI" },
            { label: "Format", value: "25-minute talk + 5-min Q&A" },
            { label: "Slot", value: "Day 2 · Tuesday, Oct 14 · 2:00 PM PT" },
            { label: "Room", value: "Main hall (1,200 capacity)" },
            { label: "Recording", value: "Yes · published to YouTube ~3 weeks after" },
            { label: "Expected audience", value: "~900 in-person, ~6,000 livestream" },
            { label: "Honorarium", value: "$2,500 + travel & lodging covered" },
          ]),
          sectionTitle("Next steps · confirm by Friday"),
          bullet("Reply to this email confirming your participation (or decline) by EOD Friday."),
          bullet("Within 7 days of confirming, we'll send: the speaker kit, slide template, A/V tech check link, and your green-room schedule."),
          bullet("Travel and lodging logistics open 30 days out. We use the conference travel desk — they'll handle flights, hotel, and ground transport."),
          bullet("If you need accommodations (dietary, accessibility, childcare on site), please let us know in your confirmation reply so we can coordinate."),
          sectionTitle("Why we picked you"),
          infoCard(
            `From the program chair: "The proposal threaded the needle on the AI-inbox category at exactly the right level of depth for our audience. We're hearing a lot of high-level AI talks this year — yours stood out for being practical, opinionated, and grounded in real customer outcomes. Excited for it."`,
            { accent: "#0a2540" },
          ),
          ctaRow([
            ctaButton("Confirm participation", { color: "#0a2540" }),
            ctaButton("Decline (with reason)", { color: "#0a2540", variant: "outline" }),
            ctaButton("Ask a question", { color: "#0a2540", variant: "outline" }),
          ]),
          fineprint(
            "If we don't hear from you by Friday, we'll release the slot to the alternate. Please reply even if you're not sure yet so we can hold the slot another 48 hours.",
          ),
          companyEmailFooter("Conference Team"),
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
          headline("Invoice INV-2044 · Net-14"),
          p(
            "Thank you for your business. Below is the invoice for consulting services performed during the May 2026 cycle. Reply to this email if anything needs to be adjusted before our finance team processes it on our side.",
          ),
          bigStat("Amount due", "$2,400.00 USD"),
          keyValBlock([
            { label: "Invoice number", value: "INV-2044" },
            { label: "Issue date", value: "May 14, 2026" },
            { label: "Due date", value: "May 28, 2026 (Net-14)" },
            { label: "Billed to", value: "VectorMail HQ · 535 Mission St, San Francisco, CA 94105" },
            { label: "Billed from", value: "Vendor Co · 1280 Battery St #200, San Francisco, CA 94111" },
            { label: "Tax ID", value: "84-1234567" },
            { label: "Currency", value: "USD" },
          ]),
          sectionTitle("Line items"),
          keyValBlock([
            { label: "Platform integration (consulting) · 40 hrs @ $60/hr", value: "$2,400.00" },
            { label: "Subtotal", value: "$2,400.00" },
            { label: "Tax (exempt)", value: "$0.00" },
            { label: "Total due", value: "$2,400.00 USD" },
          ]),
          sectionTitle("Payment methods"),
          bullet("<strong>ACH</strong> — preferred. Routing 122000247 · Account 9012345678 · Reference 'INV-2044'."),
          bullet("<strong>Wire</strong> — same routing/account; please bear all wire fees on your side."),
          bullet("<strong>Card</strong> — through the payment portal (2.9% processing fee applied)."),
          ctaRow([
            ctaButton("Pay invoice", { color: "#1f2937" }),
            ctaButton("Download PDF", { color: "#1f2937", variant: "outline" }),
            ctaButton("Dispute or adjust", { color: "#1f2937", variant: "outline" }),
          ]),
          fineprint(
            "Late payments may be subject to a 1.5% monthly finance charge. For questions, reply to billing@vendor.co or contact your account manager directly.",
          ),
          companyEmailFooter("Vendor Co"),
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
          p(
            "Been way too long since the last time we caught up — I keep meaning to text and then a week becomes a month becomes a quarter. Want to fix that.",
          ),
          p(
            "I'm downtown both Thursday and Friday for client stuff and would love to grab lunch one of those days. Either works on my side. We could do the usual at Tartine if you're up for a bit of a walk, or somewhere closer to your office if you only have an hour.",
          ),
          p(
            "Also — heard the bits and pieces from mutual friends about how things are going at the company. Would love to hear the actual story straight from you over food rather than the LinkedIn-curated version.",
          ),
          p("Reply when you get a sec. No pressure if this week is too packed — we can shoot for next."),
          hr(),
          signature("Jamie"),
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
          headline("Updated API reference is live · feedback by EOW"),
          p("Hi,"),
          p(
            "Shipped the rewritten API reference to docs.vectormail.app/api this morning. This is the third round of revisions based on the OSS contributor feedback from January and the in-person session with the Linear team last month. Big rewrites in two sections, smaller polish across the rest.",
          ),
          sectionTitle("Major changes"),
          bullet(
            "<strong>Authentication</strong> — completely rewritten. Now covers API keys + OAuth + bearer tokens with side-by-side examples in cURL, TypeScript, Python. Old version got 4 of 5 most common support questions wrong.",
          ),
          bullet(
            "<strong>Webhooks</strong> — new section with examples for all 14 event types, the signature-verification snippet, and a 'common failure modes' subsection.",
          ),
          bullet(
            "<strong>Pagination</strong> — clarified the difference between cursor and offset and which endpoints support which (people were guessing).",
          ),
          bullet("<strong>Rate limits</strong> — added per-endpoint limits in a table; before they were only in prose."),
          sectionTitle("Small polish across the rest"),
          bullet("Consistent code snippets across all three languages."),
          bullet("Every example now has a 'run in CodeSandbox' button."),
          bullet("Search now finds parameters by name, not just headings."),
          bullet("Mobile rendering doesn't break the sidebar anymore (sorry — known issue for 6 months)."),
          sectionTitle("What I need from you"),
          p(
            `Please read the auth + webhooks sections specifically — those are the highest-traffic pages and the most likely to have content errors. Drop comments in <a href="#" style="color: #1a73e8; text-decoration: none;">the docs review doc</a> or directly in the page (we shipped inline comments yesterday). Anything you flag by EOW gets fixed before we mark the docs 'stable' next Tuesday.`,
          ),
          ctaRow([
            ctaButton("Open docs", { color: "#1a73e8" }),
            ctaButton("Add inline comment", { color: "#1a73e8", variant: "outline" }),
            ctaButton("File a docs issue", { color: "#1a73e8", variant: "outline" }),
          ]),
          hr(),
          signature("Dev Rel", "Developer Relations · VectorMail", "devrel@company.com"),
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
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "18", weekday: "Mon" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">Team All-Hands · May</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">10:00 AM – 11:00 AM PT · 1 hour</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Monthly recurring · second Monday</div></td></tr></table>`,
          p("This is your 24-hour reminder for tomorrow's monthly all-hands. Dana is hosting; agenda + the recording link below."),
          sectionTitle("Where"),
          keyValBlock([
            { label: "Video", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">meet.google.com/vmh-allhands</a>` },
            { label: "Dial-in", value: "+1 (929) 205-6099 · ID 824 32 109" },
            { label: "Calendar", value: "Work · VectorMail HQ" },
            { label: "Host", value: "Dana Howe (dana@vectormail.app)" },
          ]),
          sectionTitle("Agenda · 60 minutes"),
          logRow("10:00 – 10:05", "Open + safety message · Dana", { tone: "info" }),
          logRow("10:05 – 10:20", "Quarter so far · CEO + CFO · KPIs and how we're tracking", { tone: "info" }),
          logRow("10:20 – 10:35", "Product demo: Buddy v2 streaming · Marcus + Elena", { tone: "info" }),
          logRow("10:35 – 10:45", "Customer story of the month: Brightlane (recorded) · Aria", { tone: "info" }),
          logRow("10:45 – 11:00", "Q&A — submit questions in Slido (link in #all-hands)", { tone: "info" }),
          sectionTitle("Pre-read"),
          bullet("Slide deck will be posted in <code>#all-hands</code> by 9:00 AM PT tomorrow."),
          bullet("Submit Q&A questions anonymously through the Slido link (open now)."),
          bullet("Join 2-3 min early to test mic + camera if you'll speak."),
          ctaRow([
            ctaButton("Join Meet", { color: "#1a73e8" }),
            ctaButton("Add Q&A in advance", { color: "#1a73e8", variant: "outline" }),
            ctaButton("Open agenda doc", { color: "#1a73e8", variant: "outline" }),
          ]),
          fineprint(
            "You're receiving this because you're invited to this recurring event. To stop these reminders, edit your notification settings in Google Calendar.",
          ),
          companyEmailFooter("Calendar"),
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
          headline("Brightlane MSA · review complete · two minor comments before signing"),
          p(
            "We've finished the legal review of the Brightlane MSA you sent for the Q2 renewal. Overall, the contract is in good shape — significantly cleaner than what we typically see from customers of this size. Recommend signing as-is with two small fixes to the language. Neither is a deal-blocker; both are protective for us in scenarios that are unlikely but worth covering.",
          ),
          sectionTitle("Two comments inline in the doc"),
          infoCard(
            `<strong>§4.2 · Limitation of liability</strong> — current language caps our total liability at 1× fees paid in the trailing 12 months. Industry-standard for this deal size is the same number for direct damages, but consequential / indirect damages should be excluded outright rather than capped. <strong>Proposed edit</strong> in the redline.<br/><br/><strong>Risk if we don't fix:</strong> if Brightlane has a major outage on their side that happens to touch our system, they could argue the consequential losses are within our cap. Probably wouldn't win — but not worth leaving the ambiguity.`,
            { tone: "warn" },
          ),
          infoCard(
            `<strong>§7.1 · Termination for convenience</strong> — currently allows either side to terminate with 30 days' notice. Two-way is fine, but the language doesn't address what happens to prepaid amounts. <strong>Proposed edit:</strong> add a single sentence — "Termination for convenience by Customer does not entitle Customer to a refund of prepaid annual fees."<br/><br/><strong>Why it matters:</strong> this clause is the kind of thing that, in a downturn, customers occasionally try to exploit to claw back annual prepays.`,
            { tone: "warn" },
          ),
          sectionTitle("Everything else"),
          bullet("DPA references the Standard Contractual Clauses correctly · ✓"),
          bullet("Auto-renewal language is mutual and gives both sides 60 days' notice · ✓"),
          bullet("Service credits and SLA escalation language is on our paper, unchanged · ✓"),
          bullet("Insurance requirements ($2M cyber, $1M E&O) match our policy · ✓"),
          bullet("IP, confidentiality, publicity clauses are clean · ✓"),
          p(
            "Once §4.2 and §7.1 are tightened we're ready to sign. Brightlane has been a great customer to work with — happy to redline back on a call if it's faster, or you can route the final draft to me and I'll close it out tonight.",
          ),
          hr(),
          signature("Legal", "Legal Team · VectorMail", "legal@vectormail.app"),
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
          p(
            "Hi,<br/><br/>This is a regular check-in on your VectorMail subscription. Everything is in order — your account is active, your payment method is valid, and you're well within the limits of your plan.",
          ),
          keyValBlock([
            { label: "Plan", value: "VectorMail Pro · monthly" },
            { label: "Status", value: "Active · in good standing" },
            { label: "Email", value: "demo@vectormail.app" },
            { label: "Next billing date", value: "June 17, 2026" },
            { label: "Amount", value: "$99.00 USD" },
            { label: "Payment method", value: "Visa •• 4242 (valid until 08/27)" },
            { label: "Member since", value: "September 2024" },
          ]),
          sectionTitle("Your usage this month"),
          metricGrid([
            { label: "Threads synced", value: "14,247", sub: "no rate limits" },
            { label: "AI summaries", value: "1,128", sub: "unlimited on Pro" },
            { label: "Drafts written", value: "247", sub: "by Buddy" },
            { label: "Searches", value: "894", sub: "natural-language" },
          ]),
          sectionTitle("Anything to do?"),
          p(
            "Nothing — this email is informational. We'll send another one only if your payment method needs attention or you cross a usage threshold worth flagging. If you have questions about your plan or want to switch tiers (Team or Enterprise), reply to this email and we'll route you to the right person.",
          ),
          ctaRow([
            ctaButton("Manage subscription", { color: "#1F3A2E" }),
            ctaButton("View billing history", { color: "#1F3A2E", variant: "outline" }),
            ctaButton("Talk to a human", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint(
            "You're receiving this because you have an active VectorMail subscription. You can adjust how often we send these summaries in your account settings.",
          ),
          companyEmailFooter("VectorMail"),
        ]),
        summary: "Billing status: account in good standing. No action required. Informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-26",
        subject: "Re: Series A term sheet",
        senderName: "Priya Mehta",
        senderEmail: "priya@horizoncap.vc",
        daysAgo: 1,
        hour: 14,
        snippet: "Updated term sheet attached. Three open items - need your call by Wednesday.",
        body: email([
          p("Hi,"),
          p(
            "Great progress on the call yesterday. Attached is the updated term sheet reflecting where we landed. Most of the structural pieces are now in shape — clean preferred, standard vesting, no participation, no IP escrow weirdness — and our counsel signed off on the final draft this morning.",
          ),
          p(
            "Three open items I'd like your call on by <strong>Wednesday EOD</strong> so we can sign by Friday and start the closing process Monday:",
          ),
          sectionTitle("Open items"),
          bullet(
            "<strong>Pro-rata rights.</strong> Agreed for the lead (us) at 1.0×. We're proposing 1.5× cap for follow-on participants. Anything north of that and we'll need to reopen the cap table conversation.",
          ),
          bullet(
            "<strong>Board composition.</strong> One investor seat (us, taken by Priya). One independent to be mutually agreed within 90 days of closing. Founder retains chair. No observer seats — clean five-person board at the next round.",
          ),
          bullet(
            "<strong>Liquidation preference.</strong> 1× non-participating preferred, broad-based weighted-average anti-dilution. Standard and clean — but I want to make sure we're aligned before counsel papers it.",
          ),
          sectionTitle("Headline terms (for reference)"),
          keyValBlock([
            { label: "Round", value: "Series A" },
            { label: "Raise", value: "$18M" },
            { label: "Pre-money", value: "$72M" },
            { label: "Post-money", value: "$90M" },
            { label: "Option pool top-up", value: "12% post-money (pre-issuance)" },
            { label: "Lead", value: "Horizon Capital ($12M)" },
            { label: "Participation", value: "Forerunner, Index, Foundry (~$6M total)" },
            { label: "Closing target", value: "First week of June" },
          ]),
          p(
            "Happy to jump on a 30-minute call if redlines are faster that way — I'm holding 11–12 PT and 3–4 PT Tuesday open just in case. Otherwise, send the marked-up doc straight to counsel (cc'd) and we'll turn it in 24 hours.",
          ),
          p("Looking forward to closing this and getting back to building."),
          hr(),
          signature("Priya Mehta", "Partner · Horizon Capital", "priya@horizoncap.vc"),
        ]),
        summary: "Lead investor sent updated Series A term sheet. Action: respond on 3 open items by Wednesday. Time-sensitive.",
        labels: [labelImportant],
        read: false,
        messageCount: 2,
        replySnippet: "Reviewing tonight - redlines by tomorrow EOD.",
        replyBody: email([
          replyMeta("Re: Series A term sheet"),
          p("Hi Priya,"),
          p("Reading tonight - will send redlines back by tomorrow EOD. Aligned on pro-rata and board structure. Liquidation is where I'll have the most marked up."),
          p("Talk soon."),
          hr(),
          signature("Demo User"),
          emailFooter(),
        ]),
      },
      {
        id: "demo-thread-27",
        subject: "Board meeting prep - April",
        senderName: "Owen Falk",
        senderEmail: "owen@indexvc.com",
        daysAgo: 2,
        hour: 11,
        snippet: "Sharing the agenda + pre-read for the April board meeting. Two decisions need your sign-off.",
        body: email([
          p("Hi,"),
          p(
            "April board meeting prep is staged in the shared drive — link below. Pre-read covers Q1 KPIs vs plan, the new GTM motion that's been compounding the last 8 weeks, and two governance items the board will need to sign off on at the meeting.",
          ),
          sectionTitle("Pre-read · what's in the doc"),
          bullet("Tab 1: <strong>Financials</strong> — Q1 vs plan, burn, runway, and the updated bottoms-up model for the rest of 2026."),
          bullet("Tab 2: <strong>KPIs</strong> — ARR, NRR by cohort, activation, retention curves (your strongest chart this quarter)."),
          bullet("Tab 3: <strong>GTM</strong> — outbound experiment results, top-of-funnel attribution, and the case for doubling the BDR team."),
          bullet("Tab 4: <strong>Hiring</strong> — proposed plan to ship through Q3 (8 new heads, leveled and budgeted)."),
          bullet("Tab 5: <strong>Pricing</strong> — proposed self-serve reset with cohort impact modeling and the rollout plan."),
          sectionTitle("Two decisions for the board"),
          bullet(
            "<strong>Hiring plan.</strong> 8 new heads through Q3. Currently spending below plan, but the proposal pulls us back to plan + 1 head. Counsel has reviewed the budget impact on next round dilution.",
          ),
          bullet(
            "<strong>Self-serve pricing reset.</strong> Net-revenue impact is modeled at +18% based on the cohort A/B that just wrapped. The proposal includes the gradual rollout plan and a kill-switch if the experiment results don't hold in production.",
          ),
          p(
            "Please skim by Wednesday EOD and shoot me any pushback in the doc comments — easier to resolve in writing than at the meeting. If you want a pre-call to walk through the pricing model in detail I'm holding 30 minutes Thursday morning open.",
          ),
          p("See you Thursday."),
          hr(),
          signature("Owen Falk", "Board observer · Index Ventures", "owen@indexvc.com"),
        ]),
        summary: "Board prep for April meeting. Action: review pre-read + sign off on hiring plan and pricing reset. Time-sensitive.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-28",
        subject: "March investor update",
        senderName: "Hana Cho",
        senderEmail: "hana@forerunnervc.com",
        daysAgo: 6,
        hour: 9,
        snippet: "Loved the March update - one question on NRR and a quick intro to our portfolio.",
        body: email([
          p("Hi,"),
          p(
            "Caught up on the March investor update yesterday over a flight delay — this is the strongest one you've sent since I started backing the company. Two specific things I want to flag, plus an intro:",
          ),
          p(
            "First, the customer logos are stronger than I expected this quarter. Mosaic, Brightlane, Castleworks — these are the kinds of mid-market accounts that drag your reference list up. The fact that all three came through inbound is the part I want to dig into on our next call.",
          ),
          p(
            "Second, the activation jump from 58% → 71% (first-reply within 7 days) is meaningful. If that number holds through April, you've got a real story to tell at the Series B. I'd be interested in seeing the cohort breakdown — is the lift concentrated in self-serve, or are sales-assisted accounts ramping too?",
          ),
          sectionTitle("My one DD question"),
          p(
            "NRR jumped from 108 to 117 month-over-month. Is that broad-based across cohorts, or concentrated in one or two accounts that happened to expand seats? If it's broad-based, that's a wonderful number for an early Series A company. If it's concentrated, we should talk about how to derisk for the board.",
          ),
          sectionTitle("Intro I'd like to make"),
          p(
            "I'd love to introduce you to <strong>Sam at Mosaic Health</strong>. They're scaling a workflow product across 1,200 healthcare admins and were just complaining last week about their inbox setup. Your AI inbox would slot in cleanly. He's also a fantastic person and a future customer — they're closing their Series B in July. Want me to make the connection?",
          ),
          p("Talk soon — and well done on the quarter."),
          hr(),
          signature("Hana Cho", "Partner · Forerunner Ventures", "hana@forerunnervc.com"),
        ]),
        summary: "Existing investor reviewing March update. Action: clarify NRR composition + decide on intro to Mosaic Health. Positive tone.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-29",
        subject: "AngelList - SAFE signed by Bryan Goldstein",
        senderName: "AngelList",
        senderEmail: "notifications@angellist.com",
        daysAgo: 3,
        snippet: "Bryan Goldstein has signed the $25,000 SAFE. Closing documents attached.",
        body: email([
          brandBlock("AngelList"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">SAFE executed · Funds in transit</span></div>`,
          headline("Bryan Goldstein signed the $25,000 SAFE"),
          p(
            "Confirmed signature from <strong>Bryan Goldstein</strong> on the post-money SAFE you offered last week. Funds are being processed and will arrive in your operating account in 3-5 business days via ACH.",
          ),
          profileCard({
            name: "Bryan Goldstein",
            title: "Angel investor",
            company: "ex-Stripe (early product) · 47 prior investments on AngelList",
            initials: "BG",
            accent: "#0e0e10",
            rightLabel: "Signed",
          }),
          bigStat("Amount", "$25,000.00 USD"),
          keyValBlock([
            { label: "Investor", value: "Bryan Goldstein · individual capacity (no entity)" },
            { label: "Instrument", value: "Post-money SAFE (YC standard)" },
            { label: "Valuation cap", value: "$40M post-money" },
            { label: "Discount", value: "None" },
            { label: "MFN clause", value: "Not included" },
            { label: "Effective date", value: "May 14, 2026" },
            { label: "Funds arrival", value: "3-5 business days · expected by May 19 latest" },
          ]),
          sectionTitle("What was filed"),
          bullet("SAFE document · countersigned and stored in your AngelList vault"),
          bullet("Cap table updated automatically in Carta within 24 hours of funds receipt"),
          bullet("Form D filing initiated · auto-files to SEC by deadline (15 days from first sale)"),
          bullet("Bryan added to your investor communications list"),
          sectionTitle("Heads up"),
          bullet("Bryan is a high-signal angel — 47 prior investments, ~10% returned 10x+. Worth a personal thank-you note from you within the week."),
          bullet("He's been quietly evangelizing the company on Twitter; might be worth amplifying his next post"),
          ctaRow([
            ctaButton("View signed SAFE", { color: "#0e0e10" }),
            ctaButton("Send thank-you note", { color: "#0e0e10", variant: "outline" }),
          ]),
          fineprint("AngelList · 410 Townsend St, San Francisco, CA 94107 · We facilitate SAFE financings through our trustee structure. Funds settle T+3 via ACH after countersigning."),
          companyEmailFooter("AngelList"),
        ]),
        summary: "AngelList: angel SAFE signed. No action required - funds in transit. Positive.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-30",
        subject: "Quick DD ask - retention curves",
        senderName: "Maya Patel",
        senderEmail: "maya@usv.com",
        daysAgo: 4,
        hour: 16,
        snippet: "Looking at the deck. Could you share L4 retention curves by cohort?",
        body: email([
          p("Hi,"),
          p(
            "Spending Saturday with your deck — really impressive across the board. The activation curve is the strongest I've seen in this space all year, and your customer logo concentration is more diversified than most of the early-stage AI productivity companies I've evaluated.",
          ),
          p(
            "Before our partner meeting Tuesday, I'd love to dig deeper on retention. One specific ask:",
          ),
          sectionTitle("What I'd like to see"),
          bullet(
            "<strong>L4 cohort retention curves</strong> (logo retention, not revenue retention) for the last 12 monthly cohorts.",
          ),
          bullet(
            "<strong>Cut by acquisition channel</strong>: self-serve, sales-assisted, partner-referred. Even a hand-curated chart in Sheets is fine — I don't need anything polished.",
          ),
          bullet(
            "<strong>Best if it includes a 'why' annotation</strong>: any cohort where retention dipped, a 1-sentence note on what was happening that month (product issue, pricing change, big customer cancelled, etc.).",
          ),
          sectionTitle("What I'll do with it"),
          p(
            "I'll bring it to the partner meeting Tuesday morning. We're a small partnership and I just need to show two of my partners the retention story before we can move to a conviction call. The curves either de-risk this for them or they don't — better to find out now than after we've spent another two weeks on the process.",
          ),
          sectionTitle("On confidentiality"),
          p(
            "Happy to sign an NDA if you'd prefer — or you can just send a Loom walking me through it if the data is sensitive and you'd rather not let it leave your system. Whatever is easiest for you.",
          ),
          p(
            "If you want to talk through it on a call instead of email, I'm holding 4-5 PT Monday open as well. Talk soon — and seriously, the more I look at this, the more excited I am.",
          ),
          hr(),
          signature("Maya Patel", "Partner · USV", "maya@usv.com"),
        ]),
        summary: "VC due diligence: requesting L4 retention curves by cohort. Action: share data (NDA optional). Time-sensitive.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-31",
        subject: "Carta - 409A valuation completed",
        senderName: "Carta",
        senderEmail: "notifications@carta.com",
        daysAgo: 5,
        snippet: "Your 409A valuation is complete. New strike price: $0.43.",
        body: email([
          brandBlock("Carta"),
          headline("Your 409A valuation is complete · new strike $0.43"),
          p(
            "Hi,<br/><br/>The 409A valuation for VectorMail, Inc. has been completed by an independent valuation provider and is ready to use. All option grants issued from today forward must use the strike price below until the next refresh (typically annual, or sooner if there's a financing event).",
          ),
          bigStat("Fair market value per share", "$0.4327"),
          keyValBlock([
            { label: "Company", value: "VectorMail, Inc." },
            { label: "Valuation date", value: "May 12, 2026" },
            { label: "Method", value: "Option pricing method (OPM) · backsolve" },
            { label: "Valuation provider", value: "Carta Valuations LLC (independent)" },
            { label: "Auditor reliance", value: "Yes (safe-harbor)" },
            { label: "Previous strike", value: "$0.3104 (set Nov 2025)" },
            { label: "% change", value: "+39.4% from prior" },
            { label: "Valid until", value: "May 12, 2027 (or next material event)" },
          ]),
          sectionTitle("Why the strike went up"),
          infoCard(
            "The 39% increase reflects three things: (1) revenue growth since the November valuation, (2) the bridge SAFE you closed in March which adjusted the implied post-money, and (3) the broader market re-rating of AI productivity comps. The valuation team flagged all three in their report.",
            { tone: "info" },
          ),
          sectionTitle("Practical implications"),
          bullet(
            "<strong>Pending offers are safe.</strong> Outstanding offers issued at the old strike (e.g., Nathan Wu, Elena Vargas) are still valid as long as they're countersigned within 30 days of original offer date.",
          ),
          bullet(
            "<strong>Board-approval rule.</strong> All new option grants from May 12 onward must use $0.4327 — no exceptions. Your board members have been notified separately.",
          ),
          bullet(
            "<strong>Existing employees.</strong> No impact on their already-granted options. Their strike is locked at issue date.",
          ),
          bullet(
            "<strong>Next refresh.</strong> Either 12 months from today, or 30 days after your next financing closes — whichever comes first.",
          ),
          ctaRow([
            ctaButton("Download report", { color: "#0a2540" }),
            ctaButton("Issue a new grant", { color: "#0a2540", variant: "outline" }),
            ctaButton("Schedule call with Carta", { color: "#0a2540", variant: "outline" }),
          ]),
          fineprint(
            "This valuation has been performed in accordance with IRS Section 409A and AICPA practice guide. Safe harbor presumption applies. Full report (44 pages) is in your Carta document vault.",
          ),
          companyEmailFooter("Carta"),
        ]),
        summary: "Carta: 409A complete. New strike $0.43. No action unless you want to grant new options. Informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-32",
        subject: "LP report - Q1 distribution notice",
        senderName: "Foundry Operations",
        senderEmail: "ops@foundrycap.com",
        daysAgo: 7,
        snippet: "Q1 LP distribution notice attached. Wire instructions confirmed.",
        body: email([
          p("Dear LPs,"),
          p(
            "This serves as formal notice of a Q1 2026 partial distribution from <strong>Foundry Capital Fund IV, L.P.</strong> Following the partial exit of one of our growth-stage portfolio companies (announced earlier this month), the General Partner has elected to distribute $1.4M to LPs on a pro-rata basis.",
          ),
          sectionTitle("Distribution details"),
          keyValBlock([
            { label: "Fund", value: "Foundry Capital Fund IV, L.P." },
            { label: "Distribution type", value: "Partial · cash" },
            { label: "Source", value: "Realized proceeds from secondary sale" },
            { label: "Total distribution", value: "$1,400,000 USD" },
            { label: "Your pro-rata share", value: "Calculated based on commitment %" },
            { label: "Wire date", value: "Wednesday, April 15, 2026" },
            { label: "Settlement (typical)", value: "1-2 business days domestic, 3-5 international" },
            { label: "Quarter to date", value: "$1.4M (this is the only Q1 distribution)" },
          ]),
          sectionTitle("Action required if your wire information changed"),
          infoCard(
            `If your wire instructions have changed in the last 90 days, you must reply to this email by <strong>Thursday, April 10</strong> with updated banking details. We require a signed wire instruction form on file before initiating any transfers. Wire form attached to this email for your convenience.`,
            { tone: "warn" },
          ),
          sectionTitle("If your wire information is current"),
          p(
            "No action required. We will use the wire instructions on file. You'll receive a separate notification when the wire is initiated and a confirmation when it settles.",
          ),
          sectionTitle("Tax treatment"),
          bullet("This is a return of capital (RoC) followed by partial gain — your K-1 will reflect both portions separately."),
          bullet("Q1 K-1 estimates will be sent in early May; finals after fund audit completion (typically September)."),
          bullet("Consult your tax advisor for treatment in your specific entity."),
          ctaRow([
            ctaButton("Update wire instructions", { color: "#1f2937" }),
            ctaButton("Download wire form", { color: "#1f2937", variant: "outline" }),
            ctaButton("Email LP relations", { color: "#1f2937", variant: "outline" }),
          ]),
          fineprint(
            `Confidential. This communication is intended solely for the Limited Partners of Foundry Capital Fund IV, L.P. If you received this in error, please notify ops@foundrycap.com and delete. Forwarding outside your investment entity is prohibited.`,
          ),
          hr(),
          signature("Foundry Operations", "LP Relations · Foundry Capital", "ops@foundrycap.com"),
        ]),
        summary: "LP distribution notice for Q1. Action: confirm wire instructions if changed in last 90 days. Time-sensitive.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-33",
        subject: "Re: Bridge round - circling back",
        senderName: "Daniel Brun",
        senderEmail: "daniel@foundry.vc",
        daysAgo: 9,
        snippet: "Following up on the bridge round conversation - we're in for $500K.",
        body: email([
          p("Hi,"),
          p(
            "Following up from our call last Thursday. Took the conversation to my partners on Monday and again to the IC on Wednesday — got conviction across the table.",
          ),
          p(
            "<strong>We're in for $500K on the bridge at the same terms as the upcoming Series A.</strong> Specifically: post-money SAFE, $90M cap, no discount, no MFN. Same as what Priya is leading. We'll convert at the same price when the priced round closes.",
          ),
          sectionTitle("What we need from you"),
          bullet("SAFE doc — we'll use the latest YC template or yours, your call. Either is fine."),
          bullet("Wire instructions — we'll pre-fund within 5 business days of signature."),
          bullet("Confirm cap-table impact with Priya/Horizon so there are no surprises at Series A close."),
          sectionTitle("A few notes"),
          p(
            "We considered taking pro-rata at the Series A instead but decided we wanted to be capitalizing you now — when the conviction is highest and the support is most useful. The $500K is meaningful at this stage and we want it deployed now, not held back.",
          ),
          p(
            "I shared the recent investor update with my partners — your customer logos and the NRR jump from 108 → 117 were the headlines they latched onto. The pricing-experiment results sealed it. Genuinely impressive quarter.",
          ),
          p(
            "Send the doc whenever you're ready. We'll countersign and wire within 5 business days. Excited to keep building with you — this is the kind of company we wish we'd put more in earlier.",
          ),
          hr(),
          signature("Daniel Brun", "General Partner · Foundry Capital", "daniel@foundry.vc"),
        ]),
        summary: "Existing investor committing $500K to bridge round at Series A terms. Action: send SAFE doc. Positive close.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-34",
        subject: "Demo request - Enterprise plan",
        senderName: "Drew Hwang",
        senderEmail: "drew@northwindcorp.com",
        daysAgo: 1,
        hour: 10,
        snippet: "We're a 400-person engineering org. Curious if you have an enterprise tier with SSO + DLP.",
        body: email([
          p("Hi,"),
          p(
            "Reaching out from <strong>Northwind Corp</strong> — we're a 400-person engineering organization (Series C, profitable, expanding into APAC) and our security team flagged VectorMail as a likely fit for our internal rollout. We've already evaluated Superhuman and a Microsoft Copilot pilot internally; neither cleared our compliance bar. Your team came up twice in last week's evaluation, so I'm short-listing you for an enterprise POC.",
          ),
          sectionTitle("Two hard requirements before we book the demo"),
          bullet(
            "<strong>SSO.</strong> We're Okta-shop. Need SAML 2.0 + SCIM provisioning, with the option to enforce SSO-only for everyone in the tenant (no password fallback). Group-based access mapping ideally.",
          ),
          bullet(
            "<strong>Data residency + DLP.</strong> Customer-managed encryption keys (BYOK via AWS KMS), audit log export to our SIEM (Splunk), and SOC 2 Type II report we can share with our DPO. Bonus: any HIPAA-ready posture, since we touch a small slice of regulated workflows.",
          ),
          sectionTitle("If both are 'yes' (we suspect they are)"),
          p(
            "We'd like to scope a paid POC for Q2 with 30 seats from our IT + Eng leadership and our customer support org. Success criteria attached to this email — three clear pass/fail metrics across 30 days. If we hit them, our procurement team will move forward with a 250-seat Master Services Agreement starting Q3.",
          ),
          sectionTitle("Procurement / legal notes"),
          bullet("Net-60 payment terms (we can move to Net-30 if there's a discount)."),
          bullet("Our standard MSA template attached; happy to redline yours instead."),
          bullet("Vendor security questionnaire is in the SecurityScorecard portal — we can send the link."),
          p(
            "Looking forward to your reply. If both items are confirmed, our calendar shows Tuesday and Thursday open next week for a 60-minute scoping call.",
          ),
          hr(),
          signature("Drew Hwang", "Director of IT, Productivity Tools · Northwind Corp", "drew@northwindcorp.com"),
        ]),
        summary: "Enterprise prospect (400 ppl). Asks: Okta SSO + DLP/CMK. Action: confirm both supported, scope paid POC for Q2. High-value lead.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-35",
        subject: "Re: Renewal - 50 seats",
        senderName: "Sophia Pereira",
        senderEmail: "sophia@brightlane.io",
        daysAgo: 2,
        hour: 13,
        snippet: "Happy to renew. We'd like to expand to 75 seats for Q2.",
        body: email([
          p("Hi,"),
          p(
            "Coming up on our renewal in June and wanted to get ahead of it. Short version: the team has been very happy with VectorMail — it's one of the few tools I can say genuinely changed how we work. We'd like to renew the current 50 seats <strong>and expand to 75</strong> starting June 1.",
          ),
          sectionTitle("What I'm proposing"),
          keyValBlock([
            { label: "Plan", value: "Team (current)" },
            { label: "Current seats", value: "50 · $99/seat/mo · ~$59,400 ARR" },
            { label: "Target seats from Jun 1", value: "75 (+25, 50% expansion)" },
            { label: "Term", value: "12 months, prepaid annual" },
            { label: "Volume discount", value: "Asking for a 10% break for hitting 75+ seats" },
            { label: "Start date", value: "Wednesday, June 1, 2026" },
          ]),
          sectionTitle("Why we're expanding"),
          bullet(
            "All three engineering pods are now on it — the holdouts on the platform team finally got jealous of the search latency. We're hiring +14 engineers in Q2/Q3 and want every new joiner on it from day one.",
          ),
          bullet(
            "Sales team picked it up as a side effect (our SDRs heard the briefs feature and asked). 8 seats from them.",
          ),
          bullet(
            "Customer support team wants 3 seats specifically for the thread-summarization feature on long support cases.",
          ),
          sectionTitle("What I'd ask in return"),
          bullet("<strong>Pricing lock</strong> for the next 12 months (no mid-year re-rating)."),
          bullet("<strong>Customer story</strong> participation: happy to be the public case study you've been asking about. I've got data on time saved + customer NPS gain."),
          bullet("<strong>Reference call</strong> for one or two prospects per quarter, scheduled through me."),
          p(
            "Can you send the quote for the expansion + the 12-month pricing lock? Aiming to lock this before our fiscal close on May 30 so it lands cleanly in Q2.",
          ),
          p("Thanks for the great support over the last year. Excited to scale this up."),
          hr(),
          signature("Sophia Pereira", "VP Engineering · Brightlane", "sophia@brightlane.io"),
        ]),
        summary: "Renewal + 25-seat expansion (Brightlane). Action: send quote and confirm 12-mo price lock. Positive.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-36",
        subject: "Pricing question - non-profit discount",
        senderName: "Felix Romero",
        senderEmail: "felix@codeforgood.org",
        daysAgo: 3,
        snippet: "We're a registered 501(c)(3). Do you offer non-profit pricing?",
        body: email([
          p("Hi,"),
          p(
            "I run Code For Good, a registered 501(c)(3) non-profit that teaches programming to teens in under-resourced school districts. We've been on a trial of VectorMail for the last three weeks and our small team (just 12 people, mostly part-time) is in love with it. The brief feature in particular has been a meaningful unlock — we run a lot of partnership outreach and it's the first tool that actually surfaces the threads we keep losing in the noise.",
          ),
          sectionTitle("What I'd like to ask"),
          bullet("<strong>Do you offer non-profit pricing?</strong> We've seen a lot of vendors offer 50-80% off for 501(c)(3) orgs and it makes the difference between us being able to fund a tool versus not."),
          bullet("<strong>Seats:</strong> 12 to start. We may go up to 18 if our summer fellowship program runs as planned, but that's a Q3 question."),
          bullet("<strong>Plan:</strong> Whatever your Team plan equivalent is would be enough — we don't need Enterprise features."),
          sectionTitle("What I can offer"),
          bullet(
            "<strong>Determination letter</strong> — happy to send. We've been 501(c)(3) since 2019, EIN attached.",
          ),
          bullet(
            "<strong>Annual budget transparency</strong> — we operate on ~$340K/year. Most of that is program delivery and stipends. Tools are a real line item.",
          ),
          bullet(
            "<strong>Story</strong> — we'd be a happy reference for other non-profits in your pipeline, and our students would love a write-up about the tool that helped their org function. Tax-deductible coverage for you, real impact for us.",
          ),
          p(
            "If non-profit pricing isn't possible, would also love to know if there are foundations you've worked with that sponsor non-profit access to your platform.",
          ),
          p(
            "Thanks for considering — we love what you've built and would love to keep using it.",
          ),
          hr(),
          signature("Felix Romero", "Executive Director · Code For Good (501(c)(3))", "felix@codeforgood.org"),
        ]),
        summary: "Non-profit inquiry (12 seats). Action: confirm non-profit pricing tier and reply with quote. Small but warm lead.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-37",
        subject: "Churn risk - low usage flagged",
        senderName: "Aria Singh",
        senderEmail: "aria@vectormail.app",
        daysAgo: 4,
        hour: 10,
        snippet: "Customer Loop AI hasn't logged in for 18 days. Renewal in 21.",
        body: email([
          p("Hi,"),
          p(
            "Heads up — wanted to surface this before it crosses our auto-renewal window. <strong>Loop AI</strong> (45 seats, $24K ARR, signed last August) is showing the kind of usage pattern that historically precedes a non-renewal.",
          ),
          sectionTitle("The signal"),
          keyValBlock([
            { label: "Account", value: "Loop AI · 45 seats · $24,000 ARR" },
            { label: "Last login (any user)", value: "18 days ago" },
            { label: "DAU 30-day", value: "12% (down from 78%)" },
            { label: "Active users this month", value: "4 of 45" },
            { label: "Health score", value: "Red · trending down for 6 weeks" },
            { label: "Auto-renewal date", value: "June 8 · in 21 days" },
            { label: "Owner of relationship", value: "Aria Singh" },
          ]),
          sectionTitle("My read"),
          p(
            "Their CSM contact (Jules Park) was warm and engaged last quarter — sent us an unsolicited recommendation to a friend, scored 9/10 in NPS. The usage drop coincides exactly with their VP Ops leaving for a new role on April 3. My hypothesis is the new ops lead hasn't been onboarded to the tool yet and the team's defaulted back to native Gmail.",
          ),
          sectionTitle("What I'd recommend"),
          bullet("<strong>Option A · Save call (recommended):</strong> I reach out to Jules directly today, offer a 20-min reset call + free training session for the new ops lead. Soft, helpful, no pressure."),
          bullet("<strong>Option B · Check-in email only:</strong> Default playbook. Probably misses the timing."),
          bullet("<strong>Option C · Wait and see:</strong> Auto-renewal might just go through. Risk: it doesn't, and we lose $24K without trying."),
          sectionTitle("What I need from you"),
          p(
            "A 30-second 'go for it / wait' on Option A. I have a draft outreach ready to send within 2 hours of your reply. If you want to be the one on the call instead of me given the spend, just say.",
          ),
          hr(),
          signature("Aria Singh", "Customer Success Lead · VectorMail", "aria@vectormail.app"),
        ]),
        summary: "Internal alert: Loop AI churn risk, $24K ARR. Action: decide on save call within 3 weeks. Time-sensitive.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-38",
        subject: "Question on the API rate limits",
        senderName: "Marcus Liu",
        senderEmail: "marcus@parallax.dev",
        daysAgo: 5,
        snippet: "Hit the API ceiling on the Team plan twice this week. Want to discuss usage-based pricing.",
        body: email([
          p("Hi,"),
          p(
            "We're on the Team plan and have been generally happy. But our API integration with your platform has scaled faster than we expected — we've hit the rate-limit ceiling twice this week, both times during normal business hours, both times resulting in degraded experience for our customers.",
          ),
          sectionTitle("Where we are today"),
          keyValBlock([
            { label: "Plan", value: "Team · 20 seats" },
            { label: "API rate limit", value: "100 req/min · 5,000 req/day" },
            { label: "Current sustained traffic", value: "~85 req/min, peaks to 180" },
            { label: "Times we hit 429 this week", value: "2 (Tue 2:48 PM, Thu 11:32 AM)" },
            { label: "Customer-facing impact", value: "Yes — 12-minute degraded mode each time" },
          ]),
          sectionTitle("What we'd like to propose"),
          p(
            "Rather than blanket-upgrading to Enterprise (which would solve the rate limit but cost ~3× what we currently pay and bundle features we don't need), can we discuss <strong>usage-based API pricing</strong>? Specifically:",
          ),
          bullet("<strong>Commit to a monthly minimum</strong> (let's say $500/mo or 50K requests, whichever is more)."),
          bullet("<strong>Overage pricing</strong> for anything above commit at a clearly-priced per-request rate."),
          bullet("<strong>No seat-rate change</strong> — we're happy with our current Team plan otherwise."),
          bullet(
            "<strong>SLA on rate-limit handling</strong> — formal commitment that requests above the limit get 429ed with proper retry-after headers, not silently dropped.",
          ),
          sectionTitle("Why this works for both sides"),
          p(
            "Our usage will keep growing through Q3 (we're forecasting 4× current rates by August), but our seat count will be flat. Usage-based pricing aligns your revenue with our actual load, lets us scale without renegotiating, and avoids the discontinuity of an Enterprise jump.",
          ),
          p(
            "Happy to share our usage forecast in a Loom or on a quick call so we can scope this together. Want to lock something before end of month if possible.",
          ),
          hr(),
          signature("Marcus Liu", "CTO · Parallax", "marcus@parallax.dev"),
        ]),
        summary: "Customer wants usage-based API pricing instead of full Enterprise upgrade. Action: propose hybrid plan + share rate card.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-39",
        subject: "NPS survey response",
        senderName: "Delighted",
        senderEmail: "no-reply@delighted.com",
        daysAgo: 2,
        snippet: "A user scored 9/10 and left a comment: 'Briefs save me 2 hours a day.'",
        body: email([
          brandBlock("Delighted"),
          headline("New NPS response · 9/10 from Brightlane"),
          p(
            "A new NPS response just came in from your active feedback survey. Score and verbatim below — this one is worth reading.",
          ),
          bigStat("Score", "9 / 10", { color: "#0caa41" }),
          keyValBlock([
            { label: "Respondent", value: "Customer #c-2841 (Brightlane · 75 seats)" },
            { label: "Role", value: "VP Engineering" },
            { label: "Tenure", value: "Customer for 9 months" },
            { label: "Plan", value: "Team (annual)" },
            { label: "Health score", value: "Green (was Green last month)" },
            { label: "Response time", value: "Sunday, May 17, 11:22 AM PT" },
          ]),
          sectionTitle("Verbatim feedback"),
          infoCard(
            `"Briefs save me 2 hours a day. The summaries are scary-accurate — I trust them enough that I stopped scrolling through the inbox most mornings. Search just works the way I want it to ('investor threads from last week mentioning the term sheet' returns exactly what I expect). The only thing I'd ask for is the mobile app, which I know is coming but I wish were here yesterday. Other than that — this is the first tool in years that I'd actually pay for personally if my company didn't."`,
            { tone: "ok" },
          ),
          sectionTitle("Suggested follow-ups"),
          bullet("<strong>Case study candidate.</strong> Customer has health = green, NPS = 9, and 9 months of tenure. Strong candidate for the public case study Aria's been working on."),
          bullet(`<strong>Mobile waitlist priority.</strong> Add this user to the iOS beta when it goes out — they'll be a great early tester.`),
          bullet("<strong>Reference call material.</strong> Add this verbatim to the sales reference deck (with permission)."),
          ctaRow([
            ctaButton("View response in Delighted", { color: "#ff8866" }),
            ctaButton("Mark for case study", { color: "#ff8866", variant: "outline" }),
          ]),
          fineprint(
            "Active survey: 'How likely are you to recommend VectorMail to a colleague?' · Sample rate: 12% monthly · Total responses this month: 184 · Average score: 8.6",
          ),
          companyEmailFooter("Delighted"),
        ]),
        summary: "9/10 NPS with positive qualitative comment. Mention of mobile app gap. Informational - consider for case study.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-40",
        subject: "Trial expiring in 3 days",
        senderName: "Theo Vargas",
        senderEmail: "theo@castleworks.co",
        daysAgo: 1,
        hour: 19,
        snippet: "Trial expires Friday. Two of our PMs love it - what does pricing look like for 8 seats?",
        body: email([
          p("Hi,"),
          p(
            "Quick note — our 14-day trial expires this Friday and I want to convert before then if at all possible. Both of our PMs are now genuinely dependent on the briefs feature, and the rest of the team has been asking when they get access.",
          ),
          sectionTitle("Where we are"),
          keyValBlock([
            { label: "Company", value: "Castleworks · workflow software for trades · 22 employees" },
            { label: "Trial seats used", value: "2 of 5 (PMs)" },
            { label: "Trial ends", value: "Friday, May 22, 2026" },
            { label: "Desired plan", value: "8 seats (2 PMs + 4 ops + 2 me/exec)" },
            { label: "Term preference", value: "Annual, prepaid (if it gets a better rate)" },
            { label: "Decision-maker on price", value: "Me · CFO needs SOC 2 confirmation before signing" },
          ]),
          sectionTitle("Three questions"),
          bullet(
            "<strong>What does pricing look like for 8 seats on annual?</strong> If there's a meaningful discount vs monthly, we'll take it.",
          ),
          bullet(
            "<strong>Can you send a copy of your SOC 2 Type II report?</strong> Our CFO won't co-sign without it. NDA fine if needed.",
          ),
          bullet(
            "<strong>Is there a way to extend the trial by 7 days</strong> if we hit a paperwork snag and can't close by Friday? Don't want to lose access mid-procurement.",
          ),
          sectionTitle("What's selling the team"),
          p(
            "Honestly, the briefs. Our PMs were spending the first 45 minutes of every day re-reading the same threads to figure out what's on fire. Now the brief tells them and they're back to building. The search is great too. We don't really use Buddy yet, but I expect that'll grow.",
          ),
          p("Excited to make this official. Talk soon."),
          hr(),
          signature("Theo Vargas", "Head of Operations · Castleworks", "theo@castleworks.co"),
        ]),
        summary: "Trial converting (Castleworks, 8 seats). Action: send annual pricing + confirm SOC 2 status. Hot lead.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-41",
        subject: "Re: Integration question - Slack",
        senderName: "Mei Lin",
        senderEmail: "mei@haystack.studio",
        daysAgo: 6,
        snippet: "Does VectorMail push thread summaries into Slack? We want to wire it into our team channel.",
        body: email([
          p("Hi,"),
          p(
            "Loving the product so far — we're three weeks into the trial. One quick integration question before we go all-in:",
          ),
          p(
            "<strong>Does VectorMail push thread summaries into Slack?</strong> Our team has three shared inboxes (support@, partnerships@, hello@) and we want the morning brief for each one to land in our team Slack channel every weekday at 8:30 AM PT. That way the whole team sees what's brewing without having to log into a separate tool.",
          ),
          sectionTitle("What we'd need"),
          bullet("<strong>Native Slack integration</strong> ideally — bot user, OAuth, channel selector, the works."),
          bullet("<strong>Or a webhook</strong> — we have engineering bandwidth to wire it up if you publish a stable webhook API."),
          bullet("<strong>Configurable schedule and channels</strong> per inbox (different briefs to different channels)."),
          bullet("<strong>Threading</strong> — when someone clicks the link in Slack, it should open the actual thread in VectorMail (not just a summary view)."),
          sectionTitle("Why this matters to us"),
          p(
            "Right now most of our team only reads email at the end of the day. The result: by the time someone responds to a partner inquiry that came in at 9 AM, the partner has already gone with a competitor. The brief in Slack would make those time-sensitive threads visible to the whole team in the morning, not just to whoever happens to check their inbox.",
          ),
          p(
            "If this exists, please point me at the docs. If it doesn't yet, what's the realistic timeline — and are you open to building it with us as a design partner? We'd be happy to provide feedback through implementation.",
          ),
          hr(),
          signature("Mei Lin", "Head of Operations · Haystack Studio", "mei@haystack.studio"),
        ]),
        summary: "Integration ask: Slack push for daily briefs. Action: confirm webhook support or scope native integration.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-42",
        subject: "Customer health score - improved",
        senderName: "Vitally",
        senderEmail: "alerts@vitally.io",
        daysAgo: 3,
        snippet: "Loop AI's health score moved from Yellow to Green this week.",
        body: email([
          brandBlock("Vitally"),
          headline("Loop AI health score moved Yellow → Green"),
          p(
            "Customer health score on <strong>Loop AI</strong> improved this week. The account has been in the Yellow zone for the past three weeks; this is the first time it's crossed back into Green.",
          ),
          metricGrid([
            { label: "Health score", value: "82", sub: "Yellow → Green" },
            { label: "DAU / MAU", value: "47%", sub: "+18 pp" },
            { label: "Active users", value: "32 of 45", sub: "+15" },
            { label: "Features used", value: "8 of 10", sub: "+3" },
            { label: "NPS (rolling)", value: "8.4" },
            { label: "Days to renewal", value: "21" },
          ]),
          sectionTitle("Most-impactful drivers"),
          bullet("New ops lead onboarded after Aria's save call (Mar 24) — DAU jumped within 4 days."),
          bullet("Buddy v2 streaming responses adopted by their sales team — 18 new active users."),
          bullet("Slack integration shipped — surfaces briefs in their team channels, which drives daily engagement."),
          sectionTitle("Risk indicators (still watch)"),
          bullet("One power user dropped from daily to weekly · investigate before renewal."),
          bullet("Account has not yet adopted the search feature heavily — opportunity to nudge."),
          ctaRow([
            ctaButton("View account in Vitally", { color: "#5b3bff" }),
            ctaButton("Owner: Aria Singh", { color: "#5b3bff", variant: "outline" }),
          ]),
          fineprint("Health score calculation: usage frequency (40%) + feature breadth (30%) + sentiment signals (20%) + commercial signals (10%)."),
          companyEmailFooter("Vitally"),
        ]),
        summary: "Vitally: Loop AI health score green. No immediate action. Positive signal.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-43",
        subject: "We're considering switching from Superhuman",
        senderName: "Carter Liu",
        senderEmail: "carter@northglade.com",
        daysAgo: 8,
        snippet: "Looking for a real AI inbox - not just shortcuts. Can we see Buddy live?",
        body: email([
          p("Hi,"),
          p(
            "We're a Superhuman shop and have been for two years. Loved it for the first year, but we've reached the ceiling on what keyboard shortcuts can do for inbox velocity — at this point, our team is just <em>faster at the same kind of work</em>, and the work itself is still drowning us.",
          ),
          p(
            "What we actually want is a tool that reads our inbox <strong>for us</strong>, drafts replies in our voice, and surfaces what matters. Your demo videos look closer to that vision than anything else we've evaluated.",
          ),
          sectionTitle("Where we are"),
          keyValBlock([
            { label: "Company", value: "Northglade · early-stage SaaS, ARR ~$1.2M, growing 30% MoM" },
            { label: "Team size", value: "6 today · 12 by Q3 (hiring underway)" },
            { label: "Current tool", value: "Superhuman (2 years)" },
            { label: "Annual spend on Superhuman", value: "~$2,400" },
            { label: "Founder commitment", value: "I personally make the call on tools at this size" },
          ]),
          sectionTitle("Three things we want to see in the demo"),
          bullet("<strong>Buddy live.</strong> Drafting a reply to a real-looking thread, end-to-end, with you narrating the failure modes you've designed around."),
          bullet("<strong>Daily brief.</strong> A real brief on a busy inbox so we can see if it surfaces what we'd actually care about."),
          bullet("<strong>Semantic search.</strong> A query like 'investor threads from last week mentioning the term sheet' — does it actually work?"),
          sectionTitle("Timeline"),
          p(
            "If the demo confirms our hypothesis, we'd want to start a paid trial this week and convert to annual within 10 days. We're not the kind of customer that drags procurement out — small team, founder-led, fast decisions.",
          ),
          p(
            "Got availability for a 30-minute live demo this week (Thu or Fri preferred)? Looking forward to seeing it.",
          ),
          hr(),
          signature("Carter Liu", "Founder & CEO · Northglade", "carter@northglade.com"),
        ]),
        summary: "Superhuman customer evaluating switch. Action: book live Buddy demo this week. Warm lead, fast-moving.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-44",
        subject: "Re: Senior eng candidate - Nathan Wu",
        senderName: "Lina Ortiz",
        senderEmail: "lina@greenhouseteam.com",
        daysAgo: 1,
        hour: 12,
        snippet: "Nathan passed the systems round 4/4. References are exceptional. Ready to send offer?",
        body: email([
          p("Hi,"),
          p(
            "Nathan finished his loop yesterday and we have results. Short version: <strong>he passed the systems round 4-for-4 with strong-yes votes</strong>, references are exceptional, and he has a competing offer with a Friday decision deadline. I'm recommending we send the offer today.",
          ),
          sectionTitle("Interview results"),
          keyValBlock([
            { label: "Coding (Marcus)", value: "Strong Yes · 'clean, fast, picked up our codebase model in 20 min'" },
            { label: "Systems design (Dana)", value: "Strong Yes · 'best design conversation we've had in 6 months'" },
            { label: "Product sense (you)", value: "Hire · 'great judgment, asks the right questions'" },
            { label: "Culture (Aria)", value: "Strong Yes · 'low-ego, high-trust'" },
            { label: "Overall", value: "Strong Hire · L5 · Senior Engineer" },
          ]),
          sectionTitle("References (3 collected)"),
          bullet(
            "<strong>Former eng manager at Stripe (Jules Kennedy):</strong> 'Nathan is the engineer you build the next thing around. If I were starting a company I'd hire him first.'",
          ),
          bullet(
            "<strong>Peer at Plaid (Devon Hsu):</strong> 'He shipped two of our hardest projects. Calm under pressure, great writer, makes everyone around him better.'",
          ),
          bullet(
            "<strong>Skip-level at Plaid (Marisol Torres):</strong> 'He's the engineer I'd send into the room when something needs to ship and the team is struggling.'",
          ),
          sectionTitle("Competing offer (Series B fintech NYC)"),
          bullet("$230K base, 0.30% equity, $20K sign-on"),
          bullet("Decision deadline: <strong>Friday EOD</strong>"),
          bullet("He's been honest the entire process — wants to be at VectorMail if comp lands close"),
          sectionTitle("My recommendation"),
          infoCard(
            `Send the offer today at <strong>$215K base, 0.45% equity, $30K sign-on</strong>. Cash is slightly below their offer but equity is ~50% richer at our 409A. He values long-term equity and the technical bar, not the headline base. We're comfortably within Engineering band for L5 and this is a candidate worth slightly stretching for.`,
            { tone: "ok" },
          ),
          p(
            "Need your sign-off on level + comp by 9 AM PT and I'll have the offer letter signed by counsel by 10 AM and out to Nathan by 10:30. He's been told to expect it.",
          ),
          hr(),
          signature("Lina Ortiz", "Senior Recruiting Partner · Greenhouse Talent", "lina@greenhouseteam.com"),
        ]),
        summary: "Recruiter recommending offer for Nathan Wu (senior eng). Competing offer; decide by Friday. Action: approve offer + level.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-45",
        subject: "Candidate withdrawal - Priscilla Adams",
        senderName: "Priscilla Adams",
        senderEmail: "priscilla.adams@gmail.com",
        daysAgo: 4,
        snippet: "Thank you for the time - I've accepted another role.",
        body: email([
          p("Hi,"),
          p(
            "Thank you so much for the time and thoughtfulness over the last three weeks. The team is clearly thinking deeply about how to build something special, and the conversations with Dana and Marcus in particular were some of the best technical interviews I've had.",
          ),
          p(
            "I'm writing to let you know I've accepted an offer at a Series C infrastructure company in NYC. The decision came down to a few things specific to my personal situation: my partner just took a job there that we can't reasonably move out of, and the role offers a clearer path into the platform-architecture work I've been pointing at for years. Neither is a knock on VectorMail — frankly, your offer was the harder one to walk away from.",
          ),
          p(
            "Please keep me in mind if a senior eng role opens up in 18-24 months on the East Coast or fully remote. And if there's anyone I should connect you with from my Plaid days who'd be a good fit for what you're building, I'm happy to make the warm intro.",
          ),
          p("Wishing you and the team the best — really excited to watch what you build."),
          hr(),
          signature("Priscilla Adams"),
        ]),
        summary: "Candidate withdrew from process. Action: close loop in ATS, send brief thanks. Routine.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-46",
        subject: "Offer accepted - Elena Vargas",
        senderName: "Elena Vargas",
        senderEmail: "elena@evargas.dev",
        daysAgo: 2,
        hour: 9,
        snippet: "Accepted! Excited to start May 5. Forwarding the signed letter.",
        body: email([
          p("Hi,"),
          p(
            "I'm in. Signed offer letter is attached, and I've already given notice at Stripe this morning. The team there was generous in saying I could leave on the early side, so I can start on <strong>Monday, May 5</strong> as we'd discussed — no need to push it.",
          ),
          p(
            "To say this was a difficult decision is a real understatement. Three weeks ago I was 70-30 leaning to stay at Stripe. The thing that flipped me wasn't the comp (which was generous) or the equity (which is meaningful but uncertain) — it was the technical bar in the loop, and specifically the systems-design conversation with Marcus where he genuinely pressed me on a tradeoff I hadn't thought through. That's the calibration I want to be around for the next chapter.",
          ),
          sectionTitle("Practical bits for onboarding"),
          bullet("Laptop preference: 16\" MacBook Pro M3, 64GB RAM (I do a lot of model work locally)."),
          bullet("Address for shipping: changing it on May 1 — I'll send the updated one then."),
          bullet("Office days: happy to commit to 3 days/week in person from week 1. SF based."),
          bullet("Background check: already in motion via Checkr — you should see results by next Tuesday."),
          sectionTitle("What I'm bringing on day 1"),
          p(
            "I've been quietly reading the public engineering blog and your founders' Twitter for months. I have a doc with first-30-days thoughts I want to validate against the real codebase — happy to share with Dana before I start so we can use my first 1:1 to discuss it.",
          ),
          p("Excited beyond words. See you in two weeks."),
          hr(),
          signature("Elena Vargas"),
        ]),
        summary: "Candidate accepted offer, starts May 5. Action: kick off onboarding (laptop, accounts). Positive.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-47",
        subject: "Cold intro - Staff PM looking",
        senderName: "Jamal Ortiz",
        senderEmail: "jamal.ortiz@anthropic-friend.io",
        daysAgo: 3,
        snippet: "Strong PM friend leaving Anthropic. Wants to do AI infra. Worth a chat?",
        body: email([
          p("Hi,"),
          p(
            "Cold-ish email, but for a good reason. My friend <strong>Sasha Hill</strong> is leaving Anthropic in two weeks and she's the kind of product person you'd want to know about before the open market does.",
          ),
          sectionTitle("Quick background on Sasha"),
          bullet("<strong>Currently:</strong> Staff PM at Anthropic. Led the API platform from $0 → 9-figure annualized in 22 months."),
          bullet("<strong>Before that:</strong> Product at Stripe (Connect platform), early at Brex, undergrad CS at MIT."),
          bullet("<strong>What she wants next:</strong> Something small, AI-native, where she can shape product from the ground up. Not 'AI feature in an existing product' — full AI-native product surface."),
          bullet("<strong>Why she's leaving:</strong> Anthropic grew past her comfort zone (~50 people when she joined, now 1000+). She wants the early stage again."),
          sectionTitle("Why I'm sending you specifically"),
          p(
            "She and I had dinner last weekend and she described what she wants in her next role basically by listing your product surface — AI native, inbox/workflow category, small team, technical co-founders she'd be working with directly. Your name didn't come up because she hasn't done the research yet. I think she'd open her eyes wide when she sees what you're building.",
          ),
          sectionTitle("How to proceed"),
          p(
            "If you're interested, I'll loop her in with a triple-handle intro. She's not on the open market yet (and probably won't be — too many former-Anthropic friends in similar positions, the speed will be lightning), so this is a small window.",
          ),
          p(
            "If not, no problem at all — I'll send her in a different direction. Either way, want to support what you're building either as a customer or with people referrals."),
          hr(),
          signature("Jamal Ortiz", "Engineering · ex-Anthropic", "jamal.ortiz@anthropic-friend.io"),
        ]),
        summary: "Warm intro to Staff PM (ex-Anthropic). Action: reply yes/no, request intro CC. Strong inbound.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-48",
        subject: "Lever - 3 new applicants this week",
        senderName: "Lever",
        senderEmail: "no-reply@lever.co",
        daysAgo: 5,
        snippet: "3 new applicants for Senior Backend Engineer. 1 referred.",
        body: email([
          brandBlock("Lever"),
          headline("Weekly applicant digest · 3 new applications"),
          p(
            "Three new applications landed for <strong>Senior Backend Engineer (SF / Remote)</strong> this week. The referral is the highest-priority — referrals from existing team typically convert at 4-5× the rate of cold inbound. Quick summary below; full profiles in Lever.",
          ),
          sectionTitle("Referral · highest priority"),
          profileCard({
            name: "Connor Patel",
            title: "Backend Engineer · 5 years",
            company: "Currently: Senior at Twilio · Referred by Aria Singh",
            initials: "CP",
            accent: "#9b51e0",
            rightLabel: "Referred",
          }),
          infoCard(
            `<strong>Aria's note:</strong> "Worked with Connor at Twilio. Pragmatic, deeply curious, ships clean code. He's been looking for something smaller for a while. I think he'd be a strong cultural and technical fit. Confidential — current manager doesn't know yet."`,
            { tone: "ok" },
          ),
          sectionTitle("Inbound · job page"),
          profileCard({
            name: "Devika Sharma",
            title: "Backend Engineer · 6 years",
            company: "Currently: Senior at LaunchDarkly · open to remote",
            initials: "DS",
            accent: "#000000",
            rightLabel: "Inbound",
          }),
          profileCard({
            name: "Ben Markham",
            title: "Backend Engineer · 4 years",
            company: "Currently: Senior at Twilio (just left)",
            initials: "BM",
            accent: "#000000",
            rightLabel: "Inbound",
          }),
          sectionTitle("Pipeline health · Senior Backend Engineer"),
          metricGrid([
            { label: "Open roles", value: "1" },
            { label: "Days posted", value: "27" },
            { label: "Applications", value: "47 total" },
            { label: "In screen", value: "8" },
            { label: "Onsite scheduled", value: "3" },
            { label: "Offer prep", value: "0" },
          ]),
          ctaRow([
            ctaButton("Review applicants", { color: "#9b51e0" }),
            ctaButton("Refer someone", { color: "#9b51e0", variant: "outline" }),
          ]),
          fineprint(
            "Job posting: 'Senior Backend Engineer' · vectormail-ai · last refreshed 3 days ago · public job board reach: 12,400 impressions this week",
          ),
          companyEmailFooter("Lever"),
        ]),
        summary: "Lever weekly digest: 3 new applicants for backend role. Action: review referrals first.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-49",
        subject: "Reference check request - Jasmine Park",
        senderName: "Quinn Holloway",
        senderEmail: "quinn@nextroom.ai",
        daysAgo: 4,
        snippet: "Jasmine listed you as a reference. 15 minutes this week?",
        body: email([
          p("Hi,"),
          p(
            "Hope you're well. I'm reaching out because <strong>Jasmine Park</strong> is in our final rounds for a Senior Product Manager role here at NextRoom, and she listed you as a reference from her time at your previous company.",
          ),
          p(
            "Could I grab <strong>15 minutes this week</strong> to ask a few quick questions about working with her? I have a list of about 8 things I want to cover, but most of it will be:",
          ),
          bullet(`What did Jasmine work on under you? What was the highest-leverage thing she did?`),
          bullet(`What would she be exceptional at? What would she struggle with?`),
          bullet(`How does she handle ambiguity, conflict, and pressure?`),
          bullet(`If you were starting a company tomorrow, would you hire her as your first PM? Why or why not?`),
          bullet(`Anything I haven't asked that would help me understand her better?`),
          p(
            "Open to phone or Zoom — whatever's easiest. I'm holding the following slots:",
          ),
          keyValBlock([
            { label: "Tuesday", value: "10:00 AM, 2:00 PM, 4:30 PM PT" },
            { label: "Wednesday", value: "9:30 AM, 1:00 PM PT" },
            { label: "Thursday", value: "11:00 AM, 3:00 PM PT" },
          ]),
          p(
            "If none of those work, send me anything and I'll move things around — I really appreciate you taking the time. We're moving fast on the role and your input will weigh heavily in our decision.",
          ),
          hr(),
          signature("Quinn Holloway", "Recruiting Lead · NextRoom", "quinn@nextroom.ai"),
        ]),
        summary: "Reference check for Jasmine Park. Action: book a 15-min call this week.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-50",
        subject: "Interview feedback needed - Carter Liu",
        senderName: "Recruiting",
        senderEmail: "recruiting@vectormail.app",
        daysAgo: 1,
        hour: 16,
        snippet: "Your scorecard for Carter Liu (Engineering) is overdue.",
        body: email([
          brandBlock("VectorMail Recruiting"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Overdue · Decision Friday</span></div>`,
          headline("Your scorecard for Carter Liu is overdue"),
          p(
            "Friendly nudge — your scorecard for <strong>Carter Liu</strong> (Senior Backend Engineer · onsite Wednesday) is now 18 hours past the 24-hour SLA. We owe Carter a final decision by Friday, and Dana needs all four interviewer scorecards before the debrief on Friday morning at 10 AM.",
          ),
          profileCard({
            name: "Carter Liu",
            title: "Senior Backend Engineer · final round",
            company: "Currently: founder at Northglade · ex-Plaid",
            initials: "CL",
            accent: "#1F3A2E",
            rightLabel: "Awaiting decision",
          }),
          sectionTitle("Where everyone else stands"),
          keyValBlock([
            { label: "Coding interview (Marcus)", value: "✓ Submitted · Strong Yes" },
            { label: "Systems design (Dana)", value: "✓ Submitted · Hire" },
            { label: "Behavioral (you)", value: "⚠ Outstanding — overdue" },
            { label: "Hiring-manager loop (Aria)", value: "✓ Submitted · Strong Yes" },
            { label: "Debrief", value: "Friday, 10:00 AM PT — needs all 4 in by Thursday EOD" },
          ]),
          sectionTitle("What we need from you"),
          bullet("Open the scorecard in Greenhouse (link below)."),
          bullet("Submit a written assessment in 5-10 minutes — doesn't need to be exhaustive, but does need to be specific."),
          bullet("Pick: Strong Yes / Yes / No / Strong No · with one-sentence rationale per dimension."),
          sectionTitle("Why this matters"),
          infoCard(
            "Carter is a founder-stage candidate who's been on the market 9 days and has competing offers (we've confirmed at least 2). Every 24 hours we delay is a measurable drop in our chances of closing him. We've already pushed our decision once — pushing again will cost us this candidate.",
            { tone: "warn" },
          ),
          ctaRow([
            ctaButton("Submit scorecard", { color: "#218d62" }),
            ctaButton("Open candidate in Greenhouse", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint("Greenhouse req-2414 · Owner: Lina Ortiz · This is your second auto-reminder; further reminders will escalate to Dana."),
          companyEmailFooter("VectorMail Recruiting"),
        ]),
        summary: "Internal: scorecard overdue for Carter Liu. Action: submit today. Internal.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-51",
        subject: "Standup notes - Tuesday",
        senderName: "Engineering",
        senderEmail: "eng-standup@vectormail.app",
        daysAgo: 1,
        hour: 10,
        snippet: "Auth refactor at 60%. Sentry alert noise reduced 40%. Two PRs need review.",
        body: email([
          headline("Standup digest · Tuesday, May 17"),
          p(
            "Auto-generated recap of today's 10 AM standup. <strong>Velocity is healthy</strong> — no blockers reported across any of the 8 engineers, and the auth refactor is on track to merge by EOW. Action items below.",
          ),
          sectionTitle("Top-line status"),
          metricGrid([
            { label: "Velocity", value: "+18%", sub: "from last week" },
            { label: "Blockers", value: "0", sub: "across team" },
            { label: "PRs open", value: "9", sub: "median age 1.4d" },
            { label: "PRs needing review", value: "2", sub: "see below" },
            { label: "Incidents (24h)", value: "0" },
            { label: "Deployment count (24h)", value: "11", sub: "all green" },
          ]),
          sectionTitle("Per-person updates"),
          bullet(
            "<strong>Nathan</strong> · Auth refactor at 60%. Replaced session middleware, working on JWT rotation. Targeting Thursday merge. <em>Yesterday: shipped the SCIM endpoints. Today: JWT rotation. No blockers.</em>",
          ),
          bullet(
            "<strong>Elena</strong> · Sentry alert noise reduced 40% after deploying the new fingerprinting rules. <em>Yesterday: noise reduction. Today: started VM-211 (Inbox v3 triage column). No blockers.</em>",
          ),
          bullet(
            "<strong>Marcus</strong> · pgvector RFC out for review (link below). Heads down on the migration plan. <em>Today: writing the dual-write spec for the cutover window. No blockers.</em>",
          ),
          bullet(
            "<strong>Dana</strong> · Q3 planning prep. <em>Yesterday: 1:1s. Today: planning doc. No blockers, please reply with availability if you haven't.</em>",
          ),
          bullet(
            "<strong>Aria (CS)</strong> · DataPipe save call queued for Wed 10 AM. Loop AI follow-up email out. <em>No blockers.</em>",
          ),
          sectionTitle("Action: two PRs need review"),
          bullet("<strong>#412</strong> · feat(search): pgvector index switch on warm path · Marcus · 14 files, +228/-68 · CI green · ETA: 30 min review"),
          bullet("<strong>#418</strong> · feat(api): per-user-key rate limiter (closes VM-187) · Nathan · 6 files, +89/-12 · CI green · ETA: 15 min review"),
          sectionTitle("Tomorrow's plan"),
          bullet("Marcus runs the pgvector RFC review (1 hour, blocked time on calendar)."),
          bullet("Sprint 11 planning kicks off Thursday — make sure your availability is in the doc."),
          bullet("Aria + Marcus on the DataPipe escalation call at 10 AM."),
          hr(),
          signature("Engineering Bot", "Daily standup auto-digest · #eng-standup"),
        ]),
        summary: "Daily standup digest. No action - informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-52",
        subject: "RFC - Replacing Pinecone with pgvector at scale",
        senderName: "Marcus Liu",
        senderEmail: "marcus@vectormail.app",
        daysAgo: 3,
        snippet: "Draft RFC for migrating from Pinecone to pgvector. Comments by Friday.",
        body: email([
          p("Hi team,"),
          p(
            "Posted the RFC for migrating our embedding store from Pinecone to pgvector. We've been on Pinecone since the day we launched, but our cost trajectory + the maturity of pgvector + the operational headache of managing two databases has pushed me to recommend we move.",
          ),
          p(
            "<strong>RFC document:</strong> <a href=\"#\" style=\"color: #1a73e8; text-decoration: none;\">RFC-014 · pgvector at scale</a> (3,200 words, ~12 min read).",
          ),
          sectionTitle("Three open questions I want your input on"),
          bullet(
            "<strong>Index type · IVFFlat vs HNSW.</strong> HNSW is faster and more accurate at our scale (~12M vectors today, projecting to 80M by year-end), but uses ~3× the memory. IVFFlat is leaner but recall drops at high-dimensional queries unless we tune <code>lists</code> aggressively. My current recommendation is HNSW with <code>m=16, ef_construction=64</code>, but I want pushback if anyone has read papers I haven't.",
          ),
          bullet(
            "<strong>Migration plan · online cutover vs dark launch.</strong> Online cutover is faster (a weekend) but riskier. Dark launch is safer (dual-write for 30 days, compare results) but stretches the migration into June and ties up two engineers full-time. I'm leaning dark launch given our SLA commitments — but it's a real cost.",
          ),
          bullet(
            "<strong>Cost model.</strong> Our Pinecone bill is currently $4,200/mo. Projecting to $12K/mo by year-end at our growth rate. pgvector on our existing RDS (just promotes to a larger instance type) projects to $1,800/mo year-end. That's a 70% reduction at scale, but the migration eats ~6 weeks of one senior engineer.",
          ),
          sectionTitle("Risks I want surfaced"),
          bullet("HNSW build times on the initial 12M vectors. Need to time-box and have a rollback plan."),
          bullet("Query plan stability — Postgres planner can surprise us on hybrid filter+vector queries. I want to add EXPLAIN ANALYZE tests in CI."),
          bullet("Operational story for pgvector on RDS at our scale isn't as battle-tested as Pinecone's managed offering. Need clear runbook for index rebuild + tuning."),
          sectionTitle("How to give feedback"),
          p(
            "<strong>Comments in the doc by Friday EOD.</strong> I'll triage them over the weekend and update the RFC. <strong>Decision meeting Tuesday at 2 PM</strong> — anyone who's worked on infra is invited, but it's not a required meeting; if you'd rather give input in writing, the doc is fine.",
          ),
          p(
            "If we decide to move forward Tuesday, target ship date is end of Q3. I'd run the migration myself with Nathan supporting on the dual-write infrastructure.",
          ),
          hr(),
          signature("Marcus Liu", "CTO · VectorMail", "marcus@vectormail.app"),
        ]),
        summary: "Internal RFC: Pinecone → pgvector migration. Action: leave comments by Friday, attend decision meeting Tue.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-53",
        subject: "Incident report - Sync delay (resolved)",
        senderName: "Oncall",
        senderEmail: "oncall@vectormail.app",
        daysAgo: 2,
        hour: 22,
        snippet: "Email sync delays 7:42-8:18 PM PT. Root cause: Aurinko webhook lag. Resolved.",
        body: email([
          brandBlock("VectorMail Oncall"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Resolved · No customer impact</span></div>`,
          headline("Incident INC-0091 · email sync delays (36 min) · resolved"),
          p(
            "Auto-generated post-incident summary for the sync-delay event that paged the team this evening. <strong>Auto-resolved without intervention</strong> — included here for awareness and action-item tracking. No data loss, no customer-reported impact (we'll watch support inbox for 24h).",
          ),
          sectionTitle("Quick stats"),
          metricGrid([
            { label: "Severity", value: "SEV-3", sub: "auto-paged primary" },
            { label: "Duration", value: "36 min", sub: "19:42 → 20:18 PT" },
            { label: "Affected accounts", value: "~5%", sub: "~640 of 12,800" },
            { label: "Webhooks queued", value: "8,420" },
            { label: "Webhooks dropped", value: "0", sub: "all replayed" },
            { label: "Customer reports", value: "0" },
          ]),
          sectionTitle("Timeline (PT)"),
          logRow("19:42:18", "Aurinko webhook latency p99 crossed 30s threshold", { tone: "warn" }),
          logRow("19:43:02", "Oncall paged via PagerDuty (Marcus)", { tone: "warn" }),
          logRow("19:46:11", "Marcus acknowledged, started investigation", { tone: "info" }),
          logRow("19:54:32", "Identified: Aurinko provider rotated TLS certs upstream", { tone: "info" }),
          logRow("20:02:08", "Confirmed our retry queue holding correctly, no data loss", { tone: "ok" }),
          logRow("20:18:44", "Webhook lag recovered, queue drained, all events processed", { tone: "ok" }),
          logRow("20:19:20", "Incident closed", { tone: "ok" }),
          sectionTitle("Root cause"),
          infoCard(
            "Aurinko's upstream provider rotated TLS certs on a regional edge node at ~19:42 PT. Our webhook client briefly couldn't validate the new chain, causing failed deliveries. Our exponential-backoff retry logic absorbed the failures and replayed all events within 36 minutes of the original delivery attempt. <strong>This is the second time this has happened this quarter.</strong>",
            { tone: "info" },
          ),
          sectionTitle("Action items"),
          bullet("<strong>Add Aurinko TLS rotation to the runbook</strong> · owner: Aria · due Friday · so the next on-call doesn't burn 10 minutes diagnosing the same thing"),
          bullet("<strong>Add webhook-lag alert at 5-min threshold</strong> · owner: Nathan · due Friday · so we know before the 30s threshold triggers a page"),
          bullet("<strong>Open ticket with Aurinko</strong> · owner: Marcus · due today · ask for advance notice of TLS rotations on shared edge nodes"),
          ctaRow([
            ctaButton("View full incident timeline", { color: "#dc2626" }),
            ctaButton("Open postmortem doc", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            "Incident severity classification: SEV-3 (degraded service for <10% of accounts for <1 hour, no data loss). Postmortem not required at SEV-3, but action items are tracked in Linear under epic INC-Q2.",
          ),
        ]),
        summary: "Resolved incident report (36-min sync delay). 2 follow-ups assigned. Informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-54",
        subject: "Sprint 14 retro notes",
        senderName: "Product",
        senderEmail: "product@vectormail.app",
        daysAgo: 5,
        snippet: "What went well, what to change. Velocity up 18% from sprint 13.",
        body: email([
          headline("Sprint 14 retro · what worked, what didn't, what we're changing"),
          p(
            "Sprint 14 closed Friday at 5 PM PT. Retro session ran Saturday morning, here's the writeup. <strong>The headline is positive</strong>: velocity up 18% with zero rollbacks for the first time in four sprints. The improvement areas are the same as Sprint 13 — design handoff timing and PR review SLA — which means our previous mitigations didn't work. New plan inside.",
          ),
          metricGrid([
            { label: "Velocity", value: "44 pts", sub: "+18% vs Sprint 13" },
            { label: "Completion rate", value: "92%", sub: "up from 81%" },
            { label: "Rollbacks", value: "0", sub: "first time in 4 sprints" },
            { label: "PR review p50", value: "18h", sub: "target 8h" },
            { label: "Design handoff", value: "Wed", sub: "target Mon" },
            { label: "Team sentiment", value: "7.2 / 10", sub: "+0.4" },
          ]),
          sectionTitle("What went well"),
          bullet("<strong>Pairing experiment paid off.</strong> Marcus + Elena spent ~2 days pairing on the search-index project. Result: shipped a sprint earlier than originally scoped, with cleaner code and zero rollbacks. Continuing pairing for the next two big rocks."),
          bullet("<strong>Zero rollbacks.</strong> First clean sprint in months. Likely a combination of better test coverage (now at 84%) and the new pre-deploy smoke suite."),
          bullet("<strong>On-call load down 40%.</strong> Last sprint's noise-reduction work on Sentry alerts is showing up in the data."),
          bullet("<strong>Cross-team dependencies cleared faster.</strong> Design partner sat with eng for the last 2 days of the sprint — that closed 3 ambiguities that would have spilled to Sprint 15."),
          sectionTitle("What didn't"),
          bullet("<strong>Design handoff still late.</strong> Three of four design assets landed Wednesday instead of Monday. Same pattern as Sprint 13. Talked through it on the call — root cause is upstream: PMs giving design less than 5 days of lead time on the spec."),
          bullet("<strong>PR review SLA at 18 hours median.</strong> Up from 14h two sprints ago. Reviewers consistently delaying because of 'I'll get to it tomorrow' on small PRs."),
          bullet("<strong>Two backlog items got promoted mid-sprint.</strong> Both legitimate (a customer escalation and a security finding), but the disruption cost ~6 points of velocity."),
          sectionTitle("What we're changing"),
          infoCard(
            `<strong>Design handoff.</strong> Move design kickoff to Tuesday of the prior sprint, not Monday of the current sprint. That gives designers 8 working days instead of 3. PM team owns the calendar change starting Sprint 15.`,
            { tone: "info" },
          ),
          infoCard(
            `<strong>PR review SLA.</strong> Adopt a 'review within 4 hours during business hours' policy enforced via Slack bot. Author can request another reviewer after 4 hours have elapsed. If a PR is sitting longer than 24 hours, it auto-pings #eng-prs. Trial run for one sprint, evaluate at Sprint 15 retro.`,
            { tone: "info" },
          ),
          sectionTitle("Action items + owners"),
          bullet("Update sprint-planning template to require design kickoff one sprint ahead · Dana · this week"),
          bullet("Build the PR-review Slack bot · Nathan · 2-day estimate · ships in Sprint 15"),
          bullet("Postmortem the two backlog promotions · Marcus · figure out if there's a process gap"),
          hr(),
          signature("Product", "Sprint 14 retro digest", "product@vectormail.app"),
        ]),
        summary: "Sprint retro digest. Two improvement areas (design handoff, PR SLA). Informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-55",
        subject: "Dashboard alert - Latency p95 spiked",
        senderName: "Datadog",
        senderEmail: "alerts@datadog.com",
        daysAgo: 1,
        hour: 21,
        snippet: "API latency p95 > 1200ms for 5 min. Auto-resolved after deploy rollback.",
        body: email([
          brandBlock("Datadog"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">P2 · Resolved</span></div>`,
          headline("api.latency.p95 alert recovered after deploy rollback"),
          p("A 5-minute latency spike on <strong>vectormail-api</strong> auto-resolved when the triggering deploy was rolled back. No customer-facing requests timed out — the long-tail traffic fell within our retry budget."),
          metricGrid([
            { label: "Window", value: "20:48 → 20:53 PT", sub: "5m 12s" },
            { label: "p95 peak", value: "1,287ms", sub: "+887ms over baseline" },
            { label: "p99 peak", value: "2,114ms" },
            { label: "Affected RPS", value: "~38 req/s" },
            { label: "5xx returned", value: "0", sub: "all within retry budget" },
            { label: "Customers paged", value: "0" },
          ]),
          sectionTitle("Triggering change"),
          infoCard(
            `<strong>Build #2241</strong> — <span style="font-family: ${MONO_STACK}; font-size: 13px;">feat: parallel embedding fetch</span><br/><span style="color: #5f6368; font-size: 13px;">Author: elena-vargas · merged 19:42 PT · auto-rolled-back 20:54 PT</span>`,
            { tone: "info" },
          ),
          sectionTitle("Why it auto-resolved"),
          p(
            "The release was promoted behind a 5% canary. When p95 crossed 1000ms for two consecutive 60s windows, Argo Rollouts triggered the auto-rollback. The full fleet drained back to the previous build within 70 seconds.",
          ),
          ctaRow([
            ctaButton("View incident", { color: "#632ca6" }),
            ctaButton("Flamegraph", { color: "#632ca6", variant: "outline" }),
          ]),
          fineprint(
            "Monitor: <code>vectormail-api.latency.p95</code> · Auto-rollback policy: <code>argo-rollouts/canary-p95</code> · No action required if the canary policy is the expected outcome.",
          ),
          companyEmailFooter("Datadog"),
        ]),
        summary: "Datadog alert: brief latency spike, auto-rolled back. No action - informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-56",
        subject: "PR review needed: #438 - tRPC error handler",
        senderName: "GitHub",
        senderEmail: "notifications@github.com",
        daysAgo: 1,
        hour: 15,
        snippet: "Elena Vargas requested your review on vectormail-ai#438.",
        body: email([
          brandBlock("GitHub"),
          profileCard({
            name: "Elena Vargas",
            title: "elena-vargas",
            company: "Senior Engineer · VectorMail",
            initials: "EV",
            accent: "#0969da",
            rightLabel: "Open · Ready",
          }),
          headline("feat: typed tRPC error handler"),
          p(
            `Elena requested your review on <a href="#" style="color: #0969da; text-decoration: none; font-weight: 500;">vectormail-ai/vectormail-ai#438</a>. The PR introduces a typed error envelope for every tRPC procedure, replacing the ad-hoc string errors we throw today.`,
          ),
          keyValBlock([
            { label: "Branch", value: "elena/typed-trpc-errors → main" },
            { label: "Diff", value: "+412 / -188 across 14 files" },
            { label: "Commits", value: "9 (squashed)" },
            { label: "Linked issues", value: "VM-128, VM-141" },
            { label: "Required reviewers", value: "@you, @marcus" },
          ]),
          sectionTitle("CI checks"),
          prCheckRow("ci / typecheck", "passed"),
          prCheckRow("ci / lint", "passed"),
          prCheckRow("ci / unit-tests (node 20)", "passed"),
          prCheckRow("ci / unit-tests (node 22)", "passed"),
          prCheckRow("ci / integration-tests", "passed"),
          prCheckRow("ci / e2e", "passed"),
          prCheckRow("security / codeql", "passed"),
          prCheckRow("preview / vercel", "passed"),
          sectionTitle("Description (from PR)"),
          infoCard(
            `<p style="margin: 0 0 10px 0;">All tRPC routers now throw <code>TypedTRPCError</code> with a discriminated <code>code</code> field, mapping cleanly to HTTP status. Clients receive a strongly-typed envelope and can switch on <code>code</code> without prop-drilling string matches.</p><p style="margin: 0;"><strong>Migration:</strong> existing <code>throw new Error("...")</code> call sites caught by the linter — autofix included.</p>`,
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("Review changes", { color: "#1f883d" }),
            ctaButton("Files changed", { color: "#24292f", variant: "outline" }),
            ctaButton("Comments (4)", { color: "#24292f", variant: "outline" }),
          ]),
          fineprint(
            `View it on GitHub or reply to comment inline. <span style="color: #80868b;">You're receiving this because you were requested to review.</span>`,
          ),
          companyEmailFooter("GitHub"),
        ]),
        summary: "GitHub: PR review requested. Action: review when convenient.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-57",
        subject: "Oncall handoff - week of May 19",
        senderName: "Oncall",
        senderEmail: "oncall@vectormail.app",
        daysAgo: 6,
        snippet: "You're primary May 19-25. Runbook updated. Two open follow-ups from last week.",
        body: email([
          headline("On-call handoff · week of May 19 → 25"),
          p(
            "You're primary on-call from Monday 9 AM PT through next Monday 9 AM PT. Below is the handoff summary, two carry-over items, and the open-tab links you'll want bookmarked before the shift starts.",
          ),
          sectionTitle("Rotation"),
          keyValBlock([
            { label: "Primary", value: "You · 7 days starting Mon May 19, 9:00 AM PT" },
            { label: "Secondary", value: "Marcus Liu (always-on for SEV-1)" },
            { label: "Escalation", value: "Dana Howe · then CEO · per playbook" },
            { label: "Last week's primary", value: "Elena Vargas (1 page, SEV-3, resolved)" },
            { label: "Pager tool", value: "PagerDuty · vectormail-prod schedule" },
          ]),
          sectionTitle("Carry-over from last week"),
          bullet(
            "<strong>Inngest worker tuning</strong> — Elena left a draft PR (#451) to bump the concurrency limit. Doesn't need to ship this week, just needs your eyes when you have 20 minutes.",
          ),
          bullet(
            "<strong>Aurinko TLS runbook entry</strong> — Aria's working on it, due Friday. Make sure it lands before your shift ends.",
          ),
          sectionTitle("Known unknowns"),
          bullet("Aurinko has a regional maintenance window Tuesday 2-4 AM PT — they say no impact, we'll watch."),
          bullet("Our Stripe webhook handler had a signature failure 12 days ago that they 'fixed' — keep an eye on the dashboard."),
          bullet("Marcus is shipping the pgvector cutover Wednesday at 7 PM PT. Be available; it's behind a feature flag with a kill-switch."),
          sectionTitle("Quick bookmarks for the week"),
          bullet("Datadog dashboard: <code>vectormail-api.health</code>"),
          bullet("Sentry: <code>vectormail-ai/production</code>"),
          bullet("PagerDuty: vectormail-prod schedule"),
          bullet("Runbook: <code>runbooks/oncall-primary.md</code>"),
          bullet("Slack: <code>#eng-oncall</code> for live updates"),
          ctaRow([
            ctaButton("Acknowledge handoff", { color: "#dc2626" }),
            ctaButton("Open runbook", { color: "#dc2626", variant: "outline" }),
            ctaButton("View PagerDuty schedule", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            "Have a smooth week. Remember: if SEV-1 or SEV-2 fires, page Marcus + Dana within the first 15 min of investigation, not after.",
          ),
          hr(),
          signature("On-call scheduler", "Weekly automated handoff"),
        ]),
        summary: "Oncall handoff for May 19-25. 2 carryover items. Informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-58",
        subject: "Design crit Thursday - inbox UI v3",
        senderName: "Design",
        senderEmail: "design@vectormail.app",
        daysAgo: 4,
        snippet: "Hosting crit Thursday 3pm. Figma updated with the v3 proposal.",
        body: email([
          headline("Design crit · Thursday 3 PM PT · Inbox v3 proposal"),
          p(
            "Hi team,<br/><br/>Hosting design crit on <strong>Thursday at 3 PM PT (60 min)</strong> for the v3 inbox UI proposal. This is the design that will absorb the triage column, the new brief panel, and the density change we've been talking about for two sprints. I want sharp, opinionated input — not 'looks great.'",
          ),
          sectionTitle("Pre-read · please look at Figma before the meeting"),
          p(
            `<a href="#" style="color: #1a73e8; text-decoration: none; font-weight: 500;">Figma · Inbox v3 — three variants</a> · 12 frames · ~10 min skim.`,
          ),
          sectionTitle("Three questions I want pressure on"),
          bullet(
            "<strong>Does the new triage column read as 'safe to skim' or 'needs me'?</strong> We're using subtle color shifts (warm = needs me, cool = safe). Test it on yourself — what's your gut reaction the first 3 seconds you look at it?",
          ),
          bullet(
            "<strong>Density: 12px vs 14px line height for thread previews.</strong> Variant A is tighter, Variant B is more spacious. The tighter one shows more, but the spacious one feels less stressful. I have a hypothesis but want fresh eyes.",
          ),
          bullet(
            "<strong>Brief panel placement — top vs side.</strong> Variants 1 & 2 keep the brief on top (where it is today), Variant 3 moves it to the right side as a persistent rail. Which one makes the brief feel more like a 'this is the most important thing' moment vs feeling like 'background context'?",
          ),
          sectionTitle("What I'm NOT looking for in this crit"),
          bullet("Color palette opinions — that's locked from the brand work last quarter."),
          bullet("Typography opinions — those are locked at the brand level too."),
          bullet("'What if we also did X' tangents — capture those, but we're not designing new features at this crit."),
          sectionTitle("Format"),
          p(
            "I'll present each variant for 5 minutes, then 15 minutes of open discussion on each question above. If you can't make it live, drop your written input in Figma comments before Thursday 12 PM PT and I'll incorporate it. Recording will be in <code>#design-q1</code> within 30 min of the meeting.",
          ),
          hr(),
          signature("Taylor Reed", "Design Lead · VectorMail", "design@vectormail.app"),
        ]),
        summary: "Design crit Thursday. Three review questions. Action: review Figma + show up.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-59",
        subject: "Weekly metrics email",
        senderName: "Metrics bot",
        senderEmail: "metrics@vectormail.app",
        daysAgo: 1,
        hour: 8,
        snippet: "DAU 1,847 (+4.2%). New signups 312. Reply latency p50 1.4s.",
        body: email([
          brandBlock("VectorMail Metrics"),
          headline("Weekly product metrics · week of May 10–17"),
          p("Auto-generated weekly digest from the product analytics pipeline. <strong>Healthy across the board.</strong> No new fires. Highlights below."),
          sectionTitle("Usage"),
          metricGrid([
            { label: "DAU", value: "1,847", sub: "+4.2% WoW" },
            { label: "MAU", value: "8,412", sub: "+2.8%" },
            { label: "DAU / MAU", value: "21.9%", sub: "+0.3 pp" },
            { label: "New signups", value: "312", sub: "+12% WoW" },
            { label: "Activation (first reply ≤ 7d)", value: "71%", sub: "+2 pp" },
            { label: "Conversion (trial → paid)", value: "34.2%", sub: "best ever" },
          ]),
          sectionTitle("Performance"),
          metricGrid([
            { label: "Reply latency p50", value: "1.4s", sub: "stable" },
            { label: "Reply latency p99", value: "3.8s", sub: "−12% WoW" },
            { label: "Search latency p95", value: "380ms", sub: "−18ms WoW" },
            { label: "Sync error rate", value: "0.04%", sub: "below SLO" },
            { label: "Buddy success", value: "94.1%", sub: "+1.2 pp" },
            { label: "Uptime", value: "99.97%", sub: "1× brief degradation" },
          ]),
          sectionTitle("Feature adoption"),
          bullet("<strong>Daily Brief:</strong> 78% of active users opened at least one this week (target 75%)."),
          bullet("<strong>Buddy reply:</strong> 41% used Buddy to draft a reply (vs 38% last week)."),
          bullet("<strong>Semantic search:</strong> 62% of users ran ≥ 1 NL query this week."),
          bullet("<strong>Outlook beta:</strong> 14 customers active. NPS so far: 8.7."),
          sectionTitle("Top user-requested features (this week)"),
          bullet("<strong>Mobile app</strong> · 47 mentions · top request 11 weeks running"),
          bullet("<strong>Outlook support</strong> · 31 mentions · beta active, will close most of these"),
          bullet("<strong>Team folders</strong> · 28 mentions · in roadmap for Q3"),
          bullet("<strong>Calendar integration</strong> · 22 mentions · scoped, not started"),
          bullet("<strong>Bulk operations</strong> · 18 mentions · technical scope sketched"),
          sectionTitle("Negative signals to watch"),
          bullet("Drop-off on onboarding step 3 (connect Gmail) is up 3 pp. Investigate Tuesday."),
          bullet("Sentiment in support tickets trending slightly negative — Aria flagging."),
          ctaRow([
            ctaButton("Open full dashboard", { color: "#1F3A2E" }),
            ctaButton("Drill into onboarding drop-off", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint("Generated by metrics-bot at 8:00 AM PT every Sunday. Data fresh through Saturday 11:59 PM PT. Source: PostHog + internal analytics warehouse."),
          companyEmailFooter("VectorMail Metrics"),
        ]),
        summary: "Weekly product metrics digest. Healthy across the board. Informational.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-60",
        subject: "Re: 1:1 prep - tomorrow",
        senderName: "Dana Howe",
        senderEmail: "dana@vectormail.app",
        daysAgo: 2,
        hour: 17,
        snippet: "Three things for our 1:1: roadmap, hiring, my career path. Notes attached.",
        body: email([
          p("Hi,"),
          p(
            "Setting our 1:1 tomorrow up with structure since I have three real things I want to push on this week — better to do it in writing than verbally, both for our sake (covering more ground in 30 minutes) and for posterity (these will compound over quarters).",
          ),
          sectionTitle("Three things, ranked"),
          bullet(
            "<strong>Q3 roadmap priorities · I have strong opinions and want to align.</strong> Specifically: I want to push hard for shipping the team-folders feature in Q3 even though it's not on the current roadmap. The data on top-of-funnel + the customer requests + the pgvector cutover wrapping in early Q3 all point to this being the right call. I've prepped the case in the notes.",
          ),
          bullet(
            "<strong>Hiring plan · pull the senior eng role forward.</strong> Currently scheduled to open in late Q2. I think we should open it next week. Velocity is at risk if Nathan + Elena both end up bottlenecked on the same project, which is happening in two weeks per my staffing model. Notes have the math.",
          ),
          bullet(
            "<strong>My career path · what does Director look like here and when?</strong> I've been Head of Eng for 14 months. I want to understand the rubric for the next level, what gaps I'd need to close, and what the realistic timeline is. Not asking for a promo decision tomorrow — asking for a conversation that I can use to drive the next 6 months.",
          ),
          sectionTitle("My notes (please read before)"),
          p(
            `<a href="#" style="color: #1a73e8; text-decoration: none; font-weight: 500;">1:1 prep · Q3 roadmap, hiring, career</a> · 4 pages · should take 6-8 minutes to read.`,
          ),
          sectionTitle("What I need from you"),
          p(
            "Read the notes, push back where I'm wrong, and come prepared to make calls on items 1 and 2. Item 3 doesn't need a decision tomorrow — but I want at least 5 minutes on it. If you'd rather pull it into a dedicated career conversation later this week, that's fine.",
          ),
          p("See you at 11."),
          hr(),
          signature("Dana Howe", "Head of Engineering · VectorMail", "dana@vectormail.app"),
        ]),
        summary: "Direct report 1:1 agenda. 3 topics incl. career path. Action: prep talking points before 11am.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-61",
        subject: "Notion - Plan renewing in 7 days",
        senderName: "Notion",
        senderEmail: "billing@notion.so",
        daysAgo: 1,
        hour: 7,
        snippet: "Your Plus plan renews May 24 for $96/seat × 14 = $1,344.",
        body: email([
          brandBlock("Notion"),
          headline("Your Notion Plus plan renews in 7 days"),
          p("Heads up — your annual Notion Plus subscription for <strong>VectorMail HQ</strong> auto-renews on May 24, 2026. We'll charge the card on file (Brex •• 1842) for the full year on that date. No action required if everything below looks right."),
          bigStat("Total at renewal", "$1,344.00 USD"),
          keyValBlock([
            { label: "Workspace", value: "VectorMail HQ" },
            { label: "Plan", value: "Plus (annual)" },
            { label: "Seats", value: "14 members" },
            { label: "Per seat", value: "$8 / month, billed annually ($96/seat/yr)" },
            { label: "Renewal date", value: "Sunday, May 24, 2026" },
            { label: "Billing period", value: "May 24, 2026 → May 23, 2027" },
            { label: "Payment method", value: "Brex Visa •• 1842" },
            { label: "Billing email", value: "finance@vectormail.app" },
          ]),
          sectionTitle("What's included on Plus"),
          bullet("Unlimited blocks for the whole team"),
          bullet("Unlimited file uploads (per-member-storage limits removed)"),
          bullet("30-day page history"),
          bullet("90-day deletion recovery"),
          bullet("Admin tools (member roles, link expiration, restricted templates)"),
          sectionTitle("Want to make a change?"),
          p("You can add seats, remove seats, switch to monthly, or upgrade to Business / Enterprise before the renewal date. Any changes apply immediately and are pro-rated."),
          ctaRow([
            ctaButton("Manage subscription", { color: "#000000" }),
            ctaButton("Add or remove seats", { color: "#000000", variant: "outline" }),
            ctaButton("Update payment method", { color: "#000000", variant: "outline" }),
          ]),
          fineprint(
            "Receipt will be sent to finance@vectormail.app within 1 hour of the charge. To download past invoices, visit Settings → Billing in your Notion workspace.",
          ),
          companyEmailFooter("Notion"),
        ]),
        summary: "Notion auto-renewal notice. Action: confirm budget or change plan before May 24.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-62",
        subject: "Vercel - Build minutes 80% used",
        senderName: "Vercel",
        senderEmail: "noreply@vercel.com",
        daysAgo: 2,
        snippet: "You've used 80% of your build minutes for this billing period.",
        body: email([
          brandBlock("Vercel"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Usage · 80% threshold</span></div>`,
          headline("You've used 80% of this month's build minutes"),
          p(
            `Your <strong>vectormail-ai</strong> team on the Pro plan has used <strong>4,803 of 6,000</strong> included build minutes for the current billing period. At your current rate (~210 min/day) you'll exceed the included allotment in about 6 days. Overage minutes bill at $0.005/min.`,
          ),
          metricGrid([
            { label: "Used", value: "4,803 min", sub: "80.1%" },
            { label: "Included", value: "6,000 min" },
            { label: "Days remaining", value: "9", sub: "billing period" },
            { label: "Avg / day", value: "210 min", sub: "last 7 days" },
            { label: "Projected total", value: "6,693 min", sub: "+693 over" },
            { label: "Projected overage", value: "$3.47" },
          ]),
          sectionTitle("Top projects by minutes"),
          keyValBlock([
            { label: "vectormail-ai (production)", value: "3,124 min · 65%" },
            { label: "vectormail-ai (preview)", value: "1,348 min · 28%" },
            { label: "vectormail-marketing", value: "312 min · 6%" },
            { label: "vectormail-docs", value: "19 min · <1%" },
          ]),
          sectionTitle("Why this is happening"),
          infoCard(
            "Preview deployments are running on every PR push (not just open PRs). The largest contributor is the e2e step rebuilding from a cold cache. Turning on the new <em>Build Cache</em> beta could cut these by ~40%.",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("Enable Build Cache", { color: "#000000" }),
            ctaButton("Upgrade to Enterprise", { color: "#000000", variant: "outline" }),
            ctaButton("Audit projects", { color: "#000000", variant: "outline" }),
          ]),
          fineprint(
            "Billing period: May 1 → May 31, 2026 · Team: vectormail-ai · Plan: Pro · Owner: marcus@vectormail.app",
          ),
          companyEmailFooter("Vercel"),
        ]),
        summary: "Vercel usage alert: 80% of build minutes used. Action: monitor or upgrade. Low-priority.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-63",
        subject: "Linear - Cycle 9 closed",
        senderName: "Linear",
        senderEmail: "notifications@linear.app",
        daysAgo: 3,
        snippet: "Cycle 9 closed. 42 issues completed, 6 carried over.",
        body: email([
          brandBlock("Linear"),
          headline("Cycle 9 closed · vectormail-ai · 2 weeks"),
          p(
            "Cycle 9 wrapped Friday at 5 PM PT. Here's how the team did against what you committed to two weeks ago — completion rate is your best yet (88%), and only 6 issues carried over.",
          ),
          metricGrid([
            { label: "Completed", value: "42", sub: "of 48 committed" },
            { label: "Completion rate", value: "88%", sub: "+11 pp from C8" },
            { label: "Velocity", value: "38 pts", sub: "+12% WoW" },
            { label: "Carried over", value: "6", sub: "−4 from C8" },
            { label: "Bugs fixed", value: "9", sub: "+3 from C8" },
            { label: "Cycle time (p50)", value: "1d 11h", sub: "−4h" },
          ]),
          sectionTitle("Highlights"),
          bullet(
            `Shipped <strong>VM-128</strong>: Typed tRPC errors landed across all routers (Elena)`,
          ),
          bullet(
            `Shipped <strong>VM-141</strong>: Buddy v2 streaming responses (Nathan + Marcus)`,
          ),
          bullet(
            `Shipped <strong>VM-156</strong>: Inbox brain weekly digest (Aria + product)`,
          ),
          bullet(
            `Bug fixed: <strong>VM-203</strong> — search filters not persisting on refresh`,
          ),
          sectionTitle("Carried into Cycle 10"),
          bullet("VM-118 · Outlook beta polish — 60% complete"),
          bullet("VM-167 · Scheduled-send dashboard — blocked on design"),
          bullet("VM-174 · Aurinko fallback endpoint switching"),
          bullet("VM-181 · Mobile responsive — needs another sprint"),
          bullet("VM-189 · Cron job observability"),
          bullet("VM-192 · Postmortem doc workflow"),
          sectionTitle("Up next · Cycle 10 begins Monday"),
          p(
            "47 issues triaged into Cycle 10 (already started planning). Capacity check looks healthy; we're at 84% of stretch — leaving room for spec'd work that comes in this week.",
          ),
          ctaRow([
            ctaButton("View cycle in Linear", { color: "#5e6ad2" }),
            ctaButton("Cycle 10 planning", { color: "#5e6ad2", variant: "outline" }),
          ]),
          fineprint("Team: vectormail-ai · Workspace: VectorMail HQ · Cycle 9: May 5 → May 16, 2026"),
          companyEmailFooter("Linear"),
        ]),
        summary: "Linear cycle close digest. No action. Informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-64",
        subject: "Figma - Plan changed to Organization",
        senderName: "Figma",
        senderEmail: "billing@figma.com",
        daysAgo: 8,
        snippet: "You upgraded your Figma plan to Organization on May 9.",
        body: email([
          brandBlock("Figma"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Upgrade · Active</span></div>`,
          headline("Welcome to Figma Organization"),
          p(
            "Your <strong>VectorMail HQ</strong> Figma workspace was upgraded from Professional to Organization on May 9, 2026. All new features and admin controls are active immediately. Below is your new plan summary and the most valuable Organization-tier features your team can now use.",
          ),
          keyValBlock([
            { label: "Plan", value: "Organization (was Professional)" },
            { label: "Workspace", value: "VectorMail HQ" },
            { label: "Seats included", value: "Unlimited editors + viewers" },
            { label: "Active editors", value: "8 editors, 14 viewers" },
            { label: "Billing change", value: "$45/editor/mo (was $15/editor/mo)" },
            { label: "Effective immediately", value: "Yes — pro-rated charge on next invoice" },
            { label: "Next invoice", value: "June 9, 2026 · ~$3,420" },
          ]),
          sectionTitle("New features your team can use today"),
          bullet("<strong>Design systems</strong> — shared component libraries across multiple files, with versioning and update tracking."),
          bullet("<strong>Branching</strong> — create design branches on top of your main file, review changes, merge back. Like git for designs."),
          bullet("<strong>Advanced permissions</strong> — set per-file and per-folder permissions, including view-only and comment-only modes."),
          bullet("<strong>SSO + SCIM</strong> — Okta SSO and SCIM provisioning for adding/removing teammates automatically."),
          bullet("<strong>Audit log</strong> — full activity history for compliance and incident response."),
          bullet("<strong>Variable themes</strong> — share design tokens across your team and apply them to any component."),
          sectionTitle("Setup we'd recommend in the first 30 days"),
          bullet("Set up SSO via Okta (~30 min, requires admin)."),
          bullet("Migrate your existing component library into the new Design Systems area."),
          bullet("Configure default permissions for new files (recommend 'View only' as default)."),
          ctaRow([
            ctaButton("Open admin settings", { color: "#0f0f0f" }),
            ctaButton("Set up SSO", { color: "#0f0f0f", variant: "outline" }),
            ctaButton("View migration guide", { color: "#a259ff", variant: "outline" }),
          ]),
          fineprint(
            "Receipt for this upgrade will be sent to finance@vectormail.app within 24 hours. To manage billing, visit Workspace settings → Billing in Figma.",
          ),
          companyEmailFooter("Figma"),
        ]),
        summary: "Figma plan upgrade confirmation. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-65",
        subject: "Sentry - 23% increase in errors",
        senderName: "Sentry",
        senderEmail: "noreply@sentry.io",
        daysAgo: 1,
        hour: 13,
        snippet: "Error count up 23% week-over-week in vectormail-ai project.",
        body: email([
          brandBlock("Sentry"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Weekly digest · Trending up</span></div>`,
          headline("Error rate in vectormail-ai is up 23% this week"),
          p(
            "Your weekly Sentry health check picked up an upward trend in unhandled errors. The increase is concentrated in two issues, both showing up after the embeddings batch refactor merged on Monday.",
          ),
          metricGrid([
            { label: "Project", value: "vectormail-ai" },
            { label: "Events", value: "4,128", sub: "+23% WoW" },
            { label: "Unique issues", value: "47", sub: "+12 new" },
            { label: "Users affected", value: "184", sub: "+31 WoW" },
            { label: "Crash-free sessions", value: "99.41%", sub: "−0.18 pp" },
            { label: "Release", value: "v2.41.2", sub: "shipped Mon" },
          ]),
          sectionTitle("Top issue · 78% of new events"),
          infoCard(
            `<div style="font-family: ${MONO_STACK}; font-size: 13.5px; color: #1f1f1f; margin-bottom: 6px;"><strong>TypeError</strong>: Cannot read properties of null (reading 'embedding')</div><div style="font-size: 13px; color: #5f6368; margin-bottom: 8px;">in <code>src/lib/embedding/batch.ts:142</code> · first seen 4 days ago</div><div style="font-size: 13px; color: #5f6368;">184 events · 31 users · last seen 12 min ago · assignee: @elena-vargas</div>`,
            { tone: "danger" },
          ),
          sectionTitle("Stack frame"),
          codeBlock(
            `<span style="color: #f0883e;">at</span> <span style="color: #79c0ff;">getEmbeddingBatch</span> <span style="color: #8b949e;">(src/lib/embedding/batch.ts:142)</span><br/><span style="color: #f0883e;">at</span> <span style="color: #79c0ff;">processQueue</span> <span style="color: #8b949e;">(src/lib/embedding/queue.ts:38)</span><br/><span style="color: #f0883e;">at</span> <span style="color: #79c0ff;">handleEmail</span> <span style="color: #8b949e;">(src/server/api/routers/account-procedures/email-reading.ts:88)</span>`,
          ),
          sectionTitle("Other notable issues"),
          bullet(
            `<strong>TimeoutError</strong>: Inngest run exceeded 60s · 42 events · 18 users · <code>process-scheduled-sends</code>`,
          ),
          bullet(
            `<strong>PrismaClientKnownRequestError</strong>: Unique constraint failed on <code>internetMessageId</code> · 38 events · 6 users`,
          ),
          bullet(
            `<strong>FetchError</strong>: ECONNRESET reaching <code>api.openrouter.ai</code> · 22 events · 11 users · transient`,
          ),
          ctaRow([
            ctaButton("Open in Sentry", { color: "#7553ff" }),
            ctaButton("View top issue", { color: "#7553ff", variant: "outline" }),
          ]),
          fineprint("Digest period: 2026-05-11 → 2026-05-17 · Project ID: vectormail-ai-prod"),
          companyEmailFooter("Sentry"),
        ]),
        summary: "Sentry trend alert: 23% increase in errors. Action: investigate embedding null bug. Time-sensitive.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-66",
        subject: "Twilio - $200 credit applied",
        senderName: "Twilio",
        senderEmail: "noreply@twilio.com",
        daysAgo: 5,
        snippet: "Your account has been credited $200 from the AI Startups program.",
        body: email([
          brandBlock("Twilio"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Credit applied · Twilio for AI Startups</span></div>`,
          headline("$200 in credits applied to your Twilio account"),
          p(
            "Congratulations — you've been approved for the <strong>Twilio for AI Startups</strong> program. We've added $200 in account credit, which you can use across any Twilio product (SMS, Voice, WhatsApp, Verify, etc.).",
          ),
          bigStat("Credit balance added", "$200.00 USD", { color: "#0caa41" }),
          keyValBlock([
            { label: "Program", value: "Twilio for AI Startups · Tier 1" },
            { label: "Credit amount", value: "$200 USD" },
            { label: "Valid until", value: "May 17, 2027 (12 months)" },
            { label: "Account ID", value: "AC••••••••••f2c1" },
            { label: "Applied to", value: "All Twilio products, no restrictions" },
            { label: "Stacking", value: "Adds on top of any existing balance" },
          ]),
          sectionTitle("What's next"),
          p(
            "Your credit was applied automatically — you don't need to do anything. It will be consumed first before we charge your card for any usage. If you have unused credit at the 12-month mark, it expires (it doesn't roll over).",
          ),
          sectionTitle("Get more out of Twilio for AI Startups"),
          bullet("<strong>Free tier consultation</strong> with a Twilio AI solutions engineer (45 min)."),
          bullet("<strong>Beta access</strong> to Twilio Voice AI features ahead of general availability."),
          bullet("<strong>Quarterly office hours</strong> with the Twilio AI startup team and other portfolio companies."),
          bullet("<strong>Marketing co-op</strong> if you publish a case study (credit toward the next year)."),
          ctaRow([
            ctaButton("View console", { color: "#f22f46" }),
            ctaButton("Book solutions call", { color: "#f22f46", variant: "outline" }),
            ctaButton("Twilio for AI Startups", { color: "#f22f46", variant: "outline" }),
          ]),
          fineprint(
            "Twilio for AI Startups is a 12-month program supporting early-stage AI companies. Eligibility re-evaluated annually based on size + funding stage.",
          ),
          companyEmailFooter("Twilio"),
        ]),
        summary: "Twilio program credit. No action. Informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-67",
        subject: "1Password - Vault shared with you",
        senderName: "1Password",
        senderEmail: "no-reply@1password.com",
        daysAgo: 4,
        snippet: "Marcus shared 'Production secrets' vault with you.",
        body: email([
          brandBlock("1Password"),
          headline("Marcus shared a vault with you"),
          p(
            `<strong>Marcus Liu</strong> shared the <strong>Production secrets</strong> vault with you in the <em>VectorMail Engineering</em> business account. Items are immediately available — open 1Password to access.`,
          ),
          keyValBlock([
            { label: "Vault", value: "Production secrets" },
            { label: "Items", value: "47 (API keys, DB credentials, OAuth secrets, certs)" },
            { label: "Your permission level", value: "Manage (read, write, share with admin approval)" },
            { label: "Shared by", value: "Marcus Liu · marcus@vectormail.app" },
            { label: "Shared on", value: "Friday, May 14, 2026 · 11:18 AM PT" },
            { label: "Vault audit trail", value: "Enabled — your accesses are logged" },
          ]),
          sectionTitle("What's in this vault"),
          bullet("Production database credentials (read-write + read-only)"),
          bullet("Aurinko, OpenRouter, Stripe, Anthropic API keys"),
          bullet("Webhook signing secrets (Stripe, Clerk, Plaid)"),
          bullet("Service-account tokens and SSH host keys"),
          bullet("TLS certificates and PKI material"),
          sectionTitle("Reminders before you use this"),
          infoCard(
            `<strong>Audit trail is on.</strong> Every read of an item in this vault is logged and reviewed during SOC 2 audits. Don't copy values to personal notes or password managers — keep them in 1Password and use the CLI / browser extension instead.`,
            { tone: "warn" },
          ),
          ctaRow([
            ctaButton("Open in 1Password", { color: "#0572ec" }),
            ctaButton("Review permissions", { color: "#0572ec", variant: "outline" }),
          ]),
          fineprint(
            "Your 1Password account: demo@vectormail.app · Team: VectorMail Engineering · Plan: Business",
          ),
          companyEmailFooter("1Password"),
        ]),
        summary: "1Password vault shared. Action: verify access. Low priority.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-68",
        subject: "Brex - 3 transactions need receipts",
        senderName: "Brex",
        senderEmail: "noreply@brex.com",
        daysAgo: 2,
        snippet: "3 transactions over $75 are missing receipts. Add them in the app.",
        body: email([
          brandBlock("Brex"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Receipts overdue · 3 transactions</span></div>`,
          headline("3 transactions over $75 are missing receipts"),
          p(
            "Your finance team needs receipts attached to these expenses for accurate month-end close. <strong>All three have been outstanding for 7+ days</strong>, which means they'll be flagged in this month's audit unless documented soon.",
          ),
          bigStat("Outstanding receipt total", "$1,747.40", { color: "#f59e0b" }),
          sectionTitle("Transactions needing receipts"),
          infoCard(
            `<div style="font-size: 14.5px;"><strong>Vercel</strong> · $240.00 · May 14, 2026 · Card •• 1842 · Auto-categorized: Software</div><div style="font-size: 13px; color: #5f6368; margin-top: 4px;">7 days outstanding. Likely the Pro plan annual top-up. Forward the auto-emailed Vercel receipt to receipts@brex.com.</div>`,
            { accent: "#f59e0b" },
          ),
          infoCard(
            `<div style="font-size: 14.5px;"><strong>Datadog</strong> · $895.00 · May 12, 2026 · Card •• 1842 · Auto-categorized: Software</div><div style="font-size: 13px; color: #5f6368; margin-top: 4px;">9 days outstanding. Monthly bill — receipt was emailed to billing@vectormail.app on May 12. Find and forward.</div>`,
            { accent: "#f59e0b" },
          ),
          infoCard(
            `<div style="font-size: 14.5px;"><strong>United Airlines</strong> · $612.40 · May 9, 2026 · Card •• 1842 · Auto-categorized: Travel</div><div style="font-size: 13px; color: #5f6368; margin-top: 4px;">12 days outstanding. Likely your SFO-JFK flight. United emails receipts to the booking email — search inbox for 'UA 1142'.</div>`,
            { accent: "#f59e0b" },
          ),
          sectionTitle("How to attach (any of the 3 work)"),
          bullet("<strong>Email:</strong> Forward the original receipt to <code>receipts@brex.com</code> from this address — Brex auto-matches it."),
          bullet("<strong>App:</strong> Open the Brex app → Recent → tap the transaction → 'Add receipt' → snap or upload."),
          bullet("<strong>Slack:</strong> DM @Brex in Slack with the receipt + transaction ID."),
          ctaRow([
            ctaButton("Open Brex app", { color: "#0f0f0f" }),
            ctaButton("Forward receipts via email", { color: "#0f0f0f", variant: "outline" }),
          ]),
          fineprint(
            "Auto-match works for ~95% of common vendor receipts. If a match fails, you'll receive a separate email asking for manual review.",
          ),
          companyEmailFooter("Brex"),
        ]),
        summary: "Brex: 3 receipts overdue. Action: upload in app. Low priority but recurring.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-69",
        subject: "Mercury - Wire transfer received",
        senderName: "Mercury",
        senderEmail: "alerts@mercury.com",
        daysAgo: 6,
        snippet: "$45,000.00 wire received from Brightlane Holdings.",
        body: email([
          brandBlock("Mercury"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Wire received · Funds available</span></div>`,
          headline("$45,000.00 wire from Brightlane Holdings has cleared"),
          p(
            `A wire transfer was credited to your Mercury Checking account this morning. Funds are immediately available — no holding period for inbound wires.`,
          ),
          bigStat("Amount received", "$45,000.00 USD", { color: "#0caa41" }),
          keyValBlock([
            { label: "From", value: "Brightlane Holdings, Inc." },
            { label: "Originating bank", value: "First Republic Bank · 7180•••••" },
            { label: "Beneficiary account", value: "Mercury Checking •• 3412" },
            { label: "Reference / Memo", value: "BL-2026-INV-0091 (Q2 renewal · 75 seats · annual prepay)" },
            { label: "Wire type", value: "Domestic · same-day" },
            { label: "Received at", value: "Monday, May 12, 2026 · 9:18 AM PT" },
            { label: "Available balance now", value: "$4,128,420.18" },
          ]),
          sectionTitle("Reconciliation suggestion"),
          infoCard(
            `<strong>This likely matches invoice INV-0091</strong> issued to Brightlane on May 3 for the Q2 renewal + expansion ($45,000 annual prepay for 75 seats). If you use Pilot for bookkeeping, this will auto-reconcile within 24 hours. If you reconcile manually, mark INV-0091 as paid.`,
            { tone: "ok" },
          ),
          sectionTitle("Anti-fraud check"),
          bullet("Sender on file? <strong>Yes</strong> — Brightlane Holdings has sent wires to this account 6 times in the past 12 months."),
          bullet("Amount matches expected invoice? <strong>Yes</strong> — exact match to INV-0091."),
          bullet("Originating bank matches history? <strong>Yes</strong> — First Republic, same as prior wires."),
          ctaRow([
            ctaButton("View transaction", { color: "#0f1c3f" }),
            ctaButton("Mark invoice paid in Stripe", { color: "#0f1c3f", variant: "outline" }),
            ctaButton("Reply to send thanks", { color: "#0f1c3f", variant: "outline" }),
          ]),
          fineprint(
            "Mercury · Banking services provided by Choice Financial Group and Evolve Bank & Trust, Members FDIC. Wires are credited the same business day if received before 5 PM PT.",
          ),
          companyEmailFooter("Mercury"),
        ]),
        summary: "Wire from Brightlane cleared ($45K). Action: confirm with finance, mark invoice paid.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-70",
        subject: "Plaid - Webhook signing secret rotated",
        senderName: "Plaid",
        senderEmail: "noreply@plaid.com",
        daysAgo: 3,
        snippet: "Your sandbox webhook signing secret has been rotated.",
        body: email([
          brandBlock("Plaid"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Action required · Sandbox</span></div>`,
          headline("Your sandbox webhook signing secret was rotated"),
          p(
            "Per your team's rotation policy, the webhook signing secret for your <strong>Sandbox environment</strong> was rotated on May 14, 2026 at 11:42 AM PT. Webhook deliveries to your sandbox endpoint will fail signature verification until you update the environment variable.",
          ),
          keyValBlock([
            { label: "Environment", value: "Sandbox (test data only — Production is unaffected)" },
            { label: "Rotated by", value: "marcus@vectormail.app · auto-policy (90-day rotation)" },
            { label: "Old secret", value: "Last 4: ••••8F2A · revoked at 11:47 AM" },
            { label: "New secret", value: "Available in your Plaid dashboard · view-once" },
            { label: "Endpoint affected", value: "https://sandbox.vectormail.app/api/plaid/webhook" },
            { label: "Estimated dev/QA disruption", value: "Until env var is updated (typically <10 min)" },
          ]),
          sectionTitle("Steps to update"),
          bullet("Sign in to dashboard.plaid.com → Team Settings → API Keys → Webhook secrets."),
          bullet("Copy the new secret (it's only viewable for the next 24 hours)."),
          bullet("Update <code>PLAID_WEBHOOK_SIGNING_SECRET</code> in your sandbox env (Vercel preview env)."),
          bullet("Trigger a test webhook delivery to confirm signature verification passes."),
          sectionTitle("If you're unsure where this is configured"),
          infoCard(
            "Check <code>src/app/api/plaid/webhook/route.ts</code> in the codebase — that's where the signing secret is loaded. Your Vercel preview environment variable is <code>PLAID_WEBHOOK_SIGNING_SECRET</code> on the <code>vectormail-ai</code> project.",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("Open Plaid dashboard", { color: "#000000" }),
            ctaButton("View rotation history", { color: "#000000", variant: "outline" }),
          ]),
          fineprint(
            "Production secrets follow a separate, manually-triggered rotation policy. Sandbox secrets rotate every 90 days by default. To adjust, visit Team Settings → Security in Plaid.",
          ),
          companyEmailFooter("Plaid"),
        ]),
        summary: "Plaid: webhook secret rotated. Action: update env vars in sandbox.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-71",
        subject: "Invitation: Board meeting - May 28, 2 PM",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 0,
        hour: 9,
        snippet: "Board meeting invite from Hana Cho. 2 PM PT, May 28.",
        body: email([
          brandBlock("Calendar"),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "28", weekday: "Thu" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">Q2 Board Meeting · VectorMail</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">2:00 PM – 4:00 PM PT · 2 hours</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Hybrid · Forerunner Ventures office + Zoom</div></td></tr></table>`,
          p(
            "<strong>Hana Cho</strong> (Forerunner) is inviting you to the May board meeting. Pre-read materials were posted to the shared drive on Friday — please read before the meeting so we can spend time on decisions, not on context.",
          ),
          sectionTitle("Where"),
          keyValBlock([
            { label: "In person", value: "Forerunner Ventures · 1 Letterman Drive, Bldg C, 4th floor" },
            {
              label: "Zoom",
              value: `<a href="#" style="color: #1a73e8; text-decoration: none;">meet.zoom.us/j/812-44-901</a> · pwd: vmboard`,
            },
            { label: "Dial-in", value: "+1 (669) 900-6833 · ID 812 44 901 · PIN 4421" },
          ]),
          sectionTitle("Agenda (drafted)"),
          logRow("2:00 – 2:10", "Welcome + safety message · Hana", { tone: "info" }),
          logRow("2:10 – 2:35", "Q1 + April KPIs · CEO + CFO", { tone: "info" }),
          logRow("2:35 – 2:55", "Customer wins + pipeline · CRO", { tone: "info" }),
          logRow("2:55 – 3:15", "Hiring plan through Q3 · Head of People", { tone: "info" }),
          logRow("3:15 – 3:35", "Product roadmap + Q3 themes · CPO", { tone: "info" }),
          logRow("3:35 – 3:55", "Governance items · Counsel", { tone: "warn" }),
          logRow("3:55 – 4:00", "Wrap-up + AOB", { tone: "info" }),
          sectionTitle("Decisions needed"),
          bullet("Approval to expand hiring plan by +3 heads in Q3."),
          bullet("Authorize $250K bridge facility with SVB (already vetted by counsel)."),
          bullet("Adopt the revised option grant guidelines for executive hires."),
          sectionTitle("Attendees · 7"),
          profileCard({ name: "Hana Cho", title: "Partner, Forerunner", company: "Board observer", initials: "HC", accent: "#4285f4", rightLabel: "Organizer" }),
          profileCard({ name: "Owen Falk", title: "Index Ventures", company: "Board observer", initials: "OF", accent: "#0caa41", rightLabel: "Accepted" }),
          profileCard({ name: "Daniel Brun", title: "Foundry", company: "Board observer", initials: "DB", accent: "#a78bfa", rightLabel: "Accepted" }),
          ctaRow([
            ctaButton("Yes, I'll attend", { color: "#0caa41" }),
            ctaButton("Maybe", { color: "#1a73e8", variant: "outline" }),
            ctaButton("No", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            "Pre-read: <a href='#' style='color: #1a73e8;'>shared/board/2026-05-28-prep.pdf</a> · Last updated by Hana 21 hours ago · You're receiving this because you're on the board attendee list. To stop these reminders, edit your notification settings in Google Calendar.",
          ),
          companyEmailFooter("Calendar"),
        ]),
        summary: "Board meeting calendar invite. Action: accept + read pre-read.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-72",
        subject: "Invitation: All-hands - May 23, 10 AM",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 3,
        snippet: "Monthly all-hands. Dana hosting.",
        body: email([
          brandBlock("Calendar"),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "23", weekday: "Fri" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">All-Hands · May</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">10:00 AM – 10:45 AM PT · 45 min</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Office + Zoom · monthly</div></td></tr></table>`,
          p(
            "Monthly all-hands. Dana is hosting and Marcus + Elena will be demoing Buddy v2. We're keeping it tight (45 min instead of 60) so everyone can get back to focused work before the weekend.",
          ),
          sectionTitle("Where"),
          keyValBlock([
            { label: "In person", value: "VectorMail HQ · 535 Mission St, 4th floor (large meeting room)" },
            { label: "Zoom", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">meet.google.com/vmh-allhands-may</a>` },
            { label: "Host", value: "Dana Howe" },
            { label: "Calendar", value: "Work" },
          ]),
          sectionTitle("Agenda"),
          logRow("10:00 – 10:10", "CEO update · KPIs, hiring, customer wins", { tone: "info" }),
          logRow("10:10 – 10:25", "Product demo: Buddy v2 streaming · Marcus + Elena", { tone: "info" }),
          logRow("10:25 – 10:40", "Live Q&A — submit questions in Slido in advance", { tone: "info" }),
          logRow("10:40 – 10:45", "Wrap + birthdays this month", { tone: "info" }),
          sectionTitle("Pre-read"),
          bullet("Slides will be posted in <code>#all-hands</code> by 9 AM PT day-of."),
          bullet("Anonymous Q&A is live now — submit anything you want addressed."),
          bullet("Recording will be in the shared drive within 30 min of the meeting."),
          ctaRow([
            ctaButton("Yes", { color: "#0caa41" }),
            ctaButton("Maybe", { color: "#1a73e8", variant: "outline" }),
            ctaButton("No", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            "If you're remote and joining via Zoom, please mute your mic on entry. Cameras encouraged for the demo segment so we can see reactions.",
          ),
          companyEmailFooter("Calendar"),
        ]),
        summary: "All-hands calendar invite. Action: accept.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-73",
        subject: "Invitation: Customer call - Brightlane (renewal)",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 1,
        hour: 11,
        snippet: "Renewal call with Sophia (Brightlane). May 20, 3 PM.",
        body: email([
          brandBlock("Calendar"),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "20", weekday: "Tue" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">Brightlane renewal call</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">3:00 PM – 3:30 PM PT · 30 min</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Zoom · with Sophia Pereira</div></td></tr></table>`,
          p("Q2 renewal conversation with Sophia at Brightlane. They're expanding 50 → 75 seats and asking for a 10% volume discount + 12-month price lock. Aria has the quote ready — please review before the call."),
          sectionTitle("Where"),
          keyValBlock([
            { label: "Video", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">brightlane.zoom.us/j/4188-99-2841</a>` },
            { label: "Organizer", value: "Sophia Pereira (sophia@brightlane.io)" },
            { label: "Brightlane attendees", value: "Sophia Pereira (VP Eng), Tomas Reyes (CFO)" },
            { label: "Our attendees", value: "You + Aria Singh" },
          ]),
          sectionTitle("Pre-read · quote + relationship history"),
          bullet("<strong>Current state:</strong> 50 seats · $99/seat/mo · ~$59.4K ARR · 9 months tenure"),
          bullet("<strong>Proposed:</strong> 75 seats · 10% volume discount · 12-month price lock · ~$80.2K ARR (+35%)"),
          bullet("<strong>Customer story participation:</strong> Sophia agreed to be the public case study"),
          bullet("<strong>Reference calls:</strong> 1-2 per quarter, scheduled through Sophia"),
          sectionTitle("Decisions to make on the call"),
          bullet("Confirm the discount + price lock."),
          bullet("Lock case-study scope + timeline (Aria has a draft we can share)."),
          bullet("Ask for the customer-of-the-month moment in our internal all-hands."),
          ctaRow([
            ctaButton("Yes", { color: "#0caa41" }),
            ctaButton("Maybe", { color: "#1a73e8", variant: "outline" }),
            ctaButton("Open quote doc", { color: "#1a73e8", variant: "outline" }),
          ]),
          fineprint("Customer health: Green. NPS: 9. Risk of non-renewal: Low. Risk of pushing back on the discount: Low."),
          companyEmailFooter("Calendar"),
        ]),
        summary: "Renewal call with Brightlane. Action: review quote before Tuesday.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-74",
        subject: "Invitation: Coffee - Lina Ortiz",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 2,
        snippet: "30 min coffee with Lina. Mission district, May 21, 9 AM.",
        body: email([
          brandBlock("Calendar"),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "21", weekday: "Wed" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">Coffee with Lina Ortiz</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">9:00 AM – 9:30 AM PT · 30 min</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Ritual Coffee, Valencia · in-person</div></td></tr></table>`,
          p(
            "Standing quarterly with Lina from Greenhouse — our senior recruiting partner. She runs the talent market intel for ~30 portfolio companies and is always a good check on how we're calibrated on comp, leveling, and the broader hiring market.",
          ),
          sectionTitle("Where"),
          keyValBlock([
            { label: "Location", value: "Ritual Coffee · 1026 Valencia St, San Francisco" },
            { label: "Who", value: "Lina Ortiz · lina@greenhouseteam.com" },
            { label: "Walk from office", value: "~12 min · plan accordingly" },
            { label: "Cadence", value: "Quarterly (this is Q2 catchup)" },
          ]),
          sectionTitle("What I want to ask Lina"),
          bullet("How is the senior backend engineer market shifting in SF this quarter? Are we still in the comp band that closes deals?"),
          bullet("Anything you've seen in the last 30 days that should change how we're sourcing or pitching?"),
          bullet("Real talk on Nathan Wu's competing offer: how aggressive should we be vs. comparable Series A companies right now?"),
          bullet("Heads-up on anyone you have in your network we should be talking to (Staff PM specifically, given Sasha Hill is on the radar)."),
          sectionTitle("What Lina usually wants from me"),
          bullet("Reciprocal intel: what's our funnel looking like? Where are we losing candidates?"),
          bullet("Referrals from our team to her other clients (low-touch, high-value)."),
          ctaRow([
            ctaButton("Yes", { color: "#0caa41" }),
            ctaButton("Move 30 min later", { color: "#1a73e8", variant: "outline" }),
          ]),
          fineprint("Reminder: 5-min walk buffer each way. Hand-drip coffee is the move there; she always gets the iced cortado."),
          companyEmailFooter("Calendar"),
        ]),
        summary: "1:1 coffee invite from recruiter. Action: accept.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-75",
        subject: "Reschedule: Design review",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 1,
        hour: 12,
        snippet: "Taylor moved the design review from Tuesday to Wednesday 2 PM.",
        body: email([
          brandBlock("Calendar"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Rescheduled · please reconfirm</span></div>`,
          headline("Design review · moved to Wednesday 2 PM"),
          p(
            "Taylor moved the Q1 design review. The meeting has been rescheduled to <strong>Wednesday, May 21 · 2:00 PM – 3:00 PM PT</strong> (was Tuesday May 20 at 10 AM). Your calendar has been automatically updated; please reconfirm.",
          ),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "21", weekday: "Wed" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 17px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">Design review · Q1 roadmap</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">2:00 PM – 3:00 PM PT · 60 min</div></td></tr></table>`,
          sectionTitle("Organizer note"),
          infoCard(
            `<strong>Taylor:</strong> "Conflict came up on my end with the Brightlane onsite — sorry for the shuffle. New time should work for the same group. Recording will be available afterward for anyone who can't make Wed."`,
            { tone: "warn" },
          ),
          sectionTitle("Where"),
          keyValBlock([
            { label: "Video", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">meet.google.com/vmh-design-q1</a>` },
            { label: "Figma", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">Q1 — Designs for review</a>` },
            { label: "Pre-read", value: "Read Figma + comments before the meeting" },
          ]),
          sectionTitle("What's still on the agenda"),
          bullet("Inbox v3 triage column — first sharpened pass"),
          bullet("Buddy chat surface — final review"),
          bullet("Settings IA — first cut"),
          bullet("Mobile shell — first proper look"),
          ctaRow([
            ctaButton("Reconfirm Wednesday", { color: "#0caa41" }),
            ctaButton("Propose another time", { color: "#1a73e8", variant: "outline" }),
            ctaButton("Decline (recording is fine)", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint("Your previous 'Yes' on Tuesday has been removed. Please reconfirm so we know who's in for Wednesday."),
          companyEmailFooter("Calendar"),
        ]),
        summary: "Design review rescheduled to Wed 2 PM. Action: confirm or rebook.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-76",
        subject: "Declined: Lunch with Sam Chen",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 2,
        snippet: "Sam declined lunch on Friday. Suggested next week.",
        body: email([
          brandBlock("Calendar"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #dc2626; background: rgba(220, 38, 38, 0.1); border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Declined · Wants to reschedule</span></div>`,
          headline("Sam Chen declined lunch on Friday"),
          p(
            "<strong>Sam Chen</strong> from VC Partners declined your lunch invitation for Friday, May 22 at 12:30 PM. He attached a note suggesting we look at next week instead.",
          ),
          sectionTitle("His note"),
          infoCard(
            `"Conflict came up on my end — partner offsite landed Friday and I can't move it. Apologies for the late notice. Can we look at next week instead? I'm wide open Tuesday through Thursday — your pick. Still want to catch up on the Series A close + I owe you the intros to those fintech operators I mentioned."`,
            { accent: "#5f6368" },
          ),
          sectionTitle("Original event"),
          keyValBlock([
            { label: "Was", value: "Friday, May 22 · 12:30 PM – 1:30 PM PT" },
            { label: "Where", value: "Tartine, 18th & Guerrero" },
            { label: "Status", value: "Declined · removed from your calendar" },
          ]),
          sectionTitle("Suggested next steps"),
          bullet("Reply to Sam directly to propose a new time. Easiest: send your Calendly link for next week."),
          bullet("Hold Tuesday-Thursday next week open until he confirms."),
          bullet("Make sure to surface 'intros to fintech operators' when you reschedule — Hana asked about that 3 days ago and his are valuable."),
          ctaRow([
            ctaButton("Reply to Sam", { color: "#1a73e8" }),
            ctaButton("Send Calendly link", { color: "#1a73e8", variant: "outline" }),
          ]),
          fineprint("This event has been removed from your calendar. A new event will appear when you and Sam confirm a replacement time."),
          companyEmailFooter("Calendar"),
        ]),
        summary: "Lunch declined, asking to reschedule. Action: propose new time.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-77",
        subject: "Invitation: VC office hours - Hana Cho",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 3,
        snippet: "30 min office hours with Hana. May 25, 4 PM.",
        body: email([
          brandBlock("Calendar"),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "25", weekday: "Mon" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">VC office hours · Hana Cho</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">4:00 PM – 4:30 PM PT · 30 min</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Forerunner Ventures, Letterman Drive (or Zoom)</div></td></tr></table>`,
          p(
            "Monthly investor office hours with Hana at Forerunner. Open agenda — Hana likes 'bring whatever's on top' over structured. Use it for honest reality checks on whatever you're wrestling with.",
          ),
          sectionTitle("Where"),
          keyValBlock([
            { label: "In person", value: "Forerunner Ventures · 1 Letterman Drive · 4th floor, room 4C" },
            { label: "Zoom backup", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">forerunner.zoom.us/j/824-22-901</a>` },
            { label: "Organizer", value: "Hana Cho (hana@forerunnervc.com)" },
            { label: "Cadence", value: "Monthly · always last Monday of the month" },
          ]),
          sectionTitle("Suggested topics this month"),
          bullet("<strong>The NRR question.</strong> She asked in March whether the jump from 108 to 117 was concentrated or broad-based. You owe her an answer with data."),
          bullet("<strong>Mosaic Health intro.</strong> She offered an intro to Sam at Mosaic. You haven't confirmed yes/no — easiest answer is yes."),
          bullet("<strong>Pricing reset.</strong> The variant-B rollout is live. Share early results since this is one of her favorite topics."),
          bullet("<strong>Wild card.</strong> Anything else you want fresh-eye input on — pricing, hiring, fundraising approach."),
          sectionTitle("Pre-prep"),
          bullet("Bring the NRR cohort cut Hana asked for in March."),
          bullet("Have one specific question ready that's actually keeping you up at night."),
          bullet("She always closes with 'what can I help with' — have a real ask."),
          ctaRow([
            ctaButton("Yes", { color: "#0caa41" }),
            ctaButton("Maybe", { color: "#1a73e8", variant: "outline" }),
            ctaButton("Reschedule", { color: "#1a73e8", variant: "outline" }),
          ]),
          fineprint("Office hours run weekly with each portfolio company. Hana cancels rarely; if you can't make it, she usually rebooks within the same week."),
          companyEmailFooter("Calendar"),
        ]),
        summary: "Investor office hours. Action: prep topics or accept as-is.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-78",
        subject: "Cancelled: Lunch (rescheduled separately)",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 4,
        snippet: "Theo cancelled Friday's lunch. Working on a new time.",
        body: email([
          brandBlock("Calendar"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #dc2626; background: rgba(220, 38, 38, 0.1); border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Cancelled · No replacement yet</span></div>`,
          headline("Theo cancelled Friday's lunch"),
          p("Theo Vargas (Castleworks) cancelled the lunch you had booked for Friday May 22 at 1:00 PM. He's working on a new time and will send a replacement invite separately."),
          sectionTitle("Original event"),
          keyValBlock([
            { label: "Was", value: "Friday, May 22 · 1:00 PM – 2:00 PM PT" },
            { label: "Where", value: "Tartine Manufactory" },
            { label: "Status", value: "Cancelled · removed from calendar" },
          ]),
          sectionTitle("Organizer note"),
          infoCard(
            `<strong>Theo:</strong> "Something came up at Castleworks that I need to handle this week — apologies for the late notice. I'll send a new invite for next week. Don't book this slot back up yet — I'll try to lock by Tuesday."`,
            { accent: "#5f6368" },
          ),
          sectionTitle("Suggested follow-up"),
          bullet("Wait until Tuesday for Theo's replacement invite (he said he'd lock it by then)."),
          bullet("If you don't hear from Theo by Wednesday, send a friendly nudge — it's worth keeping this on the calendar given he's a paying customer."),
          ctaRow([
            ctaButton("Reply to Theo", { color: "#1a73e8" }),
          ]),
          fineprint("Cancellations don't appear in your calendar but are tracked in your meeting history for 30 days."),
          companyEmailFooter("Calendar"),
        ]),
        summary: "Lunch cancelled. Action: wait for new invite.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-79",
        subject: "Lenny's Newsletter - The PM career ladder",
        senderName: "Lenny's Newsletter",
        senderEmail: "newsletter@lennysnewsletter.com",
        daysAgo: 1,
        hour: 6,
        snippet: "This week: how the best companies design PM career ladders.",
        body: email([
          brandBlock("Lenny's Newsletter"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #5f6368; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">Issue #218 · Sunday read · 14 min</div>`,
          headline("The PM career ladder · everything I've learned in 10 years"),
          p(
            "Hey,<br/><br/>This week I'm publishing the biggest research project I've done this year: a deep dive into how 47 top companies structure their product manager career ladders. I interviewed leveling-rubric authors from Stripe, Figma, Notion, Linear, Anthropic, OpenAI, and 41 others. The result is the most comprehensive look at PM leveling I've seen anywhere.",
          ),
          sectionTitle("What's in this issue"),
          listItem({
            title: "The 5 levels every PM ladder needs (and why most teams only use 3)",
            meta: "PM I, PM II, Senior PM, Staff PM, Principal PM — with the specific evidence each level requires.",
            emoji: "🪜",
          }),
          listItem({
            title: "Comp bands by location · what top startups actually pay",
            meta: "Numbers from 47 companies, anonymized, with bands by Series A through public.",
            emoji: "💰",
          }),
          listItem({
            title: "The rubric template I'd steal · Stripe's leveling doc, with edits",
            meta: "Public for the first time. Includes the four dimensions Stripe uses (scope, autonomy, impact, leadership) and how to calibrate them.",
            emoji: "📋",
          }),
          listItem({
            title: "Calibration: how to run the meeting that ratifies promotions",
            meta: "Templates and scripts that actually work. The two questions every promo discussion should answer.",
            emoji: "⚖️",
          }),
          sectionTitle("One quote that stuck with me"),
          infoCard(
            `"The most expensive leveling mistake startups make is over-leveling early hires to compete for talent. It feels like a win in the moment, but it inflates the org chart and makes the next 30 hires harder to recruit. Bands compress fast in companies that under-discipline this." — VP Product at a Series B company, anonymized.`,
            { accent: "#dc2626" },
          ),
          sectionTitle("Templates you can copy today"),
          bullet("Stripe's PM rubric (public for the first time)"),
          bullet("Figma's promotion-packet template"),
          bullet("Notion's leveling-calibration meeting agenda"),
          bullet("Linear's compensation philosophy memo"),
          ctaRow([
            ctaButton("Read the full issue", { color: "#dc2626" }),
            ctaButton("Forward to a friend", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            "Keep building. — Lenny<br/>This took 6 weeks to research. If you found it useful, the best thing you can do is share with one PM friend. That's how this newsletter grows.",
          ),
          companyEmailFooter("Lenny's Newsletter"),
        ]),
        summary: "Newsletter. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-80",
        subject: "Stratechery - This week's analysis",
        senderName: "Stratechery",
        senderEmail: "notes@stratechery.com",
        daysAgo: 3,
        snippet: "AI agents, distribution, and the next platform shift.",
        body: email([
          brandBlock("Stratechery"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #80868b; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">Daily Update · May 14, 2026</div>`,
          headline("AI Agents and the Platform Shift"),
          p(
            `<em>Subscriber edition — please don't forward this email; if a colleague wants to read it, they can subscribe at stratechery.com.</em>`,
          ),
          p(
            "Every fifteen years or so, the layer where software gets built and distributed shifts. Mainframes to PCs (1980s). PCs to web (mid-90s). Web to mobile (2008). Mobile to cloud (2014). The pattern is consistent: a new substrate emerges that disrupts the economics of distribution, and the incumbents who control distribution at the prior layer either reinvent themselves or get disrupted.",
          ),
          p(
            "AI agents are the next platform shift. Not the model itself — the model is more like the GPU of this era. The platform shift is the layer of software that orchestrates models, tools, and user intent end-to-end. The companies that win this layer will define the economics of software distribution for the next decade.",
          ),
          sectionTitle("Today's argument · three claims"),
          bullet(
            "<strong>Distribution is shifting from app stores to agents.</strong> Users no longer want to learn 30 apps to do their work; they want to describe their intent and have it be handled. The interface to software is changing.",
          ),
          bullet(
            "<strong>Aggregation theory still applies, but the aggregators are different.</strong> The companies that own the user's intent layer (where you direct the agent) will be the aggregators. Today that's OpenAI, Anthropic, Google. Tomorrow it could be the OS layer — Apple, Microsoft.",
          ),
          bullet(
            "<strong>Vertical specialists will not be disrupted by horizontal agents — at least not initially.</strong> The economics of getting the long tail of workflows right are not in the agent's favor. Vertical AI products will win the next 5 years; horizontal agents will eat them in years 7-10.",
          ),
          sectionTitle("Who's positioned well"),
          p(
            "Microsoft (Copilot + OS distribution), Apple (devices + privacy story), and OpenAI/Anthropic (model + first-party agent surface). Google has the strongest theoretical position — they own search, devices, productivity, and models — but execution has been weaker than the others.",
          ),
          sectionTitle("Who's positioned poorly"),
          p(
            "Notion-style horizontal productivity tools without a clear AI moat. Salesforce as the aggregator of business workflows — they're trying to become the agent layer but their distribution surface (Slack) is being eaten by Microsoft + AI-native challengers.",
          ),
          ctaRow([
            ctaButton("Read the full update", { color: "#ed1c24" }),
            ctaButton("Listen to the audio", { color: "#1a1a1a", variant: "outline" }),
          ]),
          fineprint("Stratechery is a daily strategy newsletter by Ben Thompson. To unsubscribe or manage your preferences, visit stratechery.com/account."),
          companyEmailFooter("Stratechery"),
        ]),
        summary: "Newsletter. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-81",
        subject: "The Information - Daily brief",
        senderName: "The Information",
        senderEmail: "newsletter@theinformation.com",
        daysAgo: 0,
        hour: 6,
        snippet: "OpenAI's new model, Anthropic enterprise push, and 3 fundraise scoops.",
        body: email([
          brandBlock("The Information"),
          `<div style="margin: 0 0 8px 0; font-size: 12px; color: #d4af37; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">Daily briefing · Sunday, May 17, 2026</div>`,
          headline("OpenAI's quiet new model, Anthropic's enterprise momentum, and 3 fundraise scoops"),
          p(
            "Good morning. Three things to know today: OpenAI is preparing a new flagship model release that's leaking early benchmarks (and they're meaningful); Anthropic's enterprise revenue has reportedly tripled in 6 months; and three AI startups are closing rounds at unicorn valuations this week. We have the scoops below.",
          ),
          sectionTitle("Top story"),
          infoCard(
            `<div style="font-size: 15px; font-weight: 600; color: #1f1f1f; margin-bottom: 6px;">OpenAI's New Flagship Model Beats Claude on Internal Benchmarks</div><div style="font-size: 13px; color: #5f6368; margin-bottom: 8px;">By Stephanie Palazzolo · 8-min read</div><div style="font-size: 14px; color: #1f1f1f; line-height: 1.55;">According to three sources familiar with internal testing, OpenAI's unreleased GPT-5.1 outperforms Claude 4.7 by 4-7% on coding and reasoning benchmarks, with substantial gains on agentic tool-use. The model is expected to ship in late June. Pricing leaked at $5/1M input, $20/1M output — a 30% discount vs current GPT-4.1.</div>`,
            { accent: "#d4af37" },
          ),
          sectionTitle("Also today"),
          listItem({
            title: "Anthropic Enterprise Revenue Triples in 6 Months, Sources Say",
            meta: "Annualized enterprise run rate now approaches $1.2B. Driven by Claude Code adoption among Fortune 500 engineering orgs. Sales team has doubled in the same window.",
          }),
          listItem({
            title: "3 AI Startups Raising at Unicorn Valuations This Week",
            meta: "Decagon (agent platform, $1.4B post), Cresta (agent infra, $1.2B), and one stealth-mode workflow startup we've heard but can't yet name (~$1B post).",
          }),
          listItem({
            title: "Apple Intelligence Update Delayed Again",
            meta: "Sources at Apple say the on-device agentic features previewed at last year's WWDC have slipped to iOS 19 from iOS 18.4.",
          }),
          listItem({
            title: "Nvidia's Quarter Beats — but Concentration Risk Grows",
            meta: "60% of last quarter's revenue came from just 4 hyperscaler customers. The Information's analysis on what this means for the next 4 quarters.",
          }),
          sectionTitle("Trending in the comments"),
          p(
            "Subscriber discussion on yesterday's piece on 'Why Microsoft Will Win the Agent Wars' is at 412 comments and counting — the most-discussed piece this year. Worth a read of the top-rated reply.",
          ),
          ctaRow([
            ctaButton("Read full briefing", { color: "#000000" }),
            ctaButton("Listen to the audio", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("The Information · subscriber-exclusive · forwarding is logged. Reply to this email with feedback for the editor."),
          companyEmailFooter("The Information"),
        ]),
        summary: "Daily news brief. No action.",
        labels: [labelPromotions],
        read: false,
      },
      {
        id: "demo-thread-82",
        subject: "First Round Review - Sales for founders",
        senderName: "First Round Review",
        senderEmail: "review@firstround.com",
        daysAgo: 4,
        snippet: "How early-stage founders should approach the first 10 enterprise sales.",
        body: email([
          brandBlock("First Round Review"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #ed1c24; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">Founder playbooks · 18-min read</div>`,
          headline("The first 10 enterprise sales · what 50+ founders wish they'd known"),
          p(
            "We surveyed 50+ founders across our portfolio about their first 10 enterprise customers — what worked, what didn't, what they'd do differently. The result is a playbook for the most counterintuitive phase of building a B2B company: when no one on the team has a sales background, and every deal feels like a one-off.",
          ),
          sectionTitle("Five patterns that show up over and over"),
          bullet("<strong>Discount everything in year 1.</strong> The data is unambiguous — first-year customers should be 30-50% below your standard pricing in exchange for written feedback and a willingness to be a reference. Founders who 'held the line' on pricing in the first 10 deals lost 70% of them."),
          bullet("<strong>You don't need an AE until your 11th customer.</strong> Founders close the first 10. Hiring earlier means you teach an AE a sales motion that doesn't exist yet — they fail, and you blame them. Don't."),
          bullet("<strong>Build a sales artifact, not a pitch deck.</strong> A one-page case study from your first customer is worth 10× more than a 30-slide pitch deck. Spend time making it perfect."),
          bullet("<strong>Procurement gates are the real bottleneck.</strong> SOC 2, MSA template, security questionnaires, DPA. Build a 'procurement-ready' kit before customer #2, not customer #10."),
          bullet("<strong>Founder-led sales is the only sustainable signal of PMF.</strong> If you can't sell it, no one else can. Period."),
          sectionTitle("Featured founder · Marisol Choi, CEO of Lattice"),
          infoCard(
            `"I made every mistake in this playbook. The biggest one: I tried to hire an AE in year one because I hated selling. The AE was great at selling — for a product that didn't exist yet. We didn't have a sales motion to transfer, we had a series of founder conversations. The AE quit after 4 months because she couldn't repeat what I was doing."`,
            { accent: "#ed1c24" },
          ),
          ctaRow([
            ctaButton("Read the full piece", { color: "#000000" }),
            ctaButton("Download the artifact pack", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("First Round Review · Free for founders, forever. Published every other Tuesday. Manage subscription at firstround.com/review."),
          companyEmailFooter("First Round Review"),
        ]),
        summary: "Newsletter. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-83",
        subject: "Not Boring by Packy McCormick",
        senderName: "Not Boring",
        senderEmail: "packy@notboring.co",
        daysAgo: 5,
        snippet: "On the rise of vertical AI companies and what it means for ecosystem builders.",
        body: email([
          brandBlock("Not Boring"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #1a1a1a; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">Sunday essay · 22-min read</div>`,
          headline("The Vertical AI Moment"),
          p(
            "Hey friends,<br/><br/>I want to argue something specific this week: the next 100 unicorns are going to be vertical AI companies, and the people building them are exactly the people who should be paying attention <em>right now</em> — not in 6 months when this is mainstream Twitter discourse.",
          ),
          sectionTitle("The argument in three pieces"),
          bullet(
            "<strong>Horizontal AI is largely won.</strong> OpenAI, Anthropic, Google have eaten the model layer. The remaining horizontal opportunities are infrastructure (cool but capital-intensive) and pure-API resellers (a margin-compressed race to the bottom). The opportunity is in the vertical.",
          ),
          bullet(
            "<strong>Vertical AI = full-stack workflow + AI native.</strong> Not 'AI inside an existing vertical SaaS.' That's incremental. Vertical AI means rebuilding the workflow from scratch with AI as the primary surface, not a sidecar. Examples: VectorMail in inbox, Harvey in law, Hippocratic in healthcare admin.",
          ),
          bullet(
            "<strong>Distribution dynamics favor verticals right now.</strong> The Klein bottle of AI: horizontal models commoditize fast, but vertical workflows have natural distribution + retention moats (compliance, data, integrations). The unit economics improve as workflows deepen.",
          ),
          sectionTitle("Three companies I'd bet on (and why)"),
          listItem({
            title: "VectorMail · AI-native inbox",
            meta: "The vertical: knowledge-worker email. The wedge: actually reads + drafts, not just shortcuts. The moat: getting the long-tail edge cases right, which only comes from real customer feedback loops at scale.",
          }),
          listItem({
            title: "Harvey · AI for law firms",
            meta: "The vertical: legal research + drafting. The wedge: trust + compliance. The moat: the firms themselves become the customers and the dataset.",
          }),
          listItem({
            title: "Decagon · AI customer support",
            meta: "The vertical: enterprise customer service. The wedge: agents that learn from real tickets in a fine-grained way. The moat: depth of integration.",
          }),
          ctaRow([
            ctaButton("Read the full essay", { color: "#1a1a1a" }),
            ctaButton("Watch the podcast version", { color: "#fde047", variant: "outline" }),
          ]),
          fineprint("Reply with what you're working on — I read every one. Not Boring is supported by sponsors that I personally vet. This week's sponsor: Mercury (banking).<br/><br/>Catch you next Sunday — Packy"),
          companyEmailFooter("Not Boring"),
        ]),
        summary: "Newsletter. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-84",
        subject: "Pragmatic Engineer - This week in engineering",
        senderName: "Gergely Orosz",
        senderEmail: "newsletter@pragmaticengineer.com",
        daysAgo: 2,
        snippet: "Hiring slowdowns, AI tools that actually ship, and Big Tech engineering trends.",
        body: email([
          brandBlock("The Pragmatic Engineer"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #ee6c4d; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">The Pragmatic Engineer · Friday · 17-min read</div>`,
          headline("This week in engineering · hiring market real talk + AI tools that actually ship"),
          p(
            "Hello,<br/><br/>Three substantial pieces in the newsletter this week, each based on conversations with 20+ engineering leaders and a healthy stack of data. I'll keep the email short and let the links do the talking.",
          ),
          sectionTitle("Featured this week"),
          listItem({
            title: "The state of the engineering hiring market · Q2 2026",
            meta: "Based on data from 47 companies and 12,000 candidates. The market is more bifurcated than ever — top 10% candidates have offers within 2 weeks; everyone else is stuck. The split is mostly explained by one variable.",
            emoji: "📊",
          }),
          listItem({
            title: "AI engineering tools after the novelty wears off",
            meta: "I asked 50 engineers what AI tools they still use after 6 months. The answers are surprising. Cursor and Claude Code dominate; almost everything else has been quietly abandoned.",
            emoji: "🔧",
          }),
          listItem({
            title: "What Big Tech engineering culture looks like in 2026",
            meta: "Inside Google, Meta, Amazon, and Microsoft. Interviews with 30 staff+ engineers across all four. The 'middle' has been thinned out at every one of these companies, and it's reshaping how careers progress.",
            emoji: "🏢",
          }),
          sectionTitle("Quick links · for paying subscribers only"),
          bullet("How a Series B fintech runs their on-call rotation (paid)"),
          bullet("Promotion calibration spreadsheet template (paid)"),
          bullet("A staff engineer's career retrospective: 'I should have left earlier' (paid)"),
          sectionTitle("From the community"),
          p(
            "Reader Drew K. wrote in with a great point on incident-response runbooks: 'The runbook nobody reads is worse than no runbook — at least with no runbook, people are calibrated to think for themselves.' Couldn't agree more.",
          ),
          ctaRow([
            ctaButton("Read everything", { color: "#16213e" }),
            ctaButton("Subscribe a friend", { color: "#16213e", variant: "outline" }),
          ]),
          fineprint("The Pragmatic Engineer is a reader-supported newsletter. Free subscribers get the weekly digest. Paid subscribers get the long-form deep dives. No ads, ever."),
          companyEmailFooter("The Pragmatic Engineer"),
        ]),
        summary: "Engineering newsletter. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-85",
        subject: "Substack - 3 new posts from people you follow",
        senderName: "Substack",
        senderEmail: "no-reply@substack.com",
        daysAgo: 2,
        snippet: "New posts from Lenny, Packy, and Patrick OShaughnessy.",
        body: email([
          brandBlock("Substack"),
          headline("3 new posts from people you follow"),
          p("Three writers you follow published in the last 24 hours. Quick summaries below — tap any title to read the full post."),
          listItem({
            title: "Lenny Rachitsky · How to ship faster without ruining quality",
            meta: "9-min read · 412 likes · 38 comments · The 'speed without panic' framework Stripe used in 2018 that still applies — and the three places startups confuse 'speed' for 'recklessness.'",
            emoji: "✍️",
          }),
          listItem({
            title: "Packy McCormick · The compounding effect of AI agents",
            meta: "14-min read · 287 likes · 22 comments · A taxonomy of where agents are 0.5× as good as humans today, where they're already 1.0×, and where they'll be 1.5× in 24 months.",
            emoji: "✍️",
          }),
          listItem({
            title: "Patrick O'Shaughnessy · Decoder ring for founders raising in 2026",
            meta: "21-min read · 184 likes · 41 comments · Talked to 60 founders mid-raise. The four signals investors are weighting more than any time in the last 5 years.",
            emoji: "✍️",
          }),
          sectionTitle("Discover · trending in your network"),
          bullet("'Why every Series B is rewriting their pricing right now' — by Hana Cho · 1.2K likes"),
          bullet("'The post-AI cost stack for SaaS' — by Ben Thompson · 980 likes"),
          bullet("'Hiring for adversarial product sense' — by Marisol Choi · 720 likes"),
          ctaRow([
            ctaButton("Open Substack", { color: "#ff6719" }),
            ctaButton("Manage subscriptions", { color: "#ff6719", variant: "outline" }),
          ]),
          fineprint("Subscribe to receive these directly when they're published. You can turn off this daily roundup in Substack settings."),
          companyEmailFooter("Substack"),
        ]),
        summary: "Substack roundup. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-86",
        subject: "Y Combinator - Startup School week 4",
        senderName: "Startup School",
        senderEmail: "school@ycombinator.com",
        daysAgo: 6,
        snippet: "Week 4 talk available: Jessica Livingston on founder humility.",
        body: email([
          brandBlock("Startup School"),
          headline("Week 4 talk available · Jessica Livingston on founder humility"),
          p(
            "Hi,<br/><br/>Week 4 of YC Startup School is live. Jessica Livingston's talk this week is one of my personal favorites in the curriculum — it's about how the founders we backed who succeeded shared one trait that doesn't show up on any pitch deck: they listened harder than they talked.",
          ),
          sectionTitle("This week's talk"),
          listItem({
            title: "'Founder humility, listening, and the hidden signal we look for'",
            meta: "Jessica Livingston, co-founder of Y Combinator · 38 minutes · transcript + Q&A included",
            emoji: "🎥",
          }),
          sectionTitle("What you'll learn"),
          bullet("Why the most successful founders we've backed were 'great listeners, not great talkers' — and the specific behaviors that show this trait in early conversations."),
          bullet("How to spot when you're talking past your customer (vs. talking with them) — Jessica's specific test."),
          bullet("The 'first 50 customer conversations' framework that produced PMF for half of YC's most successful companies."),
          bullet("Why founders who 'know everything already' have the lowest success rate in our data, and how to avoid that trap."),
          sectionTitle("Recommended reading + exercises"),
          bullet("Do the 'Mom Test' exercise from Rob Fitzpatrick's book before next week. We provide the worksheet."),
          bullet("Ship the next 3 customer conversations as recorded calls (with permission) and transcribe them. You'll see things you missed in real time."),
          bullet("Read the Startup School essay 'The Hidden Power of Listening' (2018, Jessica) — it's the written version of the talk, useful as a refresher."),
          ctaRow([
            ctaButton("Watch the talk", { color: "#ff6600" }),
            ctaButton("Download transcript", { color: "#ff6600", variant: "outline" }),
          ]),
          fineprint(
            "Next week: a guest talk from Dalton Caldwell on 'The 10 biggest mistakes early-stage founders make.' Bring questions to the live Q&A on Thursday at 12 PM PT.",
          ),
          companyEmailFooter("Startup School"),
        ]),
        summary: "YC Startup School content. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-87",
        subject: "Mind the Product - Conference 2026 lineup",
        senderName: "Mind the Product",
        senderEmail: "team@mindtheproduct.com",
        daysAgo: 7,
        snippet: "Speaker lineup announced - Marty Cagan, Teresa Torres, more.",
        body: email([
          brandBlock("Mind the Product"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #e91e63; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Speakers · Early-bird ends June 1</span></div>`,
          headline("MTP Engage 2026 speaker lineup is live"),
          p(
            "We're excited to announce the full speaker lineup for <strong>MTP Engage 2026</strong>, happening October 17-18 in San Francisco. This year's program is the strongest in our history — 34 speakers across 3 stages, 2 days of workshops, and the legendary 'product-leader-only' dinner on the second night.",
          ),
          metricGrid([
            { label: "Speakers", value: "34" },
            { label: "Days", value: "2" },
            { label: "Tracks", value: "3" },
            { label: "Workshops", value: "12" },
            { label: "Expected attendance", value: "2,400" },
            { label: "Early-bird discount", value: "$200 off" },
          ]),
          sectionTitle("Headliners"),
          profileCard({
            name: "Marty Cagan",
            title: "Author of INSPIRED · partner at SVPG",
            initials: "MC",
            accent: "#e91e63",
            rightLabel: "Keynote",
          }),
          profileCard({
            name: "Teresa Torres",
            title: "Author of Continuous Discovery Habits",
            initials: "TT",
            accent: "#e91e63",
            rightLabel: "Day 1 close",
          }),
          profileCard({
            name: "Lenny Rachitsky",
            title: "Lenny's Newsletter · ex-Airbnb",
            initials: "LR",
            accent: "#e91e63",
            rightLabel: "Day 2 open",
          }),
          sectionTitle("Plus 31 more, including"),
          bullet("Marisol Choi · CEO, Lattice"),
          bullet("Daniel Hsu · Director of Product, Stripe"),
          bullet("Sasha Hill · Staff PM, Anthropic"),
          bullet("Aditya Mehta · CPO, Linear"),
          bullet("Drew Hwang · Director of Product, Brightlane"),
          sectionTitle("Pricing tiers"),
          keyValBlock([
            { label: "Early bird (until June 1)", value: "$1,295 · save $200" },
            { label: "Standard", value: "$1,495" },
            { label: "Team of 5+", value: "Email for group rate" },
            { label: "Workshop add-on", value: "+$295 (limited capacity)" },
          ]),
          ctaRow([
            ctaButton("Get early-bird tickets", { color: "#e91e63" }),
            ctaButton("View full lineup", { color: "#e91e63", variant: "outline" }),
            ctaButton("Submit a talk for 2027", { color: "#e91e63", variant: "outline" }),
          ]),
          fineprint(
            "Tickets are non-refundable but transferable up until 30 days before the event. If you can't attend in person, we'll have a livestream pass available for $295.",
          ),
          companyEmailFooter("Mind the Product"),
        ]),
        summary: "Conference promo. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-88",
        subject: "SOC 2 Type II audit - kickoff",
        senderName: "Vanta",
        senderEmail: "audit@vanta.com",
        daysAgo: 2,
        hour: 11,
        snippet: "Your SOC 2 Type II audit kicks off May 26. 4 evidence items still open.",
        body: email([
          brandBlock("Vanta"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Audit · 4 items open</span></div>`,
          headline("Your SOC 2 Type II audit kicks off in 7 days"),
          p(
            "Your audit period for SOC 2 Type II begins <strong>Monday, May 26, 2026</strong>. Your auditor (Prescient Assurance) will start sampling evidence from that day forward. Below is a snapshot of where you stand — four open items remain, all resolvable this week.",
          ),
          metricGrid([
            { label: "Auditor", value: "Prescient Assurance" },
            { label: "Audit period", value: "May 26 – Nov 26", sub: "6 months" },
            { label: "Policies", value: "100%", sub: "all approved" },
            { label: "Controls", value: "96%", sub: "4 open" },
            { label: "Evidence collected", value: "91%", sub: "auto + manual" },
            { label: "Personnel attestations", value: "14 / 14", sub: "all signed" },
          ]),
          sectionTitle("Open items (4)"),
          infoCard(
            `<strong>1. Incident response tabletop exercise</strong><br/><span style="color: #5f6368; font-size: 13px;">Owner: Marcus · Due May 23 · Hold a 60-minute simulated incident with the on-call team. Vanta provides a template scenario.</span>`,
            { tone: "warn" },
          ),
          infoCard(
            `<strong>2. Vendor risk review — Aurinko</strong><br/><span style="color: #5f6368; font-size: 13px;">Owner: Aria · Due May 24 · SOC 2 report received; need to upload and complete the questionnaire in Vanta.</span>`,
            { tone: "warn" },
          ),
          infoCard(
            `<strong>3. Vendor risk review — OpenRouter</strong><br/><span style="color: #5f6368; font-size: 13px;">Owner: Aria · Due May 24 · No SOC 2 available; alternate questionnaire from the vendor instead.</span>`,
            { tone: "warn" },
          ),
          infoCard(
            `<strong>4. Background-check policy (CC1.5)</strong><br/><span style="color: #5f6368; font-size: 13px;">Owner: People Ops · Due May 25 · Policy drafted; needs final review + sign-off before kickoff.</span>`,
            { tone: "warn" },
          ),
          sectionTitle("Recommended order this week"),
          bullet("Monday: People Ops finalizes the background-check policy."),
          bullet("Tuesday: Aria runs the two vendor questionnaires in parallel."),
          bullet("Wednesday afternoon: Marcus runs the incident tabletop with the on-call rotation."),
          bullet("Friday: Vanta sanity-check + you sign off everything is green for Monday."),
          ctaRow([
            ctaButton("Open audit dashboard", { color: "#314CE5" }),
            ctaButton("Message your auditor", { color: "#314CE5", variant: "outline" }),
          ]),
          fineprint(
            "If any item slips past its due date, it becomes a finding for the audit. Vanta will retry evidence collection daily — keep your Slack notifications on.",
          ),
          companyEmailFooter("Vanta"),
        ]),
        summary: "Vanta: SOC 2 audit kickoff in 7 days. 4 evidence items open. Action: close all 4 this week.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-89",
        subject: "New device sign-in detected",
        senderName: "Google",
        senderEmail: "no-reply@accounts.google.com",
        daysAgo: 1,
        hour: 22,
        snippet: "iPhone 15 Pro signed in from San Francisco.",
        body: email([
          brandBlock("Google"),
          headline("New device signed in to your Google Account"),
          p(
            `Hi,<br/><br/>Your Google Account <strong>demo@vectormail.app</strong> was just used to sign in on a new device. If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account right away.`,
          ),
          keyValBlock([
            { label: "Device", value: "iPhone 15 Pro · iOS 18.4" },
            { label: "App", value: "Mail on iOS" },
            { label: "Location", value: "San Francisco, CA, United States" },
            { label: "IP address", value: "73.222.•••.••• (Comcast Cable)" },
            { label: "Date & time", value: "Sunday, May 17, 2026 · 9:42 PM PT" },
          ]),
          sectionTitle("If this was you"),
          p(
            "No action needed. You can keep using your account as usual. We send these alerts whenever a new device signs in for the first time, even if it's yours.",
          ),
          sectionTitle("If this wasn't you"),
          infoCard(
            "Someone may have access to your account. We recommend you sign out of all devices, change your password, and review your recent security activity — Google can walk you through each step on the security checkup page.",
            { tone: "danger" },
          ),
          ctaRow([
            ctaButton("Check activity", { color: "#1a73e8" }),
            ctaButton("Don't recognize this", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            "Google will never ask you for your password, verification code, or any other sensitive information by email. To find out more about why we send these alerts, visit the Google Account Help Center.",
          ),
          companyEmailFooter("Google"),
        ]),
        summary: "Google security alert (new iPhone). Action: verify it was you.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-90",
        subject: "Password expiring in 7 days",
        senderName: "Okta",
        senderEmail: "noreply@okta.com",
        daysAgo: 1,
        snippet: "Your Okta password expires May 23. Change it to avoid lockout.",
        body: email([
          brandBlock("Okta"),
          headline("Your Okta password expires in 7 days"),
          p(
            `Hi <strong>demo</strong>,<br/><br/>Your password for the <strong>VectorMail</strong> Okta organization is set to expire on <strong>Saturday, May 23, 2026 at 11:59 PM PT</strong>. Once it expires, you won't be able to access any company apps (Notion, Linear, Vercel, GitHub Enterprise, Datadog, plus 18 others) until you reset it.`,
          ),
          keyValBlock([
            { label: "Account", value: "demo@vectormail.app" },
            { label: "Org", value: "vectormail.okta.com" },
            { label: "Password set on", value: "Feb 21, 2026 (90 days ago)" },
            { label: "Expires on", value: "May 23, 2026" },
            { label: "Days remaining", value: "7" },
            { label: "Connected apps", value: "23" },
          ]),
          sectionTitle("Password requirements"),
          bullet("Minimum 12 characters"),
          bullet("Must include letters, numbers, and at least one symbol"),
          bullet("Cannot match your last 5 passwords"),
          bullet("Cannot contain your name, email, or org name"),
          sectionTitle("MFA reminder"),
          infoCard(
            "Your account uses Okta Verify Push as primary MFA. Keep your phone with you when you reset — you'll be prompted to approve.",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("Change password", { color: "#007dc1" }),
            ctaButton("Open Okta dashboard", { color: "#007dc1", variant: "outline" }),
          ]),
          fineprint(
            "If you need help, contact your IT admin or visit help.okta.com. For your security, password resets must be done from a trusted browser.",
          ),
          companyEmailFooter("Okta"),
        ]),
        summary: "Okta: password expires in 7 days. Action: rotate it.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-91",
        subject: "GDPR data request - customer",
        senderName: "Privacy team",
        senderEmail: "privacy@vectormail.app",
        daysAgo: 3,
        snippet: "Customer at Brightlane requested data export under GDPR.",
        body: email([
          headline("GDPR data export request · Brightlane customer"),
          p(
            "Hi,<br/><br/>Heads up — received a formal GDPR Article 15 data-access request from one of Brightlane's team members this morning. The user submitted through our self-serve portal. <strong>Handling is in motion under standard process — no action needed from you</strong>, but you should know this exists in case anything escalates.",
          ),
          keyValBlock([
            { label: "Request type", value: "GDPR Article 15 · Right of Access (data export)" },
            { label: "Requester", value: "anon-customer-c-4128 (Brightlane staff member)" },
            { label: "Account", value: "Brightlane (customer · 75 seats)" },
            { label: "Submitted via", value: "Self-serve portal · privacy.vectormail.app/request" },
            { label: "Received", value: "Friday, May 15, 2026 · 9:32 AM PT" },
            { label: "Statutory deadline", value: "30 days · target complete May 28, 2026" },
            { label: "Owner", value: "Aria Singh + Privacy team" },
          ]),
          sectionTitle("What's being exported"),
          bullet("All emails synced for this user (~2,400 threads, ~14,800 individual messages)"),
          bullet("All AI-generated summaries, briefs, drafts attributed to this user"),
          bullet("Account metadata: signup date, payment history (none — they're on the company plan), audit log of their access"),
          bullet("Vector embeddings (we'll include them as raw arrays + an explanation of what they are)"),
          bullet("All linked support tickets and in-app messages"),
          sectionTitle("Process"),
          p(
            "Standard pipeline: automated export runs via Aurinko + our analytics warehouse → privacy review (PII redaction check) → secure delivery via signed download link valid for 7 days. Target completion well within the 30-day window — likely by Wednesday next week.",
          ),
          sectionTitle("When you'll hear from us again"),
          bullet("Day-of confirmation when the export is ready."),
          bullet("Only if anything unusual surfaces in the review (e.g., they're asking us to also delete the data — which is a separate Article 17 request and goes through a different flow)."),
          hr(),
          signature("Privacy team", "Privacy + Compliance · VectorMail", "privacy@vectormail.app"),
        ]),
        summary: "GDPR data export request. Action: aware only - privacy team handling.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-92",
        subject: "Pentest report - Q2",
        senderName: "Cobalt",
        senderEmail: "reports@cobalt.io",
        daysAgo: 4,
        snippet: "Q2 pentest report attached. 1 medium, 3 low findings.",
        body: email([
          brandBlock("Cobalt"),
          headline("Q2 penetration test · final report"),
          p(
            "Cobalt has completed your Q2 black-box penetration test against the VectorMail production environment. Test ran over 10 business days (May 5 → May 16) with two senior pentesters. Full PDF report and the structured findings JSON are attached. Summary below.",
          ),
          metricGrid([
            { label: "Critical", value: "0", sub: "no exploitable" },
            { label: "High", value: "0" },
            { label: "Medium", value: "1", sub: "fix in 30 days" },
            { label: "Low", value: "3", sub: "fix in 90 days" },
            { label: "Informational", value: "7", sub: "best practice" },
            { label: "Overall posture", value: "Strong", sub: "B+ → A−" },
          ]),
          sectionTitle("Medium · resolve within 30 days"),
          infoCard(
            `<strong>M-01 · Rate-limiting bypass on POST /api/embeddings</strong><br/><span style="color: #5f6368; font-size: 13px;">The per-IP rate limiter on the embeddings endpoint can be bypassed by rotating the <code>X-Forwarded-For</code> header. Authenticated users can saturate downstream OpenAI quota at the org level. CVSS 6.4 · suggested fix: derive the rate-limit key from the verified user/session, not the request IP.</span>`,
            { tone: "warn" },
          ),
          sectionTitle("Low · resolve within 90 days"),
          bullet("<strong>L-01.</strong> Verbose error messages on /api/auth leak stack traces in production. <span style='color: #5f6368;'>CVSS 3.7</span>"),
          bullet("<strong>L-02.</strong> Content-Security-Policy header missing on /demo subroutes. <span style='color: #5f6368;'>CVSS 3.1</span>"),
          bullet("<strong>L-03.</strong> Default password policy allows 8-character passwords without complexity requirements. <span style='color: #5f6368;'>CVSS 2.9</span>"),
          sectionTitle("Informational (selected)"),
          bullet("HSTS preload not enabled — recommend submitting to hstspreload.org."),
          bullet("Subresource Integrity not enforced on Marketing site."),
          bullet("Webhook endpoints accept events older than 5 minutes — replay window."),
          bullet("Stripe webhook handler doesn't enforce <code>stripe-signature</code> timestamp."),
          sectionTitle("What's strong"),
          p(
            "Authorization model is tight — we couldn't escalate from one account to another. Secrets management via 1Password + AWS Secrets Manager is well-instrumented. Audit logging is comprehensive. Your incident response playbook (which we tested in a tabletop) is mature for your stage.",
          ),
          ctaRow([
            ctaButton("Open full report", { color: "#0a2540" }),
            ctaButton("Schedule retest", { color: "#0a2540", variant: "outline" }),
            ctaButton("Export findings to Jira", { color: "#0a2540", variant: "outline" }),
          ]),
          fineprint(
            "Engagement: COBALT-VM-2026-Q2 · Test scope: prod web app, public API, mobile app, marketing site, customer demo · Methodology: OWASP ASVS 4.0, OWASP API Top 10, PTES",
          ),
          companyEmailFooter("Cobalt"),
        ]),
        summary: "Pentest report: 1 medium, 3 low. Action: triage medium finding within 30 days.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-93",
        subject: "Podcast invitation - 20VC",
        senderName: "20VC Team",
        senderEmail: "podcast@20vc.com",
        daysAgo: 3,
        snippet: "Harry would like to have you on 20VC. Recording window: late June.",
        body: email([
          p("Hi,"),
          p(
            "Harry Stebbings here (technically his team — I'm Marisol on the production side, looping you both in below the signature). Harry caught the Brightlane case study you published last month and would love to have you on <strong>20VC</strong> to talk about the AI inbox category, where it fits in the broader productivity stack, and the founder journey of building an AI-native company at this moment.",
          ),
          sectionTitle("Format"),
          keyValBlock([
            { label: "Show", value: "20VC with Harry Stebbings" },
            { label: "Recording length", value: "60 minutes (will edit to ~50)" },
            { label: "Format", value: "Video + audio, in-studio (London) or remote (your choice)" },
            { label: "Audience", value: "~180K downloads/episode · founders, investors, operators" },
            { label: "Topic", value: "AI inbox category + your specific founder journey" },
            { label: "Air date", value: "Mid-July 2026" },
          ]),
          sectionTitle("What Harry tends to ask (heads up)"),
          bullet("How you arrived at the specific wedge of 'AI inbox' vs other AI productivity surfaces."),
          bullet("The Series A — fundraise timing, terms, what you wish you'd known."),
          bullet("Honest conversation on your competitive landscape (Microsoft Copilot, Superhuman, etc.). Harry likes specifics, not platitudes."),
          bullet("The one thing you got wrong in the first 18 months and what changed."),
          bullet("Closing question Harry always asks: 'What advice would you give the founder who's exactly where you were 18 months ago?'"),
          sectionTitle("Recording window"),
          p(
            "Late June. Specifically, we're holding two 90-min blocks: <strong>Thursday, June 25 at 2 PM PT</strong> and <strong>Friday, June 26 at 10 AM PT</strong>. If neither works, we can flex into early July — just want to publish before SaaStr in mid-September.",
          ),
          sectionTitle("Logistics"),
          bullet("If remote: we send pro-grade microphone + camera to your office a week before. Yours to keep."),
          bullet("If in-studio (London): we cover business-class travel + 3 nights at the Standard. Recording done within 48 hours of arrival."),
          bullet("Pre-call with Harry ~10 days before to align on themes (60 min, video)."),
          bullet("Episode goes out across YouTube, Spotify, Apple Podcasts, and standalone newsletter (35K subscribers)."),
          p(
            "Let me know if you're interested and which window works. If not the right time, totally understand — happy to revisit in 3-6 months.",
          ),
          hr(),
          signature("Marisol Singh", "Head of Production · 20VC", "marisol@20vc.com"),
        ]),
        summary: "Podcast invitation from 20VC. Action: confirm yes/no, propose recording slot.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-94",
        subject: "Conference speaker invitation - SaaStr 2026",
        senderName: "SaaStr Programs",
        senderEmail: "programs@saastr.com",
        daysAgo: 5,
        snippet: "Invitation to speak on the AI-native track at SaaStr Annual.",
        body: email([
          p("Hi,"),
          p(
            "Pleased to invite you to speak at <strong>SaaStr Annual 2026</strong> on the AI-Native track. This is the most-attended SaaS conference in the world — and the AI-Native track this year is the most demanded slot we have. We'd love to have you.",
          ),
          sectionTitle("Conference details"),
          keyValBlock([
            { label: "Event", value: "SaaStr Annual 2026" },
            { label: "Dates", value: "September 14-16, 2026 (3 days)" },
            { label: "Location", value: "San Mateo County Event Center, San Mateo, CA" },
            { label: "Expected attendance", value: "12,400 (in-person) + 28K (livestream)" },
            { label: "Your track", value: "AI-Native · 14 speakers across 2 days" },
            { label: "Audience profile", value: "Founders (38%), product/eng leaders (28%), investors (18%), other (16%)" },
          ]),
          sectionTitle("Two formats — your pick"),
          bullet("<strong>Solo talk (25 min):</strong> Your stage, your story. We help with framing if needed. Strong format for the kind of opinionated, contrarian content that gets shared after the event."),
          bullet("<strong>Moderated panel (35 min):</strong> 3-4 speakers on stage, Jason Lemkin moderating. More conversational. Good if you'd prefer a discussion to a monologue."),
          sectionTitle("Why we're inviting you specifically"),
          infoCard(
            "Three reasons: (1) Your category — AI-native inbox — is one of the most talked-about and least understood at the moment, and our audience needs an authoritative voice on it. (2) You've shipped — your customer logos and growth are real, not hype. (3) Multiple speakers we've already locked in named you as someone they'd want to share a stage with.",
            { tone: "ok" },
          ),
          sectionTitle("Honorarium + logistics"),
          bullet("<strong>$2,500</strong> standard speaker honorarium."),
          bullet("Travel + 3 nights at the Marriott San Mateo (block rate)."),
          bullet("All-access conference pass + VIP speaker dinner Wednesday night."),
          bullet("Recording rights: SaaStr.com (full), your own marketing (clip-only)."),
          sectionTitle("Confirm by June 1"),
          p(
            "If you're interested, reply by EOD June 1 and we'll send the full speaker packet (bio template, abstract requirements, slide deck guidelines, A/V tech specs, hotel block code). After June 1 we move to alternates — the AI-Native track has more demand than spots.",
          ),
          hr(),
          signature("SaaStr Programs", "Speaker booking · SaaStr Annual 2026", "programs@saastr.com"),
        ]),
        summary: "SaaStr speaker invitation. Action: decide by June 1.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-95",
        subject: "Press inquiry - TechCrunch",
        senderName: "Avery Tan",
        senderEmail: "avery.tan@techcrunch.com",
        daysAgo: 1,
        hour: 14,
        snippet: "Writing about AI inbox category. Could I ask a few questions by Friday?",
        body: email([
          p("Hi,"),
          p(
            "Avery Tan from TechCrunch — I cover productivity and AI tooling. I'm working on a piece about the consolidation happening in the AI inbox category and where the meaningful differentiation is showing up. I'd like to include VectorMail in the story.",
          ),
          p(
            "Publication target is <strong>Tuesday next week</strong>. I'm filing my draft Friday so I'd need a few quotes (or 15 minutes by phone) by EOD Friday at the latest. Here's what I want to ask about:",
          ),
          sectionTitle("Questions I'd want to cover"),
          bullet(
            "Your view on whether 'AI inbox' is a category or a feature — what's the defensible product surface in 24 months?",
          ),
          bullet(
            "How you're thinking about Microsoft Copilot and Google Duet as a competitive threat (vs. an inbound funnel that helps you sell).",
          ),
          bullet(
            "The specific product decisions you'd defend that most competitors haven't made yet — pgvector over Pinecone is one, but I'd want one or two more if you have them.",
          ),
          bullet(
            "How big does this market need to be for a venture outcome, and how do you message that to investors and customers without overpromising.",
          ),
          sectionTitle("Format"),
          p(
            "Happy to do this on the record by email (cleaner for you, often better for accuracy), or by phone if you'd prefer. If on the record by phone I'll record and transcribe, you'll see the quotes I plan to use before publication — standard TechCrunch policy.",
          ),
          p(
            "Background context: my last piece covered the broader productivity stack and ran on the front page. This one is more analytical and is likely to be the framework piece reporters reference for the next 6-12 months. Worth doing if your time allows.",
          ),
          p("Talk soon."),
          hr(),
          signature("Avery Tan", "Senior Reporter · TechCrunch", "avery.tan@techcrunch.com"),
        ]),
        summary: "TechCrunch press inquiry. Action: respond by Friday with availability or written quote.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-96",
        subject: "Awards nomination - Product Hunt Golden Kitty",
        senderName: "Product Hunt",
        senderEmail: "awards@producthunt.com",
        daysAgo: 6,
        snippet: "VectorMail has been nominated in the AI Productivity category.",
        body: email([
          brandBlock("Product Hunt"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #da552f; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Nominated · Golden Kitty 2026</span></div>`,
          headline("VectorMail has been nominated for a Golden Kitty Award"),
          p(
            "Congratulations! Our community nominated <strong>VectorMail</strong> as one of 12 finalists in the <strong>AI Productivity</strong> category for the 2026 Golden Kitty Awards — our annual celebration of the best products launched on Product Hunt this year.",
          ),
          sectionTitle("Category details"),
          keyValBlock([
            { label: "Category", value: "AI Productivity (one of 18 total categories)" },
            { label: "Finalists in your category", value: "12 products" },
            { label: "Voting opens", value: "Thursday, June 5, 2026 · 9:00 AM PT" },
            { label: "Voting closes", value: "Thursday, June 12, 2026 · 11:59 PM PT" },
            { label: "Winners announced", value: "Tuesday, June 17, 2026 · live stream" },
            { label: "Award ceremony", value: "San Francisco · invite-only · June 26" },
          ]),
          sectionTitle("What winners get"),
          bullet("Permanent Golden Kitty badge on your Product Hunt page (visible forever)."),
          bullet("Featured placement in our 'Best of 2026' newsletter (180K subscribers)."),
          bullet("Coverage in our annual recap article (typically picked up by major tech press)."),
          bullet("Invitation to host a 'Live with the winners' AMA after the awards."),
          sectionTitle("How to maximize your chances"),
          bullet(
            "<strong>Mobilize your community early.</strong> Most winning products see 70% of their votes in the first 48 hours. Get a coordinated announcement ready for June 5.",
          ),
          bullet(
            "<strong>Voting is one-per-user across all categories.</strong> So tell your fans to vote for you specifically — they can only choose one product per category.",
          ),
          bullet(
            "<strong>Engagement matters.</strong> We look at quality of discussion, not just vote count. Encourage comments from real users about specific outcomes.",
          ),
          bullet(
            "<strong>Don't spam.</strong> The community spots inauthentic mobilization fast and we disqualify products with patterns we don't like.",
          ),
          ctaRow([
            ctaButton("View nomination page", { color: "#da552f" }),
            ctaButton("Download promotional kit", { color: "#da552f", variant: "outline" }),
            ctaButton("Marketing FAQ", { color: "#da552f", variant: "outline" }),
          ]),
          fineprint(
            "The Golden Kitty Awards have been running annually since 2014 and are widely regarded as the most prestigious community-voted award in startup product. Past winners include Notion, Linear, Figma, and Superhuman.",
          ),
          companyEmailFooter("Product Hunt"),
        ]),
        summary: "PH awards nomination. Action: mobilize community for voting in June.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-97",
        subject: "ACH initiated - payroll run",
        senderName: "Gusto",
        senderEmail: "noreply@gusto.com",
        daysAgo: 4,
        snippet: "Payroll for May 15 has been initiated. Total: $187,420.",
        body: email([
          brandBlock("Gusto"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Payroll · Initiated · Funds deducted</span></div>`,
          headline("Your May 15 payroll has been initiated"),
          p("Your semi-monthly payroll run is in motion. The total has been deducted from your linked bank account (Mercury Checking •• 3412) and will hit your team's accounts on Friday, May 17."),
          bigStat("Total payroll", "$258,130.00"),
          keyValBlock([
            { label: "Pay period", value: "May 1 – May 15, 2026" },
            { label: "Pay date", value: "Friday, May 17, 2026" },
            { label: "Employees paid", value: "14" },
            { label: "Net pay (ACH)", value: "$187,420.00" },
            { label: "Federal + state taxes", value: "$58,310.00" },
            { label: "Benefits + 401(k)", value: "$12,400.00" },
            { label: "Filing status", value: "All federal + 4 state filings auto-submitted" },
          ]),
          sectionTitle("Breakdown by category"),
          bullet("<strong>Salaries:</strong> $172,200.00 (12 full-time salaried)"),
          bullet("<strong>Hourly + contractor:</strong> $15,220.00 (2 part-time)"),
          bullet("<strong>Bonus payouts:</strong> $0.00 (none this period)"),
          bullet("<strong>Reimbursements:</strong> $4,820 (travel + equipment, all approved)"),
          sectionTitle("Tax filings · auto-submitted"),
          bullet("IRS Form 941 (Federal) · processed"),
          bullet("California EDD · processed"),
          bullet("New York DOL · processed"),
          bullet("Texas Workforce Commission · processed"),
          bullet("Washington L&I · processed"),
          ctaRow([
            ctaButton("View payroll detail", { color: "#f45d48" }),
            ctaButton("Download payroll report", { color: "#f45d48", variant: "outline" }),
          ]),
          fineprint(
            "No action required. Employees will receive their pay stubs and W-2 summary via their Gusto employee portal. Next payroll runs on the 1st of June.",
          ),
          companyEmailFooter("Gusto"),
        ]),
        summary: "Payroll initiated. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-98",
        subject: "Expense report needs approval",
        senderName: "Brex",
        senderEmail: "noreply@brex.com",
        daysAgo: 2,
        snippet: "Marcus Liu submitted $1,847 in expenses for April.",
        body: email([
          brandBlock("Brex"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Awaiting approval · You</span></div>`,
          headline("Marcus Liu submitted $1,847 in April expenses"),
          p(
            "<strong>Marcus Liu</strong> submitted an expense report covering April business expenses. Per your spending policy, expenses above $500 require your approval before reimbursement. All receipts are attached and have been auto-categorized; you can approve in one click below.",
          ),
          profileCard({
            name: "Marcus Liu",
            title: "CTO · VectorMail",
            company: "Spending limit: $5K/mo · 18 months tenure",
            initials: "ML",
            accent: "#0f0f0f",
            rightLabel: "Awaiting you",
          }),
          bigStat("Total submitted", "$1,847.00 USD"),
          sectionTitle("Line items · all with receipts"),
          keyValBlock([
            { label: "AWS · April infrastructure", value: "$940.00 · receipt ✓" },
            { label: "Engineering retreat dinner · 8 ppl at Robin", value: "$612.00 · receipt ✓" },
            { label: "Domain renewals · vectormail.app + 4 alts", value: "$189.00 · receipt ✓" },
            { label: "Stripe terminal · for in-person events", value: "$106.00 · receipt ✓" },
          ]),
          sectionTitle("Policy compliance check"),
          bullet("All items under per-line policy limits · ✓"),
          bullet("All receipts attached · ✓"),
          bullet("All categories correct (software, meals, software, software) · ✓"),
          bullet("All within submitter's monthly limit ($5K) · ✓"),
          bullet("Marcus has approver delegation up to $3K · this is within his scope but still needs your sign-off because the total exceeds $1.5K"),
          ctaRow([
            ctaButton("Approve $1,847.00", { color: "#0caa41" }),
            ctaButton("Request changes", { color: "#0f0f0f", variant: "outline" }),
            ctaButton("Deny", { color: "#dc2626", variant: "outline" }),
          ]),
          fineprint(
            "Marcus will be reimbursed via ACH within 1 business day of approval. If you have questions about any line item, you can comment directly on the expense in Brex.",
          ),
          companyEmailFooter("Brex"),
        ]),
        summary: "Expense report awaiting approval ($1,847). Action: approve in app.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-99",
        subject: "Invoice paid - Datadog",
        senderName: "Datadog",
        senderEmail: "billing@datadog.com",
        daysAgo: 3,
        snippet: "Invoice INV-22918 ($895) has been paid.",
        body: email([
          brandBlock("Datadog"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Paid · Auto-charged</span></div>`,
          headline("Invoice INV-22918 paid · $895.00"),
          p(
            "Your monthly Datadog invoice was successfully paid. The charge will appear on your statement as 'DATADOG INC.' within 2-3 business days. Receipt attached for your records.",
          ),
          keyValBlock([
            { label: "Invoice", value: "INV-22918" },
            { label: "Amount", value: "$895.00 USD" },
            { label: "Period", value: "April 1 → April 30, 2026" },
            { label: "Payment method", value: "Brex Visa •• 1842 · auto-charge" },
            { label: "Paid on", value: "May 12, 2026 at 11:42 AM PT" },
            { label: "Next charge", value: "June 12, 2026 (estimated similar)" },
          ]),
          sectionTitle("What you used this period"),
          metricGrid([
            { label: "Hosts monitored", value: "12", sub: "stable" },
            { label: "Custom metrics", value: "180", sub: "+12 this month" },
            { label: "Log indexes", value: "2.4 GB/day", sub: "+8% MoM" },
            { label: "APM traces", value: "8.2M/day" },
            { label: "Synthetics runs", value: "14,400" },
            { label: "Users", value: "8 active" },
          ]),
          sectionTitle("Cost-optimization tips (auto-generated)"),
          bullet("You have 23 custom metrics with zero queries in the last 30 days — consider dropping them ($28/mo savings)."),
          bullet("Log retention is at 30 days; you can drop to 15 days for non-prod indexes ($94/mo savings)."),
          ctaRow([
            ctaButton("Download receipt", { color: "#632ca6" }),
            ctaButton("View usage detail", { color: "#632ca6", variant: "outline" }),
            ctaButton("Apply optimization tips", { color: "#632ca6", variant: "outline" }),
          ]),
          fineprint("Plan: Pro · Annual contract · 7 months remaining. To change billing or method, visit Account → Billing."),
          companyEmailFooter("Datadog"),
        ]),
        summary: "Datadog payment confirmation. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-100",
        subject: "Pulley - Option grant approved",
        senderName: "Pulley",
        senderEmail: "no-reply@pulley.com",
        daysAgo: 5,
        snippet: "Board approved option grant for Elena Vargas (12,000 shares).",
        body: email([
          brandBlock("Pulley"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Approved · Awaiting signature</span></div>`,
          headline("Board approved option grant for Elena Vargas"),
          p(
            "The board unanimously approved an Incentive Stock Option (ISO) grant for new hire <strong>Elena Vargas</strong> in this morning's written consent. Grant documents have been auto-generated and sent to Elena via DocuSign for signature. Cap table will update once she signs.",
          ),
          profileCard({
            name: "Elena Vargas",
            title: "Senior Engineer · L5",
            company: "Start date: May 5, 2026",
            initials: "EV",
            accent: "#2f57e4",
            rightLabel: "Awaiting signature",
          }),
          sectionTitle("Grant details"),
          keyValBlock([
            { label: "Grant type", value: "Incentive Stock Option (ISO)" },
            { label: "Shares", value: "12,000 shares (≈ 0.18% of outstanding)" },
            { label: "Strike price", value: "$0.4327 per share (current 409A)" },
            { label: "Total grant value", value: "$5,192 grant value · ~$96K equity at last preferred price" },
            { label: "Vesting", value: "4-year vest, 1-year cliff (standard)" },
            { label: "Vesting start", value: "May 5, 2026 (employment start)" },
            { label: "Expiration", value: "10 years from grant date" },
            { label: "Acceleration", value: "Double-trigger (change-of-control + termination)" },
          ]),
          sectionTitle("Cap table impact"),
          metricGrid([
            { label: "Pre-grant options outstanding", value: "1,420,000" },
            { label: "This grant", value: "+12,000" },
            { label: "Post-grant outstanding", value: "1,432,000" },
            { label: "Options pool remaining", value: "182,400 shares" },
            { label: "% of pool consumed", value: "6.6%", sub: "this grant" },
            { label: "% of fully diluted", value: "0.18%", sub: "Elena's stake" },
          ]),
          sectionTitle("What happens next"),
          bullet("Elena receives the grant package via DocuSign (sent ~10 min ago)."),
          bullet("Once she signs, Pulley auto-updates the cap table and notifies the board."),
          bullet("Vesting starts immediately on her start date (May 5)."),
          bullet("If she doesn't sign within 30 days, the grant lapses and we need a new board action."),
          ctaRow([
            ctaButton("View grant in Pulley", { color: "#2f57e4" }),
            ctaButton("Download board consent", { color: "#2f57e4", variant: "outline" }),
          ]),
          fineprint(
            "Tax note: Elena should consult a tax advisor about the 83(b) election within 30 days of vesting start. Standard guidance included in her offer packet.",
          ),
          companyEmailFooter("Pulley"),
        ]),
        summary: "Option grant approved for new hire. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-101",
        subject: "MSA redlines - Brightlane",
        senderName: "Counsel",
        senderEmail: "counsel@morrisonfoerster.com",
        daysAgo: 2,
        hour: 13,
        snippet: "Brightlane's MSA redlines. Two material changes flagged.",
        body: email([
          p("Hi,"),
          p(
            "Finished reviewing Brightlane's redlined MSA this morning. Overall it's a clean markup — Brightlane's counsel is sharp and reasonable. <strong>Two material changes worth your call</strong>, plus a handful of non-material edits that I'd accept as-is. Detail below; happy to walk through on a call if it's faster.",
          ),
          sectionTitle("Material change #1 · Liability cap"),
          infoCard(
            `<strong>What they changed:</strong> Raised the liability cap from <strong>1× fees paid in the trailing 12 months</strong> to <strong>2× fees paid in the trailing 12 months</strong>.<br/><br/><strong>My recommendation:</strong> Push back to <strong>1.5× as a compromise</strong>. Industry standard for this deal size ($45K ARR) is 1× — but I expect them to dig in. 1.5× is the place I'd settle in their favor without leaving real money on the table.<br/><br/><strong>Risk if we accept 2×:</strong> Insurance premium could increase ~$1.2K/year. Their leverage on this is medium.`,
            { tone: "warn" },
          ),
          sectionTitle("Material change #2 · Termination for convenience"),
          infoCard(
            `<strong>What they changed:</strong> Added a unilateral termination-for-convenience clause with a <strong>30-day notice window</strong>, only on their side.<br/><br/><strong>My recommendation:</strong> Accept the clause but make it <strong>mutual</strong> (both sides can exit on 45 days' notice, not 30, and not just them). They probably won't push back — every customer of this size wants this clause.<br/><br/><strong>Risk if we accept as-written:</strong> They could exit any time with 30 days; we can't.`,
            { tone: "warn" },
          ),
          sectionTitle("Non-material edits I'd accept as-is"),
          bullet("§3.4 · Added a specific 24-hour incident notification SLA. Reasonable, already our practice."),
          bullet("§5.2 · Changed 'shall' to 'will' throughout. Stylistic, no impact."),
          bullet("§9.1 · Added their preferred dispute-resolution venue (Delaware). Already aligned with our state of incorporation."),
          bullet("Exhibit A · Updated their billing contact and tax ID. Administrative."),
          sectionTitle("Suggested next step"),
          p(
            "I'd propose redline back on items 1 and 2 today, accept the rest, and aim for a Friday signature so the renewal lands cleanly in your Q2 close on May 30. Want me to send the redline directly, or do you want to add a personal note before it goes?",
          ),
          hr(),
          signature("Stephen Ho", "Counsel · Morrison & Foerster", "counsel@morrisonfoerster.com"),
        ]),
        summary: "Counsel review of Brightlane MSA. Action: decide on 2 material clauses.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-102",
        subject: "Trademark filing - approved",
        senderName: "USPTO",
        senderEmail: "no-reply@uspto.gov",
        daysAgo: 7,
        snippet: "Your trademark application has been approved for publication.",
        body: email([
          brandBlock("USPTO"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Approved for publication</span></div>`,
          headline("Your trademark application has been approved for publication"),
          p(
            "The United States Patent and Trademark Office has examined your trademark application and approved it for publication in the Official Gazette. This is a significant milestone — your mark has cleared substantive examination and now enters the 30-day public opposition window.",
          ),
          keyValBlock([
            { label: "Serial Number", value: "98712341" },
            { label: "Mark", value: "VECTORMAIL (word mark)" },
            { label: "Owner", value: "VectorMail, Inc. (Delaware C-corp)" },
            { label: "Filing date", value: "January 12, 2026" },
            { label: "Examining attorney", value: "Jennifer Park" },
            { label: "Class(es)", value: "9 (downloadable software), 42 (SaaS)" },
            { label: "Publication date", value: "Tuesday, June 1, 2026" },
            { label: "Opposition window closes", value: "Thursday, July 1, 2026" },
          ]),
          sectionTitle("What happens next"),
          bullet("<strong>June 1:</strong> Your mark publishes in the USPTO's Official Gazette."),
          bullet("<strong>June 1 – July 1:</strong> 30-day opposition window. Anyone who believes your mark damages theirs can file an opposition (rare at this stage)."),
          bullet("<strong>~Aug 1 (if no opposition):</strong> USPTO issues a Notice of Allowance."),
          bullet("<strong>Within 6 months of NoA:</strong> You file a Statement of Use, which we already have."),
          bullet("<strong>~Q4 2026:</strong> Registration certificate issued. Your ® symbol use is legal nationwide."),
          sectionTitle("Recommended monitoring"),
          infoCard(
            "We recommend setting up a watching service for the next 30 days to flag any opposition filings. Our counsel uses Corsearch — about $500 for the watch period. If you'd like to skip that, we can monitor manually with daily Gazette checks.",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("View status on USPTO.gov", { color: "#112e51" }),
            ctaButton("Set up monitoring", { color: "#112e51", variant: "outline" }),
          ]),
          fineprint("Application status can be tracked at tsdr.uspto.gov using Serial 98712341. The Trademark Trial and Appeal Board adjudicates oppositions if filed."),
          companyEmailFooter("USPTO"),
        ]),
        summary: "Trademark approved for publication. Action: monitor opposition period.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-103",
        subject: "NDA signed - candidate",
        senderName: "DocuSign",
        senderEmail: "dse@docusign.net",
        daysAgo: 3,
        snippet: "Nathan Wu signed the candidate NDA.",
        body: email([
          brandBlock("DocuSign"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #000000; background: #ffcc22; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Completed · Fully executed</span></div>`,
          headline("All parties have signed · Candidate NDA · Nathan Wu"),
          p(
            "Your document <strong>Candidate Non-Disclosure Agreement · Nathan Wu</strong> has been completed by all parties. A fully-executed PDF copy is attached to this email and also stored in your DocuSign account. The audit trail and certificate of completion are included.",
          ),
          keyValBlock([
            { label: "Document", value: "Candidate Non-Disclosure Agreement" },
            { label: "Counterparty", value: "Nathan Wu (nathan.wu@gmail.com)" },
            { label: "Sent on", value: "May 14, 2026 · 9:42 AM PT" },
            { label: "Signed by Nathan", value: "May 14, 2026 · 11:18 AM PT (1h 36m turnaround)" },
            { label: "Signed by VectorMail", value: "May 14, 2026 · 11:24 AM PT (auto-counter via Dana)" },
            { label: "Envelope ID", value: "DSE-2026-7841-NWU" },
            { label: "Effective date", value: "May 14, 2026" },
            { label: "Term", value: "5 years from effective date" },
          ]),
          sectionTitle("What this allows"),
          p(
            "With NDA in place, you can now share confidential technical and business information during the interview process, including (but not limited to) architectural specifics, the embeddings pipeline, customer-name-level metrics, and forward-looking roadmap.",
          ),
          sectionTitle("Reminder · what's covered"),
          bullet("Any product or technical detail not publicly disclosed."),
          bullet("Customer names, ARR, or business-specific metrics not in the public update."),
          bullet("Hiring plans, comp bands, or internal org details."),
          bullet("Standard 5-year confidentiality post-termination + 1-year non-disparagement."),
          ctaRow([
            ctaButton("View document + audit trail", { color: "#ffcc22" }),
            ctaButton("Download PDF", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("This document is legally binding in all 50 U.S. states and the EU. Audit trail is admissible as evidence of execution. Stored encrypted in your DocuSign vault."),
          companyEmailFooter("DocuSign"),
        ]),
        summary: "Candidate NDA signed. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-104",
        subject: "Vendor MSA - DataPipe Inc.",
        senderName: "Legal",
        senderEmail: "legal@datapipe.io",
        daysAgo: 5,
        snippet: "MSA for the embedding pipeline contract. Ready for review.",
        body: email([
          p("Hi,"),
          p(
            "Attached is the Master Services Agreement for our partnership on the embedding pipeline contract — specifically, the 24-month commitment with the data-residency carve-out your legal team requested in our last call.",
          ),
          sectionTitle("What's in the package"),
          bullet("<strong>Master Services Agreement</strong> · standard DataPipe terms, lightly customized."),
          bullet("<strong>Statement of Work (SOW)</strong> · embedding pipeline service, 24-month term."),
          bullet("<strong>Data Processing Addendum (DPA)</strong> · GDPR + CCPA compliant, standard SCCs."),
          bullet("<strong>Custom Schedule A</strong> · data residency requirements per your legal's spec (US-East + EU-West only, no APAC ingress)."),
          sectionTitle("Key commercial terms"),
          keyValBlock([
            { label: "Term", value: "24 months from effective date" },
            { label: "Commit", value: "$60K annually · billed quarterly in advance" },
            { label: "Overage", value: "$0.0008 per embedding above commit (50% discount vs spot)" },
            { label: "Pilot period", value: "First 30 days · cancel for any reason with 7-day notice" },
            { label: "Data residency", value: "US-East 1 (primary) + EU-West 1 (failover); no other regions" },
            { label: "Auto-renewal", value: "12-month renewals with 60-day notice required to opt-out" },
          ]),
          sectionTitle("Custom clause your team requested (Schedule A, §2.3)"),
          infoCard(
            `"Provider shall not store, process, or transit Customer Data through any infrastructure located outside of the United States or the European Union without Customer's prior written consent. Provider shall provide Customer with a current list of all sub-processors and their locations, updated within 7 days of any change, and shall obtain Customer's consent for any new sub-processor."`,
            { accent: "#5f6368" },
          ),
          sectionTitle("Timeline I'm targeting"),
          bullet("Your legal review · this week (Mon-Fri)"),
          bullet("Our counsel's response to any redlines · within 48h"),
          bullet("Final signature · target Friday, May 23"),
          bullet("Pilot kick-off · Monday, June 1"),
          p(
            "If you can route the package to your legal team this morning and ask them to flag any blockers by Wednesday, we should be comfortably done by Friday. Happy to set up a call with our counsel directly if it'd shorten the loop.",
          ),
          hr(),
          signature("Anand Rao", "VP Legal & Compliance · DataPipe", "anand@datapipe.io"),
        ]),
        summary: "Vendor MSA awaiting review. Action: route to counsel, target signature next week.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-105",
        subject: "Flight confirmation - SFO to JFK",
        senderName: "United Airlines",
        senderEmail: "no-reply@united.com",
        daysAgo: 6,
        snippet: "Your flight UA 1142 from SFO to JFK on May 27 is confirmed.",
        body: email([
          brandBlock("United"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0033a0; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Confirmed · MileagePlus Premier</span></div>`,
          headline("Your trip to New York is booked"),
          keyValBlock([
            { label: "Confirmation", value: "K9X8YH (United)" },
            { label: "Booking name", value: "Demo User · MileagePlus 8A7****6X" },
            { label: "Class", value: "Economy Plus · 4A confirmed both legs" },
            { label: "Status", value: "MileagePlus Premier · Gold (priority boarding ✓)" },
            { label: "Total cost", value: "$612.40 USD · Brex card •• 1842" },
            { label: "Miles earned", value: "5,840 award miles + 540 PQP" },
          ]),
          sectionTitle("Outbound · Wednesday, May 27"),
          infoCard(
            `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%;"><tr><td style="vertical-align: top; padding: 0;"><div style="font-size: 13px; color: #5f6368; margin-bottom: 4px;">DEPART · 7:45 AM PT</div><div style="font-size: 17px; font-weight: 700; color: #1f1f1f;">SFO</div><div style="font-size: 12px; color: #5f6368;">San Francisco Intl · Terminal 3</div></td><td style="vertical-align: top; padding: 0 16px; text-align: center;"><div style="font-size: 12px; color: #5f6368;">UA 1142 · 5h 30m · nonstop</div><div style="height: 1px; background: #ececec; margin: 8px 0;"></div><div style="font-size: 11px; color: #80868b;">Boeing 737 MAX 9</div></td><td style="vertical-align: top; padding: 0; text-align: right;"><div style="font-size: 13px; color: #5f6368; margin-bottom: 4px;">ARRIVE · 4:15 PM ET</div><div style="font-size: 17px; font-weight: 700; color: #1f1f1f;">JFK</div><div style="font-size: 12px; color: #5f6368;">Terminal 7</div></td></tr></table>`,
            { accent: "#0033a0" },
          ),
          sectionTitle("Return · Saturday, May 30"),
          infoCard(
            `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%;"><tr><td style="vertical-align: top; padding: 0;"><div style="font-size: 13px; color: #5f6368; margin-bottom: 4px;">DEPART · 5:30 PM ET</div><div style="font-size: 17px; font-weight: 700; color: #1f1f1f;">JFK</div><div style="font-size: 12px; color: #5f6368;">Terminal 7</div></td><td style="vertical-align: top; padding: 0 16px; text-align: center;"><div style="font-size: 12px; color: #5f6368;">UA 891 · 6h 20m · nonstop</div><div style="height: 1px; background: #ececec; margin: 8px 0;"></div><div style="font-size: 11px; color: #80868b;">Boeing 757-200</div></td><td style="vertical-align: top; padding: 0; text-align: right;"><div style="font-size: 13px; color: #5f6368; margin-bottom: 4px;">ARRIVE · 8:50 PM PT</div><div style="font-size: 17px; font-weight: 700; color: #1f1f1f;">SFO</div><div style="font-size: 12px; color: #5f6368;">Terminal 3</div></td></tr></table>`,
            { accent: "#0033a0" },
          ),
          sectionTitle("MileagePlus Premier perks (you're Gold)"),
          bullet("Priority boarding (Group 1)"),
          bullet("Free checked bags (2 each direction)"),
          bullet("United Club access at SFO + JFK"),
          bullet("Upgrade to Economy Plus included (auto-applied · 4A confirmed)"),
          bullet("Priority security at SFO · TSA PreCheck active"),
          ctaRow([
            ctaButton("Manage trip", { color: "#0033a0" }),
            ctaButton("Mobile boarding passes", { color: "#0033a0", variant: "outline" }),
            ctaButton("Add hotel + car", { color: "#0033a0", variant: "outline" }),
          ]),
          fineprint(
            "Online check-in opens 24 hours before departure. Bag drop closes 45 min before international, 30 min before domestic. For changes, call United Premier Gold line at +1 (800) UNITED-1.",
          ),
          companyEmailFooter("United"),
        ]),
        summary: "Flight confirmation SFO-JFK. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-106",
        subject: "Hotel reservation - The Standard NYC",
        senderName: "The Standard",
        senderEmail: "reservations@standardhotels.com",
        daysAgo: 6,
        snippet: "Reservation #STH-22841 confirmed for May 27-30.",
        body: email([
          brandBlock("The Standard"),
          headline("Your reservation is confirmed"),
          p(
            "Hello,<br/><br/>Thank you for choosing The Standard, High Line. Below is everything you need for your stay in New York. We've sent the same details to your iOS Wallet — you can add a digital room key once we send it 24 hours before check-in.",
          ),
          keyValBlock([
            { label: "Reservation", value: "STH-22841" },
            { label: "Guest", value: "Demo User" },
            { label: "Property", value: "The Standard, High Line · 848 Washington Street, New York, NY 10014" },
            { label: "Check-in", value: "Wednesday, May 27, 2026 · from 3:00 PM ET" },
            { label: "Check-out", value: "Saturday, May 30, 2026 · by 11:00 AM ET" },
            { label: "Room", value: "King City View · King bed, floor 12+, 250 sq ft" },
            { label: "Nights", value: "3" },
            { label: "Rate", value: "$430/night × 3 = $1,290 + tax $237.94 = $1,527.94 total" },
            { label: "Card on file", value: "Brex Visa •• 1842" },
            { label: "Cancellation", value: "Free until 6 PM ET, May 25 · then 1 night charge" },
          ]),
          sectionTitle("Property amenities"),
          bullet("24-hour fitness center (no extra charge)"),
          bullet("The Top of The Standard — rooftop bar (15th floor)"),
          bullet("The Living Room — open all night, perfect for jet lag"),
          bullet("In-room iPad for room service + concierge"),
          bullet("Bicycles available at the front desk (free, 4-hour limit)"),
          sectionTitle("Getting there"),
          bullet("From JFK: ~50 min by taxi/Uber ($65-85), 70 min via subway (A train to 14th St, ~$3)."),
          bullet("Closest subway: 14th Street / 8th Avenue (A, C, E, L)."),
          bullet("Closest landmark: The High Line elevated park (literally outside the door)."),
          ctaRow([
            ctaButton("Manage booking", { color: "#cc0000" }),
            ctaButton("Add digital key on May 26", { color: "#cc0000", variant: "outline" }),
            ctaButton("Add to Apple Wallet", { color: "#cc0000", variant: "outline" }),
          ]),
          fineprint(
            "Looking forward to having you. If you need to extend, change rooms, or arrange anything special, reply to this email and our concierge team will respond within an hour.",
          ),
          companyEmailFooter("The Standard"),
        ]),
        summary: "Hotel reservation confirmation. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-107",
        subject: "Uber receipt - $42.30",
        senderName: "Uber",
        senderEmail: "noreply@uber.com",
        daysAgo: 2,
        snippet: "Trip from SF to Brightlane HQ. $42.30.",
        body: email([
          brandBlock("Uber"),
          headline("Thanks for riding, Demo"),
          p(`Here's your trip receipt. We hope you enjoyed the ride with <strong>Marcus M.</strong> · ⭐⭐⭐⭐⭐ 4.94 driver rating · 2018 Toyota Camry · Tesla Y plate · ABC-123.`),
          bigStat("Total fare", "$42.30 USD"),
          keyValBlock([
            { label: "Trip", value: "Saturday, May 15, 2026 · 11:42 AM PT" },
            { label: "Trip type", value: "UberX · 1 rider" },
            { label: "Duration", value: "22 min · 6.4 mi" },
            { label: "Pickup", value: "Mission St & 18th, San Francisco" },
            { label: "Drop-off", value: "Brightlane HQ · 1234 Market St" },
            { label: "Charged to", value: "Brex Visa •• 1842 (auto-receipt to receipts@brex.com)" },
          ]),
          sectionTitle("Fare breakdown"),
          keyValBlock([
            { label: "Base fare", value: "$2.55" },
            { label: "Distance (6.4 mi @ $1.10/mi)", value: "$7.04" },
            { label: "Time (22 min @ $0.32/min)", value: "$7.04" },
            { label: "Booking fee", value: "$3.20" },
            { label: "SF service fee", value: "$2.97" },
            { label: "Tip", value: "$10.00 (24%)" },
            { label: "Tax", value: "$3.50" },
            { label: "Other", value: "$6.00" },
            { label: "Total", value: "$42.30 USD" },
          ]),
          ctaRow([
            ctaButton("Rate your trip", { color: "#000000" }),
            ctaButton("Get help", { color: "#000000", variant: "outline" }),
            ctaButton("Request invoice", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("Receipt automatically forwarded to receipts@brex.com for expense matching. If a refund is needed, request within 30 days through Uber's help center."),
          companyEmailFooter("Uber"),
        ]),
        summary: "Uber receipt. No action - file with expenses.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-108",
        subject: "Catching up?",
        senderName: "Theo Vargas",
        senderEmail: "theo@castleworks.co",
        daysAgo: 3,
        snippet: "Been a while. Want to grab dinner when I'm in SF next week?",
        body: email([
          p("Hi friend,"),
          p(
            "Been way too long since Toronto — feels like that dinner was 5 years ago, not 18 months. I'm going to be in SF next week, Wed through Fri, doing the usual investor + customer thing now that we've finally closed our Series A. <strong>Want to grab dinner Thursday?</strong> My treat to celebrate the close, and because I owe you about 4 dinners at this point.",
          ),
          p(
            "I made an attempt at Mister Jiu's — they have a 6:30 PM table for two if you're in. If you'd rather do something less formal, no strong feelings; happy to go wherever you want. SF restaurant intel is your wheelhouse, not mine.",
          ),
          p(
            "A few things I want to actually talk about over food, in no particular order: (1) Your fundraise (heard you closed; congrats); (2) the partnership we've been talking about for 6 months that we still haven't done anything about; (3) life and the fact that we both seem to be working too much.",
          ),
          p("Confirm by Tuesday so I can hold or release the reservation. Excited."),
          hr(),
          signature("Theo Vargas", "Head of Operations · Castleworks", "theo@castleworks.co"),
        ]),
        summary: "Friend in town next week, wants dinner Thursday. Action: confirm + pick spot.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-109",
        subject: "Connecting you with Sasha (was: PM intro)",
        senderName: "Jamal Ortiz",
        senderEmail: "jamal.ortiz@anthropic-friend.io",
        daysAgo: 1,
        hour: 17,
        snippet: "Looping Sasha in. She's free next week.",
        body: email([
          p("Hi both,"),
          p(
            "Putting the intro together as promised. Quick double-handle so you can take it from here.",
          ),
          p(
            "<strong>Sasha</strong> · meet <strong>Demo User</strong>, founder and CEO of <strong>VectorMail</strong>. They're building an AI-native inbox — the kind of company you'd love working on. Recently closed a Series A led by Horizon Capital. Team of 14, mostly in SF. Real revenue, real customers, technical co-founders you'd respect.",
          ),
          p(
            "<strong>Demo User</strong> · meet <strong>Sasha Hill</strong>, Staff PM at Anthropic and about to leave. Sasha was the API platform lead and grew it from $0 to 9-figure annualized in 22 months. Before Anthropic she was at Stripe (Connect platform) and early at Brex. CS degree from MIT. The kind of PM you'd build the next 5 years of product around.",
          ),
          p(
            "I'll let you two take it from here. Sasha — I told her she should look at what you're building before she runs into the open market. <strong>Demo User</strong> — Sasha is technical, opinionated, and has a real bias for action. You'll click immediately or not at all; I'm 90% on 'immediately.'",
          ),
          p("Good luck. Loop me in on the outcome whenever it happens. ✌️"),
          hr(),
          signature("Jamal Ortiz", "Engineering · ex-Anthropic", "jamal.ortiz@anthropic-friend.io"),
        ]),
        summary: "Triple-handle intro with Sasha (Staff PM). Action: reply with calendar link.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-110",
        subject: "Wedding RSVP - June 14",
        senderName: "Sophia & Andrew",
        senderEmail: "sophia.andrew.wedding@gmail.com",
        daysAgo: 8,
        snippet: "Hope you can make it to our wedding June 14 in Sonoma.",
        body: email([
          p("Hi friend,"),
          p(
            "We can hardly believe it's already that close, but our wedding is just <strong>four weeks away</strong> — Saturday, June 14, in Sonoma. We'd love nothing more than to have you (and a plus-one if you'd like to bring someone) celebrate with us.",
          ),
          keyValBlock([
            { label: "Date", value: "Saturday, June 14, 2026" },
            { label: "Ceremony", value: "5:00 PM · Beltane Ranch · 11775 Sonoma Hwy" },
            { label: "Reception + dinner", value: "5:45 PM onward · same venue" },
            { label: "Dress code", value: "Garden party — cocktail attire" },
            { label: "Lodging block", value: "Sonoma Mission Inn · $325/night, code 'PEREIRA-WEDDING'" },
            { label: "RSVP deadline", value: "Sunday, May 25, 2026" },
          ]),
          sectionTitle("A few things to know"),
          bullet("<strong>Outdoor ceremony</strong>, so wear shoes that can handle grass."),
          bullet("<strong>Family-style dinner</strong> with vegetarian, vegan, and GF options. Note any allergies in the RSVP form."),
          bullet("<strong>Open bar.</strong> Champagne for the toasts, then it's your call."),
          bullet("<strong>Shuttle</strong> from Sonoma Mission Inn at 4:30 PM and back at 11:30 PM."),
          bullet("<strong>+1 invited if you have someone you'd like to bring.</strong>"),
          p(
            "Beyond logistics — we wanted to say: we've been watching from afar as VectorMail has grown over the last year, and it's been so much fun to see the company progress. You've worked so hard for this, and we're proud of you. Cannot wait to hug you, hear all the stories, and dance until our feet hurt.",
          ),
          ctaRow([
            ctaButton("RSVP yes", { color: "#0caa41" }),
            ctaButton("RSVP no (we'll miss you)", { color: "#dc2626", variant: "outline" }),
            ctaButton("Book hotel block", { color: "#1a73e8", variant: "outline" }),
          ]),
          hr(),
          signature("Sophia & Andrew", "sophia.andrew.wedding@gmail.com"),
        ]),
        summary: "Wedding RSVP needed by May 25. Action: respond with attendance.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-111",
        subject: "Slack DM follow-up: bug in search filters",
        senderName: "Quinn Holloway",
        senderEmail: "quinn@nextroom.ai",
        daysAgo: 1,
        hour: 18,
        snippet: "Following up from Slack - filter chips not persisting after refresh.",
        body: email([
          p("Hi,"),
          p(
            "Following up from our Slack DM earlier today — putting this in writing so it's easier to track on your side. <strong>The filter chips on search aren't persisting after page refresh.</strong>",
          ),
          sectionTitle("Repro"),
          bullet("Open VectorMail in Chrome 124 (or Safari 17.3 — same behavior in both)."),
          bullet("Run an NL search like 'investor emails this week.'"),
          bullet("Notice the auto-inferred filter chips appear at the top (sender domain, date range, etc.)."),
          bullet("Refresh the page (Cmd-R)."),
          bullet("Chips are gone. The search query field is empty. Results are gone."),
          sectionTitle("Expected behavior"),
          p("Either the chips and results persist (preferred), or at minimum the original NL query is preserved in the search bar so users can re-run with one keystroke."),
          sectionTitle("Severity from our side"),
          infoCard(
            "Not blocking, but the team is calling it out. The kind of thing that erodes daily trust — every refresh feels like 'oh, I lost my work.' For power users who run 8-12 searches a day, this happens multiple times per session.",
            { tone: "warn" },
          ),
          sectionTitle("Workaround we're using"),
          p(
            "Most of the team is now putting their queries in a Notion doc and copy-pasting them into search after refreshes. Which works, but is exactly the kind of thing your product is supposed to eliminate.",
          ),
          p(
            `Let me know if you can ack this and give a rough ETA on a fix. I've also dropped a screen recording in the Slack channel <a href="#" style="color: #1a73e8; text-decoration: none;">here</a> in case the repro isn't 100% clear from text.`,
          ),
          p("Otherwise things are great. Sync is fast, briefs are good, Buddy v2 is the killer feature for me personally."),
          hr(),
          signature("Quinn Holloway", "Recruiting Lead · NextRoom", "quinn@nextroom.ai"),
        ]),
        summary: "Customer bug report: filter chip persistence. Action: file ticket, reply with ETA.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-112",
        subject: "Customer interview - 25 min next week?",
        senderName: "Riley Adams",
        senderEmail: "riley@startup.co",
        daysAgo: 4,
        snippet: "Happy to do a customer interview - what week works?",
        body: email([
          p("Hi,"),
          p(
            "Yes — happy to do the customer interview you mentioned at our last check-in. We've now been on VectorMail for three months and the team has accumulated a lot of opinions (some pointed, mostly positive) that should be useful for your product team.",
          ),
          sectionTitle("What I can talk about"),
          bullet("How we onboarded the team (the 'first 14 days' story)."),
          bullet("What we use heavily, what we never use, and why."),
          bullet("What we tried to use but bounced off — your team should hear this."),
          bullet("How our usage patterns have shifted in the last 90 days as we've gotten comfortable."),
          bullet("Specific quality-of-life improvements that would make us heavier users."),
          bullet("The procurement conversation — what worked, what was painful."),
          sectionTitle("Format suggestions"),
          bullet("<strong>25 minutes</strong> is plenty. Anything more and we'll start drifting."),
          bullet("<strong>Recorded is fine</strong> — I'll trust you to share excerpts with permission."),
          bullet("<strong>Video or audio</strong> — your call. I prefer video but I can do either."),
          sectionTitle("Availability"),
          p(
            "Next week is open all week except Tuesday morning. Send a Calendly and I'll grab the first slot that works. If your team would like specific employees in the conversation rather than just me, I can pull in our IT lead (who handled procurement) or our PM (who's the heaviest power user) — just let me know.",
          ),
          p("Looking forward to it."),
          hr(),
          signature("Riley Adams", "Chief of Staff · startup.co", "riley@startup.co"),
        ]),
        summary: "Customer offered to do interview. Action: send Calendly.",
        labels: [labelImportant],
        read: true,
      },
      {
        id: "demo-thread-113",
        subject: "Feature shipped - Outlook beta",
        senderName: "Product",
        senderEmail: "product@vectormail.app",
        daysAgo: 5,
        snippet: "Outlook beta is live. 12 customers on the waitlist now have access.",
        body: email([
          brandBlock("VectorMail Product"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Shipped · Live in production</span></div>`,
          headline("Outlook beta is live · 12 customers on access overnight"),
          p(
            "Outlook beta shipped to production at 6:30 AM PT this morning behind a feature flag. <strong>The 12 customers from the waitlist were granted access overnight</strong> and sync started at 6:45 AM. As of 9:00 AM, sync has completed for 11 of the 12 (the 12th has a 380K-thread mailbox that's still indexing).",
          ),
          metricGrid([
            { label: "Customers in beta", value: "12" },
            { label: "Synced so far", value: "11 of 12" },
            { label: "Threads indexed", value: "2.4M" },
            { label: "Avg sync time", value: "47 min", sub: "Gmail avg: 38 min" },
            { label: "Errors", value: "0", sub: "clean launch" },
            { label: "Active users (already)", value: "8" },
          ]),
          sectionTitle("Early feedback (4 hours in)"),
          bullet(`Northwind IT lead: "Sync feels as fast as Gmail. Wasn't sure that was going to be true."`),
          bullet(`Brightlane VP Eng: "First Outlook tool that doesn't feel like a port. Briefs are working day one."`),
          bullet(`Castleworks PM: "One thing I missed: shared inbox folders aren't yet supported." (Already filed.)`),
          sectionTitle("Tracking"),
          bullet("Sentiment in <code>#outlook-beta</code> Slack channel — Aria monitoring."),
          bullet("Sync error rate dashboard — Datadog · alerts at 0.1% threshold."),
          bullet("Daily check-in calls with first 3 customers for the first week."),
          sectionTitle("Next milestones"),
          bullet("<strong>Week 2:</strong> Add 30 more customers from waitlist (currently 188 deep)."),
          bullet("<strong>Week 4:</strong> First post-launch eval against Gmail (quality + latency parity)."),
          bullet("<strong>Week 6:</strong> Decision on GA timing based on stability + customer feedback."),
          hr(),
          signature("Product", "VectorMail · Internal launch update", "product@vectormail.app"),
        ]),
        summary: "Internal: Outlook beta shipped. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-114",
        subject: "Customer escalation - DataPipe",
        senderName: "Aria Singh",
        senderEmail: "aria@vectormail.app",
        daysAgo: 1,
        hour: 19,
        snippet: "DataPipe (35 seats) is escalating sync delays. Reaching out to you.",
        body: email([
          p("Hi,"),
          p(
            "Heads up — wanted to surface this before it sits in your inbox over the weekend. <strong>DataPipe</strong> (35 seats, $42K ARR, signed in November) is escalating sync delays they've seen over the past 7 days. Their CTO emailed our shared Slack channel asking 'is anyone home over there.' The tone is frustrated but recoverable.",
          ),
          sectionTitle("What's happening on their side"),
          bullet("4 reported instances of full inbox sync stalling for 2+ hours."),
          bullet("Two of their highest-volume users (sales leads) hit the latency twice each."),
          bullet("They opened an internal Slack channel '#vectormail-watch' to track issues — that's the canary signal."),
          bullet("Their CSAT survey from yesterday came in at 6/10 (was 9/10 in March)."),
          sectionTitle("What we know on our side"),
          bullet("Their sync token rotation is fine — no auth errors."),
          bullet("They're geographically split between SF and Dublin; the Dublin pod hits a known Aurinko EU latency window every Friday afternoon."),
          bullet("Eng has a fix in flight (the EU fallback endpoint switch in #VM-174); not yet in production."),
          sectionTitle("What I'm proposing"),
          p(
            "I've got a save call queued for <strong>Wednesday 10:00 AM PT</strong> with their CTO (Roberto) and their head of IT. Want you on it given the spend and the fact that he asked for someone senior. 30 minutes max — I'll run the agenda. Marcus is on standby to join if engineering questions come up.",
          ),
          p(
            "If you can't make it, I'll handle it solo and loop you in afterward. Just want the option locked in by EOD Monday so I can confirm with Roberto.",
          ),
          hr(),
          signature("Aria Singh", "Customer Success", "aria@vectormail.app"),
        ]),
        summary: "Customer escalation, $42K ARR. Action: confirm Wed 10 AM call attendance.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-115",
        subject: "Cancellation request - smaller customer",
        senderName: "Felix Romero",
        senderEmail: "felix@codeforgood.org",
        daysAgo: 6,
        snippet: "We're winding down - need to cancel before next billing.",
        body: email([
          p("Hi,"),
          p(
            "I'm writing with some sad news on our end and a difficult administrative request. <strong>We're winding down the Code For Good program at the end of our fiscal year (June 30)</strong> and will need to cancel our VectorMail subscription before the next billing cycle. I'll come back to the why in a moment.",
          ),
          sectionTitle("What I need"),
          bullet(
            "<strong>Cancel our subscription</strong> effective June 30, 2026 — before the auto-renewal hits.",
          ),
          bullet(
            "<strong>Confirm in writing</strong> that no further charges will be issued.",
          ),
          bullet(
            "<strong>Data retention:</strong> What's our 30/60/90-day window for downloading our data before deletion?",
          ),
          bullet(
            "<strong>GDPR-style deletion request</strong> after we've exported what we need — preferably end of July.",
          ),
          sectionTitle("Why we're winding down"),
          infoCard(
            `Our anchor funder didn't renew their multi-year commitment, and after exploring every alternative funding path, we couldn't bridge the gap. Going to wrap up programs gracefully through June 30, then dissolve the entity by end of August. Sad, but it's the right call given the runway.`,
            { tone: "warn" },
          ),
          sectionTitle("Personal note"),
          p(
            "Thank you for accommodating our non-profit pricing tier last year — it made a real difference to us. Your team handled the conversation with grace, and the briefs feature genuinely helped me run a small organization more effectively. If we end up rebuilding this work elsewhere, we'll be back.",
          ),
          p("Sad to leave, but grateful for the support."),
          hr(),
          signature("Felix Romero", "Former Executive Director · Code For Good", "felix@codeforgood.org"),
        ]),
        summary: "Cancellation request. Action: confirm and process.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-116",
        subject: "Re: Onboarding question",
        senderName: "Sarah Cole",
        senderEmail: "sarah@meadowpartners.vc",
        daysAgo: 2,
        snippet: "How do I bulk-import signatures from another tool?",
        body: email([
          p("Hi there,"),
          p(
            "New to VectorMail — connected my account two days ago and the briefs are already saving me real time, so good first impression. I have an onboarding question I couldn't find in the help docs.",
          ),
          sectionTitle("What I'm trying to do"),
          p(
            "I'm a VC partner at Meadow Partners and I use <strong>6 different email signatures</strong>, each tailored to a specific kind of conversation — founder cold inbound, portfolio CEOs, LPs, co-investors, journalists, and personal. I had them all set up as templates in Gmail and was using them via keyboard shortcut.",
          ),
          p(
            "Can I bulk-import these into VectorMail somehow? Or do I have to recreate them one by one? If the latter — is there a way to assign a default signature per recipient domain (e.g., always use the LP signature when emailing my LPs)?",
          ),
          sectionTitle("Why this matters to me"),
          bullet("I send 50-80 emails per day; per-thread signature switching is a real time-savings if it works."),
          bullet("My current Gmail signatures have HTML formatting (logos, link styling) — would need to preserve that."),
          bullet("Some signatures have legal-disclosure boilerplate that's non-negotiable from a compliance standpoint."),
          p(
            "If this is on the roadmap but not yet shipped, I'd appreciate honesty so I can decide whether to wait or work around. If it does exist and I just missed the setting, I'll happily blame my onboarding curve.",
          ),
          p("Thanks for the help."),
          hr(),
          signature("Sarah Cole", "Partner · Meadow Partners", "sarah@meadowpartners.vc"),
        ]),
        summary: "Onboarding question. Action: reply with help doc link.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-117",
        subject: "Offer letter sent - Nathan Wu",
        senderName: "Recruiting",
        senderEmail: "recruiting@vectormail.app",
        daysAgo: 1,
        hour: 10,
        snippet: "Offer letter sent to Nathan Wu. Awaiting countersignature.",
        body: email([
          brandBlock("VectorMail Recruiting"),
          headline("Offer letter sent · Nathan Wu · Senior Engineer"),
          p(
            "Sent the formal offer to Nathan at 9:42 AM PT this morning. He acknowledged receipt within 18 minutes (you'll see his reply confirming below). He's deciding by <strong>Friday EOD</strong> — that's his competing-offer deadline.",
          ),
          profileCard({
            name: "Nathan Wu",
            title: "Senior Backend Engineer",
            company: "Previously: Engineering at Plaid · Stripe (5y total)",
            initials: "NW",
            accent: "#1F3A2E",
            rightLabel: "Offer out",
          }),
          sectionTitle("Offer summary"),
          keyValBlock([
            { label: "Role / Level", value: "Senior Engineer · L5" },
            { label: "Base salary", value: "$215,000 / year" },
            { label: "Equity", value: "0.45% (40,000 shares · 4-year vest, 1-year cliff)" },
            { label: "Sign-on bonus", value: "$30,000 (paid at start, clawback in first 12 months)" },
            { label: "Total Y1 comp", value: "$245,000 cash · $90,000 equity value at current 409A" },
            { label: "PTO", value: "Unlimited · 4 weeks recommended minimum" },
            { label: "Healthcare", value: "100% employee, 80% dependents" },
            { label: "Relocation", value: "$15,000 (one-time, no clawback)" },
            { label: "Proposed start date", value: "Monday, June 9, 2026" },
          ]),
          sectionTitle("Competing offers"),
          bullet("Series B fintech in NYC · $230K base, 0.30% equity, $20K sign-on. Comparable cash, lower equity."),
          bullet("Ramp · $225K base, 0.35% equity, $25K sign-on. Closer to ours."),
          sectionTitle("Where we won him over"),
          infoCard(
            "Nathan said in the final round that the deciding factor was the technical bar (specifically Marcus's reputation in the community + the depth of the systems-design conversation). The compensation matters but isn't the swing vote. He's optimizing for the next 5 years of his career, not the next 12 months.",
            { tone: "ok" },
          ),
          sectionTitle("What we're doing while we wait"),
          bullet("Marcus reaching out personally tomorrow morning to answer any technical questions."),
          bullet("Dana scheduling an informal 15-minute coffee with the team Wednesday."),
          bullet("People Ops on standby for any equity or relocation questions."),
          ctaRow([
            ctaButton("Open offer in Greenhouse", { color: "#218d62" }),
            ctaButton("Message recruiter", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint(
            "All offer details are confidential and tracked in Greenhouse · req-2412 · Internal owner: Lina Ortiz",
          ),
          companyEmailFooter("VectorMail Recruiting"),
        ]),
        summary: "Offer sent to Nathan. No action - wait for response.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-118",
        subject: "Phone screen reminder - Mei Lin",
        senderName: "Recruiting",
        senderEmail: "recruiting@vectormail.app",
        daysAgo: 1,
        hour: 8,
        snippet: "Phone screen with Mei Lin (Backend Eng) today at 11 AM.",
        body: email([
          brandBlock("VectorMail Recruiting"),
          headline("Phone screen today at 11 AM · Mei Lin (Backend Engineer)"),
          p(
            "Reminder: you're running the 45-minute phone screen with <strong>Mei Lin</strong> today at 11:00 AM PT. This is her first conversation with us — culture + role fit, not a technical deep dive (that's the next round). Resume and prep notes are linked below.",
          ),
          profileCard({
            name: "Mei Lin",
            title: "Backend Engineer · 6 years",
            company: "Currently: Senior Engineer at Haystack Studio",
            initials: "ML",
            accent: "#1F3A2E",
            rightLabel: "Phone screen",
          }),
          sectionTitle("At a glance"),
          keyValBlock([
            { label: "Role", value: "Senior Backend Engineer (L4/L5)" },
            { label: "Source", value: "Inbound · referred by Aria Singh" },
            { label: "Resume", value: "6 yrs · Haystack Studio (4 yrs) · Twilio (2 yrs)" },
            { label: "Stack overlap", value: "TypeScript ✓ · Node ✓ · Postgres ✓ · Redis ✓ · Inngest (new)" },
            { label: "Location", value: "San Francisco · open to hybrid" },
            { label: "Comp expectations", value: "$195K – $230K base + equity (per recruiter)" },
            { label: "Notice period", value: "2 weeks (clean exit per her ref check)" },
          ]),
          sectionTitle("Suggested topics (15 min each)"),
          bullet(
            "<strong>Why us, why now.</strong> She's been at Haystack 4 years. What's pulling her out, and what makes VectorMail interesting specifically (vs. the 7 other AI startups recruiting her)?",
          ),
          bullet(
            "<strong>One project she's most proud of.</strong> Lets her show technical depth without us throwing a problem at her. Notes from Aria say she rebuilt Haystack's queueing layer — ask about it.",
          ),
          bullet(
            "<strong>What would your first 30 days look like.</strong> Tests judgment + reveals how she scopes ambiguity.",
          ),
          sectionTitle("Watch-outs"),
          infoCard(
            "Aria noted in the referral that Mei has been at Haystack for 4 years and might over-index on stability. Worth probing: is she comfortable with the pace and ambiguity of a 14-person eng team? Two probing questions in the prep doc.",
            { tone: "warn" },
          ),
          ctaRow([
            ctaButton("Open prep doc + scorecard", { color: "#218d62" }),
            ctaButton("Reschedule", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint(
            "Greenhouse req-2418 · Scorecard due within 24 hours of interview · You're the only interviewer in this round",
          ),
          companyEmailFooter("VectorMail Recruiting"),
        ]),
        summary: "Phone screen reminder. Action: review prep before 11 AM.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-119",
        subject: "Glassdoor review posted",
        senderName: "Glassdoor",
        senderEmail: "noreply@glassdoor.com",
        daysAgo: 3,
        snippet: "A new 5-star review was posted on your Glassdoor profile.",
        body: email([
          brandBlock("Glassdoor"),
          headline("New 5-star Glassdoor review on VectorMail"),
          p(
            "A former employee just posted a new review on your Glassdoor company page. Below is the public version — they identified themselves as a verified former employee, so the review is weighted higher in your overall score.",
          ),
          bigStat("Rating", "★★★★★ 5.0 / 5", { color: "#0caa41" }),
          keyValBlock([
            { label: "Reviewer", value: "Former Senior Engineer · 1-2 yrs · SF Bay Area" },
            { label: "Employment", value: "Verified former employee" },
            { label: "Posted", value: "Friday, May 15, 2026 · 3:42 PM PT" },
            { label: "Company rating average", value: "4.8 / 5 (was 4.7)" },
            { label: "Total reviews", value: "12 (8 employee · 4 interview)" },
            { label: "CEO approval", value: "98% · +1 pp" },
          ]),
          sectionTitle("The review · 'Best engineering culture I've worked in'"),
          infoCard(
            `<div style="font-size: 14.5px; line-height: 1.6;"><strong>Pros</strong><br/>Best engineering culture I've worked in. High autonomy, no bureaucracy, and the AI work is genuinely cutting-edge. Leadership is unusually thoughtful — they tell you the real reasons behind decisions, not the sanitized versions. Comp is competitive. Equity feels meaningful. Real customers, real product, no vapor.<br/><br/><strong>Cons</strong><br/>Pace can be intense. Onboarding is light — they expect you to ramp by doing, which works for most but not everyone. Office is small (intentional) so there's nowhere to hide on a heads-down day.<br/><br/><strong>Advice to management</strong><br/>Hire your second technical recruiter sooner than you think you need to. The current bottleneck is going to bite hard at 20+ engineers.</div>`,
            { tone: "ok" },
          ),
          sectionTitle("Suggested follow-up"),
          bullet("Reply publicly with a thoughtful, non-generic response (Glassdoor weighs employer responses)."),
          bullet("Forward to your hiring page — these reviews actively help close candidates in final stages."),
          bullet("Consider the 'second technical recruiter' advice — Lina has been pushing this for two weeks now."),
          ctaRow([
            ctaButton("Reply publicly", { color: "#0caa41" }),
            ctaButton("View on Glassdoor", { color: "#0caa41", variant: "outline" }),
          ]),
          fineprint("Glassdoor allows one employer response per review. Responses are public and become part of the permanent record."),
          companyEmailFooter("Glassdoor"),
        ]),
        summary: "5-star Glassdoor review. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-120",
        subject: "Recruiter outreach - your time?",
        senderName: "Beatrice Cohen",
        senderEmail: "beatrice@harrison-search.com",
        daysAgo: 4,
        snippet: "Cold recruiter note for a VP Eng client (Series B in fintech).",
        body: email([
          p("Hi,"),
          p(
            `I'm reaching out from Harrison & Co. — we're an executive search firm focused exclusively on fintech engineering leadership. We've placed VPs Eng at the likes of Stripe, Plaid, Brex, and Mercury over the last 5 years.`,
          ),
          p(
            "I want to be direct: I'm <strong>not asking you to leave VectorMail</strong>. You clearly love what you're building, and I can see why. I'm reaching out because I have a confidential search that I think you'd appreciate hearing about — either for yourself, for someone you know, or just so it's in your awareness for future networking.",
          ),
          sectionTitle("The role · Series B fintech in NYC"),
          keyValBlock([
            { label: "Title", value: "VP Engineering" },
            { label: "Company stage", value: "Series B · profitable · $80M raised" },
            { label: "Headcount", value: "~120 today · target 200 by EOY" },
            { label: "Comp range", value: "$480-560K base + meaningful equity + sign-on" },
            { label: "Reports to", value: "CTO (founder), board exposure" },
            { label: "Team to inherit", value: "~45 engineers across 4 pods" },
            { label: "Location", value: "NYC HQ · 3 days hybrid · relocation paid" },
            { label: "Timeline", value: "Decision by July 1" },
          ]),
          sectionTitle("Why I thought of you"),
          p(
            "Your public engineering writing and the team you've built at VectorMail are exactly what they're looking for: AI-native instincts, sharp on systems design, a real bias for shipping, and the kind of leadership that pulls senior engineers into the company rather than scaring them off.",
          ),
          sectionTitle("If you're open · two paths"),
          bullet("<strong>Quick 20-min call</strong> — just to evaluate, no commitment. I'll share company name and full deck."),
          bullet("<strong>If not for you</strong> — would you have 1-2 referrals in your network? Standard $5K referral fee on a successful hire, paid to you personally."),
          p(
            "Reply with one of: 'yes book me' / 'no but here are 2 names' / 'not the right time, ping me in 12 months.' Any of those is helpful.",
          ),
          hr(),
          signature("Beatrice Cohen", "Partner · Harrison & Co. Executive Search", "beatrice@harrison-search.com"),
        ]),
        summary: "Cold recruiter outreach. Optional - reply with referral if any.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-121",
        subject: "AWS - Bill summary for April",
        senderName: "AWS",
        senderEmail: "no-reply@aws.com",
        daysAgo: 9,
        snippet: "Your April AWS bill is $4,210 (-12% MoM).",
        body: email([
          brandBlock("AWS"),
          headline("Your April 2026 bill is ready · $4,210.42"),
          p(
            `Your monthly AWS bill for the <strong>vectormail-prod</strong> account is available. April was 12% below March, driven primarily by your RDS instance right-sizing and the S3 lifecycle policy you turned on three weeks ago.`,
          ),
          bigStat("April total", "$4,210.42"),
          keyValBlock([
            { label: "Account", value: "vectormail-prod · 7841-2912-3041" },
            { label: "Billing period", value: "April 1 – April 30, 2026" },
            { label: "Payment method", value: "Brex Visa •• 1842 · auto-charge May 14" },
            { label: "Change vs March", value: "−$582 (−12% MoM)" },
            { label: "Change vs April 2025", value: "+$840 (+25% YoY)" },
          ]),
          sectionTitle("Top services"),
          metricGrid([
            { label: "EC2", value: "$1,840", sub: "−18% MoM" },
            { label: "RDS", value: "$920", sub: "−24% (right-sized)" },
            { label: "S3", value: "$480", sub: "−8% (lifecycle on)" },
            { label: "Lambda", value: "$310" },
            { label: "CloudFront", value: "$240" },
            { label: "Other", value: "$420" },
          ]),
          sectionTitle("Wins this month"),
          bullet(
            "RDS db.r6g.2xlarge → db.r6g.xlarge after Marcus's profiling work · saving ~$280/mo",
          ),
          bullet(
            "S3 Intelligent-Tiering for the embeddings backups bucket · saving ~$95/mo",
          ),
          bullet(
            "CloudFront edge caching for marketing site · saving ~$110/mo on origin bandwidth",
          ),
          sectionTitle("Cost-Explorer flags (auto-suggested)"),
          bullet("Two unused Elastic IPs in us-west-2 · $7.30/mo if released (Marcus knows about these)"),
          bullet("A dev RDS instance is running 24/7 but only used 10-6 PT · ~$180/mo savings with a schedule"),
          ctaRow([
            ctaButton("Download invoice", { color: "#ff9900" }),
            ctaButton("Open Cost Explorer", { color: "#ff9900", variant: "outline" }),
            ctaButton("Apply suggested fixes", { color: "#ff9900", variant: "outline" }),
          ]),
          fineprint("Pricing reflects Enterprise Discount Program (EDP) commits. Full line-item detail is in your Billing Console. Tax is calculated separately and appears on your invoice PDF."),
          companyEmailFooter("AWS"),
        ]),
        summary: "AWS bill summary. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-122",
        subject: "Cloudflare - DDoS attack blocked",
        senderName: "Cloudflare",
        senderEmail: "noreply@cloudflare.com",
        daysAgo: 2,
        snippet: "Cloudflare blocked 2.3M requests from a botnet targeting your domain.",
        body: email([
          brandBlock("Cloudflare"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #06ac38; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Mitigated · 0 origin impact</span></div>`,
          headline("L7 DDoS attack on vectormail.app blocked at the edge"),
          p(
            "An HTTP flood originating from a known residential proxy botnet was blocked by your Cloudflare WAF over a 6-hour window. Origin servers received zero attack traffic; all of it terminated at our edge.",
          ),
          metricGrid([
            { label: "Zone", value: "vectormail.app" },
            { label: "Attack duration", value: "6h 04m" },
            { label: "Requests blocked", value: "2.34M" },
            { label: "Peak rate", value: "18,420 rps" },
            { label: "Origin requests", value: "0", sub: "100% absorbed" },
            { label: "Bandwidth saved", value: "84.2 GB" },
          ]),
          sectionTitle("Attack signature"),
          keyValBlock([
            { label: "Attack vector", value: "HTTP GET flood (Layer 7)" },
            { label: "Targeted paths", value: "/api/* (78%), /demo/enter (12%), other (10%)" },
            { label: "Mitigation", value: "Managed Challenge + Rate-limiting rule #14" },
            { label: "Source ASNs", value: "AS398101, AS208861, AS137409 (+ 12 more)" },
            { label: "Top source country", value: "BR (28%), VN (19%), IN (14%)" },
          ]),
          sectionTitle("Recommendation"),
          infoCard(
            "No tuning required — the attack was caught by your standard WAF rules. If you see another wave from the same ASNs in the next 24 hours, consider promoting Rule #14 from <em>challenge</em> to <em>block</em>.",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("View attack analytics", { color: "#f48120" }),
            ctaButton("Edit WAF rules", { color: "#f48120", variant: "outline" }),
          ]),
          fineprint(
            "Account: vectormail-prod · Plan: Business · Magic Transit not enabled. This event was auto-detected by Cloudflare DDoS Managed Ruleset.",
          ),
          companyEmailFooter("Cloudflare"),
        ]),
        summary: "Cloudflare mitigated a DDoS. No action - informational.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-123",
        subject: "OpenRouter - Free credits expiring",
        senderName: "OpenRouter",
        senderEmail: "team@openrouter.ai",
        daysAgo: 3,
        snippet: "$50 of free credits expire May 31. Use them on new models.",
        body: email([
          brandBlock("OpenRouter"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Expiring · 14 days left</span></div>`,
          headline("$50 of OpenRouter credits expire May 31"),
          p(
            "Heads up — you have <strong>$50.00 USD</strong> in OpenRouter promotional credits that expire on <strong>Saturday, May 31</strong>. We give these once per account (yours were granted when you signed up 12 months ago). After May 31 the unused balance is forfeited; we can't extend.",
          ),
          bigStat("Credits expiring", "$50.00 USD", { color: "#f59e0b" }),
          keyValBlock([
            { label: "Credit type", value: "Promotional · one-time" },
            { label: "Granted on", value: "May 31, 2025 (signup bonus)" },
            { label: "Expires", value: "May 31, 2026 · 11:59 PM PT" },
            { label: "Usage to date", value: "$0.00 (unused)" },
            { label: "Eligible models", value: "All models in the OpenRouter catalog · 240+" },
            { label: "Stacking", value: "Consumed before paid balance" },
          ]),
          sectionTitle("Suggested ways to use it"),
          bullet("Run an evaluation against your top 3 candidate models — $50 is enough for a real benchmark."),
          bullet("Try the newer Claude 4.7 1M-context model on a long-document workflow."),
          bullet("Quietly route 5-10% of production traffic for two days to compare cost + quality with your current provider."),
          ctaRow([
            ctaButton("Open dashboard", { color: "#6c5dd3" }),
            ctaButton("Browse models", { color: "#6c5dd3", variant: "outline" }),
          ]),
          fineprint("Credits are non-transferable, non-refundable, and don't roll over. To extend, contact your OpenRouter sales rep — we sometimes offer renewal credits for high-volume customers."),
          companyEmailFooter("OpenRouter"),
        ]),
        summary: "OpenRouter free credits expire. Action: use or lose by May 31.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-124",
        subject: "Inngest - Run failures spiked",
        senderName: "Inngest",
        senderEmail: "alerts@inngest.com",
        daysAgo: 1,
        hour: 16,
        snippet: "23 runs of 'process-scheduled-sends' failed in the last hour.",
        body: email([
          brandBlock("Inngest"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Spike alert · Active</span></div>`,
          headline("23 runs of process-scheduled-sends failed in the last hour"),
          p(
            "Function failure rate exceeded your alert threshold of 5%. Of the 124 runs invoked in the last hour, 23 failed — a 18.5% failure rate. All failures hit the same step (<code>step.run('send-via-aurinko')</code>) with the same timeout error.",
          ),
          metricGrid([
            { label: "Function", value: "process-scheduled-sends" },
            { label: "Failed runs", value: "23", sub: "of 124" },
            { label: "Failure rate", value: "18.5%", sub: "threshold 5%" },
            { label: "Median latency", value: "62.8s", sub: "limit 60s" },
            { label: "First failure", value: "16:04 PT" },
            { label: "Auto-retried", value: "23/23", sub: "all on next slot" },
          ]),
          sectionTitle("Error"),
          codeBlock(
            `<span style="color: #ff7b72;">TimeoutError</span>: step <span style="color: #d2a8ff;">'send-via-aurinko'</span> exceeded its 60s timeout<br/>&nbsp;&nbsp;at <span style="color: #79c0ff;">step.run</span> (inngest/functions/process-scheduled-sends.ts:48)<br/>&nbsp;&nbsp;at <span style="color: #79c0ff;">fetch</span> (lib/aurinko/send.ts:24) — request to <span style="color: #79c0ff;">api.aurinko.io/send</span> timed out after 60s`,
          ),
          sectionTitle("Probable cause"),
          infoCard(
            "Aurinko's <code>POST /send</code> p99 latency has been climbing all day (currently ~58s, up from 12s on Friday). Their status page acknowledged degraded performance in the EU region 22 minutes ago.",
            { tone: "warn" },
          ),
          sectionTitle("Recommended action"),
          bullet("Raise the step timeout to 90s temporarily (config change, no deploy needed)."),
          bullet("Switch the EU region to the Aurinko fallback endpoint until they recover."),
          bullet("Watch the status page — if not green in 1h, escalate via support."),
          ctaRow([
            ctaButton("Open function logs", { color: "#52d9d3" }),
            ctaButton("Aurinko status", { color: "#52d9d3", variant: "outline" }),
          ]),
          fineprint(
            "Function ID: <code>process-scheduled-sends</code> · Environment: prod · Alert: 'failure-rate-1h'",
          ),
          companyEmailFooter("Inngest"),
        ]),
        summary: "Inngest function failures. Action: investigate timeout in scheduled-sends.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-125",
        subject: "Clerk - Webhook signature failure",
        senderName: "Clerk",
        senderEmail: "alerts@clerk.com",
        daysAgo: 2,
        snippet: "12 webhook deliveries failed signature verification.",
        body: email([
          brandBlock("Clerk"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Webhook · Verification failed</span></div>`,
          headline("12 webhook deliveries failed signature verification"),
          p(
            `Your Clerk webhooks endpoint <code>https://vectormail.app/api/clerk/webhook</code> rejected 12 of the last 24 deliveries because the <code>svix-signature</code> header did not match the expected payload signature. Your application is correctly hardened — but Clerk events are queuing while we wait for that to be resolved.`,
          ),
          metricGrid([
            { label: "Endpoint", value: "/api/clerk/webhook" },
            { label: "Failed", value: "12 / 24", sub: "last 24h" },
            { label: "Queued retries", value: "12" },
            { label: "Event types", value: "user.created (8), session.created (4)" },
            { label: "Status code", value: "401", sub: "from your app" },
            { label: "First failure", value: "2 days ago, 14:22 PT" },
          ]),
          sectionTitle("Most likely cause"),
          infoCard(
            `<strong>Signing secret out of sync.</strong> You rotated the signing secret in the Clerk dashboard 2 days ago, but the new value (<code>whsec_••••••••K3jD</code>) is not in your production environment yet. Verify by checking <code>CLERK_WEBHOOK_SIGNING_SECRET</code> on Vercel.`,
            { tone: "warn" },
          ),
          sectionTitle("Other things to check"),
          bullet(
            "Confirm you're verifying <code>svix-id</code>, <code>svix-timestamp</code>, AND <code>svix-signature</code> together (verifying signature alone leaks to replay).",
          ),
          bullet("Make sure the raw request body is passed to <code>wh.verify()</code> — not a re-parsed JSON object."),
          bullet(
            "Reject deliveries older than 5 minutes by checking <code>svix-timestamp</code>; we'll retry up to 24 hours.",
          ),
          ctaRow([
            ctaButton("View failed deliveries", { color: "#6c47ff" }),
            ctaButton("Redeliver all", { color: "#6c47ff", variant: "outline" }),
          ]),
          fineprint(
            "Account: vectormail-prod · We'll keep retrying failed deliveries for 24 hours with exponential backoff.",
          ),
          companyEmailFooter("Clerk"),
        ]),
        summary: "Clerk webhook failures. Action: check signing secret env var.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-126",
        subject: "TLDR Newsletter - daily",
        senderName: "TLDR",
        senderEmail: "newsletter@tldrnewsletter.com",
        daysAgo: 0,
        hour: 7,
        snippet: "5-min tech news roundup: AI, programming, business.",
        body: email([
          brandBlock("TLDR"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #ffd600; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">TLDR · Sunday, May 17, 2026 · 5-min read</div>`,
          headline("Today's tech news in 5 minutes"),
          p(
            `<strong>Big stories</strong><br/>Apple announces on-device AI upgrades, Anthropic raises again, and a new long-context retrieval paper. Below in 60 seconds each.`,
          ),
          sectionTitle("📱 Big tech & startups · 2 min"),
          listItem({
            title: "Apple announces on-device AI model upgrades coming in iOS 19 (4 min)",
            meta: "WWDC preview: 3B parameter model running fully on-device, with quantized variants down to 1B for older hardware. Privacy-first positioning is doubling down. Read why this matters for the broader on-device ecosystem.",
            emoji: "📱",
          }),
          listItem({
            title: "Anthropic raises $7.5B at $400B mark (3 min)",
            meta: "Reuters scoop. Round led by an existing investor (Lightspeed). Anthropic now has more cash on hand than any private AI company. CEO commentary on what it gets spent on.",
            emoji: "💰",
          }),
          listItem({
            title: "OpenAI confirms 5.1 model coming end of June (2 min)",
            meta: "Multiple sources at OpenAI confirm internal benchmarks beating Claude 4.7 by 4-7% on coding + reasoning. Pricing leaked.",
            emoji: "🤖",
          }),
          sectionTitle("💻 Science & futuristic technology · 3 min"),
          listItem({
            title: "New paper on long-context retrieval claims SOTA on RULER (5 min)",
            meta: "Stanford + Anthropic joint paper. Retrieval quality at 1M tokens now indistinguishable from 100K. Practical implications for RAG systems are big.",
            emoji: "📄",
          }),
          listItem({
            title: "DeepMind: agentic browsing benchmarks · the floor just moved (3 min)",
            meta: "Their AlphaBrowse agent hits 87% on the BrowserUseBench. The 'agents are 6-12 months from production' narrative is shifting fast.",
            emoji: "🌐",
          }),
          sectionTitle("🚀 Programming, design & data science · 2 min"),
          listItem({
            title: "Cursor's new 'Composer' multi-file mode (live in beta) (4 min)",
            meta: "Cursor's answer to Claude Code. Can plan + execute changes across an entire codebase. Early reviews from prominent OSS maintainers are positive.",
            emoji: "🛠",
          }),
          listItem({
            title: "Tigris ships durable object storage that's faster than S3 (3 min)",
            meta: "New competitor to S3 with sub-100ms guarantees and a developer-friendly API. Pricing is competitive enough to make architectural choices interesting.",
            emoji: "🗄",
          }),
          ctaRow([
            ctaButton("Read full digest", { color: "#ffd600" }),
            ctaButton("Subscribe a friend", { color: "#1a1a1a", variant: "outline" }),
          ]),
          fineprint("TLDR · daily · 5-minute tech news for busy developers and founders. Manage your subscription at tldrnewsletter.com."),
          companyEmailFooter("TLDR"),
        ]),
        summary: "Daily TLDR digest. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-127",
        subject: "Morning Brew - Today's headlines",
        senderName: "Morning Brew",
        senderEmail: "crew@morningbrew.com",
        daysAgo: 0,
        hour: 6,
        snippet: "Markets up, tech earnings, and what the Fed signaled.",
        body: email([
          brandBlock("Morning Brew"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #1a1a1a; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">☕ Sunday, May 17 · Good morning</div>`,
          headline("S&P up. Tech earnings rip. The Fed signals patience."),
          p(
            `<strong>Good morning, friend.</strong> Last week ended with a rip-roaring week for the market — S&P up 0.8%, Nasdaq up 1.4%, and the kickoff of Big Tech earnings season. The Fed went on a victory lap signaling patience on rate cuts after April's CPI print. Let's dig in.`,
          ),
          sectionTitle("📈 Markets"),
          metricGrid([
            { label: "S&P 500", value: "+0.8%", sub: "5,892" },
            { label: "Nasdaq", value: "+1.4%", sub: "AI rally" },
            { label: "Dow", value: "+0.4%" },
            { label: "10-year yield", value: "4.18%", sub: "−6 bps" },
            { label: "Bitcoin", value: "+3.1%" },
            { label: "Oil (WTI)", value: "$71.20" },
          ]),
          sectionTitle("📰 The big stories"),
          bullet("<strong>Big Tech earnings kick off.</strong> Microsoft beats on AI revenue (Azure AI up 88% YoY). Meta crushes ads with new agentic targeting. Google misses on cloud but beats on Search."),
          bullet("<strong>Fed signals patience on rate cuts.</strong> No moves on rates expected before September. Inflation print at 2.4% gives them room to be deliberate."),
          bullet("<strong>Anthropic raises $7.5B.</strong> The AI lab arms race continues to compress, with two-thirds of all VC dollars flowing into 4 companies."),
          sectionTitle("⚡ Numbers that matter"),
          bullet("$400B · Anthropic's new post-money mark"),
          bullet("88% YoY · Azure AI revenue growth"),
          bullet("12.4M · Unique Microsoft Copilot users (announced last week)"),
          bullet("4 of 5 · Number of Big Tech companies that beat earnings"),
          sectionTitle("☕ One thing to take to your meeting"),
          p(
            `If Anthropic at $400B is real, the implied revenue multiple is more aggressive than even OpenAI's last round. The market is making a bet on agentic productivity — not on the chatbot interface — and that bet is reshaping the AI cost stack for everyone downstream of these labs.`,
          ),
          ctaRow([
            ctaButton("Read full edition", { color: "#0066ff" }),
            ctaButton("Forward to a friend", { color: "#1a1a1a", variant: "outline" }),
          ]),
          fineprint("Morning Brew · daily · 4 million subscribers · Built on the belief that business news shouldn't be boring."),
          companyEmailFooter("Morning Brew"),
        ]),
        summary: "Daily Morning Brew. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-128",
        subject: "Hacker News digest",
        senderName: "Hacker Newsletter",
        senderEmail: "hn@hackernewsletter.com",
        daysAgo: 6,
        snippet: "Best of HN this week: rust at scale, AI infra costs, and a postmortem worth reading.",
        body: email([
          brandBlock("Hacker Newsletter"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #ff6600; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; font-family: ${MONO_STACK};">Hacker Newsletter · Issue #714 · Saturday digest</div>`,
          headline("The best of Hacker News this week"),
          p("Curated by hand from the top of HN each week. ~50,000 readers. Below: the 8 stories that got the most upvotes plus 4 I personally found most interesting."),
          sectionTitle("Top stories"),
          listItem({
            title: "Rust at Stripe scale (412 points · 312 comments)",
            meta: "An engineer at Stripe writes about why they moved a critical payment-flow service from Go to Rust, what the migration looked like, and the unexpected benefits. The comment section is a debate worth its own read.",
            emoji: "🦀",
          }),
          listItem({
            title: "Why AI infra costs are about to crash (388 points · 240 comments)",
            meta: "Substantial write-up arguing that the inference cost curve is about to bend dramatically with new hardware (Cerebras + Groq + Apple Silicon). The author makes specific numerical predictions for late 2026.",
            emoji: "📉",
          }),
          listItem({
            title: "How we lost our database for 90 minutes (296 points · 174 comments)",
            meta: "Postmortem from a Y Combinator startup that lost their primary database for 90 minutes due to a misconfigured backup policy. Includes the runbook they wrote afterward.",
            emoji: "💀",
          }),
          listItem({
            title: "I built a search engine for 100M images with $200 (218 points · 88 comments)",
            meta: "Solo dev project using CLIP embeddings, pgvector, and a Hetzner box. Architecture diagram included; running cost is $42/mo.",
            emoji: "🔍",
          }),
          sectionTitle("My personal picks"),
          bullet("'The Quiet Revolution in DSLs' — why narrow, domain-specific languages are quietly making a comeback in 2026."),
          bullet("'On On-Call' — the most thoughtful piece I've read on the actual emotional load of being primary on-call, separate from the technical aspects."),
          bullet("'Why postgres just won' — argues database consolidation around postgres is now an irreversible trend."),
          bullet("'Three years of unicorn engineering' — recently-Series-D engineer reflecting on the trade-offs of working at a high-growth company."),
          ctaRow([
            ctaButton("Read everything", { color: "#ff6600" }),
            ctaButton("Forward to a friend", { color: "#ff6600", variant: "outline" }),
          ]),
          fineprint("Hacker Newsletter has been hand-curating Saturday digests since 2010. If you like it, the best thing you can do is share it with another engineer."),
          companyEmailFooter("Hacker Newsletter"),
        ]),
        summary: "HN digest. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-129",
        subject: "The Hustle - Founder stories",
        senderName: "The Hustle",
        senderEmail: "team@thehustle.co",
        daysAgo: 2,
        snippet: "How a 2-person team hit $5M ARR in 14 months.",
        body: email([
          brandBlock("The Hustle"),
          `<div style="margin: 0 0 4px 0; font-size: 12px; color: #febf00; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;">The Hustle · Founder profiles · 7-min read</div>`,
          headline("$5M ARR in 14 months · without raising a dollar"),
          p(
            `This week's deep dive is on <strong>Mira & Carlos Rodriguez</strong>, husband-wife co-founders of an AI legal-research startup that went from zero to $5M ARR in 14 months <em>without ever pitching a VC</em>. The numbers are extraordinary — but the tactics they used are stealable for anyone.`,
          ),
          sectionTitle("The numbers"),
          metricGrid([
            { label: "Months to $5M ARR", value: "14", sub: "from $0" },
            { label: "Founders", value: "2", sub: "no other employees" },
            { label: "VC raised", value: "$0", sub: "bootstrapped" },
            { label: "Profit margin", value: "62%", sub: "first year" },
            { label: "Customer count", value: "180", sub: "average $28K ACV" },
            { label: "Pre-launch waitlist", value: "12K", sub: "built in 4 months" },
          ]),
          sectionTitle("Three tactics they used"),
          bullet("<strong>Built the waitlist before the product.</strong> Spent 4 months posting daily on LinkedIn about specific legal-research pain points. Built a 12K-person waitlist before they wrote a line of code. Half converted in the first 3 months post-launch."),
          bullet("<strong>Priced from day 1.</strong> No free tier, no freemium. $99/month minimum from launch. They argued it filtered for serious users and avoided the death-by-support-tickets that kills bootstrapped startups."),
          bullet("<strong>Profitable from week one.</strong> They were profitable before they had product-market fit. The discipline forced focus and gave them runway no VC could have provided."),
          sectionTitle("The single biggest decision"),
          infoCard(
            `<em>"The hardest decision was not raising. Three VCs cold-emailed us in month 6 offering $5M term sheets at $25M post. We said no every time. Our logic was: if the business works, we don't need the money. If it doesn't, the money won't save us. Looking back, that's the decision that actually built the company."</em><br/><br/><span style="color: #5f6368; font-size: 13px;">— Mira Rodriguez, co-founder</span>`,
            { accent: "#febf00" },
          ),
          ctaRow([
            ctaButton("Read full profile", { color: "#000000" }),
            ctaButton("Subscribe to The Hustle", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("The Hustle · daily business newsletter · 2.5 million subscribers · part of the HubSpot Media Network"),
          companyEmailFooter("The Hustle"),
        ]),
        summary: "Newsletter. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-130",
        subject: "Re: Pricing experiment - results",
        senderName: "Marketing",
        senderEmail: "marketing@vectormail.app",
        daysAgo: 2,
        hour: 15,
        snippet: "Self-serve price A/B test results: variant B won. +18% revenue per visitor.",
        body: email([
          headline("Pricing A/B test · Variant B wins · +18% revenue per visitor"),
          p(
            "Hi,<br/><br/>Closed out the self-serve pricing experiment this morning. <strong>Variant B (annual upfront with 17% discount on the headline price) won decisively across every metric we care about.</strong> Results below. Recommendation is to ship to 100% of self-serve traffic on Tuesday next week.",
          ),
          metricGrid([
            { label: "Visitors tested", value: "9,820", sub: "21 days" },
            { label: "Conversion rate", value: "5.4%", sub: "+12% vs control" },
            { label: "Revenue / visitor", value: "$28", sub: "+18% vs control" },
            { label: "Discount take-rate", value: "41%", sub: "as predicted" },
            { label: "Cancellation in first 30d", value: "1.8%", sub: "no change vs control" },
            { label: "p-value", value: "0.003", sub: "highly significant" },
          ]),
          sectionTitle("What Variant B looked like"),
          bullet("Headline price stayed at <strong>$99/month</strong>"),
          bullet("Added <strong>'Save 17%'</strong> annual toggle on the pricing page — landing on annual by default"),
          bullet("Annual was prepaid · ~$988/year (rounded from $987.84)"),
          bullet("Copy emphasized 'lock your rate' rather than 'discount'"),
          sectionTitle("Why it worked"),
          infoCard(
            `<strong>Three factors</strong>: (1) the annual default reduced decision fatigue and got more people to commit; (2) prepay vs monthly cleared a procurement friction for our SMB customers; (3) the rate-lock framing reframed the discount as 'protection' rather than 'savings,' which our customer-research had said would land better with our segment.`,
            { tone: "ok" },
          ),
          sectionTitle("Next steps · need your sign-off"),
          bullet("<strong>Tuesday May 26:</strong> Ship Variant B to 100% of self-serve traffic"),
          bullet("<strong>Monitor 30 days:</strong> Watch cancellation rate (kill-switch if it climbs >3%)"),
          bullet("<strong>Re-evaluate at 30 days:</strong> Full cohort analysis to confirm the lift holds in production"),
          ctaRow([
            ctaButton("Approve full rollout", { color: "#1F3A2E" }),
            ctaButton("Hold for review", { color: "#1F3A2E", variant: "outline" }),
            ctaButton("Open results dashboard", { color: "#1F3A2E", variant: "outline" }),
          ]),
          hr(),
          signature("Marketing", "VectorMail · Growth team", "marketing@vectormail.app"),
        ]),
        summary: "Pricing A/B test winner. Action: approve variant B rollout to 100%.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-131",
        subject: "Quarterly planning kickoff",
        senderName: "Dana Howe",
        senderEmail: "dana@vectormail.app",
        daysAgo: 4,
        snippet: "Q3 planning starts Monday. Pre-read assigned, sessions scheduled.",
        body: email([
          headline("Q3 planning kicks off Monday · three sessions over two weeks"),
          p(
            "Hi team,<br/><br/>We're kicking off Q3 planning Monday. The goal: leave week 2 with a committed Q3 roadmap, owners, and the dependencies named. Process below — your time investment is ~6 hours of meetings + ~3 hours of pre-read across two weeks.",
          ),
          sectionTitle("Three sessions"),
          logRow("Week 1 · Mon May 19", "Strategy + Q3 themes · 90 min · everyone", { tone: "info" }),
          logRow("Week 1 · Thu May 22", "Roadmap proposals · 2 hours · function leads present", { tone: "info" }),
          logRow("Week 2 · Tue May 27", "Trade-offs + commit · 2 hours · everyone, decisions made", { tone: "warn" }),
          sectionTitle("Required pre-read by Sunday EOD"),
          bullet(`<strong>Q2 retrospective</strong> · what we did well, what we didn't (12 min read)`),
          bullet(`<strong>Customer-facing constraints memo</strong> · what's actually on fire from CS + sales (8 min read)`),
          bullet(`<strong>Bottoms-up model update</strong> · finance's projection of headcount + spend through Q3 (skim, 5 min)`),
          bullet(`<strong>Three pre-circulated theme drafts</strong> · pick the one most likely to compound (15 min read + ranking)`),
          sectionTitle("Three guardrails for the process"),
          bullet("<strong>Pre-read is required.</strong> Show up to Monday with a position, not a question."),
          bullet("<strong>One theme will win.</strong> Not three. Spending our resources on the one thing that compounds is the entire point."),
          bullet("<strong>Trade-offs visible.</strong> Every commit gets a paired 'we are NOT doing X because we said yes to Y.' If you can't name the trade-off, the commit isn't real."),
          sectionTitle("Logistics"),
          bullet("Sessions in person at the office (large meeting room) + Zoom for remote folks"),
          bullet("All three are <strong>required</strong> — if you can't make one, send a delegate with decision rights"),
          bullet("Async ranking ballot for theme selection drops Wednesday at noon"),
          p("See you Monday."),
          hr(),
          signature("Dana Howe", "Head of Engineering · VectorMail", "dana@vectormail.app"),
        ]),
        summary: "Q3 planning kickoff. Action: read pre-read by Sunday.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-132",
        subject: "Friday wins thread",
        senderName: "Marketing",
        senderEmail: "marketing@vectormail.app",
        daysAgo: 7,
        snippet: "Wins from this week: NPS at 67, 3 new logos, Outlook beta shipped.",
        body: email([
          brandBlock("VectorMail · Friday Wins"),
          headline("Friday wins · the highlight reel"),
          p(
            `Each Friday at 5 PM PT we publish the highlight reel — the wins that move the company forward this week. The whole team feeds these in via the <code>#wins</code> Slack channel; this is the curated digest.`,
          ),
          metricGrid([
            { label: "New logos this week", value: "3", sub: "Brightlane, Castleworks, Northglade" },
            { label: "NPS", value: "67", sub: "+5 from Q1" },
            { label: "Active users", value: "1,847", sub: "+4% WoW" },
            { label: "Net new ARR", value: "+$108K", sub: "this week" },
            { label: "Sentiment", value: "Strong", sub: "across the board" },
            { label: "Mood", value: "📈", sub: "Friday energy" },
          ]),
          sectionTitle("Customer wins"),
          bullet("<strong>Brightlane expansion</strong> · 50 → 75 seats · $30K net new ARR · Sophia wants a case study"),
          bullet("<strong>Castleworks closed</strong> · 8-seat trial → annual contract · ~$10K new ARR"),
          bullet("<strong>Northglade onboarded</strong> · 100% activation in 3 days (record)"),
          bullet("<strong>Loop AI saved</strong> · DAU recovered, committed to 12-month renewal"),
          sectionTitle("Product wins"),
          bullet("<strong>Outlook beta shipped on time</strong> · 12 customers activated overnight · sentiment positive"),
          bullet("<strong>Buddy v2 streaming</strong> · cut median reply latency from 4.2s to 1.1s"),
          bullet("<strong>Sentry noise reduced 40%</strong> · oncall load now sustainable"),
          sectionTitle("People wins"),
          bullet("<strong>Hired Elena Vargas</strong> · senior eng from Stripe, starts June 2"),
          bullet("<strong>Nathan Wu in offer-decision week</strong> · expected yes by Friday"),
          bullet("<strong>Glassdoor 5-star</strong> from a former employee — second this quarter"),
          sectionTitle("Misc wins"),
          bullet("<strong>Series A term sheet</strong> from Horizon · 90% across the line"),
          bullet("<strong>Bridge SAFE from Foundry</strong> · $500K, executed today"),
          bullet("<strong>USPTO trademark</strong> approved for publication"),
          sectionTitle("Anti-wins (we ship these too)"),
          bullet("<strong>Datadog SLO breach</strong> · 12 min · auto-rolled back · being postmortemed Monday"),
          bullet("<strong>DataPipe escalation</strong> · being handled, save call Wednesday"),
          p("Strong week. Touch grass. See you Monday."),
          hr(),
          signature("VectorMail HQ", "Friday Wins · published every Friday at 5 PM PT"),
        ]),
        summary: "Weekly wins digest. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-133",
        subject: "1Password - Watchtower alert",
        senderName: "1Password",
        senderEmail: "no-reply@1password.com",
        daysAgo: 5,
        snippet: "Watchtower found 1 vulnerable password in your vault.",
        body: email([
          brandBlock("1Password"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Watchtower · 1 issue found</span></div>`,
          headline("Watchtower found a vulnerable password in your vault"),
          p(
            "1Password Watchtower's weekly security scan ran this morning and identified <strong>one credential</strong> that needs your attention. The flagged item has been used at least once in the last 90 days, so we recommend rotating soon rather than letting it slip.",
          ),
          sectionTitle("Flagged item"),
          infoCard(
            `<strong>legacy-internal.vectormail.app</strong> · admin account<br/><br/><span style="color: #5f6368; font-size: 13px;"><strong>Issue:</strong> reused across 3 different vault items. Once attackers compromise one of those sites, this credential can be tried against the others (credential stuffing).<br/><br/><strong>Last used:</strong> 4 days ago<br/><strong>Created:</strong> 14 months ago<br/><strong>Stored as:</strong> Login (admin@legacy-internal.vectormail.app)<br/><strong>Severity:</strong> Medium · the legacy domain is no longer customer-facing but still has admin access to historical data.</span>`,
            { tone: "warn" },
          ),
          sectionTitle("Watchtower's full health check"),
          metricGrid([
            { label: "Vault items", value: "412" },
            { label: "Total accounts", value: "8 teammates" },
            { label: "Compromised passwords", value: "0", sub: "no known breach matches" },
            { label: "Reused passwords", value: "1", sub: "this alert" },
            { label: "Weak passwords", value: "0", sub: "all strong" },
            { label: "2FA-eligible (not enabled)", value: "0" },
          ]),
          sectionTitle("Recommended fix"),
          bullet("Generate a new password directly in 1Password (Suggest Strong Password)."),
          bullet("Log in to legacy-internal.vectormail.app and rotate it."),
          bullet("Update the entry in 1Password."),
          bullet("Optional: delete the legacy site if it's no longer in active use."),
          ctaRow([
            ctaButton("Open Watchtower", { color: "#0572ec" }),
            ctaButton("Rotate this item", { color: "#0572ec", variant: "outline" }),
          ]),
          fineprint("Watchtower scans your vault daily for compromised credentials, weak passwords, reused passwords, and missing 2FA. Settings → Watchtower to configure."),
          companyEmailFooter("1Password"),
        ]),
        summary: "1Password vulnerability. Action: rotate the flagged password.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-134",
        subject: "Bug bounty - new report",
        senderName: "HackerOne",
        senderEmail: "no-reply@hackerone.com",
        daysAgo: 3,
        snippet: "New bug bounty report submitted (severity: medium).",
        body: email([
          brandBlock("HackerOne"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">New report · Medium · Triage in 48h</span></div>`,
          headline("IDOR vulnerability on /api/labels — lateral account access"),
          p(
            "A new bug bounty report was submitted to your <strong>VectorMail</strong> program. Researcher <strong>nikolasl</strong> (reputation 8,420 · top 1% on HackerOne) identified an IDOR (Insecure Direct Object Reference) that allows authenticated users to view labels belonging to other accounts.",
          ),
          keyValBlock([
            { label: "Report ID", value: "H1-12841" },
            { label: "Researcher", value: "nikolasl · top-1% reputation" },
            { label: "Submitted", value: "Saturday, May 16, 2026 · 8:42 PM PT" },
            { label: "Triage SLA (per your program)", value: "48 hours · due Monday 8:42 PM" },
            { label: "Severity (researcher claim)", value: "Medium · CVSS 5.4" },
            { label: "Bounty range (your program)", value: "$1,000 – $3,500 for medium" },
          ]),
          sectionTitle("Researcher's description"),
          infoCard(
            `<strong>Title:</strong> IDOR on POST /api/labels/move — lateral access between accounts<br/><br/><strong>Proof of concept:</strong><br/>1. Sign up two accounts (A and B).<br/>2. As Account A, call POST /api/labels with a label_id that belongs to Account B.<br/>3. The API returns the label payload — the account-scope check is missing on this specific endpoint (the GET endpoint is correctly scoped; the POST is not).<br/><br/><strong>Impact:</strong> Limited (labels are mostly metadata), but lateral access shouldn't exist anywhere. If the same authorization gap is present on other endpoints, the impact could be substantial.`,
            { tone: "warn" },
          ),
          sectionTitle("Recommended triage steps"),
          bullet("Reproduce in staging within the next 4 hours."),
          bullet("Audit all 47 endpoints in the labels router for the same gap."),
          bullet("Fix + ship + bounty within 7 days."),
          bullet("CVSS verify + final severity assignment within 48 hours."),
          bullet("Decide bounty amount based on final severity."),
          ctaRow([
            ctaButton("Open report in H1", { color: "#101115" }),
            ctaButton("Acknowledge report", { color: "#dd4d4d", variant: "outline" }),
          ]),
          fineprint(
            "HackerOne · vectormail bug-bounty program · Your program's average triage time: 31 hours (target: 48). Researchers track your responsiveness publicly — slow triage hurts your future report quality.",
          ),
          companyEmailFooter("HackerOne"),
        ]),
        summary: "Bug bounty report - medium severity IDOR. Action: triage within 48h.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-135",
        subject: "DPA signed - Brightlane",
        senderName: "DocuSign",
        senderEmail: "dse@docusign.net",
        daysAgo: 4,
        snippet: "Brightlane signed the Data Processing Addendum.",
        body: email([
          brandBlock("DocuSign"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #000000; background: #ffcc22; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Completed · Brightlane DPA</span></div>`,
          headline("Brightlane has signed the Data Processing Addendum"),
          p(
            "Your Data Processing Addendum (DPA) with <strong>Brightlane</strong> is now fully executed by all parties. This addendum modifies your existing MSA to address GDPR/CCPA-required data-processing terms, sub-processor consent, and incident-notification obligations. Standard mid-contract addition for a customer scaling up their compliance posture.",
          ),
          keyValBlock([
            { label: "Document", value: "Data Processing Addendum (GDPR + CCPA)" },
            { label: "Parties", value: "Brightlane (Controller) + VectorMail (Processor)" },
            { label: "Linked to", value: "MSA-2025-BL-0091 (master agreement)" },
            { label: "Brightlane signed", value: "May 13, 2026 · 2:18 PM PT · by Tomas Reyes (CFO)" },
            { label: "VectorMail signed", value: "May 13, 2026 · 2:38 PM PT · by Demo User (CEO)" },
            { label: "Effective", value: "May 13, 2026" },
            { label: "Envelope ID", value: "DSE-2026-DPA-BL-0091" },
          ]),
          sectionTitle("What's now binding"),
          bullet("Standard Contractual Clauses (2021 EU Commission) for any EU data transfers"),
          bullet("Sub-processor consent procedure (60-day objection window for new sub-processors)"),
          bullet("24-hour incident notification with specifics on PII, scope, and remediation"),
          bullet("Annual security questionnaire renewal (next due May 2027)"),
          bullet("Right to audit (with 30-day notice, max once per year)"),
          ctaRow([
            ctaButton("View signed document", { color: "#ffcc22" }),
            ctaButton("Download PDF", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("Fully-executed DPA stored in your DocuSign vault. Audit trail attached. Brightlane's legal team has the same file. No further action required."),
          companyEmailFooter("DocuSign"),
        ]),
        summary: "DPA signed by customer. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-136",
        subject: "GitHub - Security advisory in dependency",
        senderName: "GitHub",
        senderEmail: "noreply@github.com",
        daysAgo: 2,
        snippet: "Dependabot found a critical CVE in axios@1.6.0.",
        body: email([
          brandBlock("GitHub"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Critical · Dependabot · Auto-PR opened</span></div>`,
          headline("Critical CVE in axios@1.6.0 — auto-PR ready to merge"),
          p(
            `Dependabot identified a critical vulnerability in <strong>axios@1.6.0</strong>, used in your <strong>vectormail-ai/vectormail-ai</strong> repository. An auto-generated pull request (#441) has been opened to upgrade to axios@1.7.4, which contains the fix. All CI checks have passed.`,
          ),
          keyValBlock([
            { label: "CVE", value: "CVE-2026-2841" },
            { label: "Severity", value: "Critical · CVSS 9.1" },
            { label: "Vulnerable package", value: "axios@1.6.0" },
            { label: "Fixed in", value: "axios@1.7.4 (released yesterday)" },
            { label: "Auto-PR", value: "vectormail-ai/vectormail-ai#441 — ready to merge" },
            { label: "Repo locations affected", value: "5 import sites · all in /src/lib/integrations" },
          ]),
          sectionTitle("Vulnerability details"),
          infoCard(
            "<strong>SSRF (Server-Side Request Forgery) via redirect handling</strong> in axios 1.6.0-1.6.7. A malicious response can cause axios to make a follow-up request to an attacker-chosen URL while still authenticated with the original credentials. Practical impact in your codebase is low — most uses are to trusted vendor APIs — but you have one user-input-driven URL fetch in the OAuth callback handler that's directly exploitable.",
            { tone: "danger" },
          ),
          sectionTitle("PR #441 details"),
          bullet("Diff: <code>+1 / -1</code> in package.json + lockfile changes"),
          bullet("CI: all 8 checks passed · 0 type errors · 0 test regressions"),
          bullet("CodeQL: no new findings"),
          bullet("Preview deploy: green · functional tests pass"),
          sectionTitle("Recommendation"),
          p("This is a low-risk merge — pure version bump of a well-tested patch. <strong>Recommend merging today.</strong> The vulnerable path is exploitable in your OAuth callback flow, so this is meaningful to ship."),
          ctaRow([
            ctaButton("Review + merge PR #441", { color: "#1f883d" }),
            ctaButton("View CVE details", { color: "#24292f", variant: "outline" }),
            ctaButton("View all 5 import sites", { color: "#24292f", variant: "outline" }),
          ]),
          fineprint("Dependabot will retry CI hourly if checks fail. If you'd like Dependabot to auto-merge low-risk patch updates, you can enable it in your repository's security settings."),
          companyEmailFooter("GitHub"),
        ]),
        summary: "Critical CVE in dep. Action: merge Dependabot PR #441.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-137",
        subject: "Linear - 7 issues assigned to you",
        senderName: "Linear",
        senderEmail: "notifications@linear.app",
        daysAgo: 1,
        hour: 9,
        snippet: "Weekly summary: 7 issues assigned to you, 4 due this week.",
        body: email([
          brandBlock("Linear"),
          headline("Your week in Linear · 7 issues, 4 due this week"),
          p(
            "Your Monday-morning Linear digest. Here's everything on your plate this week, ranked by due date and weighted by current cycle priority.",
          ),
          metricGrid([
            { label: "Assigned to you", value: "7" },
            { label: "Due this week", value: "4" },
            { label: "Overdue", value: "0", sub: "nice" },
            { label: "In progress", value: "3" },
            { label: "In review", value: "2" },
            { label: "Backlog", value: "2" },
          ]),
          sectionTitle("Due this week"),
          bullet("<strong>VM-208</strong> · pgvector cutover plan · due Wed · in progress (60%)"),
          bullet("<strong>VM-214</strong> · Buddy v2.1 streaming tool-use indicator · due Thu · in progress (30%)"),
          bullet("<strong>VM-219</strong> · SOC 2 evidence automation · due Fri · todo"),
          bullet("<strong>VM-228</strong> · Q3 OKR draft · due Fri · in progress (40%)"),
          sectionTitle("Due next week"),
          bullet("<strong>VM-237</strong> · Inbox v3 triage column shipping · in review"),
          bullet("<strong>VM-241</strong> · Mobile responsive polish · in review"),
          bullet("<strong>VM-249</strong> · Pricing experiment full rollout · backlog"),
          ctaRow([
            ctaButton("Open Linear", { color: "#5e6ad2" }),
            ctaButton("View this cycle", { color: "#5e6ad2", variant: "outline" }),
          ]),
          fineprint("Linear digest · Monday mornings at 9 AM PT · disable in your notification settings"),
          companyEmailFooter("Linear"),
        ]),
        summary: "Linear weekly digest. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-138",
        subject: "GitHub - Repo invitation accepted",
        senderName: "GitHub",
        senderEmail: "noreply@github.com",
        daysAgo: 3,
        snippet: "Elena Vargas accepted your invitation to vectormail-ai.",
        body: email([
          brandBlock("GitHub"),
          headline("Elena Vargas accepted your invitation"),
          p(
            `<strong>elena-vargas</strong> has accepted your invitation to the <strong>vectormail-ai/vectormail-ai</strong> repository. She now has Member-level access and can clone, push to feature branches, and open pull requests.`,
          ),
          profileCard({
            name: "Elena Vargas",
            title: "elena-vargas · GitHub",
            company: "Joined as: Member · 47 repos contributed to publicly",
            initials: "EV",
            accent: "#0969da",
            rightLabel: "Active",
          }),
          keyValBlock([
            { label: "Repository", value: "vectormail-ai/vectormail-ai" },
            { label: "Permission level", value: "Member · push to branches, open PRs, no direct main writes" },
            { label: "Joined org as", value: "Engineering team" },
            { label: "Invited by", value: "you · 14 hours ago" },
            { label: "Accepted at", value: "May 14, 2026 · 9:18 AM PT" },
            { label: "2FA status", value: "Enabled (security key + TOTP)" },
          ]),
          sectionTitle("She now has access to"),
          bullet("vectormail-ai/vectormail-ai (main monorepo)"),
          bullet("vectormail-ai/marketing (landing + docs)"),
          bullet("vectormail-ai/research (private R&D)"),
          bullet("vectormail-ai/playground (sandbox)"),
          sectionTitle("Onboarding suggestions"),
          bullet("Add her to the <code>#eng-prs</code> Slack channel."),
          bullet("Send her the new-hire engineering doc (Marcus has the template)."),
          bullet("Pair her with Nathan for first-week onboarding (he's offered)."),
          ctaRow([
            ctaButton("View her profile", { color: "#24292f" }),
            ctaButton("Manage team access", { color: "#24292f", variant: "outline" }),
          ]),
          fineprint("Organization: vectormail-ai · Seat count: 8 of 25 used · You can review team permissions at any time."),
          companyEmailFooter("GitHub"),
        ]),
        summary: "GitHub invite accepted. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-139",
        subject: "Notion - 'Q3 OKRs' was edited",
        senderName: "Notion",
        senderEmail: "notifications@notion.so",
        daysAgo: 1,
        hour: 14,
        snippet: "Dana edited 'Q3 OKRs' - 4 changes.",
        body: email([
          brandBlock("Notion"),
          headline("'Q3 OKRs' was edited by Dana Howe"),
          p(
            `Dana made 4 edits to the <strong>Q3 OKRs</strong> page in your <em>VectorMail HQ</em> workspace in the last hour. You're watching this page, so we're letting you know. Comments and content changes summarized below.`,
          ),
          keyValBlock([
            { label: "Page", value: "Q3 OKRs (in shared / Planning)" },
            { label: "Editor", value: "Dana Howe (Head of Engineering)" },
            { label: "Changes", value: "4 edits in the last hour" },
            { label: "Last edited", value: "Today, 2:18 PM PT" },
            { label: "Page owners", value: "You, Dana, Marcus" },
            { label: "Comments added", value: "2 (1 to you, 1 open)" },
          ]),
          sectionTitle("Summary of changes"),
          bullet("Updated <strong>Objective 1</strong> wording — softened 'dominate' to 'lead' (after your feedback last week)."),
          bullet("Added a <strong>new key result</strong> under Objective 2 about Outlook NRR by end of Q3."),
          bullet("Reorganized the <strong>hiring section</strong> — split senior eng + staff eng into separate sub-objectives."),
          bullet("Added two questions in comments — one tagged to you about the GTM objective."),
          sectionTitle("Comment threads · 2 open"),
          infoCard(
            `<strong>Dana asked you:</strong> "Should we put pricing experiments under Marketing or under Product for Q3? Different incentives apply." — 47 minutes ago, awaiting reply.`,
            { accent: "#000000" },
          ),
          ctaRow([
            ctaButton("Open in Notion", { color: "#000000" }),
            ctaButton("Reply to Dana's comment", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("You'll receive a daily digest of changes to pages you're watching. Manage notifications in Notion settings."),
          companyEmailFooter("Notion"),
        ]),
        summary: "Notion edit notification. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-140",
        subject: "Re: Intro to Mosaic Health",
        senderName: "Hana Cho",
        senderEmail: "hana@forerunnervc.com",
        daysAgo: 3,
        snippet: "Looping you in with Sam at Mosaic Health.",
        body: email([
          p("Hi both,"),
          p(
            "Following through on the Mosaic Health intro I offered last week. Both of you are exactly the kind of people who should be talking to each other and I don't want to be the bottleneck. Looping you in directly.",
          ),
          p(
            "<strong>Sam</strong> — meet <strong>Demo User</strong>, CEO of <strong>VectorMail</strong>. They're building an AI-native inbox that I think is going to define this category. Closed Series A in March, ~14 person team, real customers (Brightlane, Castleworks, Northglade, plus a handful of healthcare-adjacent ones), and a technical bar I'd put up against any AI company at this stage.",
          ),
          p(
            "<strong>Demo User</strong> — meet <strong>Sam Chen</strong>, COO of <strong>Mosaic Health</strong>. Mosaic is scaling a workflow product for 1,200+ healthcare administrators. They have shared inboxes (3 distinct ones) and Sam was complaining to me at our partner offsite last week about the operational drag from them. I think VectorMail solves this almost out of the box — but obviously Sam has a real say in that.",
          ),
          p(
            "I'll leave the rest to you two. Sam — Demo User can run you through a demo any time; they're particularly good at the customer-story-style demos, not the 'feature tour' ones. <strong>Demo User</strong> — Sam is in NYC, decisions move quickly at Mosaic, and they're in a procurement-friendly mode this quarter.",
          ),
          p("Good luck. Loop me in on the outcome whenever it happens. 🤝"),
          hr(),
          signature("Hana Cho", "Partner · Forerunner Ventures", "hana@forerunnervc.com"),
        ]),
        summary: "VC double-opt intro to potential customer (Mosaic Health). Action: reply with demo link.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-141",
        subject: "Co-investor intro - SignalFire",
        senderName: "Maya Patel",
        senderEmail: "maya@usv.com",
        daysAgo: 5,
        snippet: "If room in the round, SignalFire wants in. Connecting you.",
        body: email([
          p("Hi,"),
          p(
            "Quick heads up — I was at the SignalFire offsite last week and ran into <strong>Wesley Park</strong> over dinner. We got to talking about who's actually building the AI-native category right now, and your name came up before mine did. He's been wanting to invest but hadn't found the entry point.",
          ),
          p(
            "If there's room left in the round, <strong>Wesley would love to co-invest</strong>. SignalFire's typical check at Series A is $1-3M, they're highly engaged on the data-infra and AI-native productivity theses, and they bring real recruiting horsepower for senior eng/product roles — which I know is your top constraint right now.",
          ),
          sectionTitle("Quick context on Wesley + SignalFire"),
          bullet("<strong>Wesley Park</strong> — Partner at SignalFire, leads enterprise AI. Ex-Atlassian product, ex-Snap. Has been the lead voice on AI-productivity in their portfolio."),
          bullet("<strong>SignalFire</strong> — $2.8B AUM. Notable AI investments: Cresta, Decagon, Lattice (early). Strong recruiting platform (Beacon AI) that pulls candidates from their proprietary dataset."),
          bullet("<strong>Their typical engagement post-investment:</strong> active on hiring, lightweight on product, quick at board meetings."),
          sectionTitle("My recommendation"),
          p(
            "If you have any room — even $500K-1M — I'd take the call. Their value-add at this stage is meaningful and Wesley personally is one of the higher-signal VCs I work with. <strong>Looping him in below the line</strong> so you two can take it from here. If there's no room, easiest reply is 'thanks Maya, we're at capacity but stay in touch for the B' — Wesley will get it.",
          ),
          hr(),
          signature("Maya Patel", "Partner · USV", "maya@usv.com"),
        ]),
        summary: "Co-investor warm intro. Action: respond and qualify SignalFire.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-142",
        subject: "Re: Bridge SAFE - executed",
        senderName: "Counsel",
        senderEmail: "counsel@morrisonfoerster.com",
        daysAgo: 4,
        snippet: "Daniel's bridge SAFE is fully executed. Cap table updated.",
        body: email([
          headline("Bridge SAFE — fully executed · cap table updated"),
          p(
            "Hi,<br/><br/>Quick confirmation: <strong>Daniel Brun's $500K bridge SAFE is now fully executed.</strong> Both signatures captured this afternoon, board consent was signed in parallel, and Carta has been updated to reflect the new instrument. Wire from Foundry expected by Monday close of business.",
          ),
          keyValBlock([
            { label: "Investor", value: "Daniel Brun (Foundry Capital)" },
            { label: "Instrument", value: "Post-money SAFE · $90M cap · no discount · no MFN" },
            { label: "Amount", value: "$500,000 USD" },
            { label: "Effective date", value: "May 13, 2026" },
            { label: "Funds expected", value: "Monday, May 19 (wire initiated Friday)" },
            { label: "Cap table impact", value: "Pending conversion at next priced round" },
            { label: "DocuSign envelope", value: "DSE-2026-bridge-FB-500" },
          ]),
          sectionTitle("What was filed / updated"),
          bullet("SAFE signed by Daniel (Foundry) and you · counter-signed today"),
          bullet("Board consent for the bridge financing · signed by all board members"),
          bullet("Cap table updated in Carta (Foundry now reflects bridge in pending instruments)"),
          bullet("Form D filing initiated · 15 days from first sale (deadline May 28)"),
          bullet("Schedule of investors updated"),
          sectionTitle("What you need to do · nothing this week"),
          p(
            "Form D will auto-file before deadline. State Blue Sky filings are in the queue. Once funds clear Monday, I'll send a final wire confirmation for your records. Otherwise — closed cleanly, no loose ends.",
          ),
          ctaRow([
            ctaButton("View signed SAFE", { color: "#1F3A2E" }),
            ctaButton("Download for records", { color: "#1F3A2E", variant: "outline" }),
          ]),
          hr(),
          signature("Stephen Ho", "Counsel · Morrison & Foerster", "counsel@morrisonfoerster.com"),
        ]),
        summary: "Bridge SAFE executed. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-143",
        subject: "POC scoping doc - Northwind",
        senderName: "Drew Hwang",
        senderEmail: "drew@northwindcorp.com",
        daysAgo: 3,
        hour: 11,
        snippet: "Scoping doc for the 30-day POC. Three success criteria.",
        body: email([
          p("Hi,"),
          p(
            "Attached is the formal POC scoping document for our 30-day evaluation. Our IT and security teams jointly authored it — three clear pass/fail success criteria, the timeline, the participant list, and the success-state contract terms we'd move to if all three criteria are met. Want your sign-off before kickoff Monday.",
          ),
          sectionTitle("POC overview"),
          keyValBlock([
            { label: "Pilot duration", value: "30 days · June 2 → July 1, 2026" },
            { label: "Pilot scope", value: "30 seats · IT leadership + Customer Support org" },
            { label: "Cost", value: "$15,000 (paid, fully refundable if any criterion missed)" },
            { label: "Success contract", value: "250-seat MSA at $99/seat/mo, 24-month term · $7.4M ARR" },
            { label: "Decision date", value: "Friday, July 4, 2026" },
          ]),
          sectionTitle("Three success criteria"),
          infoCard(
            `<strong>1. Sync · 100% of pilot user inboxes complete sync within 24 hours of OAuth grant</strong><br/><span style="color: #5f6368; font-size: 13px;">Measured by: log-based audit of all 30 pilot accounts. Auditable by us, but we'd want shared access to the sync dashboard.</span>`,
            { tone: "info" },
          ),
          infoCard(
            `<strong>2. Buddy reply quality ≥ 80% on our internal evaluation set</strong><br/><span style="color: #5f6368; font-size: 13px;">Our security team prepared a 50-message eval set across customer support and IT scenarios. Marked by three of our team members blind, averaged. ≥80% pass = success.</span>`,
            { tone: "info" },
          ),
          infoCard(
            `<strong>3. Zero security incidents during pilot</strong><br/><span style="color: #5f6368; font-size: 13px;">Defined as: no unauthorized data access, no data leaks, no successful credential compromise, no PII/PHI mishandling. Measured by your SOC 2 audit trail + our SIEM (Splunk).</span>`,
            { tone: "info" },
          ),
          sectionTitle("Kickoff plan · Monday June 2, 9 AM PT"),
          bullet("90-min kickoff with both teams (our IT + your CS)"),
          bullet("OAuth grant by 12 PM PT same day"),
          bullet("First evaluation checkpoint Friday June 6"),
          bullet("Weekly check-ins thereafter"),
          bullet("Final review July 1, decision July 4"),
          sectionTitle("Procurement note"),
          p(
            "Our standard MSA is attached as a parallel track. If we hit all three criteria, my team's procurement engineer and yours can be wrapping the contract by July 8 with a target close of mid-July. Net-60 payment terms, our standard.",
          ),
          p(
            "Please review the doc by EOD Friday so we're aligned before kickoff. Happy to do a 30-min call beforehand if you want to align on anything verbally first."
          ),
          hr(),
          signature("Drew Hwang", "Director of IT, Productivity Tools · Northwind Corp", "drew@northwindcorp.com"),
        ]),
        summary: "Enterprise POC scoping doc with success criteria. Action: review and align.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-144",
        subject: "Procurement form - Brightlane",
        senderName: "Procurement",
        senderEmail: "procurement@brightlane.io",
        daysAgo: 5,
        snippet: "Please complete the vendor security questionnaire by May 30.",
        body: email([
          p("Hi,"),
          p(
            "Quick procurement note tied to our Q2 renewal. Per Brightlane's vendor management policy, every annual contract renewal triggers a re-review of the vendor security questionnaire. <strong>We need yours completed (or substantially updated) by May 30</strong> to keep the renewal on track for our fiscal close.",
          ),
          sectionTitle("What we need"),
          bullet("<strong>Updated SOC 2 Type II report</strong> · we'll accept the one you sent us last year as evidence, but want the current one if available."),
          bullet("<strong>Vendor security questionnaire</strong> · 84 questions, full PDF attached. Estimated 90 minutes if you have your security policies on hand."),
          bullet("<strong>Most recent pentest summary</strong> · scope + findings only, not the full report. Anonymized fine."),
          bullet("<strong>Subprocessor list</strong> · most vendors update this quarterly anyway."),
          bullet("<strong>BC/DR documentation</strong> · we just need attestation, not the full plan."),
          sectionTitle("Shortcut if you have SOC 2 Type II"),
          infoCard(
            `If you have a current SOC 2 Type II report (your audit period would be relatively recent), our internal questionnaire can be auto-mapped against it. We've done this for ~60% of our vendors and it saves everyone time. Just forward the report and we'll attach it to your file.`,
            { tone: "info" },
          ),
          sectionTitle("Timeline"),
          bullet("By May 30 · all artifacts in"),
          bullet("June 2-9 · our security team reviews (typical 5-7 days)"),
          bullet("June 10 · approval issued · renewal can proceed"),
          bullet("Without artifacts by May 30 — our procurement team can't sign off and the renewal slips into June"),
          p(
            "Apologies for the formality — Brightlane's compliance team has tightened the renewal process this year. You're in great standing with us; this is procedural, not adversarial.",
          ),
          hr(),
          signature("Marcus Reeves", "Procurement · Brightlane", "procurement@brightlane.io"),
        ]),
        summary: "Customer procurement security form due May 30. Action: forward SOC 2 or fill form.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-145",
        subject: "Onboarding success - Northglade",
        senderName: "Aria Singh",
        senderEmail: "aria@vectormail.app",
        daysAgo: 6,
        snippet: "Carter and team fully onboarded. 100% activation in 3 days.",
        body: email([
          p("Hi,"),
          p(
            "Quick win to share before the day ends — <strong>Northglade is fully onboarded.</strong> 100% activation across 6 seats in 3 days, which is our second-fastest onboarding on record (Brightlane was 2 days, but they had a dedicated internal champion). Carter Liu (their founder) sent me an unsolicited note this afternoon — quoted below.",
          ),
          sectionTitle("Activation metrics"),
          metricGrid([
            { label: "Time to 100% activation", value: "3 days", sub: "target 14" },
            { label: "Seats active", value: "6 of 6" },
            { label: "Threads synced", value: "184K", sub: "across team" },
            { label: "Briefs opened day 1", value: "100% of users" },
            { label: "Buddy usage", value: "5 of 6 users have used it" },
            { label: "Sentiment", value: "Strongly positive" },
          ]),
          sectionTitle("Carter's note (excerpted with permission)"),
          infoCard(
            `<em>"We're 3 days in and the team is already wondering how they survived without it. Two of my engineers told me unprompted that the briefs are 'the most useful AI feature they've ever paid for.' I'm not going to gush, but consider me a vocal evangelist whenever you need one — reference calls, podcast features, customer story, all available. We're glad we switched."</em><br/><br/><span style="color: #5f6368; font-size: 13px;">— Carter Liu · Founder, Northglade · sent yesterday at 4:42 PM PT</span>`,
            { tone: "ok" },
          ),
          sectionTitle("What we did differently"),
          bullet("Pre-onboarding workshop with the team (45 min) — walked them through the 3 features that matter most for week-1 usage."),
          bullet("Dedicated Slack Connect channel from day 1 — they ask questions there instead of filing tickets."),
          bullet("Set Buddy expectations correctly upfront ('it will make mistakes, here's how to give it feedback' beats 'it's magic and never wrong')."),
          sectionTitle("What I'd propose next"),
          bullet("Add Carter to the customer-advisory list (he's offered)."),
          bullet("Bring him on the next podcast episode if your interest is there."),
          bullet("Feature Northglade as the 'fast onboarding' case study in next month's marketing."),
          hr(),
          signature("Aria Singh", "Customer Success Lead · VectorMail", "aria@vectormail.app"),
        ]),
        summary: "New customer fully activated. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-146",
        subject: "Re: Speaker confirmation - SaaStr",
        senderName: "SaaStr Programs",
        senderEmail: "programs@saastr.com",
        daysAgo: 2,
        snippet: "Great - confirming you for the AI-native track at SaaStr Annual.",
        body: email([
          p("Hi,"),
          p(
            "Great news — confirming you for <strong>SaaStr Annual 2026</strong> on the AI-Native track. Welcome to the lineup. Your slot, format, and what we need from you in the next 30 days are below.",
          ),
          sectionTitle("Your confirmed slot"),
          keyValBlock([
            { label: "Format", value: "Solo talk · 25 minutes · 5 min Q&A" },
            { label: "Track", value: "AI-Native" },
            { label: "Date", value: "Tuesday, September 15, 2026" },
            { label: "Time", value: "2:30 PM – 3:00 PM PT" },
            { label: "Room", value: "Pavilion 2 (1,400 capacity)" },
            { label: "Recording", value: "Yes · livestream + post-event YouTube" },
            { label: "Estimated audience", value: "~1,100 in-person + ~3,800 livestream" },
          ]),
          sectionTitle("Speaker packet · what we need by July 1"),
          bullet("<strong>Talk abstract</strong> · 150-word version + 50-word version for our app. Send both."),
          bullet("<strong>Bio</strong> · 80-word professional bio + 30-word 'short version' for slides."),
          bullet("<strong>Photo</strong> · 1500×1500 minimum, professional headshot (or your best LinkedIn)."),
          bullet("<strong>Slide template</strong> · we provide a 16:9 SaaStr-branded deck. Use whatever you want creatively but keep the SaaStr title slide + closing slide."),
          bullet("<strong>Logistics form</strong> · arrival, hotel preference, dietary, any accommodations."),
          sectionTitle("On-site logistics"),
          bullet("Travel: business-class flight from your home city, fully covered (we book through our travel desk)."),
          bullet("Hotel: Marriott San Mateo, 3 nights (Sept 13-15). Block code is 'SAASTR2026SPK'."),
          bullet("A/V tech check: Sunday Sept 13, 3 PM. Required."),
          bullet("Speaker dinner: Sunday Sept 13, 7 PM. Optional but encouraged — most speakers attend."),
          bullet("Green room access throughout the conference + VIP lounge."),
          sectionTitle("Honorarium"),
          bullet("<strong>$2,500 USD</strong> · paid via wire within 14 days of the talk being delivered."),
          bullet("Need a signed W-9 by August 15 to ensure timely payment. Form attached."),
          ctaRow([
            ctaButton("Download speaker packet", { color: "#0a2540" }),
            ctaButton("Submit bio + abstract", { color: "#0a2540", variant: "outline" }),
            ctaButton("Logistics form", { color: "#0a2540", variant: "outline" }),
          ]),
          fineprint("Excited to have you. Reply to this email with any questions and our speaker liaison (Justin) will respond within 24 hours."),
          hr(),
          signature("SaaStr Programs", "Speaker booking · SaaStr Annual 2026", "programs@saastr.com"),
        ]),
        summary: "SaaStr speaker confirmed. Action: send bio/abstract by July 1.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-147",
        subject: "Recurring: Daily standup",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 0,
        hour: 9,
        snippet: "Daily standup at 10 AM PT.",
        body: email([
          brandBlock("Calendar"),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "18", weekday: "Mon" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">Engineering Standup · daily</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">10:00 AM – 10:15 AM PT · 15 min</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Recurring · weekdays · Zoom</div></td></tr></table>`,
          p(
            "Reminder for today's engineering standup. Daily blocked time for the engineering team — 15 minutes, async update via the bot first, then 5-7 minutes of synchronous discussion on the one or two things that need it.",
          ),
          sectionTitle("Format"),
          bullet("Pre-standup: drop your update in <code>#eng-standup</code> bot thread by 9:45 AM."),
          bullet("9:55-10:00 PT: Eng-standup bot publishes the digest in <code>#eng-all</code>."),
          bullet("10:00-10:15 PT: live discussion of anything that needs sync, not just a re-read of the digest."),
          sectionTitle("Where"),
          keyValBlock([
            { label: "Video", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">meet.zoom.us/j/812-44-901</a>` },
            { label: "Slack channel", value: "#eng-standup (for async input)" },
            { label: "Dial-in", value: "+1 (669) 900-6833 · ID 812 44 901 · PIN 9821" },
          ]),
          sectionTitle("This morning's open items (from the bot)"),
          bullet("Marcus shipping pgvector cutover Wednesday — flag any concerns today."),
          bullet("Two PRs need review by EOD (Marcus #412, Nathan #418)."),
          bullet("Aria + Marcus on DataPipe call at 10 AM (right after standup)."),
          ctaRow([
            ctaButton("Join Zoom", { color: "#1a73e8" }),
            ctaButton("Drop async update", { color: "#1a73e8", variant: "outline" }),
          ]),
          fineprint("Recurring daily on weekdays. Cancellation = use the recurring-event override in Calendar. If you'll be late, drop in #eng-standup so people aren't waiting."),
          companyEmailFooter("Calendar"),
        ]),
        summary: "Recurring standup. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-148",
        subject: "Stripe - Failed payment alert",
        senderName: "Stripe",
        senderEmail: "alerts@stripe.com",
        daysAgo: 2,
        snippet: "1 customer payment failed. Auto-retry scheduled for tomorrow.",
        body: email([
          brandBlock("Stripe"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Payment · Action recommended</span></div>`,
          headline("Charge to Code for Good failed — auto-retry scheduled"),
          p(
            "An invoice for one of your subscribers couldn't be collected. Stripe Billing will automatically retry the charge over the next 7 days. Most insufficient-funds failures recover on the second attempt.",
          ),
          bigStat("Amount", "$588.00 USD"),
          keyValBlock([
            { label: "Customer", value: "Felix Romero · codeforgood.org" },
            { label: "Invoice", value: "INV-22841 (May)" },
            { label: "Charge attempt", value: "1 of 4" },
            { label: "Decline code", value: "insufficient_funds" },
            { label: "Card", value: "Visa •• 4242 · exp 08/27" },
            { label: "Next retry", value: "Tomorrow, May 18 · 8:00 AM PT" },
          ]),
          sectionTitle("Smart Retries timeline"),
          logRow("May 17", "First attempt — declined (insufficient_funds)", { tone: "danger" }),
          logRow("May 18", "Retry #2 — scheduled", { tone: "info" }),
          logRow("May 20", "Retry #3 — if still failing", { tone: "info" }),
          logRow("May 23", "Retry #4 — final attempt", { tone: "info" }),
          logRow("May 24", "Subscription paused if all retries fail", { tone: "warn" }),
          sectionTitle("Communications already sent"),
          bullet("Smart Retry email to felix@codeforgood.org (default template)"),
          bullet("In-app banner on the customer's billing page"),
          sectionTitle("What you can do"),
          p(
            "Nothing required — Smart Retries handle most failures automatically. If you want to reach out personally, this is a non-profit customer running on a tight cycle; a brief note often helps recovery rates here.",
          ),
          ctaRow([
            ctaButton("View invoice", { color: "#635bff" }),
            ctaButton("Email the customer", { color: "#635bff", variant: "outline" }),
          ]),
          fineprint(
            "If the charge succeeds before May 24, the subscription stays active and no further action is needed. After May 24 it pauses and is restored on next successful charge.",
          ),
          companyEmailFooter("Stripe"),
        ]),
        summary: "Stripe failed payment. No action - auto-retrying.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-149",
        subject: "OpenAI - Usage threshold alert",
        senderName: "OpenAI",
        senderEmail: "no-reply@openai.com",
        daysAgo: 1,
        hour: 11,
        snippet: "You've reached 75% of your monthly usage limit.",
        body: email([
          brandBlock("OpenAI"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Usage alert · 75%</span></div>`,
          headline("You've used 75% of your monthly soft limit"),
          p(
            "Your OpenAI organization <strong>VectorMail Eng</strong> has crossed its soft usage limit threshold for the current billing period. Once the soft limit is hit, you'll continue to be served, but we'll send you another alert at 100%. Your <em>hard</em> limit ($4,000) is the point where requests will start to be rejected.",
          ),
          metricGrid([
            { label: "Used so far", value: "$2,250", sub: "75% of soft limit" },
            { label: "Soft limit", value: "$3,000" },
            { label: "Hard limit", value: "$4,000" },
            { label: "Days left", value: "11", sub: "in May" },
            { label: "Avg per day", value: "$112.50" },
            { label: "Projected total", value: "$3,488", sub: "+$488 over soft" },
          ]),
          sectionTitle("Top models consumed"),
          keyValBlock([
            { label: "gpt-4o-mini", value: "$1,210 · 54%" },
            { label: "text-embedding-3-large", value: "$640 · 28%" },
            { label: "gpt-4.1", value: "$310 · 14%" },
            { label: "whisper-large-v3", value: "$90 · 4%" },
          ]),
          sectionTitle("Why this might be happening"),
          infoCard(
            "Production embedding volume tripled this week after the search index rollout. If that's intentional, raise the soft limit to $4,000 to silence this alert. If it isn't, consider switching the embedding worker to <code>text-embedding-3-small</code> (≈80% cheaper, similar recall on your eval set).",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("Raise usage limits", { color: "#10a37f" }),
            ctaButton("View usage by API key", { color: "#10a37f", variant: "outline" }),
          ]),
          fineprint("Org: VectorMail Eng · Billing email: finance@vectormail.app · Cycle: May 1 – May 31"),
          companyEmailFooter("OpenAI"),
        ]),
        summary: "OpenAI usage alert. Action: monitor or raise limit.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-150",
        subject: "Anthropic - New model available",
        senderName: "Anthropic",
        senderEmail: "noreply@anthropic.com",
        daysAgo: 4,
        snippet: "Claude 4.7 is now generally available via the API.",
        body: email([
          brandBlock("Anthropic"),
          headline("Claude 4.7 is now generally available"),
          p(
            "Today we're announcing Claude 4.7 in two sizes — <strong>Opus 4.7</strong> and <strong>Sonnet 4.7</strong> — generally available via the API. Both are drop-in upgrades; no code changes needed. We've spent the last 6 months focused on three things: long-context retrieval quality, agentic tool-use, and latency.",
          ),
          metricGrid([
            { label: "Context window", value: "1M tokens", sub: "from 200K" },
            { label: "Tool-use accuracy", value: "+12 pp", sub: "on internal eval" },
            { label: "p50 latency (Sonnet)", value: "−28%", sub: "vs 4.6" },
            { label: "p99 latency (Sonnet)", value: "−18%" },
            { label: "Input price", value: "Same as 4.6", sub: "no change" },
            { label: "Output price", value: "Same as 4.6", sub: "no change" },
          ]),
          sectionTitle("What's new"),
          bullet(`<strong>1M-token context window</strong> for both Opus and Sonnet. Retrieval quality at full context is meaningfully better than 4.6's 200K (see the long-context retrieval benchmarks in the model card).`),
          bullet(`<strong>Improved tool use.</strong> Multi-step agentic workflows are noticeably more reliable — fewer 'forgot to call the tool' failures and better recovery when tools return unexpected outputs.`),
          bullet(`<strong>Lower latency.</strong> Sonnet 4.7 is significantly faster at the same quality. Opus 4.7 maintains 4.6's latency profile while improving quality.`),
          bullet(`<strong>Same pricing, same API surface.</strong> No migration cost — just change the model string.`),
          sectionTitle("Migration"),
          codeBlock(
            `<span style="color: #8b949e;"># Before</span><br/>model=<span style="color: #a5d6ff;">"claude-sonnet-4-6"</span><br/><br/><span style="color: #8b949e;"># After</span><br/>model=<span style="color: #a5d6ff;">"claude-sonnet-4-7"</span>`,
          ),
          ctaRow([
            ctaButton("Read the announcement", { color: "#cb785c" }),
            ctaButton("View model card", { color: "#cb785c", variant: "outline" }),
            ctaButton("Migration guide", { color: "#cb785c", variant: "outline" }),
          ]),
          fineprint(
            "Claude 4.6 will remain available until December 2026. We recommend evaluating 4.7 on your production traffic over the next 30 days; the improvements should be visible in your eval set immediately.",
          ),
          companyEmailFooter("Anthropic"),
        ]),
        summary: "New Claude model. No immediate action - evaluate for upgrade.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-151",
        subject: "Google - Storage running low",
        senderName: "Google",
        senderEmail: "no-reply@google.com",
        daysAgo: 6,
        snippet: "Your Google account is at 92% of storage.",
        body: email([
          brandBlock("Google"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Storage · 92% full</span></div>`,
          headline("Your Google account is almost out of storage"),
          p(
            `Hi,<br/><br/>Your <strong>Google account</strong> (demo@vectormail.app) is now at <strong>92%</strong> of your 100 GB storage plan. Once you reach 100%, you'll lose the ability to send/receive emails, upload Drive files, and back up photos until you free up space or upgrade.`,
          ),
          bigStat("Storage used", "92.4 GB of 100 GB"),
          sectionTitle("Where it's going"),
          keyValBlock([
            { label: "Gmail", value: "47.2 GB · large attachments + 4 years of email" },
            { label: "Drive", value: "32.8 GB · primarily docs + shared folders" },
            { label: "Photos", value: "11.6 GB · backups from your phone" },
            { label: "Other (Workspace)", value: "0.8 GB" },
          ]),
          sectionTitle("Three options"),
          bullet(
            "<strong>Upgrade to 2 TB</strong> ($9.99/mo) — Google One Premium. Adds storage, family sharing, VPN, advanced photo editing.",
          ),
          bullet(
            "<strong>Clean up Gmail</strong> — Search for 'has:attachment larger:25M' in Gmail to find the biggest space-hoggers. Easily clears 5-10 GB.",
          ),
          bullet(
            "<strong>Move to Workspace</strong> — If you're at this account for VectorMail, you should be on Workspace Business Standard ($14.40/user/mo), not personal. 2 TB per user + admin controls.",
          ),
          ctaRow([
            ctaButton("Upgrade Google One", { color: "#1a73e8" }),
            ctaButton("Free up space", { color: "#1a73e8", variant: "outline" }),
            ctaButton("Manage subscriptions", { color: "#1a73e8", variant: "outline" }),
          ]),
          fineprint("If you hit 100%, you have 14 days to upgrade or clean up before mail delivery is suspended. After 2 years over the limit, content is removed by Google."),
          companyEmailFooter("Google"),
        ]),
        summary: "Storage almost full. Action: upgrade or clean up.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-152",
        subject: "Re: VectorMail Pro - team upgrade",
        senderName: "Jordan Kim",
        senderEmail: "jordan@startup.io",
        daysAgo: 1,
        hour: 13,
        snippet: "Pushing for full team rollout. Need a Team plan quote for 22 seats.",
        body: email([
          p("Hi,"),
          p(
            "Closing the loop on what's been a quiet 6 weeks of internal evaluation. <strong>I demoed VectorMail to the team yesterday — strong reception across the board.</strong> Two engineers wanted to start using it before I'd even finished my walkthrough. The data team had questions that I think your team would actually love answering. PMs are sold.",
          ),
          p(
            "I'd like to move forward with a <strong>Team plan rollout for 22 seats</strong>. Annual is fine; we have the budget set aside for the rest of fiscal year already. A few specific asks below."
          ),
          sectionTitle("What we want"),
          keyValBlock([
            { label: "Plan", value: "Team (annual)" },
            { label: "Seats", value: "22 (might grow to 30 in Q3 if hiring goes per plan)" },
            { label: "Start date", value: "Tuesday, May 26, 2026" },
            { label: "Term", value: "12 months, prepaid" },
            { label: "Payment", value: "ACH preferred · Net-30 (annual prepay)" },
            { label: "Volume discount", value: "Whatever your standard for 20+ is" },
          ]),
          sectionTitle("Three asks alongside the contract"),
          bullet("<strong>API access addendum.</strong> We want programmatic access for our internal integrations. Do you have a standard API addendum we can sign at the same time as the MSA, or is that a separate negotiation?"),
          bullet("<strong>Pricing lock</strong> for the first 12 months — no mid-year increases."),
          bullet("<strong>Account-management contact</strong> — we'd appreciate Aria specifically as our primary contact post-signing if she's available."),
          sectionTitle("Timeline I'm targeting"),
          p(
            "Quote to me by Tuesday; legal review on our side by Friday; signature next week; rollout starts May 26 with onboarding sessions for the team Tuesday-Thursday. If your team can match that, we're good. If not, just let me know what you need on your side and we'll adjust.",
          ),
          p("Excited to make this real. Talk soon."),
          hr(),
          signature("Jordan Kim", "Head of Product · startup.io", "jordan@startup.io"),
        ]),
        summary: "Customer expanding to 22 seats. Action: send Team plan quote + API addendum.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-153",
        subject: "Substack - Comment on your post",
        senderName: "Substack",
        senderEmail: "no-reply@substack.com",
        daysAgo: 4,
        snippet: "A reader commented on your post 'Why we built VectorMail'.",
        body: email([
          brandBlock("Substack"),
          headline("New comment on your post 'Why we built VectorMail'"),
          p(
            "A new reader left a comment on your post <strong>'Why we built VectorMail'</strong>. Comments on your posts are getting picked up — this is the 14th comment this week, and they're driving meaningful traffic from the public feed.",
          ),
          profileCard({
            name: "Andre Pérez",
            title: "Founder · early-stage SaaS",
            company: "@andre_builds · 2,100 followers",
            initials: "AP",
            accent: "#ff6719",
            rightLabel: "Reader",
          }),
          sectionTitle("The comment"),
          infoCard(
            `<em>"This is exactly what I've been wanting. Following along. Three questions I'd love to see addressed in a future post: (1) How do you think about the moat against Microsoft Copilot? (2) Where's the line between 'AI agent' and 'AI feature'? (3) Have you thought about what makes a 1-person customer different from a 50-person customer? Keep building."</em><br/><br/><span style="color: #5f6368; font-size: 13px;">— Andre Pérez · posted 14 minutes ago</span>`,
            { accent: "#ff6719" },
          ),
          sectionTitle("Engagement on this post"),
          metricGrid([
            { label: "Views", value: "8,420", sub: "+1,240 this week" },
            { label: "Subscribers", value: "+47", sub: "from this post" },
            { label: "Reactions", value: "412" },
            { label: "Comments", value: "38" },
            { label: "Reposts", value: "22" },
            { label: "Top referrer", value: "Hacker News" },
          ]),
          ctaRow([
            ctaButton("Reply to Andre", { color: "#ff6719" }),
            ctaButton("View all comments", { color: "#ff6719", variant: "outline" }),
          ]),
          fineprint("Substack · 'VectorMail Founder Thoughts' · 2,200 subscribers · responses to comments boost engagement materially"),
          companyEmailFooter("Substack"),
        ]),
        summary: "Substack comment. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-154",
        subject: "Re: speaking honorarium",
        senderName: "SaaStr Programs",
        senderEmail: "programs@saastr.com",
        daysAgo: 6,
        snippet: "Standard speaker honorarium is $2,500. Wire instructions inside.",
        body: email([
          p("Hi,"),
          p(
            "Following up on the SaaStr speaker logistics with the honorarium details. As confirmed: <strong>$2,500 USD speaker honorarium</strong>, paid via wire within 14 days of your delivered talk on September 15.",
          ),
          sectionTitle("Honorarium details"),
          keyValBlock([
            { label: "Amount", value: "$2,500 USD" },
            { label: "Payment timing", value: "Within 14 days of talk delivery (target by Sept 30)" },
            { label: "Payment method", value: "ACH (preferred) or wire" },
            { label: "Requires", value: "Signed W-9, due by July 1" },
            { label: "If W-9 late", value: "We can still pay, but processing delays push to October" },
            { label: "1099 issued", value: "January 2027 for tax year 2026" },
          ]),
          sectionTitle("Travel reimbursement (separate from honorarium)"),
          bullet("Business-class flight from your home city · we book through our travel desk"),
          bullet("3 nights at the Marriott San Mateo speaker block · we book"),
          bullet("Ground transportation reimbursed up to $500"),
          bullet("Meals during conference covered (catered for speakers)"),
          sectionTitle("Forms attached"),
          bullet("<strong>W-9</strong> · signed copy needed by July 1"),
          bullet("<strong>Wire instructions form</strong> · ACH or wire details"),
          bullet("<strong>Travel preferences</strong> · airline + hotel preferences"),
          ctaRow([
            ctaButton("Sign W-9 via DocuSign", { color: "#0a2540" }),
            ctaButton("Submit wire info", { color: "#0a2540", variant: "outline" }),
          ]),
          fineprint("If you're outside the US, we issue a 1042-S instead of a 1099 and may need additional withholding documentation. Reply if so."),
          hr(),
          signature("Justin Park", "Speaker Operations · SaaStr Annual 2026", "programs@saastr.com"),
        ]),
        summary: "Speaker honorarium $2,500. Action: send W-9 by July 1.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-155",
        subject: "Slack invite - investor community",
        senderName: "Backstage Capital",
        senderEmail: "community@backstagecapital.com",
        daysAgo: 7,
        snippet: "Invite to join Backstage's founder Slack community.",
        body: email([
          p("Hi,"),
          p(
            "As a founder adjacent to our portfolio (one of our partners knows yours and we've been quietly cheering you on), you've been invited to join <strong>Backstage's founder Slack community</strong>. This is a private community of 600+ founders across our portfolio and our extended network — heavily focused on Black and underrepresented founders building venture-scale companies.",
          ),
          sectionTitle("What's in it"),
          bullet("<strong>600+ founders</strong> · pre-seed through Series C · spanning consumer, B2B, fintech, AI, biotech"),
          bullet("<strong>Weekly office hours</strong> · with our partners, plus rotating guests (recent: Marisol Choi at Lattice, Ben Foulkes at Levels, Jasmine Park at NextRoom)"),
          bullet("<strong>Quarterly retreats</strong> · 2-day off-sites, ~80 founders, intentionally small"),
          bullet("<strong>Founder-to-founder lending</strong> · genuinely helpful resource for warm intros, customer feedback, and lessons learned"),
          bullet("<strong>Hiring help</strong> · our community has produced 4 hires for active members in the last quarter"),
          sectionTitle("How it works"),
          bullet("100% free, no equity, no obligations"),
          bullet("Lightly moderated · no recruiters, no aggressive self-promo"),
          bullet("Slack workspace, single global view, regional channels for SF/NYC/ATX/Remote"),
          bullet("Quarterly survey on community health (last quarter: 78% would recommend)"),
          sectionTitle("Time commitment"),
          p(
            "Real talk: zero pressure. Most members lurk for the first month and then find one or two channels that genuinely add value. Some use it daily for customer reference checks; some pop in monthly for office hours. Lurk-mode is welcomed.",
          ),
          ctaRow([
            ctaButton("Accept invitation", { color: "#1a1a1a" }),
            ctaButton("Learn more first", { color: "#1a1a1a", variant: "outline" }),
          ]),
          fineprint("Invitation expires in 14 days. If you're not the right person on your team, please forward (one founder per company)."),
          hr(),
          signature("Backstage Capital", "Community team", "community@backstagecapital.com"),
        ]),
        summary: "Community Slack invite. Optional - join if useful.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-156",
        subject: "Mailgun - Sender reputation alert",
        senderName: "Mailgun",
        senderEmail: "alerts@mailgun.net",
        daysAgo: 2,
        snippet: "Your sender reputation dropped to 92 (from 98) this week.",
        body: email([
          brandBlock("Mailgun"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Sender reputation · Trending down</span></div>`,
          headline("Your sender reputation dropped 6 points this week"),
          p(
            "We monitor sender reputation across the major mailbox providers (Gmail, Outlook, Yahoo, AOL) and consolidate it into a single 0-100 score. Yours just dropped from <strong>98 → 92</strong> over the past 7 days. The biggest driver was a high bounce rate on your last product email send.",
          ),
          metricGrid([
            { label: "Score this week", value: "92", sub: "from 98" },
            { label: "Bounce rate", value: "4.2%", sub: "target ≤ 2%" },
            { label: "Complaint rate", value: "0.03%", sub: "target ≤ 0.1%" },
            { label: "Unsubscribe rate", value: "0.8%", sub: "healthy" },
            { label: "Open rate", value: "31.4%", sub: "healthy" },
            { label: "Sends this week", value: "18,420" },
          ]),
          sectionTitle("What caused the drop"),
          infoCard(
            `<strong>Campaign: "May product update"</strong> on May 14 (12,840 recipients) saw a <strong>5.8% bounce rate</strong>, well above the threshold. Of those bounces:<br/>• <strong>62% hard bounces</strong> — invalid mailboxes (likely stale list segments)<br/>• <strong>31% soft bounces</strong> — full mailboxes / temp issues<br/>• <strong>7%</strong> — DMARC / SPF rejection from a small ESP cluster`,
            { tone: "warn" },
          ),
          sectionTitle("Recommended cleanup before next send"),
          bullet("Suppress addresses that have hard-bounced 2+ times in the last 90 days (~640 records)."),
          bullet("Run the next list through Mailgun Validate before send — catches ~85% of invalid mailboxes pre-send."),
          bullet("Re-confirm consent on the ~2,200 recipients who haven't engaged in 6+ months."),
          bullet("If your next send is transactional, route it via the <code>transactional</code> domain instead of <code>marketing</code> to insulate that reputation."),
          sectionTitle("Risk if you don't"),
          p(
            "Bounce rate above 5% for two consecutive sends often triggers spam-folder placement on Gmail's algorithmic side, which is hard to recover from once it happens. Cleaning the list now is much cheaper than warming back up.",
          ),
          ctaRow([
            ctaButton("Validate list", { color: "#c02c2c" }),
            ctaButton("Open reputation dashboard", { color: "#c02c2c", variant: "outline" }),
          ]),
          fineprint(
            "Domain: send.vectormail.app · IP pool: shared-pro-na-east-1 · Plan: Growth · Reputation history: 95 → 97 → 98 → 92",
          ),
          companyEmailFooter("Mailgun"),
        ]),
        summary: "Mailgun: sender rep alert. Action: clean list before next send.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-157",
        subject: "Sentry - New issue assigned",
        senderName: "Sentry",
        senderEmail: "noreply@sentry.io",
        daysAgo: 1,
        hour: 17,
        snippet: "New unhandled error in /api/inbox - 14 events, 8 users.",
        body: email([
          brandBlock("Sentry"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">New issue · Assigned to you</span></div>`,
          headline("TypeError in /api/inbox — 14 events, 8 users in the last hour"),
          p(
            "Marcus auto-assigned this to you 47 minutes ago after the issue rate breached the alert threshold (10 events / 30 min). It's a regression introduced in the most recent embeddings deploy, and is currently blocking 8 users from loading their inbox.",
          ),
          codeBlock(
            `<span style="color: #ff7b72;">TypeError</span>: Cannot read properties of undefined (reading <span style="color: #a5d6ff;">'sysLabels'</span>)<br/>&nbsp;&nbsp;at <span style="color: #79c0ff;">filterByLabel</span> (src/server/api/routers/account-procedures/email-reading.ts:142)<br/>&nbsp;&nbsp;at <span style="color: #79c0ff;">getInbox</span> (src/server/api/routers/account-procedures/email-reading.ts:88)<br/>&nbsp;&nbsp;at <span style="color: #79c0ff;">resolver</span> (node_modules/@trpc/server/dist/index.js:288)`,
          ),
          metricGrid([
            { label: "Project", value: "vectormail-ai" },
            { label: "Environment", value: "production" },
            { label: "Events (1h)", value: "14" },
            { label: "Users affected", value: "8" },
            { label: "First seen", value: "2h ago", sub: "after deploy #2241" },
            { label: "Severity", value: "Medium", sub: "blocking 8 users" },
          ]),
          sectionTitle("Suspect commits"),
          keyValBlock([
            { label: "Commit a4f2e91", value: `marcus · feat(search): parallel embedding fetch` },
            { label: "Commit 9d3b7c2", value: `elena · refactor: account-scoped email reading` },
            { label: "Release", value: "v2.41.2 · deployed 2h ago" },
          ]),
          sectionTitle("Affected users (sample)"),
          bullet("dana@vectormail.app · 3 events"),
          bullet("user-2841@gmail.com · 2 events"),
          bullet("user-9012@compass.capital · 2 events"),
          bullet("+5 more"),
          sectionTitle("Suggested fix"),
          infoCard(
            "The query path no longer guarantees <code>sysLabels</code> on the email object — it's filtered out in one of the new join branches. Add a null-safe access or filter upstream in <code>filterByLabel()</code> at line 142.",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("Open in Sentry", { color: "#7553ff" }),
            ctaButton("Assign to someone else", { color: "#7553ff", variant: "outline" }),
            ctaButton("Snooze 24h", { color: "#7553ff", variant: "outline" }),
          ]),
          fineprint("Issue ID: VMAI-184 · Alert rule: high-frequency-new-issue · Assignee: you (auto)"),
          companyEmailFooter("Sentry"),
        ]),
        summary: "Sentry issue assigned. Action: triage today.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-158",
        subject: "PagerDuty - Incident acknowledged",
        senderName: "PagerDuty",
        senderEmail: "noreply@pagerduty.com",
        daysAgo: 3,
        snippet: "Marcus acknowledged incident #142 (API 5xx spike).",
        body: email([
          brandBlock("PagerDuty"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Incident #142 · Acknowledged</span></div>`,
          headline("Marcus Liu acknowledged incident #142 — API 5xx spike"),
          p(
            `<strong>Marcus Liu</strong> acknowledged the incident at 11:42 PM PT (3 minutes after the page fired) and is actively investigating. As primary on-call, you can see live updates in the incident channel. Auto-escalation paused.`,
          ),
          profileCard({
            name: "Marcus Liu",
            title: "CTO · Primary on-call",
            company: "Acknowledged at 11:42 PM PT · 3 min response time",
            initials: "ML",
            accent: "#06ac38",
            rightLabel: "Active",
          }),
          keyValBlock([
            { label: "Incident", value: "#142 · vectormail-prod" },
            { label: "Service", value: "vectormail-api" },
            { label: "Title", value: "API 5xx error rate spike (>2% for 5 min)" },
            { label: "Severity", value: "SEV-3 · degraded service" },
            { label: "Fired at", value: "May 14, 2026 · 11:39 PM PT" },
            { label: "Acknowledged at", value: "11:42 PM PT · within SLA" },
            { label: "Response time", value: "3 min · target ≤ 5 min" },
            { label: "Pager source", value: "Datadog → PagerDuty integration" },
          ]),
          sectionTitle("Auto-escalation"),
          bullet("✅ Auto-escalation paused (Marcus acknowledged within SLA)"),
          bullet("If not resolved by 12:42 AM (60 min), auto-escalates to secondary on-call (you)"),
          bullet("If still not resolved by 1:42 AM, auto-escalates to Dana (eng lead)"),
          sectionTitle("Current status (last 2 min)"),
          infoCard(
            "Marcus posted in #incident-142: 'Looks like our embedding worker hit a rate limit on OpenRouter side. Working on a fix — should be 10 min. No customer-facing impact yet, all retries succeeding within budget.'",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("View incident", { color: "#06ac38" }),
            ctaButton("Join #incident-142", { color: "#06ac38", variant: "outline" }),
          ]),
          fineprint("PagerDuty schedule: vectormail-prod · Marcus is primary · You are secondary · Dana is eng-lead. SLAs and on-call rotations can be edited in PagerDuty settings."),
          companyEmailFooter("PagerDuty"),
        ]),
        summary: "PagerDuty incident ack. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-159",
        subject: "Calendly - New booking",
        senderName: "Calendly",
        senderEmail: "no-reply@calendly.com",
        daysAgo: 2,
        snippet: "Sasha Hill booked a 30-min slot for May 22, 11 AM.",
        body: email([
          brandBlock("Calendly"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #006bff; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">New booking · 30-min intro</span></div>`,
          headline("Sasha Hill booked your '30-min intro' slot"),
          p(
            `<strong>Sasha Hill</strong> just booked a slot through your Calendly. This is a follow-up from Jamal's intro from yesterday — Sasha clearly moved fast.`,
          ),
          profileCard({
            name: "Sasha Hill",
            title: "Staff PM · Anthropic (leaving)",
            company: "ex-Stripe (Connect) · early-Brex · MIT CS",
            initials: "SH",
            accent: "#006bff",
            rightLabel: "Candidate",
          }),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "22", weekday: "Thu", accent: "#006bff" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 17px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">30-min intro · with Sasha Hill</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">11:00 AM – 11:30 AM PT · 30 min</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Zoom · auto-generated link</div></td></tr></table>`,
          sectionTitle("Sasha's intake form answers"),
          keyValBlock([
            { label: "What is this about?", value: "Following up on Jamal's intro — interested in learning about VectorMail and where you might be hiring." },
            { label: "Why now?", value: "Leaving Anthropic in 2 weeks, exploring opportunities in AI-native product roles." },
            { label: "What I'd like to discuss", value: "Product surface + scope, the customer base, where the team is biggest gap in product capacity." },
            { label: "Time preference", value: "Mornings work best for me — I'm a slow afternoon thinker." },
          ]),
          sectionTitle("Suggested prep"),
          bullet("Look at her Anthropic API platform work — most of it is publicly traceable through their docs and announcements."),
          bullet("Read Jamal's intro email again (you have it in your inbox) for his framing."),
          bullet("Have a clear answer to 'where would I sit in your product org' — she'll ask within 5 min."),
          ctaRow([
            ctaButton("View on calendar", { color: "#006bff" }),
            ctaButton("Reschedule", { color: "#006bff", variant: "outline" }),
            ctaButton("Cancel", { color: "#006bff", variant: "outline" }),
          ]),
          fineprint("Booking flow: 30-min intro · auto-confirmed · Zoom link sent to both sides. Reminders auto-fire 1 day before + 1 hour before."),
          companyEmailFooter("Calendly"),
        ]),
        summary: "Calendly booking with Sasha (PM candidate). No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-160",
        subject: "Stripe - Dispute filed",
        senderName: "Stripe",
        senderEmail: "alerts@stripe.com",
        daysAgo: 4,
        snippet: "A customer filed a dispute for $99. Respond by May 25.",
        body: email([
          brandBlock("Stripe"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Dispute · Response due May 25</span></div>`,
          headline("Customer filed a dispute on a $99 charge"),
          p(
            "A cardholder has disputed a payment on their card via their card issuer. The funds and a $15 dispute fee have been withheld from your balance pending the outcome. You have until <strong>May 25, 2026</strong> (UTC) to submit evidence — after that the dispute is decided automatically based on what we already have.",
          ),
          bigStat("Amount in dispute", "$99.00 + $15.00 fee"),
          keyValBlock([
            { label: "Reason", value: "product_not_received" },
            { label: "Card", value: "Mastercard •• 5841 · issuer Chase" },
            { label: "Customer", value: "anon-customer-9012" },
            { label: "Subscription", value: "VectorMail Pro (annual)" },
            { label: "Charge date", value: "Mar 24, 2026 · 61 days ago" },
            { label: "Dispute filed", value: "May 14, 2026" },
            { label: "Evidence due", value: "Sunday, May 25, 2026 · 11:59 PM UTC" },
            { label: "Dispute ID", value: "dp_1Pc9aE2eZvKYlo2C" },
          ]),
          sectionTitle("Evidence Stripe recommends submitting"),
          bullet("Receipt for the charge (Stripe can attach this automatically)."),
          bullet("Proof the customer accessed VectorMail (login timestamps, feature usage logs)."),
          bullet("Communication with the customer (any support emails or in-app messages)."),
          bullet("Refund / cancellation policy and a screenshot of where it was disclosed."),
          bullet("Terms of service the customer agreed to at signup."),
          sectionTitle("Likelihood of winning"),
          infoCard(
            `<strong>Estimated win probability: 71%</strong><br/><span style="color: #5f6368; font-size: 13px;">Disputes coded <code>product_not_received</code> for SaaS subscriptions typically win when there's clear evidence of product access. Your usage data shows this user logged in 14 times and sent 38 emails through VectorMail in the dispute window — that's strong evidence.</span>`,
            { tone: "info" },
          ),
          sectionTitle("If you don't respond"),
          p(
            "We'll automatically submit a basic evidence packet on your behalf, but win rates on auto-submitted disputes are ~40% versus 71% with manually-prepared evidence.",
          ),
          ctaRow([
            ctaButton("Submit evidence", { color: "#635bff" }),
            ctaButton("Accept the dispute", { color: "#80868b", variant: "outline" }),
            ctaButton("View customer history", { color: "#635bff", variant: "outline" }),
          ]),
          fineprint(
            "Stripe Radar caught this as low-fraud-risk at the time of the charge. If the dispute is decided in your favor, the $99 plus the $15 fee will be returned to your balance. Dispute outcomes typically take 60-75 days from the date the issuer received the cardholder claim.",
          ),
          companyEmailFooter("Stripe"),
        ]),
        summary: "Stripe dispute filed. Action: respond with evidence by May 25.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-161",
        subject: "Internal: Marketing site copy review",
        senderName: "Marketing",
        senderEmail: "marketing@vectormail.app",
        daysAgo: 3,
        snippet: "New landing page copy ready for your sign-off.",
        body: email([
          headline("Marketing site copy v3 · ready for your sign-off"),
          p(
            "Hi,<br/><br/>Finished the v3 copy revision for vectormail.app. Three top-level changes (below) plus a handful of micro-edits. Want your sign-off by Tuesday so we can ship Wednesday and let it run for 14 days before the next analytics cycle.",
          ),
          sectionTitle("Top-level changes · the three big ones"),
          infoCard(
            `<strong>1. Hero headline</strong><br/><span style="color: #5f6368; font-size: 13px;"><strong>Was:</strong> "The AI inbox that reads itself."<br/><strong>Now:</strong> "Your inbox, back in your control."<br/><br/><strong>Why:</strong> Customer-research synthesis last quarter showed that 'AI inbox' tested poorly on first-time visitors — too crowded a phrase. 'Back in your control' tested 2.4× better on first-impression intent.</span>`,
            { accent: "#0a8f5c" },
          ),
          infoCard(
            `<strong>2. Pricing · added the Founder plan</strong><br/><span style="color: #5f6368; font-size: 13px;">$49/month tier for 1-3 person teams. Limited to first 1,000 seats. Goal: bring early-stage founders into our top of funnel without cannibalizing Team. Modeled net-positive on revenue per visitor.</span>`,
            { accent: "#0a8f5c" },
          ),
          infoCard(
            `<strong>3. Primary CTA</strong><br/><span style="color: #5f6368; font-size: 13px;"><strong>Was:</strong> "Get started"<br/><strong>Now:</strong> "Try the demo"<br/><br/><strong>Why:</strong> Our demo-flow conversion is way higher than self-serve signup. We want visitors in demo first, signup second.</span>`,
            { accent: "#0a8f5c" },
          ),
          sectionTitle("Micro-edits worth flagging"),
          bullet("Footer trust signals: added Brightlane, Castleworks, Northglade logos (all approved)."),
          bullet("Feature copy on Buddy: tightened from 4 sentences to 2 with the same payload."),
          bullet("Mobile-only hero: shorter headline variant (testing showed mobile users churn at the 5-line headline)."),
          bullet("Compliance footer: SOC 2 Type II badge moved above the fold."),
          sectionTitle("How to comment"),
          bullet(`Doc: <a href="#" style="color: #1a73e8; text-decoration: none; font-weight: 500;">Marketing v3 copy</a> in the shared drive`),
          bullet("Comments inline; we'll resolve by EOW"),
          bullet("Tuesday EOD is the hard cut — we want Wednesday ship for the experiment to land before Memorial Day weekend"),
          ctaRow([
            ctaButton("Open the doc", { color: "#1F3A2E" }),
            ctaButton("Approve as-is", { color: "#1F3A2E", variant: "outline" }),
          ]),
          hr(),
          signature("Marketing", "VectorMail · Growth team", "marketing@vectormail.app"),
        ]),
        summary: "Landing copy review. Action: comment by Tuesday.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-162",
        subject: "Re: Co-marketing - Linear",
        senderName: "Owen Wright",
        senderEmail: "owen@linear.app",
        daysAgo: 5,
        snippet: "Open to co-marketing in Q3. What's the partnership shape?",
        body: email([
          p("Hi,"),
          p(
            "Saw your note about co-marketing — sorry for the delayed reply, last week was eaten by our quarterly planning. Short answer: <strong>yes, we're open in Q3</strong>, and the timing actually works in our favor since we have a couple of joint customer stories we've been wanting to tell publicly.",
          ),
          sectionTitle("Shapes we could take"),
          bullet("<strong>Joint blog post.</strong> The 'how we use each other' angle — your team uses Linear; we use VectorMail. Could be a Substack-style essay (4-5K words) or a tighter how-we-work piece (1,500 words). Both perform well in our audience."),
          bullet("<strong>Joint webinar.</strong> 45-60 min live, with audience Q&A. Strong for top-of-funnel — but only works if both teams commit to promotion (yours is 2x bigger so we'd lean on you a bit)."),
          bullet("<strong>Joint customer story.</strong> If we have a customer that's both Linear + VectorMail, we could do a 3-way case study. I'd guess Brightlane or Castleworks fits — happy to check."),
          bullet("<strong>Bundle / cross-promo.</strong> Not as exciting from a content perspective, but the deepest pre-existing relationships convert."),
          sectionTitle("What I'd propose"),
          p(
            "Let's start with the joint webinar — that's the format that produces the most value in the shortest time and gives both sides ammunition for follow-up content. I'd want to land it in mid-to-late July (before SaaStr in mid-September). Topic could be the practical 'AI-native team' theme — how teams that look like ours actually use the tools.",
          ),
          sectionTitle("Logistics if we go forward"),
          bullet("60 min webinar · live + recorded · both sides promote to email lists + social"),
          bullet("Expected reach: ~5K live, ~30K via recording (per your audience size + ours)"),
          bullet("Production: I have someone on my side who can run the tech, or we use Zoom Webinars"),
          bullet("Topic + speakers locked by July 1 if we're shipping mid-July"),
          p("30-min scoping call sounds good — I'm holding Tuesday 2 PM PT and Wednesday 10 AM PT next week. Either work?"),
          hr(),
          signature("Owen Wright", "Head of Partnerships · Linear", "owen@linear.app"),
        ]),
        summary: "Linear open to co-marketing in Q3. Action: propose joint webinar/blog.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-163",
        subject: "Re: 5-minute customer ref call",
        senderName: "Sophia Pereira",
        senderEmail: "sophia@brightlane.io",
        daysAgo: 6,
        snippet: "Happy to do a quick reference call for the Northwind prospect.",
        body: email([
          p("Hi,"),
          p(
            "Happy to do a reference call for the Northwind prospect — I owe you about 5 of these and have given exactly zero, so let's break the streak. Send me the times their team has open and I'll fit it in.",
          ),
          sectionTitle("How I usually run these"),
          bullet("<strong>20 minutes max</strong> · 5 min context, 10 min Q&A, 5 min buffer"),
          bullet("Phone or video, your call. I personally prefer phone — less performative."),
          bullet("I always cover three things, in this order:"),
          bullet("&nbsp;&nbsp;&nbsp;&nbsp;1) <strong>What we use VectorMail for + the specific outcomes</strong>"),
          bullet("&nbsp;&nbsp;&nbsp;&nbsp;2) <strong>What was painful in the first 30 days</strong> — honest answer, with the caveats"),
          bullet("&nbsp;&nbsp;&nbsp;&nbsp;3) <strong>Would I buy it again? Why?</strong>"),
          sectionTitle("Heads-up on what I'll say"),
          p(
            "Just want to set expectations: my answers are usually positive but not glowing. I'll mention the search-filter bug we hit in March (now fixed), the mobile-app gap, and the procurement-paperwork weight. I find that prospects trust references more when they hear real friction, not pure enthusiasm.",
          ),
          p(
            "If you'd rather I stick to a script, send the script and I'll work from it. I think they'll trust the honest version more, but your call.",
          ),
          p("Send times for next week and I'll grab one."),
          hr(),
          signature("Sophia Pereira", "VP Engineering · Brightlane", "sophia@brightlane.io"),
        ]),
        summary: "Existing customer agreed to give reference call. Action: connect with Northwind.",
        labels: [labelImportant],
        read: true,
      },
      {
        id: "demo-thread-164",
        subject: "Internal: Q2 board deck draft",
        senderName: "Operations",
        senderEmail: "ops@vectormail.app",
        daysAgo: 4,
        snippet: "First draft of the Q2 board deck. Comments by Friday.",
        body: email([
          headline("Q2 board deck · v1 draft ready for review"),
          p(
            "Hi,<br/><br/>First full draft of the Q2 board deck is in the shared drive. ~38 slides total. Goal: <strong>final-ready by Tuesday May 28</strong>, board sends the day after, meeting Thursday May 29. Comments inline by Friday EOD please — easier to resolve in writing than in the Monday review.",
          ),
          sectionTitle("Deck sections"),
          bullet("<strong>Cover + executive summary</strong> · 2 slides · the 'one slide if they only read one' synthesis"),
          bullet("<strong>Q1 KPIs vs plan</strong> · 5 slides · ARR, NRR, activation, retention, sales pipeline"),
          bullet("<strong>April update</strong> · 4 slides · how the trends evolved post-Q1 close"),
          bullet("<strong>Hiring</strong> · 4 slides · Q2 plan, Q3 ask, retention metrics"),
          bullet("<strong>Customer wins + pipeline</strong> · 6 slides · logos, expansion, big-deal health"),
          bullet("<strong>Product</strong> · 4 slides · Q2 shipped, Q3 themes, the pgvector cutover"),
          bullet("<strong>Finance</strong> · 5 slides · burn, runway, cash position, raise scenarios"),
          bullet("<strong>Risks + asks</strong> · 4 slides · what we want the board to weigh in on"),
          bullet("<strong>Appendix</strong> · 4 slides · cohort retention, cap table, customer health detail"),
          sectionTitle("Three asks for the board this quarter"),
          bullet("Approve hiring plan expansion (+3 heads in Q3)"),
          bullet("Authorize $250K SVB bridge facility (already vetted by counsel)"),
          bullet("Adopt the revised option grant guidelines for executive hires"),
          sectionTitle("Open items / known gaps"),
          bullet("Customer-of-the-month slide — need a quote from Brightlane (Aria is chasing)"),
          bullet("April churn analysis — Finance to finalize Monday after the May close"),
          bullet("Updated comp benchmark data for the option grant slide — Lina pulling Tuesday"),
          ctaRow([
            ctaButton("Open the deck", { color: "#1F3A2E" }),
            ctaButton("Comment template", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint("Past performance: last quarter's deck went 3 rounds of revision; let's aim for 2 this time. Final must be ready Tuesday for board distribution Wednesday."),
          hr(),
          signature("Operations", "VectorMail · Internal", "ops@vectormail.app"),
        ]),
        summary: "Q2 board deck draft. Action: comment by Friday.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-165",
        subject: "Brex - Card spending limit increase approved",
        senderName: "Brex",
        senderEmail: "noreply@brex.com",
        daysAgo: 5,
        snippet: "Your card spending limit was increased to $50K/month.",
        body: email([
          brandBlock("Brex"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Approved · Effective immediately</span></div>`,
          headline("Your Brex spending limit was increased to $50,000/month"),
          p(
            "Good news — based on your cash balance, historical card usage, and account health, we've automatically increased your <strong>monthly spending limit from $30K to $50K</strong>. No action needed; the new limit is effective immediately and applies to all cards on the account.",
          ),
          bigStat("New monthly limit", "$50,000 / month", { color: "#0caa41" }),
          keyValBlock([
            { label: "Account", value: "VectorMail HQ · Brex Business" },
            { label: "Previous limit", value: "$30,000 / month" },
            { label: "New limit", value: "$50,000 / month" },
            { label: "Change", value: "+$20,000 (+67%)" },
            { label: "Effective", value: "Immediately" },
            { label: "Cards affected", value: "All 8 cards on the account" },
          ]),
          sectionTitle("Why we increased it"),
          bullet("<strong>Cash balance</strong> in linked Mercury account: $4.13M operating + $2.40M treasury · supports significantly higher daily float"),
          bullet("<strong>Historical usage</strong>: average $18.4K/mo over last 6 months · room to grow without raising risk"),
          bullet("<strong>Payment history</strong>: 100% on-time auto-pay · zero declines · zero disputes"),
          bullet("<strong>Account tenure</strong>: 18 months · seasoned customer"),
          sectionTitle("Want even more?"),
          p(
            "If you anticipate exceeding $50K/month — for example, big vendor commitments at Q2 close or large hardware buys — you can request a manual review for higher limits. Typical Series A companies in your range can reach $150K/month with documentation. Just reply to this email.",
          ),
          ctaRow([
            ctaButton("View card settings", { color: "#0f0f0f" }),
            ctaButton("Request higher limit", { color: "#0f0f0f", variant: "outline" }),
          ]),
          fineprint("Brex automatically re-evaluates limits quarterly based on account health. Your next review: August 17, 2026."),
          companyEmailFooter("Brex"),
        ]),
        summary: "Brex limit increase. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-166",
        subject: "Mercury - Daily balance",
        senderName: "Mercury",
        senderEmail: "alerts@mercury.com",
        daysAgo: 0,
        hour: 8,
        snippet: "Operating balance: $4,128,000. Treasury: $2,400,000.",
        body: email([
          brandBlock("Mercury"),
          headline("Daily snapshot · Sunday, May 17, 2026"),
          p(
            "Good morning. Here's where your accounts stand at midnight PT. Cash position is healthy — runway holds at <strong>20.9 months</strong> at current burn.",
          ),
          metricGrid([
            { label: "Total cash", value: "$6.53M", sub: "across all accounts" },
            { label: "Operating", value: "$4.13M", sub: "Mercury Checking" },
            { label: "Treasury", value: "$2.40M", sub: "Mercury Vault @ 5.06% APY" },
            { label: "30-day burn", value: "$312K", sub: "trailing average" },
            { label: "Runway", value: "20.9 mo", sub: "at current burn" },
            { label: "Interest YTD", value: "$48,210", sub: "Vault earnings" },
          ]),
          sectionTitle("Yesterday's activity"),
          logRow("May 16 · 9:18 AM", "+ $45,000.00 · Wire from Brightlane Holdings · INV-0091", { tone: "ok" }),
          logRow("May 16 · 2:42 PM", "− $187,420.00 · Payroll · Gusto (14 employees)", { tone: "info" }),
          logRow("May 16 · 4:18 PM", "− $895.00 · Datadog · INV-22918", { tone: "info" }),
          logRow("May 16 · 5:30 PM", "− $1,344.00 · Notion · scheduled annual renewal", { tone: "info" }),
          logRow("May 16 · 11:59 PM", "− $4,210.00 · AWS · April bill (sweep)", { tone: "info" }),
          sectionTitle("Account breakdown"),
          keyValBlock([
            { label: "Operating · ••3412", value: "$4,128,420.18" },
            { label: "Operating · payroll sweep · ••8104", value: "$0.00 (drained May 15)" },
            { label: "Vault · Treasury · ••9912", value: "$2,400,000.00" },
            { label: "Pending out", value: "−$12,840.00 (3 in flight)" },
            { label: "Pending in", value: "+$0.00" },
          ]),
          sectionTitle("Heads-up · upcoming withdrawals"),
          bullet("May 19 · Stripe payout cycle (~$184K expected from May volume)."),
          bullet("May 20 · ACH out · GoCardless · $620 (UK billing)."),
          bullet("May 24 · Vercel Pro renewal · $40."),
          ctaRow([
            ctaButton("Open Mercury", { color: "#0f1c3f" }),
            ctaButton("Move money", { color: "#0f1c3f", variant: "outline" }),
            ctaButton("Daily reports settings", { color: "#0f1c3f", variant: "outline" }),
          ]),
          fineprint(
            "Mercury · Banking services provided by Choice Financial Group and Evolve Bank & Trust, Members FDIC. The Mercury IO Mastercard® is issued by Patriot Bank, Member FDIC, pursuant to a license from Mastercard.",
          ),
          companyEmailFooter("Mercury"),
        ]),
        summary: "Daily balance digest. No action.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-167",
        subject: "Auction watch - .ai domain",
        senderName: "Squadhelp",
        senderEmail: "alerts@squadhelp.com",
        daysAgo: 5,
        snippet: "Your bid on inboxbrain.ai was outbid. Current price: $4,200.",
        body: email([
          brandBlock("Squadhelp"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Outbid · 2 days remaining</span></div>`,
          headline("Your bid on inboxbrain.ai was outbid"),
          p(
            "Heads up — your $3,500 bid on <strong>inboxbrain.ai</strong> was outbid by another buyer 17 minutes ago. The current top bid is <strong>$4,200</strong>. You have until the auction closes Tuesday at 5:00 PM PT to reclaim the lead.",
          ),
          keyValBlock([
            { label: "Domain", value: "inboxbrain.ai" },
            { label: "Your bid", value: "$3,500 (placed 3 days ago)" },
            { label: "Current high bid", value: "$4,200" },
            { label: "To reclaim lead", value: "$4,300 minimum (next increment)" },
            { label: "Auction ends", value: "Tuesday, May 19 · 5:00 PM PT" },
            { label: "Time remaining", value: "2 days, 4 hours" },
            { label: "Other bidders", value: "3 active" },
          ]),
          sectionTitle("Domain at a glance"),
          bullet("<strong>inboxbrain.ai</strong> · 11 letters · clean, brandable, no hyphens"),
          bullet("Premium .ai TLD · steady price appreciation (Squadhelp .ai average is up 34% YoY)"),
          bullet("Trademark check: clean (we ran it for you when you bid)"),
          bullet("Estimated brand value: $8K-15K based on comparable Squadhelp sales"),
          sectionTitle("Your options"),
          bullet("<strong>Bid again at $4,300+</strong> · keep the auction alive · increases by $100 minimum"),
          bullet("<strong>Walk away</strong> · auction continues without you · we'll refund your earnest money"),
          bullet("<strong>Make a private offer to current high bidder</strong> · sometimes works for under-the-radar deals"),
          ctaRow([
            ctaButton("Bid $4,300", { color: "#3aaee0" }),
            ctaButton("Bid custom amount", { color: "#3aaee0", variant: "outline" }),
            ctaButton("Withdraw from auction", { color: "#80868b", variant: "outline" }),
          ]),
          fineprint("If you withdraw, your earnest money is refunded within 3 business days. If you win, you have 7 days to complete payment via wire or ACH; we handle the transfer to your registrar."),
          companyEmailFooter("Squadhelp"),
        ]),
        summary: "Domain outbid. Action: bid again or release.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-168",
        subject: "Customer story - request to feature",
        senderName: "Sophia Pereira",
        senderEmail: "sophia@brightlane.io",
        daysAgo: 4,
        snippet: "Happy to be featured. Can we review the case study before publish?",
        body: email([
          p("Hi,"),
          p(
            "Yes — Brightlane is in for the customer story. Our marketing team is on board, our security team has green-lit the public details we've discussed, and I personally think the story we'd tell is genuinely useful to other engineering orgs.",
          ),
          sectionTitle("One ask before publish"),
          bullet("<strong>Can we review the draft before it goes live?</strong> Two reasons: (1) confirm the metrics you cite are still accurate, (2) make sure my quotes don't accidentally leak anything sensitive (our internal usage data is fair game; our customer names are not)."),
          bullet("<strong>I'll aim for a 24-hour turnaround</strong> when you send it. Anything urgent flagged in my inbox gets through fast."),
          sectionTitle("What I'd be comfortable saying publicly"),
          bullet("Specific time-saved metrics from our team (we tracked it for 60 days; the data is real and impressive)"),
          bullet("Why we switched from our prior tool (you can name the prior tool if you'd like)"),
          bullet("How we onboarded the team (the playbook is replicable)"),
          bullet("Specific quotes from me and from 1-2 of my engineers (with their permission)"),
          sectionTitle("What I'd prefer we don't disclose"),
          bullet("Our seat count specifically (the range '50-100' is fine; the exact number is not)"),
          bullet("Names of specific Brightlane customers we're emailing (privacy)"),
          bullet("The exact contract value (the ARR range is fine in general; the per-seat negotiated price isn't)"),
          sectionTitle("Distribution"),
          p(
            "I'd love to be part of the launch — happy to amplify on LinkedIn, do a podcast slot if you arrange it (with Aria's help), and be available for reference calls for the first 30 days post-publish. After that I'll need to pull back to focus on our own roadmap, but the launch window is fair game.",
          ),
          p("Send the draft when ready."),
          hr(),
          signature("Sophia Pereira", "VP Engineering · Brightlane", "sophia@brightlane.io"),
        ]),
        summary: "Brightlane case study consent (review required). Action: send draft for review.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-169",
        subject: "Inbox triage - 14 archived this week",
        senderName: "VectorMail",
        senderEmail: "summary@vectormail.app",
        daysAgo: 0,
        hour: 7,
        snippet: "Your auto-triage this week: 14 archived, 3 snoozed, 7 surfaced.",
        body: email([
          brandBlock("VectorMail · Weekly"),
          headline("Your week with Buddy · auto-triage summary"),
          p(
            `Hi,<br/><br/>Quick personal recap of what Buddy did for you this week (May 11 – May 17). The TL;DR: <strong>14 messages archived automatically, 3 snoozed for later, 7 surfaced for your attention, and 11 replies drafted</strong> — of which you sent 9 with light edits and 2 with material changes.`,
          ),
          metricGrid([
            { label: "Auto-archived", value: "14", sub: "newsletters, receipts, alerts" },
            { label: "Snoozed", value: "3", sub: "for later this week" },
            { label: "Surfaced for you", value: "7", sub: "needed reply or decision" },
            { label: "Replies drafted", value: "11" },
            { label: "Sent w/ light edits", value: "9", sub: "82% accept rate" },
            { label: "Time saved (estimated)", value: "~3.5 hrs" },
          ]),
          sectionTitle("Notable patterns"),
          bullet("<strong>Investor threads</strong> consistently surfaced in <em>Important · Needs Reply</em> (your engagement rate: 100%, median response time 4.2 hours)."),
          bullet("<strong>Receipts + notifications</strong> auto-archived at 96% accuracy this week. The 4% we got wrong: 2 Stripe alerts that needed manual triage (we've adjusted the model)."),
          bullet("<strong>Sales/inbound</strong> messages all got drafted replies with consistent voice. You sent 7 of 8 without changes — strongest reply-quality week we've measured."),
          sectionTitle("What Buddy got wrong this week"),
          bullet(`Snoozed Sophia's customer-story email for 'next week' when it would have been better to surface immediately. Adjusted weight on 'sender = engaged customer' in the snooze model.`),
          bullet(`Drafted a reply to TechCrunch press inquiry that was too casual. You significantly edited it. We've added 'press inquiry' as a higher-formality category.`),
          sectionTitle("Next week"),
          p(
            `You have 5 follow-ups Buddy will surface throughout the week. We'll start prioritizing the bridge-SAFE finalization with Daniel Brun, the Northwind POC kickoff, and Nathan Wu's offer-decision deadline (Friday).`,
          ),
          hr(),
          signature("Buddy", "Your AI inbox · VectorMail", "summary@vectormail.app"),
        ]),
        summary: "Personal weekly recap. No action.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-170",
        subject: "Re: Quick chat",
        senderName: "Owen Wright",
        senderEmail: "owen@linear.app",
        daysAgo: 7,
        snippet: "Heard great things. Open to a quick coffee on your next NYC trip?",
        body: email([
          p("Hi,"),
          p(
            "Owen Wright here — Head of Partnerships at Linear (separate from my partnerships-process email earlier this week; this one is personal, not work). Heard great things about you and VectorMail from <strong>Hana Cho at Forerunner</strong> over dinner two weeks ago, and she said you were heading to NYC in late May.",
          ),
          p(
            "Want to grab a quick coffee while you're in town? I'm in the Flatiron / Union Square area most days. The conversation I want to have is half curiosity (your view on the AI productivity stack — Hana said you have an unusually clear thesis) and half catalyst (we may want to do something joint on the partnership side that's bigger than the co-marketing thing in the other thread).",
          ),
          sectionTitle("Specific dates I have open"),
          bullet("Wednesday May 28 · 8-10 AM or 3-5 PM"),
          bullet("Thursday May 29 · 9-11 AM (probably the best window)"),
          bullet("Friday May 30 · before noon if you fly out late"),
          sectionTitle("Where I'd suggest"),
          bullet("<strong>Joe Coffee · Pro Building</strong> · convenient if you're south of 23rd"),
          bullet("<strong>Devoción · Williamsburg</strong> · if you want a longer slot and the walk"),
          bullet("<strong>Your hotel lobby</strong> · whatever's easiest"),
          p(
            "Reply with whatever works. If none of these times do, I can flex — just want to lock something before you're back on the plane home.",
          ),
          hr(),
          signature("Owen Wright", "Head of Partnerships · Linear", "owen@linear.app"),
        ]),
        summary: "Casual coffee request, NY. Action: reply with travel plans.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-171",
        subject: "Webinar invitation - speak with Lenny",
        senderName: "Lenny's Newsletter",
        senderEmail: "podcast@lennysnewsletter.com",
        daysAgo: 4,
        snippet: "Lenny wants to feature your team on a webinar about AI-native product orgs.",
        body: email([
          p("Hi,"),
          p(
            `Reaching out from <strong>Lenny's Newsletter team.</strong> Lenny is hosting a 60-minute webinar in July on the topic of <strong>'How AI-native companies design their product orgs'</strong>, and we'd love to feature you as one of two guests. The other guest is likely Marisol Choi (Lattice) — we're still confirming.`,
          ),
          sectionTitle("Format"),
          keyValBlock([
            { label: "Length", value: "60 minutes · 45 conversation + 15 live Q&A" },
            { label: "Format", value: "Lenny moderates · you + one other founder respond" },
            { label: "Audience size", value: "~5,000 live · ~30,000-50,000 via recording" },
            { label: "Distribution", value: "Newsletter (170K), YouTube, Spotify, Apple Podcasts" },
            { label: "Length to record", value: "75 min (we pad for re-takes)" },
          ]),
          sectionTitle("What we'll cover"),
          bullet("How you structured the product org from day 1 (what worked, what didn't)"),
          bullet("PM ↔ engineering ratios in AI-native companies (you have data; Lenny loves data)"),
          bullet("How AI changes the day-to-day of product work (concrete examples requested)"),
          bullet("Hiring decisions that compound vs hiring decisions you'd undo"),
          sectionTitle("Three date options"),
          bullet("<strong>Thursday, July 17</strong> · 9-10 AM PT"),
          bullet("<strong>Friday, July 18</strong> · 10-11 AM PT"),
          bullet("<strong>Tuesday, July 22</strong> · 9-10 AM PT"),
          sectionTitle("Why it's worth doing"),
          bullet("Lenny's audience is exactly your future customer base (founders + heads of product at growing startups)"),
          bullet("Past guest companies see 200-400 inbound trial signups in the 30 days post-publish"),
          bullet("It's 75 minutes of your time for ~30K founders to hear your story directly"),
          bullet("Past guests we've featured include Marty Cagan, Teresa Torres, and a recent rotation of AI-native founders"),
          p("Confirm a date and we'll send the pre-call agenda + technical setup details."),
          hr(),
          signature("Marisol Singh", "Production · Lenny's Podcast & Webinars", "podcast@lennysnewsletter.com"),
        ]),
        summary: "Lenny webinar invite. Action: pick a July date.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-172",
        subject: "ARR snapshot - May 17",
        senderName: "Finance",
        senderEmail: "finance@vectormail.app",
        daysAgo: 0,
        hour: 7,
        snippet: "ARR: $2.84M. New: $112K this week. Churn: $4K.",
        body: email([
          brandBlock("VectorMail Finance"),
          headline("ARR snapshot · Sunday, May 17, 2026"),
          p(
            "Weekly auto-generated ARR snapshot. <strong>Strong week.</strong> Net-new ARR of $108K is the best week we've had this quarter, driven mostly by Brightlane expansion + Castleworks signing.",
          ),
          metricGrid([
            { label: "ARR", value: "$2.84M", sub: "+4.0% WoW" },
            { label: "New ARR this week", value: "$112K", sub: "best of quarter" },
            { label: "Churn this week", value: "$4K", sub: "below 0.2%" },
            { label: "Net new ARR", value: "+$108K", sub: "trailing 7d" },
            { label: "Expansion ARR", value: "$30K", sub: "Brightlane" },
            { label: "New logos", value: "3", sub: "Castleworks, Northglade, +1" },
          ]),
          sectionTitle("What drove new ARR this week"),
          bullet("<strong>Brightlane expansion · $30K</strong> · 50 → 75 seats · annual prepay · signed Tuesday"),
          bullet("<strong>Castleworks new · $9.6K</strong> · 8-seat trial → annual · signed Friday"),
          bullet("<strong>Northglade new · $7.1K</strong> · 6-seat team plan · annual"),
          bullet("<strong>Two self-serve upgrades</strong> · $65K combined · annual"),
          sectionTitle("Churn detail"),
          bullet("<strong>Code For Good</strong> · $4K ARR · non-profit shutting down (sad, but not preventable)"),
          bullet("No other churn this week"),
          sectionTitle("Pipeline forecast (next 14 days)"),
          bullet("<strong>Northwind POC kickoff</strong> · ~$300K ARR if it converts (June close)"),
          bullet("<strong>startup.io expansion</strong> · ~$26K · Jordan moving forward"),
          bullet("<strong>~6 self-serve mid-funnel</strong> · expected $20-30K total"),
          ctaRow([
            ctaButton("Open ARR dashboard", { color: "#1F3A2E" }),
            ctaButton("Drill into expansion", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint("Auto-generated Sundays at 7 AM PT. Data fresh through Saturday 11:59 PM PT. Source: Stripe + our internal ARR pipeline."),
          companyEmailFooter("VectorMail Finance"),
        ]),
        summary: "ARR snapshot - strong week. No action.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-173",
        subject: "Resume forwarded - VP Eng candidate",
        senderName: "Dana Howe",
        senderEmail: "dana@vectormail.app",
        daysAgo: 5,
        snippet: "Forwarding a strong VP Eng resume from a friend.",
        body: email([
          p("Hi,"),
          p(
            "Forwarding a VP Engineering resume from a close friend at <strong>Bloom Health (Series C)</strong>. She's looking to leave and is being quiet about the search — three other companies have her resume but only one (Lattice, who's not actively hiring at her level) is in her active conversation set. <strong>I'd love your eyes on this before I formally move her into the pipeline.</strong>",
          ),
          sectionTitle("Quick summary"),
          keyValBlock([
            { label: "Candidate", value: "Reema Khorshid" },
            { label: "Current role", value: "VP Engineering · Bloom Health · Series C health-tech" },
            { label: "Team size she manages", value: "62 engineers · 5 directors reporting to her" },
            { label: "Previous", value: "Director Eng at Stripe (3y) · Staff Eng at Square (2y) · early Brex" },
            { label: "Notable past projects", value: "Stripe Identity launch · Square Online launch" },
            { label: "Why she's leaving", value: "Confidential — but the short version is leadership change at Bloom doesn't match her values" },
            { label: "Open to roles", value: "VP Eng at smaller Series A/B AI-native companies" },
          ]),
          sectionTitle("Why I'm flagging her specifically"),
          bullet("Her background is exactly what we'd want for our future VP Eng (Q3-Q4 2026 hire target per the original plan)"),
          bullet("She built and ran two ship-from-scratch teams (Stripe Identity, Square Online) — that's the muscle we need next"),
          bullet("Her old reports describe her as 'unusually low-ego' — the most consistent feedback in her references"),
          bullet("She has explicit AI experience (Bloom Health's clinical-decision-support product uses Claude heavily)"),
          bullet("If she does move, she'll have at least 3 offers within 2 weeks — opportunity-cost of slow play is high"),
          sectionTitle("Risk to be aware of"),
          bullet("Her current comp is reportedly ~$520K cash + significant Bloom equity. We'd need to be at the top of our band to be competitive."),
          bullet("She's not formally on the market — so any conversation needs to be confidential from the start"),
          sectionTitle("What I'd propose"),
          p(
            `<strong>Coffee with her, off-the-record, no formal interview process.</strong> Goal: figure out if we'd be excited to recruit her once we're ready to hire VP Eng. If yes, we keep the relationship warm; if no, we both walk away cleanly. I can set it up — would prefer to meet her with you so we can both calibrate.`,
          ),
          p("Reply with your read on the resume and whether the coffee is worth doing."),
          hr(),
          signature("Dana Howe", "Head of Engineering · VectorMail", "dana@vectormail.app"),
        ]),
        summary: "VP Eng candidate resume forward. Action: review and align with Dana.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-174",
        subject: "Re: AI Engineer Summit - panel?",
        senderName: "AI Engineer Summit",
        senderEmail: "speakers@ai.engineer",
        daysAgo: 6,
        snippet: "Want you on the 'AI for productivity' panel - Sept 23 SF.",
        body: email([
          p("Hi,"),
          p(
            "Reaching out from the <strong>AI Engineer Summit</strong> programming team. We'd love to have you on the <strong>'AI for productivity'</strong> panel at our SF event on September 23. The panel is a 45-minute moderated conversation with 3 other founders building AI-native productivity products.",
          ),
          sectionTitle("The panel"),
          keyValBlock([
            { label: "Title", value: "AI for productivity · who wins, what's broken, what's overhyped" },
            { label: "Format", value: "45-min moderated panel + 10 min audience Q&A" },
            { label: "Date", value: "Tuesday, September 23, 2026" },
            { label: "Time", value: "2:30 PM – 3:25 PM PT" },
            { label: "Venue", value: "Yerba Buena Center for the Arts, San Francisco" },
            { label: "Audience", value: "~1,400 in-person · livestream + post-event recording" },
            { label: "Moderator", value: "swyx (Latent Space)" },
          ]),
          sectionTitle("Other panelists (confirmed)"),
          bullet("Sasha Banerjee · CEO, Cresta (agent platform)"),
          bullet("Eli Marshall · Founder, Decagon (customer support agents)"),
          bullet("Mira Lee · CTO, Stack Labs (AI-native workflow)"),
          sectionTitle("The conversation"),
          bullet("Audience is technical · they want substance, not platitudes"),
          bullet("swyx prepares 8-10 sharp questions in advance, sends them 5 days before"),
          bullet("Strong opinions are encouraged · panels work when panelists disagree productively"),
          bullet("No PR talking points — the audience will spot them and the social-media chatter post-event punishes them"),
          sectionTitle("Honorarium + logistics"),
          bullet("$1,500 panelist honorarium"),
          bullet("Travel + 2 nights at the conference hotel covered"),
          bullet("Speaker dinner Monday night (~25 attendees, off-the-record)"),
          p(
            "<strong>Confirm by July 15</strong> so we can lock the panel and start promotion. If you're a hard no, replying with 1-2 alternates from your network is helpful.",
          ),
          hr(),
          signature("AI Engineer Summit · Programming", "speakers@ai.engineer"),
        ]),
        summary: "Panel invite (Sept). Action: decide by July 15.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-175",
        subject: "Anthropic - Console invite (org)",
        senderName: "Anthropic",
        senderEmail: "noreply@anthropic.com",
        daysAgo: 2,
        snippet: "You've been added to the 'VectorMail Eng' Anthropic org.",
        body: email([
          brandBlock("Anthropic"),
          headline("You've been added to the 'VectorMail Eng' Anthropic Console organization"),
          p(
            "Marcus Liu has added you to the <strong>VectorMail Eng</strong> Anthropic Console organization with the <strong>Admin</strong> role. You now have full access to manage API keys, billing, usage limits, team members, and audit logs.",
          ),
          keyValBlock([
            { label: "Organization", value: "VectorMail Eng" },
            { label: "Org ID", value: "org_••••••••aA8K" },
            { label: "Your role", value: "Admin (highest privilege)" },
            { label: "Added by", value: "Marcus Liu (CTO)" },
            { label: "Added on", value: "May 15, 2026 · 2:18 PM PT" },
            { label: "Current plan", value: "Build · $20K/mo commit" },
            { label: "Members", value: "8 (4 Admin, 3 Developer, 1 Billing)" },
          ]),
          sectionTitle("What you can now do"),
          bullet("View and create API keys (and revoke any team member's key)"),
          bullet("Manage spending limits and view real-time usage across the org"),
          bullet("Add/remove team members and adjust their roles"),
          bullet("View 90-day audit log of all API and dashboard activity"),
          bullet("Switch between Claude Opus, Sonnet, and Haiku model tiers without ticket"),
          sectionTitle("Recommended first actions"),
          bullet("Enable MFA on your account (admin-level access without MFA is a soft policy violation)"),
          bullet("Confirm your API keys are stored in 1Password rather than env files"),
          bullet("Review billing/usage limits — they default lower than what most production accounts need"),
          ctaRow([
            ctaButton("Open Console", { color: "#cb785c" }),
            ctaButton("Set up MFA", { color: "#cb785c", variant: "outline" }),
          ]),
          fineprint("Admin role is the highest-privileged tier. Treat with appropriate care. You can be downgraded to Developer by any other admin if needed."),
          companyEmailFooter("Anthropic"),
        ]),
        summary: "Anthropic org access. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-176",
        subject: "Customer call notes - Loop AI save call",
        senderName: "Aria Singh",
        senderEmail: "aria@vectormail.app",
        daysAgo: 1,
        hour: 16,
        snippet: "Save call went well. Loop AI committing to renew for 12 months.",
        body: email([
          headline("Loop AI save call · renewed 12 months · no discount required"),
          p(
            "Quick recap of this morning's save call with <strong>Loop AI</strong>. <strong>Net-net: they're committing to renew for 12 months at current seat count with no discount.</strong> The relationship is actually stronger than it was three months ago. Notes below.",
          ),
          sectionTitle("What we learned on the call"),
          bullet("Their previous VP Ops (who had been our champion + DAU driver) left April 3 for another company"),
          bullet("New ops lead (Sarah Park) wasn't onboarded to VectorMail by her predecessor — she defaulted back to native Gmail because no one walked her through the value"),
          bullet("Once we showed Sarah a 15-minute walkthrough, she immediately got it — 'oh, this is why everyone here was so attached to it'"),
          bullet("The 'low DAU = churn risk' signal was correct but the diagnosis was wrong — they didn't lose interest, they lost continuity"),
          sectionTitle("What's happening next week"),
          bullet("<strong>Tuesday 10 AM PT:</strong> 1-hour refresher session for Loop AI's team led by Sarah and me. 12 people invited (every active seat)."),
          bullet("<strong>Wednesday:</strong> Personalized briefs setup workshop with the 4 power users (one tier above what we usually offer; one-time goodwill gesture)"),
          bullet("<strong>Friday:</strong> Renewal contract signed. Pulley confirmed it's locked in our queue."),
          sectionTitle("Pattern I want to surface"),
          infoCard(
            "<strong>This save was preventable.</strong> If we had a 'champion left' alert in our CS system, we'd have caught the risk on April 4, not April 28. Adding to the CS playbook refresh I'm publishing Monday. Costs us nothing to monitor LinkedIn for champion role changes; could save tens of thousands per save.",
            { tone: "ok" },
          ),
          hr(),
          signature("Aria Singh", "Customer Success Lead · VectorMail", "aria@vectormail.app"),
        ]),
        summary: "Save call recap - Loop AI renewing. No action.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-177",
        subject: "Reminder: Quarterly business review - Brightlane",
        senderName: "Calendar",
        senderEmail: "calendar-notification@google.com",
        daysAgo: 2,
        snippet: "QBR with Brightlane scheduled May 24, 10 AM PT.",
        body: email([
          brandBlock("Calendar"),
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 20px 0;"><tr><td style="vertical-align: top; padding: 0;">${calendarDateTile({ month: "May", day: "24", weekday: "Sat" })}</td><td style="vertical-align: top; padding-left: 0;"><div style="font-size: 19px; font-weight: 600; color: #1f1f1f; line-height: 1.3; letter-spacing: -0.3px; margin-bottom: 6px;">QBR · Brightlane</div><div style="font-size: 14px; color: #5f6368; line-height: 1.5;">10:00 AM – 11:00 AM PT · 60 min</div><div style="font-size: 13px; color: #80868b; margin-top: 4px;">Zoom · with Sophia + Brightlane leadership</div></td></tr></table>`,
          p(
            "Quarterly business review with Brightlane — our largest customer by ARR. Renewal discussion in parallel. Aria has the QBR deck mostly ready; want your eyes on the structure before Monday.",
          ),
          sectionTitle("Where"),
          keyValBlock([
            { label: "Video", value: `<a href="#" style="color: #1a73e8; text-decoration: none;">brightlane.zoom.us/j/qbr-4128</a>` },
            { label: "Brightlane attendees", value: "Sophia (VP Eng) · Tomas (CFO) · Maya (CIO)" },
            { label: "Our attendees", value: "You + Aria + Marcus (technical Q&A if needed)" },
            { label: "Organizer", value: "Aria Singh" },
          ]),
          sectionTitle("QBR agenda · 60 min"),
          logRow("10:00 – 10:10", "Account health snapshot — usage, sentiment, key wins · Aria", { tone: "info" }),
          logRow("10:10 – 10:25", "Brightlane's Q2 outcomes from VectorMail · Sophia + Aria", { tone: "info" }),
          logRow("10:25 – 10:40", "Product roadmap preview — what's coming in Q3 · you", { tone: "info" }),
          logRow("10:40 – 10:55", "Renewal terms confirmation · Tomas + you", { tone: "warn" }),
          logRow("10:55 – 11:00", "Open Q&A + wrap", { tone: "info" }),
          sectionTitle("Key decisions to land"),
          bullet("Confirm Brightlane is signing the expansion + 12-month price lock (their procurement team has been quiet, want explicit yes)"),
          bullet("Get verbal commitment on the customer-story participation (Sophia signed off in email; want it in front of Tomas too)"),
          bullet("Surface our Q3 priorities to align with their Q3 hiring + product plans"),
          sectionTitle("Risks I want surfaced before the call"),
          bullet("Slack Connect channel got paused 24 hours ago — flag in this thread so we know if it's about anything we should address"),
          bullet("Aria heard their procurement team is slow this quarter; confirm contracts can sign by Tuesday EOD"),
          ctaRow([
            ctaButton("Yes", { color: "#0caa41" }),
            ctaButton("Open prep doc", { color: "#1a73e8", variant: "outline" }),
            ctaButton("Move 30 min later", { color: "#1a73e8", variant: "outline" }),
          ]),
          fineprint("Calendar reminder · 24 hours before this event auto-resends · QBR deck linked in this thread; please skim by Friday EOD if you haven't"),
          companyEmailFooter("Calendar"),
        ]),
        summary: "QBR with customer scheduled. Action: prep deck before May 24.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-178",
        subject: "Re: AI assistant comparison - inbound",
        senderName: "Avery Tan",
        senderEmail: "avery.tan@techcrunch.com",
        daysAgo: 4,
        snippet: "Quick follow-up on the AI inbox piece - one quote question.",
        body: email([
          p("Hi,"),
          p(
            "Following up quickly — appreciate you giving me time earlier this week. I'm closing the piece tonight and I have <strong>one specific quote question I'd love to include from you</strong> before I file. If you can give me 5 minutes by phone or 60 seconds in writing today, that would let me close the loop cleanly.",
          ),
          sectionTitle("The one question"),
          infoCard(
            `<strong>"What does the next 12 months of AI inbox products look like in your view?"</strong><br/><br/><span style="color: #5f6368; font-size: 13px;">Looking for 2-3 specific predictions, opinionated, with the conviction-level you used earlier. Sentence length doesn't matter; specificity does.</span>`,
            { accent: "#00d566" },
          ),
          sectionTitle("Context on how I'll use it"),
          bullet("Direct quote, attributed to you with title (founder & CEO, VectorMail)"),
          bullet("Used in the 'where this category goes' section toward the end of the piece"),
          bullet("Anything you say is on the record — you've seen me work, you know my style"),
          bullet("If you want to revise after the call, that's fine; I won't publish a version you haven't seen"),
          sectionTitle("Filing schedule"),
          bullet("Tonight by 11:59 PM PT — final draft to editor"),
          bullet("Tomorrow morning — runs"),
          bullet("Quote needed by 5 PM PT today at the absolute latest"),
          p(
            "Easiest path: reply to this email with 2-3 sentences. I'll incorporate as-is, or I'll send back if I'm going to compress in a way that changes meaning.",
          ),
          hr(),
          signature("Avery Tan", "Senior Reporter · TechCrunch", "avery.tan@techcrunch.com"),
        ]),
        summary: "Reporter quote follow-up. Action: send 1-2 sentence quote today.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-179",
        subject: "Stripe - Tax form 1099-K ready",
        senderName: "Stripe",
        senderEmail: "taxes@stripe.com",
        daysAgo: 9,
        snippet: "Your 1099-K for 2025 is now available.",
        body: email([
          brandBlock("Stripe"),
          headline("Your 2025 Form 1099-K is ready"),
          p(
            "Your IRS Form 1099-K for tax year 2025 is now available in your Stripe dashboard. This form reports the total gross payments processed through your Stripe account in calendar year 2025 and is also filed with the IRS on your behalf.",
          ),
          bigStat("Gross volume reported", "$1,847,210.00"),
          keyValBlock([
            { label: "Tax year", value: "2025 (January 1 – December 31)" },
            { label: "Form type", value: "1099-K (third-party network reporting)" },
            { label: "Entity name on file", value: "VectorMail, Inc." },
            { label: "Tax ID (EIN) reported", value: "**-***1234" },
            { label: "Gross volume", value: "$1,847,210.00" },
            { label: "Transaction count", value: "8,420" },
            { label: "Filed with", value: "IRS · automated · postmarked February 28, 2026" },
            { label: "State copies", value: "California (we sent), all others (you'll handle)" },
          ]),
          sectionTitle("What this is (and what it isn't)"),
          bullet("<strong>What it is:</strong> Gross volume — what was charged on cards processed through Stripe, before fees, refunds, or chargebacks."),
          bullet("<strong>What it isn't:</strong> Net revenue. Your actual taxable income is gross minus fees minus refunds minus chargebacks; your accountant calculates this."),
          bullet("<strong>What you do with it:</strong> Forward to your accountant. Pilot.com (your bookkeeper) can ingest it directly if you give them dashboard access."),
          sectionTitle("Reconciliation tip"),
          infoCard(
            "Stripe also sends a 'Connected accounts reconciliation' file the same week. If your accountant gets confused about the difference between 1099-K and the reconciliation file: the 1099-K is what the IRS gets, the reconciliation is what reconciles to your books.",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("Download 1099-K", { color: "#635bff" }),
            ctaButton("Forward to Pilot", { color: "#635bff", variant: "outline" }),
            ctaButton("Tax dashboard", { color: "#635bff", variant: "outline" }),
          ]),
          fineprint("If you spot a discrepancy on the 1099-K, contact Stripe Support before filing — corrections take 5-10 business days and we can issue a corrected 1099-K if needed."),
          companyEmailFooter("Stripe"),
        ]),
        summary: "Stripe 1099-K available. Action: forward to accountant.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-180",
        subject: "Notion AI - Personalized weekly digest",
        senderName: "Notion",
        senderEmail: "notifications@notion.so",
        daysAgo: 1,
        hour: 8,
        snippet: "Your Notion workspace summary for the week.",
        body: email([
          brandBlock("Notion"),
          headline("Your week in VectorMail HQ workspace"),
          p(
            "Hi,<br/><br/>Here's your weekly Notion activity digest for the <strong>VectorMail HQ</strong> workspace. Personalized for what you've been working on and pages you watch.",
          ),
          metricGrid([
            { label: "Active pages", value: "42", sub: "+8 WoW" },
            { label: "New comments", value: "67", sub: "+12 WoW" },
            { label: "New pages created", value: "9" },
            { label: "Pages you edited", value: "14" },
            { label: "Pages mentioning you", value: "11" },
            { label: "Time in Notion", value: "~6h 20m", sub: "last 7 days" },
          ]),
          sectionTitle("Most-edited pages this week"),
          bullet("<strong>Q3 OKRs</strong> · 8 edits · primarily Dana"),
          bullet("<strong>Sprint 14 retro</strong> · 6 edits · Product team"),
          bullet("<strong>Customer story · Brightlane</strong> · 5 edits · Marketing"),
          bullet("<strong>Board deck Q2 · draft</strong> · 5 edits · Operations"),
          bullet("<strong>Hiring pipeline · Q3</strong> · 4 edits · Lina + Dana"),
          sectionTitle("Comments waiting for you (4)"),
          bullet("<strong>Dana asked you</strong> in 'Q3 OKRs' · 14 hours ago"),
          bullet("<strong>Marcus asked you</strong> in 'pgvector RFC' · 2 days ago"),
          bullet("<strong>Aria tagged you</strong> in 'Customer story · Brightlane' · 3 days ago"),
          bullet("<strong>Marketing tagged you</strong> in 'Landing copy v3' · 3 days ago"),
          sectionTitle("Trending in your workspace"),
          p(
            "Discussion in <code>Q3 OKRs</code> has been the most active conversation in the workspace this week — 41 comments across 6 sections. Dana is doing the heavy synthesis lifting. Worth checking in if you haven't this week.",
          ),
          ctaRow([
            ctaButton("Open workspace", { color: "#000000" }),
            ctaButton("View all activity", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("Weekly digest · sent Sundays at 8 AM PT · adjust frequency in Notion → Settings → Notifications"),
          companyEmailFooter("Notion"),
        ]),
        summary: "Notion weekly digest. No action.",
        labels: [labelPromotions],
        read: true,
      },
      {
        id: "demo-thread-181",
        subject: "Re: M&A inquiry - exploratory",
        senderName: "Eliot Marsh",
        senderEmail: "eliot@blueoceancorp.com",
        daysAgo: 3,
        hour: 16,
        snippet: "Exploratory M&A conversation. NDA available.",
        body: email([
          p("Hi,"),
          p(
            `<strong>Eliot Marsh, Corp Dev at BlueOcean.</strong> I'll keep this short and confidential. BlueOcean (~$840M ARR public productivity company, you've likely heard of us) is doing strategic landscaping in the AI-native productivity space as part of our 2026-2028 capital allocation review.`,
          ),
          p(
            "<strong>This is not a formal acquisition approach.</strong> We're at the 'understanding the landscape' phase, which typically precedes specific outreach by 6-12 months. I'm having quiet, confidential conversations with founders of companies that we think are interesting, regardless of whether anything ever comes of it on our end. Your name keeps coming up in that group.",
          ),
          sectionTitle("What I'd want to discuss · 45 minutes"),
          bullet("Your view of the AI-inbox category — where the moats actually are vs. where they're hyped"),
          bullet("Your founding thesis + how it's evolved through customer feedback"),
          bullet("Your 24-month roadmap (publicly tellable parts; we'll do this under NDA if needed)"),
          bullet("How BlueOcean's distribution network might complement or compete with your wedge"),
          sectionTitle("Why we'd want this conversation even if nothing happens"),
          bullet("Helps us calibrate where we'd build internally vs. where we'd partner vs. where we'd acquire"),
          bullet("Builds the relationship in case it becomes relevant in 12-24 months"),
          bullet("You get a real strategic conversation with someone outside your investor base"),
          bullet("Both sides walk away with calibration about the other's positioning"),
          sectionTitle("Confidentiality"),
          infoCard(
            `<strong>This conversation stays between us.</strong> I won't share what you tell me with BlueOcean's executive team unless you explicitly green-light it. NDA available on request if you'd prefer formal structure (most founders skip — informal is usually fine).<br/><br/>I also won't pitch you on selling. If anything formal ever happens it would come through a separate, more deliberate process.`,
            { tone: "info" },
          ),
          sectionTitle("Logistics"),
          bullet("45 minutes · Zoom · I'll send the calendar invite once you confirm"),
          bullet("Available windows in the next two weeks: May 22 (afternoon), May 28 (morning), June 3 (any time)"),
          bullet("Happy to do dinner instead if you're in NYC any time soon — Eliot's preference"),
          p(
            "If you'd rather pass — completely understood. Reply 'not the right time' and I'll leave you alone. If interested, just reply with a window."
          ),
          hr(),
          signature("Eliot Marsh", "Corporate Development · BlueOcean Corp", "eliot@blueoceancorp.com"),
        ]),
        summary: "M&A inbound (BlueOcean). Action: decide whether to take the call - loop in counsel first.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-182",
        subject: "Slack invite - founder dinner Friday",
        senderName: "Tara Wells",
        senderEmail: "tara@growthcollective.io",
        daysAgo: 3,
        snippet: "Hosting a small founder dinner Friday. Room for one more.",
        body: email([
          p("Hi,"),
          p(
            `Quick last-minute: I'm hosting a small <strong>founder dinner this Friday</strong> in SoMa. <strong>8 founders, 100% off-the-record, no investors in the room.</strong> The format has been working really well — we get one quiet candid conversation each month that's genuinely useful for everyone there.`,
          ),
          sectionTitle("Logistics"),
          keyValBlock([
            { label: "When", value: "Friday, May 22 · 7:00 PM – 10:00 PM PT" },
            { label: "Where", value: "Private room · Saison · 178 Townsend St (close to your office)" },
            { label: "Dress", value: "Smart casual" },
            { label: "Cost", value: "I'm covering · founder dinner gift from Growth Collective" },
            { label: "Off the record?", value: "Yes — Chatham House rules · nothing leaves the room" },
          ]),
          sectionTitle("Who's in the room"),
          bullet("Marisol Choi (Lattice, recently IPO'd)"),
          bullet("Carter Liu (Northglade — and you'd recognize each other since you just signed them)"),
          bullet("Daniela Hsu (Bloom Health, Series C)"),
          bullet("Quentin Yu (Cresta — agent platform · scaling fast)"),
          bullet("Two stealth-mode founders (I'll intro at dinner)"),
          bullet("Plus me, plus the room is open for one more — which is where you come in"),
          sectionTitle("Topic for this month"),
          p(
            `<strong>The hard parts of scaling that no one talks about.</strong> We pre-circulate one question for everyone to think about: 'What's the hardest decision you've made in the last 6 months that you can't talk about publicly?' Genuinely useful conversation usually emerges from that one prompt.`,
          ),
          sectionTitle("Reply by Wed if possible"),
          p(
            "I have a small standby list if you can't make it — just want to fill the seat with someone who'll show up. If you can come, send a yes by Wednesday and I'll send Friday details + the pre-question.",
          ),
          hr(),
          signature("Tara Wells", "Founder · Growth Collective", "tara@growthcollective.io"),
        ]),
        summary: "Founder dinner invite Friday. Action: accept or decline.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-183",
        subject: "Customer escalation closed - DataPipe",
        senderName: "Aria Singh",
        senderEmail: "aria@vectormail.app",
        daysAgo: 0,
        hour: 12,
        snippet: "DataPipe call went great. Issue root-caused and patched.",
        body: email([
          p("Hi,"),
          p(
            `Quick win to report — <strong>the DataPipe save call went great.</strong> We pulled the relationship back from the brink in 30 minutes. Their CTO is happier with us today than he was three weeks ago. Closing thoughts and what we learned below.`,
          ),
          sectionTitle("What happened on the call"),
          bullet("<strong>Root cause identified.</strong> Their sync delays were caused by a <em>misconfigured webhook endpoint on their side</em> (firewall added two weeks ago was throttling our webhook deliveries). Not a VectorMail bug at all."),
          bullet("<strong>Engineering patched it on the call.</strong> Marcus joined for the technical portion, walked Roberto's team through what we were seeing, identified the firewall rule, and they fixed it in real time."),
          bullet("<strong>CTO said 'this is why we picked you.'</strong> Roberto explicitly: we showed up with diagnostics, we explained what we were seeing, we joined the troubleshooting call. That's the value he was hoping for when he signed."),
          bullet("<strong>Renewal moved forward.</strong> Their 12-month renewal (was scheduled for August) is now signed and dated today. Annual prepay. $42K ARR locked in."),
          sectionTitle("What I'd take from this"),
          bullet("Save calls work when we show up with data, not apologies."),
          bullet("Engineering presence on customer escalation calls is often the deciding factor. Worth the time cost."),
          bullet("Their internal Slack channel '#vectormail-watch' is now '#vectormail-love.' Same group, different vibe."),
          sectionTitle("Follow-ups assigned"),
          bullet("Marcus drafting a 'troubleshooting webhook delivery' runbook so we catch this pattern faster next time."),
          bullet("Aria sending a one-pager on common firewall configurations to all enterprise customers as preemptive education."),
          bullet("Marketing including the DataPipe story (with permission) in next month's case-study cycle."),
          p("Great recovery. Touch grass and go home for the weekend — earned it."),
          hr(),
          signature("Aria Singh", "Customer Success Lead · VectorMail", "aria@vectormail.app"),
        ]),
        summary: "Customer escalation closed cleanly. No action - good news.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-184",
        subject: "Re: Profile feature - Forbes 30 Under 30",
        senderName: "Lucia Park",
        senderEmail: "lucia.park@forbes.com",
        daysAgo: 6,
        snippet: "Considering you for 30 Under 30. Need short answers to 5 questions.",
        body: email([
          p("Hi,"),
          p(
            "I'm reaching out from the Forbes editorial team. <strong>We're considering you for inclusion in the 2026 Forbes 30 Under 30 list — Enterprise Technology category.</strong> This is the long-listing stage; final selection happens at our editorial committee in late June, with notifications going out in early July.",
          ),
          sectionTitle("How it works"),
          bullet("<strong>Long list (now):</strong> ~120 founders we're considering · I need short answers to 5 questions from each."),
          bullet("<strong>Editorial committee (mid-June):</strong> We narrow to ~50 finalists based on the responses + our independent research."),
          bullet("<strong>Final 30 (early July):</strong> Notified privately. Public list goes live mid-September with the print issue."),
          bullet("<strong>What you get if selected:</strong> Print + digital coverage in Forbes (significant), a 30U30 invite-only summit, and ongoing alumni network access."),
          sectionTitle("Five questions · target Friday EOD"),
          bullet("<strong>1. Founding story in 100 words.</strong> Why this company, why now."),
          bullet("<strong>2. The most counterintuitive thing you've learned.</strong> 80 words. Forbes loves this question."),
          bullet("<strong>3. Best metric showing momentum.</strong> A number with context. Real numbers are required."),
          bullet("<strong>4. Three references we can cite.</strong> Customers, investors, or peers who'd vouch."),
          bullet("<strong>5. What does 'big' look like for VectorMail in 5 years?</strong> 60 words. We're looking for ambition + specificity."),
          sectionTitle("Submission"),
          bullet("Reply with answers in this email"),
          bullet("Include a high-res headshot (≥1500×1500, professional)"),
          bullet("Your responses are reviewed by 3 editors + our independent fact-checker"),
          bullet("If you make the final 30, we'll send a contributor agreement and a longer interview before press"),
          ctaRow([
            ctaButton("Download question PDF", { color: "#000000" }),
            ctaButton("Submit answers", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("Friday is the soft deadline. Send earlier if you want my editorial input on framing. Eligibility: under 30 as of January 1, 2026 (we'll verify)."),
          hr(),
          signature("Lucia Park", "Senior Editor · Forbes 30 Under 30", "lucia.park@forbes.com"),
        ]),
        summary: "Forbes 30U30 questionnaire. Action: complete by Friday.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-185",
        subject: "Re: Cap table cleanup",
        senderName: "Carta",
        senderEmail: "support@carta.com",
        daysAgo: 5,
        snippet: "Cap table cleanup is complete. New exports available.",
        body: email([
          brandBlock("Carta"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #0caa41; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Project complete · Cap table verified</span></div>`,
          headline("Your cap table cleanup is complete"),
          p(
            "The cap table reconciliation project you requested in April is now complete. Our team reviewed every instrument issued since incorporation, confirmed math against your board consents, and resolved <strong>17 discrepancies</strong> (mostly minor: rounding, missing 83(b) flags, and one orphaned SAFE without a signed document). Detail below.",
          ),
          metricGrid([
            { label: "Instruments reviewed", value: "147", sub: "all-time" },
            { label: "Discrepancies found", value: "17" },
            { label: "Resolved", value: "17", sub: "100%" },
            { label: "Investor types verified", value: "12 entities" },
            { label: "Option grants verified", value: "84" },
            { label: "Net change to fully diluted", value: "<0.01%", sub: "minor" },
          ]),
          sectionTitle("What we cleaned up"),
          bullet("8 rounding errors in option grants (resolved to nearest share)"),
          bullet("3 missing 83(b) election flags (employees confirmed elections were filed; updated metadata)"),
          bullet("1 orphaned SAFE (eventually located the signed copy in old DocuSign vault; reattached)"),
          bullet("5 historical option grants that had been forfeited but not deactivated in Carta (deactivated; pool returned)"),
          sectionTitle("Fully diluted cap table snapshot"),
          keyValBlock([
            { label: "Common stock outstanding", value: "9,200,000" },
            { label: "Preferred stock outstanding", value: "1,840,000 (Series A)" },
            { label: "SAFEs outstanding", value: "Daniel Brun ($500K) · Bryan Goldstein ($25K)" },
            { label: "Options outstanding", value: "1,432,000" },
            { label: "Options pool remaining", value: "182,400 shares" },
            { label: "Total fully diluted", value: "12,654,400 shares" },
          ]),
          sectionTitle("New exports available"),
          bullet("Cap table summary (PDF)"),
          bullet("Fully diluted cap table (Excel)"),
          bullet("Waterfall analysis at $90M, $180M, $360M, $720M post-money"),
          bullet("Detailed instrument log (every SAFE, option grant, and stock issuance)"),
          ctaRow([
            ctaButton("Open Carta dashboard", { color: "#0a2540" }),
            ctaButton("Download exports", { color: "#0a2540", variant: "outline" }),
          ]),
          fineprint("Your cap table is now audit-ready for Series B-level diligence. The clean state is preserved with automated daily reconciliation going forward."),
          companyEmailFooter("Carta"),
        ]),
        summary: "Cap table cleanup done. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-186",
        subject: "Vercel - Production deployment failed",
        senderName: "Vercel",
        senderEmail: "noreply@vercel.com",
        daysAgo: 1,
        hour: 23,
        snippet: "Production deployment of vectormail-ai failed at build step.",
        body: email([
          brandBlock("Vercel"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Production · Build failed</span></div>`,
          headline("vectormail-ai · production build failed"),
          p(
            `The latest commit to <strong>main</strong> failed at the build step. Production traffic is still being served by the previous successful deployment (<code>v2.41.2</code>); the broken build never reached the live URL. No customer impact, but the merge train is blocked until this is resolved.`,
          ),
          keyValBlock([
            { label: "Project", value: "vectormail-ai" },
            { label: "Environment", value: "Production" },
            { label: "Commit", value: "ad7c2f1 · 'fix(search): null-safe label filter'" },
            { label: "Author", value: "marcus@vectormail.app" },
            { label: "Branch", value: "main" },
            { label: "Currently live", value: "v2.41.2 · deployed 4 hours ago" },
            { label: "Build duration", value: "1m 42s · failed at 1m 38s" },
            { label: "Trigger", value: "Push to main · auto-deploy" },
          ]),
          sectionTitle("Build log · error"),
          codeBlock(
            `<span style="color: #f0883e;">[16:47:18]</span> Running "next build"<br/><span style="color: #f0883e;">[16:47:20]</span> Linting and checking validity of types...<br/><span style="color: #ff7b72;">[16:47:36]</span> Failed to compile.<br/><br/><span style="color: #ff7b72;">./src/server/api/routers/account-procedures/email-reading.ts:142:18</span><br/>Type error: Type 'undefined' is not assignable to type 'string'.<br/><br/>&nbsp;&nbsp;<span style="color: #8b949e;">140 |</span> const labels = email.sysLabels;<br/>&nbsp;&nbsp;<span style="color: #8b949e;">141 |</span> const id = email.id;<br/>&nbsp;&nbsp;<span style="color: #ff7b72;">142 |</span>&nbsp;&nbsp;return labels.includes(targetLabel);<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #ff7b72;">^^^^^^</span>`,
          ),
          sectionTitle("Recent activity"),
          logRow("16:42 PT", "Marcus merged PR #441 → main · 'fix(search): null-safe label filter'", { tone: "info" }),
          logRow("16:42 PT", "Vercel build triggered automatically", { tone: "info" }),
          logRow("16:47 PT", "Build failed · typecheck error", { tone: "danger" }),
          logRow("16:47 PT", "Marcus auto-notified via email + Slack", { tone: "info" }),
          sectionTitle("Suggested fix"),
          infoCard(
            "Add a null check on <code>email.sysLabels</code> at line 140 — the type was tightened in the recent Prisma upgrade. Once fixed, push directly to <code>main</code> or open a hotfix PR.",
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("View full build log", { color: "#000000" }),
            ctaButton("Open in editor", { color: "#000000", variant: "outline" }),
            ctaButton("Promote previous deploy", { color: "#000000", variant: "outline" }),
          ]),
          fineprint(
            "Build ID: dpl_8x3v9KqL2eZvKYlo2C · Team: vectormail-ai · You're receiving this because you're an Admin on the project. To stop these emails, edit notification preferences in Vercel.",
          ),
          companyEmailFooter("Vercel"),
        ]),
        summary: "Vercel deployment failed. Action: fix type error in PR.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-187",
        subject: "Customer reference call - confirmed",
        senderName: "Drew Hwang",
        senderEmail: "drew@northwindcorp.com",
        daysAgo: 1,
        hour: 17,
        snippet: "Confirmed the reference call with Sophia for Monday.",
        body: email([
          p("Hi,"),
          p(
            "Quick confirmation — <strong>Sophia (Brightlane) and I are locked in for the reference call Monday at 11 AM PT.</strong> Really appreciate the introduction; this kind of peer-to-peer conversation is what closes our procurement team. I'll do my best to make sure she has a quick, friction-free conversation.",
          ),
          sectionTitle("What I'm hoping to learn"),
          bullet("Real friction points in the first 30-60 days — Sophia mentioned in your intro she'd be honest about these, which is exactly what my CFO needs to hear"),
          bullet("How the migration went specifically (we're coming from Microsoft Copilot + Superhuman; she's coming from Superhuman alone)"),
          bullet("Decision factors that made the difference between 'try' and 'commit at scale'"),
          bullet("How she'd describe the procurement experience (this is the call that probably decides things on our side)"),
          sectionTitle("What I'll do post-call"),
          bullet("Send you and Sophia each a thank-you note within 2 hours"),
          bullet("Have a debrief with our security + procurement team Tuesday"),
          bullet("Move to final decision by Friday EOD if the call goes well (which I expect it will)"),
          bullet("Send you the formal commitment language by next Monday"),
          p(
            "Thanks again for connecting us. If anything changes on Sophia's end, easy for her to ping me directly — but I'm planning to send a calendar accept this evening and we'll lock it.",
          ),
          hr(),
          signature("Drew Hwang", "Director of IT, Productivity Tools · Northwind Corp", "drew@northwindcorp.com"),
        ]),
        summary: "Reference call confirmed. No action.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-188",
        subject: "Internal: Customer Slack channel ready",
        senderName: "Operations",
        senderEmail: "ops@vectormail.app",
        daysAgo: 3,
        snippet: "Connected #shared-brightlane Slack channel is live.",
        body: email([
          headline("Slack Connect channel · #shared-brightlane · live"),
          p(
            `Slack Connect channel <code>#shared-brightlane</code> is now active. We've added <strong>8 people on Brightlane's side</strong> and <strong>4 on ours</strong>. Aria has taken ownership of the daily presence on our side; channel guidelines are pinned in the first message.`,
          ),
          sectionTitle("Who's in the channel"),
          keyValBlock([
            { label: "Brightlane (8)", value: "Sophia Pereira (VP Eng) + 7 engineers from her three pods" },
            { label: "VectorMail (4)", value: "Aria (CS), Marcus (CTO), Nathan (eng), you (admin)" },
            { label: "Channel type", value: "Slack Connect (cross-org)" },
            { label: "Visibility", value: "Private to both organizations · external auditors cannot see" },
            { label: "Notifications", value: "Aria primary · we'll add a daily summary bot at 5 PM PT" },
          ]),
          sectionTitle("Channel guidelines (pinned)"),
          bullet("<strong>Use for:</strong> bug reports, feature requests, quick questions, status check-ins"),
          bullet("<strong>Don't use for:</strong> formal customer support tickets (use the support portal), security/compliance (use your AM), contract questions (route to Legal)"),
          bullet("<strong>Response time:</strong> we aim for ~2 business hours during PT business hours; we'll set expectations explicitly"),
          bullet("<strong>Daily summary bot:</strong> we'll send a daily digest at 5 PM PT recapping the day's threads"),
          sectionTitle("Why we did this"),
          p(
            "Brightlane is our largest customer by ARR and our most engaged by daily-feature usage. A shared channel gives us a forward-deployed presence — bugs surface faster, feature requests don't disappear into ticketing systems, and the relationship is structurally tighter. Recommendation: do this for our top 5 customers by Q3.",
          ),
          hr(),
          signature("Operations", "VectorMail · Internal", "ops@vectormail.app"),
        ]),
        summary: "Customer Slack Connect channel live. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-189",
        subject: "Brex - Card declined",
        senderName: "Brex",
        senderEmail: "alerts@brex.com",
        daysAgo: 2,
        snippet: "Card ending 1842 declined a $260 charge at Notion.",
        body: email([
          brandBlock("Brex"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Card declined · Likely policy</span></div>`,
          headline("Card ending 1842 was declined for a $260 charge at Notion"),
          p(
            "A charge attempt was just declined on one of your Brex cards. <strong>Not a fraud event</strong> — declined by your own spending policy, specifically the card's merchant-category allow list. If the charge was expected, you can either adjust the card's policy or use a different card with the right category enabled.",
          ),
          keyValBlock([
            { label: "Card", value: "Brex Visa •• 1842 (Marcus's primary card)" },
            { label: "Cardholder", value: "Marcus Liu" },
            { label: "Merchant", value: "Notion · charged via Stripe" },
            { label: "Amount", value: "$260.00 USD" },
            { label: "Time", value: "May 16, 2026 · 4:42 PM PT" },
            { label: "Decline reason", value: "Category 'software' not on this card's allow list" },
            { label: "Fraud risk", value: "Low (known merchant, in-region, within velocity limits)" },
          ]),
          sectionTitle("Why this card has the restriction"),
          infoCard(
            `Marcus's card has been set to 'travel + meals only' by policy — software purchases were intended to route through the operations team's card to consolidate vendor approvals. Either Marcus forgot to use the right card, or the policy needs adjustment.`,
            { tone: "info" },
          ),
          sectionTitle("Quick fixes"),
          bullet("<strong>Approve this specific charge</strong> · one-time override · charge gets processed in 30 seconds"),
          bullet("<strong>Add 'software' to the allow list</strong> · permanent, applies to future charges"),
          bullet("<strong>Have Marcus use the ops card instead</strong> · the way it was intended to work"),
          ctaRow([
            ctaButton("Approve this charge", { color: "#0f0f0f" }),
            ctaButton("Adjust card policy", { color: "#0f0f0f", variant: "outline" }),
            ctaButton("Message Marcus", { color: "#0f0f0f", variant: "outline" }),
          ]),
          fineprint("Notion will retry the charge automatically every 24 hours for 3 days. After that, your subscription will be flagged as past due."),
          companyEmailFooter("Brex"),
        ]),
        summary: "Brex card declined. Action: adjust allow list or use different card.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-190",
        subject: "Internal: Hiring plan locked",
        senderName: "Dana Howe",
        senderEmail: "dana@vectormail.app",
        daysAgo: 6,
        snippet: "Q3 hiring plan locked at 8 heads. Detail inside.",
        body: email([
          headline("Q3 hiring plan · locked at 8 heads"),
          p(
            "Hi,<br/><br/>Closing the loop on Q3 hiring planning. After board approval at the May meeting and three rounds of internal calibration with Lina, <strong>we're locked at 8 hires through end of Q3</strong>. Detail below. Job posts going up this week; recruiting kicks off Monday.",
          ),
          sectionTitle("The 8 hires · ranked by start-date target"),
          keyValBlock([
            { label: "1. Senior Backend Engineer (L5)", value: "Already in motion · Nathan Wu offer out · target June 9 start" },
            { label: "2. Senior Backend Engineer (L5)", value: "Mei Lin in pipeline · target start: July 1" },
            { label: "3. Staff Engineer (L6)", value: "Sourcing now · target start: August 4" },
            { label: "4. Senior Backend Engineer (L5)", value: "Replacement for upcoming maternity leave · target start: July 14" },
            { label: "5. Customer Success Manager", value: "Reports to Aria · target start: July 1" },
            { label: "6. Customer Success Manager", value: "Backfill + capacity · target start: August 1" },
            { label: "7. Senior Product Designer", value: "Reports to Taylor · target start: August 11" },
            { label: "8. Marketing hire (level TBD)", value: "Will define with Lina after eng hires close · target start: September 1" },
          ]),
          sectionTitle("Comp bands locked"),
          bullet("<strong>Senior Engineer (L5):</strong> $210K-235K base + 0.30-0.45% equity"),
          bullet("<strong>Staff Engineer (L6):</strong> $250K-285K base + 0.50-0.75% equity"),
          bullet("<strong>Senior CS Manager:</strong> $145K-165K base + 0.10-0.15% equity"),
          bullet("<strong>Senior Designer:</strong> $180K-200K base + 0.20-0.30% equity"),
          sectionTitle("Sourcing strategy"),
          bullet("3 of 8 are referrals (in pipeline now or expected)"),
          bullet("2 are passive sourcing (Lina + outbound)"),
          bullet("3 are inbound from the public job posts"),
          sectionTitle("Budget impact"),
          p(
            "Total annual run-rate impact at full vest: ~$1.65M cash + ~3.4% equity dilution. Fully baked into the Q3 board model.",
          ),
          hr(),
          signature("Dana Howe", "Head of Engineering · VectorMail", "dana@vectormail.app"),
        ]),
        summary: "Q3 hiring plan locked at 8 heads. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-191",
        subject: "Slack - Mentioned in #all-eng",
        senderName: "Slack",
        senderEmail: "notifications@slack.com",
        daysAgo: 0,
        hour: 14,
        snippet: "Marcus mentioned you in #all-eng.",
        body: email([
          brandBlock("Slack"),
          headline("You were mentioned in #all-eng"),
          p(
            `Marcus mentioned you in the <strong>VectorMail HQ</strong> Slack workspace. Here's what you missed:`,
          ),
          `<div style="margin: 0 0 18px 0; padding: 16px 18px; background: #f8f9fa; border: 1px solid #ececec; border-radius: 10px;">`,
          `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 10px;"><tr><td style="width: 44px; padding-right: 12px; vertical-align: top;"><div style="width: 36px; height: 36px; background: #4a154b; color: #ffffff; border-radius: 6px; font-size: 14px; font-weight: 700; text-align: center; line-height: 36px;">ML</div></td><td style="vertical-align: top;"><div style="font-size: 14.5px; font-weight: 600; color: #1f1f1f; margin-bottom: 2px;">Marcus Liu <span style="font-size: 12px; color: #80868b; font-weight: 400;">· #all-eng · 2:14 PM PT</span></div><div style="font-size: 14.5px; color: #1f1f1f; line-height: 1.5;"><span style="color: #1264a3; font-weight: 600;">@demo</span> — we're shipping the <strong>pgvector migration</strong> today. Could you take a quick pass on the rollout doc before 5 PM? Two questions inline that I want your call on (the dual-write window + whether to keep Pinecone live as a kill-switch for the first 48h).</div><div style="font-size: 13px; color: #1264a3; margin-top: 8px;">📎 <a href="#" style="color: #1264a3; text-decoration: none;">rollout-pgvector-2026-05-17.md</a> · 3 KB</div></td></tr></table>`,
          `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #ececec; font-size: 12.5px; color: #5f6368;">Thread: 4 replies · Reactions: 👀 3 · ✅ 1 · Last reply 12 min ago</div>`,
          `</div>`,
          sectionTitle("Recent thread replies"),
          bullet(`<strong>Elena Vargas</strong> · 'I'll do the dual-write piece. Plan is to mirror writes to both indexes for 7 days, decide on cutover after.'`),
          bullet(`<strong>Nathan Wu</strong> · 'Kill-switch makes sense. We can flip via env var, no deploy needed.'`),
          bullet(`<strong>Aria Singh</strong> · 'CS impact looks minimal. I'll have the support runbook ready by 5.'`),
          bullet(`<strong>Marcus Liu</strong> · '+1, then we go at 6 PM. Cool with you @demo?'`),
          ctaRow([
            ctaButton("Reply in Slack", { color: "#4a154b" }),
            ctaButton("Open rollout doc", { color: "#1264a3", variant: "outline" }),
          ]),
          fineprint(
            "Workspace: vectormail.slack.com · You're receiving this because you're mentioned and not active in Slack. To stop, update your notification settings.",
          ),
          companyEmailFooter("Slack"),
        ]),
        summary: "Slack mention - pgvector rollout. Action: review rollout doc.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-192",
        subject: "Re: Office space tour",
        senderName: "WeWork",
        senderEmail: "broker@wework.com",
        daysAgo: 8,
        snippet: "Tour confirmed for the 4th floor space at 535 Mission.",
        body: email([
          p("Hi,"),
          p(
            "Tour confirmed for the <strong>4th floor space at 535 Mission</strong> on Wednesday at 1:00 PM PT. Property details below — you'll meet me on the 1st floor lobby, then we'll go up together. Tour usually takes 45 minutes including time for questions.",
          ),
          sectionTitle("Property details · 535 Mission · 4th floor"),
          keyValBlock([
            { label: "Square footage", value: "~4,200 sq ft" },
            { label: "Layout", value: "28 dedicated desks · 2 phone rooms · kitchenette · meeting room" },
            { label: "Asking", value: "$42,000/month · 24-month lease" },
            { label: "Includes", value: "Furniture, conference room access (shared), high-speed internet, cleaning" },
            { label: "Does not include", value: "Coffee, lunches, mail handling (add-on services)" },
            { label: "Available", value: "June 1, 2026" },
            { label: "Move-in cost", value: "First + last month deposit ($84K) + $5K admin fee" },
          ]),
          sectionTitle("Suggested questions to ask during the tour"),
          bullet("HVAC + comfort (4th floor faces south — afternoon sun is real)"),
          bullet("Internet speed + redundancy (most WeWork floors share a single 1Gbps line)"),
          bullet("Noise (Mission Street side has Muni traffic; ask about the kitchenette wall)"),
          bullet("Security after-hours (badge-in, cameras, who has access)"),
          bullet("Move-out provisions (early-termination penalty if you outgrow it before 24 months)"),
          sectionTitle("Comparables I've shown you"),
          bullet("<strong>500 Bryant</strong> · $39K/mo · slightly smaller, similar build · we toured last week"),
          bullet("<strong>600 California</strong> · $48K/mo · bigger but the location is worse for your team"),
          bullet("<strong>This one (535 Mission)</strong> · $42K/mo · best location-to-price · my pick if it shows well"),
          p(
            "If you like the space, I'd recommend deciding within 5 business days — there's another team in the queue. See you Wednesday.",
          ),
          hr(),
          signature("Alex Reyes", "Commercial Broker · WeWork", "broker@wework.com"),
        ]),
        summary: "Office tour confirmed Wed. Action: attend.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-193",
        subject: "Customer success - playbook review",
        senderName: "Aria Singh",
        senderEmail: "aria@vectormail.app",
        daysAgo: 7,
        snippet: "Refreshed the CS playbook. Comments?",
        body: email([
          headline("Customer Success Q3 playbook · refreshed · open for comments"),
          p(
            "Hi,<br/><br/>I've finished the Q3 refresh of the CS playbook based on what we learned from the DataPipe escalation and the Loop AI save call this quarter. Three meaningful changes; rest is editorial polish. Want your eyes on it before I share with the rest of the team Monday.",
          ),
          sectionTitle("Three changes that matter"),
          infoCard(
            `<strong>1. Churn-risk trigger moved from 14 → 7 days of zero logins</strong><br/><span style="color: #5f6368; font-size: 13px;"><strong>Why:</strong> Loop AI dropped to zero usage on day 4. By the time we triggered the playbook at day 14, the relationship had calcified. 7 days catches it while there's still curiosity left in the conversation. Auto-tested in our churn model — 7 days catches 87% of eventual churners vs 72% at 14 days, with only 11% false-positive rate.</span>`,
            { accent: "#1F3A2E" },
          ),
          infoCard(
            `<strong>2. Save call protocol · formalized</strong><br/><span style="color: #5f6368; font-size: 13px;">Previously each CS rep ran them differently. Now standardized: prep doc, 30-min cadence, on-call engineering presence when there's a technical component, written follow-up within 4 hours. Sample save call deck attached.</span>`,
            { accent: "#1F3A2E" },
          ),
          infoCard(
            `<strong>3. QBR cadence · monthly for top 10 accounts</strong><br/><span style="color: #5f6368; font-size: 13px;">Quarterly was leaving too much room for surprise. Monthly check-ins are 30 minutes, focused on one thing: 'what's changed since last time?' Lighter than a traditional QBR but compounds into much better intel.</span>`,
            { accent: "#1F3A2E" },
          ),
          sectionTitle("Smaller updates"),
          bullet("Refreshed all email templates for tone consistency"),
          bullet("Added DataPipe lessons learned as a postmortem appendix"),
          bullet("Updated escalation matrix · who calls who at what severity"),
          bullet("New onboarding checklist (60-day version) · used for Northglade and refined"),
          bullet("CS-to-engineering loop · how we close it without bottlenecking either side"),
          sectionTitle("Where to find it"),
          p(
            `Doc: <a href="#" style="color: #1a73e8; text-decoration: none; font-weight: 500;">Q3 CS playbook · refresh draft</a> in the shared drive. ~40 pages. The TL;DR is on page 2.`,
          ),
          p("Aiming to ship Monday EOD. Comments by Sunday EOD please."),
          hr(),
          signature("Aria Singh", "Customer Success Lead · VectorMail", "aria@vectormail.app"),
        ]),
        summary: "CS playbook update. Action: review and comment.",
        labels: [labelImportant],
        read: true,
      },
      {
        id: "demo-thread-194",
        subject: "Re: AI tooling spend review",
        senderName: "Finance",
        senderEmail: "finance@vectormail.app",
        daysAgo: 9,
        snippet: "AI spend in May trending toward $11K. Driver: production embedding throughput.",
        body: email([
          headline("AI tooling spend · May trending 57% over budget"),
          p(
            "Hi,<br/><br/>Quick heads-up before month-end close: <strong>our AI-tooling spend in May is on track to hit ~$11K against a $7K budget</strong> (+57% over). I want to flag this now so we can decide on a lever before the books close on Friday and the variance shows up in the board materials.",
          ),
          bigStat("Projected May spend", "$10,840 · 57% over", { color: "#f59e0b" }),
          sectionTitle("Where it's going"),
          keyValBlock([
            { label: "OpenAI · embeddings", value: "$5,200 · 78% of overage" },
            { label: "OpenAI · GPT-4o-mini (Buddy)", value: "$2,400 · slightly above plan" },
            { label: "Anthropic · Claude Opus", value: "$1,180" },
            { label: "OpenRouter · multi-model eval", value: "$840" },
            { label: "Other (Gemini for embeddings backup)", value: "$220" },
            { label: "Total", value: "$10,840 · vs $7,000 budget" },
          ]),
          sectionTitle("Driver"),
          infoCard(
            `<strong>Production embedding throughput tripled after the new search index rolled out 22 days ago.</strong> Our average search query now generates 3 embeddings (query + 2 expansion variants) where it used to generate 1. Volume × 3 = cost × 3. Search query volume itself is also up 12% MoM, which compounds the bill.`,
            { tone: "warn" },
          ),
          sectionTitle("Three levers · pick one"),
          bullet("<strong>1. Switch primary embedding model to text-embedding-3-small.</strong> Saves ~$3,500/mo. Quality drop measured at 1.8 pp on our eval set — at the edge of acceptable. Marcus's recommendation."),
          bullet("<strong>2. Cap free-tier user search volume at 50/day.</strong> Saves ~$2,800/mo. Customer-facing change; needs PM input."),
          bullet("<strong>3. Raise the AI budget to $12K for the rest of Q2.</strong> No quality impact, but variance bleeds into Q3 model and board narrative."),
          sectionTitle("My recommendation"),
          p(
            "<strong>Combination of 1 and 3.</strong> Switch to <code>text-embedding-3-small</code> for the lower-stakes paths (search expansion, batch indexing) and keep <code>text-embedding-3-large</code> for the customer-facing primary query. Saves ~$2,200/mo with negligible quality impact. Raise the budget to $9K to absorb the rest cleanly.",
          ),
          p("Need your sign-off by Wednesday to land it before month-end close."),
          hr(),
          signature("Finance", "VectorMail · Internal finance team", "finance@vectormail.app"),
        ]),
        summary: "AI spend over budget. Action: decide on lever before month-end.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-195",
        subject: "Notion - 3 page comments",
        senderName: "Notion",
        senderEmail: "notifications@notion.so",
        daysAgo: 2,
        snippet: "3 new comments on pages you own.",
        body: email([
          brandBlock("Notion"),
          headline("3 new comments on pages you own"),
          p(
            `New comments need your attention on pages where you're the page owner. Below in order of recency. Tap any to jump straight to the comment thread in Notion.`,
          ),
          sectionTitle("Q3 OKRs · 1 comment"),
          infoCard(
            `<div style="font-size: 14px; color: #1f1f1f; margin-bottom: 6px;"><strong>Dana Howe</strong> · 14 hours ago</div><div style="font-size: 13.5px; color: #5f6368; line-height: 1.5;">"Tagged you because I want a call on whether pricing experiments roll up under Marketing or Product for Q3. Different incentives apply. My slight lean: Product, because the customer-impact is more direct than the funnel-impact. But your call."</div>`,
            { accent: "#000000" },
          ),
          sectionTitle("Customer Onboarding · 1 comment"),
          infoCard(
            `<div style="font-size: 14px; color: #1f1f1f; margin-bottom: 6px;"><strong>Aria Singh</strong> · 2 days ago</div><div style="font-size: 13.5px; color: #5f6368; line-height: 1.5;">"After the Northglade onboarding win, I'd like to update this doc with the 'pre-onboarding workshop' addition I described. Heads up I'll likely do this Monday — let me know if you want to weigh in first."</div>`,
            { accent: "#000000" },
          ),
          sectionTitle("Pricing Reset · 1 comment"),
          infoCard(
            `<div style="font-size: 14px; color: #1f1f1f; margin-bottom: 6px;"><strong>Marketing</strong> · 1 day ago</div><div style="font-size: 13.5px; color: #5f6368; line-height: 1.5;">"Variant B is at 100% as of Tuesday. Want to update the doc with actual production numbers — should I write the post-experiment summary section here, or in a separate doc? Lightly preferring keeping it together for context."</div>`,
            { accent: "#000000" },
          ),
          ctaRow([
            ctaButton("Open all 3", { color: "#000000" }),
            ctaButton("Mark all read", { color: "#000000", variant: "outline" }),
          ]),
          fineprint("Notion sends a daily digest of unresolved comments on pages where you're an owner or watcher. Manage frequency in Settings → Notifications."),
          companyEmailFooter("Notion"),
        ]),
        summary: "Notion comment digest. Action: review comments.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-196",
        subject: "Slack Connect - Brightlane channel paused",
        senderName: "Slack",
        senderEmail: "notifications@slack.com",
        daysAgo: 1,
        hour: 12,
        snippet: "Slack Connect channel #shared-brightlane has been paused.",
        body: email([
          brandBlock("Slack"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #f59e0b; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Slack Connect · Channel paused</span></div>`,
          headline("#shared-brightlane was paused by Brightlane's admin"),
          p(
            `A Slack admin on the <strong>Brightlane</strong> side has paused the shared connect channel <code>#shared-brightlane</code>. No messages can be sent or received until they reactivate it. <strong>This is not necessarily a relationship issue</strong> — paused channels are common when companies do internal cleanup or update their Slack Connect policies. But worth a soft check-in.`,
          ),
          keyValBlock([
            { label: "Channel", value: "#shared-brightlane" },
            { label: "Status", value: "Paused (not deleted)" },
            { label: "Paused by", value: "Brightlane admin (we can't see exactly who)" },
            { label: "Paused at", value: "Today · 12:18 PM PT" },
            { label: "Messages while paused", value: "Queued · delivered when reactivated" },
            { label: "Our presence", value: "Aria + 3 others remain in the channel" },
          ]),
          sectionTitle("Common reasons admins pause channels"),
          bullet("<strong>Slack Connect policy update</strong> — they're refreshing their company-wide policy and pausing all connect channels temporarily"),
          bullet("<strong>Security review</strong> — periodic audit of who has external access"),
          bullet("<strong>Internal escalation</strong> — they're cleaning up shared spaces while resolving an internal issue (could be neutral)"),
          bullet("<strong>Relationship signal</strong> — they're consciously pulling back · the rarest reason in our experience"),
          sectionTitle("Suggested action"),
          p(
            `<strong>Soft check-in from Aria.</strong> Direct message to Sophia, light tone, 'noticed our shared channel got paused — anything I should know about, or just internal cleanup on your side?' Most pauses are benign; we want to know fast if it's not.`,
          ),
          ctaRow([
            ctaButton("Open channel info", { color: "#4a154b" }),
            ctaButton("Message Sophia directly", { color: "#4a154b", variant: "outline" }),
          ]),
          fineprint("Channel will resume normal function the moment Brightlane reactivates it. Queued messages will deliver in order."),
          companyEmailFooter("Slack"),
        ]),
        summary: "Customer Slack channel paused. Action: check in with Sophia about why.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-197",
        subject: "GitHub - Repo invitation",
        senderName: "GitHub",
        senderEmail: "noreply@github.com",
        daysAgo: 5,
        snippet: "Nathan Wu invited you to vectormail-ai/research.",
        body: email([
          brandBlock("GitHub"),
          headline("Nathan Wu invited you to vectormail-ai/research"),
          p(
            `<strong>Nathan Wu</strong> (nathan-wu-yc) has invited you to the <strong>vectormail-ai/research</strong> repository as a <strong>Maintainer</strong>. The repo is our private research codebase where we prototype agentic + retrieval ideas before they're proposed for production.`,
          ),
          profileCard({
            name: "Nathan Wu",
            title: "nathan-wu-yc",
            company: "Senior Engineer · VectorMail (starts June 9)",
            initials: "NW",
            accent: "#0969da",
            rightLabel: "Invited",
          }),
          keyValBlock([
            { label: "Repository", value: "vectormail-ai/research" },
            { label: "Type", value: "Private · org-only access" },
            { label: "Permission offered", value: "Maintainer · can manage settings, push to all branches, manage collaborators" },
            { label: "Invited by", value: "Nathan Wu · 2 days ago" },
            { label: "Invitation expires", value: "May 24, 2026 (in 5 days)" },
            { label: "Current collaborators", value: "Marcus, Elena, Nathan (+ you when accepted)" },
          ]),
          sectionTitle("Why this repo exists (heads-up)"),
          p(
            "Marcus + Nathan have been running their pre-production experimentation in this repo. Recent branches include: a Claude-3.5 retrieval comparison, a paged-retrieval algorithm for 1M-token context, and a 'simulated agent runbook' for testing tool-use chains. Worth seeing what's brewing.",
          ),
          ctaRow([
            ctaButton("Accept invitation", { color: "#1f883d" }),
            ctaButton("View repository", { color: "#24292f", variant: "outline" }),
            ctaButton("Decline", { color: "#80868b", variant: "outline" }),
          ]),
          fineprint("This invitation expires in 5 days. If you accept, you'll have full Maintainer access immediately. Decline if you'd prefer not to be in the loop on research work."),
          companyEmailFooter("GitHub"),
        ]),
        summary: "GitHub repo invite. Action: accept.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-198",
        subject: "Re: Engineering blog post",
        senderName: "Marcus Liu",
        senderEmail: "marcus@vectormail.app",
        daysAgo: 6,
        snippet: "Draft of the pgvector migration blog post is ready.",
        body: email([
          headline("Draft: 'How and why we replaced Pinecone with pgvector' · ready for review"),
          p(
            `Hi,<br/><br/>Draft of the <strong>pgvector migration blog post</strong> is ready. ~2,200 words, walks through why we left Pinecone, the migration plan, recall benchmarks at our scale, and the cost outcome (70% reduction, ~$3,000/mo saved). My goal with this piece is twofold: (1) tell the story honestly, (2) make it something other Series A AI companies can use as a decision template.`,
          ),
          sectionTitle("Structure of the piece"),
          bullet("<strong>Intro · why we moved.</strong> 350 words. Not anti-Pinecone — we just outgrew the trade-offs they're optimized for."),
          bullet("<strong>Decision framework.</strong> 500 words. The 6 questions we asked. Honest about where Pinecone would still be the right answer."),
          bullet("<strong>Migration architecture.</strong> 600 words. Dual-write window, the canary cutover, the kill-switch we kept for 48 hours."),
          bullet("<strong>Recall benchmarks at our scale.</strong> 400 words + 3 charts. HNSW vs IVFFlat vs Pinecone. Real numbers."),
          bullet("<strong>Cost outcome.</strong> 200 words. The 70% reduction story."),
          bullet("<strong>What we'd do differently.</strong> 150 words. Two specific mistakes."),
          sectionTitle("Why publish this"),
          bullet("Recruiting · senior engineers respond well to 'they ship hard things' content"),
          bullet("Sales · enterprise customers are evaluating us on technical credibility"),
          bullet("Partnership conversations (e.g., the Linear one) come from technical credibility content"),
          bullet("Honest community-building · this conversation needed someone to do it well"),
          sectionTitle("Timing"),
          p(
            "<strong>Aim to publish Tuesday next week.</strong> Same day as the pgvector GA announcement we're shipping in-product. Two posts feed each other; the blog reads as 'this is real, here's the homework' and the announcement reads as 'we just did it.' Both link.",
          ),
          sectionTitle("What I need from you"),
          bullet("Read by <strong>Sunday EOD</strong> · don't edit yet, just react"),
          bullet("Sharp pushback on framing if you have it — easier to revise the argument now than later"),
          bullet("Note any specifics that would be too revealing (we name-check OpenRouter and Aurinko; thought about it, but think it's fine)"),
          ctaRow([
            ctaButton("Open the draft", { color: "#1F3A2E" }),
            ctaButton("Comment template", { color: "#1F3A2E", variant: "outline" }),
          ]),
          hr(),
          signature("Marcus Liu", "CTO · VectorMail", "marcus@vectormail.app"),
        ]),
        summary: "Engineering blog draft. Action: read + edit by Sunday.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-199",
        subject: "Datadog - SLO breach (search.latency)",
        senderName: "Datadog",
        senderEmail: "alerts@datadog.com",
        daysAgo: 0,
        hour: 18,
        snippet: "search.latency.p95 SLO breached for 12 min.",
        body: email([
          brandBlock("Datadog"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">P1 · SLO Breach</span></div>`,
          headline("search.latency.p95 burned through 73% of error budget in 12 minutes"),
          p("An SLO monitor on the <strong>vectormail-api</strong> service crossed its threshold and burned through a large portion of this month's error budget. The breach has self-resolved, but the burn rate spiked to 14.2x normal — well above the 6x page threshold — so this is recorded as a P1 incident."),
          metricGrid([
            { label: "Service", value: "vectormail-api", sub: "us-west-2 · prod" },
            { label: "SLO target", value: "p95 ≤ 400ms" },
            { label: "Peak observed", value: "1,247ms", sub: "+847ms over" },
            { label: "Duration", value: "12m 14s" },
            { label: "Burn rate", value: "14.2×", sub: "page at 6×" },
            { label: "Budget left", value: "27%", sub: "down from 100%" },
          ]),
          sectionTitle("Timeline (PT)"),
          logRow("17:48:21", "search.latency.p95 crossed 400ms threshold", { tone: "warn" }),
          logRow("17:48:52", "Auto-paged primary on-call (Marcus Liu)", { tone: "warn" }),
          logRow("17:51:08", "Marcus acknowledged the page", { tone: "info" }),
          logRow("17:53:40", "Correlated with deploy build #2247 (5 min earlier)", { tone: "info" }),
          logRow("17:57:15", "Rollback initiated for build #2247", { tone: "info" }),
          logRow("18:00:22", "Latency recovered to baseline (p95 = 312ms)", { tone: "ok" }),
          logRow("18:00:35", "SLO monitor recovered", { tone: "ok" }),
          sectionTitle("Correlated change"),
          infoCard(
            `<strong>Build #2247</strong> — <span style="font-family: ${MONO_STACK}; font-size: 13px;">feat: parallel embedding fetch in /api/search</span><br/><span style="color: #5f6368; font-size: 13px;">Deployed at 17:43 PT by elena-vargas · rolled back at 17:57 PT</span>`,
            { tone: "info" },
          ),
          sectionTitle("Suspected root cause"),
          p(
            "The parallel embedding fetch introduced an <em>unbounded</em> Promise.all over the result set. For queries returning &gt; 200 results the embedding worker pool saturated, and downstream latency spiked. Single-query traces are linked in the dashboard.",
          ),
          sectionTitle("Recommended next steps"),
          bullet("Re-land with a concurrency limiter (Marcus already has a draft in #search-perf)."),
          bullet("Add an SLO alarm on embedding-pool saturation as a leading indicator."),
          bullet("Open a postmortem in Notion — incident ID INC-0142."),
          ctaRow([
            ctaButton("Open in Datadog", { color: "#632ca6" }),
            ctaButton("View traces", { color: "#632ca6", variant: "outline" }),
            ctaButton("Acknowledge in PagerDuty", { color: "#06ac38", variant: "outline" }),
          ]),
          fineprint(
            "Monitor: <code>vectormail-api.slo.search.latency.p95</code> · Threshold: 400ms (5-minute window) · Page threshold: 6× burn",
          ),
          companyEmailFooter("Datadog"),
        ]),
        summary: "Datadog SLO breach. Action: investigate root cause.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-200",
        subject: "Re: Coffee with Hana",
        senderName: "Hana Cho",
        senderEmail: "hana@forerunnervc.com",
        daysAgo: 2,
        snippet: "Locking in Tuesday 4 PM at Sightglass.",
        body: email([
          p("Hi,"),
          p("Locking in Tuesday 4 PM at Sightglass (4th & Folsom). See you then."),
          hr(),
          signature("Hana"),
        ]),
        summary: "Coffee with Hana confirmed Tue 4 PM. No action.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-201",
        subject: "Re: Year-end giving",
        senderName: "GiveDirectly",
        senderEmail: "no-reply@givedirectly.org",
        daysAgo: 8,
        snippet: "Receipt for your $1,000 donation.",
        body: email([
          brandBlock("GiveDirectly"),
          headline("Thank you — your donation receipt"),
          p(
            "Thank you so much for your generosity. Your <strong>$1,000 donation</strong> to <strong>GiveDirectly</strong> has been received and will be wired directly to families living in extreme poverty as part of our next disbursement cycle. Tax receipt is attached for your records.",
          ),
          bigStat("Amount donated", "$1,000.00", { color: "#0a3d2a" }),
          keyValBlock([
            { label: "Donor", value: "Demo User" },
            { label: "Date", value: "May 9, 2026" },
            { label: "Payment method", value: "Brex Visa •• 1842" },
            { label: "Designation", value: "Unrestricted (most flexible — what we recommend)" },
            { label: "Tax-deductible", value: "Yes · 100% of donation (we don't take overhead from individual gifts)" },
            { label: "EIN", value: "27-1661997" },
            { label: "Receipt #", value: "GD-2026-1841237" },
          ]),
          sectionTitle("Where your $1,000 goes"),
          bullet("<strong>91% direct cash transfer</strong> to families in Kenya, Uganda, or Liberia (recipient's choice)"),
          bullet("<strong>5% mobile money + delivery fees</strong> · we publish this transparently"),
          bullet("<strong>4% operational costs</strong> · staff, M&E, recipient services"),
          sectionTitle("Specifically, $910 of your donation will reach families"),
          p(
            `Based on current operating ratios, your $1,000 translates to <strong>$910 in direct cash transfers</strong>. That's enough for ~3 families to receive a one-time grant that doubles their annual income, or for ~6 families to get a 12-month basic income supplement. Your impact will be tracked and reported back to you in our quarterly impact report.`,
          ),
          ctaRow([
            ctaButton("Download tax receipt", { color: "#0a3d2a" }),
            ctaButton("View impact dashboard", { color: "#0a3d2a", variant: "outline" }),
          ]),
          fineprint("GiveDirectly · 80 Broad St, Suite 403, New York, NY 10004 · 501(c)(3) public charity · EIN 27-1661997 · GuideStar Platinum certified · Top-rated by Charity Navigator and GiveWell"),
          companyEmailFooter("GiveDirectly"),
        ]),
        summary: "Donation receipt. No action - forward to accountant.",
        labels: [labelUpdates],
        read: true,
      },
      {
        id: "demo-thread-202",
        subject: "Re: Bookkeeping sync - May close",
        senderName: "Pilot",
        senderEmail: "books@pilot.com",
        daysAgo: 4,
        snippet: "May books closing on schedule. One question about a $4,200 vendor charge.",
        body: email([
          p("Hi,"),
          p(
            "Heads up — <strong>May books are closing on schedule.</strong> We'll have a clean trial balance ready for you by Wednesday May 28. One small categorization question I want to surface so we can close cleanly:",
          ),
          sectionTitle("The question"),
          infoCard(
            `<strong>$4,200 vendor charge labeled 'Cobalt Q2'</strong> on May 14 to Cobalt Labs, Inc.<br/><br/><strong>Default classification:</strong> Professional Services<br/><strong>Should it be:</strong> Security Ops?<br/><br/>If this is the Q2 penetration test (which I'm 95% sure of given the timing + amount), we usually classify it as <strong>Security Ops</strong> for two reasons: (1) it's an operating expense tied to security posture, not consulting; (2) it matters for SOC 2 audit evidence later.`,
            { tone: "info" },
          ),
          sectionTitle("Other minor categorization questions for May (3)"),
          bullet("<strong>Cobalt Q2</strong> · $4,200 · default 'Professional Services' · proposed 'Security Ops' — needs your confirm"),
          bullet("<strong>20VC honorarium</strong> · $0 (no charge, but recorded as income for Q3) · should record as Marketing income vs Other"),
          bullet("<strong>Backstage Capital community fees</strong> · $0 (free) · no journal entry needed unless you want to track the value"),
          sectionTitle("Close timeline"),
          bullet("Wednesday May 28 · Trial balance to you for review"),
          bullet("Friday May 30 · Adjusting journal entries (if any)"),
          bullet("Saturday May 31 · Books locked · monthly reports auto-generated"),
          bullet("Monday June 2 · Financial package emailed to you, the board, and counsel"),
          p("If you have 30 seconds to confirm the Cobalt categorization, I can finalize without needing further input from you on this month."),
          hr(),
          signature("Pilot Bookkeeping", "Pilot · Your accounting team", "books@pilot.com"),
        ]),
        summary: "Pilot bookkeeping question. Action: confirm category for $4,200 charge.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-203",
        subject: "Hubspot - Lead scored hot",
        senderName: "Hubspot",
        senderEmail: "noreply@hubspot.com",
        daysAgo: 1,
        hour: 15,
        snippet: "Anabel from Cypher Industries is now a hot lead (score: 91).",
        body: email([
          brandBlock("Hubspot"),
          `<div style="margin: 0 0 16px 0;"><span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; border-radius: 4px; letter-spacing: 0.4px; text-transform: uppercase;">Hot lead · Score 91 · 24h SLA</span></div>`,
          headline("Anabel Reyes crossed the hot-lead threshold"),
          p(
            "A lead just scored 91 — the highest score in your pipeline this week. Two of the highest-weight rules fired simultaneously (pricing-page-visit + demo-request), which is rare and almost always converts.",
          ),
          profileCard({
            name: "Anabel Reyes",
            title: "Head of Operations",
            company: "Cypher Industries · 180 employees",
            initials: "AR",
            accent: "#ff7a59",
            rightLabel: "Hot",
          }),
          metricGrid([
            { label: "Lead score", value: "91", sub: "Hot ≥ 80" },
            { label: "Account size", value: "180 emp", sub: "ICP match" },
            { label: "ICP fit", value: "Tier 1", sub: "all 6 criteria" },
            { label: "Time to lead", value: "47 min", sub: "site → form" },
            { label: "Engagement", value: "High", sub: "11 sessions" },
            { label: "Owner", value: "Unassigned", sub: "round-robin" },
          ]),
          sectionTitle("How she got here (last 14 days)"),
          logRow("May 04", "Read 'AI Inbox for SaaS Ops' blog post · 3 min", { tone: "info" }),
          logRow("May 06", "Visited /pricing · scrolled to Enterprise tier", { tone: "info" }),
          logRow("May 09", "Returned to /pricing · spent 4 min · viewed FAQ", { tone: "info" }),
          logRow("May 12", "Watched 80% of homepage walkthrough video", { tone: "info" }),
          logRow("May 15", "Visited /security · downloaded SOC 2 report", { tone: "info" }),
          logRow("May 16", "Filled out demo request form · 47 min on /pricing first", { tone: "ok" }),
          sectionTitle("Account fit · 6/6 ICP signals"),
          bullet("Industry: SaaS Operations · Tier 1 vertical for you"),
          bullet("Headcount: 180 · within band (100–500)"),
          bullet("Tech stack: Notion, Slack, Stripe — overlaps with 80% of customers"),
          bullet("LinkedIn: scaling Ops team (3 hires in last 90 days)"),
          bullet("Funding: Series B, $80M raised — well-resourced"),
          bullet("Geography: SF Bay Area · same-zone with your team"),
          sectionTitle("Suggested outreach"),
          infoCard(
            `Don't lead with the demo — she's already opted in. Lead with the customer story most relevant to her (Brightlane has the same headcount + similar tech stack). Drop into <code>#sales-hot-leads</code> for routing or claim directly.`,
            { tone: "info" },
          ),
          ctaRow([
            ctaButton("Claim lead", { color: "#ff7a59" }),
            ctaButton("View full profile", { color: "#ff7a59", variant: "outline" }),
            ctaButton("Book meeting", { color: "#ff7a59", variant: "outline" }),
          ]),
          fineprint(
            "Sales SLA: hot leads must be claimed within 4 business hours and outreach sent within 24 hours. Lead score recalculates every 5 minutes based on activity.",
          ),
          companyEmailFooter("Hubspot"),
        ]),
        summary: "Hot inbound lead. Action: reach out within 24h.",
        labels: [labelImportant],
        read: false,
      },
      {
        id: "demo-thread-204",
        subject: "Re: Office hours bookings",
        senderName: "VectorMail",
        senderEmail: "founder@vectormail.app",
        daysAgo: 3,
        snippet: "Founder office hours: 4 new bookings this week.",
        body: email([
          brandBlock("VectorMail"),
          headline("Founder office hours · 4 new bookings this week"),
          p(
            "Four people booked your founder office hours slot this week. Brief context on each below so you can prep with 5 minutes per. Notes-bot pulled their LinkedIn + any prior touches from our CRM.",
          ),
          sectionTitle("Tue · 9:00 AM PT · 30 min"),
          profileCard({
            name: "Anabel Reyes",
            title: "Head of Operations",
            company: "Cypher Industries · 180 emp",
            initials: "AR",
            accent: "#1F3A2E",
            rightLabel: "Hot lead",
          }),
          bullet("Context: scored Hot in HubSpot two days ago · pricing page visits, watched walkthrough, downloaded SOC 2"),
          bullet("Prep: lean on the customer story (Brightlane is the closest match)"),
          sectionTitle("Wed · 4:00 PM PT · 30 min"),
          profileCard({
            name: "Phil Carter",
            title: "Founder & CEO",
            company: "HazelStudio · early-stage design tool",
            initials: "PC",
            accent: "#1F3A2E",
            rightLabel: "Founder",
          }),
          bullet("Context: cold inbound · interested in the design partnership of the API"),
          bullet("Prep: he's pre-PMF · likely value is qualitative (advice, intros) more than revenue"),
          sectionTitle("Thu · 11:00 AM PT · 30 min"),
          profileCard({
            name: "Olivia Sanchez",
            title: "Director of Customer Experience",
            company: "Routeworks · logistics SaaS",
            initials: "OS",
            accent: "#1F3A2E",
            rightLabel: "Customer",
          }),
          bullet("Context: existing customer (12 seats) · health score is Green"),
          bullet("Prep: she's lining up for expansion — Aria thinks 30-50 seats by Q3"),
          sectionTitle("Fri · 10:00 AM PT · 30 min"),
          profileCard({
            name: "Daniel Park",
            title: "Investor",
            company: "Compass Capital · early-stage",
            initials: "DP",
            accent: "#1F3A2E",
            rightLabel: "Investor",
          }),
          bullet("Context: just emailed last week about the round · we don't have room currently"),
          bullet("Prep: be direct — no room in Series A, hold for Series B conversation"),
          ctaRow([
            ctaButton("View calendar week", { color: "#1F3A2E" }),
            ctaButton("Block off another office-hours slot next week", { color: "#1F3A2E", variant: "outline" }),
          ]),
          fineprint("Founder office hours · Wednesdays + select weeks · open via your Calendly link. Auto-confirms; you can decline/reschedule from your dashboard."),
          companyEmailFooter("VectorMail"),
        ]),
        summary: "Founder office hours - 4 bookings. Action: prep before each.",
        labels: [labelUpdates],
        read: false,
      },
      {
        id: "demo-thread-205",
        subject: "Linear - Cycle 10 planning ready",
        senderName: "Linear",
        senderEmail: "notifications@linear.app",
        daysAgo: 0,
        hour: 8,
        snippet: "Cycle 10 planning is ready. 47 issues triaged.",
        body: email([
          brandBlock("Linear"),
          headline("Cycle 10 planning is ready · 47 issues triaged"),
          p(
            "Your <strong>Cycle 10 planning</strong> for the <strong>vectormail-ai</strong> team is ready to commit. <strong>47 issues triaged into the cycle</strong> across 4 team members. Capacity check shows healthy headroom — you're at 84% of stretch, leaving room for spec'd work that drops in during the cycle.",
          ),
          metricGrid([
            { label: "Cycle", value: "10", sub: "May 19 – May 30" },
            { label: "Issues triaged", value: "47" },
            { label: "Total points", value: "42" },
            { label: "Team capacity", value: "84%", sub: "of stretch" },
            { label: "Carried from C9", value: "6" },
            { label: "New for C10", value: "41" },
          ]),
          sectionTitle("Per-person allocation"),
          keyValBlock([
            { label: "Marcus Liu", value: "12 issues · 12 points · 90% capacity" },
            { label: "Elena Vargas", value: "10 issues · 10 points · 82% capacity" },
            { label: "Nathan Wu", value: "11 issues · 11 points · 85% capacity" },
            { label: "Dana Howe (limited contribution)", value: "8 issues · 6 points · 50% capacity (planning focus)" },
            { label: "Carryover from C9", value: "6 issues · 3 points" },
          ]),
          sectionTitle("Top items by priority"),
          bullet("<strong>VM-208</strong> · pgvector migration · cutover this cycle · Marcus"),
          bullet("<strong>VM-211</strong> · Inbox v3 triage column · Elena"),
          bullet("<strong>VM-214</strong> · Buddy v2.1 streaming tool-use · Nathan"),
          bullet("<strong>VM-219</strong> · SOC 2 evidence collection automation · Marcus + Aria"),
          bullet("<strong>VM-228</strong> · Q3 OKR finalization · Dana"),
          sectionTitle("Risks"),
          bullet("<strong>VM-208 (pgvector)</strong> is high-risk: 5-point estimate but real-world variance could double it. We have a kill-switch but cutover is still cycle-critical."),
          bullet("<strong>VM-211 (Inbox v3)</strong> is blocked on design until Tuesday; if design slips, ship pushes to Cycle 11."),
          ctaRow([
            ctaButton("Open cycle in Linear", { color: "#5e6ad2" }),
            ctaButton("Start cycle", { color: "#5e6ad2", variant: "outline" }),
            ctaButton("View capacity heatmap", { color: "#5e6ad2", variant: "outline" }),
          ]),
          fineprint("Team: vectormail-ai · Cycle 10: May 19 (Monday 9 AM PT) – May 30 (Friday 5 PM PT) · 11 working days"),
          companyEmailFooter("Linear"),
        ]),
        summary: "Linear cycle planning ready. No action.",
        labels: [labelUpdates],
        read: false,
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
  const entries: Array<{
    threadId: string;
    type: "REMINDER" | "UNREPLIED";
    reason: string;
    subject: string;
    daysAgo: number;
    snippet: string;
  }> = [
      {
        threadId: "demo-thread-1",
        type: "UNREPLIED",
        reason: "Founder is waiting on pilot details",
        subject: "Quick intro - AI inbox automation",
        daysAgo: 2,
        snippet:
          "Alex from Founderloop asked for the architecture overview and a 30-min call slot. You said you'd send by Tuesday.",
      },
      {
        threadId: "demo-thread-11",
        type: "UNREPLIED",
        reason: "Partnership lead waiting 4 days",
        subject: "Re: Partnership discussion",
        daysAgo: 4,
        snippet:
          "Maya at Notion proposed a co-marketing slot in March. Needs a yes/no before her quarterly plan locks.",
      },
      {
        threadId: "demo-thread-19",
        type: "REMINDER",
        reason: "Conference deadline tomorrow",
        subject: "Re: Conference talk proposal",
        daysAgo: 3,
        snippet:
          "Speaker confirmation for SaaStr is due tomorrow. They asked if you can do the 'AI-native architectures' track.",
      },
      {
        threadId: "demo-thread-5",
        type: "UNREPLIED",
        reason: "Customer asked for the roadmap",
        subject: "Product feedback - search UX",
        daysAgo: 3,
        snippet:
          "Power user reported scroll lag on long threads. Asked when filter chips ship and whether saved searches are coming.",
      },
      {
        threadId: "demo-thread-22",
        type: "REMINDER",
        reason: "Contributor blocked on direction",
        subject: "Docs feedback - API reference",
        daysAgo: 2,
        snippet:
          "OSS contributor is waiting on a yes/no for the OpenAPI generation PR. They paused work until you weigh in.",
      },
    ];
  return entries.map((e) => ({
    threadId: e.threadId,
    type: e.type,
    reason: e.reason,
    thread: {
      subject: e.subject,
      lastMessageDate: daysAgo(e.daysAgo),
      snippet: e.snippet,
      remindAt:
        e.type === "REMINDER" ? new Date(Date.now() + 60 * 60 * 1000) : null,
    },
  }));
}

export type DemoDailyBriefItem = {
  threadId: string;
  subject: string;
  lastMessageDate: Date;
  reason: string;
  confidence?: "High" | "Medium" | "Low";
};

export function getDemoDailyBrief(): {
  needsReply: DemoDailyBriefItem[];
  important: DemoDailyBriefItem[];
  lowPriority: DemoDailyBriefItem[];
} {
  const needsReply: DemoDailyBriefItem[] = [
    {
      threadId: "demo-thread-1",
      subject: "Quick intro - AI inbox automation",
      lastMessageDate: daysAgo(2),
      reason: "Pilot ask is in the latest message; you committed to a Tuesday reply",
      confidence: "High",
    },
    {
      threadId: "demo-thread-19",
      subject: "Re: Conference talk proposal",
      lastMessageDate: daysAgo(3),
      reason: "Speaker confirmation deadline is tomorrow",
      confidence: "High",
    },
    {
      threadId: "demo-thread-11",
      subject: "Re: Partnership discussion",
      lastMessageDate: daysAgo(4),
      reason: "Partnership lead has been waiting 4 days; their quarter locks Friday",
      confidence: "High",
    },
    {
      threadId: "demo-thread-24",
      subject: "Re: Contract review",
      lastMessageDate: daysAgo(1),
      reason: "Legal sent redlines with a Friday signature window",
      confidence: "High",
    },
    {
      threadId: "demo-thread-5",
      subject: "Product feedback - search UX",
      lastMessageDate: daysAgo(3),
      reason: "Customer asked for the roadmap; they upgrade or churn this month",
      confidence: "Medium",
    },
  ];

  const important: DemoDailyBriefItem[] = [
    {
      threadId: "demo-thread-14",
      subject: "Urgent: API rate limit increase",
      lastMessageDate: daysAgo(0, 9),
      reason: "Customer hitting 429s in production; revenue impact mentioned",
      confidence: "High",
    },
    {
      threadId: "demo-thread-8",
      subject: "Investor update - February",
      lastMessageDate: daysAgo(0, 7),
      reason: "Monthly update is queued; investors expect it before Friday",
      confidence: "High",
    },
    {
      threadId: "demo-thread-13",
      subject: "Design review - Q1 roadmap",
      lastMessageDate: daysAgo(1),
      reason: "Design review on the calendar; pre-read attached",
      confidence: "Medium",
    },
    {
      threadId: "demo-thread-9",
      subject: "Re: Support ticket #8842 - Billing",
      lastMessageDate: daysAgo(1),
      reason: "Support ticket from a Pro customer; SLA window closes today",
      confidence: "High",
    },
  ];

  const lowPriority: DemoDailyBriefItem[] = [
    {
      threadId: "demo-thread-3",
      subject: "Your Stripe receipt - $99.00",
      lastMessageDate: daysAgo(0, 8),
      reason: "Receipt; auto-routed to Updates",
      confidence: "High",
    },
    {
      threadId: "demo-thread-4",
      subject: "[GitHub] 3 new notifications",
      lastMessageDate: daysAgo(0, 6),
      reason: "Notification batch; nothing assigned to you",
      confidence: "High",
    },
    {
      threadId: "demo-thread-7",
      subject: "The Batch - Issue #412",
      lastMessageDate: daysAgo(0, 5),
      reason: "Newsletter you read once a week",
      confidence: "Medium",
    },
    {
      threadId: "demo-thread-12",
      subject: "Your weekly digest",
      lastMessageDate: daysAgo(1),
      reason: "Digest; safe to skip unless you want a recap",
      confidence: "Medium",
    },
    {
      threadId: "demo-thread-25",
      subject: "Your account is in good standing",
      lastMessageDate: daysAgo(2),
      reason: "Account-status notice; no action",
      confidence: "High",
    },
  ];

  return { needsReply, important, lowPriority };
}
export function getDemoThreadBrain(threadId: string): {
  about: string;
  expectedFromMe: string;
  expectedReason: string;
  expectedPriority: "High" | "Medium" | "Low";
} {
  const byId: Record<
    string,
    {
      about: string;
      expectedFromMe: string;
      expectedReason: string;
      expectedPriority: "High" | "Medium" | "Low";
    }
  > = {
    "demo-thread-1": {
      about:
        "A founder is asking about pilot access, AI summaries, search, and your API for integrations.",
      expectedFromMe:
        "Reply with architecture or pilot details, or share a scheduling link if you want to continue.",
      expectedReason: "A real person is waiting on a reply with specific next steps.",
      expectedPriority: "High",
    },
    "demo-thread-4": {
      about: "Product feedback on search UX and interest in what’s on the roadmap.",
      expectedFromMe:
        "Acknowledge the feedback and clarify whether search improvements are planned.",
      expectedReason: "External sender asked roadmap questions awaiting your answer.",
      expectedPriority: "High",
    },
    "demo-thread-8": {
      about: "Promotional or bulk mail-style thread in the demo inbox.",
      expectedFromMe:
        "No reply needed unless you want to engage; fine to archive.",
      expectedReason: "Newsletter-like content with no direct ask — nothing to reply to.",
      expectedPriority: "Low",
    },
  };
  return (
    byId[threadId] ?? {
      about:
        "Sample conversation in demo mode: connect Gmail to analyze your real threads here.",
      expectedFromMe:
        "Request access when you’re ready to use inbox intelligence on your own mail.",
      expectedReason: "Demo placeholder without real thread intent signals.",
      expectedPriority: "Low",
    }
  );
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
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;
  return [
    {
      title: "Product sync with Alex (Founderloop)",
      startAt: new Date(now.getTime() + 1 * day).toISOString(),
      endAt: new Date(now.getTime() + 1 * day + hour).toISOString(),
      location: "Zoom · meet.zoom.us/j/812-44-901",
      sourceEmailId: t(5).emails[0]!.id,
      sourceThreadId: t(5).id,
    },
    {
      title: "Sprint planning",
      startAt: new Date(now.getTime() + 2 * day).toISOString(),
      endAt: new Date(now.getTime() + 2 * day + 90 * 60 * 1000).toISOString(),
      location: "Conference room A · also on Meet",
      sourceEmailId: t(17).emails[0]!.id,
      sourceThreadId: t(17).id,
    },
    {
      title: "Design review - Q1 roadmap",
      startAt: new Date(now.getTime() + 3 * day).toISOString(),
      endAt: new Date(now.getTime() + 3 * day + hour).toISOString(),
      location: "Figma + Meet",
      sourceEmailId: t(12).emails[0]!.id,
      sourceThreadId: t(12).id,
    },
    {
      title: "SaaStr speaker debrief",
      startAt: new Date(now.getTime() + 4 * day).toISOString(),
      endAt: new Date(now.getTime() + 4 * day + 30 * 60 * 1000).toISOString(),
      location: "Phone · the conference team will dial you",
      sourceEmailId: t(18).emails[0]!.id,
      sourceThreadId: t(18).id,
    },
    {
      title: "Team all-hands",
      startAt: new Date(now.getTime() + 6 * day).toISOString(),
      endAt: new Date(now.getTime() + 6 * day + hour).toISOString(),
      location: "Office + Zoom",
      sourceEmailId: t(22).emails[0]!.id,
      sourceThreadId: t(22).id,
    },
  ];
}
