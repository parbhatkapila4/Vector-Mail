"use client"

import * as React from "react"

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
import { useLocalStorage } from "usehooks-ts"
import { AccountSwitcher } from "./AccountSwitcher"
import SideBar from "./Sidebar"
import { ThreadList } from "./threads-ui/ThreadList"
import { ThreadDisplay } from "./threads-ui/ThreadDisplay"
import AskAI from "../global/AskAi"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

interface MailProps {
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

export function Mail({
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [important, setImportant] = useLocalStorage('vector-mail-important', false)
  const [unread, setUnread] = useLocalStorage('vector-mail-unread', false)
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [selectedThread, setSelectedThread] = React.useState<string | null>(null)
  const isMobile = useIsMobile()

  const SidebarContent = () => (
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
      <div className="mt-auto">
        <AskAI isCollapsed={isCollapsed} />
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="h-full w-full">
          {!selectedThread ? (
            <div className="h-full">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="flex flex-col h-full">
                      <div className="flex h-[52px] items-center justify-center px-4">
                        <AccountSwitcher isCollapsed={false} />
                      </div>
                      <Separator />
                      <div className="flex-1 overflow-y-auto">
                        <SideBar isCollapsed={false} />
                      </div>
                      <div className="mt-auto">
                        <AskAI isCollapsed={false} />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <h1 className="text-xl font-bold">Inbox</h1>
                <div className="w-10" />
              </div>
              <Tabs defaultValue="inbox" value={important ? 'important' : unread ? 'unread' : 'inbox'} onValueChange={tab => {
                if (tab === 'important') {
                  setImportant(true)
                  setUnread(false)
                } else if (tab === 'unread') {
                  setImportant(false)
                  setUnread(true)
                } else {
                  setImportant(false)
                  setUnread(false)
                }
              }}>
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
                  <ThreadList onThreadSelect={setSelectedThread} />
                </TabsContent>
                <TabsContent value="important" className="m-0 h-[calc(100vh-120px)]">
                  <ThreadList onThreadSelect={setSelectedThread} />
                </TabsContent>
                <TabsContent value="unread" className="m-0 h-[calc(100vh-120px)]">
                  <ThreadList onThreadSelect={setSelectedThread} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full">
              <div className="flex items-center px-4 py-2 border-b">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedThread(null)}
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
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes
          )}`
        }}
        className="items-stretch h-full min-h-screen"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`
          }}
          onResize={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`
          }}
          className={cn(
            isCollapsed &&
            "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <SidebarContent />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="inbox" value={important ? 'important' : unread ? 'unread' : 'inbox'} onValueChange={tab => {
            if (tab === 'important') {
              setImportant(true)
              setUnread(false)
            } else if (tab === 'unread') {
              setImportant(false)
              setUnread(true)
            } else {
              setImportant(false)
              setUnread(false)
            }
          }}>
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
            <Separator />
            <TabsContent value="inbox" className="m-0">
              <ThreadList onThreadSelect={setSelectedThread} />
            </TabsContent>
            <TabsContent value="important" className="m-0">
              <ThreadList onThreadSelect={setSelectedThread} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <ThreadList onThreadSelect={setSelectedThread} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <ThreadDisplay threadId={selectedThread} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}