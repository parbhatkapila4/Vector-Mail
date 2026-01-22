import { api, type RouterOutputs } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

export const threadIdAtom = atom<string | null>(null);

type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];

function useThreads() {
  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();
  const [tab] = useLocalStorage("vector-mail", "inbox");
  const [storedAccountId] = useLocalStorage("accountId", "");

  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";
  const accountId =
    storedAccountId && accounts?.some((acc) => acc.id === storedAccountId)
      ? storedAccountId
      : firstAccountId;

  const { data: myAccount, isLoading: myAccountLoading } =
    api.account.getMyAccount.useQuery(
      { accountId: accountId || "placeholder" },
      {
        enabled: !!accountId && accountId.length > 0 && !accountsLoading,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: false,
      },
    );

  const currentTab = tab ?? "inbox";
  const hasValidAccount =
    !accountsLoading &&
    !myAccountLoading &&
    !!accountId &&
    accountId.length > 0;

  console.log("[Inbox] accountId used:", accountId);

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
      accountId: hasValidAccount && accountId ? accountId : "placeholder", // Use placeholder when disabled, query won't run due to enabled flag
      tab: currentTab,
      important,
      unread,
      limit: currentTab === "inbox" ? 50 : 15,
    },
    {
      enabled:
        hasValidAccount && !!currentTab && !!accountId && accountId.length > 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: false,
    },
  );

  useEffect(() => {
    if (!data?.pages || !accountId) return;

    if (currentTab !== "inbox") {
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
            `[Auto-Update] ${syncStatus.count} new email(s) synced, refreshing ${currentTab}...`,
          );

          lastProcessedSyncRef.current = syncKey;

          setTimeout(() => {
            void utils.account.getThreads.invalidate();
          }, 100);
        }
      }
    }
  }, [data?.pages, utils, accountId, currentTab]);

  // Type assertion needed because getThreads returns a union type (inbox threads + DB threads)
  const pages = (data?.pages ?? []) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  const threads = pages.flatMap(
    (page: unknown) => (page as { threads: Thread[] }).threads,
  ) as Thread[];

  return {
    threads,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    accountId,
    account: myAccount,
    threadId,
    setThreadId,
  };
}

export default useThreads;
