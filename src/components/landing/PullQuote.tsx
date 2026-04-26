"use client";

export function PullQuote() {
  return (
    <section className="vmx-halftone-quote relative px-5 py-[140px] md:px-8">
      <div className="relative mx-auto max-w-[1080px] text-center">
        <div
          aria-hidden
          style={{
            fontFamily: "var(--vmx-serif)",
            fontStyle: "italic",
            fontSize: 120,
            color: "var(--vmx-lav-bright, #9d7af3)",
            lineHeight: 1,
            marginBottom: -20,
            opacity: 0.4,
          }}
        >
          &ldquo;
        </div>
        <p
          className="mb-9"
          style={{
            fontFamily: "var(--vmx-serif)",
            fontSize: "clamp(34px, 4.8vw, 64px)",
            lineHeight: 1.18,
            letterSpacing: "-0.025em",
            fontWeight: 400,
            color: "var(--vmx-ink, #0a0a0a)",
          }}
        >
          Operational email infrastructure with semantic retrieval, structured
          briefs, and{" "}
          <em
            style={{
              color: "var(--vmx-ink, #0a0a0a)",
              background:
                "linear-gradient(180deg, transparent 60%, var(--vmx-lav-bright, #9d7af3) 60%)",
              padding: "0 6px",
              fontStyle: "italic",
            }}
          >
            deterministic next actions
          </em>{" "}
          for high-velocity teams.
        </p>
        <div className="inline-flex flex-wrap items-center justify-center gap-2">
          {[
            "Thread-level semantic retrieval",
            "Action extraction from email context",
            "Keyboard-first inbox operations",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
              style={{
                color: "var(--vmx-ink-1, #1f1f1f)",
                border: "1px solid var(--vmx-line, #e5e0ee)",
                background: "var(--vmx-paper, #ffffff)",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
