"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const TABS = ["Founders", "Sales", "Engineering", "Customer Support", "Investors"];

interface UseCard {
  h: string;
  p: string;
  tag: string;
}

const TAB_CONTENT: Record<number, UseCard[]> = {
  0: [
    {
      h: "Investor Follow-up\nTracker",
      p: "Find investor threads instantly, surface pending asks, and keep fundraising follow-ups on schedule.",
      tag: "→ INVESTORS",
    },
    {
      h: "Founder\nMorning Brief",
      p: "Start the day with a concise inbox brief: what changed, what is blocked, and what needs a reply.",
      tag: "→ DAILY",
    },
    {
      h: "Founder Voice\nDrafts",
      p: "Generate clear outbound and follow-up drafts from real thread context, then ship faster.",
      tag: "→ OUTREACH",
    },
  ],
  1: [
    {
      h: "Deal Thread\nPrioritization",
      p: "Use semantic search to pull active deal threads and focus on opportunities that need action now.",
      tag: "→ PIPELINE",
    },
    {
      h: "Sales Reply\nAssistant",
      p: "Draft replies for objections, pricing questions, and follow-ups in your team's preferred tone.",
      tag: "→ REPLIES",
    },
    {
      h: "Follow-up\nQueue",
      p: "Track who has not replied, surface stale threads, and keep momentum across every stage.",
      tag: "→ DEALS",
    },
  ],
  2: [
    {
      h: "Build + Incident\nEmail Triage",
      p: "Group noisy infra and build emails into one brief so engineers see blockers without inbox overload.",
      tag: "→ TRIAGE",
    },
    {
      h: "Context Recall\nfor Alerts",
      p: "Find prior incident threads by meaning, so on-call context is available in seconds.",
      tag: "→ ON-CALL",
    },
    {
      h: "Spec + Action\nExtraction",
      p: "Turn long email discussions into structured actions, owners, and execution-ready summaries.",
      tag: "→ DOCS",
    },
  ],
  3: [
    {
      h: "Recurring Issue\nDetection",
      p: "Use semantic search to spot repeated customer problems and route patterns to the right team.",
      tag: "→ SUPPORT",
    },
    {
      h: "Empathy-safe\nReply Drafts",
      p: "Draft empathetic responses with full thread context to reduce handle time without losing quality.",
      tag: "→ REPLIES",
    },
    {
      h: "Escalation\nEarly Warning",
      p: "Surface high-risk conversations early and escalate with clear context before tickets go critical.",
      tag: "→ RETENTION",
    },
  ],
  4: [
    {
      h: "Portfolio Inbox\nBrief",
      p: "Get a daily summary of key founder updates from your email threads, without manual scanning.",
      tag: "→ PORTFOLIO",
    },
    {
      h: "Founder Response\nDrafts",
      p: "Draft high-signal founder responses quickly, grounded in thread history and your communication style.",
      tag: "→ FOUNDERS",
    },
    {
      h: "Decision Thread\nSummaries",
      p: "Condense long investment conversations into short decision summaries for faster partner review.",
      tag: "→ MEMOS",
    },
  ],
};

export function UseCases() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(0);
  const cards = TAB_CONTENT[active] ?? TAB_CONTENT[0]!;

  useEffect(() => {
    const key = (searchParams.get("usecase") || "").toLowerCase();
    const idxMap: Record<string, number> = {
      founders: 0,
      sales: 1,
      engineering: 2,
      support: 3,
      investors: 4,
    };
    const idx = idxMap[key];
    if (idx !== undefined) setActive(idx);
  }, [searchParams]);

  return (
    <section
      id="use-cases"
      className="vmx-halftone-usecases relative px-5 py-[120px] text-center md:px-8"
    >
      <div className="relative mx-auto">
        <div
          className="mx-auto mb-6 grid place-items-center rounded-[14px]"
          style={{
            width: 56,
            height: 56,
            background: "var(--vmx-ink, #0a0a0a)",
          }}
          aria-hidden
        >
          <span
            className="block"
            style={{
              width: 28,
              height: 28,
              backgroundImage:
                "radial-gradient(circle, var(--vmx-lav-bright, #9d7af3) 1.5px, transparent 1.8px)",
              backgroundSize: "6px 6px",
            }}
          />
        </div>

        <h2
          className="mb-4"
          style={{
            fontSize: "clamp(36px, 4.5vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "var(--vmx-ink, #0a0a0a)",
            fontFamily: "var(--vmx-sans)",
          }}
        >
          An email client
          <br />
          <span
            style={{
              fontFamily: "var(--vmx-serif)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            that adapts to your role
          </span>
        </h2>
        <p
          className="mx-auto mb-12 max-w-[460px]"
          style={{
            fontSize: 16,
            color: "var(--vmx-ink-2, #4a4a4a)",
          }}
        >
          VectorMail learns what matters to you, specifically.
        </p>

        <div
          className="mx-auto mb-12 flex max-w-[1100px] flex-wrap justify-center"
          style={{
            borderBottom: "1px solid var(--vmx-line-cream, #ddd1b6)",
          }}
        >
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActive(i)}
              className="-mb-px flex-1 px-6 py-4 text-[15px] transition-all"
              style={{
                fontFamily: "var(--vmx-sans)",
                color:
                  active === i
                    ? "var(--vmx-ink, #0a0a0a)"
                    : "var(--vmx-ink-3, #767676)",
                fontWeight: active === i ? 600 : 500,
                borderBottom:
                  active === i
                    ? "2px solid var(--vmx-ink, #0a0a0a)"
                    : "2px solid transparent",
                background: "transparent",
                minWidth: 120,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.h}
              className="flex min-h-[240px] flex-col p-7 text-left transition-all"
              style={{
                background: "var(--vmx-paper, #ffffff)",
                border: "1px solid var(--vmx-line-cream, #ddd1b6)",
                borderRadius: "var(--vmx-r, 14px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--vmx-ink, #0a0a0a)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 24px rgba(0,0,0,0.08)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--vmx-line-cream, #ddd1b6)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              <h3
                className="mb-3 whitespace-pre-line"
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--vmx-ink, #0a0a0a)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  fontFamily: "var(--vmx-sans)",
                }}
              >
                {c.h}
              </h3>
              <p
                className="flex-1"
                style={{
                  fontSize: 14,
                  color: "var(--vmx-ink-3, #767676)",
                  lineHeight: 1.5,
                }}
              >
                {c.p}
              </p>
              <span
                className="mt-4 inline-block w-fit rounded-md px-2.5 py-1"
                style={{
                  background: "var(--vmx-cream, #f4ecdb)",
                  fontSize: 11.5,
                  fontFamily: "var(--vmx-mono)",
                  color: "var(--vmx-ink-2, #4a4a4a)",
                  fontWeight: 600,
                  border: "1px solid var(--vmx-line-cream, #ddd1b6)",
                }}
              >
                {c.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
