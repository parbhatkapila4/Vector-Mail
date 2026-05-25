import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api, type RouterOutputs } from "@/trpc/react";
import { format, formatDistanceToNow } from "date-fns";
import EmailDisplay from "./EmailDisplay";
import useThreads from "@/hooks/use-threads";
import { useAtom } from "jotai";
import { isSearchingAtom } from "../search/SearchBar";
import ReplyBox from "./ReplyBox";
import { Mail, Forward, Reply, X, Clock, Bell, Tag, ChevronDown, Loader2, CalendarPlus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { UNIFIED_INBOX_ACCOUNT_ID } from "@/components/mail/AccountSwitcher";

type Email = NonNullable<RouterOutputs["account"]["getThreadById"]>["emails"][0];
type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];
type ThreadWithLabels = Omit<
  NonNullable<RouterOutputs["account"]["getThreadById"]>,
  "account"
> & {
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
  const summaryAccountId =
    (_thread as { accountId?: string } | undefined)?.accountId?.trim() ||
    accountForActions?.trim() ||
    "";
  const { data: autoFollowUpSummary } = api.automation.getThreadFollowUpSummary.useQuery(
    { accountId: summaryAccountId, threadId: threadId ?? "" },
    {
      enabled:
        !!threadId &&
        summaryAccountId.length > 0 &&
        summaryAccountId !== UNIFIED_INBOX_ACCOUNT_ID,
      staleTime: 30_000,
    },
  );
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
      enabled: !!threadId && threadId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const thread = (foundThread ?? _thread) as unknown as ThreadWithLabels & { account?: { id: string; emailAddress: string; name: string } } | undefined;

  const { data: threadEvent } = api.account.getEventForThread.useQuery(
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
      <div className="flex h-full items-center justify-center bg-white dark:bg-[#ffffff]">
        <div className="flex items-center gap-2.5 text-[#a89b86] dark:text-[#5b554c]">
          <Mail className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-[13px]">No conversation selected</span>
        </div>
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
    if (typeof document === "undefined") return htmlBody;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlBody;
    tempDiv
      .querySelectorAll("style, script, head, title, noscript")
      .forEach((el) => el.remove());
    tempDiv.querySelectorAll("br").forEach((el) => el.replaceWith("\n"));
    tempDiv
      .querySelectorAll("p, div, tr, li, h1, h2, h3, h4, h5, h6, blockquote")
      .forEach((el) => el.append("\n"));

    return (tempDiv.textContent || "")
      .replace(/[͏​‌‍⁠﻿­؜]/g, "")
      .replace(/[   ]/g, " ")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/ ?\n ?/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
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
            <DialogTitle className="flex items-center gap-2 pr-8 text-left text-[#111118] dark:text-[#f4f4f5]">
              <MessageCircle className="h-5 w-5 shrink-0 text-[#1e2a4a] dark:text-[#1e2a4a]" />
              <span className="whitespace-nowrap">Suggest reply</span>
            </DialogTitle>
          </DialogHeader>
          {suggestReplyStep === "loading" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-10 w-10 animate-spin text-[#1e2a4a] dark:text-[#1e2a4a]" />
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
                  className="border-[#1e2a4a] text-[#1e2a4a] hover:bg-[#1e2a4a]/10 dark:border-[#1e2a4a] dark:text-[#1e2a4a] dark:hover:bg-[#1e2a4a]/10"
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
                  className="bg-[#1e2a4a] text-white hover:bg-[#b88a3f] dark:bg-[#1e2a4a] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
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
      <div className="flex min-h-0 h-full flex-col bg-white dark:bg-[#ffffff]">

        <div className="reader-toolbar hidden md:flex shrink-0">
          {threadId && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose?.();
              }}
              className="tool-btn tool-close"
              aria-label="Close email"
              title="Close email"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {threadId && <div className="tool-divider" aria-hidden />}
          {showSnooze && (
            <SnoozeMenu
              threadId={threadId ?? ""}
              accountId={accountForActions ?? ""}
              isSnoozedTab={currentTab === "snoozed"}
            >
              <button type="button" className="tool-btn">
                <Clock className="h-3.5 w-3.5 shrink-0" />
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
              <button type="button" className="tool-btn">
                <Bell className="h-3.5 w-3.5 shrink-0" />
                Remind me
              </button>
            </RemindMenu>
          )}
          <button
            type="button"
            onClick={() => setForwardDialogOpen(true)}
            className="tool-btn"
          >
            <Forward className="h-3.5 w-3.5 shrink-0" />
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
            className="tool-btn"
          >
            <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
            Add to calendar
          </button>
          <div className="tool-spacer" />
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
                } catch {
                  clearTimeout(statusTimer);
                  setSuggestReplyStep("error");
                  setSuggestReplyError("Failed to suggest reply");
                  toast.error("Failed to suggest reply");
                }
              }}
              className="tool-btn gold-suggest"
            >
              {suggestReplyStep === "loading" ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M7 2l1.4 3.6L12 7l-3.6 1.4L7 12l-1.4-3.6L2 7l3.6-1.4L7 2z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
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
            className="tool-btn gold-cta"
          >
            <Reply className="h-3.5 w-3.5 shrink-0" />
            Reply <span className="kbd">R</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth pb-20 text-base md:pb-0 md:text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="px-4 pb-6 pt-4 md:px-6 md:pt-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1
                className="text-[22px] font-medium leading-[1.15] text-[#111118] dark:text-[#f5ebd9] md:text-[28px]"
                style={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                  letterSpacing: "-0.025em",
                }}
              >
                {firstEmail?.subject || "(No subject)"}
              </h1>
              {(() => {
                const lastEmailInThread = thread?.emails?.[thread.emails.length - 1] as { from?: { address?: string }; sysClassifications?: string[] } | undefined;
                const accountEmail = (thread as { account?: { emailAddress?: string } })?.account?.emailAddress ?? (account as { emailAddress?: string } | undefined)?.emailAddress ?? "";
                const lastFromAddr = lastEmailInThread?.from?.address ?? "";
                const lastFromOther = !!lastFromAddr && !!accountEmail && lastFromAddr.toLowerCase() !== accountEmail.toLowerCase();
                const allClassifications = (thread?.emails ?? []).flatMap((e) => (e as { sysClassifications?: string[] }).sysClassifications ?? []);
                const raw = allClassifications.map((c) => String(c).toLowerCase());
                const isPromoOrMarketing = raw.includes("promotions") || raw.includes("social") || raw.includes("updates") || raw.includes("forums");
                const isAutomatedSender = (() => {
                  const local = (lastFromAddr.split("@")[0] ?? "")
                    .toLowerCase()
                    .replace(/[._-]/g, "");
                  if (!local) return false;
                  const automatedPrefixes = [
                    "noreply",
                    "donotreply",
                    "donotrespond",
                    "notifications",
                    "notification",
                    "notify",
                    "alerts",
                    "alert",
                    "statements",
                    "statement",
                    "billing",
                    "receipts",
                    "receipt",
                    "invoice",
                    "invoices",
                    "mailer",
                    "mailservice",
                    "system",
                    "automated",
                    "autoreply",
                    "news",
                    "newsletter",
                    "digest",
                    "reminder",
                    "reminders",
                    "instaalerts",
                    "smartstatement",
                  ];
                  return automatedPrefixes.some((p) => local === p || local.startsWith(p));
                })();
                const showNeedsReply =
                  lastFromOther && !isPromoOrMarketing && !isAutomatedSender;
                return showNeedsReply ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(212,169,85,0.11) 0%, rgba(212,169,85,0.05) 100%)",
                      border: "0.5px solid rgba(212,169,85,0.28)",
                      boxShadow:
                        "0 0 0 0.5px rgba(212,169,85,0.06), inset 0 0.5px 0 rgba(255,255,255,0.04)",
                      fontFamily:
                        "var(--font-jetbrains-mono), ui-monospace, monospace",
                      fontSize: 9.5,
                      color: "#b88a3f",
                      fontWeight: 600,
                      letterSpacing: "0.16em",
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      aria-hidden
                      className="block rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        background:
                          "radial-gradient(circle at 30% 30%, #e0b46a 0%, #a67627 75%)",
                        boxShadow:
                          "0 0 0 2px rgba(212,169,85,0.14), 0 0 6px rgba(212,169,85,0.32)",
                      }}
                    />
                    NEEDS REPLY
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
            {autoFollowUpSummary && (
              <p className="mb-2 text-[12px] leading-snug text-[#5f6368] dark:text-[#9aa0a6]">
                Auto follow-up{" "}
                {autoFollowUpSummary.wasRealSend ? "sent" : "completed (simulated)"}{" "}
                {formatDistanceToNow(new Date(autoFollowUpSummary.lastSuccessAt), {
                  addSuffix: true,
                })}
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

            <div className="reader-sender-row">
              <div className="reader-avatar">
                {senderName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="reader-sender-info">
                <div className="reader-sender-name">
                  <span className="reader-sender-name-text">{senderName}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="details-link">
                        DETAILS
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      align="start"
                      className="w-[360px] max-w-[90vw] border-[#e4e7ed] bg-white p-0 text-[#0e1729] shadow-md"
                    >
                      <div className="border-b border-[#eef0f4] px-4 py-3">
                        <p
                          className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a849a]"
                          style={{
                            fontFamily:
                              "var(--font-jetbrains-mono), ui-monospace, monospace",
                          }}
                        >
                          MESSAGE DETAILS
                        </p>
                      </div>
                      <dl className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-2 px-4 py-3 text-[13px] leading-relaxed">
                        <dt className="text-[#7a849a]">From</dt>
                        <dd className="min-w-0 break-words">
                          <span className="font-medium text-[#0e1729]">
                            {senderName}
                          </span>
                          {senderEmail && (
                            <span className="ml-1 text-[#4a5572]">
                              &lt;{senderEmail}&gt;
                            </span>
                          )}
                        </dd>
                        <dt className="text-[#7a849a]">To</dt>
                        <dd className="min-w-0 break-words text-[#1e2a44]">
                          {(firstEmail?.to ?? [])
                            .map(
                              (r) =>
                                (r as { name?: string | null; address?: string })
                                  .address ?? "",
                            )
                            .filter(Boolean)
                            .join(", ") || "you"}
                        </dd>
                        {(firstEmail?.cc?.length ?? 0) > 0 && (
                          <>
                            <dt className="text-[#7a849a]">Cc</dt>
                            <dd className="min-w-0 break-words text-[#1e2a44]">
                              {(firstEmail?.cc ?? [])
                                .map(
                                  (r) =>
                                    (r as { address?: string }).address ?? "",
                                )
                                .filter(Boolean)
                                .join(", ")}
                            </dd>
                          </>
                        )}
                        <dt className="text-[#7a849a]">Subject</dt>
                        <dd className="min-w-0 break-words text-[#1e2a44]">
                          {originalSubject}
                        </dd>
                        <dt className="text-[#7a849a]">Date</dt>
                        <dd
                          className="min-w-0 break-words text-[#4a5572]"
                          style={{
                            fontFamily:
                              "var(--font-jetbrains-mono), ui-monospace, monospace",
                            fontSize: 12,
                          }}
                        >
                          {firstEmail?.sentAt
                            ? format(
                              new Date(firstEmail.sentAt),
                              "EEE, MMM d yyyy · h:mm a",
                            )
                            : "-"}
                        </dd>
                      </dl>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="reader-to">to you</div>
              </div>

              {firstEmail?.sentAt && (
                <div className="reader-time">
                  {format(new Date(firstEmail.sentAt), "MMM d · h:mm a")}
                </div>
              )}
            </div>
          </div>

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
          <div className="hidden shrink-0 border-t border-[#e5e7eb] dark:border-[#ffffff] md:block">
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
              className="min-h-[44px] flex-1 rounded-full bg-[#1a73e8] text-white hover:bg-[#1765cc] dark:bg-[#1e2a4a] dark:text-[#202124] dark:hover:bg-[#aecbfa] [touch-action:manipulation]"
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a73e8]/20 dark:bg-[#1e2a4a]/20">
                  <Reply className="h-4 w-4 text-[#1e2a4a]" />
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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

type LabelLite = { id: string; name: string; color: string | null };
type ThreadOptimisticState = {
  added: LabelLite[];
  removedIds: Set<string>;
};
const threadLabelOptimisticStore: Map<string, ThreadOptimisticState> =
  new Map();

function readThreadOptimistic(threadId: string): ThreadOptimisticState {
  return (
    threadLabelOptimisticStore.get(threadId) ?? {
      added: [],
      removedIds: new Set(),
    }
  );
}

function writeThreadOptimistic(
  threadId: string,
  next: ThreadOptimisticState,
): void {
  if (next.added.length === 0 && next.removedIds.size === 0) {
    threadLabelOptimisticStore.delete(threadId);
    return;
  }
  threadLabelOptimisticStore.set(threadId, next);
}

function ThreadLabelsBar({
  threadId,
  accountId,
  labels,
}: {
  threadId: string;
  accountId: string;
  labels: LabelLite[];
}) {
  const utils = api.useUtils();
  const queryClient = useQueryClient();
  const [pendingAddId, setPendingAddId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [optimisticAdded, setOptimisticAdded] = useState<LabelLite[]>(
    () => readThreadOptimistic(threadId).added,
  );
  const [optimisticRemovedIds, setOptimisticRemovedIds] = useState<Set<string>>(
    () => new Set(readThreadOptimistic(threadId).removedIds),
  );

  const { data: allLabels } = api.account.getLabels.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId },
  );

  const patchThreadsCacheLabels = (
    updater: (
      labels: Array<{ label: LabelLite }>,
    ) => Array<{ label: LabelLite }>,
  ) => {
    type ThreadShape = { id: string; threadLabels?: Array<{ label: LabelLite }> };
    type InfiniteShape = { pages?: Array<{ threads?: ThreadShape[] }> };
    const snapshots: Array<{ key: readonly unknown[]; data: unknown }> = [];

    const keys = [
      getQueryKey(api.account.getThreads, undefined, "infinite"),
      getQueryKey(api.account.getUnifiedThreads, undefined, "infinite"),
    ];
    keys.forEach((key) => {
      const matches = queryClient.getQueriesData<InfiniteShape>({
        queryKey: key,
      });
      matches.forEach(([qKey, oldData]) => {
        if (!oldData?.pages) return;
        let touched = false;
        const newPages = oldData.pages.map((page) => {
          if (!page.threads) return page;
          const newThreads = page.threads.map((t) => {
            if (t.id !== threadId) return t;
            const next = updater(t.threadLabels ?? []);
            if (next === (t.threadLabels ?? [])) return t;
            touched = true;
            return { ...t, threadLabels: next };
          });
          return { ...page, threads: newThreads };
        });
        if (!touched) return;
        snapshots.push({ key: qKey, data: oldData });
        queryClient.setQueryData(qKey, { ...oldData, pages: newPages });
      });
    });
    return snapshots;
  };

  const restoreThreadsCacheLabels = (
    snapshots: Array<{ key: readonly unknown[]; data: unknown }>,
  ) => {
    snapshots.forEach(({ key, data }) => {
      queryClient.setQueryData(key, data);
    });
  };

  useEffect(() => {
    const stored = readThreadOptimistic(threadId);
    setOptimisticAdded(stored.added);
    setOptimisticRemovedIds(new Set(stored.removedIds));
  }, [threadId]);

  useEffect(() => {
    writeThreadOptimistic(threadId, {
      added: optimisticAdded,
      removedIds: optimisticRemovedIds,
    });
  }, [threadId, optimisticAdded, optimisticRemovedIds]);

  useEffect(() => {
    const propIds = new Set(labels.map((l) => l.id));
    setOptimisticAdded((prev) => prev.filter((l) => !propIds.has(l.id)));
  }, [labels]);

  const displayLabels: LabelLite[] = useMemo(() => {
    const visible = labels.filter((l) => !optimisticRemovedIds.has(l.id));
    return [...visible, ...optimisticAdded];
  }, [labels, optimisticRemovedIds, optimisticAdded]);

  const addLabelMutation = api.account.addLabelToThread.useMutation({
    onMutate: ({ labelId }) => {
      setPendingAddId(labelId);
      const labelToAdd = (allLabels ?? []).find((l) => l.id === labelId);
      let cacheSnapshots: Array<{ key: readonly unknown[]; data: unknown }> =
        [];
      let restoredFromRemoved = false;
      setOptimisticRemovedIds((prev) => {
        if (!prev.has(labelId)) return prev;
        restoredFromRemoved = true;
        const next = new Set(prev);
        next.delete(labelId);
        return next;
      });
      if (labelToAdd) {
        setOptimisticAdded((prev) =>
          prev.some((l) => l.id === labelId) ? prev : [...prev, labelToAdd],
        );
        cacheSnapshots = patchThreadsCacheLabels((existing) => {
          if (existing.some((tl) => tl.label.id === labelId)) return existing;
          return [...existing, { label: labelToAdd }];
        });
      }
      return { labelId, cacheSnapshots, restoredFromRemoved };
    },
    onError: (e, _vars, context) => {
      if (context?.labelId) {
        setOptimisticAdded((prev) =>
          prev.filter((l) => l.id !== context.labelId),
        );
        if (context.restoredFromRemoved) {
          setOptimisticRemovedIds((prev) => {
            if (prev.has(context.labelId)) return prev;
            const next = new Set(prev);
            next.add(context.labelId);
            return next;
          });
        }
      }
      if (context?.cacheSnapshots?.length) {
        restoreThreadsCacheLabels(context.cacheSnapshots);
      }
      toast.error(e.message ?? "Failed to add label");
    },
    onSuccess: () => {
      toast.success("Label added");
    },
    onSettled: async () => {
      setPendingAddId(null);
      await Promise.all([
        utils.account.getThreadById.invalidate({ threadId }),
        utils.account.getThreads.invalidate(),
        utils.account.getNumThreads.invalidate(),
        utils.account.getLabelsWithCounts.invalidate({
          accountId: accountId || "placeholder",
        }),
      ]);
    },
  });

  const removeLabelMutation = api.account.removeLabelFromThread.useMutation({
    onMutate: ({ labelId }) => {
      setPendingRemoveId(labelId);
      const wasOptimisticOnly = optimisticAdded.some((l) => l.id === labelId);
      if (wasOptimisticOnly) {
        setOptimisticAdded((prev) => prev.filter((l) => l.id !== labelId));
      } else {
        setOptimisticRemovedIds((prev) => {
          if (prev.has(labelId)) return prev;
          const next = new Set(prev);
          next.add(labelId);
          return next;
        });
      }
      const cacheSnapshots = patchThreadsCacheLabels((existing) =>
        existing.filter((tl) => tl.label.id !== labelId),
      );
      return { labelId, wasOptimisticOnly, cacheSnapshots };
    },
    onError: (e, _vars, context) => {
      if (context?.labelId) {
        if (context.wasOptimisticOnly) {
          const lbl = (allLabels ?? []).find((l) => l.id === context.labelId);
          if (lbl) {
            setOptimisticAdded((prev) =>
              prev.some((p) => p.id === lbl.id) ? prev : [...prev, lbl],
            );
          }
        } else {
          setOptimisticRemovedIds((prev) => {
            if (!prev.has(context.labelId)) return prev;
            const next = new Set(prev);
            next.delete(context.labelId);
            return next;
          });
        }
      }
      if (context?.cacheSnapshots?.length) {
        restoreThreadsCacheLabels(context.cacheSnapshots);
      }
      toast.error(e.message ?? "Failed to remove label");
    },
    onSettled: async () => {
      setPendingRemoveId(null);
      await Promise.all([
        utils.account.getThreadById.invalidate({ threadId }),
        utils.account.getThreads.invalidate(),
        utils.account.getNumThreads.invalidate(),
        utils.account.getLabelsWithCounts.invalidate({
          accountId: accountId || "placeholder",
        }),
      ]);
    },
  });

  const currentIds = new Set(displayLabels.map((l) => l.id));
  const availableToAdd = (allLabels ?? []).filter((l) => !currentIds.has(l.id));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {displayLabels.map((lbl) => (
        <span
          key={lbl.id}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium bg-[#e8f0fe] text-[#b88a3f] dark:bg-[#174ea6]/40 dark:text-[#1e2a4a]"
          style={lbl.color ? { backgroundColor: `${lbl.color}20`, color: lbl.color } : undefined}
        >
          {lbl.name}
          <button
            type="button"
            onClick={() => removeLabelMutation.mutate({ threadId, labelId: lbl.id })}
            disabled={removeLabelMutation.isPending}
            className="rounded-full p-0.5 hover:bg-[#1e2a4a]/10 dark:hover:bg-white/10 disabled:opacity-70"
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
              className="h-7 gap-1 rounded-full border border-dashed border-[#dadce0] px-2.5 text-[12px] text-[#5f6368] hover:border-[#1a73e8] hover:text-[#1a73e8] dark:border-[#3c4043] dark:text-[#9aa0a6] dark:hover:border-[#1e2a4a] dark:hover:text-[#1e2a4a] disabled:opacity-70"
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
