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
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all",
        "hover:bg-[#ffffff]/40 dark:hover:bg-[#1e2a4a]/[0.06]",
      )}
      aria-expanded={expanded}
    >
      {expanded ? (
        <ChevronDown className="h-3 w-3 shrink-0 text-[#b88a3f] dark:text-[#1e2a4a] transition-transform" />
      ) : (
        <ChevronRight className="h-3 w-3 shrink-0 text-[#8a8278] transition-transform group-hover:text-[#b88a3f] dark:group-hover:text-[#1e2a4a]" />
      )}
      <span
        className="text-[#8a8278] dark:text-[#8a8278]"
        style={{
          fontFamily:
            "var(--font-jetbrains-mono), ui-monospace, monospace",
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.16em",
        }}
      >
        <span className="text-[#b88a3f] dark:text-[#1e2a4a]">✦</span>{" "}
        NUDGES
      </span>
      <span
        style={{
          fontFamily:
            "var(--font-jetbrains-mono), ui-monospace, monospace",
          fontSize: 9.5,
          color: expanded ? "#b88a3f" : "#8a8278",
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
        className="dark:text-[#1e2a4a]"
      >
        · {isLoading ? "…" : count}
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
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#1e2a4a]" />
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
                    <Bell className="h-3 w-3 shrink-0 text-[#b36b00] dark:text-[#ffffff]" />
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
