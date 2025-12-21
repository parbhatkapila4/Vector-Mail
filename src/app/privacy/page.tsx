"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
  const lastUpdated = "December 2025";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Gmail API access: We use Google OAuth and the Gmail API to access your Gmail account",
        "Gmail data accessed: Email content, email headers, email metadata (sender, recipient, subject, timestamps), and message threads",
        "Account information (name, email address)",
        "Usage analytics to improve our service",
        "Device and browser information for security",
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "Gmail data is accessed solely to provide email search, summarization, and organization features",
        "Email content and metadata are processed using AI to enable semantic search and intelligent email management",
        "We use Aurinko for Gmail synchronization to maintain your email data",
        "Ensure security and prevent fraud",
        "Communicate important service updates",
      ],
    },
    {
      icon: Database,
      title: "Data Storage & Security",
      content: [
        "End-to-end encryption for all email content",
        "Each user's Gmail data is logically isolated and not shared between users",
        "SOC 2 Type II compliant infrastructure",
        "Regular security audits and updates",
        "Gmail data is stored securely and deleted upon account deletion",
      ],
    },
    {
      icon: Globe,
      title: "Data Sharing & Restrictions",
      content: [
        "We never sell your personal information or Gmail data",
        "We do not use your Gmail data for advertising purposes",
        "We do not share your Gmail data with third parties except as required by law",
        "We do not use your Gmail data to train public AI models",
        "We do not resell or transfer your Gmail data to any third party",
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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0a0a]">
      <div className="fixed left-4 top-4 z-40 hidden sm:left-8 sm:top-6 sm:block">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white transition-all hover:scale-105 hover:border-slate-700 hover:bg-slate-800/50 sm:px-4">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium sm:text-sm">Back</span>
          </button>
        </Link>
      </div>

      <div className="px-4 pt-4 sm:hidden">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white transition-all hover:border-slate-700 hover:bg-slate-800/50">
            <ArrowLeft className="h-3 w-3" />
            <span className="text-xs font-medium">Back</span>
          </button>
        </Link>
      </div>

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-8 pt-16 sm:pb-12 sm:pt-20 lg:pb-16 lg:pt-24">
        <div className="relative mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div className="mb-6 inline-flex items-center rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2">
              <Shield className="mr-2 h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                Privacy Policy
              </span>
            </motion.div>

            <h1 className="mb-6 w-full break-words text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Your Privacy</span>
              <span className="mt-2 block text-white">Matters to Us</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-white sm:text-xl lg:text-2xl">
              At VectorMail, we're committed to protecting your privacy and
              ensuring the security of your email data. This Privacy Policy
              explains how we collect, use, and safeguard your information.
            </p>

            <p className="mx-auto mt-4 max-w-3xl text-sm font-medium text-white">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-32 lg:pt-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
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
                <div className="absolute -inset-1 rounded-2xl opacity-0" />
                <div className="relative h-full rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 transition-all group-hover:border-slate-700">
                  <div className="mb-4 flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="mx-auto flex max-w-fit items-start gap-3 sm:mx-0 sm:max-w-none"
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                        <span className="text-center text-sm font-medium leading-relaxed text-white sm:text-left">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Gmail API Usage & Google Compliance
                </h3>
              </div>
              <p className="mb-6 text-center text-sm font-medium leading-relaxed text-white sm:text-left sm:text-base">
                VectorMail uses Google OAuth 2.0 and the Gmail API to access
                your Gmail account. We access your Gmail data (email content,
                headers, and metadata) exclusively to provide email search,
                summarization, and organization features. We do not use your
                Gmail data for advertising, we do not sell it, we do not share
                it with third parties, and we do not use it to train public AI
                models. You can revoke access at any time through your Google
                account settings. VectorMail complies with the Google API
                Services User Data Policy, including the requirement to limit
                use of data to providing or improving user-facing features.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Your Rights
                </h3>
              </div>
              <p className="mb-6 text-center text-sm font-medium leading-relaxed text-white sm:text-left sm:text-base">
                You have the right to access, update, or delete your personal
                information at any time. You can also request a copy of your
                data or opt out of certain data processing activities. You can
                revoke Gmail API access at any time through your Google account
                settings or by disconnecting your Gmail account in VectorMail.
                All Gmail data will be deleted upon account deletion. VectorMail
                complies with Google API Services User Data Policy, including
                the requirement to limit use of data to providing or improving
                user-facing features.
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                {rights.map((right, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2 transition-all hover:border-slate-700 hover:bg-slate-800/50"
                  >
                    <span className="text-sm font-medium text-white">
                      {right}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-4xl text-center"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                Questions About Privacy?
              </h3>
              <p className="mb-6 text-sm font-medium leading-relaxed text-white sm:text-base">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-3 transition-all hover:border-slate-700 hover:bg-slate-800/50"
              >
                <User className="h-5 w-5 text-white" />
                <span className="font-medium text-white">
                  parbhat@parbhat.dev
                </span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-4xl text-center"
          >
            <p className="text-sm font-medium text-white">
              This Privacy Policy is effective as of {lastUpdated} and may be
              updated from time to time. We will notify you of any material
              changes.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
