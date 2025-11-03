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
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
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
                <h3 className="text-4xl font-black text-white">
                  Speed Is Everything
                </h3>
                <h4 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
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
              className="relative group"
            >
              {/* Glow effect - subtle pulse */}
              <div 
                className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"
              />
              <motion.div 
                className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 shadow-2xl"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* To field */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <span className="text-gray-500 text-sm">To:</span>
                  <div className="flex gap-2">
                      {['Adam', 'Ryan'].map((name, i) => (
                      <motion.div 
                        key={i} 
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-3 py-1 rounded-full border border-purple-500/30"
                        whileHover={{ 
                          scale: 1.05,
                          borderColor: "rgba(168, 85, 247, 0.6)",
                          boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)"
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg" />
                        <span className="text-white text-sm font-medium">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <motion.div 
                  className="flex items-center gap-2 mb-4"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">Re: Code review feedback</span>
          </motion.div>

                {/* Email Body */}
                <motion.div 
                  className="bg-white/5 rounded-lg p-4 mb-4 border border-purple-500/10"
                  whileHover={{ borderColor: "rgba(168, 85, 247, 0.2)" }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Hey team,<br /><br />
                    I took a look at the code review feedback. Really like the keyboard navigation - it makes everything much faster to access. The search implementation is clean, though I'd love to see the link to test it out myself.<br /><br />
                    Let me know when you can share the preview and I'll provide more detailed feedback.
          </p>
        </motion.div>

                {/* Actions */}
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/30"
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: "0 0 25px rgba(168, 85, 247, 0.5)",
                        y: -2
                      }}
                      whileTap={{ scale: 0.98, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>Send now</span>
                      <span className="text-xs opacity-80">⏎</span>
                    </motion.button>
                    <motion.button 
                      className="text-gray-400 text-sm hover:text-purple-300 transition-colors"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      Add files
                    </motion.button>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <motion.span 
                      className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded"
                      whileHover={{ scale: 1.05, borderColor: "rgba(168, 85, 247, 0.4)" }}
                    >
                      Neutral
                    </motion.span>
                    <motion.span 
                      className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded"
                      whileHover={{ scale: 1.05, borderColor: "rgba(168, 85, 247, 0.4)" }}
                    >
                      Medium-length
                    </motion.span>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="flex gap-4 mt-4 pt-4 border-t border-purple-500/10 text-xs text-gray-500">
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05, color: "#c084fc" }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded">↓ ↑</span>
                    <span>to navigate</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05, color: "#c084fc" }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded">⌘Z</span>
                    <span>return generation</span>
                  </motion.div>
                </div>
              </motion.div>
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
              className="relative lg:order-2 group"
            >
              {/* Glow effect */}
              <div 
                className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"
              />
              <motion.div 
                className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Header */}
                <div className="p-4 border-b border-purple-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="flex items-center gap-2 text-white font-medium"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded shadow-lg" />
                      <span>Inbox</span>
                    </motion.div>
                    <motion.button 
                      className="text-gray-400 hover:text-purple-300 transition-colors text-sm"
                      whileHover={{ x: 2 }}
                    >
                      Select
                    </motion.button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-purple-500/10">
                  <motion.div 
                    className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-purple-500/10"
                    whileHover={{ borderColor: "rgba(168, 85, 247, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Search className="w-4 h-4 text-purple-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent text-white flex-1 outline-none text-sm"
                      readOnly
                    />
                    <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">⌘K</span>
                  </motion.div>
                </div>

                {/* Category Badge */}
                <div className="p-4">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30"
                    whileHover={{ 
                      borderColor: "rgba(168, 85, 247, 0.5)",
                      boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-semibold text-sm">Personal</span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Security, Deadlines, and Urgent Updates
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Time-sensitive notifications, security alerts, and critical project updates.
                    </p>
                  </motion.div>
                </div>

                {/* Email List */}
                <div className="p-4 space-y-2">
                  <div className="text-xs text-gray-500 flex items-center justify-between px-2">
                    <span>Pinned</span>
                    <span className="bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded">3</span>
                  </div>
                  {[
                    { sender: 'Nizzy', subject: 'New design review', time: 'Mar 29', count: '9' },
                    { sender: 'Alex, Ali, Sarah', subject: 'Re: Design review feedback', time: 'Mar 28', count: '6' },
                  ].map((email, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all cursor-pointer border border-transparent hover:border-purple-500/20"
                      whileHover={{ x: 4, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {email.sender[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white text-sm font-medium truncate">{email.sender}</span>
                          {email.count && (
                            <span className="text-xs text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">{email.count}</span>
                          )}
                          <span className="text-xs text-gray-500 ml-auto">{email.time}</span>
                        </div>
                        <div className="text-gray-400 text-xs truncate">{email.subject}</div>
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
              className="relative group"
            >
              {/* Glow effect */}
              <div 
                className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"
              />
              <motion.div 
                className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 p-6 shadow-2xl"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Thread Header */}
                <motion.div 
                  className="flex items-center justify-between mb-4"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div>
                    <h4 className="text-white font-semibold mb-1">Re: Design review feedback</h4>
                    <div className="flex items-center gap-2 text-xs text-purple-300">
                      <span>March 25 - March 29</span>
                    </div>
                  </div>
                </motion.div>

                {/* Participants */}
                <div className="flex gap-2 mb-4">
                  {['Ali', 'Nick', 'Sarah'].map((name, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-2 py-1 rounded-full border border-purple-500/30"
                      whileHover={{ 
                        scale: 1.05,
                        borderColor: "rgba(168, 85, 247, 0.6)",
                        boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)"
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg" />
                      <span className="text-white text-xs font-medium">{name}</span>
                    </motion.div>
                  ))}
                  </div>
                  
                {/* AI Summary Box */}
                <motion.div 
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30"
                  whileHover={{ 
                    borderColor: "rgba(168, 85, 247, 0.5)",
                    boxShadow: "0 0 25px rgba(168, 85, 247, 0.3)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-semibold text-sm">AI Summary</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Design review of new email client features. Team discussed command center improvements and category system. General positive feedback, with suggestions for quick actions placement.
                  </p>
                </motion.div>

                {/* Attachments */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300 text-xs font-medium">Attachments</span>
                    <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">4</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'cmd.center.fig', size: '21 MB' },
                      { name: 'comments.docx', size: '3.7 MB' },
                    ].map((file, i) => (
                      <motion.div 
                        key={i} 
                        className="bg-white/5 rounded-lg p-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all cursor-pointer border border-transparent hover:border-purple-500/20"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="text-white text-xs font-medium mb-1 truncate">{file.name}</div>
                        <div className="text-gray-400 text-xs">{file.size}</div>
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
              className="relative lg:order-2 group"
            >
              {/* Glow effect */}
              <div 
                className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"
              />
              <motion.div 
                className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Search Header */}
                <div className="p-6 border-b border-purple-500/10">
                  <motion.div 
                    className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-purple-500/10"
                    whileHover={{ borderColor: "rgba(168, 85, 247, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-purple-300 text-sm bg-purple-500/20 px-2 py-1 rounded border border-purple-500/30">esc</div>
                    <input
                      type="text"
                      placeholder="Search by sender, subject, or content..."
                      className="bg-transparent text-white flex-1 outline-none"
                      readOnly
                    />
                  </motion.div>
                </div>

                {/* Recently Interacted */}
                <div className="p-6">
                  <div className="text-purple-300 text-sm mb-4 font-medium">Recently interacted</div>
                  <div className="space-y-2">
                    {[
                      { sender: 'Stripe', subject: 'Payment confirmation #1234', time: 'Mar 29' },
                      { sender: 'Netflix', subject: 'New shows added to your list', time: 'Mar 29' },
                      { sender: 'Dudu', subject: 'New design review', time: 'Mar 29', count: '9' },
                      { sender: 'Figma', subject: 'Comments on "Landing Page v2"', time: 'Mar 26', count: '5' },
                    ].map((email, i) => (
                      <motion.div 
                        key={i} 
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all cursor-pointer border border-transparent hover:border-purple-500/20"
                        whileHover={{ x: 4, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          {email.sender[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white text-sm font-medium">{email.sender}</span>
                            {email.count && (
                              <span className="text-xs text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">{email.count}</span>
                            )}
                            <span className="text-xs text-gray-500 ml-auto">{email.time}</span>
                          </div>
                          <div className="text-gray-400 text-xs truncate">{email.subject}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div className="mt-6 pt-4 border-t border-purple-500/10">
                    <div className="text-xs text-purple-300 mb-3 font-medium">Open</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: '⌘R', action: 'Reply' },
                        { key: '⌘E', action: 'Archive' },
                        { key: '⌘M', action: 'Mark read' },
                      ].map((shortcut, i) => (
                        <motion.div 
                          key={i} 
                          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-2 text-center border border-purple-500/20"
                          whileHover={{ 
                            scale: 1.05,
                            borderColor: "rgba(168, 85, 247, 0.4)",
                            boxShadow: "0 0 15px rgba(168, 85, 247, 0.2)"
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-white text-xs font-medium mb-1">{shortcut.key}</div>
                          <div className="text-gray-400 text-xs">{shortcut.action}</div>
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
