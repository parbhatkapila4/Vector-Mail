"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function SimpleContent() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#C2847A]/5 to-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C2847A] to-white leading-tight">
              Email that understands you
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
              VectorMail uses advanced AI to learn your communication patterns, understand context, and help you manage your inbox more efficiently than ever before.
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                { text: "Automatic email categorization and priority sorting", color: "from-[#C2847A] to-[#D4A896]" },
                { text: "Smart reply suggestions based on your writing style", color: "from-[#D4A896] to-[#C2847A]" },
                { text: "Advanced search that understands context and meaning", color: "from-[#B0735E] to-[#C2847A]" },
                { text: "Privacy-first design with end-to-end encryption", color: "from-[#C2847A] to-[#E6C4B8]" }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 group"
                >
                  <div className={`w-6 h-6 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md group-hover:scale-110 transition-transform duration-300 shadow-[#C2847A]/30`}>
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-gray-300 text-base leading-relaxed">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - AI Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] rounded-2xl blur-2xl opacity-30"></div>

            <div className="relative aspect-square bg-gradient-to-br from-[#C2847A]/10 via-[#D4A896]/10 to-[#C2847A]/5 rounded-2xl border border-[#C2847A]/30 shadow-2xl p-8 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 20%, rgba(194, 132, 122, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(212, 168, 150, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 40% 60%, rgba(194, 132, 122, 0.3) 0%, transparent 50%)
                  `
                }} />
              </div>

              {/* AI Brain Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Outer Ring */}
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-40 h-40 rounded-full border-4 border-transparent bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] p-1 shadow-xl"
                >
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    {/* Inner Core */}
                    <motion.div
                      animate={{ 
                        rotate: -360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="w-24 h-24 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-full flex items-center justify-center shadow-2xl shadow-[#C2847A]/50"
                    >
                      <motion.span
                        animate={{ 
                          opacity: [0.8, 1, 0.8],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="text-2xl font-black text-black"
                      >
                        AI
                      </motion.span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Neural Nodes */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45) * (Math.PI / 180);
                const radius = 70;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const colors = [
                  'linear-gradient(135deg, #C2847A, #D4A896)',
                  'linear-gradient(135deg, #D4A896, #C2847A)',
                  'linear-gradient(135deg, #C2847A, #E6C4B8)',
                  'linear-gradient(135deg, #E6C4B8, #C2847A)',
                  'linear-gradient(135deg, #B0735E, #C2847A)',
                  'linear-gradient(135deg, #C2847A, #B0735E)',
                  'linear-gradient(135deg, #D4A896, #E6C4B8)',
                  'linear-gradient(135deg, #E6C4B8, #D4A896)'
                ];
                
                return (
                  <motion.div
                    key={i}
                    animate={{
                      x: [x, x * 1.3, x],
                      y: [y, y * 1.3, y],
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2.5 + i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute w-5 h-5 rounded-full shadow-xl"
                    style={{
                      left: `calc(50% + ${x}px - 10px)`,
                      top: `calc(50% + ${y}px - 10px)`,
                      background: colors[i]
                    }}
                  />
                );
              })}

              {/* Enhanced Connection Lines */}
              <svg className="absolute inset-0 w-full h-full">
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45) * (Math.PI / 180);
                  const radius = 70;
                  const x = Math.cos(angle) * radius + 160;
                  const y = Math.sin(angle) * radius + 160;
                  
                  return (
                    <motion.line
                      key={i}
                      x1="160"
                      y1="160"
                      x2={x}
                      y2={y}
                      stroke="url(#coralNeuralGradient)"
                      strokeWidth="3"
                      opacity="0.7"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: [0, 1, 0],
                        opacity: [0.3, 0.8, 0.3]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
                <defs>
                  <linearGradient id="coralNeuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C2847A" />
                    <stop offset="33%" stopColor="#D4A896" />
                    <stop offset="66%" stopColor="#C2847A" />
                    <stop offset="100%" stopColor="#E6C4B8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Data Particles */}
              {[...Array(12)].map((_, i) => {
                const colors = ['#C2847A', '#D4A896', '#E6C4B8', '#B0735E'];
                return (
                  <motion.div
                    key={i}
                    animate={{
                      x: [0, Math.random() * 200 - 100],
                      y: [0, Math.random() * 200 - 100],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                      ease: "easeOut"
                    }}
                    className="absolute w-1.5 h-1.5 rounded-full shadow-lg"
                    style={{
                      left: `${50 + Math.random() * 20}%`,
                      top: `${50 + Math.random() * 20}%`,
                      background: colors[Math.floor(Math.random() * colors.length)]
                    }}
                  />
                );
              })}

              {/* Enhanced Processing Status */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-[#C2847A]/30 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 bg-gradient-to-r from-[#C2847A] to-[#D4A896] rounded-full shadow-lg"
                    />
                    <span className="text-sm font-bold text-white">AI Processing</span>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-[#C2847A] to-[#D4A896] rounded-full animate-pulse"></div>
                      <span className="text-xs text-[#C2847A] font-bold">LIVE</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    Analyzing 247 emails • 99.2% accuracy • 2.3s avg response
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-[#C2847A] via-[#D4A896] to-[#C2847A] h-2 rounded-full shadow-md"
                      initial={{ width: "0%" }}
                      animate={{ width: "87%" }}
                      transition={{ duration: 3, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-1">
                    <span className="font-medium">Neural Processing</span>
                    <span className="font-bold text-[#C2847A]">87% Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
