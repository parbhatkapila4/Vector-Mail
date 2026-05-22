"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

const ARROW_PATH = "M3 6h6M6 3l3 3-3 3";

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

function PostmarkStamp({
  rotate = -7,
  size = 160,
  opacity = 1,
  idSuffix = "a",
}: {
  rotate?: number;
  size?: number;
  opacity?: number;
  idSuffix?: string;
}) {
  const arcId = `pm-arc-${idSuffix}`;
  return (
    <div
      aria-hidden
      style={{
        transform: `rotate(${rotate}deg)`,
        width: size,
        height: size,
        opacity,
      }}
    >
      <svg viewBox="0 0 160 160" width={size} height={size}>
        <defs>
          <path
            id={arcId}
            d="M 80 80 m -60 0 a 60 60 0 1 1 120 0 a 60 60 0 1 1 -120 0"
          />
        </defs>
        <circle
          cx="80"
          cy="80"
          r="74"
          fill="none"
          stroke={ROSE}
          strokeWidth="1.5"
          strokeDasharray="2 4"
          opacity="0.45"
        />
        <circle
          cx="80"
          cy="80"
          r="66"
          fill="none"
          stroke={ROSE}
          strokeWidth="2.2"
          opacity="0.72"
        />
        <circle
          cx="80"
          cy="80"
          r="64"
          fill="none"
          stroke={ROSE}
          strokeWidth="0.6"
          opacity="0.45"
        />
        <text
          fill={ROSE}
          opacity="0.88"
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "11.5px",
            fontWeight: 700,
            letterSpacing: "0.22em",
          }}
        >
          <textPath href={`#${arcId}`} startOffset="2%">
            RETURN TO SENDER · UNDELIVERABLE MAIL ·
          </textPath>
        </text>
        <text
          x="80"
          y="74"
          textAnchor="middle"
          fill={ROSE}
          opacity="0.92"
          style={{
            fontFamily: "var(--font-newsreader), serif",
            fontStyle: "italic",
            fontSize: "20px",
            fontWeight: 500,
          }}
        >
          no such
        </text>
        <text
          x="80"
          y="96"
          textAnchor="middle"
          fill={ROSE}
          opacity="0.92"
          style={{
            fontFamily: "var(--font-newsreader), serif",
            fontStyle: "italic",
            fontSize: "20px",
            fontWeight: 500,
          }}
        >
          route
        </text>
        <text
          x="80"
          y="115"
          textAnchor="middle"
          fill={ROSE}
          opacity="0.7"
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.35em",
          }}
        >
          ★ 4 0 4 ★
        </text>
        <g opacity="0.5">
          <line x1="80" y1="34" x2="80" y2="42" stroke={ROSE} strokeWidth="1.2" />
          <line
            x1="80"
            y1="118"
            x2="80"
            y2="126"
            stroke={ROSE}
            strokeWidth="1.2"
          />
          <line x1="34" y1="80" x2="42" y2="80" stroke={ROSE} strokeWidth="1.2" />
          <line
            x1="118"
            y1="80"
            x2="126"
            y2="80"
            stroke={ROSE}
            strokeWidth="1.2"
          />
        </g>
      </svg>
    </div>
  );
}

const DESTINATIONS: Array<{
  href: string;
  label: string;
  subject: string;
  category: string;
}> = [
    {
      href: "/",
      label: "Home",
      subject: "Return to vectormail.app",
      category: "PRIMARY",
    },
    {
      href: "/mail",
      label: "Inbox",
      subject: "Open the daily briefing",
      category: "APP",
    },
    {
      href: "/features",
      label: "Features",
      subject: "Tour what VectorMail does",
      category: "PRODUCT",
    },
    {
      href: "/changelog",
      label: "Changelog",
      subject: "See what shipped this week",
      category: "UPDATES",
    },
  ];

export default function NotFound() {
  const pathname = usePathname() ?? "/-";
  const [bootTime, setBootTime] = useState("--:-- PT");
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    setBootTime(
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " PT",
    );
    setToday(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    );
  }, []);

  const displayPath =
    pathname.length > 48 ? pathname.slice(0, 45) + "…" : pathname;

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: SANS,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes vm-stamp-press {
          0% { transform: scale(0.85) rotate(-14deg); opacity: 0; }
          55% { transform: scale(1.06) rotate(-5deg); opacity: 1; }
          100% { transform: scale(1) rotate(-7deg); opacity: 1; }
        }
        @keyframes vm-stamp-press-2 {
          0% { transform: scale(0.85) rotate(4deg); opacity: 0; }
          55% { transform: scale(1.06) rotate(11deg); opacity: 1; }
          100% { transform: scale(1) rotate(9deg); opacity: 1; }
        }
        @keyframes vm-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(185,28,75,0.18); }
          50% { box-shadow: 0 0 0 8px rgba(185,28,75,0.04); }
        }
        @keyframes vm-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes vm-log-fade {
          0% { opacity: 0; transform: translateX(-6px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes vm-rise {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes vm-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(2px, -6px); }
        }
        .vm-link-row:hover .vm-link-dot { transform: scale(1.4); }
        .vm-link-row:hover .vm-link-label { color: ${INK}; }
        .vm-link-row:hover .vm-link-arrow { transform: translateX(3px); opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .vm-anim, [style*="animation"] { animation: none !important; }
        }
      `,
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.42  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed"
        style={{
          right: -200,
          top: -200,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(91,76,247,0.16) 0%, rgba(91,76,247,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed"
        style={{
          left: -220,
          bottom: -220,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(185,28,75,0.11) 0%, rgba(185,28,75,0) 70%)",
        }}
      />

      <header
        className="relative z-10 mx-auto flex w-[95%] max-w-[1920px] items-center justify-between px-6 py-6 md:px-10 md:py-7"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid place-items-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: "linear-gradient(135deg, #5b4cf7 0%, #2d2a9e 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 10px rgba(91,76,247,0.32)",
            }}
          >
            <Sparkle size={13} color="#fff" />
          </span>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 21,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.025em",
            }}
          >
            VectorMail
          </span>
        </Link>
        <div className="hidden items-center gap-3 md:flex">
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: INK_3,
              letterSpacing: "0.18em",
              fontWeight: 600,
            }}
          >
            POSTAL ROUTING NOTICE
          </span>
          <span
            aria-hidden
            style={{ width: 4, height: 4, borderRadius: 999, background: ROSE }}
          />
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: ROSE,
              letterSpacing: "0.14em",
              fontWeight: 700,
            }}
          >
            FILED · {bootTime}
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-[95%] max-w-[1920px] px-6 py-10 md:px-10 md:py-14">
        <div className="relative">
          <div
            className="absolute -top-10 right-2 z-20 hidden sm:block md:right-6"
            style={{
              animation:
                "vm-stamp-press 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <PostmarkStamp rotate={-7} size={160} idSuffix="primary" />
          </div>
          <div
            className="absolute -bottom-6 -left-4 z-20 hidden md:block md:left-6"
            style={{
              animation:
                "vm-stamp-press-2 900ms 220ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <PostmarkStamp
              rotate={9}
              size={112}
              opacity={0.82}
              idSuffix="secondary"
            />
          </div>

          <article
            className="relative overflow-hidden"
            style={{
              background: PAPER,
              border: `1px solid ${LINE}`,
              borderRadius: 18,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(124,90,250,0.04), 0 16px 32px -10px rgba(26,22,18,0.12), 0 40px 80px -20px rgba(26,22,18,0.10), 0 64px 128px -32px rgba(124,90,250,0.14)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: 0.08,
                backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.42  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
              }}
            />

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
                className="ml-auto truncate"
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  color: INK_3,
                  letterSpacing: "0.08em",
                  fontWeight: 500,
                  maxWidth: "60%",
                }}
              >
                vectormail.app{displayPath}
              </span>
            </div>

            <div
              className="relative flex items-center gap-4 px-6 md:px-10"
              style={{
                height: 76,
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
                      "linear-gradient(135deg, #b91c4b 0%, #7f1535 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 10px rgba(185,28,75,0.32)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4l6 4 6-4M2 4v8h12V4M2 4h12"
                      stroke="#fff"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
                    Notice of{" "}
                    <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                      undeliverable mail
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
                    VECTORMAIL POSTAL SERVICE · BOUNCE NO. 404
                  </div>
                </div>
              </div>

              <span
                aria-hidden
                className="ml-auto hidden md:block"
                style={{ width: 1, height: 28, background: LINE }}
              />

              <div className="hidden items-baseline gap-2.5 lg:flex">
                <span
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 14,
                    color: INK,
                    fontWeight: 500,
                  }}
                >
                  {today || "Today"}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: INK_3,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                  }}
                >
                  · HTTP 404
                </span>
              </div>
            </div>

            <div
              aria-hidden
              style={{
                height: 4,
                borderTop: `1px solid ${INK}`,
                marginTop: -2,
                background: PAPER,
              }}
            />

            <div className="relative grid grid-cols-1 md:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr]">
              <aside
                className="relative px-6 py-10 md:px-8"
                style={{
                  background: PAPER_DEEP,
                  borderRight: `1px solid ${LINE}`,
                }}
              >
                <div
                  className="mb-5 inline-flex items-center gap-2"
                  style={{
                    padding: "5px 10px",
                    background: "#ffffff",
                    border: `1px solid ${LINE}`,
                    borderRadius: 4,
                    transform: "rotate(-1.2deg)",
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
                    PROCESSED · {bootTime}
                  </span>
                </div>

                <div
                  className="mb-2.5 flex items-center gap-1.5"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: LAV_DEEP,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                  }}
                >
                  <Sparkle size={9} /> ADDRESSED · TO
                </div>
                <div
                  className="mb-6"
                  style={{
                    padding: "12px 14px",
                    background: "#ffffff",
                    border: `1px solid ${LINE}`,
                    borderRadius: 6,
                    boxShadow: `2px 2px 0 ${PAPER_SHADOW}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 11.5,
                      color: ROSE,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      wordBreak: "break-all",
                      lineHeight: 1.5,
                    }}
                  >
                    {displayPath}
                  </div>
                  <div
                    className="mt-2.5 flex items-center gap-1.5"
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      color: INK_3,
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 999,
                        background: ROSE,
                        animation: "vm-pulse 1.8s ease-in-out infinite",
                      }}
                    />
                    NO ROUTE MATCHED
                  </div>
                </div>

                <div
                  className="mb-2.5 flex items-center gap-1.5"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: LAV_DEEP,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                  }}
                >
                  <Sparkle size={9} /> SUGGEST · REROUTE
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
                      top: 6,
                      bottom: 6,
                      width: 1,
                      background: `linear-gradient(180deg, ${LAV} 0%, ${LINE} 100%)`,
                    }}
                  />
                  {DESTINATIONS.map((d, i) => (
                    <li key={d.href} className="relative">
                      <span
                        aria-hidden
                        className="vm-link-dot absolute rounded-full"
                        style={{
                          left: -14,
                          top: 12,
                          width: i === 0 ? 7 : 5,
                          height: i === 0 ? 7 : 5,
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
                        href={d.href}
                        className="vm-link-row block py-2"
                        style={{ borderBottom: i < DESTINATIONS.length - 1 ? `1px dashed ${LINE}` : "none" }}
                      >
                        <div className="flex items-baseline gap-2">
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 9,
                              color: i === 0 ? LAV_DEEP : INK_3,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              width: 64,
                              flexShrink: 0,
                            }}
                          >
                            {d.category}
                          </span>
                          <span
                            className="vm-link-label"
                            style={{
                              fontFamily: SERIF,
                              fontSize: 13.5,
                              color: i === 0 ? INK : INK_2,
                              fontWeight: i === 0 ? 600 : 500,
                              letterSpacing: "-0.005em",
                              transition: "color 200ms ease",
                            }}
                          >
                            {d.label}
                          </span>
                          <span
                            aria-hidden
                            className="vm-link-arrow ml-auto"
                            style={{
                              color: INK_3,
                              opacity: 0.55,
                              transition: "transform 200ms ease, opacity 200ms ease",
                            }}
                          >
                            <svg
                              width="10"
                              height="10"
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
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: SERIF,
                            fontSize: 11.5,
                            color: INK_3,
                            fontStyle: "italic",
                            letterSpacing: "-0.005em",
                            lineHeight: 1.35,
                            marginTop: 3,
                            paddingLeft: 66,
                          }}
                        >
                          {d.subject}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div
                  className="my-5 flex items-center justify-center"
                  aria-hidden
                  style={{ height: 8 }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 999,
                        background: LINE,
                        margin: "0 3px",
                      }}
                    />
                  ))}
                </div>

                <div
                  className="mb-2.5 flex items-center gap-1.5"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: LAV_DEEP,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                  }}
                >
                  <Sparkle size={9} /> SEARCH · ARCHIVE
                </div>
                <Link
                  href="/mail"
                  className="flex items-center gap-2 transition-all hover:-translate-y-px"
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "#ffffff",
                    border: `1px solid ${INK}`,
                    boxShadow: `0 1px 0 rgba(26,22,18,0.10), 2px 2px 0 ${PAPER_SHADOW}`,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle
                      cx="6.5"
                      cy="6.5"
                      r="4.5"
                      stroke={INK}
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10 10l2.5 2.5"
                      stroke={INK}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 13,
                      color: INK_2,
                      flex: 1,
                    }}
                  >
                    search your inbox…
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      color: INK_3,
                      fontWeight: 700,
                      padding: "2px 6px",
                      border: `1px solid ${LINE}`,
                      borderRadius: 3,
                    }}
                  >
                    ⌘K
                  </span>
                </Link>
              </aside>

              <article className="relative px-7 py-10 md:px-14 md:py-14">
                <div
                  className="mb-3 flex items-center gap-2"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: ROSE,
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                  }}
                >
                  <span
                    aria-hidden
                    className="block"
                    style={{ width: 18, height: 1, background: ROSE }}
                  />
                  STATUS · BOUNCED · CODE 404
                </div>

                <div className="relative mb-5">
                  <h1
                    style={{
                      fontFamily: SERIF,
                      fontSize: "clamp(120px, 19vw, 220px)",
                      fontWeight: 500,
                      color: INK,
                      lineHeight: 0.86,
                      letterSpacing: "-0.06em",
                      margin: 0,
                    }}
                  >
                    <span style={{ fontStyle: "italic" }}>4</span>
                    <span
                      style={{
                        color: LAV,
                        fontStyle: "italic",
                        display: "inline-block",
                        animation: "vm-drift 4s ease-in-out infinite",
                      }}
                    >
                      0
                    </span>
                    <span style={{ fontStyle: "italic" }}>4</span>
                  </h1>
                  <span
                    aria-hidden
                    className="absolute hidden sm:block"
                    style={{
                      top: 8,
                      right: 0,
                      fontFamily: MONO,
                      fontSize: 10,
                      color: INK_3,
                      letterSpacing: "0.18em",
                      fontWeight: 700,
                    }}
                  >
                    HTTP / 1.1
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: SERIF,
                    fontSize: "clamp(34px, 5vw, 56px)",
                    fontWeight: 500,
                    color: INK,
                    lineHeight: 1.0,
                    letterSpacing: "-0.038em",
                    marginBottom: 18,
                  }}
                >
                  This letter was{" "}
                  <span
                    style={{
                      fontStyle: "italic",
                      fontWeight: 400,
                      color: ROSE,
                    }}
                  >
                    lost in transit.
                  </span>
                </h2>

                <div
                  className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1"
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13,
                    color: INK_2,
                    letterSpacing: "-0.005em",
                  }}
                >
                  <span style={{ fontStyle: "italic" }}>Filed by</span>
                  <span style={{ fontWeight: 600, color: INK }}>
                    VectorMail Routing
                  </span>
                  <span style={{ color: INK_3 }}>·</span>
                  <span>HTTP 404</span>
                  <span style={{ color: INK_3 }}>·</span>
                  <span
                    style={{ fontFamily: MONO, fontSize: 11, color: INK_3 }}
                  >
                    {bootTime}
                  </span>
                </div>

                <div aria-hidden className="my-5 flex items-center gap-3">
                  <span style={{ flex: 1, height: 1, background: LINE }} />
                  <Sparkle size={10} color={LINE} />
                  <span style={{ flex: 1, height: 1, background: LINE }} />
                </div>

                <div
                  className="relative mb-7"
                  style={{
                    padding: "18px 22px 18px 26px",
                    background: "#fffefb",
                    border: `1px solid ${LINE}`,
                    borderRadius: 6,
                    boxShadow: `4px 4px 0 ${PAPER_SHADOW}, 0 1px 2px rgba(26,22,18,0.04)`,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 12,
                      bottom: 12,
                      width: 3,
                      borderRadius: 2,
                      background: `linear-gradient(180deg, ${ROSE} 0%, ${LAV_DEEP} 100%)`,
                    }}
                  />
                  <div
                    className="mb-2 flex items-center gap-2"
                    style={{
                      fontFamily: MONO,
                      fontSize: 9.5,
                      color: LAV_DEEP,
                      letterSpacing: "0.16em",
                      fontWeight: 700,
                    }}
                  >
                    <Sparkle size={10} />
                    DIAGNOSTIC · TRACE
                    <span
                      className="ml-auto"
                      style={{
                        color: INK_3,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      ROUTE LOOKUP
                    </span>
                  </div>
                  <pre
                    className="m-0 overflow-x-auto whitespace-pre-wrap"
                    style={{
                      fontFamily: MONO,
                      fontSize: 11.5,
                      color: INK,
                      lineHeight: 1.85,
                      letterSpacing: "0.005em",
                      margin: 0,
                    }}
                  >
                    {[
                      { c: GREEN, t: "→ resolving route", v: displayPath },
                      {
                        c: INK_2,
                        t: "→ scanning the manifest",
                        v: "no exact match",
                      },
                      {
                        c: INK_2,
                        t: "→ checking redirects",
                        v: "none on file",
                      },
                      { c: ROSE, t: "✗ no route found", v: "code: 404" },
                    ].map((line, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-baseline gap-x-2"
                        style={{
                          animation: `vm-log-fade 320ms ${i * 100}ms both ease-out`,
                        }}
                      >
                        <span style={{ color: line.c, fontWeight: 600 }}>
                          {line.t}
                        </span>
                        <span style={{ color: INK_3 }}>· {line.v}</span>
                      </div>
                    ))}
                    <div
                      className="flex items-baseline gap-1.5"
                      style={{
                        animation: `vm-log-fade 320ms 540ms both ease-out`,
                      }}
                    >
                      <span style={{ color: LAV_DEEP, fontWeight: 700 }}>
                        $
                      </span>
                      <span style={{ color: INK_2 }}>awaiting reroute</span>
                      <span
                        aria-hidden
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 13,
                          marginLeft: 3,
                          marginBottom: -2,
                          background: LAV,
                          animation:
                            "vm-cursor-blink 1s steps(2, start) infinite",
                        }}
                      />
                    </div>
                  </pre>
                </div>

                <div
                  className="relative"
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
                    T
                  </span>
                  he address you reached doesn&apos;t correspond to any route in
                  our manifest. It may have been{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 65%, rgba(91,76,247,0.22) 65%)",
                      padding: "0 2px",
                      fontWeight: 500,
                    }}
                  >
                    moved
                  </span>
                  ,{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 65%, rgba(245,158,11,0.32) 65%)",
                      padding: "0 2px",
                      fontWeight: 500,
                    }}
                  >
                    archived
                  </span>
                  , or simply never delivered. Either way - the letter is
                  coming back to you, postmarked and unopened.
                </div>

                <blockquote
                  className="relative my-9"
                  style={{ paddingLeft: 36, borderLeft: `2px solid ${INK}` }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: -22,
                      top: -18,
                      fontFamily: SERIF,
                      fontSize: 72,
                      lineHeight: 1,
                      color: ROSE,
                      fontWeight: 600,
                    }}
                  >
                    “
                  </span>
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 22,
                      color: INK,
                      lineHeight: 1.36,
                      letterSpacing: "-0.018em",
                      fontWeight: 400,
                    }}
                  >
                    No mailbox by this name. No forwarding order on file.
                  </p>
                  <footer
                    className="mt-2"
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: INK_3,
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                    }}
                  >
                    - ROUTING TABLE · ENTRY 404
                  </footer>
                </blockquote>

                <div aria-hidden className="my-6 flex items-center gap-3">
                  <span style={{ flex: 1, height: 1, background: LINE }} />
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9.5,
                      color: INK_3,
                      letterSpacing: "0.2em",
                      fontWeight: 700,
                    }}
                  >
                    ✦ NEXT STEPS ✦
                  </span>
                  <span style={{ flex: 1, height: 1, background: LINE }} />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 transition-all hover:-translate-y-px"
                    style={{
                      padding: "11px 18px 11px 20px",
                      borderRadius: 8,
                      background:
                        "linear-gradient(180deg, #2a2520 0%, #1a1612 100%)",
                      color: "#ffffff",
                      fontFamily: SANS,
                      fontSize: 13.5,
                      fontWeight: 600,
                      letterSpacing: "-0.005em",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(26,22,18,0.32), 2px 2px 0 #c4b894",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 7l5-5 5 5M3 6v6h8V6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Return home
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

                  <Link
                    href="/features"
                    className="inline-flex items-center gap-2 transition-all hover:-translate-y-px"
                    style={{
                      padding: "11px 16px",
                      borderRadius: 8,
                      background: "#ffffff",
                      border: `1px solid ${INK}`,
                      color: INK,
                      fontFamily: SANS,
                      fontSize: 13.5,
                      fontWeight: 600,
                      letterSpacing: "-0.005em",
                      boxShadow: `0 1px 0 rgba(26,22,18,0.10), 2px 2px 0 ${PAPER_SHADOW}`,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <circle
                        cx="6.5"
                        cy="6.5"
                        r="4.5"
                        stroke={INK}
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 10l2.5 2.5"
                        stroke={INK}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Explore features
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      typeof window !== "undefined" && window.history.back()
                    }
                    className="inline-flex items-center gap-1.5 transition-all hover:-translate-y-px"
                    style={{
                      padding: "11px 14px",
                      borderRadius: 8,
                      background: "transparent",
                      border: `1px dashed ${INK_3}`,
                      color: INK_2,
                      fontFamily: SANS,
                      fontSize: 12.5,
                      fontWeight: 500,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M9 6h-6m3-3L3 6l3 3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Go back
                  </button>
                </div>
              </article>
            </div>

            <div
              className="relative flex items-center justify-between gap-3 px-6 md:px-10"
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
                SEMANTIC · TEXT · PGVECTOR
              </span>
              <span
                className="hidden items-center gap-1.5 sm:inline-flex"
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  color: GREEN,
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "block",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 0 2.5px rgba(34,197,94,0.18)",
                  }}
                />
                HOME IS STILL HOME
              </span>
            </div>
          </article>
        </div>

        <div
          className="mt-10 flex flex-wrap items-center justify-between gap-3"
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: INK_3,
            letterSpacing: "0.14em",
            fontWeight: 600,
          }}
        >
          <span>© VECTORMAIL</span>
          <span>HTTP 404 · NOT FOUND</span>
        </div>
      </div>
    </main>
  );
}
