import { useEffect, useRef, useMemo, useState } from "react";
import { api, type RouterOutputs } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import { keepPreviousData } from "@tanstack/react-query";
import { persistThreads, getStoredThreads } from "@/lib/threads-storage";
import { UNIFIED_INBOX_ACCOUNT_ID } from "@/components/mail/AccountSwitcher";
import { mergeThreadsStable, getThreadTimestamp } from "@/lib/thread-merge";

export const threadIdAtom = atom<string | null>(null);

type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];
type UnifiedThread = RouterOutputs["account"]["getUnifiedThreads"]["threads"][0];

const STALE_TIME_OTHER_MS = 10 * 60 * 1000;

function useThreads() {
  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery(undefined, {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    });
  const [tab] = useLocalStorage("vector-mail", "inbox");
  const [storedAccountId] = useLocalStorage("accountId", "");

  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";
  const firstConnectedAccountId =
    accounts?.find((acc) => !("needsReconnection" in acc) || !acc.needsReconnection)?.id ??
    firstAccountId;
  const isUnified = storedAccountId === UNIFIED_INBOX_ACCOUNT_ID;
  const storedAccount =
    storedAccountId && accounts?.find((acc) => acc.id === storedAccountId);
  const accountId = isUnified
    ? UNIFIED_INBOX_ACCOUNT_ID
    : storedAccount
      ? storedAccountId
      : firstConnectedAccountId;

  const { data: myAccount } = api.account.getMyAccount.useQuery(
    { accountId: isUnified ? firstAccountId : (accountId || "placeholder") },
    {
      enabled: !isUnified && !!accountId && accountId.length > 0 && !accountsLoading,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 30 * 1000,
      retry: false,
    },
  );

  const currentTab = tab ?? "inbox";
  const [selectedLabelId, setSelectedLabelId] = useLocalStorage("vector-mail-label-id", "");
  const canFetchSingleAccount =
    !!accountId &&
    accountId.length > 0 &&
    accountId !== UNIFIED_INBOX_ACCOUNT_ID &&
    !!currentTab &&
    currentTab !== "scheduled" &&
    (currentTab !== "label" || !!selectedLabelId);
  const canFetchUnified =
    isUnified && currentTab === "inbox";
  const canFetchThreads = canFetchSingleAccount || canFetchUnified;

  const [important] = useLocalStorage("vector-mail-important", false);
  const [unread] = useLocalStorage("vector-mail-unread", false);
  const [threadId, setThreadId] = useAtom(threadIdAtom);
  const labelIdForQuery = currentTab === "label" ? selectedLabelId : null;

  const singleAccountQuery = api.account.getThreads.useInfiniteQuery(
    {
      accountId: accountId || "placeholder",
      tab: currentTab,
      important,
      unread,
      limit: 50,
      labelId: currentTab === "label" && selectedLabelId ? selectedLabelId : undefined,
    },
    {
      enabled: canFetchSingleAccount,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: currentTab === "inbox",
      refetchInterval: false,
      staleTime: currentTab === "label" ? 0 : currentTab === "inbox" ? 0 : STALE_TIME_OTHER_MS,
      gcTime: 7 * 24 * 60 * 60 * 1000,
      retry: (failureCount, error) => {
        const e = error as { data?: { code?: string }; message?: string } | undefined;
        if (e?.data?.code === "UNAUTHORIZED" || (e?.message && /UNAUTHORIZED|sign in|session/i.test(e.message))) return false;
        return failureCount < 3;
      },
      placeholderData:
        currentTab === "label" || currentTab === "sent" || currentTab === "trash"
          ? undefined
          : keepPreviousData,
    },
  );

  const unifiedQuery = api.account.getUnifiedThreads.useInfiniteQuery(
    { limit: 50 },
    {
      enabled: canFetchUnified,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
      staleTime: 10 * 60 * 1000,
      gcTime: 7 * 24 * 60 * 60 * 1000,
      retry: (failureCount, error) => {
        const e = error as { data?: { code?: string }; message?: string } | undefined;
        if (e?.data?.code === "UNAUTHORIZED" || (e?.message && /UNAUTHORIZED|sign in|session/i.test(e.message))) return false;
        return failureCount < 3;
      },
      placeholderData: keepPreviousData,
    },
  );

  const data = isUnified ? unifiedQuery.data : singleAccountQuery.data;
  const fetchNextPage = isUnified ? unifiedQuery.fetchNextPage : singleAccountQuery.fetchNextPage;
  const hasNextPage = isUnified ? unifiedQuery.hasNextPage : singleAccountQuery.hasNextPage;
  const isFetchingNextPage = isUnified ? unifiedQuery.isFetchingNextPage : singleAccountQuery.isFetchingNextPage;
  const isFetching = isUnified ? unifiedQuery.isFetching : singleAccountQuery.isFetching;
  const refetch = isUnified ? unifiedQuery.refetch : singleAccountQuery.refetch;
  const isPlaceholderData = isUnified ? !!unifiedQuery.isPlaceholderData : !!singleAccountQuery.isPlaceholderData;

  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (!canFetchThreads || !accountId || accountId === UNIFIED_INBOX_ACCOUNT_ID || !data?.pages?.length) return;
    if (isUnified) return;
    const hasThreads = data.pages.some((p) => p.threads.length > 0);
    if (!hasThreads) return;
    if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    persistTimeoutRef.current = setTimeout(() => {
      persistTimeoutRef.current = null;
      if (!mountedRef.current) return;
      try {
        persistThreads(accountId, currentTab, important, unread, labelIdForQuery, data.pages);
      } catch {
      }
    }, 300);
    return () => {
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    };
  }, [accountId, currentTab, important, unread, labelIdForQuery, canFetchThreads, data?.pages, isUnified]);

  type ThreadPage = { threads: Thread[] | UnifiedThread[] };
  const pages = (data?.pages ?? []) as ThreadPage[];
  const threadsFromQuery = pages.flatMap((page) => page.threads);

  const threadsFromStorage =
    threadsFromQuery.length === 0 &&
      !isFetching &&
      canFetchThreads &&
      !isUnified &&
      currentTab !== "sent" &&
      currentTab !== "trash"
      ? (getStoredThreads(accountId, currentTab, important, unread, labelIdForQuery)?.pages?.flatMap((p) => p.threads as Thread[]) ?? [])
      : [];

  const threads =
    threadsFromQuery.length > 0 ? threadsFromQuery : threadsFromStorage;

  const stickyThreadsKey = `${accountId}-${currentTab}-${important ? "1" : "0"}-${unread ? "1" : "0"}-${labelIdForQuery ?? "none"}-${isUnified ? "u" : "s"}`;
  const [stickyThreads, setStickyThreads] = useState<Array<Thread | UnifiedThread>>([]);
  const stickyKeyRef = useRef(stickyThreadsKey);

  useEffect(() => {
    if (stickyKeyRef.current === stickyThreadsKey) return;
    stickyKeyRef.current = stickyThreadsKey;
    setStickyThreads([]);
  }, [stickyThreadsKey]);

  useEffect(() => {
    if (threads.length === 0) return;
    setStickyThreads((prev) => {
      const merged = mergeThreadsStable(
        threads as Array<Thread | UnifiedThread>,
        prev,
      );
      if (merged.length !== prev.length) return merged;
      for (let i = 0; i < merged.length; i += 1) {
        const a = merged[i];
        const b = prev[i];
        if (!a || !b) return merged;
        if (a.id !== b.id) return merged;
        if (getThreadTimestamp(a) !== getThreadTimestamp(b)) return merged;
      }
      return prev;
    });
  }, [threads]);

  const displayThreads = (stickyThreads.length > 0
    ? stickyThreads
    : threads) as typeof threads;

  const refetchedFromStorageRef = useRef(false);
  const prevKeyRef = useRef(`${accountId}-${currentTab}`);
  useEffect(() => {
    const key = `${accountId}-${currentTab}`;
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key;
      refetchedFromStorageRef.current = false;
    }
  }, [accountId, currentTab]);
  useEffect(() => {
    if (
      !canFetchThreads ||
      threadsFromQuery.length > 0 ||
      threadsFromStorage.length === 0 ||
      isFetching ||
      refetchedFromStorageRef.current ||
      isUnified
    )
      return;
    refetchedFromStorageRef.current = true;
    refetch();
  }, [canFetchThreads, threadsFromQuery.length, threadsFromStorage.length, isFetching, refetch, isUnified]);

  const recoveryRefetchKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const key = `${accountId}-inbox`;
    if (
      currentTab !== "inbox" ||
      !canFetchSingleAccount ||
      isUnified ||
      isFetching ||
      threadsFromQuery.length !== 1
    )
      return;
    if (recoveryRefetchKeyRef.current === key) return;
    recoveryRefetchKeyRef.current = key;
    void refetch();
  }, [currentTab, canFetchSingleAccount, isUnified, isFetching, threadsFromQuery.length, accountId, refetch]);

  const emptyInboxRefetchScheduledRef = useRef(false);
  useEffect(() => {
    if (threadsFromQuery.length > 0) {
      emptyInboxRefetchScheduledRef.current = false;
      return;
    }
    if (
      currentTab !== "inbox" ||
      !canFetchSingleAccount ||
      isUnified ||
      isFetching ||
      emptyInboxRefetchScheduledRef.current
    )
      return;
    emptyInboxRefetchScheduledRef.current = true;
    const t1 = setTimeout(() => void refetch(), 2000);
    const t2 = setTimeout(() => void refetch(), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentTab, canFetchSingleAccount, isUnified, isFetching, threadsFromQuery.length, accountId, refetch]);

  const effectiveAccountId = useMemo(() => {
    if (!threadId || !threads?.length) return isUnified ? firstAccountId : accountId;
    const openThread = threads.find((t) => t.id === threadId) as (Thread | UnifiedThread) | undefined;
    return (openThread && "accountId" in openThread && openThread.accountId) ? openThread.accountId : (isUnified ? firstAccountId : accountId);
  }, [threadId, threads, accountId, isUnified, firstAccountId]);

  return {
    threads: displayThreads,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    accountId,
    effectiveAccountId,
    isUnifiedView: isUnified,
    account: myAccount,
    threadId,
    setThreadId,
    isPlaceholderData: !!isPlaceholderData,
    selectedLabelId: currentTab === "label" ? selectedLabelId : null,
    setSelectedLabelId,
  };
}

export default useThreads;
