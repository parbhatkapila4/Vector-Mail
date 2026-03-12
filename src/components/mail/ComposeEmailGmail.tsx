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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pencil,
  Send,
  Link,
  FileSignature,
  Paperclip,
  X,
  Folder,
  ChevronDown,
  Clock,
  Wand2,
  Plus,
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
import { appendVectorMailSignature } from "@/lib/vectormail-signature";
import { usePendingSend } from "@/contexts/PendingSendContext";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useIsMobile } from "@/hooks/use-mobile";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";

const AI_GENERATE_TIMEOUT_MS = 60_000;

const DEMO_COMPOSE = {
  to: "teammate@company.com",
  subject: "Quick sync on the Q3 roadmap",
  body: "<p>Hi,</p><p>Wanted to loop you in on the Q3 roadmap draft. Can you review the attached doc and share feedback by Friday?</p><p>Thanks,</p>",
};

interface ComposeEmailGmailProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

async function generateEmailViaApi(
  context: string,
  prompt: string,
  signal?: AbortSignal,
  onChunk?: (text: string) => void,
): Promise<{ content: string }> {
  const res = await fetch("/api/generate-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, prompt, mode: "compose", stream: !!onChunk }),
    signal,
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data.error as string) || `Request failed: ${res.status}`,
    );
  }

  if (onChunk && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let content = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        content += text;
        onChunk(text);
      }
    } finally {
      reader.releaseLock();
    }
    return { content };
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
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
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

  const isDemo = useDemoMode() && validAccountId === DEMO_ACCOUNT_ID;
  const { isLoaded: authLoaded, userId } = useAuth();
  const { scheduleSend } = usePendingSend();

  useEffect(() => {
    if (open && isDemo) {
      setTo(DEMO_COMPOSE.to);
      setSubject(DEMO_COMPOSE.subject);
      setBody(DEMO_COMPOSE.body);
    }
  }, [open, isDemo]);
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

      let accumulated = "";

      const result = await generateEmailViaApi(
        context,
        prompt,
        controller.signal,
        (chunk) => {
          accumulated += chunk;
          const interimHtml = accumulated
            .replace(/\n\n/g, "</p><p style=\"margin: 0 0 12px 0; line-height: 1.6;\">")
            .replace(/\n/g, "<br>");
          const wrapped = `<p style="margin: 0 0 12px 0; line-height: 1.6;">${interimHtml || "&nbsp;"}</p>`;
          setBody(wrapped);
          if (bodyEditableRef.current) {
            isExternalUpdate.current = true;
            bodyEditableRef.current.innerHTML = wrapped;
          }
        },
      );

      clearTimeout(timeoutId);

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
    if (isDemo) {
      toast.info("You're exploring with sample data. Request access to connect your Gmail and send real emails.");
      return;
    }
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

    const toSend = to.trim();
    const subjectSend = subject.trim();
    const bodyWithSignature = appendVectorMailSignature(bodyContent.trim(), true);

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
        formData.append("body", bodyWithSignature);
        formData.append("trackOpens", String(trackOpens));
        if (cc.trim()) formData.append("cc", JSON.stringify(cc.split(",").map((e) => e.trim()).filter(Boolean)));
        if (bcc.trim()) formData.append("bcc", JSON.stringify(bcc.split(",").map((e) => e.trim()).filter(Boolean)));
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
            cc: cc.trim() ? cc.split(",").map((e) => e.trim()).filter(Boolean) : undefined,
            bcc: bcc.trim() ? bcc.split(",").map((e) => e.trim()).filter(Boolean) : undefined,
            subject: subjectSend.trim(),
            body: bodyWithSignature,
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
      toast.success("Email sent");
      setTo("");
      setCc("");
      setBcc("");
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
    scheduleSend(executeSend);
    setOpen(false);
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
      body: appendVectorMailSignature(bodyContent.trim(), true),
      trackOpens,
    };
    scheduleSendMutation.mutate({
      accountId: validAccountId,
      scheduledAt,
      payload,
    });
  };

  const isButtonDisabled = accountsLoading || !hasValidAccount;
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isButtonDisabled}
          className="rounded-full bg-[#1a73e8] px-6 py-2 text-[14px] font-medium text-white shadow-none transition-colors hover:bg-[#1765cc] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
        >
          <Pencil className="mr-2 size-4" />
          Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-0 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_32px_64px_-12px_rgba(0,0,0,0.5)] [-ms-overflow-style:none] [scrollbar-width:none] md:h-auto md:max-h-[85vh] md:max-w-[600px] [&::-webkit-scrollbar]:hidden [&>button]:hidden">


        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <span className="text-[15px] font-semibold tracking-tight text-white">New message</span>
          <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#8e8e93] transition-colors hover:bg-white/[0.06] hover:text-white" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>


        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-5 py-3">
          <span className="w-6 shrink-0 text-[13px] text-[#8e8e93]">To</span>
          <Input
            id="to"
            placeholder="Enter email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={isSending}
            className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-white placeholder:text-[#52525b] focus-visible:ring-0"
          />
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setShowCcBcc(!showCcBcc)} className="text-[13px] font-medium text-[#8e8e93] transition-colors hover:text-[#afafb3]">Cc</button>
            <button type="button" onClick={() => setShowCcBcc(!showCcBcc)} className="text-[13px] font-medium text-[#8e8e93] transition-colors hover:text-[#afafb3]">Bcc</button>
          </div>
        </div>
        {showCcBcc && (
          <>
            <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
              <span className="w-12 shrink-0 text-[13px] text-[#8e8e93]">Cc</span>
              <Input placeholder="Cc" value={cc} onChange={(e) => setCc(e.target.value)} disabled={isSending} className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-white placeholder:text-[#52525b] focus-visible:ring-0" />
            </div>
            <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
              <span className="w-12 shrink-0 text-[13px] text-[#8e8e93]">Bcc</span>
              <Input placeholder="Bcc" value={bcc} onChange={(e) => setBcc(e.target.value)} disabled={isSending} className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-white placeholder:text-[#52525b] focus-visible:ring-0" />
            </div>
          </>
        )}


        <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <span className="w-12 shrink-0 text-[13px] text-[#8e8e93]">Subject</span>
          <Input
            id="subject"
            placeholder="Re: Design review feedback"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
            className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-white placeholder:text-[#52525b] focus-visible:ring-0"
          />
        </div>


        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={bodyEditableRef}
            contentEditable={!isSending && !isGenerating}
            suppressContentEditableWarning
            onInput={(e) => {
              setIsUserTyping(true);
              const html = e.currentTarget.innerHTML;
              setBody(html);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setIsUserTyping(false), 500);
            }}
            onBlur={() => setIsUserTyping(false)}
            onFocus={() => setIsUserTyping(true)}
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
              setBody(e.currentTarget.innerHTML);
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
                  setBody(e.currentTarget.innerHTML);
                }
              }
            }}
            className="min-h-[280px] flex-1 overflow-y-auto bg-[#0c0c0e] px-5 py-5 text-[15px] leading-[1.6] text-[#e5e5e7] [-ms-overflow-style:none] [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden [&_a]:text-[#5c9eff] [&_a]:underline [&_a]:decoration-[#5c9eff]/40"
            style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
          />
          {!body && !isGenerating && (
            <div className="pointer-events-none absolute left-5 top-5 text-[15px] text-[#6e6e73]">
              Write your message…
            </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0c0c0e]/98 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/[0.1] border-t-[#5c9eff]" />
                <span className="text-[14px] font-medium text-[#afafb3]">{isRegenerating ? "Regenerating…" : "Generating…"}</span>
              </div>
            </div>
          )}
        </div>


        {attachments.length > 0 && (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-white/[0.06] px-5 py-3">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-3 py-2 text-[13px]">
                <Paperclip className="h-3.5 w-3.5 text-[#8e8e93]" />
                <span className="max-w-[120px] truncate text-[#e5e5e7]">{file.name}</span>
                <span className="text-[13px] text-[#6e6e73]">{formatFileSize(file.size)}</span>
                <button type="button" onClick={() => handleRemoveAttachment(index)} disabled={isSending} className="rounded p-0.5 text-[#6e6e73] transition-colors hover:bg-white/[0.06] hover:text-[#e5e5e7]">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}


        <div className="flex shrink-0 items-center gap-1 border-t border-white/[0.06] px-5 py-3 max-md:overflow-x-auto max-md:flex-nowrap">
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
          <input ref={folderInputRef} type="file" multiple className="hidden" onChange={handleFolderSelect}
            // @ts-expect-error - webkitdirectory is valid for folder selection
            webkitdirectory=""
          />


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" disabled={isSending || isGenerating} className="flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-[#afafb3] transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50">
                <Plus className="h-4 w-4" /> Add
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px] rounded-xl border-white/[0.08] bg-[#141416]">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="text-[14px] text-[#e5e5e7] focus:bg-white/[0.06] focus:text-white">
                <Paperclip className="mr-3 h-4 w-4" /> Attach files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => folderInputRef.current?.click()} className="text-[14px] text-[#e5e5e7] focus:bg-white/[0.06] focus:text-white">
                <Folder className="mr-3 h-4 w-4" /> Attach folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLinkDialogOpen(true)} className="text-[14px] text-[#e5e5e7] focus:bg-white/[0.06] focus:text-white">
                <Link className="mr-3 h-4 w-4" /> Insert link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          <button
            type="button"
            disabled={isSending || isGenerating}
            onClick={() => {
              const signatureName = account?.name || account?.emailAddress || "User";
              if (bodyEditableRef.current) {
                bodyEditableRef.current.focus();
                const sel = window.getSelection();
                let range: Range;
                if (sel && sel.rangeCount > 0 && bodyEditableRef.current.contains(sel.anchorNode)) { range = sel.getRangeAt(0); }
                else { range = document.createRange(); range.selectNodeContents(bodyEditableRef.current); range.collapse(false); }
                const c = bodyEditableRef.current.innerHTML.trim();
                if (c && !c.endsWith("<br>") && !c.endsWith("</p>") && !c.endsWith("</div>")) { const br = document.createElement("br"); range.insertNode(br); range.setStartAfter(br); }
                [document.createElement("br"), document.createElement("br")].forEach(n => { range.insertNode(n); range.setStartAfter(n); });
                const t1 = document.createTextNode("Best regards,"); range.insertNode(t1); range.setStartAfter(t1);
                const br3 = document.createElement("br"); range.insertNode(br3); range.setStartAfter(br3);
                const t2 = document.createTextNode(signatureName); range.insertNode(t2); range.setStartAfter(t2);
                range.collapse(true);
                if (sel) { sel.removeAllRanges(); sel.addRange(range); }
                setBody(bodyEditableRef.current.innerHTML);
              }
              toast.success("Signature inserted");
              bodyEditableRef.current?.focus();
            }}
            className="flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-[#afafb3] transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
          >
            <FileSignature className="h-4 w-4" /> Signature
          </button>


          <button
            type="button"
            disabled={isSending || isGenerating}
            onClick={() => setEmojiPopoverOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[18px] transition-colors hover:bg-white/[0.06] disabled:opacity-50"
            title="Insert emoji"
          >
            😊
          </button>


          <div className="min-w-2 flex-1 md:min-w-0" />


          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || isGenerating || isDemo}
              className="flex h-9 items-center justify-center gap-2 rounded-l-lg rounded-r-none border-r border-white/20 bg-[#2c7ff6] px-4 text-[14px] font-semibold leading-none text-white transition-colors hover:bg-[#1a6fe8] disabled:opacity-50"
            >
              <Send className="h-4 w-4 shrink-0" />
              <span className="leading-none">Send</span>
              <kbd className="inline-flex translate-y-[1px] items-center justify-center text-[11px] font-normal leading-none opacity-75">⌘↵</kbd>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isSending || isGenerating}
                  className="flex h-9 w-9 items-center justify-center rounded-r-lg bg-[#2c7ff6] text-white transition-colors hover:bg-[#1a6fe8] disabled:opacity-50"
                  aria-label="More send options"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl border-white/[0.08] bg-[#141416]">
                {isMobile && (
                  <DropdownMenuItem onClick={() => handleAIGenerate()} disabled={isSending || isGenerating} className="text-[14px] text-[#e5e5e7] focus:bg-white/[0.06] focus:text-white">
                    <Wand2 className="mr-3 h-4 w-4" /> Generate with AI
                  </DropdownMenuItem>
                )}
                {isMobile && <div className="my-1 border-t border-white/[0.06]" />}
                <DropdownMenuItem onClick={() => setScheduleSendOpen(true)} disabled={isSending || isGenerating} className="text-[14px] text-[#e5e5e7] focus:bg-white/[0.06] focus:text-white">
                  <Clock className="mr-3 h-4 w-4" /> Schedule send
                </DropdownMenuItem>
                <div className="my-1 border-t border-white/[0.06]" />
                <label className="flex cursor-pointer items-center gap-3 px-2 py-2.5 text-[14px] text-[#e5e5e7] hover:bg-white/[0.06]">
                  <input type="checkbox" checked={trackOpens} onChange={(e) => setTrackOpens(e.target.checked)} disabled={isSending || isGenerating} className="h-3.5 w-3.5 rounded border-[#3f3f46] bg-transparent text-[#3b82f6]" />
                  Track when opened
                </label>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>


          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={isSending || isGenerating}
            className="ml-3 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.02] px-4 text-[14px] font-semibold text-[#e5e5e7] transition-colors hover:border-white/[0.2] hover:bg-white/[0.06] disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            Generate
          </button>
        </div>

        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="rounded-2xl border-white/[0.08] bg-[#141416] text-white">
            <DialogHeader>
              <DialogTitle className="text-[15px] text-white">Insert Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="link-text" className="text-[13px] text-[#a1a1aa]">Text</Label>
                <Input id="link-text" placeholder="Click here" value={linkText} onChange={(e) => setLinkText(e.target.value)} className="border-white/[0.08] bg-white/[0.04] text-white placeholder:text-[#6e6e73] focus-visible:ring-[#2c7ff6]/40" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="link-url" className="text-[13px] text-[#a1a1aa]">URL</Label>
                <Input id="link-url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="border-white/[0.08] bg-white/[0.04] text-white placeholder:text-[#6e6e73] focus-visible:ring-[#2c7ff6]/40" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setLinkDialogOpen(false); setLinkUrl(""); setLinkText(""); }} className="border-white/[0.12] bg-transparent text-[#afafb3] hover:bg-white/[0.06] hover:text-white">Cancel</Button>
                <Button className="bg-[#2c7ff6] text-white hover:bg-[#1a6fe8]"
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
            <button type="button" className="absolute left-0 top-0 h-0 w-0 opacity-0" aria-hidden />
          </PopoverTrigger>
          <PopoverContent className="w-80 rounded-xl border-white/[0.08] bg-[#141416] text-white" align="start">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-[#a1a1aa]">Emojis</Label>
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-white/[0.06]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Dialog open={scheduleSendOpen} onOpenChange={setScheduleSendOpen}>
          <DialogContent className="w-auto min-w-[320px] rounded-2xl border-white/[0.08] bg-[#141416] p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-[16px] font-semibold text-white">Schedule send</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="flex w-full flex-col items-center">
                <Label className="mb-2 block w-full text-center text-[13px] font-medium text-[#a1a1aa]">Date</Label>
                <div className="flex w-full justify-center">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="[--cell-size:1.2rem] rounded-lg border border-white/[0.08] bg-white/[0.02] p-1.5 text-[11px] [&_[data-slot=calendar]]:text-[11px] [&_.rdp-month]:!gap-y-0.5 [&_.rdp-week]:!mt-0.5"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-3 block text-[13px] font-medium text-[#a1a1aa]">Time (24-hour)</Label>
                <TimeInput24 value={scheduleTime} onChange={setScheduleTime} />
              </div>
              <Button
                type="button"
                onClick={handleScheduleSend}
                disabled={scheduleSendMutation.isPending || !authLoaded || !userId}
                className="w-full rounded-lg bg-[#2c7ff6] py-2.5 text-[14px] font-semibold text-white hover:bg-[#1a6fe8]"
              >
                {!authLoaded || !userId ? "Loading..." : scheduleSendMutation.isPending ? "Scheduling..." : "Schedule send"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
