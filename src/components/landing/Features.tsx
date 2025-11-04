"use client";

import { motion } from "framer-motion";
import { Zap, Keyboard, Sparkles, Search, ArrowRight } from "lucide-react";

export function Features() {
  return (
    <>
      {/* Section 1: Designed for power users */}
      <section className="relative overflow-hidden bg-black py-16 sm:py-24 lg:py-32">
        {/* Static gradient background */}
        <div
          className="pointer-events-none absolute right-1/3 top-0 h-[300px] w-[300px] rounded-full opacity-15 blur-3xl lg:h-[500px] lg:w-[500px]"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
            willChange: "auto",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center text-3xl font-black sm:mb-24 sm:text-4xl md:text-5xl lg:mb-32 lg:text-6xl"
          >
            <span className="text-white">Designed for </span>
            <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              power users
            </span>
            <span className="text-white"> who value time</span>
          </motion.h2>

          {/* Speed Feature */}
          <div className="mb-20 grid items-center gap-8 sm:mb-32 sm:gap-12 lg:mb-40 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                  Speed Is Everything
                </h3>
                <h4 className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-xl font-bold text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] sm:text-2xl lg:text-3xl">
                  Reply in seconds
                </h4>
              </div>
            </motion.div>

            {/* Email Compose Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Glow effect - subtle pulse */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-75" />
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 to-black p-3 shadow-2xl sm:p-4 md:p-6"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* To field */}
                <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
                  <span className="text-xs text-gray-500 sm:text-sm">To:</span>
                  <div className="flex flex-wrap gap-2">
                    {["David", "Emma"].map((name, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600/10 via-purple-400/10 to-amber-400/10 px-2 py-1 sm:gap-2 sm:px-3"
                        whileHover={{
                          scale: 1.05,
                          borderColor: "rgba(168, 85, 247, 0.6)",
                          boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 shadow-lg sm:h-5 sm:w-5" />
                        <span className="text-xs font-medium text-white sm:text-sm">
                          {name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <motion.div
                  className="mb-4 flex items-center gap-2"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  <Zap className="h-3 w-3 flex-shrink-0 text-purple-400 sm:h-4 sm:w-4" />
                  <span className="truncate text-xs font-medium text-white sm:text-sm">
                    Re: VectorMail feature updates
                  </span>
                </motion.div>

                {/* Email Body */}
                <motion.div
                  className="mb-4 rounded-lg border border-purple-500/10 bg-white/5 p-3 sm:p-4"
                  whileHover={{ borderColor: "rgba(168, 85, 247, 0.2)" }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs leading-relaxed text-gray-300 sm:text-sm">
                    Hey team,
                    <br />
                    <br />
                    Just finished reviewing the latest VectorMail dashboard
                    updates. The new semantic search is incredibly fast -
                    finding emails is now instant. The AI summaries are spot-on
                    and save me at least 30 minutes daily.
                    <br />
                    <br />
                    Ready to ship this to production. Great work everyone!
                  </p>
                </motion.div>

                {/* Actions */}
                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <motion.button
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/30 sm:px-4 sm:text-sm"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 25px rgba(168, 85, 247, 0.5)",
                        y: -2,
                      }}
                      whileTap={{ scale: 0.98, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>Send now</span>
                      <span className="text-xs opacity-80">⏎</span>
                    </motion.button>
                    <motion.button
                      className="text-center text-xs text-gray-400 transition-colors hover:text-purple-300 sm:text-left sm:text-sm"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      Add files
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <motion.span
                      className="whitespace-nowrap rounded border border-purple-500/20 bg-purple-500/10 px-2 py-1"
                      whileHover={{
                        scale: 1.05,
                        borderColor: "rgba(168, 85, 247, 0.4)",
                      }}
                    >
                      Neutral
                    </motion.span>
                    <motion.span
                      className="whitespace-nowrap rounded border border-purple-500/20 bg-purple-500/10 px-2 py-1"
                      whileHover={{
                        scale: 1.05,
                        borderColor: "rgba(168, 85, 247, 0.4)",
                      }}
                    >
                      Medium-length
                    </motion.span>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="mt-4 flex gap-4 border-t border-purple-500/10 pt-4 text-xs text-gray-500">
                  <motion.div
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05, color: "#c084fc" }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="rounded border border-purple-500/20 bg-purple-500/10 px-2 py-1">
                      ↓ ↑
                    </span>
                    <span>to navigate</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05, color: "#c084fc" }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="rounded border border-purple-500/20 bg-purple-500/10 px-2 py-1">
                      ⌘Z
                    </span>
                    <span>return generation</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Lightning-Fast Interface */}
          <div className="mb-40 grid items-center gap-16 lg:grid-cols-2">
            {/* Inbox Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative lg:order-2"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-75" />
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 to-black shadow-2xl"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-purple-500/10 p-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="flex items-center gap-2 font-medium text-white"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="h-5 w-5 rounded bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 shadow-lg" />
                      <span>Inbox</span>
                    </motion.div>
                    <motion.button
                      className="text-sm text-gray-400 transition-colors hover:text-purple-300"
                      whileHover={{ x: 2 }}
                    >
                      Select
                    </motion.button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="border-b border-purple-500/10 p-4">
                  <motion.div
                    className="flex items-center gap-2 rounded-lg border border-purple-500/10 bg-white/5 px-3 py-2"
                    whileHover={{ borderColor: "rgba(168, 85, 247, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Search className="h-4 w-4 text-purple-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="flex-1 bg-transparent text-sm text-white outline-none"
                      readOnly
                    />
                    <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                      ⌘K
                    </span>
                  </motion.div>
                </div>

                {/* Category Badge */}
                <div className="p-4">
                  <motion.div
                    className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-600/10 via-purple-400/10 to-amber-400/10 p-4"
                    whileHover={{
                      borderColor: "rgba(168, 85, 247, 0.5)",
                      boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-semibold text-white">
                        Personal
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Security, Deadlines, and Urgent Updates
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Time-sensitive notifications, security alerts, and
                      critical project updates.
                    </p>
                  </motion.div>
                </div>

                {/* Email List */}
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between px-2 text-xs text-gray-500">
                    <span>Pinned</span>
                    <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5">
                      3
                    </span>
                  </div>
                  {[
                    {
                      sender: "Product Team",
                      subject: "VectorMail v2.0 features",
                      time: "Mar 29",
                      count: "9",
                    },
                    {
                      sender: "David, Emma, Mike",
                      subject: "Re: Sprint planning feedback",
                      time: "Mar 28",
                      count: "6",
                    },
                  ].map((email, i) => (
                    <motion.div
                      key={i}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-white/5 p-3 transition-all hover:border-purple-500/20 hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10"
                      whileHover={{ x: 4, scale: 1.01 }}
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
                            <span className="rounded border border-purple-500/30 bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-300">
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
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6 lg:order-1"
            >
              <h3 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                Lightning-Fast Interface
              </h3>
              <p className="text-base leading-relaxed text-gray-400 sm:text-lg lg:text-xl">
                Email at the speed of thought. Navigate your entire inbox using
                just your keyboard. Process hundreds of emails in minutes.
              </p>
            </motion.div>
          </div>

          {/* AI Summaries */}
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-75" />
              <motion.div
                className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 to-black p-6 shadow-2xl"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Thread Header */}
                <motion.div
                  className="mb-4 flex items-center justify-between"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div>
                    <h4 className="mb-1 font-semibold text-white">
                      Re: VectorMail v2.0 roadmap
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-purple-300">
                      <span>March 25 - March 29</span>
                    </div>
                  </div>
                </motion.div>

                {/* Participants */}
                <div className="mb-4 flex gap-2">
                  {["David", "Emma", "Mike"].map((name, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600/10 via-purple-400/10 to-amber-400/10 px-2 py-1"
                      whileHover={{
                        scale: 1.05,
                        borderColor: "rgba(168, 85, 247, 0.6)",
                        boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 shadow-lg" />
                      <span className="text-xs font-medium text-white">
                        {name}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* AI Summary Box */}
                <motion.div
                  className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-600/10 via-purple-400/10 to-amber-400/10 p-4"
                  whileHover={{
                    borderColor: "rgba(168, 85, 247, 0.5)",
                    boxShadow: "0 0 25px rgba(168, 85, 247, 0.3)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-semibold text-white">
                      AI Summary
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-300">
                    VectorMail v2.0 feature discussion. Team reviewed AI-powered
                    summaries, semantic search capabilities, and inbox
                    automation. Strong consensus on prioritizing keyboard
                    shortcuts and smart categorization for power users.
                  </p>
                </motion.div>

                {/* Attachments */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-300">
                      Attachments
                    </span>
                    <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                      4
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "dashboard-v2.fig", size: "21 MB" },
                      { name: "roadmap-notes.docx", size: "3.7 MB" },
                    ].map((file, i) => (
                      <motion.div
                        key={i}
                        className="cursor-pointer rounded-lg border border-transparent bg-white/5 p-3 transition-all hover:border-purple-500/20 hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-1 truncate text-xs font-medium text-white">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-400">{file.size}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <h3 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                AI-Powered Summaries
              </h3>
              <p className="text-base leading-relaxed text-gray-400 sm:text-lg lg:text-xl">
                Your personal email copilot. Let our AI draft responses,
                summarize long threads, and extract action items automatically.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Smart Search */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black py-16 sm:py-24 lg:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Search Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative lg:order-2"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-75" />
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 to-black shadow-2xl"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Search Header */}
                <div className="border-b border-purple-500/10 p-6">
                  <motion.div
                    className="flex items-center gap-3 rounded-lg border border-purple-500/10 bg-white/5 px-4 py-3"
                    whileHover={{ borderColor: "rgba(168, 85, 247, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-1 text-sm text-purple-300">
                      esc
                    </div>
                    <input
                      type="text"
                      placeholder="Search by sender, subject, or content..."
                      className="flex-1 bg-transparent text-white outline-none"
                      readOnly
                    />
                  </motion.div>
                </div>

                {/* Recently Interacted */}
                <div className="p-6">
                  <div className="mb-4 text-sm font-medium text-purple-300">
                    Recently interacted
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        sender: "Finance Team",
                        subject: "Monthly expense report #1234",
                        time: "Mar 29",
                      },
                      {
                        sender: "Marketing Team",
                        subject: "Campaign performance update",
                        time: "Mar 29",
                      },
                      {
                        sender: "Design Team",
                        subject: "VectorMail UI mockups ready",
                        time: "Mar 29",
                        count: "9",
                      },
                      {
                        sender: "Engineering",
                        subject: "Code review for Dashboard v2",
                        time: "Mar 26",
                        count: "5",
                      },
                    ].map((email, i) => (
                      <motion.div
                        key={i}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-white/5 p-3 transition-all hover:border-purple-500/20 hover:bg-gradient-to-r hover:from-purple-600/10 hover:via-purple-400/10 hover:to-amber-400/10"
                        whileHover={{ x: 4, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 text-xs font-bold text-white shadow-lg">
                          {email.sender[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              {email.sender}
                            </span>
                            {email.count && (
                              <span className="rounded border border-purple-500/30 bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-300">
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

                  {/* Keyboard Shortcuts */}
                  <div className="mt-6 border-t border-purple-500/10 pt-4">
                    <div className="mb-3 text-xs font-medium text-purple-300">
                      Open
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "⌘R", action: "Reply" },
                        { key: "⌘E", action: "Archive" },
                        { key: "⌘M", action: "Mark read" },
                      ].map((shortcut, i) => (
                        <motion.div
                          key={i}
                          className="rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-600/10 via-purple-400/10 to-amber-400/10 p-2 text-center"
                          whileHover={{
                            scale: 1.05,
                            borderColor: "rgba(168, 85, 247, 0.4)",
                            boxShadow: "0 0 15px rgba(168, 85, 247, 0.2)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="mb-1 text-xs font-medium text-white">
                            {shortcut.key}
                          </div>
                          <div className="text-xs text-gray-400">
                            {shortcut.action}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6 lg:order-1"
            >
              <h3 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                Smart Search
              </h3>
              <p className="text-base leading-relaxed text-gray-400 sm:text-lg lg:text-xl">
                Your inbox, your rules. Create personalized email processing
                flows that match exactly how you organize, write, reply, and
                work.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
