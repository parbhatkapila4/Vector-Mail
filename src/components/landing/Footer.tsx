"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0a0a0a] py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-12 sm:mb-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg shadow-lg"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                <video
                  src="/Vectormail-logo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full scale-[1.35] object-cover"
                />
              </motion.div>
              <span className="text-xl font-black text-white">VectorMail</span>
            </Link>
            <p className="max-w-xs text-sm text-slate-400">
              AI-powered email client that saves you time and helps you focus on
              what matters.
            </p>
            <div className="flex items-center gap-3">
              {[
                {
                  icon: Twitter,
                  href: "https://x.com/Parbhat03",
                  label: "Twitter",
                  color: "text-orange-400 hover:text-orange-300",
                },
                {
                  icon: Linkedin,
                  href: "https://www.linkedin.com/in/parbhat-kapila/",
                  label: "LinkedIn",
                  color: "text-orange-400 hover:text-orange-300",
                },
                {
                  icon: Github,
                  href: "https://github.com/parbhatkapila4/Vector-Mail",
                  label: "GitHub",
                  color: "text-orange-400 hover:text-orange-300",
                },
              ].map((social, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={social.href}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 ${social.color} transition-all hover:border-slate-700`}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/features"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/we"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Contact</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="mailto:help@productionsolution.net"
                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  help@productionsolution.net
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              © {currentYear} VectorMail. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-white"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
