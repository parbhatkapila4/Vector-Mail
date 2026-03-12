"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Menu,
  Inbox,
  Send,
  Bot,
  X,
  Plus,
  MessageCircle,
  LogOut,
  Loader2,
  Zap,
  Search,
  ArrowRight,
  ArrowLeft,
  CalendarClock,
  Trash2,
  Settings,
  Pencil,
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
import { UserProfile, useClerk, useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { LabelsList } from "./labels/LabelsList";
import { NudgesBlock } from "./NudgesBlock";
import { UpcomingFromEmailBlock } from "./UpcomingFromEmailBlock";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";

const REQUEST_ACCESS_EMAIL_BODY = `Hi Parbhat,

I've been exploring VectorMail in demo mode and would like to request access so I can use it with my own inbox.

I'm particularly interested in using AI Search and AI Buddy being able to find and summarize emails with natural language, and get help drafting replies and managing my workflow, would make a real difference for how I handle email day to day. I'd like to connect my Gmail account and try the full experience with my actual mail.

Could you let me know what the process looks like for getting access, and when I might be able to start? I'm happy to share more about my use case or jump on a short call if that would be helpful.

Thanks for your time, and I look forward to hearing from you.

Best regards`;

interface MailLayoutProps {
  defaultLayout?: number[] | readonly number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}

export function Mail({ }: MailLayoutProps) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSearchResetKey, setAiSearchResetKey] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [requestAccessOpen, setRequestAccessOpen] = useState(false);
  const [tab, setTab] = useLocalStorage("vector-mail", "inbox");
  const [selectedLabelId, setSelectedLabelId] = useLocalStorage("vector-mail-label-id", "");
  const [sidebarWidthPct, setSidebarWidthPct] = useLocalStorage("mail-sidebar-width-pct", 38);
  const [isResizing, setIsResizing] = useState(false);
  const [syncPending, setSyncPending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const signOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeStartRef = useRef<{ x: number; pct: number; finalPct: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const threadListRef = useRef<ThreadListRef>(null);
  const rafRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const { user } = useUser();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => () => {
    if (signOutTimeoutRef.current) clearTimeout(signOutTimeoutRef.current);
  }, []);

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  const handleSignOut = useCallback(() => {
    setIsSigningOut(true);
    void signOut().catch(() => { });
    const forceRedirectMs = 1200;
    signOutTimeoutRef.current = setTimeout(() => {
      signOutTimeoutRef.current = null;
      window.location.href = "/";
    }, forceRedirectMs);
  }, [signOut]);

  const SIDEBAR_MIN_PCT = 20;
  const SIDEBAR_MAX_PCT = 55;

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setIsResizing(true);
      resizeStartRef.current = { x: e.clientX, pct: sidebarWidthPct, finalPct: sidebarWidthPct };
    },
    [sidebarWidthPct],
  );

  useEffect(() => {
    if (!isResizing) return;
    const pendingRef = { current: null as number | null };
    const flush = () => {
      rafRef.current = null;
      const x = pendingRef.current;
      pendingRef.current = null;
      if (x === null) return;
      const start = resizeStartRef.current;
      const el = containerRef.current;
      const sidebar = sidebarRef.current;
      if (!start || !el || !sidebar) return;
      const containerWidth = el.getBoundingClientRect().width;
      if (containerWidth <= 0) return;
      const deltaPct = ((x - start.x) / containerWidth) * 100;
      let next = start.pct + deltaPct;
      next = Math.max(SIDEBAR_MIN_PCT, Math.min(SIDEBAR_MAX_PCT, next));
      resizeStartRef.current = { ...start, finalPct: next };
      sidebar.style.width = `${next}%`;
    };
    const onMove = (e: PointerEvent) => {
      pendingRef.current = e.clientX;
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(flush);
    };
    const onUp = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const start = resizeStartRef.current;
      if (start) setSidebarWidthPct(start.finalPct);
      resizeStartRef.current = null;
      setIsResizing(false);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isResizing, setSidebarWidthPct]);

  const focusSearch = useCallback(() => {
    document.getElementById("mail-search-input")?.focus();
  }, []);

  const focusReply = useCallback(() => {
    window.dispatchEvent(new CustomEvent("focus-reply"));
  }, []);

  const isDemo = useDemoMode();
  const { data: accounts, isLoading: accountsLoading } = api.account.getAccounts.useQuery();
  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";
  const showConnectCard = !isDemo && !accountsLoading && !!accounts && accounts.length === 0;

  const { data: myAccount } = api.account.getMyAccount.useQuery(
    { accountId: firstAccountId || "placeholder" },
    { enabled: !!firstAccountId && firstAccountId.length > 0 },
  );

  const accountId = myAccount?.id ?? "";
  const isEnabled = !!accountId;
  const countAccountId = isDemo ? DEMO_ACCOUNT_ID : (accountId || "placeholder");

  const { data: inboxCount } = api.account.getNumThreads.useQuery(
    { accountId: countAccountId, tab: "inbox" },
    { enabled: (isEnabled || isDemo) && (!!accountId || isDemo), refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const { data: sentCount, isFetched: sentCountFetched } = api.account.getNumThreads.useQuery(
    { accountId: countAccountId, tab: "sent" },
    { enabled: (isEnabled || isDemo) && (!!accountId || isDemo), refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const { data: trashCount, isFetched: trashCountFetched } = api.account.getNumThreads.useQuery(
    { accountId: countAccountId, tab: "trash" },
    { enabled: (isEnabled || isDemo) && (!!accountId || isDemo), refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const utils = api.useUtils();
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

  if (showConnectCard) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 dark:bg-[#09090b]">
        <div className="max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center shadow-sm dark:border-[#1a1a23] dark:bg-[#111113]">
          <h1 className="text-xl font-semibold text-[#111118] dark:text-[#f4f4f5]">Connect your Gmail</h1>
          <p className="mt-2 text-sm text-[#6b7280] dark:text-[#a1a1aa]">
            You&apos;re signed in. Connect your Gmail account to access your inbox.
          </p>
          <a
            href="/api/connect/google"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563eb]"
          >
            Connect Gmail
          </a>
        </div>
      </div>
    );
  }

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
        <div className="flex h-full min-h-0 w-full flex-col bg-[#f6f8fc] dark:bg-[#202124]">
          <div className="flex shrink-0 items-center justify-between border-b border-[#dadce0] bg-white px-4 py-2.5 dark:border-[#3c4043] dark:bg-[#202124] [padding-top:max(0.625rem,env(safe-area-inset-top))]">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {selectedThread ? (
                <button
                  type="button"
                  onClick={handleThreadClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed] [touch-action:manipulation]"
                  aria-label="Close email"
                  title="Close email"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : (
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 [touch-action:manipulation]">
                      <Menu className="h-5 w-5" aria-label="Menu" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="flex w-[280px] flex-col border-[#dadce0] bg-white p-0 dark:border-[#3c4043] dark:bg-[#202124]"
                  >
                    <MobileSidebar
                      navItems={navItems}
                      tab={tab}
                      setTab={setTab}
                      router={router}
                      onNavigate={handleMobileNavigation}
                      onSignOut={handleSignOut}
                      isSigningOut={isSigningOut}
                    />
                    <div className="border-t border-[#dadce0] px-2 py-2 dark:border-[#3c4043]">
                      <LabelsList
                        accountId={accountId}
                        currentTab={tab}
                        selectedLabelId={tab === "label" ? selectedLabelId : null}
                        onLabelSelect={(id) => {
                          setTab("label");
                          setSelectedLabelId(id);
                          setSheetOpen(false);
                        }}
                        onLabelUnselect={() => {
                          setSelectedLabelId("");
                          setTab("inbox");
                        }}
                      />
                    </div>
                    <div className="border-t border-[#dadce0] dark:border-[#3c4043]">
                      <NudgesBlock
                        accountId={accountId}
                        onThreadSelect={(threadId) => {
                          handleThreadSelect(threadId);
                          setSheetOpen(false);
                        }}
                      />
                      <UpcomingFromEmailBlock
                        accountId={accountId}
                        onThreadSelect={(threadId) => {
                          handleThreadSelect(threadId);
                          setSheetOpen(false);
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <span className="min-w-0 truncate text-[15px] font-medium capitalize text-[#202124] dark:text-[#e8eaed]">
                {selectedThread ? "Message" : (navItems.find((i) => i.id === tab)?.label ?? tab)}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => threadListRef.current?.triggerSync()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
                aria-label={syncPending ? "Stop sync" : "Sync Inbox, Sent, and Trash"}
              >
                <RefreshCw
                  className={cn("h-5 w-5", syncPending && "animate-spin")}
                />
              </button>
              <ComposeEmailGmail
                open={composeOpen}
                onOpenChange={setComposeOpen}
              />
              <ProfileMenu onSignOut={handleSignOut} isSigningOut={isSigningOut} />
            </div>
          </div>

          {isDemo && (
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-[#e8eaed] bg-[#f8f9fa] px-3 py-1.5 dark:border-[#3c4043] dark:bg-[#252628]">
              <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                You’re exploring VectorMail with sample data so you can see how everything works. Ready for your own inbox?
              </span>
              <a
                href="mailto:parbhat@parbhat.dev?subject=VectorMail%20%E2%80%93%20Request%20access&body=Hi%2C%0A%0AI'd%20like%20to%20request%20access%20to%20connect%20my%20Gmail%20and%20use%20VectorMail%20with%20my%20own%20inbox.%20Please%20let%20me%20know%20when%20access%20is%20available.%0A%0AThank%20you."
                className="shrink-0 rounded-md bg-[#1a73e8] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
              >
                Request access
              </a>
              <span className="w-full text-center text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
                We’ll reply once your account is enabled.
              </span>
            </div>
          )}

          {isNavigating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg dark:bg-[#292a2d]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#8ab4f8]" />
                <p className="text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6]">Loading...</p>
              </div>
            </div>
          )}

          {!selectedThread ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f6f8fc] dark:bg-[#202124]">
              <SearchBar />
              <ThreadList
                ref={threadListRef}
                onThreadSelect={handleThreadSelect}
                onSyncPendingChange={setSyncPending}
              />
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#202124]">
              <ThreadDisplay threadId={selectedThread} onClose={handleThreadClose} />
            </div>
          )}

          <nav
            className="flex shrink-0 border-t border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124] [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))] [touch-action:manipulation]"
            aria-label="Primary"
          >
            <button
              type="button"
              onClick={() => {
                handleThreadClose();
                setTab("inbox");
                setSheetOpen(false);
              }}
              className={cn(
                "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-medium transition-colors [touch-action:manipulation]",
                !selectedThread && tab === "inbox"
                  ? "text-[#1a73e8] dark:text-[#8ab4f8]"
                  : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]",
              )}
            >
              <Inbox className="h-5 w-5" />
              Inbox
            </button>
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-medium text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed] [touch-action:manipulation]"
            >
              <Send className="h-5 w-5" />
              New email
            </button>
          </nav>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      {isSigningOut && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm dark:bg-[#09090b]/95"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-10 w-10 animate-spin text-[#3b82f6]" />
          <p className="text-[15px] font-medium text-[#111118] dark:text-[#f4f4f5]">Logging out…</p>
          <p className="text-[13px] text-[#6b7280] dark:text-[#71717a]">Taking you to the home page</p>
        </div>
      )}
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
      <div className="flex h-full min-h-0 w-full bg-white dark:bg-[#09090b]">
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#e5e7eb] bg-[#fafbfc] dark:border-[#1a1a23] dark:bg-[#09090b]">
          <Link
            href="/"
            prefetch
            className="flex w-full items-center gap-2.5 px-5 py-4 text-left transition-opacity hover:opacity-90 active:opacity-95"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#3b82f6]">
              <video
                src="/Vectormail-logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full scale-[1.6] object-cover"
              />
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-[#111118] dark:text-[#f4f4f5]">
              VectorMail
            </span>
          </Link>

          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-[#2563eb] hover:shadow-md active:scale-[0.98]"
            >
              <Pencil className="h-4 w-4" />
              New email
            </button>
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-0.5 px-2 pb-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    if (item.id !== tab) setSelectedThread(null);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                    tab === item.id
                      ? "bg-[#eff6ff] text-[#2563eb] dark:bg-[#3b82f6]/[0.12] dark:text-[#60a5fa]"
                      : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.04] dark:hover:text-[#f4f4f5]",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {(item.count ?? 0) > 0 && (
                    <span
                      className={cn(
                        "min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums",
                        tab === item.id
                          ? "bg-[#2563eb]/10 text-[#2563eb] dark:bg-[#60a5fa]/15 dark:text-[#60a5fa]"
                          : "text-[#9ca3af] dark:text-[#71717a]",
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mx-3 my-2 h-px bg-[#e5e7eb] dark:bg-[#1a1a23]" />

            <div className="px-2">
              <LabelsList
                accountId={accountId}
                currentTab={tab}
                selectedLabelId={tab === "label" ? selectedLabelId : null}
                onLabelSelect={(id) => {
                  setTab("label");
                  setSelectedLabelId(id);
                }}
                onLabelUnselect={() => {
                  setSelectedLabelId("");
                  setTab("inbox");
                }}
              />
            </div>

            <div className="mx-3 my-2 h-px bg-[#e5e7eb] dark:bg-[#1a1a23]" />

            <div className="space-y-0.5 px-2">
              <button
                type="button"
                onClick={() => {
                  if (isDemo) {
                    setRequestAccessOpen(true);
                  } else {
                    window.location.href = "/buddy?fresh=true";
                  }
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.04] dark:hover:text-[#f4f4f5]"
              >
                <Bot className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 text-left">AI Buddy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isDemo) {
                    setRequestAccessOpen(true);
                  } else {
                    setShowAIPanel(!showAIPanel);
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                  showAIPanel
                    ? "bg-[#eff6ff] text-[#2563eb] dark:bg-[#3b82f6]/[0.12] dark:text-[#60a5fa]"
                    : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.04] dark:hover:text-[#f4f4f5]",
                )}
              >
                <MessageCircle className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 text-left">AI Search</span>
                {isDemo && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">
                    Demo
                  </span>
                )}
              </button>
            </div>

            <NudgesBlock
              accountId={accountId}
              onThreadSelect={handleThreadSelect}
            />
            <UpcomingFromEmailBlock
              accountId={accountId}
              onThreadSelect={handleThreadSelect}
            />
          </nav>

          <div className="border-t border-[#e5e7eb] p-2 dark:border-[#1a1a23]">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <ProfileMenu onSignOut={handleSignOut} isSigningOut={isSigningOut} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[#111118] dark:text-[#f4f4f5]">
                  {userName}
                </p>
                {userEmail && (
                  <p className="truncate text-[11px] text-[#9ca3af] dark:text-[#71717a]">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          {isDemo && (
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-1.5 dark:border-[#1a1a23] dark:bg-[#111113]">
              <span className="text-[12px] text-[#6b7280] dark:text-[#a1a1aa]">
                Exploring VectorMail with sample data.
              </span>
              <a
                href="mailto:parbhat@parbhat.dev?subject=VectorMail%20%E2%80%93%20Request%20access&body=Hi%2C%0A%0AI'd%20like%20to%20request%20access%20to%20connect%20my%20Gmail%20and%20use%20VectorMail%20with%20my%20own%20inbox.%20Please%20let%20me%20know%20when%20access%20is%20available.%0A%0AThank%20you."
                className="shrink-0 rounded-md bg-[#3b82f6] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#2563eb]"
              >
                Request access
              </a>
            </div>
          )}

          <div
            ref={containerRef}
            className={cn(
              "flex flex-1 overflow-hidden",
              isResizing && "select-none cursor-col-resize",
            )}
          >
            <aside
              ref={sidebarRef}
              className="flex h-full shrink-0 flex-col border-r border-[#e5e7eb] bg-white dark:border-[#1a1a23] dark:bg-[#111113]"
              style={{
                width: `${sidebarWidthPct}%`,
                minWidth: 280,
                ...(isResizing && { willChange: "width" }),
              }}
            >
              <div className="flex min-w-0 items-center gap-2 border-b border-[#e5e7eb] px-3 py-2 dark:border-[#1a1a23]">
                <div className="min-w-0 flex-1">
                  <SearchBar />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => threadListRef.current?.triggerSync()}
                      className="flex shrink-0 items-center justify-center rounded-lg p-2 text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#71717a] dark:hover:bg-[#ffffff]/[0.04] dark:hover:text-[#f4f4f5]"
                      aria-label={syncPending ? "Stop sync" : "Sync emails"}
                    >
                      <RefreshCw
                        className={cn("h-4 w-4", syncPending && "animate-spin")}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-[#18181b] text-xs text-[#f4f4f5]">
                    {syncPending ? "Syncing…" : "Sync emails"}
                  </TooltipContent>
                </Tooltip>
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
              aria-label="Resize panels"
              onPointerDown={handleResizeStart}
              className={cn(
                "relative z-10 flex w-[5px] shrink-0 cursor-col-resize items-center justify-center self-stretch transition-colors",
                "bg-transparent hover:bg-[#3b82f6]/20 dark:hover:bg-[#3b82f6]/20",
                isResizing && "bg-[#3b82f6]/30 dark:bg-[#3b82f6]/30",
              )}
              style={{ touchAction: "none", minHeight: 120 }}
            />

            <main
              className={cn(
                "flex min-w-0 flex-1 flex-col bg-white dark:bg-[#111113]",
                showAIPanel && "mr-[360px]",
              )}
            >
              <ThreadDisplay threadId={selectedThread} onClose={handleThreadClose} />
            </main>


            <aside
              className={cn(
                "fixed right-0 z-40 w-[360px] border-l border-[#e5e7eb] bg-white shadow-[-2px_0_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out dark:border-[#1a1a23] dark:bg-[#111113] dark:shadow-[-2px_0_8px_rgba(0,0,0,0.3)]",
                isDemo ? "top-[2.25rem] h-[calc(100vh-2.25rem)]" : "top-0 h-screen",
                showAIPanel ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3 dark:border-[#1a1a23]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[14px] font-medium text-[#111118] dark:text-[#f4f4f5]">
                      AI Search
                    </span>
                    {isDemo && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAIPanel(true);
                            setAiSearchResetKey((k) => k + 1);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f3f4f6] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.04]"
                          aria-label="New chat (AI Search)"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>New chat (AI Search)</p>
                      </TooltipContent>
                    </Tooltip>
                    <button
                      onClick={() => setShowAIPanel(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f3f4f6] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.04]"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <EmailSearchAssistant isCollapsed={false} resetTrigger={aiSearchResetKey} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <div className="hidden">
        <ComposeEmailGmail
          open={composeOpen}
          onOpenChange={setComposeOpen}
        />
      </div>

      <Dialog open={requestAccessOpen} onOpenChange={setRequestAccessOpen}>
        <DialogContent className="border-[#e5e7eb] bg-white dark:border-[#1a1a23] dark:bg-[#111113] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111118] dark:text-[#f4f4f5">
              Request access
            </DialogTitle>
            <DialogDescription className="text-left text-[#6b7280] dark:text-[#a1a1aa]">
              <span className="block mt-2">
                To use AI Buddy, AI Search, and other features with your own Gmail, you need access to VectorMail. Right now you're exploring with sample data.
              </span>
              <span className="mt-3 block">
                Request access to connect your account and unlock the full experience: AI assistant, semantic search, smart summaries, and more - all in your mailbox.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRequestAccessOpen(false)}
              className="border-[#e5e7eb] dark:border-[#1a1a23]"
            >
              Close
            </Button>
            <a
              href={`mailto:parbhat@parbhat.dev?subject=${encodeURIComponent("VectorMail – Request access")}&body=${encodeURIComponent(REQUEST_ACCESS_EMAIL_BODY)}`}
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#3b82f6] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2563eb]"
              onClick={() => setRequestAccessOpen(false)}
            >
              Request access
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

function ProfileMenu({
  onSignOut,
  isSigningOut,
}: {
  onSignOut: () => void;
  isSigningOut: boolean;
}) {
  const { user } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const imageUrl = user?.imageUrl ?? "";
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (user?.emailAddresses?.[0]?.emailAddress ?? "Account");
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-[#f3f4f6] dark:border-[#1a1a23] dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            aria-label="Account menu"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-medium text-[#6b7280] dark:text-[#a1a1aa]">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[220px] rounded-lg border-[#e5e7eb] bg-white dark:border-[#1a1a23] dark:bg-[#111113]"
        >
          <div className="flex items-center gap-3 border-b border-[#f3f4f6] px-2 py-3 dark:border-[#1a1a23]">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e5e7eb] text-[15px] font-medium text-[#6b7280] dark:bg-[#18181b] dark:text-[#a1a1aa]">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-[#111118] dark:text-[#f4f4f5]">{name}</p>
              {email && (
                <p className="truncate text-[12px] text-[#6b7280] dark:text-[#a1a1aa]">{email}</p>
              )}
            </div>
          </div>
          <DropdownMenuItem
            onClick={() => setProfileOpen(true)}
            className="cursor-pointer text-[#111118] focus:bg-[#f3f4f6] dark:text-[#f4f4f5] dark:focus:bg-[#ffffff]/[0.04]"
          >
            <Settings className="h-4 w-4" />
            Manage account
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onSignOut}
            disabled={isSigningOut}
            variant="destructive"
            className="cursor-pointer text-[#ef4444] focus:bg-[#fef2f2] dark:text-[#f87171] dark:focus:bg-[#7f1d1d]/30"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[400px] overflow-y-auto border-[#e5e7eb] bg-white p-0 dark:border-[#1a1a23] dark:bg-[#111113]"
        >
          <UserProfile />
        </SheetContent>
      </Sheet>
    </>
  );
}

function MobileSidebar({
  navItems,
  tab,
  setTab,
  router,
  onNavigate,
  onSignOut,
  isSigningOut,
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
  onSignOut: () => void;
  isSigningOut: boolean;
}) {
  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-[#202124]">
      <Link
        href="/"
        prefetch
        className="flex w-full items-center gap-3 border-b border-[#dadce0] p-4 transition-opacity hover:opacity-90 active:opacity-95 dark:border-[#3c4043]"
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
          type="button"
          onClick={() => {
            onNavigate?.("", true);
            window.location.href = "/buddy?fresh=true";
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
            onNavigate?.("", true);
            window.location.href = "/buddy?fresh=true";
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
          type="button"
          onClick={onSignOut}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-[#d93025] transition-colors hover:bg-[#fce8e6] disabled:opacity-70 dark:text-[#f28b82] dark:hover:bg-[#5f2120]"
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 shrink-0" />
          )}
          <span className="flex-1 text-left">{isSigningOut ? "Signing out…" : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}

export default Mail;
