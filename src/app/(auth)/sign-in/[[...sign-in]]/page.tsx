'use client';

import { useSignIn } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/types";
import Link from "next/link";
import { Search, Inbox, Zap, Mail, Shield, Lock, Gift } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const { signIn, isLoaded } = useSignIn();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSignInWithGoogle = async () => {
    if (!signIn || !isLoaded) return;
    setIsRedirecting(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google" as OAuthStrategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/auth/set-session",
      });
    } catch {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)
          `,
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />

      <div
        className="pointer-events-none absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      />
      <div
        className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"
        style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"
        style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[480px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-8 animate-fade-in">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-white/95 transition-all duration-200 hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
        >
          <div className="rounded-lg bg-white/15 p-1.5 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/25">
            <Mail className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">VectorMail</span>
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/15 hover:text-white"
        >
          Back to home
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="sign-in-card relative overflow-hidden rounded-2xl border border-white/25 bg-white/[0.12] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-10">
            <div
              className="absolute left-0 right-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
            />

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                <Gift className="h-3.5 w-3.5 text-amber-200" />
                Free forever · No credit card
              </div>

              <div className="mail-icon-wrap mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg animate-float">
                <Mail className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>

              <h1 className="bg-gradient-to-b from-white to-white/85 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-sm sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-3 max-w-sm text-center text-[15px] leading-relaxed text-white/85">
                Sign in with your Google account to open your inbox. One click - you're in.
              </p>

              <button
                type="button"
                onClick={handleSignInWithGoogle}
                disabled={!isLoaded || isRedirecting}
                className="google-btn mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-[15px] font-semibold text-gray-800 shadow-lg shadow-black/10 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/15 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
              >
                {isRedirecting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
                    Redirecting…
                  </span>
                ) : (
                  <>
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center gap-2 text-white/70">
                <Shield className="h-4 w-4 shrink-0 text-white/60" />
                <span className="text-[13px]">Secure sign-in with Google. We never see your password.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: Search, label: "AI search", delay: 0 },
              { icon: Inbox, label: "Smart inbox", delay: 1 },
              { icon: Zap, label: "Instant replies", delay: 2 },
            ].map(({ icon: Icon, label, delay }) => (
              <div
                key={label}
                className="feature-pill flex flex-col items-center gap-2.5 rounded-xl border border-white/20 bg-white/[0.07] px-4 py-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:shadow-lg hover:shadow-black/10"
                style={{ animationDelay: `${0.25 + delay * 0.1}s` }}
              >
                <Icon className="h-5 w-5 text-white/95" strokeWidth={2} />
                <span className="text-[13px] font-medium text-white/95">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-5 text-[13px] text-white/60 animate-fade-in">
        <Link href="/privacy" className="hover:text-white/90 transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-white/90 transition-colors">Terms</Link>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          Your data stays in your Google account
        </span>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
          opacity: 0;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .feature-pill {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
