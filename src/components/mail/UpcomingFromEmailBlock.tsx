"use client";

import React, { useState } from "react";
import { CalendarDays, ChevronDown, ChevronRight, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { buildGoogleCalendarUrl } from "@/lib/calendar-url";

const UPCOMING_DISPLAY_LIMIT = 20;

interface UpcomingFromEmailBlockProps {
  accountId: string;
  onThreadSelect?: (threadId: string) => void;
  className?: string;
}

export function UpcomingFromEmailBlock({
  accountId,
  onThreadSelect,
  className,
}: UpcomingFromEmailBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = api.account.getUpcomingEventsFromEmails.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId && accountId.length > 0 && expanded },
  );

  const events = data?.events ?? [];
  const displayEvents = events.slice(0, UPCOMING_DISPLAY_LIMIT);

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
      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
      <span className="text-xs font-medium uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
        Upcoming from email
      </span>
      <span
        className={cn(
          "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-medium tabular-nums",
          "bg-[#f1f3f4] text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]",
        )}
      >
        {data === undefined && !isLoading ? "-" : isLoading ? "…" : events.length}
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

  if (events.length === 0) {
    return (
      <div
        className={cn(
          "shrink-0 border-b border-[#dadce0] px-2 py-2 dark:border-[#3c4043]",
          className,
        )}
      >
        {header}
        {expanded && (
          <div className="space-y-2 px-2 py-3">
            <p className="text-center text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              No meeting-related emails found in the last 60 days. Emails that look like meetings or calendar invites will appear here.
            </p>
            <a
              href={buildGoogleCalendarUrl({
                title: "New event",
                startAt: new Date().toISOString(),
                endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              })}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[11px] font-medium",
                "text-[#1a73e8] hover:bg-[#e8f0fe] dark:text-[#8ab4f8] dark:hover:bg-[#3c4043]",
              )}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Add to calendar
            </a>
          </div>
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
          {displayEvents.map((event) => (
            <li key={`${event.sourceThreadId}-${event.startAt}`}>
              <div
                className={cn(
                  "flex flex-col gap-1 rounded-lg px-2 py-2",
                  onThreadSelect && "group",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onThreadSelect?.(event.sourceThreadId)}
                    className={cn(
                      "min-w-0 flex-1 text-left",
                      onThreadSelect &&
                      "cursor-pointer hover:opacity-80 rounded focus:outline-none focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-[#8ab4f8]",
                    )}
                  >
                    <span className="block truncate text-xs font-medium text-[#202124] dark:text-[#e8eaed]">
                      {event.title}
                    </span>
                    <span className="block text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                      {format(new Date(event.startAt), "MMM d, h:mm a")}
                      {"location" in event && event.location ? ` · ${event.location}` : ""}
                    </span>
                  </button>
                  <a
                    href={buildGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[11px] font-medium",
                      "text-[#1a73e8] hover:bg-[#e8f0fe] dark:text-[#8ab4f8] dark:hover:bg-[#3c4043]",
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CalendarPlus className="h-3 w-3" />
                    Add to calendar
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
