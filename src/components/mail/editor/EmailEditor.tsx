"use client";
import GhostExtension from "./extensions";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import TipTapMenuBar from "./MenuBar";
import Text from "@tiptap/extension-text";
import { Button } from "@/components/ui/button";

import { generate } from "./actions";
import { readStreamableValue } from "@ai-sdk/rsc";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import TagInput from "./TagInput";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLocalStorage } from "usehooks-ts";
import AIComposeButton from "./AiComposeButton";
import { toast } from "sonner";

type EmailEditorProps = {
  toValues: { label: string; value: string }[];
  ccValues: { label: string; value: string }[];

  subject: string;
  setSubject: (subject: string) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;

  onToChange: (values: { label: string; value: string }[]) => void;
  onCcChange: (values: { label: string; value: string }[]) => void;

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
    { enabled: !!accountId },
  );

  const [expanded, setExpanded] = React.useState(defaultToolbarExpand ?? false);

  const [generation, setGeneration] = React.useState("");

  const aiGenerate = async (prompt: string) => {
    try {
      const { output } = await generate(prompt);
      let fullGeneration = "";
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          fullGeneration += delta;
          setGeneration(fullGeneration);
        }
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("AI generation failed. Please try again.");
    }
  };

  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          const currentText = this.editor.getText();
          if (currentText.trim()) {
            aiGenerate(currentText);
          } else {
            toast.info(
              "Please write some text first to generate AI suggestions",
            );
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
    onUpdate: ({ editor, transaction }) => {
      setValue(editor.getHTML());
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
    if (!generation || !editor) return;
    // Insert the new AI-generated content at the current cursor position
    editor.commands.insertContent(generation);
    // Clear the generation state to prevent re-insertion
    setGeneration("");
  }, [generation, editor]);

  const [value, setValue] = React.useState("");

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b p-4 py-2">
        {editor && <TipTapMenuBar editor={editor} />}
      </div>

      <div ref={ref} className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              suggestions={suggestions?.map((s: any) => s.address) || []}
              value={toValues}
              placeholder="Add tags"
              label="To"
              onChange={onToChange}
            />
            <TagInput
              suggestions={suggestions?.map((s: any) => s.address) || []}
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
            onGenerate={setGeneration}
          />
        </div>
      </div>

      <div className="w-full flex-1 px-4 py-4">
        <div className="h-full min-h-[300px] w-full rounded-lg border border-gray-200 p-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <EditorContent
            className="prose prose-sm h-full  w-full max-w-none border-none focus:outline-none [&_.ProseMirror]:h-full [&_.ProseMirror]:p-0 [&_.ProseMirror]:outline-none"
            editor={editor}
            placeholder="Write your email here..."
          />
        </div>
      </div>
      <Separator />
      <div className="bg-background/50 sticky bottom-0 z-10 flex items-center justify-between px-4 py-3 backdrop-blur-sm">
        <span className="text-muted-foreground text-sm">
          Tip: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd + J
          </kbd>{" "}
          for AI autocomplete
        </span>
        <Button
          onClick={async () => {
            const content = editor?.getHTML() || "";
            await handleSend(content);
            editor?.commands.clearContent();
            setValue("");
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
