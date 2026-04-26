"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, History, CheckCircle, Zap, Search, Calendar } from "lucide-react";

const updates = [
  {
    version: "v2.4",
    date: "April 2026",
    icon: Zap,
    title: "Faster Daily Operations",
    bullets: [
      "Brief 2.0 with better quoted-thread extraction",
      "Incremental sync improvements for faster refresh cycles",
      "Cleaner action parsing for replies and follow-ups",
    ],
  },
  {
    version: "v2.3",
    date: "March 2026",
    icon: Search,
    title: "Better Search and Context",
    bullets: [
      "Date-range filters added to semantic search",
      "Improved thread relevance scoring",
      "Sharper summaries for long conversation chains",
    ],
  },
  {
    version: "v2.2",
    date: "February 2026",
    icon: Calendar,
    title: "Calendar and Workflow Upgrades",
    bullets: [
      "Calendar bridge for invite handling",
      "Improved keyboard flow in list and reader views",
      "More reliable background sync and indexing",
    ],
  },
];

export default function ChangelogPage() {
  const lastUpdated = "April 2026";

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
              <History className="mr-2 h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Changelog</span>
            </motion.div>

            <h1 className="mb-6 w-full break-words text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">What&rsquo;s New in</span>
              <span className="mt-2 block text-white">VectorMail</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-white sm:text-xl lg:text-2xl">
              Product improvements shipped across brief generation, semantic
              search, and inbox workflow speed.
            </p>

            <p className="mx-auto mt-4 max-w-3xl text-sm font-medium text-white">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-32 lg:pt-16">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="space-y-6 sm:space-y-8">
            {updates.map((update, i) => (
              <motion.div
                key={update.version}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8"
              >
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-black bg-white">
                    {update.version}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-300">
                    {update.date}
                  </span>
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">
                    <update.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {update.title}
                  </h3>
                </div>

                <ul className="space-y-3">
                  {update.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                      <span className="text-sm font-medium leading-relaxed text-white">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
