"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Navigation } from "@/components/landing/Navigation"
import { Footer } from "@/components/landing/Footer"
import { 
  ArrowLeft, Mail, Brain, Zap, Code, Users, Heart, 
  Target, TrendingUp, Sparkles, Clock, AlertTriangle,
  CheckCircle, Rocket, Shield, Globe, Github
} from "lucide-react"

export default function AboutPage() {
  const problems = [
    {
      icon: Clock,
      title: "Time Wasted Searching",
      description: "Spending 30+ minutes daily hunting for that one email from 3 weeks ago. Traditional keyword search just doesn't cut it in 2025."
    },
    {
      icon: AlertTriangle,
      title: "Information Overload",
      description: "Drowning in 200+ daily emails. Important messages buried under newsletters, promotions, and spam."
    },
    {
      icon: Brain,
      title: "Context Switching Kills Productivity",
      description: "Constant interruptions from email notifications destroying deep work sessions. Every ping is a productivity killer."
    }
  ]

  const motivations = [
    {
      icon: Target,
      title: "Built by Developers, for Developers",
      description: "We're engineers who live in our inboxes. We built the email client we always wanted - fast, intelligent, and keyboard-driven."
    },
    {
      icon: Code,
      title: "Open Source Philosophy",
      description: "Email is too important to be locked in proprietary silos. We believe in transparency, community contributions, and owning your data."
    },
    {
      icon: Sparkles,
      title: "AI Should Work for You",
      description: "AI isn't a gimmick - it's a tool to save hours of manual work. We use it to summarize, search, and draft - not replace human communication."
    }
  ]

  const whyItMatters = [
    {
      icon: TrendingUp,
      stat: "2.4 hours",
      label: "Average time spent on email daily",
      insight: "That's 600+ hours per year. VectorMail cuts this by 40-60%."
    },
    {
      icon: Users,
      stat: "306 billion",
      label: "Emails sent daily in 2025",
      insight: "Yet email clients haven't fundamentally changed since 2004."
    },
    {
      icon: Brain,
      stat: "23 minutes",
      label: "To refocus after an interruption",
      insight: "Smart filtering and AI summaries minimize context switching."
    }
  ]

  return (
    <div className="min-h-screen bg-black w-full overflow-x-hidden">
      <Navigation />

      {/* Back Button - Desktop */}
      <div className="hidden sm:block fixed top-24 sm:top-32 left-4 sm:left-8 z-40">
        <Link href="/">
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-white transition-all hover:scale-105 backdrop-blur-sm">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Back</span>
          </button>
        </Link>
      </div>

      {/* Mobile Back Button */}
      <div className="sm:hidden pt-20 px-4">
        <Link href="/">
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-white transition-all backdrop-blur-sm">
            <ArrowLeft className="w-3 h-3" />
            <span className="text-xs font-medium">Back</span>
          </button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 md:pt-24 lg:pt-40 xl:pt-48 pb-16 sm:pb-24 lg:pb-32 overflow-hidden">
        {/* Background gradients */}
        <div 
          className="absolute top-0 right-1/4 w-[300px] h-[300px] lg:w-[600px] lg:h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)"
          }}
        />
        <div 
          className="absolute bottom-0 left-1/4 w-[250px] h-[250px] lg:w-[500px] lg:h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)"
          }}
        />

        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6"
              animate={{
                borderColor: ["rgba(168, 85, 247, 0.3)", "rgba(251, 191, 36, 0.3)", "rgba(168, 85, 247, 0.3)"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-purple-300 text-sm font-semibold">Our Story</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight w-full break-words">
              <span className="text-white block">Why We Built</span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent block mt-2">
                VectorMail
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Because email shouldn't feel like a second job. We built the email client we always wanted - 
              <span className="text-purple-300 font-semibold"> fast, intelligent, and respectful of your time.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-black via-purple-950/5 to-black overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              The Problem We Faced
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              Like millions of others, we were stuck with email clients built for a different era.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 h-full group-hover:border-purple-500/50 transition-all">
                  <problem.icon className="w-10 h-10 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Personal Story */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Why I Stopped Using Gmail</h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    I was a power user of Gmail for over a decade. But as a developer, I needed something different. 
                    I needed <span className="text-purple-300 font-semibold">semantic search</span> that understood context, not just keywords. 
                    I needed <span className="text-purple-300 font-semibold">AI that actually saved time</span>, not just auto-suggested three-word responses. 
                    I needed <span className="text-purple-300 font-semibold">keyboard shortcuts</span> for everything, because every mouse movement is wasted time.
                  </p>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mt-4">
                    Gmail, Outlook, Apple Mail - they're all built for the average user. But developers, founders, and power users 
                    aren't average. We live in our inboxes. <span className="text-amber-400 font-semibold">We needed something built for us.</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Motivated Us */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-white">What </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Motivated Us
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              Three core beliefs drive everything we build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {motivations.map((motivation, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 h-full group-hover:border-purple-500/50 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50">
                    <motivation.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{motivation.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{motivation.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Vision */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
                Email Reimagined for 2025
              </h2>
              <div className="space-y-4 text-gray-400 text-sm sm:text-base leading-relaxed">
                <p>
                  VectorMail started as a frustration. A frustration with spending hours searching for emails. 
                  A frustration with missing important messages buried in noise. A frustration with email clients 
                  that felt like they were built in 2004 - because they were.
                </p>
                <p>
                  We asked ourselves: <span className="text-purple-300 font-semibold">What if email understood you, instead of you having to understand it?</span>
                </p>
                <p>
                  What if you could search by meaning, not keywords? What if AI could draft thoughtful responses, 
                  summarize 50-email threads instantly, and surface what actually matters? What if your inbox 
                  worked at the speed of thought, entirely from the keyboard?
                </p>
                <p className="text-white font-semibold">
                  That's VectorMail. Email built for how we actually work in 2025.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-purple-400/30 to-amber-400/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Production-Grade from Day One</h4>
                      <p className="text-gray-400 text-sm">Built with Next.js 14, tRPC, Prisma, and PostgreSQL. Enterprise architecture, open source.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-amber-400 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">AI That Actually Works</h4>
                      <p className="text-gray-400 text-sm">Vector embeddings with pgvector. Semantic search with sub-50ms latency. Multi-provider AI fallback.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Privacy First</h4>
                      <p className="text-gray-400 text-sm">Zero-knowledge architecture. Your data stays yours. Open source means full transparency.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-white">Why Email Needs to </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Evolve Now
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {whyItMatters.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 border border-purple-500/30 mb-4">
                  <item.icon className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  {item.stat}
                </div>
                <div className="text-white font-semibold mb-2 text-sm sm:text-base">{item.label}</div>
                <p className="text-gray-500 text-xs sm:text-sm">{item.insight}</p>
              </motion.div>
            ))}
          </div>

          {/* Market Necessity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 sm:p-8">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 text-center">
                Why This Matters to the Market
              </h3>
              <div className="space-y-4 text-gray-400 text-sm sm:text-base leading-relaxed">
                <p>
                  <span className="text-purple-300 font-semibold">The email market is ripe for disruption.</span> While 
                  every other productivity tool has been transformed by AI - from IDEs (GitHub Copilot) to writing (Notion AI) 
                  to design (Figma AI) - email clients remain stuck in the past.
                </p>
                <p>
                  Gmail hasn't fundamentally changed its search or organization in 15 years. Outlook is bloated with enterprise 
                  features nobody uses. Superhuman charges $30/month for keyboard shortcuts and basic AI. 
                  <span className="text-amber-400 font-semibold"> There's a massive gap for a truly intelligent, open-source email client.</span>
                </p>
                <p>
                  VectorMail fills that gap. We're building for:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span><span className="text-white font-semibold">Developers</span> who want keyboard-first workflows and extensibility</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span><span className="text-white font-semibold">Founders</span> who process 500+ emails daily and need intelligent triage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span><span className="text-white font-semibold">Privacy-conscious users</span> who want transparency and control over their data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span><span className="text-white font-semibold">Teams</span> who want modern collaboration without vendor lock-in</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Technology */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-black via-purple-950/5 to-black overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Built Different
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              Modern problems require modern solutions. Here's what makes VectorMail different.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                Vector Search vs Keywords
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-red-400 font-semibold mb-1">❌ Traditional Email:</div>
                  <p className="text-gray-500 text-xs">Search "flight booking" → only finds emails with those exact words</p>
                </div>
                <div>
                  <div className="text-green-400 font-semibold mb-1">✅ VectorMail:</div>
                  <p className="text-gray-400 text-xs">Search "flight booking" → finds confirmations, itineraries, check-in reminders, even if they never mention "booking"</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-amber-400" />
                </div>
                AI That Saves Time
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-red-400 font-semibold mb-1">❌ Gmail Smart Compose:</div>
                  <p className="text-gray-500 text-xs">"Thanks for reaching out!" - 3 word suggestions</p>
                </div>
                <div>
                  <div className="text-green-400 font-semibold mb-1">✅ VectorMail AI:</div>
                  <p className="text-gray-400 text-xs">Full draft responses understanding context, tone, and your writing style. 50-email thread summaries in 2 seconds.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Future We're Building */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
              <span className="text-white">What's </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Next?
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              VectorMail is just getting started. Here's what we're building next.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              {[
                { title: "Mobile Apps", description: "Native iOS & Android with offline-first architecture", icon: Sparkles },
                { title: "Team Collaboration", description: "Shared inboxes, @mentions, and real-time collaboration", icon: Users },
                { title: "Advanced Workflows", description: "Custom automations, integrations, and AI-powered routing", icon: Zap },
                { title: "Self-Hosting", description: "Deploy VectorMail on your own infrastructure with one command", icon: Globe },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-zinc-900 to-black rounded-xl border border-purple-500/30 p-6 text-left"
                >
                  <item.icon className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/we" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 active:scale-95">
                  Join the Community →
                </button>
              </Link>
              <Link href="/features" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-10 py-4 border border-purple-500/30 text-white rounded-xl font-semibold text-lg hover:bg-white/5 hover:border-purple-500/50 transition-all hover:scale-105 active:scale-95">
                  Explore Features
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

