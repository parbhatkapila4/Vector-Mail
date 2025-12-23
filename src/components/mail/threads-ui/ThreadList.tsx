import React, { useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { RefreshCw, Mail, Star, Paperclip } from "lucide-react";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";
import { isSearchingAtom, searchValueAtom } from "../search/SearchBar";
import { SearchResults } from "../search/SearchResults";

interface ThreadListProps {
  onThreadSelect?: (threadId: string) => void;
}

type RouterThread = RouterOutputs["account"]["getThreads"]["threads"][0];

interface Thread {
  id: string;
  subject: string;
  lastMessageDate: Date;
  emails: Array<{
    from?: { name: string | null };
    bodySnippet?: string | null;
    sysLabels: string[];
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

  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();

  const syncEmailsMutation = api.account.syncEmails.useMutation({
    onSuccess: () => {
      console.log("[ThreadList] Full sync completed, refetching threads");
      void refetch();
    },
    onError: (error) => {
      console.error("[ThreadList] Sync failed:", error);
      void refetch();
    },
  });

  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleRefresh = useCallback(() => {
    if (accountId) {
      syncEmailsMutation.mutate({ accountId, forceFullSync: true });
    } else {
      void refetch();
    }
  }, [refetch, accountId, syncEmailsMutation]);

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
    (node: HTMLButtonElement) => {
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

  if (accountsLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#030303]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accountId || (accounts !== undefined && accounts.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center bg-[#030303] p-8">
        <div className="max-w-xs text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
            <Mail className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            {CONNECTION_ERROR_MESSAGES.NO_ACCOUNT}
          </h2>
          <p className="mb-6 text-sm text-zinc-500">
            {CONNECTION_ERROR_MESSAGES.CONNECT_DESCRIPTION}
          </p>
          <button
            onClick={handleAccountConnection}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-lg hover:shadow-amber-500/20"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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
    const isUnread = sysLabels.includes("unread");
    const isImportant = sysLabels.includes("important");
    const isSelected = threadId === thread.id;

    return (
      <button
        key={thread.id}
        ref={isLast ? lastThreadElementRef : null}
        className={cn(
          "group relative flex w-full gap-3 px-4 py-3 text-left transition-all",
          isSelected ? "bg-amber-500/[0.08]" : "hover:bg-white/[0.02]",
          !isSelected && "border-b border-white/[0.03]",
        )}
        onClick={() => {
          setThreadId(thread.id);
          onThreadSelect?.(thread.id);
        }}
      >
        {isSelected && (
          <div className="absolute left-0 top-0 h-full w-[3px] bg-amber-500" />
        )}

        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            isSelected
              ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
              : isUnread
                ? "bg-white/[0.08] text-white"
                : "bg-white/[0.04] text-zinc-500",
          )}
        >
          {fromName.charAt(0).toUpperCase()}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm",
                isUnread
                  ? "font-semibold text-white"
                  : "font-medium text-zinc-300",
              )}
            >
              {fromName}
            </span>
            <span className="shrink-0 text-[11px] text-zinc-600">
              {formatDistanceToNow(date, { addSuffix: false })}
            </span>
          </div>

          <div
            className={cn(
              "truncate text-[13px]",
              isUnread ? "font-medium text-zinc-200" : "text-zinc-400",
            )}
          >
            {subject}
          </div>

          {bodySnippet && (
            <div className="line-clamp-1 text-xs text-zinc-600">
              {bodySnippet}
            </div>
          )}

          {(isImportant || isUnread) && (
            <div className="flex items-center gap-2 pt-0.5">
              {isUnread && (
                <span className="flex h-[6px] w-[6px] rounded-full bg-amber-500" />
              )}
              {isImportant && (
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              )}
            </div>
          )}
        </div>
      </button>
    );
  };

  const renderThreadsList = () => {
    if (isFetching && threadsToRender.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
        </div>
      );
    }

    if (Object.keys(groupedThreads).length === 0 && !isFetching) {
      return (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Mail className="mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-600">No emails found</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {Object.entries(groupedThreads).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="sticky top-0 z-10 bg-[#030303]/95 px-4 py-2 backdrop-blur-xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
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
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#030303]">
      <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2">
        <span className="text-xs font-medium text-zinc-500">
          {isSearching && searchValue
            ? "Search Results"
            : `${threadsToRender.length} conversations`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching || syncEmailsMutation.isPending}
          className="h-7 gap-1.5 rounded-lg px-2 text-xs text-zinc-500 hover:bg-white/[0.04] hover:text-white"
        >
          <RefreshCw
            className={cn(
              "h-3.5 w-3.5",
              (isFetching || syncEmailsMutation.isPending) && "animate-spin",
            )}
          />
          {isFetching || syncEmailsMutation.isPending ? "Syncing" : "Sync"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isSearching && searchValue ? (
          <SearchResults onResultSelect={handleSearchResultSelect} />
        ) : (
          renderThreadsList()
        )}
      </div>
    </div>
  );
}
