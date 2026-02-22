"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Zap,
  Code,
  Users,
  Heart,
  Target,
  TrendingUp,
  MessageCircle,
  Clock,
  AlertTriangle,
  CheckCircle,
  Rocket,
  Shield,
  Globe,
} from "lucide-react";

export default function AboutPage() {
  const problems = [
    {
      icon: Clock,
      title: "Time Wasted Searching",
      description:
        "Spending 30+ minutes daily hunting for that one email from 3 weeks ago. Traditional keyword search just doesn't cut it in 2025.",
    },
    {
      icon: AlertTriangle,
      title: "Information Overload",
      description:
        "Drowning in 200+ daily emails. Important messages buried under newsletters, promotions, and spam.",
    },
    {
      icon: Brain,
      title: "Context Switching Kills Productivity",
      description:
        "Constant interruptions from email notifications destroying deep work sessions. Every ping is a productivity killer.",
    },
  ];

  const motivations = [
    {
      icon: Target,
      title: "Built by Developers, for Developers",
      description:
        "We're engineers who live in our inboxes. We built the email client we always wanted - fast, intelligent, and keyboard-driven.",
    },
    {
      icon: Code,
      title: "Open Source Philosophy",
      description:
        "Email is too important to be locked in proprietary silos. We believe in transparency, community contributions, and owning your data.",
    },
    {
      icon: MessageCircle,
      title: "AI Should Work for You",
      description:
        "AI isn't a gimmick - it's a tool to save hours of manual work. We use it to summarize, search, and draft - not replace human communication.",
    },
  ];

  const whyItMatters = [
    {
      icon: TrendingUp,
      stat: "2.4 hours",
      label: "Average time spent on email daily",
      insight: "That's 600+ hours per year. VectorMail cuts this by 40-60%.",
    },
    {
      icon: Users,
      stat: "306 billion",
      label: "Emails sent daily in 2025",
      insight: "Yet email clients haven't fundamentally changed since 2004.",
    },
    {
      icon: Brain,
      stat: "23 minutes",
      label: "To refocus after an interruption",
      insight: "Smart filtering and AI summaries minimize context switching.",
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

      <div className="px-4 pt-28 sm:hidden">
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
              <span className="text-sm font-semibold text-white">
                Our Story
              </span>
            </motion.div>

            <h1 className="mb-6 w-full break-words text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Why We Built</span>
              <span className="mt-2 block text-white">VectorMail</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-white sm:text-xl lg:text-2xl">
              Because email shouldn't feel like a second job. We built the email
              client we always wanted -
              <span className="font-bold">
                {" "}
                fast, intelligent, and respectful of your time.
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-32 lg:pt-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              The Problem We Faced
            </h2>
            <p className="mx-auto max-w-3xl text-base font-semibold text-white sm:text-lg">
              Like millions of others, we were stuck with email clients built
              for a different era.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 text-center transition-all group-hover:border-slate-700 sm:text-left">
                  <div className="flex justify-center sm:justify-start">
                    <problem.icon className="mb-4 h-10 w-10 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">
                    {problem.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-white">
                    {problem.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <div className="mb-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-800">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    Why I Stopped Using Gmail
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-white sm:text-base">
                    I was a power user of Gmail for over a decade. But as a
                    developer, I needed something different. I needed{" "}
                    <span className="font-bold">semantic search</span> that
                    understood context, not just keywords. I needed{" "}
                    <span className="font-bold">
                      AI that actually saved time
                    </span>
                    , not just auto-suggested three-word responses. I needed{" "}
                    <span className="font-bold">keyboard shortcuts</span> for
                    everything, because every mouse movement is wasted time.
                  </p>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-white sm:text-base">
                    Gmail, Outlook, Apple Mail - they're all built for the
                    average user. But developers, founders, and power users
                    aren't average. We live in our inboxes.{" "}
                    <span className="font-bold">
                      We needed something built for us.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              <span>What </span>
              <span className="text-white">Motivated Us</span>
            </h2>
            <p className="mx-auto max-w-3xl text-base font-semibold text-white sm:text-lg">
              Three core beliefs drive everything we build.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {motivations.map((motivation, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 text-center transition-all group-hover:border-slate-700 sm:text-left">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 sm:mx-0">
                    <motivation.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">
                    {motivation.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-white">
                    {motivation.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center sm:text-left"
            >
              <h2 className="mb-6 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                Email Reimagined for 2025
              </h2>
              <div className="space-y-4 text-sm font-medium leading-relaxed text-white sm:text-base">
                <p>
                  VectorMail started as a frustration. A frustration with
                  spending hours searching for emails. A frustration with
                  missing important messages buried in noise. A frustration with
                  email clients that felt like they were built in 2004 - because
                  they were.
                </p>
                <p>
                  We asked ourselves:{" "}
                  <span className="font-bold">
                    What if email understood you, instead of you having to
                    understand it?
                  </span>
                </p>
                <p>
                  What if you could search by meaning, not keywords? What if AI
                  could draft thoughtful responses, summarize 50-email threads
                  instantly, and surface what actually matters? What if your
                  inbox worked at the speed of thought, entirely from the
                  keyboard?
                </p>
                <p className="font-bold">
                  That's VectorMail. Email built for how we actually work in
                  2025.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="absolute -inset-1 rounded-2xl opacity-0" />
              <div className="relative rounded-2xl border border-slate-800 bg-[#0a0a0a] p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-800">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="mb-2 font-semibold text-white">
                        Production-Grade from Day One
                      </h4>
                      <p className="text-sm font-medium text-white">
                        Built with Next.js 14, tRPC, Prisma, and PostgreSQL.
                        Enterprise architecture, open source.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-800">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="mb-2 font-semibold text-white">
                        AI That Actually Works
                      </h4>
                      <p className="text-sm font-medium text-white">
                        Vector embeddings with pgvector. Semantic search with
                        sub-50ms latency. Multi-provider AI fallback.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-800">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="mb-2 font-semibold text-white">
                        Privacy First
                      </h4>
                      <p className="text-sm font-medium text-white">
                        Zero-knowledge architecture. Your data stays yours. Open
                        source means full transparency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              <span>Why Email Needs to </span>
              <span className="text-white">Evolve Now</span>
            </h2>
          </motion.div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {whyItMatters.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-slate-800 bg-slate-900/50">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div className="mb-2 text-4xl font-black text-white sm:text-5xl">
                  {item.stat}
                </div>
                <div className="mb-2 text-sm font-semibold text-white sm:text-base">
                  {item.label}
                </div>
                <p className="text-xs font-medium text-white sm:text-sm">
                  {item.insight}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <h3 className="mb-6 text-center text-2xl font-black text-white sm:text-3xl">
                Why This Matters to the Market
              </h3>
              <div className="space-y-4 text-center text-sm font-medium leading-relaxed text-white sm:text-left sm:text-base">
                <p>
                  <span className="font-bold">
                    The email market is ripe for disruption.
                  </span>{" "}
                  While every other productivity tool has been transformed by AI
                  - from IDEs (GitHub Copilot) to writing (Notion AI) to design
                  (Figma AI) - email clients remain stuck in the past.
                </p>
                <p>
                  Gmail hasn't fundamentally changed its search or organization
                  in 15 years. Outlook is bloated with enterprise features
                  nobody uses. Superhuman charges $30/month for keyboard
                  shortcuts and basic AI.
                  <span className="font-bold">
                    {" "}
                    There's a massive gap for a truly intelligent, open-source
                    email client.
                  </span>
                </p>
                <p>VectorMail fills that gap. We're building for:</p>
                <ul className="ml-0 space-y-2 text-left sm:ml-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
                    <span>
                      <span className="font-bold">Developers</span> who want
                      keyboard-first workflows and extensibility
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
                    <span>
                      <span className="font-bold">Founders</span> who process
                      500+ emails daily and need intelligent triage
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
                    <span>
                      <span className="font-bold">Privacy-conscious users</span>{" "}
                      who want transparency and control over their data
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
                    <span>
                      <span className="font-bold">Teams</span> who want modern
                      collaboration without vendor lock-in
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              Built Different
            </h2>
            <p className="mx-auto max-w-3xl text-base font-semibold text-white sm:text-lg">
              Modern problems require modern solutions. Here's what makes
              VectorMail different.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 text-center sm:text-left"
            >
              <h3 className="mb-4 flex flex-col items-center gap-3 text-xl font-bold text-white sm:flex-row">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Vector Search vs Keywords
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="mb-1 font-semibold text-red-400">
                    ❌ Traditional Email:
                  </div>
                  <p className="text-xs font-medium text-white">
                    Search "flight booking" → only finds emails with those exact
                    words
                  </p>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-green-400">
                    ✅ VectorMail:
                  </div>
                  <p className="text-xs font-medium text-white">
                    Search "flight booking" → finds confirmations, itineraries,
                    check-in reminders, even if they never mention "booking"
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 text-center sm:text-left"
            >
              <h3 className="mb-4 flex flex-col items-center gap-3 text-xl font-bold text-white sm:flex-row">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                AI That Saves Time
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="mb-1 font-semibold text-red-400">
                    ❌ Gmail Smart Compose:
                  </div>
                  <p className="text-xs font-medium text-white">
                    "Thanks for reaching out!" - 3 word suggestions
                  </p>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-green-400">
                    ✅ VectorMail AI:
                  </div>
                  <p className="text-xs font-medium text-white">
                    Full draft responses understanding context, tone, and your
                    writing style. 50-email thread summaries in 2 seconds.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              <span>What's </span>
              <span className="text-white">Next?</span>
            </h2>

            <p className="mx-auto mb-12 max-w-3xl text-base font-semibold leading-relaxed text-white sm:text-lg">
              VectorMail is just getting started. Here's what we're building
              next.
            </p>

            <div className="mx-auto mb-12 grid max-w-3xl gap-6 sm:grid-cols-2">
              {[
                {
                  title: "Mobile Apps",
                  description:
                    "Native iOS & Android with offline-first architecture",
                  icon: MessageCircle,
                },
                {
                  title: "Team Collaboration",
                  description:
                    "Shared inboxes, @mentions, and real-time collaboration",
                  icon: Users,
                },
                {
                  title: "Advanced Workflows",
                  description:
                    "Custom automations, integrations, and AI-powered routing",
                  icon: Zap,
                },
                {
                  title: "Self-Hosting",
                  description:
                    "Deploy VectorMail on your own infrastructure with one command",
                  icon: Globe,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-slate-800 bg-[#0a0a0a] p-6 text-center sm:text-left"
                >
                  <div className="flex justify-center sm:justify-start">
                    <item.icon className="mb-3 h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 font-bold text-white">{item.title}</h3>
                  <p className="text-sm font-medium text-white">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/features" className="w-full sm:w-auto">
                <button className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-10 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-lg active:scale-95 sm:w-auto">
                  Explore Features
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
