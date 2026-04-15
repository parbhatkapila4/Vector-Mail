import React, { useRef, useCallback, useMemo, useEffect, useImperativeHandle, forwardRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { MoreVertical, RefreshCw, Mail, MailOpen, Star, Bell, CalendarClock, X, Trash2, Loader2 } from "lucide-react";
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
import { trackInboxBrainEvent } from "@/lib/analytics/inbox-brain";

interface ThreadListProps {
  onThreadSelect?: (threadId: string) => void;
  onSyncPendingChange?: (pending: boolean) => void;
}

export interface ThreadListRef {
  triggerSync: () => void;
  cycleBriefFocus: () => void;
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
    from?: { name?: string | null; address?: string | null };
    bodySnippet?: string | null;
    sysLabels: string[];
    sysClassifications?: string[];
  }>;
}

interface GroupedThreads {
  [date: string]: Thread[];
}

type FocusView = "all" | "needsReply" | "important" | "lowPriority";

function accountLowerForThreadRow(
  thread: Thread & { accountEmail?: string },
  isUnifiedView: boolean,
  inboxAccountEmail: string | undefined,
): string {
  if (isUnifiedView && thread.accountEmail) {
    return thread.accountEmail.toLowerCase();
  }
  return (inboxAccountEmail ?? "").toLowerCase();
}
function threadMatchesNeedsReplyFocus(
  thread: Thread,
  accountEmailLower: string,
): boolean {
  if (!accountEmailLower) return false;
  const latest = thread.emails?.[0];
  const from = (latest?.from?.address ?? "").toLowerCase();
  if (!from || from === accountEmailLower) return false;
  const sysC = (latest?.sysClassifications ?? []).map((s) =>
    String(s).toLowerCase(),
  );
  if (
    sysC.some((c) =>
      ["promotions", "social", "updates", "forums"].includes(c),
    )
  ) {
    return false;
  }
  return true;
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
  const router = useRouter();
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
    account: validatedAccount,
  } = useThreads();
  const threads = rawThreads as (RouterThread & { accountEmail?: string; accountName?: string })[] | undefined;
  const [isSearching] = useAtom(isSearchingAtom);
  const [searchValue] = useAtom(searchValueAtom);
  const { isLoaded: authLoaded, userId: clerkUserId } = useAuth();
  const [currentTab] = useLocalStorage<string>("vector-mail", "inbox");
  const [important] = useLocalStorage("vector-mail-important", false);
  const [unread] = useLocalStorage("vector-mail-unread", false);
  const [refreshingAfterSync, setRefreshingAfterSync] = React.useState(false);
  const [focusView, setFocusView] = React.useState<FocusView>("all");
  const [slowLoad, setSlowLoad] = React.useState(false);
  const slowLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedThreadIds, setSelectedThreadIds] = React.useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const isDemo = useDemoMode() && accountId === DEMO_ACCOUNT_ID;
  const utils = api.useUtils();
  const quickSyncTriggeredRef = useRef(false);
  const firstBatchTriggeredRef = useRef(false);
  const backgroundSyncTriggeredRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("reconnected") === "1") {
      quickSyncTriggeredRef.current = false;
      firstBatchTriggeredRef.current = false;
      backgroundSyncTriggeredRef.current = false;
      toast.success("Account reconnected", {
        description: "Your email is connected again. Syncing now.",
        duration: 4000,
      });
      void utils.account.getAccounts.invalidate();
      void utils.account.getMyAccount.invalidate();
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
      const url = new URL(window.location.href);
      url.searchParams.delete("reconnected");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    if (searchParams.get("reconnect_failed") === "1") {
      quickSyncTriggeredRef.current = false;
      firstBatchTriggeredRef.current = false;
      backgroundSyncTriggeredRef.current = false;
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
  }, [searchParams, utils]);

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
      refetchOnWindowFocus: true,
      staleTime: 90 * 1000,
    });

  const syncCancelledRef = useRef(false);
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
    onError: (error) => {
      console.warn("[ThreadList] Quick first sync:", error.message);
      if (/timed out|Initial mail fetch/i.test(error.message)) {
        toast.info("Still reaching your mail provider…", {
          description: "Tap Sync if threads don’t show up in a minute.",
          duration: 6000,
        });
        return;
      }
      if (
        error.data?.code === "UNAUTHORIZED" ||
        /gmail access expired|reconnect|401/i.test(error.message)
      ) {
        void utils.account.getAccounts.invalidate();
        void utils.account.getMyAccount.invalidate();
        toast.error("Reconnect Gmail", {
          description:
            "VectorMail is still signed in — only the Gmail link needs a quick refresh.",
          duration: 9000,
          action: {
            label: "Reconnect",
            onClick: () => window.location.assign("/api/connect/google"),
          },
        });
      }
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

  const softThreadListRefresh = useCallback(async () => {
    void utils.account.getNumThreads.invalidate();
    void utils.account.getUnifiedThreads.invalidate();
    await refetch();
  }, [utils, refetch]);

  const forceThreadListRefresh = useCallback(async () => {
    utils.account.getThreads.invalidate();
    utils.account.getNumThreads.invalidate();
    utils.account.getUnifiedThreads.invalidate();
    await refetch();
    router.refresh();
  }, [utils, refetch, router]);


  const syncEmailsMutation = api.account.syncEmails.useMutation({
    onSuccess: async (data) => {
      if (syncCancelledRef.current) {
        syncCancelledRef.current = false;
        return;
      }
      if (data.needsReconnection || data.success === false) {
        console.warn("[ThreadList] Sync finished with issues", data);
      } else {
        console.log("[ThreadList] Sync completed", data);
      }

      if (data.needsReconnection) {
        void utils.account.getAccounts.invalidate();
        toast.error("Reconnect your account", {
          id: "reconnect-account-warning",
          description: "Your email connection expired and couldn’t be refreshed. Click Reconnect to sign in again.",
          duration: 10000,
          action: {
            label: "Reconnect",
            onClick: () => {
              window.location.assign("/api/connect/google");
            },
          },
        });
        return;
      }
      if (data.success === false) {
        toast.error("Sync failed. Try again.", { duration: 3000 });
        void forceThreadListRefresh();
        return;
      }

      if ("background" in data && data.background) {
        toast.info("Syncing in the background…", {
          description: "New mail will show up as it’s fetched. You can keep using the app.",
          duration: 5000,
        });
        void utils.account.getAccounts.invalidate();
        setRefreshingAfterSync(true);
        for (let i = 1; i <= 40; i++) {
          setTimeout(() => void softThreadListRefresh(), i * 2500);
        }
        setTimeout(() => setRefreshingAfterSync(false), 100_000);
        return;
      }

      const didFullSync = "syncAllFolders" in data && data.syncAllFolders === true;
      const hasMore = !didFullSync && "hasMore" in data && data.hasMore;
      const continueToken = "continueToken" in data ? data.continueToken : undefined;
      const willContinueSync =
        data.success &&
        hasMore &&
        continueToken &&
        accountId?.trim() &&
        accountId !== UNIFIED_INBOX_ACCOUNT_ID;

      if (willContinueSync) {
        void utils.account.getAccounts.invalidate();
        void softThreadListRefresh();
        const folder = currentTab === "sent" ? "sent" : currentTab === "trash" ? "trash" : "inbox";
        syncEmailsMutation.mutate({
          accountId: accountId.trim(),
          folder: folder as "inbox" | "sent" | "trash",
          continueToken,
        });
        return;
      }

      void utils.account.getAccounts.invalidate();
      setRefreshingAfterSync(true);
      setTimeout(async () => {
        await forceThreadListRefresh();
        setRefreshingAfterSync(false);
      }, 400);
      setTimeout(() => void forceThreadListRefresh(), 1200);

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

      const rawMessage = error.message || "";
      const errorMessage =
        rawMessage.trim() && !/unknown\s*error/i.test(rawMessage)
          ? rawMessage
          : "Something went wrong. Check your connection and try again.";

      if (errorMessage.includes("Account not found") || errorMessage.includes("don't have access")) {
        void utils.account.getAccounts.invalidate();
        toast.error("Account session expired", {
          description: "Refreshing your account list. If you reconnected an account, it should appear shortly.",
          duration: 5000,
        });
        void forceThreadListRefresh();
        return;
      }
      if (
        errorMessage.includes("Account token is missing") ||
        errorMessage.includes("Account ID is required") ||
        errorMessage.includes("reconnect your account") ||
        errorMessage.includes("Please reconnect")
      ) {
        void utils.account.getAccounts.invalidate();
        toast.error("Sync failed", {
          description: "Your Gmail link needs to be refreshed. Reconnect — you stay signed in to VectorMail.",
          duration: 6000,
          action: {
            label: "Reconnect Gmail",
            onClick: () => window.location.assign("/api/connect/google"),
          },
        });
        void forceThreadListRefresh();
        return;
      }
      if (
        errorMessage.includes("timed out") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("Mail provider")
      ) {
        toast.info(errorMessage.includes("Mail provider") ? "Mail provider slow" : "Sync timed out", {
          description: errorMessage.includes("Mail provider")
            ? errorMessage
            : "The request took too long. Please try again in a moment.",
          duration: 5000,
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

      void forceThreadListRefresh();
    },
  });

  const syncEmailsPendingRef = useRef(false);
  syncEmailsPendingRef.current = syncEmailsMutation.isPending;

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
    if (!accountId?.trim() || accountId === UNIFIED_INBOX_ACCOUNT_ID) {
      if (accountId === UNIFIED_INBOX_ACCOUNT_ID) {
        void utils.account.getUnifiedThreads.invalidate();
        void refetch();
      }
      return;
    }
    syncCancelledRef.current = false;
    const noThreadsYet = (threads?.length ?? 0) === 0;
    if (noThreadsYet && !syncFirstBatchQuickMutation.isPending) {
      toast.info("Fetching your first emails…", { duration: 2500 });
      syncFirstBatchQuickMutation.mutate({ accountId: accountId.trim() });
    } else {
      toast.info("Checking for new emails…");
    }

    syncEmailsMutation.mutate({
      accountId: accountId.trim(),
      forceFullSync: false,
      syncAllFolders: false,
      folder: "inbox",
    });
  }, [
    refetch,
    accountId,
    syncEmailsMutation,
    syncFirstBatchQuickMutation,
    threads?.length,
    utils.account.getUnifiedThreads,
  ]);

  const isAccountValid = !!validatedAccount && validatedAccount.id === accountId;

  useEffect(() => {
    if (
      firstBatchTriggeredRef.current ||
      accountsLoading ||
      !accountId?.trim() ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      isDemo ||
      !isAccountValid
    )
      return;

    const hasAnyThreads = (threads?.length ?? 0) > 0;
    if (hasAnyThreads) return;

    firstBatchTriggeredRef.current = true;
    toast.info("Fetching your latest emails…", {
      description: "Getting your first batch so your inbox appears quickly.",
      duration: 3500,
    });
    syncFirstBatchQuickMutation.mutate({ accountId: accountId.trim() });
  }, [
    accountId,
    accountsLoading,
    isAccountValid,
    isDemo,
    syncFirstBatchQuickMutation,
    threads?.length,
  ]);
  useEffect(() => {
    if (
      !accountId?.trim() ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      !isAccountValid ||
      (currentTab !== "inbox" && currentTab !== "sent")
    )
      return;
    if (!quickSyncTriggeredRef.current) {
      quickSyncTriggeredRef.current = true;
      syncEmailsMutation.mutate({
        accountId: accountId.trim(),
        forceFullSync: false,
        syncAllFolders: false,
        folder: currentTab as "inbox" | "sent" | "trash",
      });
    }
  }, [accountId, currentTab, syncEmailsMutation, isAccountValid]);

  useEffect(() => {
    if (
      !accountId?.trim() ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      !isAccountValid ||
      backgroundSyncTriggeredRef.current ||
      (currentTab !== "inbox" && currentTab !== "sent")
    )
      return;
    backgroundSyncTriggeredRef.current = true;
    const aid = accountId.trim();
    const t = setTimeout(() => {
      if (syncEmailsPendingRef.current) return;
      syncEmailsMutation.mutate({
        accountId: aid,
        forceFullSync: false,
        syncAllFolders: false,
        folder: "inbox",
      });
    }, 8000);
    return () => clearTimeout(t);
  }, [accountId, currentTab, syncEmailsMutation, isAccountValid]);

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
    let count = 0;
    const MAX_REFRESHES_WHILE_SYNC = 25;
    const interval = setInterval(() => {
      count += 1;
      if (count > MAX_REFRESHES_WHILE_SYNC) return;
      void softThreadListRefresh();
    }, 800);
    return () => clearInterval(interval);
  }, [syncEmailsMutation.isPending, accountId, currentTab, forceThreadListRefresh]);

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

  const { data: inboxPreviewPayload, isFetching: inboxPreviewFetching } =
    api.account.getInboxPreview.useQuery(
      { accountId: accountId?.trim() ?? "", limit: 50 },
      {
        enabled:
          currentTab === "inbox" &&
          !isDemo &&
          isAccountValid &&
          !!accountId?.trim() &&
          accountId !== UNIFIED_INBOX_ACCOUNT_ID &&
          (threads?.length ?? 0) === 0,
        staleTime: 15_000,
        retry: 1,
      },
    );

  const previewAuthFailed = Boolean(inboxPreviewPayload?.needsReconnection);
  const isWaitingForThreads =
    (threads?.length ?? 0) === 0 &&
    !previewAuthFailed &&
    (syncEmailsMutation.isPending || refreshingAfterSync || isFetching);
  useEffect(() => {
    if (!isWaitingForThreads) {
      setSlowLoad(false);
      if (slowLoadTimerRef.current) {
        clearTimeout(slowLoadTimerRef.current);
        slowLoadTimerRef.current = null;
      }
      return;
    }
    slowLoadTimerRef.current = setTimeout(() => {
      setSlowLoad(true);
      slowLoadTimerRef.current = null;
    }, 12_000);
    return () => {
      if (slowLoadTimerRef.current) clearTimeout(slowLoadTimerRef.current);
    };
  }, [isWaitingForThreads]);

  const inboxPreviewReconnectToastRef = useRef(false);
  useEffect(() => {
    if (!inboxPreviewPayload?.needsReconnection) {
      inboxPreviewReconnectToastRef.current = false;
      return;
    }
    void utils.account.getAccounts.invalidate();
    if (inboxPreviewReconnectToastRef.current) return;
    inboxPreviewReconnectToastRef.current = true;
    toast.error("Reconnect your account", {
      id: "reconnect-account-warning",
      description:
        "Your email connection expired and couldn’t be refreshed. Click Reconnect to sign in again.",
      duration: 10000,
      action: {
        label: "Reconnect",
        onClick: () => {
          window.location.assign("/api/connect/google");
        },
      },
    });
  }, [inboxPreviewPayload?.needsReconnection, utils.account.getAccounts]);

  const previewThreads = useMemo((): Thread[] => {
    const items = inboxPreviewPayload?.items ?? [];
    return items.map((row, idx) => ({
      id: `preview:${row.threadId}:${row.messageId}:${idx}`,
      subject: row.subject,
      lastMessageDate: new Date(row.sentAt),
      emails: [
        {
          from: { name: row.fromName },
          bodySnippet: row.snippet || null,
          sysLabels: row.unread ? ["unread"] : [],
          sysClassifications: row.classifications ?? [],
        },
      ],
    }));
  }, [inboxPreviewPayload?.items]);

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
  const focusChipsEnabled =
    currentTab === "inbox" &&
    !!accountId &&
    accountId !== UNIFIED_INBOX_ACCOUNT_ID;
  const { data: dailyBriefData } = api.account.getDailyBrief.useQuery(
    { accountId: accountId || "placeholder" },
    {
      enabled: focusChipsEnabled,
      staleTime: 60_000,
    },
  );
  const focusCounts = useMemo(() => {
    const visibleIds = new Set((threadsToRender ?? []).map((t) => t.id));
    const importantIds = new Set(
      (dailyBriefData?.important ?? []).map((row) => row.threadId),
    );
    const lowPriorityIds = new Set(
      (dailyBriefData?.lowPriority ?? []).map((row) => row.threadId),
    );

    const inboxEmail = validatedAccount?.emailAddress;

    let needsReply = 0;
    let important = 0;
    let lowPriority = 0;
    for (const t of threadsToRender ?? []) {
      if (!visibleIds.has(t.id)) continue;
      const acct = accountLowerForThreadRow(
        t as Thread & { accountEmail?: string },
        isUnifiedView,
        inboxEmail,
      );
      if (threadMatchesNeedsReplyFocus(t, acct)) needsReply++;
      if (importantIds.has(t.id)) important++;
      if (lowPriorityIds.has(t.id)) lowPriority++;
    }

    return {
      all: visibleIds.size,
      needsReply,
      important,
      lowPriority,
    };
  }, [
    dailyBriefData,
    threadsToRender,
    validatedAccount?.emailAddress,
    isUnifiedView,
  ]);
  const isFocusActive = focusChipsEnabled && focusView !== "all";
  const focusFilterHidden = isSearching && !!searchValue;

  const cycleBriefFocus = useCallback(() => {
    if (!focusChipsEnabled) return;
    setFocusView((prev) => {
      const order: FocusView[] = [
        "all",
        "needsReply",
        "important",
        "lowPriority",
      ];
      const i = order.indexOf(prev);
      const next = ((i < 0 ? 0 : i) + 1) % order.length;
      const nextKey = order[next]!;
      queueMicrotask(() => {
        trackInboxBrainEvent("daily_brief_focus_changed", {
          filter_key: nextKey,
          source: "keyboard",
        });
      });
      return nextKey;
    });
  }, [focusChipsEnabled]);

  useImperativeHandle(
    ref,
    () => ({
      triggerSync: handleRefresh,
      cycleBriefFocus,
    }),
    [handleRefresh, cycleBriefFocus],
  );

  useEffect(() => {
    if (currentTab !== "inbox") {
      setFocusView("all");
    }
  }, [currentTab]);

  useEffect(() => {
    setFocusView("all");
  }, [accountId]);

  const nudgeTypeByThreadId = useMemo(() => {
    const map = new Map<string, "REMINDER" | "UNREPLIED">();
    for (const n of nudgesData?.nudges ?? []) {
      map.set(n.threadId, n.type);
    }
    return map;
  }, [nudgesData?.nudges]);

  const threadsForDisplay = useMemo(() => {
    if (threadsToRender.length > 0) {
      if (!isFocusActive) return threadsToRender;

      if (focusView === "needsReply") {
        const inboxEmail = validatedAccount?.emailAddress;
        return threadsToRender.filter((t) =>
          threadMatchesNeedsReplyFocus(
            t,
            accountLowerForThreadRow(
              t as Thread & { accountEmail?: string },
              isUnifiedView,
              inboxEmail,
            ),
          ),
        );
      }

      if (!dailyBriefData) return [];
      const ids = new Set(
        (dailyBriefData[focusView] ?? []).map((row) => row.threadId),
      );
      return threadsToRender.filter((t) => ids.has(t.id));
    }
    if (currentTab === "inbox" && previewThreads.length > 0) return previewThreads;
    return threadsToRender;
  }, [
    threadsToRender,
    previewThreads,
    currentTab,
    isFocusActive,
    focusView,
    dailyBriefData,
    validatedAccount?.emailAddress,
    isUnifiedView,
  ]);

  const isReadOnlyPreview =
    currentTab === "inbox" &&
    threadsToRender.length === 0 &&
    previewThreads.length > 0;

  const groupedThreads = useMemo(() => {
    if (!threadsForDisplay || threadsForDisplay.length === 0) return {};
    return threadsForDisplay.reduce((acc: GroupedThreads, thread: Thread) => {
      const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(thread);
      return acc;
    }, {});
  }, [threadsForDisplay]);

  const allThreads = threadsForDisplay ?? [];
  const lastThreadId = allThreads[allThreads.length - 1]?.id;

  if (accountsLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-[#111113]">
        <div className="text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#3b82f6] dark:border-[#1a1a23] dark:border-t-[#60a5fa]" />
          <p className="mt-3 text-[13px] text-[#6b7280] dark:text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentTab === "scheduled") {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-[#111113]">
        <div className="flex-shrink-0 border-b border-[#e5e7eb] px-4 py-3 dark:border-[#1a1a23]">
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
      <div className="flex h-full items-center justify-center bg-white p-10 dark:bg-[#111113]">
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

  const renderThreadItem = (thread: Thread, isLast: boolean, readOnlyPreview = false) => {
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
          "group relative flex w-full min-h-[48px] items-start gap-0 border-b border-[#f3f4f6] text-left transition-colors dark:border-[#1a1a23] [touch-action:manipulation]",
          isSelected
            ? "bg-[#eff6ff] dark:bg-[#3b82f6]/[0.08]"
            : isUnread && !isSelected
              ? "bg-white hover:bg-[#f9fafb] dark:bg-[#111113] dark:hover:bg-[#ffffff]/[0.03]"
              : "hover:bg-[#f9fafb] dark:hover:bg-[#ffffff]/[0.03]",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 flex-col overflow-hidden pt-3 transition-[width,padding,opacity] duration-150",
            readOnlyPreview && "hidden",
            !readOnlyPreview &&
            (isRowSelected
              ? "w-[48px] pl-2 opacity-100 pointer-events-auto"
              : "w-0 min-w-0 pl-0 opacity-0 pointer-events-none group-hover:w-[48px] group-hover:min-w-0 group-hover:pl-2 group-hover:opacity-100 group-hover:pointer-events-auto"),
          )}
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Checkbox
              checked={isRowSelected}
              onCheckedChange={() => toggleSelection(thread.id)}
              aria-label={`Select ${subject}`}
              className="border-[#9ca3af] dark:border-[#71717a] data-[state=checked]:bg-[#3b82f6] data-[state=checked]:border-[#3b82f6] dark:data-[state=checked]:bg-[#60a5fa] dark:data-[state=checked]:border-[#60a5fa]"
            />
          </div>
        </div>
        <button
          type="button"
          className={cn(
            "relative flex min-h-[48px] min-w-0 flex-1 gap-3 px-3 py-3 pr-2 text-left outline-none [touch-action:manipulation]",
            readOnlyPreview && "cursor-default opacity-95",
          )}
          onClick={() => {
            if (readOnlyPreview) {
              toast.info("Still syncing your inbox", {
                description: "You can open threads once your mail has finished syncing to VectorMail.",
                duration: 4000,
              });
              return;
            }
            setThreadId(thread.id);
            onThreadSelect?.(thread.id);
          }}
        >
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-medium",
              (nudgeType || isUnread) && "ring-2 ring-[#3b82f6] dark:ring-[#60a5fa]",
              isSelected
                ? "bg-[#3b82f6] text-white"
                : isUnread
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#e5e7eb] text-[#6b7280] dark:bg-[#18181b] dark:text-[#a1a1aa]",
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
                        ? "font-semibold text-[#202124] dark:text-[#d4d4d8]"
                        : "font-normal text-[#5f6368] dark:text-[#9aa0a6]",
                    )}
                  >
                    {fromName}
                  </span>
                  {isUnread && !isSelected && (
                    <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-[#3b82f6] dark:bg-[#60a5fa]" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 truncate">
                  <span
                    className={cn(
                      "truncate text-[13px]",
                      isUnread || isSelected
                        ? "font-medium text-[#202124] dark:text-[#c4c4c8]"
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
                    <Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b] dark:fill-[#fbbf24] dark:text-[#fbbf24]" />
                  )}
                </div>
                <span className="whitespace-nowrap text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                  {formatDistanceToNow(date, { addSuffix: false })}
                </span>
              </div>
            </div>
          </div>
        </button>
        {!readOnlyPreview && (showSnooze || showRemind) && (
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
    const noThreads = threadsForDisplay.length === 0;
    const hasPreviewRows =
      currentTab === "inbox" &&
      previewThreads.length > 0 &&
      threadsForDisplay.length === 0;
    const isInboxSentOrTrash =
      currentTab === "inbox" || currentTab === "sent" || currentTab === "trash";
    const isSyncPending = isInboxSentOrTrash && syncEmailsMutation.isPending;

    if (
      noThreads &&
      (isSyncPending || refreshingAfterSync || isFetching) &&
      !hasPreviewRows
    ) {
      if (slowLoad) {
        return (
          <div className="flex h-64 flex-col items-center justify-center gap-4 px-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#5f6368] dark:text-[#9aa0a6]" />
            <div>
              <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
                Taking longer than usual
              </p>
              <p className="mt-1 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
                The server may be busy. Try refreshing the list.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
              onClick={() => {
                setSlowLoad(false);
                void forceThreadListRefresh();
              }}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Refresh list
            </Button>
          </div>
        );
      }
      return <ThreadListSkeleton />;
    }

    if (isFocusActive && noThreads && !isFetching) {
      return (
        <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
            No threads in this focus view yet
          </p>
          <p className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
            Try another bucket or switch back to all threads.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
            onClick={() => {
              trackInboxBrainEvent("daily_brief_focus_changed", {
                filter_key: "all",
                source: "chip",
              });
              setFocusView("all");
            }}
          >
            Back to All
          </Button>
        </div>
      );
    }

    if (Object.keys(groupedThreads).length === 0 && !isFetching) {
      const waitingInboxPreview =
        currentTab === "inbox" &&
        threadsForDisplay.length === 0 &&
        inboxPreviewFetching &&
        !inboxPreviewPayload?.needsReconnection;
      if (waitingInboxPreview) {
        return <ThreadListSkeleton />;
      }
      const isRemindersTab = currentTab === "reminders";
      const matchedAccount = accounts?.find((a) => a.id === accountId);
      const currentAccountNeedsReconnection = Boolean(
        isInboxSentOrTrash &&
        accountId &&
        accountId !== UNIFIED_INBOX_ACCOUNT_ID &&
        (inboxPreviewPayload?.needsReconnection === true ||
          (matchedAccount &&
            "needsReconnection" in matchedAccount &&
            matchedAccount.needsReconnection)),
      );
      if (currentAccountNeedsReconnection) {
        return (
          <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
            <Mail className="mb-4 h-10 w-10 text-[#d93025] dark:text-[#f28b82]" />
            <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
              Reconnect your account
            </p>
            <p className="mt-1 max-w-sm text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
              Your email connection expired and couldn’t be refreshed. Reconnect to sync again.
            </p>
            <a
              href="/api/connect/google"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#1a73e8] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
            >
              Reconnect account
            </a>
          </div>
        );
      }
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
                    if (accountId?.trim()) {
                      syncEmailsMutation.mutate({
                        accountId: accountId.trim(),
                        forceFullSync: true,
                        syncAllFolders: true,
                      });
                    }
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
                      if (accountId.trim()) {
                        syncEmailsMutation.mutate({
                          accountId: accountId.trim(),
                          forceFullSync: true,
                          syncAllFolders: true,
                        });
                      }
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
        {isReadOnlyPreview && (
          <div className="border-b border-[#1f2937] bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] px-4 py-3 shadow-[inset_0_1px_0_rgba(148,163,184,0.12)]">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-[#60a5fa] shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold tracking-wide text-[#dbeafe]">
                  Live inbox preview
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#bfdbfe]/90">
                  Showing your latest mail from the provider while we sync into VectorMail. Rows are read only until sync finishes, then you can open threads and use all actions.
                </p>
              </div>
            </div>
          </div>
        )}
        {Object.entries(groupedThreads).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-white px-4 py-2 dark:border-[#1a1a23] dark:bg-[#111113]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                {format(new Date(date), "MMM d, yyyy")}
              </span>
            </div>
            {threads.map((thread) =>
              renderThreadItem(thread, thread.id === lastThreadId, isReadOnlyPreview),
            )}
          </React.Fragment>
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#3b82f6] dark:border-[#1a1a23] dark:border-t-[#60a5fa]" />
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
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#111113]">
      {showBulkBar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 dark:border-[#1a1a23] dark:bg-[#18181b]">
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

      {focusChipsEnabled && !focusFilterHidden && (
        <div className="flex items-center gap-1.5 border-b border-[#e5e7eb] px-3 py-2 dark:border-[#1a1a23]">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-wide text-[#9ca3af] dark:text-[#71717a]">
            Focus
          </span>
          {([
            ["all", "All"],
            ["needsReply", "Needs reply"],
            ["important", "Important"],
            ["lowPriority", "Low priority"],
          ] as const).map(([key, label]) => {
            const active = focusView === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  trackInboxBrainEvent("daily_brief_focus_changed", {
                    filter_key: key,
                    source: "chip",
                  });
                  setFocusView(key);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "border-[#3b82f6]/30 bg-[#eff6ff] text-[#2563eb] dark:border-[#60a5fa]/30 dark:bg-[#3b82f6]/[0.14] dark:text-[#93c5fd]"
                    : "border-[#e5e7eb] bg-[#f9fafb] text-[#5f6368] hover:bg-[#f3f4f6] dark:border-[#27272a] dark:bg-[#18181b] dark:text-[#a1a1aa] dark:hover:bg-[#202024]",
                )}
                aria-pressed={active}
              >
                <span>{label}</span>
                {key === "all" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      active
                        ? "bg-[#dbeafe] text-[#1d4ed8] dark:bg-[#2563eb]/30 dark:text-[#bfdbfe]"
                        : "bg-[#e8eaed] text-[#5f6368] dark:bg-[#27272a] dark:text-[#9aa0a6]",
                    )}
                  >
                    {focusCounts.all}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

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
