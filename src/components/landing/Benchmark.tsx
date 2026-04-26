"use client";

import Link from "next/link";

interface BenchCard {
  name: string;
  num: string;
  vs: string;
  featured?: boolean;
  spark: string;
  sparkColor: string;
}

const CARDS: BenchCard[] = [
  {
    name: "Gmail OAuth + Sync",
    num: "Live",
    vs: "Account-linked",
    featured: true,
    spark: "M0,28 L15,24 L30,26 L45,18 L60,14 L75,8 L100,4",
    sparkColor: "var(--vmx-lav-bright, #9d7af3)",
  },
  {
    name: "Semantic Retrieval",
    num: "Ready",
    vs: "Thread-level",
    spark: "M0,26 L15,20 L30,22 L45,16 L60,12 L75,10 L100,6",
    sparkColor: "var(--vmx-ink-2, #4a4a4a)",
  },
  {
    name: "Daily Brief Engine",
    num: "Online",
    vs: "Action extraction",
    spark: "M0,24 L15,22 L30,18 L45,20 L60,16 L75,14 L100,12",
    sparkColor: "var(--vmx-ink-2, #4a4a4a)",
  },
  {
    name: "Automation Layer",
    num: "Shipped",
    vs: "Rule-based flows",
    spark: "M0,22 L15,18 L30,16 L45,14 L60,16 L75,12 L100,14",
    sparkColor: "var(--vmx-ink-2, #4a4a4a)",
  },
];

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

export function Benchmark() {
  return (
    <section
      className="px-5 py-[120px] text-center md:px-8"
      style={{ background: "var(--vmx-paper, #ffffff)" }}
    >
      <div
        className="mb-6 inline-block rounded-full px-[18px] py-1.5 text-[13px]"
        style={{
          border: "1px solid var(--vmx-line-strong, #d6cfe5)",
          color: "var(--vmx-ink-2, #4a4a4a)",
          background: "var(--vmx-paper, #ffffff)",
        }}
      >
        Production system
      </div>
      <h2
        className="mb-5"
        style={{
          fontSize: "clamp(40px, 5.5vw, 64px)",
          fontWeight: 600,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "var(--vmx-ink, #0a0a0a)",
          fontFamily: "var(--vmx-sans)",
        }}
      >
        Operational.{" "}
        <span
          style={{
            fontFamily: "var(--vmx-serif)",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          Not just marketed.
        </span>
      </h2>
      <p
        className="mx-auto mb-[60px] max-w-[540px]"
        style={{
          fontSize: 17,
          color: "var(--vmx-ink-2, #4a4a4a)",
          lineHeight: 1.5,
        }}
      >
        Built for founder-speed execution: retrieval, briefing, drafting, and
        automation in one integrated inbox workflow.
      </p>

      <div className="mx-auto mb-12 grid max-w-[1100px] grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div
            key={c.name}
            className="group relative overflow-hidden p-[22px_22px_24px] transition-all"
            style={{
              background: c.featured
                ? "linear-gradient(180deg, #f5edff 0%, var(--vmx-paper, #ffffff) 100%)"
                : "var(--vmx-paper, #ffffff)",
              border: c.featured
                ? "1px solid var(--vmx-lav-deep, #c0a8f5)"
                : "1px solid var(--vmx-line, #e5e0ee)",
              borderRadius: "var(--vmx-r, 14px)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 12px 24px rgba(157,122,243,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div
              className="mb-[18px] flex items-center justify-between uppercase"
              style={{
                fontFamily: "var(--vmx-mono)",
                fontSize: 11,
                color: "var(--vmx-ink-3, #767676)",
                letterSpacing: "0.08em",
                fontWeight: 500,
              }}
            >
              <span>{c.name}</span>
              {c.featured && (
                <span
                  className="rounded"
                  style={{
                    background: "var(--vmx-lav-bright, #9d7af3)",
                    color: "white",
                    fontSize: 9,
                    padding: "2px 6px",
                    letterSpacing: "0.04em",
                  }}
                >
                  CORE
                </span>
              )}
            </div>
            <div
              className="mb-3.5 leading-none"
              style={{
                fontSize: 44,
                fontWeight: 600,
                letterSpacing: "-0.04em",
                color: "var(--vmx-ink, #0a0a0a)",
                fontFamily: "var(--vmx-sans)",
              }}
            >
              {c.num}
            </div>
            <div className="relative mb-3 h-8">
              <svg
                viewBox="0 0 100 32"
                preserveAspectRatio="none"
                className="h-full w-full overflow-visible"
              >
                <path
                  d={c.spark}
                  stroke={c.sparkColor}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {c.featured && (
                  <>
                    <path
                      d={`${c.spark} L100,32 L0,32 Z`}
                      fill="url(#bench-grad)"
                      opacity="0.2"
                    />
                    <defs>
                      <linearGradient
                        id="bench-grad"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop stopColor="#9d7af3" />
                        <stop
                          offset="1"
                          stopColor="#9d7af3"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                  </>
                )}
              </svg>
            </div>
            <div
              className="flex justify-between pt-3"
              style={{
                fontSize: 11.5,
                color: "var(--vmx-ink-3, #767676)",
                borderTop: "1px dashed var(--vmx-line, #e5e0ee)",
              }}
            >
              <span>production signal</span>
              <span
                style={{
                  fontFamily: "var(--vmx-mono)",
                  color: "var(--vmx-ink-2, #4a4a4a)",
                  fontWeight: 500,
                }}
              >
                {c.vs}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/features"
        className="inline-flex items-center gap-2.5 rounded-[8px] py-3 pl-[22px] pr-[14px] text-[14.5px] font-medium text-white"
        style={{
          background: "var(--vmx-ink, #0a0a0a)",
          letterSpacing: "-0.005em",
        }}
      >
        Explore Product Architecture
        <ArrowPill />
      </Link>
    </section>
  );
}
