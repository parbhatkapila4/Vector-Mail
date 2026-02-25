"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Menu,
  Inbox,
  Send,
  Bot,
  X,
  MessageCircle,
  LogOut,
  Zap,
  Search,
  ArrowRight,
  CalendarClock,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccountSwitcher } from "./AccountSwitcher";
import { ThreadList, type ThreadListRef } from "./threads-ui/ThreadList";
import { ThreadDisplay } from "./threads-ui/ThreadDisplay";
import EmailSearchAssistant from "../global/AskAi";
import SearchBar from "./search/SearchBar";
import ComposeEmailGmail from "./ComposeEmailGmail";
import { MailKeyboardShortcuts } from "./MailKeyboardShortcuts";
import { ShortcutHelpModal } from "./ShortcutHelpModal";
import { GripVertical, RefreshCw } from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface MailLayoutProps {
  defaultLayout?: number[] | readonly number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}

export function Mail({ }: MailLayoutProps) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tab, setTab] = useLocalStorage("vector-mail", "inbox");
  const [sidebarWidthPct, setSidebarWidthPct] = useLocalStorage("mail-sidebar-width-pct", 28);
  const [isResizing, setIsResizing] = useState(false);
  const [syncPending, setSyncPending] = useState(false);
  const resizeStartRef = useRef<{ x: number; pct: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const threadListRef = useRef<ThreadListRef>(null);
  const isMobile = useIsMobile();
  const router = useRouter();

  const SIDEBAR_MIN_PCT = 20;
  const SIDEBAR_MAX_PCT = 55;

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = { x: e.clientX, pct: sidebarWidthPct };
  }, [sidebarWidthPct]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const start = resizeStartRef.current;
      const el = containerRef.current;
      if (!start || !el) return;
      const containerWidth = el.getBoundingClientRect().width;
      if (containerWidth <= 0) return;
      const deltaPct = ((e.clientX - start.x) / containerWidth) * 100;
      let next = start.pct + deltaPct;
      next = Math.max(SIDEBAR_MIN_PCT, Math.min(SIDEBAR_MAX_PCT, next));
      setSidebarWidthPct(next);
    };
    const onUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizing, setSidebarWidthPct]);

  const focusSearch = useCallback(() => {
    document.getElementById("mail-search-input")?.focus();
  }, []);

  const focusReply = useCallback(() => {
    window.dispatchEvent(new CustomEvent("focus-reply"));
  }, []);

  const { data: accounts } = api.account.getAccounts.useQuery();
  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";

  const { data: myAccount } = api.account.getMyAccount.useQuery(
    { accountId: firstAccountId || "placeholder" },
    { enabled: !!firstAccountId && firstAccountId.length > 0 },
  );

  const accountId = myAccount?.id ?? "";
  const isEnabled = !!accountId;

  const { data: inboxCount } = api.account.getNumThreads.useQuery(
    { accountId: accountId || "placeholder", tab: "inbox" },
    { enabled: isEnabled && !!accountId && accountId.length > 0, refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const { data: sentCount } = api.account.getNumThreads.useQuery(
    { accountId: accountId || "placeholder", tab: "sent" },
    { enabled: isEnabled && !!accountId && accountId.length > 0, refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const { data: trashCount } = api.account.getNumThreads.useQuery(
    { accountId: accountId || "placeholder", tab: "trash" },
    { enabled: isEnabled && !!accountId && accountId.length > 0, refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const utils = api.useUtils();
  useEffect(() => {
    if (!accountId || typeof document === "undefined") return;
    const onVisible = () => {
      void utils.account.getNumThreads.invalidate();
      void utils.account.getThreads.invalidate();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [accountId, utils.account.getNumThreads, utils.account.getThreads]);

  const { data: scheduledSends } = api.account.getScheduledSends.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: isEnabled && !!accountId && accountId.length > 0 },
  );
  const scheduledCount = scheduledSends?.length ?? 0;

  const handleThreadSelect = useCallback((threadId: string) => {
    setSelectedThread(threadId);
  }, []);

  const handleThreadClose = useCallback(() => {
    setSelectedThread(null);
  }, []);

  const handleMobileNavigation = useCallback(
    (newTab?: string, isBuddy?: boolean) => {
      setIsNavigating(true);
      setSheetOpen(false);
      handleThreadClose();

      if (isBuddy) {
        router.push("/buddy?fresh=true");

        setTimeout(() => setIsNavigating(false), 800);
      } else if (newTab) {
        setTab(newTab);

        setTimeout(() => setIsNavigating(false), 600);
      }
    },
    [handleThreadClose, router, setTab],
  );

  const navItems = [
    {
      id: "inbox",
      icon: Inbox,
      label: "Inbox",
      count: inboxCount,
    },
    {
      id: "sent",
      icon: Send,
      label: "Sent",
      count: sentCount,
    },
    {
      id: "scheduled",
      icon: CalendarClock,
      label: "Schedule",
      count: scheduledCount,
    },
    {
      id: "trash",
      icon: Trash2,
      label: "Trash",
      count: trashCount,
    },
  ];

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <MailKeyboardShortcuts
          selectedThread={selectedThread}
          setSelectedThread={setSelectedThread}
          focusSearch={focusSearch}
          openCompose={() => setComposeOpen(true)}
          focusReply={focusReply}
          onCloseThread={handleThreadClose}
          showHelp={() => setHelpOpen(true)}
          helpOpen={helpOpen}
          closeHelp={() => setHelpOpen(false)}
        />
        <ShortcutHelpModal open={helpOpen} onOpenChange={setHelpOpen} />
        <div className="flex h-full w-full flex-col bg-[#f6f8fc] dark:bg-[#202124]">
          <div className="flex items-center justify-between border-b border-[#dadce0] bg-white px-4 py-2.5 dark:border-[#3c4043] dark:bg-[#202124]">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] border-[#dadce0] bg-white p-0 dark:border-[#3c4043] dark:bg-[#202124]"
              >
                <MobileSidebar
                  navItems={navItems}
                  tab={tab}
                  setTab={setTab}
                  router={router}
                  onNavigate={handleMobileNavigation}
                />
              </SheetContent>
            </Sheet>

            <button
              onClick={() => {
                handleThreadClose();
                setTab("inbox");
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-[15px] font-medium capitalize text-[#202124] outline-none transition-opacity hover:opacity-80 dark:text-[#e8eaed]"
            >
              {navItems.find((i) => i.id === tab)?.label ?? tab}
            </button>

            <div className="flex items-center gap-2">
              <ComposeEmailGmail
                open={composeOpen}
                onOpenChange={setComposeOpen}
              />
              <UserButton />
            </div>
          </div>

          {isNavigating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg dark:bg-[#292a2d]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#8ab4f8]" />
                <p className="text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6]">Loading...</p>
              </div>
            </div>
          )}

          {!selectedThread ? (
            <div className="flex flex-1 flex-col overflow-hidden bg-[#f6f8fc] dark:bg-[#202124]">
              <SearchBar />
              <ThreadList onThreadSelect={handleThreadSelect} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#202124]">
              <ThreadDisplay threadId={selectedThread} />
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <MailKeyboardShortcuts
        selectedThread={selectedThread}
        setSelectedThread={setSelectedThread}
        focusSearch={focusSearch}
        openCompose={() => setComposeOpen(true)}
        focusReply={focusReply}
        onCloseThread={handleThreadClose}
        showHelp={() => setHelpOpen(true)}
        helpOpen={helpOpen}
        closeHelp={() => setHelpOpen(false)}
      />
      <ShortcutHelpModal open={helpOpen} onOpenChange={setHelpOpen} />
      <div className="flex h-full w-full flex-col bg-[#f6f8fc] dark:bg-[#202124]">
        <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b border-[#dadce0] bg-white px-4 dark:border-[#3c4043] dark:bg-[#202124]">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8]">
                <video
                  src="/Vectormail-logo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full scale-[1.6] object-cover"
                />
              </div>
              <span className="text-[22px] font-normal tracking-tight text-[#5f6368] dark:text-[#9aa0a6]">
                VectorMail
              </span>
            </Link>

            <nav className="flex items-center gap-0.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-[14px] font-medium transition-colors",
                    tab === item.id
                      ? "text-[#1a73e8] dark:text-[#8ab4f8]"
                      : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#303134] dark:hover:text-[#e8eaed]",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                  <span
                    className={cn(
                      "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[12px] font-medium tabular-nums",
                      tab === item.id
                        ? "bg-[#1a73e8]/20 text-[#1a73e8] dark:bg-[#8ab4f8]/25 dark:text-[#8ab4f8]"
                        : "bg-[#f1f3f4] text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]",
                    )}
                  >
                    {item.count ?? 0}
                  </span>
                  {tab === item.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8] dark:bg-[#8ab4f8]" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => router.push("/buddy?fresh=true")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#303134] dark:hover:text-[#e8eaed]"
                >
                  <Bot className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#303134] text-xs text-[#e8eaed]">
                AI Buddy
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    showAIPanel
                      ? "bg-[#1a73e8] text-white dark:bg-[#8ab4f8] dark:text-[#202124]"
                      : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#303134] dark:hover:text-[#e8eaed]",
                  )}
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#303134] text-xs text-[#e8eaed]">
                AI Search
              </TooltipContent>
            </Tooltip>

            <ComposeEmailGmail
              open={composeOpen}
              onOpenChange={(open) => {
                setComposeOpen(open);
              }}
            />

            <div className="mx-1 h-6 w-px bg-[#dadce0] dark:bg-[#3c4043]" />

            <UserButton />
          </div>
        </header>

        <div
          ref={containerRef}
          className={cn(
            "flex flex-1 overflow-hidden",
            isResizing && "select-none cursor-col-resize",
          )}
        >
          <aside
            className="flex h-full shrink-0 flex-col border-r border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124]"
            style={{ width: `${sidebarWidthPct}%`, minWidth: 200 }}
          >
            <div className="flex min-w-0 items-center gap-2 border-b border-[#dadce0] px-3 py-2 dark:border-[#3c4043]">
              <div className="min-w-0 flex-1">
                <SearchBar />
              </div>
              <button
                type="button"
                onClick={() => threadListRef.current?.triggerSync()}
                disabled={syncPending}
                className="flex shrink-0 items-center justify-center rounded p-1.5 text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] disabled:opacity-60 dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
                aria-label={syncPending ? "Syncing" : "Sync"}
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", syncPending && "animate-spin")}
                />
              </button>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <ThreadList
                ref={threadListRef}
                onThreadSelect={handleThreadSelect}
                onSyncPendingChange={setSyncPending}
              />
            </div>
          </aside>
          <div
            role="separator"
            aria-label="Resize sidebar"
            onMouseDown={handleResizeStart}
            className="flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-[#dadce0] transition-colors hover:bg-[#1a73e8]/20 dark:bg-[#3c4043] dark:hover:bg-[#8ab4f8]/20"
          >
            <GripVertical className="h-3 w-3 text-[#5f6368] dark:text-[#9aa0a6]" />
          </div>
          <main
            className={cn(
              "flex min-w-0 flex-1 flex-col bg-white dark:bg-[#202124]",
              showAIPanel && "mr-[360px]",
            )}
          >
            <ThreadDisplay threadId={selectedThread} />
          </main>

          <aside
            className={cn(
              "fixed right-0 top-12 z-40 h-[calc(100vh-3rem)] w-[360px] border-l border-[#dadce0] bg-white shadow-[-2px_0_8px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out dark:border-[#3c4043] dark:bg-[#292a2d] dark:shadow-[-2px_0_8px_rgba(0,0,0,0.3)]",
              showAIPanel ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#dadce0] px-4 py-3 dark:border-[#3c4043]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a73e8] dark:bg-[#8ab4f8]">
                    <MessageCircle className="h-4 w-4 text-white dark:text-[#202124]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
                    AI Search
                  </span>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <EmailSearchAssistant isCollapsed={false} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}

function MobileSidebar({
  navItems,
  tab,
  setTab,
  router,
  onNavigate,
}: {
  navItems: Array<{
    id: string;
    icon: React.ElementType;
    label: string;
    count?: number;
  }>;
  tab: string;
  setTab: (tab: string) => void;
  router: ReturnType<typeof useRouter>;
  onNavigate?: (newTab: string, isBuddy?: boolean) => void;
}) {
  const { signOut } = useClerk();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ redirectUrl: "/" });
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [signOut, router]);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#202124]">
      <Link
        href="/"
        className="flex items-center gap-3 border-b border-[#dadce0] p-4 dark:border-[#3c4043]"
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8]">
          <video
            src="/Vectormail-logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full scale-[1.6] object-cover"
          />
        </div>
        <div>
          <h2 className="text-[15px] font-medium text-[#202124] dark:text-[#e8eaed]">VectorMail</h2>
          <p className="mt-0.5 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">AI-Powered Email</p>
        </div>
      </Link>

      <div className="border-[#dadce0] dark:border-[#3c4043] md:border-b md:p-3">
        <div className="hidden md:block">
          <AccountSwitcher isCollapsed={false} />
        </div>
      </div>

      <div className="space-y-0.5 p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (onNavigate && tab !== item.id) {
                onNavigate(item.id, false);
              } else {
                setTab(item.id);
              }
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium transition-colors",
              tab === item.id
                ? "bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#174ea6]/30 dark:text-[#8ab4f8]"
                : "text-[#202124] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#303134]",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums",
                tab === item.id
                  ? "bg-[#1a73e8]/20 text-[#1a73e8] dark:bg-[#8ab4f8]/25 dark:text-[#8ab4f8]"
                  : "bg-[#f1f3f4] text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]",
              )}
            >
              {item.count ?? 0}
            </span>
          </button>
        ))}

        <div className="my-2 h-px bg-[#dadce0] dark:bg-[#3c4043]" />

        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate("", true);
            } else {
              router.push("/buddy?fresh=true");
            }
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-[#202124] transition-colors hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
        >
          <Bot className="h-5 w-5 shrink-0" />
          <span className="flex-1">AI Buddy</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 px-2 pb-2">
        <button
          type="button"
          onClick={() => {
            if (onNavigate) {
              onNavigate("", true);
            } else {
              router.push("/buddy?fresh=true");
            }
          }}
          className="group flex w-full flex-col justify-between rounded-lg border border-[#dadce0] bg-[#f8f9fa] p-4 text-left transition-colors hover:border-[#1a73e8]/30 hover:bg-[#e8f0fe]/50 dark:border-[#3c4043] dark:bg-[#292a2d] dark:hover:border-[#8ab4f8]/30 dark:hover:bg-[#174ea6]/10"
        >
          <div className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a73e8] dark:bg-[#8ab4f8]">
                <Zap className="h-4 w-4 text-white dark:text-[#202124]" />
              </div>
              <Search className="h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6]" />
            </div>
            <h3 className="mb-2 text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
              Email assistant
            </h3>
            <p className="text-[13px] leading-relaxed text-[#5f6368] dark:text-[#9aa0a6]">
              Find emails, summarize threads, and get insights. Best on desktop.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[13px] font-medium text-[#1a73e8] dark:text-[#8ab4f8]">
            <span>Try on desktop</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      </div>

      <div className="border-t border-[#dadce0] p-2 dark:border-[#3c4043]">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-[#d93025] transition-colors hover:bg-[#fce8e6] dark:text-[#f28b82] dark:hover:bg-[#5f2120]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default Mail;
