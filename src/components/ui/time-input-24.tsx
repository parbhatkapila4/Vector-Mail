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
        "flex items-center gap-2",
        className,
      )}
    >
      <Select
        value={hourStr}
        onValueChange={handleHourChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 min-w-[72px] border-white/10 bg-white/5 text-white focus:ring-yellow-500/50">
          <SelectValue placeholder="00" />
        </SelectTrigger>
        <SelectContent className="max-h-64 overflow-y-auto border-white/10 bg-[#0a0a0a] text-white">
          {HOURS.map((h) => (
            <SelectItem
              key={h}
              value={h}
              className="focus:bg-white/10 focus:text-white"
            >
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-zinc-400">:</span>
      <Select
        value={minuteStr}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 min-w-[72px] border-white/10 bg-white/5 text-white focus:ring-yellow-500/50">
          <SelectValue placeholder="00" />
        </SelectTrigger>
        <SelectContent className="max-h-64 overflow-y-auto border-white/10 bg-[#0a0a0a] text-white">
          {MINUTES.map((m) => (
            <SelectItem
              key={m}
              value={m}
              className="focus:bg-white/10 focus:text-white"
            >
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
