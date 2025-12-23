"use client";

import React, { useState, useCallback } from "react";
import { Menu, ArrowLeft, Search, Inbox, Send, Bot } from "lucide-react";
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
  const [tab, setTab] = useLocalStorage("vector-mail", "inbox");
  const isMobile = useIsMobile();
  const router = useRouter();

  const { data: accounts } = api.account.getAccounts.useQuery();
  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";

  const { data: myAccount } = api.account.getMyAccount.useQuery(
    { accountId: firstAccountId },
    { enabled: !!firstAccountId },
  );

  const accountId = myAccount?.id ?? "";
  const isEnabled = !!accountId;

  const { data: inboxCount } = api.account.getNumThreads.useQuery(
    { accountId, tab: "inbox" },
    { enabled: isEnabled },
  );

  const { data: sentCount } = api.account.getNumThreads.useQuery(
    { accountId, tab: "sent" },
    { enabled: isEnabled },
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
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "sent",
      icon: Send,
      label: "Sent",
      count: sentCount,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
  ];

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full w-full flex-col bg-[#030303]">
          <div className="flex items-center justify-between border-b border-white/[0.04] bg-[#030303] px-4 py-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06]"
                >
                  <Menu className="h-5 w-5 text-zinc-400" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] border-white/[0.04] bg-[#030303] p-0"
              >
                <MobileSidebar
                  navItems={navItems}
                  tab={tab}
                  setTab={setTab}
                  router={router}
                />
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold capitalize text-white">
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
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleThreadClose}
                  className="h-9 w-9 rounded-xl bg-white/[0.03]"
                >
                  <ArrowLeft className="h-4 w-4 text-zinc-400" />
                </Button>
                <span className="text-sm font-medium text-white">
                  Back to {tab}
                </span>
              </div>
              <ThreadDisplay threadId={selectedThread} />
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full w-full bg-[#030303]">
        <div className="flex w-[72px] flex-col items-center border-r border-white/[0.04] bg-[#030303] py-4">
          <Link
            href="/"
            className="mb-6 flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 transition-all hover:shadow-xl hover:shadow-amber-500/30"
          >
            <video
              src="/Vectormail-logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full scale-[1.6] object-cover"
            />
          </Link>

          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                      tab === item.id
                        ? "bg-white/[0.08] shadow-lg"
                        : "hover:bg-white/[0.04]",
                    )}
                  >
                    {tab === item.id && (
                      <div className="absolute -left-1 h-6 w-1 rounded-full bg-amber-500" />
                    )}
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        tab === item.id ? item.color : "text-zinc-500",
                      )}
                    />
                    {item.count && item.count > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black">
                        {item.count > 99 ? "99+" : item.count}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="border-white/[0.08] bg-[#1A1A1A] text-white"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}

            <div className="my-2 h-px w-8 bg-white/[0.06]" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => router.push("/buddy?fresh=true")}
                  className="group flex h-11 w-11 items-center justify-center rounded-2xl transition-all hover:bg-white/[0.04]"
                >
                  <Bot className="h-5 w-5 text-violet-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="border-white/[0.08] bg-[#1A1A1A] text-white"
              >
                AI Buddy
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={cn(
                    "group flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                    showAIPanel ? "bg-amber-500/10" : "hover:bg-white/[0.04]",
                  )}
                >
                  <Search
                    className={cn(
                      "h-5 w-5",
                      showAIPanel ? "text-amber-400" : "text-zinc-500",
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="border-white/[0.08] bg-[#1A1A1A] text-white"
              >
                AI Search
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-auto flex flex-col items-center gap-2">
            <UserButton />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div
            className={cn(
              "flex flex-col border-r border-white/[0.04] bg-[#030303] transition-all duration-300",
              selectedThread ? "w-[340px]" : "w-[420px]",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold capitalize text-white">
                  {tab}
                </h1>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                  {tab === "inbox" ? inboxCount || 0 : sentCount || 0} emails
                </span>
              </div>
              <ComposeEmailGmail />
            </div>

            <SearchBar />

            <div className="flex-1 overflow-hidden">
              <ThreadList onThreadSelect={handleThreadSelect} />
            </div>
          </div>

          <div
            className={cn(
              "flex flex-1 flex-col bg-[#0A0A0A] transition-all duration-300",
              showAIPanel ? "mr-[320px]" : "",
            )}
          >
            <ThreadDisplay threadId={selectedThread} />
          </div>

          <div
            className={cn(
              "fixed right-0 top-0 h-full w-[320px] transform border-l border-white/[0.04] bg-[#030303] transition-transform duration-300 ease-out",
              showAIPanel ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    AI Search
                  </span>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/[0.06]"
                >
                  <ArrowLeft className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
              <EmailSearchAssistant isCollapsed={false} />
            </div>
          </div>
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
}: {
  navItems: Array<{
    id: string;
    icon: React.ElementType;
    label: string;
    count?: number;
    color: string;
    bgColor: string;
  }>;
  tab: string;
  setTab: (tab: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        className="flex items-center gap-3 border-b border-white/[0.04] p-4 transition-all hover:bg-white/[0.02]"
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
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
          <h2 className="text-sm font-semibold text-white">VectorMail</h2>
          <p className="text-xs text-zinc-500">AI-Powered Email</p>
        </div>
      </Link>

      <div className="border-b border-white/[0.04] p-4">
        <AccountSwitcher isCollapsed={false} />
      </div>

      <div className="flex-1 p-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                tab === item.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  item.bgColor,
                )}
              >
                <item.icon className={cn("h-5 w-5", item.color)} />
              </div>
              <span
                className={cn(
                  "flex-1 text-left text-sm font-medium",
                  tab === item.id ? "text-white" : "text-zinc-400",
                )}
              >
                {item.label}
              </span>
              {item.count !== undefined && (
                <span className="text-xs font-medium text-zinc-500">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          <div className="my-3 h-px bg-white/[0.04]" />

          <button
            onClick={() => router.push("/buddy?fresh=true")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/[0.03]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Bot className="h-5 w-5 text-violet-400" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-zinc-400">
              AI Buddy
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
