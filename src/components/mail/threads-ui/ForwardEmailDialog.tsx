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
import { Forward } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";

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
  const [accountId] = useLocalStorage("accountId", "");

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

    setIsSending(true);

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: validAccountId,
          to: to.split(",").map((email) => email.trim()),
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("[FORWARD] Error parsing response:", parseError);
        toast.error("Failed to parse server response. Please try again.");
        setIsSending(false);
        return;
      }

      if (!response.ok) {
        console.error("[FORWARD] Email forward failed:", data);
        toast.error(data.message || data.error || "Failed to forward email");
        setIsSending(false);
        return;
      }

      toast.success("Email forwarded successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error forwarding email:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
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
              className="border-white/[0.06] bg-[#030303] text-white placeholder:text-zinc-600 focus:border-amber-500/50"
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
              className="border-white/[0.06] bg-[#030303] text-white focus:border-amber-500/50"
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
              className="min-h-[300px] resize-none border-white/[0.06] bg-[#030303] text-white focus:border-amber-500/50"
              placeholder="Enter your message..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/[0.06] text-zinc-300 hover:bg-white/[0.04]"
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForward}
              disabled={isSending}
              className="bg-amber-500 font-medium text-black hover:bg-amber-600"
            >
              {isSending ? (
                "Forwarding..."
              ) : (
                <>
                  <Forward className="mr-2 h-4 w-4" />
                  Forward
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
