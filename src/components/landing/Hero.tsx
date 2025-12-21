"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { EmailClientMockup } from "./EmailClientMockup";
import {
  ArrowRight,
  Play,
  Zap,
  TrendingUp,
  Mail,
  Brain,
  Search,
} from "lucide-react";
import { useState, useRef } from "react";

export function Hero() {
  const { isSignedIn } = useUser();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(
    useTransform(mouseX, (latest) => latest / 20),
    springConfig,
  );
  const y = useSpring(
    useTransform(mouseY, (latest) => latest / 20),
    springConfig,
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    }
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-[#0a0a0a]"
    >
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      <motion.div
        className="absolute left-1/4 top-1/4 h-[800px] w-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%)",
          filter: "blur(100px)",
          x,
          y,
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-[900px] w-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)",
          filter: "blur(120px)",
          x: useTransform(x, (latest) => -latest * 0.5),
          y: useTransform(y, (latest) => -latest * 0.5),
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)",
          filter: "blur(90px)",
          x: useTransform(x, (latest) => latest * 0.3),
          y: useTransform(y, (latest) => latest * 0.3),
        }}
      />

      {[
        { Icon: Mail, delay: 0, x: "10%", y: "20%" },
        { Icon: Brain, delay: 0.5, x: "85%", y: "30%" },
        { Icon: Search, delay: 1, x: "15%", y: "70%" },
        { Icon: Zap, delay: 1.5, x: "80%", y: "75%" },
      ].map(({ Icon, delay, x: xPos, y: yPos }) => (
        <motion.div
          key={Icon.name}
          className="absolute"
          style={{ left: xPos, top: yPos }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0, 1, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        >
          <div className="rounded-full border border-slate-800 bg-slate-900/50 p-3 backdrop-blur-sm">
            <Icon className="h-5 w-5 text-orange-400" />
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:pb-20 lg:pt-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Mail className="h-4 w-4 text-orange-400" />
              </motion.div>
              <span className="text-sm font-medium text-slate-300">
                AI-Powered Email Revolution
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
            >
              <span className="block">Your inbox is</span>
              <span className="block">
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  drowning you
                </span>
              </span>
              <span className="mt-4 block text-4xl text-slate-400 sm:text-5xl md:text-6xl lg:text-7xl">
                We're throwing you a lifeline
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg text-slate-300 sm:text-xl"
            >
              VectorMail uses cutting-edge AI to transform your chaotic inbox
              into a productivity powerhouse.{" "}
              <span className="font-semibold text-white">
                Save 10+ hours per week
              </span>{" "}
              and never miss what matters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { icon: Zap, value: "10x", label: "Faster" },
                { icon: TrendingUp, value: "40%", label: "Time Saved" },
                { icon: Brain, value: "<50ms", label: "AI Search" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                  >
                    <Icon className="mb-2 h-6 w-6 text-orange-400" />
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href={isSignedIn ? "/mail" : "/sign-up"}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <button
                onClick={() => setIsVideoOpen(true)}
                className="flex items-center gap-2 rounded-xl border-2 border-slate-800 bg-slate-900/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-800/50"
              >
                <Play className="h-5 w-5 fill-white" />
                <span>Watch Demo</span>
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl bg-orange-500/10 blur-3xl" />

              <motion.div
                whileHover={{ scale: 1.02, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-2xl"
                style={{
                  x: useTransform(x, (latest) => latest * 0.1),
                  y: useTransform(y, (latest) => latest * 0.1),
                }}
              >
                <div className="overflow-hidden rounded-2xl">
                  <EmailClientMockup />
                </div>
              </motion.div>

              {[
                {
                  text: "AI Summary",
                  top: "-10%",
                  left: "-5%",
                  delay: 0,
                  color: "from-orange-500 to-amber-500",
                },
                {
                  text: "10x Faster",
                  top: "50%",
                  right: "-10%",
                  delay: 0.3,
                  color: "from-amber-500 to-yellow-500",
                },
                {
                  text: "Smart Search",
                  bottom: "-5%",
                  left: "10%",
                  delay: 0.6,
                  color: "from-yellow-500 to-orange-500",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + card.delay, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                  className={`absolute rounded-xl border border-slate-800 bg-gradient-to-br ${card.color} bg-opacity-10 px-4 py-2 backdrop-blur-xl`}
                  style={{
                    top: card.top,
                    left: card.left,
                    right: card.right,
                    bottom: card.bottom,
                  }}
                >
                  <span className="text-sm font-semibold text-white">
                    {card.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {isVideoOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setIsVideoOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl border-2 border-slate-800 bg-black shadow-2xl"
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <video
              className="h-full w-full object-cover"
              src="/Vector-Mail-1762579701087.mp4"
              controls
              autoPlay
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
