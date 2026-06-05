"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Send, LogIn, ArrowRight } from "lucide-react";

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
            {signingIn ? "Signing you in" : "Choose how to continue"}
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#5f5848]">
            {signingIn
              ? "Hang tight — we're opening Google's secure sign-in."
              : "VectorMail is invite-only while we onboard teams one at a time. Request access, or sign in if you've already been approved."}
          </p>
        </div>

        {signingIn ? (
          <div className="px-7 pb-7 pt-4" aria-live="polite">
            <div className="flex items-center gap-4 rounded-[14px] border border-[#ece5d6] bg-[#fffdf7] px-5 py-[18px]">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center">
                <svg
                  className="absolute inset-0 h-11 w-11 animate-spin [animation-duration:0.9s]"
                  viewBox="0 0 44 44"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="22" cy="22" r="19" stroke="#ece1cc" strokeWidth="2.5" />
                  <path
                    d="M41 22a19 19 0 0 0-19-19"
                    stroke="#9d7af3"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                <svg viewBox="0 0 18 18" className="h-[17px] w-[17px]" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
                  <path fill="#FBBC04" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.97 8.97 0 0 0 9 0 9 9 0 0 0 .96 4.96L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                  Opening secure sign-in
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-[#7a7363]">
                  Redirecting you to Google to finish — one moment.
                </span>
              </div>
            </div>
            <div className="relative mt-3.5 h-[3px] w-full overflow-hidden rounded-full bg-[#efe9da]">
              <span className="absolute inset-y-0 left-0 w-[28%] rounded-full bg-gradient-to-r from-[#b9a3f7] via-[#9d7af3] to-[#6d4fd0] [animation:vmx-loadbar_1.15s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 px-7 pb-7 pt-5">
            <a
              href={REQUEST_ACCESS_MAILTO}
              onClick={() => onOpenChange(false)}
              className="group flex items-center gap-3.5 rounded-[13px] border border-[#1f1a33] bg-[#15122a] px-4 py-3.5 text-left transition-all duration-150 hover:-translate-y-px hover:bg-[#1d1838] hover:shadow-[0_10px_24px_-10px_rgba(20,16,40,0.6)]"
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
              className="group flex items-center gap-3.5 rounded-[13px] border border-[#e8e1d2] bg-white px-4 py-3.5 text-left transition-all duration-150 hover:-translate-y-px hover:border-[#d9d0bd] hover:bg-[#fbf7ec] hover:shadow-[0_10px_24px_-12px_rgba(20,16,40,0.25)]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#f0ead9] text-[#5f5848]">
                <LogIn className="h-[17px] w-[17px]" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold text-[#0a0a0a]">
                  Sign in anyway
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-[#7a7363]">
                  Already approved? Continue with your Google account.
                </span>
              </span>
              <ArrowRight className="h-[18px] w-[18px] shrink-0 text-[#a39b88] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#0a0a0a]" />
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
