import React, { useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";

interface ThreadListProps {
  onThreadSelect?: (threadId: string) => void;
}

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
    threads,
    threadId,
    setThreadId,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    accountId,
    refetch,
  } = useThreads();

  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();

  const syncEmailsMutation = api.account.syncEmails.useMutation({
    onSuccess: () => {
      console.log("Email sync completed, refetching threads...");
      refetch();
    },
    onError: (error) => {
      console.error("Email sync failed:", error);
    },
  });

  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleRefresh = useCallback(() => {
    if (accountId) {
      syncEmailsMutation.mutate({ accountId, forceFullSync: true });
    }
  }, [accountId, syncEmailsMutation]);

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

  const groupedThreads = useMemo(() => {
    if (!threads) return {};

    return threads.reduce((acc: GroupedThreads, thread) => {
      const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    }, {});
  }, [threads]);

  const allThreads = threads ?? [];
  const lastThreadId = allThreads[allThreads.length - 1]?.id;

  const renderLoadingState = () => (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
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
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-8 w-8 text-gray-400"
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
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {CONNECTION_ERROR_MESSAGES.NO_ACCOUNT}
            </h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              {CONNECTION_ERROR_MESSAGES.CONNECT_DESCRIPTION}
            </p>
          </div>
          <button
            onClick={handleAccountConnection}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-800"
          >
            {CONNECTION_ERROR_MESSAGES.CONNECT_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );

  const renderThreadItem = (thread: Thread, isLast: boolean) => (
    <button
      key={thread.id}
      ref={isLast ? lastThreadElementRef : null}
      className={cn(
        "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-800",
        threadId === thread.id && "bg-blue-50 dark:bg-blue-900/20",
      )}
      onClick={() => {
        setThreadId(thread.id);
        onThreadSelect?.(thread.id);
      }}
    >
      {threadId === thread.id && (
        <motion.div
          className="absolute inset-0 z-[-1] rounded-lg bg-black/10 dark:bg-white/20"
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
            <div className="font-semibold">
              {thread.emails.at(-1)?.from?.name}
            </div>
          </div>
          <div
            className={cn(
              "ml-auto text-xs",
              threadId === thread.id
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {formatDistanceToNow(new Date(thread.lastMessageDate), {
              addSuffix: true,
            })}
          </div>
        </div>
        <div className="line-clamp-2 text-xs font-medium">{thread.subject}</div>
        {thread.emails.at(-1)?.bodySnippet && (
          <div className="line-clamp-2 text-xs text-muted-foreground">
            {thread.emails.at(-1)?.bodySnippet}
          </div>
        )}
        <div className="flex items-center gap-2">
          {thread.emails.at(-1)?.sysLabels.includes("important") && (
            <Badge
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
            >
              important
            </Badge>
          )}
          {thread.emails.at(-1)?.sysLabels.includes("unread") && (
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            >
              unread
            </Badge>
          )}
          {thread.emails.at(-1)?.sysLabels.includes("inbox") && (
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
            >
              inbox
            </Badge>
          )}
          {thread.emails.at(-1)?.sysLabels.includes("trash") && (
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

  const renderThreadsList = () => (
    <div className="flex flex-col gap-2 p-4 pt-0">
      {Object.entries(groupedThreads).map(([date, threads]) => (
        <React.Fragment key={date}>
          <div className="mt-4 text-xs font-medium text-muted-foreground first:mt-0">
            {format(new Date(date), "MMMM d, yyyy")}
          </div>
          {threads.map((thread) =>
            renderThreadItem(thread, thread.id === lastThreadId),
          )}
        </React.Fragment>
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );

  if (accountsLoading) {
    return renderLoadingState();
  }

  if (!accountId || (accounts !== undefined && accounts.length === 0)) {
    return renderConnectionPrompt();
  }

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Inbox</h2>
          {isFetching && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={syncEmailsMutation.isPending || !accountId}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${syncEmailsMutation.isPending ? "animate-spin" : ""}`}
          />
          {syncEmailsMutation.isPending ? "Syncing..." : "Refresh"}
        </Button>
      </div>

      {renderThreadsList()}
    </div>
  );
}
