"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, MessageSquare, Phone, Send, Heart, Clock, MapPin, Linkedin, Twitter, Github } from "lucide-react";
import { useEffect } from "react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help from our support team",
    contact: "help@vectormail.dev",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    responseTime: "Response within 24 hours"
  },
  {
    icon: MessageSquare,
    title: "General Inquiries",
    description: "Questions about our product",
    contact: "hello@vectormail.dev",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    responseTime: "Response within 48 hours"
  },
  {
    icon: Phone,
    title: "Sales & Enterprise",
    description: "Custom solutions for teams",
    contact: "sales@vectormail.dev",
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    responseTime: "Response within 12 hours"
  }
];

const officeInfo = {
  address: "123 AI Boulevard, Tech District",
  city: "San Francisco, CA 94105",
  country: "United States",
  hours: "Monday - Friday: 9:00 AM - 6:00 PM PST"
};

const socialLinks = [
  {
    icon: Linkedin,
    name: "LinkedIn",
    url: "#",
    color: "hover:text-blue-600"
  },
  {
    icon: Twitter,
    name: "Twitter",
    url: "#",
    color: "hover:text-sky-500"
  },
  {
    icon: Github,
    name: "GitHub",
    url: "#",
    color: "hover:text-gray-900"
  }
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-4 md:inset-y-8 lg:inset-y-16 xl:inset-y-20 inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-20 xl:inset-x-32 z-[95] overflow-hidden"
          >
            <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 border-b border-gray-200">
                <div className="text-center pr-16">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 mb-3"
                  >
                    <Send className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Get in Touch
                    </span>
                  </motion.div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Contact Us
                  </h2>
                  <p className="text-gray-600">
                    We&apos;re here to help with any questions you have
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 flex items-center justify-center transition-all duration-200 hover:scale-105 z-10"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div
                className="overflow-y-auto h-full"
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
                  {/* Contact Methods */}
                  <div className="mb-16">
                    <div className="text-center mb-10">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Choose Your Preferred Contact Method
                      </h3>
                      <p className="text-gray-600">
                        We&apos;re here to help you with any questions or
                        concerns
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {contactMethods.map((method, index) => (
                        <motion.div
                          key={method.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className={`${method.bgColor} ${method.borderColor} border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
                        >
                          {/* Background decoration */}
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full -translate-y-10 translate-x-10"></div>

                          <div className="relative z-10">
                            <div
                              className={`w-14 h-14 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                              <method.icon className="w-7 h-7 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">
                              {method.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              {method.description}
                            </p>
                            <a
                              href={`mailto:${method.contact}`}
                              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/50 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-all duration-200 hover:bg-white hover:shadow-md mb-3 break-all"
                            >
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span>{method.contact}</span>
                            </a>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{method.responseTime}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Office Information */}
                  <div className="mb-16">
                    <div className="text-center mb-10">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Office Information
                      </h3>
                      <p className="text-gray-600">
                        Visit us or reach out during business hours
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">
                              Our Address
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
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
                        className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">
                              Business Hours
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {officeInfo.hours}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Weekend support available via email
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Quick Contact Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 text-center overflow-hidden"
                  >
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-x-16 -translate-y-16"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-pink-200/30 to-purple-200/30 rounded-full translate-x-20 translate-y-20"></div>

                    <div className="relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/50 mb-6"
                      >
                        <Heart className="w-5 h-5 text-pink-500" />
                        <span className="text-gray-700 font-semibold">
                          We&apos;d love to hear from you
                        </span>
                      </motion.div>

                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Ready to Get Started?
                      </h3>

                      <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                        Whether you have questions, need support, or want to
                        explore our enterprise solutions, we&apos;re here to
                        help you transform your email experience.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:bg-white/80 transition-all duration-300"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2">
                            General
                          </h4>
                          <a
                            href="mailto:hello@vectormail.dev"
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm break-all"
                          >
                            hello@vectormail.dev
                          </a>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:bg-white/80 transition-all duration-300"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2">
                            Support
                          </h4>
                          <a
                            href="mailto:help@vectormail.dev"
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm break-all"
                          >
                            help@vectormail.dev
                          </a>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:bg-white/80 transition-all duration-300"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2">
                            Sales
                          </h4>
                          <a
                            href="mailto:sales@vectormail.dev"
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm break-all"
                          >
                            sales@vectormail.dev
                          </a>
                        </motion.div>
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">
                          Follow us:
                        </span>
                        <div className="flex gap-3">
                          {socialLinks.map((social) => (
                            <a
                              key={social.name}
                              href={social.url}
                              className={`w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md ${social.color}`}
                              aria-label={social.name}
                            >
                              <social.icon className="w-5 h-5" />
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
                        <p>✨ We typically respond within 24 hours</p>
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
