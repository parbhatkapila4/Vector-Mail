"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Sparkles,Zap } from "lucide-react";
import { VideoModal } from "@/components/ui/video-modal";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";

export function Hero() {
  const { isSignedIn } = useUser();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  
  // Mouse tracking for spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothMouseY = useSpring(mouseY, { damping: 30, stiffness: 200 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  
  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-black z-10">
      {/* Enhanced grid with gradient mask */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_60%,transparent_100%)]"></div>
      </div>
      
      {/* Mouse-following spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: useTransform(
            [smoothMouseX, smoothMouseY],
            ([x, y]) =>
              `radial-gradient(600px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
          ),
        }}
      />

      {/* Multiple animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
              style={{ backgroundColor: 'rgba(90, 11, 77, 0.3)' }}
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px]"
              style={{ backgroundColor: 'rgba(139, 90, 122, 0.2)' }}
            />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative flex flex-col items-center justify-center px-4 min-h-screen pt-32 pb-32"
      >
        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 mb-10 shadow-2xl group hover:bg-white/10 transition-all cursor-default"
        >
              <motion.div 
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" style={{ color: '#8B5A7A' }} />
              </motion.div>
          <span className="text-sm font-medium text-white">
            Coming Soon · Early Access Available
          </span>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#5A0B4D' }} />
        </motion.div>

        {/* Hero heading with dramatic reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-8 max-w-6xl"
        >
          <motion.h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6"
          >
            <span className="block text-white mb-2">
              The future of
            </span>
            <motion.span 
              className="block relative"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{
                    backgroundImage: "linear-gradient(90deg, #fff, #8B5A7A, #5A0B4D, #7A3B6A, #fff)",
                    backgroundSize: "200% auto",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
            >
              email management
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light"
          >
            AI that doesn&apos;t just organize your inbox—it <span className="text-white font-medium">transforms</span> how you work
          </motion.p>
        </motion.div>

        {/* Enhanced CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16 z-10"
        >
          <Link href={isSignedIn ? "/mail" : "/sign-up"}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="group relative bg-white text-black hover:bg-white px-10 py-8 text-lg font-bold rounded-2xl transition-all duration-200 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_80px_-20px_rgba(255,255,255,0.5)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_30px_100px_-20px_rgba(255,255,255,0.7)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Get Early Access
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, rgba(139, 90, 122, 0.3), rgba(90, 11, 77, 0.3), rgba(122, 59, 106, 0.3))' }}
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
              </Button>
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="group px-10 py-8 text-lg font-bold rounded-2xl bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 backdrop-blur-2xl"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
              See it in action
            </Button>
          </motion.div>
        </motion.div>

        {/* Quick features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-20 text-sm"
        >
          {[
            { icon: CheckCircle2, text: "Free during beta" },
            { icon: Zap, text: "No credit card" },
            { icon: CheckCircle2, text: "Early access perks" }
          ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-default bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10"
                >
                  <item.icon className="w-4 h-4" style={{ color: '#8B5A7A' }} />
              <span className="font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
      
      <VideoModal
        videoSrc="https://lcbcrithcxdbqynfmtxk.supabase.co/storage/v1/object/public/Videos/Vector%20Mail-1758311992317.mp4"
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

    </div>
  );
}