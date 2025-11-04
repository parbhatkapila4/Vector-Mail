"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Sparkles, ArrowRight } from "lucide-react";

export function CTA() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative overflow-hidden bg-black py-20 sm:py-32 lg:py-40">
      {/* Static background gradients */}
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full opacity-20 blur-3xl lg:h-[500px] lg:w-[500px]"
        style={{
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
          willChange: "auto",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full opacity-20 blur-3xl lg:h-[600px] lg:w-[600px]"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
          willChange: "auto",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Simplified Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-amber-500 shadow-lg shadow-purple-500/50">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="mb-4 text-3xl font-black leading-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-white">Help Us Build the</span>
            <br />
            <span
              className="inline-block bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))",
              }}
            >
              Future of Email
            </span>
          </h2>

          <p className="mx-auto mb-4 max-w-2xl text-base text-gray-400 sm:text-lg md:text-xl lg:text-2xl">
            VectorMail is open source and built by developers, for developers.
            Join our community and help shape the next generation of email.
          </p>
          <p className="mb-12 text-xs text-gray-500 sm:mb-16 sm:text-sm">
            Open Source • Production Grade • Built with Modern Stack
          </p>

          <div className="mt-8">
            <Link
              href="https://github.com/parbhatkapila4/Vector-Mail"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto"
            >
              <button className="group relative mx-auto flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-8 py-4 text-base font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 sm:w-auto sm:px-12 sm:py-5 sm:text-lg">
                <span className="text-white">Contribute on GitHub</span>
                <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
