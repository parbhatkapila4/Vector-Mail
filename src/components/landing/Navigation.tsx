"use client"

import { useState } from "react"
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"

export function Navigation() {
  const { isSignedIn, user } = useUser()

  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="fixed top-10 inset-x-0 max-w-2xl mx-auto z-50">
        <nav
          className="relative rounded-full border border-purple-500/30 bg-black/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 flex justify-center items-center space-x-4 px-8 py-6"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,0,50,0.8) 100%)"
          }}
        >
          <Link href="/features" className="px-4 py-2">
            <span className="text-white hover:text-purple-300 transition-colors text-base font-medium">
              Features
            </span>
          </Link>

          <Link href="#pricing" className="px-4 py-2">
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
            <Link href="#pricing" className="px-4 py-2">
              <span className="text-white hover:text-purple-300 transition-colors text-base font-medium">
                Pricing
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
            <>
              <Link href="/sign-in" className="px-4 py-2">
                <span className="text-white hover:opacity-80 transition-opacity text-base font-medium">
                  Login
                </span>
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-base hover:scale-105">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
