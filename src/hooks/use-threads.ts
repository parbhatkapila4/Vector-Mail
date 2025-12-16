import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

export const threadIdAtom = atom<string | null>(null);
function useThreads() {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("vector-mail", "inbox");

  const currentTab = tab ?? "inbox";

  const [important] = useLocalStorage("vector-mail-important", false);
  const [unread] = useLocalStorage("vector-mail-unread", false);
  const [threadId, setThreadId] = useAtom(threadIdAtom);
  const utils = api.useUtils();
  const lastProcessedSyncRef = useRef<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
  } = api.account.getThreads.useInfiniteQuery(
    {
      accountId,
      tab: currentTab,
      important,
      unread,
      limit: 15,
    },
    {
      enabled: !!accountId && !!currentTab,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    if (!data?.pages || !accountId) return;

    const lastPage = data.pages[data.pages.length - 1];
    const syncStatus = lastPage?.syncStatus;

    if (syncStatus?.success && syncStatus.count > 0) {
      const pageHash =
        data.pages.length > 0
          ? (data.pages[data.pages.length - 1]?.threads?.length ?? 0)
          : 0;
      const syncKey = `${accountId}-${currentTab}-${syncStatus.count}-${pageHash}`;

      if (lastProcessedSyncRef.current !== syncKey) {
        console.log(
          `[Auto-Update] ${syncStatus.count} new email(s) synced, refreshing inbox...`,
        );

        lastProcessedSyncRef.current = syncKey;

        setTimeout(() => {
          void utils.account.getThreads.invalidate();
        }, 100);
      }
    }
  }, [data?.pages, utils, accountId, currentTab]);

  const threads = data?.pages.flatMap((page) => page.threads) ?? [];

  return {
    threads,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    accountId,
    account: accounts?.find(
      (account: { id: string }) => account.id === accountId,
    ),
    threadId,
    setThreadId,
  };
}

export default useThreads;
