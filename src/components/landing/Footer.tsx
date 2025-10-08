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
    <footer className="relative bg-black text-white overflow-hidden border-t border-white/10">
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
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-lg">V</span>
                  </div>
                  <span className="text-xl font-bold">VectorMail</span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
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