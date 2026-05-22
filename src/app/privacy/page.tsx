"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  Lock,
  Database,
  Globe,
  Shield,
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

const LAST_UPDATED = "January 2026";

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
    anchor: "collection",
    chapter: "I",
    label: "COLLECTION",
    color: LAV_DEEP,
    tint: "rgba(91,76,247,0.10)",
    icon: Eye,
    title: "Information we collect",
    accent: "only what's needed to run the product.",
    lead:
      "We collect your Gmail content under explicit OAuth scopes, the account details you provide, minimal usage telemetry, and basic device metadata for security.",
    bullets: [
      "Gmail data via OAuth and the Gmail API: message content, headers, and metadata",
      "Account information you provide on sign-up (name, email)",
      "Usage analytics to monitor reliability and improve the product",
      "Device and browser metadata for security and abuse prevention",
    ],
  },
  {
    anchor: "use",
    chapter: "II",
    label: "USAGE",
    color: AMBER,
    tint: "rgba(164,90,9,0.10)",
    icon: Lock,
    title: "How we use it",
    accent: "to power the features you turned on - nothing else.",
    lead:
      "Your mail is accessed solely to power search, summaries, and inbox organization inside VectorMail. Embeddings live next to the messages they describe.",
    bullets: [
      "Gmail data is accessed solely to provide search, summarization, and organization",
      "Embeddings are generated and stored against the messages they describe",
      "Aurinko handles Gmail synchronization on our behalf",
      "We send service updates only when material changes occur",
    ],
  },
  {
    anchor: "storage",
    chapter: "III",
    label: "STORAGE",
    color: GREEN,
    tint: "rgba(21,128,61,0.10)",
    icon: Database,
    title: "Storage & security",
    accent: "account-scoped, encrypted, and revocable.",
    lead:
      "Mail, embeddings, and summaries are stored in account-scoped tables. Tokens are encrypted at rest and you can revoke access from Google at any time.",
    bullets: [
      "Mail and embeddings are stored in account-scoped tables",
      "Tokens are encrypted at rest and revocable from Google",
      "We isolate user data so embeddings never cross between accounts",
      "On account deletion, mail, embeddings, and summaries are removed",
    ],
  },
  {
    anchor: "sharing",
    chapter: "IV",
    label: "RESTRICTIONS",
    color: ROSE,
    tint: "rgba(185,28,75,0.10)",
    icon: Globe,
    title: "Sharing & restrictions",
    accent: "we do not sell, rent, or train on your mail.",
    lead:
      "Your mail does not leave the VectorMail boundary to advertisers, data brokers, or shared AI training pipelines. Period.",
    bullets: [
      "We never sell or rent your personal information or Gmail data",
      "We do not use your Gmail data for advertising",
      "We do not train shared or public AI models on your mail",
      "Sharing only with explicit consent or where required by law",
    ],
  },
];

const RIGHTS = [
  "Right to access",
  "Right to correction",
  "Right to deletion",
  "Right to portability",
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

export default function PrivacyPage() {
  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: PAPER, color: INK, fontFamily: SANS }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes vmpr-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .vmpr-index:hover .vmpr-dot { transform: scale(1.5); }
        .vmpr-index:hover .vmpr-label { color: ${INK}; }
        .vmpr-bullet:hover { background: ${PAPER_DEEP}; }
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
            "radial-gradient(circle, rgba(21,128,61,0.13) 0%, rgba(21,128,61,0) 70%)",
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
          PRIVACY POLICY · WHAT WE COLLECT · WHAT WE DON&apos;T
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
              How we handle
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                your mail.
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
              What we collect, what we don&apos;t, and what you control.{" "}
              <span style={{ color: INK, fontWeight: 500 }}>
                Plain language - no legalese padding.
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { k: "Sections", v: String(SECTIONS.length) },
                { k: "Effective", v: LAST_UPDATED.replace(" 2026", "") },
                { k: "Plain text", v: "Yes" },
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
                    animation: `vmpr-rise 380ms ${120 + i * 80}ms both ease-out`,
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
                  {[
                    ...SECTIONS.map((s) => ({
                      anchor: s.anchor,
                      label: s.label,
                      title: s.title,
                      color: s.color,
                    })),
                    {
                      anchor: "compliance",
                      label: "GOOGLE API",
                      title: "Compliance",
                      color: AMBER,
                    },
                    {
                      anchor: "rights",
                      label: "YOUR RIGHTS",
                      title: "Access, correction, deletion",
                      color: LAV_DEEP,
                    },
                  ].map((s, i, all) => (
                    <li key={s.anchor} className="relative">
                      <span
                        aria-hidden
                        className="vmpr-dot absolute rounded-full"
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
                        className="vmpr-index block py-2.5"
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
                            color: s.color,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          className="vmpr-label mt-1 truncate"
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
                  <Sparkle size={9} /> AT A GLANCE
                </div>
                <dl className="flex flex-col gap-1.5">
                  {[
                    { k: "Effective", v: LAST_UPDATED },
                    { k: "Type", v: "Privacy" },
                    { k: "Scope", v: "All users" },
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
                    animation: `vmpr-rise 420ms ${idx * 60}ms both ease-out`,
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
                          §{s.chapter}
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
                          ✦ {s.bullets.length} POINTS
                        </span>
                        <span
                          style={{ flex: 1, height: 1, background: LINE }}
                        />
                      </div>

                      <ul className="flex flex-col gap-2">
                        {s.bullets.map((b, i) => (
                          <li
                            key={b}
                            className="vmpr-bullet flex items-start gap-3 transition-colors"
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
                      §{s.chapter} · {s.label}
                    </span>
                  </div>
                </article>
              );
            })}
            <article
              id="compliance"
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
                  color: AMBER,
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                }}
              >
                <Sparkle size={10} color={AMBER} />
                APPENDIX A · GOOGLE API COMPLIANCE
              </div>
              <h3
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(28px, 3vw, 40px)",
                  fontWeight: 500,
                  color: INK,
                  letterSpacing: "-0.034em",
                  lineHeight: 1.02,
                  margin: 0,
                }}
              >
                Gmail API &amp;{" "}
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                  Limited Use compliance.
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
                ectorMail uses Google OAuth 2.0 and the Gmail API to read the
                messages, headers, and metadata you authorize. That access is
                used only to power search, summarization, and organization
                features inside the product. We do not use Gmail data for
                advertising, do not sell or share it with third parties, and
                do not use it to train shared or public AI models.
                <p className="mt-4" style={{ margin: "16px 0 0" }}>
                  You can revoke access at any time from{" "}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: AMBER,
                      fontWeight: 600,
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    Google account settings
                  </a>{" "}
                  or by disconnecting your account here. VectorMail&apos;s use
                  of Gmail data complies with the{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 65%, rgba(164,90,9,0.32) 65%)",
                      padding: "0 2px",
                      fontWeight: 500,
                    }}
                  >
                    Google API Services User Data Policy
                  </span>
                  , including the Limited Use requirements.
                </p>
              </div>
            </article>

            <article
              id="rights"
              className="relative overflow-hidden scroll-mt-24"
              style={{
                background: "#ffffff",
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
                APPENDIX B · YOUR RIGHTS
              </div>
              <h3
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(28px, 3vw, 40px)",
                  fontWeight: 500,
                  color: INK,
                  letterSpacing: "-0.034em",
                  lineHeight: 1.02,
                  margin: 0,
                }}
              >
                Access, correct, export, or{" "}
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                  delete - any time.
                </span>
              </h3>
              <p
                className="mt-4 max-w-[820px]"
                style={{
                  fontFamily: SERIF,
                  fontSize: 16.5,
                  color: INK_2,
                  lineHeight: 1.62,
                  letterSpacing: "-0.005em",
                  margin: 0,
                }}
              >
                Disconnect Gmail from inside VectorMail or from Google account
                settings. On account deletion, all stored mail, embeddings, and
                summaries are removed.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {RIGHTS.map((right) => (
                  <span
                    key={right}
                    className="inline-flex items-center gap-1.5"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: PAPER,
                      border: `1px solid ${LINE}`,
                      boxShadow: `1px 1px 0 ${PAPER_SHADOW}`,
                    }}
                  >
                    <Check size={12} style={{ color: GREEN }} strokeWidth={2.6} />
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontSize: 14,
                        color: INK,
                        fontWeight: 500,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {right}
                    </span>
                  </span>
                ))}
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
                  <Sparkle size={9} /> QUESTIONS?
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
                  Anything unclear or{" "}
                  <span style={{ fontStyle: "italic" }}>missing?</span>
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
                  If anything here needs follow-up, write in. We read every
                  message and reply within the same week.
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
                  <Sparkle size={9} /> WHAT WE PROMISE
                </div>
                <ul className="flex flex-col gap-2">
                  {[
                    {
                      v: "Account-scoped storage",
                      color: GREEN,
                    },
                    {
                      v: "No advertising use",
                      color: GREEN,
                    },
                    {
                      v: "No shared-model training",
                      color: GREEN,
                    },
                    {
                      v: "Hard delete on removal",
                      color: GREEN,
                    },
                  ].map((row) => (
                    <li
                      key={row.v}
                      className="flex items-center gap-2"
                      style={{
                        padding: "6px 10px",
                        background: "#ffffff",
                        border: `1px solid ${LINE}`,
                        borderRadius: 8,
                      }}
                    >
                      <Check
                        size={13}
                        strokeWidth={2.6}
                        style={{ color: row.color, flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontFamily: SERIF,
                          fontSize: 13.5,
                          color: INK,
                          fontWeight: 500,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {row.v}
                      </span>
                    </li>
                  ))}
                </ul>
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
                  <Sparkle size={9} /> RELATED
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
                  For the rules of using the product itself -{" "}
                  <span style={{ fontStyle: "italic", color: INK }}>
                    what you agree to when you sign up
                  </span>{" "}
                  - see the Terms.
                </p>
                <Link
                  href="/terms"
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
                  → READ THE TERMS
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
                Effective as of {LAST_UPDATED}. We update this policy when
                practices change and date the change here.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
