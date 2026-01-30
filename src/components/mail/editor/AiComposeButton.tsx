"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import React from "react";
import { Bot } from "lucide-react";

const AI_GENERATE_TIMEOUT_MS = 60_000;

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
import { Textarea } from "@/components/ui/textarea";
import useThreads from "@/hooks/use-threads";
import { turndown } from "@/lib/turndown";
import type { RouterOutputs } from "@/trpc/react";

type Email = RouterOutputs["account"]["getThreads"]["threads"][0]["emails"][0];

type Props = {
  onGenerate: (value: string) => void;
  isComposing?: boolean;
};

const AIComposeButton = (props: Props) => {
  const [prompt, setPrompt] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const { account, threads, threadId } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);
  const aiGenerate = async (prompt: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      AI_GENERATE_TIMEOUT_MS,
    );
    try {
      let context: string | undefined = "";
      if (!props.isComposing) {
        context = thread?.emails
          .map(
            (m: Email) =>
              `Subject: ${m.subject}\nFrom: ${m.from.address}\n\n${turndown.turndown(m.body ?? m.bodySnippet ?? "")}`,
          )
          .join("\n");
      }

      const fullContext =
        (context || "") + `\n\nMy name is: ${account?.name}\n\n`;
      const result = await generateEmailViaApi(
        fullContext,
        prompt,
        controller.signal,
      );

      if (result.content && result.content.trim()) {
        props.onGenerate(result.content);
      }
    } catch (error) {
      const isAbort =
        error instanceof DOMException && error.name === "AbortError";
      console.error("Error generating email:", error);
      props.onGenerate(
        isAbort
          ? "Request took too long. Please try again."
          : "Error generating email. Please check your OpenAI API key and try again.",
      );
    } finally {
      clearTimeout(timeoutId);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button onClick={() => setOpen(true)} size="icon" variant={"outline"}>
          <Bot className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Compose</DialogTitle>
          <DialogDescription>
            AI will compose an email based on the context of your previous
            emails.
          </DialogDescription>
          <div className="h-2"></div>
          <Textarea
            placeholder="What would you like to compose?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="h-2"></div>
          <Button
            onClick={() => {
              aiGenerate(prompt);
              setOpen(false);
              setPrompt("");
            }}
          >
            Generate
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AIComposeButton;
