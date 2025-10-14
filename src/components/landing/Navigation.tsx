"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ModeToggle } from "@/components/global/ThemeToggle";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  const navItems: any[] = [];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-2xl border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <motion.div 
                  className="w-10 h-10 bg-transparent flex items-center justify-center group-hover:scale-105 transition-all duration-300"
                  animate={{
                    y: [0, -2, 0, 1, 0],
                    rotate: [0, 1, 0, -1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative">
                    {/* Enhanced minimalist envelope with motion lines */}
                    <svg width="28" height="18" viewBox="0 0 28 18" fill="none" className="text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                      {/* Enhanced envelope body with subtle gradient */}
                      <rect x="5" y="7" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                      {/* Enhanced envelope flap */}
                      <path d="M5 7 L14 2 L23 7" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                      {/* Enhanced motion lines with better spacing */}
                      <motion.line 
                        x1="0.5" y1="9" x2="4" y2="9" 
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
                        animate={{
                          x2: [4, 3.5, 4, 4.5, 4],
                          opacity: [0.8, 0.4, 0.8, 0.6, 0.8]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0
                        }}
                      />
                      <motion.line 
                        x1="0.5" y1="11.5" x2="3.5" y2="11.5" 
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"
                        animate={{
                          x2: [3.5, 3, 3.5, 4, 3.5],
                          opacity: [0.6, 0.2, 0.6, 0.4, 0.6]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                      />
                      <motion.line 
                        x1="0.5" y1="14" x2="4" y2="14" 
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
                        animate={{
                          x2: [4, 3.5, 4, 4.5, 4],
                          opacity: [0.8, 0.4, 0.8, 0.6, 0.8]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      />
                      {/* Subtle inner envelope detail */}
                      <rect x="7" y="9" width="14" height="7" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
                    </svg>
                  </div>
                </motion.div>
              </div>
              <span className="text-xl font-bold text-black dark:text-white">VectorMail</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={item.onClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          {/* Desktop CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center gap-3"
          >
            {/* Theme Toggle */}
            <ModeToggle />
            
            {isSignedIn ? (
              <Link href="/mail">
                <Button className="relative bg-white text-black hover:bg-white/90 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden">
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-accent px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="relative bg-white text-black hover:bg-white/90 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-accent rounded-xl transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border py-6 bg-gradient-to-b from-transparent to-muted/20"
            >
              <div className="space-y-6">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-accent rounded-xl transition-all duration-300 font-medium"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="border-t border-border pt-6 px-6 space-y-3">
                  {/* Theme Toggle for Mobile */}
                  <div className="flex justify-center pb-2">
                    <ModeToggle />
                  </div>
                  
                  {isSignedIn ? (
                    <Link href="/mail">
                      <Button 
                        className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/sign-in">
                        <Button 
                          variant="ghost" 
                          className="w-full text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-accent font-medium py-3 rounded-xl transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up">
                        <Button 
                          className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </motion.nav>
  );
}