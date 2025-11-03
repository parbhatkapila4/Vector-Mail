"use client";

import { motion } from "framer-motion";
import { Sparkles, Send, ArrowRight } from "lucide-react";

export function FeatureHighlight() {
  return (
    <section className="relative py-32 overflow-hidden bg-black">
      {/* Static gradient background */}
      <div 
        className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
          willChange: "auto"
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl sm:text-6xl font-black mb-6">
            <span className="text-white">AI email chat with </span>
            <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              natural language
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-3xl font-bold">
            <motion.span 
              className="text-white"
              whileHover={{ scale: 1.05 }}
            >
              Ask away
            </motion.span>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-8 h-8 text-purple-500 rotate-0 sm:rotate-0" />
            </motion.div>
            <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              Get your answers
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Email List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative group"
          >
            {/* Glow effect */}
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"
            />
            <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/20 shadow-2xl">
            <div className="p-6">
              <div className="text-xs text-gray-500 flex items-center justify-between mb-4">
                <span>Pinned</span>
                <span className="bg-white/10 px-2 py-0.5 rounded">3</span>
              </div>
              
              <div className="space-y-2">
                {[
                  { sender: 'VectorMail Team', subject: 'New feature release: AI summaries', time: 'Mar 29', count: '9' },
                  { sender: 'David, Emma, Mike', subject: 'Re: Product roadmap discussion', time: 'Mar 28', count: '6' },
                  { sender: 'Security Alerts', subject: 'Weekly security digest', time: 'Mar 28', count: '8' },
                ].map((email, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10 hover:border hover:border-purple-500/20 transition-all cursor-pointer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {email.sender[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-sm font-medium truncate">{email.sender}</span>
                        {email.count && (
                          <span className="text-xs text-gray-500 bg-white/10 px-1.5 py-0.5 rounded">{email.count}</span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">{email.time}</span>
                      </div>
                      <div className="text-gray-400 text-xs truncate">{email.subject}</div>
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
            className="relative group"
          >
            {/* Glow effect */}
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"
            />
            <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/20 shadow-2xl">
            <div className="p-6">
              {/* Chat Header */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-purple-500/20">
                <motion.div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400" />
                  <Sparkles className="w-5 h-5 text-white relative z-10" />
                </motion.div>
                <span className="text-white font-semibold">Email Assistant</span>
                <motion.div 
                  className="ml-auto w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Chat Icon */}
              <div className="flex justify-center mb-6">
                <motion.div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400" />
                  <Sparkles className="w-8 h-8 text-white relative z-10" />
                </motion.div>
              </div>

              {/* Instructions */}
              <div className="text-center mb-6 space-y-2">
                <p className="text-white font-medium">Ask anything about your emails</p>
                <p className="text-gray-400 text-sm">Ask to do or show anything using natural language</p>
              </div>

              {/* Suggestion Pills */}
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Show recent project updates',
                    'Reply to team discussion',
                    'Find payment receipts',
                  ].map((suggestion, i) => (
                    <motion.button
                      key={i}
                      className="text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 text-sm hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10 hover:border hover:border-purple-500/20 transition-all"
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Schedule team standup meeting',
                    'Summarize this week\'s updates',
                  ].map((suggestion, i) => (
                    <motion.button
                      key={i}
                      className="text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 text-sm hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10 hover:border hover:border-purple-500/20 transition-all"
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-3">
                <input
                  type="text"
                  placeholder="Ask VectorMail AI to do anything..."
                  className="bg-transparent text-white flex-1 outline-none text-sm"
                  readOnly
                />
                <Send className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
