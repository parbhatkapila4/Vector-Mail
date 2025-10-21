"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Sparkles, Stars, Zap, Mail, Star, Archive, Trash2, Search, MoreHorizontal, Reply, ChevronLeft, ChevronRight, FileText, Image, File } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-screen overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C2847A] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C2847A] rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-[#C2847A] rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32">
        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 sm:space-y-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2847A]/10 rounded-full text-sm font-medium text-[#C2847A] shadow-sm border border-[#C2847A]/30 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-[#C2847A]" />
            <span>AI-Powered Email Assistant</span>
            <Zap className="w-3 h-3 text-[#C2847A]" />
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C2847A] to-white leading-tight tracking-tight">
            Email that works
            <br />
            <span className="bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] bg-clip-text">
            for you
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
            Smart email management powered by AI. Prioritize what matters, 
            <span className="text-[#C2847A] font-semibold"> respond faster</span>, and never miss important messages.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href={isSignedIn ? "/mail" : "/sign-up"}>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-[#C2847A] to-[#D4A896] text-black rounded-xl hover:from-[#D4A896] hover:to-[#C2847A] transition-all duration-300 text-lg font-bold shadow-lg shadow-[#C2847A]/30 hover:shadow-xl hover:shadow-[#C2847A]/50 hover:-translate-y-0.5">
                <span className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            <button className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold shadow-md hover:shadow-lg border border-white/20">
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </span>
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-8 text-sm sm:text-base text-gray-300"
          >
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/10">
              <CheckCircle className="w-5 h-5 text-[#C2847A]" />
              <span className="font-medium">Free to start</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/10">
              <CheckCircle className="w-5 h-5 text-[#C2847A]" />
              <span className="font-medium">2-minute setup</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/10">
              <CheckCircle className="w-5 h-5 text-[#C2847A]" />
              <span className="font-medium">No credit card</span>
            </div>
          </motion.div>
        </motion.div>

        {/* VectorMail Interface Demo */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 sm:mt-24"
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] rounded-2xl blur-2xl opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            <div className="relative rounded-2xl border border-[#C2847A]/20 bg-black/40 backdrop-blur-xl p-4 sm:p-8 shadow-2xl">
              {/* Browser Header */}
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 rounded-t-lg">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-sm text-gray-300 ml-4">
                  vectormail.dev
                </div>
              </div>

              {/* VectorMail Interface */}
              <div className="flex h-[600px] bg-gray-900 text-white rounded-b-lg overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
                  {/* Account Switcher */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      V
                    </div>
                    <div>
                      <div className="text-sm font-medium">VectorMail</div>
                      <div className="text-xs text-gray-400">user@vectormail.dev</div>
                    </div>
                  </div>

                  {/* Compose Button */}
                  <button className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg py-3 px-4 text-left transition-colors mb-6">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>New email</span>
                    </div>
                  </button>

                  {/* Navigation */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Core</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-blue-600">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">Inbox</span>
                        </div>
                        <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">281</span>
                      </div>
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">Favorites</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-700">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">Drafts</span>
                        </div>
                        <span className="text-xs bg-gray-600 px-2 py-1 rounded-full">13</span>
                      </div>
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">Sent</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Management</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700">
                          <Archive className="w-4 h-4" />
                          <span className="text-sm">Archive</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                              <span className="text-xs text-white">!</span>
                            </div>
                            <span className="text-sm">Spam</span>
                          </div>
                          <span className="text-xs bg-gray-600 px-2 py-1 rounded-full">24</span>
                        </div>
                        <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700">
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Bin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Email List */}
                <div className="flex-1 border-r border-gray-700">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Inbox</h3>
                      <div className="flex items-center gap-2">
                        <button className="text-sm text-gray-400 hover:text-white">✓ Select</button>
                        <button className="text-gray-400 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Q Search"
                        className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        ⌘K
                      </div>
                    </div>
                  </div>

                  {/* Filter Buttons */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                        ⚡ Primary
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 w-8 h-8 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 w-8 h-8 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 w-8 h-8 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 w-8 h-8 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Email List */}
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Pinned [3]</div>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">Ali from Baked</span>
                              <span className="text-xs text-gray-400">[9]</span>
                            </div>
                            <span className="text-xs text-gray-400">Mar 29</span>
                          </div>
                          <div className="text-sm text-gray-300 mb-1">New design review</div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-700 cursor-pointer">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">Alex, Ali, Sarah</span>
                              <span className="text-xs text-gray-400">[6]</span>
                            </div>
                            <span className="text-xs text-gray-400">Mar 28</span>
                          </div>
                          <div className="text-sm text-gray-300 mb-1">Re: Design review feedback</div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Primary [278]</div>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">
                                S
                              </div>
                              <span className="font-medium text-sm">Stripe</span>
                            </div>
                            <span className="text-xs text-gray-400">Mar 29</span>
                          </div>
                          <div className="text-sm text-gray-300 mb-1">Payment confirmation #1234</div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-xs font-bold">
                                N
                              </div>
                              <span className="font-medium text-sm">Netflix</span>
                            </div>
                            <span className="text-xs text-gray-400">Mar 29</span>
                          </div>
                          <div className="text-sm text-gray-300 mb-1">New shows added this week</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Email Content */}
                <div className="w-96 bg-gray-800">
                  {/* Email Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <Reply className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <Star className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-2">Re: Design review feedback [6]</h4>
                      <div className="text-xs text-gray-400 mb-3">March 25 - March 29</div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex -space-x-1">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">A</div>
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs">A</div>
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">S</div>
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                      <div className="text-sm font-medium text-purple-300 mb-2">AI Summary</div>
                      <div className="text-xs text-purple-200 leading-relaxed">
                        Design review of new email client features. Team discussed command center improvements and category system. General positive feedback, with suggestions for quick actions placement.
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="text-sm font-medium mb-3">Attachments [4]</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <div className="flex-1">
                          <div className="text-sm">cmd.center.fig</div>
                          <div className="text-xs text-gray-400">21 MB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700">
                        <FileText className="w-4 h-4 text-green-400" />
                        <div className="flex-1">
                          <div className="text-sm">comments.docx</div>
                          <div className="text-xs text-gray-400">3.7 MB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700">
                        <Image className="w-4 h-4 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-sm">img.png</div>
                          <div className="text-xs text-gray-400">2.3 MB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700">
                        <File className="w-4 h-4 text-red-400" />
                        <div className="flex-1">
                          <div className="text-sm">requirements.pdf</div>
                          <div className="text-xs text-gray-400">1.5 MB</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        A
                      </div>
                      <div>
                        <div className="text-sm font-medium">Ali Mamedgasanov</div>
                        <div className="text-xs text-gray-400">To: Alex, Sarah</div>
                      </div>
                      <div className="text-xs text-gray-400 ml-auto">March 25, 10:15 AM</div>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed">
                      yo team, i've updated the email client design with some new interactions. taking a different approach with the command center - much cleaner now. check out the new flows and let me know what you think!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}