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
import ComposeButton from "./ComposeButton";
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
      <div className="flex h-full flex-1 flex-col">
        <div
          className={cn(
            "flex h-[52px] items-center justify-center",
            isCollapsed ? "h-[52px]" : "px-2",
          )}
        >
          <AccountSwitcher isCollapsed={isCollapsed} />
        </div>
        <Separator />
        <div className="shrink-0">
          <SideBar isCollapsed={isCollapsed} />
        </div>
        <Separator />
        <div className="min-h-0 flex-1 pb-4">
          <EmailSearchAssistant isCollapsed={isCollapsed} />
        </div>
      </div>
    ),
    [isCollapsed],
  );

  const MobileHeader = useCallback(
    () => (
      <div className="flex items-center justify-between border-b px-4 py-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={`w-${MOBILE_SHEET_WIDTH} p-0`}>
            <div className="flex h-full flex-col">
              <div className="flex h-[52px] items-center justify-center px-4">
                <AccountSwitcher isCollapsed={false} />
              </div>
              <Separator />
              <div className="shrink-0">
                <SideBar isCollapsed={false} />
              </div>
              <Separator />
              <div className="min-h-0 flex-1 pb-4">
                <EmailSearchAssistant isCollapsed={false} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold">Inbox</h1>
        <div className="flex items-center gap-2">
          <ComposeButton />
          <ComposeEmailGmail />
          <UserButton />
        </div>
      </div>
    ),
    [],
  );

  const DesktopHeader = useCallback(
    () => (
      <div className="flex items-center justify-between px-4 py-2">
        <h1 className="text-xl font-bold">Inbox</h1>
        <div className="flex items-center gap-2">
          <ComposeButton />
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
      <div className="flex h-full flex-col">
        <DesktopHeader />
        <Separator />
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
            <div className="h-full">
              <div className="flex items-center border-b px-4 py-2">
                <Button variant="ghost" size="icon" onClick={handleThreadClose}>
                  ←
                </Button>
                <h1 className="ml-2 text-xl font-bold">Email</h1>
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
        className="h-full min-h-screen items-stretch"
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
