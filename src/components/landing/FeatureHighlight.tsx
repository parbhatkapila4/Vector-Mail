"use client";

import { motion } from "framer-motion";
import { Brain, ArrowRight, CheckCircle, Clock, Zap } from "lucide-react";

export function FeatureHighlight() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700">
                <Brain className="w-4 h-4" />
                <span>AI-Powered Intelligence</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Smart Prioritization
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                VectorMail's AI learns your communication patterns and automatically surfaces the most important emails first. No more digging through endless messages to find what matters.
              </p>
            </div>

            {/* Feature Benefits */}
            <div className="space-y-4">
              {[
                { icon: Zap, text: "Instant email prioritization based on your behavior" },
                { icon: Clock, text: "Save 2+ hours per week on email management" },
                { icon: CheckCircle, text: "Never miss important messages again" }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-gray-700">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-4">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                <span>See how it works</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Side - Enhanced Email Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Feature Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Smart Prioritization</h3>
                  <p className="text-sm text-gray-500">AI analyzing your emails</p>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Email Priority List */}
              <div className="space-y-2">
                {/* High Priority */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">High Priority</span>
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">Urgent</span>
                  </div>
                  <div className="text-sm text-gray-800 font-medium mb-1">Client deadline approaching</div>
                  <div className="text-xs text-gray-500">From: Sarah Johnson</div>
                </div>

                {/* Medium Priority */}
                <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">Medium Priority</span>
                    <span className="text-xs text-gray-600 bg-gray-300 px-2 py-1 rounded-full">Today</span>
                  </div>
                  <div className="text-sm text-gray-800 font-medium mb-1">Team meeting reminder</div>
                  <div className="text-xs text-gray-500">From: Calendar</div>
                </div>

                {/* Low Priority */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">Low Priority</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Later</span>
                  </div>
                  <div className="text-sm text-gray-800 font-medium mb-1">Newsletter subscription</div>
                  <div className="text-xs text-gray-500">From: TechCrunch</div>
                </div>
              </div>

              {/* AI Analysis Footer */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">AI Analysis</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  Analyzing 247 emails • Learning your patterns • 99.2% accuracy
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <motion.div
                    className="bg-gray-600 h-1.5 rounded-full"
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
              className="absolute -top-4 -right-4 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
