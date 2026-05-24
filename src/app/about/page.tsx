"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  Code,
  Database,
  Lock,
  Check,
  Mail,
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
    anchor: "what",
    chapter: "I",
    label: "PRODUCT",
    color: LAV_DEEP,
    tint: "rgba(91,76,247,0.10)",
    icon: Compass,
    title: "What VectorMail is",
    accent: "an intelligence layer, not a replacement.",
    lead:
      "VectorMail sits next to the Gmail account you already use. It reads with you, drafts in your voice, and finds the thread you half-remember.",
    bullets: [
      "An intelligence layer that sits on top of Gmail through Aurinko",
      "Threads sync into PostgreSQL with embeddings stored in pgvector",
      "AI summaries, drafts, and search run against your own indexed mail",
      "Works alongside Gmail; we don't replace your underlying account",
    ],
  },
  {
    anchor: "why",
    chapter: "II",
    label: "MOTIVATION",
    color: ROSE,
    tint: "rgba(185,28,75,0.10)",
    icon: Code,
    title: "Why we built it",
    accent: "search is still keyword. AI is still over-eager.",
    lead:
      "Most email clients pretend it's 2008. Most AI features pretend you wanted them to send the email for you. We wanted neither.",
    bullets: [
      "Most email clients still treat search as keyword lookup",
      "Most AI features replace the user instead of helping them decide",
      "Sending and reading remain separate from organizing and finding",
      "We wanted one workspace where all four happen at the same desk",
    ],
  },
  {
    anchor: "how",
    chapter: "III",
    label: "STACK",
    color: AMBER,
    tint: "rgba(164,90,9,0.10)",
    icon: Database,
    title: "How it's built",
    accent: "small surface area, durable parts.",
    lead:
      "Next.js on the front. Postgres + pgvector for storage and recall. Aurinko for sync. Inngest for jobs. OpenRouter and Gemini for the AI. That's the whole picture.",
    bullets: [
      "Next.js 15, React 19, and Tailwind on the front end",
      "tRPC and Prisma against PostgreSQL with pgvector for search",
      "Aurinko for Gmail sync, Inngest for background jobs",
      "OpenRouter for chat completions, Gemini for embeddings",
    ],
  },
  {
    anchor: "data",
    chapter: "IV",
    label: "DATA POLICY",
    color: GREEN,
    tint: "rgba(21,128,61,0.10)",
    icon: Lock,
    title: "How we handle your data",
    accent: "account-scoped, encrypted, deletable.",
    lead:
      "Your mail is yours. Nothing crosses accounts, nothing trains shared models, and hard-deletes are real.",
    bullets: [
      "Mail is account-scoped; nothing crosses between users",
      "Tokens are stored encrypted and revocable from Google",
      "Embeddings and summaries are deleted when the account is removed",
      "We do not use your mail to train shared or public models",
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

export default function AboutPage() {
  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: PAPER, color: INK, fontFamily: SANS }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes vmab-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .vmab-index:hover .vmab-dot { transform: scale(1.5); }
        .vmab-index:hover .vmab-label { color: ${INK}; }
        .vmab-bullet:hover { background: ${PAPER_DEEP}; }
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
            "radial-gradient(circle, rgba(164,90,9,0.13) 0%, rgba(164,90,9,0) 70%)",
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
            "radial-gradient(circle, rgba(91,76,247,0.12) 0%, rgba(91,76,247,0) 70%)",
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
          A FIELD NOTE · WHO WE ARE · WHAT WE&apos;RE BUILDING
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
              Not another inbox.
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                One that reads with you.
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
              VectorMail is a thin intelligence layer over the Gmail
              account you already have. It sits next to your inbox and
              helps you decide{" "}
              <span style={{ color: INK, fontWeight: 500 }}>
                what to read, what to reply to, and what to ignore.
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { k: "Chapters", v: String(SECTIONS.length) },
                { k: "Status", v: "Beta" },
                { k: "Response", v: "Same-week" },
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
                    animation: `vmab-rise 380ms ${120 + i * 80}ms both ease-out`,
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
                  {SECTIONS.map((s, i) => (
                    <li key={s.anchor} className="relative">
                      <span
                        aria-hidden
                        className="vmab-dot absolute rounded-full"
                        style={{
                          left: -14,
                          top: 14,
                          width: i === 0 ? 8 : 5,
                          height: i === 0 ? 8 : 5,
                          background: i === 0 ? s.color : "#bcb09a",
                          border: i === 0 ? "1.5px solid #fff" : "none",
                          boxShadow:
                            i === 0 ? `0 0 0 2px ${s.color}40` : "none",
                          transition: "transform 200ms ease",
                        }}
                      />
                      <Link
                        href={`#${s.anchor}`}
                        className="vmab-index block py-2.5"
                        style={{
                          borderBottom:
                            i < SECTIONS.length - 1
                              ? `1px dashed ${LINE}`
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 9,
                            color: s.color,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                          }}
                        >
                          {s.chapter} · {s.label}
                        </div>
                        <div
                          className="vmab-label mt-1 truncate"
                          style={{
                            fontFamily: SERIF,
                            fontSize: 14,
                            color: i === 0 ? INK : INK_2,
                            fontWeight: i === 0 ? 600 : 500,
                            letterSpacing: "-0.005em",
                            transition: "color 200ms ease",
                          }}
                        >
                          {s.title}
                        </div>
                      </Link>
                    </li>
                  ))}
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
                  <Sparkle size={9} /> COLOPHON
                </div>
                <dl className="flex flex-col gap-1.5">
                  {[
                    { k: "Updated", v: "May 2026" },
                    { k: "Reachable at", v: "Web + mail" },
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
                    animation: `vmab-rise 420ms ${idx * 60}ms both ease-out`,
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
                        className="mt-4"
                        style={{
                          fontFamily: SERIF,
                          fontSize: 64,
                          fontWeight: 500,
                          color: INK,
                          letterSpacing: "-0.04em",
                          lineHeight: 0.9,
                          fontStyle: "italic",
                        }}
                      >
                        {s.chapter}
                      </div>

                      <div
                        className="mt-5 inline-flex items-center gap-1.5"
                        style={{
                          padding: "5px 10px",
                          background: s.tint,
                          border: `1px solid ${s.color}33`,
                          borderRadius: 6,
                        }}
                      >
                        <Icon size={12} style={{ color: s.color }} />
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
                        <div>POINTS · {s.bullets.length}</div>
                        <div>FILED · MAY 2026</div>
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
                            className="vmab-bullet flex items-start gap-3 transition-colors"
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

            <section
              id="where"
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
                LETTER FROM THE WORKBENCH · MAY 2026
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
                Where we are -{" "}
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                  honestly.
                </span>
              </h3>

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
                  V
                </span>
                ectorMail is in active beta. The core sync, search, and
                reply pipelines are stable; the daily brief and intent
                classifier are still maturing.
                <p className="mt-4" style={{ margin: "16px 0 0" }}>
                  We ship behind a small, vetted user list while the
                  product hardens. If you want access,{" "}
                  <Link
                    href="mailto:parbhat@parbhat.work"
                    style={{
                      color: LAV_DEEP,
                      fontWeight: 600,
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    send a note
                  </Link>
                  . We&apos;ll get back the same week.
                </p>
                <p className="mt-4" style={{ margin: "16px 0 0" }}>
                  Updates land in the{" "}
                  <Link
                    href="/changelog"
                    style={{
                      color: LAV_DEEP,
                      fontWeight: 600,
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    changelog
                  </Link>
                  . Material changes to data handling go in the privacy
                  policy with the date of the change.
                </p>
              </div>

              <div
                aria-hidden
                className="my-7 flex items-center gap-3"
              >
                <span style={{ flex: 1, height: 1, background: LINE }} />
                <Sparkle size={10} color={LINE} />
                <span style={{ flex: 1, height: 1, background: LINE }} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 15,
                    color: INK_2,
                    letterSpacing: "-0.005em",
                  }}
                >
                  - signed,{" "}
                  <span style={{ color: INK, fontWeight: 600 }}>
                    the VectorMail team
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: INK_3,
                    letterSpacing: "0.14em",
                    fontWeight: 700,
                  }}
                >
                  MAY 2026 · VECTORMAIL.APP
                </div>
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
                  <Sparkle size={9} /> GET IN TOUCH
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
                  Bug, feature, or{" "}
                  <span style={{ fontStyle: "italic" }}>access request?</span>
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
                  Same inbox for all three. We read every message and reply
                  within the same week.
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
                  <Sparkle size={9} /> WHERE WE STAND
                </div>
                <dl className="flex flex-col gap-2">
                  {[
                    {
                      k: "Phase",
                      v: "Active beta",
                      color: AMBER,
                    },
                    {
                      k: "Core",
                      v: "Sync · Search · Reply",
                      color: GREEN,
                    },
                    {
                      k: "Maturing",
                      v: "Brief · Intent",
                      color: LAV_DEEP,
                    },
                    {
                      k: "Access",
                      v: "By request",
                      color: ROSE,
                    },
                  ].map((row) => (
                    <div key={row.k} className="flex items-baseline gap-2">
                      <span
                        aria-hidden
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: row.color,
                          flexShrink: 0,
                        }}
                      />
                      <dt
                        style={{
                          fontFamily: MONO,
                          fontSize: 9.5,
                          color: INK_3,
                          letterSpacing: "0.1em",
                          fontWeight: 700,
                          width: 70,
                          flexShrink: 0,
                        }}
                      >
                        {row.k.toUpperCase()}
                      </dt>
                      <dd
                        style={{
                          fontFamily: SERIF,
                          fontSize: 13.5,
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
                  <Sparkle size={9} /> THE BUILD LOG
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
                  Every shipped release is filed in the changelog with a
                  date, category, and{" "}
                  <span style={{ fontStyle: "italic", color: INK }}>
                    a short note on the why.
                  </span>
                </p>
                <Link
                  href="/changelog"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 transition-all hover:-translate-y-px"
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    background:
                      "linear-gradient(180deg, #2a2520 0%, #1a1612 100%)",
                    color: "#ffffff",
                    fontFamily: SANS,
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: "-0.005em",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(26,22,18,0.32), 2px 2px 0 #c4b894",
                  }}
                >
                  Read the changelog
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
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
