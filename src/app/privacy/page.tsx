"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  User,
  Database,
  Globe,
  CheckCircle,
} from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "November 2025";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Email content and metadata for AI processing",
        "Account information (name, email address)",
        "Usage analytics to improve our service",
        "Device and browser information for security",
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "Provide AI-powered email management services",
        "Improve our AI models and service quality",
        "Ensure security and prevent fraud",
        "Communicate important service updates",
      ],
    },
    {
      icon: Database,
      title: "Data Storage & Security",
      content: [
        "End-to-end encryption for all email content",
        "Zero-knowledge architecture - we can't read your emails",
        "SOC 2 Type II compliant infrastructure",
        "Regular security audits and updates",
      ],
    },
    {
      icon: Globe,
      title: "Data Sharing",
      content: [
        "We never sell your personal information",
        "No third-party access to your email content",
        "Limited sharing only with your explicit consent",
        "Anonymous usage data for service improvement",
      ],
    },
  ];

  const rights = [
    "Right to Access",
    "Right to Correction",
    "Right to Deletion",
    "Right to Portability",
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black">
      <Navigation />

      {/* Back Button - Desktop */}
      <div className="fixed left-4 top-24 z-40 hidden sm:left-8 sm:top-32 sm:block">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-white/5 px-3 py-2 text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 sm:px-4">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium sm:text-sm">Back</span>
          </button>
        </Link>
      </div>

      {/* Mobile Back Button */}
      <div className="px-4 pt-28 sm:hidden">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-white/5 px-3 py-2 text-white backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20">
            <ArrowLeft className="h-3 w-3" />
            <span className="text-xs font-medium">Back</span>
          </button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-8 pt-12 sm:pb-12 sm:pt-16 md:pt-20 lg:pb-16 lg:pt-24 xl:pt-28">
        {/* Background gradients */}
        <div
          className="pointer-events-none absolute right-1/4 top-0 h-[300px] w-[300px] rounded-full opacity-20 blur-3xl lg:h-[600px] lg:w-[600px]"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/4 h-[250px] w-[250px] rounded-full opacity-20 blur-3xl lg:h-[500px] lg:w-[500px]"
          style={{
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-2 mt-8 sm:mt-12 md:mt-16 lg:mt-20"
              animate={{
                borderColor: [
                  "rgba(168, 85, 247, 0.3)",
                  "rgba(251, 191, 36, 0.3)",
                  "rgba(168, 85, 247, 0.3)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Shield className="mr-2 h-4 w-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">
                Privacy Policy
              </span>
            </motion.div>

            <h1 className="mb-6 w-full break-words text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-white">Your Privacy</span>
              <span className="mt-2 block bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Matters to Us
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-400 sm:text-xl lg:text-2xl">
              At VectorMail, we're committed to protecting your privacy and
              ensuring the security of your email data. This Privacy Policy
              explains how we collect, use, and safeguard your information.
            </p>

            <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative overflow-hidden bg-black pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-16 lg:pb-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          {/* Key Sections */}
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-2">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative h-full rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 to-black p-6 transition-all group-hover:border-purple-500/50">
                  <div className="mb-4 flex items-center gap-3 text-center sm:text-left justify-center sm:justify-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3 mx-auto sm:mx-0 max-w-fit sm:max-w-none">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" />
                        <span className="text-sm leading-relaxed text-gray-400 text-center sm:text-left">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Your Rights Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 to-black p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 text-center sm:text-left justify-center sm:justify-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Your Rights
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-400 sm:text-base text-center sm:text-left">
                You have the right to access, update, or delete your personal
                information at any time. You can also request a copy of your data
                or opt out of certain data processing activities.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {rights.map((right, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-lg border border-purple-500/30 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20"
                  >
                    <span className="text-sm font-medium text-white">
                      {right}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-4xl text-center"
          >
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 to-black p-6 sm:p-8">
              <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                Questions About Privacy?
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-400 sm:text-base">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-white/5 px-6 py-3 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20"
              >
                <User className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">
                  help@productsolution.net
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-4xl text-center"
          >
            <p className="text-sm text-gray-500">
              This Privacy Policy is effective as of {lastUpdated} and may be
              updated from time to time. We will notify you of any material
              changes.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
