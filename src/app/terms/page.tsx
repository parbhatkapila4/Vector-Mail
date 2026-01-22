"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Rocket,
} from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "January 2026";

  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: [
        "By using VectorMail, you agree to be bound by these Terms of Service",
        "You must be at least 18 years old to use our service",
        "These terms apply to all users, including beta participants",
        "Continued use constitutes acceptance of any updates to these terms",
      ],
    },
    {
      icon: FileText,
      title: "Service Description",
      content: [
        "VectorMail provides AI-powered email management and organization",
        "We use Google OAuth and the Gmail API to access your Gmail account",
        "Gmail data is accessed solely to provide email search, summarization, and organization features",
        "We offer intelligent email analysis, smart responses, and semantic search",
        "Our service is currently in beta and may have limitations",
        "Features and functionality may change during the beta period",
      ],
    },
    {
      icon: AlertTriangle,
      title: "User Responsibilities",
      content: [
        "Provide accurate information when creating your account",
        "Maintain the security of your login credentials",
        "You control Gmail API access and can revoke it at any time through Google account settings",
        "Use the service in compliance with applicable laws and regulations",
        "Do not attempt to reverse engineer or exploit our systems",
        "VectorMail complies with Google API Services User Data Policy",
      ],
    },
    {
      icon: Scale,
      title: "Limitations & Disclaimers",
      content: [
        "Service availability is not guaranteed during beta testing",
        "AI-generated content should be reviewed before sending",
        "We are not responsible for email delivery issues outside our control",
        "Beta users should not rely on the service for critical communications",
      ],
    },
  ];

  const prohibitedUses = [
    "Spam or unsolicited commercial communications",
    "Harassment, abuse, or illegal activities",
    "Attempting to gain unauthorized access to our systems",
    "Violating any applicable laws or regulations",
    "Impersonating others or providing false information",
    "Distributing malware or harmful content",
  ];

  const betaTerms = [
    "The service may contain bugs, errors, or limitations",
    "Features may change or be removed without notice",
    "We may collect feedback and usage data to improve the service",
    "Beta access is provided at no cost and may be terminated at any time",
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
              <FileText className="mr-2 h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                Terms of Service
              </span>
            </motion.div>

            <h1 className="mb-6 w-full break-words text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Welcome to</span>
              <span className="mt-2 block text-white">VectorMail</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-white sm:text-xl lg:text-2xl">
              These Terms of Service govern your use of VectorMail's AI-powered
              email management platform. Please read these terms carefully
              before using our service.
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
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                        <span className="text-sm font-medium leading-relaxed text-white">
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
            <div className="rounded-2xl border border-red-500/30 bg-[#0a0a0a] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/20">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Prohibited Uses
                </h3>
              </div>
              <p className="mb-6 text-sm font-medium leading-relaxed text-white sm:text-base">
                You agree not to use VectorMail for any of the following
                prohibited activities:
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {prohibitedUses.map((use, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                    <span className="text-sm font-medium text-white">
                      {use}
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
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Beta Program Terms
                </h3>
              </div>
              <p className="mb-6 text-sm font-medium leading-relaxed text-white sm:text-base">
                VectorMail is currently in beta testing. By participating in our
                beta program, you acknowledge that:
              </p>
              <ul className="space-y-3">
                {betaTerms.map((term, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                    <span className="text-sm font-medium leading-relaxed text-white">
                      {term}
                    </span>
                  </motion.li>
                ))}
              </ul>
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
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Gmail API Access & User Control
                </h3>
              </div>
              <p className="mb-6 text-sm font-medium leading-relaxed text-white sm:text-base">
                VectorMail uses Google OAuth 2.0 and the Gmail API to access
                your Gmail account. By using VectorMail, you grant us permission
                to access your Gmail data (email content, headers, and metadata)
                solely for the purpose of providing email search, summarization,
                and organization features. You maintain full control over your
                Gmail access and can revoke it at any time through your Google
                account settings or by disconnecting your Gmail account in
                VectorMail. Upon account deletion, all Gmail data will be
                permanently deleted. VectorMail complies with the Google API
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
            className="mx-auto mt-16 max-w-4xl text-center"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8">
              <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                Questions About These Terms?
              </h3>
              <p className="mb-6 text-sm font-medium leading-relaxed text-white sm:text-base">
                If you have any questions about these Terms of Service, please
                contact us.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-3 transition-all hover:border-slate-700 hover:bg-slate-800/50"
              >
                <FileText className="h-5 w-5 text-white" />
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
              These Terms of Service are effective as of {lastUpdated} and may
              be updated from time to time. We will notify you of any material
              changes.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
