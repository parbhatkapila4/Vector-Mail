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
      <div className="flex h-full flex-col items-center justify-center bg-white p-10 dark:bg-[#202124]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f3f4] dark:bg-[#3c4043]">
          <Mail className="h-8 w-8 text-[#9aa0a6] dark:text-[#5f6368]" />
        </div>
        <h3 className="mb-1.5 text-[22px] font-normal text-[#5f6368] dark:text-[#9aa0a6]">
          Select an email
        </h3>
        <p className="max-w-sm text-center text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">
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
      <div className="flex h-full flex-col bg-white dark:bg-[#202124]">

        <div className="border-b border-[#f1f3f4] bg-white dark:border-[#3c4043] dark:bg-[#202124]">
          <div className="hidden items-center justify-end gap-1 px-4 py-2 md:flex md:px-6">
            {showSnooze && (
              <SnoozeMenu
                threadId={threadId}
                accountId={accountId}
                isSnoozedTab={currentTab === "snoozed"}
              >
                <button
                  type="button"
                  className="flex h-8 items-center gap-2 rounded-full px-3 text-[12px] font-medium text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
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
                  className="flex h-8 items-center gap-2 rounded-full px-3 text-[12px] font-medium text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Remind me
                </button>
              </RemindMenu>
            )}
            <button
              onClick={() => setForwardDialogOpen(true)}
              className="flex h-8 items-center gap-2 rounded-full px-3 text-[12px] font-medium text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
            >
              <Forward className="h-3.5 w-3.5" />
              Forward
            </button>
          </div>

          <div className="px-4 pb-6 pt-4 md:px-6 md:pt-0">
            <h1 className="mb-6 text-[18px] font-normal leading-tight text-[#202124] dark:text-[#e8eaed] md:text-[22px]">
              {firstEmail?.subject || "(No subject)"}
            </h1>

            <div className="flex items-center gap-4">
              <Avatar className="h-11 w-11 border border-[#dadce0] dark:border-[#3c4043]">
                <AvatarImage alt={senderName} />
                <AvatarFallback className="bg-[#1a73e8] text-[14px] font-medium text-white dark:bg-[#8ab4f8] dark:text-[#202124]">
                  {senderName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
                    {senderName}
                  </span>
                  <span className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
                    &lt;{senderEmail}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
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
                <div className="h-px flex-1 bg-[#dadce0] dark:bg-[#3c4043]" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                  {thread.emails.length} messages in thread
                </span>
                <div className="h-px flex-1 bg-[#dadce0] dark:bg-[#3c4043]" />
              </div>
            )}

            <div className="space-y-10">
              {thread.emails.map((email: Email, index: number) => (
                <div
                  key={email.id}
                  className={cn(
                    index > 0 &&
                    "border-t border-[#f1f3f4] pt-10 dark:border-[#3c4043]",
                  )}
                >
                  {index > 0 && (
                    <div className="mb-6 flex items-center gap-4">
                      <Avatar className="h-9 w-9 border border-[#dadce0] dark:border-[#3c4043]">
                        <AvatarFallback className="bg-[#e8eaed] text-[13px] font-medium text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]">
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
          <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 border-t border-[#3c4043] bg-[#202124] px-4 py-3 md:hidden">
            <Button
              onClick={() => setReplyDialogOpen(true)}
              className="flex-1 rounded-full bg-[#1a73e8] text-white hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
            >
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </Button>
            <Button
              onClick={() => setForwardDialogOpen(true)}
              variant="outline"
              className="flex-1 rounded-full border-[#3c4043] bg-transparent text-[#e8eaed] hover:bg-[#3c4043]"
            >
              <Forward className="mr-2 h-4 w-4" />
              Forward
            </Button>
          </div>
        )}

        {isMobile && replyDialogOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-[#202124] md:hidden">
            <div className="flex items-center justify-between border-b border-[#3c4043] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a73e8]/20 dark:bg-[#8ab4f8]/20">
                  <Reply className="h-4 w-4 text-[#8ab4f8]" />
                </div>
                <h2 className="text-lg font-medium text-[#e8eaed]">Reply</h2>
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
