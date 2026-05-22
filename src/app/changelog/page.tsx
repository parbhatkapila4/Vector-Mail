"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Zap,
  Search,
  Calendar,
  Mail,
  Wrench,
  Plus,
  Rss,
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

type CategoryKey = "performance" | "search" | "feature" | "infra";

const CATEGORIES: Record<
  CategoryKey,
  {
    label: string;
    color: string;
    tint: string;
    icon: LucideIcon;
  }
> = {
  performance: { label: "PERFORMANCE", color: AMBER, tint: "rgba(164,90,9,0.10)", icon: Zap },
  search: { label: "SEARCH", color: LAV_DEEP, tint: "rgba(91,76,247,0.10)", icon: Search },
  feature: { label: "WORKFLOW", color: GREEN, tint: "rgba(21,128,61,0.10)", icon: Calendar },
  infra: { label: "INFRASTRUCTURE", color: ROSE, tint: "rgba(185,28,75,0.10)", icon: Wrench },
};

type Release = {
  version: string;
  date: string;
  category: CategoryKey;
  title: string;
  accent: string;
  lead: string;
  bullets: string[];
};

const RELEASES: Release[] = [
  {
    version: "v2.4",
    date: "April 2026",
    category: "performance",
    title: "Faster daily operations.",
    accent: "speed where it counts.",
    lead:
      "The daily-flow paths got tighter - the morning brief, the sync loop, and the action parser were each revisited around the things you do every day.",
    bullets: [
      "Brief 2.0 with better quoted-thread extraction",
      "Incremental sync improvements for faster refresh cycles",
      "Cleaner action parsing for replies and follow-ups",
    ],
  },
  {
    version: "v2.3",
    date: "March 2026",
    category: "search",
    title: "Better search & context.",
    accent: "recall, sharpened.",
    lead:
      "Semantic search learned to weight time and conversational context together. Long chains finally summarize without dropping the thread.",
    bullets: [
      "Date-range filters added to semantic search",
      "Improved thread relevance scoring",
      "Sharper summaries for long conversation chains",
    ],
  },
  {
    version: "v2.2",
    date: "February 2026",
    category: "feature",
    title: "Calendar & workflow upgrades.",
    accent: "tighter loops with the rest of your stack.",
    lead:
      "Mail and meetings stopped feeling like separate apps. Invites are detected, calendar links generated, and the keyboard flow rebuilt around the journey.",
    bullets: [
      "Calendar bridge for invite handling",
      "Improved keyboard flow in list and reader views",
      "More reliable background sync and indexing",
    ],
  },
  {
    version: "v2.1",
    date: "January 2026",
    category: "infra",
    title: "Vector pipeline hardening.",
    accent: "the plumbing got stronger and quieter.",
    lead:
      "Reindex jobs survive disconnects, fallbacks are graceful, and the embedding store finally has the index it deserves.",
    bullets: [
      "pgvector indexes rebuilt with ivfflat tuning",
      "Embedding backfills resume cleanly after disconnect",
      "Hybrid search falls back to text mode if embeddings missing",
    ],
  },
];

const FILTERS: Array<{ key: "all" | CategoryKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "performance", label: "Performance" },
  { key: "search", label: "Search" },
  { key: "feature", label: "Workflow" },
  { key: "infra", label: "Infrastructure" },
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

export default function ChangelogPage() {
  const [filter, setFilter] = useState<"all" | CategoryKey>("all");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const visible = useMemo(
    () =>
      filter === "all" ? RELEASES : RELEASES.filter((r) => r.category === filter),
    [filter],
  );

  const latestRelease = RELEASES[0]?.date ?? "-";

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: SANS,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes vmcl-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes vmcl-pulse { 0%, 100% { box-shadow: 0 0 0 3px rgba(91,76,247,0.18); } 50% { box-shadow: 0 0 0 8px rgba(91,76,247,0.04); } }
        @keyframes vmcl-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .vmcl-row:hover .vmcl-row-arrow { transform: translateX(3px); opacity: 1; }
        .vmcl-row:hover .vmcl-row-label { color: ${INK}; }
        .vmcl-version-link:hover .vmcl-version-dot { transform: scale(1.5); }
        .vmcl-version-link:hover .vmcl-version-label { color: ${INK}; }
        .vmcl-bullet:hover { background: ${PAPER_DEEP}; }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
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
            "radial-gradient(circle, rgba(164,90,9,0.10) 0%, rgba(164,90,9,0) 70%)",
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

      <section className="relative z-10 mx-auto w-[95%] max-w-[1920px] px-2 pt-10 pb-8 md:pt-16 md:pb-10">
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
          FROM THE WORKBENCH · RELEASE NOTES
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
              What shipped,
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                &amp; when it shipped.
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
              Releases across brief generation, semantic search, sync, and
              inbox workflow speed.{" "}
              <span style={{ color: INK, fontWeight: 500 }}>
                Newest at the top.
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { k: "Releases logged", v: String(RELEASES.length) },
                { k: "Latest", v: latestRelease },
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
                    animation: `vmcl-rise 380ms ${120 + i * 80}ms both ease-out`,
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

        <div
          aria-hidden
          className="my-8 flex items-center gap-3 md:my-10"
        >
          <span style={{ flex: 1, height: 1, background: LINE }} />
          <Sparkle size={10} color={LINE} />
          <span style={{ flex: 1, height: 1, background: LINE }} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const active = f.key === filter;
              const meta = f.key !== "all" ? CATEGORIES[f.key] : null;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="inline-flex items-center gap-1.5 transition-all"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: active ? INK : "#ffffff",
                    border: `1px solid ${active ? INK : LINE}`,
                    color: active ? "#ffffff" : INK_2,
                    fontFamily: SANS,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "-0.005em",
                    boxShadow: active
                      ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 6px rgba(26,22,18,0.25)"
                      : `0 1px 0 rgba(26,22,18,0.04)`,
                  }}
                >
                  {meta && (
                    <span
                      aria-hidden
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: meta.color,
                      }}
                    />
                  )}
                  {f.label}
                </button>
              );
            })}
          </div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: INK_3,
              letterSpacing: "0.14em",
              fontWeight: 700,
            }}
          >
            SHOWING {visible.length} · OF {RELEASES.length}
          </span>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-[95%] max-w-[1920px] px-2 pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)_360px] lg:gap-10 xl:grid-cols-[300px_minmax(0,1fr)_420px]">
          <aside className="relative hidden lg:block">
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
                  <Sparkle size={9} /> RELEASE INDEX
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
                  {RELEASES.map((r, i) => (
                    <li key={r.version} className="relative">
                      <span
                        aria-hidden
                        className="vmcl-version-dot absolute rounded-full"
                        style={{
                          left: -14,
                          top: 14,
                          width: i === 0 ? 8 : 5,
                          height: i === 0 ? 8 : 5,
                          background: i === 0 ? LAV : "#bcb09a",
                          border: i === 0 ? "1.5px solid #fff" : "none",
                          boxShadow:
                            i === 0
                              ? "0 0 0 2px rgba(91,76,247,0.25)"
                              : "none",
                          transition: "transform 200ms ease",
                        }}
                      />
                      <Link
                        href={`#${r.version}`}
                        className="vmcl-version-link block py-2.5"
                        style={{
                          borderBottom:
                            i < RELEASES.length - 1
                              ? `1px dashed ${LINE}`
                              : "none",
                        }}
                      >
                        <div className="flex items-baseline gap-2">
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 10,
                              color: i === 0 ? LAV_DEEP : INK_3,
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              width: 44,
                              flexShrink: 0,
                            }}
                          >
                            {r.version}
                          </span>
                          <span
                            className="vmcl-version-label truncate"
                            style={{
                              fontFamily: SERIF,
                              fontSize: 14,
                              color: i === 0 ? INK : INK_2,
                              fontWeight: i === 0 ? 600 : 500,
                              letterSpacing: "-0.005em",
                              transition: "color 200ms ease",
                            }}
                          >
                            {r.title.replace(/\.$/, "")}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 9,
                            color: INK_3,
                            letterSpacing: "0.08em",
                            fontWeight: 600,
                            marginTop: 3,
                            paddingLeft: 50,
                          }}
                        >
                          {r.date.toUpperCase()}
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
                    { k: "Releases", v: String(RELEASES.length) },
                    { k: "Latest", v: latestRelease },
                    { k: "Order", v: "Newest first" },
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
            {visible.length === 0 ? (
              <div
                className="grid place-items-center py-24"
                style={{
                  background: "#ffffff",
                  border: `1px dashed ${LINE}`,
                  borderRadius: 14,
                }}
              >
                <div className="text-center">
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 22,
                      color: INK,
                    }}
                  >
                    No releases match this filter.
                  </div>
                  <div
                    className="mt-1"
                    style={{
                      fontFamily: MONO,
                      fontSize: 10.5,
                      color: INK_3,
                      letterSpacing: "0.16em",
                      fontWeight: 600,
                    }}
                  >
                    TRY ANOTHER · {RELEASES.length} TOTAL
                  </div>
                </div>
              </div>
            ) : (
              visible.map((r, idx) => {
                const meta = CATEGORIES[r.category];
                const Icon = meta.icon;
                return (
                  <article
                    key={r.version}
                    id={r.version}
                    className="relative overflow-hidden scroll-mt-24"
                    style={{
                      background: PAPER,
                      border: `1px solid ${LINE}`,
                      borderRadius: 16,
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(124,90,250,0.04), 0 12px 24px -10px rgba(26,22,18,0.10), 0 32px 64px -20px rgba(26,22,18,0.08)",
                      animation: `vmcl-rise 420ms ${idx * 80}ms both ease-out`,
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
                      <div
                        className="relative px-7 pt-7 md:pl-10 md:pr-0 md:pt-10"
                        style={{
                          borderRight:
                            "var(--vmcl-aside-border, 1px solid transparent)",
                        }}
                      >
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
                            {r.version.toUpperCase()} · {r.date.toUpperCase()}
                          </span>
                        </div>

                        <div
                          className="mt-4"
                          style={{
                            fontFamily: SERIF,
                            fontSize: 56,
                            fontWeight: 500,
                            color: INK,
                            letterSpacing: "-0.04em",
                            lineHeight: 0.9,
                          }}
                        >
                          {r.version}
                        </div>
                        <div
                          className="mt-1"
                          style={{
                            fontFamily: SERIF,
                            fontStyle: "italic",
                            fontSize: 15,
                            color: INK_2,
                            letterSpacing: "-0.01em",
                            fontWeight: 500,
                          }}
                        >
                          {r.date}
                        </div>

                        <div
                          className="mt-5 inline-flex items-center gap-1.5"
                          style={{
                            padding: "5px 10px",
                            background: meta.tint,
                            border: `1px solid ${meta.color}33`,
                            borderRadius: 6,
                          }}
                        >
                          <Icon
                            size={12}
                            style={{ color: meta.color }}
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
                          <div>
                            HIGHLIGHTS · {r.bullets.length}
                          </div>
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
                          {r.title.replace(/\.$/, "")}
                          <span
                            style={{
                              fontStyle: "italic",
                              fontWeight: 400,
                              color: meta.color,
                            }}
                          >
                            {" - "}
                            {r.accent}
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
                          {r.lead}
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
                            ✦ HIGHLIGHTS · {r.bullets.length}
                          </span>
                          <span
                            style={{ flex: 1, height: 1, background: LINE }}
                          />
                        </div>

                        <ul className="flex flex-col gap-2">
                          {r.bullets.map((b, i) => (
                            <li
                              key={b}
                              className="vmcl-bullet flex items-start gap-3 transition-colors"
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
                                <Plus size={12} strokeWidth={2.4} />
                              </span>
                              <div className="flex-1">
                                <div
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
                                + {String(i + 1).padStart(2, "0")}
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
                        {r.version.toUpperCase()} · {r.date.toUpperCase()} ·{" "}
                        {meta.label}
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
              })
            )}
          </div>

          <aside className="relative">
            <div className="sticky top-6 flex flex-col gap-5">
              <div
                id="subscribe"
                className="relative overflow-hidden scroll-mt-24"
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
                  <Sparkle size={9} /> SUBSCRIBE · MONTHLY
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
                  Get the next issue{" "}
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
                  One short email per release. No marketing copy, no tracking
                  pixels - just what changed and why.
                </p>

                <form
                  className="mt-4 flex flex-col gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim()) setSubscribed(true);
                  }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: PAPER,
                      border: `1px solid ${LINE}`,
                    }}
                  >
                    <Mail
                      className="h-4 w-4 shrink-0"
                      style={{ color: INK_3 }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="you@workplace.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={subscribed}
                      className="w-full bg-transparent outline-none"
                      style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        color: INK,
                        letterSpacing: "-0.005em",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={subscribed}
                    className="inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:hover:translate-y-0"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: subscribed
                        ? "linear-gradient(180deg, #1f7a3a 0%, #15803d 100%)"
                        : "linear-gradient(180deg, #2a2520 0%, #1a1612 100%)",
                      color: "#ffffff",
                      fontFamily: SANS,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "-0.005em",
                      cursor: subscribed ? "default" : "pointer",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(26,22,18,0.32), 2px 2px 0 #c4b894",
                    }}
                  >
                    {subscribed ? "✓ Subscribed" : "Notify me"}
                    {!subscribed && (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d={ARROW_PATH}
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </form>

                <div
                  className="mt-4 flex items-center justify-between border-t pt-3"
                  style={{ borderColor: LINE }}
                >
                  <a
                    href="/rss.xml"
                    className="inline-flex items-center gap-1.5"
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: INK_2,
                      letterSpacing: "0.12em",
                      fontWeight: 700,
                    }}
                  >
                    <Rss className="h-3 w-3" />
                    RSS FEED
                  </a>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: INK_3,
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                    }}
                  >
                    UNSUBSCRIBE · ONE CLICK
                  </span>
                </div>
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
                  <Sparkle size={9} /> SAW A REGRESSION?
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
                  Tell us what broke. We respond on the same day for anything
                  that affects{" "}
                  <span style={{ fontStyle: "italic", color: INK }}>
                    sync, search, or send.
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
            </div>
          </aside>
        </div>
      </section>

    </main>
  );
}
