"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function Navigation() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6 md:pt-4">
      <nav
        className={`mx-auto flex max-w-[1200px] items-center justify-between rounded-2xl transition-all duration-300 ease-out ${scrolled
            ? "h-14 border border-white/[0.06] bg-white/[0.03] px-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.4)] backdrop-blur-xl md:h-14 md:px-6"
            : "h-14 bg-transparent px-2 md:px-4"
          }`}
      >

        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]">
            <video
              src="/Vectormail-logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full scale-[1.4] object-cover"
            />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            VectorMail
          </span>
        </Link>


        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <div className="flex items-center gap-0.5 rounded-full border border-white/[0.04] bg-white/[0.02] p-0.5">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative rounded-full px-4 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
              >
                <span className="relative z-10">{item.label}</span>
                <span className="absolute inset-0 rounded-full bg-white/[0.06] opacity-0 transition-opacity hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>


        <div className="flex shrink-0 items-center gap-2">
          {isSignedIn ? (
            <>
              <Link
                href="/mail"
                className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black shadow-[0_0_20px_-4px_rgba(255,255,255,0.2)] transition-all hover:bg-zinc-100 hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.3)]"
              >
                Open Inbox
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] pl-1 pr-3 py-1">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{ elements: { footer: "hidden" } }}
                />
                <span className="text-[13px] font-medium text-zinc-300">
                  {user?.firstName || "User"}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black shadow-[0_0_20px_-4px_rgba(255,255,255,0.2)] transition-all hover:bg-zinc-100 hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.3)]"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-1 rounded-xl p-2.5 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>


      {mobileMenuOpen && (
        <div
          className="mt-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a]/95 shadow-xl backdrop-blur-xl md:hidden"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px -12px rgba(0,0,0,0.5)",
          }}
        >
          <div className="space-y-0.5 p-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-3 border-t border-white/[0.06]" />
            {isSignedIn ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/mail"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-[15px] font-semibold text-black"
                >
                  Open Inbox
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{ elements: { footer: "hidden" } }}
                  />
                  <span className="text-[15px] font-medium text-white">
                    {user?.fullName || user?.firstName || "User"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-center text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05]"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-[15px] font-semibold text-black"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
