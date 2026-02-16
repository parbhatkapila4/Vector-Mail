"use client";

import React from "react";
import { format } from "date-fns";
import { BellOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REMIND_PRESETS, getRemindPresetLabel } from "@/lib/remind-presets";

interface RemindMenuProps {
  threadId: string;
  accountId: string;
  isRemindersTab?: boolean;
  children: React.ReactNode;
  className?: string;
  onReminderSet?: () => void;
}

export function RemindMenu({
  threadId,
  accountId,
  isRemindersTab = false,
  children,
  onReminderSet,
}: RemindMenuProps) {
  const utils = api.useUtils();
  const setReminderMutation = api.account.setReminder.useMutation({
    onSuccess: (_, variables) => {
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      const date = new Date();
      date.setDate(date.getDate() + variables.days);
      date.setHours(9, 0, 0, 0);
      toast.success("Reminder set", {
        description: `Remind you on ${format(date, "MMM d, yyyy")} if no reply`,
      });
      onReminderSet?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to set reminder");
    },
  });
  const clearReminderMutation = api.account.clearReminder.useMutation({
    onSuccess: () => {
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      toast.success("Reminder cleared");
      onReminderSet?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to clear reminder");
    },
  });

  const handlePreset = (days: number) => {
    setReminderMutation.mutate({ threadId, accountId, days });
  };

  const handleClearReminder = () => {
    clearReminderMutation.mutate({ threadId, accountId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px] border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        {isRemindersTab && (
          <DropdownMenuItem
            onClick={() => handleClearReminder()}
            disabled={clearReminderMutation.isPending}
            className="cursor-pointer"
          >
            <BellOff className="mr-2 h-3.5 w-3.5" />
            Clear reminder
          </DropdownMenuItem>
        )}
        {!isRemindersTab && (
          <>
            {REMIND_PRESETS.map(({ days }) => (
              <DropdownMenuItem
                key={days}
                onClick={() => handlePreset(days)}
                disabled={setReminderMutation.isPending}
                className="cursor-pointer"
              >
                {getRemindPresetLabel(days)}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
