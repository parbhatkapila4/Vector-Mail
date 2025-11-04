"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-purple-500/20 bg-black py-12 sm:py-16">
      {/* Subtle gradient background */}
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-[200px] w-[200px] rounded-full opacity-10 blur-3xl sm:h-[400px] sm:w-[400px]"
        style={{
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
          willChange: "auto",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 grid gap-8 sm:mb-12 sm:gap-12 md:grid-cols-2">
          {/* Left: Logo & Social */}
          <div className="space-y-6">
            <Link href="/" className="group inline-flex items-center gap-3">
              <motion.div
                className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400" />
                <Mail className="relative z-10 h-6 w-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-white transition-colors group-hover:text-purple-300">
                VectorMail
              </span>
            </Link>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[
                {
                  icon: Twitter,
                  href: "https://x.com/Devcodies",
                  label: "Twitter",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Linkedin,
                  href: "https://www.linkedin.com/in/parbhat-kapila/",
                  label: "LinkedIn",
                  color: "from-blue-600 to-purple-600",
                },
                {
                  icon: Github,
                  href: "https://github.com/parbhatkapila4/Vector-Mail",
                  label: "GitHub",
                  color: "from-gray-600 to-gray-800",
                },
              ].map((social, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={social.href}
                    className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-purple-500/30 hover:text-white"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 transition-opacity group-hover:opacity-20`}
                    />
                    <social.icon className="relative z-10 h-5 w-5" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <p className="max-w-xs text-sm text-gray-500">
              AI-powered email client that saves you time and helps you focus on
              what matters.
            </p>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Contact
              </p>
              <Link
                href="mailto:help@productionsolution.net"
                className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-purple-300"
              >
                <Mail className="h-4 w-4" />
                help@productionsolution.net
              </Link>
            </div>
          </div>

          {/* Right: Links */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-sm font-semibold text-transparent text-white">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="group inline-flex items-center text-sm text-gray-400 transition-colors hover:text-purple-300"
                  >
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      Privacy Policy
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="group inline-flex items-center text-sm text-gray-400 transition-colors hover:text-purple-300"
                  >
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      Terms
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-sm font-semibold text-transparent text-white">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="group inline-flex items-center text-sm text-gray-400 transition-colors hover:text-purple-300"
                  >
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      Features
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="group inline-flex items-center text-sm text-gray-400 transition-colors hover:text-purple-300"
                  >
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      Pricing
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-sm font-semibold text-transparent text-white">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="group inline-flex items-center text-sm text-gray-400 transition-colors hover:text-purple-300"
                  >
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      About
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/we"
                    className="group inline-flex items-center text-sm text-gray-400 transition-colors hover:text-purple-300"
                  >
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      Github
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-purple-500/10 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {currentYear} VectorMail Inc, All Rights Reserved
          </p>
          <div className="flex gap-4">
            <Link
              href="/about"
              className="text-sm text-gray-500 transition-colors hover:text-purple-300"
            >
              About
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/terms"
              className="text-sm text-gray-500 transition-colors hover:text-purple-300"
            >
              Terms & Conditions
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 transition-colors hover:text-purple-300"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
