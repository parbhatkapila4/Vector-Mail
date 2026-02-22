"use client";

import Image from "next/image";
import {
  Cpu,
  Database,
  Zap,
  Lock,
  Brain,
  Search,
  Server,
  Shield,
  Infinity,
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
    preview: "ai-compose",
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
    preview: "search",
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
    preview: "inbox",
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
    preview: "cache",
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
    preview: "sync",
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
    preview: "privacy",
  },
];

function CardPreview({ type }: { type: string }) {
  const base = "rounded-lg bg-[#111] min-h-[240px] overflow-hidden";


  if (type === "ai-compose") {
    return (
      <div className={`${base} p-3`}>
        <div className="mb-3 rounded-xl bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-violet-700/10 p-3 ring-1 ring-violet-500/20">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-violet-400">✦</span>
            <span className="text-[9px] font-medium text-gray-300">Smart Brief</span>
            <svg className="h-2.5 w-2.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          <p className="text-[10px] leading-relaxed text-gray-300">
            Marcus shared the <span className="font-medium text-gray-200">product launch deck</span>. Launch date Mar 8, needs your sign-off. CC: Marketing & Design.
          </p>
          <div className="mt-2 flex items-center gap-1.5 border-t border-white/[0.06] pt-2">
            <div className="h-3 w-3 rounded bg-gray-700/80" />
            <span className="text-[8px] text-gray-500">deck_final.pdf</span>
            <div className="h-3 w-3 rounded bg-gray-700/80" />
            <span className="text-[8px] text-gray-500">feedback.xlsx</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {["Respond", "Share", "Archive", "Remind"].map((a, i) => (
            <span key={i} className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-gray-500">{a}</span>
          ))}
        </div>
      </div>
    );
  }


  if (type === "search") {
    return (
      <div className={`${base} p-3`}>
        <div className="mb-2 flex items-center gap-2 rounded-md bg-[#0a0a0a] px-2.5 py-1.5 ring-1 ring-white/[0.06]">
          <span className="text-[8px] font-medium text-gray-500">ESC</span>
          <div className="h-3 w-px bg-white/[0.06]" />
          <span className="text-[9px] text-gray-400">Find meeting notes from last week</span>
        </div>
        <div className="mb-1.5 text-[8px] font-medium text-gray-600">4 results found</div>
        {[
          { name: "Notion", sub: "Meeting notes — Q1 planning", ai: true, logo: "/logos/Notion.webp" },
          { name: "Google", sub: "Calendar invite — team sync", ai: false, logo: "/logos/google.svg" },
          { name: "Slack", sub: "Thread: design review", ai: true, logo: "/logos/slack.svg" },
          { name: "Asana", sub: "Task: follow-up on deliverables", ai: false, logo: "/logos/asana.svg" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
            <div className="h-5 w-5 shrink-0 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center ring-1 ring-white/[0.06]">
              <Image
                src={item.logo}
                alt=""
                width={item.name === "Notion" ? 40 : 20}
                height={item.name === "Notion" ? 40 : 20}
                className="h-full w-full object-cover"
                unoptimized={item.name === "Notion"}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-gray-300 truncate">{item.name}</span>
                {item.ai && <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[7px] font-medium text-amber-400">AI</span>}
              </div>
              <div className="text-[8px] text-gray-600 truncate">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }


  if (type === "inbox") {
    return (
      <div className={`${base} p-3`}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-gray-300">Inbox</span>
            <span className="text-[8px] text-gray-600">Select</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-gray-700" />
            <div className="h-3 w-3 rounded bg-gray-700" />
          </div>
        </div>
        <div className="mb-2 flex items-center gap-3 rounded-md bg-[#0a0a0a] px-2.5 py-1.5 ring-1 ring-white/[0.06]">
          <Search className="h-3 w-3 text-gray-500" />
          <span className="text-[9px] text-gray-500">Search</span>
          <span className="ml-auto rounded border border-white/10 px-1 py-0.5 text-[8px] text-gray-600">⌘K</span>
        </div>
        <div className="mb-2 flex items-center gap-1.5">
          <div className="rounded-full bg-emerald-600/80 px-2 py-0.5 text-[8px] font-medium text-white">Promotions</div>
          <div className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[8px] font-medium text-emerald-300">Updates</div>
          <div className="flex items-center gap-1">
            {[1, 2].map(j => <div key={j} className="h-3.5 w-3.5 rounded bg-gray-700/60" />)}
          </div>
        </div>
        <div className="mb-2 rounded-md border border-emerald-600/20 bg-emerald-600/5 px-2 py-2">
          <div className="text-[8px] font-semibold text-emerald-400">Q3 budget contract — approval needed</div>
          <div className="mt-0.5 text-[7px] text-gray-500">Sarah Chen. Time-sensitive. Requires your approval.</div>
        </div>
        <div className="mt-1.5 text-[8px] text-gray-600">Pinned [2]</div>
        {[
          { name: "Sarah Chen", sub: "Q3 budget contract — approval needed", date: "2h ago" },
          { name: "Stripe", sub: "Payment confirmation #2847", date: "Yesterday" },
        ].map((e, i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/[0.03] py-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-700 flex items-center justify-center text-[8px] font-medium text-gray-400">{e.name[0]}</div>
              <div>
                <div className="text-[9px] font-medium text-gray-300">{e.name}</div>
                <div className="text-[8px] text-gray-600">{e.sub}</div>
              </div>
            </div>
            <span className="text-[8px] text-gray-600">{e.date}</span>
          </div>
        ))}
      </div>
    );
  }


  if (type === "cache") {
    return (
      <div className={`${base} p-3`}>
        <div className="mb-2 flex items-center gap-2">
          <Zap className="h-3 w-3 text-emerald-400" />
          <span className="text-[9px] font-medium text-gray-400">VectorMail cache</span>
        </div>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-[#0a0a0a] p-2 ring-1 ring-white/[0.04]">
            <div className="text-[14px] font-bold tabular-nums text-emerald-400">94%</div>
            <div className="text-[8px] text-gray-600">Hit Rate</div>
          </div>
          <div className="rounded-md bg-[#0a0a0a] p-2 ring-1 ring-white/[0.04]">
            <div className="text-[14px] font-bold tabular-nums text-gray-300">10ms</div>
            <div className="text-[8px] text-gray-600">Avg Latency</div>
          </div>
        </div>
        <div className="space-y-1">
          {[
            { label: "Search results", w: 96 },
            { label: "Thread list", w: 88 },
            { label: "AI summaries", w: 72 },
            { label: "Embeddings", w: 65 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-14 text-[8px] text-gray-600">{item.label}</span>
              <div className="h-1 flex-1 rounded-full bg-gray-800"><div className="h-full rounded-full bg-emerald-600/70" style={{ width: `${item.w}%` }} /></div>
              <span className="w-6 text-right text-[8px] tabular-nums text-gray-600">{item.w}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }


  if (type === "sync") {
    return (
      <div className={`${base} p-3`}>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span className="text-[9px] font-medium text-gray-400">Aurinko delta sync</span>
        </div>
        {[
          "Inbox — 12 new threads",
          "Sent folder — up to date",
          "Drafts — 2 pending",
          "Labels — 3 updated",
        ].map((msg, i) => (
          <div key={i} className="flex items-center gap-2.5 border-b border-white/[0.03] py-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-sky-500" : "bg-gray-600"}`} />
            <span className="text-[9px] text-gray-400">{msg}</span>
            <span className="ml-auto text-[8px] text-gray-600">now</span>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div className={`${base} p-3`}>
      <div className="mb-2 flex items-center gap-2">
        <Lock className="h-3 w-3 text-sky-400" />
        <span className="text-[9px] font-medium text-gray-400">VectorMail security</span>
      </div>
      <div className="mb-2 flex items-center gap-2 rounded-md bg-emerald-600/10 px-2.5 py-1.5 ring-1 ring-emerald-600/20">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-[9px] font-medium text-emerald-400">Your data stays yours</span>
      </div>
      {["Self-hostable & open-source", "SOC 2 compliant", "Zero data retention", "Enterprise encryption"].map((item, i) => (
        <div key={i} className="flex items-center gap-2 py-1">
          <svg className="h-2.5 w-2.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span className="text-[9px] text-gray-400">{item}</span>
        </div>
      ))}
    </div>
  );
}

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
    <section className="relative py-32">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-2">
            <Cpu className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-300">
              Under The Hood
            </span>
          </div>

          <h2 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            <span className="text-white">Built with</span>
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-yellow-300 bg-clip-text text-transparent">
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
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 opacity-0 blur transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.06]">
                <span className="text-sm font-medium text-white">
                  {tech.name}
                </span>
                <span className="text-xs text-zinc-500">{tech.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {techStack.map((feature, i) => (
            <div key={i} className="group flex h-full flex-col">
              <div className="mb-2 flex min-h-0 flex-1 flex-col pb-14 transition-opacity duration-300 group-hover:opacity-95 md:pb-16">
                <div className="origin-top-left min-h-0 flex-1" style={{ transform: "scale(1.22)", width: "81.97%" }}>
                  <CardPreview type={feature.preview} />
                </div>
              </div>
              <h3 className="mb-2 shrink-0 text-lg font-semibold tracking-tight text-white">
                {feature.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="relative mt-16">
          <blockquote className="relative overflow-hidden rounded-2xl border border-stone-200/60 bg-gradient-to-br from-white via-stone-50/20 to-stone-50/35 dark:from-white dark:via-stone-100 dark:to-stone-100 dark:border-stone-600/50 px-8 py-12 shadow-sm sm:px-12 sm:py-16 md:px-16">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-stone-200 to-stone-300 dark:from-stone-300 dark:to-stone-400" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-700">
              Architecture
            </p>
            <p className="mt-4 font-display-serif text-2xl font-semibold italic leading-snug text-stone-900 sm:text-3xl md:max-w-2xl">
              Production-Ready from Day One
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-stone-800">
              Type-safe entirely with tRPC. Optimistic updates. Real-time
              subscriptions. Database migrations. CI/CD ready. Everything a
              founder dreams of.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-stone-800">
              <span><span className="font-semibold tabular-nums text-stone-900">100%</span> Type-safe</span>
              <span className="text-stone-500" aria-hidden>·</span>
              <span><span className="font-semibold tabular-nums text-stone-900">0</span> Runtime errors</span>
              <span className="text-stone-500" aria-hidden>·</span>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-stone-700" /><span className="font-semibold tabular-nums text-stone-900">A+</span> Security</span>
              <span className="text-stone-500" aria-hidden>·</span>
              <span className="flex items-center gap-1"><Infinity className="h-3.5 w-3.5 text-stone-700" /> Scalable</span>
            </div>
          </blockquote>
        </div>

      </div>
    </section>
  );
}
