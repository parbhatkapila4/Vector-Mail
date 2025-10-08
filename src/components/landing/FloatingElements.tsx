"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function FloatingElements() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating gradient orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-96 h-96 rounded-full blur-[100px] opacity-20"
          style={{
            background: i === 0 
              ? "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)"
              : i === 1
              ? "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            x: [
              `${20 + i * 30}%`,
              `${40 + i * 20}%`,
              `${20 + i * 30}%`,
            ],
            y: [
              `${10 + i * 25}%`,
              `${60 + i * 10}%`,
              `${10 + i * 25}%`,
            ],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
