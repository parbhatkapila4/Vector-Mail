"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle, Brain, Clock, Target } from "lucide-react";

export default function BriefPage() {
  const lastUpdated = "April 2026";

  const sections = [
    {
      icon: Brain,
      title: "What Brief Does",
      content: [
        "Summarizes important threads into a fast daily overview",
        "Highlights decisions, blockers, and items that need a reply",
        "Surfaces context from quoted threads so summaries stay accurate",
        "Keeps your inbox actionable without reading every message",
      ],
    },
    {
      icon: Clock,
      title: "How It Helps",
      content: [
        "Get the day's email signal in minutes",
        "Prioritize urgent conversations first",
        "Catch follow-ups before they slip",
        "Reduce context switching across long threads",
      ],
    },
    {
      icon: Target,
      title: "Built for Operators",
      content: [
        "Designed for founders, managers, and customer-facing teams",
        "Optimized for high-volume inbox workflows",
        "Works with your existing Gmail setup",
        "Updates throughout the day as new threads arrive",
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0a0a]">
      <div className="fixed left-4 top-4 z-40 hidden sm:left-8 sm:top-6 sm:block">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white transition-all hover:scale-105 hover:border-slate-700 hover:bg-slate-800/50 sm:px-4">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium sm:text-sm">Back</span>
          </button>
        </Link>
      </div>

      <div className="px-4 pt-4 sm:hidden">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white transition-all hover:border-slate-700 hover:bg-slate-800/50">
            <ArrowLeft className="h-3 w-3" />
            <span className="text-xs font-medium">Back</span>
          </button>
        </Link>
      </div>

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-8 pt-16 sm:pb-12 sm:pt-20 lg:pb-16 lg:pt-24">
        <div className="relative mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div className="mb-6 inline-flex items-center rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Brief</span>
            </motion.div>

            <h1 className="mb-6 w-full break-words text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Daily Inbox Briefs</span>
              <span className="mt-2 block text-white">Without the Noise</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-white sm:text-xl lg:text-2xl">
              Brief turns your inbox into a clear, prioritized view of what
              matters now, what can wait, and what needs action.
            </p>

            <p className="mx-auto mt-4 max-w-3xl text-sm font-medium text-white">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-32 lg:pt-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 transition-all group-hover:border-slate-700">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                        <span className="text-sm font-medium leading-relaxed text-white">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
