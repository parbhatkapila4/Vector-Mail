"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles, Zap, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect Your Email",
    description: "Link your Gmail account securely. We use enterprise-grade encryption to keep your data safe.",
    icon: Mail,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    title: "AI Analyzes Everything",
    description: "Our AI instantly processes your inbox, understanding context, priority, and relationships.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    title: "Work Smarter",
    description: "Get intelligent suggestions, auto-replies, and find any email in seconds with semantic search.",
    icon: Zap,
    color: "from-orange-500 to-red-500",
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-black py-32 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Simple process</span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Get started in minutes
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            No complex setup. No learning curve. Just intelligent email management from day one.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.2 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? 'lg:order-2' : ''}
                >
                  {/* Step number */}
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}
                    >
                      <span className="text-3xl font-bold text-white">{step.number}</span>
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} blur-xl opacity-50`}></div>
                    </motion.div>
                    <div className={`flex-1 h-1 bg-gradient-to-r ${step.color} rounded-full opacity-20`}></div>
                  </div>

                  <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xl text-gray-400 leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Features list */}
                  <div className="space-y-3">
                    {[
                      "Works with any email provider",
                      "Set up in under 2 minutes",
                      "No technical knowledge required",
                    ].slice(0, index + 1).map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 + 0.4 + i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 text-gray-300"
                      >
                        <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Visual */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? 40 : -40 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? 'lg:order-1' : ''}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 overflow-hidden aspect-square flex items-center justify-center"
                  >
                    {/* Gradient glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10 blur-2xl`}></div>
                    
                    {/* Icon */}
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className={`relative p-12 rounded-full bg-gradient-to-br ${step.color} shadow-2xl`}
                    >
                      <step.icon className="w-24 h-24 text-white" />
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} blur-3xl opacity-60`}></div>
                    </motion.div>

                    {/* Floating particles */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        animate={{
                          y: [0, -30, 0],
                          opacity: [0.2, 1, 0.2],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.6,
                        }}
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${50 + (i % 2 === 0 ? 10 : -10)}%`,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                  viewport={{ once: true }}
                  className="absolute left-1/2 -translate-x-1/2 w-0.5 h-24 bg-gradient-to-b from-blue-500/50 to-transparent mt-12 origin-top"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA at the end */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-3 bg-white text-black px-10 py-6 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-[0_20px_80px_-20px_rgba(255,255,255,0.5)] transition-all"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
          <p className="text-gray-500 text-sm mt-4">Free during beta · No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}
