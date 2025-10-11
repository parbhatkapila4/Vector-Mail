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
      className="fixed top-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-white">VectorMail</span>
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
            className="hidden md:flex items-center gap-4"
          >
            {isSignedIn ? (
              <Link href="/mail">
                <Button className="bg-white text-black hover:bg-gray-100 font-medium">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-white text-black hover:bg-gray-100 font-medium">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 py-4"
            >
              <div className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="border-t border-white/10 pt-4 px-4 space-y-2">
                  {isSignedIn ? (
                    <Link href="/mail" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-white text-black hover:bg-gray-100">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full bg-white text-black hover:bg-gray-100">
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