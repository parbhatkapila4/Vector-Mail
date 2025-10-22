"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Mail, Sparkles } from "lucide-react"
import { useState, useCallback } from "react"
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"

const NAVIGATION_ITEMS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
] as const

const BRAND_CONFIG = {
  name: 'VectorMail',
  logo: {
    gradient: 'from-[#C2847A] to-[#D4A896]',
    icon: Mail,
    accent: Sparkles,
  },
} as const

const USER_BUTTON_STYLES = {
  avatarBox: "w-8 h-8",
  userButtonPopoverCard: "bg-black border border-[#C2847A]/20",
  userButtonPopoverActionButton: "text-white hover:bg-[#C2847A]/10",
  userButtonPopoverActionButtonText: "text-gray-300",
  userButtonPopoverFooter: "hidden",
} as const

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser()

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const Logo = () => (
    <Link href="/">
      <motion.div 
        className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-xl flex items-center justify-center shadow-lg shadow-[#C2847A]/30 group-hover:shadow-xl group-hover:shadow-[#C2847A]/50 transition-all duration-300">
          <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-3 h-3 text-[#C2847A] animate-pulse" />
          </div>
        </div>
        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#C2847A] to-[#D4A896] bg-clip-text text-transparent">
          {BRAND_CONFIG.name}
        </span>
      </motion.div>
    </Link>
  )

  const DesktopNavigation = () => (
    <div className="hidden md:flex items-center gap-4 lg:gap-6">
      {isSignedIn ? (
        <div className="flex items-center gap-3">
          <UserButton 
            appearance={{
              elements: USER_BUTTON_STYLES,
            }}
          />
          <span className="text-sm font-medium text-white">
            {user?.fullName || user?.firstName || "User"}
          </span>
        </div>
      ) : (
        <Link href="/sign-in">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-medium text-gray-300 hover:text-[#C2847A] transition-colors px-4 py-2"
          >
            Sign in
          </motion.button>
        </Link>
      )}
    </div>
  )

  const MobileMenuButton = () => (
    <button
      onClick={toggleMenu}
      className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
    >
      <Menu className="w-6 h-6 text-white" />
    </button>
  )

  const MobileMenu = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-[#C2847A]/20"
        >
          <div className="px-6 py-4 space-y-4">
            {NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="block text-gray-300 hover:text-[#C2847A] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {isSignedIn ? (
              <div className="flex items-center gap-3 pt-4 border-t border-[#C2847A]/20">
                <UserButton 
                  appearance={{
                    elements: USER_BUTTON_STYLES,
                  }}
                />
                <span className="text-sm font-medium text-white">
                  {user?.fullName || user?.firstName || "User"}
                </span>
              </div>
            ) : (
              <Link href="/sign-in" onClick={closeMenu}>
                <button className="w-full text-left text-gray-300 hover:text-[#C2847A] transition-colors">
                  Sign in
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-[#C2847A]/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Logo />
          <DesktopNavigation />
          <MobileMenuButton />
        </div>
        <MobileMenu />
      </div>
    </nav>
  )
}