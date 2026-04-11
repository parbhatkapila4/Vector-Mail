import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, type RouterOutputs } from "@/trpc/react";
import { format } from "date-fns";
import EmailDisplay from "./EmailDisplay";
import useThreads from "@/hooks/use-threads";
import { useAtom } from "jotai";
import { isSearchingAtom } from "../search/SearchBar";
import ReplyBox from "./ReplyBox";
import { Mail, Forward, Reply, X, Clock, Bell, Tag, ChevronDown, ChevronLeft, ChevronRight, Loader2, CalendarPlus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ForwardEmailDialog } from "./ForwardEmailDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SnoozeMenu } from "./SnoozeMenu";
import { RemindMenu } from "./RemindMenu";
import { useLocalStorage } from "usehooks-ts";
import { ThreadViewSkeleton } from "./ThreadViewSkeleton";
import { ThreadBrainPanel } from "./ThreadBrainPanel";
import { toast } from "sonner";
import { buildGoogleCalendarUrl } from "@/lib/calendar-url";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";

type Email = RouterOutputs["account"]["getThreads"]["threads"][0]["emails"][0];
type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];
type ThreadWithLabels = Thread & {
  threadLabels?: Array<{ label: { id: string; name: string; color: string | null } }>;
};

interface ThreadDisplayProps {
  threadId?: string | null;
  onClose?: () => void;
}

export function ThreadDisplay({ threadId: propThreadId, onClose }: ThreadDisplayProps) {
  const { threads: rawThreads, threadId: hookThreadId, accountId, effectiveAccountId, isUnifiedView, account } = useThreads();
  const threadId = propThreadId ?? hookThreadId;
  const threads = rawThreads as Thread[] | undefined;
  const _thread = threads?.find((t: Thread) => t.id === threadId);
  const [isSearching] = useAtom(isSearchingAtom);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [suggestedReply, setSuggestedReply] = useState<{ subject: string; body: string } | null>(null);
  const [autoApplySuggestedReply, setAutoApplySuggestedReply] = useState(false);
  const [suggestReplyModalOpen, setSuggestReplyModalOpen] = useState(false);
  const [suggestReplyStep, setSuggestReplyStep] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [suggestReplyStatus, setSuggestReplyStatus] = useState("");
  const [suggestReplyResult, setSuggestReplyResult] = useState<{ subject: string; body: string } | null>(null);
  const [suggestReplyError, setSuggestReplyError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const isDemo = useDemoMode() && (effectiveAccountId === DEMO_ACCOUNT_ID || accountId === DEMO_ACCOUNT_ID);
  const [currentTab] = useLocalStorage("vector-mail", "inbox");
  const accountForActions = effectiveAccountId ?? accountId;
  const showSnooze =
    threadId &&
    accountForActions &&
    (currentTab === "inbox" || currentTab === "snoozed");
  const showRemind =
    threadId &&
    accountForActions &&
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
  const thread = (_thread ?? foundThread) as ThreadWithLabels & { account?: { id: string; emailAddress: string; name: string } } | undefined;

  const { data: threadEvent, isLoading: isLoadingEvent } = api.account.getEventForThread.useQuery(
    { threadId: threadId ?? "" },
    { enabled: !!threadId && !!thread },
  );
  const utils = api.useUtils();
  const saveToCalendarList = api.account.saveEventToCalendarList.useMutation({
    onSuccess: () => {
      void utils.account.getUpcomingEventsFromEmails.invalidate();
    },
  });

  if (isSearching) return null;

  if (threadId && !_thread && isLoadingThread) {
    return <ThreadViewSkeleton />;
  }

  if (!thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white p-10 dark:bg-[#111113]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f4f5] dark:bg-[#18181b]">
          <Mail className="h-8 w-8 text-[#9ca3af] dark:text-[#71717a]" />
        </div>
        <h3 className="mb-1.5 text-[22px] font-normal text-[#6b7280] dark:text-[#a1a1aa]">
          Select an email
        </h3>
        <p className="max-w-sm text-center text-[14px] text-[#9ca3af] dark:text-[#71717a]">
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
      <Dialog open={suggestReplyModalOpen} onOpenChange={(open) => {
        if (!open) {
          setSuggestReplyModalOpen(false);
          setSuggestReplyStep("idle");
          setSuggestReplyResult(null);
          setSuggestReplyError(null);
        }
      }}>
        <DialogContent className="max-w-lg border-[#e5e7eb] bg-white p-6 dark:border-[#3c4043] dark:bg-[#202124]">
          <DialogHeader>
            <DialogTitle className="text-[#111118] dark:text-[#f4f4f5] flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#3b82f6] dark:text-[#8ab4f8]" />
              Suggest reply
            </DialogTitle>
          </DialogHeader>
          {suggestReplyStep === "loading" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-10 w-10 animate-spin text-[#3b82f6] dark:text-[#8ab4f8]" />
              <p className="text-center text-sm text-[#5f6368] dark:text-[#9aa0a6]">
                {suggestReplyStatus}
              </p>
              <p className="text-xs text-[#9aa0a6] dark:text-[#71717a]">
                AI is reading the thread and writing a reply in your voice. Usually 5-15 seconds.
              </p>
            </div>
          )}
          {suggestReplyStep === "ready" && suggestReplyResult && (
            <div className="space-y-4">
              <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
                Here’s your reply. You can edit it in the composer, send it now, or cancel.
              </p>
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f6f8fc] p-3 dark:border-[#3c4043] dark:bg-[#292a2d]">
                <p className="mb-1 text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6]">Subject</p>
                <p className="text-sm font-medium text-[#111118] dark:text-[#f4f4f5]">{suggestReplyResult.subject}</p>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-[#f6f8fc] p-3 dark:border-[#3c4043] dark:bg-[#292a2d] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <p className="mb-1 text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6]">Message</p>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-[#111118] dark:text-[#e8eaed] [&_p]:mb-1"
                  dangerouslySetInnerHTML={{ __html: suggestReplyResult.body.slice(0, 1500) + (suggestReplyResult.body.length > 1500 ? "..." : "") }}
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSuggestReplyModalOpen(false);
                    setSuggestReplyStep("idle");
                    setSuggestReplyResult(null);
                  }}
                  className="border-[#dadce0] dark:border-[#3c4043]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSuggestedReply(suggestReplyResult);
                    setAutoApplySuggestedReply(true);
                    setShowReplyBox(true);
                    setSuggestReplyModalOpen(false);
                    setSuggestReplyStep("idle");
                    setSuggestReplyResult(null);
                    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("focus-reply")));
                  }}
                  className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 dark:border-[#8ab4f8] dark:text-[#8ab4f8] dark:hover:bg-[#8ab4f8]/10"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    if (!suggestReplyResult || !threadId) return;
                    try {
                      const res = await fetch("/api/send-reply", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          threadId,
                          subject: suggestReplyResult.subject,
                          body: suggestReplyResult.body,
                        }),
                        credentials: "include",
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        toast.error(data.message ?? data.error ?? "Failed to send");
                        return;
                      }
                      toast.success("Reply sent");
                      setSuggestReplyModalOpen(false);
                      setSuggestReplyStep("idle");
                      setSuggestReplyResult(null);
                      setShowReplyBox(false);
                    } catch {
                      toast.error("Failed to send reply");
                    }
                  }}
                  className="bg-[#3b82f6] text-white hover:bg-[#2563eb] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
                >
                  Send
                </Button>
              </div>
            </div>
          )}
          {suggestReplyStep === "error" && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-red-600 dark:text-red-400">{suggestReplyError}</p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSuggestReplyModalOpen(false);
                    setSuggestReplyStep("idle");
                    setSuggestReplyError(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="flex h-full flex-col bg-white dark:bg-[#111113]">

        <div className="relative z-10 border-b border-[#e5e7eb] bg-white dark:border-[#1a1a23] dark:bg-[#111113]">
          <div className="hidden items-center gap-2 px-4 py-2 md:flex md:px-6">
            {threadId && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose?.();
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.06] dark:hover:text-[#f4f4f5]"
                aria-label="Close email"
                title="Close email"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showSnooze && (
              <SnoozeMenu
                threadId={threadId ?? ""}
                accountId={accountForActions ?? ""}
                isSnoozedTab={currentTab === "snoozed"}
              >
                <button
                  type="button"
                  className="flex h-8 items-center gap-2 rounded-lg px-3 text-[12px] font-medium text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.06] dark:hover:text-[#f4f4f5]"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Snooze
                </button>
              </SnoozeMenu>
            )}
            {showRemind && (
              <RemindMenu
                threadId={threadId ?? ""}
                accountId={accountForActions ?? ""}
                isRemindersTab={currentTab === "reminders"}
              >
                <button
                  type="button"
                  className="flex h-8 items-center gap-2 rounded-lg px-3 text-[12px] font-medium text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.06] dark:hover:text-[#f4f4f5]"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Remind me
                </button>
              </RemindMenu>
            )}
            <button
              onClick={() => setForwardDialogOpen(true)}
              className="flex h-8 items-center gap-2 rounded-lg px-3 text-[12px] font-medium text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.06] dark:hover:text-[#f4f4f5]"
            >
              <Forward className="h-3.5 w-3.5" />
              Forward
            </button>
            <button
              type="button"
              onClick={() => {
                const event = threadEvent ?? {
                  title: firstEmail?.subject || "Event from email",
                  startAt: new Date().toISOString(),
                  endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                };
                const url = buildGoogleCalendarUrl(event, {
                  description: typeof window !== "undefined" ? `From email - Vector Mail\n${window.location.href}` : undefined,
                });
                window.open(url, "_blank", "noopener,noreferrer");
                if (accountForActions && threadId) {
                  saveToCalendarList.mutate({
                    accountId: accountForActions,
                    threadId,
                    title: event.title,
                    startAt: event.startAt,
                    endAt: event.endAt,
                  });
                }
              }}
              className="flex h-8 items-center gap-2 rounded-lg px-3 text-[12px] font-medium text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111118] dark:text-[#a1a1aa] dark:hover:bg-[#ffffff]/[0.06] dark:hover:text-[#f4f4f5]"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Add to calendar
            </button>
            <div className="flex-1" />
            {threadId && effectiveAccountId && !isDemo && (
              <button
                type="button"
                disabled={suggestReplyStep === "loading"}
                onClick={async () => {
                  if (!threadId || !effectiveAccountId) return;
                  setSuggestReplyModalOpen(true);
                  setSuggestReplyStep("loading");
                  setSuggestReplyError(null);
                  setSuggestReplyResult(null);
                  setSuggestReplyStatus("Reading your email and thread...");
                  const statusTimer = setTimeout(() => {
                    setSuggestReplyStatus("Writing your reply in your voice...");
                  }, 1200);
                  try {
                    const res = await fetch("/api/generate-reply", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ threadId, accountId: effectiveAccountId }),
                      credentials: "include",
                    });
                    const data = await res.json().catch(() => ({}));
                    clearTimeout(statusTimer);
                    if (!res.ok) {
                      setSuggestReplyStep("error");
                      const msg =
                        data.message ??
                        data.error ??
                        (res.status === 504
                          ? "Reply took too long. Try again."
                          : res.status === 401
                            ? "Your session may have expired. Refresh the page or sign in again."
                            : res.status === 403
                              ? "Connect your account to use Suggest reply."
                              : "Failed to suggest reply");
                      setSuggestReplyError(msg);
                      return;
                    }
                    setSuggestReplyResult({ subject: data.subject ?? "", body: data.body ?? "" });
                    setSuggestReplyStep("ready");
                  } catch (e) {
                    clearTimeout(statusTimer);
                    setSuggestReplyStep("error");
                    setSuggestReplyError("Failed to suggest reply");
                    toast.error("Failed to suggest reply");
                  }
                }}
                className="flex h-8 items-center gap-2 rounded-lg border border-[#3b82f6] bg-transparent px-4 text-[12px] font-medium text-[#3b82f6] transition-colors hover:bg-[#3b82f6]/10 dark:border-[#8ab4f8] dark:text-[#8ab4f8] dark:hover:bg-[#8ab4f8]/10 disabled:opacity-60"
              >
                {suggestReplyStep === "loading" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageCircle className="h-3.5 w-3.5" />
                )}
                Suggest reply
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowReplyBox(true);
                requestAnimationFrame(() => {
                  window.dispatchEvent(new CustomEvent("focus-reply"));
                });
              }}
              className="flex h-8 items-center gap-2 rounded-lg bg-[#3b82f6] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#2563eb]"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          </div>

          <div className="px-4 pb-6 pt-4 md:px-6 md:pt-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] font-normal leading-tight text-[#111118] dark:text-[#f4f4f5] md:text-[22px]">
                {firstEmail?.subject || "(No subject)"}
              </h1>
              {(() => {
                const lastEmailInThread = thread?.emails?.[thread.emails.length - 1] as { from?: { address?: string }; sysClassifications?: string[] } | undefined;
                const accountEmail = (thread as { account?: { emailAddress?: string } })?.account?.emailAddress ?? (account as { emailAddress?: string } | undefined)?.emailAddress ?? "";
                const lastFromOther = lastEmailInThread?.from?.address && accountEmail && lastEmailInThread.from.address.toLowerCase() !== accountEmail.toLowerCase();
                const allClassifications = (thread?.emails ?? []).flatMap((e) => (e as { sysClassifications?: string[] }).sysClassifications ?? []);
                const raw = allClassifications.map((c) => String(c).toLowerCase());
                const isPromoOrMarketing = raw.includes("promotions") || raw.includes("social") || raw.includes("updates") || raw.includes("forums");
                const showNeedsReply = lastFromOther && !isPromoOrMarketing;
                return showNeedsReply ? (
                  <span className="rounded-md bg-[#e8f0fe] px-2 py-0.5 text-[11px] font-medium text-[#1967d2] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]">
                    Needs reply
                  </span>
                ) : null;
              })()}
            </div>
            {threadEvent && (
              <p className="mb-2 flex items-center gap-2 text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
                <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
                {format(new Date(threadEvent.startAt), "MMM d, h:mm a")}
                {threadEvent.location && ` · ${threadEvent.location}`}
                {" - "}
                {threadEvent.title}
              </p>
            )}
            {isUnifiedView && thread?.account && (
              <p className="mb-2 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                From account: {thread.account.emailAddress}
              </p>
            )}
            {threadId && accountForActions && (
              <ThreadLabelsBar
                threadId={threadId}
                accountId={accountForActions}
                labels={(thread?.threadLabels ?? []).map((tl) => tl.label)}
              />
            )}

            {threadId && accountForActions && (
              <ThreadBrainPanel
                threadId={threadId}
                accountId={accountForActions}
              />
            )}

            <div className="mb-6 flex items-center gap-4">
              <Avatar className="h-11 w-11 border border-[#e5e7eb] dark:border-[#1a1a23]">
                <AvatarImage alt={senderName} />
                <AvatarFallback className="bg-[#3b82f6] text-[14px] font-medium text-white">
                  {senderName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2.5">
                  <span className="text-[14px] font-semibold text-[#111118] dark:text-[#f4f4f5]">
                    {senderName}
                  </span>
                  <span className="rounded-md bg-[#f3f4f6] px-2 py-0.5 text-[12px] text-[#6b7280] dark:bg-[#18181b] dark:text-[#a1a1aa]">
                    Details
                  </span>
                  {firstEmail?.sentAt && (
                    <span className="ml-auto text-[12px] text-[#9ca3af] dark:text-[#71717a]">
                      {format(
                        new Date(firstEmail.sentAt),
                        "MMM d, yyyy 'at' h:mm a",
                      )}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#9ca3af] dark:text-[#71717a]">
                  To: You
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth pb-20 text-base md:pb-0 md:text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-full px-4 py-6 md:px-6 md:py-8">
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

        {showReplyBox && (
          <div className="hidden border-t border-[#e5e7eb] dark:border-[#1a1a23] md:block">
            <ReplyBox
              suggestedReply={suggestedReply}
              autoApplySuggestedReply={autoApplySuggestedReply}
              onApplySuggestedReply={() => { setSuggestedReply(null); setAutoApplySuggestedReply(false); }}
              onDismissSuggestedReply={() => { setSuggestedReply(null); setAutoApplySuggestedReply(false); }}
            />
          </div>
        )}

        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 border-t border-[#3c4043] bg-[#202124] px-4 py-3 [touch-action:manipulation] md:hidden [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={() => setReplyDialogOpen(true)}
              className="min-h-[44px] flex-1 rounded-full bg-[#1a73e8] text-white hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa] [touch-action:manipulation]"
            >
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </Button>
            <Button
              onClick={() => setForwardDialogOpen(true)}
              variant="outline"
              className="min-h-[44px] flex-1 rounded-full border-[#3c4043] bg-transparent text-[#e8eaed] hover:bg-[#3c4043] [touch-action:manipulation]"
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
                suggestedReply={suggestedReply}
                autoApplySuggestedReply={autoApplySuggestedReply}
                onApplySuggestedReply={() => { setSuggestedReply(null); setAutoApplySuggestedReply(false); }}
                onDismissSuggestedReply={() => { setSuggestedReply(null); setAutoApplySuggestedReply(false); }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ThreadLabelsBar({
  threadId,
  accountId,
  labels,
}: {
  threadId: string;
  accountId: string;
  labels: Array<{ id: string; name: string; color: string | null }>;
}) {
  const utils = api.useUtils();
  const [pendingAddId, setPendingAddId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const { data: allLabels } = api.account.getLabels.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId },
  );
  const addLabelMutation = api.account.addLabelToThread.useMutation({
    onMutate: ({ labelId }) => setPendingAddId(labelId),
    onSuccess: async () => {
      await Promise.all([
        utils.account.getThreadById.invalidate({ threadId }),
        utils.account.getThreads.invalidate(),
        utils.account.getNumThreads.invalidate(),
        utils.account.getLabelsWithCounts.invalidate({ accountId: accountId || "placeholder" }),
      ]);
      toast.success("Label added");
    },
    onError: (e) => toast.error(e.message ?? "Failed to add label"),
    onSettled: () => setPendingAddId(null),
  });
  const removeLabelMutation = api.account.removeLabelFromThread.useMutation({
    onMutate: ({ labelId }) => setPendingRemoveId(labelId),
    onSuccess: async () => {
      await Promise.all([
        utils.account.getThreadById.invalidate({ threadId }),
        utils.account.getThreads.invalidate(),
        utils.account.getNumThreads.invalidate(),
        utils.account.getLabelsWithCounts.invalidate({ accountId: accountId || "placeholder" }),
      ]);
    },
    onError: (e) => toast.error(e.message ?? "Failed to remove label"),
    onSettled: () => setPendingRemoveId(null),
  });
  const currentIds = new Set(labels.map((l) => l.id));
  const availableToAdd = (allLabels ?? []).filter((l) => !currentIds.has(l.id));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {labels.map((lbl) => (
        <span
          key={lbl.id}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium bg-[#e8f0fe] text-[#1967d2] dark:bg-[#174ea6]/40 dark:text-[#8ab4f8]"
          style={lbl.color ? { backgroundColor: `${lbl.color}20`, color: lbl.color } : undefined}
        >
          {lbl.name}
          <button
            type="button"
            onClick={() => removeLabelMutation.mutate({ threadId, labelId: lbl.id })}
            disabled={removeLabelMutation.isPending}
            className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-70"
            aria-label={`Remove ${lbl.name}`}
          >
            {pendingRemoveId === lbl.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </button>
        </span>
      ))}
      {availableToAdd.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={addLabelMutation.isPending}
              className="h-7 gap-1 rounded-full border border-dashed border-[#dadce0] px-2.5 text-[12px] text-[#5f6368] hover:border-[#1a73e8] hover:text-[#1a73e8] dark:border-[#3c4043] dark:text-[#9aa0a6] dark:hover:border-[#8ab4f8] dark:hover:text-[#8ab4f8] disabled:opacity-70"
            >
              {addLabelMutation.isPending && pendingAddId ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Tag className="h-3 w-3" />
              )}
              {addLabelMutation.isPending && pendingAddId ? "Adding…" : "Add label"}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
            {availableToAdd.map((l) => (
              <DropdownMenuItem
                key={l.id}
                onClick={() => addLabelMutation.mutate({ threadId, labelId: l.id })}
                disabled={addLabelMutation.isPending}
              >
                {pendingAddId === l.id ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <span
                    className="mr-2 h-3 w-3 rounded-full shrink-0"
                    style={l.color ? { backgroundColor: l.color } : { backgroundColor: "#1a73e8" }}
                  />
                )}
                {l.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
