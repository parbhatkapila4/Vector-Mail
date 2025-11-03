"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { EmailClientMockup } from "./EmailClientMockup"
import { AnimatedEmail3D } from "./AnimatedEmail3D"
import { LampContainer } from "../ui/lamp"

export function Hero() {
  const { isSignedIn } = useUser()

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Static gradient orbs - no animation for performance */}
      <div 
        className="absolute top-20 left-5 lg:left-10 w-[300px] h-[300px] lg:w-[600px] lg:h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)",
          willChange: "auto"
        }}
      />
      <div 
        className="absolute bottom-20 right-5 lg:right-10 w-[250px] h-[250px] lg:w-[500px] lg:h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
          willChange: "auto"
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[700px] lg:h-[700px] rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 100%)",
          willChange: "auto"
        }}
      />

      {/* Simplified 3D Email in Background - static - hidden on mobile */}
      <div
        className="hidden lg:block absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none"
        style={{ zIndex: 0, willChange: "auto" }}
      >
        <AnimatedEmail3D />
      </div>

      {/* Lamp Effect */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="space-y-8"
        >
          {/* Main Headline with Lamp Effect */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight tracking-tight text-center px-4">
            <span className="text-white">AI Powered Email,</span>
            <br />
            <span className="text-white">Built to </span>
            <span 
              className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent inline-block"
              style={{
                filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))"
              }}
            >
              Save You Time
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto text-center px-4">
            VectorMail is an AI-native email client that manages your inbox, so you don't have to.
          </p>

          <p className="text-xs sm:text-sm text-purple-300 text-center px-4">
            100% Open Source • Production Grade • Modern Stack
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 px-4">
              <Link href={isSignedIn ? "/mail" : "/sign-up"} className="w-full sm:w-auto">
                <button 
                  className="w-full sm:w-auto group relative px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2 overflow-hidden bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 text-white">Get Started Free</span>
                </button>
              </Link>
              <button 
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 border border-purple-500/30 text-white rounded-xl font-semibold text-base sm:text-lg backdrop-blur-sm bg-gradient-to-r from-purple-600/5 via-purple-400/5 to-amber-400/5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Watch Demo
              </button>
            </div>

        </motion.div>
      </LampContainer>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-20" style={{ zIndex: 10 }}>

        {/* Full Email Client Mockup - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:block relative max-w-[1400px] mx-auto pb-20">
          {/* Static glow */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-3xl opacity-30 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(251, 191, 36, 0.3), rgba(168, 85, 247, 0.3))",
              willChange: "auto"
            }}
          />
          
          <EmailClientMockup />
        </div>

        {/* Mobile placeholder - simplified view */}
        <div className="md:hidden relative mx-auto pb-12">
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/20">
              <div className="text-white font-semibold text-sm">VectorMail Preview</div>
              <div className="w-6 h-6 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-white/5 rounded-lg border border-purple-500/20"></div>
              <div className="h-12 bg-white/5 rounded-lg border border-purple-500/20"></div>
              <div className="h-12 bg-white/5 rounded-lg border border-purple-500/20"></div>
            </div>
            <p className="text-center text-purple-300 text-xs mt-4">View on desktop for full experience</p>
          </div>
        </div>
      </div>
    </div>
  )
}
