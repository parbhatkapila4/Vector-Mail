"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://x.com/Devcodies", label: "Twitter" },
    { icon: Github, href: "https://github.com/parbhatkapila4/Vector-Mail", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/parbhat-kapila/", label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-gray-200 py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">VectorMail</span>
            </Link>
            <p className="text-sm text-gray-500">
              © {currentYear} VectorMail. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
