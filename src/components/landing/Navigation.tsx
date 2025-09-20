"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { FeaturesModal } from "./FeaturesModal";
import { PricingModal } from "./PricingModal";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const { isSignedIn } = useUser();

  const navItems = [
    { name: "Features", href: "#features", onClick: () => setIsFeaturesModalOpen(true) },
    { name: "Pricing", href: "#pricing", onClick: () => setIsPricingModalOpen(true) },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0  z-50"
    >
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-center h-16 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute left-0 flex items-center gap-2"
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
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </motion.button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    }
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-black transition-colors font-medium text-left"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                {isSignedIn ? (
                  <Link href="/mail">
                    <button className="relative bg-black text-white hover:bg-gray-800 px-6 py-3 font-medium transition-colors border-2 border-white w-full text-left">
                      <span className="relative z-10">Dashboard</span>
                      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-white"></div>
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-in">
                      <Button variant="ghost" className="text-gray-700 hover:text-black justify-start w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button className="bg-black text-white hover:bg-gray-800 justify-start w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      <FeaturesModal 
        isOpen={isFeaturesModalOpen} 
        onClose={() => setIsFeaturesModalOpen(false)} 
      />
      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
      />
    </motion.nav>
  );
}
