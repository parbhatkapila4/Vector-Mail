"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMailNavigation } from "@/components/mail-navigation-loader";

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

export function FinalCTA() {
  const { isSignedIn } = useUser();
  const { navigateToMail } = useMailNavigation();

  const onGetStarted = () => {
    if (isSignedIn) navigateToMail();
    else window.location.href = "/sign-up";
  };

  return (
    <div className="relative overflow-hidden px-5 pb-[100px] pt-[140px] text-center md:px-8">
      <h2
        className="mx-auto mb-12 max-w-[900px]"
        style={{
          fontSize: "clamp(48px, 6.4vw, 80px)",
          fontWeight: 600,
          letterSpacing: "-0.045em",
          lineHeight: 1.05,
          color: "var(--vmx-ink, #0a0a0a)",
          fontFamily: "var(--vmx-sans)",
        }}
      >
        Give your inbox a memory
        <br />
        and{" "}
        <span
          className="vmx-glitch"
          data-text="a personality"
          style={{
            fontFamily: "var(--vmx-serif)",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          a personality
        </span>
      </h2>
      <div className="relative z-[1] inline-flex flex-wrap justify-center gap-3">
        {!isSignedIn && (
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2.5 rounded-[8px] py-3 pl-[18px] pr-[14px] text-[14.5px] font-medium text-white"
            style={{
              background: "var(--vmx-ink, #0a0a0a)",
              fontFamily: "var(--vmx-sans)",
            }}
          >
            Get Started
            <ArrowPill />
          </button>
        )}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-[8px] px-[22px] py-3 text-[14.5px] font-medium transition-colors"
          style={{
            background: "var(--vmx-ink, #0a0a0a)",
            color: "white",
            border: "1px solid var(--vmx-ink, #0a0a0a)",
            fontFamily: "var(--vmx-sans)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#2c2b27";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--vmx-ink, #0a0a0a)";
          }}
        >
          See Pricing
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 6h6M6 3l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
