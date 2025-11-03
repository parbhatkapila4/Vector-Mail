"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Navigation } from "@/components/landing/Navigation"
import { Footer } from "@/components/landing/Footer"
import { 
  ArrowLeft, Github, Code, Users, GitBranch, Star, 
  MessageSquare, FileCode, GitPullRequest, Heart, Sparkles,
  Lightbulb, Target, TrendingUp, Award, Zap, CheckCircle, Brain
} from "lucide-react"

export default function WePage() {
  const contributionTypes = [
    {
      icon: Code,
      title: "Write Code",
      description: "Add features, fix bugs, optimize performance. Every line of code makes VectorMail better for everyone.",
      examples: ["New AI features", "Performance improvements", "Bug fixes", "UI enhancements"]
    },
    {
      icon: Lightbulb,
      title: "Share Ideas",
      description: "Your perspective as a developer/founder is invaluable. Suggest features, report issues, discuss architecture.",
      examples: ["Feature requests", "UX improvements", "Architecture discussions", "Integration ideas"]
    },
    {
      icon: MessageSquare,
      title: "Help Others",
      description: "Answer questions, review PRs, help newcomers get started. Building a community, together.",
      examples: ["Code reviews", "Documentation", "Help with setup", "Answer issues"]
    },
    {
      icon: Star,
      title: "Spread the Word",
      description: "Star the repo, share on social media, write about your experience. Help other developers discover VectorMail.",
      examples: ["GitHub star", "Twitter/LinkedIn posts", "Blog posts", "Show to colleagues"]
    }
  ]

  const whyGithub = [
    {
      icon: Brain,
      title: "Collective Intelligence",
      description: "GitHub is where developer thinking happens. Every issue, PR, and discussion captures valuable perspectives and problem-solving approaches."
    },
    {
      icon: GitBranch,
      title: "Transparent Collaboration",
      description: "See exactly what's being built, why decisions were made, and how features evolved. No black boxes, no hidden agendas."
    },
    {
      icon: Users,
      title: "Global Developer Network",
      description: "Contributions from developers worldwide - different time zones, different expertise, different thinking levels, one shared goal."
    },
    {
      icon: Award,
      title: "Your Legacy",
      description: "Every contribution is permanently credited. Your name in the commit history. Your ideas in production. Your impact, forever."
    }
  ]

  const impactStories = [
    {
      icon: Zap,
      title: "Small Changes, Big Impact",
      quote: "Fixed a typo in the docs? That helps thousands avoid confusion. Optimized a query? That saves seconds for everyone, forever.",
      author: "The Compound Effect"
    },
    {
      icon: Target,
      title: "Your Thinking Matters",
      quote: "The best features come from developers using the product daily. Your frustrations are feature requests. Your workflows inspire improvements.",
      author: "Build What You Use"
    },
    {
      icon: Heart,
      title: "Part of Something Bigger",
      quote: "When you contribute, you're not just coding - you're shaping how millions might manage email in the future. That's powerful.",
      author: "Open Source Impact"
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
            {/* GitHub Icon */}
            <div className="flex justify-center mb-8">
              <motion.div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/50"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Github className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </motion.div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight w-full break-words">
              <span className="text-white block">We Build </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent block mt-2">
                Together
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
              VectorMail isn't built by a company. It's built by <span className="text-purple-300 font-semibold">a community of developers</span> who 
              believe email can be better.
            </p>

            <p className="text-base sm:text-lg text-purple-300 font-semibold">
              Your contribution - no matter how small - makes you part of this journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why GitHub */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-black via-purple-950/5 to-black overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-white">Why </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                GitHub?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              Because great software is built through great collaboration.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {whyGithub.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 h-full group-hover:border-purple-500/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 border border-purple-500/30 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* GitHub as Brain */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-4 text-gray-400 text-sm sm:text-base leading-relaxed">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">GitHub: Where Developer Intelligence Lives</h3>
                  <p>
                    Every GitHub issue is a problem to solve. Every PR is a solution proposed. Every discussion is developers 
                    thinking through trade-offs, architecture decisions, and user needs. 
                    <span className="text-purple-300 font-semibold"> This collective thinking makes VectorMail smarter than any individual could.</span>
                  </p>
                  <p>
                    When a developer in Tokyo suggests a feature at 3 AM, and a founder in San Francisco reviews it at 9 AM, 
                    and an engineer in Berlin implements it by evening - that's the power of open source. 
                    <span className="text-amber-400 font-semibold"> Different perspectives, different thinking levels, one shared mission.</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How to Contribute */}
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
              <span className="text-white">How </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                You Can Help
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              Every contribution matters. Whether it's your first PR or your hundredth.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8">
            {contributionTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 sm:p-8 h-full group-hover:border-purple-500/50 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/50">
                      <type.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{type.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base mb-4 leading-relaxed">{type.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Examples:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {type.examples.map((example, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          <span className="text-gray-500 text-xs">{example}</span>
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

      {/* Impact Stories */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Every Contribution Counts
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {impactStories.map((story, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 border border-purple-500/30 flex items-center justify-center mb-4">
                  <story.icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{story.title}</h3>
                <blockquote className="text-gray-400 text-sm leading-relaxed mb-3 italic border-l-2 border-purple-500/30 pl-4">
                  "{story.quote}"
                </blockquote>
                <div className="text-xs text-purple-300 font-semibold">— {story.author}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Contribution = Your Voice */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8">
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                "I Also Put Some Effort in Making This"
              </span>
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6 text-gray-400 text-sm sm:text-base leading-relaxed mb-12">
              <p className="text-lg sm:text-xl">
                That's the feeling we want every contributor to have. <span className="text-white font-semibold">Pride. Ownership. Impact.</span>
              </p>
              <p>
                When someone asks "Who built VectorMail?", we want you to say: <span className="text-purple-300 font-semibold">"We did. I'm part of the team."</span>
              </p>
              <p>
                Your GitHub username in the contributor list. Your ideas in the product roadmap. Your code running in production. 
                Your thinking level combined with dozens of other brilliant developers, creating something none of us could build alone.
              </p>
              <p className="text-white text-lg sm:text-xl font-semibold">
                That's open source. That's VectorMail. That's we.
              </p>
            </div>

            {/* Contribution Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {[
                { label: "Contributors", value: "Growing", icon: Users },
                { label: "Commits", value: "Daily", icon: GitBranch },
                { label: "Issues Solved", value: "Together", icon: CheckCircle },
                { label: "Stars", value: "Rising", icon: Star },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-zinc-900 to-black rounded-xl border border-purple-500/30 p-4 text-center"
                >
                  <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-black bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Link href="https://github.com/parbhatkapila4/Vector-Mail" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                  <Github className="w-5 h-5" />
                  <span>Start Contributing</span>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-black via-purple-950/5 to-black overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              Contributing to VectorMail is easier than you think.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Star the Repo", icon: Star, description: "Show your support and stay updated" },
              { step: "02", title: "Fork & Clone", icon: GitBranch, description: "Get the code on your machine" },
              { step: "03", title: "Pick an Issue", icon: FileCode, description: "Find something that interests you" },
              { step: "04", title: "Submit PR", icon: GitPullRequest, description: "Share your contribution with the world" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 text-center hover:border-purple-500/50 transition-all">
                  <div className="text-5xl font-black bg-gradient-to-r from-purple-600/30 via-purple-400/30 to-amber-400/30 bg-clip-text text-transparent mb-4">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-xs">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Be Part of We */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 mb-8 shadow-lg shadow-purple-500/50">
              <Heart className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
              <span className="text-white">Ready to Be Part of </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Something Bigger?
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of developers building the future of email. Your first contribution could be merged today. 
              Your ideas could shape tomorrow's features. 
              <span className="text-white font-semibold block mt-4">
                This is your invitation to say: "I helped build this."
              </span>
            </p>

            {/* GitHub Stats Preview */}
            <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 sm:p-8 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">Open</div>
                  <div className="text-sm text-gray-500">Issues</div>
                </div>
                <div className="w-px h-12 bg-purple-500/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">Active</div>
                  <div className="text-sm text-gray-500">Development</div>
                </div>
                <div className="w-px h-12 bg-purple-500/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">Welcome</div>
                  <div className="text-sm text-gray-500">Contributors</div>
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <Link href="https://github.com/parbhatkapila4/Vector-Mail" target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto">
              <button className="w-full sm:w-auto group px-12 py-5 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white rounded-xl font-bold text-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                <Github className="w-6 h-6" />
                <span>View on GitHub</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </button>
            </Link>

            <p className="text-sm text-gray-500 mt-6">
              ⭐ Star the repo • 🔱 Fork it • 💻 Build together
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

