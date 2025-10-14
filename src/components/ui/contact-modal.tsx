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
      console.error('Failed to copy: ', err);
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[95] max-w-md mx-auto"
          >
            <div className="bg-background border border-border rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#875276' }}>
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-black dark:text-white">Contact Us</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Have a question or need help? We'd love to hear from you.
                </p>
                
                <div className="bg-muted/50 border border-border rounded-xl p-6 mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Send us an email at:</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg font-semibold text-black dark:text-white">{email}</span>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
                      title="Copy email"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-500 mt-2">Email copied to clipboard!</p>
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
                  className="px-6 py-2 text-black dark:text-white hover:bg-muted rounded-lg transition-colors"
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
