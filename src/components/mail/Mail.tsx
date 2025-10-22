"use client"

import { useState, useCallback, useMemo } from "react"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { useLocalStorage } from "usehooks-ts"
import { useIsMobile } from "@/hooks/use-mobile"
import { AccountSwitcher } from "./AccountSwitcher"
import SideBar from "./Sidebar"
import { ThreadList } from "./threads-ui/ThreadList"
import { ThreadDisplay } from "./threads-ui/ThreadDisplay"
import EmailSearchAssistant from "../global/AskAi"

interface MailLayoutProps {
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

type TabValue = 'inbox' | 'important' | 'unread'

interface TabState {
  important: boolean
  unread: boolean
}

const DEFAULT_LAYOUT = [20, 32, 48] as const
const MOBILE_SHEET_WIDTH = 320

export function Mail({
  defaultLayout = DEFAULT_LAYOUT,
  defaultCollapsed = false,
  navCollapsedSize,
}: MailLayoutProps) {
  const [important, setImportant] = useLocalStorage('vector-mail-important', false)
  const [unread, setUnread] = useLocalStorage('vector-mail-unread', false)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  
  const isMobile = useIsMobile()

  const currentTab = useMemo((): TabValue => {
    if (important) return 'important'
    if (unread) return 'unread'
    return 'inbox'
  }, [important, unread])

  const handleTabChange = useCallback((tab: string) => {
    const tabState: TabState = {
      important: tab === 'important',
      unread: tab === 'unread',
    }
    
    setImportant(tabState.important)
    setUnread(tabState.unread)
  }, [setImportant, setUnread])

  const handleThreadSelect = useCallback((threadId: string) => {
    setSelectedThread(threadId)
  }, [])

  const handleThreadClose = useCallback(() => {
    setSelectedThread(null)
  }, [])

  const handlePanelCollapse = useCallback(() => {
    setIsCollapsed(true)
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`
  }, [])

  const handlePanelResize = useCallback(() => {
    setIsCollapsed(false)
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`
  }, [])

  const handleLayoutChange = useCallback((sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`
  }, [])

  const SidebarContent = useCallback(() => (
    <div className="flex flex-col h-full flex-1">
      <div
        className={cn(
          "flex h-[52px] items-center justify-center",
          isCollapsed ? "h-[52px]" : "px-2"
        )}
      >
        <AccountSwitcher isCollapsed={isCollapsed} />
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        <SideBar isCollapsed={isCollapsed} />
      </div>
      <div className="mt-auto pb-20">
        <EmailSearchAssistant isCollapsed={isCollapsed} />
      </div>
    </div>
  ), [isCollapsed])

  const MobileHeader = useCallback(() => (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className={`w-${MOBILE_SHEET_WIDTH} p-0`}>
          <div className="flex flex-col h-full">
            <div className="flex h-[52px] items-center justify-center px-4">
              <AccountSwitcher isCollapsed={false} />
            </div>
            <Separator />
            <div className="flex-1 overflow-y-auto">
              <SideBar isCollapsed={false} />
            </div>
            <div className="mt-auto">
              <EmailSearchAssistant isCollapsed={false} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <h1 className="text-xl font-bold">Inbox</h1>
      <div className="w-10" />
    </div>
  ), [])

  const DesktopHeader = useCallback(() => (
    <div className="flex items-center px-4 py-2">
      <h1 className="text-xl font-bold">Inbox</h1>
      <TabsList className="ml-auto">
        <TabsTrigger
          value="inbox"
          className="text-zinc-600 dark:text-zinc-200"
        >
          Inbox
        </TabsTrigger>
        <TabsTrigger
          value="important"
          className="text-zinc-600 dark:text-zinc-200"
        >
          Important
        </TabsTrigger>
        <TabsTrigger
          value="unread"
          className="text-zinc-600 dark:text-zinc-200"
        >
          Unread
        </TabsTrigger>
      </TabsList>
    </div>
  ), [])

  const MobileTabs = useCallback(() => (
    <Tabs 
      defaultValue="inbox" 
      value={currentTab} 
      onValueChange={handleTabChange}
    >
      <div className="flex items-center px-4 py-2">
        <TabsList className="w-full">
          <TabsTrigger
            value="inbox"
            className="text-zinc-600 dark:text-zinc-200 flex-1"
          >
            Inbox
          </TabsTrigger>
          <TabsTrigger
            value="important"
            className="text-zinc-600 dark:text-zinc-200 flex-1"
          >
            Important
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="text-zinc-600 dark:text-zinc-200 flex-1"
          >
            Unread
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="inbox" className="m-0 h-[calc(100vh-120px)]">
        <ThreadList onThreadSelect={handleThreadSelect} />
      </TabsContent>
      <TabsContent value="important" className="m-0 h-[calc(100vh-120px)]">
        <ThreadList onThreadSelect={handleThreadSelect} />
      </TabsContent>
      <TabsContent value="unread" className="m-0 h-[calc(100vh-120px)]">
        <ThreadList onThreadSelect={handleThreadSelect} />
      </TabsContent>
    </Tabs>
  ), [currentTab, handleTabChange, handleThreadSelect])

  const DesktopTabs = useCallback(() => (
    <Tabs 
      defaultValue="inbox" 
      value={currentTab} 
      onValueChange={handleTabChange}
    >
      <DesktopHeader />
      <Separator />
      <TabsContent value="inbox" className="m-0">
        <ThreadList onThreadSelect={handleThreadSelect} />
      </TabsContent>
      <TabsContent value="important" className="m-0">
        <ThreadList onThreadSelect={handleThreadSelect} />
      </TabsContent>
      <TabsContent value="unread" className="m-0">
        <ThreadList onThreadSelect={handleThreadSelect} />
      </TabsContent>
    </Tabs>
  ), [currentTab, handleTabChange, handleThreadSelect])

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
              <div className="flex items-center px-4 py-2 border-b">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleThreadClose}
                >
                  ←
                </Button>
                <h1 className="text-xl font-bold ml-2">Email</h1>
              </div>
              <div className="h-[calc(100vh-80px)]">
                <ThreadDisplay threadId={selectedThread} />
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handleLayoutChange}
        className="items-stretch h-full min-h-screen"
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
            "min-w-[50px] transition-all duration-300 ease-in-out"
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
  )
}