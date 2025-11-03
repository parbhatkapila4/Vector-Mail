"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowRight, Zap, Brain, Search, Keyboard, Shield, Clock, TrendingUp, Mail, 
  Sparkles, Target, BarChart, Database, Code, Layers, GitBranch, Terminal,
  Lock, Users, MessageSquare, FileText, Workflow, Cpu, Globe, Boxes,
  CheckCircle, XCircle, Filter, Tags, Inbox, Send, Archive, ArrowLeft,
  Gauge, Webhook, RefreshCw, Activity
} from "lucide-react"
import { Navigation } from "@/components/landing/Navigation"
import { Footer } from "@/components/landing/Footer"
import { useState } from "react"

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("ai-summaries")

  const stats = [
    { value: "+70%", label: "Faster Email Processing", color: "from-purple-500 to-purple-600", icon: Zap },
    { value: "-85%", label: "Time Spent Searching", color: "from-amber-500 to-amber-600", icon: Search },
    { value: "<50ms", label: "Search Latency (p99)", color: "from-emerald-500 to-emerald-600", icon: TrendingUp },
    { value: "99.9%", label: "Uptime Reliability", color: "from-blue-500 to-blue-600", icon: Shield },
    { value: "94%", label: "Embedding Cache Hit Rate", color: "from-purple-600 to-amber-500", icon: Database },
    { value: "100/min", label: "Email Batch Processing", color: "from-purple-400 to-purple-500", icon: Activity },
  ]

  const features = [
    {
      id: "ai-summaries",
      title: "AI-Powered Email Intelligence",
      icon: Brain,
      description: "Contextual AI that understands your emails and helps you respond faster",
      details: [
        "Automatic thread summarization with key takeaways",
        "Action item extraction and deadline detection",
        "Sentiment analysis for tone understanding",
        "Multi-provider AI fallback (OpenAI → Gemini → Claude)",
        "Streaming responses with 3-4s time-to-first-token",
        "Context window optimization for long threads"
      ]
    },
    {
      id: "semantic-search",
      title: "Vector Search Engine",
      icon: Search,
      description: "pgvector-powered semantic search that finds emails by meaning",
      details: [
        "Natural language queries - no more keyword guessing",
        "Vector embeddings cached in-memory (94% hit rate)",
        "Hybrid search combining vector + BM25 algorithms",
        "Sub-50ms p99 latency on 100k+ emails",
        "Smart indexing - only re-embeds changed content",
        "Find similar conversations automatically"
      ]
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
        "Keyboard shortcut cheat sheet overlay"
      ]
    }
  ]

  const technicalFeatures = [
    {
      icon: Database,
      title: "Database & Caching",
      list: [
        "PostgreSQL with pgvector extension for semantic search",
        "Redis for embedding cache (94% hit rate)",
        "Prisma Data Proxy for connection pooling",
        "Optimized indexes (ivfflat) for vector queries",
        "CRDT-inspired conflict resolution"
      ]
    },
    {
      icon: Layers,
      title: "Infrastructure & Deployment",
      list: [
        "Vercel Edge Functions in 10+ regions",
        "70% reduction in cold starts",
        "Automatic global CDN distribution",
        "Native streaming for AI responses",
        "99.9% uptime with monitoring"
      ]
    },
    {
      icon: Lock,
      title: "Security & Compliance",
      list: [
        "Zero-knowledge encryption architecture",
        "Strict CSP headers for XSS prevention",
        "Rate limiting with exponential backoff",
        "SOC 2 compliance ready infrastructure",
        "GDPR-compliant data export/deletion"
      ]
    },
    {
      icon: Webhook,
      title: "Email Synchronization",
      list: [
        "Dual-sync: Webhooks (real-time) + Polling (reliability)",
        "Incremental sync - only process deltas",
        "Provider abstraction (Gmail, Outlook, IMAP)",
        "Handles 100+ emails/min batch processing",
        "Automatic retry with intelligent backoff"
      ]
    },
    {
      icon: Code,
      title: "Developer Experience",
      list: [
        "tRPC for end-to-end type safety",
        "100% TypeScript codebase",
        "Comprehensive API documentation",
        "Self-hostable with Docker support",
        "Extensible plugin architecture"
      ]
    },
    {
      icon: Gauge,
      title: "Performance Monitoring",
      list: [
        "Sentry integration for error tracking",
        "Datadog APM with distributed tracing",
        "Structured logging with correlation IDs",
        "PagerDuty alerts for critical paths",
        "Real-time performance dashboards"
      ]
    }
  ]

  const aiFeatures = [
    {
      icon: Brain,
      title: "Multi-Model AI System",
      description: "Intelligent routing across OpenAI, Google Gemini, and Claude with automatic failover."
    },
    {
      icon: Sparkles,
      title: "Custom Voice Training",
      description: "Fine-tuned on your sent emails to generate responses that sound authentically like you."
    },
    {
      icon: Target,
      title: "Priority Scoring",
      description: "ML model learns from your behavior to predict which emails need immediate attention."
    },
    {
      icon: MessageSquare,
      title: "Thread Intelligence",
      description: "Deep learning models understand conversation context and suggest relevant actions."
    },
    {
      icon: Filter,
      title: "Smart Categorization",
      description: "Automated email classification into meaningful categories beyond folders."
    },
    {
      icon: Tags,
      title: "Auto-Tagging",
      description: "NLP-powered tag suggestions based on content analysis and your patterns."
    },
  ]

  const productivityFeatures = [
    {
      icon: Workflow,
      title: "Custom Automation",
      description: "Build no-code workflows to automate repetitive email tasks and save hours weekly."
    },
    {
      icon: Clock,
      title: "Send Later",
      description: "Schedule emails for optimal send times based on recipient timezone and behavior."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Shared drafts, internal comments, and collaborative inbox management."
    },
    {
      icon: BarChart,
      title: "Email Analytics",
      description: "Track response times, email volume, and productivity patterns with detailed insights."
    },
    {
      icon: Globe,
      title: "Multi-Account Management",
      description: "Unified interface for Gmail, Outlook, and custom IMAP accounts."
    },
    {
      icon: FileText,
      title: "Smart Attachments",
      description: "AI-powered file organization, preview, and search across all attachments."
    },
  ]

  const comparisonPoints = {
    traditional: [
      { icon: XCircle, text: "Basic keyword search - no semantic understanding" },
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
    ]
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden w-full">
      <Navigation />
      
      {/* Back Button - Hidden on mobile to avoid overlap */}
      <div className="hidden sm:block fixed top-24 sm:top-32 left-4 sm:left-8 z-40">
        <Link href="/">
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-white transition-all hover:scale-105 backdrop-blur-sm">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Back</span>
          </button>
        </Link>
      </div>

      {/* Mobile Back Button - In content flow */}
      <div className="sm:hidden pt-20 px-4">
        <Link href="/">
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-white transition-all backdrop-blur-sm">
            <ArrowLeft className="w-3 h-3" />
            <span className="text-xs font-medium">Back</span>
          </button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 md:pt-24 lg:pt-40 xl:pt-48 pb-12 sm:pb-20 lg:pb-32 overflow-hidden bg-black">
        {/* Background gradient */}
        <div 
          className="absolute top-0 right-1/4 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[600px] lg:h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)"
          }}
        />
        <div 
          className="absolute bottom-0 left-1/4 w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] lg:w-[500px] lg:h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)"
          }}
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-tight w-full break-words">
              <span className="text-white block">Email Reinvented with</span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent block mt-2">
                Vector AI Technology
              </span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 w-full max-w-3xl mx-auto mb-6 break-words">
              Traditional email clients use 1995 keyword search. VectorMail uses semantic vector embeddings and AI to understand what you actually mean.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-purple-300 w-full">
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

      {/* Stats Section */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-b from-black via-purple-950/5 to-black overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Measured Performance Impact
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Real metrics from production deployment showing quantifiable improvements in email workflow efficiency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-8 text-center hover:border-purple-500/50 transition-all">
                  <stat.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <div className={`text-6xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}>
                    {stat.value}
                  </div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features with Tabs */}
      <section className="relative py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl sm:text-6xl font-black mb-4">
              <span className="text-white">AI-Powered </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Core Engine
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Deep dive into the three pillars that make VectorMail fundamentally different.
            </p>
          </motion.div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === feature.id
                    ? 'bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          {features.map((feature) => (
            activeTab === feature.id && (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Feature Icon/Visual */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                  <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-16 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 rounded-full blur-3xl opacity-50" />
                      <feature.icon className="w-32 h-32 text-white relative z-10" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Feature Details */}
                <div className="space-y-6">
                  <h3 className="text-3xl font-black text-white">{feature.title}</h3>
                  <p className="text-xl text-gray-400">{feature.description}</p>
                  
                  <ul className="space-y-4">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          ))}
        </div>
      </section>

      {/* Technical Architecture Section */}
      <section className="relative py-32 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 w-full break-words px-2">
              <span className="text-white">Technical </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Infrastructure
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 w-full max-w-2xl mx-auto px-2">
              Enterprise-grade architecture with modern tooling. Built to scale from 1 to 1 million users.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {technicalFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-8 hover:border-purple-500/50 transition-all h-full">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    {feature.list.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tech Stack Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Powered By Modern Stack</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'Next.js 14', 'TypeScript', 'tRPC', 'PostgreSQL', 'pgvector', 
                'Prisma', 'Redis', 'Clerk Auth', 'OpenAI API', 'Vercel Edge', 
                'Tailwind CSS', 'Framer Motion', 'BullMQ', 'Sentry', 'Datadog'
              ].map((tech, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-purple-300 text-sm font-medium hover:border-purple-500/40 hover:bg-white/10 transition-all"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Capabilities Grid */}
      <section className="relative py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl sm:text-6xl font-black mb-4">
              <span className="text-white">Advanced AI </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Capabilities
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Machine learning and natural language processing at the core of every feature.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 hover:border-purple-500/50 transition-all h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Productivity Features */}
      <section className="relative py-32 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl sm:text-6xl font-black mb-4">
              <span className="text-white">Productivity </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Multipliers
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Features designed to save you hours every week and eliminate email overhead.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productivityFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 hover:border-purple-500/50 transition-all h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Comparison */}
      <section className="relative py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              <span className="text-white">The Difference is </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Clear
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Side-by-side comparison of fundamental approaches to email management.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Traditional Email Clients */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <h3 className="text-3xl font-bold text-white">Traditional Email</h3>
              </div>
              <div className="space-y-3">
                {comparisonPoints.traditional.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <item.icon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* VectorMail */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full" />
                <h3 className="text-3xl font-bold text-white">VectorMail</h3>
              </div>
              <div className="space-y-3">
                {comparisonPoints.vectormail.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-600/5 via-purple-400/5 to-amber-400/5 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-colors">
                    <item.icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/50">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              <span className="text-white">Experience Email</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Stop fighting your inbox. Let AI handle the heavy lifting while you focus on what matters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <button className="px-12 py-5 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all inline-flex items-center gap-3">
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="https://github.com/parbhatkapila4/Vector-Mail" target="_blank">
                <button className="px-12 py-5 border border-purple-500/30 text-white rounded-xl font-bold text-lg hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all inline-flex items-center gap-3">
                  View on GitHub
                  <GitBranch className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
