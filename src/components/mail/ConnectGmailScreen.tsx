"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Lock, Search, Shield, Sparkles, Zap } from "lucide-react";

const DRAFT_REPLY =
  "Hey Sam — Thursday at 3pm works on my end. I'll send a calendar invite shortly.";

function useTypewriter(text: string, speedMs = 22, startDelayMs = 1100) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length && interval) {
          clearInterval(interval);
          interval = null;
        }
      }, speedMs);
    }, startDelayMs);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, speedMs, startDelayMs]);
  return out;
}

function useCountUp(target: number, durationMs = 900, startDelayMs = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number | null = null;
    const start = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / durationMs, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, startDelayMs);
    return () => {
      clearTimeout(start);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [target, durationMs, startDelayMs]);
  return value;
}

export function ConnectGmailScreen() {
  const draft = useTypewriter(DRAFT_REPLY, 22, 1100);
  const m98 = useCountUp(98, 900, 850);
  const m94 = useCountUp(94, 900, 950);
  const m87 = useCountUp(87, 900, 1050);
  const briefReply = useCountUp(6, 700, 700);
  const briefWait = useCountUp(14, 800, 750);
  const draftDone = draft.length >= DRAFT_REPLY.length;

  return (
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-[#fafbfc] [-webkit-overflow-scrolling:touch]">
      <div className="relative flex min-h-full flex-col">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(15,20,40,0.09) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
              maskImage:
                "radial-gradient(ellipse 80% 70% at 50% 50%, black 25%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 70% at 50% 50%, black 25%, transparent 80%)",
              opacity: 0.55,
            }}
          />
        </div>

      <header className="vm-onb-rise vm-onb-delay-1 relative z-20 flex shrink-0 items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
        <Link
          href="/"
          prefetch
          className="group flex items-center gap-2.5 no-underline"
        >
          <span className="relative h-7 w-7">
            <span
              aria-hidden
              className="vm-onb-ring-rotate absolute inset-[-3px] rounded-[10px]"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(30,42,74,0.0), rgba(45,61,107,0.65), rgba(30,42,74,0.0) 65%)",
                filter: "blur(1px)",
              }}
            />
            <span
              className="absolute inset-0 block overflow-hidden rounded-[7px]"
              style={{
                background: "#1e2a4a",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.25) inset, 0 2px 6px rgba(30,42,74,0.28)",
              }}
            >
              <video
                src="/Vectormail-logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full scale-[1.6] object-cover"
              />
            </span>
          </span>
          <span
            className="text-[15px] font-semibold tracking-tight text-[#0e1729]"
            style={{ letterSpacing: "-0.015em" }}
          >
            VectorMail
          </span>
        </Link>
        <div
          className="flex items-center gap-2 rounded-full border border-[#e4e7ed] bg-white/70 px-3 py-1.5 backdrop-blur-sm"
          style={{
            fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#15803d] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#15803d]" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4a5572]">
            <span className="sm:hidden">2 / 2</span>
            <span className="hidden sm:inline">Step 2 of 2 · Connect</span>
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col items-stretch justify-center gap-y-2 px-5 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-10 lg:flex-row lg:items-center lg:gap-x-20 lg:gap-y-0 lg:py-12">
        <div className="flex flex-1 flex-col justify-center">
          <div
            className="vm-onb-rise vm-onb-delay-2 mb-5 inline-flex items-center gap-2.5 self-start"
            style={{
              fontFamily:
                "var(--font-jetbrains-mono), ui-monospace, monospace",
            }}
          >
            <span
              className="h-px w-8"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #2d3d6b 40%, #1e2a4a)",
              }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1e2a4a]">
              <span style={{ color: "#1e2a4a" }}>✦</span> One last step
            </span>
          </div>

          <h1
            className="vm-onb-rise vm-onb-delay-3 max-w-xl text-[clamp(32px,6vw,56px)] font-normal leading-[1.05] tracking-[-0.03em] text-[#0e1729]"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
          >
            Connect your{" "}
            <span className="relative inline-block">
              <span
                className="italic"
                style={{ color: "#1e2a4a", fontWeight: 500 }}
              >
                inbox
              </span>
              <span
                aria-hidden
                className="vm-onb-underline-draw absolute -bottom-[2px] left-0 right-[3px] block h-[3px] rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #0d1530 0%, #2d3d6b 100%)",
                }}
              />
            </span>
            <span style={{ color: "#1e2a4a" }}>.</span>
          </h1>

          <p className="vm-onb-rise vm-onb-delay-4 mt-5 max-w-[480px] text-[15px] leading-[1.55] text-[#4a5572]">
            You&apos;re signed in. Hook up Gmail to unlock semantic search,
            AI-drafted replies in your voice, and an autopilot that triages
            while you sleep.
          </p>

          <div className="vm-onb-rise vm-onb-delay-5 mt-9 flex flex-col items-start gap-3.5">
            <a
              href="/api/connect/google"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-[11px] px-7 py-[15px] text-[14px] font-semibold transition-all hover:-translate-y-[1px] active:translate-y-0"
              style={{
                background:
                  "linear-gradient(180deg, #2d3d6b 0%, #1e2a4a 100%)",
                color: "#ffffff",
                letterSpacing: "-0.005em",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.22), 0 1px 2px rgba(15,20,40,0.18), 0 8px 24px rgba(30,42,74,0.32), 0 0 0 1px rgba(45,61,107,0.55)",
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-3 top-px h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                }}
              />
              <span
                aria-hidden
                className="vm-onb-cta-shimmer pointer-events-none absolute inset-y-0 left-0 w-[35%]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                }}
              />
              <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white">
                <svg width="13" height="13" viewBox="0 0 48 48" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
                  />
                </svg>
              </span>
              <span className="relative">Continue with Gmail</span>
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="relative transition-transform duration-200 group-hover:translate-x-1"
              >
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[#7a849a] sm:gap-x-4"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono), ui-monospace, monospace",
                letterSpacing: "0.03em",
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3" strokeWidth={2.2} />
                Aurinko OAuth
              </span>
              <span aria-hidden className="hidden text-[#d0d5de] sm:inline">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3 w-3" strokeWidth={2.2} />
                Password never seen
              </span>
              <span aria-hidden className="hidden text-[#d0d5de] sm:inline">
                ·
              </span>
              <span>Revoke anytime</span>
            </div>
          </div>

          <div
            className="vm-onb-rise vm-onb-delay-6 mt-7 flex max-w-full flex-wrap items-center gap-x-3 gap-y-1.5 self-start rounded-[14px] border border-[#e4e7ed] bg-white/65 px-3.5 py-2 backdrop-blur-sm sm:max-w-fit sm:flex-nowrap sm:rounded-full sm:py-1.5"
            style={{
              fontFamily:
                "var(--font-jetbrains-mono), ui-monospace, monospace",
            }}
          >
            {[
              { color: "#15803d", label: "Inbox brain online" },
              { color: "#15803d", label: "pgvector ready" },
              { color: "#7a849a", label: "Awaiting Gmail" },
            ].map((s, i) => (
              <span
                key={s.label}
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a5572]"
              >
                <span
                  className="vm-onb-status-pulse h-1.5 w-1.5 rounded-full"
                  style={{
                    background: s.color,
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
                {s.label}
              </span>
            ))}
          </div>

          <div className="vm-onb-rise vm-onb-delay-7 mt-7 grid max-w-[520px] grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Semantic search",
                body: "Find by meaning, not just keywords.",
              },
              {
                icon: Bot,
                title: "Replies in your voice",
                body: "Drafts that sound the way you write.",
              },
              {
                icon: Zap,
                title: "Autopilot triage",
                body: "Follows up while you sleep.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative rounded-[10px] border border-[#e4e7ed] bg-white/70 p-3.5 backdrop-blur-[6px] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#1e2a4a]/30 hover:bg-white hover:shadow-[0_8px_22px_rgba(15,20,40,0.08)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(45,61,107,0.55), transparent)",
                  }}
                />
                <div
                  className="mb-2.5 flex h-7 w-7 items-center justify-center rounded-[7px] transition-transform group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(180deg, #2d3d6b 0%, #1e2a4a 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(30,42,74,0.22)",
                  }}
                >
                  <f.icon
                    className="h-3.5 w-3.5 text-white"
                    strokeWidth={1.9}
                  />
                </div>
                <div className="text-[12.5px] font-semibold tracking-tight text-[#0e1729]">
                  {f.title}
                </div>
                <div className="mt-1 text-[11.5px] leading-[1.45] text-[#7a849a]">
                  {f.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="vm-onb-rise-scale vm-onb-delay-6 mt-12 hidden lg:mt-0 lg:flex lg:w-[440px] lg:shrink-0 lg:items-center lg:justify-center">
          <div className="relative h-[560px] w-full">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                aria-hidden
                className="vm-onb-scan absolute -inset-y-12 left-0 w-[55%]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(30,42,74,0.12), transparent)",
                  filter: "blur(2px)",
                }}
              />
            </div>

            <div
              className="vm-onb-float-a absolute right-0 top-4 w-[330px] rounded-[14px] border border-[#e4e7ed] bg-white p-4"
              style={{
                boxShadow:
                  "0 1px 2px rgba(15,20,40,0.04), 0 10px 28px rgba(15,20,40,0.07)",
              }}
            >
              <div
                className="flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#1e2a4a]"
                style={{
                  fontFamily:
                    "var(--font-jetbrains-mono), ui-monospace, monospace",
                }}
              >
                <span className="h-1 w-1 rounded-full bg-[#1e2a4a]" />
                Today&apos;s brief
              </div>
              <div
                className="mt-2 text-[14px] leading-[1.25] text-[#0e1729]"
                style={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                }}
              >
                <span
                  className="italic tabular-nums"
                  style={{ color: "#1e2a4a" }}
                >
                  {briefReply}
                </span>{" "}
                threads need a reply.{" "}
                <span
                  className="italic tabular-nums"
                  style={{ color: "#1e2a4a" }}
                >
                  {briefWait}
                </span>{" "}
                can wait.
              </div>
              <div className="mt-3 h-px w-full bg-[#eef0f4]" />
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b91c4b]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#eef0f4]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1e40af]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#eef0f4]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#64748b]" />
                  <div className="h-1.5 w-2/3 rounded-full bg-[#eef0f4]" />
                </div>
              </div>
            </div>

            <div
              className="vm-onb-float-b absolute left-4 top-[150px] w-[345px] rounded-[14px] border border-[#e4e7ed] bg-white p-4"
              style={{
                boxShadow:
                  "0 2px 4px rgba(15,20,40,0.05), 0 16px 36px rgba(15,20,40,0.10)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-[7px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #2d3d6b 0%, #1e2a4a 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.16), 0 2px 4px rgba(30,42,74,0.22)",
                  }}
                >
                  <Bot
                    className="h-3.5 w-3.5 text-white"
                    strokeWidth={2}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#7a849a]"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains-mono), ui-monospace, monospace",
                    }}
                  >
                    Inbox brain
                  </div>
                  <div className="text-[11.5px] text-[#4a5572]">
                    {draftDone ? "ready to send" : "drafting in your voice…"}
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-[#15803d]/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#15803d]"
                  style={{
                    fontFamily:
                      "var(--font-jetbrains-mono), ui-monospace, monospace",
                  }}
                >
                  <span className="vm-onb-status-pulse h-1 w-1 rounded-full bg-[#15803d]" />
                  LIVE
                </span>
              </div>
              <div
                className="mt-3 min-h-[64px] rounded-[9px] border border-[#eef0f4] bg-[#fafbfc] p-3 text-[12px] leading-[1.5] text-[#0e1729]"
                style={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                }}
              >
                {draft}
                <span
                  className="vm-onb-caret-blink ml-px inline-block h-3 w-[2px] translate-y-[2px] bg-[#1e2a4a]"
                  aria-hidden
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span
                  className="rounded-md bg-[#1e2a4a]/[0.08] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#1e2a4a]"
                  style={{
                    fontFamily:
                      "var(--font-jetbrains-mono), ui-monospace, monospace",
                    letterSpacing: "0.04em",
                  }}
                >
                  YOUR VOICE
                </span>
                <span
                  className="rounded-md bg-[#1e40af]/[0.10] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#1e40af]"
                  style={{
                    fontFamily:
                      "var(--font-jetbrains-mono), ui-monospace, monospace",
                    letterSpacing: "0.04em",
                  }}
                >
                  CONFIRMED TIME
                </span>
              </div>
            </div>

            <div
              className="vm-onb-float-c absolute bottom-0 left-0 w-[355px] rounded-[14px] border border-[#e4e7ed] bg-white p-4"
              style={{
                boxShadow:
                  "0 2px 4px rgba(15,20,40,0.05), 0 18px 44px rgba(15,20,40,0.13), 0 0 0 1px rgba(30,42,74,0.16)",
              }}
            >
              <div className="flex items-center gap-2 rounded-[8px] border border-[#eef0f4] bg-[#fafbfc] px-2.5 py-2">
                <Search
                  className="h-3.5 w-3.5 shrink-0 text-[#1e2a4a]"
                  strokeWidth={2.2}
                />
                <div
                  className="text-[12px] text-[#0e1729]"
                  style={{
                    fontFamily: "var(--font-newsreader), Georgia, serif",
                  }}
                >
                  pricing discussions with Stripe last quarter
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  {
                    from: "Patrick C.",
                    subject: "Re: enterprise pricing",
                    match: m98,
                  },
                  {
                    from: "Aisha K.",
                    subject: "Stripe — proposal v3",
                    match: m94,
                  },
                  {
                    from: "Greg B.",
                    subject: "Q3 contract terms",
                    match: m87,
                  },
                ].map((r) => (
                  <div key={r.subject} className="flex items-center gap-2.5">
                    <div
                      className="w-9 shrink-0 text-right text-[10.5px] font-semibold tabular-nums text-[#1e2a4a]"
                      style={{
                        fontFamily:
                          "var(--font-jetbrains-mono), ui-monospace, monospace",
                      }}
                    >
                      {r.match}%
                    </div>
                    <div className="min-w-0 flex-1 truncate text-[11.5px] text-[#0e1729]">
                      <span className="font-semibold">{r.from}</span>
                      <span className="text-[#a8b0c0]"> · </span>
                      <span className="text-[#4a5572]">{r.subject}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-3 flex items-center justify-between border-t border-[#eef0f4] pt-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#7a849a]"
                style={{
                  fontFamily:
                    "var(--font-jetbrains-mono), ui-monospace, monospace",
                }}
              >
                <span>
                  <span style={{ color: "#1e2a4a" }}>✦</span> Pgvector match
                </span>
                <span>0.04s</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="vm-onb-rise vm-onb-delay-9 relative z-10 mt-auto flex shrink-0 flex-col items-center gap-y-1.5 border-t border-[#e4e7ed]/60 bg-white/40 px-5 py-3 text-center backdrop-blur-sm sm:flex-row sm:flex-wrap sm:justify-between sm:px-8 sm:py-4 sm:text-left"
        style={{
          fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        }}
      >
        <span className="text-[9.5px] uppercase tracking-[0.16em] text-[#7a849a] sm:text-[10px]">
          <span className="sm:hidden">VectorMail v1.0</span>
          <span className="hidden sm:inline">
            VectorMail v1.0 · Built on Aurinko · pgvector · OpenRouter
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.16em] text-[#7a849a] sm:text-[10px]">
          <Shield className="h-3 w-3" strokeWidth={2.2} />
          <span className="sm:hidden">Read-only · Encrypted</span>
          <span className="hidden sm:inline">
            Read access only · Encrypted in transit
          </span>
        </span>
      </footer>
      </div>
    </div>
  );
}

export default ConnectGmailScreen;
