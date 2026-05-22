"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

export interface TimeInput24Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TimeInput24({
  value,
  onChange,
  className,
  disabled,
}: TimeInput24Props) {
  const [hour, minute] = React.useMemo(() => {
    const parts = value.split(":");
    return [
      Math.min(23, Math.max(0, parseInt(parts[0] ?? "0", 10) || 0)),
      Math.min(59, Math.max(0, parseInt(parts[1] ?? "0", 10) || 0)),
    ];
  }, [value]);

  const hourStr = hour.toString().padStart(2, "0");
  const minuteStr = minute.toString().padStart(2, "0");

  const handleHourChange = (h: string) => {
    onChange(`${h}:${minuteStr}`);
  };
  const handleMinuteChange = (m: string) => {
    onChange(`${hourStr}:${m}`);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        className,
      )}
    >
      <Select
        value={hourStr}
        onValueChange={handleHourChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Hour"
          className="h-10 w-[88px] justify-center gap-1.5 border-zinc-200 bg-white text-center font-mono text-base font-semibold tabular-nums text-zinc-900 shadow-sm transition-colors hover:border-zinc-300 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 data-[state=open]:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-600 dark:data-[state=open]:border-blue-500 [&>span]:flex-1 [&>span]:text-center"
        >
          <SelectValue placeholder="00" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={6}
          className="max-h-64 overflow-y-auto border-zinc-200 bg-white text-zinc-900 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {HOURS.map((h) => (
            <SelectItem
              key={h}
              value={h}
              className="font-mono text-base tabular-nums focus:bg-zinc-100 focus:text-zinc-900 dark:focus:bg-zinc-800 dark:focus:text-zinc-50"
            >
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span
        aria-hidden
        className="font-mono text-xl font-semibold text-zinc-400 dark:text-zinc-500"
      >
        :
      </span>
      <Select
        value={minuteStr}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Minute"
          className="h-10 w-[88px] justify-center gap-1.5 border-zinc-200 bg-white text-center font-mono text-base font-semibold tabular-nums text-zinc-900 shadow-sm transition-colors hover:border-zinc-300 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 data-[state=open]:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-600 dark:data-[state=open]:border-blue-500 [&>span]:flex-1 [&>span]:text-center"
        >
          <SelectValue placeholder="00" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={6}
          className="max-h-64 overflow-y-auto border-zinc-200 bg-white text-zinc-900 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {MINUTES.map((m) => (
            <SelectItem
              key={m}
              value={m}
              className="font-mono text-base tabular-nums focus:bg-zinc-100 focus:text-zinc-900 dark:focus:bg-zinc-800 dark:focus:text-zinc-50"
            >
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
