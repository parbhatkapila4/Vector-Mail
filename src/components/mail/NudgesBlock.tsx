"use client";

import React, { useState } from "react";
import { Bell, ChevronDown, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const NUDGES_DISPLAY_LIMIT = 7;

interface NudgesBlockProps {
  accountId: string;
  onThreadSelect: (threadId: string) => void;
  className?: string;
}

export function NudgesBlock({
  accountId,
  onThreadSelect,
  className,
}: NudgesBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = api.account.getNudges.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId && accountId.length > 0 },
  );

  const nudges = data?.nudges ?? [];
  const displayNudges = nudges.slice(0, NUDGES_DISPLAY_LIMIT);
  const count = nudges.length;

  if (!accountId) return null;

  const header = (
    <button
      type="button"
      onClick={() => setExpanded((e) => !e)}
      className={cn(
        "flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors",
        "hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded",
      )}
      aria-expanded={expanded}
    >
      {expanded ? (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
      )}
      <Bell className="h-3.5 w-3.5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
      <span className="text-xs font-medium uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
        Nudges
      </span>
      <span
        className={cn(
          "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-medium tabular-nums",
          "bg-[#f1f3f4] text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]",
        )}
      >
        {isLoading ? "…" : count}
      </span>
    </button>
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "shrink-0 border-b border-[#dadce0] px-2 py-2 dark:border-[#3c4043]",
          className,
        )}
      >
        {header}
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#8ab4f8]" />
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div
        className={cn(
          "shrink-0 border-b border-[#dadce0] px-2 py-2 dark:border-[#3c4043]",
          className,
        )}
      >
        {header}
        {expanded && (
          <p className="px-2 py-3 text-center text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            You're all caught up
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 border-b border-[#dadce0] px-2 py-2 dark:border-[#3c4043]",
        className,
      )}
    >
      {header}
      {expanded && (
        <ul className="space-y-0.5">
          {displayNudges.map((nudge) => (
            <li key={nudge.threadId}>
              <button
                type="button"
                onClick={() => onThreadSelect(nudge.threadId)}
                className={cn(
                  "flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left transition-colors",
                  "hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]",
                )}
              >
                <div className="flex items-center gap-1.5">
                  {nudge.type === "REMINDER" && (
                    <Bell className="h-3 w-3 shrink-0 text-[#b36b00] dark:text-[#fdd663]" />
                  )}
                  <span className="truncate text-xs font-medium text-[#202124] dark:text-[#e8eaed]">
                    {nudge.thread?.subject ?? "(No subject)"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                    {nudge.reason}
                  </span>
                  {nudge.thread?.lastMessageDate && (
                    <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                      · {formatDistanceToNow(new Date(nudge.thread.lastMessageDate), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
