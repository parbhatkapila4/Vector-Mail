"use client";

import { motion } from "framer-motion";
import { Brain, Zap, Shield, Search, Bot, BarChart3, ArrowRight } from "lucide-react";
import Image from "next/image";



const companies = [
  { name: "Slack", logo: "slack" },
  { name: "Strapi", logo: "strapi" },
  { name: "Mapbox", logo: "mapbox" },
  { name: "Stencil", logo: "stencil" },
  { name: "Spotify", logo: "spotify" },
  { name: "WooCommerce", logo: "woocommerce" }
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-8">
            Trusted by 800,000+ highly productive companies
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex items-center gap-12 md:gap-16 opacity-60"
              animate={{ x: [0, -100 * companies.length] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[...companies, ...companies].map((company, index) => (
                <motion.div
                  key={`${company.name}-${index}`}
                  className="text-gray-400 font-medium text-lg hover:opacity-100 transition-opacity whitespace-nowrap"
                >
                  {company.name}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32 bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Image src="/img.png" alt="Features" width={500} height={500} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-black font-medium text-sm uppercase tracking-wider mb-4"
                >
                  How It Works
                </motion.p>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold text-black mb-6"
                >
                  Connect with AI chatbot
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  viewport={{ once: true }}
                  className="text-gray-600 text-lg leading-relaxed mb-8"
                >
                  Identify the platform or interface through which you can access the chatbot. This could be a website, a messaging app, or a dedicated application.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
              >
                <button className="group relative bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <span className="flex items-center">
                    Try It Now
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
