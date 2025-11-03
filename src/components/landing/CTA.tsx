"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Sparkles, ArrowRight } from "lucide-react";

export function CTA() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative py-40 overflow-hidden bg-black">
      {/* Static background gradients */}
      <div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
          willChange: "auto"
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)",
          willChange: "auto"
        }}
      />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
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
              className="w-24 h-24 rounded-2xl flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-lg shadow-purple-500/50"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-4">
            <span className="text-white">Ready to Transform</span>
            <br />
            <span 
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent inline-block"
              style={{
                filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))"
              }}
            >
              Your Inbox?
            </span>
          </h2>

          <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-4">
            Join thousands of professionals who save hours every week with AI-powered email management.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            No credit card required • Free forever • Setup in 2 minutes
          </p>

          <Link href={isSignedIn ? "/mail" : "/sign-up"}>
            <button
              className="group relative px-12 py-5 rounded-xl font-bold text-lg transition-all flex items-center gap-3 overflow-hidden mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
            >
              <span className="text-white">Get Started Free</span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
