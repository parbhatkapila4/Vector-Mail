"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-screen bg-white pt-16">
      <div className="max-w-4xl mx-auto px-6 py-32">
        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <Sparkles className="w-4 h-4" />
            <span>AI-powered email assistant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            Email that works
            <br />
            for you
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart email management powered by AI. Prioritize what matters, respond faster, and never miss important messages.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={isSignedIn ? "/mail" : "/sign-up"}>
              <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-base font-medium">
                Get started for free
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>No credit card required</span>
            </div>
          </div>
        </motion.div>

        {/* Product Screenshot Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20"
        >
          <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-8 shadow-2xl">
            <div className="aspect-video bg-white rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <ArrowRight className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">Product demo coming soon</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}