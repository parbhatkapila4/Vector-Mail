"use client";
import React, { useState } from "react";
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
import { usePendingSend } from "@/contexts/PendingSendContext";

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
  const [scheduleSendOpen, setScheduleSendOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [pendingScheduleBody, setPendingScheduleBody] = useState<string>("");

  const sendEmail = api.account.sendEmail.useMutation();
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
      <div className="flex h-[200px] items-center justify-center border-t border-white/[0.06] bg-[#0A0A0A]">
        <div className="text-sm text-zinc-500">Loading reply box...</div>
      </div>
    );
  }

  if (!currentThread || !lastEmail) {
    return (
      <div className="flex h-[200px] items-center justify-center border-t border-white/[0.06] bg-[#0A0A0A]">
        <div className="text-center">
          <div className="mb-2 text-sm text-zinc-500">
            No reply details available
          </div>
          <div className="text-xs text-zinc-600">
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

    const payload = {
      accountId,
      threadId: threadId ?? undefined,
      body: value,
      subject,
      from: {
        name: account.name ?? "Me",
        address: account.emailAddress ?? "me@example.com",
      },
      to: [
        {
          name: lastEmail.from.name ?? lastEmail.from.address,
          address: lastEmail.from.address,
        },
      ],
      cc: [] as { name: string; address: string }[],
      replyTo: {
        name: account.name ?? "Me",
        address: account.emailAddress ?? "me@example.com",
      },
      inReplyTo: getInReplyTo(),
    };

    scheduleSend(async () => {
      try {
        await sendEmail.mutateAsync(payload);
        toast.success("Email sent successfully!");
        onSendSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send";
        toast.error(message);
      }
    });
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
    };
    scheduleSendMutation.mutate({ accountId, scheduledAt, payload });
  };

  const shouldShowCollapsed = isInMobileDialog ? false : isCollapsed;

  return (
    <div className="flex h-full flex-col border-t border-white/[0.06] bg-[#0A0A0A] shadow-2xl shadow-black/50 md:sticky md:bottom-0 md:z-50">
      {!isInMobileDialog && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Reply className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <span className="text-sm font-medium text-white">Reply</span>
              {toValues.length > 0 && (
                <span className="ml-2 text-xs text-zinc-500">
                  to {toValues[0]?.value || "..."}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-lg p-0 text-white hover:bg-white/[0.06]"
            aria-label={isCollapsed ? "Expand reply box" : "Collapse reply box"}
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4 text-amber-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-500" />
            )}
          </Button>
        </div>
      )}

      {!shouldShowCollapsed && (
        <div
          className={`flex flex-1 flex-col ${isInMobileDialog ? "min-h-0" : "max-h-[60vh]"} overflow-hidden border-t border-white/[0.06]`}
        >
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
            <DialogContent className="max-w-sm border-white/10 bg-[#0A0A0A] p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Schedule reply
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex w-full flex-col items-center">
                  <Label className="mb-2 block w-full text-center text-sm font-medium text-zinc-300">
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
                      className="[--cell-size:1.2rem] text-[11px] rounded-lg border border-white/10 bg-white/5 p-1.5 [&_[data-slot=calendar]]:text-[11px] [&_.rdp-month]:!gap-y-0.5 [&_.rdp-week]:!mt-0.5"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block text-sm font-medium text-zinc-300">
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
                  disabled={scheduleSendMutation.isPending}
                  className="w-full py-2.5 bg-amber-500 font-medium text-black hover:bg-amber-600"
                >
                  {scheduleSendMutation.isPending
                    ? "Scheduling..."
                    : "Schedule send"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default ReplyBox;
