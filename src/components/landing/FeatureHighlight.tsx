"use client";

import { motion } from "framer-motion";
import { Send, MessageSquare, Mail, Zap } from "lucide-react";

export function FeatureHighlight() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2"
          >
            <MessageSquare className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-slate-300">
              AI Email Assistant
            </span>
          </motion.div>
          <h2 className="mb-6 text-4xl font-black text-white sm:text-5xl md:text-6xl">
            Chat with your emails using{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-400 to-yellow-400 bg-clip-text text-transparent">
              natural language
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Ask questions, get summaries, find information - all in plain
            English.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm font-semibold text-white">
                  Recent Emails
                </span>
              </div>
              <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                12 unread
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  sender: "Design Team",
                  subject: "VectorMail UI mockups ready for review",
                  preview:
                    "Hey team! The new dashboard designs are complete...",
                  time: "2m ago",
                  unread: true,
                  priority: true,
                  avatar: "DT",
                  color: "from-yellow-600 to-yellow-400",
                },
                {
                  sender: "Finance Team",
                  subject: "Monthly expense report #1234",
                  preview: "Please review the attached expense report...",
                  time: "15m ago",
                  unread: false,
                  priority: false,
                  avatar: "FT",
                  color: "from-yellow-500 to-amber-500",
                },
                {
                  sender: "Engineering",
                  subject: "Code review for Dashboard v2",
                  preview: "PR #456 is ready for review. All tests passing...",
                  time: "1h ago",
                  unread: true,
                  priority: true,
                  avatar: "EN",
                  color: "from-yellow-500 to-amber-500",
                },
              ].map((email, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="cursor-pointer rounded-lg border border-slate-800 bg-slate-900/30 p-4 transition-all hover:border-slate-700 hover:bg-slate-900/50"
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${email.color} text-sm font-bold text-white`}
                    >
                      {email.avatar}
                      {email.unread && (
                        <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-yellow-500 ring-2 ring-slate-900" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {email.sender}
                        </span>
                        {email.unread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                        )}
                        {email.priority && (
                          <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">
                            <Zap className="mr-1 inline h-2 w-2" />
                            Priority
                          </span>
                        )}
                        <span className="ml-auto text-xs text-slate-500">
                          {email.time}
                        </span>
                      </div>
                      <div className="mb-1 text-sm font-medium text-white">
                        {email.subject}
                      </div>
                      <div className="line-clamp-1 text-xs text-slate-400">
                        {email.preview}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-400">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    Email Assistant
                  </span>
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                </div>
                <p className="text-xs text-slate-400">Always ready to help</p>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <div className="rounded-lg bg-slate-800/50 p-4">
                <p className="text-sm text-slate-300">
                  Hi! I can help you with your emails. Try asking me anything:
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  "Show recent project updates",
                  "Summarize emails from this week",
                  "Find payment receipts from last month",
                  "Reply to team discussion about Q2 goals",
                ].map((suggestion, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-3 text-left text-sm text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-900/50 hover:text-white"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-3">
              <input
                type="text"
                placeholder="Ask me anything about your emails..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                readOnly
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500"
              >
                <Send className="h-4 w-4 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
