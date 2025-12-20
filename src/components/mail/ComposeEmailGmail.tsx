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
import { Pencil, Send, Link, Smile, FileSignature } from "lucide-react";
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
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyEditableRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (bodyEditableRef.current) {
      const currentHtml = bodyEditableRef.current.innerHTML;
      const normalizedCurrent = currentHtml.replace(/\s+/g, " ").trim();
      const normalizedBody = (body || "").replace(/\s+/g, " ").trim();

      if (normalizedCurrent !== normalizedBody) {
        bodyEditableRef.current.innerHTML = body || "";
      }
    }
  }, [body]);

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

    if (!accountId) {
      toast.error("Please select an account");
      return;
    }

    setIsSending(true);

    try {
      const bodyContent = bodyEditableRef.current?.innerHTML || body;

      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          to: to.split(",").map((email) => email.trim()),
          subject: subject.trim(),
          body: bodyContent.trim(),
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
      setLinkUrl("");
      setLinkText("");
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
            <div className="relative">
              <div
                ref={bodyEditableRef}
                contentEditable={!isSending && !isGenerating}
                suppressContentEditableWarning
                onInput={(e) => {
                  const html = e.currentTarget.innerHTML;
                  setBody(html);
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
                dangerouslySetInnerHTML={{ __html: body || "" }}
                className="min-h-[200px] w-full resize-none overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_a:hover]:text-[#0052a3] [&_a]:cursor-pointer [&_a]:text-[#0066cc] [&_a]:underline"
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

          <div className="flex items-center gap-2 border-t pt-3">
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSending || isGenerating}
                  className="flex items-center gap-2"
                >
                  <Link className="size-4" />
                  Insert Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Link</DialogTitle>
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
                          // Ensure URL has protocol
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
                  className="flex items-center gap-2"
                >
                  <Smile className="size-4" />
                  Emoji
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
              className="flex items-center gap-2"
            >
              <FileSignature className="size-4" />
              Insert Signature
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
