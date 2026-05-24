"use client";

import Link from "next/link";
import {
  Bot,
  Search,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AccountSwitcher } from "./AccountSwitcher";

interface MobileSidebarProps {
  navItems: Array<{
    id: string;
    icon: React.ElementType;
    label: string;
  }>;
  tab: string;
  setTab: (tab: string) => void;
  router: ReturnType<typeof useRouter>;
  onNavigate?: (newTab: string, isBuddy?: boolean) => void;
}

export function MobileSidebar({
  navItems,
  tab,
  setTab,
  onNavigate,
}: MobileSidebarProps) {
  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-[#202124]">
      <Link
        href="/"
        prefetch
        className="flex w-full items-center gap-3 border-b border-[#dadce0] p-4 transition-opacity hover:opacity-90 active:opacity-95 dark:border-[#3c4043]"
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#1a73e8] dark:bg-[#1e2a4a]">
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
          <p
            className="mt-0.5 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]"
            style={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontStyle: "italic",
              letterSpacing: "-0.005em",
            }}
          >
            The inbox, rewritten.
          </p>
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
                ? "bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#174ea6]/30 dark:text-[#1e2a4a]"
                : "text-[#202124] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#303134]",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
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
        <div className="flex w-full flex-col justify-between rounded-lg border border-[#dadce0] bg-[#f8f9fa] p-4 text-left dark:border-[#3c4043] dark:bg-[#292a2d]">
          <div className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a73e8] dark:bg-[#1e2a4a]">
                <Zap className="h-4 w-4 text-white dark:text-[#202124]" />
              </div>
              <Search className="h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6]" />
            </div>
            <h3 className="mb-2 text-[14px] font-semibold tracking-tight text-[#202124] dark:text-[#e8eaed]">
              AI Inbox Brain
            </h3>
            <p className="text-[13px] leading-relaxed text-[#5f6368] dark:text-[#9aa0a6]">
              Ask in plain English. Get structured answers and the threads
              behind them. Best on desktop.
            </p>
          </div>
          <div className="mt-4 text-[13px] font-medium text-[#1a73e8] dark:text-[#1e2a4a]">
            Try on desktop
          </div>
        </div>
      </div>
    </div>
  );
}
