"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { VideoModal } from "@/components/ui/video-modal";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export function Hero() {
  const { isSignedIn } = useUser();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  return (
    <AuroraBackground auroraPosition="30%_70%">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 min-h-screen"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black text-center mb-4 sm:mb-6 px-4 mt-32 sm:mt-32 md:mt-36"
        >
          <span className="block">
            <span className="text-black">Smart Email</span>
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-2">
              Management
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-extralight text-sm sm:text-base md:text-xl text-gray-600 py-2 sm:py-4 max-w-2xl text-center px-4 leading-relaxed"
        >
          Transform your email experience with AI-powered insights, smart
          organization, and intelligent responses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row w-full max-w-md sm:max-w-none px-4"
        >
          <Link href={isSignedIn ? "/mail" : "/sign-up"} className="w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-black px-6 sm:px-8 py-3 sm:py-3 text-base sm:text-lg text-white hover:bg-gray-800 w-full sm:w-auto transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="px-6 sm:px-8 py-3 sm:py-3 text-base sm:text-lg transition-all duration-300 w-full sm:w-auto border-gray-300 hover:bg-gray-50"
            onClick={() => setIsVideoModalOpen(true)}
          >
            <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Watch Demo</span>
            <span className="sm:hidden">Demo</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="relative mt-8 sm:mt-12 md:mt-16 w-full max-w-4xl px-4"
        >
          <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-1 sm:mb-2 text-2xl sm:text-3xl font-bold text-black">10K+</div>
                <div className="text-sm sm:text-base text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="mb-1 sm:mb-2 text-2xl sm:text-3xl font-bold text-black">99.9%</div>
                <div className="text-sm sm:text-base text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="mb-1 sm:mb-2 text-2xl sm:text-3xl font-bold text-black">50M+</div>
                <div className="text-sm sm:text-base text-gray-600">Emails Processed</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <VideoModal
        videoSrc="https://lcbcrithcxdbqynfmtxk.supabase.co/storage/v1/object/public/Videos/Vector%20Mail-1758311992317.mp4"
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </AuroraBackground>
  );
}
