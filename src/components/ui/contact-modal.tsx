"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const email = "help@productsolution.net";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-4 top-1/2 z-[95] mx-auto max-w-md -translate-y-1/2"
          >
            <div className="rounded-2xl border border-border bg-background p-8 shadow-2xl">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "#875276" }}
                  >
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-black dark:text-white">
                    Contact Us
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 transition-colors hover:text-black dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="text-center">
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Have a question or need help? We'd love to hear from you.
                </p>

                <div className="mb-6 rounded-xl border border-border bg-muted/50 p-6">
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Send us an email at:
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg font-semibold text-black dark:text-white">
                      {email}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted"
                      title="Copy email"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="mt-2 text-sm text-green-500">
                      Email copied to clipboard!
                    </p>
                  )}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We typically respond within 24 hours.
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={onClose}
                  className="rounded-lg px-6 py-2 text-black transition-colors hover:bg-muted dark:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
