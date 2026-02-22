"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Brain,
  Search,
  Keyboard,
  Shield,
  Clock,
  TrendingUp,
  MessageCircle,
  Target,
  BarChart,
  Database,
  Code,
  Layers,
  GitBranch,
  Lock,
  Users,
  MessageSquare,
  FileText,
  Workflow,
  Globe,
  CheckCircle,
  XCircle,
  Filter,
  Tags,
  ArrowLeft,
  Gauge,
  Webhook,
  Activity,
} from "lucide-react";
import { useState } from "react";

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("ai-summaries");

  const stats = [
    {
      value: "+70%",
      label: "Faster Email Processing",
      color: "from-slate-400 to-slate-500",
      icon: Zap,
    },
    {
      value: "-85%",
      label: "Time Spent Searching",
      color: "from-slate-400 to-slate-500",
      icon: Search,
    },
    {
      value: "<50ms",
      label: "Search Latency (p99)",
      color: "from-emerald-500 to-emerald-600",
      icon: TrendingUp,
    },
    {
      value: "99.9%",
      label: "Uptime Reliability",
      color: "from-blue-500 to-blue-600",
      icon: Shield,
    },
    {
      value: "94%",
      label: "Embedding Cache Hit Rate",
      color: "from-slate-500 to-slate-600",
      icon: Database,
    },
    {
      value: "100/min",
      label: "Email Batch Processing",
      color: "from-slate-400 to-slate-500",
      icon: Activity,
    },
  ];

  const features = [
    {
      id: "ai-summaries",
      title: "AI-Powered Email Intelligence",
      icon: Brain,
      description:
        "Contextual AI that understands your emails and helps you respond faster",
      details: [
        "Automatic thread summarization with key takeaways",
        "Action item extraction and deadline detection",
        "Sentiment analysis for tone understanding",
        "Multi-provider AI fallback (OpenAI → Gemini → Claude)",
        "Streaming responses with 3-4s time-to-first-token",
        "Context window optimization for long threads",
      ],
    },
    {
      id: "semantic-search",
      title: "Vector Search Engine",
      icon: Search,
      description:
        "pgvector-powered semantic search that finds emails by meaning",
      details: [
        "Natural language queries - no more keyword guessing",
        "Vector embeddings cached in-memory (94% hit rate)",
        "Hybrid search combining vector + BM25 algorithms",
        "Sub-50ms p99 latency on 100k+ emails",
        "Smart indexing - only re-embeds changed content",
        "Find similar conversations automatically",
      ],
    },
    {
      id: "keyboard-first",
      title: "Power User Interface",
      icon: Keyboard,
      description: "Built for developers who live in their keyboard",
      details: [
        "Complete keyboard navigation - never touch mouse",
        "Command palette (⌘K) for instant actions",
        "Vim-style shortcuts for navigation",
        "Customizable hotkey bindings",
        "Context-aware command suggestions",
        "Keyboard shortcut cheat sheet overlay",
      ],
    },
  ];

  const technicalFeatures = [
    {
      icon: Database,
      title: "Database & Caching",
      list: [
        "PostgreSQL with pgvector extension for semantic search",
        "Redis for embedding cache (94% hit rate)",
        "Prisma Data Proxy for connection pooling",
        "Optimized indexes (ivfflat) for vector queries",
        "CRDT-inspired conflict resolution",
      ],
    },
    {
      icon: Layers,
      title: "Infrastructure & Deployment",
      list: [
        "Vercel Edge Functions in 10+ regions",
        "70% reduction in cold starts",
        "Automatic global CDN distribution",
        "Native streaming for AI responses",
        "99.9% uptime with monitoring",
      ],
    },
    {
      icon: Lock,
      title: "Security & Compliance",
      list: [
        "Zero-knowledge encryption architecture",
        "Strict CSP headers for XSS prevention",
        "Rate limiting with exponential backoff",
        "SOC 2 compliance ready infrastructure",
        "GDPR-compliant data export/deletion",
      ],
    },
    {
      icon: Webhook,
      title: "Email Synchronization",
      list: [
        "Dual-sync: Webhooks (real-time) + Polling (reliability)",
        "Incremental sync - only process deltas",
        "Provider abstraction (Gmail, Outlook, IMAP)",
        "Handles 100+ emails/min batch processing",
        "Automatic retry with intelligent backoff",
      ],
    },
    {
      icon: Code,
      title: "Developer Experience",
      list: [
        "tRPC for end-to-end type safety",
        "100% TypeScript codebase",
        "Comprehensive API documentation",
        "Self-hostable with Docker support",
        "Extensible plugin architecture",
      ],
    },
    {
      icon: Gauge,
      title: "Performance Monitoring",
      list: [
        "Sentry integration for error tracking",
        "Datadog APM with distributed tracing",
        "Structured logging with correlation IDs",
        "PagerDuty alerts for critical paths",
        "Real-time performance dashboards",
      ],
    },
  ];

  const aiFeatures = [
    {
      icon: Brain,
      title: "Multi-Model AI System",
      description:
        "Intelligent routing across OpenAI, Google Gemini, and Claude with automatic failover.",
    },
    {
      icon: MessageCircle,
      title: "Custom Voice Training",
      description:
        "Fine-tuned on your sent emails to generate responses that sound authentically like you.",
    },
    {
      icon: Target,
      title: "Priority Scoring",
      description:
        "ML model learns from your behavior to predict which emails need immediate attention.",
    },
    {
      icon: MessageSquare,
      title: "Thread Intelligence",
      description:
        "Deep learning models understand conversation context and suggest relevant actions.",
    },
    {
      icon: Filter,
      title: "Smart Categorization",
      description:
        "Automated email classification into meaningful categories beyond folders.",
    },
    {
      icon: Tags,
      title: "Auto-Tagging",
      description:
        "NLP-powered tag suggestions based on content analysis and your patterns.",
    },
  ];

  const productivityFeatures = [
    {
      icon: Workflow,
      title: "Custom Automation",
      description:
        "Build no-code workflows to automate repetitive email tasks and save hours weekly.",
    },
    {
      icon: Clock,
      title: "Send Later",
      description:
        "Schedule emails for optimal send times based on recipient timezone and behavior.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Shared drafts, internal comments, and collaborative inbox management.",
    },
    {
      icon: BarChart,
      title: "Email Analytics (planned)",
      description:
        "Planned: track response times, email volume, and productivity patterns. Not yet available.",
    },
    {
      icon: Globe,
      title: "Multi-Account Management",
      description:
        "Unified interface for Gmail, Outlook, and custom IMAP accounts.",
    },
    {
      icon: FileText,
      title: "Smart Attachments",
      description:
        "AI-powered file organization, preview, and search across all attachments.",
    },
  ];

  const comparisonPoints = {
    traditional: [
      {
        icon: XCircle,
        text: "Basic keyword search - no semantic understanding",
      },
      { icon: XCircle, text: "Manual sorting and filing - time-consuming" },
      { icon: XCircle, text: "No AI help - you're completely on your own" },
      { icon: XCircle, text: "Cluttered UI from the 2000s era" },
      { icon: XCircle, text: "Mouse-dependent - slow workflow" },
      { icon: XCircle, text: "Data mining for ads and tracking" },
    ],
    vectormail: [
      { icon: CheckCircle, text: "Vector semantic search - finds by meaning" },
      { icon: CheckCircle, text: "AI auto-organizes everything for you" },
      { icon: CheckCircle, text: "Personal AI copilot assists 24/7" },
      { icon: CheckCircle, text: "Modern, distraction-free design" },
      { icon: CheckCircle, text: "Keyboard-first - lightning fast" },
      { icon: CheckCircle, text: "Zero-knowledge - your data stays private" },
    ],
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0a0a]">

      <div className="fixed left-4 top-4 z-40 hidden sm:left-8 sm:top-6 sm:block">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-slate-700 hover:bg-slate-800/50 sm:px-4">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium sm:text-sm">Back</span>
          </button>
        </Link>
      </div>

      <div className="px-4 pt-4 sm:hidden">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-800/50">
            <ArrowLeft className="h-3 w-3" />
            <span className="text-xs font-medium">Back</span>
          </button>
        </Link>
      </div>

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-12 pt-16 sm:pb-20 sm:pt-20 lg:pb-32 lg:pt-24">

        <div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <h1 className="mb-6 w-full break-words text-3xl font-black leading-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block text-white">Email Reinvented with</span>
              <span className="mt-2 block text-white">
                Vector AI Technology
              </span>
            </h1>

            <p className="mx-auto mb-6 w-full max-w-3xl break-words text-sm font-semibold text-white sm:text-base md:text-lg lg:text-xl">
              Traditional email clients use 1995 keyword search. VectorMail uses
              semantic vector embeddings and AI to understand what you actually
              mean.
            </p>

            <div className="flex w-full flex-wrap items-center justify-center gap-2 text-xs text-white sm:gap-4 sm:text-sm">
              <span className="whitespace-nowrap">🚀 Open Source</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">⚡ Sub-50ms Search</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">🔒 Zero-Knowledge</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">🏗️ Production Grade</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-12 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-black text-white sm:text-5xl">
              Measured Performance Impact
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-semibold text-white">
              Real metrics from production deployment showing quantifiable
              improvements in email workflow efficiency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative rounded-2xl border border-slate-800 bg-[#0a0a0a] p-8 text-center transition-all hover:border-slate-700">
                  <stat.icon className="mx-auto mb-4 h-12 w-12 text-white" />
                  <div
                    className="text-6xl font-black text-white mb-3"
                  >
                    {stat.value}
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-5xl font-black sm:text-6xl">
              <span className="text-white">AI-Powered </span>
              <span className="text-white">
                Core Engine
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-semibold text-white">
              Deep dive into the three pillars that make VectorMail
              fundamentally different.
            </p>
          </motion.div>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all ${activeTab === feature.id
                    ? "bg-slate-800 text-white shadow-lg border border-slate-700"
                    : "border border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {features.map(
            (feature) =>
              activeTab === feature.id && (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid items-center gap-12 lg:grid-cols-2"
                >
                  <div className="group relative">
                    <div className="absolute -inset-1 rounded-2xl opacity-0" />
                    <div className="relative flex items-center justify-center rounded-2xl border border-slate-800 bg-[#0a0a0a] p-16">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full opacity-0" />
                        <feature.icon
                          className="relative z-10 h-32 w-32 text-white"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 text-center sm:text-left">
                    <h3 className="text-3xl font-black text-white">
                      {feature.title}
                    </h3>
                    <p className="text-xl font-semibold text-white">
                      {feature.description}
                    </p>

                    <ul className="space-y-4">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-700">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-semibold text-white">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ),
          )}
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 w-full break-words px-2 text-3xl font-black sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="text-white">Technical </span>
              <span className="text-white">
                Infrastructure
              </span>
            </h2>
            <p className="mx-auto w-full max-w-2xl px-2 text-base font-semibold text-white sm:text-lg">
              Enterprise-grade architecture with modern tooling. Built to scale
              from 1 to 1 million users.
            </p>
          </motion.div>

          <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {technicalFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-8 text-center transition-all hover:border-slate-700 sm:text-left">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 sm:mx-0">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                  <ul className="space-y-2 text-sm font-medium text-white">
                    {feature.list.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="mb-6 text-2xl font-bold text-white">
              Powered By Modern Stack
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Next.js 14",
                "TypeScript",
                "tRPC",
                "PostgreSQL",
                "pgvector",
                "Prisma",
                "Redis",
                "Clerk Auth",
                "OpenAI API",
                "Vercel Edge",
                "Tailwind CSS",
                "Framer Motion",
                "BullMQ",
                "Sentry",
                "Datadog",
              ].map((tech, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-slate-700 hover:bg-slate-800/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-5xl font-black sm:text-6xl">
              <span className="text-white">Advanced AI </span>
              <span className="text-white">
                Capabilities
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-semibold text-white">
              Machine learning and natural language processing at the core of
              every feature.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 text-center transition-all hover:border-slate-700 sm:text-left">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 sm:mx-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-medium text-white">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-5xl font-black sm:text-6xl">
              <span className="text-white">Productivity </span>
              <span className="text-white">
                Multipliers
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-semibold text-white">
              Features designed to save you hours every week and eliminate email
              overhead.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {productivityFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 text-center transition-all hover:border-slate-700 sm:text-left">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 sm:mx-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-medium text-white">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 text-5xl font-black sm:text-6xl">
              <span className="text-white">The Difference is </span>
              <span className="text-white">
                Clear
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-semibold text-white">
              Side-by-side comparison of fundamental approaches to email
              management.
            </p>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="mb-8 flex items-center justify-center gap-3 sm:justify-start">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <h3 className="text-3xl font-bold text-white">
                  Traditional Email
                </h3>
              </div>
              <div className="space-y-3">
                {comparisonPoints.traditional.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center sm:text-left"
                  >
                    <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                    <span className="text-sm font-semibold text-white">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="mb-8 flex items-center justify-center gap-3 sm:justify-start">
                <div className="h-3 w-3 rounded-full bg-white" />
                <h3 className="text-3xl font-bold text-white">VectorMail</h3>
              </div>
              <div className="space-y-3">
                {comparisonPoints.vectormail.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-slate-800 bg-[#0a0a0a] p-4 text-center transition-colors hover:border-slate-700 sm:text-left"
                  >
                    <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
                    <span className="text-sm font-semibold text-white">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 shadow-lg">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="mb-6 text-5xl font-black sm:text-6xl">
              <span className="text-white">Experience Email</span>
              <br />
              <span className="text-white">
                Reimagined
              </span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl font-semibold text-white">
              Stop fighting your inbox. Let AI handle the heavy lifting while
              you focus on what matters.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="https://github.com/parbhatkapila4/Vector-Mail"
                target="_blank"
              >
                <button className="inline-flex items-center gap-3 rounded-xl bg-slate-800 border border-slate-700 px-12 py-5 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:bg-slate-700">
                  View on GitHub
                  <GitBranch className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
