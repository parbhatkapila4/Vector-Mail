import React, { useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { RefreshCw, Info } from "lucide-react";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  NO_ACCOUNT: "No account connected",
  CONNECT_DESCRIPTION:
    "Connect your Google account to start managing your emails with AI-powered features.",
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
      console.log(
        "[ThreadList] Manual refresh triggered - starting full sync for all emails from last 30 days",
      );
      syncEmailsMutation.mutate({
        accountId,
        forceFullSync: true,
      });
    } else {
      console.log(
        "[ThreadList] Manual refresh triggered - refetching threads (no accountId)",
      );
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

  const threadsToRender = useMemo(() => {
    return threads ?? [];
  }, [threads]);

  const groupedThreads = useMemo(() => {
    if (!threadsToRender || threadsToRender.length === 0) return {};

    return threadsToRender.reduce((acc: GroupedThreads, thread: Thread) => {
      const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    }, {});
  }, [threadsToRender]);

  const allThreads = threadsToRender ?? [];
  const lastThreadId = allThreads[allThreads.length - 1]?.id;

  const handleSearchResultSelect = useCallback(
    (threadId: string) => {
      setThreadId(threadId);
      onThreadSelect?.(threadId);
    },
    [setThreadId, onThreadSelect],
  );

  const renderLoadingState = () => (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading accounts...
          </p>
        </div>
      </div>
    </div>
  );

  const renderConnectionPrompt = () => (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/50">
              <svg
                className="h-8 w-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-white">
              {CONNECTION_ERROR_MESSAGES.NO_ACCOUNT}
            </h2>
            <p className="mb-6 text-slate-400">
              {CONNECTION_ERROR_MESSAGES.CONNECT_DESCRIPTION}
            </p>
          </div>
          <button
            onClick={handleAccountConnection}
            className="rounded-lg bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:opacity-90"
          >
            {CONNECTION_ERROR_MESSAGES.CONNECT_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );

  const renderThreadItem = (thread: Thread, isLast: boolean) => {
    const latestEmail = thread.emails?.[0] ?? null;
    const fromName = latestEmail?.from?.name ?? "Unknown";
    const subject = thread.subject || "(No subject)";
    const date = thread.lastMessageDate ?? new Date();
    const bodySnippet = latestEmail?.bodySnippet ?? null;
    const sysLabels = latestEmail?.sysLabels ?? [];

    return (
      <button
        key={thread.id}
        ref={isLast ? lastThreadElementRef : null}
        className={cn(
          "relative flex flex-col items-start gap-2 rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-left text-sm transition-all hover:border-slate-700 hover:bg-slate-800/50",
          threadId === thread.id && "border-orange-500/30 bg-orange-500/20",
        )}
        onClick={() => {
          setThreadId(thread.id);
          onThreadSelect?.(thread.id);
        }}
      >
        {threadId === thread.id && (
          <motion.div
            className="absolute inset-0 z-[-1] rounded-lg bg-orange-500/10"
            layoutId="thread-list-item"
            transition={{
              duration: 0.1,
              ease: "easeInOut",
            }}
          />
        )}
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-white">{fromName}</div>
            </div>
            <div className="ml-auto text-xs text-slate-400">
              {formatDistanceToNow(date, {
                addSuffix: true,
              })}
            </div>
          </div>
          <div className="line-clamp-2 text-xs font-medium text-white">
            {subject}
          </div>
          {bodySnippet && (
            <div className="line-clamp-2 text-xs text-slate-400">
              {bodySnippet}
            </div>
          )}
          <div className="flex items-center gap-2">
            {sysLabels.includes("important") && (
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              >
                important
              </Badge>
            )}
            {sysLabels.includes("unread") && (
              <Badge
                variant="secondary"
                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              >
                unread
              </Badge>
            )}
            {sysLabels.includes("inbox") && (
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
              >
                inbox
              </Badge>
            )}
            {sysLabels.includes("trash") && (
              <Badge
                variant="secondary"
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                trash
              </Badge>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderThreadsList = () => {
    console.log("[ThreadList] Threads received:", threadsToRender?.length ?? 0);

    if (isFetching && threadsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center bg-[#0a0a0a] p-8">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-orange-500" />
          <p className="mt-2 text-slate-400">Loading emails...</p>
        </div>
      );
    }

    if (Object.keys(groupedThreads).length === 0 && !isFetching) {
      return (
        <div className="flex flex-col items-center justify-center bg-[#0a0a0a] p-8">
          <p className="text-slate-400">No emails found.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 bg-[#0a0a0a] p-4 pt-0">
        {Object.entries(groupedThreads).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="mt-4 text-xs font-medium text-slate-500 first:mt-0">
              {format(new Date(date), "MMMM d, yyyy")}
            </div>
            {threads.map((thread) =>
              renderThreadItem(thread, thread.id === lastThreadId),
            )}
          </React.Fragment>
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-orange-500" />
          </div>
        )}
      </div>
    );
  };

  if (accountsLoading) {
    return renderLoadingState();
  }

  if (!accountId || (accounts !== undefined && accounts.length === 0)) {
    return renderConnectionPrompt();
  }

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll bg-[#0a0a0a] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0a0a0a] p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">
            {isSearching && searchValue ? "Search Results" : "Inbox"}
          </h2>
        </div>

        {!isSearching && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-md border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-300">
              <Info className="h-3.5 w-3.5 shrink-0 text-orange-400" />
              <span className="text-white">
                Click the refresh button to see mails
              </span>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching || syncEmailsMutation.isPending}
          className="flex items-center gap-2 border-slate-800 bg-slate-900/50 text-white hover:bg-slate-800"
        >
          <RefreshCw
            className={`h-4 w-4 text-orange-500 ${isFetching || syncEmailsMutation.isPending ? "animate-spin" : ""}`}
          />
          {isFetching || syncEmailsMutation.isPending
            ? "Syncing..."
            : "Refresh"}
        </Button>
      </div>

      {isSearching && searchValue ? (
        <SearchResults onResultSelect={handleSearchResultSelect} />
      ) : (
        renderThreadsList()
      )}
    </div>
  );
}
