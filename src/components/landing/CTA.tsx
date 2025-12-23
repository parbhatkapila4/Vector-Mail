"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Mail, Check } from "lucide-react";

export function CTA() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative py-32">
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="relative">
          <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 opacity-20 blur-2xl" />

          <div className="relative rounded-[2.5rem] border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-1 backdrop-blur-2xl">
            <div className="rounded-[2.25rem] bg-gradient-to-b from-[#0a0a0a] to-[#050505] px-8 py-16 text-center md:px-16 md:py-20">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-5 py-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-300">
                  Start free, no credit card
                </span>
              </div>

              <h2 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                <span className="text-white">Ready to reclaim</span>
                <br />
                <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                  your time?
                </span>
              </h2>

              <p className="mx-auto mb-10 max-w-2xl text-xl text-zinc-400">
                Join thousands of professionals who&apos;ve already transformed
                their inbox. Free forever plan available.
              </p>

              <div className="mb-12 flex flex-wrap items-center justify-center gap-6">
                {[
                  "Free forever plan",
                  "No credit card required",
                  "2-minute setup",
                  "Cancel anytime",
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-2 text-zinc-400"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20">
                      <Check className="h-3 w-3 text-amber-400" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                href={isSignedIn ? "/mail" : "/sign-up"}
                className="group relative inline-flex"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-70 blur-lg transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-10 py-5 text-lg font-semibold text-black transition-all hover:shadow-2xl hover:shadow-amber-500/30">
                  <Mail className="h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <p className="mt-8 text-sm text-zinc-500">
                Questions?{" "}
                <a
                  href="mailto:parbhat@parbhat.dev"
                  className="text-amber-400 underline underline-offset-4 hover:text-amber-300"
                >
                  parbhat@parbhat.dev
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
