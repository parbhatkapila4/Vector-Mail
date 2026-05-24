"use client";
import GhostExtension from "./extensions";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import TipTapMenuBar from "./MenuBar";
import Text from "@tiptap/extension-text";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

const AI_GENERATE_TIMEOUT_MS = 60_000;

async function generateViaApi(
  prompt: string,
  context: string,
  signal?: AbortSignal,
): Promise<{ content: string }> {
  const res = await fetch("/api/generate-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context, mode: "complete" }),
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
import { api, type RouterOutputs } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import TagInput from "./TagInput";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import AIComposeButton from "./AiComposeButton";
import { toast } from "sonner";
import useThreads from "@/hooks/use-threads";
import { MessageCircle } from "lucide-react";

type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];

type OptionType = {
  label: string | React.ReactNode;
  value: string;
};

type EmailEditorProps = {
  toValues: OptionType[];
  ccValues: OptionType[];

  subject: string;
  setSubject: (subject: string) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;

  onToChange: (values: OptionType[]) => void;
  onCcChange: (values: OptionType[]) => void;

  defaultToolbarExpand?: boolean;

  onScheduleSend?: (bodyHtml: string) => void;
  isScheduling?: boolean;
  sendDisabled?: boolean;

  initialBody?: string | null;
  applyDraftKey?: number;
  onEditorReady?: (getBody: () => string) => void;
};

const EmailEditor = ({
  toValues,
  ccValues,
  subject,
  setSubject,
  to,
  handleSend,
  isSending,
  onToChange,
  onCcChange,
  defaultToolbarExpand,
  onScheduleSend,
  isScheduling = false,
  sendDisabled = false,
  initialBody,
  applyDraftKey = 0,
  onEditorReady,
}: EmailEditorProps) => {
  const [ref] = useAutoAnimate();
  const { threads: rawThreads, threadId, account, effectiveAccountId } =
    useThreads();
  const suggestionsAccountId = effectiveAccountId ?? "";
  const { data: suggestions } = api.account.getEmailSuggestions.useQuery(
    { accountId: suggestionsAccountId, query: "" },
    {
      enabled: suggestionsAccountId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const [expanded, setExpanded] = React.useState(defaultToolbarExpand ?? false);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [displayContent, setDisplayContent] = React.useState("");
  const completeContentRef = React.useRef("");
  const threads = rawThreads as Thread[] | undefined;

  const handleGenerateClick = () => {
    if (isGenerating) {
      toast.info("AI is generating, wait...", {
        id: "ai-generating",
        duration: 2000,
      });
      return;
    }

    const currentText = editor?.getText() || "";
    if (currentText.trim()) {
      aiGenerate(currentText);
    } else {
      toast.info("Write some text first, then generate", {
        id: "write-text-first",
        duration: 3000,
      });
    }
  };

  const aiGenerate = async (prompt: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setDisplayContent("");
    completeContentRef.current = "";

    try {
      const thread = threads?.find((t) => t.id === threadId);
      let context = "";

      if (thread?.emails && thread.emails.length > 0) {
        const latestEmail = thread.emails[thread.emails.length - 1];
        if (latestEmail) {
          const emailBody =
            latestEmail.bodySnippet ||
            ("body" in latestEmail && latestEmail.body
              ? latestEmail.body.substring(0, 1000)
              : "") ||
            "";
          context = `EMAIL THREAD CONTEXT FOR REPLY GENERATION:

ORIGINAL EMAIL DETAILS:
Subject: ${latestEmail.subject}
From: ${latestEmail.from.address}

ORIGINAL EMAIL BODY:
${emailBody}

REPLY CONTEXT:
User's Name: ${account?.name || "User"}

INSTRUCTIONS:
You are helping compose a reply to the above email. The user has started typing: "${prompt}"

Generate a complete email body starting with what the user has typed. Use \\n\\n between paragraphs. Do not include subject lines. Keep it concise.`;
        }
      } else {
        context = `EMAIL COMPOSITION CONTEXT:

User's Name: ${account?.name || "User"}

INSTRUCTIONS:
You are helping compose a new email. The user has started typing: "${prompt}"

Generate a complete email body starting with what the user has typed. Use \\n\\n between paragraphs. Do not include subject lines. Keep it concise.`;
      }

      const timeoutWarning = setTimeout(() => {
        if (isGenerating) {
          toast.warning("AI is taking longer than expected. Please wait...", {
            id: "ai-timeout-warning",
            duration: 3000,
          });
        }
      }, 15000);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        AI_GENERATE_TIMEOUT_MS,
      );
      let result: { content: string };
      try {
        result = await generateViaApi(prompt, context, controller.signal);
      } finally {
        clearTimeout(timeoutId);
      }
      clearTimeout(timeoutWarning);

      const fullGeneration = result.content || "";

      if (fullGeneration.trim()) {
        completeContentRef.current = fullGeneration;
        setDisplayContent(fullGeneration);
        toast.success("AI suggestion ready!", {
          id: "ai-ready",
          duration: 2000,
        });
      } else {
        toast.error("AI generated empty response. Please try again.");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      const isAbort =
        error instanceof DOMException && error.name === "AbortError";
      const errorMessage =
        isAbort || (error instanceof Error && error.message.includes("timeout"))
          ? "Generation timed out. Please try again with a shorter prompt."
          : error instanceof Error
            ? error.message
            : "AI generation failed. Try again.";
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          if (isGenerating) {
            toast.info("AI is generating, wait...", {
              id: "ai-generating",
              duration: 2000,
            });
            return true;
          }

          const currentText = this.editor.getText();
          if (currentText.trim()) {
            aiGenerate(currentText);
          } else {
            toast.info("Write some text first, then press Alt+J", {
              id: "write-text-first",
              duration: 3000,
            });
          }
          return true;
        },
        "Alt-j": () => {
          if (isGenerating) {
            toast.info("AI is generating, wait...", {
              id: "ai-generating",
              duration: 2000,
            });
            return true;
          }

          const currentText = this.editor.getText();
          if (currentText.trim()) {
            aiGenerate(currentText);
          } else {
            toast.info("Write some text first, then press Alt+J", {
              id: "write-text-first",
              duration: 3000,
            });
          }
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [StarterKit, customText, GhostExtension],
    editorProps: {
      attributes: {
        placeholder: "Write your email here...",
        class: "prose prose-sm focus:outline-none min-h-full",
      },
      handleDOMEvents: {
        mousedown: (view) => {
          view.focus();
          return false;
        },
      },
    },
    onUpdate: () => { },
    onCreate: ({ editor }) => {
      if (editor && !editor.isDestroyed) {
        editor.setOptions({
          autofocus: false,
        });
      }
    },
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        editor &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName || "",
        )
      ) {
        editor.commands.focus();
      }
      if (event.key === "Escape" && editor) {
        editor.commands.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  React.useEffect(() => {
    if (!displayContent || !editor || displayContent.trim() === "") return;

    const formattedHTML = displayContent
      .replace(/\\n/g, "\n")
      .split("\n\n")
      .filter((para) => para.trim())
      .map((para) => `<p>${para.trim()}</p>`)
      .join("");

    editor.commands.setContent(formattedHTML);
    setDisplayContent("");
  }, [displayContent, editor]);

  const onEditorReadyRef = React.useRef(onEditorReady);
  onEditorReadyRef.current = onEditorReady;
  React.useEffect(() => {
    if (editor && !editor.isDestroyed) {
      onEditorReadyRef.current?.(() => editor.getHTML() ?? "");
    }
  }, [editor]);

  React.useEffect(() => {
    if (applyDraftKey > 0 && initialBody != null && initialBody !== "" && editor && !editor.isDestroyed) {
      const html = initialBody.trim().startsWith("<") ? initialBody : initialBody.split("\n\n").map((p) => `<p>${p.trim()}</p>`).join("");
      editor.commands.setContent(html || "<p></p>");
    }
  }, [applyDraftKey, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex border-b border-[#dadce0] bg-[#f6f8fc] p-2 dark:border-[#3c4043] dark:bg-[#292a2d] md:p-3 md:py-2">
        {editor && <TipTapMenuBar editor={editor} />}
      </div>

      <div ref={ref} className="flex-shrink-0 space-y-2 p-3 pb-0 md:p-4">
        {expanded && (
          <>
            <TagInput
              suggestions={
                suggestions?.map((s: { address: string }) => s.address) || []
              }
              value={toValues}
              placeholder="Add tags"
              label="To"
              onChange={onToChange}
            />
            <TagInput
              suggestions={
                suggestions?.map((s: { address: string }) => s.address) || []
              }
              value={ccValues}
              placeholder="Add tags"
              label="Cc"
              onChange={onCcChange}
            />
            <Input
              id="subject"
              className="w-full border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#292a2d]"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed]"
            onClick={() => setExpanded((e) => !e)}
          >
            <span className="font-medium text-[#1a73e8] dark:text-[#1e2a4a]">Draft </span>
            <span>to {to.length > 0 ? to.join(", ") : "..."}</span>
          </div>
          <AIComposeButton
            isComposing={defaultToolbarExpand}
            onGenerate={(content) => {
              completeContentRef.current = content;
              setDisplayContent(content);
            }}
          />
        </div>
      </div>

      <div className="min-h-0 w-full flex-1 overflow-y-auto px-3 py-2 md:px-4 md:py-4">
        <div
          className={`relative h-full w-full min-w-0 overflow-hidden rounded-xl border p-3 text-[#202124] transition-all duration-300 dark:text-[#e8eaed] md:min-h-[300px] md:p-4 ${isGenerating
            ? "border-[#1e2a4a]/25 bg-white shadow-[0_0_0_4px_rgba(30,42,74,0.06),0_8px_24px_rgba(30,42,74,0.06)] dark:border-[#1e2a4a]/40 dark:bg-[#202124]"
            : "border-[#dadce0] bg-white focus-within:border-[#1e2a4a]/40 focus-within:shadow-[0_0_0_3px_rgba(30,42,74,0.08)] dark:border-[#3c4043] dark:bg-[#292a2d] dark:focus-within:border-[#1e2a4a]/50"
            }`}
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.commands.focus();
            }
          }}
        >
          {isGenerating && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden rounded-t-xl"
            >
              <span
                className="block h-full w-1/3"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(30,42,74,0.6) 50%, transparent 100%)",
                  animation: "vm-shimmer 1.6s ease-in-out infinite",
                }}
              />
            </span>
          )}

          <EditorContent
            className="prose prose-sm h-full w-full min-w-0 max-w-none break-words border-none focus:outline-none [&_.ProseMirror]:h-full [&_.ProseMirror]:min-h-full [&_.ProseMirror]:cursor-text [&_.ProseMirror]:p-0 [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_*]:max-w-full [&_.ProseMirror]:[overflow-wrap:anywhere] [&_.ProseMirror]:[word-break:break-word]"
            editor={editor}
            placeholder={
              isGenerating
                ? "AI is generating suggestions..."
                : "Write your email here..."
            }
          />

          {isGenerating && (
            <div
              aria-hidden
              className="pointer-events-none mt-4 space-y-2 select-none"
            >
              <div className="vm-skeleton-line" style={{ width: "82%" }} />
              <div className="vm-skeleton-line" style={{ width: "94%" }} />
              <div className="vm-skeleton-line" style={{ width: "67%" }} />
              <div className="vm-skeleton-line" style={{ width: "78%" }} />
              <div className="vm-skeleton-line" style={{ width: "44%" }} />
            </div>
          )}

          {isGenerating && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-[#1e2a4a]/15 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm dark:border-[#1e2a4a]/40 dark:bg-[#1a1c1e]/90"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1e2a4a]/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1e2a4a]" />
              </span>
              <span className="text-[11px] font-semibold tracking-tight text-[#1e2a4a] dark:text-[#e8eaed]">
                Inbox brain thinking
              </span>
              <span className="ml-0.5 inline-flex items-end gap-0.5">
                <span
                  className="block h-1 w-1 rounded-full bg-[#1e2a4a]/55"
                  style={{ animation: "vm-bounce-dot 1.2s ease-in-out 0ms infinite" }}
                />
                <span
                  className="block h-1 w-1 rounded-full bg-[#1e2a4a]/55"
                  style={{ animation: "vm-bounce-dot 1.2s ease-in-out 150ms infinite" }}
                />
                <span
                  className="block h-1 w-1 rounded-full bg-[#1e2a4a]/55"
                  style={{ animation: "vm-bounce-dot 1.2s ease-in-out 300ms infinite" }}
                />
              </span>
            </div>
          )}
        </div>
      </div>
      <Separator className="bg-[#dadce0] dark:bg-[#3c4043]" />
      <div className="flex flex-shrink-0 flex-col gap-3 border-t border-[#dadce0] bg-[#f6f8fc] px-3 py-3 dark:border-[#3c4043] dark:bg-[#292a2d] md:flex-row md:items-center md:justify-between md:px-4">
        <div className="hidden items-center gap-4 md:flex">
          <span className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            Press{" "}
            <kbd className="rounded border border-[#dadce0] bg-white px-2 py-1 text-xs font-medium text-[#202124] dark:border-[#3c4043] dark:bg-[#202124] dark:text-[#e8eaed]">
              {typeof navigator !== "undefined" &&
                navigator.platform.toLowerCase().includes("mac")
                ? "Cmd + J"
                : "Alt + J"}
            </kbd>
            {typeof navigator !== "undefined" &&
              navigator.platform.toLowerCase().includes("mac") ? (
              <>
                {" "}
                (Windows:{" "}
                <kbd className="rounded border border-[#dadce0] bg-white px-2 py-1 text-xs font-medium text-[#202124] dark:border-[#3c4043] dark:bg-[#202124] dark:text-[#e8eaed]">
                  Alt + J
                </kbd>
                )
              </>
            ) : (
              <>
                {" "}
                (Mac:{" "}
                <kbd className="rounded border border-[#dadce0] bg-white px-2 py-1 text-xs font-medium text-[#202124] dark:border-[#3c4043] dark:bg-[#202124] dark:text-[#e8eaed]">
                  Cmd + J
                </kbd>
                )
              </>
            )}{" "}
            for AI autocomplete
          </span>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            onClick={handleGenerateClick}
            disabled={isGenerating || isSending}
            variant="outline"
            aria-label={isGenerating ? "Generating reply" : "Generate reply with AI"}
            title={isGenerating ? "Generating…" : "Generate with AI"}
            className="h-11 w-11 shrink-0 border-[#dadce0] p-0 text-[#1a73e8] hover:bg-[#1a73e8]/10 dark:border-[#3c4043] dark:text-[#1e2a4a] dark:hover:bg-[#1e2a4a]/15"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          {onScheduleSend && (
            <Button
              type="button"
              variant="outline"
              disabled={isSending || isScheduling || sendDisabled}
              title={sendDisabled ? "Request access to connect your Gmail and send" : "Schedule send"}
              onClick={() => onScheduleSend(editor?.getHTML() ?? "")}
              className="h-11 shrink-0 border-[#dadce0] px-3 text-[12.5px] font-medium text-[#5f6368] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#9aa0a6] dark:hover:bg-[#303134] disabled:opacity-60"
            >
              {isScheduling ? "Scheduling…" : "Schedule"}
            </Button>
          )}
          <Button
            onClick={async () => {
              const content = editor?.getHTML() || "";
              await handleSend(content);
              editor?.commands.clearContent();
            }}
            disabled={isSending || sendDisabled}
            title={sendDisabled ? "Request access to connect your Gmail and send" : undefined}
            className="h-11 flex-1 bg-[#1a73e8] text-white hover:bg-[#1765cc] dark:bg-[#1e2a4a] dark:text-[#202124] dark:hover:bg-[#aecbfa] disabled:opacity-60"
          >
            {isSending ? "Sending…" : "Send"}
          </Button>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {onScheduleSend && (
            <Button
              type="button"
              variant="outline"
              disabled={isSending || isScheduling || sendDisabled}
              title={sendDisabled ? "Request access to connect your Gmail and send" : undefined}
              onClick={() => onScheduleSend(editor?.getHTML() ?? "")}
              className="border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#9aa0a6] dark:hover:bg-[#303134] disabled:opacity-60"
            >
              {isScheduling ? "Scheduling..." : "Schedule send"}
            </Button>
          )}
          <Button
            onClick={async () => {
              const content = editor?.getHTML() || "";
              await handleSend(content);
              editor?.commands.clearContent();
            }}
            disabled={isSending || sendDisabled}
            title={sendDisabled ? "Request access to connect your Gmail and send" : undefined}
            className="bg-[#1a73e8] text-white hover:bg-[#1765cc] dark:bg-[#1e2a4a] dark:text-[#202124] dark:hover:bg-[#aecbfa] disabled:opacity-60"
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;
