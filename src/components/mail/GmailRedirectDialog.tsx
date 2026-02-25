"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTDOWN_SECONDS = 5;

interface GmailRedirectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenGmail: () => void;
}

export function GmailRedirectDialog({
  open,
  onOpenChange,
  onOpenGmail,
}: GmailRedirectDialogProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setCountdown(null);
      return;
    }
    setCountdown(COUNTDOWN_SECONDS);
  }, [open]);

  useEffect(() => {
    if (!open || countdown === null) return;
    if (countdown <= 0) {
      onOpenGmail();
      onOpenChange(false);
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [open, countdown, onOpenGmail, onOpenChange]);

  const handleOpenGmail = () => {
    onOpenGmail();
    onOpenChange(false);
  };

  const progress = countdown !== null ? 1 - countdown / COUNTDOWN_SECONDS : 0;
  const circumference = 2 * Math.PI * 38;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          "max-w-[400px] border border-zinc-700 bg-black p-0 overflow-hidden",
          "shadow-xl shadow-black/50",
        )}
      >
        <div className="px-8 pt-10 pb-8">
          <DialogHeader className="space-y-8 text-center">

            <div className="flex justify-center">
              <div className="relative flex h-[96px] w-[96px] items-center justify-center">
                {/* 5-second time circle bar around the logo */}
                <svg
                  className="absolute inset-0 size-full -rotate-90"
                  aria-hidden
                >
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    strokeWidth="4"
                    className="stroke-zinc-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    className="stroke-[#ea4335] transition-[stroke-dashoffset] duration-1000 ease-linear"
                  />
                </svg>
                <div
                  className={cn(
                    "relative flex h-16 w-16 items-center justify-center rounded-full",
                    "bg-zinc-800 ring-1 ring-zinc-600",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-9 w-9 text-[#ea4335]"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <DialogTitle className="text-[1.25rem] font-semibold tracking-tight text-zinc-50 text-center">
                Opening Gmail
              </DialogTitle>
              <DialogDescription className="text-[0.9375rem] leading-relaxed text-zinc-300 max-w-[300px] mx-auto text-center">
                Your draft is ready. We&apos;ll open Gmail in a new tab so you
                can send it from there.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="mt-8 space-y-4">
            {countdown !== null && countdown > 0 && (
              <p className="text-center text-[0.8125rem] font-medium tabular-nums text-zinc-400">
                Opening in {countdown} second{countdown !== 1 ? "s" : ""}
              </p>
            )}
            <Button
              onClick={handleOpenGmail}
              className={cn(
                "w-full h-11 rounded-lg font-medium",
                "bg-[#ea4335] text-white hover:bg-[#d93a2e]",
                "shadow-sm transition-colors duration-150",
              )}
              size="lg"
            >
              Open Gmail now
              <ArrowRight className="ml-2 h-4 w-4 opacity-90" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
