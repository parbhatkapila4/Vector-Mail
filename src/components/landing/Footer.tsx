"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "AI Assistant", href: "/buddy" },
      { label: "Changelog", href: "#" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press Kit", href: "#" },
    ],
    resources: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Status", href: "#" },
      { label: "Support", href: "mailto:parbhat@parbhat.dev" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "#" },
    ],
  };

  const socials = [
    { icon: Twitter, href: "https://x.com/Parbhat03", label: "Twitter" },
    {
      icon: Github,
      href: "https://github.com/parbhatkapila4/Vector-Mail",
      label: "GitHub",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/parbhat-kapila/",
      label: "LinkedIn",
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#000000]">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-20">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg ring-1 ring-white/10">
                <video
                  src="/Vectormail-logo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full scale-[1.4] object-cover"
                />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">
                VectorMail
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              AI-powered email that saves you hours every week. Smart search,
              instant summaries, and replies that sound like you.
            </p>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-white">
                Stay updated
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
                <button className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-zinc-500">
              Product
            </h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-zinc-500">
              Company
            </h3>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-zinc-500">
              Resources
            </h3>
            <ul className="space-y-3">
              {links.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-zinc-500">
              Legal
            </h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-zinc-500">
                Contact
              </h3>
              <a
                href="mailto:parbhat@parbhat.dev"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                parbhat@parbhat.dev
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span>© {currentYear} VectorMail.</span>
            <span className="hidden sm:inline">·</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2 text-zinc-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
