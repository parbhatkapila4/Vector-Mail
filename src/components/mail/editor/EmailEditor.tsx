"use client";
import GhostExtension from "./extensions";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import TipTapMenuBar from "./MenuBar";
import Text from "@tiptap/extension-text";
import { Button } from "@/components/ui/button";

import { generate } from "./actions";
import { Separator } from "@/components/ui/separator";
import { api, type RouterOutputs } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import TagInput from "./TagInput";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLocalStorage } from "usehooks-ts";
import AIComposeButton from "./AiComposeButton";
import { toast } from "sonner";
import useThreads from "@/hooks/use-threads";

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
              ? latestEmail.body
              : "") ||
            "";
          context = `EMAIL THREAD CONTEXT FOR REPLY GENERATION:

ORIGINAL EMAIL DETAILS:
Subject: ${latestEmail.subject}
From: ${latestEmail.from.address}
Date: ${latestEmail.sentAt.toLocaleDateString()}

ORIGINAL EMAIL BODY:
${emailBody}

REPLY CONTEXT:
User's Name: ${account?.name || "User"}
User's Email: ${account?.emailAddress || ""}

INSTRUCTIONS:
You are helping compose a reply to the above email. The user has started typing: "${prompt}"

Generate a complete email body starting with what the user has typed. Use \\n\\n between paragraphs. Do not include subject lines.`;
        }
      } else {
        context = `EMAIL COMPOSITION CONTEXT:

User's Name: ${account?.name || "User"}
User's Email: ${account?.emailAddress || ""}

INSTRUCTIONS:
You are helping compose a new email. The user has started typing: "${prompt}"

Generate a complete email body starting with what the user has typed. Use \\n\\n between paragraphs. Do not include subject lines.`;
      }

      toast.info("AI is thinking...", { duration: 2000 });

      const result = await generate(prompt, context);
      const fullGeneration = result.content || "";

      if (fullGeneration.trim()) {
        completeContentRef.current = fullGeneration;
        setDisplayContent(fullGeneration);
        toast.success("AI suggestion ready!", { duration: 2000 });
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("AI generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          if (isGenerating) {
            toast.info("AI is generating, wait...");
            return true;
          }

          const currentText = this.editor.getText();
          if (currentText.trim()) {
            aiGenerate(currentText);
          } else {
            toast.info("Write some text first, then press Alt+J");
          }
          return true;
        },
        "Alt-j": () => {
          if (isGenerating) {
            toast.info("AI is generating, wait...");
            return true;
          }

          const currentText = this.editor.getText();
          if (currentText.trim()) {
            aiGenerate(currentText);
          } else {
            toast.info("Write some text first, then press Alt+J");
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
      },
    },
    onUpdate: () => {},
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
      <div className="flex border-b p-4 py-2">
        {editor && <TipTapMenuBar editor={editor} />}
      </div>

      <div ref={ref} className="space-y-2 p-4 pb-0">
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
              className="w-full"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => setExpanded((e) => !e)}
          >
            <span className="font-medium text-green-600">Draft </span>
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

      <div className="w-full flex-1 px-4 py-4">
        <div
          className={`relative h-full min-h-[300px] w-full rounded-lg border p-4 transition-all duration-200 ${
            isGenerating
              ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-200"
              : "border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
          }`}
        >
          <EditorContent
            className="prose prose-sm h-full w-full max-w-none border-none focus:outline-none [&_.ProseMirror]:h-full [&_.ProseMirror]:p-0 [&_.ProseMirror]:outline-none"
            editor={editor}
            placeholder={
              isGenerating
                ? "AI is generating suggestions..."
                : "Write your email here..."
            }
          />
          {isGenerating && (
            <div className="absolute right-2 top-2 flex items-center gap-2 text-xs text-blue-600">
              <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span>AI thinking...</span>
            </div>
          )}
        </div>
      </div>
      <Separator />
      <div className="sticky bottom-0 z-10 flex items-center justify-between bg-background/50 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Press{" "}
            <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
              {typeof navigator !== "undefined" &&
              navigator.platform.toLowerCase().includes("mac")
                ? "Cmd + J"
                : "Alt + J"}
            </kbd>{" "}
            for AI autocomplete
          </span>
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span>AI thinking...</span>
            </div>
          )}
        </div>
        <Button
          onClick={async () => {
            const content = editor?.getHTML() || "";
            await handleSend(content);
            editor?.commands.clearContent();
          }}
          disabled={isSending}
          className="ml-4"
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
