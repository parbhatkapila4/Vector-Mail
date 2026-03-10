"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Send, Bot, Loader2, MessageCircle } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { fetchWithAuthRetry } from "@/lib/fetch-with-retry";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface EmailSearchProps {
  isCollapsed: boolean;
  resetTrigger?: number;
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

const DEMO_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "demo-1",
    role: "user",
    content: "What meetings do I have coming up?",
    timestamp: Date.now() - 120000,
  },
  {
    id: "demo-2",
    role: "assistant",
    content: `Here’s what’s coming up from your inbox:

Today
1. Product sync - 2:00 PM with Sarah (Calendar invite received)
2. 1:1 with Alex - 4:30 PM (confirmed)

This week
3. Q4 planning - Wednesday 10:00 AM (tentative)
4. Design review - Thursday 3:00 PM

I found these from your recent emails and calendar-related threads. Request access to connect your Gmail and I’ll search your real inbox and keep this up to date.`,
    timestamp: Date.now() - 115000,
  },
  {
    id: "demo-3",
    role: "user",
    content: "Show me emails about orders",
    timestamp: Date.now() - 60000,
  },
  {
    id: "demo-4",
    role: "assistant",
    content: `Here are the order-related emails I found:

1. Order #2847 - Shipped (tracking in email from support@store.com)
2. Order #2901 - Delivered yesterday
3. Subscription renewal - Billing next week (reminder from payments@service.com)

In the full version, I’ll search your connected inbox and surface the exact threads, so you can open them with one click. Request access above to use this with your own emails.`,
    timestamp: Date.now() - 55000,
  },
];

export default function EmailSearchAssistant({
  isCollapsed,
  resetTrigger = 0,
}: EmailSearchProps) {
  const isDemo = useDemoMode();
  const [accountId] = useLocalStorage("accountId", "");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const demoSeededRef = useRef(false);

  useEffect(() => {
    if (resetTrigger === 0) return;
    setMessages([]);
    setInput("");
    demoSeededRef.current = false;
  }, [resetTrigger]);
  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();

  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";
  const validAccountId =
    accountId && accounts?.some((acc) => acc.id === accountId)
      ? accountId
      : firstAccountId;

  const isDemoAccount = validAccountId === DEMO_ACCOUNT_ID;
  const hasValidAccount =
    !accountsLoading && !!validAccountId && validAccountId.length > 0;
  const showDemoUI = isDemo && (isDemoAccount || !hasValidAccount);

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
    { accountId: hasValidAccount ? validAccountId : "" },
    {
      enabled: hasValidAccount,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  useEffect(() => {
    if (showDemoUI && !demoSeededRef.current) {
      setMessages(DEMO_CHAT_MESSAGES);
      demoSeededRef.current = true;
    }
  }, [showDemoUI]);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleAccountConnection = useCallback(() => {
    window.location.href = "/api/connect/google";
  }, []);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (showDemoUI) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "user",
          content: messageText,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setIsLoading(true);
        toast.info(
          "Request access via the banner above to connect your Gmail and search your own emails. We’ll get back to you once your account is enabled.",
        );
        setTimeout(() => {
          const demoReply: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "In the full version, I’ll search your inbox and summarize results here. Request access above to connect your Gmail. We'll reply once your account is enabled.",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, demoReply]);
          setIsLoading(false);
        }, 800);
        return;
      }

      if (!validAccountId) {
        toast.error(
          "Please wait for account to load or reconnect your account.",
        );
        return;
      }

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      try {
        const response = await fetchWithAuthRetry("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, newMessage],
            accountId: validAccountId,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

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

        let userFriendlyMessage =
          "I encountered an error while searching your emails. Please make sure your email account is properly synced and try again.";

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            userFriendlyMessage =
              "The request timed out. Please try again with a simpler query.";
            toast.error("Request timed out. Please try again.");
          } else if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError")
          ) {
            userFriendlyMessage =
              "Network error. Please check your internet connection and try again.";
            toast.error("Network error. Please check your connection.");
          } else if (error.message && error.message.length > 0 && error.message.length < 300) {
            userFriendlyMessage = error.message;
            toast.error(error.message);
          } else {
            toast.error(`Failed to send message: ${error.message}`);
          }
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }

        const errorAssistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: userFriendlyMessage,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, validAccountId, showDemoUI],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && (hasValidAccount || showDemoUI)) {
        sendMessage(input);
        setInput("");
      }
    },
    [input, sendMessage, hasValidAccount, showDemoUI],
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
    if (validAccountId) {
      processEmailsMutation.mutate({ accountId: validAccountId });
    }
  }, [validAccountId, processEmailsMutation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (isCollapsed) return null;

  if (accountsLoading) {
    return (
      <div className="flex h-full flex-col p-3">
        <motion.div
          className="flex h-full flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#0A0A0A] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            <span className="text-sm text-zinc-400">Loading...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!showDemoUI && (!accounts || accounts.length === 0)) {
    return (
      <div className="flex h-full flex-col p-3">
        <motion.div
          className="flex h-full flex-col rounded-xl border border-white/[0.06] bg-[#0A0A0A] p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
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
              className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-yellow-500/20"
            >
              Connect your Google account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
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
                    "ml-auto max-w-[85%] bg-amber-400 px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg":
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
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6]">
                          <MessageCircle className="h-3 w-3" />
                          Assistant
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-zinc-300">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <span className="text-black">{message.content}</span>
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a73e8]/80 dark:bg-[#8ab4f8]/80">
                      <MessageCircle className="h-3 w-3 text-white dark:text-[#202124]" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5f6368] [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5f6368] [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5f6368]" />
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
                  {showDemoUI
                    ? "See how the AI assistant works. Request access to search your own inbox."
                    : "Search, summarize & analyze your emails"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {suggestedQueries.map(({ label, query, icon }) => (
                  <button
                    key={label}
                    onClick={() => handleQuerySuggestion(query)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-white"
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {!showDemoUI && (
                <button
                  onClick={handleProcessEmails}
                  disabled={processEmailsMutation.isPending || !validAccountId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-amber-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Bot className="h-4 w-4 text-black" />
                  {processEmailsMutation.isPending
                    ? "Processing..."
                    : "Process Emails for AI"}
                </button>
              )}

              {!showDemoUI && debugData && (
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
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/30 disabled:opacity-50"
              placeholder={
                showDemoUI
                  ? "Try a question to see how it works. Request access to search your real inbox."
                  : hasValidAccount
                    ? "Ask about your emails..."
                    : "Loading account..."
              }
              disabled={isLoading || (!hasValidAccount && !showDemoUI)}
            />
          </div>
          <button
            type="submit"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black transition-all hover:bg-amber-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || !input.trim() || (!hasValidAccount && !showDemoUI)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
