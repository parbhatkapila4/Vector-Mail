"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-slate-800 bg-[#0a0a0a]/95 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg shadow-lg"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <video
                src="/Vectormail-logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full scale-[1.35] object-cover"
              />
            </motion.div>
            <span className="text-xl font-black text-white">VectorMail</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/features"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            {isSignedIn ? (
              <Link
                href="/mail"
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                Inbox
              </Link>
            ) : (
              <Link
                href="/about"
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                About
              </Link>
            )}
            {isSignedIn ? (
              <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2">
                <UserButton />
                <span className="text-sm font-medium text-white">
                  {user?.fullName || user?.firstName || "User"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-white transition-colors hover:bg-slate-800 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 bg-[#0a0a0a]/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 pb-6 pt-4">
              <Link
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Pricing
              </Link>
              {isSignedIn ? (
                <Link
                  href="/mail"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Inbox
                </Link>
              ) : (
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  About
                </Link>
              )}
              <div className="border-t border-slate-800 pt-4">
                {isSignedIn ? (
                  <div className="flex items-center gap-3 px-4 py-2">
                    <UserButton />
                    <span className="text-base font-medium text-white">
                      {user?.fullName || user?.firstName || "User"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-4 py-3 text-center text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 text-center text-base font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/50"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
