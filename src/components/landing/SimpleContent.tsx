"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function SimpleContent() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Email that understands you
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              VectorMail uses advanced AI to learn your communication patterns, understand context, and help you manage your inbox more efficiently than ever before.
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                "Automatic email categorization and priority sorting",
                "Smart reply suggestions based on your writing style",
                "Advanced search that understands context and meaning",
                "Privacy-first design with end-to-end encryption"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - AI Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="aspect-square bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-gray-200 shadow-2xl p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)
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
                  className="w-40 h-40 rounded-full border-4 border-transparent bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 p-1"
                >
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
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
                      className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-xl"
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
                        className="text-2xl font-bold text-white"
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
                    className="absolute w-5 h-5 rounded-full shadow-lg"
                    style={{
                      left: `calc(50% + ${x}px - 10px)`,
                      top: `calc(50% + ${y}px - 10px)`,
                      background: i % 3 === 0 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' :
                                  i % 3 === 1 ? 'linear-gradient(135deg, #6b7280, #4b5563)' :
                                  'linear-gradient(135deg, #4b5563, #374151)'
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
                      stroke="url(#enhancedNeuralGradient)"
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
                  <linearGradient id="enhancedNeuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9ca3af" />
                    <stop offset="33%" stopColor="#6b7280" />
                    <stop offset="66%" stopColor="#4b5563" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Data Particles */}
              {[...Array(12)].map((_, i) => (
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
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    left: `${50 + Math.random() * 20}%`,
                    top: `${50 + Math.random() * 20}%`,
                    background: Math.random() > 0.5 ? '#6b7280' : '#4b5563'
                  }}
                />
              ))}

              {/* Enhanced Processing Status */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"
                    />
                    <span className="text-sm font-semibold text-gray-800">AI Processing</span>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600 font-medium">LIVE</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Analyzing 247 emails • 99.2% accuracy • 2.3s avg response
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "87%" }}
                      transition={{ duration: 3, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Neural Processing</span>
                    <span>87% Complete</span>
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
