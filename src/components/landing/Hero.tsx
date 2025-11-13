"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { EmailClientMockup } from "./EmailClientMockup";
import { AnimatedEmail3D } from "./AnimatedEmail3D";
import { LampContainer } from "../ui/lamp";
import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

export function Hero() {
  const { isSignedIn } = useUser();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isVideoOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isVideoOpen]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Static gradient orbs - no animation for performance */}
      <div
        className="pointer-events-none absolute left-5 top-20 h-[300px] w-[300px] rounded-full opacity-20 blur-3xl lg:left-10 lg:h-[600px] lg:w-[600px]"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)",
          willChange: "auto",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-20 right-5 h-[250px] w-[250px] rounded-full opacity-20 blur-3xl lg:right-10 lg:h-[500px] lg:w-[500px]"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
          willChange: "auto",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl lg:h-[700px] lg:w-[700px]"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 100%)",
          willChange: "auto",
        }}
      />

      {/* Simplified 3D Email in Background - static - hidden on mobile */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 hidden -translate-x-1/2 -translate-y-1/2 opacity-30 lg:block"
        style={{ zIndex: 0, willChange: "auto" }}
      >
        <AnimatedEmail3D />
      </div>

      {/* Lamp Effect */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="space-y-8"
        >
          {/* Main Headline with Lamp Effect */}
          <h1 className="px-4 text-center text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            <span className="text-white">AI Powered Email,</span>
            <br />
            <span className="text-white">Built to </span>
            <span
              className="inline-block bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))",
              }}
            >
              Save You Time
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-3xl px-4 text-center text-base text-gray-400 sm:text-lg md:text-xl lg:text-2xl">
            VectorMail is an AI-native email client that manages your inbox, so
            you don't have to.
          </p>

          <p className="px-4 text-center text-xs text-purple-300 sm:text-sm">
            100% Open Source • Production Grade • Modern Stack
          </p>

          {/* CTA */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 px-4 sm:flex-row">
            <Link
              href={isSignedIn ? "/mail" : "/sign-up"}
              className="w-full sm:w-auto"
            >
              <button className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-8 py-3 text-base font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 sm:w-auto sm:px-10 sm:py-4 sm:text-lg">
                <span className="relative z-10 text-white">
                  Get Started Free
                </span>
              </button>
            </Link>
            <button
              onClick={() => setIsVideoOpen(true)}
              className="w-full rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600/5 via-purple-400/5 to-amber-400/5 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 sm:w-auto sm:px-10 sm:py-4 sm:text-lg"
            >
              Watch Demo
            </button>
          </div>
        </motion.div>
      </LampContainer>

      <div
        className="relative mx-auto -mt-10 max-w-7xl px-4 sm:-mt-20 sm:px-6"
        style={{ zIndex: 10 }}
      >
        {/* Full Email Client Mockup - Hidden on mobile, shown on tablet+ */}
        <div className="relative mx-auto hidden max-w-[1400px] pb-20 md:block">
          {/* Static glow */}
          <div
            className="pointer-events-none absolute -inset-4 rounded-3xl opacity-30 blur-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(251, 191, 36, 0.3), rgba(168, 85, 247, 0.3))",
              willChange: "auto",
            }}
          />

          <EmailClientMockup />
        </div>

        {/* Mobile placeholder - simplified view */}
        <div className="relative mx-auto mt-8 pb-12 md:hidden">
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 to-black p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="text-sm font-semibold text-white">
                VectorMail Preview
              </div>
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400"></div>
            </div>
            <div className="space-y-2">
              <div className="h-12 rounded-lg border border-purple-500/20 bg-white/5"></div>
              <div className="h-12 rounded-lg border border-purple-500/20 bg-white/5"></div>
              <div className="h-12 rounded-lg border border-purple-500/20 bg-white/5"></div>
            </div>
            <p className="mt-4 text-center text-xs text-purple-300">
              View on desktop for better experience
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-purple-500/30 bg-black shadow-2xl"
            >
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-1 text-gray-300 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src="/Vector-Mail-1762579701087.mp4"
                controls
                autoPlay
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
