"use client";

import { motion } from "framer-motion";
import { X, Check, TrendingDown, TrendingUp } from "lucide-react";

const comparison = {
  before: {
    title: "Without VectorMail",
    subtitle: "The old way",
    items: [
      { text: "Manually sort through hundreds of emails", icon: X },
      { text: "Miss important messages in clutter", icon: X },
      { text: "Spend hours writing responses", icon: X },
      { text: "Can't find that one email you need", icon: X },
      { text: "Overwhelmed by inbox chaos", icon: X },
    ],
    stats: [
      { value: "3+ hrs", label: "Daily email time" },
      { value: "40%", label: "Emails missed" },
      { value: "15min", label: "Finding old emails" },
    ],
    color: "red",
  },
  after: {
    title: "With VectorMail",
    subtitle: "The future",
    items: [
      { text: "AI auto-organizes everything instantly", icon: Check },
      { text: "Priority emails always surface first", icon: Check },
      { text: "Generate perfect replies in seconds", icon: Check },
      { text: "Find any email in under 1 second", icon: Check },
      { text: "Inbox zero is actually achievable", icon: Check },
    ],
    stats: [
      { value: "30min", label: "Daily email time" },
      { value: "0%", label: "Emails missed" },
      { value: "< 1sec", label: "Finding old emails" },
    ],
    color: "green",
  },
};

export function BeforeAfter() {
  return (
    <section className="relative bg-white py-32 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 tracking-tight">
            The difference is <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">night and day</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how VectorMail transforms your entire email workflow
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-b from-red-50 to-red-50/30 rounded-3xl p-8 border-2 border-red-200"
          >
            <div className="absolute -top-4 left-8 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              {comparison.before.subtitle}
            </div>

            <div className="mt-6 mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {comparison.before.title}
              </h3>
              <p className="text-gray-600">Frustrating and time-consuming</p>
            </div>

            <div className="space-y-4 mb-8">
              {comparison.before.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <item.icon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-red-200">
              {comparison.before.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-b from-green-50 to-green-50/30 rounded-3xl p-8 border-2 border-green-200 shadow-xl"
          >
            <div className="absolute -top-4 left-8 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {comparison.after.subtitle}
            </div>

            <div className="mt-6 mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {comparison.after.title}
              </h3>
              <p className="text-gray-600">Effortless and intelligent</p>
            </div>

            <div className="space-y-4 mb-8">
              {comparison.after.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <item.icon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-green-200">
              {comparison.after.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-12 text-white"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl font-bold mb-4"
          >
            85%
          </motion.div>
          <p className="text-2xl font-semibold mb-2">Time Saved</p>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Our users save an average of 10+ hours per week with VectorMail's AI automation
          </p>
        </motion.div>
      </div>
    </section>
  );
}
