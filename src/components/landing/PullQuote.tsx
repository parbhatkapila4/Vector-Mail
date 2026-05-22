"use client";

import Image from "next/image";

interface Pang {
  from: string;
  msg: string;
  source: "gmail" | "slack" | "you";
}

const ROW_A: Pang[] = [
  {
    from: "Sarah Chen",
    msg: "Did you ever reply to that Sequoia intro?",
    source: "gmail",
  },
  {
    from: "You · 3am",
    msg: "I'll get to inbox zero this weekend 😅",
    source: "you",
  },
  {
    from: "Marcus (boss)",
    msg: "Skim this 47-email chain and catch me up by 3?",
    source: "gmail",
  },
  {
    from: "Cofounder",
    msg: "Did you see the bank dump 8 alerts on us this morning? 😭",
    source: "slack",
  },
  {
    from: "Roelof Botha",
    msg: "Bumping my note from 3 weeks ago…",
    source: "gmail",
  },
  {
    from: "You",
    msg: "Where did that calendar invite go??",
    source: "you",
  },
];

const ROW_B: Pang[] = [
  {
    from: "Press inquiry",
    msg: "Need a quote by EOD - Series A roundup piece running tomorrow",
    source: "gmail",
  },
  {
    from: "You · Sunday",
    msg: "Lemme just write 12 filters to clean this up…",
    source: "you",
  },
  {
    from: "Jake",
    msg: "Where's 'final_final_deck_v3'? Searched 20 emails already",
    source: "slack",
  },
  {
    from: "Legal",
    msg: "Need your signature on the term sheet by EOD",
    source: "gmail",
  },
  {
    from: "Boss",
    msg: "That last reply of yours sounded like a chatbot",
    source: "gmail",
  },
  {
    from: "Stripe",
    msg: "Your payout · buried under 14 other receipts",
    source: "gmail",
  },
];

export function PullQuote() {
  return (
    <section
      className="relative overflow-hidden px-5 py-[120px] md:px-8 md:py-[140px]"
      style={{
        background: "#f4ede0",
        backgroundImage:
          "radial-gradient(circle, rgba(58,46,28,0.08) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        backgroundPosition: "0 0",
      }}
    >
      <div className="relative mx-auto mb-14 max-w-[820px] text-center md:mb-20">
        <div
          aria-hidden
          className="mb-3 text-[40px] leading-none md:text-[48px]"
        >
          🙃
        </div>
        <h2
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 600,
            lineHeight: 1.04,
            letterSpacing: "-0.04em",
            color: "var(--vmx-ink, #0a0a0a)",
            fontFamily: "var(--vmx-sans)",
          }}
        >
          Things you won&apos;t hear
          <br />
          <span style={{ color: "var(--vmx-ink-3, #767676)" }}>
            anymore
          </span>
        </h2>
        <p
          className="mx-auto mt-5 max-w-[520px]"
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--vmx-ink-2, #4a4a4a)",
          }}
        >
          Buddy reads every thread, drafts every reply, and surfaces what
          actually needs you. The chase ends.
        </p>
      </div>

      <div className="relative flex flex-col gap-5 md:gap-7">
        <CarouselRow items={ROW_A} direction="left" />
        <CarouselRow items={ROW_B} direction="right" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[120px]"
        style={{
          background:
            "linear-gradient(90deg, #f4ede0 30%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[120px]"
        style={{
          background:
            "linear-gradient(270deg, #f4ede0 30%, transparent)",
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes vm-marquee-left {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}
@keyframes vm-marquee-right {
  0% { transform: translate3d(-50%, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
.vm-marquee-track {
  display: flex;
  gap: 14px;
  width: max-content;
  animation-duration: 48s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.vm-marquee-track.dir-left  { animation-name: vm-marquee-left; }
.vm-marquee-track.dir-right { animation-name: vm-marquee-right; }
@media (prefers-reduced-motion: reduce) {
  .vm-marquee-track { animation: none; }
}
`,
        }}
      />
    </section>
  );
}

function CarouselRow({
  items,
  direction,
}: {
  items: Pang[];
  direction: "left" | "right";
}) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div className={`vm-marquee-track dir-${direction}`}>
        {doubled.map((p, i) => (
          <PangCard key={i} pang={p} />
        ))}
      </div>
    </div>
  );
}

function PangCard({ pang }: { pang: Pang }) {
  return (
    <div
      className="flex shrink-0 items-center gap-3 rounded-2xl"
      style={{
        background: "#ffffff",
        border: "1px solid var(--vmx-line, #e5e0ee)",
        boxShadow:
          "0 1px 2px rgba(20,16,40,0.04), 0 8px 24px -12px rgba(20,16,40,0.08)",
        padding: "14px 18px 14px 14px",
        minWidth: 360,
        maxWidth: 460,
      }}
    >
      <SourceIcon source={pang.source} />
      <div className="min-w-0 flex-1 leading-tight">
        <div
          className="truncate"
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: "var(--vmx-ink-3, #767676)",
            letterSpacing: "-0.1px",
            marginBottom: 2,
          }}
        >
          {pang.from}
        </div>
        <div
          className="truncate"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--vmx-ink, #0a0a0a)",
            letterSpacing: "-0.15px",
          }}
        >
          {pang.msg}
        </div>
      </div>
    </div>
  );
}

function SourceIcon({ source }: { source: Pang["source"] }) {
  if (source === "slack") {
    return (
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{ background: "#f4f4f5" }}
      >
        <svg width="18" height="18" viewBox="0 0 60 60" aria-hidden>
          <path
            fill="#36c5f0"
            d="M22 37.5a5.5 5.5 0 1 1-5.5-5.5H22zm2.75 0a5.5 5.5 0 1 1 11 0v13.75a5.5 5.5 0 1 1-11 0z"
          />
          <path
            fill="#2eb67d"
            d="M30.25 16a5.5 5.5 0 1 1-5.5-5.5V16zm0 2.75a5.5 5.5 0 1 1 0 11H16.5a5.5 5.5 0 1 1 0-11z"
          />
          <path
            fill="#ecb22e"
            d="M51.5 24.25a5.5 5.5 0 1 1 5.5 5.5h-5.5zm-2.75 0a5.5 5.5 0 1 1-11 0V10.5a5.5 5.5 0 1 1 11 0z"
          />
          <path
            fill="#e01e5a"
            d="M38 45.75a5.5 5.5 0 1 1 5.5 5.5V45.75zm0-2.75a5.5 5.5 0 1 1 0-11h13.75a5.5 5.5 0 1 1 0 11z"
          />
        </svg>
      </span>
    );
  }
  if (source === "you") {
    return (
      <span
        aria-hidden
        className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg"
        style={{ background: "#fff", border: "1px solid var(--vmx-line, #e5e0ee)" }}
      >
        <Image
          src="/hero%20logo/def.hero.png"
          alt=""
          width={36}
          height={36}
          className="h-full w-full object-cover"
          unoptimized
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
      style={{ background: "#fff", border: "1px solid var(--vmx-line, #e5e0ee)" }}
    >
      <svg width="18" height="14" viewBox="0 0 24 18" aria-hidden>
        <path d="M22 4l-10 7L2 4" stroke="#4285f4" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M2 4v10a2 2 0 0 0 2 2h4V8l4 3 4-3v8h4a2 2 0 0 0 2-2V4" fill="none" stroke="#34a853" strokeWidth="2" />
        <path d="M2 4l10 7 10-7" fill="none" stroke="#ea4335" strokeWidth="2" />
      </svg>
    </span>
  );
}
