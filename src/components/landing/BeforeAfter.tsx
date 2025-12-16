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
    <section className="relative overflow-hidden bg-white py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="mb-6 text-5xl font-bold tracking-tight text-black sm:text-6xl lg:text-7xl">
            The difference is{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              night and day
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            See how VectorMail transforms your entire email workflow
          </p>
        </motion.div>

        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border-2 border-red-200 bg-gradient-to-b from-red-50 to-red-50/30 p-8"
          >
            <div className="absolute -top-4 left-8 flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
              <TrendingDown className="h-4 w-4" />
              {comparison.before.subtitle}
            </div>

            <div className="mb-8 mt-6">
              <h3 className="mb-2 text-3xl font-bold text-gray-900">
                {comparison.before.title}
              </h3>
              <p className="text-gray-600">Frustrating and time-consuming</p>
            </div>

            <div className="mb-8 space-y-4">
              {comparison.before.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 border-t-2 border-red-200 pt-6">
              {comparison.before.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-1 text-2xl font-bold text-red-600">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border-2 border-green-200 bg-gradient-to-b from-green-50 to-green-50/30 p-8 shadow-xl"
          >
            <div className="absolute -top-4 left-8 flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white">
              <TrendingUp className="h-4 w-4" />
              {comparison.after.subtitle}
            </div>

            <div className="mb-8 mt-6">
              <h3 className="mb-2 text-3xl font-bold text-gray-900">
                {comparison.after.title}
              </h3>
              <p className="text-gray-600">Effortless and intelligent</p>
            </div>

            <div className="mb-8 space-y-4">
              {comparison.after.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 border-t-2 border-green-200 pt-6">
              {comparison.after.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-1 text-2xl font-bold text-green-600">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 p-12 text-center text-white"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4 text-7xl font-bold"
          >
            85%
          </motion.div>
          <p className="mb-2 text-2xl font-semibold">Time Saved</p>
          <p className="mx-auto max-w-2xl text-lg text-blue-100">
            Our users save an average of 10+ hours per week with VectorMail's AI
            automation
          </p>
        </motion.div>
      </div>
    </section>
  );
}
