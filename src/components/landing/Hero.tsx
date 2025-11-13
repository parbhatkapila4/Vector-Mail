"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { EmailClientMockup } from "./EmailClientMockup";
import { AnimatedEmail3D } from "./AnimatedEmail3D";
import { LampContainer } from "../ui/lamp";
import { useRef, useState, useEffect } from "react";
import { X, Mail, Sparkles, Zap, ArrowRight, Search, Star, Archive, Send, Inbox, Filter, Paperclip } from "lucide-react";

export function Hero() {
  const { isSignedIn } = useUser();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isVideoOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isVideoOpen]);

  // Auto-open app after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowApp(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Static gradient orbs - no animation for performance */}
      <div
        className="pointer-events-none absolute left-5 top-20 h-[300px] w-[300px] rounded-full opacity-20 blur-3xl lg:left-10 lg:h-[600px] lg:w-[600px]"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)",
          willChange: "auto",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-20 right-5 h-[250px] w-[250px] rounded-full opacity-20 blur-3xl lg:right-10 lg:h-[500px] lg:w-[500px]"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
          willChange: "auto",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl lg:h-[700px] lg:w-[700px]"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 100%)",
          willChange: "auto",
        }}
      />

      {/* Simplified 3D Email in Background - static - hidden on mobile */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 hidden -translate-x-1/2 -translate-y-1/2 opacity-30 lg:block"
        style={{ zIndex: 0, willChange: "auto" }}
      >
        <AnimatedEmail3D />
      </div>

      {/* Lamp Effect */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="space-y-8"
        >
          {/* Main Headline with Lamp Effect */}
          <h1 className="px-4 text-center text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            <span className="text-white">AI Powered Email,</span>
            <br />
            <span className="text-white">Built to </span>
            <span
              className="inline-block bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))",
              }}
            >
              Save You Time
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-3xl px-4 text-center text-base text-gray-400 sm:text-lg md:text-xl lg:text-2xl">
            VectorMail is an AI-native email client that manages your inbox, so
            you don't have to.
          </p>

          <p className="px-4 text-center text-xs text-purple-300 sm:text-sm">
            100% Open Source • Production Grade • Modern Stack
          </p>

          {/* CTA */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 px-4 sm:flex-row">
            <Link
              href={isSignedIn ? "/mail" : "/sign-up"}
              className="w-full sm:w-auto"
            >
              <button className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-8 py-3 text-base font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 sm:w-auto sm:px-10 sm:py-4 sm:text-lg">
                <span className="relative z-10 text-white">
                  Get Started Free
                </span>
              </button>
            </Link>
            <button
              onClick={() => setIsVideoOpen(true)}
              className="w-full rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600/5 via-purple-400/5 to-amber-400/5 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 sm:w-auto sm:px-10 sm:py-4 sm:text-lg"
            >
              Watch Demo
            </button>
          </div>
        </motion.div>
      </LampContainer>

      <div
        className="relative mx-auto -mt-10 max-w-7xl px-4 sm:-mt-20 sm:px-6"
        style={{ zIndex: 10 }}
      >
        {/* Full Email Client Mockup - Hidden on mobile, shown on tablet+ */}
        <div className="relative mx-auto hidden max-w-[1400px] pb-20 md:block">
          {/* Static glow */}
          <div
            className="pointer-events-none absolute -inset-4 rounded-3xl opacity-30 blur-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(251, 191, 36, 0.3), rgba(168, 85, 247, 0.3))",
              willChange: "auto",
            }}
          />

          <EmailClientMockup />
        </div>

        {/* Mobile placeholder - iPhone 16 Pro mockup */}
        <div className="relative mx-auto mt-8 pb-12 md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            viewport={{ once: true }}
            className="relative mx-auto w-[375px] max-w-full"
          >
            {/* iPhone 16 Pro Frame */}
            <div className="relative mx-auto w-full rounded-[3.5rem] border-[8px] border-zinc-800 bg-zinc-800 p-1 shadow-2xl">
              {/* Screen Bezel */}
              <div className="relative overflow-hidden rounded-[2.8rem] bg-black">
                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-3 z-50 -translate-x-1/2">
                  <div className="h-7 w-32 rounded-full bg-black"></div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3">
                    <div className="h-1 w-1 rounded-full bg-green-500"></div>
                    <div className="h-0.5 w-12 rounded-full bg-white/20"></div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="absolute left-0 right-0 top-0 z-40 flex items-center justify-end px-6 pt-12 pb-2">
                  <div className="h-2 w-6 rounded-sm border border-white bg-white">
                    <div className="h-full w-4/5 rounded-sm bg-white"></div>
                  </div>
                </div>

                {/* Content Container */}
                <div className="relative min-h-[600px] overflow-hidden rounded-[2.8rem] bg-black pt-16 pb-12">
                  <AnimatePresence mode="wait">
                    {!showApp ? (
                      <motion.div
                        key="home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-16 pb-12"
                      >
                        {/* iOS Home Screen */}
                        <div className="flex h-full flex-col px-6">
                          {/* Time and Date */}
                          <div className="mb-8 mt-4 text-center">
                            <div className="text-4xl font-light text-white">9:41</div>
                            <div className="mt-1 text-sm text-gray-400">Monday, March 18</div>
                          </div>

                          {/* App Icons Grid */}
                          <div className="flex-1 space-y-6">
                            {/* First Row */}
                            <div className="flex justify-center gap-4">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <div className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center">
                                  <Mail className="h-7 w-7 text-white" />
                                </div>
                                <span className="text-[10px] text-white">Mail</span>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <div className="h-14 w-14 rounded-2xl bg-green-500 flex items-center justify-center">
                                  <span className="text-xl">📱</span>
                                </div>
                                <span className="text-[10px] text-white">Messages</span>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center">
                                  <span className="text-xl">📷</span>
                                </div>
                                <span className="text-[10px] text-white">Photos</span>
                              </motion.div>
                            </div>

                            {/* Second Row - VectorMail App */}
                            <div className="flex justify-center gap-4">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setTimeout(() => setShowApp(true), 100);
                                }}
                                className="flex flex-col items-center gap-1 cursor-pointer"
                              >
                                <motion.div
                                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 flex items-center justify-center shadow-lg"
                                  animate={{
                                    boxShadow: [
                                      "0 0 0 0 rgba(168, 85, 247, 0.7)",
                                      "0 0 20px 10px rgba(168, 85, 247, 0.3)",
                                      "0 0 0 0 rgba(168, 85, 247, 0.7)",
                                    ],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <Mail className="h-7 w-7 text-white" />
                                </motion.div>
                                <span className="text-[10px] text-white font-medium">VectorMail</span>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <div className="h-14 w-14 rounded-2xl bg-blue-400 flex items-center justify-center">
                                  <span className="text-xl">🌐</span>
                                </div>
                                <span className="text-[10px] text-white">Safari</span>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center">
                                  <span className="text-xl">📺</span>
                                </div>
                                <span className="text-[10px] text-white">TV</span>
                              </motion.div>
                            </div>

                            {/* Third Row */}
                            <div className="flex justify-center gap-4">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <div className="h-14 w-14 rounded-2xl bg-purple-500 flex items-center justify-center">
                                  <span className="text-xl">🎵</span>
                                </div>
                                <span className="text-[10px] text-white">Music</span>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <div className="h-14 w-14 rounded-2xl bg-yellow-500 flex items-center justify-center">
                                  <span className="text-xl">⚙️</span>
                                </div>
                                <span className="text-[10px] text-white">Settings</span>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <div className="h-14 w-14 rounded-2xl bg-gray-600 flex items-center justify-center">
                                  <span className="text-xl">📦</span>
                                </div>
                                <span className="text-[10px] text-white">Files</span>
                              </motion.div>
                            </div>
                          </div>

                          {/* Dock */}
                          <div className="mb-4 flex justify-center gap-3 rounded-3xl bg-white/10 px-4 py-2 backdrop-blur-xl">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                              <span className="text-lg">📞</span>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                              <span className="text-lg">💬</span>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                              <span className="text-lg">📧</span>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                              <span className="text-lg">🎵</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="app"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="relative min-h-[600px] pt-16 pb-12"
                      >
                        {/* Premium Header */}
                        <div className="relative mb-4 flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 via-amber-500 to-purple-500"></div>
                      <div>
                        <div className="text-base font-bold text-white">VectorMail</div>
                        <div className="text-[10px] text-gray-400">AI-Powered Email</div>
                      </div>
                    </div>
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </motion.div>
                        </div>

                        {/* Interactive Search Bar */}
                        <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="relative mb-4 px-5"
                  >
                    <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                      <Search className="h-4 w-4 text-gray-400" />
                      <motion.input
                        type="text"
                        placeholder="Search emails..."
                        className="flex-1 bg-transparent text-xs text-white placeholder:text-gray-500 focus:outline-none"
                        animate={{
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        readOnly
                      />
                      <motion.div
                        className="rounded border border-white/10 bg-white/10 px-2 py-0.5"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-[10px] text-gray-300">⌘K                        </span>
                        </motion.div>
                        </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="mb-4 flex gap-2 px-5"
                  >
                    {[
                      { icon: Inbox, label: "Inbox", count: "12" },
                      { icon: Star, label: "Starred", count: "5" },
                      { icon: Archive, label: "Archive", count: "89" },
                    ].map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center transition-all hover:border-white/20 hover:bg-white/10"
                        >
                          <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-gray-300" />
                          <div className="text-[9px] font-medium text-white">{action.label}</div>
                          <div className="text-[8px] text-gray-400">{action.count}</div>
                        </motion.button>
                      );
                    })}
                        </motion.div>

                        {/* Premium Email List with Rich Content */}
                        <div className="relative space-y-2 px-5">
                    {[
                      {
                        avatar: "DT",
                        sender: "Design Team",
                        subject: "VectorMail UI mockups ready for review",
                        preview: "Hey team! The new dashboard designs are complete. Let me know your thoughts...",
                        time: "2m",
                        unread: true,
                        priority: "high",
                        attachments: 3,
                      },
                      {
                        avatar: "FT",
                        sender: "Finance Team",
                        subject: "Monthly expense report #1234",
                        preview: "Please review the attached expense report for March. All receipts included.",
                        time: "15m",
                        unread: false,
                        priority: "normal",
                        attachments: 1,
                      },
                      {
                        avatar: "ET",
                        sender: "Engineering",
                        subject: "Code review for Dashboard v2",
                        preview: "PR #456 is ready for review. All tests passing. Need your approval...",
                        time: "1h",
                        unread: true,
                        priority: "high",
                        attachments: 0,
                      },
                    ].map((email, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -30, rotateY: -15 }}
                        whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.6 + i * 0.15,
                          type: "spring",
                          stiffness: 100,
                        }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.02, x: 4, z: 10 }}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg transition-all hover:border-white/20 hover:bg-white/10"
                      >

                        <div className="relative z-10 flex gap-3">
                          {/* Animated Avatar */}
                          <motion.div
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white shadow-lg"
                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          >
                            {email.avatar}
                            {email.unread && (
                              <motion.div
                                className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-black"
                                animate={{
                                  scale: [1, 1.4, 1],
                                  opacity: [1, 0.6, 1],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                            )}
                            {email.priority === "high" && (
                              <motion.div
                                className="absolute -bottom-1 -right-1"
                                animate={{
                                  rotate: [0, 15, -15, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                <Zap className="h-2.5 w-2.5 text-amber-400" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Email Content */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="truncate text-xs font-semibold text-white">
                                {email.sender}
                              </span>
                              {email.unread && (
                                <motion.div
                                  className="h-2 w-2 rounded-full bg-blue-500"
                                  animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                />
                              )}
                              <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-500">
                                {email.time}
                              </span>
                            </div>
                            <div className="mb-1 truncate text-xs font-medium text-gray-200">
                              {email.subject}
                            </div>
                            <div className="mb-1 line-clamp-1 text-[10px] text-gray-400">
                              {email.preview}
                            </div>
                            <div className="flex items-center gap-2">
                              {email.attachments > 0 && (
                                <motion.div
                                  className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-white/10"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <Paperclip className="h-2.5 w-2.5 text-gray-400" />
                                  <span className="text-[9px] text-gray-300">{email.attachments}</span>
                                </motion.div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                whileHover={{ opacity: 1, x: 0 }}
                                className="ml-auto"
                              >
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                        </div>

                        {/* AI Summary Badge */}
                        <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="relative mx-5 mt-4 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-gray-300" />
                      <span className="text-xs font-semibold text-white">AI Summary</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-gray-300">
                      3 unread emails from Design, Finance, and Engineering teams. 2 require action.
                    </p>
                        </motion.div>

                        {/* Animated CTA Footer */}
                        <motion.div
                    className="relative mt-4 px-5 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Link href="/about">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:shadow-purple-500/50"
                      >
                        <span className="flex items-center justify-center gap-2">
                          See our story
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </motion.button>
                    </Link>
                    <motion.p
                      className="mt-2 text-[10px] text-gray-400"
                      animate={{
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Open on desktop for the complete VectorMail experience
                    </motion.p>
                        </motion.div>

                        {/* Home Indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                          <div className="h-1 w-32 rounded-full bg-white/30"></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-purple-500/30 bg-black shadow-2xl"
            >
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-1 text-gray-300 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src="/Vector-Mail-1762579701087.mp4"
                controls
                autoPlay
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
