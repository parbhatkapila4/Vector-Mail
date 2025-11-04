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
    <section className="relative overflow-hidden bg-white py-32">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              Built for performance
            </span>
          </motion.div>

          <h2 className="mb-6 text-5xl font-bold tracking-tight text-black sm:text-6xl lg:text-7xl">
            Designed for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              power users
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Every feature built with speed, intelligence, and efficiency in mind
          </p>
        </motion.div>

        {/* Interactive Demo Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                  ? "from-black/10 to-black/5"
                  : "from-black/5 to-black/[0.02]"
              } rounded-3xl border-2 p-8 backdrop-blur-xl ${
                activeFeature === index ? "border-black/20" : "border-black/10"
              } cursor-pointer overflow-hidden transition-all duration-300`}
            >
              {/* Animated gradient background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                animate={
                  activeFeature === index ? { opacity: 0.1 } : { opacity: 0 }
                }
              />

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`inline-flex rounded-2xl bg-gradient-to-br p-4 ${feature.color} mb-6 shadow-lg`}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="mb-2 text-2xl font-bold text-black">
                {feature.title}
              </h3>
              <p className="mb-6 text-gray-600">{feature.description}</p>

              {/* Metric */}
              <div className="space-y-1">
                <div
                  className={`bg-gradient-to-r text-4xl font-bold ${feature.color} bg-clip-text text-transparent`}
                >
                  {feature.metric}
                </div>
                <div className="text-sm font-medium uppercase tracking-wider text-gray-500">
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
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
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
          className="relative overflow-hidden rounded-3xl border border-gray-800 bg-black p-8 md:p-12"
        >
          {/* Gradient accents */}
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 bg-gradient-to-b from-blue-600/20 to-transparent blur-3xl" />

          <div className="relative text-center">
            <h3 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Built with cutting-edge technology
            </h3>
            <p className="mx-auto mb-12 max-w-2xl text-xl text-gray-400">
              We're leveraging the latest in AI and machine learning to create
              something truly special
            </p>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
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
                  className="group cursor-default text-center"
                >
                  <div className="mb-3 text-4xl transition-transform group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div className="mb-2 text-3xl font-bold tracking-tight text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium uppercase tracking-wider text-gray-400">
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
