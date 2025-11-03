"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap, Check } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { EmailClientMockup } from "./EmailClientMockup"
import { AnimatedEmail3D } from "./AnimatedEmail3D"

export function Hero() {
  const { isSignedIn } = useUser()

  return (
    <div className="relative min-h-screen overflow-hidden pt-48 pb-20 bg-black">
      {/* Static gradient orbs - no animation for performance */}
      <div 
        className="absolute top-20 left-10 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)",
          willChange: "auto"
        }}
      />
      <div 
        className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
          willChange: "auto"
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 100%)",
          willChange: "auto"
        }}
      />

      {/* Simplified 3D Email in Background - static */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none"
        style={{ zIndex: 0, willChange: "auto" }}
      >
        <AnimatedEmail3D />
      </div>

      <div className="relative max-w-7xl mx-auto px-6" style={{ zIndex: 10 }}>
        {/* Hero Content */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Main Headline */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-tight tracking-tight">
              <span className="text-white">AI Powered Email,</span>
              <br />
              <span className="text-white">Built to </span>
              <span 
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent inline-block"
                style={{
                  filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))"
                }}
              >
                Save You Time
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto">
              VectorMail is an AI-native email client that manages your inbox, so you don't have to.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Link href={isSignedIn ? "/mail" : "/sign-up"}>
                <button 
                  className="group relative px-10 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-2 overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 text-white">Get Started Free</span>
                </button>
              </Link>
              <button 
                className="px-10 py-4 border border-purple-500/30 text-white rounded-xl font-semibold text-lg backdrop-blur-sm bg-gradient-to-r from-purple-500/5 to-pink-500/5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Watch Demo
              </button>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300 mt-8"
            >
              {[
                { icon: Check, text: "No credit card", color: "emerald" },
                { icon: Zap, text: "Setup in 2 min", color: "blue" },
                { icon: Check, text: "Free forever", color: "purple" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-white/5 to-white/10 border border-white/10 backdrop-blur-sm"
                  whileHover={{ 
                    scale: 1.05, 
                    borderColor: "rgba(168, 85, 247, 0.3)",
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Full Email Client Mockup */}
        <div className="relative max-w-[1400px] mx-auto">
          {/* Static glow */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-3xl opacity-30 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))",
              willChange: "auto"
            }}
          />
          
          <EmailClientMockup />
        </div>
      </div>

      {/* Bottom gradient line */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px opacity-50"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5), rgba(168, 85, 247, 0.5), transparent)"
        }}
      />
    </div>
  )
}
