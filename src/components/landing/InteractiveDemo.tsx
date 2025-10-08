"use client";

import { motion } from "framer-motion";
import { Sparkles, Mail, Brain, Zap, Clock } from "lucide-react";
import { useState } from "react";

const demoFeatures = [
  {
    id: "ai",
    icon: Brain,
    title: "AI Analysis",
    description: "Instant priority detection",
    color: "from-blue-500 to-cyan-500",
    metric: "99.9%",
    label: "Accuracy",
  },
  {
    id: "speed",
    icon: Zap,
    title: "Lightning Fast",
    description: "Process emails in milliseconds",
    color: "from-orange-500 to-red-500",
    metric: "< 100ms",
    label: "Response Time",
  },
  {
    id: "smart",
    icon: Mail,
    title: "Smart Replies",
    description: "AI-generated responses",
    color: "from-purple-500 to-pink-500",
    metric: "10x",
    label: "Faster",
  },
  {
    id: "time",
    icon: Clock,
    title: "Time Saved",
    description: "Automated email management",
    color: "from-green-500 to-emerald-500",
    metric: "10hrs",
    label: "Per Week",
  },
];

export function InteractiveDemo() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="relative bg-white py-32 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 backdrop-blur-xl border border-black/10 mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Built for performance</span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 tracking-tight">
            Designed for <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">power users</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every feature built with speed, intelligence, and efficiency in mind
          </p>
        </motion.div>

        {/* Interactive Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {demoFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -12, scale: 1.03 }}
              onHoverStart={() => setActiveFeature(index)}
              className={`group relative bg-gradient-to-b ${
                activeFeature === index
                  ? 'from-black/10 to-black/5'
                  : 'from-black/5 to-black/[0.02]'
              } backdrop-blur-xl rounded-3xl p-8 border-2 ${
                activeFeature === index
                  ? 'border-black/20'
                  : 'border-black/10'
              } transition-all duration-300 cursor-pointer overflow-hidden`}
            >
              {/* Animated gradient background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                animate={activeFeature === index ? { opacity: 0.1 } : { opacity: 0 }}
              />

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-black mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {feature.description}
              </p>

              {/* Metric */}
              <div className="space-y-1">
                <div className={`text-4xl font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  {feature.metric}
                </div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                  {feature.label}
                </div>
              </div>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="relative bg-black rounded-3xl p-8 md:p-12 border border-gray-800 overflow-hidden"
        >
          {/* Gradient accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-blue-600/20 to-transparent blur-3xl" />
          
          <div className="relative text-center">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built with cutting-edge technology
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              We're leveraging the latest in AI and machine learning to create something truly special
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { value: "Advanced", label: "AI Models", icon: "🤖" },
                { value: "Real-time", label: "Processing", icon: "⚡" },
                { value: "Secure", label: "Architecture", icon: "🔒" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center group cursor-default"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}