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
import { useLocalStorage } from "usehooks-ts";
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
}: EmailEditorProps) => {
  const [ref] = useAutoAnimate();
  const [accountId] = useLocalStorage("accountId", "");
  const { data: suggestions } = api.account.getEmailSuggestions.useQuery(
    { accountId: accountId, query: "" },
    {
      enabled: !!accountId && accountId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const [expanded, setExpanded] = React.useState(defaultToolbarExpand ?? false);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [displayContent, setDisplayContent] = React.useState("");
  const completeContentRef = React.useRef("");

  const { threads: rawThreads, threadId, account } = useThreads();
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

      toast.info("AI is thinking...", {
        id: "ai-thinking",
        duration: 5000,
      });

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
    extensions: [StarterKit, customText, GhostExtension],
    editorProps: {
      attributes: {
        placeholder: "Write your email here...",
        class: "pyellow pyellow-sm focus:outline-none min-h-full",
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

  return (
    <div className="flex h-full flex-col">
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
            <span className="font-medium text-[#1a73e8] dark:text-[#8ab4f8]">Draft </span>
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
          className={`relative h-full w-full rounded-lg border p-3 text-[#202124] transition-all duration-200 dark:text-[#e8eaed] md:min-h-[300px] md:p-4 ${isGenerating
              ? "border-[#1a73e8] bg-[#1a73e8]/5 ring-2 ring-[#1a73e8]/20 dark:border-[#8ab4f8] dark:bg-[#8ab4f8]/10 dark:ring-[#8ab4f8]/30"
              : "border-[#dadce0] bg-white focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8]/30 dark:border-[#3c4043] dark:bg-[#292a2d] dark:focus-within:border-[#8ab4f8] dark:focus-within:ring-[#8ab4f8]/30"
            }`}
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.commands.focus();
            }
          }}
        >
          <EditorContent
            className="pyellow pyellow-sm h-full w-full max-w-none border-none focus:outline-none [&_.PyellowMirror]:h-full [&_.PyellowMirror]:min-h-full [&_.PyellowMirror]:cursor-text [&_.PyellowMirror]:p-0 [&_.PyellowMirror]:outline-none [&_.PyellowMirror]:focus:outline-none"
            editor={editor}
            placeholder={
              isGenerating
                ? "AI is generating suggestions..."
                : "Write your email here..."
            }
          />
          {isGenerating && (
            <div className="absolute right-2 top-2 flex items-center gap-2 text-xs text-[#1a73e8] dark:text-[#8ab4f8]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#1a73e8]/30 border-t-[#1a73e8] dark:border-[#8ab4f8]/30 dark:border-t-[#8ab4f8]" />
              <span>AI thinking...</span>
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
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-[#1a73e8] dark:text-[#8ab4f8]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#1a73e8]/30 border-t-[#1a73e8] dark:border-[#8ab4f8]/30 dark:border-t-[#8ab4f8]" />
              <span>AI thinking...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Button
            onClick={handleGenerateClick}
            disabled={isGenerating || isSending}
            variant="outline"
            className="h-11 flex-1 border-[#dadce0] text-[#1a73e8] hover:bg-[#1a73e8]/10 dark:border-[#3c4043] dark:text-[#8ab4f8] dark:hover:bg-[#8ab4f8]/15"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
          {onScheduleSend && (
            <Button
              type="button"
              variant="outline"
              disabled={isSending || isScheduling}
              onClick={() => onScheduleSend(editor?.getHTML() ?? "")}
              className="h-11 flex-1 border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#9aa0a6] dark:hover:bg-[#303134]"
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
            disabled={isSending}
            className="h-11 flex-1 bg-[#1a73e8] text-white hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {onScheduleSend && (
            <Button
              type="button"
              variant="outline"
              disabled={isSending || isScheduling}
              onClick={() => onScheduleSend(editor?.getHTML() ?? "")}
              className="border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#9aa0a6] dark:hover:bg-[#303134]"
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
            disabled={isSending}
            className="bg-[#1a73e8] text-white hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;
