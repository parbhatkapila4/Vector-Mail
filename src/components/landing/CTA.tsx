"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function CTA() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative py-32 overflow-hidden bg-background z-30">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-xl border border-border mb-8"
          >
                <Sparkles className="w-4 h-4" style={{ color: '#8B5A7A' }} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Start today</span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 tracking-tight">
            Ready to transform<br />your inbox?
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Join 10,000+ professionals saving 10+ hours every week
          </p>
        </motion.div>

        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative bg-card rounded-3xl p-12 sm:p-16 border border-border overflow-hidden">
                {/* Gradient accents */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-3xl" style={{ background: 'linear-gradient(180deg, rgba(90, 11, 77, 0.2), transparent)' }}></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 blur-3xl" style={{ background: 'linear-gradient(0deg, rgba(139, 90, 122, 0.1), transparent)' }}></div>
            
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Benefits */}
              <div className="space-y-8">
                <h3 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">
                  Start your free trial
                </h3>
                
                <div className="space-y-5">
                  {[
                    "No credit card required",
                    "14-day free trial with full access",
                    "Cancel anytime, no questions asked",
                    "Dedicated onboarding support"
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 group"
                    >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#5A0B4D' }}>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-lg">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right side - CTA */}
              <div className="lg:pl-8">
                <div className="bg-muted/50 backdrop-blur-xl rounded-2xl p-10 border border-border">
                  <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(90, 11, 77, 0.1)', borderColor: 'rgba(90, 11, 77, 0.2)', border: '1px solid' }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#5A0B4D' }}></div>
                      <span className="text-sm font-medium" style={{ color: '#8B5A7A' }}>Limited time offer</span>
                    </div>
                    <div className="text-muted-foreground text-lg mb-2">
                      Get <span className="text-foreground font-bold text-2xl">20% off</span>
                    </div>
                    <p className="text-muted-foreground text-sm">when you sign up today</p>
                  </div>

                  <Link href={isSignedIn ? "/mail" : "/sign-up"} className="block mb-6">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        className="w-full group bg-white text-black hover:bg-gray-100 px-8 py-7 text-lg font-semibold rounded-xl shadow-2xl transition-all duration-200"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Get Started Free
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </motion.div>
                  </Link>

                  <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-white hover:underline font-medium">
                      Sign in →
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
        >
          {[
            "SOC 2 Type II Certified",
            "GDPR Compliant",
            "256-bit SSL Encryption",
            "99.9% Uptime SLA"
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#8B5A7A' }} />
              <span>{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}