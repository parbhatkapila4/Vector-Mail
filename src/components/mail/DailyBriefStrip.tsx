"use client";

import { useCallback, useMemo, useState } from "react";
import { useSetAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  Newspaper,
  MessageCircleReply,
  Flame,
  Feather,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  Bell,
  Clock,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";
import { threadIdAtom } from "@/hooks/use-threads";
import { trackInboxBrainEvent } from "@/lib/analytics/inbox-brain";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { REMIND_PRESETS, getRemindPresetLabel } from "@/lib/remind-presets";
import {
  getLaterToday,
  getNextWeek,
  getTomorrow,
} from "@/lib/snooze-presets";

export interface DailyBriefStripProps {
  accountId: string;
  isDemo?: boolean;
  onThreadSelect: (threadId: string) => void;
  className?: string;
  onShowKeyboardHelp?: () => void;
  showDesktopShortcuts?: boolean;
}

const SECTIONS = [
  {
    key: "needsReply" as const,
    title: "Needs reply",
    icon: MessageCircleReply,
    hint: "People waiting on you",
  },
  {
    key: "important" as const,
    title: "Important",
    icon: Flame,
    hint: "Signals that deserve attention",
  },
  {
    key: "lowPriority" as const,
    title: "Can wait",
    icon: Feather,
    hint: "Newsletters & bulk mail",
  },
] as const;

const DEMO_ACTIONS_MSG =
  "Connect a mailbox to snooze, set reminders, or mark threads done from the brief.";

type DailyBriefData = RouterOutputs["account"]["getDailyBrief"];
type BriefRow = DailyBriefData["needsReply"][number];

type SnoozeVars = { threadId: string; accountId: string; snoozedUntil: string };
type RemindVars = { threadId: string; accountId: string; days: number };
type ArchiveVars = { accountId: string; threadIds: string[] };

type BriefMutation<TVars> = {
  mutate: (vars: TVars) => void;
  isPending: boolean;
  variables: TVars | undefined;
};

function BriefRowActions({
  accountId,
  threadId,
  subject,
  isDemo,
  onOpenThread,
  snoozeMutation,
  remindMutation,
  archiveMutation,
}: {
  accountId: string;
  threadId: string;
  subject: string;
  isDemo: boolean;
  onOpenThread: () => void;
  snoozeMutation: BriefMutation<SnoozeVars>;
  remindMutation: BriefMutation<RemindVars>;
  archiveMutation: BriefMutation<ArchiveVars>;
}) {
  const snoozeBusy =
    snoozeMutation.isPending && snoozeMutation.variables?.threadId === threadId;
  const remindBusy =
    remindMutation.isPending && remindMutation.variables?.threadId === threadId;
  const archiveBusy =
    archiveMutation.isPending &&
    archiveMutation.variables?.threadIds?.includes(threadId);

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-11 w-11 shrink-0 rounded-md text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
      aria-label={`Actions for thread: ${subject || "No subject"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {snoozeBusy || remindBusy || archiveBusy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <MoreVertical className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );

  return (
    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[200px] border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onOpenThread()}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </DropdownMenuItem>
          {isDemo ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled
                className="cursor-not-allowed"
                title={DEMO_ACTIONS_MSG}
              >
                <Bell className="h-3.5 w-3.5" />
                Remind
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="cursor-not-allowed"
                title={DEMO_ACTIONS_MSG}
              >
                <Clock className="h-3.5 w-3.5" />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                variant="destructive"
                className="cursor-not-allowed"
                title={DEMO_ACTIONS_MSG}
              >
                <Archive className="h-3.5 w-3.5" />
                Mark done
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <Bell className="h-3.5 w-3.5" />
                  Remind
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                  {REMIND_PRESETS.map(({ days }) => (
                    <DropdownMenuItem
                      key={days}
                      className="cursor-pointer"
                      disabled={remindBusy}
                      onClick={() =>
                        remindMutation.mutate({ threadId, accountId, days })
                      }
                    >
                      {getRemindPresetLabel(days)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <Clock className="h-3.5 w-3.5" />
                  Snooze
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    disabled={snoozeBusy}
                    onClick={() =>
                      snoozeMutation.mutate({
                        threadId,
                        accountId,
                        snoozedUntil: getLaterToday().toISOString(),
                      })
                    }
                  >
                    Later today
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    disabled={snoozeBusy}
                    onClick={() =>
                      snoozeMutation.mutate({
                        threadId,
                        accountId,
                        snoozedUntil: getTomorrow().toISOString(),
                      })
                    }
                  >
                    Tomorrow
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    disabled={snoozeBusy}
                    onClick={() =>
                      snoozeMutation.mutate({
                        threadId,
                        accountId,
                        snoozedUntil: getNextWeek().toISOString(),
                      })
                    }
                  >
                    Next week
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                disabled={archiveBusy}
                onClick={() =>
                  archiveMutation.mutate({
                    accountId,
                    threadIds: [threadId],
                  })
                }
              >
                <Archive className="h-3.5 w-3.5" />
                Mark done
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function DailyBriefStrip({
  accountId,
  isDemo = false,
  onThreadSelect,
  className,
  onShowKeyboardHelp,
  showDesktopShortcuts = true,
}: DailyBriefStripProps) {
  const [expanded, setExpanded] = useState(false);
  const setThreadId = useSetAtom(threadIdAtom);
  const utils = api.useUtils();

  const { data, isLoading, isFetching, isError, refetch } =
    api.account.getDailyBrief.useQuery(
      { accountId: accountId || "placeholder" },
      { enabled: !!accountId && accountId.length > 0 },
    );

  const invalidateAfterBriefAction = useCallback(() => {
    void utils.account.getDailyBrief.invalidate({ accountId });
    void utils.account.getThreads.invalidate();
    void utils.account.getNumThreads.invalidate();
    void utils.account.getUnifiedThreads.invalidate();
    void utils.account.getNudges.invalidate();
  }, [utils, accountId]);

  const snoozeMutation = api.account.snoozeThread.useMutation({
    onSuccess: (_, variables) => {
      invalidateAfterBriefAction();
      const until = new Date(variables.snoozedUntil);
      toast.success("Snoozed", {
        description: `Until ${format(until, "MMM d, yyyy 'at' h:mm a")}`,
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to snooze");
    },
  });

  const remindMutation = api.account.setReminder.useMutation({
    onSuccess: (_, variables) => {
      invalidateAfterBriefAction();
      const date = new Date();
      date.setDate(date.getDate() + variables.days);
      date.setHours(9, 0, 0, 0);
      toast.success("Reminder set", {
        description: `Remind you on ${format(date, "MMM d, yyyy")} if no reply`,
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to set reminder");
    },
  });

  const archiveMutation = api.account.bulkArchiveThreads.useMutation({
    onSuccess: () => {
      invalidateAfterBriefAction();
      toast.success("Marked done", {
        description: "Thread archived and removed from the inbox.",
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to archive thread");
    },
  });

  const totals = useMemo(() => {
    if (!data) return { n: 0, empty: true };
    const n =
      data.needsReply.length + data.important.length + data.lowPriority.length;
    return { n, empty: n === 0 };
  }, [data]);

  if (!accountId) return null;

  const header = (
    <div className="flex w-full min-w-0 items-center gap-1.5 px-1 py-0.5">
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          title={
            showDesktopShortcuts
              ? "AI Inbox Brain · Today's prioritized threads"
              : "Today's brief: keyboard shortcuts available on desktop"
          }
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left transition-colors",
            "hover:bg-[#f3f4f6] dark:hover:bg-[#ffffff]/[0.04]",
          )}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
          )}
          <Newspaper className="h-3.5 w-3.5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
          <span className="min-w-0 text-xs font-medium uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
            Today&apos;s brief
          </span>
        </button>
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-center text-[11px] font-medium tabular-nums",
            "bg-[#f1f3f4] text-[#5f6368] dark:bg-[#27272a] dark:text-[#9aa0a6]",
          )}
          aria-label={
            isLoading
              ? "Brief count loading"
              : `${totals.n} thread${totals.n === 1 ? "" : "s"} in today’s brief`
          }
        >
          {isLoading ? "…" : totals.n}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            trackInboxBrainEvent("daily_brief_refreshed", {
              brief_thread_count: totals.n,
            });
            void refetch();
          }}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9ca3af] transition-colors",
            "hover:bg-[#e8eaed] hover:text-[#5f6368] dark:hover:bg-[#27272a] dark:hover:text-[#d4d4d8]",
          )}
          aria-label="Refresh brief"
          title="Refresh brief"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isFetching && !isLoading && "animate-spin")}
          />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "shrink-0 border-b border-[#e5e7eb] px-2 py-2 dark:border-[#1a1a23]",
          className,
        )}
        aria-busy="true"
        aria-label="Loading today's brief"
      >
        {header}
        {expanded && (
          <div className="mt-2 space-y-2 border-t border-[#e5e7eb] pt-2 dark:border-[#1a1a23]">
            <div className="flex items-center gap-2 px-1">
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#3b82f6] dark:text-[#60a5fa]" />
              <div className="h-3 w-full max-w-[180px] animate-pulse rounded bg-[#e5e7eb] dark:bg-[#27272a]" />
            </div>
            <div className="h-16 animate-pulse rounded-lg bg-[#f3f4f6] dark:bg-[#18181b]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 border-b border-[#e5e7eb] px-2 py-2 dark:border-[#1a1a23]",
        className,
      )}
    >
      {header}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 max-h-[min(50vh,380px)] space-y-3 overflow-y-auto overflow-x-hidden border-t border-[#e5e7eb] pt-2 dark:border-[#1a1a23] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {isError ? (
                <p className="px-1 py-2.5 text-[11px] leading-relaxed text-[#6b7280] dark:text-[#a1a1aa]">
                  Brief is temporarily unavailable. Try refreshing in a moment.
                </p>
              ) : !data ? (
                <p className="px-1 py-2.5 text-[11px] leading-relaxed text-[#6b7280] dark:text-[#a1a1aa]">
                  Brief will appear after sync finishes. You can keep working;
                  refresh in a minute.
                </p>
              ) : totals.empty ? (
                <p className="px-1 py-2.5 text-[11px] leading-relaxed text-[#6b7280] dark:text-[#a1a1aa]">
                  Quiet inbox: your{" "}
                  <span className="font-medium text-[#374151] dark:text-[#d4d4d8]">
                    Inbox brain
                  </span>{" "}
                  will add needs-reply, what matters, and can-wait threads here as
                  mail moves (after sync, if needed).
                </p>
              ) : (
                SECTIONS.map(({ key, title, icon: Icon, hint }) => {
                  const items = data[key];
                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-[#e5e7eb] bg-white/90 px-2 py-2.5 dark:border-[#27272a] dark:bg-[#111113]/90"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <Icon className="h-3 w-3 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
                        <span className="truncate text-[11px] font-semibold text-[#111118] dark:text-[#e8eaed]">
                          {title}
                        </span>
                        <span className="ml-auto tabular-nums text-[10px] font-medium text-[#9ca3af] dark:text-[#71717a]">
                          {items.length}
                        </span>
                      </div>
                      <p className="mb-1.5 text-[10px] leading-tight text-[#9ca3af] dark:text-[#71717a]">
                        {hint}
                      </p>
                      <ul className="space-y-0.5">
                        {items.length === 0 ? (
                          <li className="py-1.5 text-[10px] leading-snug text-[#9ca3af] dark:text-[#71717a]">
                            No threads in this bucket yet.
                          </li>
                        ) : (
                          items.map((row, idx) => (
                            <motion.li
                              key={row.threadId}
                              initial={{ opacity: 0, x: -3 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: idx * 0.02,
                                duration: 0.15,
                                ease: "easeOut",
                              }}
                              className="flex gap-1"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setThreadId(row.threadId);
                                  onThreadSelect(row.threadId);
                                }}
                                aria-label={`Open thread: ${row.subject || "No subject"}`}
                                className={cn(
                                  "flex min-h-[44px] min-w-0 flex-1 flex-col gap-0.5 rounded-md border border-transparent px-1.5 py-1.5 text-left transition-colors",
                                  "hover:border-[#e5e7eb] hover:bg-[#f9fafb] dark:hover:border-[#3f3f46] dark:hover:bg-[#ffffff]/[0.04]",
                                  "[touch-action:manipulation]",
                                )}
                              >
                                <span className="line-clamp-2 text-left text-[11px] font-medium leading-snug text-[#111118] dark:text-[#e4e4e7]">
                                  {row.subject || "(No subject)"}
                                </span>
                                <span className="line-clamp-1 text-[10px] text-[#6b7280] dark:text-[#a1a1aa]">
                                  {row.reason}
                                </span>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span
                                    className="text-[10px] text-[#9ca3af] underline decoration-dotted underline-offset-2 dark:text-[#71717a]"
                                    title={`Why this? ${row.reason}`}
                                  >
                                    Why this?
                                  </span>
                                  {row.confidence && (
                                    <span className="rounded-full bg-[#eef2ff] px-1.5 py-0.5 text-[10px] font-medium text-[#4f46e5] dark:bg-[#312e81]/40 dark:text-[#c7d2fe]">
                                      {row.confidence}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] tabular-nums text-[#9ca3af] dark:text-[#71717a]">
                                  {formatDistanceToNow(
                                    new Date(row.lastMessageDate),
                                    { addSuffix: true },
                                  )}
                                </span>
                              </button>
                              <BriefRowActions
                                accountId={accountId}
                                threadId={row.threadId}
                                subject={row.subject || "(No subject)"}
                                isDemo={isDemo}
                                onOpenThread={() => {
                                  setThreadId(row.threadId);
                                  onThreadSelect(row.threadId);
                                }}
                                snoozeMutation={snoozeMutation}
                                remindMutation={remindMutation}
                                archiveMutation={archiveMutation}
                              />
                            </motion.li>
                          ))
                        )}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
