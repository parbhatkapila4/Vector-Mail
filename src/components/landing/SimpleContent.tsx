"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function SimpleContent() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Email that understands you
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              VectorMail uses advanced AI to learn your communication patterns, understand context, and help you manage your inbox more efficiently than ever before.
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                "Automatic email categorization and priority sorting",
                "Smart reply suggestions based on your writing style",
                "Advanced search that understands context and meaning",
                "Privacy-first design with end-to-end encryption"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Visual Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="aspect-square bg-white rounded-2xl border border-gray-200 shadow-lg p-8 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
                <p>Feature visualization</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
