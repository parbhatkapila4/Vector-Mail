"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Search,
  Brain,
  Shield,
  Clock,
  Mail,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Email Assistant",
    description:
      "Chat with your inbox using natural language. Get instant summaries, find information, and respond faster than ever.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Find emails by meaning, not just keywords. Ask questions in natural language and get instant results.",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast Replies",
    description:
      "Reply to emails in seconds with AI-powered suggestions and smart templates that learn your style.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data stays yours. Open source, self-hostable, and built with privacy as a core principle.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Clock,
    title: "Time Saver",
    description:
      "Save 10+ hours per week. Let AI handle routine tasks so you can focus on what truly matters.",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: Mail,
    title: "Smart Organization",
    description:
      "Automatically categorize, prioritize, and organize your inbox. Never miss an important email again.",
    gradient: "from-yellow-500 to-orange-500",
  },
];

export function Features() {
  return (
    <section className="relative bg-[#0a0a0a] py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2">
            <Mail className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-slate-300">Features</span>
                        </div>
          <h2 className="mb-6 text-5xl font-black leading-tight text-white sm:text-6xl md:text-7xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              master your inbox
                            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-400">
            Powerful AI-driven features designed to transform how you work with
            email
          </p>
                  </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
                        <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/30 p-8 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/50">
                  <div
                    className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                </div>

                  <h3 className="mb-3 text-xl font-bold text-white">
                    {feature.title}
              </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
            </motion.div>
            );
          })}
          </div>
        </div>
      </section>
  );
}
