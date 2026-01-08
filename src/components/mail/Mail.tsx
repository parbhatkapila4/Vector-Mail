"use client";

import React, { useState, useCallback } from "react";
import {
  Menu,
  ArrowLeft,
  Search,
  Inbox,
  Send,
  Bot,
  X,
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
import { AccountSwitcher } from "./AccountSwitcher";
import { ThreadList } from "./threads-ui/ThreadList";
import { ThreadDisplay } from "./threads-ui/ThreadDisplay";
import EmailSearchAssistant from "../global/AskAi";
import SearchBar from "./search/SearchBar";
import ComposeEmailGmail from "./ComposeEmailGmail";
import { UserButton } from "@clerk/nextjs";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface MailLayoutProps {
  defaultLayout?: number[] | readonly number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}

export function Mail({}: MailLayoutProps) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tab, setTab] = useLocalStorage("vector-mail", "inbox");
  const isMobile = useIsMobile();
  const router = useRouter();

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
    { enabled: isEnabled && !!accountId && accountId.length > 0 },
  );

  const { data: sentCount } = api.account.getNumThreads.useQuery(
    { accountId: accountId || "placeholder", tab: "sent" },
    { enabled: isEnabled && !!accountId && accountId.length > 0 },
  );

  const handleThreadSelect = useCallback((threadId: string) => {
    setSelectedThread(threadId);
  }, []);

  const handleThreadClose = useCallback(() => {
    setSelectedThread(null);
  }, []);

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
  ];

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full w-full flex-col bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black">
          <div className="flex items-center justify-between border-b border-neutral-200/80 bg-white/60 px-4 py-3 backdrop-blur-xl dark:border-neutral-800/50 dark:bg-black/60">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] border-neutral-200 bg-white p-0 dark:border-neutral-800 dark:bg-black"
              >
                <MobileSidebar
                  navItems={navItems}
                  tab={tab}
                  setTab={setTab}
                  router={router}
                  onBackToInbox={() => {
                    handleThreadClose();
                    setSheetOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>

            <h1 className="text-base font-semibold capitalize text-neutral-900 dark:text-neutral-100">
              {tab}
            </h1>

            <div className="flex items-center gap-2">
              <ComposeEmailGmail />
              <UserButton />
            </div>
          </div>

          {!selectedThread ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <SearchBar />
              <ThreadList onThreadSelect={handleThreadSelect} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-black">
              <ThreadDisplay threadId={selectedThread} />
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full w-full flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-neutral-200/50 bg-white/40 px-8 backdrop-blur-2xl dark:border-neutral-800/30 dark:bg-black/40">
          <div className="flex items-center gap-10">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 shadow-lg shadow-orange-500/20 ring-1 ring-orange-500/20 transition-transform group-hover:scale-105">
                <video
                  src="/Vectormail-logo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full scale-[1.6] object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold leading-none tracking-tight text-neutral-900 dark:text-white">
                  VectorMail
                </span>
                <span className="mt-0.5 text-[10px] leading-none text-neutral-500 dark:text-neutral-400">
                  AI Email
                </span>
              </div>
            </Link>

            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl px-5 py-2 text-[13px] font-semibold transition-all duration-200",
                    tab === item.id
                      ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 shadow-sm shadow-orange-500/5 dark:from-orange-950/30 dark:to-amber-950/30 dark:text-orange-400"
                      : "text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-neutral-200",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none",
                        tab === item.id
                          ? "bg-orange-500 text-white dark:bg-orange-400 dark:text-orange-950"
                          : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
                      )}
                    >
                      {item.count > 99 ? "99+" : item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => router.push("/buddy?fresh=true")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
                >
                  <Bot className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-neutral-900 text-xs text-white"
              >
                AI Buddy
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                    showAIPanel
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200",
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-neutral-900 text-xs text-white"
              >
                AI Search
              </TooltipContent>
            </Tooltip>

            <ComposeEmailGmail />

            <div className="mx-1 h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

            <UserButton />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside
            className={cn(
              "flex flex-col border-r border-neutral-200/50 bg-white/60 backdrop-blur-xl transition-all duration-300 ease-out dark:border-neutral-800/30 dark:bg-black/60",
              selectedThread ? "w-[360px]" : "w-[420px]",
            )}
          >
            <div className="border-b border-neutral-200/50 px-6 py-4 dark:border-neutral-800/30">
              <SearchBar />
            </div>
            <div className="flex-1 overflow-hidden">
              <ThreadList onThreadSelect={handleThreadSelect} />
            </div>
          </aside>

          <main
            className={cn(
              "flex flex-1 flex-col bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 ease-out dark:from-neutral-950 dark:to-black",
              showAIPanel && "mr-[360px]",
            )}
          >
            <ThreadDisplay threadId={selectedThread} />
          </main>

          <aside
            className={cn(
              "fixed right-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-[360px] border-l border-neutral-200/50 bg-white/80 shadow-[-8px_0_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-transform duration-300 ease-out dark:border-neutral-800/30 dark:bg-black/80 dark:shadow-[-8px_0_32px_rgba(0,0,0,0.4)]",
              showAIPanel ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-neutral-200/50 px-6 py-4 dark:border-neutral-800/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[14px] font-bold text-neutral-900 dark:text-white">
                    AI Search
                  </span>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
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
  onBackToInbox,
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
  onBackToInbox?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-black">
      <Link
        href="/"
        className="flex items-center gap-3 border-b border-neutral-200 p-5 dark:border-neutral-800"
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 shadow-lg shadow-orange-500/20 ring-1 ring-orange-500/20">
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
          <h2 className="text-[17px] font-bold tracking-tight text-neutral-900 dark:text-white">
            VectorMail
          </h2>
          <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">
            AI-Powered Email
          </p>
        </div>
      </Link>

      <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
        <div className="md:hidden">
          <Button
            onClick={() => {
              onBackToInbox?.();
              setTab("inbox");
            }}
            variant="ghost"
            className="w-full justify-start gap-3 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[14px] font-semibold">Back to Inbox</span>
          </Button>
        </div>

        <div className="hidden md:block">
          <AccountSwitcher isCollapsed={false} />
        </div>
      </div>

      <div className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
              tab === item.id
                ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 shadow-sm dark:from-orange-950/30 dark:to-amber-950/30 dark:text-orange-400"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1 text-left text-[14px] font-semibold">
              {item.label}
            </span>
            {item.count !== undefined && item.count > 0 && (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-bold",
                  tab === item.id
                    ? "bg-orange-500 text-white dark:bg-orange-400 dark:text-orange-950"
                    : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
                )}
              >
                {item.count > 99 ? "99+" : item.count}
              </span>
            )}
          </button>
        ))}

        <div className="my-3 h-px bg-neutral-200 dark:bg-neutral-800" />

        <button
          onClick={() => router.push("/buddy?fresh=true")}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-neutral-600 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
        >
          <Bot className="h-4 w-4" />
          <span className="flex-1 text-left text-[14px] font-semibold">
            AI Buddy
          </span>
        </button>
      </div>
    </div>
  );
}
