"use client";

import { useState } from "react";
import { Loader2, LogOut, Settings } from "lucide-react";
import { UserProfile, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ProfileMenuProps {
  onSignOut: () => void;
  isSigningOut: boolean;
}

export function ProfileMenu({ onSignOut, isSigningOut }: ProfileMenuProps) {
  const { user } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const imageUrl = user?.imageUrl ?? "";
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (user?.emailAddresses?.[0]?.emailAddress ?? "Account");
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-[#f3f4f6] dark:border-[#ffffff] dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-[#1e2a4a]"
            aria-label="Account menu"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-medium text-[#6b7280] dark:text-[#a1a1aa]">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[220px] rounded-lg border-[#e5e7eb] bg-white dark:border-[#ffffff] dark:bg-[#ffffff]"
        >
          <div className="flex items-center gap-3 border-b border-[#f3f4f6] px-2 py-3 dark:border-[#ffffff]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e5e7eb] text-[15px] font-medium text-[#6b7280] dark:bg-[#18181b] dark:text-[#a1a1aa]">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-[#111118] dark:text-[#f4f4f5]">{name}</p>
              {email && (
                <p className="truncate text-[12px] text-[#6b7280] dark:text-[#a1a1aa]">{email}</p>
              )}
            </div>
          </div>
          <DropdownMenuItem
            onClick={() => setProfileOpen(true)}
            className="cursor-pointer text-[#111118] focus:bg-[#f3f4f6] dark:text-[#f4f4f5] dark:focus:bg-[#ffffff]/[0.04]"
          >
            <Settings className="h-4 w-4" />
            Manage account
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onSignOut}
            disabled={isSigningOut}
            variant="destructive"
            className="cursor-pointer text-[#ef4444] focus:bg-[#fef2f2] dark:text-[#f87171] dark:focus:bg-[#7f1d1d]/30"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[min(880px,calc(100vw-2rem))] max-h-[min(720px,calc(100vh-2rem))] max-w-none overflow-y-auto border-[#e5e7eb] bg-white p-0 dark:border-[#ffffff] dark:bg-[#ffffff] sm:max-w-none"
        >
          <DialogTitle className="sr-only">Manage account</DialogTitle>
          <UserProfile routing="virtual" />
        </DialogContent>
      </Dialog>
    </>
  );
}
