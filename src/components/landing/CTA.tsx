"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Sparkles, ArrowRight } from "lucide-react";

export function CTA() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative py-20 sm:py-32 lg:py-40 overflow-hidden bg-black">
      {/* Static background gradients */}
      <div 
        className="absolute top-0 left-1/4 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
          willChange: "auto"
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[350px] h-[350px] lg:w-[600px] lg:h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
          willChange: "auto"
        }}
      />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Simplified Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-amber-500 shadow-lg shadow-purple-500/50"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-4">
            <span className="text-white">Help Us Build the</span>
            <br />
            <span 
              className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent inline-block"
              style={{
                filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))"
              }}
            >
              Future of Email
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto mb-4">
            VectorMail is open source and built by developers, for developers. Join our community and help shape the next generation of email.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mb-12 sm:mb-16">
            Open Source • Production Grade • Built with Modern Stack
          </p>

          <div className="mt-8">
          <Link href="https://github.com/parbhatkapila4/Vector-Mail" target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto">
            <button
              className="w-full sm:w-auto group relative px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-3 overflow-hidden mx-auto bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
            >
              <span className="text-white">Contribute on GitHub</span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
