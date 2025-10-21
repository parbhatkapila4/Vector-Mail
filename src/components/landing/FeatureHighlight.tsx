"use client";

import { motion } from "framer-motion";
import { Brain, ArrowRight, CheckCircle, Clock, Zap } from "lucide-react";

export function FeatureHighlight() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2847A]/10 border border-[#C2847A]/30 rounded-full text-sm font-medium text-[#C2847A] shadow-sm"
              >
                <Brain className="w-4 h-4 text-[#C2847A]" />
                <span>AI-Powered Intelligence</span>
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C2847A] to-white leading-tight">
                Smart Prioritization
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                VectorMail's AI learns your communication patterns and automatically surfaces the most important emails first. No more digging through endless messages to find what matters.
              </p>
            </div>

            {/* Feature Benefits */}
            <div className="space-y-4">
              {[
                { icon: Zap, text: "Instant email prioritization based on your behavior", color: "from-[#C2847A] to-[#D4A896]" },
                { icon: Clock, text: "Save 2+ hours per week on email management", color: "from-[#D4A896] to-[#C2847A]" },
                { icon: CheckCircle, text: "Never miss important messages again", color: "from-[#B0735E] to-[#C2847A]" }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 group"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300 shadow-[#C2847A]/30`}>
                    <benefit.icon className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-gray-300 text-base leading-relaxed pt-1.5">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C2847A] to-[#D4A896] text-black rounded-xl hover:from-[#D4A896] hover:to-[#C2847A] transition-all duration-300 shadow-lg shadow-[#C2847A]/30 hover:shadow-xl hover:shadow-[#C2847A]/50 hover:-translate-y-0.5 text-base font-bold">
                <span>See how it works</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Enhanced Email Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] rounded-2xl blur-2xl opacity-30"></div>

            {/* Main Feature Card */}
            <div className="relative bg-white/5 rounded-2xl border border-[#C2847A]/30 shadow-2xl p-6 backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-xl flex items-center justify-center shadow-lg shadow-[#C2847A]/30">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Smart Prioritization</h3>
                  <p className="text-sm text-[#C2847A]">AI analyzing your emails</p>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#C2847A] to-[#D4A896] rounded-full animate-pulse shadow-lg shadow-[#C2847A]/50"></div>
                </div>
              </div>

              {/* Email Priority List */}
              <div className="space-y-3">
                {/* High Priority */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-br from-[#C2847A]/20 to-[#D4A896]/20 border border-[#C2847A]/30 rounded-xl hover:shadow-md hover:shadow-[#C2847A]/20 transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">High Priority</span>
                    <span className="text-xs font-semibold text-black bg-[#C2847A] px-3 py-1 rounded-full">Urgent</span>
                  </div>
                  <div className="text-sm text-gray-200 font-medium mb-1">Client deadline approaching</div>
                  <div className="text-xs text-gray-400">From: Sarah Johnson</div>
                </motion.div>

                {/* Medium Priority */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-gradient-to-br from-[#D4A896]/15 to-[#C2847A]/15 border border-[#C2847A]/25 rounded-xl hover:shadow-md hover:shadow-[#C2847A]/20 transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Medium Priority</span>
                    <span className="text-xs font-semibold text-black bg-[#D4A896] px-3 py-1 rounded-full">Today</span>
                  </div>
                  <div className="text-sm text-gray-200 font-medium mb-1">Team meeting reminder</div>
                  <div className="text-xs text-gray-400">From: Calendar</div>
                </motion.div>

                {/* Low Priority */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl hover:shadow-md hover:shadow-[#C2847A]/10 transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Low Priority</span>
                    <span className="text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full">Later</span>
                  </div>
                  <div className="text-sm text-gray-200 font-medium mb-1">Newsletter subscription</div>
                  <div className="text-xs text-gray-400">From: TechCrunch</div>
                </motion.div>
              </div>

              {/* AI Analysis Footer */}
              <div className="mt-6 p-4 bg-gradient-to-br from-[#C2847A]/10 to-[#D4A896]/10 border border-[#C2847A]/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#C2847A]" />
                  <span className="text-sm font-bold text-white">AI Analysis</span>
                </div>
                <div className="text-xs text-gray-300 mb-2">
                  Analyzing 247 emails • Learning your patterns • 99.2% accuracy
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-[#C2847A] to-[#D4A896] h-2 rounded-full shadow-md"
                    initial={{ width: "0%" }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-full flex items-center justify-center shadow-xl shadow-[#C2847A]/50"
            >
              <Zap className="w-6 h-6 text-black" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-[#D4A896] to-[#C2847A] rounded-full flex items-center justify-center shadow-xl shadow-[#C2847A]/50"
            >
              <CheckCircle className="w-5 h-5 text-black" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
