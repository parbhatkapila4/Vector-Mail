"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Menu, X, ArrowRight } from "lucide-react";

export function Navigation() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? "border-b border-white/5 bg-[#030303]/80 backdrop-blur-2xl"
          : "bg-transparent"
        }`}
    >
      <div className="mx-auto max-w-[1400px] px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="ml-[72px] flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
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

          <div className="hidden items-center gap-[304px] md:flex">
            <div className="flex items-center gap-1">
              {[
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/about" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <Link
                    href="/mail"
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black transition-all hover:bg-zinc-200"
                  >
                    Open Inbox
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
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
                    className="px-4 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black transition-all hover:bg-zinc-200"
                  >
                    Get started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/5 bg-[#030303]/95 backdrop-blur-2xl md:hidden">
          <div className="space-y-1 px-6 py-4">
            {[
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-white/5 pt-4">
              {isSignedIn ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/mail"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-[15px] font-semibold text-black"
                  >
                    Open Inbox
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-2">
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
                    className="block rounded-lg px-4 py-3 text-center text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/5"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-[15px] font-semibold text-black"
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
