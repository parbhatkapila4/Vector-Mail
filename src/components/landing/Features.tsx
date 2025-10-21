"use client";

import { motion } from "framer-motion";
import { Brain, MessageSquare, Search, Shield, Zap, Clock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Prioritization",
    description: "AI learns what's important to you and surfaces emails that need your attention first.",
    gradient: "from-[#C2847A] to-[#D4A896]"
  },
  {
    icon: MessageSquare,
    title: "AI Responses",
    description: "Generate draft replies that match your writing style in seconds.",
    gradient: "from-[#C2847A] to-[#E6C4B8]"
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find emails by meaning, not just keywords. Search naturally like you're talking.",
    gradient: "from-[#D4A896] to-[#C2847A]"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Bank-grade encryption. Your emails are yours alone.",
    gradient: "from-[#B0735E] to-[#C2847A]"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-50ms response times. Your email client that never lags.",
    gradient: "from-[#C2847A] to-[#B0735E]"
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Spend less time managing email and more time on what matters.",
    gradient: "from-[#E6C4B8] to-[#C2847A]"
  }
];

export function Features() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#C2847A]/5 to-black"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <span className="text-sm font-semibold text-[#C2847A] uppercase tracking-wider">Features</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C2847A] to-white mb-6 mt-4">
            Everything you need
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Powerful features that help you take control of your inbox and supercharge your productivity
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-2xl bg-white/5 border border-[#C2847A]/20 hover:border-[#C2847A]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#C2847A]/20 hover:-translate-y-1 backdrop-blur-sm">
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C2847A]/10 to-[#D4A896]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                <div className="relative space-y-4">
                  {/* Icon */}
                  <div className={`inline-flex w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shadow-[#C2847A]/30`}>
                    <feature.icon className="w-7 h-7 text-black" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-white group-hover:text-[#C2847A] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-300 rounded-full`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
