import { api, type RouterOutputs } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import { keepPreviousData } from "@tanstack/react-query";

export const threadIdAtom = atom<string | null>(null);

type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];

function useThreads() {
  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery(undefined, {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    });
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
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
    isPlaceholderData,
  } = api.account.getThreads.useInfiniteQuery(
    {
      accountId: hasValidAccount && accountId ? accountId : "placeholder",
      tab: currentTab,
      important,
      unread,
      limit: 50,
    },
    {
      enabled:
        hasValidAccount &&
        !!currentTab &&
        !!accountId &&
        accountId.length > 0 &&
        currentTab !== "scheduled",
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 2 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: false,
      placeholderData: keepPreviousData,
    },
  );

  type ThreadPage = { threads: Thread[] };
  const pages = (data?.pages ?? []) as ThreadPage[];
  const threads = pages.flatMap((page) => page.threads);

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
    isPlaceholderData: !!isPlaceholderData,
  };
}

export default useThreads;
