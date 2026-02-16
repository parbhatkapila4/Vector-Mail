"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pencil,
  Send,
  Link,
  Smile,
  FileSignature,
  Paperclip,
  X,
  Folder,
  Sparkles,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeInput24 } from "@/components/ui/time-input-24";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import { fetchWithAuthRetry } from "@/lib/fetch-with-retry";
import { usePendingSend } from "@/contexts/PendingSendContext";

const AI_GENERATE_TIMEOUT_MS = 60_000;

interface ComposeEmailGmailProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

async function generateEmailViaApi(
  context: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<{ content: string }> {
  const res = await fetch("/api/generate-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, prompt, mode: "compose" }),
    signal,
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data.error as string) || `Request failed: ${res.status}`,
    );
  }
  return res.json() as Promise<{ content: string }>;
}

export default function ComposeEmailGmail({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ComposeEmailGmailProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [accountId] = useLocalStorage("accountId", "");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [originalUserText, setOriginalUserText] = useState<string>("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [emojiPopoverOpen, setEmojiPopoverOpen] = useState(false);
  const [scheduleSendOpen, setScheduleSendOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [trackOpens, setTrackOpens] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isExternalUpdate = useRef(false);

  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();

  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";
  const validAccountId =
    accountId && accounts?.some((acc) => acc.id === accountId)
      ? accountId
      : firstAccountId;

  const hasValidAccount =
    !accountsLoading && !!validAccountId && validAccountId.length > 0;

  const { isLoaded: authLoaded, userId } = useAuth();
  const { scheduleSend } = usePendingSend();
  const scheduleSendMutation = api.account.scheduleSend.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Email scheduled", {
        description: `Will send on ${format(variables.scheduledAt, "MMM d, yyyy 'at' h:mm a")}`,
      });
      setScheduleSendOpen(false);
      setTo("");
      setSubject("");
      setBody("");
      setOriginalUserText("");
      setHasGenerated(false);
      setAttachments([]);
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to schedule send");
    },
  });

  const { data: account } = api.account.getMyAccount.useQuery(
    { accountId: validAccountId || "placeholder" },
    {
      enabled:
        !!validAccountId && validAccountId.length > 0 && !accountsLoading,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 25 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error(
        `Some files are too large (max 25MB): ${oversizedFiles.map((f) => f.name).join(", ")}`,
      );
      return;
    }

    setAttachments((prev) => [...prev, ...files]);
    toast.success(`${files.length} file(s) attached`);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 25 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error(
        `Some files are too large (max 25MB): ${oversizedFiles.map((f) => f.name).join(", ")}`,
      );
      return;
    }

    setAttachments((prev) => [...prev, ...files]);
    toast.success(`Folder attached with ${files.length} file(s)`);

    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

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
${isRegeneration
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

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        AI_GENERATE_TIMEOUT_MS,
      );
      let result: { content: string };
      try {
        result = await generateEmailViaApi(
          context,
          prompt,
          controller.signal,
        );
      } finally {
        clearTimeout(timeoutId);
      }

      if (result.content && result.content.trim()) {
        let content = result.content.trim();
        content = content.replace(/^(\d+\.)\s*\n+\s*([^\n\d])/gm, "$1 $2");
        content = content.replace(/^([a-z]\.)\s*\n+\s*([^\n])/gm, "$1 $2");
        content = content.replace(/(\n)(\d+\.)\s*\n([^\n\d])/g, "$1$2 $3");
        content = content.replace(/(\n)([a-z]\.)\s*\n([^\n])/g, "$1$2 $3");

        let htmlContent = content;
        if (!content.includes("<") && content.includes("\n\n")) {
          htmlContent = content
            .split(/\n\s*\n/)
            .filter((para) => para.trim().length > 0)
            .map((para) => {
              const trimmed = para.trim();
              const hasList = /^\d+\.\s|^[a-z]\.\s/m.test(trimmed);

              if (hasList) {
                const formattedList = trimmed
                  .split(/\n(?=\d+\.\s|[a-z]\.\s)/)
                  .filter((item) => item.trim())
                  .map((item) => {
                    return item.trim().replace(/\n+/g, " ");
                  })
                  .join("\n");
                return `<p style="margin: 0 0 12px 0; line-height: 1.6; white-space: pre-line;">${formattedList}</p>`;
              } else {
                const formatted = trimmed.replace(/\n/g, "<br>");
                return `<p style="margin: 0 0 12px 0; line-height: 1.6;">${formatted}</p>`;
              }
            })
            .join("");
        } else if (!content.includes("<") && content.includes("\n")) {
          htmlContent = `<p style="margin: 0 0 12px 0; line-height: 1.6;">${content.replace(/\n/g, "<br>")}</p>`;
        } else if (!content.includes("<")) {
          htmlContent = `<p style="margin: 0 0 12px 0; line-height: 1.6;">${content}</p>`;
        }

        setBody(htmlContent);

        if (bodyEditableRef.current) {
          isExternalUpdate.current = true;
          bodyEditableRef.current.innerHTML = htmlContent;
        }
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
      const isAbort =
        error instanceof DOMException && error.name === "AbortError";
      const errorMessage = isAbort
        ? "Request took too long. Please try again."
        : error instanceof Error
          ? error.message
          : "Failed to generate email. Please check your API key and try again.";
      toast.error(errorMessage);
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
    if (!open) {
      setIsGenerating(false);
      setIsRegenerating(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isShortcut =
        (!isMac && event.altKey && event.key === "j") ||
        (isMac && event.metaKey && event.key === "j");

      if (isShortcut) {
        const activeElement = document.activeElement;
        const isBodyFocused =
          activeElement === bodyEditableRef.current ||
          activeElement === bodyTextareaRef.current;
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

  const saveSelection = (): { start: number; end: number } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !bodyEditableRef.current)
      return null;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(bodyEditableRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return {
      start: preCaretRange.toString().length,
      end: preCaretRange.toString().length,
    };
  };

  const restoreSelection = (
    savedPos: { start: number; end: number } | null,
  ) => {
    if (!savedPos || !bodyEditableRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    let charCount = 0;
    const walker = document.createTreeWalker(
      bodyEditableRef.current,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let node: Node | null;
    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;

    while ((node = walker.nextNode())) {
      const textLength = node.textContent?.length || 0;
      const nextCharCount = charCount + textLength;

      if (
        !startNode &&
        savedPos.start >= charCount &&
        savedPos.start <= nextCharCount
      ) {
        startNode = node;
        startOffset = savedPos.start - charCount;
      }

      if (savedPos.end >= charCount && savedPos.end <= nextCharCount) {
        endNode = node;
        endOffset = savedPos.end - charCount;
        break;
      }

      charCount = nextCharCount;
    }

    if (startNode && endNode) {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (bodyEditableRef.current && !isUserTyping) {
      const currentHtml = bodyEditableRef.current.innerHTML;

      if (
        isExternalUpdate.current ||
        currentHtml === "" ||
        currentHtml === "<br>"
      ) {
        const normalizedCurrent = currentHtml.replace(/\s+/g, " ").trim();
        const normalizedBody = (body || "").replace(/\s+/g, " ").trim();

        if (normalizedCurrent !== normalizedBody) {
          const savedPos = saveSelection();
          bodyEditableRef.current.innerHTML = body || "";
          requestAnimationFrame(() => {
            restoreSelection(savedPos);
          });
        }
        isExternalUpdate.current = false;
      }
    }
  }, [body, isUserTyping]);

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error("Please enter at least one recipient");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    const bodyContent = bodyEditableRef.current?.innerHTML || body;
    if (
      !bodyContent ||
      !bodyContent.trim() ||
      bodyContent === "<br>" ||
      bodyContent === "<div><br></div>"
    ) {
      toast.error("Please enter email body");
      return;
    }

    if (!validAccountId) {
      toast.error("Please select an account");
      return;
    }

    const maxSize = 25 * 1024 * 1024;
    const validAttachments = attachments.filter((file) => file.size <= maxSize);
    if (attachments.length > 0 && validAttachments.length === 0) {
      toast.error("All selected files are too large (max 25MB each).");
      return;
    }

    const toSend = to;
    const subjectSend = subject;
    const bodySend = bodyContent.trim();
    const accountIdSend = validAccountId;
    const attachmentsToSend = [...validAttachments];

    const executeSend = async () => {
      let response: Response;
      if (attachmentsToSend.length > 0) {
        const formData = new FormData();
        formData.append("accountId", accountIdSend);
        formData.append(
          "to",
          JSON.stringify(toSend.split(",").map((email) => email.trim())),
        );
        formData.append("subject", subjectSend.trim());
        formData.append("body", bodySend);
        formData.append("trackOpens", String(trackOpens));
        attachmentsToSend.forEach((file) => formData.append("attachments", file));
        response = await fetchWithAuthRetry("/api/email/send", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetchWithAuthRetry("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId: accountIdSend,
            to: toSend.split(",").map((email) => email.trim()),
            subject: subjectSend.trim(),
            body: bodySend,
            trackOpens,
          }),
        });
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) {
        toast.error(data.message || data.error || "Failed to send email");
        if (data.hint) toast.info(data.hint, { duration: 5000 });
        return;
      }
      if (data.warning) toast.warning(data.warning, { duration: 6000 });
    };

    scheduleSend(executeSend);
    setTo("");
    setSubject("");
    setBody("");
    setOriginalUserText("");
    setHasGenerated(false);
    setLinkUrl("");
    setLinkText("");
    setAttachments([]);
    setOpen(false);
    setIsSending(false);
  };

  const handleScheduleSend = () => {
    if (!to.trim()) {
      toast.error("Please enter at least one recipient");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    const bodyContent = bodyEditableRef.current?.innerHTML || body;
    if (
      !bodyContent?.trim() ||
      bodyContent === "<br>" ||
      bodyContent === "<div><br></div>"
    ) {
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
      to: to.split(",").map((e) => e.trim()),
      subject: subject.trim(),
      body: bodyContent.trim(),
      trackOpens,
    };
    scheduleSendMutation.mutate({
      accountId: validAccountId,
      scheduledAt,
      payload,
    });
  };

  const isButtonDisabled = accountsLoading || !hasValidAccount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isButtonDisabled}
          className="border-orange-500/30 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-white transition-all hover:shadow-lg hover:shadow-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="mr-2 size-4 text-white" />
          Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-7xl overflow-y-auto border-slate-800 bg-[#0a0a0a] p-4 text-white [-ms-overflow-style:none] [scrollbar-width:none] md:p-6 [&::-webkit-scrollbar]:hidden">
        <DialogHeader className="mb-4 md:mb-6">
          <DialogTitle className="text-lg font-bold text-white md:text-xl">
            Compose Email
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="to"
              className="text-sm font-medium text-white md:text-base"
            >
              To
            </Label>
            <Input
              id="to"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={isSending}
              className="h-11 border-white/10 bg-white/5 text-base text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 md:h-10 md:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="subject"
              className="text-sm font-medium text-white md:text-base"
            >
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              className="h-11 border-white/10 bg-white/5 text-base text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 md:h-10 md:text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="body"
                className="text-sm font-medium text-white md:text-base"
              >
                Body
              </Label>
              <span className="hidden text-xs text-muted-foreground md:inline">
                Press{" "}
                {typeof navigator !== "undefined" &&
                  navigator.platform.toUpperCase().indexOf("MAC") >= 0
                  ? "Cmd+J"
                  : "Alt+J"}{" "}
                to auto-generate
              </span>
            </div>
            <div className="relative">
              <div
                ref={bodyEditableRef}
                contentEditable={!isSending && !isGenerating}
                suppressContentEditableWarning
                onInput={(e) => {
                  setIsUserTyping(true);
                  const html = e.currentTarget.innerHTML;
                  setBody(html);
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsUserTyping(false);
                  }, 500);
                }}
                onBlur={() => {
                  setIsUserTyping(false);
                }}
                onFocus={() => {
                  setIsUserTyping(true);
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    const textNode = document.createTextNode(text);
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }
                  const html = e.currentTarget.innerHTML;
                  setBody(html);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                      const range = selection.getRangeAt(0);
                      const br = document.createElement("br");
                      range.deleteContents();
                      range.insertNode(br);
                      range.setStartAfter(br);
                      range.collapse(true);
                      selection.removeAllRanges();
                      selection.addRange(range);
                      const html = e.currentTarget.innerHTML;
                      setBody(html);
                    }
                  }
                }}
                className="min-h-[250px] w-full resize-none overflow-y-auto rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white ring-offset-background [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-gray-400 focus-visible:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[200px] md:px-3 md:py-2 md:text-sm [&::-webkit-scrollbar]:hidden [&_a:hover]:text-[#0052a3] [&_a]:cursor-pointer [&_a]:text-[#0066cc] [&_a]:underline"
                style={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
                data-placeholder="Email body (HTML supported). Press Alt+J (Windows) or Cmd+J (Mac) to auto-generate based on subject and your text."
              />
              {!body && !isGenerating && (
                <div
                  className="pointer-events-none absolute left-4 top-3 text-sm text-gray-400 md:left-3 md:top-2"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  <span className="md:hidden">Tap to write your email...</span>
                  <span className="hidden md:inline">
                    Email body (HTML supported). Press Alt+J (Windows) or Cmd+J
                    (Mac) to auto-generate based on subject and your text.
                  </span>
                </div>
              )}
              {isGenerating && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border border-input bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {isRegenerating
                          ? "Generating a new version..."
                          : "AI is crafting your email..."}
                      </p>
                      <div className="mt-1.5 flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {hasGenerated && !isGenerating && (
              <p className="hidden text-xs text-muted-foreground md:block">
                💡 Press{" "}
                {typeof navigator !== "undefined" &&
                  navigator.platform.toUpperCase().indexOf("MAC") >= 0
                  ? "Cmd+J"
                  : "Alt+J"}{" "}
                again to generate a different version
              </p>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4 md:mt-2 md:space-y-2 md:pt-3">
              <div className="text-sm font-semibold text-white md:text-xs md:font-medium md:text-muted-foreground">
                Attached Files ({attachments.length})
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm md:gap-2 md:rounded-md md:bg-muted/50 md:px-3 md:py-2"
                  >
                    <Paperclip className="size-5 text-green-500 md:size-4 md:text-muted-foreground" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-white md:text-foreground">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-400 md:text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 flex-shrink-0 p-0 hover:bg-red-500/10 md:h-6 md:w-6"
                      onClick={() => handleRemoveAttachment(index)}
                      disabled={isSending}
                    >
                      <X className="size-4 text-gray-400 hover:text-red-400 md:size-3 md:text-muted-foreground md:hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 md:flex md:flex-wrap md:items-center md:gap-2 md:border-t md:pt-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFolderSelect}
              // @ts-expect-error - webkitdirectory is a valid HTML attribute for folder selection
              webkitdirectory=""
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSending || isGenerating}
              className="flex h-12 items-center justify-center gap-2 border-white/20 bg-white/5 text-white transition-all hover:border-white/30 hover:bg-white/10 md:h-9 md:justify-start md:gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="size-4 text-green-500" />
              <span className="text-sm font-medium md:text-xs">
                Attach Files
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSending || isGenerating}
              className="flex h-12 items-center justify-center gap-2 border-white/20 bg-white/5 text-white transition-all hover:border-white/30 hover:bg-white/10 md:h-9 md:justify-start md:gap-1.5"
              onClick={() => folderInputRef.current?.click()}
            >
              <Folder className="size-4 text-blue-500" />
              <span className="text-sm font-medium md:text-xs">
                Attach Folder
              </span>
            </Button>

            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSending || isGenerating}
                  className="flex h-12 items-center justify-center gap-2 border-white/20 bg-white/5 text-white transition-all hover:border-white/30 hover:bg-white/10 md:h-9 md:justify-start md:gap-1.5"
                >
                  <Link className="size-4 text-blue-500" />
                  <span className="text-sm font-medium md:text-xs">
                    Insert Link
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-800 bg-[#0a0a0a] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Insert Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link-text">Link Text</Label>
                    <Input
                      id="link-text"
                      placeholder="Click here"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLinkDialogOpen(false);
                        setLinkUrl("");
                        setLinkText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (linkUrl && linkText) {
                          const formattedUrl =
                            linkUrl.startsWith("http://") ||
                              linkUrl.startsWith("https://")
                              ? linkUrl
                              : `https://${linkUrl}`;

                          const linkHtml = `<a href="${formattedUrl}" style="color: #0066cc; text-decoration: underline; cursor: pointer;">${linkText}</a>`;
                          const cursorPos =
                            bodyTextareaRef.current?.selectionStart ||
                            body.length;

                          if (bodyEditableRef.current) {
                            bodyEditableRef.current.focus();

                            const selection = window.getSelection();
                            let range: Range;

                            if (
                              selection &&
                              selection.rangeCount > 0 &&
                              bodyEditableRef.current.contains(
                                selection.anchorNode,
                              )
                            ) {
                              range = selection.getRangeAt(0);
                            } else {
                              range = document.createRange();
                              range.selectNodeContents(bodyEditableRef.current);
                              range.collapse(false);
                            }

                            const hasContentBefore =
                              range.startOffset > 0 ||
                              (range.startContainer.nodeType ===
                                Node.TEXT_NODE &&
                                range.startContainer.textContent &&
                                range.startContainer.textContent.trim().length >
                                0);

                            if (
                              hasContentBefore &&
                              range.startContainer.nodeType === Node.TEXT_NODE
                            ) {
                              const textBefore =
                                range.startContainer.textContent || "";
                              const charBefore =
                                textBefore[range.startOffset - 1];
                              if (
                                charBefore &&
                                charBefore !== " " &&
                                charBefore !== "\n"
                              ) {
                                const spaceNode = document.createTextNode(" ");
                                range.insertNode(spaceNode);
                                range.setStartAfter(spaceNode);
                              }
                            }

                            range.deleteContents();

                            const linkElement = document.createElement("a");
                            linkElement.href = formattedUrl;
                            linkElement.style.color = "#0066cc";
                            linkElement.style.textDecoration = "underline";
                            linkElement.style.cursor = "pointer";
                            linkElement.textContent = linkText;

                            range.insertNode(linkElement);

                            range.setStartAfter(linkElement);
                            range.collapse(true);

                            if (selection) {
                              selection.removeAllRanges();
                              selection.addRange(range);
                            }

                            setBody(bodyEditableRef.current.innerHTML);
                          } else {
                            const newBody =
                              body.slice(0, cursorPos) +
                              linkHtml +
                              body.slice(cursorPos);
                            setBody(newBody);
                          }
                          setLinkDialogOpen(false);
                          setLinkUrl("");
                          setLinkText("");
                          toast.success("Link inserted");

                          setTimeout(() => {
                            bodyEditableRef.current?.focus();
                          }, 0);
                        } else {
                          toast.error("Please enter both link text and URL");
                        }
                      }}
                    >
                      Insert
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Popover open={emojiPopoverOpen} onOpenChange={setEmojiPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSending || isGenerating}
                  className="hidden items-center gap-1.5 md:flex"
                >
                  <Smile className="size-4 text-yellow-500" />
                  <span className="text-xs">Emoji</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Common Emojis</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      "😀",
                      "😊",
                      "👍",
                      "❤️",
                      "🎉",
                      "✅",
                      "🔥",
                      "💯",
                      "🚀",
                      "⭐",
                      "💡",
                      "🎯",
                      "🙏",
                      "👏",
                      "🎊",
                      "✨",
                      "💪",
                      "🌟",
                      "😎",
                      "🤝",
                      "📧",
                      "📝",
                      "📅",
                      "⏰",
                    ].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          if (bodyEditableRef.current) {
                            bodyEditableRef.current.focus();

                            const selection = window.getSelection();
                            let range: Range;

                            if (
                              selection &&
                              selection.rangeCount > 0 &&
                              bodyEditableRef.current.contains(
                                selection.anchorNode,
                              )
                            ) {
                              range = selection.getRangeAt(0);
                            } else {
                              range = document.createRange();
                              range.selectNodeContents(bodyEditableRef.current);
                              range.collapse(false);
                            }

                            range.deleteContents();
                            const textNode = document.createTextNode(
                              emoji + " ",
                            );
                            range.insertNode(textNode);
                            range.setStartAfter(textNode);
                            range.collapse(true);

                            if (selection) {
                              selection.removeAllRanges();
                              selection.addRange(range);
                            }

                            setBody(bodyEditableRef.current.innerHTML);
                          } else {
                            const cursorPos =
                              bodyTextareaRef.current?.selectionStart ||
                              body.length;
                            const newBody =
                              body.slice(0, cursorPos) +
                              emoji +
                              " " +
                              body.slice(cursorPos);
                            setBody(newBody);
                          }
                          setEmojiPopoverOpen(false);

                          setTimeout(() => {
                            bodyEditableRef.current?.focus();
                          }, 0);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-md border text-lg hover:bg-accent hover:text-accent-foreground"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSending || isGenerating}
              onClick={() => {
                const signatureName =
                  account?.name || account?.emailAddress || "User";

                if (bodyEditableRef.current) {
                  bodyEditableRef.current.focus();

                  const selection = window.getSelection();
                  let range: Range;

                  if (
                    selection &&
                    selection.rangeCount > 0 &&
                    bodyEditableRef.current.contains(selection.anchorNode)
                  ) {
                    range = selection.getRangeAt(0);
                  } else {
                    range = document.createRange();
                    range.selectNodeContents(bodyEditableRef.current);
                    range.collapse(false);
                  }

                  const currentContent =
                    bodyEditableRef.current.innerHTML.trim();
                  if (
                    currentContent &&
                    !currentContent.endsWith("<br>") &&
                    !currentContent.endsWith("</p>") &&
                    !currentContent.endsWith("</div>")
                  ) {
                    const br = document.createElement("br");
                    range.insertNode(br);
                    range.setStartAfter(br);
                  }

                  const br1 = document.createElement("br");
                  const br2 = document.createElement("br");
                  const text1 = document.createTextNode("Best regards,");
                  const br3 = document.createElement("br");
                  const text2 = document.createTextNode(signatureName);

                  range.insertNode(br1);
                  range.setStartAfter(br1);
                  range.insertNode(br2);
                  range.setStartAfter(br2);
                  range.insertNode(text1);
                  range.setStartAfter(text1);
                  range.insertNode(br3);
                  range.setStartAfter(br3);
                  range.insertNode(text2);

                  range.setStartAfter(text2);
                  range.collapse(true);

                  if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }

                  setBody(bodyEditableRef.current.innerHTML);
                } else {
                  const signature = `<br><br>Best regards,<br>${signatureName}`;
                  const cursorPos =
                    bodyTextareaRef.current?.selectionStart || body.length;
                  const newBody =
                    body.slice(0, cursorPos) +
                    signature +
                    body.slice(cursorPos);
                  setBody(newBody);
                }
                toast.success("Signature inserted");
                setTimeout(() => {
                  bodyEditableRef.current?.focus();
                }, 0);
              }}
              className="flex h-12 items-center justify-center gap-2 border-white/20 bg-white/5 text-white transition-all hover:border-white/30 hover:bg-white/10 md:h-9 md:justify-start md:gap-1.5"
            >
              <FileSignature className="size-4 text-white" />
              <span className="text-sm font-medium md:text-xs">
                Insert Signature
              </span>
            </Button>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3 md:pt-2">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={trackOpens}
                onCheckedChange={(c) => setTrackOpens(c === true)}
                disabled={isSending || isGenerating}
                className="mt-0.5 border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <span className="text-zinc-300">
                Track when this email is opened
              </span>
            </label>
            <p className="text-xs text-zinc-500 md:ml-7">
              Adds a small image that loads when the recipient opens the email.
              Some email clients block images. Open tracking may not work in all
              clients.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:items-center md:justify-end md:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsGenerating(false);
                setIsRegenerating(false);
                setOpen(false);
              }}
              disabled={isSending}
              className="h-12 w-full border-white/20 bg-white/5 text-base font-medium text-white transition-all hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:w-auto md:flex-initial md:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAIGenerate}
              disabled={isSending || isGenerating}
              className="h-12 w-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-200 hover:from-purple-700 hover:via-purple-500 hover:to-amber-500 hover:shadow-xl hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none md:hidden"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-white" />
                  Generate
                </span>
              )}
            </Button>
            <Popover open={scheduleSendOpen} onOpenChange={setScheduleSendOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSending || isGenerating}
                  className="h-12 shrink-0 border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/20 md:h-10"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="md:hidden">Schedule</span>
                  <span className="hidden md:inline">Schedule send</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto min-w-[280px] border-slate-800 bg-[#0a0a0a] p-6 text-white"
                align="end"
              >
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
                    onClick={handleScheduleSend}
                    disabled={
                      scheduleSendMutation.isPending || !authLoaded || !userId
                    }
                    className="w-full py-2.5 bg-amber-500 font-medium text-black hover:bg-amber-600"
                  >
                    {!authLoaded || !userId
                      ? "Loading..."
                      : scheduleSendMutation.isPending
                        ? "Scheduling..."
                        : "Schedule send"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleSend}
              disabled={isSending || isGenerating}
              className="h-12 w-full bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none md:h-10 md:w-auto md:flex-initial md:text-sm"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span className="md:hidden">Sending...</span>
                  <span className="hidden md:inline">Sending...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4 text-white" />
                  <span className="md:hidden">Send</span>
                  <span className="hidden md:inline">Send Email</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
