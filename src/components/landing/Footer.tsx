"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-purple-500/20 py-16 bg-black overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <div 
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
          willChange: "auto"
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Left: Logo & Social */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500" />
                <Mail className="w-6 h-6 text-white relative z-10" />
              </motion.div>
              <span className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                VectorMail
              </span>
            </Link>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "https://x.com/Devcodies", label: "Twitter", color: "from-blue-500 to-cyan-500" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/parbhat-kapila/", label: "LinkedIn", color: "from-blue-600 to-purple-600" },
                { icon: Github, href: "https://github.com/parbhatkapila4/Vector-Mail", label: "GitHub", color: "from-gray-600 to-gray-800" },
              ].map((social, index) => (
                <motion.div key={index} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={social.href}
                    className="relative w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/30 transition-all group overflow-hidden"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                    <social.icon className="w-5 h-5 relative z-10" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <p className="text-gray-500 text-sm max-w-xs">
              AI-powered email client that saves you time and helps you focus on what matters.
            </p>
          </div>

          {/* Right: Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-purple-300 transition-colors text-sm inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform inline-block">Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-purple-300 transition-colors text-sm inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform inline-block">Terms</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-purple-300 transition-colors text-sm inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform inline-block">Features</span>
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-purple-300 transition-colors text-sm inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform inline-block">Shortcuts</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-purple-300 transition-colors text-sm inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform inline-block">About</span>
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/parbhatkapila4/Vector-Mail" className="text-gray-400 hover:text-purple-300 transition-colors text-sm inline-flex items-center group" target="_blank">
                    <span className="group-hover:translate-x-1 transition-transform inline-block">Github</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-purple-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} VectorMail Inc, All Rights Reserved
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-gray-500 hover:text-purple-300 transition-colors text-sm">
              About
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/terms" className="text-gray-500 hover:text-purple-300 transition-colors text-sm">
              Terms & Conditions
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/privacy" className="text-gray-500 hover:text-purple-300 transition-colors text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
