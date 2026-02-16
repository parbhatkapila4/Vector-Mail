"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import useThreads from "@/hooks/use-threads";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { InfiniteData } from "@tanstack/react-query";
import type { RouterOutputs } from "@/trpc/react";

const G_WAIT_MS = 500;

function isTyping(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Node)) return false;
  const el = target as HTMLElement;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
    return true;
  return el.isContentEditable === true;
}

interface MailKeyboardShortcutsProps {
  selectedThread: string | null;
  setSelectedThread: (id: string | null) => void;
  focusSearch: () => void;
  openCompose: () => void;
  focusReply: () => void;
  onCloseThread: () => void;
  showHelp: () => void;
  helpOpen: boolean;
  closeHelp: () => void;
}

export function MailKeyboardShortcuts({
  selectedThread,
  setSelectedThread,
  focusSearch,
  openCompose,
  focusReply,
  onCloseThread,
  showHelp,
  helpOpen,
  closeHelp,
}: MailKeyboardShortcutsProps) {
  const pathname = usePathname();
  const [tab, setTab] = useLocalStorage("vector-mail", "inbox");
  const [important] = useLocalStorage("vector-mail-important", false);
  const [unread] = useLocalStorage("vector-mail-unread", false);
  const {
    threads,
    threadId,
    setThreadId,
    accountId,
  } = useThreads();
  const gAwaitingRef = useRef(false);
  const gTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const utils = api.useUtils();
  type GetThreadsPage = RouterOutputs["account"]["getThreads"];
  const getThreadsInput = useMemo(
    () => ({
      accountId: accountId ?? "placeholder",
      tab: tab ?? "inbox",
      important,
      unread,
      limit: tab === "inbox" ? 50 : 15,
    }),
    [accountId, tab, important, unread],
  );

  const bulkArchiveMutation = api.account.bulkArchiveThreads.useMutation({
    onMutate: async (input) => {
      await utils.account.getThreads.cancel();
      const previousData = utils.account.getThreads.getInfiniteData(getThreadsInput) as
        | InfiniteData<GetThreadsPage>
        | undefined;
      if (previousData?.pages) {
        const newPages: GetThreadsPage[] = previousData.pages.map((page) => ({
          ...page,
          threads: page.threads.filter((t) => !input.threadIds.includes(t.id)),
        }));
        utils.account.getThreads.setInfiniteData(getThreadsInput, (old) =>
          old ? { ...old, pages: newPages } : old,
        );
      }
      return { previousPages: previousData };
    },
    onError: (err, _input, context) => {
      if (context?.previousPages !== undefined) {
        utils.account.getThreads.setInfiniteData(getThreadsInput, context.previousPages as never);
      }
      toast.error(err.message ?? "Failed to archive");
    },
    onSuccess: async () => {
      await utils.account.getThreads.invalidate();
      await utils.account.getNumThreads.invalidate();
      toast.success("Archived");
    },
    onSettled: () => {
      void utils.account.getThreads.invalidate();
    },
  });
  const bulkDeleteMutation = api.account.bulkDeleteThreads.useMutation({
    onMutate: async (input) => {
      await utils.account.getThreads.cancel();
      const previousData = utils.account.getThreads.getInfiniteData(getThreadsInput) as
        | InfiniteData<GetThreadsPage>
        | undefined;
      if (previousData?.pages) {
        const newPages: GetThreadsPage[] = previousData.pages.map((page) => ({
          ...page,
          threads: page.threads.filter((t) => !input.threadIds.includes(t.id)),
        }));
        utils.account.getThreads.setInfiniteData(getThreadsInput, (old) =>
          old ? { ...old, pages: newPages } : old,
        );
      }
      return { previousPages: previousData };
    },
    onError: (err, _input, context) => {
      if (context?.previousPages !== undefined) {
        utils.account.getThreads.setInfiniteData(getThreadsInput, context.previousPages as never);
      }
      toast.error(err.message ?? "Failed to move to trash");
    },
    onSuccess: async () => {
      await utils.account.getThreads.invalidate();
      await utils.account.getNumThreads.invalidate();
      toast.success("Moved to trash");
    },
    onSettled: () => {
      void utils.account.getThreads.invalidate();
    },
  });

  const flatThreads = useMemo(() => threads ?? [], [threads]);
  const currentIndex = flatThreads.findIndex((t) => t.id === (threadId ?? selectedThread));

  const selectThread = useCallback(
    (id: string) => {
      setThreadId(id);
      setSelectedThread(id);
    },
    [setThreadId, setSelectedThread]
  );

  const handleNext = useCallback(() => {
    if (flatThreads.length === 0) return;
    const nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, flatThreads.length - 1);
    selectThread(flatThreads[nextIndex]!.id);
  }, [flatThreads, currentIndex, selectThread]);

  const handlePrevious = useCallback(() => {
    if (flatThreads.length === 0) return;
    const prevIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
    selectThread(flatThreads[prevIndex]!.id);
  }, [flatThreads, currentIndex, selectThread]);

  const handleArchive = useCallback(() => {
    const id = threadId ?? selectedThread;
    if (!accountId || !id) return;
    const canArchive =
      tab === "inbox" || tab === "snoozed" || tab === "archive";
    if (!canArchive) return;
    bulkArchiveMutation.mutate({ accountId, threadIds: [id] });
    const idx = flatThreads.findIndex((t) => t.id === id);
    if (idx >= 0 && flatThreads.length > 1) {
      const nextIdx = idx < flatThreads.length - 1 ? idx : idx - 1;
      if (nextIdx >= 0) selectThread(flatThreads[nextIdx]!.id);
    } else {
      setThreadId(null);
      setSelectedThread(null);
    }
  }, [
    accountId,
    threadId,
    selectedThread,
    tab,
    bulkArchiveMutation,
    flatThreads,
    selectThread,
    setThreadId,
    setSelectedThread,
  ]);

  const handleDelete = useCallback(() => {
    const id = threadId ?? selectedThread;
    if (!accountId || !id) return;
    const canDelete =
      tab === "inbox" || tab === "snoozed" || tab === "archive";
    if (!canDelete) return;
    bulkDeleteMutation.mutate({ accountId, threadIds: [id] });
    const idx = flatThreads.findIndex((t) => t.id === id);
    if (idx >= 0 && flatThreads.length > 1) {
      const nextIdx = idx < flatThreads.length - 1 ? idx : idx - 1;
      if (nextIdx >= 0) selectThread(flatThreads[nextIdx]!.id);
    } else {
      setThreadId(null);
      setSelectedThread(null);
    }
  }, [
    accountId,
    threadId,
    selectedThread,
    tab,
    bulkDeleteMutation,
    flatThreads,
    selectThread,
    setThreadId,
    setSelectedThread,
  ]);

  const handleGThen = useCallback(
    (key: string) => {
      if (key.toLowerCase() === "i") {
        setTab("inbox");
      } else if (key.toLowerCase() === "s") {
        setTab("sent");
      }
      gAwaitingRef.current = false;
      if (gTimeoutRef.current) {
        clearTimeout(gTimeoutRef.current);
        gTimeoutRef.current = null;
      }
    },
    [setTab]
  );

  useEffect(() => {
    const isMail = pathname === "/mail" || pathname.startsWith("/mail/");
    if (!isMail) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;

      if (helpOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeHelp();
        }
        return;
      }

      if (gAwaitingRef.current) {
        const k = event.key.toLowerCase();
        if (k === "i" || k === "s") {
          event.preventDefault();
          event.stopPropagation();
          handleGThen(k);
        } else {
          gAwaitingRef.current = false;
          if (gTimeoutRef.current) {
            clearTimeout(gTimeoutRef.current);
            gTimeoutRef.current = null;
          }
        }
        return;
      }

      const key = event.key;
      const shift = event.shiftKey;

      switch (key) {
        case "j":
        case "ArrowDown":
          event.preventDefault();
          event.stopPropagation();
          handleNext();
          break;
        case "k":
        case "ArrowUp":
          event.preventDefault();
          event.stopPropagation();
          handlePrevious();
          break;
        case "e":
          event.preventDefault();
          event.stopPropagation();
          handleArchive();
          break;
        case "#":
          if (!shift) break;
          event.preventDefault();
          event.stopPropagation();
          handleDelete();
          break;
        case "c":
          event.preventDefault();
          event.stopPropagation();
          openCompose();
          break;
        case "r":
          event.preventDefault();
          event.stopPropagation();
          if (threadId ?? selectedThread) focusReply();
          break;
        case "/":
          event.preventDefault();
          event.stopPropagation();
          focusSearch();
          break;
        case "g":
          event.preventDefault();
          event.stopPropagation();
          gAwaitingRef.current = true;
          gTimeoutRef.current = setTimeout(() => {
            gAwaitingRef.current = false;
            gTimeoutRef.current = null;
          }, G_WAIT_MS);
          break;
        case "?":
          if (!shift) break;
          event.preventDefault();
          event.stopPropagation();
          showHelp();
          break;
        case "Escape":
          if (selectedThread) {
            event.preventDefault();
            event.stopPropagation();
            onCloseThread();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      if (gTimeoutRef.current) {
        clearTimeout(gTimeoutRef.current);
        gTimeoutRef.current = null;
      }
    };
  }, [
    pathname,
    helpOpen,
    closeHelp,
    showHelp,
    handleNext,
    handlePrevious,
    handleArchive,
    handleDelete,
    handleGThen,
    openCompose,
    focusReply,
    focusSearch,
    onCloseThread,
    selectedThread,
    threadId,
  ]);

  return null;
}
