"use client";

import React from "react";
import Image from "next/image";
function MockBrandMark() {
  return (
    <span
      aria-hidden
      className="relative inline-grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded-md"
    >
      <Image
        src="/VectorMail-New.png"
        alt=""
        width={20}
        height={20}
        className="object-contain"
        sizes="20px"
        unoptimized
      />
    </span>
  );
}
export function Enterprise() {
  return (
    <section
      className="px-5 py-20 md:px-8 md:py-28 xl:px-18 xl:py-32"
      style={{ background: "#f4ede0" }}
    >
      <div className="mx-auto flex max-w-[1296px] flex-col gap-12 md:gap-16 xl:gap-20">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center md:gap-4">
          <p
            className="uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              fontWeight: 600,
              fontFamily: "var(--vmx-mono)",
              color: "rgba(0,0,0,0.5)",
            }}
          >
            Production system
          </p>
          <h2
            style={{
              fontSize: "clamp(34px, 5vw, 64px)",
              fontWeight: 600,
              letterSpacing: "-0.038em",
              lineHeight: 1.04,
              color: "#0a0a0a",
              fontFamily: "var(--vmx-sans)",
            }}
          >
            One inbox brain for
            <br />
            every email you handle.
          </h2>
          <p
            className="max-w-[560px]"
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              color: "rgba(0,0,0,0.6)",
              fontFamily: "var(--vmx-sans)",
            }}
          >
            Semantic search, brief generation, and drafts in your voice - built
            for real volume and audited end to end.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 xl:grid-cols-[400px_1fr] xl:gap-14">
          <div className="flex flex-col gap-4 xl:max-w-[400px]">
            <WaveformIcon />
            <h3
              style={{
                fontSize: "clamp(22px, 2.4vw, 30px)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#0a0a0a",
                fontFamily: "var(--vmx-sans)",
              }}
            >
              Connect Gmail. Get a brief.
              <br />
              Send in seconds.
            </h3>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "rgba(0,0,0,0.6)",
                fontFamily: "var(--vmx-sans)",
                maxWidth: 380,
              }}
            >
              Sync your mailbox and the inbox brain returns a daily brief -
              what needs a reply, what matters, what can wait. No tagging, no
              rules, no setup.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl xl:rounded-[20px]">
            <BriefMockup />
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 xl:grid-cols-[1fr_400px] xl:gap-14">
          <div className="order-2 overflow-hidden rounded-2xl xl:order-1 xl:rounded-[20px]">
            <BuddyMockup />
          </div>
          <div className="order-1 flex flex-col gap-4 xl:order-2 xl:max-w-[400px]">
            <PenIcon />
            <h3
              style={{
                fontSize: "clamp(22px, 2.4vw, 30px)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#0a0a0a",
                fontFamily: "var(--vmx-sans)",
              }}
            >
              Drafts that actually
              <br />
              sound like you.
            </h3>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "rgba(0,0,0,0.6)",
                fontFamily: "var(--vmx-sans)",
                maxWidth: 380,
              }}
            >
              Buddy learns your tone from sent mail and writes replies you'd
              actually send. Every draft is grounded in thread context - no
              hallucinations, no generic templates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WaveformIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M3 16h2M7 11v10M11 8v16M15 13v6M19 8v16M23 11v10M27 16h2"
        stroke="#0a0a0a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M21 5l6 6L13 25l-7 1 1-7L21 5z"
        stroke="#0a0a0a"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M19 7l6 6" stroke="#0a0a0a" strokeWidth="1.7" />
    </svg>
  );
}

function BriefMockup() {
  return (
    <div
      className="relative w-full overflow-hidden p-3 md:p-4"
      style={{
        background:
          "linear-gradient(135deg, #1a1208 0%, #2a1a0d 50%, #3a2410 100%)",
        fontFamily: "var(--vmx-sans)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 200px at 50% 30%, rgba(200,120,60,0.18), transparent 70%)," +
            "radial-gradient(ellipse 80% 150px at 60% 75%, rgba(150,80,40,0.18), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col gap-3 rounded-xl bg-[#0e0a06]/85 p-5 text-white backdrop-blur-sm md:gap-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MockBrandMark />
            <div className="leading-tight">
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "var(--vmx-mono)",
                }}
              >
                ✦ Today&apos;s brief
              </div>
              <div className="text-[13px] font-semibold">Sunday, May 17</div>
            </div>
          </div>
          <div
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px]"
            style={{
              fontFamily: "var(--vmx-mono)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            22 threads
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "142", l: "msgs" },
            { v: "1.2K", l: "indexed" },
            { v: "98%", l: "live" },
            { v: "340ms", l: "p95" },
          ].map((k) => (
            <div
              key={k.l}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2"
            >
              <div
                className="font-semibold text-white"
                style={{
                  fontSize: 16,
                  fontFamily: "var(--vmx-sans)",
                  letterSpacing: "-0.02em",
                }}
              >
                {k.v}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "var(--vmx-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {k.l}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div
              className="flex items-center gap-1.5"
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--vmx-mono)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
              Needs reply
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--vmx-mono)",
              }}
            >
              02
            </span>
          </div>
          {[
            {
              s: "Re: Series A intro - Sentinel walkthrough",
              m: "daniel@compass.capital · 4 sentences",
              t: "High",
            },
            {
              s: "Quick ping - VectorMail demo Tuesday?",
              m: "elia@vibeflow.ai · 2 days ago",
              t: "High",
            },
          ].map((r) => (
            <div
              key={r.s}
              className="flex items-center gap-2 border-t border-white/[0.04] py-2 first:border-t-0 first:pt-0"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[12px] font-medium text-white"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {r.s}
                </div>
                <div
                  className="truncate text-[10.5px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {r.m}
                </div>
              </div>
              <span
                className="shrink-0 rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-white"
                style={{
                  fontSize: 9.5,
                  fontFamily: "var(--vmx-mono)",
                  letterSpacing: "0.05em",
                }}
              >
                {r.t}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div
              className="flex items-center gap-1.5"
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--vmx-mono)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e89a55]" />
              Important
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--vmx-mono)",
              }}
            >
              03
            </span>
          </div>
          {[
            {
              s: "Term sheet attached - sign by Friday",
              m: "founders@sequoia.com · marked important",
              d: "05.17",
            },
            {
              s: "Stripe payout · $42,180 settled",
              m: "stripe.com · finance",
              d: "05.16",
            },
          ].map((r) => (
            <div
              key={r.s}
              className="flex items-center gap-2 border-t border-white/[0.04] py-1.5 first:border-t-0 first:pt-0"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e89a55]" />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[12px] font-medium text-white"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {r.s}
                </div>
                <div
                  className="truncate text-[10.5px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {r.m}
                </div>
              </div>
              <span
                className="shrink-0"
                style={{
                  fontSize: 9.5,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "var(--vmx-mono)",
                }}
              >
                {r.d}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div
              className="flex items-center gap-1.5"
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--vmx-mono)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/30" />
              Can wait
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--vmx-mono)",
              }}
            >
              17
            </span>
          </div>
          {[
            {
              s: "View: Monthly statement ready for review",
              m: "alerts@bank.com",
              t: "notice",
            },
            {
              s: "Weekly digest - top stories from your network",
              m: "LinkedIn · digest",
              t: "digest",
            },
            {
              s: "₹0 joining fee + ₹1,000 welcome voucher",
              m: "Flipkart · promotions",
              t: "promo",
            },
          ].map((r) => (
            <div
              key={r.s}
              className="flex items-center gap-2 border-t border-white/[0.04] py-1.5 first:border-t-0 first:pt-0"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[12px] font-medium"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {r.s}
                </div>
                <div
                  className="truncate text-[10.5px]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {r.m}
                </div>
              </div>
              <span
                className="shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5"
                style={{
                  fontSize: 9.5,
                  fontFamily: "var(--vmx-mono)",
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.05em",
                }}
              >
                {r.t}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5">
          <div
            className="flex items-center gap-2"
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--vmx-mono)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#7fb069] shadow-[0_0_6px_#7fb069]" />
            gmail · synced 2m ago
            <span className="text-white/20">·</span>
            <span>247 threads</span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{
              fontSize: 10,
              fontFamily: "var(--vmx-mono)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span>94% embedded</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuddyMockup() {
  return (
    <div
      className="relative w-full overflow-hidden p-3 md:p-4"
      style={{
        background:
          "linear-gradient(135deg, #1a1208 0%, #2a1a0d 50%, #3a2410 100%)",
        fontFamily: "var(--vmx-sans)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 200px at 30% 30%, rgba(200,120,60,0.18), transparent 70%)," +
            "radial-gradient(ellipse 80% 150px at 70% 70%, rgba(150,80,40,0.18), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col gap-3 rounded-xl bg-[#0e0a06]/85 p-5 text-white backdrop-blur-sm md:gap-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MockBrandMark />
            <div
              className="font-semibold"
              style={{ fontSize: 13, letterSpacing: "-0.01em" }}
            >
              Buddy
            </div>
            <span
              className="rounded bg-white/10 px-1.5 py-0.5"
              style={{
                fontSize: 9,
                fontFamily: "var(--vmx-mono)",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.1em",
              }}
            >
              v2.4
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--vmx-mono)",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            ⌘⏎ Send
          </span>
        </div>

        <div className="self-end max-w-[80%] rounded-2xl rounded-br-md bg-white/[0.08] px-3.5 py-2">
          <p
            className="text-[12px] text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            reply to amanda: thanks, tuesday 11 works
          </p>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-[#16100a]">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <div
              className="flex items-center gap-1.5"
              style={{
                fontSize: 9.5,
                fontFamily: "var(--vmx-mono)",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              <span className="inline-block h-1 w-1 rounded-full bg-[#e89a55]" />
              Email draft
            </div>
            <button
              type="button"
              className="rounded border border-white/10 px-2 py-0.5 text-[10px] text-white/70"
              style={{ fontFamily: "var(--vmx-sans)" }}
            >
              Copy
            </button>
          </div>
          <div className="px-3.5 py-3">
            <p
              className="mb-2 font-medium text-white"
              style={{
                fontSize: 13,
                letterSpacing: "-0.015em",
                fontFamily: "var(--vmx-newsreader, var(--vmx-sans))",
              }}
            >
              Re: Series A intro - Sentinel walkthrough
            </p>
            <div className="my-2 h-px bg-white/[0.06]" />
            <div
              className="space-y-1.5"
              style={{
                fontSize: 11.5,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              <p>Daniel,</p>
              <p>
                Thanks for the warm intro. Tuesday at 11 AM PT works - I&apos;ll
                send a calendar invite with the dial-in shortly.
              </p>
              <p>Looking forward to walking the team through Sentinel.</p>
              <p style={{ color: "rgba(255,255,255,0.5)" }}>- Parbhat</p>
            </div>
          </div>
          <div className="border-t border-white/[0.06] px-3.5 py-2.5">
            <div
              className="mb-1.5"
              style={{
                fontSize: 9.5,
                fontFamily: "var(--vmx-mono)",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Alternatives
            </div>
            <div className="space-y-1">
              {[
                "Tuesday works - looking forward.",
                "Confirmed. Sending the dial-in next.",
              ].map((alt) => (
                <div
                  key={alt}
                  className="flex items-center gap-1.5 rounded bg-white/[0.03] px-2 py-1"
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}
                >
                  <span className="text-white/30">›</span>
                  <span className="truncate">{alt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--vmx-mono)",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Grounded in
          </span>
          {["thread:compass", "voice:sent-mail", "calendar:tue-11"].map((c) => (
            <span
              key={c}
              className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5"
              style={{
                fontSize: 9.5,
                fontFamily: "var(--vmx-mono)",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5">
          <div
            className="flex items-center gap-2"
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--vmx-mono)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#7fb069] shadow-[0_0_6px_#7fb069]" />
            ready in 0.42s
            <span className="text-white/20">·</span>
            <span>trained on 2.4k sent</span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{
              fontSize: 10,
              fontFamily: "var(--vmx-mono)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span>tone: warm-direct</span>
          </div>
        </div>
      </div>
    </div>
  );
}
