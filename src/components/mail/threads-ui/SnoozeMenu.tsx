"use client";

import React, { useState } from "react";
import { format, startOfDay } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getLaterToday,
  getNextWeek,
  getTomorrow,
} from "@/lib/snooze-presets";

interface SnoozeMenuProps {
  threadId: string;
  accountId: string;
  isSnoozedTab?: boolean;
  children: React.ReactNode;
  className?: string;
  onSnoozed?: () => void;
}

export function SnoozeMenu({
  threadId,
  accountId,
  isSnoozedTab = false,
  children,
  className,
  onSnoozed,
}: SnoozeMenuProps) {
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState<Date | undefined>(() => {
    const t = new Date();
    t.setHours(9, 0, 0, 0);
    return t;
  });
  const [pickedTime, setPickedTime] = useState("09:00");

  const utils = api.useUtils();
  const snoozeMutation = api.account.snoozeThread.useMutation({
    onSuccess: (_, variables) => {
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      const until = new Date(variables.snoozedUntil);
      toast.success("Snoozed", {
        description: `Until ${format(until, "MMM d, yyyy 'at' h:mm a")}`,
      });
      onSnoozed?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to snooze");
    },
  });
  const unsnoozeMutation = api.account.unsnoozeThread.useMutation({
    onSuccess: () => {
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      toast.success("Unsnoozed", { description: "Thread is back in your inbox" });
      onSnoozed?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to unsnooze");
    },
  });

  const handlePreset = (date: Date) => {
    snoozeMutation.mutate({
      threadId,
      accountId,
      snoozedUntil: date.toISOString(),
    });
  };

  const handleUnsnooze = () => {
    unsnoozeMutation.mutate({ threadId, accountId });
  };

  const handleCustomConfirm = () => {
    if (!pickedDate) return;
    const parts = pickedTime.split(":").map(Number);
    const hours = Number.isFinite(parts[0]) ? (parts[0] ?? 0) : 0;
    const minutes = Number.isFinite(parts[1]) ? (parts[1] ?? 0) : 0;
    const combined = new Date(pickedDate);
    combined.setHours(hours, minutes, 0, 0);
    if (combined.getTime() <= Date.now()) {
      toast.error("Please pick a future time");
      return;
    }
    snoozeMutation.mutate({
      threadId,
      accountId,
      snoozedUntil: combined.toISOString(),
    });
    setCustomPickerOpen(false);
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[180px] border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          onClick={(e) => e.stopPropagation()}
        >
          {isSnoozedTab && (
            <DropdownMenuItem
              onClick={() => handleUnsnooze()}
              disabled={unsnoozeMutation.isPending}
              className="cursor-pointer"
            >
              <Clock className="mr-2 h-3.5 w-3.5" />
              Unsnooze
            </DropdownMenuItem>
          )}
          {!isSnoozedTab && (
            <>
              <DropdownMenuItem
                onClick={() => handlePreset(getLaterToday())}
                disabled={snoozeMutation.isPending}
                className="cursor-pointer"
              >
                Later today
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePreset(getTomorrow())}
                disabled={snoozeMutation.isPending}
                className="cursor-pointer"
              >
                Tomorrow
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePreset(getNextWeek())}
                disabled={snoozeMutation.isPending}
                className="cursor-pointer"
              >
                Next week
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setCustomPickerOpen(true)}
                disabled={snoozeMutation.isPending}
                className="cursor-pointer"
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                Pick date & time
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={customPickerOpen} onOpenChange={setCustomPickerOpen}>
        <DialogContent
          className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 sm:max-w-[360px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Snooze until</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div>
              <Label className="text-xs text-neutral-500 dark:text-neutral-400">
                Date
              </Label>
              <Calendar
                mode="single"
                selected={pickedDate}
                onSelect={setPickedDate}
                disabled={(date) =>
                  startOfDay(date) < startOfDay(new Date())
                }
                className="rounded-md border border-neutral-200 dark:border-neutral-800"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-500 dark:text-neutral-400">
                Time
              </Label>
              <Input
                type="time"
                value={pickedTime}
                onChange={(e) => setPickedTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCustomPickerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCustomConfirm}
              disabled={!pickedDate || snoozeMutation.isPending}
            >
              Snooze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
