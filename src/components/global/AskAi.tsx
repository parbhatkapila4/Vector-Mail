"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Send, Bot, Plus, Loader2, Sparkles } from "lucide-react";
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
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            const errorText = await response.text();
            errorData = {
              error:
                errorText || `Request failed with status ${response.status}`,
              code: "UNKNOWN_ERROR",
            };
          }

          console.error("API error:", errorData);

          if (
            errorData.code === "ACCOUNT_NOT_FOUND" ||
            errorData.code === "ACCOUNT_ACCESS_DENIED"
          ) {
            localStorage.removeItem("accountId");
            throw new Error(
              "Email account not found. Please reconnect your account in settings.",
            );
          } else if (errorData.code === "UNAUTHORIZED") {
            throw new Error("Please sign in to use this feature.");
          } else if (errorData.code === "MISSING_ACCOUNT_ID") {
            localStorage.removeItem("accountId");
            throw new Error("Please select an email account first.");
          }

          throw new Error(errorData.error || `Failed: ${response.status}`);
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
          className="flex h-full flex-col rounded-xl border border-white/[0.06] bg-[#0A0A0A] p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                No account connected
              </p>
              <p className="text-xs text-zinc-500">
                Connect your Google account
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAccountConnection}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-amber-500/20"
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
      <motion.div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0A0A]">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              AI Assistant
            </span>
          </div>
          <button
            onClick={() => {
              setMessages([]);
              setInput("");
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] transition-all hover:bg-white/[0.08]"
            title="New chat"
          >
            <Plus className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {messages.length > 0 ? (
            <div
              className="flex-1 overflow-y-auto p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              ref={messageContainerRef}
            >
              <AnimatePresence mode="wait">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout="position"
                    className={cn("z-10 mb-3 break-words rounded-xl", {
                      "ml-auto max-w-[85%] bg-amber-500/10 ring-1 ring-amber-500/20":
                        message.role === "user",
                      "mr-auto max-w-[90%] bg-white/[0.03] ring-1 ring-white/[0.06]":
                        message.role === "assistant",
                    })}
                    layoutId={`container-[${messages.length - 1}]`}
                    transition={animationConfig}
                  >
                    <div className="px-4 py-3 text-sm leading-relaxed">
                      {message.role === "assistant" ? (
                        <div className="space-y-2">
                          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-400">
                            <Sparkles className="h-3 w-3" />
                            Assistant
                          </div>
                          <div className="whitespace-pre-wrap text-sm text-zinc-300">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <span className="text-white">{message.content}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 mr-auto max-w-[90%]"
                >
                  <div className="rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.3s]" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.15s]" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-zinc-400">
                    Search, summarize & analyze your emails
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {suggestedQueries.map(({ label, query, icon }) => (
                    <button
                      key={label}
                      onClick={() => handleQuerySuggestion(query)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-white"
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleProcessEmails}
                  disabled={processEmailsMutation.isPending || !accountId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Bot className="h-4 w-4" />
                  {processEmailsMutation.isPending
                    ? "Processing..."
                    : "Process Emails for AI"}
                </button>

                {debugData && (
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="mb-1.5 text-xs font-medium text-zinc-400">
                      Status
                    </div>
                    <div className="text-xs text-zinc-500">
                      Total: {debugData.totalEmails} | Processed:{" "}
                      {debugData.processedEmails ??
                        debugData.emails.filter((e) => e.hasEmbedding).length}
                    </div>
                    <div className="mt-1 truncate text-xs text-zinc-500">
                      Latest: {debugData.emails[0]?.subject || "None"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-auto flex w-full gap-2 border-t border-white/[0.06] p-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                onChange={handleInputChange}
                value={input}
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
                placeholder="Ask about your emails..."
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
