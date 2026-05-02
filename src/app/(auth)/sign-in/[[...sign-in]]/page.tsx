'use client';

import { useSignIn } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/types";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useState } from "react";
import styles from "./page.module.css";

export default function Page() {
  const { signIn, isLoaded } = useSignIn();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [email, setEmail] = useState("");
  const [previewDone, setPreviewDone] = useState<Record<string, boolean>>({
    sequoia: false,
    design: false,
    q4sync: true,
  });

  const handleSignInWithOAuth = async (strategy: OAuthStrategy) => {
    if (!signIn || !isLoaded) return;
    setIsRedirecting(true);
    try {
      const base = process.env.NEXT_PUBLIC_URL || (typeof window !== "undefined" ? window.location.origin : "");
      const redirectUrl = base ? `${base.replace(/\/$/, "")}/sign-in/sso-callback` : "/sign-in/sso-callback";
      const redirectUrlComplete = base ? `${base.replace(/\/$/, "")}/mail` : "/mail";
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete,
      });
    } catch {
      setIsRedirecting(false);
    }
  };

  const previewItems = [
    { id: "sequoia", label: "Reply to Sequoia - confirm Tuesday call", pill: "Now" },
    { id: "design", label: "Approve design v3 - merge or hold?", pill: "Soon" },
    { id: "q4sync", label: "Confirm Q4 sync moved to Thursday", pill: "Done" },
  ] as const;

  return (
    <div className={`auth-wrap ${styles.scope}`}>
      <div className="auth-left">
        <Link href="/" className="auth-brand">
          <span className="auth-brand-mark" aria-hidden>
            <svg viewBox="0 0 30 30" fill="none">
              <rect x="3" y="6" width="24" height="18" rx="3" fill="var(--ink-light)" />
              <g stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 11l3 4-3 4" />
                <path d="M13 11l3 4-3 4" />
                <path d="M19 11l3 4-3 4" />
              </g>
            </svg>
          </span>
          VectorMail
        </Link>

        <div className="auth-center">
          <h1 className="auth-h1">
            Create your <span className="it">VectorMail</span> account
          </h1>
          <p className="auth-sub">
            Connect Gmail, prioritize important threads, and draft replies in
            your voice.
          </p>

          <div className="auth-card">
            <button
              type="button"
              onClick={() => handleSignInWithOAuth("oauth_google")}
              disabled={!isLoaded || isRedirecting}
              className="sso-btn"
            >
              {isRedirecting ? (
                <>
                  <span className="spinner" />
                  Redirecting...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 009 18z" />
                    <path fill="#FBBC04" d="M3.97 10.71A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3.01-2.33z" />
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.97 8.97 0 009 0 9 9 0 00.96 4.96L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <button
              type="button"
              className="sso-btn"
              onClick={() => handleSignInWithOAuth("oauth_apple")}
              disabled={!isLoaded || isRedirecting}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.06 12.6c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.11-4.58 1.11-.95 0-2.42-1.08-3.98-1.05-2.05.03-3.94 1.2-4.99 3.03-2.13 3.69-.54 9.15 1.53 12.14 1.01 1.46 2.21 3.09 3.78 3.03 1.5-.06 2.06-.97 3.87-.97 1.81 0 2.31.97 3.9.94 1.61-.03 2.63-1.46 3.63-2.93 1.16-1.69 1.64-3.33 1.67-3.42-.04-.01-3.2-1.23-3.23-4.97z" />
                <path d="M14.19 3.82c.84-1.02 1.4-2.43 1.24-3.82-1.21.05-2.68.81-3.55 1.83-.78.91-1.47 2.37-1.28 3.76 1.35.1 2.75-.69 3.59-1.77z" />
              </svg>
              {isRedirecting ? "Redirecting..." : "Continue with Apple"}
            </button>

            <button type="button" className="sso-btn" disabled>
              <svg
                className="outlook-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M9.5 5.5h10a1 1 0 011 1v11a1 1 0 01-1 1h-10z"
                  fill="#0078D4"
                />
                <path
                  d="M9.5 8.4l5 3.8 5-3.8"
                  stroke="#CFE8FF"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="3" y="6.2" width="8.8" height="11.6" rx="1.5" fill="#106EBE" />
                <path
                  d="M7.4 14.6c1.33 0 2.2-1 2.2-2.5 0-1.5-.88-2.48-2.22-2.48-1.32 0-2.2.98-2.2 2.48 0 1.51.87 2.5 2.22 2.5z"
                  fill="#fff"
                />
              </svg>
              Continue with Outlook
              <span className="soon-pill">Coming soon</span>
            </button>

            <div className="divider">or with email</div>

            <div className="input-group">
              <label className="input-label" htmlFor="email-input">Work email</label>
              <div className="input-field">
                <input
                  id="email-input"
                  type="email"
                  placeholder="parbhat@parbhat.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                />
                <span className="input-field-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="12" height="10" rx="1.5" />
                    <path d="M2 4l6 5 6-5" />
                  </svg>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="auth-submit"
              disabled
            >
              Introducing soon
              <span className="arrow-pill">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 6h6M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </button>

            <div className="card-foot-divider" />

            <p className="terms">
              By creating an account, you agree to our <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>

        </div>

      </div>

      <div className="auth-right">
        <div className="right-content">
          <div className="preview-eyebrow">
            <span className="preview-eyebrow-dot" />
            WHAT YOU'RE SIGNING UP FOR
          </div>

          <h2 className="preview-h">
            Your morning brief,
            <br />
            <span className="preview-h-it">already written</span>.
          </h2>

          <div className="preview-card">
            <div className="preview-card-head">
              <div className="preview-card-title">
                <span className="preview-ai-icon" />
                BRIEF - MONDAY 8:42 AM
              </div>
              <div className="preview-card-meta">
                <span className="preview-pulse" />
                generated 2m ago
              </div>
            </div>

            <div className="preview-card-body">
              <p className="preview-summary">
                <span className="preview-hl">47 threads</span> overnight.{" "}
                <span className="preview-hl-strong">3 need you today</span>, the rest can wait.
              </p>

              <div className="preview-actions">
                {previewItems.map((item) => {
                  const done = previewDone[item.id];
                  const pillClass =
                    item.pill === "Soon"
                      ? "preview-action-pill amber"
                      : item.pill === "Done"
                        ? "preview-action-pill green"
                        : "preview-action-pill";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`preview-action ${done ? "done" : ""}`}
                      onClick={() =>
                        setPreviewDone((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                    >
                      <span className="preview-checkbox" />
                      <span className="preview-action-text">{item.label}</span>
                      <span className={pillClass}>{item.pill}</span>
                    </button>
                  );
                })}
              </div>

              <div className="preview-card-foot">
                <div className="preview-stat">
                  <span className="preview-stat-num">42m</span>
                  <span className="preview-stat-label">saved today</span>
                </div>
                <div className="preview-stat">
                  <span className="preview-stat-num">128</span>
                  <span className="preview-stat-label">auto-archived</span>
                </div>
                <div className="preview-stat">
                  <span className="preview-stat-num">7</span>
                  <span className="preview-stat-label">drafted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="trust-strip">
            <div className="trust-strip-label">Built in public</div>
            <div className="trust-logos">
              <span className="trust-logo">github.com/vectormail</span>
              <span className="trust-logo-sep">·</span>
              <span className="trust-logo">v2.4 shipped this week</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
