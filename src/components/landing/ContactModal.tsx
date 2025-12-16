"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Heart,
  Clock,
  MapPin,
  Linkedin,
  Twitter,
  Github,
} from "lucide-react";
import { useEffect } from "react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help from our support team",
    contact: "help@productionsolution.net",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    responseTime: "Response within 24 hours",
  },
  {
    icon: MessageSquare,
    title: "General Inquiries",
    description: "Questions about our product",
    contact: "help@productionsolution.net",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    responseTime: "Response within 48 hours",
  },
  {
    icon: Phone,
    title: "Sales & Enterprise",
    description: "Custom solutions for teams",
    contact: "help@productionsolution.net",
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    responseTime: "Response within 12 hours",
  },
];

const officeInfo = {
  address: "123 AI Boulevard, Tech District",
  city: "San Francisco, CA 94105",
  country: "United States",
  hours: "Monday - Friday: 9:00 AM - 6:00 PM PST",
};

const socialLinks = [
  {
    icon: Linkedin,
    name: "LinkedIn",
    url: "#",
    color: "hover:text-blue-600",
  },
  {
    icon: Twitter,
    name: "Twitter",
    url: "#",
    color: "hover:text-sky-500",
  },
  {
    icon: Github,
    name: "GitHub",
    url: "#",
    color: "hover:text-gray-900",
  },
];

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-4 inset-y-4 z-[95] overflow-hidden sm:inset-x-8 md:inset-x-12 md:inset-y-8 lg:inset-x-20 lg:inset-y-16 xl:inset-x-32 xl:inset-y-20"
          >
            <div className="h-full w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="relative border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6">
                <div className="pr-16 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 backdrop-blur-sm"
                  >
                    <Send className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Get in Touch
                    </span>
                  </motion.div>
                  <h2 className="mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
                    Contact Us
                  </h2>
                  <p className="text-gray-600">
                    We&apos;re here to help with any questions you have
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div
                className="h-full overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d1d5db #f3f4f6",
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 8px;
                  }
                  div::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                  }
                `}</style>
                <div className="p-8 pb-24">
                  <div className="mb-16">
                    <div className="mb-10 text-center">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        Choose Your Preferred Contact Method
                      </h3>
                      <p className="text-gray-600">
                        We&apos;re here to help you with any questions or
                        concerns
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {contactMethods.map((method, index) => (
                        <motion.div
                          key={method.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className={`${method.bgColor} ${method.borderColor} group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl`}
                        >
                          <div className="absolute right-0 top-0 h-20 w-20 -translate-y-10 translate-x-10 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>

                          <div className="relative z-10">
                            <div
                              className={`h-14 w-14 rounded-xl bg-gradient-to-r ${method.color} mb-4 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
                            >
                              <method.icon className="h-7 w-7 text-white" />
                            </div>
                            <h4 className="mb-2 text-xl font-bold text-gray-800">
                              {method.title}
                            </h4>
                            <p className="mb-4 text-sm leading-relaxed text-gray-600">
                              {method.description}
                            </p>
                            <a
                              href={`mailto:${method.contact}`}
                              className="mb-3 inline-flex items-center gap-2 break-all rounded-lg border border-white/50 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-600 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-blue-800 hover:shadow-md"
                            >
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span>{method.contact}</span>
                            </a>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{method.responseTime}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-16">
                    <div className="mb-10 text-center">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        Office Information
                      </h3>
                      <p className="text-gray-600">
                        Visit us or reach out during business hours
                      </p>
                    </div>
                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="mb-2 font-bold text-gray-900">
                              Our Address
                            </h4>
                            <p className="text-sm leading-relaxed text-gray-600">
                              {officeInfo.address}
                              <br />
                              {officeInfo.city}
                              <br />
                              {officeInfo.country}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-teal-50 p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-teal-500">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="mb-2 font-bold text-gray-900">
                              Business Hours
                            </h4>
                            <p className="text-sm leading-relaxed text-gray-600">
                              {officeInfo.hours}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              Weekend support available via email
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 text-center"
                  >
                    <div className="absolute left-0 top-0 h-32 w-32 -translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30"></div>
                    <div className="absolute bottom-0 right-0 h-40 w-40 translate-x-20 translate-y-20 rounded-full bg-gradient-to-tl from-pink-200/30 to-purple-200/30"></div>

                    <div className="relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/80 px-6 py-3 backdrop-blur-sm"
                      >
                        <Heart className="h-5 w-5 text-pink-500" />
                        <span className="font-semibold text-gray-700">
                          We&apos;d love to hear from you
                        </span>
                      </motion.div>

                      <h3 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
                        Ready to Get Started?
                      </h3>

                      <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
                        Whether you have questions, need support, or want to
                        explore our enterprise solutions, we&apos;re here to
                        help you transform your email experience.
                      </p>

                      <div className="mx-auto mb-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="rounded-2xl border border-white/50 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
                        >
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="mb-2 font-bold text-gray-800">
                            General
                          </h4>
                          <a
                            href="mailto:help@productionsolution.net"
                            className="break-all text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                          >
                            hello@vectormail.dev
                          </a>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="rounded-2xl border border-white/50 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
                        >
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-teal-500">
                            <MessageSquare className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="mb-2 font-bold text-gray-800">
                            Support
                          </h4>
                          <a
                            href="mailto:help@productionsolution.net"
                            className="break-all text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                          >
                            help@vectormail.dev
                          </a>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="rounded-2xl border border-white/50 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
                        >
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                            <Phone className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="mb-2 font-bold text-gray-800">
                            Sales
                          </h4>
                          <a
                            href="mailto:help@productionsolution.net"
                            className="break-all text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                          >
                            sales@vectormail.dev
                          </a>
                        </motion.div>
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <span className="text-sm font-medium text-gray-600">
                          Follow us:
                        </span>
                        <div className="flex gap-3">
                          {socialLinks.map((social) => (
                            <a
                              key={social.name}
                              href={social.url}
                              className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:shadow-md ${social.color}`}
                              aria-label={social.name}
                            >
                              <social.icon className="h-5 w-5" />
                            </a>
                          ))}
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="mt-8 text-sm text-gray-500"
                      >
                        <p>We typically respond within 24 hours</p>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
