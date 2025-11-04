import { api } from "@/trpc/react";
import React, { use } from "react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";

export const threadIdAtom = atom<string | null>(null);
function useThreads() {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("vector-mail", "inbox");

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
  } = api.account.getThreads.useInfiniteQuery(
    {
      accountId,
      tab,
      important,
      unread,
      limit: 15,
    },
    {
      enabled: !!accountId && !!tab,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 5000,
    },
  );

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
