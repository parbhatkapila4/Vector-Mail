"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { TimeInput24 } from "@/components/ui/time-input-24";
import { Forward, Clock, X, ChevronDown, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLocalStorage } from "usehooks-ts";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import { fetchWithAuthRetry } from "@/lib/fetch-with-retry";
import { appendVectorMailSignature } from "@/lib/vectormail-signature";
import { usePendingSend } from "@/contexts/PendingSendContext";

const FORWARD_GENERATE_TIMEOUT_MS = 45_000;
const FORWARDED_MARKER = "---------- Forwarded message ----------";

async function generateForwardIntroViaApi(
  context: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<{ content: string }> {
  const res = await fetch("/api/generate-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, prompt, mode: "compose", stream: false }),
    signal,
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data.error as string) || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<{ content: string }>;
}

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [trackOpens, setTrackOpens] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [scheduleTime, setScheduleTime] = useState("09:00");
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

  const handleGenerateForward = async () => {
    if (isGenerating || isSending) {
      toast.info("AI is generating, please wait...");
      return;
    }
    setIsGenerating(true);
    toast.info("Generating intro for forward...", { duration: 2000 });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FORWARD_GENERATE_TIMEOUT_MS);
    try {
      const context = `FORWARD EMAIL CONTEXT:
Original From: ${originalFrom}
Original Date: ${originalDate}
Original Subject: ${originalSubject}

Original message (excerpt): ${originalBody.slice(0, 800)}${originalBody.length > 800 ? "..." : ""}

Generate a brief, professional intro (1-3 sentences) that the user can add above the forwarded message. Output ONLY the intro text, no labels or quotes.`;

      const prompt =
        "Generate a brief professional intro for this forwarded email. Output only the intro text (1-3 sentences), nothing else.";

      const result = await generateForwardIntroViaApi(
        context,
        prompt,
        controller.signal,
      );
      clearTimeout(timeoutId);

      if (result?.content?.trim()) {
        const intro = result.content.trim();
        const idx = body.indexOf(FORWARDED_MARKER);
        const forwardedBlock =
          idx >= 0 ? body.slice(idx) : body;
        setBody(`${intro}\n\n${forwardedBlock}`);
        toast.success("Intro generated. Edit above if needed.");
      } else {
        toast.error("Could not generate intro. Try again.");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const isAbort =
        err instanceof DOMException && err.name === "AbortError";
      toast.error(
        isAbort
          ? "Request took too long. Try again."
          : err instanceof Error
            ? err.message
            : "Failed to generate intro.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

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
    const bodyWithSignature = appendVectorMailSignature(body.trim(), false);

    const accountIdSend = validAccountId;
    const executeSend = async () => {
      const response = await fetchWithAuthRetry("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accountIdSend,
          to: toSend.split(",").map((email) => email.trim()),
          subject: subjectSend,
          body: bodyWithSignature,
          trackOpens,
        }),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) {
        toast.error(data.message || data.error || "Failed to forward email");
        return;
      }
      toast.success("Email forwarded successfully");
      onOpenChange(false);
      setIsSending(false);
    };
    scheduleSend(executeSend);
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
      body: appendVectorMailSignature(body.trim(), false),
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
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-0 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_32px_64px_-12px_rgba(0,0,0,0.5)] md:h-auto md:max-h-[85vh] md:max-w-[600px] [&>button]:hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Forward Email
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8e8e93] transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-5 py-3">
          <span className="w-6 shrink-0 text-[13px] text-[#8e8e93]">To</span>
          <Input
            id="to"
            type="email"
            placeholder="Enter email address(es), separated by commas"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={isSending || isPendingSend || isGenerating}
            className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-white placeholder:text-[#52525b] focus-visible:ring-0"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <span className="w-12 shrink-0 text-[13px] text-[#8e8e93]">
            Subject
          </span>
          <Input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending || isPendingSend || isGenerating}
            className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-white placeholder:text-[#52525b] focus-visible:ring-0"
          />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSending || isPendingSend || isGenerating}
            placeholder="Write your message…"
            className="min-h-[280px] flex-1 resize-none overflow-y-auto border-0 bg-[#0c0c0e] px-5 py-5 text-[15px] leading-[1.6] text-[#e5e5e7] placeholder:text-[#6e6e73] focus-visible:ring-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
          {isGenerating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0c0c0e]/98 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/[0.1] border-t-[#5c9eff]" />
                <span className="text-[14px] font-medium text-[#afafb3]">
                  Generating…
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 border-t border-white/[0.06] px-5 py-3">
          <button
            type="button"
            onClick={handleGenerateForward}
            disabled={isSending || isPendingSend || isGenerating}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.02] px-4 text-[14px] font-semibold text-[#e5e5e7] transition-colors hover:border-white/[0.2] hover:bg-white/[0.06] disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            Generate
          </button>
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending || isPendingSend || isGenerating}
            className="h-9 border-white/[0.12] bg-transparent text-[#afafb3] hover:bg-white/[0.06] hover:text-white"
          >
            Cancel
          </Button>
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleForward}
              disabled={isSending || isPendingSend || isGenerating}
              className="flex h-9 items-center justify-center gap-2 rounded-l-lg rounded-r-none border-r border-white/20 bg-[#2c7ff6] px-4 text-[14px] font-semibold leading-none text-white transition-colors hover:bg-[#1a6fe8] disabled:opacity-50"
            >
              <Forward className="h-4 w-4 shrink-0" />
              <span className="leading-none">
                {isSending || isPendingSend ? "Forwarding…" : "Forward"}
              </span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isSending || isPendingSend || isGenerating}
                  className="flex h-9 w-9 items-center justify-center rounded-r-lg bg-[#2c7ff6] text-white transition-colors hover:bg-[#1a6fe8] disabled:opacity-50"
                  aria-label="More forward options"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl border-white/[0.08] bg-[#141416]">
                <DropdownMenuItem
                  onClick={() => setScheduleDialogOpen(true)}
                  disabled={isSending || isPendingSend || isGenerating}
                  className="text-[14px] text-[#e5e5e7] focus:bg-white/[0.06] focus:text-white"
                >
                  <Clock className="mr-3 h-4 w-4" /> Schedule send
                </DropdownMenuItem>
                <div className="my-1 border-t border-white/[0.06]" />
                <label className="flex cursor-pointer items-center gap-3 px-2 py-2.5 text-[14px] text-[#e5e5e7] hover:bg-white/[0.06]">
                  <input
                    type="checkbox"
                    checked={trackOpens}
                    onChange={(e) => setTrackOpens(e.target.checked)}
                    disabled={isSending || isPendingSend || isGenerating}
                    className="h-3.5 w-3.5 rounded border-[#3f3f46] bg-transparent text-[#3b82f6]"
                  />
                  Track when opened
                </label>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="w-auto min-w-[320px] rounded-2xl border-white/[0.08] bg-[#141416] p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-[16px] font-semibold text-white">
                Schedule forward
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="flex w-full flex-col items-center">
                <Label className="mb-2 block w-full text-center text-[13px] font-medium text-[#a1a1aa]">
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
                    className="[--cell-size:1.2rem] rounded-lg border border-white/[0.08] bg-white/[0.02] p-1.5 text-[11px] [&_[data-slot=calendar]]:text-[11px] [&_.rdp-month]:!gap-y-0.5 [&_.rdp-week]:!mt-0.5"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-3 block text-[13px] font-medium text-[#a1a1aa]">
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
                  scheduleSendMutation.isPending || !authLoaded || !userId
                }
                className="w-full rounded-lg bg-[#2c7ff6] py-2.5 text-[14px] font-semibold text-white hover:bg-[#1a6fe8]"
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
      </DialogContent>
    </Dialog>
  );
}
