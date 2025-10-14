"use client";

import { motion } from "framer-motion";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Security", href: "#security" },
    { name: "Roadmap", href: "#roadmap" },
  ],
  company: [
    { name: "About", href: "#about" },
    { name: "Blog", href: "#blog" },
    { name: "Careers", href: "#careers" },
    { name: "Contact", href: "#contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Cookies", href: "#cookies" },
    { name: "License", href: "#license" },
  ],
  support: [
    { name: "Help Center", href: "#help" },
    { name: "Documentation", href: "#docs" },
    { name: "API Status", href: "#status" },
    { name: "Community", href: "#community" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#twitter", label: "Twitter" },
  { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
  { icon: Github, href: "#github", label: "GitHub" },
  { icon: Mail, href: "mailto:hello@vectormail.ai", label: "Email" },
];

export function Footer() {
  return (
    <footer className="relative bg-background text-foreground overflow-hidden border-t border-border">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative">
                    <motion.div 
                      className="w-10 h-10 bg-transparent flex items-center justify-center"
                      animate={{
                        y: [0, -2, 0, 1, 0],
                        rotate: [0, 1, 0, -1, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="relative">
                        {/* Enhanced minimalist envelope with motion lines */}
                        <svg width="28" height="18" viewBox="0 0 28 18" fill="none" className="text-gray-700 dark:text-gray-300">
                          {/* Enhanced envelope body with subtle gradient */}
                          <rect x="5" y="7" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                          {/* Enhanced envelope flap */}
                          <path d="M5 7 L14 2 L23 7" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                          {/* Enhanced motion lines with better spacing */}
                          <motion.line 
                            x1="0.5" y1="9" x2="4" y2="9" 
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
                            animate={{
                              x2: [4, 3.5, 4, 4.5, 4],
                              opacity: [0.8, 0.4, 0.8, 0.6, 0.8]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0
                            }}
                          />
                          <motion.line 
                            x1="0.5" y1="11.5" x2="3.5" y2="11.5" 
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"
                            animate={{
                              x2: [3.5, 3, 3.5, 4, 3.5],
                              opacity: [0.6, 0.2, 0.6, 0.4, 0.6]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5
                            }}
                          />
                          <motion.line 
                            x1="0.5" y1="14" x2="4" y2="14" 
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
                            animate={{
                              x2: [4, 3.5, 4, 4.5, 4],
                              opacity: [0.8, 0.4, 0.8, 0.6, 0.8]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 1
                            }}
                          />
                          {/* Subtle inner envelope detail */}
                          <rect x="7" y="9" width="14" height="7" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-xl font-bold text-black dark:text-white">VectorMail</span>
                </div>
                <p className="text-gray-700 dark:text-gray-400 mb-6 leading-relaxed max-w-sm">
                  Email management reimagined with AI precision. Built for professionals who value their time.
                </p>
                
                {/* Social Links */}
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-white/10 py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2025 VectorMail. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <a href="#cookies" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}