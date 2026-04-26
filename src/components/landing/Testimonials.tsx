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
  Sparkles,
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
      { label: "Matching", value: "Meaning-first" },
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
      { label: "Cache", value: "Warm-path" },
      { label: "Speed", value: "Low-latency" },
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
      "Security-conscious architecture with scoped access patterns and production-ready defaults.",
    gradient: "from-indigo-500 to-blue-600",
    stats: [
      { label: "Access", value: "Scoped" },
      { label: "Data", value: "Your control" },
    ],
    preview: "privacy",
  },
];

function CardPreview({ type }: { type: string }) {
  const base = "rounded-lg bg-white min-h-[240px] overflow-hidden border border-[#e8e4db] shadow-[0_1px_2px_rgba(26,26,23,0.04)]";


  if (type === "ai-compose") {
    return (
      <div className={`${base} p-3`}>
        <div className="mb-3 rounded-xl border border-[#c8c6f5] bg-[#ecebff] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[#1f1bea]">✦</span>
            <span className="text-[9px] font-medium text-[#2c2b27]">Smart Brief</span>
            <svg className="h-2.5 w-2.5 text-[#777269]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          <p className="text-[10px] leading-relaxed text-[#2c2b27]">
            Marcus shared the <span className="font-medium text-[#1a1a17]">product launch deck</span>. Launch date Mar 8, needs your sign-off. CC: Marketing & Design.
          </p>
          <div className="mt-2 flex items-center gap-1.5 border-t border-[#c8c6f5] pt-2">
            <div className="h-3 w-3 rounded bg-[#d8d3c7]" />
            <span className="text-[8px] text-[#777269]">deck_final.pdf</span>
            <div className="h-3 w-3 rounded bg-[#d8d3c7]" />
            <span className="text-[8px] text-[#777269]">feedback.xlsx</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {["Respond", "Share", "Archive", "Remind"].map((a, i) => (
            <span key={i} className="rounded border border-[#e8e4db] bg-[#f7f5f0] px-1.5 py-0.5 text-[8px] text-[#777269]">{a}</span>
          ))}
        </div>
      </div>
    );
  }


  if (type === "search") {
    return (
      <div className={`${base} p-3`}>
        <div className="mb-2 flex items-center gap-2 rounded-md border border-[#e8e4db] bg-[#fbfaf7] px-2.5 py-1.5">
          <span className="text-[8px] font-medium text-[#777269]">ESC</span>
          <div className="h-3 w-px bg-[#e8e4db]" />
          <span className="text-[9px] text-[#4a4943]">Find meeting notes from last week</span>
        </div>
        <div className="mb-1.5 text-[8px] font-medium text-[#a39e93]">Results ranked by semantic relevance</div>
        {[
          { name: "Notion", sub: "Meeting notes - Q1 planning", ai: true, logo: "/logos/Notion.webp" },
          { name: "Google", sub: "Calendar invite - team sync", ai: false, logo: "/logos/google.svg" },
          { name: "Slack", sub: "Thread: design review", ai: true, logo: "/logos/slack.svg" },
          { name: "Asana", sub: "Task: follow-up on deliverables", ai: false, logo: "/logos/asana.svg" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
            <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full border border-[#e8e4db] bg-white flex items-center justify-center">
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
                <span className="text-[10px] font-medium text-[#1a1a17] truncate">{item.name}</span>
                {item.ai && <span className="rounded border border-[#c8c6f5] bg-[#ecebff] px-1 py-0.5 text-[7px] font-medium text-[#1f1bea]">AI</span>}
              </div>
              <div className="text-[8px] text-[#777269] truncate">{item.sub}</div>
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
            <span className="text-[10px] font-semibold text-[#1a1a17]">Inbox</span>
            <span className="text-[8px] text-[#a39e93]">Select</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-[#d8d3c7]" />
            <div className="h-3 w-3 rounded bg-[#d8d3c7]" />
          </div>
        </div>
        <div className="mb-2 flex items-center gap-3 rounded-md border border-[#e8e4db] bg-[#fbfaf7] px-2.5 py-1.5">
          <Search className="h-3 w-3 text-[#777269]" />
          <span className="text-[9px] text-[#777269]">Search</span>
          <span className="ml-auto rounded border border-[#e8e4db] px-1 py-0.5 text-[8px] text-[#777269]">⌘K</span>
        </div>
        <div className="mb-2 flex items-center gap-1.5">
          <div className="rounded-full bg-[#4d7c0f] px-2 py-0.5 text-[8px] font-medium text-white">Promotions</div>
          <div className="rounded-full border border-[#bce074] bg-[#ecf5d5] px-2 py-0.5 text-[8px] font-medium text-[#3f6209]">Updates</div>
          <div className="flex items-center gap-1">
            {[1, 2].map(j => <div key={j} className="h-3.5 w-3.5 rounded bg-[#d8d3c7]" />)}
          </div>
        </div>
        <div className="mb-2 rounded-md border border-[#bce074] bg-[#ecf5d5] px-2 py-2">
          <div className="text-[8px] font-semibold text-[#3f6209]">Q3 budget contract - approval needed</div>
          <div className="mt-0.5 text-[7px] text-[#4a4943]">Sarah Chen. Time-sensitive. Requires your approval.</div>
        </div>
        <div className="mt-1.5 text-[8px] text-[#a39e93]">Pinned [2]</div>
        {[
          { name: "Sarah Chen", sub: "Q3 budget contract - approval needed", date: "2h ago" },
          { name: "Stripe", sub: "Payment confirmation #2847", date: "Yesterday" },
        ].map((e, i) => (
          <div key={i} className="flex items-center justify-between border-b border-[#f1ede4] py-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#d8d3c7] flex items-center justify-center text-[8px] font-medium text-[#4a4943]">{e.name[0]}</div>
              <div>
                <div className="text-[9px] font-medium text-[#1a1a17]">{e.name}</div>
                <div className="text-[8px] text-[#777269]">{e.sub}</div>
              </div>
            </div>
            <span className="text-[8px] text-[#a39e93]">{e.date}</span>
          </div>
        ))}
      </div>
    );
  }


  if (type === "cache") {
    return (
      <div className={`${base} p-3`}>
        <div className="mb-2 flex items-center gap-2">
          <Zap className="h-3 w-3 text-[#4d7c0f]" />
          <span className="text-[9px] font-medium text-[#2c2b27]">VectorMail cache</span>
        </div>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-[#e8e4db] bg-[#fbfaf7] p-2">
            <div className="text-[14px] font-bold tabular-nums text-[#4d7c0f]">Warm</div>
            <div className="text-[8px] text-[#777269]">Cache State</div>
          </div>
          <div className="rounded-md border border-[#e8e4db] bg-[#fbfaf7] p-2">
            <div className="text-[14px] font-bold tabular-nums text-[#1a1a17]">Fast</div>
            <div className="text-[8px] text-[#777269]">Query Path</div>
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
              <span className="w-14 text-[8px] text-[#777269]">{item.label}</span>
              <div className="h-1 flex-1 rounded-full bg-[#efece5]"><div className="h-full rounded-full bg-[#4d7c0f]" style={{ width: `${item.w}%` }} /></div>
              <span className="w-6 text-right text-[8px] tabular-nums text-[#777269]">{item.w}%</span>
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
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4d7c0f]" />
          <span className="text-[9px] font-medium text-[#2c2b27]">Aurinko delta sync</span>
        </div>
        {[
          "Inbox - 12 new threads",
          "Sent folder - up to date",
          "Drafts - 2 pending",
          "Labels - 3 updated",
        ].map((msg, i) => (
          <div key={i} className="flex items-center gap-2.5 border-b border-[#f1ede4] py-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-[#1f1bea]" : "bg-[#c8c4b9]"}`} />
            <span className="text-[9px] text-[#2c2b27]">{msg}</span>
            <span className="ml-auto text-[8px] text-[#a39e93]">now</span>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div className={`${base} p-3`}>
      <div className="mb-2 flex items-center gap-2">
        <Lock className="h-3 w-3 text-[#1f1bea]" />
        <span className="text-[9px] font-medium text-[#2c2b27]">VectorMail security</span>
      </div>
      <div className="mb-2 flex items-center gap-2 rounded-md border border-[#bce074] bg-[#ecf5d5] px-2.5 py-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[#4d7c0f]" />
        <span className="text-[9px] font-medium text-[#3f6209]">Your data stays yours</span>
      </div>
      {["Scoped account access", "OAuth-based mailbox sync", "Encrypted transport", "Operational visibility"].map((item, i) => (
        <div key={i} className="flex items-center gap-2 py-1">
          <svg className="h-2.5 w-2.5 text-[#4d7c0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span className="text-[9px] text-[#2c2b27]">{item}</span>
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
    <section className="relative bg-[#fbfaf7] py-32">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <h2 className="-mt-2 mb-6 text-5xl font-medium tracking-[-0.025em] md:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}>
            <span className="text-[#1a1a17]">Built with</span>
            <br />
            <span className="italic text-[#1a1a17]">
              production-grade tech
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-xl text-[#4a4943]">
            Built as a production system with typed APIs, semantic retrieval,
            and workflow-first email operations.
          </p>
        </div>

        <div className="mb-20 flex flex-wrap items-center justify-center gap-3">
          {stack.map((tech, i) => (
            <div key={i} className="group relative">
              <div className="relative flex items-center gap-2 rounded-xl border border-[#e8e4db] bg-white px-4 py-2 shadow-[0_1px_2px_rgba(26,26,23,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#d8d3c7]">
                <span className="text-sm font-medium text-[#1a1a17]">
                  {tech.name}
                </span>
                <span className="text-xs text-[#777269]">{tech.category}</span>
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
              <h3 className="mb-2 shrink-0 text-lg font-semibold tracking-tight text-[#1a1a17]">
                {feature.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-[#4a4943]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="relative mt-16">
          <div className="mx-auto max-w-5xl space-y-8 px-0 md:space-y-12">
            <div className="relative -mx-4 rounded-3xl p-3 md:-mx-12 lg:col-span-3">
              <div className="[perspective:800px]">
                <div style={{ transform: "skewY(-2deg) skewX(-2deg) rotateX(6deg)" }}>
                  <div className="aspect-[88/36] relative overflow-hidden rounded-xl border border-[#e8e4db] bg-white shadow-[0_24px_48px_-12px_rgba(26,26,23,0.10)]">
                    <div className="absolute inset-0 z-10 flex rounded-xl bg-white">
                      <aside className="flex w-[16%] min-w-0 shrink-0 flex-col border-r border-[#e8e4db] bg-[#f7f5f0] py-2">
                        <div className="flex items-center gap-1.5 px-2">
                          <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded">
                            <Image src="/VectorMail-New.png" alt="VectorMail" width={16} height={16} className="object-contain" />
                          </div>
                          <span className="truncate text-[10px] font-medium text-[#4a4943]">Your inbox, reimagined</span>
                        </div>
                        <nav className="mt-2 space-y-0.5 px-1.5 text-[10px]">
                          {["Inbox", "Drafts", "Sent", "Junk", "Trash", "Archive"].map((folder, i) => (
                            <div key={folder} className={`flex items-center justify-between rounded px-1.5 py-1 ${i === 0 ? "bg-white text-[#1a1a17] shadow-[0_1px_2px_rgba(26,26,23,0.04)]" : "text-[#4a4943]"}`}>
                              <span className="truncate">{folder}</span>
                              {i === 0 && <span className="text-[9px] text-[#777269]">128</span>}
                            </div>
                          ))}
                        </nav>
                        <div className="mt-2 border-t border-[#e8e4db] pt-2">
                          <div className="px-1.5 text-[9px] font-medium uppercase tracking-wider text-[#a39e93]">Categories</div>
                          {["Social", "Updates", "Forums", "Shopping", "Promotions"].map((cat, i) => (
                            <div key={cat} className="mt-0.5 flex items-center justify-between px-1.5 py-0.5 text-[10px] text-[#4a4943]">
                              <span className="truncate">{cat}</span>
                              <span className="text-[9px] text-[#a39e93]">{[972, 342, 128, 8, 21][i]}</span>
                            </div>
                          ))}
                        </div>
                      </aside>
                      <div className="flex min-w-0 flex-1 flex-col border-r border-[#e8e4db]">
                        <div className="flex items-center justify-between border-b border-[#e8e4db] px-2 py-1.5">
                          <span className="text-[11px] font-medium text-[#1a1a17]">Inbox</span>
                          <div className="flex gap-0.5">
                            <button type="button" className="rounded px-1.5 py-0.5 text-[10px] text-[#1a1a17]">All mail</button>
                            <button type="button" className="rounded px-1.5 py-0.5 text-[10px] text-[#777269]">Unread</button>
                          </div>
                        </div>
                        <div className="border-b border-[#e8e4db] px-2 py-1">
                          <div className="rounded border border-[#e8e4db] bg-[#fbfaf7] px-1.5 py-1 text-[10px] text-[#777269]">Search by meaning, not keywords</div>
                        </div>
                        <div className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {[
                            { from: "VectorMail", subj: "Find anything in plain language", snip: "Ask \"emails from Sarah about the Q3 budget\" or \"that thread where we discussed the launch date.\" Semantic search returns the right threads in one shot.", tags: ["search", "AI"], time: "2h ago" },
                            { from: "VectorMail", subj: "AI summaries that actually help", snip: "Every thread gets a short summary so you can triage without opening. Catch up on long chains in seconds.", tags: ["summaries"], time: "5h ago" },
                            { from: "VectorMail", subj: "Compose in seconds, not minutes", snip: "Draft and send from one place. AI can suggest replies; you stay in control. Built for people who ship.", tags: ["compose"], time: "1d ago" },
                            { from: "VectorMail", subj: "Your data stays yours", snip: "We don't train on your email. Connect Gmail, get semantic search and AI. Self-hostable, built for teams who care about privacy.", tags: ["privacy"], time: "2d ago" },
                          ].map((mail, i) => (
                            <div key={`${mail.from}-${mail.subj}-${i}`} className={`rounded px-1.5 py-1 ${i === 0 ? "bg-[#ecebff] ring-1 ring-[#c8c6f5]" : ""}`}>
                              <div className="flex items-center justify-between">
                                <span className="truncate text-[10px] font-medium text-[#1a1a17]">{mail.from}</span>
                                <span className="shrink-0 text-[9px] text-[#777269]">{mail.time}</span>
                              </div>
                              <div className="mt-0.5 truncate text-[10px] font-medium text-[#2c2b27]">{mail.subj}</div>
                              <div className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-[#4a4943]">{mail.snip}</div>
                              <div className="mt-0.5 flex flex-wrap gap-0.5">
                                {mail.tags.map((tag) => (
                                  <span key={tag} className="rounded border border-[#e8e4db] bg-[#f7f5f0] px-1 py-0.5 text-[8px] text-[#4a4943]">{tag}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex w-[42%] min-w-0 shrink-0 flex-col bg-white">
                        <div className="flex items-center gap-1 border-b border-[#e8e4db] px-2 py-1">
                          {["delete", "archive", "reply", "forward"].map((a) => (
                            <span key={a} className="h-1.5 w-1.5 rounded-full bg-[#c8c4b9]" aria-hidden />
                          ))}
                        </div>
                        <div className="flex-1 overflow-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white" style={{ background: "linear-gradient(135deg, #1f1bea, #6366f1)" }}>VM</div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-medium text-[#1a1a17]">VectorMail</div>
                              <div className="truncate text-[10px] text-[#777269]">Find anything in plain language</div>
                            </div>
                          </div>
                          <div className="mt-1.5 text-[9px] text-[#777269]">feature@vectormail.ai · March 2026</div>
                          <div className="mt-2 space-y-2 text-[10px] leading-relaxed text-[#2c2b27]">
                            <p>The one feature that sets VectorMail apart: semantic search. You don&apos;t search by keyword. You ask in plain language.</p>
                            <p>Type &ldquo;emails from Sarah about the Q3 budget&rdquo; or &ldquo;that thread where we discussed the launch date&rdquo; and get the right conversations in one shot. No scrolling, no guessing which words were in the subject.</p>
                            <p>Combine that with AI summaries and fast compose, and you have an inbox built for how people really work.</p>
                          </div>
                        </div>
                        <div className="border-t border-[#e8e4db] p-2">
                          <div className="rounded border border-[#d8d3c7] bg-[#fbfaf7] px-2 py-1.5 text-[9px] text-[#777269]">Ask a question or search your inbox...</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
