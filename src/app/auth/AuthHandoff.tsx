"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MailShellSkeleton } from "@/components/mail/MailShellSkeleton";

export const HANDOFF_TIMEOUT_MS = 15_000;

export type HandoffFailure = {
  heading: string;
  body: string;
  detail?: string;
};
export function useHandoffTimeout(waiting: boolean) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(() => setTimedOut(true), HANDOFF_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [waiting]);

  return waiting && timedOut;
}

export function AuthHandoffLoading({ status }: { status: string }) {
  return (
    <>
      <div aria-hidden="true">
        <MailShellSkeleton />
      </div>
      <p
        role="status"
        className="pointer-events-none fixed inset-x-0 flex justify-center [bottom:max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <span className="flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[var(--ink-2)] shadow-[0_1px_2px_rgba(15,20,40,0.06)]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--ink-4)] motion-safe:animate-pulse"
          />
          {status}
        </span>
      </p>
    </>
  );
}
export function AuthHandoffFailure({ heading, body, detail }: HandoffFailure) {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[#f7f3e9] px-4 py-10"
      style={{ fontFamily: "var(--vmx-sans)" }}
    >
      <div
        role="alert"
        className="w-full max-w-[452px] overflow-hidden rounded-[18px] border border-[#e8e1d2] bg-[#fffdf7] shadow-[0_28px_70px_-16px_rgba(20,16,40,0.28)]"
      >
        <div className="px-7 pt-7">
          <h1 className="text-[21px] font-bold leading-tight tracking-[-0.02em] text-[#0a0a0a]">
            {heading}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#5f5848]">
            {body}
          </p>
          {detail && (
            <p className="mt-3 text-[12px] leading-snug text-[#7a7363]">
              {detail}
            </p>
          )}
        </div>

        <div className="px-7 pb-7 pt-5">
          <Link
            href="/"
            className="flex items-center justify-center rounded-[13px] border border-[#1f1a33] bg-[#15122a] px-4 py-3.5 text-[14.5px] font-semibold text-white transition-colors duration-150 hover:bg-[#1d1838]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
