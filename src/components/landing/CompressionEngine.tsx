"use client";

const MESSAGES = [
  { from: "william@stripe", text: "Quick sync tomorrow works for me…" },
  { from: "alice@figma", text: "Latest design components are ready…" },
  { from: "sarah@vec", text: "Search filter request - date range..." },
  { from: "sequoia", text: "We're in. Let's schedule the call…" },
  { from: "github", text: "PR #284 ready for your review…" },
  { from: "william@stripe", text: "Actually can we push to Thursday?" },
  { from: "alice@figma", text: "Should we merge or hold for review?" },
  { from: "linear", text: "Weekly review: 14 issues completed" },
  { from: "marc.k", text: "Re: investor update - looks great" },
  { from: "newsletter", text: "Tech weekly: 5 stories you missed" },
  { from: "sarah@vec", text: "Beta feedback - semantic search..." },
  { from: "github", text: "CI passed on main · deploy ready" },
];

export function CompressionEngine() {
  const looped = [...MESSAGES, ...MESSAGES];

  return (
    <section
      className="vmx-dotted-dark relative overflow-hidden px-5 py-[120px] md:px-8"
      style={{ background: "#0a0a0a", color: "#e5e5e5" }}
    >
      <div className="relative z-[1] mx-auto max-w-[1280px]">
        <div className="mb-16 grid gap-10 md:grid-cols-2 md:gap-20">
          <h2
            style={{
              fontSize: "clamp(36px, 4.4vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              fontWeight: 500,
              color: "white",
              fontFamily: "var(--vmx-sans)",
            }}
          >
            Built for{" "}
            <span
              style={{
                fontFamily: "var(--vmx-mono)",
                color: "var(--vmx-lav-bright, #9d7af3)",
                fontWeight: 500,
              }}
            >
              &lt;builders&gt;
            </span>
            <br />
            <span style={{ color: "#6b6b6b", fontWeight: 400 }}>
              who ship,
              <br />
              not promise
            </span>
          </h2>
          <p
            className="self-end"
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: "#a8a8a8",
              maxWidth: 440,
              letterSpacing: "-0.005em",
            }}
          >
            VectorMail compresses dozens of messages into a single actionable
            brief. Less noise, fewer tokens, measurably faster decisions.
          </p>
        </div>

        <div
          className="grid grid-cols-1 overflow-hidden md:grid-cols-2"
          style={{
            background: "#141414",
            border: "1px solid #262626",
            borderRadius: "var(--vmx-r-lg, 20px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
            minHeight: 460,
          }}
        >
          <div
            className="flex flex-col p-8"
            style={{
              borderRight: "1px solid #262626",
              borderBottom: "1px solid #262626",
            }}
          >
            <div
              className="mb-[18px] flex items-center gap-2 uppercase"
              style={{
                fontFamily: "var(--vmx-mono)",
                fontSize: 10.5,
                color: "#777",
                letterSpacing: "0.1em",
                fontWeight: 500,
              }}
            >
              <span
                aria-hidden
                className="block rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: "var(--vmx-signal, #ff5722)",
                }}
              />
              Input · 47 messages
            </div>
            <h3
              className="mb-3"
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "white",
                letterSpacing: "-0.015em",
                fontFamily: "var(--vmx-sans)",
              }}
            >
              Thread Compression Engine
            </h3>
            <p
              className="mb-auto"
              style={{
                fontSize: 14,
                color: "#a8a8a8",
                lineHeight: 1.6,
              }}
            >
              Streams every message through a hierarchical retrieval model.
              Preserves commitments, deadlines, and intent - drops the noise.
            </p>

            <div
              className="vmx-stream-mask relative mt-6 h-[200px] overflow-hidden py-[14px]"
              style={{
                borderTop: "1px dashed #262626",
                borderBottom: "1px dashed #262626",
              }}
            >
              <div className="vmx-stream-inner flex flex-col gap-[5px]">
                {looped.map((m, i) => (
                  <div
                    key={`${m.from}-${i}`}
                    className="flex items-baseline gap-2.5 py-[5px]"
                    style={{
                      fontFamily: "var(--vmx-mono)",
                      fontSize: 11,
                      color: "#888",
                    }}
                  >
                    <span
                      className="w-20 shrink-0 truncate"
                      style={{ color: "var(--vmx-lav-bright, #9d7af3)" }}
                    >
                      {m.from}
                    </span>
                    <span className="truncate" style={{ color: "#888" }}>
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="mt-3.5 flex justify-between"
              style={{ fontFamily: "var(--vmx-mono)", fontSize: 11 }}
            >
              <span>
                <span
                  style={{
                    color: "var(--vmx-signal, #ff5722)",
                    fontWeight: 600,
                  }}
                >
                  47
                </span>{" "}
                <span style={{ color: "#888" }}>messages in</span>
              </span>
              <span style={{ color: "#888" }}>
                <span
                  style={{
                    color: "var(--vmx-signal, #ff5722)",
                    fontWeight: 600,
                  }}
                >
                  14,328
                </span>{" "}
                tokens ·{" "}
                <span
                  style={{
                    color: "var(--vmx-signal, #ff5722)",
                    fontWeight: 600,
                  }}
                >
                  38ms
                </span>
              </span>
            </div>
          </div>

          <div
            className="relative flex flex-col justify-center p-8"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(157,122,243,0.18), transparent 60%), #1a1a1a",
            }}
          >
            <span
              aria-hidden
              className="absolute hidden -translate-y-1/2 place-items-center rounded-full md:grid"
              style={{
                top: "50%",
                left: -12,
                width: 24,
                height: 24,
                background: "var(--vmx-lav-bright, #9d7af3)",
                color: "var(--vmx-ink, #0a0a0a)",
                boxShadow: "0 0 16px rgba(157,122,243,0.4)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 6h6M6 3l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <div
              className="mb-3 flex items-center gap-2 uppercase"
              style={{
                fontFamily: "var(--vmx-mono)",
                fontSize: 10.5,
                color: "var(--vmx-lav-bright, #9d7af3)",
                letterSpacing: "0.1em",
                fontWeight: 500,
              }}
            >
              Brief · 1 output
              <span
                aria-hidden
                className="flex-1"
                style={{
                  height: 1,
                  background:
                    "linear-gradient(90deg, var(--vmx-lav-bright, #9d7af3), transparent)",
                }}
              />
            </div>
            <h3
              style={{
                fontFamily: "var(--vmx-serif)",
                fontSize: 24,
                fontWeight: 400,
                color: "white",
                lineHeight: 1.25,
                letterSpacing: "-0.018em",
              }}
            >
              William wants to{" "}
              <em
                style={{
                  color: "var(--vmx-lav-bright, #9d7af3)",
                  fontStyle: "italic",
                }}
              >
                move Thursday&apos;s sync
              </em>{" "}
              to next week. Sequoia confirmed the Tuesday call. Alice needs
              your call on the design merge.
            </h3>

            <div
              className="mt-5 flex gap-4 pt-5"
              style={{ borderTop: "1px solid #2a2a2a" }}
            >
              {[
                { num: "98", delta: "↑ 2.4%", label: "Recall" },
                { num: "312", delta: "↓ 97.8%", label: "Tokens out" },
                { num: "38ms", label: "Latency" },
              ].map((s) => (
                <div key={s.label} className="flex-1">
                  <div
                    style={{
                      fontFamily: "var(--vmx-mono)",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "white",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.num}
                    {s.delta && (
                      <span
                        className="ml-1"
                        style={{ color: "#4ade80", fontSize: 12 }}
                      >
                        {s.delta}
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-0.5 uppercase"
                    style={{
                      fontSize: 11,
                      color: "#777",
                      letterSpacing: "0.08em",
                      fontWeight: 500,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
