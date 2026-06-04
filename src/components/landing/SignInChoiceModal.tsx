"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Send, LogIn, ArrowRight, Loader2 } from "lucide-react";

const REQUEST_ACCESS_EMAIL_BODY = `Hi Parbhat,

I'd like to request access to VectorMail to connect my Gmail account.

A few details to help with allowlisting:

  · Name:
  · Company / role:
  · Gmail address you'd like added:
  · How you intend to use VectorMail:

Please let me know what additional information you need and the expected timeline for onboarding.

Best regards,`;

const REQUEST_ACCESS_MAILTO = `mailto:parbhat@parbhat.dev?subject=${encodeURIComponent(
  "VectorMail - Request access",
)}&body=${encodeURIComponent(REQUEST_ACCESS_EMAIL_BODY)}`;

interface SignInChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInChoiceModal({ open, onOpenChange }: SignInChoiceModalProps) {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !signingIn) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange, signingIn]);

  useEffect(() => {
    if (open) router.prefetch("/sign-in");
  }, [open, router]);

  useEffect(() => {
    if (!open) setSigningIn(false);
  }, [open]);

  const handleSignIn = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (signingIn) return;
    setSigningIn(true);
    router.push("/sign-in");
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-choice-title"
      style={{ fontFamily: "var(--vmx-sans)" }}
    >
      <div
        className="absolute inset-0 bg-[#14102a]/45 backdrop-blur-[3px] animate-in fade-in-0 duration-150"
        onClick={() => {
          if (!signingIn) onOpenChange(false);
        }}
      />

      <div className="relative w-full max-w-[452px] overflow-hidden rounded-[18px] border border-[#e8e1d2] bg-[#fffdf7] shadow-[0_28px_70px_-16px_rgba(20,16,40,0.45)] animate-in fade-in-0 zoom-in-95 duration-200">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={signingIn}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full text-[#8a8372] transition-colors hover:bg-[#f0ead9] hover:text-[#0a0a0a] disabled:pointer-events-none disabled:opacity-0"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <div className="px-7 pt-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5d9b8] bg-[#f7efd8] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#8a6d2f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c79a3c]" />
            Early access
          </span>
          <h2
            id="signin-choice-title"
            className="mt-3.5 text-[21px] font-bold leading-tight tracking-[-0.02em] text-[#0a0a0a]"
          >
            Choose how to continue
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#5f5848]">
            VectorMail is invite-only while we onboard teams one at a time.
            Request access, or sign in if you&apos;ve already been approved.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 px-7 pb-7 pt-5">
          <a
            href={REQUEST_ACCESS_MAILTO}
            onClick={() => onOpenChange(false)}
            aria-hidden={signingIn}
            tabIndex={signingIn ? -1 : undefined}
            className={`group flex items-center gap-3.5 rounded-[13px] border border-[#1f1a33] bg-[#15122a] px-4 py-3.5 text-left transition-all duration-150 hover:-translate-y-px hover:bg-[#1d1838] hover:shadow-[0_10px_24px_-10px_rgba(20,16,40,0.6)] ${signingIn ? "pointer-events-none opacity-40" : ""
              }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#9d7af3] text-[#15122a]">
              <Send className="h-[17px] w-[17px]" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-white">
                Request access
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-[#b8b2cc]">
                Tell us about your inbox - we reply within a business day.
              </span>
            </span>
            <ArrowRight className="h-[18px] w-[18px] shrink-0 text-[#9d7af3] transition-transform duration-150 group-hover:translate-x-0.5" />
          </a>

          <Link
            href="/sign-in"
            onClick={handleSignIn}
            aria-busy={signingIn}
            aria-disabled={signingIn}
            className={`group flex items-center gap-3.5 rounded-[13px] border px-4 py-3.5 text-left transition-all duration-150 ${signingIn
              ? "cursor-wait border-[#d9d0bd] bg-[#fbf7ec]"
              : "border-[#e8e1d2] bg-white hover:-translate-y-px hover:border-[#d9d0bd] hover:bg-[#fbf7ec] hover:shadow-[0_10px_24px_-12px_rgba(20,16,40,0.25)]"
              }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] transition-colors duration-150 ${signingIn ? "bg-[#15122a] text-white" : "bg-[#f0ead9] text-[#5f5848]"
                }`}
            >
              {signingIn ? (
                <Loader2 className="h-[17px] w-[17px] animate-spin" strokeWidth={2} />
              ) : (
                <LogIn className="h-[17px] w-[17px]" strokeWidth={2} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-[#0a0a0a]">
                {signingIn ? "Opening secure sign-in" : "Sign in anyway"}
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-[#7a7363]">
                {signingIn
                  ? "Loading your Google sign-in…"
                  : "Already approved? Continue with your Google account."}
              </span>
            </span>
            {signingIn ? (
              <span className="flex shrink-0 items-center gap-[3px] pr-0.5" aria-hidden="true">
                <span className="h-1 w-1 animate-pulse rounded-full bg-[#9d7af3] [animation-delay:0ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-[#9d7af3] [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-[#9d7af3] [animation-delay:300ms]" />
              </span>
            ) : (
              <ArrowRight className="h-[18px] w-[18px] shrink-0 text-[#a39b88] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#0a0a0a]" />
            )}
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
