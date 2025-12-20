"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Send } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import { generateEmail } from "./editor/actions";

export default function ComposeEmailGmail() {
  const [open, setOpen] = useState(false);
  const [accountId] = useLocalStorage("accountId", "");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [originalUserText, setOriginalUserText] = useState<string>("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();
  const { data: account } = api.account.getMyAccount.useQuery(
    { accountId: accountId || "" },
    {
      enabled: !!accountId && accountId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );
  const hasValidAccount =
    !accountsLoading &&
    !!accountId &&
    accountId.length > 0 &&
    accounts?.some((acc) => acc.id === accountId);

  const handleAIGenerate = useCallback(async () => {
    if (isGenerating || isSending) {
      toast.info("AI is generating, please wait...");
      return;
    }

    if (!subject.trim() && !body.trim()) {
      toast.info(
        "Please enter a subject or some text in the body first, then press Alt+J (Windows) or Cmd+J (Mac)",
      );
      return;
    }

    const isRegeneration = hasGenerated && body.trim().length > 0;

    if (!hasGenerated && body.trim()) {
      setOriginalUserText(body.trim());
    }

    setIsGenerating(true);
    setIsRegenerating(isRegeneration);

    if (isRegeneration) {
      toast.info("Generating a different, improved version...", {
        duration: 2000,
      });
    } else {
      toast.info("AI is thinking...", { duration: 2000 });
    }

    try {
      const userInput =
        isRegeneration && originalUserText
          ? originalUserText
          : body.trim() || `Write an email about: ${subject}`;

      const context = `EMAIL COMPOSITION CONTEXT:

Subject: ${subject || "(No subject)"}
Recipient: ${to || "(Not specified)"}
User's Name: ${account?.name || "User"}
User's Email: ${account?.emailAddress || ""}

INSTRUCTIONS:
${
  isRegeneration
    ? `The user has already generated an email body, but wants a DIFFERENT and BETTER version. 
  
IMPORTANT REGENERATION REQUIREMENTS:
- Generate a COMPLETELY DIFFERENT version from what was previously generated
- Make it BETTER - more professional, clearer, more engaging, or more comprehensive
- Use different wording, structure, and phrasing while maintaining the same core message
- Still be appropriate for the subject: "${subject || "None"}"
- Still incorporate the user's original intent: "${originalUserText || userInput}"
- Ensure it makes sense and is contextually appropriate
- Use proper email formatting with paragraphs`
    : `You are helping compose a new email. The user has provided:
- Subject: ${subject || "None"}
- Initial draft: ${userInput || "None"}

Generate a complete, professional email body based on the subject and any initial text provided. If the user has started writing, continue from where they left off. Use proper email formatting with paragraphs.`
}

${isRegeneration ? `\nGenerate a fresh, improved, and completely different version of this email.` : ""}`;

      const prompt = isRegeneration
        ? `Generate a completely different and better version of an email about: "${subject}". The user's original intent was: "${originalUserText || userInput}". Make it fresh, improved, and professional.`
        : userInput;

      const result = await generateEmail(context, prompt);

      if (result.content && result.content.trim()) {
        setBody(result.content.trim());
        setHasGenerated(true);
        if (isRegeneration) {
          toast.success(
            "New version generated! Press Alt+J/Cmd+J again for another variation.",
          );
        } else {
          toast.success("Email body generated successfully!");
        }
      } else {
        toast.error("Failed to generate email body. Please try again.");
      }
    } catch (error) {
      console.error("Error generating email:", error);
      toast.error(
        "Failed to generate email. Please check your API key and try again.",
      );
    } finally {
      setIsGenerating(false);
      setIsRegenerating(false);
    }
  }, [
    subject,
    body,
    to,
    account,
    isGenerating,
    isSending,
    hasGenerated,
    originalUserText,
  ]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isShortcut =
        (!isMac && event.altKey && event.key === "j") ||
        (isMac && event.metaKey && event.key === "j");

      if (isShortcut) {
        const activeElement = document.activeElement;
        const isBodyFocused = activeElement === bodyTextareaRef.current;
        const isInputFocused =
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA";

        if (isBodyFocused || !isInputFocused) {
          event.preventDefault();
          handleAIGenerate();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleAIGenerate]);

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error("Please enter at least one recipient");
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

    if (!accountId) {
      toast.error("Please select an account");
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
          accountId,
          to: to.split(",").map((email) => email.trim()),
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || data.error || "Failed to send email");
        return;
      }

      toast.success("Email sent successfully");

      setTo("");
      setSubject("");
      setBody("");
      setOriginalUserText("");
      setHasGenerated(false);
      setOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!hasValidAccount) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white transition-all hover:shadow-lg hover:shadow-purple-500/50"
        >
          <Pencil className="mr-2 size-4" />
          Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              placeholder="recipient@example.com (comma-separated for multiple)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Body</Label>
              <span className="text-xs text-muted-foreground">
                Press{" "}
                {navigator.platform.toUpperCase().indexOf("MAC") >= 0
                  ? "Cmd+J"
                  : "Alt+J"}{" "}
                to auto-generate
              </span>
            </div>
            <Textarea
              ref={bodyTextareaRef}
              id="body"
              placeholder="Email body (HTML supported). Press Alt+J (Windows) or Cmd+J (Mac) to auto-generate based on subject and your text."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSending || isGenerating}
              rows={10}
              className="resize-none"
            />
            {isGenerating && (
              <p className="text-sm text-muted-foreground">
                {isRegenerating
                  ? "Generating a different, improved version..."
                  : "AI is generating your email..."}
              </p>
            )}
            {hasGenerated && !isGenerating && (
              <p className="text-xs text-muted-foreground">
                💡 Press{" "}
                {navigator.platform.toUpperCase().indexOf("MAC") >= 0
                  ? "Cmd+J"
                  : "Alt+J"}{" "}
                again to generate a different version
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || isGenerating}
              className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white"
            >
              {isSending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
