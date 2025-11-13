"use client";

import { motion } from "framer-motion";
import { Sparkles, Send, ArrowRight } from "lucide-react";

export function FeatureHighlight() {
  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-24 lg:py-32">
      {/* Static gradient background */}
      <div
        className="pointer-events-none absolute left-1/3 top-1/3 h-[300px] w-[300px] rounded-full opacity-15 blur-3xl lg:h-[600px] lg:w-[600px]"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
          willChange: "auto",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center sm:mb-16 lg:mb-20"
        >
          <h2 className="mb-6 text-3xl font-black sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="text-white">AI email chat with </span>
            <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              natural language
            </span>
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 text-xl font-bold sm:flex-row sm:gap-8 sm:text-2xl lg:text-3xl">
            <motion.span className="text-white" whileHover={{ scale: 1.05 }}>
              Ask away
            </motion.span>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="h-8 w-8 rotate-0 text-purple-500 sm:rotate-0" />
            </motion.div>
            <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              Get your answers
            </span>
          </div>
        </motion.div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Left: Email List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="group relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-75" />
            <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-br from-zinc-900 to-black shadow-2xl">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Pinned</span>
                  <span className="rounded bg-white/10 px-2 py-0.5">3</span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      sender: "VectorMail Team",
                      subject: "New feature release: AI summaries",
                      time: "Mar 29",
                      count: "9",
                    },
                    {
                      sender: "David, Emma, Mike",
                      subject: "Re: Product roadmap discussion",
                      time: "Mar 28",
                      count: "6",
                    },
                    {
                      sender: "Security Alerts",
                      subject: "Weekly security digest",
                      time: "Mar 28",
                      count: "8",
                    },
                  ].map((email, i) => (
                    <motion.div
                      key={i}
                      className="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3 transition-all hover:border hover:border-purple-500/20 hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10"
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 text-xs font-bold text-white shadow-lg">
                        {email.sender[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-white">
                            {email.sender}
                          </span>
                          {email.count && (
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-500">
                              {email.count}
                            </span>
                          )}
                          <span className="ml-auto text-xs text-gray-500">
                            {email.time}
                          </span>
                        </div>
                        <div className="truncate text-xs text-gray-400">
                          {email.subject}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: AI Chat */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="group relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-75" />
            <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-br from-zinc-900 to-black shadow-2xl">
              <div className="p-6">
                {/* Chat Header */}
                <div className="mb-6 flex items-center gap-2 border-b border-purple-500/20 pb-4">
                  <motion.div
                    className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400" />
                    <Sparkles className="relative z-10 h-5 w-5 text-white" />
                  </motion.div>
                  <span className="font-semibold text-white">
                    Email Assistant
                  </span>
                  <motion.div
                    className="ml-auto h-2 w-2 rounded-full bg-emerald-400"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                {/* Chat Icon */}
                <div className="mb-6 flex justify-center">
                  <motion.div
                    className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400" />
                    <Sparkles className="relative z-10 h-8 w-8 text-white" />
                  </motion.div>
                </div>

                {/* Instructions */}
                <div className="mb-6 space-y-2 text-center">
                  <p className="font-medium text-white">
                    Ask anything about your emails
                  </p>
                  <p className="text-sm text-gray-400">
                    Ask to do or show anything using natural language
                  </p>
                </div>

                {/* Suggestion Pills */}
                <div className="mb-6 space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Show recent project updates",
                      "Reply to team discussion",
                      "Find payment receipts",
                    ].map((suggestion, i) => (
                      <motion.button
                        key={i}
                        className="rounded-lg bg-white/5 px-4 py-2 text-center text-sm text-gray-300 transition-all hover:border hover:border-purple-500/20 hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10 sm:text-left"
                        whileHover={{ scale: 1.02, x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Schedule team standup meeting",
                      "Summarize this week's updates",
                    ].map((suggestion, i) => (
                      <motion.button
                        key={i}
                        className="rounded-lg bg-white/5 px-4 py-2 text-center text-sm text-gray-300 transition-all hover:border hover:border-purple-500/20 hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10 sm:text-left"
                        whileHover={{ scale: 1.02, x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3">
                  <input
                    type="text"
                    placeholder="Ask VectorMail AI to do anything..."
                    className="flex-1 bg-transparent text-sm text-white outline-none"
                    readOnly
                  />
                  <Send className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
