"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function CTA() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C2847A] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C2847A] rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] rounded-3xl blur-2xl opacity-30"></div>
          
          {/* Card */}
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-[#C2847A]/30 shadow-2xl p-12 sm:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-full mix-blend-screen filter blur-2xl opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D4A896] to-[#C2847A] rounded-full mix-blend-screen filter blur-2xl opacity-20"></div>

            <div className="relative space-y-8">
              {/* Icon Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2847A]/20 rounded-full border border-[#C2847A]/30"
              >
                <Sparkles className="w-4 h-4 text-[#C2847A]" />
                <span className="text-sm font-semibold text-[#C2847A]">Transform Your Workflow</span>
                <Zap className="w-4 h-4 text-[#C2847A]" />
              </motion.div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C2847A] to-white leading-tight">
                Ready to take control
                <br />
                of your inbox?
              </h2>
              
              <p className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals who've transformed their email workflow with AI.
              </p>
              
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Link href={isSignedIn ? "/mail" : "/sign-up"}>
                  <button className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#C2847A] to-[#D4A896] text-black rounded-xl hover:from-[#D4A896] hover:to-[#C2847A] transition-all duration-300 text-lg font-bold shadow-xl shadow-[#C2847A]/40 hover:shadow-2xl hover:shadow-[#C2847A]/60 hover:-translate-y-1">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </motion.div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#C2847A] rounded-full"></div>
                  <span className="font-medium">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#C2847A] rounded-full"></div>
                  <span className="font-medium">2-minute setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#C2847A] rounded-full"></div>
                  <span className="font-medium">Free forever</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
