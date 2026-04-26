"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    h: "Connect",
    p: "One-click Gmail or Outlook OAuth. No SMTP, no IMAP gymnastics, no boilerplate.",
  },
  {
    h: "Learn",
    p: "VectorMail indexes your threads, contacts, and writing style - then keeps learning.",
  },
  {
    h: "Brief",
    p: "Wake up to a prioritized digest. The 5 emails that matter, summarized with action items.",
  },
  {
    h: "Reply",
    p: "Drafts that sound like you. Approve in one keystroke. Inbox zero by 9 AM.",
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % STEPS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="vmx-halftone relative px-5 py-[120px] md:px-8">
      <div className="relative mx-auto max-w-[1180px]">
        <p
          className="mb-2"
          style={{
            fontSize: 18,
            color: "var(--vmx-ink-3, #767676)",
            fontWeight: 400,
            letterSpacing: "-0.005em",
          }}
        >
          How it works
        </p>
        <h2
          className="mb-16 max-w-[900px]"
          style={{
            fontSize: "clamp(32px, 4vw, 56px)",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            fontWeight: 600,
            color: "var(--vmx-ink, #0a0a0a)",
            fontFamily: "var(--vmx-sans)",
          }}
        >
          Connect your inbox.{" "}
          <span
            style={{
              fontFamily: "var(--vmx-serif)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            VectorMail learns the rest.
          </span>
        </h2>

        <div
          className="grid grid-cols-1 overflow-hidden md:grid-cols-[380px_1fr]"
          style={{
            background: "var(--vmx-paper, #ffffff)",
            border: "1px solid var(--vmx-line, #e5e0ee)",
            borderRadius: "var(--vmx-r-lg, 20px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="relative px-7 py-8"
            style={{
              background: "var(--vmx-paper-2, #faf9fc)",
              borderRight: "1px solid var(--vmx-line, #e5e0ee)",
            }}
          >
            <span
              aria-hidden
              className="absolute"
              style={{
                left: 38,
                top: 50,
                bottom: 50,
                width: 1,
                background:
                  "linear-gradient(180deg, var(--vmx-lav-deep, #c0a8f5), transparent)",
              }}
            />
            {STEPS.map((s, i) => (
              <button
                key={s.h}
                type="button"
                onClick={() => setActive(i)}
                className={`relative block w-full cursor-pointer py-[18px] pl-9 pr-0 text-left ${active === i ? "vmx-step-active" : ""}`}
              >
                <span className="vmx-step-dot" />
                <div
                  className="mb-1.5"
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--vmx-ink, #0a0a0a)",
                    letterSpacing: "-0.018em",
                    fontFamily: "var(--vmx-sans)",
                  }}
                >
                  {s.h}
                </div>
                <p
                  className="max-w-[240px]"
                  style={{
                    fontSize: 14,
                    color: "var(--vmx-ink-3, #767676)",
                    lineHeight: 1.5,
                  }}
                >
                  {s.p}
                </p>
              </button>
            ))}
          </div>

          <motion.div
            className="vmx-dotted-light relative flex min-h-[460px] flex-col gap-3 p-9"
            style={{
              background:
                "linear-gradient(135deg, #d8c3fa 0%, #b090f5 100%)",
              willChange: "transform",
            }}
          >
            <motion.div
              className="relative z-[1] mr-auto max-w-[85%] rounded-[18px] px-[18px] py-[14px]"
              style={{
                background: "rgba(255,255,255,0.92)",
                fontSize: 14,
                color: "var(--vmx-ink-1, #1f1f1f)",
                lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                willChange: "transform, opacity",
              }}
              animate={{
                y: [0, -2, 0],
                x: [0, 1, 0],
              }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Can you pull only investor emails from this week and summarize?
            </motion.div>

            <motion.div
              className="relative z-[1] inline-flex items-center gap-1.5 self-center rounded-full px-3 py-1 text-[13px] font-medium"
              style={{
                background: "rgba(255,255,255,0.4)",
                color: "var(--vmx-ink, #0a0a0a)",
                willChange: "transform, opacity",
              }}
              animate={{
                y: [0, -1.5, 0],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.4 }}
              >
                <path
                  d="M2 6l3 3 5-7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
              Inbox memory updated
            </motion.div>

            <motion.div
              className="relative z-[1] ml-auto max-w-[85%] rounded-[18px] px-[18px] py-[14px]"
              style={{
                background: "white",
                fontSize: 14,
                color: "var(--vmx-ink-1, #1f1f1f)",
                lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                willChange: "transform, opacity",
              }}
              animate={{
                y: [0, -2.2, 0],
                x: [0, -1, 0],
              }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            >
              Also draft a follow-up for everyone who has not replied.
            </motion.div>

            <motion.div
              className="relative z-[1] flex items-center gap-2 rounded-[14px] px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.3)",
                color: "var(--vmx-ink-1, #1f1f1f)",
                fontSize: 13,
                fontWeight: 500,
                willChange: "transform, opacity",
              }}
              animate={{
                y: [0, -1.2, 0],
                opacity: [0.88, 0.98, 0.88],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            >
              <span
                className="grid shrink-0 place-items-center rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  background: "var(--vmx-ink, #0a0a0a)",
                  color: "var(--vmx-lav-bright, #9d7af3)",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2 2 4-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span style={{ color: "rgba(0,0,0,0.6)" }}>From memory:</span>
              <span>Priority: investor threads, Tone: concise, SLA: same-day…</span>
            </motion.div>

            <motion.div
              className="relative z-[1] mr-auto max-w-[85%] rounded-[18px] px-[18px] py-[14px]"
              style={{
                background: "white",
                fontSize: 14,
                color: "var(--vmx-ink-1, #1f1f1f)",
                lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                willChange: "transform, opacity",
              }}
              animate={{
                y: [0, -2, 0],
                x: [0, 0.8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            >
              <strong>Done.</strong> 14 investor threads surfaced, 5 high-priority
              replies drafted, and non-responders queued for follow-up.
            </motion.div>

            <motion.div
              className="relative z-[1] inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[12.5px] font-medium"
              style={{
                background: "rgba(255,255,255,0.36)",
                color: "var(--vmx-ink, #0a0a0a)",
                willChange: "transform, opacity",
              }}
              animate={{
                y: [0, -1.2, 0],
                opacity: [0.88, 0.98, 0.88],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9,
              }}
            >
              <span
                className="block rounded-full"
                style={{ width: 6, height: 6, background: "#1f1bea" }}
              />
              Follow-up queue synced · 9:41 AM
            </motion.div>

            <motion.div
              className="relative z-[1] ml-auto max-w-[82%] rounded-[18px] px-[18px] py-[14px]"
              style={{
                background: "white",
                fontSize: 14,
                color: "var(--vmx-ink-1, #1f1f1f)",
                lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                willChange: "transform, opacity",
              }}
              animate={{
                y: [0, -2, 0],
                x: [0, -0.8, 0],
              }}
              transition={{
                duration: 4.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
            >
              Sent the first 3 replies now - want me to queue the remaining 2
              for post-lunch follow-up?
            </motion.div>

            <motion.div
              className="relative z-[1] flex items-center gap-2 rounded-[14px] px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.28)",
                color: "var(--vmx-ink-1, #1f1f1f)",
                fontSize: 13,
                fontWeight: 500,
                willChange: "transform, opacity",
              }}
              animate={{
                y: [0, -1.2, 0],
                opacity: [0.86, 0.98, 0.86],
              }}
              transition={{
                duration: 3.9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            >
              <span
                className="grid shrink-0 place-items-center rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  background: "var(--vmx-ink, #0a0a0a)",
                  color: "var(--vmx-lav-bright, #9d7af3)",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2 2 4-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span style={{ color: "rgba(0,0,0,0.6)" }}>Execution state:</span>
              <span>Replies drafted, queued, and tracked by thread priority.</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
