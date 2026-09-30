import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign-in interrupted · VectorMail",
  robots: { index: false, follow: false },
};
const REASONS: Record<string, { heading: string; body: string }> = {
  missing_cookie: {
    heading: "That sign-in attempt expired",
    body: "Google approved you, but the security check tying that approval to this browser is only valid for 10 minutes and it ran out first. Nothing is wrong with your account — starting again will work.",
  },
  missing_state: {
    heading: "We couldn't verify that sign-in",
    body: "The response coming back from Google was missing the token that proves it started here. That usually means the link was opened out of order. Starting again will work.",
  },
  mismatch: {
    heading: "We couldn't verify that sign-in",
    body: "The response coming back from Google didn't match the one this browser started, so we stopped it. If you began signing in more than once, use the most recent tab — or just start again here.",
  },
};

const FALLBACK = {
  heading: "We couldn't finish signing you in",
  body: "Something interrupted the handoff between Google and VectorMail before we could confirm it. Starting again usually clears it.",
};

export default function OAuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string | string[] };
}) {
  const raw = searchParams?.reason;
  const reason = Array.isArray(raw) ? raw[0] : raw;
  const copy =
    reason && Object.prototype.hasOwnProperty.call(REASONS, reason)
      ? REASONS[reason]!
      : FALLBACK;

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[#f7f3e9] px-4 py-10"
      style={{ fontFamily: "var(--vmx-sans)" }}
    >
      <div className="w-full max-w-[452px] overflow-hidden rounded-[18px] border border-[#e8e1d2] bg-[#fffdf7] shadow-[0_28px_70px_-16px_rgba(20,16,40,0.28)]">
        <div className="px-7 pt-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5d9b8] bg-[#f7efd8] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#8a6d2f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c79a3c]" />
            Early access
          </span>
          <h1 className="mt-3.5 text-[21px] font-bold leading-tight tracking-[-0.02em] text-[#0a0a0a]">
            {copy.heading}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#5f5848]">
            {copy.body}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 px-7 pb-7 pt-5">
          <Link
            href="/?signin=1"
            className="flex items-center justify-center gap-2.5 rounded-[13px] border border-[#1f1a33] bg-[#15122a] px-4 py-3.5 text-[14.5px] font-semibold text-white transition-colors duration-150 hover:bg-[#1d1838]"
          >
            <svg viewBox="0 0 18 18" className="h-[17px] w-[17px]" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC04" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.97 8.97 0 0 0 9 0 9 9 0 0 0 .96 4.96L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Try again with Google
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center rounded-[13px] border border-[#e8e1d2] bg-white px-4 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition-colors duration-150 hover:border-[#d9d0bd] hover:bg-[#fbf7ec]"
          >
            Back to home
          </Link>

          <p className="mt-1 text-center text-[12.5px] leading-snug text-[#7a7363]">
            Still stuck? Email{" "}
            <a
              href="mailto:parbhat@parbhat.dev?subject=VectorMail%20-%20sign-in%20trouble"
              className="font-medium text-[#6d4fd0] underline underline-offset-2"
            >
              parbhat@parbhat.dev
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
