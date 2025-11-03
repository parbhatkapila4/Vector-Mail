"use client"

import { motion } from "framer-motion"
import { Mail, Sparkles, Zap } from "lucide-react"

export function AnimatedEmail3D() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center pointer-events-none">
      {/* Main 3D Email Container */}
      <div className="relative w-[500px] h-[500px]">
        {/* Static glowing orbs - no animation */}
        <div
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(168, 85, 247, 0.4) 50%, transparent 100%)",
            willChange: "auto"
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full blur-3xl opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(249, 115, 22, 0.4) 50%, transparent 100%)",
            willChange: "auto"
          }}
        />

        {/* 3D Email Icon - Simplified static version */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Email back layer */}
          <div
            className="absolute w-64 h-48 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl"
            style={{
              transform: "translateZ(-20px)",
              boxShadow: "0 0 80px rgba(168, 85, 247, 0.4), inset 0 0 60px rgba(168, 85, 247, 0.2)",
              willChange: "auto"
            }}
          />

          {/* Email main layer */}
          <div
            className="relative w-64 h-48 rounded-2xl border-2 bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/50 backdrop-blur-xl overflow-hidden"
            style={{
              borderColor: "rgba(168, 85, 247, 0.5)",
              boxShadow: "0 0 100px rgba(168, 85, 247, 0.6), inset 0 0 80px rgba(168, 85, 247, 0.3)",
              willChange: "auto"
            }}
          >
            {/* Envelope flap - static */}
            <div
              className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-purple-500/40 to-pink-500/40 opacity-50"
              style={{
                clipPath: "polygon(0 0, 50% 60%, 100% 0)",
                borderBottom: "1px solid rgba(168, 85, 247, 0.5)"
              }}
            />

            {/* Mail icon in center - static */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Mail className="w-16 h-16 text-purple-300" strokeWidth={1.5} />
            </div>

            {/* Static glowing lines */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50"
                style={{ top: `${35 + i * 15}%` }}
              />
            ))}
          </div>

          {/* Email front layer (slight offset) */}
          <div
            className="absolute w-64 h-48 rounded-2xl border border-purple-400/20"
            style={{
              transform: "translateZ(20px)",
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
              willChange: "auto"
            }}
          />
        </div>
      </div>

      {/* Bottom glow reflection - static */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-32 rounded-full blur-3xl opacity-40"
        style={{
          background: "radial-gradient(ellipse, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
          willChange: "auto"
        }}
      />
    </div>
  )
}

