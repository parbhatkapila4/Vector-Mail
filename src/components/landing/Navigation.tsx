"use client"

import { useState } from "react"
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const { isSignedIn, user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Desktop Navigation */}
      <div className="hidden lg:block fixed top-10 inset-x-0 max-w-2xl mx-auto z-[100] px-4">
        <nav
          className="relative rounded-full border border-purple-500/30 bg-black/90 backdrop-blur-xl shadow-2xl shadow-purple-500/10 flex justify-center items-center space-x-4 px-8 py-6"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,0,50,0.9) 100%)"
          }}
        >
          <Link href="/features" className="px-4 py-2">
            <span className="text-white hover:text-purple-300 transition-colors text-base font-medium">
              Features
            </span>
          </Link>

          <Link href="/pricing" className="px-4 py-2">
            <span className="text-white hover:text-purple-300 transition-colors text-base font-medium">
              Pricing
            </span>
          </Link>

          {isSignedIn ? (
            <Link href="/mail" className="px-4 py-2">
              <span className="text-white hover:text-purple-300 transition-colors text-base font-medium">
                Inbox
              </span>
            </Link>
          ) : (
            <Link href="/about" className="px-4 py-2">
              <span className="text-white hover:text-purple-300 transition-colors text-base font-medium">
                About
              </span>
            </Link>
          )}

          {isSignedIn ? (
            <div className="flex items-center gap-3 px-4">
              <UserButton />
              <span className="text-base font-medium text-white">
                {user?.fullName || user?.firstName || "User"}
              </span>
            </div>
          ) : (
            <Link href="/sign-in">
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-base hover:scale-105">
                Login
              </button>
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-[100] px-4 pt-4">
        <nav
          className="relative rounded-2xl border border-purple-500/30 bg-black/90 backdrop-blur-xl shadow-2xl shadow-purple-500/10"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,0,50,0.9) 100%)"
          }}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-white font-bold text-lg">VectorMail</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="px-4 pb-4 space-y-2 border-t border-purple-500/20 pt-4">
              <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-white font-medium">Features</span>
              </Link>

              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-white font-medium">Pricing</span>
              </Link>

              {isSignedIn ? (
                <Link href="/mail" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                  <span className="text-white font-medium">Inbox</span>
                </Link>
              ) : (
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                  <span className="text-white font-medium">About</span>
                </Link>
              )}

              {isSignedIn ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <UserButton />
                  <span className="text-base font-medium text-white">
                    {user?.fullName || user?.firstName || "User"}
                  </span>
                </div>
              ) : (
                <div className="pt-2">
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                      Login
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}
