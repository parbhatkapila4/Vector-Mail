"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Twitter, Github, Linkedin, Sparkles, Heart } from "lucide-react";

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
    <footer className="relative border-t border-[#C2847A]/20 py-12 sm:py-16 bg-gradient-to-b from-black to-[#C2847A]/5 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-12">
          {/* Logo & Copyright */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start gap-4"
          >
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-xl flex items-center justify-center shadow-lg shadow-[#C2847A]/30 group-hover:shadow-xl group-hover:shadow-[#C2847A]/50 transition-all duration-300">
                <Mail className="w-6 h-6 text-black" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 text-[#C2847A] animate-pulse" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#C2847A] to-[#D4A896] bg-clip-text text-transparent">
                VectorMail
              </span>
            </Link>
            <p className="text-sm text-gray-300 flex items-center gap-1">
              © {currentYear} VectorMail. Made with 
              <Heart className="w-3 h-3 text-[#C2847A] fill-[#C2847A] inline" /> 
              by developers.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-8"
          >
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-[#C2847A] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C2847A] to-[#D4A896] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </motion.div>

          {/* Social Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.href}
                className="w-10 h-10 rounded-lg bg-white/5 border border-[#C2847A]/20 flex items-center justify-center text-gray-300 hover:text-black hover:bg-gradient-to-br hover:from-[#C2847A] hover:to-[#D4A896] hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#C2847A]/30"
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Bottom decorative line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 h-0.5 bg-gradient-to-r from-transparent via-[#C2847A]/50 to-transparent"
        ></motion.div>
      </div>
    </footer>
  );
}
