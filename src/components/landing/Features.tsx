"use client";

import { motion } from "framer-motion";
import { Zap, Keyboard, Sparkles, Search, ArrowRight } from "lucide-react";

export function Features() {
  return (
    <>
      {/* Section 1: Designed for power users */}
      <section className="relative py-32 overflow-hidden bg-black">
        {/* Static gradient background */}
        <div 
          className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
            willChange: "auto"
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-5xl sm:text-6xl font-black text-center mb-32"
          >
            <span className="text-white">Designed for </span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              power users
            </span>
            <span className="text-white"> who value time</span>
          </motion.h2>

          {/* Speed Feature */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-40">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <motion.h3 
                  className="text-4xl font-black text-white"
                  whileHover={{ scale: 1.02 }}
                >
                  Speed Is Everything
                </motion.h3>
                <h4 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
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
              className="relative"
            >
              {/* Glow effect */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-emerald-500/20 p-6 shadow-2xl">
                {/* To field */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <span className="text-gray-500 text-sm">To:</span>
                  <div className="flex gap-2">
                      {['Adam', 'Ryan'].map((name, i) => (
                      <motion.div 
                        key={i} 
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 px-3 py-1 rounded-full border border-emerald-500/30"
                        whileHover={{ scale: 1.05, borderColor: "rgba(16, 185, 129, 0.5)" }}
                      >
                        <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full" />
                        <span className="text-white text-sm font-medium">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-white font-medium">Re: Code review feedback</span>
                </div>

                {/* Email Body */}
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Hey team,<br /><br />
                    I took a look at the code review feedback. Really like the keyboard navigation - it makes everything much faster to access. The search implementation is clean, though I'd love to see the link to test it out myself.<br /><br />
                    Let me know when you can share the preview and I'll provide more detailed feedback.
                  </p>
                </div>

                {/* Actions */}
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-semibold shadow-lg"
                      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Send now</span>
                      <span className="text-xs opacity-80">⏎</span>
                    </motion.button>
                    <button className="text-gray-400 text-sm hover:text-white transition-colors">
                      Add files
                    </button>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="bg-white/5 px-2 py-1 rounded">Neutral</span>
                    <span className="bg-white/5 px-2 py-1 rounded">Medium-length</span>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="flex gap-4 mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="bg-white/10 px-2 py-1 rounded">↓ ↑</span>
                    <span>to navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-white/10 px-2 py-1 rounded">⌘Z</span>
                    <span>return generation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Lightning-Fast Interface */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-40">
            {/* Inbox Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative lg:order-2"
            >
              <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <div className="w-5 h-5 bg-blue-500 rounded" />
                      <span>Inbox</span>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors text-sm">
                      Select
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent text-white flex-1 outline-none text-sm"
                      readOnly
                    />
                    <span className="text-xs text-gray-500 bg-white/10 px-2 py-0.5 rounded">⌘K</span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="p-4">
                  <div className="bg-gradient-to-r from-white/5 to-gray-900 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold text-sm">Personal</span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Security, Deadlines, and Urgent Updates
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Time-sensitive notifications, security alerts, and critical project updates.
                    </p>
                  </div>
                </div>

                {/* Email List */}
                <div className="p-4 space-y-2">
                  <div className="text-xs text-gray-500 flex items-center justify-between px-2">
                    <span>Pinned</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded">3</span>
                  </div>
                  {[
                    { sender: 'Nizzy', subject: 'New design review', time: 'Mar 29', count: '9' },
                    { sender: 'Alex, Ali, Sarah', subject: 'Re: Design review feedback', time: 'Mar 28', count: '6' },
                  ].map((email, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-600 rounded-full flex items-center justify-center text-black text-xs font-bold">
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
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6 lg:order-1"
            >
              <h3 className="text-4xl font-black text-white">Lightning-Fast Interface</h3>
              <p className="text-xl text-gray-400 leading-relaxed">
                Email at the speed of thought. Navigate your entire inbox using just your keyboard. Process hundreds of emails in minutes.
              </p>
            </motion.div>
          </div>

          {/* AI Summaries */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-white/10 p-6 shadow-2xl">
                {/* Thread Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-semibold mb-1">Re: Design review feedback</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>March 25 - March 29</span>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex gap-2 mb-4">
                  {['Ali', 'Nick', 'Sarah'].map((name, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                      <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-600 rounded-full" />
                      <span className="text-white text-xs font-medium">{name}</span>
                    </div>
                  ))}
                </div>

                {/* AI Summary Box */}
                <div className="bg-gradient-to-br from-white/5 to-gray-900 rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold text-sm">AI Summary</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Design review of new email client features. Team discussed command center improvements and category system. General positive feedback, with suggestions for quick actions placement.
                  </p>
                </div>

                {/* Attachments */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs font-medium">Attachments</span>
                    <span className="text-xs text-gray-500 bg-white/10 px-2 py-0.5 rounded">4</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'cmd.center.fig', size: '21 MB' },
                      { name: 'comments.docx', size: '3.7 MB' },
                    ].map((file, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="text-white text-xs font-medium mb-1 truncate">{file.name}</div>
                        <div className="text-gray-500 text-xs">{file.size}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-4xl font-black text-white">AI-Powered Summaries</h3>
              <p className="text-xl text-gray-400 leading-relaxed">
                Your personal email copilot. Let our AI draft responses, summarize long threads, and extract action items automatically.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Smart Search */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Search Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative lg:order-2"
            >
              <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Search Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                    <div className="text-gray-500 text-sm bg-white/10 px-2 py-1 rounded">esc</div>
                    <input
                      type="text"
                      placeholder="Search by sender, subject, or content..."
                      className="bg-transparent text-white flex-1 outline-none"
                      readOnly
                    />
                  </div>
                </div>

                {/* Recently Interacted */}
                <div className="p-6">
                  <div className="text-gray-400 text-sm mb-4">Recently interacted</div>
                  <div className="space-y-2">
                    {[
                      { sender: 'Stripe', subject: 'Payment confirmation #1234', time: 'Mar 29' },
                      { sender: 'Netflix', subject: 'New shows added to your list', time: 'Mar 29' },
                      { sender: 'Dudu', subject: 'New design review', time: 'Mar 29', count: '9' },
                      { sender: 'Figma', subject: 'Comments on "Landing Page v2"', time: 'Mar 26', count: '5' },
                    ].map((email, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-600 rounded-lg flex items-center justify-center text-black text-xs font-bold">
                          {email.sender[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white text-sm font-medium">{email.sender}</span>
                            {email.count && (
                              <span className="text-xs text-gray-500 bg-white/10 px-1.5 py-0.5 rounded">{email.count}</span>
                            )}
                            <span className="text-xs text-gray-500 ml-auto">{email.time}</span>
                          </div>
                          <div className="text-gray-400 text-xs truncate">{email.subject}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-500 mb-3">Open</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: '⌘R', action: 'Reply' },
                        { key: '⌘E', action: 'Archive' },
                        { key: '⌘M', action: 'Mark read' },
                      ].map((shortcut, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-white text-xs font-medium mb-1">{shortcut.key}</div>
                          <div className="text-gray-500 text-xs">{shortcut.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6 lg:order-1"
            >
              <h3 className="text-4xl font-black text-white">Smart Search</h3>
              <p className="text-xl text-gray-400 leading-relaxed">
                Your inbox, your rules. Create personalized email processing flows that match exactly how you organize, write, reply, and work.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
