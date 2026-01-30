import React, { useRef, useCallback, useMemo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { MoreVertical, RefreshCw, Mail, Star, Bell, CalendarClock, X } from "lucide-react";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";
import { isSearchingAtom, searchValueAtom } from "../search/SearchBar";
import { SearchResults } from "../search/SearchResults";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { SnoozeMenu } from "./SnoozeMenu";
import { RemindMenu } from "./RemindMenu";

interface ThreadListProps {
  onThreadSelect?: (threadId: string) => void;
}

type RouterThread = RouterOutputs["account"]["getThreads"]["threads"][0];

const CATEGORY_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  promotions: {
    label: "Promotions",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  social: {
    label: "Social",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  updates: {
    label: "Updates",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  forums: {
    label: "Forums",
    className:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  },
};

interface Thread {
  id: string;
  subject: string;
  lastMessageDate: Date;
  emails: Array<{
    from?: { name: string | null };
    bodySnippet?: string | null;
    sysLabels: string[];
    sysClassifications?: string[];
  }>;
}

interface GroupedThreads {
  [date: string]: Thread[];
}

const CONNECTION_ERROR_MESSAGES = {
  NO_ACCOUNT: "Connect your inbox",
  CONNECT_DESCRIPTION:
    "Link your Google account to start managing emails with AI-powered features.",
  CONNECT_BUTTON: "Connect Google Account",
} as const;

export function ThreadList({ onThreadSelect }: ThreadListProps) {
  const {
    threads: rawThreads,
    threadId,
    setThreadId,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    accountId,
    refetch,
  } = useThreads();
  const threads = rawThreads as RouterThread[] | undefined;
  const [isSearching] = useAtom(isSearchingAtom);
  const [searchValue] = useAtom(searchValueAtom);
  const [currentTab] = useLocalStorage("vector-mail", "inbox");
  const [refreshingAfterSync, setRefreshingAfterSync] = React.useState(false);

  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();

  const utils = api.useUtils();
  const syncEmailsMutation = api.account.syncEmails.useMutation({
    onSuccess: async (data) => {
      console.log("[ThreadList] ✅ Sync completed", data);

      if (data.needsReconnection) {
        toast.error("Session expired", {
          description: "Your account needs to be reconnected. Redirecting...",
          duration: 3000,
        });

        setTimeout(async () => {
          try {
            const { getAurinkoAuthUrl } = await import("@/lib/aurinko");
            const url = await getAurinkoAuthUrl("Google");
            window.location.href = url;
          } catch (error) {
            console.error("Error reconnecting account:", error);
            toast.error("Failed to reconnect", {
              description: "Please try refreshing the page and reconnecting manually.",
            });
          }
        }, 2000);
        return;
      }

      await utils.account.getThreads.invalidate();
      await utils.account.getNumThreads.invalidate();
      await utils.account.getAccounts.invalidate();

      setRefreshingAfterSync(true);
      try {
        await refetch();
      } finally {
        setRefreshingAfterSync(false);
      }

      const hasMore = "hasMore" in data && data.hasMore;
      const continueToken = "continueToken" in data ? data.continueToken : undefined;
      if (data.success && hasMore && continueToken && accountId) {
        const folder = currentTab === "sent" ? "sent" : "inbox";
        syncEmailsMutation.mutate({
          accountId,
          folder: folder as "inbox" | "sent",
          continueToken,
        });
        return;
      }

      if (data.success) {
        toast.success("Sync complete", {
          description: data.message ?? "Emails synced",
          duration: 2000,
        });
      }
    },
    onError: (error) => {
      console.error("[ThreadList] ❌ Sync failed:", error);

      const errorMessage = error.message || "Unknown error occurred";


      if (errorMessage.includes("timed out") || errorMessage.includes("timeout")) {
        toast.error("Sync timed out", {
          description: "The request took too long. Please try again in a moment.",
          duration: 4000,
        });
      } else if (errorMessage.includes("UNAUTHORIZED") || errorMessage.includes("Authentication")) {
        toast.error("Sync failed", {
          description: "There was an authentication issue. Please try again in a moment.",
          duration: 4000,
        });
      } else {
        toast.error("Sync failed", {
          description: errorMessage.length > 100 ? "An error occurred while syncing. Please try again." : errorMessage,
          duration: 4000,
        });
      }

      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      void refetch();
    },
  });

  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleRefresh = useCallback(() => {
    if (accountId) {
      const folder = currentTab === "sent" ? "sent" : "inbox";
      console.log(`[ThreadList] Sync button clicked - full sync (60-day window) for ${folder}`);
      syncEmailsMutation.mutate({
        accountId,
        forceFullSync: true,
        folder: folder as "inbox" | "sent",
      });
    } else {
      void refetch();
    }
  }, [refetch, accountId, syncEmailsMutation, currentTab]);

  const handleAccountConnection = useCallback(async () => {
    try {
      const { getAurinkoAuthUrl } = await import("@/lib/aurinko");
      const url = await getAurinkoAuthUrl("Google");
      window.location.href = url;
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  }, []);

  const lastThreadElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          void fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const threadsToRender = useMemo(() => threads ?? [], [threads]);

  const groupedThreads = useMemo(() => {
    if (!threadsToRender || threadsToRender.length === 0) return {};
    return threadsToRender.reduce((acc: GroupedThreads, thread: Thread) => {
      const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(thread);
      return acc;
    }, {});
  }, [threadsToRender]);

  const allThreads = threadsToRender ?? [];
  const lastThreadId = allThreads[allThreads.length - 1]?.id;

  const handleSearchResultSelect = useCallback(
    (id: string) => {
      setThreadId(id);
      onThreadSelect?.(id);
    },
    [setThreadId, onThreadSelect],
  );

  const { data: scheduledSends } = api.account.getScheduledSends.useQuery(
    { accountId: accountId || "placeholder" },
    {
      enabled:
        currentTab === "scheduled" &&
        !!accountId &&
        accountId.length > 0 &&
        !accountsLoading,
    },
  );
  const cancelScheduledMutation = api.account.cancelScheduledSend.useMutation({
    onSuccess: () => {
      void utils.account.getScheduledSends.invalidate();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to cancel");
    },
  });

  if (accountsLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-orange-500 dark:border-neutral-800 dark:border-t-orange-400" />
          <p className="mt-4 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (currentTab === "scheduled") {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-black">
        <div className="flex-shrink-0 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Scheduled sends
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Emails that will be sent at the chosen time
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!scheduledSends || scheduledSends.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <CalendarClock className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                No scheduled sends
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                Schedule an email from Compose, Reply, or Forward
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {scheduledSends.map((item: { id: string; subject: string; scheduledAt: Date }) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                      {item.subject}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {format(item.scheduledAt, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                    onClick={() => cancelScheduledMutation.mutate({ id: item.id })}
                    disabled={cancelScheduledMutation.isPending}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (!accountId || (accounts !== undefined && accounts.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center bg-white p-10 dark:bg-black">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
            <Mail className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          </div>
          <h2 className="mb-3 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {CONNECTION_ERROR_MESSAGES.NO_ACCOUNT}
          </h2>
          <p className="mb-8 text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {CONNECTION_ERROR_MESSAGES.CONNECT_DESCRIPTION}
          </p>
          <button
            onClick={handleAccountConnection}
            className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/40"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {CONNECTION_ERROR_MESSAGES.CONNECT_BUTTON}
          </button>
        </div>
      </div>
    );
  }

  const renderThreadItem = (thread: Thread, isLast: boolean) => {
    const latestEmail = thread.emails?.[0] ?? null;
    const fromName = latestEmail?.from?.name ?? "Unknown";
    const subject = thread.subject || "(No subject)";
    const date = thread.lastMessageDate ?? new Date();
    const bodySnippet = latestEmail?.bodySnippet ?? null;
    const sysLabels = latestEmail?.sysLabels ?? [];
    const sysClassifications = latestEmail?.sysClassifications ?? [];
    const isUnread = sysLabels.includes("unread");
    const isImportant = sysLabels.includes("important");
    const isSelected = threadId === thread.id;
    const categoryBadges = sysClassifications
      .filter((c): c is string => Boolean(c) && c !== "personal")
      .slice(0, 2)
      .map((c) => CATEGORY_BADGE[c.toLowerCase()])
      .filter(
        (b): b is { label: string; className: string } => Boolean(b),
      );

    const showSnooze =
      accountId &&
      (currentTab === "inbox" || currentTab === "snoozed");
    const showRemind =
      accountId &&
      (currentTab === "inbox" ||
        currentTab === "snoozed" ||
        currentTab === "reminders");

    return (
      <div
        key={thread.id}
        ref={isLast ? lastThreadElementRef : null}
        className={cn(
          "relative flex w-full items-stretch gap-0 border-b border-neutral-100 text-left transition-all duration-150 dark:border-neutral-900",
          isSelected
            ? "bg-gradient-to-r from-orange-50 to-amber-50 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:bg-orange-500 dark:from-orange-950/30 dark:to-amber-950/30 dark:before:bg-orange-400"
            : isUnread && !isSelected
              ? "bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
              : "hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50",
        )}
      >
        <button
          type="button"
          className={cn(
            "relative flex min-w-0 flex-1 gap-4 px-5 py-3.5 text-left outline-none",
          )}
          onClick={() => {
            setThreadId(thread.id);
            onThreadSelect?.(thread.id);
          }}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-semibold transition-all duration-150",
              isSelected
                ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                : isUnread
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
            )}
          >
            {fromName.charAt(0).toUpperCase()}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-[14px] font-semibold",
                      isUnread || isSelected
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-700 dark:text-neutral-300",
                    )}
                  >
                    {fromName}
                  </span>
                  {isUnread && !isSelected && (
                    <span className="mt-0.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 dark:bg-orange-400" />
                  )}
                </div>
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "truncate text-[14px]",
                      isUnread || isSelected
                        ? "font-medium text-neutral-900 dark:text-white"
                        : "font-normal text-neutral-600 dark:text-neutral-400",
                    )}
                  >
                    {subject}
                  </span>
                  {categoryBadges.map((badge) => (
                    <span
                      key={badge.label}
                      className={cn(
                        "inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
                {bodySnippet && (
                  <div className="line-clamp-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-500">
                    {bodySnippet}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                {isImportant && (
                  <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500 dark:fill-orange-400 dark:text-orange-400" />
                )}
                <span className="whitespace-nowrap text-[11px] font-medium text-neutral-500 dark:text-neutral-500">
                  {formatDistanceToNow(date, { addSuffix: false })}
                </span>
              </div>
            </div>
          </div>
        </button>
        {(showSnooze || showRemind) && (
          <div className="flex items-center gap-0.5 pr-1">
            {showSnooze && (
              <SnoozeMenu
                threadId={thread.id}
                accountId={accountId}
                isSnoozedTab={currentTab === "snoozed"}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  aria-label="Snooze"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </SnoozeMenu>
            )}
            {showRemind && (
              <RemindMenu
                threadId={thread.id}
                accountId={accountId}
                isRemindersTab={currentTab === "reminders"}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  aria-label="Remind me if no reply"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </RemindMenu>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderThreadsList = () => {
    if (refreshingAfterSync) {
      return (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-orange-500 dark:border-neutral-800 dark:border-t-orange-400" />
          <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
            Refreshing inbox…
          </p>
        </div>
      );
    }
    if (isFetching && threadsToRender.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-orange-500 dark:border-neutral-800 dark:border-t-orange-400" />
        </div>
      );
    }

    if (Object.keys(groupedThreads).length === 0 && !isFetching) {
      const isRemindersTab = currentTab === "reminders";
      return (
        <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
          {isRemindersTab ? (
            <Bell className="mb-4 h-11 w-11 text-neutral-300 dark:text-neutral-700" />
          ) : (
            <Mail className="mb-4 h-11 w-11 text-neutral-300 dark:text-neutral-700" />
          )}
          <p className="text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
            {isRemindersTab
              ? "No reminders due"
              : "No emails found"}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {Object.entries(groupedThreads).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white px-5 py-2.5 dark:border-neutral-900 dark:bg-black">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                {format(new Date(date), "MMM d, yyyy")}
              </span>
            </div>
            {threads.map((thread) =>
              renderThreadItem(thread, thread.id === lastThreadId),
            )}
          </React.Fragment>
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-orange-500 dark:border-neutral-800 dark:border-t-orange-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-black">
      <div className="flex items-center justify-between border-b border-neutral-200/50 px-5 py-2.5 dark:border-neutral-800/30">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
          {isSearching && searchValue
            ? "Search Results"
            : currentTab === "reminders"
              ? `${threadsToRender.length} reminder${threadsToRender.length === 1 ? "" : "s"}`
              : `${threadsToRender.length} conversations`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={syncEmailsMutation.isPending}
            className="h-7 gap-2 rounded-lg px-2.5 text-[12px] font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                syncEmailsMutation.isPending && "animate-spin",
              )}
            />
            {syncEmailsMutation.isPending ? "Syncing" : "Sync"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isSearching && searchValue ? (
          <SearchResults onResultSelect={handleSearchResultSelect} />
        ) : (
          renderThreadsList()
        )}
      </div>
    </div>
  );
}
