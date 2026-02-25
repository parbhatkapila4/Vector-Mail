"use client";
import React, { useState, useEffect, useRef } from "react";
import useThreads from "@/hooks/use-threads";
import { api, type RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";
import { format } from "date-fns";
import EmailEditor from "../editor/EmailEditor";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimeInput24 } from "@/components/ui/time-input-24";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Reply } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { openGmailCompose } from "@/lib/gmail-compose";
import type { OpenGmailComposeOptions } from "@/lib/gmail-compose";
import { usePendingSend } from "@/contexts/PendingSendContext";
import { GmailRedirectDialog } from "@/components/mail/GmailRedirectDialog";
import { Checkbox } from "@/components/ui/checkbox";

type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];

type OptionType = {
  label: string | React.ReactNode;
  value: string;
};

interface ReplyBoxProps {
  onSendSuccess?: () => void;
  isInMobileDialog?: boolean;
}

const ReplyBox = ({
  onSendSuccess,
  isInMobileDialog = false,
}: ReplyBoxProps) => {
  const { threadId, threads: rawThreads, account } = useThreads();
  const [accountId] = useLocalStorage("accountId", "");
  const threads = rawThreads as Thread[] | undefined;

  const thread = threads?.find((t) => t.id === threadId);
  const { data: foundThread } = api.account.getThreadById.useQuery(
    {
      threadId: threadId ?? "",
    },
    {
      enabled: !!!thread && !!threadId && threadId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const currentThread = (thread ?? foundThread) as Thread | undefined;
  const lastEmail = currentThread?.emails?.[currentThread.emails.length - 1];

  const [subject, setSubject] = React.useState("");
  const [toValues, setToValues] = React.useState<OptionType[]>([]);
  const [ccValues, setCcValues] = React.useState<OptionType[]>([]);
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const bodyContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFocusReply = () => {
      setIsCollapsed(false);
      requestAnimationFrame(() => {
        const editable = bodyContainerRef.current?.querySelector<HTMLElement>(
          "[contenteditable=true], textarea"
        );
        editable?.focus();
      });
    };
    window.addEventListener("focus-reply", handleFocusReply as EventListener);
    return () =>
      window.removeEventListener("focus-reply", handleFocusReply as EventListener);
  }, []);
  const [trackOpens, setTrackOpens] = useState(false);
  const [scheduleSendOpen, setScheduleSendOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [pendingScheduleBody, setPendingScheduleBody] = useState<string>("");
  const [gmailRedirectOpen, setGmailRedirectOpen] = useState(false);
  const gmailRedirectPayloadRef = React.useRef<OpenGmailComposeOptions | null>(null);

  const sendEmail = api.account.sendEmail.useMutation();
  const { isLoaded: authLoaded, userId } = useAuth();
  const { scheduleSend, isPending: isPendingSend } = usePendingSend();
  const scheduleSendMutation = api.account.scheduleSend.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Reply scheduled", {
        description: `Will send on ${format(variables.scheduledAt, "MMM d, yyyy 'at' h:mm a")}`,
      });
      setScheduleSendOpen(false);
      onSendSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to schedule send");
    },
  });

  React.useEffect(() => {
    if (!lastEmail || !threadId) return;

    const newSubject = lastEmail.subject.startsWith("Re:")
      ? lastEmail.subject
      : `Re: ${lastEmail.subject}`;
    setSubject(newSubject);
    setToValues([
      {
        label: lastEmail.from.address ?? lastEmail.from.name,
        value: lastEmail.from.address,
      },
    ]);
    setCcValues([]);
  }, [lastEmail, threadId]);

  if (!currentThread && threadId) {
    return (
      <div className="flex h-[200px] items-center justify-center border-t border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124]">
        <div className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">Loading reply box...</div>
      </div>
    );
  }

  if (!currentThread || !lastEmail) {
    return (
      <div className="flex h-[200px] items-center justify-center border-t border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124]">
        <div className="text-center">
          <div className="mb-2 text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            No reply details available
          </div>
          <div className="text-xs text-[#5f6368]/80 dark:text-[#9aa0a6]/80">
            Select a thread to reply to
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async (value: string) => {
    if (!lastEmail || !account) return;

    const getInReplyTo = (): string | undefined => {
      if ("internetMessageId" in lastEmail && lastEmail.internetMessageId) {
        return lastEmail.internetMessageId;
      }
      return undefined;
    };

    // Show Gmail redirect dialog instead of sending via API (CASA / gmail.send scope temporarily disabled)
    const recipients = [
      {
        name: lastEmail.from.name ?? lastEmail.from.address,
        address: lastEmail.from.address,
      },
    ];
    const toStr = recipients.map((r) => r.address).join(", ");
    gmailRedirectPayloadRef.current = { to: toStr, subject, body: value };
    setGmailRedirectOpen(true);

    // Backend send logic kept for re-enable; not executed while gmail.send is disabled
    // const payload = {
    //   accountId,
    //   threadId: threadId ?? undefined,
    //   body: value,
    //   subject,
    //   from: { name: account.name ?? "Me", address: account.emailAddress ?? "me@example.com" },
    //   to: recipients,
    //   cc: [] as { name: string; address: string }[],
    //   replyTo: { name: account.name ?? "Me", address: account.emailAddress ?? "me@example.com" },
    //   inReplyTo: getInReplyTo(),
    //   trackOpens,
    // };
    // scheduleSend(async () => {
    //   try {
    //     await sendEmail.mutateAsync(payload);
    //     toast.success("Email sent successfully!");
    //     onSendSuccess?.();
    //   } catch (error) {
    //     const message = error instanceof Error ? error.message : "Failed to send";
    //     toast.error(message);
    //   }
    // });
  };

  const handleGmailRedirectOpen = () => {
    const payload = gmailRedirectPayloadRef.current;
    if (payload) {
      openGmailCompose(payload);
      toast.info(
        "Sending via Gmail compose (sending inside VectorMail will be enabled soon)",
      );
    }
    onSendSuccess?.();
    setGmailRedirectOpen(false);
  };

  const handleScheduleSendClick = (bodyHtml: string) => {
    setPendingScheduleBody(bodyHtml);
    setScheduleSendOpen(true);
  };

  const handleScheduleSendConfirm = () => {
    if (!lastEmail || !account) return;
    if (!scheduleDate) {
      toast.error("Please pick a date");
      return;
    }
    const parts = scheduleTime.split(":").map(Number);
    const hours = Number.isFinite(parts[0]) ? (parts[0] ?? 9) : 9;
    const minutes = Number.isFinite(parts[1]) ? (parts[1] ?? 0) : 0;
    const scheduledAt = new Date(scheduleDate);
    scheduledAt.setHours(hours, minutes, 0, 0);
    if (scheduledAt.getTime() <= Date.now()) {
      toast.error("Please pick a future date and time");
      return;
    }
    const getInReplyTo = (): string | undefined => {
      if ("internetMessageId" in lastEmail && lastEmail.internetMessageId) {
        return lastEmail.internetMessageId;
      }
      return undefined;
    };
    const toList = toValues.map((t) => ({
      name: (typeof t.label === "string" ? t.label : t.value) || t.value,
      address: t.value,
    }));
    const ccList =
      ccValues.length > 0
        ? ccValues.map((c) => ({
          name: (typeof c.label === "string" ? c.label : c.value) || c.value,
          address: c.value,
        }))
        : undefined;
    const payload = {
      type: "trpc" as const,
      accountId,
      from: {
        name: account.name ?? "Me",
        address: account.emailAddress ?? "me@example.com",
      },
      to: toList,
      subject,
      body: pendingScheduleBody,
      threadId: threadId ?? undefined,
      inReplyTo: getInReplyTo(),
      replyTo: {
        name: account.name ?? "Me",
        address: account.emailAddress ?? "me@example.com",
      },
      cc: ccList,
      trackOpens,
    };
    scheduleSendMutation.mutate({ accountId, scheduledAt, payload });
  };

  const shouldShowCollapsed = isInMobileDialog ? false : isCollapsed;

  return (
    <div className="flex h-full flex-col border-t border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124] md:sticky md:bottom-0 md:z-50">
      {!isInMobileDialog && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a73e8]/10 dark:bg-[#8ab4f8]/15">
              <Reply className="h-4 w-4 text-[#1a73e8] dark:text-[#8ab4f8]" />
            </div>
            <div>
              <span className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">Reply</span>
              {toValues.length > 0 && (
                <span className="ml-2 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  to {toValues[0]?.value || "..."}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-lg p-0 text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#303134] dark:hover:text-[#e8eaed]"
            aria-label={isCollapsed ? "Expand reply box" : "Collapse reply box"}
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4 text-[#1a73e8] dark:text-[#8ab4f8]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#1a73e8] dark:text-[#8ab4f8]" />
            )}
          </Button>
        </div>
      )}

      {!shouldShowCollapsed && (
        <div
          ref={bodyContainerRef}
          className={`flex flex-1 flex-col ${isInMobileDialog ? "min-h-0" : "max-h-[60vh]"} overflow-hidden border-t border-[#dadce0] dark:border-[#3c4043]`}
        >
          <div className="flex flex-col gap-1 border-b border-[#dadce0] px-4 py-2.5 dark:border-[#3c4043]">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={trackOpens}
                onCheckedChange={(c) => setTrackOpens(c === true)}
                disabled={sendEmail.isPending || isPendingSend}
                className="mt-0.5 border-[#dadce0] data-[state=checked]:bg-[#1a73e8] data-[state=checked]:border-[#1a73e8] dark:border-[#3c4043] dark:data-[state=checked]:bg-[#8ab4f8] dark:data-[state=checked]:border-[#8ab4f8]"
              />
              <span className="text-[#5f6368] dark:text-[#9aa0a6]">
                Track when this email is opened
              </span>
            </label>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] md:ml-7">
              Adds a small image that loads when the recipient opens the email.
              Some email clients block images.
            </p>
          </div>
          <EmailEditor
            toValues={toValues || []}
            ccValues={ccValues}
            onToChange={(values) => {
              setToValues(values);
            }}
            onCcChange={(values) => {
              setCcValues(values || []);
            }}
            subject={subject}
            setSubject={setSubject}
            to={toValues.map((t) => t.value).filter(Boolean)}
            handleSend={handleSend}
            isSending={sendEmail.isPending || isPendingSend}
            onScheduleSend={handleScheduleSendClick}
            isScheduling={scheduleSendMutation.isPending}
          />
          <Dialog open={scheduleSendOpen} onOpenChange={setScheduleSendOpen}>
            <DialogContent className="max-w-sm border-[#dadce0] bg-white p-6 dark:border-[#3c4043] dark:bg-[#202124]">
              <DialogHeader>
                <DialogTitle className="text-[#202124] dark:text-[#e8eaed]">
                  Schedule reply
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex w-full flex-col items-center">
                  <Label className="mb-2 block w-full text-center text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6]">
                    Date
                  </Label>
                  <div className="flex w-full justify-center">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      className="[--cell-size:1.2rem] rounded-lg border border-[#dadce0] bg-[#f6f8fc] p-1.5 text-[11px] dark:border-[#3c4043] dark:bg-[#292a2d] [&_[data-slot=calendar]]:text-[11px] [&_.rdp-month]:!gap-y-0.5 [&_.rdp-week]:!mt-0.5"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6]">
                    Time (24-hour)
                  </Label>
                  <TimeInput24
                    value={scheduleTime}
                    onChange={setScheduleTime}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleScheduleSendConfirm}
                  disabled={
                    scheduleSendMutation.isPending || !authLoaded || !userId
                  }
                  className="w-full bg-[#1a73e8] py-2.5 font-medium text-white hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
                >
                  {!authLoaded || !userId
                    ? "Loading..."
                    : scheduleSendMutation.isPending
                      ? "Scheduling..."
                      : "Schedule send"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <GmailRedirectDialog
            open={gmailRedirectOpen}
            onOpenChange={setGmailRedirectOpen}
            onOpenGmail={handleGmailRedirectOpen}
          />
        </div>
      )}
    </div>
  );
};

export default ReplyBox;
