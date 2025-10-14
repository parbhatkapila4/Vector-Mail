"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Mail, Brain, Shield, Clock, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { VideoModal } from "@/components/ui/video-modal";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export function Hero() {
  const { isSignedIn } = useUser();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Premium grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:100px_100px] opacity-60"></div>
      
      {/* Sophisticated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139, 90, 122, 0.1), transparent 70%)' }}
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.02, 0.06, 0.02],
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(90, 11, 77, 0.08), transparent 70%)' }}
        />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8"
      >
        {/* Premium status indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/8 to-pink-500/8 border border-purple-500/15 backdrop-blur-2xl mb-16 shadow-xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
          />
          <span className="text-sm font-semibold text-black dark:text-white tracking-wide">
            Enterprise AI Email Platform
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg" />
        </motion.div>

        {/* Revolutionary headline */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-center mb-20 max-w-8xl"
        >
          <motion.h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-12 leading-[0.85]"
          >
            <span className="block text-black dark:text-white mb-6">
              The AI that
            </span>
            <motion.span 
              className="block relative"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                background: 'linear-gradient(90deg, #5A0B4D, #8B5A7A, #7A3B6A, #5A0B4D)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              thinks like you
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="text-2xl sm:text-3xl text-gray-600 dark:text-gray-300 max-w-5xl mx-auto leading-relaxed font-light tracking-wide"
          >
            Enterprise-grade AI that learns your communication style, anticipates your needs, and transforms your email workflow.
          </motion.p>
        </motion.div>

        {/* Premium CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-8 mb-20"
        >
          <Link href={isSignedIn ? "/mail" : "/sign-up"}>
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }}
              className="group relative"
            >
              <Button
                size="lg"
                className="relative bg-white text-black hover:bg-gray-50 px-16 py-8 text-xl font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden border-2 border-transparent hover:border-purple-500/20 group-hover:shadow-purple-500/25"
              >
                <span className="relative z-10 flex items-center gap-4">
                  Start Enterprise Trial
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/3 to-pink-500/3"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              </Button>
            </motion.div>
          </Link>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="group px-16 py-8 text-xl font-semibold rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:border-purple-500 hover:bg-purple-500/5 transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-2xl"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <Play className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>


        {/* Premium features preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-6 max-w-6xl"
        >
          {[
            { icon: CheckCircle2, text: "Free during beta" },
            { icon: Zap, text: "No credit card required" },
            { icon: Sparkles, text: "Priority support" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl text-black dark:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <item.icon className="w-5 h-5 text-purple-500" />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />
    </div>
  );
}