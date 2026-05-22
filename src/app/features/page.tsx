"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Inbox,
  PenLine,
  Search,
  Filter,
  FileText,
  Mail,
  Database,
  Layers,
  Lock,
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

type Tone = "triage" | "compose" | "search" | "automation" | "intel" | "send";

const TONES: Record<Tone, { label: string; color: string; tint: string }> = {
  triage: { label: "TRIAGE", color: ROSE, tint: "rgba(185,28,75,0.10)" },
  compose: { label: "COMPOSE", color: LAV_DEEP, tint: "rgba(91,76,247,0.10)" },
  search: { label: "RETRIEVAL", color: AMBER, tint: "rgba(164,90,9,0.10)" },
  automation: { label: "AUTOMATION", color: GREEN, tint: "rgba(21,128,61,0.10)" },
  intel: { label: "INTELLIGENCE", color: LAV_DEEP, tint: "rgba(91,76,247,0.10)" },
  send: { label: "SENDING", color: AMBER, tint: "rgba(164,90,9,0.10)" },
};

type Feature = {
  anchor: string;
  chapter: string;
  tone: Tone;
  icon: LucideIcon;
  title: string;
  accent: string;
  description: string;
  bullets: string[];
};

const FEATURES: Feature[] = [
  {
    anchor: "triage",
    chapter: "CHAPTER 01",
    tone: "triage",
    icon: Inbox,
    title: "Reach Inbox Zero",
    accent: "without the dread.",
    description:
      "VectorMail surfaces what needs your attention so the rest can wait. Triage, archive, and snooze without leaving the keyboard.",
    bullets: [
      "Auto-organize messages into Promotions, Social, Updates, and Forums",
      "Surface threads with explicit asks at the top of the list",
      "Snooze, archive, or set a reminder with one shortcut",
      "Carry inbox state forward day to day",
    ],
  },
  {
    anchor: "ai-reply",
    chapter: "CHAPTER 02",
    tone: "compose",
    icon: PenLine,
    title: "Reply in your voice",
    accent: "not someone else's template.",
    description:
      "Reply suggestions trained on your sent mail. The draft is editable, the tone is yours, and nothing leaves the editor without you.",
    bullets: [
      "Drafts learn from your existing thread history",
      "One shortcut to generate, one to insert, one to send",
      "Streaming output so the first sentence shows in under two seconds",
      "Never auto-sends. Every reply is reviewed",
    ],
  },
  {
    anchor: "search",
    chapter: "CHAPTER 03",
    tone: "search",
    icon: Search,
    title: "Find anything, fast",
    accent: "by meaning, not just by words.",
    description:
      "Search by what an email means, not the words it happens to use. Falls back to keywords if embeddings aren't ready.",
    bullets: [
      "Vector search through pgvector for semantic relevance",
      "Filters for sender, label, date, attachment, and read state",
      "Cached query paths for repeated lookups",
      "Hybrid scoring when both signals are available",
    ],
  },
  {
    anchor: "categorize",
    chapter: "CHAPTER 04",
    tone: "automation",
    icon: Filter,
    title: "Auto-triage by intent",
    accent: "rules you actually wrote.",
    description:
      "Each thread is read once, classified by intent, and routed to the right place. You write the rules; the inbox follows.",
    bullets: [
      "Intent inferred from message content, not just headers",
      "Built-in categories plus custom labels",
      "Rule editor for sender, subject, and content overrides",
      "Reclassification on every new message in the thread",
    ],
  },
  {
    anchor: "brief",
    chapter: "CHAPTER 05",
    tone: "intel",
    icon: FileText,
    title: "Daily AI Brief",
    accent: "a one-page read of your morning.",
    description:
      "A short, prioritized read of what arrived overnight and what needs a reply today. Generated once, refreshed as the day moves.",
    bullets: [
      "Highlights decisions, blockers, and explicit asks",
      "Collapses processed items as you move through the queue",
      "Quoted-thread context preserved in summaries",
      "Available in the inbox header and as a standalone view",
    ],
  },
  {
    anchor: "compose",
    chapter: "CHAPTER 06",
    tone: "send",
    icon: Mail,
    title: "Compose without friction",
    accent: "keyboard-first, mouse-optional.",
    description:
      "A keyboard-first editor that stays out of your way. Templates, scheduling, and tracking are one shortcut away.",
    bullets: [
      "Schedule sends to land at a chosen time",
      "Snippets and templates available from the editor",
      "Open and click tracking on a per-thread basis",
      "Multi-account from a single composer window",
    ],
  },
];

type StackItem = {
  icon: LucideIcon;
  title: string;
  color: string;
  tint: string;
  list: string[];
};

const STACK: StackItem[] = [
  {
    icon: Database,
    title: "Storage & search",
    color: LAV_DEEP,
    tint: "rgba(91,76,247,0.10)",
    list: [
      "PostgreSQL with pgvector for embedding storage",
      "Prisma for typed queries against the email model",
      "Embedding backfills run incrementally per account",
      "Falls back to text search when embeddings are missing",
    ],
  },
  {
    icon: Layers,
    title: "Sync & pipelines",
    color: AMBER,
    tint: "rgba(164,90,9,0.10)",
    list: [
      "Aurinko for Gmail OAuth and message delivery",
      "Inngest for background jobs and retries",
      "Delta sync per account; full sync only on first connect",
      "One sync per account at a time, locked at the database",
    ],
  },
  {
    icon: Lock,
    title: "Security & access",
    color: GREEN,
    tint: "rgba(21,128,61,0.10)",
    list: [
      "Account-scoped authorization on every tRPC call",
      "Tokens stored encrypted; revocable from Google at any time",
      "No shared embeddings or summaries across accounts",
      "Hard delete on account removal, no retention",
    ],
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

export default function FeaturesPage() {
  const lastUpdated = "May 2026";
  const totalBullets = FEATURES.reduce((s, f) => s + f.bullets.length, 0);

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: PAPER, color: INK, fontFamily: SANS }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes vmft-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .vmft-index:hover .vmft-index-dot { transform: scale(1.5); }
        .vmft-index:hover .vmft-index-label { color: ${INK}; }
        .vmft-bullet:hover { background: ${PAPER_DEEP}; }
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
            "radial-gradient(circle, rgba(185,28,75,0.10) 0%, rgba(185,28,75,0) 70%)",
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
          THE PRODUCT · SIX SURFACES · ONE INBOX
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
              Inbox velocity,
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                without the noise.
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
              Six surfaces, one product. Each is built around a single
              decision you actually make in email:{" "}
              <span style={{ color: INK, fontWeight: 500 }}>
                read, reply, find, sort, plan, and write.
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { k: "Surfaces", v: String(FEATURES.length) },
                { k: "Capabilities", v: String(totalBullets) },
                { k: "Updated", v: lastUpdated.replace(" 2026", "") },
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
                    animation: `vmft-rise 380ms ${120 + i * 80}ms both ease-out`,
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
                  <Sparkle size={9} /> TABLE OF CONTENTS
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
                  {FEATURES.map((f, i) => {
                    const meta = TONES[f.tone];
                    return (
                      <li key={f.anchor} className="relative">
                        <span
                          aria-hidden
                          className="vmft-index-dot absolute rounded-full"
                          style={{
                            left: -14,
                            top: 14,
                            width: i === 0 ? 8 : 5,
                            height: i === 0 ? 8 : 5,
                            background: i === 0 ? meta.color : "#bcb09a",
                            border: i === 0 ? "1.5px solid #fff" : "none",
                            boxShadow:
                              i === 0
                                ? `0 0 0 2px ${meta.color}40`
                                : "none",
                            transition: "transform 200ms ease",
                          }}
                        />
                        <Link
                          href={`#${f.anchor}`}
                          className="vmft-index block py-2.5"
                          style={{
                            borderBottom:
                              i < FEATURES.length - 1
                                ? `1px dashed ${LINE}`
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: MONO,
                              fontSize: 9,
                              color: meta.color,
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                            }}
                          >
                            {f.chapter} · {meta.label}
                          </div>
                          <div
                            className="vmft-index-label mt-1 truncate"
                            style={{
                              fontFamily: SERIF,
                              fontSize: 14,
                              color: i === 0 ? INK : INK_2,
                              fontWeight: i === 0 ? 600 : 500,
                              letterSpacing: "-0.005em",
                              transition: "color 200ms ease",
                            }}
                          >
                            {f.title}
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
                  <Sparkle size={9} /> AT A GLANCE
                </div>
                <dl className="flex flex-col gap-1.5">
                  {[
                    { k: "Chapters", v: String(FEATURES.length) },
                    { k: "Stack", v: `${STACK.length} pillars` },
                    { k: "Backend", v: "single" },
                    { k: "Vector DB", v: "pgvector" },
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
            {FEATURES.map((f, idx) => {
              const meta = TONES[f.tone];
              const Icon = f.icon;
              return (
                <article
                  key={f.anchor}
                  id={f.anchor}
                  className="relative overflow-hidden scroll-mt-24"
                  style={{
                    background: PAPER,
                    border: `1px solid ${LINE}`,
                    borderRadius: 16,
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(124,90,250,0.04), 0 12px 24px -10px rgba(26,22,18,0.10), 0 32px 64px -20px rgba(26,22,18,0.08)",
                    animation: `vmft-rise 420ms ${idx * 60}ms both ease-out`,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      opacity: 0.06,
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.42  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="absolute"
                    style={{
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: `linear-gradient(180deg, ${meta.color} 0%, ${LINE} 100%)`,
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
                          {f.chapter}
                        </span>
                      </div>

                      <div
                        className="mt-4 grid place-items-center"
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 14,
                          background: meta.tint,
                          border: `1px solid ${meta.color}33`,
                          color: meta.color,
                          boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
                        }}
                      >
                        <Icon className="h-7 w-7" />
                      </div>

                      <div
                        className="mt-5 inline-flex items-center gap-1.5"
                        style={{
                          padding: "4px 10px",
                          background: meta.tint,
                          border: `1px solid ${meta.color}33`,
                          borderRadius: 6,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: meta.color,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 9.5,
                            color: meta.color,
                            letterSpacing: "0.14em",
                            fontWeight: 700,
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <div
                        className="mt-5 hidden md:block"
                        style={{
                          fontFamily: MONO,
                          fontSize: 9.5,
                          color: INK_3,
                          letterSpacing: "0.12em",
                          fontWeight: 600,
                          lineHeight: 1.6,
                        }}
                      >
                        <div>CAPABILITIES · {f.bullets.length}</div>
                        <div>
                          STATUS ·{" "}
                          <span style={{ color: GREEN, fontWeight: 700 }}>
                            SHIPPED
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-7 pb-9 pt-2 md:py-10 md:pr-10 md:pl-0">
                      <h2
                        style={{
                          fontFamily: SERIF,
                          fontSize: "clamp(32px, 3.4vw, 48px)",
                          fontWeight: 500,
                          color: INK,
                          lineHeight: 1.02,
                          letterSpacing: "-0.034em",
                          margin: 0,
                        }}
                      >
                        {f.title}
                        <span
                          style={{
                            fontStyle: "italic",
                            fontWeight: 400,
                            color: meta.color,
                          }}
                        >
                          {" - "}
                          {f.accent}
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
                        {f.description}
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
                            color: meta.color,
                            letterSpacing: "0.2em",
                            fontWeight: 700,
                          }}
                        >
                          ✦ CAPABILITIES · {f.bullets.length}
                        </span>
                        <span
                          style={{ flex: 1, height: 1, background: LINE }}
                        />
                      </div>

                      <ul className="flex flex-col gap-2">
                        {f.bullets.map((b, i) => (
                          <li
                            key={b}
                            className="vmft-bullet flex items-start gap-3 transition-colors"
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
                                background: meta.tint,
                                border: `1px solid ${meta.color}33`,
                                color: meta.color,
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
                      {f.chapter} · {meta.label}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 9.5,
                        color: GREEN,
                        letterSpacing: "0.12em",
                        fontWeight: 700,
                      }}
                    >
                      SHIPPED
                    </span>
                  </div>
                </article>
              );
            })}
            <section
              id="stack"
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
                APPENDIX · THE STACK
              </div>
              <h3
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
                Built on a small, durable stack -{" "}
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                  one backend, no separate vector DB.
                </span>
              </h3>
              <p
                className="mt-3"
                style={{
                  fontFamily: SERIF,
                  fontSize: 15.5,
                  color: INK_2,
                  lineHeight: 1.55,
                  letterSpacing: "-0.005em",
                  maxWidth: 720,
                  margin: 0,
                }}
              >
                Embeddings live next to the messages they describe. The
                surface area is small on purpose - fewer parts to break.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STACK.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.title}
                      className="relative overflow-hidden"
                      style={{
                        background: "#ffffff",
                        border: `1px solid ${LINE}`,
                        borderRadius: 12,
                        padding: "18px 18px 16px",
                        boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
                      }}
                    >
                      <div className="mb-3 flex items-center gap-2.5">
                        <span
                          className="grid place-items-center"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 9,
                            background: s.tint,
                            border: `1px solid ${s.color}33`,
                            color: s.color,
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <h4
                          style={{
                            fontFamily: SERIF,
                            fontSize: 18,
                            fontWeight: 600,
                            color: INK,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                            margin: 0,
                          }}
                        >
                          {s.title}
                        </h4>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {s.list.map((line) => (
                          <li
                            key={line}
                            className="flex items-start gap-2"
                            style={{
                              fontFamily: SERIF,
                              fontSize: 13.5,
                              color: INK_2,
                              lineHeight: 1.5,
                              letterSpacing: "-0.005em",
                            }}
                          >
                            <span
                              aria-hidden
                              style={{
                                width: 4,
                                height: 4,
                                borderRadius: 999,
                                background: s.color,
                                marginTop: 8,
                                flexShrink: 0,
                              }}
                            />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
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
                  <Sparkle size={9} /> TRY IT
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
                  See VectorMail{" "}
                  <span style={{ fontStyle: "italic" }}>in your inbox.</span>
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
                  Connect your Gmail account and watch six surfaces wake up
                  against your real mail. No card, no commitment.
                </p>
                <Link
                  href="/api/demo/enter"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 transition-all hover:-translate-y-px"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background:
                      "linear-gradient(180deg, #2a2520 0%, #1a1612 100%)",
                    color: "#ffffff",
                    fontFamily: SANS,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "-0.005em",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(26,22,18,0.32), 2px 2px 0 #c4b894",
                  }}
                >
                  Open the demo
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d={ARROW_PATH}
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
                  <Sparkle size={9} /> JUMP TO STACK
                </div>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 14,
                    color: INK_2,
                    lineHeight: 1.55,
                    letterSpacing: "-0.005em",
                    margin: 0,
                  }}
                >
                  Want the underlying stack - storage, sync, security?
                  The appendix sits below the chapters.
                </p>
                <Link
                  href="#stack"
                  className="mt-4 inline-flex items-center gap-1.5"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: INK,
                    letterSpacing: "0.14em",
                    fontWeight: 700,
                    textDecoration: "underline",
                    textUnderlineOffset: 4,
                  }}
                >
                  → READ THE APPENDIX
                </Link>
              </div>

              <div
                className="relative"
                style={{
                  background: "#ffffff",
                  border: `1px solid ${LINE}`,
                  borderRadius: 14,
                  padding: "18px 20px",
                  boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
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
                  <Sparkle size={9} /> FEATURE REQUEST?
                </div>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 14,
                    color: INK_2,
                    lineHeight: 1.55,
                    letterSpacing: "-0.005em",
                    margin: 0,
                  }}
                >
                  Tell us what you&apos;d want from your inbox.{" "}
                  <span style={{ fontStyle: "italic", color: INK }}>
                    We read every message.
                  </span>
                </p>
                <Link
                  href="mailto:parbhat@parbhat.work"
                  className="mt-4 inline-flex w-full items-center justify-between gap-2 transition-all hover:-translate-y-px"
                  style={{
                    padding: "9px 12px",
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
                Behavior may change as the product matures.{" "}
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
                  Check the changelog →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
