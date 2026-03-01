import React, { useRef, useCallback, useMemo, useEffect, useImperativeHandle, forwardRef } from "react";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { MoreVertical, RefreshCw, Mail, MailOpen, Star, Bell, CalendarClock, X, Trash2 } from "lucide-react";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@clerk/nextjs";
import { api, type RouterOutputs } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";
import { UNIFIED_INBOX_ACCOUNT_ID } from "../AccountSwitcher";
import { isSearchingAtom, searchValueAtom } from "../search/SearchBar";
import { SearchResults } from "../search/SearchResults";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { SnoozeMenu } from "./SnoozeMenu";
import type { InfiniteData } from "@tanstack/react-query";
import { RemindMenu } from "./RemindMenu";
import { ThreadListSkeleton } from "./ThreadListSkeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";

interface ThreadListProps {
  onThreadSelect?: (threadId: string) => void;
  onSyncPendingChange?: (pending: boolean) => void;
}

export interface ThreadListRef {
  triggerSync: () => void;
}

type RouterThread = RouterOutputs["account"]["getThreads"]["threads"][0];

const CATEGORY_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  promotions: {
    label: "Promotions",
    className:
      "bg-[#fef7e0] text-[#b36b00] dark:bg-[#5c3317] dark:text-[#fdd663]",
  },
  social: {
    label: "Social",
    className:
      "bg-[#e8f0fe] text-[#1967d2] dark:bg-[#174ea6]/40 dark:text-[#8ab4f8]",
  },
  updates: {
    label: "Updates",
    className:
      "bg-[#e6f4ea] text-[#137333] dark:bg-[#0d652d]/40 dark:text-[#81c995]",
  },
  forums: {
    label: "Forums",
    className:
      "bg-[#f3e8fd] text-[#7c4dff] dark:bg-[#5e35b1]/40 dark:text-[#c4a6ff]",
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
    "Connect the same Google account you use to sign in to manage your email with AI.",
  CONNECT_BUTTON: "Connect your Google account",
} as const;

export const ThreadList = forwardRef<ThreadListRef, ThreadListProps>(function ThreadList(
  { onThreadSelect, onSyncPendingChange },
  ref,
) {
  const searchParams = useSearchParams();
  const {
    threads: rawThreads,
    threadId,
    setThreadId,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    accountId,
    effectiveAccountId,
    isUnifiedView,
    refetch,
    isPlaceholderData,
    selectedLabelId,
  } = useThreads();
  const threads = rawThreads as (RouterThread & { accountEmail?: string; accountName?: string })[] | undefined;
  const [isSearching] = useAtom(isSearchingAtom);
  const [searchValue] = useAtom(searchValueAtom);
  const { isLoaded: authLoaded, userId: clerkUserId } = useAuth();
  const [currentTab] = useLocalStorage("vector-mail", "inbox");
  const [important] = useLocalStorage("vector-mail-important", false);
  const [unread] = useLocalStorage("vector-mail-unread", false);
  const [refreshingAfterSync] = React.useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = React.useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const isDemo = useDemoMode() && accountId === DEMO_ACCOUNT_ID;

  useEffect(() => {
    if (searchParams.get("reconnect_failed") === "1") {
      toast.error("Reconnect didn’t complete", {
        description: "Auth failed right after connecting. Please try reconnecting again or check your Google account.",
        duration: 5000,
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("reconnect_failed");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    const errorParam = searchParams.get("error");
    if (errorParam === "account_mismatch") {
      toast.error("Use the same Google account", {
        description: "Please connect the same Google account you used to sign in. Sign out and sign in with the correct account if needed.",
        duration: 8000,
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.pathname + url.search);
    } else if (errorParam === "one_account_only") {
      toast.error("One account per user", {
        description: "You already have a connected account. We use a single Google account per user.",
        duration: 6000,
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedThreadIds(new Set());
  }, [currentTab]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedThreadIds(new Set()), []);

  const selectAllVisible = useCallback(() => {
    setSelectedThreadIds(new Set((threads ?? []).map((t) => t.id)));
  }, [threads]);

  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery(undefined, {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    });

  const utils = api.useUtils();
  const syncCancelledRef = useRef(false);
  const quickSyncTriggeredRef = useRef(false);
  const accountsInvalidatedOnMountRef = useRef(false);
  useEffect(() => {
    if (accountsInvalidatedOnMountRef.current) return;
    accountsInvalidatedOnMountRef.current = true;
    void utils.account.getAccounts.invalidate();
  }, [utils.account.getAccounts]);

  const syncFirstBatchQuickMutation = api.account.syncFirstBatchQuick.useMutation({
    onSuccess: async () => {
      void utils.account.getAccounts.invalidate();
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
      await refetch();
      setTimeout(() => void refetch(), 800);
    },
  });
  const syncEmailsMutation = api.account.syncEmails.useMutation({
    onSuccess: async (data) => {
      if (syncCancelledRef.current) {
        syncCancelledRef.current = false;
        return;
      }
      console.log("[ThreadList] ✅ Sync completed", data);

      if (data.needsReconnection) {
        toast.error("Sync failed", {
          description: "Reconnect your email account in settings to sync new emails. Your current emails are still here.",
          duration: 5000,
        });
        void utils.account.getAccounts.invalidate();
        return;
      }

      void utils.account.getNumThreads.invalidate();
      void utils.account.getAccounts.invalidate();
      await utils.account.getThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
      await refetch();
      setTimeout(() => void refetch(), 600);

      const didFullSync = "syncAllFolders" in data && data.syncAllFolders === true;
      const hasMore = !didFullSync && "hasMore" in data && data.hasMore;
      const continueToken = "continueToken" in data ? data.continueToken : undefined;
      if (data.success && hasMore && continueToken && accountId && accountId !== UNIFIED_INBOX_ACCOUNT_ID) {
        const folder = currentTab === "sent" ? "sent" : currentTab === "trash" ? "trash" : "inbox";
        syncEmailsMutation.mutate({
          accountId,
          folder: folder as "inbox" | "sent" | "trash",
          continueToken,
        });
        return;
      }

      if (data.success) {
        toast.success("Sync complete", {
          description: (data as { syncAllFolders?: boolean }).syncAllFolders
            ? "Inbox, Sent, and Trash synced."
            : (data.message ?? "Emails synced"),
          duration: 2000,
        });
      }
    },
    onError: (error) => {
      if (syncCancelledRef.current) {
        syncCancelledRef.current = false;
        return;
      }
      console.error("[ThreadList] ❌ Sync failed:", error);

      const errorMessage = error.message || "Unknown error occurred";


      if (errorMessage.includes("timed out") || errorMessage.includes("timeout")) {
        toast.error("Sync timed out", {
          description: "The request took too long. Please try again in a moment.",
          duration: 4000,
        });
      } else if (
        errorMessage.includes("UNAUTHORIZED") ||
        errorMessage.includes("Authentication") ||
        errorMessage.toLowerCase().includes("sign in")
      ) {
        toast.error("Sync failed", {
          description: "Session couldn’t be verified. Refresh the page and try Sync again.",
          duration: 5000,
        });
      } else {
        toast.error("Sync failed", {
          description: errorMessage.length > 100 ? "An error occurred while syncing. Please try again." : errorMessage,
          duration: 4000,
        });
      }

      void utils.account.getNumThreads.invalidate();
      void utils.account.getThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
      void refetch();
    },
    onSettled: () => {
      void utils.account.getThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
      void refetch();
    },
  });

  const getThreadsInput = useMemo(
    () => ({
      accountId: accountId ?? "placeholder",
      tab: currentTab,
      important,
      unread,
      limit: currentTab === "inbox" || currentTab === "label" ? 50 : 15,
      labelId: currentTab === "label" ? selectedLabelId ?? undefined : undefined,
    }),
    [accountId, currentTab, important, unread, selectedLabelId],
  );

  const invalidateAndClearSelection = useCallback(async () => {
    await utils.account.getThreads.invalidate();
    await utils.account.getUnifiedThreads.invalidate();
    await utils.account.getNumThreads.invalidate();
    setSelectedThreadIds(new Set());
  }, [utils]);

  const bulkMarkReadMutation = api.account.bulkMarkRead.useMutation({
    onSuccess: async () => {
      await invalidateAndClearSelection();
      toast.success("Marked as read");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to mark as read");
    },
  });

  const bulkMarkUnreadMutation = api.account.bulkMarkUnread.useMutation({
    onSuccess: async () => {
      await invalidateAndClearSelection();
      toast.success("Marked as unread");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to mark as unread");
    },
  });

  type GetThreadsPage = RouterOutputs["account"]["getThreads"];
  const bulkDeleteMutation = api.account.bulkDeleteThreads.useMutation({
    onMutate: async (input) => {
      await utils.account.getThreads.cancel();
      const previousData = utils.account.getThreads.getInfiniteData(getThreadsInput) as
        | InfiniteData<GetThreadsPage>
        | undefined;
      if (previousData?.pages) {
        const newPages = previousData.pages.map((page) => ({
          ...page,
          threads: page.threads.filter((t: RouterThread) => !input.threadIds.includes(t.id)),
        })) as GetThreadsPage[];
        utils.account.getThreads.setInfiniteData(getThreadsInput, (old) =>
          old ? { ...old, pages: newPages } : old,
        );
      }
      return { previousPages: previousData };
    },
    onError: (err, _input, context) => {
      setDeleteConfirmOpen(false);
      if (context?.previousPages !== undefined) {
        utils.account.getThreads.setInfiniteData(getThreadsInput, context.previousPages as never);
      }
      toast.error(err.message ?? "Failed to delete", { id: "bulk-delete" });
    },
    onSuccess: async () => {
      setDeleteConfirmOpen(false);
      toast.success("Deleted", { id: "bulk-delete" });
      await invalidateAndClearSelection();
    },
    onSettled: () => {
      void utils.account.getThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
    },
  });

  const bulkArchiveMutation = api.account.bulkArchiveThreads.useMutation({
    onMutate: async (input) => {
      await utils.account.getThreads.cancel();
      const previousData = utils.account.getThreads.getInfiniteData(getThreadsInput) as
        | InfiniteData<GetThreadsPage>
        | undefined;
      if (previousData?.pages) {
        const newPages = previousData.pages.map((page) => ({
          ...page,
          threads: page.threads.filter((t: RouterThread) => !input.threadIds.includes(t.id)),
        })) as GetThreadsPage[];
        utils.account.getThreads.setInfiniteData(getThreadsInput, (old) =>
          old ? { ...old, pages: newPages } : old,
        );
      }
      return { previousPages: previousData };
    },
    onError: (_err, _input, context) => {
      if (context?.previousPages !== undefined) {
        utils.account.getThreads.setInfiniteData(getThreadsInput, context.previousPages as never);
      }
      toast.error("Failed to archive");
    },
    onSuccess: async () => {
      await invalidateAndClearSelection();
      toast.success("Archived");
    },
    onSettled: () => {
      void utils.account.getThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
    },
  });

  const isBulkPending =
    bulkMarkReadMutation.isPending ||
    bulkMarkUnreadMutation.isPending ||
    bulkDeleteMutation.isPending ||
    bulkArchiveMutation.isPending;

  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleRefresh = useCallback(() => {
    if (syncEmailsMutation.isPending) {
      syncCancelledRef.current = true;
      syncEmailsMutation.reset();
      toast.info("Sync stopped");
      return;
    }
    if (!accountId) {
      toast.error("Please wait for your account to load, then try Sync again.");
      return;
    }
    if (accountId === UNIFIED_INBOX_ACCOUNT_ID) {
      void utils.account.getUnifiedThreads.invalidate();
      void refetch();
      return;
    }
    syncCancelledRef.current = false;
    toast.info("Checking for new emails…");

    syncEmailsMutation.mutate({
      accountId,
      forceFullSync: false,
      syncAllFolders: false,
      folder: "inbox",
    });
  }, [refetch, accountId, syncEmailsMutation, utils.account.getUnifiedThreads]);

  useImperativeHandle(ref, () => ({ triggerSync: handleRefresh }), [handleRefresh]);

  const backgroundSyncTriggeredRef = useRef(false);
  useEffect(() => {
    if (
      !accountId ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      (currentTab !== "inbox" && currentTab !== "sent")
    )
      return;
    if (!quickSyncTriggeredRef.current) {
      quickSyncTriggeredRef.current = true;
      syncFirstBatchQuickMutation.mutate({ accountId });
    }
  }, [accountId, currentTab, syncFirstBatchQuickMutation]);

  useEffect(() => {
    if (
      !accountId ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      backgroundSyncTriggeredRef.current ||
      (currentTab !== "inbox" && currentTab !== "sent")
    )
      return;
    backgroundSyncTriggeredRef.current = true;
    const t = setTimeout(() => {
      syncEmailsMutation.mutate({
        accountId,
        forceFullSync: false,
        syncAllFolders: false,
        folder: "inbox",
      });
    }, 8000);
    return () => clearTimeout(t);
  }, [accountId, currentTab, syncEmailsMutation]);

  useEffect(() => {
    onSyncPendingChange?.(syncEmailsMutation.isPending);
  }, [syncEmailsMutation.isPending, onSyncPendingChange]);

  useEffect(() => {
    if (
      !syncEmailsMutation.isPending ||
      !accountId ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      (currentTab !== "inbox" && currentTab !== "sent" && currentTab !== "trash")
    )
      return;
    const interval = setInterval(() => {
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      void refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [syncEmailsMutation.isPending, accountId, currentTab, refetch, utils.account.getThreads, utils.account.getNumThreads]);

  const handleAccountConnection = useCallback(() => {
    window.location.href = "/api/connect/google";
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "x" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("[role='checkbox']")) return;
      if (threadId) {
        e.preventDefault();
        toggleSelection(threadId);
      }
    },
    [threadId, toggleSelection],
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

  const { data: nudgesData } = api.account.getNudges.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId && accountId.length > 0 },
  );
  const nudgeTypeByThreadId = useMemo(() => {
    const map = new Map<string, "REMINDER" | "UNREPLIED">();
    for (const n of nudgesData?.nudges ?? []) {
      map.set(n.threadId, n.type);
    }
    return map;
  }, [nudgesData?.nudges]);

  if (accountsLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-[#202124]">
        <div className="text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#8ab4f8]" />
          <p className="mt-3 text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentTab === "scheduled") {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-[#202124]">
        <div className="flex-shrink-0 border-b border-[#dadce0] px-4 py-3 dark:border-[#3c4043]">
          <h2 className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">Scheduled sends</h2>
          <p className="mt-0.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]">Emails that will be sent at the chosen time</p>
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
            <ul className="divide-y divide-[#dadce0] dark:divide-[#3c4043]">
              {scheduledSends.map((item: { id: string; subject: string; scheduledAt: Date }) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f8f9fa] dark:hover:bg-[#292a2d]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#202124] dark:text-[#e8eaed]">{item.subject}</p>
                    <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">{format(item.scheduledAt, "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-[#d93025] hover:bg-[#fce8e6] dark:text-[#f28b82] dark:hover:bg-[#5f2120]"
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
      <div className="flex h-full items-center justify-center bg-white p-10 dark:bg-[#202124]">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f3f4] dark:bg-[#3c4043]">
            <Mail className="h-8 w-8 text-[#5f6368] dark:text-[#9aa0a6]" />
          </div>
          <h2 className="mb-2 text-lg font-medium text-[#202124] dark:text-[#e8eaed]">{CONNECTION_ERROR_MESSAGES.NO_ACCOUNT}</h2>
          <p className="mb-6 text-[14px] leading-relaxed text-[#5f6368] dark:text-[#9aa0a6]">{CONNECTION_ERROR_MESSAGES.CONNECT_DESCRIPTION}</p>
          <button
            onClick={handleAccountConnection}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1a73e8] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
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
    const isRowSelected = selectedThreadIds.has(thread.id);
    const categoryBadges = sysClassifications
      .filter((c): c is string => Boolean(c) && c !== "personal")
      .slice(0, 2)
      .map((c) => CATEGORY_BADGE[c.toLowerCase()])
      .filter(
        (b): b is { label: string; className: string } => Boolean(b),
      );
    const threadLabels = (thread as RouterThread & { threadLabels?: Array<{ label: { id: string; name: string; color: string | null } }> }).threadLabels?.map((tl: { label: { id: string; name: string; color: string | null } }) => tl.label) ?? [];

    const showSnooze =
      (effectiveAccountId ?? accountId) &&
      (currentTab === "inbox" || currentTab === "snoozed");
    const showRemind =
      (effectiveAccountId ?? accountId) &&
      (currentTab === "inbox" ||
        currentTab === "snoozed" ||
        currentTab === "reminders");
    const nudgeType = nudgeTypeByThreadId.get(thread.id);
    const threadAccountId = (thread as { accountId?: string }).accountId ?? accountId ?? "";
    const accountLabel = isUnifiedView && "accountEmail" in thread ? String((thread as { accountEmail?: string; accountName?: string }).accountEmail ?? (thread as { accountEmail?: string; accountName?: string }).accountName ?? "") : "";
    return (
      <div
        key={thread.id}
        ref={isLast ? lastThreadElementRef : null}
        className={cn(
          "group relative flex w-full min-h-[48px] items-start gap-0 border-b border-[#f1f3f4] text-left transition-colors dark:border-[#3c4043]",
          isSelected
            ? "bg-[#e8f0fe] dark:bg-[#174ea6]/20"
            : isUnread && !isSelected
              ? "bg-white hover:bg-[#f8f9fa] dark:bg-[#202124] dark:hover:bg-[#292a2d]"
              : "hover:bg-[#f8f9fa] dark:hover:bg-[#292a2d]",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 flex-col overflow-hidden pt-3 transition-[width,padding,opacity] duration-150",
            isRowSelected
              ? "w-[48px] pl-2 opacity-100 pointer-events-auto"
              : "w-0 min-w-0 pl-0 opacity-0 pointer-events-none group-hover:w-[48px] group-hover:min-w-0 group-hover:pl-2 group-hover:opacity-100 group-hover:pointer-events-auto",
          )}
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Checkbox
              checked={isRowSelected}
              onCheckedChange={() => toggleSelection(thread.id)}
              aria-label={`Select ${subject}`}
              className="border-[#5f6368] dark:border-[#9aa0a6] data-[state=checked]:bg-[#1a73e8] data-[state=checked]:border-[#1a73e8] dark:data-[state=checked]:bg-[#8ab4f8] dark:data-[state=checked]:border-[#8ab4f8]"
            />
          </div>
        </div>
        <button
          type="button"
          className="relative flex min-h-[48px] min-w-0 flex-1 gap-3 px-2 py-2.5 pr-2 text-left outline-none [touch-action:manipulation]"
          onClick={() => {
            setThreadId(thread.id);
            onThreadSelect?.(thread.id);
          }}
        >
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-medium",
              (nudgeType || isUnread) && "ring-2 ring-[#1a73e8] dark:ring-[#8ab4f8]",
              isSelected
                ? "bg-[#1a73e8] text-white dark:bg-[#8ab4f8] dark:text-[#202124]"
                : isUnread
                  ? "bg-[#1a73e8] text-white dark:bg-[#8ab4f8] dark:text-[#202124]"
                  : "bg-[#e8eaed] text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]",
            )}
          >
            {fromName.charAt(0).toUpperCase()}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={cn(
                      "truncate text-[13px]",
                      isUnread || isSelected
                        ? "font-semibold text-[#202124] dark:text-[#e8eaed]"
                        : "font-normal text-[#5f6368] dark:text-[#9aa0a6]",
                    )}
                  >
                    {fromName}
                  </span>
                  {isUnread && !isSelected && (
                    <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-[#1a73e8] dark:bg-[#8ab4f8]" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 truncate">
                  <span
                    className={cn(
                      "truncate text-[13px]",
                      isUnread || isSelected
                        ? "font-medium text-[#202124] dark:text-[#e8eaed]"
                        : "font-normal text-[#5f6368] dark:text-[#9aa0a6]",
                    )}
                  >
                    {subject}
                  </span>
                  {accountLabel && (
                    <span className="shrink-0 rounded bg-[#e8eaed] px-1.5 py-0.5 text-[10px] font-medium text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]">
                      {accountLabel}
                    </span>
                  )}
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
                  {threadLabels.slice(0, 3).map((lbl: { id: string; name: string; color: string | null }) => (
                    <span
                      key={lbl.id}
                      className="inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-[#e8f0fe] text-[#1967d2] dark:bg-[#174ea6]/40 dark:text-[#8ab4f8]"
                      style={lbl.color ? { backgroundColor: `${lbl.color}20`, color: lbl.color } : undefined}
                    >
                      {lbl.name}
                    </span>
                  ))}
                </div>
                {bodySnippet && (
                  <div className="line-clamp-2 text-[12px] leading-snug text-[#5f6368] dark:text-[#9aa0a6]">
                    {bodySnippet}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5 pt-0.5">
                <div className="flex items-center gap-1">
                  {nudgeType === "REMINDER" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex shrink-0 text-[#5f6368] dark:text-[#9aa0a6]">
                          <Bell className="h-3 w-3 text-[#b36b00] dark:text-[#fdd663]" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-[#303134] text-xs text-[#e8eaed]">
                        Reminder
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {isImportant && (
                    <Star className="h-3.5 w-3.5 fill-[#1a73e8] text-[#1a73e8] dark:fill-[#8ab4f8] dark:text-[#8ab4f8]" />
                  )}
                </div>
                <span className="whitespace-nowrap text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
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
                accountId={threadAccountId}
                isSnoozedTab={currentTab === "snoozed"}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
                  aria-label="Snooze"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </SnoozeMenu>
            )}
            {showRemind && (
              <RemindMenu
                threadId={thread.id}
                accountId={threadAccountId}
                isRemindersTab={currentTab === "reminders"}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
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
    const noThreads = threadsToRender.length === 0;
    const isInboxSentOrTrash =
      currentTab === "inbox" || currentTab === "sent" || currentTab === "trash";
    const isSyncPending = isInboxSentOrTrash && syncEmailsMutation.isPending;

    if (noThreads && isSyncPending) {
      return (
        <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#8ab4f8]" />
          <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">Syncing inbox, sent, and trash…</p>
          <p className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">Emails will appear here when sync finishes.</p>
        </div>
      );
    }

    const showSkeleton = noThreads && (refreshingAfterSync || isFetching);
    if (showSkeleton) {
      return <ThreadListSkeleton />;
    }

    if (Object.keys(groupedThreads).length === 0 && !isFetching) {
      const isRemindersTab = currentTab === "reminders";
      const syncFailed =
        isInboxSentOrTrash && threadsToRender.length === 0 && syncEmailsMutation.isError;
      if (syncFailed) {
        return (
          <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
            <Mail className="mb-4 h-10 w-10 text-[#d93025] dark:text-[#f28b82]" />
            <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">Sync failed</p>
            <p className="mt-1 max-w-sm text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
              {syncEmailsMutation.error?.message?.toLowerCase().includes("sign in") ||
                syncEmailsMutation.error?.message?.toLowerCase().includes("unauthorized")
                ? "Session couldn't be verified. Refresh the page and try Sync again."
                : syncEmailsMutation.error?.message ?? "Something went wrong. Check your connection and try again."}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
                onClick={() => window.location.reload()}
              >
                Refresh page
              </Button>
              {accountId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
                  onClick={() => {
                    syncEmailsMutation.mutate({
                      accountId,
                      forceFullSync: true,
                      syncAllFolders: true,
                    });
                  }}
                  disabled={syncEmailsMutation.isPending}
                >
                  {syncEmailsMutation.isPending ? "Syncing…" : "Sync again"}
                </Button>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
          {isRemindersTab ? (
            <>
              <Bell className="mb-4 h-10 w-10 text-[#9aa0a6] dark:text-[#5f6368]" />
              <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">No reminders due</p>
              <p className="mt-1 max-w-sm text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
                {syncEmailsMutation.error?.message?.toLowerCase().includes("sign in") ||
                  syncEmailsMutation.error?.message?.toLowerCase().includes("unauthorized")
                  ? "Session couldn’t be verified. Refresh the page and try Sync again."
                  : syncEmailsMutation.error?.message ?? "Something went wrong. Check your connection and try again."}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
                  onClick={() => window.location.reload()}
                >
                  Refresh page
                </Button>
                {accountId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
                    onClick={() => {
                      syncEmailsMutation.mutate({
                        accountId,
                        forceFullSync: true,
                        syncAllFolders: true,
                      });
                    }}
                    disabled={syncEmailsMutation.isPending}
                  >
                    {syncEmailsMutation.isPending ? "Syncing…" : "Sync again"}
                  </Button>
                )}
              </div>
            </>
          ) : isRemindersTab ? (
            <>
              <Bell className="mb-4 h-10 w-10 text-[#9aa0a6] dark:text-[#5f6368]" />
              <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">No reminders due</p>
            </>
          ) : currentTab === "trash" ? (
            <>
              <Trash2 className="mb-4 h-10 w-10 text-[#9aa0a6] dark:text-[#5f6368]" />
              <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">No emails in trash</p>
              <p className="mt-1 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
                Use <strong>Sync</strong> at the top to sync Inbox, Sent, and Trash together.
              </p>
            </>
          ) : (
            <>
              <Mail className="mb-4 h-10 w-10 text-[#9aa0a6] dark:text-[#5f6368]" />
              <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">No emails found</p>
              <p className="mt-1 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
                Use <strong>Sync</strong> at the top to sync Inbox, Sent, and Trash together.
              </p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {Object.entries(groupedThreads).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="sticky top-0 z-10 border-b border-[#f1f3f4] bg-white px-4 py-2 dark:border-[#3c4043] dark:bg-[#202124]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                {format(new Date(date), "MMM d, yyyy")}
              </span>
            </div>
            {threads.map((thread) =>
              renderThreadItem(thread, thread.id === lastThreadId),
            )}
          </React.Fragment>
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#8ab4f8]" />
          </div>
        )}
      </div>
    );
  };

  const selectedCount = selectedThreadIds.size;
  const showBulkBar = selectedCount > 0 && !isSearching;
  const showArchiveAndDelete =
    currentTab === "inbox" ||
    currentTab === "snoozed" ||
    currentTab === "archive";

  const handleBulkDelete = async () => {
    if (isUnifiedView && threads?.length) {
      const byAccount = new Map<string, string[]>();
      for (const id of selectedThreadIds) {
        const t = threads.find((x) => x.id === id);
        const aid = t && "accountId" in t ? t.accountId : undefined;
        if (aid) {
          const arr = byAccount.get(aid) ?? [];
          arr.push(id);
          byAccount.set(aid, arr);
        }
      }
      toast.loading("Deleting…", { id: "bulk-delete" });
      try {
        for (const [aid, ids] of byAccount) {
          await bulkDeleteMutation.mutateAsync({ accountId: aid, threadIds: ids });
        }
        setDeleteConfirmOpen(false);
        toast.success("Deleted", { id: "bulk-delete" });
        await invalidateAndClearSelection();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete", { id: "bulk-delete" });
      }
      return;
    }
    if (!accountId || accountId === UNIFIED_INBOX_ACCOUNT_ID) return;
    toast.loading("Deleting…", { id: "bulk-delete" });
    bulkDeleteMutation.mutate({
      accountId,
      threadIds: Array.from(selectedThreadIds),
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#202124]">
      {showBulkBar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#f1f3f4] bg-[#f8f9fa] px-3 py-2 dark:border-[#3c4043] dark:bg-[#292a2d]">
          <span className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
            {selectedCount} selected
          </span>
          <div className="flex flex-wrap items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-[12px] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
              disabled={isBulkPending}
              onClick={() =>
                accountId &&
                bulkMarkReadMutation.mutate({
                  accountId,
                  threadIds: Array.from(selectedThreadIds),
                })
              }
            >
              <MailOpen className="h-3.5 w-3.5" />
              Mark read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-[12px] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
              disabled={isBulkPending}
              onClick={() =>
                accountId &&
                bulkMarkUnreadMutation.mutate({
                  accountId,
                  threadIds: Array.from(selectedThreadIds),
                })
              }
            >
              <Mail className="h-3.5 w-3.5" />
              Mark unread
            </Button>
            {showArchiveAndDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-[12px] text-[#d93025] hover:bg-[#fce8e6] hover:text-[#d93025] dark:text-[#f28b82] dark:hover:bg-[#5f2120]"
                      disabled={isBulkPending || isDemo}
                      onClick={() => (isDemo ? toast.info("You're exploring with sample data. Request access to connect your Gmail.") : setDeleteConfirmOpen(true))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#303134] text-xs text-[#e8eaed]">
                  {isDemo ? "Request access to use this" : "Delete selected"}
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
              disabled={isBulkPending}
              onClick={clearSelection}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCount} conversation{selectedCount !== 1 ? "s" : ""} will be deleted and removed from your inbox. You can restore them from Trash later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        ref={listContainerRef}
        tabIndex={0}
        role="listbox"
        aria-label="Thread list"
        className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden outline-none"
        onKeyDown={handleKeyDown}
      >
        {isSearching && searchValue ? (
          <SearchResults onResultSelect={handleSearchResultSelect} />
        ) : (
          renderThreadsList()
        )}
      </div>
    </div>
  );
});
