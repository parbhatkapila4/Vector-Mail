"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { X, Send, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";

const WAITLIST_URL = "/api/waitlist";
const ACCESS_CHECK_URL = "/api/auth/access-check";
type View = "waitlist" | "signin" | "notApproved" | "joined";

interface SignInChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: "waitlist" | "signin";
}

export function SignInChoiceModal({
  open,
  onOpenChange,
  initialView = "waitlist",
}: SignInChoiceModalProps) {
  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState("");
  const [inboxAnswer, setInboxAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const locked = busy || signingIn;

  const reset = useCallback(() => {
    setView(initialView);
    setEmail("");
    setInboxAnswer("");
    setBusy(false);
    setError(null);
    setSigningIn(false);
  }, [initialView]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !locked) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange, locked]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);
  useEffect(() => {
    if (open) setView(initialView);
  }, [open, initialView]);
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setSigningIn(false);
        setBusy(false);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function readMessage(res: Response): Promise<string> {
    const data = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    return data?.message ?? "Something went wrong. Please try again.";
  }

  const submitWaitlist = async (e: FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(WAITLIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, inboxAnswer }),
      });
      if (res.status === 429) {
        setError("Too many requests. Give it a minute and try again.");
        return;
      }
      if (!res.ok) {
        setError(await readMessage(res));
        return;
      }
      setView("joined");
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const submitSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(ACCESS_CHECK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError("Too many attempts. Give it a minute and try again.");
        return;
      }
      if (!res.ok) {
        setError(await readMessage(res));
        return;
      }
      const data = (await res.json()) as {
        approved: boolean;
        redirectTo?: string;
      };
      if (data.approved && data.redirectTo) {
        setSigningIn(true);
        window.location.assign(data.redirectTo);
        return;
      }
      setView("notApproved");
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  const heading = signingIn
    ? "Signing you in"
    : view === "joined"
      ? "You are on the list"
      : view === "notApproved"
        ? "Not approved yet"
        : view === "signin"
          ? "Sign in"
          : "Get early access";

  const subheading = signingIn
    ? "Hang tight - we're opening Google's secure sign-in."
    : view === "joined"
      ? "We'll email you as soon as a spot opens up. Approvals go out by hand, a few at a time."
      : view === "notApproved"
        ? "That address isn't approved for sign-in yet. Join the waitlist below and we'll email you once it is."
        : view === "signin"
          ? "Enter the email you were approved with. We'll check it before sending you to Google."
          : "VectorMail is in early access and we approve people by hand, a few at a time. Request a spot and we'll be in touch.";

  const emailField = (autoFocus: boolean) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold tracking-[-0.01em] text-[#5f5848]">
        Email
      </span>
      <input
        type="email"
        required
        autoFocus={autoFocus}
        autoComplete="email"
        value={email}
        disabled={locked}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-[11px] border border-[#e8e1d2] bg-white px-3.5 py-2.5 text-[14px] text-[#0a0a0a] outline-none transition-colors placeholder:text-[#a39b88] focus:border-[#9d7af3] disabled:opacity-60"
      />
    </label>
  );

  const errorLine = error ? (
    <p role="alert" className="text-[12.5px] text-[#b4472f]">
      {error}
    </p>
  ) : null;

  const waitlistForm = (
    <form onSubmit={submitWaitlist} className="flex flex-col gap-3">
      {emailField(view === "notApproved" ? false : true)}

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-semibold tracking-[-0.01em] text-[#5f5848]">
          What is your inbox situation?
        </span>
        <textarea
          rows={3}
          maxLength={1000}
          value={inboxAnswer}
          disabled={locked}
          onChange={(e) => setInboxAnswer(e.target.value)}
          placeholder="Roughly how much email do you get, and which part actually costs you time?"
          className="w-full resize-none rounded-[11px] border border-[#e8e1d2] bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#0a0a0a] outline-none transition-colors placeholder:text-[#a39b88] focus:border-[#9d7af3] disabled:opacity-60"
        />
      </label>

      {errorLine}

      <button
        type="submit"
        disabled={locked}
        className="mt-0.5 flex items-center justify-center gap-2 rounded-[13px] border border-[#1f1a33] bg-[#15122a] px-4 py-3 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-[#1d1838] hover:shadow-[0_10px_24px_-10px_rgba(20,16,40,0.6)] disabled:pointer-events-none disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-[17px] w-[17px] animate-spin" />
        ) : (
          <Send className="h-[16px] w-[16px]" strokeWidth={2} />
        )}
        {busy ? "Sending" : "Join the waitlist"}
      </button>
    </form>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-choice-title"
      style={{ fontFamily: "var(--vmx-sans)" }}
    >
      <div
        className="animate-in fade-in-0 absolute inset-0 bg-[#14102a]/45 backdrop-blur-[3px] duration-150"
        onClick={() => {
          if (!locked) onOpenChange(false);
        }}
      />

      <div className="animate-in fade-in-0 zoom-in-95 relative w-full max-w-[452px] overflow-hidden rounded-[18px] border border-[#e8e1d2] bg-[#fffdf7] shadow-[0_28px_70px_-16px_rgba(20,16,40,0.45)] duration-200">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={locked}
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
            {heading}
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#5f5848]">
            {subheading}
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
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    stroke="#ece1cc"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M41 22a19 19 0 0 0-19-19"
                    stroke="#9d7af3"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                <svg
                  viewBox="0 0 18 18"
                  className="h-[17px] w-[17px]"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.97 8.97 0 0 0 9 0 9 9 0 0 0 .96 4.96L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z"
                  />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                  Opening secure sign-in
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-[#7a7363]">
                  Redirecting you to Google to finish - one moment.
                </span>
              </div>
            </div>
            <div className="relative mt-3.5 h-[3px] w-full overflow-hidden rounded-full bg-[#efe9da]">
              <span className="absolute inset-y-0 left-0 w-[28%] rounded-full bg-gradient-to-r from-[#b9a3f7] via-[#9d7af3] to-[#6d4fd0] [animation:vmx-loadbar_1.15s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : view === "joined" ? (
          <div className="px-7 pb-7 pt-5">
            <div className="flex items-center gap-3.5 rounded-[14px] border border-[#d8ead9] bg-[#f3faf3] px-5 py-[18px]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#3f9a52] text-white">
                <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-[#33603a]">
                Request received for{" "}
                <span className="break-all font-semibold">{email}</span>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-3.5 w-full rounded-[13px] border border-[#e8e1d2] bg-white px-4 py-3 text-[14px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#fbf7ec]"
            >
              Done
            </button>
          </div>
        ) : view === "signin" ? (
          <div className="px-7 pb-7 pt-5">
            <form onSubmit={submitSignIn} className="flex flex-col gap-3">
              {emailField(true)}
              {errorLine}
              <button
                type="submit"
                disabled={locked}
                className="group flex items-center justify-center gap-2 rounded-[13px] border border-[#1f1a33] bg-[#15122a] px-4 py-3 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-[#1d1838] disabled:pointer-events-none disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-[17px] w-[17px] animate-spin" />
                ) : null}
                {busy ? "Checking" : "Continue"}
                {!busy ? (
                  <ArrowRight className="h-[17px] w-[17px] transition-transform duration-150 group-hover:translate-x-0.5" />
                ) : null}
              </button>
            </form>

            <button
              type="button"
              disabled={locked}
              onClick={() => {
                setError(null);
                setView("waitlist");
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#7a7363] underline-offset-2 transition-colors hover:text-[#0a0a0a] hover:underline disabled:pointer-events-none disabled:opacity-60"
            >
              <ArrowLeft className="h-[14px] w-[14px]" />
              Back to the waitlist
            </button>
          </div>
        ) : (
          <div className="px-7 pb-7 pt-5">
            {waitlistForm}

            {view === "waitlist" ? (
              <p className="mt-4 text-center text-[12.5px] text-[#7a7363]">
                Already approved?{" "}
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setError(null);
                    setView("signin");
                  }}
                  className="font-semibold text-[#5f4bb0] underline-offset-2 transition-colors hover:text-[#0a0a0a] hover:underline disabled:pointer-events-none disabled:opacity-60"
                >
                  Sign in
                </button>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
