"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
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

const animationConfig: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

const suggestedQueries = [
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
  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();
  const hasValidAccount =
    !accountsLoading &&
    !!accountId &&
    accountId.length > 0 &&
    accounts?.some((acc) => acc.id === accountId);

  const processEmailsMutation = api.account.processEmailsForAI.useMutation({
    onSuccess: () => {
      console.log("Email processing completed");
    },
    onError: (error) => {
      console.error("Processing failed:", error);
      toast.error("Failed to process emails. Please try again.");
    },
  });

  const { data: debugData } = api.account.debugEmails.useQuery(
    { accountId: hasValidAccount ? accountId : "" },
    {
      enabled: hasValidAccount,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
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
          const errorText = await response.text();
          console.error("API error:", errorText);
          throw new Error(`Failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        let hasContent = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          assistantMessage.content += chunk;
          hasContent = true;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: assistantMessage.content }
                : msg,
            ),
          );
        }

        if (!hasContent) {
          assistantMessage.content =
            "I'm having trouble searching your emails right now. Please try again.";
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? assistantMessage : msg,
            ),
          );
        }
      } catch (error) {
        console.error("Send message error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to send message: ${errorMessage}`);

        const errorAssistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I encountered an error while searching your emails. Please make sure your email account is properly synced and try again.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorAssistantMessage]);
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
      <div className="flex h-full flex-col p-3">
        <motion.div
          className="flex h-full flex-col rounded-lg border border-purple-500/30 bg-gradient-to-br from-gray-900 to-black p-4 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 py-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">
                No account connected
              </p>
              <p className="text-xs text-gray-400">
                Connect your Google account to get started
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAccountConnection}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/50"
            >
              Connect Google Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-3">
      <motion.div className="flex h-full flex-col overflow-hidden rounded-lg border border-purple-500/30 bg-gradient-to-br from-gray-900 to-black shadow-lg">
        <div className="flex items-center justify-between border-b border-purple-500/30 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Email Assistant
            </h3>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-purple-600 to-amber-400">
            <span className="text-sm text-white">🚀</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {messages.length > 0 ? (
            <div
              className="flex-1 overflow-y-auto p-3"
              ref={messageContainerRef}
            >
              <AnimatePresence mode="wait">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout="position"
                    className={cn("z-10 mb-3 break-words rounded-xl", {
                      "ml-auto max-w-[80%] bg-white/10 text-white":
                        message.role === "user",
                      "mr-auto max-w-[90%] border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 text-white shadow-lg":
                        message.role === "assistant",
                    })}
                    layoutId={`container-[${messages.length - 1}]`}
                    transition={animationConfig}
                  >
                    <div className="px-4 py-3 text-sm leading-relaxed text-white">
                      {message.role === "assistant" ? (
                        <div className="space-y-2">
                          <div className="mb-2 text-xs font-medium text-purple-300">
                            ✨ Assistant
                          </div>
                          <div className="whitespace-pre-wrap text-sm">
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
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-4 space-y-3">
                <div className="text-center">
                  <p className="text-xs text-gray-300">
                    Your AI email assistant - search, summarize, analyze, and more
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {suggestedQueries.map(({ label, query, icon }) => (
                    <button
                      key={label}
                      onClick={() => handleQuerySuggestion(query)}
                      className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-purple-500/30 bg-white/5 px-3 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20"
                    >
                      <span className="text-sm">{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <button
                    onClick={handleProcessEmails}
                    disabled={processEmailsMutation.isPending || !accountId}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-base">🤖</span>
                    {processEmailsMutation.isPending
                      ? "Processing..."
                      : "Process Emails for Search"}
                  </button>
                </div>

                {debugData && (
                  <div className="rounded-lg border border-purple-500/30 bg-white/5 p-3">
                    <div className="mb-1.5 text-xs font-medium text-purple-300">
                      System Status:
                    </div>
                    <div className="text-xs text-gray-400">
                      Total: {debugData.totalEmails} | Processed:{" "}
                      {debugData.emails.filter((e) => e.hasEmbedding).length}
                    </div>
                    <div className="truncate text-xs text-gray-400">
                      Latest: {debugData.emails[0]?.subject || "None"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-auto flex w-full gap-2 p-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                onChange={handleInputChange}
                value={input}
                className="h-10 w-full rounded-full border border-purple-500/30 bg-white/5 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                placeholder="Ask me anything about your emails..."
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
