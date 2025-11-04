"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/trpc/react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface EmailSearchProps {
  isCollapsed: boolean;
}

interface DebugData {
  totalEmails: number;
  emails: Array<{
    id: string;
    subject: string;
    from: string;
    sentAt: Date;
    hasEmbedding: boolean;
  }>;
}

const ANIMATION_CONFIG = {
  type: "easeOut" as const,
  duration: 0.2,
} as any;

const SUGGESTED_QUERIES = [
  { label: "Orders", query: "Show me emails about orders", icon: "📦" },
  { label: "Flights", query: "Find my flight bookings", icon: "✈️" },
  {
    label: "Meetings",
    query: "What meetings do I have coming up?",
    icon: "📅",
  },
  { label: "Payments", query: "Show receipts and payments", icon: "💰" },
] as const;

export default function EmailSearchAssistant({
  isCollapsed,
}: EmailSearchProps) {
  const [accountId] = useLocalStorage("accountId", "");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const processEmailsMutation = api.account.processEmailsForAI.useMutation({
    onSuccess: () => {
      console.log("Email processing completed successfully");
    },
    onError: (error) => {
      console.error("Email processing failed:", error);
      toast.error("Failed to process emails. Please try again.");
    },
  });

  const { data: debugData } = api.account.debugEmails.useQuery(
    { accountId },
    { enabled: !!accountId },
  );

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleAccountConnection = useCallback(async () => {
    try {
      const { getAurinkoAuthUrl } = await import("@/lib/aurinko");
      const url = await getAurinkoAuthUrl("Google");
      window.location.href = url;
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, []);

  const sendMessage = useCallback(
    async (messageText: string) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, newMessage],
            accountId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          assistantMessage.content += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: assistantMessage.content }
                : msg,
            ),
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, accountId],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim()) {
        sendMessage(input);
        setInput("");
      }
    },
    [input, sendMessage],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const handleQuerySuggestion = useCallback((query: string) => {
    setInput(query);
  }, []);

  const handleProcessEmails = useCallback(() => {
    if (accountId) {
      processEmailsMutation.mutate({ accountId });
    }
  }, [accountId, processEmailsMutation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (isCollapsed) return null;

  if (!accountId) {
    return (
      <div className="mb-14 p-4">
        <div className="h-4" />
        <motion.div
          className="flex flex-col rounded-lg border bg-white p-4 pb-4 shadow-inner dark:bg-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4 py-2">
            <Sparkles className="size-6 text-gray-500" />
            <div>
              <p className="text-gray-900 dark:text-gray-100">
                No account connected
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connect your Google account to get started
              </p>
            </div>
          </div>
          <div className="h-2" />
          <button
            onClick={handleAccountConnection}
            className="w-full rounded-md bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            Connect Google Account
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-2 pb-20">
      <motion.div className="flex max-h-[350px] flex-col overflow-hidden rounded-lg border border-purple-500/30 bg-gradient-to-br from-gray-900 to-black shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/30 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-xs font-bold text-white">
              Email Search Assistant
            </h3>
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-r from-purple-600 to-amber-400">
            <span className="text-xs text-white">🚀</span>
          </div>
        </div>

        {/* Messages Area */}
        {messages.length > 0 && (
          <div
            className="max-h-[150px] overflow-y-auto border-b border-purple-500/30 p-2"
            ref={messageContainerRef}
          >
            <AnimatePresence mode="wait">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  layout="position"
                  className={cn("z-10 mt-2 break-words rounded-2xl", {
                    "max-w-[250px] self-end bg-white/10 text-white":
                      message.role === "user",
                    "max-w-[400px] self-start border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 text-white shadow-lg":
                      message.role === "assistant",
                  })}
                  layoutId={`container-[${messages.length - 1}]`}
                  transition={ANIMATION_CONFIG}
                >
                  <div
                    className={cn("text-sm leading-[1.4]", {
                      "px-4 py-3 text-white": message.role === "user",
                      "px-5 py-4 text-white": message.role === "assistant",
                    })}
                  >
                    {message.role === "assistant" ? (
                      <div className="space-y-2">
                        <div className="mb-2 font-medium text-purple-300">
                          ✨ Assistant
                        </div>
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3">
          {messages.length === 0 && (
            <div className="mb-3">
              {/* Description */}
              <div className="mb-3 text-center">
                <p className="text-xs text-gray-300">
                  Using semantic search to find relevant emails
                </p>
              </div>

              {/* Query Suggestions */}
              <div className="mb-3 grid grid-cols-2 gap-1">
                {SUGGESTED_QUERIES.map(({ label, query, icon }) => (
                  <button
                    key={label}
                    onClick={() => handleQuerySuggestion(query)}
                    className="flex cursor-pointer items-center justify-center gap-1 rounded border border-purple-500/30 bg-white/5 px-2 py-1 text-xs font-medium text-white transition-all duration-200 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20"
                  >
                    <span className="text-xs">{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Process Emails Button */}
              <div className="mb-3">
                <button
                  onClick={handleProcessEmails}
                  disabled={processEmailsMutation.isPending || !accountId}
                  className="flex w-full cursor-pointer items-center justify-center gap-1 rounded bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-2 py-1 text-xs font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-xs">🤖</span>
                  {processEmailsMutation.isPending
                    ? "Processing..."
                    : "Process Emails for Search"}
                </button>
              </div>

              {/* Debug Information */}
              {debugData && (
                <div className="mb-3 rounded border border-purple-500/30 bg-white/5 p-2 text-xs">
                  <div className="mb-1 text-purple-300">System Status:</div>
                  <div className="text-xs text-gray-400">
                    Total: {debugData.totalEmails} | Processed:{" "}
                    {debugData.emails.filter((e: any) => e.hasEmbedding).length}
                  </div>
                  <div className="truncate text-xs text-gray-400">
                    Latest: {debugData.emails[0]?.subject || "None"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="mt-auto flex w-full gap-1">
            <div className="relative flex-1">
              <input
                type="text"
                onChange={handleInputChange}
                value={input}
                className="h-8 w-full rounded-full border border-purple-500/30 bg-white/5 px-2 text-xs text-white outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                placeholder="Search your emails..."
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-3 w-3 text-white" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
