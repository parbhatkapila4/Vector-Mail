"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles, Zap, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect Your Email",
    description:
      "Link your Gmail account securely. We use enterprise-grade encryption to keep your data safe.",
    icon: Mail,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    title: "AI Analyzes Everything",
    description:
      "Our AI instantly processes your inbox, understanding context, priority, and relationships.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    title: "Work Smarter",
    description:
      "Get intelligent suggestions, auto-replies, and find any email in seconds with semantic search.",
    icon: Zap,
    color: "from-orange-500 to-red-500",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-black py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl"
          >
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              Simple process
            </span>
          </motion.div>

          <h2 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Get started in minutes
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-400">
            No complex setup. No learning curve. Just intelligent email
            management from day one.
          </p>
        </motion.div>

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
              <div
                className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.2 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? "lg:order-2" : ""}
                >
                  <div className="mb-6 flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`relative h-20 w-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}
                    >
                      <span className="text-3xl font-bold text-white">
                        {step.number}
                      </span>
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-50 blur-xl`}
                      ></div>
                    </motion.div>
                    <div
                      className={`h-1 flex-1 bg-gradient-to-r ${step.color} rounded-full opacity-20`}
                    ></div>
                  </div>

                  <h3 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    {step.title}
                  </h3>
                  <p className="mb-6 text-xl leading-relaxed text-gray-400">
                    {step.description}
                  </p>

                  <div className="space-y-3">
                    {[
                      "Works with any email provider",
                      "Set up in under 2 minutes",
                      "No technical knowledge required",
                    ]
                      .slice(0, index + 1)
                      .map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 + 0.4 + i * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-400" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    x: index % 2 === 0 ? 40 : -40,
                  }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? "lg:order-1" : ""}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      rotate: index % 2 === 0 ? 2 : -2,
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-12 backdrop-blur-xl"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10 blur-2xl`}
                    ></div>

                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`relative rounded-full bg-gradient-to-br p-12 ${step.color} shadow-2xl`}
                    >
                      <step.icon className="h-24 w-24 text-white" />
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-60 blur-3xl`}
                      ></div>
                    </motion.div>

                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-white"
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

              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                  viewport={{ once: true }}
                  className="absolute left-1/2 mt-12 h-24 w-0.5 origin-top -translate-x-1/2 bg-gradient-to-b from-blue-500/50 to-transparent"
                />
              )}
            </motion.div>
          ))}
        </div>

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
            className="group inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-6 text-lg font-bold text-black shadow-2xl transition-all hover:shadow-[0_20px_80px_-20px_rgba(255,255,255,0.5)]"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
          </motion.button>
          <p className="mt-4 text-sm text-gray-500">
            Free during beta · No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
