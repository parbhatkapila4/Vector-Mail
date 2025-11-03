"use client"

import { useState } from "react"
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { HoveredLink, Menu, MenuItem } from "../ui/navbar-menu"
import { cn } from "@/lib/utils"
import { Mail } from "lucide-react"

export function Navigation() {
  const [active, setActive] = useState<string | null>(null)
  const { isSignedIn, user } = useUser()

  return (
    <div className="relative w-full flex items-center justify-center">
      <div className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50")}>
        <Menu setActive={setActive}>
          <MenuItem setActive={setActive} active={active} item="Features">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="#features">Smart Prioritization</HoveredLink>
              <HoveredLink href="#features">AI Responses</HoveredLink>
              <HoveredLink href="#features">Semantic Search</HoveredLink>
              <HoveredLink href="#features">Privacy First</HoveredLink>
            </div>
          </MenuItem>
          
          <MenuItem setActive={setActive} active={active} item="Product">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="#features">Lightning-Fast Interface</HoveredLink>
              <HoveredLink href="#features">AI-Powered Summaries</HoveredLink>
              <HoveredLink href="#features">Smart Search</HoveredLink>
              <HoveredLink href="#features">Keyboard Shortcuts</HoveredLink>
            </div>
          </MenuItem>

          <MenuItem setActive={setActive} active={active} item="Pricing">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="#pricing">Free</HoveredLink>
              <HoveredLink href="#pricing">Pro</HoveredLink>
              <HoveredLink href="#pricing">Team</HoveredLink>
              <HoveredLink href="#pricing">Enterprise</HoveredLink>
            </div>
          </MenuItem>

          {isSignedIn ? (
            <div className="flex items-center gap-3 px-4">
              <UserButton />
              <span className="text-sm font-medium text-white">
                {user?.fullName || user?.firstName || "User"}
              </span>
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="px-4 py-2">
                <span className="text-white hover:opacity-80 transition-opacity text-sm font-medium">
                  Login
                </span>
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm hover:scale-105">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}
