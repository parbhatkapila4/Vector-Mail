"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ARROW_PATH = "M3 6h6M6 3l3 3-3 3";

const TYPED_PHRASES = [
  "read itself",
  "write itself",
  "prioritize itself",
  "reply for you",
  "keep its promises",
];

function TypedPhrase({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState(phrases[0] ?? "");
  const [showCaret, setShowCaret] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let phraseIdx = 0;
    let charIdx = phrases[0]?.length ?? 0;
    let deleting = false;

    const tick = () => {
      if (cancelled) return;
      const current = phrases[phraseIdx] ?? "";
      let nextDelay = 70;

      if (!deleting) {
        charIdx += 1;
        setText(current.slice(0, charIdx));
        if (charIdx >= current.length) {
          deleting = true;
          nextDelay = 1600;
        }
      } else {
        charIdx -= 1;
        setText(current.slice(0, Math.max(charIdx, 0)));
        nextDelay = 35;
        if (charIdx <= 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          nextDelay = 320;
        }
      }
      timerRef.current = setTimeout(tick, nextDelay);
    };

    timerRef.current = setTimeout(() => {
      deleting = true;
      tick();
    }, 1800);

    const blink = setInterval(() => setShowCaret((c) => !c), 520);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(blink);
    };
  }, [phrases]);

  return (
    <span
      style={{
        fontFamily: "var(--vmx-serif)",
        fontStyle: "italic",
        fontWeight: 400,
        letterSpacing: "-0.02em",
        color: "var(--vmx-ink, #0a0a0a)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: "0.06em",
          height: "0.85em",
          marginLeft: "0.05em",
          marginBottom: "-0.06em",
          verticalAlign: "baseline",
          background: "var(--vmx-lav-bright, #9d7af3)",
          opacity: showCaret ? 1 : 0,
          transition: "opacity 80ms linear",
          borderRadius: 1,
        }}
      />
    </span>
  );
}

function ArrowPill() {
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-[5px]"
      style={{
        width: 22,
        height: 22,
        background: "var(--vmx-lav-bright, #9d7af3)",
        color: "var(--vmx-ink, #0a0a0a)",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M3 6h6M6 3l3 3-3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function PrimaryCta({
  label,
  onClick,
  href,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const cls =
    "inline-flex items-center gap-2 rounded-[8px] py-[10px] pl-[18px] pr-[14px] text-[14px] font-semibold text-white transition-all duration-150 hover:-translate-y-px";
  const style: React.CSSProperties = {
    background: "var(--vmx-ink, #0a0a0a)",
    boxShadow:
      "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 6px rgba(0,0,0,0.15)",
    letterSpacing: "-0.005em",
    fontFamily: "var(--vmx-sans)",
  };
  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {label}
        <ArrowPill />
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {label}
      <ArrowPill />
    </button>
  );
}

type EmailTone = "now" | "soon" | "later" | "done";

interface EmailItem {
  id: string;
  initials: string;
  avatarBg: string;
  sender: string;
  domain: string;
  time: string;
  subject: string;
  preview: string;
  tone: EmailTone;
  toneLabel: string;
  unread?: boolean;
}

const PILLS: Record<EmailTone, { bg: string; color: string; dot: string }> = {
  now: { bg: "#fde7ec", color: "#b91c5c", dot: "#b91c5c" },
  soon: { bg: "#fdf2cc", color: "#b45309", dot: "#b45309" },
  later: { bg: "#eef0f4", color: "#4a4943", dot: "#777269" },
  done: { bg: "#ecf5d5", color: "#4d7c0f", dot: "#4d7c0f" },
};

const EMAILS: EmailItem[] = [
  {
    id: "sequoia",
    initials: "RB",
    avatarBg: "linear-gradient(135deg, #f97316, #ea580c)",
    sender: "Roelof Botha",
    domain: "sequoiacap.com",
    time: "8:42 AM",
    subject: "Re: Series A - let's get this done",
    preview:
      "We're in. Term sheet attached. Tuesday 11 AM PT works for the call - confirm and we'll send the diligence list.",
    tone: "now",
    toneLabel: "Reply now",
    unread: true,
  },
  {
    id: "alice",
    initials: "AC",
    avatarBg: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    sender: "Alice Chen",
    domain: "figma.com",
    time: "8:21 AM",
    subject: "Design v3 - ready for your call",
    preview:
      "Pushed the navigation refactor to staging. Two open questions on the empty states - happy to merge or hold for review.",
    tone: "soon",
    toneLabel: "Today",
  },
  {
    id: "william",
    initials: "WT",
    avatarBg: "linear-gradient(135deg, #14b8a6, #0d9488)",
    sender: "William Tan",
    domain: "stripe.com",
    time: "Yesterday",
    subject: "Push Q4 sync → Thursday 2 PM",
    preview:
      "Thursday works better on my side, sorry for the back-and-forth. Calendar invite incoming - VectorMail confirmed.",
    tone: "done",
    toneLabel: "Done",
  },
  {
    id: "linear",
    initials: "L",
    avatarBg: "linear-gradient(135deg, #1f1bea, #4f46e5)",
    sender: "Linear",
    domain: "linear.app",
    time: "Mon",
    subject: "Weekly review - 14 issues completed",
    preview:
      "VEC-284 shipped. Memory recall benchmarks are up 2.4%. Three issues moved to next sprint.",
    tone: "later",
    toneLabel: "Later",
  },
];

export function HeroLight() {
  const [activeId, setActiveId] = useState<string>(EMAILS[0]?.id ?? "");

  const activeEmail =
    EMAILS.find((e) => e.id === activeId) ?? (EMAILS[0] as EmailItem);

  const onPrimaryCta = () => {
    window.location.href = "/api/demo/enter";
  };

  return (
    <section className="vmx-halftone relative">
      <div className="relative px-5 pb-[100px] pt-20 text-center md:px-8">
        <div className="relative mx-auto max-w-[1180px]">
          <div
            className="mb-14 inline-flex items-center gap-2 rounded-full px-[14px] py-[6px] pl-[12px] text-[13px] font-medium"
            style={{
              background: "var(--vmx-paper, #ffffff)",
              color: "var(--vmx-ink-1, #1f1f1f)",
              border: "1px solid var(--vmx-line, #e5e0ee)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{ width: 8, height: 8, background: "#22c55e" }}
            />
            Built for teams that run on email
            <span
              className="rounded-[4px] px-[6px] py-[1px]"
              style={{
                background: "#ecebff",
                color: "#2d2a9e",
                fontFamily: "var(--vmx-mono)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              FAST
            </span>
          </div>

          <h1
            className="mb-7"
            style={{
              fontSize: "clamp(48px, 7.4vw, 96px)",
              lineHeight: 1,
              letterSpacing: "-0.045em",
              fontWeight: 600,
              color: "var(--vmx-ink, #0a0a0a)",
              fontFamily: "var(--vmx-sans)",
            }}
          >
            Your inbox can finally
            <br />
            <TypedPhrase phrases={TYPED_PHRASES} />
          </h1>

          <p
            className="mx-auto mb-10 max-w-[580px]"
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: "var(--vmx-ink-2, #4a4a4a)",
              fontWeight: 400,
              letterSpacing: "-0.005em",
            }}
          >
            A drop-in intelligence layer for the email you already use. Reads
            the thread, surfaces what matters, drafts in your voice. Built for
            production.
          </p>

          <div className="mb-[72px] inline-flex items-center gap-3">
            <PrimaryCta
              label="See your inbox gonna look..."
              onClick={onPrimaryCta}
            />
          </div>

          <div
            className="relative mx-auto max-w-[1080px] overflow-hidden text-left"
            style={{
              background: "#ffffff",
              border: "1px solid #e8e4db",
              borderRadius: 14,
              boxShadow:
                "0 0 0 1px rgba(26,26,23,0.04), 0 4px 8px -2px rgba(26,26,23,0.04), 0 24px 48px -12px rgba(26,26,23,0.10), 0 48px 96px -24px rgba(26,26,23,0.08)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-[10px]"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #faf9f5 100%)",
                borderBottom: "1px solid #e8e4db",
              }}
            >
              <div className="flex items-center gap-2">
                <span aria-hidden className="flex gap-1">
                  <span
                    className="block rounded-full"
                    style={{ width: 9, height: 9, background: "#fda4af" }}
                  />
                  <span
                    className="block rounded-full"
                    style={{ width: 9, height: 9, background: "#fcd34d" }}
                  />
                  <span
                    className="block rounded-full"
                    style={{ width: 9, height: 9, background: "#86efac" }}
                  />
                </span>
                <span
                  className="ml-3 inline-flex items-center gap-2"
                  style={{
                    color: "#1a1a17",
                    fontFamily: "var(--font-newsreader), Georgia, serif",
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                  }}
                >
                  <span
                    aria-hidden
                    className="block"
                    style={{
                      width: 2,
                      height: 14,
                      background: "#1f1bea",
                      borderRadius: 1,
                    }}
                  />
                  VectorMail
                </span>
              </div>

              <div
                className="hidden items-center gap-2 rounded-[8px] px-3 py-[7px] sm:flex"
                style={{
                  background: "#f7f5f0",
                  border: "1px solid #e8e4db",
                  width: 360,
                  maxWidth: "44%",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ color: "#a39e93" }}
                >
                  <circle
                    cx="6"
                    cy="6"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M9 9l3 3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: 13,
                    color: "#777269",
                    flex: 1,
                  }}
                >
                  Search threads, contacts, dates…
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10.5px]"
                  style={{
                    background: "#efece5",
                    color: "#4a4943",
                    fontFamily:
                      "var(--font-jetbrains-mono), ui-monospace, monospace",
                    fontWeight: 500,
                  }}
                >
                  ⌘K
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] sm:inline-flex"
                  style={{
                    background:
                      "linear-gradient(180deg, #f3fbe7 0%, #e9f6d2 100%)",
                    color: "#3f6212",
                    border: "1px solid #d6e9b6",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.75), 0 1px 2px rgba(24,39,75,0.08)",
                    fontFamily:
                      "var(--font-jetbrains-mono), ui-monospace, monospace",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  <span
                    aria-hidden
                    className="block rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: "#4d7c0f",
                      boxShadow: "0 0 0 3px rgba(77,124,15,0.14)",
                    }}
                  />
                  SYNCED
                </span>
                <span
                  aria-hidden
                  className="relative grid place-items-center rounded-full text-[11px] font-semibold text-white"
                  style={{
                    width: 30,
                    height: 30,
                    border: "1px solid rgba(31,27,234,0.18)",
                    background:
                      "radial-gradient(circle at 30% 25%, #6f63ff 0%, #4f46e5 45%, #312e81 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.35), 0 5px 12px rgba(49,46,129,0.25)",
                  }}
                >
                  P
                  <span
                    className="absolute -bottom-0.5 -right-0.5 block rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      background: "#22c55e",
                      border: "1.5px solid #fff",
                    }}
                  />
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[42%_58%]">
              <div
                className="hl-scroll relative max-h-[560px] overflow-y-auto"
                style={{
                  background: "#fbfaf7",
                  borderRight: "1px solid #e8e4db",
                }}
              >
                <div
                  className="sticky top-0 z-[2] flex items-center justify-between px-4 py-[10px]"
                  style={{
                    background: "#fbfaf7",
                    borderBottom: "1px solid #f1ede4",
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1a1a17",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Inbox
                    </span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: "#ecebff",
                        color: "#1f1bea",
                        fontFamily:
                          "var(--font-jetbrains-mono), ui-monospace, monospace",
                        fontWeight: 600,
                      }}
                    >
                      3 NEW
                    </span>
                  </div>
                  <span
                    className="uppercase"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains-mono), ui-monospace, monospace",
                      fontSize: 10,
                      color: "#a39e93",
                      letterSpacing: "0.1em",
                      fontWeight: 500,
                    }}
                  >
                    Today · 4 threads
                  </span>
                </div>

                <ul className="flex flex-col">
                  {EMAILS.map((e) => {
                    const active = e.id === activeId;
                    const pill = PILLS[e.tone];
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(e.id)}
                          className="relative block w-full px-4 py-[14px] text-left transition-colors duration-150"
                          style={{
                            background: active ? "#ffffff" : "transparent",
                            borderBottom: "1px solid #f1ede4",
                          }}
                          onMouseEnter={(ev) => {
                            if (!active)
                              (ev.currentTarget as HTMLElement).style.background =
                                "#f7f5f0";
                          }}
                          onMouseLeave={(ev) => {
                            if (!active)
                              (ev.currentTarget as HTMLElement).style.background =
                                "transparent";
                          }}
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="absolute"
                              style={{
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 2,
                                background: "#1f1bea",
                              }}
                            />
                          )}
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className="grid shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
                              style={{
                                width: 32,
                                height: 32,
                                background: e.avatarBg,
                              }}
                            >
                              {e.initials}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="mb-0.5 flex items-center justify-between gap-2">
                                <span
                                  className="truncate"
                                  style={{
                                    fontSize: 13.5,
                                    fontWeight: e.unread ? 600 : 500,
                                    color: "#1a1a17",
                                    letterSpacing: "-0.005em",
                                  }}
                                >
                                  {e.sender}
                                </span>
                                <span
                                  className="shrink-0"
                                  style={{
                                    fontSize: 11,
                                    color: "#a39e93",
                                    fontFamily:
                                      "var(--font-jetbrains-mono), ui-monospace, monospace",
                                  }}
                                >
                                  {e.time}
                                </span>
                              </div>
                              <div
                                className="mb-1 truncate"
                                style={{
                                  fontSize: 13,
                                  color: "#2c2b27",
                                  fontWeight: e.unread ? 500 : 400,
                                  letterSpacing: "-0.005em",
                                }}
                              >
                                {e.subject}
                              </div>
                              <div
                                className="line-clamp-2"
                                style={{
                                  fontSize: 12,
                                  color: "#777269",
                                  lineHeight: 1.45,
                                  letterSpacing: "-0.003em",
                                }}
                              >
                                {e.preview}
                              </div>
                              <div className="mt-2 flex items-center gap-1.5">
                                <span
                                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-[2px] uppercase"
                                  style={{
                                    background: pill.bg,
                                    color: pill.color,
                                    fontFamily:
                                      "var(--font-jetbrains-mono), ui-monospace, monospace",
                                    fontSize: 9.5,
                                    fontWeight: 600,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  <span
                                    aria-hidden
                                    className="block rounded-full"
                                    style={{
                                      width: 4,
                                      height: 4,
                                      background: pill.dot,
                                    }}
                                  />
                                  {e.toneLabel}
                                </span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "#a39e93",
                                    fontFamily:
                                      "var(--font-jetbrains-mono), ui-monospace, monospace",
                                  }}
                                >
                                  @{e.domain}
                                </span>
                                {e.unread && (
                                  <span
                                    aria-hidden
                                    className="ml-auto block rounded-full"
                                    style={{
                                      width: 7,
                                      height: 7,
                                      background: "#1f1bea",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div
                className="flex flex-col"
                style={{ background: "#ffffff" }}
              >
                <div
                  className="flex items-start justify-between gap-4 px-6 pb-4 pt-5"
                  style={{ borderBottom: "1px solid #f1ede4" }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="grid shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white"
                      style={{
                        width: 38,
                        height: 38,
                        background: activeEmail.avatarBg,
                      }}
                    >
                      {activeEmail.initials}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a1a17",
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {activeEmail.sender}{" "}
                        <span
                          style={{
                            color: "#a39e93",
                            fontWeight: 400,
                            fontSize: 12.5,
                          }}
                        >
                          &lt;{activeEmail.sender
                            .toLowerCase()
                            .split(" ")
                            .join(".")}
                          @{activeEmail.domain}&gt;
                        </span>
                      </div>
                      <div
                        className="mt-0.5"
                        style={{
                          fontSize: 12,
                          color: "#777269",
                          letterSpacing: "-0.005em",
                        }}
                      >
                        to me · {activeEmail.time}
                      </div>
                    </div>
                  </div>
                  <span
                    className="hidden items-center gap-1 rounded-full px-2 py-1 sm:inline-flex"
                    style={{
                      background: "#ecebff",
                      color: "#1f1bea",
                      fontFamily:
                        "var(--font-jetbrains-mono), ui-monospace, monospace",
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    <span
                      aria-hidden
                      className="block rounded-full"
                      style={{ width: 5, height: 5, background: "#1f1bea" }}
                    />
                    INDEXED · 12 PRIORS
                  </span>
                </div>

                <div className="flex-1 px-6 py-5">
                  <h3
                    className="mb-4"
                    style={{
                      fontFamily:
                        "var(--font-newsreader), Georgia, serif",
                      fontSize: 22,
                      fontWeight: 500,
                      color: "#1a1a17",
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {activeEmail.subject}
                  </h3>

                  <p
                    className="mb-3"
                    style={{
                      fontSize: 14,
                      color: "#2c2b27",
                      lineHeight: 1.6,
                      letterSpacing: "-0.003em",
                    }}
                  >
                    Hey - quick note before the weekend.
                  </p>
                  <p
                    className="mb-3"
                    style={{
                      fontSize: 14,
                      color: "#2c2b27",
                      lineHeight: 1.6,
                      letterSpacing: "-0.003em",
                    }}
                  >
                    {activeEmail.preview}{" "}
                    <span className="hl-hl">Confirm by EOD Friday</span> so we
                    can lock the calendar with the partners. Happy to jump on
                    a quick call if anything is unclear.
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#2c2b27",
                      lineHeight: 1.6,
                      letterSpacing: "-0.003em",
                    }}
                  >
                    Best,
                    <br />
                    {activeEmail.sender.split(" ")[0]}
                  </p>

                  <div
                    className="mt-5 overflow-hidden rounded-[10px]"
                    style={{
                      background:
                        "linear-gradient(180deg, #fbfaff 0%, #f5f3ff 100%)",
                      border: "1px solid #d9d6f7",
                    }}
                  >
                    <div
                      className="flex items-center gap-2 px-4 py-2.5"
                      style={{ borderBottom: "1px solid #e7e3f5" }}
                    >
                      <span className="hl-sl-icon" />
                      <span
                        className="uppercase"
                        style={{
                          fontFamily:
                            "var(--font-jetbrains-mono), ui-monospace, monospace",
                          fontSize: 10.5,
                          color: "#1f1bea",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                        }}
                      >
                        Suggested reply · in your voice
                      </span>
                      <span
                        className="ml-auto"
                        style={{
                          fontFamily:
                            "var(--font-jetbrains-mono), ui-monospace, monospace",
                          fontSize: 10.5,
                          color: "#777269",
                        }}
                      >
                        ⌘ ⏎
                      </span>
                    </div>
                    <div
                      className="px-4 py-3"
                      style={{
                        fontSize: 13.5,
                        color: "#1a1a17",
                        lineHeight: 1.55,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      Confirmed - Tuesday 11 AM PT works. I&apos;ll send the
                      diligence packet tonight; let me know if you need
                      anything ahead of the call.
                    </div>
                    <div
                      className="flex items-center justify-between gap-2 px-4 py-2"
                      style={{
                        borderTop: "1px solid #e7e3f5",
                        background: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <div className="flex gap-1.5">
                        {["Shorter", "Warmer", "More direct"].map((t) => (
                          <span
                            key={t}
                            className="rounded-full px-2 py-0.5 text-[10.5px]"
                            style={{
                              background: "#ffffff",
                              border: "1px solid #d8d3c7",
                              color: "#4a4943",
                              fontWeight: 500,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={onPrimaryCta}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-[5px] text-[12px] font-semibold text-white transition-all hover:-translate-y-px"
                        style={{
                          background: "#1a1a17",
                          letterSpacing: "-0.005em",
                        }}
                      >
                        Send
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d={ARROW_PATH}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between gap-2 px-6 py-3"
                  style={{ borderTop: "1px solid #f1ede4" }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { l: "Reply", primary: true },
                      { l: "Reply all" },
                      { l: "Forward" },
                      { l: "Snooze · 2h" },
                      { l: "Archive" },
                    ].map((b) => (
                      <span
                        key={b.l}
                        className="rounded-md px-2 py-1 text-[11.5px]"
                        style={{
                          background: b.primary ? "#1a1a17" : "#f7f5f0",
                          color: b.primary ? "#ffffff" : "#2c2b27",
                          border: b.primary
                            ? "1px solid #1a1a17"
                            : "1px solid #e8e4db",
                          fontWeight: 500,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {b.l}
                      </span>
                    ))}
                  </div>
                  <span
                    className="hidden items-center gap-1 sm:inline-flex"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains-mono), ui-monospace, monospace",
                      fontSize: 10.5,
                      color: "#a39e93",
                      letterSpacing: "0.04em",
                    }}
                  >
                    drafted in 0.42s · 312 tokens
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
