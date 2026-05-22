"use client";

import { HeroWaveBackground } from "./HeroWaveBackground";
import { HeroInboxMockup } from "./HeroInboxMockup";

const ARROW_PATH = "M3 6h6M6 3l3 3-3 3";

function HeroPhrase({ children }: { children: React.ReactNode }) {
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
      {children}
    </span>
  );
}

const SERIF = "var(--font-newsreader), Georgia, serif";
const MONO = "var(--font-jetbrains-mono), ui-monospace, monospace";

const PAPER = "#fbf8f1";
const PAPER_DEEP = "#f4ede0";
const INK = "#1a1612";
const INK_2 = "#5b554c";
const INK_3 = "#8a8278";
const LINE = "#d8cfb9";
const LAV = "#5b4cf7";
const LAV_DEEP = "#3d2fb8";

function Sparkle({ size = 12, color = LAV }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M6 1l1.3 3.4 3.4 1.3-3.4 1.3L6 10.4 4.7 7l-3.4-1.3L4.7 4.4 6 1z"
        fill={color}
      />
    </svg>
  );
}

function MarginRule() {
  return (
    <div
      className="my-4 flex items-center justify-center"
      aria-hidden
      style={{ height: 8 }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: LINE,
        }}
      />
      <span
        style={{
          margin: "0 6px",
          width: 4,
          height: 4,
          borderRadius: 999,
          background: LINE,
        }}
      />
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: LINE,
        }}
      />
    </div>
  );
}

function AsideLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-2.5 flex items-center gap-1.5"
      style={{
        fontFamily: MONO,
        fontSize: 9.5,
        color: LAV_DEEP,
        fontWeight: 700,
        letterSpacing: "0.16em",
      }}
    >
      <Sparkle size={9} />
      {children}
    </div>
  );
}

export function HeroLight() {
  const onPrimaryCta = () => {
    window.location.href = "/api/demo/enter";
  };

  return (
    <section className="hero-bg-wrap relative">
      <HeroWaveBackground />
      <div className="hero-content vm-hero-content relative z-[3]">
        <div className="relative px-5 pb-[100px] pt-20 text-center md:px-8">
          <div className="relative mx-auto max-w-[1280px]">
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
              <HeroPhrase>read itself.</HeroPhrase>
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
          </div>

          <div className="relative mx-auto max-w-[1480px]">
            <HeroInboxMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
