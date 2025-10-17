"use client";

import { motion } from "framer-motion";
import { Brain, MessageSquare, Search, Shield, Zap, Clock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Prioritization",
    description: "AI learns what's important to you and surfaces emails that need your attention first."
  },
  {
    icon: MessageSquare,
    title: "AI Responses",
    description: "Generate draft replies that match your writing style in seconds."
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find emails by meaning, not just keywords. Search naturally like you're talking."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Bank-grade encryption. Your emails are yours alone."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-50ms response times. Your email client that never lags."
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Spend less time managing email and more time on what matters."
  }
];

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features that help you take control of your inbox
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
