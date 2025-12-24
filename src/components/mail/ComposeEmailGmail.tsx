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
} from "lucide-react";
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
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [emojiPopoverOpen, setEmojiPopoverOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
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

  const { data: account } = api.account.getMyAccount.useQuery(
    { accountId: validAccountId || "" },
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
        const content = result.content.trim();

        let htmlContent = content;
        if (!content.includes("<") && content.includes("\n\n")) {
          htmlContent = content
            .split(/\n\s*\n/)
            .filter((para) => para.trim().length > 0)
            .map((para) => {
              const formatted = para.trim().replace(/\n/g, "<br>");
              return `<p style="margin: 0 0 12px 0; line-height: 1.6;">${formatted}</p>`;
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

    setIsSending(true);

    try {
      const bodyContent = bodyEditableRef.current?.innerHTML || body;

      let response: Response;

      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append("accountId", validAccountId);
        formData.append(
          "to",
          JSON.stringify(to.split(",").map((email) => email.trim())),
        );
        formData.append("subject", subject.trim());
        formData.append("body", bodyContent.trim());

        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        response = await fetch("/api/email/send", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: validAccountId,
            to: to.split(",").map((email) => email.trim()),
            subject: subject.trim(),
            body: bodyContent.trim(),
          }),
        });
      }

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        toast.error("Failed to parse server response. Please try again.");
        return;
      }

      if (!response.ok) {
        toast.error(data.message || data.error || "Failed to send email");
        if (data.hint) {
          toast.info(data.hint, { duration: 5000 });
        }
        return;
      }

      if (data.warning) {
        toast.warning(data.warning, { duration: 6000 });
      } else {
        toast.success("Email sent successfully");
      }

      setTo("");
      setSubject("");
      setBody("");
      setOriginalUserText("");
      setHasGenerated(false);
      setLinkUrl("");
      setLinkText("");
      setAttachments([]);
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
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-7xl overflow-y-auto border-slate-800 bg-[#0a0a0a] text-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader>
          <DialogTitle className="text-white">Compose Email</DialogTitle>
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
                className="min-h-[200px] w-full resize-none overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-scrollbar]:hidden [&_a:hover]:text-[#0052a3] [&_a]:cursor-pointer [&_a]:text-[#0066cc] [&_a]:underline"
                style={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
                data-placeholder="Email body (HTML supported). Press Alt+J (Windows) or Cmd+J (Mac) to auto-generate based on subject and your text."
              />
              {!body && (
                <div
                  className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  Email body (HTML supported). Press Alt+J (Windows) or Cmd+J
                  (Mac) to auto-generate based on subject and your text.
                </div>
              )}
            </div>
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

          {attachments.length > 0 && (
            <div className="mt-2 space-y-2 border-t pt-3">
              <div className="text-xs font-medium text-muted-foreground">
                Attached Files ({attachments.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm"
                  >
                    <Paperclip className="size-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                      onClick={() => handleRemoveAttachment(index)}
                      disabled={isSending}
                    >
                      <X className="size-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
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
              className="flex items-center gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="size-4 text-green-500" />
              <span className="text-xs">Attach Files</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSending || isGenerating}
              className="flex items-center gap-1.5"
              onClick={() => folderInputRef.current?.click()}
            >
              <Folder className="size-4 text-blue-500" />
              <span className="text-xs">Attach Folder</span>
            </Button>

            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSending || isGenerating}
                  className="flex items-center gap-1.5"
                >
                  <Link className="size-4 text-blue-500" />
                  <span className="text-xs">Insert Link</span>
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
                  className="flex items-center gap-1.5"
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
              className="flex items-center gap-1.5"
            >
              <FileSignature className="size-4" />
              <span className="text-xs">Insert Signature</span>
            </Button>
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
              className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-white"
            >
              {isSending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 size-4 text-white" />
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
