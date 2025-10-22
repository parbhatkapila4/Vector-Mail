"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, CheckCircle, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

const ANIMATION_DELAYS = {
  BADGE: 0.1,
  HEADLINE: 0.2,
  SUBTITLE: 0.3,
  BUTTONS: 0.4,
  TRUST: 0.5,
  DEMO: 0.6,
} as const

const GRADIENT_COLORS = {
  PRIMARY: '#C2847A',
  SECONDARY: '#D4A896',
} as const

const TRUST_INDICATORS = [
  '99.9% Uptime',
  'Enterprise Security',
  'GDPR Compliant',
] as const

const DEMO_FEATURES = [
  { icon: '📧', label: 'Smart Inbox' },
  { icon: '🔍', label: 'AI Search' },
  { icon: '⚡', label: 'Auto-Reply' },
  { icon: '📊', label: 'Analytics' },
] as const

export function Hero() {
  const { isSignedIn } = useUser()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="relative min-h-screen overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C2847A] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C2847A] rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-[#C2847A] rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-8 sm:space-y-10"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2847A]/10 rounded-full text-sm font-medium text-[#C2847A] shadow-sm border border-[#C2847A]/30 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-[#C2847A]" />
            <span>AI-Powered Email Assistant</span>
            <Zap className="w-3 h-3 text-[#C2847A]" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C2847A] to-white leading-tight tracking-tight"
          >
            Email that works
            <br />
            <span className="bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] bg-clip-text">
              for you
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Stop drowning in emails. Our AI understands context, prioritizes what matters, 
            and <span className="text-[#C2847A] font-semibold">responds like you</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link href={isSignedIn ? "/mail" : "/sign-up"}>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-[#C2847A] to-[#D4A896] text-black rounded-xl hover:from-[#D4A896] hover:to-[#C2847A] transition-all duration-300 text-lg font-bold shadow-lg shadow-[#C2847A]/30 hover:shadow-xl hover:shadow-[#C2847A]/50 hover:-translate-y-0.5">
                <span className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            <button className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold shadow-md hover:shadow-lg border border-white/20">
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </span>
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-300"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#C2847A]" />
              <span>{TRUST_INDICATORS[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#C2847A]" />
              <span>{TRUST_INDICATORS[1]}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#C2847A]" />
              <span>{TRUST_INDICATORS[2]}</span>
            </div>
          </motion.div>

          {/* Product Screenshot */}
          <motion.div
            variants={itemVariants}
            className="relative mt-16 sm:mt-20"
          >
            <div className="relative max-w-5xl mx-auto">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] rounded-3xl blur-2xl opacity-30 scale-105" />
              
              {/* Main Card */}
              <div className="relative bg-black/40 backdrop-blur-sm border border-[#C2847A]/20 rounded-3xl p-8 sm:p-12 shadow-2xl">
                {/* Browser Header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="flex-1 bg-gray-800 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                    vectormail.dev
                  </div>
                </div>

                {/* Demo Content */}
                <div className="space-y-6">
                  {/* Email List */}
                  <div className="space-y-3">
                    {DEMO_FEATURES.map((feature, index) => (
                      <div
                        key={feature.label}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-black via-[#C2847A]/20 to-black rounded-lg border border-[#C2847A]/10"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-full flex items-center justify-center text-black font-bold">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{feature.label}</div>
                          <div className="text-gray-400 text-sm">AI-powered email management</div>
                        </div>
                        <div className="w-2 h-2 bg-[#C2847A] rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>

                  {/* Animated Elements */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-full flex items-center justify-center text-black font-bold text-xl animate-pulse">
                      AI
                    </div>
                  </div>
                </div>

                {/* Demo Subtitle */}
                <div className="text-center mt-6">
                  <p className="text-[#C2847A] font-medium">Experience the future of email</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}