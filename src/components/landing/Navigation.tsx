"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { FeaturesModal } from "./FeaturesModal";
import { PricingModal } from "./PricingModal";
import { ContactModal } from "./ContactModal";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { isSignedIn } = useUser();

  const navItems = [
    { name: "Features", href: "#features", onClick: () => setIsFeaturesModalOpen(true) },
    { name: "Pricing", href: "#pricing", onClick: () => setIsPricingModalOpen(true) },
    { name: "Contact", href: "#contact", onClick: () => setIsContactModalOpen(true) }
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0  z-50"
    >
      <div className="max-w-6xl mx-auto px-4 mt-2 sm:mt-4">
        <div className="flex items-center justify-center h-14 sm:h-16 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute left-0 flex items-center gap-2 md:left-0"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold text-black">VectorMail AI</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 border-black/30 bg-black/5 backdrop-blur-md border px-4 py-3 rounded-3xl">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={item.onClick}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="text-gray-700 hover:text-black transition-colors font-medium"
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute right-0 hidden md:flex items-center gap-4"
          >
            {isSignedIn ? (
              <Link href="/mail">
                <button className="relative bg-black text-white hover:bg-gray-800 px-6 py-3 font-medium transition-colors border-2 border-white">
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-white"></div>
                </button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-gray-700 hover:text-black">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-black text-white hover:bg-gray-800">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:hidden p-2 ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </motion.button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Sidebar */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden"
              >
                <div className="flex flex-col h-full">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">V</span>
                      </div>
                      <span className="text-base font-bold text-black">VectorMail AI</span>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 p-3">
                    <div className="space-y-4">
                      {/* Navigation Items */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Navigation
                        </h3>
                        {navItems.map((item, index) => (
                          <motion.button
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            onClick={() => {
                              if (item.onClick) {
                                item.onClick();
                              }
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-200 text-left"
                          >
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="font-medium">{item.name}</span>
                          </motion.button>
                        ))}
                      </div>

                      {/* Dashboard Section */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Account
                        </h3>
                        {isSignedIn ? (
                          <Link href="/mail">
                            <motion.button
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              onClick={() => setIsMenuOpen(false)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-all duration-200"
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                              <span className="font-medium">Dashboard</span>
                            </motion.button>
                          </Link>
                        ) : (
                          <div className="space-y-2">
                            <Link href="/sign-in">
                              <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-200 text-left"
                              >
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="font-medium">Sign In</span>
                              </motion.button>
                            </Link>
                            <Link href="/sign-up">
                              <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.5 }}
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-all duration-200"
                              >
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="font-medium">Get Started</span>
                              </motion.button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Footer */}
                  <div className="p-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      © 2024 VectorMail AI. All rights reserved.
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      
      <FeaturesModal 
        isOpen={isFeaturesModalOpen} 
        onClose={() => setIsFeaturesModalOpen(false)} 
      />
      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
      />
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </motion.nav>
  );
}
