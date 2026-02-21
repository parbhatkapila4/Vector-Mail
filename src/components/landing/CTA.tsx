"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Zap, Shield, Clock, XCircle } from "lucide-react";

const BENEFITS = [
  { label: "Free forever plan", icon: Zap },
  { label: "No credit card required", icon: Shield },
  { label: "2-minute setup", icon: Clock },
  { label: "Cancel anytime", icon: XCircle },
];

export function CTA() {
  return (
    <section className="relative bg-[#0a0a0a] py-28 md:py-36 overflow-hidden">

      <div className="absolute inset-0 bg-[#0a0a0a]" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr,minmax(400px,0.5fr)] lg:gap-20 items-center">

          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm font-medium tracking-wide text-amber-200/90">
              Start free, no credit card
            </span>
            <h2 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[3.5rem] xl:leading-[1.1]">
              Ready to reclaim{" "}
              <span className="text-amber-400">your time?</span>
            </h2>
            <div className="mt-6 h-px w-16 bg-gradient-to-r from-amber-500/60 to-transparent lg:w-24" />
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-500">
              Join thousands of professionals who&apos;ve already transformed
              their inbox. Free forever plan available.
            </p>
            <div className="mt-12 flex flex-wrap gap-3">
              {BENEFITS.map(({ label, icon: Icon }, i) => (
                <motion.span
                  key={label}
                  className="inline-flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-300"
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i + 0.15, duration: 0.35 }}
                >
                  <Icon className="h-4 w-4 text-amber-400/90" strokeWidth={1.75} />
                  {label}
                </motion.span>
              ))}
            </div>
          </motion.div>


          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >

            <div
              className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-amber-500/30 blur-2xl"
              aria-hidden
            />
            <div className="relative rounded-[1.5rem] border border-amber-400/10 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 p-8 shadow-[0_0_0_1px_rgba(251,191,36,0.08),0_32px_64px_-12px_rgba(0,0,0,0.5)] md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/70">
                Get started in 2 minutes
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-black md:text-3xl">
                Start free. Upgrade when you’re ready.
              </h3>
              <Link
                href="/features"
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-black px-8 py-4 text-base font-semibold text-white transition-all hover:bg-zinc-900 active:scale-[0.99]"
              >
                <Mail className="h-5 w-5" />
                Why Vectormail
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-6 text-left text-sm text-amber-900/60">
                Questions?{" "}
                <a
                  href="mailto:parbhat@parbhat.dev"
                  className="font-medium text-amber-900 underline underline-offset-2 hover:no-underline"
                >
                  parbhat@parbhat.dev
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
