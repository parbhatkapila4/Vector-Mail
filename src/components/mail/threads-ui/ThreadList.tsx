import React, { type ComponentProps, useRef, useCallback } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { api, type RouterOutputs } from "@/trpc/react";
import { useAtom } from "jotai";
// import { useAutoAnimate } from "@formkit/auto-animate/react";
// import { useLocalStorage } from "usehooks-ts"
import useThreads from "@/hooks/use-threads";
// import { isSearchingAtom } from "./search-bar"

import { format } from "date-fns";

interface ThreadListProps {
  onThreadSelect?: (threadId: string) => void;
}

export function ThreadList({ onThreadSelect }: ThreadListProps) {
  const { 
    threads, 
    threadId, 
    setThreadId, 
    isFetching, 
    isFetchingNextPage, 
    hasNextPage, 
    fetchNextPage,
    accountId
  } = useThreads();
  
  const { data: accounts, isLoading: accountsLoading } = api.account.getAccounts.useQuery();


  const observerRef = useRef<IntersectionObserver | null>(null);
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
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

//   const [parent] = useAutoAnimate(/* optional config */);
//   const { selectedThreadIds, visualMode } = useVim();

  const groupedThreads = threads?.reduce(
    (acc, thread) => {
      const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    },
    {} as Record<string, typeof threads>,
  );

  const allThreads = threads ?? [];
  const lastThreadId = allThreads[allThreads.length - 1]?.id;

  // Show loading state while accounts are being fetched
  if (accountsLoading) {
    return (
      <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading accounts...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show connect account message if no accountId or no accounts available
  if (!accountId || (accounts !== undefined && accounts.length === 0)) {
    return (
      <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No account connected</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Connect your Google account to start managing your emails with AI-powered features.
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  const { getAurinkoAuthUrl } = await import('@/lib/aurinko')
                  const url = await getAurinkoAuthUrl('Google')
                  window.location.href = url
                } catch (error) {
                  console.error('Error connecting account:', error)
                }
              }}
              className="px-6 py-3 bg-black text-white rounded-lg font-medium transition-colors duration-200"
            >
              Connect Google Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
      <div className="flex flex-col gap-2 p-4 pt-0" 
    //   ref={parent}
      >
        {Object.entries(groupedThreads ?? {}).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="text-muted-foreground mt-4 text-xs font-medium first:mt-0">
              {format(new Date(date), "MMMM d, yyyy")}
            </div>
            {threads.map((item) => (
              <button
                id={`thread-${item.id}`}
                key={item.id}
                ref={item.id === lastThreadId ? lastThreadElementRef : null}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                //   visualMode &&
                //     selectedThreadIds.includes(item.id) &&
                //     "bg-blue-200 dark:bg-blue-900",
                )}
                onClick={() => {
                  setThreadId(item.id);
                  onThreadSelect?.(item.id);
                }}
              >
                {threadId === item.id && (
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
                        {item.emails.at(-1)?.from?.name}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "ml-auto text-xs",
                        threadId === item.id
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatDistanceToNow(
                        item.emails.at(-1)?.sentAt ?? new Date(),
                        {
                          addSuffix: true,
                        },
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-medium">{item.subject}</div>
                </div>
                <div
                  className="text-muted-foreground line-clamp-2 text-xs"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      item.emails.at(-1)?.bodySnippet ?? "",
                      {
                        USE_PROFILES: { html: true },
                      },
                    ),
                  }}
                ></div>
                {item.emails[0]?.sysLabels.length ? (
                  <div className="flex items-center gap-2">
                    {item.emails.at(0)?.sysLabels.map((label) => (
                      <Badge
                        key={label}
                        variant={getBadgeVariantFromLabel(label)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </React.Fragment>
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="text-sm text-muted-foreground">Loading more threads...</div>
          </div>
        )}
        {!hasNextPage && threads.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="text-sm text-muted-foreground">No more threads to load</div>
          </div>
        )}
      </div>
    </div>
  );
}

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
