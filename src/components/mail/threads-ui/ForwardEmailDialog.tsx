"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { TimeInput24 } from "@/components/ui/time-input-24";
import { Forward, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLocalStorage } from "usehooks-ts";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import { fetchWithAuthRetry } from "@/lib/fetch-with-retry";
import { openGmailCompose } from "@/lib/gmail-compose";
import type { OpenGmailComposeOptions } from "@/lib/gmail-compose";
import { usePendingSend } from "@/contexts/PendingSendContext";
import { GmailRedirectDialog } from "@/components/mail/GmailRedirectDialog";
import { Checkbox } from "@/components/ui/checkbox";

interface ForwardEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalSubject: string;
  originalBody: string;
  originalFrom: string;
  originalDate: string;
}

export function ForwardEmailDialog({
  open,
  onOpenChange,
  originalSubject,
  originalBody,
  originalFrom,
  originalDate,
}: ForwardEmailDialogProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [trackOpens, setTrackOpens] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [gmailRedirectOpen, setGmailRedirectOpen] = useState(false);
  const gmailRedirectPayloadRef = React.useRef<OpenGmailComposeOptions | null>(null);
  const [accountId] = useLocalStorage("accountId", "");
  const { isLoaded: authLoaded, userId } = useAuth();
  const { scheduleSend, isPending: isPendingSend } = usePendingSend();
  const scheduleSendMutation = api.account.scheduleSend.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Forward scheduled", {
        description: `Will send on ${format(variables.scheduledAt, "MMM d, yyyy 'at' h:mm a")}`,
      });
      setScheduleDialogOpen(false);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to schedule send");
    },
  });

  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();

  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";
  const validAccountId =
    accountId && accounts?.some((acc) => acc.id === accountId)
      ? accountId
      : firstAccountId;

  useEffect(() => {
    if (open) {
      setSubject(`Fwd: ${originalSubject}`);
      setBody(
        `\n\n---------- Forwarded message ----------\nFrom: ${originalFrom}\nDate: ${originalDate}\nSubject: ${originalSubject}\n\n${originalBody}`,
      );
      setTo("");
    }
  }, [open, originalSubject, originalBody, originalFrom, originalDate]);

  const handleForward = async () => {
    if (!to.trim()) {
      toast.error("Please enter at least one recipient email address");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!body.trim()) {
      toast.error("Please enter email body");
      return;
    }

    if (!validAccountId) {
      toast.error("Please select an account");
      return;
    }

    if (accountsLoading) {
      toast.error("Please wait while accounts are loading");
      return;
    }

    const toSend = to.trim();
    const subjectSend = subject.trim();
    const bodySend = body.trim();

    gmailRedirectPayloadRef.current = {
      to: toSend,
      subject: subjectSend,
      body: bodySend,
    };
    setGmailRedirectOpen(true);

    // Backend send logic kept for re-enable; not executed while gmail.send is disabled
    // const accountIdSend = validAccountId;
    // const executeSend = async () => {
    //   const response = await fetchWithAuthRetry("/api/email/send", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       accountId: accountIdSend,
    //       to: toSend.split(",").map((email) => email.trim()),
    //       subject: subjectSend,
    //       body: bodySend,
    //       trackOpens,
    //     }),
    //   });
    //   const text = await response.text();
    //   const data = text ? JSON.parse(text) : {};
    //   if (!response.ok) {
    //     toast.error(data.message || data.error || "Failed to forward email");
    //     return;
    //   }
    //   toast.success("Email forwarded successfully");
    // };
    // scheduleSend(executeSend);
  };

  const handleGmailRedirectOpen = () => {
    const payload = gmailRedirectPayloadRef.current;
    if (payload) {
      openGmailCompose(payload);
      toast.info(
        "Sending via Gmail compose (sending inside VectorMail will be enabled soon)",
      );
    }
    onOpenChange(false);
    setIsSending(false);
    setGmailRedirectOpen(false);
  };

  const handleScheduleForward = () => {
    if (!to.trim()) {
      toast.error("Please enter at least one recipient email address");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!body.trim()) {
      toast.error("Please enter email body");
      return;
    }
    if (!validAccountId) {
      toast.error("Please select an account");
      return;
    }
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
    const payload = {
      type: "rest" as const,
      accountId: validAccountId,
      to: to.trim().split(",").map((e) => e.trim()),
      subject: subject.trim(),
      body: body.trim(),
      trackOpens,
    };
    scheduleSendMutation.mutate({
      accountId: validAccountId,
      scheduledAt,
      payload,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/[0.04] bg-[#0A0A0A] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Forward Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="to" className="text-zinc-300">
              To
            </Label>
            <Input
              id="to"
              type="email"
              placeholder="Enter email address(es), separated by commas"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-white/[0.06] bg-[#030303] text-white placeholder:text-zinc-600 focus:border-yellow-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-zinc-300">
              Subject
            </Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-white/[0.06] bg-[#030303] text-white focus:border-yellow-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="text-zinc-300">
              Message
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[300px] resize-none border-white/[0.06] bg-[#030303] text-white focus:border-yellow-500/50"
              placeholder="Enter your message..."
            />
          </div>

          <div className="flex flex-col gap-1.5 border-t border-white/[0.06] pt-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={trackOpens}
                onCheckedChange={(c) => setTrackOpens(c === true)}
                disabled={isSending || isPendingSend}
                className="mt-0.5 border-white/30 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
              />
              <span className="text-zinc-400">
                Track when this email is opened
              </span>
            </label>
            <p className="text-xs text-zinc-500 md:ml-7">
              Adds a small image that loads when the recipient opens the email.
              Some email clients block images.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/[0.06] text-zinc-300 hover:bg-white/[0.04]"
              disabled={isSending || isPendingSend}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(true)}
              disabled={isSending || isPendingSend}
              className="border-white/[0.06] text-zinc-300 hover:bg-white/[0.04]"
            >
              <Clock className="mr-2 h-4 w-4" />
              Schedule send
            </Button>
            <Button
              onClick={handleForward}
              disabled={isSending || isPendingSend}
              className="bg-yellow-500 font-medium text-black hover:bg-yellow-600"
            >
              {isSending || isPendingSend ? (
                "Forwarding..."
              ) : (
                <>
                  <Forward className="mr-2 h-4 w-4" />
                  Forward
                </>
              )}
            </Button>
          </div>
          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogContent className="max-w-sm border-white/[0.04] bg-[#0A0A0A] p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Schedule forward
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-2">
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
                      className="[--cell-size:1.2rem] text-[11px] rounded-lg border border-white/10 bg-[#030303] p-1.5 [&_[data-slot=calendar]]:text-[11px] [&_.rdp-month]:!gap-y-0.5 [&_.rdp-week]:!mt-0.5"
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
                  onClick={handleScheduleForward}
                  disabled={
                    scheduleSendMutation.isPending ||
                    !authLoaded ||
                    !userId
                  }
                  className="w-full py-2.5 bg-yellow-500 font-medium text-black hover:bg-yellow-600"
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
      </DialogContent>
    </Dialog>
  );
}
