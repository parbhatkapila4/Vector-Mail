"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const REQUEST_ACCESS_EMAIL_BODY = `Hi Parbhat,

I evaluated VectorMail in demo mode and would like to request access to connect my Gmail account.

A few details to help with allowlisting:

  · Name:
  · Company / role:
  · Gmail address you'd like added:
  · How you intend to use VectorMail:

Please let me know what additional information you need and the expected timeline for onboarding.

Best regards,`;

const REQUEST_ACCESS_MAILTO = `mailto:parbhat@parbhat.dev?subject=${encodeURIComponent(
  "VectorMail - Request access",
)}&body=${encodeURIComponent(REQUEST_ACCESS_EMAIL_BODY)}`;

interface RequestAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestAccessDialog({
  open,
  onOpenChange,
}: RequestAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#e5e7eb] bg-white dark:border-[#ffffff] dark:bg-[#ffffff] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#111118] dark:text-[#f4f4f5]">
            Request access
          </DialogTitle>
          <DialogDescription className="text-left text-[#6b7280] dark:text-[#a1a1aa]">
            <span className="mt-2 block">
              VectorMail is currently in early access. We&apos;re
              onboarding teams individually to ensure the product is
              tuned for each workflow before we open public sign-up.
            </span>
            <span className="mt-3 block">
              To request access, submit the form below. We review
              every request personally and respond within one
              business day with confirmation and next steps. Once
              approved, you can sign in with your Gmail and begin
              using VectorMail on your own inbox.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#e5e7eb] dark:border-[#ffffff]"
          >
            Close
          </Button>
          <a
            href={REQUEST_ACCESS_MAILTO}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#1e2a4a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#b88a3f]"
            onClick={() => onOpenChange(false)}
          >
            Request access
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
