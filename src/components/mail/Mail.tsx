"use client";

import { useState, useCallback } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccountSwitcher } from "./AccountSwitcher";
import SideBar from "./Sidebar";
import { ThreadList } from "./threads-ui/ThreadList";
import { ThreadDisplay } from "./threads-ui/ThreadDisplay";
import EmailSearchAssistant from "../global/AskAi";
import SearchBar from "./search/SearchBar";
import ComposeEmailGmail from "./ComposeEmailGmail";
import { UserButton } from "@clerk/nextjs";

interface MailLayoutProps {
  defaultLayout: number[] | readonly number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

const DEFAULT_LAYOUT = [20, 32, 48] as const;
const MOBILE_SHEET_WIDTH = 320;

export function Mail({
  defaultLayout = DEFAULT_LAYOUT,
  defaultCollapsed = false,
  navCollapsedSize,
}: MailLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  const isMobile = useIsMobile();

  const handleThreadSelect = useCallback((threadId: string) => {
    setSelectedThread(threadId);
  }, []);

  const handleThreadClose = useCallback(() => {
    setSelectedThread(null);
  }, []);

  const handlePanelCollapse = useCallback(() => {
    setIsCollapsed(true);
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
  }, []);

  const handlePanelResize = useCallback(() => {
    setIsCollapsed(false);
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
  }, []);

  const handleLayoutChange = useCallback((sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`;
  }, []);

  const SidebarContent = useCallback(
    () => (
      <div className="flex h-full flex-1 flex-col bg-slate-900/30 border-r border-slate-800">
        <div
          className={cn(
            "flex h-[52px] items-center justify-center border-b border-slate-800 bg-slate-900/50",
            isCollapsed ? "h-[52px]" : "px-2",
          )}
        >
          <AccountSwitcher isCollapsed={isCollapsed} />
        </div>
        <Separator className="bg-slate-800" />
        <div className="shrink-0">
          <SideBar isCollapsed={isCollapsed} />
        </div>
        <Separator className="bg-slate-800" />
        <div className="min-h-0 flex-1 pb-4">
          <EmailSearchAssistant isCollapsed={isCollapsed} />
        </div>
      </div>
    ),
    [isCollapsed],
  );

  const MobileHeader = useCallback(
    () => (
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0a0a0a] px-4 py-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={`w-${MOBILE_SHEET_WIDTH} bg-[#0a0a0a] border-slate-800 p-0`}>
            <div className="flex h-full flex-col">
              <div className="flex h-[52px] items-center justify-center border-b border-slate-800 bg-slate-900/50 px-4">
                <AccountSwitcher isCollapsed={false} />
              </div>
              <Separator className="bg-slate-800" />
              <div className="shrink-0">
                <SideBar isCollapsed={false} />
              </div>
              <Separator className="bg-slate-800" />
              <div className="min-h-0 flex-1 pb-4">
                <EmailSearchAssistant isCollapsed={false} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold text-white">Inbox</h1>
        <div className="flex items-center gap-2">
          <ComposeEmailGmail />
          <UserButton />
        </div>
      </div>
    ),
    [],
  );

  const DesktopHeader = useCallback(
    () => (
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0a0a0a] px-4 py-2">
        <h1 className="text-xl font-bold text-white">Inbox</h1>
        <div className="flex items-center gap-2">
          <ComposeEmailGmail />
          <UserButton />
        </div>
      </div>
    ),
    [],
  );

  const MobileTabs = useCallback(
    () => (
      <div className="flex h-[calc(100vh-120px)] flex-col">
        <SearchBar />
        <div className="flex-1 overflow-hidden">
          <ThreadList onThreadSelect={handleThreadSelect} />
        </div>
      </div>
    ),
    [handleThreadSelect],
  );

  const DesktopTabs = useCallback(
    () => (
      <div className="flex h-full flex-col bg-[#0a0a0a]">
        <DesktopHeader />
        <Separator className="bg-slate-800" />
        <SearchBar />
        <div className="flex-1 overflow-hidden">
          <ThreadList onThreadSelect={handleThreadSelect} />
        </div>
      </div>
    ),
    [handleThreadSelect, DesktopHeader],
  );

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="h-full w-full">
          {!selectedThread ? (
            <div className="h-full">
              <MobileHeader />
              <MobileTabs />
            </div>
          ) : (
            <div className="h-full bg-[#0a0a0a]">
              <div className="flex items-center border-b border-slate-800 bg-[#0a0a0a] px-4 py-2">
                <Button variant="ghost" size="icon" onClick={handleThreadClose} className="text-white hover:bg-slate-800">
                  ←
                </Button>
                <h1 className="ml-2 text-xl font-bold text-white">Email</h1>
              </div>
              <div className="h-[calc(100vh-80px)]">
                <ThreadDisplay threadId={selectedThread} />
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handleLayoutChange}
        className="h-full min-h-screen items-stretch bg-[#0a0a0a]"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={handlePanelCollapse}
          onResize={handlePanelResize}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <SidebarContent />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <DesktopTabs />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <ThreadDisplay threadId={selectedThread} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
