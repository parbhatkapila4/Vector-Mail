"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useEffect } from "react";

const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

const SHORTCUTS: { shortcut: string; action: string }[] = [
  { shortcut: "j / k", action: "Next / Previous thread" },
  { shortcut: "↑ / ↓", action: "Previous / Next thread" },
  { shortcut: "e", action: "Archive" },
  { shortcut: "#", action: "Delete / Move to trash" },
  { shortcut: "c", action: "Compose" },
  { shortcut: "r", action: "Reply" },
  { shortcut: "/", action: "Search" },
  { shortcut: "g then i", action: "Go to Inbox" },
  { shortcut: "g then s", action: "Go to Sent" },
  { shortcut: "?", action: "Show shortcuts" },
  { shortcut: "Esc", action: "Close thread or help" },
  {
    shortcut: isMac ? "⌘+N" : "Alt+N",
    action: "New Buddy chat",
  },
];

interface ShortcutHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutHelpModal({ open, onOpenChange }: ShortcutHelpModalProps) {
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-neutral-800 bg-neutral-950 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Keyboard shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="pb-3 pr-4 font-medium text-neutral-300">
                  Shortcut
                </th>
                <th className="pb-3 font-medium text-neutral-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUTS.map(({ shortcut, action }) => (
                <tr
                  key={shortcut}
                  className="border-b border-neutral-800/80 last:border-0"
                >
                  <td className="py-2.5 pr-4">
                    <kbd className="rounded border border-neutral-600 bg-neutral-800/80 px-2 py-0.5 font-mono text-xs font-medium text-neutral-200">
                      {shortcut}
                    </kbd>
                  </td>
                  <td className="py-2.5 text-neutral-400">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
