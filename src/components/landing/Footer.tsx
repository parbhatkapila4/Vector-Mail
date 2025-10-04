"use client";

import { motion } from "framer-motion";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  
  

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 ">
       

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 flex flex-col md:flex-row justify-between items-center py-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 VectorMail AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="/privacy" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="/terms" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Made for better email conversation
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
