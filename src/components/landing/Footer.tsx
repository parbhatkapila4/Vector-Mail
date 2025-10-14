"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";
import { ModeToggle } from "@/components/global/ThemeToggle";
import { ContactModal } from "@/components/ui/contact-modal";
import { useState } from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const footerLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact", href: "#", onClick: () => setIsContactModalOpen(true) },
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://x.com/Devcodies", label: "Twitter" },
    { icon: Github, href: "https://github.com/parbhatkapila4/Vector-Mail", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/parbhat-kapila/", label: "LinkedIn" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative bg-background border-t border-border py-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#875276' }}>
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black dark:text-white">VectorMail</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
              AI-powered email management for modern professionals
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link 
                      href={link.href} 
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Follow Us</h3>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
              <ModeToggle />
            </div>
          </div>
        </div>

      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </motion.footer>
  );
}