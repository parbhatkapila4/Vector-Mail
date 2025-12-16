"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroSectionHeight = 600;

      if (currentScrollY < heroSectionHeight) {
        setIsScrollingDown(false);
      } else {
        if (
          currentScrollY > lastScrollY &&
          currentScrollY > heroSectionHeight
        ) {
          setIsScrollingDown(true);
        } else if (currentScrollY < lastScrollY) {
          setIsScrollingDown(false);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="relative flex w-full items-center justify-center">
      <div
        className={`fixed inset-x-0 top-10 z-[100] mx-auto hidden max-w-2xl px-4 transition-all duration-300 ease-in-out lg:block ${
          isScrollingDown
            ? "-translate-y-[calc(100%+2.5rem)] opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <nav
          className="relative flex items-center justify-center space-x-4 rounded-full border border-purple-500/30 bg-black/90 px-8 py-6 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,0,50,0.9) 100%)",
          }}
        >
          <Link href="/features" className="px-4 py-2">
            <span className="text-base font-medium text-white transition-colors hover:text-purple-300">
              Features
            </span>
          </Link>

          <Link href="/pricing" className="px-4 py-2">
            <span className="text-base font-medium text-white transition-colors hover:text-purple-300">
              Pricing
            </span>
          </Link>

          {isSignedIn ? (
            <Link href="/mail" className="px-4 py-2">
              <span className="text-base font-medium text-white transition-colors hover:text-purple-300">
                Inbox
              </span>
            </Link>
          ) : (
            <Link href="/about" className="px-4 py-2">
              <span className="text-base font-medium text-white transition-colors hover:text-purple-300">
                About
              </span>
            </Link>
          )}

          {isSignedIn ? (
            <div className="flex items-center gap-3 px-4">
              <UserButton />
              <span className="text-base font-medium text-white">
                {user?.fullName || user?.firstName || "User"}
              </span>
            </div>
          ) : (
            <Link href="/sign-in">
              <button className="rounded-lg bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-6 py-2 text-base font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50">
                Login
              </button>
            </Link>
          )}
        </nav>
      </div>

      <div
        className={`fixed inset-x-0 top-0 z-[100] px-4 pt-4 transition-transform duration-300 ease-in-out lg:hidden ${
          isScrollingDown ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <nav
          className="relative rounded-2xl border border-purple-500/30 bg-black/90 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,0,50,0.9) 100%)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-lg font-bold text-white">VectorMail</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="space-y-2 border-t border-purple-500/20 px-4 pb-4 pt-4">
              <Link
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-center transition-colors hover:bg-white/10"
              >
                <span className="font-medium text-white">Features</span>
              </Link>

              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-center transition-colors hover:bg-white/10"
              >
                <span className="font-medium text-white">Pricing</span>
              </Link>

              {isSignedIn ? (
                <Link
                  href="/mail"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-center transition-colors hover:bg-white/10"
                >
                  <span className="font-medium text-white">Inbox</span>
                </Link>
              ) : (
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-center transition-colors hover:bg-white/10"
                >
                  <span className="font-medium text-white">About</span>
                </Link>
              )}

              {isSignedIn ? (
                <div className="flex items-center justify-center gap-3 px-4 py-3">
                  <UserButton />
                  <span className="text-base font-medium text-white">
                    {user?.fullName || user?.firstName || "User"}
                  </span>
                </div>
              ) : (
                <div className="pt-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full rounded-lg bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50">
                      Login
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
