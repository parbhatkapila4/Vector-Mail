"use client";

interface EntCard {
  h: string;
  p: string;
  icon: React.ReactNode;
}

const CARDS: EntCard[] = [
  {
    h: "Governance",
    p: "Role-based access, account isolation, and controlled data flows designed for production teams.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1.5l6 2.5v5c0 3.5-2.5 6.5-6 7.5-3.5-1-6-4-6-7.5v-5l6-2.5z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    h: "Portable",
    p: "Open architecture with typed APIs and webhook-first integrations that fit existing workflows.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect
          x="2"
          y="2"
          width="14"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M2 7h14M7 2v14" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    h: "Auditable",
    p: "Traceable thread operations and deterministic automation flows with clear action history.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M3 3h12M3 7h12M3 11h12M3 15h8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function Enterprise() {
  return (
    <section
      className="px-5 py-[120px] text-center md:px-8"
      style={{ background: "var(--vmx-paper, #ffffff)" }}
    >
      <h2
        className="mb-6"
        style={{
          fontSize: "clamp(36px, 4.6vw, 56px)",
          fontWeight: 600,
          letterSpacing: "-0.04em",
          lineHeight: 1.08,
          color: "var(--vmx-ink, #0a0a0a)",
          fontFamily: "var(--vmx-sans)",
        }}
      >
        Built for teams
        <br />
        <span
          style={{
            fontFamily: "var(--vmx-serif)",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          Designed for trust
        </span>
      </h2>
      <p
        className="mx-auto mb-[60px] max-w-[720px]"
        style={{
          fontSize: 17,
          color: "var(--vmx-ink-2, #4a4a4a)",
          lineHeight: 1.55,
        }}
      >
        Email is operational infrastructure. VectorMail gives teams control,
        reliability, and visibility across search, drafting, and workflow
        execution.
      </p>

      <div className="mx-auto mb-[60px] grid max-w-[1180px] grid-cols-1 gap-[18px] text-left md:grid-cols-3">
        {CARDS.map((c) => (
          <div
            key={c.h}
            className="p-6"
            style={{
              background: "var(--vmx-paper, #ffffff)",
              border: "1px solid var(--vmx-line, #e5e0ee)",
              borderRadius: "var(--vmx-r, 14px)",
            }}
          >
            <div
              className="mb-[18px] grid place-items-center rounded-lg"
              style={{
                width: 36,
                height: 36,
                background: "var(--vmx-paper-3, #f3f1f7)",
                color: "var(--vmx-ink-1, #1f1f1f)",
              }}
            >
              {c.icon}
            </div>
            <h3
              className="mb-2"
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--vmx-ink, #0a0a0a)",
                letterSpacing: "-0.015em",
                fontFamily: "var(--vmx-sans)",
              }}
            >
              {c.h}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--vmx-ink-3, #767676)",
                lineHeight: 1.5,
              }}
            >
              {c.p}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6 pt-6 text-left"
        style={{ borderTop: "1px solid var(--vmx-line, #e5e0ee)" }}
      >
        <p
          className="max-w-[640px]"
          style={{
            fontSize: 14.5,
            color: "var(--vmx-ink-2, #4a4a4a)",
            lineHeight: 1.5,
          }}
        >
          We take security and privacy seriously with least-privilege access,
          encrypted transport, and operational controls across the platform.
        </p>
        <div className="flex items-center gap-4">
          {[
            { name: "ACCESS", sub: "ROLE-BASED" },
            { name: "SYNC", sub: "OAUTH-BASED" },
            { name: "WORKFLOW", sub: "TRACEABLE" },
          ].map((m) => (
            <div
              key={m.name}
              className="text-center leading-snug"
              style={{
                background: "var(--vmx-paper-3, #f3f1f7)",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "var(--vmx-mono)",
                border: "1px solid var(--vmx-line, #e5e0ee)",
                color: "var(--vmx-ink-1, #1f1f1f)",
              }}
            >
              {m.name}
              <div
                style={{
                  fontSize: 9.5,
                  color: "var(--vmx-ink-3, #767676)",
                  fontWeight: 500,
                }}
              >
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
