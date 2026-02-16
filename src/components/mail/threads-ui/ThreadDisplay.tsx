import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, type RouterOutputs } from "@/trpc/react";
import { format } from "date-fns";
import EmailDisplay from "./EmailDisplay";
import useThreads from "@/hooks/use-threads";
import { useAtom } from "jotai";
import { isSearchingAtom } from "../search/SearchBar";
import ReplyBox from "./ReplyBox";
import { Mail, Forward, Reply, X, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ForwardEmailDialog } from "./ForwardEmailDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SnoozeMenu } from "./SnoozeMenu";
import { RemindMenu } from "./RemindMenu";
import { useLocalStorage } from "usehooks-ts";
import { ThreadViewSkeleton } from "./ThreadViewSkeleton";

type Email = RouterOutputs["account"]["getThreads"]["threads"][0]["emails"][0];
type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];

interface ThreadDisplayProps {
  threadId?: string | null;
}

export function ThreadDisplay({ threadId: propThreadId }: ThreadDisplayProps) {
  const { threads: rawThreads, threadId: hookThreadId, accountId } = useThreads();
  const threadId = propThreadId ?? hookThreadId;
  const threads = rawThreads as Thread[] | undefined;
  const _thread = threads?.find((t: Thread) => t.id === threadId);
  const [isSearching] = useAtom(isSearchingAtom);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const [currentTab] = useLocalStorage("vector-mail", "inbox");
  const showSnooze =
    threadId &&
    accountId &&
    (currentTab === "inbox" || currentTab === "snoozed");
  const showRemind =
    threadId &&
    accountId &&
    (currentTab === "inbox" ||
      currentTab === "snoozed" ||
      currentTab === "reminders");

  const { data: foundThread, isFetching: isLoadingThread } = api.account.getThreadById.useQuery(
    { threadId: threadId ?? "" },
    {
      enabled: !!!_thread && !!threadId && threadId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const thread = (_thread ?? foundThread) as Thread | undefined;

  if (isSearching) return null;

  if (threadId && !_thread && isLoadingThread) {
    return <ThreadViewSkeleton />;
  }

  if (!thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#fafafa] p-10 dark:bg-[#0a0a0a]">
        <div className="relative mb-7">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#e0e0e0] bg-[#ffffff] shadow-sm dark:border-[#1f1f1f] dark:bg-[#111111]">
            <Mail className="h-10 w-10 text-[#d0d0d0] dark:text-[#4a4a4a]" />
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold tracking-tight text-[#1a1a1a] dark:text-[#ffffff]">
          Select an email
        </h3>
        <p className="max-w-sm text-center text-[14px] leading-relaxed text-[#666666] dark:text-[#999999]">
          Choose a conversation from the list to view its contents
        </p>
      </div>
    );
  }

  const firstEmail = thread.emails[0];
  const senderName = firstEmail?.from?.name ?? "Unknown";
  const senderEmail = firstEmail?.from?.address ?? "";
  const originalSubject = firstEmail?.subject || "(No subject)";
  const originalBody = firstEmail?.body || firstEmail?.bodySnippet || "";
  const originalFrom = `${senderName} <${senderEmail}>`;
  const originalDate = firstEmail?.sentAt
    ? format(new Date(firstEmail.sentAt), "MMM d, yyyy 'at' h:mm a")
    : "";

  const getPlainTextBody = (htmlBody: string) => {
    if (!htmlBody) return "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlBody;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const plainTextBody = getPlainTextBody(originalBody);

  return (
    <>
      <ForwardEmailDialog
        open={forwardDialogOpen}
        onOpenChange={setForwardDialogOpen}
        originalSubject={originalSubject}
        originalBody={plainTextBody}
        originalFrom={originalFrom}
        originalDate={originalDate}
      />
      <div className="flex h-full flex-col bg-[#ffffff] dark:bg-[#111111]">

        <div className="border-b border-[#e0e0e0] bg-[#ffffff] dark:border-[#1f1f1f] dark:bg-[#111111]">
          <div className="hidden items-center justify-end gap-2 px-4 py-3 md:flex md:px-6">
            {showSnooze && (
              <SnoozeMenu
                threadId={threadId}
                accountId={accountId}
                isSnoozedTab={currentTab === "snoozed"}
              >
                <button
                  type="button"
                  className="flex h-8 items-center gap-2 rounded-lg px-3.5 text-[12px] font-medium text-[#666666] transition-colors hover:bg-[#f5f5f5] dark:text-[#999999] dark:hover:bg-[#1a1a1a]"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Snooze
                </button>
              </SnoozeMenu>
            )}
            {showRemind && (
              <RemindMenu
                threadId={threadId}
                accountId={accountId}
                isRemindersTab={currentTab === "reminders"}
              >
                <button
                  type="button"
                  className="flex h-8 items-center gap-2 rounded-lg px-3.5 text-[12px] font-medium text-[#666666] transition-colors hover:bg-[#f5f5f5] dark:text-[#999999] dark:hover:bg-[#1a1a1a]"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Remind me
                </button>
              </RemindMenu>
            )}
            <button
              onClick={() => setForwardDialogOpen(true)}
              className="flex h-8 items-center gap-2 rounded-lg px-3.5 text-[12px] font-medium text-[#666666] transition-colors hover:bg-[#f5f5f5] dark:text-[#999999] dark:hover:bg-[#1a1a1a]"
            >
              <Forward className="h-3.5 w-3.5" />
              Forward
            </button>
          </div>

          <div className="px-4 pb-6 pt-4 md:px-6 md:pt-0">
            <h1 className="mb-6 text-[18px] font-semibold leading-tight tracking-tight text-[#1a1a1a] dark:text-[#ffffff] md:text-[22px]">
              {firstEmail?.subject || "(No subject)"}
            </h1>

            <div className="flex items-center gap-4">
              <Avatar className="h-11 w-11 border border-[#e0e0e0] dark:border-[#1f1f1f]">
                <AvatarImage alt={senderName} />
                <AvatarFallback className="bg-gradient-to-br from-[#ca8a04] to-[#eab308] text-[14px] font-semibold text-white">
                  {senderName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-[14px] font-semibold text-[#1a1a1a] dark:text-[#ffffff]">
                    {senderName}
                  </span>
                  <span className="text-[13px] text-[#666666] dark:text-[#999999]">
                    &lt;{senderEmail}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#666666] dark:text-[#999999]">
                  <span className="font-medium">to me</span>
                  {firstEmail?.sentAt && (
                    <>
                      <span>•</span>
                      <span className="font-medium">
                        {format(
                          new Date(firstEmail.sentAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth pb-20 md:pb-0">
          <div className="px-6 py-8 md:px-6 md:py-8">
            {thread.emails.length > 1 && (
              <div className="mb-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#e0e0e0] dark:bg-[#1f1f1f]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#999999] dark:text-[#666666]">
                  {thread.emails.length} messages in thread
                </span>
                <div className="h-px flex-1 bg-[#e0e0e0] dark:bg-[#1f1f1f]" />
              </div>
            )}

            <div className="space-y-10">
              {thread.emails.map((email: Email, index: number) => (
                <div
                  key={email.id}
                  className={cn(
                    index > 0 &&
                    "border-t border-[#e0e0e0] pt-10 dark:border-[#1f1f1f]",
                  )}
                >
                  {index > 0 && (
                    <div className="mb-6 flex items-center gap-4">
                      <Avatar className="h-9 w-9 border border-[#e0e0e0] dark:border-[#1f1f1f]">
                        <AvatarFallback className="bg-[#f5f5f5] text-[13px] font-semibold text-[#666666] dark:bg-[#1a1a1a] dark:text-[#999999]">
                          {(email.from?.name ?? "U")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="text-[14px] font-semibold text-[#1a1a1a] dark:text-[#ffffff]">
                          {email.from?.name ?? "Unknown"}
                        </span>
                        {email.sentAt && (
                          <span className="ml-3 text-[12px] font-medium text-[#666666] dark:text-[#999999]">
                            {format(
                              new Date(email.sentAt),
                              "MMM d 'at' h:mm a",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <EmailDisplay email={email} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <ReplyBox />
        </div>

        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 border-t border-white/[0.06] bg-[#0A0A0A] px-4 py-3 shadow-2xl shadow-black/50 md:hidden">
            <Button
              onClick={() => setReplyDialogOpen(true)}
              className="flex-1 bg-gradient-to-r from-yellow-700 via-yellow-500 to-amber-400 text-white hover:from-yellow-700 hover:via-yellow-700 hover:to-amber-600"
            >
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </Button>
            <Button
              onClick={() => setForwardDialogOpen(true)}
              variant="outline"
              className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Forward className="mr-2 h-4 w-4" />
              Forward
            </Button>
          </div>
        )}

        {isMobile && replyDialogOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-[#0A0A0A] md:hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Reply className="h-4 w-4 text-yellow-500" />
                </div>
                <h2 className="text-lg font-semibold text-white">Reply</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyDialogOpen(false)}
                className="h-8 w-8 rounded-lg p-0 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden pb-0">
              <ReplyBox
                onSendSuccess={() => setReplyDialogOpen(false)}
                isInMobileDialog={true}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
