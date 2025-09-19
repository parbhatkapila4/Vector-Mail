"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function Hero() {
  const { isSignedIn } = useUser();
  
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
          className="text-5xl md:text-7xl font-bold text-black text-center mb-6"
        >
          Smart Email
          <br />
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Management
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-extralight text-base md:text-xl text-gray-600 py-4 max-w-2xl text-center"
        >
          Transform your email experience with AI-powered insights, smart
          organization, and intelligent responses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href={isSignedIn ? "/mail" : "/sign-up"}>
            <Button
              size="lg"
              className="bg-black px-8 py-3 text-lg text-white hover:bg-gray-800"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="border-gray-300 px-8 py-3 text-lg text-black hover:bg-gray-50"
          >
            <Mail className="mr-2 h-5 w-5" />
            View Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="relative mt-16"
        >
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-lg">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-black">10K+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-black">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-black">50M+</div>
                <div className="text-gray-600">Emails Processed</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
}
