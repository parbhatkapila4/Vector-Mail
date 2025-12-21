"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Github,
  Code,
  Users,
  GitBranch,
  Star,
  MessageSquare,
  FileCode,
  GitPullRequest,
  Heart,
  Sparkles,
  Lightbulb,
  Target,
  Award,
  Zap,
  CheckCircle,
  Brain,
} from "lucide-react";

export default function WePage() {
  const contributionTypes = [
    {
      icon: Code,
      title: "Write Code",
      description:
        "Add features, fix bugs, optimize performance. Every line of code makes VectorMail better for everyone.",
      examples: [
        "New AI features",
        "Performance improvements",
        "Bug fixes",
        "UI enhancements",
      ],
    },
    {
      icon: Lightbulb,
      title: "Share Ideas",
      description:
        "Your perspective as a developer/founder is invaluable. Suggest features, report issues, discuss architecture.",
      examples: [
        "Feature requests",
        "UX improvements",
        "Architecture discussions",
        "Integration ideas",
      ],
    },
    {
      icon: MessageSquare,
      title: "Help Others",
      description:
        "Answer questions, review PRs, help newcomers get started. Building a community, together.",
      examples: [
        "Code reviews",
        "Documentation",
        "Help with setup",
        "Answer issues",
      ],
    },
    {
      icon: Star,
      title: "Spread the Word",
      description:
        "Star the repo, share on social media, write about your experience. Help other developers discover VectorMail.",
      examples: [
        "GitHub star",
        "Twitter/LinkedIn posts",
        "Blog posts",
        "Show to colleagues",
      ],
    },
  ];

  const whyGithub = [
    {
      icon: Brain,
      title: "Collective Intelligence",
      description:
        "GitHub is where developer thinking happens. Every issue, PR, and discussion captures valuable perspectives and problem-solving approaches.",
    },
    {
      icon: GitBranch,
      title: "Transparent Collaboration",
      description:
        "See exactly what's being built, why decisions were made, and how features evolved. No black boxes, no hidden agendas.",
    },
    {
      icon: Users,
      title: "Global Developer Network",
      description:
        "Contributions from developers worldwide - different time zones, different expertise, different thinking levels, one shared goal.",
    },
    {
      icon: Award,
      title: "Your Legacy",
      description:
        "Every contribution is permanently credited. Your name in the commit history. Your ideas in production. Your impact, forever.",
    },
  ];

  const impactStories = [
    {
      icon: Zap,
      title: "Small Changes, Big Impact",
      quote:
        "Fixed a typo in the docs? That helps thousands avoid confusion. Optimized a query? That saves seconds for everyone, forever.",
      author: "The Compound Effect",
    },
    {
      icon: Target,
      title: "Your Thinking Matters",
      quote:
        "The best features come from developers using the product daily. Your frustrations are feature requests. Your workflows inspire improvements.",
      author: "Build What You Use",
    },
    {
      icon: Heart,
      title: "Part of Something Bigger",
      quote:
        "When you contribute, you're not just coding - you're shaping how millions might manage email in the future. That's powerful.",
      author: "Open Source Impact",
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

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-16 pt-16 sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-24">
        <div className="relative mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8 flex justify-center">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 sm:h-24 sm:w-24"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Github className="h-10 w-10 text-white sm:h-12 sm:w-12" />
              </motion.div>
            </div>

            <h1 className="mb-6 w-full break-words text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">We Build </span>
              <span className="mt-2 block text-white">Together</span>
            </h1>

            <p className="mx-auto mb-6 max-w-3xl text-lg font-semibold leading-relaxed text-white sm:text-xl lg:text-2xl">
              VectorMail isn't built by a company. It's built by{" "}
              <span className="font-bold">a community of developers</span> who
              believe email can be better.
            </p>

            <p className="text-base font-semibold text-white sm:text-lg">
              Your contribution - no matter how small - makes you part of this
              journey.
            </p>
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
              <span>Why </span>
              <span className="text-white">GitHub?</span>
            </h2>
            <p className="mx-auto max-w-3xl text-base font-semibold text-white sm:text-lg">
              Because great software is built through great collaboration.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {whyGithub.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 transition-all group-hover:border-slate-700">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 sm:mx-0">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-center text-xl font-bold text-white sm:text-left">
                    {item.title}
                  </h3>
                  <p className="text-center text-sm font-medium leading-relaxed text-white sm:text-left">
                    {item.description}
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
            className="mx-auto mt-12 max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-800">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-4 text-sm font-medium leading-relaxed text-white sm:text-base">
                  <h3 className="text-xl font-bold text-white sm:text-2xl">
                    GitHub: Where Developer Intelligence Lives
                  </h3>
                  <p>
                    Every GitHub issue is a problem to solve. Every PR is a
                    solution proposed. Every discussion is developers thinking
                    through trade-offs, architecture decisions, and user needs.
                    <span className="font-bold">
                      {" "}
                      This collective thinking makes VectorMail smarter than any
                      individual could.
                    </span>
                  </p>
                  <p>
                    When a developer in Tokyo suggests a feature at 3 AM, and a
                    founder in San Francisco reviews it at 9 AM, and an engineer
                    in Berlin implements it by evening - that's the power of
                    open source.
                    <span className="font-bold">
                      {" "}
                      Different perspectives, different thinking levels, one
                      shared mission.
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
              <span>How </span>
              <span className="text-white">You Can Help</span>
            </h2>
            <p className="mx-auto max-w-3xl text-base font-semibold text-white sm:text-lg">
              Every contribution matters. Whether it's your first PR or your
              hundredth.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2">
            {contributionTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 transition-all group-hover:border-slate-700 sm:p-8">
                  <div className="mb-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800">
                      <type.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                      {type.title}
                    </h3>
                  </div>
                  <p className="mb-4 text-center text-sm font-medium leading-relaxed text-white sm:text-left sm:text-base">
                    {type.description}
                  </p>
                  <div className="space-y-2">
                    <div className="text-center text-xs font-semibold uppercase tracking-wider text-white sm:text-left">
                      Examples:
                    </div>
                    <div className="mx-auto grid max-w-fit grid-cols-2 gap-2 sm:mx-0 sm:max-w-none">
                      {type.examples.map((example, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-white" />
                          <span className="text-center text-xs font-medium text-white sm:text-left">
                            {example}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              Every Contribution Counts
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {impactStories.map((story, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6"
              >
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/50 sm:mx-0">
                  <story.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-3 text-center text-lg font-bold text-white sm:text-left">
                  {story.title}
                </h3>
                <blockquote className="mb-3 border-l-0 border-slate-800 pl-0 text-center text-sm font-medium italic leading-relaxed text-white sm:border-l-2 sm:pl-4 sm:text-left">
                  "{story.quote}"
                </blockquote>
                <div className="text-center text-xs font-semibold text-white sm:text-left">
                  — {story.author}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="mb-8 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              <span className="text-white">
                "I Also Put Some Effort in Making This"
              </span>
            </h2>

            <div className="mx-auto mb-12 max-w-3xl space-y-6 text-sm font-medium leading-relaxed text-white sm:text-base">
              <p className="text-lg sm:text-xl">
                That's the feeling we want every contributor to have.{" "}
                <span className="font-bold">Pride. Ownership. Impact.</span>
              </p>
              <p>
                When someone asks "Who built VectorMail?", we want you to say:{" "}
                <span className="font-bold">
                  "We did. I'm part of the team."
                </span>
              </p>
              <p>
                Your GitHub username in the contributor list. Your ideas in the
                product roadmap. Your code running in production. Your thinking
                level combined with dozens of other brilliant developers,
                creating something none of us could build alone.
              </p>
              <p className="text-lg font-semibold text-white sm:text-xl">
                That's open source. That's VectorMail. That's we.
              </p>
            </div>

            <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {[
                { label: "Contributors", value: "Growing", icon: Users },
                { label: "Commits", value: "Daily", icon: GitBranch },
                {
                  label: "Issues Solved",
                  value: "Together",
                  icon: CheckCircle,
                },
                { label: "Stars", value: "Rising", icon: Star },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-slate-800 bg-[#0a0a0a] p-4 text-center"
                >
                  <stat.icon className="mx-auto mb-2 h-8 w-8 text-white" />
                  <div className="text-2xl font-black text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-white">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href="https://github.com/parbhatkapila4/Vector-Mail"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-10 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-lg active:scale-95 sm:w-auto">
                  <Github className="h-5 w-5" />
                  <span>Start Contributing</span>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              Get Started in Minutes
            </h2>
            <p className="mx-auto max-w-3xl text-base font-semibold text-white sm:text-lg">
              Contributing to VectorMail is easier than you think.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Star the Repo",
                icon: Star,
                description: "Show your support and stay updated",
              },
              {
                step: "02",
                title: "Fork & Clone",
                icon: GitBranch,
                description: "Get the code on your machine",
              },
              {
                step: "03",
                title: "Pick an Issue",
                icon: FileCode,
                description: "Find something that interests you",
              },
              {
                step: "04",
                title: "Submit PR",
                icon: GitPullRequest,
                description: "Share your contribution with the world",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 text-center transition-all hover:border-slate-700">
                  <div className="mb-4 text-5xl font-black text-white">
                    {step.step}
                  </div>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs font-medium text-white">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
              <Heart className="h-10 w-10 text-white" />
            </div>

            <h2 className="mb-6 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              <span>Ready to Be Part of </span>
              <span className="text-white">Something Bigger?</span>
            </h2>

            <p className="mx-auto mb-12 max-w-2xl text-base font-semibold leading-relaxed text-white sm:text-lg">
              Join hundreds of developers building the future of email. Your
              first contribution could be merged today. Your ideas could shape
              tomorrow's features.
              <span className="mt-4 block font-bold">
                This is your invitation to say: "I helped build this."
              </span>
            </p>

            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="text-center">
                  <div className="mb-1 text-3xl font-black text-white">
                    Open
                  </div>
                  <div className="text-sm font-medium text-white">Issues</div>
                </div>
                <div className="h-12 w-px bg-slate-800"></div>
                <div className="text-center">
                  <div className="mb-1 text-3xl font-black text-white">
                    Active
                  </div>
                  <div className="text-sm font-medium text-white">
                    Development
                  </div>
                </div>
                <div className="h-12 w-px bg-slate-800"></div>
                <div className="text-center">
                  <div className="mb-1 text-3xl font-black text-white">
                    Welcome
                  </div>
                  <div className="text-sm font-medium text-white">
                    Contributors
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="https://github.com/parbhatkapila4/Vector-Mail"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto"
            >
              <button className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-12 py-5 text-xl font-bold text-white transition-all hover:scale-105 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-lg active:scale-95 sm:w-auto">
                <Github className="h-6 w-6" />
                <span>View on GitHub</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </button>
            </Link>

            <p className="mt-6 text-sm font-medium text-white">
              ⭐ Star the repo • 🔱 Fork it • 💻 Build together
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
