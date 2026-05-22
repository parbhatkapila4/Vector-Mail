"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Brain,
  Clock,
  Target,
  Mail,
  Check,
  type LucideIcon,
} from "lucide-react";

const SERIF = "var(--font-newsreader), Georgia, serif";
const MONO = "var(--font-jetbrains-mono), ui-monospace, monospace";
const SANS = "var(--font-geist-sans), Inter, system-ui, sans-serif";

const PAPER = "#fbf8f1";
const PAPER_DEEP = "#f4ede0";
const PAPER_SHADOW = "#efe5cf";
const INK = "#1a1612";
const INK_2 = "#5b554c";
const INK_3 = "#8a8278";
const LINE = "#d8cfb9";
const LAV = "#5b4cf7";
const LAV_DEEP = "#3d2fb8";
const ROSE = "#b91c4b";
const GREEN = "#15803d";
const AMBER = "#a45a09";

const ARROW_PATH = "M3 6h6M6 3l3 3-3 3";

type Section = {
  anchor: string;
  chapter: string;
  label: string;
  color: string;
  tint: string;
  icon: LucideIcon;
  title: string;
  accent: string;
  lead: string;
  bullets: string[];
};

const SECTIONS: Section[] = [
  {
    anchor: "what-it-does",
    chapter: "I",
    label: "MECHANICS",
    color: LAV_DEEP,
    tint: "rgba(91,76,247,0.10)",
    icon: Brain,
    title: "What Brief does",
    accent: "reads the night for you.",
    lead:
      "Every thread that arrived since you last cleared the inbox is read once, scored, and surfaced if it actually needs you.",
    bullets: [
      "Reads the threads that arrived since you last cleared the inbox",
      "Extracts decisions, blockers, and explicit asks for a reply",
      "Preserves quoted-thread context so summaries stay accurate",
      "Updates as the day moves; items collapse once you handle them",
    ],
  },
  {
    anchor: "how-it-helps",
    chapter: "II",
    label: "OUTCOMES",
    color: AMBER,
    tint: "rgba(164,90,9,0.10)",
    icon: Clock,
    title: "How it helps",
    accent: "the day starts already triaged.",
    lead:
      "You walk into the morning with a plan instead of an unsorted pile. The signal is up top, the noise is collapsed underneath.",
    bullets: [
      "Get the day's signal in a few minutes, not an hour",
      "Open the threads that need a reply first, not in arrival order",
      "Catch follow-ups before they slip into the next day",
      "Cut context switching across long, repetitive chains",
    ],
  },
  {
    anchor: "for-operators",
    chapter: "III",
    label: "AUDIENCE",
    color: GREEN,
    tint: "rgba(21,128,61,0.10)",
    icon: Target,
    title: "Built for operators",
    accent: "founders, managers, customer-facing teams.",
    lead:
      "Brief was designed for inboxes that move - investor updates, customer support, hiring loops, and the operational debris that piles up between them.",
    bullets: [
      "For founders, managers, and customer-facing teams",
      "Scales for high-volume inboxes without slowing down",
      "Works with the Gmail account you already use",
      "Keyboard-first. Open, dismiss, and reply without the mouse",
    ],
  },
];

const FLOW = [
  "New mail arrives via Gmail and is delta-synced into VectorMail",
  "Each thread is scored for importance and grouped by intent",
  "A short summary is generated for the threads that cleared the bar",
  "The brief renders in the inbox header and as a standalone view",
  "Items collapse as you triage; the brief refreshes through the day",
];

type SpecimenTag = "reply" | "decision" | "blocker" | "fyi";

const TAGS: Record<SpecimenTag, { label: string; color: string; tint: string }> = {
  reply: { label: "REPLY NEEDED", color: ROSE, tint: "rgba(185,28,75,0.10)" },
  decision: { label: "DECISION PENDING", color: LAV_DEEP, tint: "rgba(91,76,247,0.10)" },
  blocker: { label: "BLOCKER", color: AMBER, tint: "rgba(164,90,9,0.10)" },
  fyi: { label: "FYI", color: GREEN, tint: "rgba(21,128,61,0.10)" },
};

const SPECIMEN: Array<{
  tag: SpecimenTag;
  from: string;
  org: string;
  initials: string;
  initialsBg: string;
  time: string;
  subject: string;
  line: string;
}> = [
    {
      tag: "reply",
      from: "Sarah Chen",
      org: "Sequoia Capital",
      initials: "SC",
      initialsBg: "linear-gradient(135deg, #b91c4b 0%, #7f1535 100%)",
      time: "7:42 AM",
      subject: "Thursday call - GTM slide notes",
      line: "Sarah wants a Thursday call to walk through GTM slide notes before the partners review.",
    },
    {
      tag: "decision",
      from: "Marc Andreessen",
      org: "Series A · diligence",
      initials: "MA",
      initialsBg: "linear-gradient(135deg, #5b4cf7 0%, #2d2a9e 100%)",
      time: "Yesterday",
      subject: "Diligence room - keep open?",
      line: "Marc asks whether to keep the diligence room open one more week or close it Friday.",
    },
    {
      tag: "blocker",
      from: "Stripe Billing",
      org: "INV-2418",
      initials: "$",
      initialsBg: "linear-gradient(135deg, #a45a09 0%, #6e3d05 100%)",
      time: "6:11 AM",
      subject: "Payment failed · second retry",
      line: "Invoice INV-2418 is overdue; the statement shows two failed payment retries.",
    },
    {
      tag: "fyi",
      from: "Hiring Desk",
      org: "system-design round",
      initials: "HD",
      initialsBg: "linear-gradient(135deg, #15803d 0%, #0e5527 100%)",
      time: "3:08 AM",
      subject: "Three candidates passed overnight",
      line: "Hiring desk passed three candidates through the system-design round overnight; nothing for you to do.",
    },
  ];

function Sparkle({ size = 12, color = LAV }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M6 1l1.3 3.4 3.4 1.3-3.4 1.3L6 10.4 4.7 7l-3.4-1.3L4.7 4.4 6 1z"
        fill={color}
      />
    </svg>
  );
}

export default function BriefPage() {
  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: PAPER, color: INK, fontFamily: SANS }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes vmbf-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes vmbf-pulse { 0%, 100% { box-shadow: 0 0 0 3px rgba(91,76,247,0.18); } 50% { box-shadow: 0 0 0 8px rgba(91,76,247,0.04); } }
        .vmbf-index:hover .vmbf-dot { transform: scale(1.5); }
        .vmbf-index:hover .vmbf-label { color: ${INK}; }
        .vmbf-bullet:hover { background: ${PAPER_DEEP}; }
        .vmbf-specimen:hover { transform: translateY(-1px); box-shadow: 0 6px 18px -8px rgba(26,22,18,0.16); }
        @media (prefers-reduced-motion: reduce) { [style*="animation"] { animation: none !important; } }
      `,
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          opacity: 0.09,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.42  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed"
        style={{
          right: -240,
          top: -200,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(91,76,247,0.14) 0%, rgba(91,76,247,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed"
        style={{
          left: -200,
          bottom: -240,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(21,128,61,0.10) 0%, rgba(21,128,61,0) 70%)",
        }}
      />

      <Link
        href="/"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 transition-all hover:-translate-y-px md:left-6 md:top-6"
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          background: "#ffffff",
          border: `1px solid ${LINE}`,
          color: INK,
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-0.005em",
          boxShadow: `0 1px 0 rgba(26,22,18,0.06), 2px 2px 0 ${PAPER_SHADOW}`,
        }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <section className="relative z-10 mx-auto w-[95%] max-w-[1920px] px-2 pb-8 pt-20 md:pb-10 md:pt-24">
        <div
          className="mb-4 flex items-center gap-2"
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: LAV_DEEP,
            letterSpacing: "0.22em",
            fontWeight: 700,
          }}
        >
          <Sparkle size={10} />
          THE BRIEF · DAILY SIGNAL · ONE PAGE A DAY
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_360px] md:gap-12 lg:grid-cols-[1fr_440px]">
          <div>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(54px, 7.4vw, 132px)",
                fontWeight: 500,
                color: INK,
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                margin: 0,
              }}
            >
              A daily read
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                of your inbox.
              </span>
            </h1>
          </div>
          <div className="flex flex-col justify-end gap-4">
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                lineHeight: 1.55,
                color: INK_2,
                letterSpacing: "-0.005em",
                fontWeight: 400,
                margin: 0,
                maxWidth: 440,
              }}
            >
              Brief turns the morning inbox into a clear, prioritized view
              of what{" "}
              <span style={{ color: INK, fontWeight: 500 }}>
                matters now, what can wait, and what needs an answer today.
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { k: "Categories", v: String(Object.keys(TAGS).length) },
                { k: "Sections", v: String(SECTIONS.length) },
                { k: "Where", v: "Inbox header" },
              ].map((s, i) => (
                <div
                  key={s.k}
                  className="flex items-baseline gap-2"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#ffffff",
                    border: `1px solid ${LINE}`,
                    boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
                    animation: `vmbf-rise 380ms ${120 + i * 80}ms both ease-out`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 22,
                      fontWeight: 600,
                      color: INK,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {s.v}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9.5,
                      color: INK_3,
                      letterSpacing: "0.14em",
                      fontWeight: 700,
                    }}
                  >
                    {s.k.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div aria-hidden className="my-8 flex items-center gap-3 md:my-10">
          <span style={{ flex: 1, height: 1, background: LINE }} />
          <Sparkle size={10} color={LINE} />
          <span style={{ flex: 1, height: 1, background: LINE }} />
        </div>
      </section>

      <section className="relative z-10 mx-auto w-[95%] max-w-[1920px] px-2 pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)_360px] lg:gap-10 xl:grid-cols-[300px_minmax(0,1fr)_420px]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 flex flex-col gap-6">
              <div>
                <div
                  className="mb-3 flex items-center gap-1.5"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: LAV_DEEP,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                  }}
                >
                  <Sparkle size={9} /> SECTIONS
                </div>
                <ul
                  className="relative flex flex-col"
                  style={{ paddingLeft: 14 }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 4,
                      top: 8,
                      bottom: 8,
                      width: 1,
                      background: `linear-gradient(180deg, ${LAV} 0%, ${LINE} 100%)`,
                    }}
                  />
                  {[
                    { anchor: "intro", label: "WHAT IT MEANS" },
                    ...SECTIONS.map((s) => ({
                      anchor: s.anchor,
                      label: s.label,
                      title: s.title,
                    })),
                    { anchor: "how", label: "HOW IT WORKS" },
                    { anchor: "specimen", label: "A SPECIMEN" },
                  ].map((item, i, all) => {
                    const isFirst = i === 0;
                    const matched = SECTIONS.find(
                      (s) => s.anchor === item.anchor,
                    );
                    return (
                      <li key={item.anchor} className="relative">
                        <span
                          aria-hidden
                          className="vmbf-dot absolute rounded-full"
                          style={{
                            left: -14,
                            top: 14,
                            width: isFirst ? 8 : 5,
                            height: isFirst ? 8 : 5,
                            background: isFirst ? LAV : "#bcb09a",
                            border: isFirst ? "1.5px solid #fff" : "none",
                            boxShadow: isFirst
                              ? "0 0 0 2px rgba(91,76,247,0.25)"
                              : "none",
                            transition: "transform 200ms ease",
                          }}
                        />
                        <Link
                          href={`#${item.anchor}`}
                          className="vmbf-index block py-2.5"
                          style={{
                            borderBottom:
                              i < all.length - 1
                                ? `1px dashed ${LINE}`
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: MONO,
                              fontSize: 9,
                              color: matched?.color ?? INK_3,
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            className="vmbf-label mt-1 truncate"
                            style={{
                              fontFamily: SERIF,
                              fontSize: 13.5,
                              color: isFirst ? INK : INK_2,
                              fontWeight: isFirst ? 600 : 500,
                              letterSpacing: "-0.005em",
                              transition: "color 200ms ease",
                            }}
                          >
                            {matched?.title ??
                              (item.anchor === "intro"
                                ? "Why a brief at all"
                                : item.anchor === "how"
                                  ? "The pipeline"
                                  : "What a brief looks like")}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  background: "#ffffff",
                  border: `1px solid ${LINE}`,
                  borderRadius: 10,
                  boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
                }}
              >
                <div
                  className="mb-2 flex items-center gap-1.5"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: LAV_DEEP,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                  }}
                >
                  <Sparkle size={9} /> WHERE IT LIVES
                </div>
                <dl className="flex flex-col gap-1.5">
                  {[
                    { k: "Surface", v: "Inbox header" },
                    { k: "Also as", v: "Standalone view" },
                    { k: "Updates", v: "Through the day" },
                    { k: "Phase", v: "Rolling out" },
                  ].map((row) => (
                    <div
                      key={row.k}
                      className="flex items-baseline justify-between"
                    >
                      <dt
                        style={{
                          fontFamily: MONO,
                          fontSize: 9.5,
                          color: INK_3,
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                        }}
                      >
                        {row.k.toUpperCase()}
                      </dt>
                      <dd
                        style={{
                          fontFamily: SERIF,
                          fontSize: 12.5,
                          color: INK,
                          fontWeight: 500,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {row.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-10 md:gap-14">
            <article
              id="intro"
              className="relative overflow-hidden scroll-mt-24"
              style={{
                background: PAPER_DEEP,
                border: `1px solid ${LINE}`,
                borderRadius: 16,
                padding: "32px 28px 36px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.6), 0 12px 24px -10px rgba(26,22,18,0.08)",
              }}
            >
              <div
                className="mb-3 flex items-center gap-2"
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: LAV_DEEP,
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                }}
              >
                <Sparkle size={10} />
                THE ARGUMENT · WHY A BRIEF AT ALL
              </div>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(28px, 3vw, 44px)",
                  fontWeight: 500,
                  color: INK,
                  letterSpacing: "-0.034em",
                  lineHeight: 1.02,
                  margin: 0,
                }}
              >
                Reading every overnight thread top-to-bottom is{" "}
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                  the slow way to find the few that matter.
                </span>
              </h2>

              <div
                className="mt-5 max-w-[820px]"
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: INK,
                  lineHeight: 1.72,
                  letterSpacing: "-0.003em",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    float: "left",
                    fontFamily: SERIF,
                    fontSize: 78,
                    lineHeight: 0.85,
                    fontWeight: 600,
                    color: INK,
                    marginRight: 12,
                    marginTop: 6,
                    marginBottom: -2,
                    letterSpacing: "-0.04em",
                  }}
                >
                  M
                </span>
                ail arrives all night while you&apos;re not looking. By
                morning, the inbox holds a mix of things. Most you&apos;ll
                skim and forget; a few actually need a decision. The job of
                finding the few inside the many is repetitive - and
                reading every thread top to bottom is the slow way to do
                it.
                <p className="mt-4" style={{ margin: "16px 0 0" }}>
                  Brief reads the overnight mail for you. It picks out the
                  threads that actually carry{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 65%, rgba(91,76,247,0.22) 65%)",
                      padding: "0 2px",
                      fontWeight: 500,
                    }}
                  >
                    a decision
                  </span>
                  ,{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 65%, rgba(164,90,9,0.32) 65%)",
                      padding: "0 2px",
                      fontWeight: 500,
                    }}
                  >
                    a blocker
                  </span>
                  , or{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 65%, rgba(185,28,75,0.22) 65%)",
                      padding: "0 2px",
                      fontWeight: 500,
                    }}
                  >
                    an ask for a reply
                  </span>
                  , and writes a short summary of each. You scan the brief,
                  decide what to open first, and walk into the day with a
                  plan instead of an unsorted pile.
                </p>
              </div>
            </article>
            {SECTIONS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <article
                  key={s.anchor}
                  id={s.anchor}
                  className="relative overflow-hidden scroll-mt-24"
                  style={{
                    background: PAPER,
                    border: `1px solid ${LINE}`,
                    borderRadius: 16,
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(124,90,250,0.04), 0 12px 24px -10px rgba(26,22,18,0.10), 0 32px 64px -20px rgba(26,22,18,0.08)",
                    animation: `vmbf-rise 420ms ${idx * 60}ms both ease-out`,
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute"
                    style={{
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: `linear-gradient(180deg, ${s.color} 0%, ${LINE} 100%)`,
                    }}
                  />

                  <div className="relative grid grid-cols-1 md:grid-cols-[200px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
                    <div className="relative px-7 pt-7 md:pl-10 md:pr-0 md:pt-10">
                      <div
                        className="inline-flex items-center gap-2"
                        style={{
                          padding: "3px 9px",
                          background: "#ffffff",
                          border: `1px solid ${LINE}`,
                          borderRadius: 4,
                          transform: "rotate(-1.5deg)",
                          boxShadow: "0 1px 2px rgba(26,22,18,0.06)",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 10,
                            color: INK,
                            letterSpacing: "0.1em",
                            fontWeight: 700,
                          }}
                        >
                          PART · {s.chapter}
                        </span>
                      </div>

                      <div
                        className="mt-4 grid place-items-center"
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 14,
                          background: s.tint,
                          border: `1px solid ${s.color}33`,
                          color: s.color,
                          boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
                        }}
                      >
                        <Icon className="h-7 w-7" />
                      </div>

                      <div
                        className="mt-5 inline-flex items-center gap-1.5"
                        style={{
                          padding: "4px 10px",
                          background: s.tint,
                          border: `1px solid ${s.color}33`,
                          borderRadius: 6,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: s.color,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 9.5,
                            color: s.color,
                            letterSpacing: "0.14em",
                            fontWeight: 700,
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>

                    <div className="px-7 pb-9 pt-2 md:py-10 md:pr-10 md:pl-0">
                      <h2
                        style={{
                          fontFamily: SERIF,
                          fontSize: "clamp(30px, 3.2vw, 44px)",
                          fontWeight: 500,
                          color: INK,
                          lineHeight: 1.02,
                          letterSpacing: "-0.034em",
                          margin: 0,
                        }}
                      >
                        {s.title}
                        <span
                          style={{
                            fontStyle: "italic",
                            fontWeight: 400,
                            color: s.color,
                          }}
                        >
                          {" - "}
                          {s.accent}
                        </span>
                      </h2>

                      <p
                        className="mt-4 md:mt-5"
                        style={{
                          fontFamily: SERIF,
                          fontSize: 17,
                          color: INK_2,
                          lineHeight: 1.62,
                          letterSpacing: "-0.005em",
                          maxWidth: 780,
                        }}
                      >
                        {s.lead}
                      </p>

                      <div
                        aria-hidden
                        className="my-6 flex items-center gap-3 md:my-7"
                      >
                        <span
                          style={{ flex: 1, height: 1, background: LINE }}
                        />
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 9.5,
                            color: s.color,
                            letterSpacing: "0.2em",
                            fontWeight: 700,
                          }}
                        >
                          ✦ KEY POINTS · {s.bullets.length}
                        </span>
                        <span
                          style={{ flex: 1, height: 1, background: LINE }}
                        />
                      </div>

                      <ul className="flex flex-col gap-2">
                        {s.bullets.map((b, i) => (
                          <li
                            key={b}
                            className="vmbf-bullet flex items-start gap-3 transition-colors"
                            style={{
                              padding: "10px 14px",
                              border: `1px solid ${LINE}`,
                              borderRadius: 8,
                              background: "#ffffff",
                            }}
                          >
                            <span
                              aria-hidden
                              className="grid shrink-0 place-items-center"
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                background: s.tint,
                                border: `1px solid ${s.color}33`,
                                color: s.color,
                                marginTop: 1,
                              }}
                            >
                              <Check size={12} strokeWidth={2.6} />
                            </span>
                            <div
                              className="flex-1"
                              style={{
                                fontFamily: SERIF,
                                fontSize: 15.5,
                                color: INK,
                                lineHeight: 1.5,
                                fontWeight: 500,
                                letterSpacing: "-0.005em",
                              }}
                            >
                              {b}
                            </div>
                            <span
                              aria-hidden
                              style={{
                                fontFamily: MONO,
                                fontSize: 9,
                                color: INK_3,
                                letterSpacing: "0.1em",
                                fontWeight: 700,
                                flexShrink: 0,
                                marginTop: 6,
                              }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div
                    className="relative flex flex-wrap items-center justify-between gap-3 px-7 md:px-10"
                    style={{
                      height: 38,
                      background: PAPER_DEEP,
                      borderTop: `1px solid ${LINE}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 9.5,
                        color: INK_3,
                        letterSpacing: "0.12em",
                        fontWeight: 600,
                      }}
                    >
                      PART {s.chapter} · {s.label}
                    </span>
                  </div>
                </article>
              );
            })}

            <article
              id="how"
              className="relative overflow-hidden scroll-mt-24"
              style={{
                background: PAPER,
                border: `1px solid ${LINE}`,
                borderRadius: 16,
                padding: "32px 28px 36px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.7), 0 12px 24px -10px rgba(26,22,18,0.10)",
              }}
            >
              <div
                className="mb-3 flex items-center gap-2"
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: LAV_DEEP,
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                }}
              >
                <Sparkle size={10} />
                PART IV · THE PIPELINE
              </div>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(28px, 3vw, 44px)",
                  fontWeight: 500,
                  color: INK,
                  letterSpacing: "-0.034em",
                  lineHeight: 1.02,
                  margin: 0,
                }}
              >
                How it works -{" "}
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                  five steps, end to end.
                </span>
              </h2>

              <ol
                className="relative mt-7 flex flex-col gap-3"
                style={{ paddingLeft: 32 }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 14,
                    top: 18,
                    bottom: 18,
                    width: 2,
                    background: `linear-gradient(180deg, ${LAV} 0%, ${AMBER} 50%, ${GREEN} 100%)`,
                    borderRadius: 2,
                  }}
                />
                {FLOW.map((step, idx) => (
                  <li
                    key={step}
                    className="relative flex items-start gap-3"
                    style={{
                      padding: "14px 16px",
                      background: "#ffffff",
                      border: `1px solid ${LINE}`,
                      borderRadius: 10,
                      boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute grid place-items-center"
                      style={{
                        left: -30,
                        top: 14,
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        background: "#ffffff",
                        border: `2px solid ${LAV}`,
                        fontFamily: MONO,
                        fontSize: 11,
                        fontWeight: 700,
                        color: LAV_DEEP,
                        boxShadow: `0 0 0 3px ${PAPER}, 0 4px 8px rgba(91,76,247,0.18)`,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div
                      className="flex-1"
                      style={{
                        fontFamily: SERIF,
                        fontSize: 16,
                        color: INK,
                        lineHeight: 1.55,
                        fontWeight: 500,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {step}
                    </div>
                    <span
                      aria-hidden
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        color: INK_3,
                        letterSpacing: "0.1em",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    >
                      STEP · {String(idx + 1).padStart(2, "0")}
                    </span>
                  </li>
                ))}
              </ol>
            </article>

            <article
              id="specimen"
              className="relative overflow-hidden scroll-mt-24"
              style={{
                background: PAPER,
                border: `1px solid ${LINE}`,
                borderRadius: 16,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.7), 0 16px 32px -10px rgba(26,22,18,0.12), 0 40px 80px -20px rgba(26,22,18,0.10)",
              }}
            >
              <div
                className="relative flex items-center gap-1.5 px-5"
                style={{
                  height: 30,
                  background: PAPER_DEEP,
                  borderBottom: `1px solid ${LINE}`,
                }}
              >
                {[
                  { c: "#ff5f57", s: "#e0443e" },
                  { c: "#febc2e", s: "#d89e23" },
                  { c: "#28c840", s: "#1eaa33" },
                ].map((d, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="block rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      background: `radial-gradient(circle at 35% 30%, ${d.c} 0%, ${d.s} 90%)`,
                      boxShadow: `inset 0 0.5px 0 rgba(255,255,255,0.4), 0 0.5px 1px ${d.s}40`,
                    }}
                  />
                ))}
                <span
                  className="ml-auto"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: INK_3,
                    letterSpacing: "0.08em",
                    fontWeight: 500,
                  }}
                >
                  vectormail.app/brief
                </span>
              </div>

              <div
                className="relative flex flex-wrap items-center gap-4 px-7 md:px-10"
                style={{
                  minHeight: 76,
                  paddingTop: 14,
                  paddingBottom: 14,
                  borderBottom: `2px solid ${INK}`,
                  background: PAPER,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid place-items-center"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background:
                        "linear-gradient(135deg, #5b4cf7 0%, #2d2a9e 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 10px rgba(91,76,247,0.32)",
                    }}
                  >
                    <Sparkle size={13} color="#fff" />
                  </span>
                  <div className="leading-none">
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 22,
                        fontWeight: 600,
                        color: INK,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      Specimen -{" "}
                      <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                        a brief in the wild.
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        color: INK_3,
                        letterSpacing: "0.22em",
                        marginTop: 5,
                        fontWeight: 600,
                      }}
                    >
                      THE DAILY BRIEFING · TUESDAY 7:42 AM PT
                    </div>
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(91,76,247,0.08)",
                      border: "1px solid rgba(91,76,247,0.22)",
                      fontFamily: MONO,
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: LAV_DEEP,
                      letterSpacing: "0.1em",
                    }}
                  >
                    <Sparkle size={9} color={LAV_DEEP} />
                    SAMPLE · {SPECIMEN.length} ITEMS
                  </span>
                </div>
              </div>

              <div className="relative px-7 py-9 md:px-10 md:py-10">
                <ol className="flex flex-col gap-3">
                  {SPECIMEN.map((item, idx) => {
                    const meta = TAGS[item.tag];
                    return (
                      <li
                        key={idx}
                        className="vmbf-specimen relative overflow-hidden transition-all"
                        style={{
                          background: "#ffffff",
                          border: `1px solid ${LINE}`,
                          borderRadius: 10,
                          padding: "14px 16px",
                          boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
                        }}
                      >
                        <span
                          aria-hidden
                          className="absolute"
                          style={{
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            background: `linear-gradient(180deg, ${meta.color} 0%, ${LINE} 100%)`,
                            borderTopLeftRadius: 10,
                            borderBottomLeftRadius: 10,
                          }}
                        />
                        <div className="flex items-start gap-3 pl-1.5">
                          <span
                            aria-hidden
                            className="grid shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                            style={{
                              width: 36,
                              height: 36,
                              background: item.initialsBg,
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(15,23,42,0.12)",
                              fontFamily: MONO,
                            }}
                          >
                            {item.initials}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                              <span
                                style={{
                                  fontFamily: SERIF,
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: INK,
                                  letterSpacing: "-0.005em",
                                }}
                              >
                                {item.from}
                              </span>
                              <span
                                style={{
                                  fontFamily: SERIF,
                                  fontStyle: "italic",
                                  fontSize: 13,
                                  color: INK_3,
                                  letterSpacing: "-0.005em",
                                }}
                              >
                                · {item.org}
                              </span>
                              <span
                                className="ml-auto"
                                style={{
                                  fontFamily: MONO,
                                  fontSize: 10,
                                  color: INK_3,
                                  letterSpacing: "0.1em",
                                  fontWeight: 600,
                                }}
                              >
                                {item.time.toUpperCase()}
                              </span>
                            </div>
                            <div
                              className="mt-1.5 flex flex-wrap items-baseline gap-2"
                            >
                              <span
                                style={{
                                  padding: "2px 7px",
                                  borderRadius: 4,
                                  background: meta.tint,
                                  border: `1px solid ${meta.color}33`,
                                  color: meta.color,
                                  fontFamily: MONO,
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.12em",
                                }}
                              >
                                {meta.label}
                              </span>
                              <span
                                style={{
                                  fontFamily: SERIF,
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: INK,
                                  letterSpacing: "-0.005em",
                                }}
                              >
                                {item.subject}
                              </span>
                            </div>
                            <p
                              className="mt-2"
                              style={{
                                fontFamily: SERIF,
                                fontSize: 14.5,
                                color: INK_2,
                                lineHeight: 1.55,
                                letterSpacing: "-0.003em",
                                margin: 0,
                              }}
                            >
                              {item.line}
                            </p>
                          </div>
                          <ArrowUpRight
                            className="h-3.5 w-3.5 shrink-0 transition-transform"
                            style={{ color: INK_3, marginTop: 6 }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <p
                  className="mt-6"
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 15,
                    color: INK_2,
                    lineHeight: 1.6,
                    letterSpacing: "-0.005em",
                    margin: 0,
                  }}
                >
                  Each entry links to the underlying thread. Open it, reply
                  to it, or snooze it - the brief checks the item off as
                  you handle it.
                </p>
              </div>

              <div
                className="relative flex items-center justify-between gap-3 px-7 md:px-10"
                style={{
                  height: 38,
                  background: PAPER_DEEP,
                  borderTop: `1px solid ${LINE}`,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: INK_3,
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                  }}
                >
                  ILLUSTRATIVE SAMPLE · NOT REAL MAIL
                </span>
              </div>
            </article>
          </div>

          <aside className="relative">
            <div className="sticky top-6 flex flex-col gap-5">
              <div
                className="relative overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: `1px solid ${INK}`,
                  borderRadius: 14,
                  padding: "20px 22px 22px",
                  boxShadow: `2px 2px 0 ${PAPER_SHADOW}, 0 8px 24px -10px rgba(26,22,18,0.18)`,
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    right: -40,
                    top: -40,
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(91,76,247,0.18) 0%, rgba(91,76,247,0) 70%)",
                  }}
                />
                <div
                  className="mb-3 flex items-center gap-1.5"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: LAV_DEEP,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                  }}
                >
                  <Sparkle size={9} /> EARLY ACCESS
                </div>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontSize: 24,
                    fontWeight: 500,
                    color: INK,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  Want Brief in{" "}
                  <span style={{ fontStyle: "italic" }}>your inbox?</span>
                </h3>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13.5,
                    color: INK_2,
                    lineHeight: 1.5,
                    letterSpacing: "-0.005em",
                    margin: 0,
                  }}
                >
                  Brief is rolling out to active accounts. Send a note and
                  we&apos;ll add yours to the list.
                </p>
                <Link
                  href="mailto:parbhat@parbhat.work"
                  className="mt-4 inline-flex w-full items-center justify-between gap-2 transition-all hover:-translate-y-px"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: PAPER,
                    border: `1px solid ${INK}`,
                    color: INK,
                    fontFamily: SANS,
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: "-0.005em",
                    boxShadow: `0 1px 0 rgba(26,22,18,0.10), 2px 2px 0 ${PAPER_SHADOW}`,
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    parbhat@parbhat.work
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div
                className="relative overflow-hidden"
                style={{
                  background: PAPER_DEEP,
                  border: `1px solid ${LINE}`,
                  borderRadius: 14,
                  padding: "18px 20px",
                }}
              >
                <div
                  className="mb-3 flex items-center gap-1.5"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: LAV_DEEP,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                  }}
                >
                  <Sparkle size={9} /> CATEGORY LEGEND
                </div>
                <ul className="flex flex-col gap-2">
                  {(Object.keys(TAGS) as SpecimenTag[]).map((k) => {
                    const meta = TAGS[k];
                    return (
                      <li
                        key={k}
                        className="flex items-center gap-2"
                        style={{
                          padding: "6px 10px",
                          background: "#ffffff",
                          border: `1px solid ${LINE}`,
                          borderRadius: 8,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 999,
                            background: meta.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 10,
                            color: meta.color,
                            letterSpacing: "0.12em",
                            fontWeight: 700,
                          }}
                        >
                          {meta.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  background: "transparent",
                  border: `1px dashed ${LINE}`,
                  borderRadius: 10,
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 13,
                  color: INK_3,
                  lineHeight: 1.5,
                  letterSpacing: "-0.005em",
                }}
              >
                Brief refreshes as the day moves on.{" "}
                <Link
                  href="/changelog"
                  style={{
                    color: LAV_DEEP,
                    fontStyle: "normal",
                    fontWeight: 600,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  See what changed →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
