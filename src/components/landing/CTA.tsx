"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Mail,
  CheckCircle2,
  Star,
  Brain,
  Database,
  TrendingUp,
  Rocket,
} from "lucide-react";

export function CTA() {
  const { isSignedIn } = useUser();

  const metrics = [
    {
      icon: Brain,
      value: "50ms",
      label: "AI Search",
      sublabel: "Sub-50ms latency",
      explanation:
        "Our pgvector-powered semantic search delivers results in under 50 milliseconds. Ask questions naturally and get instant answers across your entire inbox. Powered by vector embeddings that understand meaning, not just keywords. No more scrolling through hundreds of emails or guessing the right search terms. Find exactly what you need in milliseconds.",
    },
    {
      icon: Database,
      value: "94%",
      label: "Cache Hit",
      sublabel: "Redis optimized",
      explanation:
        "94% of your search queries are served directly from our Redis cache. This eliminates database lookups for lightning-fast responses. The optimization ensures consistent speed as your email volume grows. The remaining 6% are intelligently cached for future queries. This means most searches feel instant.",
    },
    {
      icon: TrendingUp,
      value: "Hybrid",
      label: "Search Engine",
      sublabel: "Vector + BM25",
      explanation:
        "Hybrid search combining vector embeddings with BM25 algorithms for unmatched accuracy. Smart indexing that only re-embeds changed content, saving processing time. Automatic thread summarization extracts key takeaways instantly. Multi-provider AI fallback ensures reliability. Find similar conversations automatically across your entire inbox.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]">
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-2"
            >
              <Rocket className="h-4 w-4 text-orange-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Ready to get started?
              </span>
            </motion.div>

            <h2 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Transform your{" "}
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                email workflow
              </span>{" "}
              today
            </h2>

            <p className="mb-8 text-lg leading-relaxed text-slate-400 sm:text-xl">
              Join professionals using AI-powered email intelligence to save
              hours every week. No credit card required. Free forever plan
              available.
            </p>

            <div className="mb-10 flex flex-wrap gap-3">
              {["No credit card", "Free forever", "2-min setup"].map(
                (feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-slate-300">
                      {feature}
                    </span>
                  </motion.div>
                ),
              )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={isSignedIn ? "/mail" : "/sign-up"}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/30"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/features"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-8 py-4 text-base font-semibold text-white transition-all hover:border-slate-700 hover:bg-slate-800/50"
              >
                <Mail className="h-5 w-5 text-orange-400" />
                <span>View Features</span>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-400">
                4.9/5 rating
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
          >
            {metrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-amber-500/0 to-yellow-500/0 opacity-0 transition-opacity group-hover:opacity-10" />

                  <div className="relative flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                        <Icon className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="mb-2 text-3xl font-black text-white">
                        {metric.value}
                      </div>
                      <div className="mb-0.5 text-sm font-semibold text-slate-300">
                        {metric.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {metric.sublabel}
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm leading-relaxed text-slate-400">
                        {metric.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
