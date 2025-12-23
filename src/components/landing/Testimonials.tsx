"use client";

import {
  Cpu,
  Database,
  Zap,
  Lock,
  Brain,
  Search,
  Server,
  GitBranch,
} from "lucide-react";

const techStack = [
  {
    icon: Brain,
    title: "AI-Native Architecture",
    description:
      "Built from the ground up with AI at its core. OpenAI & Anthropic integration for intelligent email processing.",
    gradient: "from-amber-500 to-orange-600",
    stats: [
      { label: "Models", value: "GPT-4 & Claude" },
      { label: "Response", value: "<2s" },
    ],
  },
  {
    icon: Search,
    title: "Semantic Vector Search",
    description:
      "pgvector-powered embeddings that understand meaning, not just keywords. Find any email by describing it.",
    gradient: "from-violet-500 to-purple-600",
    stats: [
      { label: "Latency", value: "50ms" },
      { label: "Accuracy", value: "98%" },
    ],
  },
  {
    icon: Database,
    title: "Hybrid Search Engine",
    description:
      "Combines vector embeddings with BM25 full-text search for unmatched accuracy and speed.",
    gradient: "from-cyan-500 to-blue-600",
    stats: [
      { label: "Algorithm", value: "Vector + BM25" },
      { label: "Indexing", value: "Real-time" },
    ],
  },
  {
    icon: Zap,
    title: "Redis Cache Layer",
    description:
      "Lightning-fast responses with intelligent caching. Most queries served directly from memory.",
    gradient: "from-emerald-500 to-green-600",
    stats: [
      { label: "Cache Hit", value: "94%" },
      { label: "Speed", value: "10x faster" },
    ],
  },
  {
    icon: Server,
    title: "Real-time Sync",
    description:
      "Delta sync with Aurinko API ensures your inbox is always up-to-date with zero manual refresh.",
    gradient: "from-pink-500 to-rose-600",
    stats: [
      { label: "Sync", value: "Instant" },
      { label: "30-day", value: "Auto window" },
    ],
  },
  {
    icon: Lock,
    title: "Privacy-First",
    description:
      "Your data stays yours. Self-hostable, open-source codebase with enterprise-grade security.",
    gradient: "from-indigo-500 to-blue-600",
    stats: [
      { label: "Open Source", value: "100%" },
      { label: "Data", value: "Your control" },
    ],
  },
];

const stack = [
  { name: "Next.js 14", category: "Framework" },
  { name: "TypeScript", category: "Language" },
  { name: "tRPC", category: "API" },
  { name: "Prisma", category: "ORM" },
  { name: "PostgreSQL", category: "Database" },
  { name: "pgvector", category: "Vector DB" },
  { name: "Redis", category: "Cache" },
  { name: "OpenAI", category: "AI" },
  { name: "Clerk", category: "Auth" },
  { name: "Tailwind", category: "Styling" },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-[#000000] py-32">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2">
            <Cpu className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">
              Under The Hood
            </span>
          </div>

          <h2 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            <span className="text-white">Built with</span>
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              production-grade tech
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-xl text-zinc-400">
            Not just another side project. Enterprise architecture, optimized
            performance, and the modern stack that top companies use.
          </p>
        </div>

        <div className="mb-20 flex flex-wrap items-center justify-center gap-3">
          {stack.map((tech, i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 blur transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.06]">
                <span className="text-sm font-medium text-white">
                  {tech.name}
                </span>
                <span className="text-xs text-zinc-500">{tech.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {techStack.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="group relative">
                <div
                  className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}
                />

                <div className="relative h-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-7 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
                  <div
                    className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mb-5 text-sm leading-relaxed text-zinc-400">
                    {feature.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-5">
                    {feature.stats.map((stat, j) => (
                      <div key={j}>
                        <div
                          className={`bg-gradient-to-r text-lg font-bold ${feature.gradient} bg-clip-text text-transparent`}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mt-16">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-violet-500/30 opacity-50 blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-transparent p-10 backdrop-blur-xl">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="text-center lg:text-left">
                <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
                  <GitBranch className="h-6 w-6 text-amber-400" />
                  <span className="text-sm font-medium uppercase tracking-wider text-amber-300">
                    Architecture
                  </span>
                </div>
                <h3 className="mb-3 text-3xl font-bold text-white md:text-4xl">
                  Production-Ready from Day One
                </h3>
                <p className="max-w-xl text-zinc-400">
                  Type-safe end-to-end with tRPC. Optimistic updates. Real-time
                  subscriptions. Database migrations. CI/CD ready. Everything a
                  founder dreams of.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-10">
                {[
                  { value: "100%", label: "Type-safe" },
                  { value: "0", label: "Runtime errors" },
                  { value: "A+", label: "Security score" },
                  { value: "∞", label: "Scalable" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            {
              value: "50ms",
              label: "Search Latency",
              sublabel: "p99 response time",
            },
            {
              value: "94%",
              label: "Cache Hit Rate",
              sublabel: "Redis optimized",
            },
            {
              value: "99.9%",
              label: "Uptime SLA",
              sublabel: "Enterprise grade",
            },
            { value: "<2s", label: "AI Response", sublabel: "GPT-4 powered" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center"
            >
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-white">
                {stat.label}
              </div>
              <div className="text-xs text-zinc-500">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
