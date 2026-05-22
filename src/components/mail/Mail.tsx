"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Menu,
  Inbox,
  Send,
  Bot,
  X,
  Plus,
  Loader2,
  Zap,
  CircleHelp,
  ArrowLeft,
  CalendarClock,
  Trash2,
  Pencil,
  ChevronsUp,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  FlaskConical,
  Sparkles,
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
import { UNIFIED_INBOX_ACCOUNT_ID } from "./AccountSwitcher";
import { ThreadList, type ThreadListRef } from "./threads-ui/ThreadList";
import { ThreadDisplay } from "./threads-ui/ThreadDisplay";
import EmailSearchAssistant from "../global/AskAi";
import SearchBar from "./search/SearchBar";
import ComposeEmailGmail from "./ComposeEmailGmail";
import { MailKeyboardShortcuts } from "./MailKeyboardShortcuts";
import { ShortcutHelpModal } from "./ShortcutHelpModal";
import { RequestAccessDialog } from "./RequestAccessDialog";
import { ProfileMenu } from "./ProfileMenu";
import { MobileSidebar } from "./MobileSidebar";
import { useResizableLayout } from "./useResizableLayout";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, formatDistanceToNow } from "date-fns";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { LabelsList } from "./labels/LabelsList";
import { NudgesBlock } from "./NudgesBlock";
import { DailyBriefStrip } from "./DailyBriefStrip";
import { UpcomingFromEmailBlock } from "./UpcomingFromEmailBlock";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useSetAtom } from "jotai";
import { threadIdAtom } from "@/hooks/use-threads";
import { trackInboxBrainEvent } from "@/lib/analytics/inbox-brain";
import { AutopilotSection } from "@/components/mail/AutopilotSection";
import { AutomationOutcomeBanner } from "@/components/mail/AutomationOutcomeBanner";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";

interface MailLayoutProps {
  defaultLayout?: number[] | readonly number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}


const THREAD_LIST_WIDTH_PCT = { min: 20, max: 55, fallback: 52 } as const;
const AI_PANEL_WIDTH_PX = { min: 320, max: 620, fallback: 360 } as const;

function threadListWidthPctDefault(
  defaultLayout?: number[] | readonly number[] | undefined,
): number {
  const raw = defaultLayout?.[1];
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return THREAD_LIST_WIDTH_PCT.fallback;
  }

  if (raw >= 90) return THREAD_LIST_WIDTH_PCT.fallback;
  return Math.min(
    THREAD_LIST_WIDTH_PCT.max,
    Math.max(THREAD_LIST_WIDTH_PCT.min, Math.round(raw)),
  );
}

export function Mail({ defaultLayout }: MailLayoutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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
  const [sidebarWidthPct, setSidebarWidthPct] = useLocalStorage(
    "mail-sidebar-width-pct",
    threadListWidthPctDefault(defaultLayout),
  );
  const [sidebarLayoutHydrated, setSidebarLayoutHydrated] = useState(false);
  useEffect(() => setSidebarLayoutHydrated(true), []);
  const threadListLayoutWidthPct = sidebarLayoutHydrated
    ? sidebarWidthPct
    : threadListWidthPctDefault(defaultLayout);
  const [syncPending, setSyncPending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [aiPanelWidthPx, setAiPanelWidthPx] = useLocalStorage<number>(
    "mail-ai-panel-width-px",
    AI_PANEL_WIDTH_PX.fallback,
  );
  const effectiveWidth = mounted ? aiPanelWidthPx : AI_PANEL_WIDTH_PX.fallback;
  const signOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threadListRef = useRef<ThreadListRef>(null);
  const {
    containerRef,
    sidebarRef,
    isResizing,
    isAiResizing,
    handleResizeStart,
    handleAiResizeStart,
  } = useResizableLayout({
    sidebarWidthPct,
    setSidebarWidthPct,
    sidebarBoundsPct: THREAD_LIST_WIDTH_PCT,
    aiPanelWidthPx,
    setAiPanelWidthPx,
    aiPanelBoundsPx: AI_PANEL_WIDTH_PX,
    onAiPanelCommit: () => setSelectedThread(null),
  });
  const isMobile = useIsMobile();
  const isMacOS =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().includes("MAC");
  const { user } = useUser();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [storedAccountId, setStoredAccountId] = useLocalStorage("accountId", "");
  useEffect(() => {
    if (storedAccountId) return;
    const qsAccountId = searchParams.get("accountId");
    if (!qsAccountId?.trim()) return;
    if (qsAccountId !== storedAccountId) {
      setStoredAccountId(qsAccountId);
    }
  }, [searchParams, storedAccountId, setStoredAccountId]);
  const firstConnectedAccountId =
    accounts?.find((acc) => !("needsReconnection" in acc) || !acc.needsReconnection)
      ?.id ?? firstAccountId;
  useEffect(() => {
    if (storedAccountId) return;
    if (!firstConnectedAccountId) return;
    setStoredAccountId(firstConnectedAccountId);
  }, [storedAccountId, firstConnectedAccountId, setStoredAccountId]);
  const storedAccount = accounts?.find((acc) => acc.id === storedAccountId);
  const accountId =
    storedAccountId === UNIFIED_INBOX_ACCOUNT_ID
      ? firstAccountId
      : storedAccount
        ? storedAccountId
        : firstConnectedAccountId;

  const { data: dailyBriefForCount } = api.account.getDailyBrief.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId && accountId.length > 0 },
  );
  const { data: nudgesForCount } = api.account.getNudges.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId && accountId.length > 0 },
  );
  const { data: autopilotPrefsForBadge } = api.automation.getPrefs.useQuery(
    { accountId: accountId || "" },
    { enabled: !!accountId && accountId.length > 0, staleTime: 10_000 },
  );
  const { data: autopilotToday } = api.automation.getTodaySummary.useQuery(
    { accountId: accountId || "" },
    { enabled: !!accountId && accountId.length > 0, staleTime: 30_000 },
  );
  const autopilotSent = autopilotToday?.sentRealToday ?? 0;
  const autopilotPending = autopilotToday?.pendingApproval ?? 0;
  const autopilotFailed = autopilotToday?.failedToday ?? 0;
  const autopilotSimulated = autopilotToday?.simulatedToday ?? 0;
  const autopilotHandled = autopilotSent + autopilotSimulated;
  const autopilotMinSaved = autopilotHandled * 5;
  const todaysBriefCount = dailyBriefForCount
    ? dailyBriefForCount.needsReply.length +
      dailyBriefForCount.important.length +
      dailyBriefForCount.lowPriority.length
    : null;
  const nudgesCount = nudgesForCount?.nudges?.length ?? null;
  const autopilotState =
    autopilotPrefsForBadge?.automationMode &&
    autopilotPrefsForBadge.automationMode !== "manual"
      ? "on"
      : autopilotPrefsForBadge
        ? "off"
        : null;

  const [upcomingPopoverOpen, setUpcomingPopoverOpen] = useState(false);
  const [dailyBriefPopoverOpen, setDailyBriefPopoverOpen] = useState(false);
  const [nudgesPopoverOpen, setNudgesPopoverOpen] = useState(false);
  const { data: upcomingMeetingsData, isLoading: upcomingLoading } =
    api.account.getUpcomingEventsFromEmails.useQuery(
      { accountId: accountId || "placeholder" },
      {
        enabled: !!accountId && accountId.length > 0 && upcomingPopoverOpen,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
    );
  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return (upcomingMeetingsData?.events ?? []).filter((e) => {
      const endTs = e.endAt ? new Date(e.endAt).getTime() : Number.NaN;
      const startTs = new Date(e.startAt).getTime();
      return Number.isFinite(endTs) ? endTs > now : startTs > now;
    });
  }, [upcomingMeetingsData?.events]);

  const setThreadId = useSetAtom(threadIdAtom);

  const handleThreadSelect = useCallback((threadId: string) => {
    setSelectedThread(threadId);
    setThreadId(threadId);
  }, [setThreadId]);

  const handleThreadClose = useCallback(() => {
    setSelectedThread(null);
    setThreadId(null);
  }, [setThreadId]);

  useEffect(() => {

    setSelectedThread(null);
    setThreadId(null);
  }, [accountId, setThreadId]);

  const toggleAIPanel = useCallback(() => {
    setShowAIPanel((open) => {
      if (open) return false;
      trackInboxBrainEvent("inbox_brain_panel_opened", { source: "keyboard" });
      return true;
    });
  }, []);

  const cycleBriefFocusFromShortcut = useCallback(() => {
    threadListRef.current?.cycleBriefFocus();
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
    { id: "inbox", icon: Inbox, label: "Inbox" },
    { id: "sent", icon: Send, label: "Sent" },
    { id: "scheduled", icon: CalendarClock, label: "Schedule" },
    { id: "trash", icon: Trash2, label: "Trash" },
  ];

  if (showConnectCard) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 dark:bg-[#ffffff]">
        <div className="max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center shadow-sm dark:border-[#ffffff] dark:bg-[#ffffff]">
          <h1 className="text-xl font-semibold text-[#111118] dark:text-[#f4f4f5]">Connect your Gmail</h1>
          <p className="mt-2 text-sm text-[#6b7280] dark:text-[#a1a1aa]">
            You&apos;re signed in. Connect your Gmail account to access your inbox.
          </p>
          <a
            href="/api/connect/google"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e2a4a] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#b88a3f]"
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
          mailTab={tab}
          setMailTab={setTab}
          focusSearch={focusSearch}
          openCompose={() => setComposeOpen(true)}
          focusReply={focusReply}
          onCloseThread={handleThreadClose}
          showHelp={() => setHelpOpen(true)}
          helpOpen={helpOpen}
          closeHelp={() => setHelpOpen(false)}
          toggleAIPanel={toggleAIPanel}
          cycleBriefFocus={cycleBriefFocusFromShortcut}
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
                    className="flex w-[280px] flex-col min-h-0 overflow-y-auto border-[#dadce0] bg-white p-0 dark:border-[#3c4043] dark:bg-[#202124] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                      {tab === "inbox" && (
                        <DailyBriefStrip
                          accountId={accountId}
                          isDemo={isDemo}
                          onShowKeyboardHelp={() => setHelpOpen(true)}
                          showDesktopShortcuts={!isMobile}
                          onThreadSelect={(threadId) => {
                            handleThreadSelect(threadId);
                            setSheetOpen(false);
                          }}
                        />
                      )}
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
                      {accountId ? (
                        <AutomationOutcomeBanner
                          accountId={accountId}
                          isDemo={isDemo && accountId === DEMO_ACCOUNT_ID}
                          onOpenThread={(threadId) => {
                            handleThreadSelect(threadId);
                            setSheetOpen(false);
                          }}
                        />
                      ) : null}
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
                className="shrink-0 rounded-md bg-[#1a73e8] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#1557b0] dark:bg-[#1e2a4a] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
              >
                Request access
              </a>
              <span className="w-full text-center text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
                We’ll reply once your account is enabled.
              </span>
            </div>
          )}

          {isNavigating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2a4a]/40 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg dark:bg-[#292a2d]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#1e2a4a]" />
                <p className="text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6]">Loading...</p>
              </div>
            </div>
          )}

          {!selectedThread ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f6f8fc] dark:bg-[#202124]">
              <SearchBar />
              <div className="min-h-0 flex-1 overflow-hidden">
                <ThreadList
                  ref={threadListRef}
                  onThreadSelect={handleThreadSelect}
                  onSyncPendingChange={setSyncPending}
                />
              </div>
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
                  ? "text-[#1a73e8] dark:text-[#1e2a4a]"
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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm dark:bg-[#ffffff]/95"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-10 w-10 animate-spin text-[#1e2a4a]" />
          <p className="text-[15px] font-medium text-[#111118] dark:text-[#f4f4f5]">Logging out…</p>
          <p className="text-[13px] text-[#6b7280] dark:text-[#71717a]">Taking you to the home page</p>
        </div>
      )}
      <MailKeyboardShortcuts
        selectedThread={selectedThread}
        setSelectedThread={setSelectedThread}
        mailTab={tab}
        setMailTab={setTab}
        focusSearch={focusSearch}
        openCompose={() => setComposeOpen(true)}
        focusReply={focusReply}
        onCloseThread={handleThreadClose}
        showHelp={() => setHelpOpen(true)}
        helpOpen={helpOpen}
        closeHelp={() => setHelpOpen(false)}
        toggleAIPanel={toggleAIPanel}
        cycleBriefFocus={cycleBriefFocusFromShortcut}
      />
      <ShortcutHelpModal open={helpOpen} onOpenChange={setHelpOpen} />
      <div className="vm-mockup flex h-full min-h-0 w-full bg-white dark:bg-[#ffffff]">
        <aside className="sidebar w-[240px] shrink-0">
          <Link
            href="/"
            prefetch
            className="sidebar-head"
            style={{ textDecoration: "none" }}
          >
            <span
              className="brand-mark"
              style={{
                background: "#1e2a4a",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <video
                src="/Vectormail-logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full scale-[1.6] object-cover"
              />
            </span>
            <span className="brand-name">VectorMail</span>
          </Link>

          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="new-email-btn"
          >
            <Pencil size={13} strokeWidth={1.6} />
            <span>New email</span>
            <span className="kbd-mini">C</span>
          </button>

          <nav className="sidebar-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="sidebar-section">
              <div className="sidebar-label">
                <span>
                  <span style={{ color: "var(--accent)" }}>✦</span> FOLDERS
                </span>
              </div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    if (item.id !== tab) setSelectedThread(null);
                  }}
                  className={cn("sidebar-item", tab === item.id && "active")}
                >
                  <item.icon className="icon" size={14} />
                  <span className="label-text">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="sidebar-section">
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

            <div className="sidebar-section">
              <div className="sidebar-label">
                <span>
                  <span style={{ color: "var(--accent)" }}>✦</span> INTELLIGENCE
                </span>
              </div>

              <Popover
                open={dailyBriefPopoverOpen}
                onOpenChange={setDailyBriefPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    title="Today's Brief"
                    className="sidebar-item brief-item"
                  >
                    <span className="brief-glyph" aria-hidden="true" />
                    <span className="label-text">Today&apos;s Brief</span>
                    <span className="count">
                      {todaysBriefCount === null ? "-" : todaysBriefCount}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={12}
                  className="w-[400px] max-w-[92vw] border-[#e4e7ed] bg-white p-0 text-[#0e1729] shadow-lg"
                >
                  <div className="max-h-[640px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <DailyBriefStrip
                      accountId={accountId}
                      isDemo={isDemo}
                      onShowKeyboardHelp={() => setHelpOpen(true)}
                      showDesktopShortcuts={!isMobile}
                      defaultExpanded
                      onThreadSelect={(threadId) => {
                        handleThreadSelect(threadId);
                        setDailyBriefPopoverOpen(false);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <button
                type="button"
                onClick={() => {
                  if (isDemo) {
                    setRequestAccessOpen(true);
                  } else {
                    window.location.href = "/buddy?fresh=true";
                  }
                }}
                className="sidebar-item"
              >
                <Bot className="icon" size={14} />
                <span className="label-text">AI Buddy</span>
              </button>

              <button
                type="button"
                title="Open VectorMail Inbox Brain"
                onClick={() => {
                  setShowAIPanel((prev) => {
                    if (!prev) {
                      trackInboxBrainEvent("inbox_brain_panel_opened", {
                        source: "sidebar",
                      });
                    }
                    return !prev;
                  });
                }}
                className={cn("sidebar-item", showAIPanel && "active")}
              >
                <span
                  className="icon"
                  style={{ overflow: "hidden", borderRadius: 4 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/Opus-B.png"
                    alt="Inbox brain"
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="label-text">Inbox brain</span>
                {isDemo && <span className="count">DEMO</span>}
              </button>

              <Popover
                open={nudgesPopoverOpen}
                onOpenChange={setNudgesPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    title="Threads waiting on your reply"
                    className="sidebar-item"
                  >
                    <Plus className="icon" size={14} />
                    <span className="label-text">Nudges</span>
                    {nudgesCount !== null && (
                      <span className="count">{nudgesCount}</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={12}
                  className="w-[380px] max-w-[92vw] border-[#e4e7ed] bg-white p-0 text-[#0e1729] shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-[#eef0f4] px-4 py-3">
                    <p
                      className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1e2a4a]"
                      style={{
                        fontFamily:
                          "var(--font-jetbrains-mono), ui-monospace, monospace",
                      }}
                    >
                      <span className="text-[#1e2a4a]">✦</span>
                      NUDGES
                    </p>
                    {nudgesCount !== null && (
                      <span className="rounded-full bg-[#1e2a4a]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1e2a4a]">
                        {nudgesCount}
                      </span>
                    )}
                  </div>
                  <div className="max-h-[520px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {(nudgesForCount?.nudges ?? []).length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <p className="text-[13px] font-medium text-[#1e2a44]">
                          You&apos;re all caught up
                        </p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-[#7a849a]">
                          No threads are waiting on your reply right now.
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-[#eef0f4]">
                        {(nudgesForCount?.nudges ?? []).map((nudge) => (
                          <li key={nudge.threadId}>
                            <button
                              type="button"
                              onClick={() => {
                                setNudgesPopoverOpen(false);
                                handleThreadSelect(nudge.threadId);
                              }}
                              className="group flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-[#f4f5f8]"
                            >
                              <p className="line-clamp-2 text-[13px] font-medium text-[#0e1729] group-hover:text-[#1e2a4a]">
                                {nudge.thread?.subject ?? "(No subject)"}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-[#7a849a]">
                                <span>{nudge.reason ?? "You haven't replied"}</span>
                                {nudge.thread?.lastMessageDate && (
                                  <>
                                    <span className="text-[#a8b0c0]">·</span>
                                    <span>
                                      {formatDistanceToNow(
                                        new Date(nudge.thread.lastMessageDate),
                                        { addSuffix: true },
                                      )}
                                    </span>
                                  </>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover
                open={upcomingPopoverOpen}
                onOpenChange={setUpcomingPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    title="Upcoming meetings from email"
                    className="sidebar-item"
                  >
                    <ChevronsUp className="icon" size={14} />
                    <span className="label-text">Upcoming</span>
                    {upcomingEvents.length > 0 && (
                      <span className="count">{upcomingEvents.length}</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={12}
                  className="w-[360px] max-w-[90vw] border-[#e4e7ed] bg-white p-0 text-[#0e1729] shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-[#eef0f4] px-4 py-3">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a849a]"
                      style={{
                        fontFamily:
                          "var(--font-jetbrains-mono), ui-monospace, monospace",
                      }}
                    >
                      UPCOMING MEETINGS
                    </p>
                    <span className="rounded-full border border-[#e4e7ed] bg-[#fafbfc] px-2 py-0.5 text-[10px] font-semibold text-[#4a5572]">
                      Last 60d
                    </span>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {upcomingLoading ? (
                      <div className="flex items-center justify-center gap-2 px-4 py-8 text-[12px] text-[#7a849a]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Scanning your inbox…
                      </div>
                    ) : upcomingEvents.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-[13px] font-medium text-[#1e2a44]">
                          No upcoming meetings
                        </p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-[#7a849a]">
                          We scan the last 60 days for Google Meet, Zoom, and
                          Teams links. Anything past its end time is
                          automatically removed.
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-[#eef0f4]">
                        {upcomingEvents.map((event) => {
                          const startDate = new Date(event.startAt);
                          const endDate = event.endAt
                            ? new Date(event.endAt)
                            : null;
                          const isToday =
                            startDate.toDateString() ===
                            new Date().toDateString();
                          const isTomorrow =
                            startDate.toDateString() ===
                            new Date(Date.now() + 86400000).toDateString();
                          const dayLabel = isToday
                            ? "Today"
                            : isTomorrow
                              ? "Tomorrow"
                              : format(startDate, "EEE, MMM d");
                          const timeLabel = format(startDate, "h:mm a");
                          return (
                            <li key={`${event.sourceEmailId}-${event.startAt}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  setUpcomingPopoverOpen(false);
                                  if (event.sourceThreadId) {
                                    handleThreadSelect(event.sourceThreadId);
                                  }
                                }}
                                className="group flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-[#f4f5f8]"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="rounded-md bg-[#1e2a4a]/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#1e2a4a]"
                                    style={{
                                      fontFamily:
                                        "var(--font-jetbrains-mono), ui-monospace, monospace",
                                    }}
                                  >
                                    {dayLabel}
                                  </span>
                                  <span
                                    className="text-[11px] font-medium text-[#4a5572]"
                                    style={{
                                      fontFamily:
                                        "var(--font-jetbrains-mono), ui-monospace, monospace",
                                    }}
                                  >
                                    {timeLabel}
                                    {endDate &&
                                      endDate.getTime() !==
                                        startDate.getTime() &&
                                      ` – ${format(endDate, "h:mm a")}`}
                                  </span>
                                  <span className="ml-auto text-[10px] text-[#a8b0c0]">
                                    in {formatDistanceToNow(startDate)}
                                  </span>
                                </div>
                                <p className="line-clamp-2 text-[13px] font-medium text-[#0e1729] group-hover:text-[#1e2a4a]">
                                  {event.title}
                                </p>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <button
                type="button"
                title="Autopilot"
                onClick={() => setShowAIPanel(true)}
                className="sidebar-item"
              >
                <Zap className="icon" size={14} />
                <span className="label-text">Autopilot</span>
                {autopilotState !== null && (
                  <span className="count">{autopilotState}</span>
                )}
              </button>
            </div>

            {accountId && (
              <div className="autopilot-widget">
                <div className="autopilot-widget-head">
                  <ChevronDown className="autopilot-widget-toggle" />
                  <Zap className="autopilot-widget-icon" />
                  <span className="autopilot-widget-title">
                    AUTOPILOT TODAY
                  </span>
                  <span className="autopilot-widget-count">
                    {autopilotHandled + autopilotPending + autopilotFailed}
                  </span>
                </div>
                <div className="autopilot-widget-grid">
                  <div className="autopilot-stat">
                    <div className="autopilot-stat-row">
                      <CheckCircle2 className="autopilot-stat-icon stat-success" />
                      <span className="autopilot-stat-value">
                        {autopilotSent}
                      </span>
                    </div>
                    <span className="autopilot-stat-label">SENT</span>
                  </div>
                  <div className="autopilot-stat">
                    <div className="autopilot-stat-row">
                      <Clock className="autopilot-stat-icon stat-pending" />
                      <span className="autopilot-stat-value">
                        {autopilotPending}
                      </span>
                    </div>
                    <span className="autopilot-stat-label">PENDING</span>
                  </div>
                  <div className="autopilot-stat">
                    <div className="autopilot-stat-row">
                      <XCircle className="autopilot-stat-icon stat-failed" />
                      <span className="autopilot-stat-value">
                        {autopilotFailed}
                      </span>
                    </div>
                    <span className="autopilot-stat-label">FAILED</span>
                  </div>
                  <div className="autopilot-stat">
                    <div className="autopilot-stat-row">
                      <FlaskConical className="autopilot-stat-icon stat-sim" />
                      <span className="autopilot-stat-value">
                        {autopilotSimulated}
                      </span>
                    </div>
                    <span className="autopilot-stat-label">SIMULATED</span>
                  </div>
                </div>
                <div className="autopilot-widget-summary">
                  <Sparkles className="autopilot-widget-summary-icon" />
                  <span className="autopilot-widget-summary-text">
                    Inbox handled
                  </span>
                  <span className="autopilot-widget-summary-counts">
                    <span>{autopilotHandled} follow-ups</span>
                    <span>~{autopilotMinSaved} min saved</span>
                  </span>
                </div>
                {autopilotHandled === 0 &&
                  autopilotPending === 0 &&
                  autopilotFailed === 0 && (
                    <p className="autopilot-widget-empty">
                      No autopilot activity yet today. Once the engine sends or
                      queues follow-ups, you&apos;ll see the breakdown here.
                    </p>
                  )}
              </div>
            )}

            {accountId && isDemo && (
              <div className="calendar-widget">
                <div className="calendar-widget-head">
                  <ChevronDown className="calendar-widget-toggle" />
                  <CalendarClock className="calendar-widget-icon" />
                  <span className="calendar-widget-title">
                    CALENDAR TODAY
                  </span>
                  <span className="calendar-widget-count">4</span>
                </div>
                <div className="calendar-widget-events">
                  <div className="calendar-event">
                    <div className="calendar-event-time">
                      <span className="calendar-event-hour">10</span>
                      <span className="calendar-event-meridiem">AM</span>
                    </div>
                    <div className="calendar-event-body">
                      <div className="calendar-event-title">
                        Engineering standup
                      </div>
                      <div className="calendar-event-meta">
                        15 min · 7 attendees
                      </div>
                    </div>
                    <span className="calendar-event-dot dot-info" />
                  </div>
                  <div className="calendar-event">
                    <div className="calendar-event-time">
                      <span className="calendar-event-hour">11</span>
                      <span className="calendar-event-meridiem">AM</span>
                    </div>
                    <div className="calendar-event-body">
                      <div className="calendar-event-title">
                        Mei Lin · phone screen
                      </div>
                      <div className="calendar-event-meta">
                        45 min · Greenhouse req-2418
                      </div>
                    </div>
                    <span className="calendar-event-dot dot-warn" />
                  </div>
                  <div className="calendar-event">
                    <div className="calendar-event-time">
                      <span className="calendar-event-hour">3</span>
                      <span className="calendar-event-meridiem">PM</span>
                    </div>
                    <div className="calendar-event-body">
                      <div className="calendar-event-title">
                        Brightlane renewal
                      </div>
                      <div className="calendar-event-meta">
                        30 min · Sophia + Tomas
                      </div>
                    </div>
                    <span className="calendar-event-dot dot-success" />
                  </div>
                  <div className="calendar-event">
                    <div className="calendar-event-time">
                      <span className="calendar-event-hour">4</span>
                      <span className="calendar-event-meridiem">PM</span>
                    </div>
                    <div className="calendar-event-body">
                      <div className="calendar-event-title">
                        Hana · office hours
                      </div>
                      <div className="calendar-event-meta">
                        30 min · Forerunner
                      </div>
                    </div>
                    <span className="calendar-event-dot dot-accent" />
                  </div>
                </div>
                <div className="calendar-widget-summary">
                  <Sparkles className="calendar-widget-summary-icon" />
                  <span className="calendar-widget-summary-text">
                    Day in shape
                  </span>
                  <span className="calendar-widget-summary-counts">
                    <span>4 meetings</span>
                    <span>3h 45m free</span>
                  </span>
                </div>
              </div>
            )}
            <div style={{ display: "none" }} aria-hidden="true">
              {tab === "inbox" && (
                <DailyBriefStrip
                  accountId={accountId}
                  isDemo={isDemo}
                  onShowKeyboardHelp={() => setHelpOpen(true)}
                  showDesktopShortcuts={!isMobile}
                  onThreadSelect={handleThreadSelect}
                />
              )}
              <NudgesBlock
                accountId={accountId}
                onThreadSelect={handleThreadSelect}
              />
              <UpcomingFromEmailBlock
                accountId={accountId}
                onThreadSelect={handleThreadSelect}
              />
              {accountId ? (
                <AutomationOutcomeBanner
                  accountId={accountId}
                  isDemo={isDemo && accountId === DEMO_ACCOUNT_ID}
                  onOpenThread={handleThreadSelect}
                />
              ) : null}
            </div>
          </nav>

          <div className="sidebar-foot">
            <ProfileMenu onSignOut={handleSignOut} isSigningOut={isSigningOut} />
            <div className="user-info">
              <div className="user-name">{userName}</div>
              {userEmail && <div className="user-status">{userEmail}</div>}
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          {isDemo && (
            <div
              style={{ display: "none" }}
              aria-hidden="true"
              className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b px-4 py-1.5"
            >
              <span
                className="inline-flex items-center gap-1.5"
                style={{
                  fontFamily:
                    "var(--font-jetbrains-mono), ui-monospace, monospace",
                  fontSize: 10,
                  color: "#b88a3f",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                }}
              >
                <span
                  aria-hidden
                  className="block rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    background: "#1e2a4a",
                    boxShadow: "0 0 0 2.5px rgba(212,169,85,0.18)",
                  }}
                />
                DEMO MODE
              </span>
              <span
                className="text-[#5b554c] dark:text-[#a89b86]"
                style={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 12.5,
                  letterSpacing: "-0.005em",
                }}
              >
                exploring VectorMail with sample data
              </span>
              <a
                href="mailto:parbhat@parbhat.dev?subject=VectorMail%20%E2%80%93%20Request%20access&body=Hi%2C%0A%0AI'd%20like%20to%20request%20access%20to%20connect%20my%20Gmail%20and%20use%20VectorMail%20with%20my%20own%20inbox.%20Please%20let%20me%20know%20when%20access%20is%20available.%0A%0AThank%20you."
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold text-[#1a1612] transition-all hover:-translate-y-px"
                style={{
                  background:
                    "linear-gradient(180deg, #1e2a4a 0%, #1e2a4a 100%)",
                  border: "1px solid #b88a3f",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 6px rgba(212,169,85,0.32)",
                  letterSpacing: "0.005em",
                }}
              >
                Request access
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 6h6M6 3l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          )}

          <div
            ref={containerRef}
            className={cn(
              "flex flex-1 overflow-hidden",
              (isResizing || isAiResizing) && "select-none cursor-col-resize",
            )}
          >
            <aside
              ref={sidebarRef}
              className="flex h-full shrink-0 flex-col border-r border-[#e5e7eb] bg-white dark:border-[#ffffff] dark:bg-[#ffffff]"
              style={{
                width: `${threadListLayoutWidthPct}%`,
                minWidth: 280,
                ...(isResizing && { willChange: "width" }),
              }}
            >
              <div className="inbox-top">
                <div className="inbox-search-row">
                  <SearchBar />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => threadListRef.current?.triggerSync()}
                        className="inbox-refresh"
                        aria-label={syncPending ? "Stop sync" : "Sync emails"}
                      >
                        <RefreshCw
                          className={cn("h-3.5 w-3.5", syncPending && "animate-spin")}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-[#18181b] text-xs text-[#f4f4f5]">
                      {syncPending ? "Syncing…" : "Sync emails"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
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
                "bg-transparent hover:bg-[#1e2a4a]/20 dark:hover:bg-[#1e2a4a]/20",
                isResizing && "bg-[#1e2a4a]/30 dark:bg-[#1e2a4a]/30",
              )}
              style={{ touchAction: "none", minHeight: 120 }}
            />

            <main
              className={cn(
                "flex min-w-0 flex-1 flex-col bg-white dark:bg-[#ffffff]",
              )}
              style={{ marginRight: showAIPanel ? effectiveWidth : 0 }}
            >
              <ThreadDisplay threadId={selectedThread} onClose={handleThreadClose} />
            </main>


            <aside
              className={cn(
                "fixed right-0 top-0 z-40 h-screen border-l border-[#e5e7eb] bg-white shadow-[-2px_0_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out dark:border-[#ffffff] dark:bg-[#ffffff] dark:shadow-[-2px_0_8px_rgba(0,0,0,0.3)]",
                showAIPanel ? "translate-x-0" : "translate-x-full",
              )}
              style={{ width: effectiveWidth }}
            >
              <div
                role="separator"
                aria-label="Resize AI Inbox Brain panel"
                onPointerDown={handleAiResizeStart}
                className={cn(
                  "absolute left-0 top-0 z-50 h-full w-[6px] -translate-x-1/2 cursor-col-resize",
                  "bg-transparent hover:bg-[#1e2a4a]/20 dark:hover:bg-[#1e2a4a]/20",
                  isAiResizing && "bg-[#1e2a4a]/30 dark:bg-[#1e2a4a]/30",
                )}
                style={{ touchAction: "none" }}
              />
              <div className="flex h-full flex-col">
                <div
                  className="border-b border-[#e5e7eb] bg-gradient-to-b from-[#ffffff] to-[#ffffff] px-4 py-3 dark:border-[#ffffff] dark:from-[#ffffff] dark:to-[#ffffff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className="-mt-0.5 h-8 w-8 shrink-0 overflow-hidden"
                        style={{
                          borderRadius: 7,
                          border: "1px solid #b88a3f",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(212,169,85,0.32)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/Opus-B.png"
                          alt="Inbox Brain"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 py-0.5">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="truncate text-[14px] font-semibold tracking-tight text-[#111118] dark:text-[#f5ebd9]"
                          >
                            Inbox brain
                          </span>
                          {isDemo && (
                            <span
                              className="rounded px-1.5 py-0.5"
                              style={{
                                background: "rgba(212,169,85,0.14)",
                                color: "#b88a3f",
                                fontFamily:
                                  "var(--font-jetbrains-mono), ui-monospace, monospace",
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                              }}
                            >
                              DEMO
                            </span>
                          )}
                        </div>
                        {!isMobile && (
                          <p
                            className="mt-1 flex items-center gap-1.5 text-[#8a8278] dark:text-[#8a8278]"
                            style={{
                              fontFamily:
                                "var(--font-jetbrains-mono), ui-monospace, monospace",
                              fontSize: 9.5,
                              letterSpacing: "0.06em",
                              fontWeight: 600,
                            }}
                          >
                            <kbd
                              className="rounded px-1 py-px"
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                boxShadow: "inset 0 -1px 0 #e5e7eb",
                                color: "#1a1612",
                                fontSize: 9,
                                letterSpacing: "0.04em",
                              }}
                            >
                              {isMacOS ? "⌘↵" : "Ctrl+Enter"}
                            </kbd>
                            SEND
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isMobile && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setHelpOpen(true);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f3f4f6] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.04]"
                              aria-label="Keyboard shortcuts"
                            >
                              <CircleHelp className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[260px]">
                            <p>All mail &amp; Inbox brain shortcuts</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowAIPanel((prev) => {
                                if (!prev) {
                                  trackInboxBrainEvent(
                                    "inbox_brain_panel_opened",
                                    { source: "toolbar_new_chat" },
                                  );
                                }
                                return true;
                              });
                              setAiSearchResetKey((k) => k + 1);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f3f4f6] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.04]"
                            aria-label="New chat (AI Inbox Brain)"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>New chat (Inbox brain)</p>
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
                  {(accountId || isDemo) && (
                    <div className="mt-3">
                      <AutopilotSection accountId={isDemo ? DEMO_ACCOUNT_ID : accountId} isDemo={isDemo} />
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <EmailSearchAssistant
                    isCollapsed={false}
                    resetTrigger={aiSearchResetKey}
                    onOpenThread={handleThreadSelect}
                  />
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

      <RequestAccessDialog
        open={requestAccessOpen}
        onOpenChange={setRequestAccessOpen}
      />
    </TooltipProvider>
  );
}

export default Mail;
