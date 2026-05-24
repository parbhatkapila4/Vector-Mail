"use client";

import Image from "next/image";

const C = {
  surface: "#FBF8F1",
  surface2: "#F4EFE4",
  surface3: "#EBE5D5",
  border: "rgba(58, 46, 28, 0.10)",
  borderStrong: "rgba(58, 46, 28, 0.18)",
  text: "#2A2418",
  text2: "#5C5340",
  text3: "#8B8068",
  brand: "#1F3A2E",
  brand2: "#14271F",
  accent: "#B85A2B",
  warmSoft: "#F2DDC8",
  warmText: "#5C2B11",
  coolSoft: "#DDE7EB",
  coolText: "#1F3D47",
  goodSoft: "#E0E8D5",
  goodText: "#2A3D1F",
  gold: "#A68419",
  goldSoft: "#F0E5BD",
  goldText: "#5C4708",
};

const FONT =
  "var(--vmx-sans), 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const MONO =
  "var(--vmx-mono), 'JetBrains Mono', ui-monospace, monospace";
const SERIF = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

function Sparkle({ size = 10, color = C.gold }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1l1.3 3.4 3.4 1.3-3.4 1.3L6 10.4 4.7 7l-3.4-1.3L4.7 4.4 6 1z"
        fill={color}
      />
    </svg>
  );
}

const EMAILS = [
  {
    from: "Patrick C.",
    initial: "P",
    avatarBg: "#E8DCC4",
    avatarText: "#5C4708",
    subj: "Re: enterprise pricing",
    body: "Got the proposal — looks great on the volume tier...",
    tagText: "DRAFTED IN YOUR VOICE",
    tagIcon: "sparkle" as const,
    tagBg: C.goldSoft,
    tagColor: C.goldText,
    time: "9:32",
    unread: true,
  },
  {
    from: "Aisha K.",
    initial: "A",
    avatarBg: "#DCE6DC",
    avatarText: C.brand,
    subj: "Stripe — proposal v3",
    body: "Pulled together v3 with the redlines you flagged...",
    tagText: "CONFIRMED · THU 3PM",
    tagIcon: "check" as const,
    tagBg: C.goodSoft,
    tagColor: C.goodText,
    time: "8:14",
    unread: true,
  },
  {
    from: "Greg B.",
    initial: "G",
    avatarBg: "#DCE2E8",
    avatarText: C.coolText,
    subj: "Q3 contract terms",
    body: "Pinging again on the redline doc — let me know...",
    tagText: "NUDGE QUEUED · 2D",
    tagIcon: "arrow" as const,
    tagBg: C.coolSoft,
    tagColor: C.coolText,
    time: "Yest",
    unread: false,
  },
];

export function HeroMobileMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(184,90,43,0.16), transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(31,58,46,0.18), transparent 60%)",
        }}
      />

        
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(160deg, #221c14 0%, #0e0a06 100%)",
          borderRadius: 44,
          padding: 9,
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.45), 0 12px 28px rgba(20,16,40,0.32), 0 28px 64px -20px rgba(20,16,40,0.4), inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -2px 4px rgba(0,0,0,0.4)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-12 left-[2px] w-[1.5px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.18) 70%, transparent)",
          }}
        />

        <div
          className="relative overflow-hidden"
          style={{
            background: C.surface,
            borderRadius: 36,
            color: C.text,
            fontFamily: FONT,
            height: 540,
            textAlign: "left",
          }}
        >
          <div
            className="flex items-center justify-between px-7 pt-2.5"
            style={{ height: 26 }}
          >
            <span
              className="text-[10px] font-semibold"
              style={{ fontFamily: MONO, color: C.text, letterSpacing: "-0.01em" }}
            >
              9:41
            </span>
            <span className="flex items-center gap-1.5" style={{ color: C.text }}>
              <span className="flex items-end gap-[1.2px]">
                <span className="block h-[3px] w-[2px] rounded-[0.5px]" style={{ background: C.text }} />
                <span className="block h-[4.5px] w-[2px] rounded-[0.5px]" style={{ background: C.text }} />
                <span className="block h-[6px] w-[2px] rounded-[0.5px]" style={{ background: C.text }} />
                <span className="block h-[7.5px] w-[2px] rounded-[0.5px]" style={{ background: C.text }} />
              </span>
              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                <path
                  d="M5.5 7L6.7 5.8a1.7 1.7 0 00-2.4 0L5.5 7zM2.6 4.1a4.1 4.1 0 015.8 0M.6 2.1a7 7 0 019.8 0"
                  stroke={C.text}
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span
                className="relative inline-flex items-center"
                style={{
                  height: 9,
                  width: 16,
                  border: `1px solid ${C.text}`,
                  borderRadius: 2.5,
                  padding: 1,
                }}
              >
                <span
                  className="block"
                  style={{
                    height: "100%",
                    width: "85%",
                    background: C.text,
                    borderRadius: 1,
                  }}
                />
                <span
                  className="absolute -right-[2.5px] top-1/2 block -translate-y-1/2"
                  style={{
                    height: 4,
                    width: 1.5,
                    background: C.text,
                    borderRadius: "0 1px 1px 0",
                  }}
                />
              </span>
            </span>
          </div>

          <div
            aria-hidden
            className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full"
            style={{
              height: 24,
              width: 86,
              background: "#0a0805",
            }}
          />

          <div className="flex items-center justify-between px-4 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <span
                className="relative grid place-items-center overflow-hidden"
                style={{
                  height: 26,
                  width: 26,
                  borderRadius: 7,
                  background: "#0a0a0a",
                }}
              >
                <Image
                  src="/VectorMail-New.png"
                  alt=""
                  width={26}
                  height={26}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  color: C.text,
                }}
              >
                Inbox
              </span>
              <span
                className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-1"
                style={{
                  background: C.brand,
                  color: C.surface,
                  fontSize: 9.5,
                  fontWeight: 700,
                  fontFamily: MONO,
                  letterSpacing: "-0.01em",
                }}
              >
                14k
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="grid place-items-center rounded-full"
                style={{
                  height: 28,
                  width: 28,
                  background: C.surface2,
                  border: `0.5px solid ${C.border}`,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="5" cy="5" r="3" stroke={C.text2} strokeWidth="1.4" />
                  <path
                    d="M7.4 7.4L10 10"
                    stroke={C.text2}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span
                className="relative grid place-items-center rounded-full"
                style={{
                  height: 28,
                  width: 28,
                  background: C.surface2,
                  border: `0.5px solid ${C.border}`,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1.5a3.5 3.5 0 00-3.5 3.5v2.2L2.3 9.4h9.4l-1.2-2.2V5A3.5 3.5 0 007 1.5z"
                    stroke={C.text2}
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path d="M5.7 11h2.6" stroke={C.text2} strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span
                  className="absolute -right-[1px] -top-[1px] block rounded-full"
                  style={{
                    height: 7,
                    width: 7,
                    background: C.accent,
                    border: `1.5px solid ${C.surface}`,
                  }}
                />
              </span>
            </div>
          </div>

          <div
            className="mx-4 mb-3 overflow-hidden rounded-[14px]"
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #F8F2E0 100%)",
              border: `0.5px solid ${C.borderStrong}`,
              boxShadow:
                "0 1px 2px rgba(20,16,40,0.04), 0 4px 12px rgba(20,16,40,0.06)",
            }}
          >
            <div className="flex items-start gap-2 px-3 py-2.5">
              <span
                className="mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md"
                style={{
                  background: C.goldSoft,
                  border: `0.5px solid rgba(166,132,25,0.32)`,
                }}
              >
                <Sparkle size={9} color={C.gold} />
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase"
                  style={{
                    color: C.goldText,
                    fontFamily: MONO,
                    letterSpacing: "0.14em",
                  }}
                >
                  Today&apos;s brief
                  <span className="block h-px flex-1" style={{ background: C.border }} />
                  <span style={{ color: C.text3, fontWeight: 600 }}>9:14 AM</span>
                </div>
                <div
                  className="mt-1 text-[13px] leading-[1.3]"
                  style={{ fontFamily: SERIF, color: C.text }}
                >
                  <span className="italic" style={{ color: C.brand, fontWeight: 500 }}>
                    6
                  </span>{" "}
                  threads need a reply.{" "}
                  <span className="italic" style={{ color: C.brand, fontWeight: 500 }}>
                    14
                  </span>{" "}
                  can wait.
                </div>
              </div>
            </div>
          </div>

          <div className="mb-2 flex gap-1.5 overflow-hidden px-4">
            {[
              { label: "All", active: true },
              { label: "Needs reply", badge: "6" },
              { label: "Important" },
              { label: "Promo" },
            ].map((c) => (
              <span
                key={c.label}
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5"
                style={{
                  height: 24,
                  background: c.active ? C.text : "transparent",
                  color: c.active ? C.surface : C.text2,
                  border: c.active ? "none" : `0.5px solid ${C.border}`,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "-0.005em",
                }}
              >
                {c.label}
                {c.badge && (
                  <span
                    className="grid h-[14px] min-w-[14px] place-items-center rounded-full px-1"
                    style={{
                      background: C.accent,
                      color: C.surface,
                      fontSize: 8.5,
                      fontWeight: 700,
                      fontFamily: MONO,
                    }}
                  >
                    {c.badge}
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="px-4">
            {EMAILS.map((e, idx) => (
              <div
                key={e.subj}
                className="flex gap-2.5 py-2"
                style={{
                  borderTop: idx === 0 ? "none" : `0.5px solid ${C.border}`,
                }}
              >
                <span
                  className="mt-[2px] grid place-items-center rounded-full shrink-0"
                  style={{
                    height: 26,
                    width: 26,
                    background: e.avatarBg,
                    color: e.avatarText,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {e.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="flex min-w-0 items-center gap-1.5 truncate"
                      style={{
                        fontSize: 12.5,
                        fontWeight: e.unread ? 700 : 500,
                        color: C.text,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {e.unread && (
                        <span
                          className="vm-hero-warm-pulse block shrink-0 rounded-full"
                          style={{ height: 5, width: 5, background: C.accent }}
                        />
                      )}
                      <span className="truncate">{e.from}</span>
                    </span>
                    <span
                      className="shrink-0"
                      style={{
                        fontSize: 9.5,
                        color: C.text3,
                        fontFamily: MONO,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {e.time}
                    </span>
                  </div>
                  <div
                    className="truncate"
                    style={{
                      fontSize: 11.5,
                      color: e.unread ? C.text : C.text2,
                      fontWeight: e.unread ? 600 : 500,
                      lineHeight: 1.25,
                      marginTop: 1,
                    }}
                  >
                    {e.subj}
                  </div>
                  <div
                    className="truncate"
                    style={{
                      fontSize: 10.5,
                      color: C.text3,
                      lineHeight: 1.3,
                      marginTop: 1,
                    }}
                  >
                    {e.body}
                  </div>
                  <div className="mt-1.5">
                    <span
                      className={
                        e.tagIcon === "sparkle"
                          ? "vm-hero-tag-shine inline-flex items-center gap-1 rounded-md px-1.5"
                          : "inline-flex items-center gap-1 rounded-md px-1.5"
                      }
                      style={{
                        height: 16,
                        ...(e.tagIcon === "sparkle"
                          ? {}
                          : { background: e.tagBg }),
                        color: e.tagColor,
                        fontSize: 8.5,
                        fontWeight: 700,
                        fontFamily: MONO,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {e.tagIcon === "sparkle" && <Sparkle size={7} color={e.tagColor} />}
                      {e.tagIcon === "check" && (
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                          <path
                            d="M1 3.7L2.7 5.3 6 1.7"
                            stroke={e.tagColor}
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {e.tagIcon === "arrow" && (
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                          <path
                            d="M1.5 5.5L5.5 1.5M2.2 1.5h3.3v3.3"
                            stroke={e.tagColor}
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {e.tagText}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-3 bottom-3">
            <div
              className="flex items-center gap-2 rounded-full px-3"
              style={{
                height: 38,
                background: "rgba(20, 16, 12, 0.94)",
                color: C.surface,
                boxShadow:
                  "0 4px 14px rgba(20,16,40,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <span
                className="grid place-items-center rounded-full"
                style={{
                  height: 22,
                  width: 22,
                  background: "rgba(240,229,189,0.14)",
                }}
              >
                <Sparkle size={11} color={C.goldSoft} />
              </span>
              <span
                className="flex-1 truncate"
                style={{
                  fontSize: 11.5,
                  color: "rgba(251,248,241,0.8)",
                  letterSpacing: "-0.005em",
                }}
              >
                Ask Inbox brain anything…
              </span>
              <span
                className="rounded px-1.5"
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: MONO,
                  color: C.goldSoft,
                  background: "rgba(240,229,189,0.1)",
                  letterSpacing: "0.05em",
                }}
              >
                ⌘K
              </span>
            </div>
          </div>

          <div
            aria-hidden
            className="absolute bottom-[6px] left-1/2 -translate-x-1/2 rounded-full"
            style={{
              height: 3,
              width: 96,
              background: "rgba(20,16,12,0.32)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroMobileMockup;
