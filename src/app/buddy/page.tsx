"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  Plus,
  Loader2,
  Copy,
  Check,
  Mail,
  Trash2,
  Clock,
  Inbox,
} from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  emailData?: {
    subject: string;
    body: string;
    suggestions?: Array<{ subject: string; body: string }>;
  };
}

interface SavedChat {
  id: string;
  heading: string;
  messages: ChatMessage[];
  timestamp: number;
  preview: string;
}

const suggestedQueries = [
  {
    label: "Follow-up Mail",
    query: "Follow up on a meeting we had last week",
    icon: "📧",
  },
  {
    label: "Thank You",
    query: "Thank you email for a job interview",
    icon: "🙏",
  },
  {
    label: "Request Meeting",
    query: "Request a meeting with the team",
    icon: "📅",
  },
  {
    label: "Introduction Email",
    query: "Introduce myself to a new client",
    icon: "👋",
  },
] as const;

const generateHeading = (messages: ChatMessage[]): string => {
  if (messages.length === 0) return "New Chat";

  const firstUserMessage = messages.find((m) => m.role === "user");
  if (!firstUserMessage) return "New Chat";

  const content = firstUserMessage.content.toLowerCase();

  if (
    content.includes("email") ||
    content.includes("compose") ||
    content.includes("draft")
  ) {
    if (content.includes("follow") || content.includes("follow-up"))
      return "Follow-up Email";
    if (content.includes("thank")) return "Thank You Email";
    if (content.includes("meeting") || content.includes("schedule"))
      return "Meeting Request";
    if (content.includes("introduce") || content.includes("introduction"))
      return "Introduction Email";
    if (content.includes("job") || content.includes("interview"))
      return "Job Application Email";
    return "Email Draft";
  }

  if (
    content.includes("what") ||
    content.includes("how") ||
    content.includes("why")
  ) {
    return "Question";
  }

  if (
    content.includes("code") ||
    content.includes("programming") ||
    content.includes("function")
  ) {
    return "Coding Help";
  }

  const words = firstUserMessage.content.split(" ").slice(0, 5);
  return (
    words.join(" ") +
    (words.length < firstUserMessage.content.split(" ").length ? "..." : "")
  );
};

function BuddyPageContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    "buddy-chat-history",
    [],
  );
  const [savedChats, setSavedChats] = useLocalStorage<SavedChat[]>(
    "buddy-saved-chats",
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const fresh = searchParams.get("fresh");
      if (fresh === "true") {
        setMessages([]);
        setInput("");
        previousMessagesRef.current = [];

        router.replace("/buddy", { scroll: false });
      }
    }
  }, [isLoaded, isSignedIn, searchParams, setMessages, router]);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
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

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const response = await fetch("/api/buddy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        });

        if (!response.ok) {
          let errorMessage = `Failed: ${response.status}`;
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            try {
              const errorData = await response.json();
              errorMessage =
                errorData.error || errorData.details || errorMessage;
            } catch {}
          } else {
            try {
              const errorText = await response.text();
              errorMessage = errorText || errorMessage;
            } catch {}
          }
          console.error("API error:", errorMessage);
          throw new Error(errorMessage);
        }

        const responseData = await response.json();

        if (responseData.type === "conversation") {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responseData.message || "",
            timestamp: Date.now(),
          };
          setMessages([...updatedMessages, assistantMessage]);
        } else if (responseData.subject) {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Here's your email draft:",
            timestamp: Date.now(),
            emailData: responseData,
          };
          setMessages([...updatedMessages, assistantMessage]);
        } else {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              typeof responseData === "string"
                ? responseData
                : JSON.stringify(responseData),
            timestamp: Date.now(),
          };
          setMessages([...updatedMessages, assistantMessage]);
        }
      } catch (error) {
        console.error("Send message error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to generate email: ${errorMessage}`);

        const errorAssistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I encountered an error while generating your email. Please try again or check your connection.",
          timestamp: Date.now(),
        };
        setMessages([...updatedMessages, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, setMessages],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        sendMessage(input);
        setInput("");
      }
    },
    [input, sendMessage, isLoading],
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

  const handleNewChat = useCallback(() => {
    if (messages.length > 0) {
      const heading = generateHeading(messages);
      const preview =
        messages.find((m) => m.role === "user")?.content.substring(0, 50) || "";

      const newSavedChat: SavedChat = {
        id: Date.now().toString(),
        heading,
        messages: [...messages],
        timestamp: Date.now(),
        preview: preview + (preview.length < 50 ? "" : "..."),
      };

      const updatedChats = [newSavedChat, ...savedChats].slice(0, 10);
      setSavedChats(updatedChats);
    }

    setMessages([]);
    setInput("");
    previousMessagesRef.current = [];
  }, [messages, savedChats, setSavedChats, setMessages]);

  const loadSavedChat = useCallback(
    (chat: SavedChat) => {
      setMessages(chat.messages);
      setInput("");
      previousMessagesRef.current = chat.messages;
    },
    [setMessages],
  );

  const deleteSavedChat = useCallback(
    (chatId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSavedChats(savedChats.filter((chat) => chat.id !== chatId));
      toast.success("Chat deleted");
    },
    [savedChats, setSavedChats],
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a]">
      <div className="flex h-full flex-col">
        <motion.div
          className="flex h-full flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative flex items-center justify-between border-b border-slate-800 bg-[#0a0a0a]/80 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">AI Buddy</h1>
                <p className="text-xs text-gray-400">Your AI assistant</p>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2">
              <button
                onClick={() => router.push("/mail")}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-white transition-all hover:border-slate-600 hover:bg-slate-700/50"
                title="Go to Inbox"
              >
                <Inbox className="h-4 w-4" />
                <span>Go to Inbox</span>
              </button>
            </div>
            <button
              onClick={handleNewChat}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-gray-300 transition-all hover:border-slate-500 hover:bg-slate-700 hover:text-white"
              title="New chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            {messages.length > 0 ? (
              <div
                className="flex-1 overflow-y-auto px-4 py-6"
                ref={messageContainerRef}
              >
                <div className="mx-auto max-w-4xl space-y-6">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={cn("flex gap-4", {
                          "flex-row-reverse": message.role === "user",
                        })}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            {
                              "bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500":
                                message.role === "assistant",
                              "bg-white/10": message.role === "user",
                            },
                          )}
                        >
                          {message.role === "assistant" ? (
                            <Bot className="h-4 w-4 text-white" />
                          ) : (
                            <div className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                        <div
                          className={cn("flex-1 space-y-1", {
                            "text-right": message.role === "user",
                          })}
                        >
                          {message.role === "user" ? (
                            <div className="ml-auto max-w-[85%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                              {message.content}
                            </div>
                          ) : message.emailData ? (
                            <div className="mr-auto max-w-[90%] space-y-4">
                              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 p-4 text-white shadow-lg">
                                <div className="mb-2 text-xs font-medium text-orange-300">
                                  {message.content}
                                </div>

                                <div className="mb-6 rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
                                  <div className="mb-3 flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="mb-1 text-xs font-medium text-gray-400">
                                        Subject
                                      </div>
                                      <div className="text-sm font-semibold text-white">
                                        {message.emailData.subject}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(
                                          `${message.emailData!.subject}\n\n${message.emailData!.body}`,
                                          `${message.id}-main`,
                                        )
                                      }
                                      className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 text-gray-400 transition-all hover:border-slate-600 hover:bg-slate-700/50 hover:text-white"
                                      title="Copy email"
                                    >
                                      {copiedId === `${message.id}-main` ? (
                                        <Check className="h-4 w-4 text-green-400" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="mt-3">
                                    <div className="mb-1 text-xs font-medium text-gray-400">
                                      Body
                                    </div>
                                    <div className="text-sm leading-relaxed text-gray-200">
                                      {message.emailData.body
                                        .split("\n")
                                        .map((line, idx) => {
                                          const parts =
                                            line.split(/(\*\*.*?\*\*)/g);
                                          return (
                                            <div key={idx} className="mb-1">
                                              {parts.map((part, partIdx) => {
                                                if (
                                                  part.startsWith("**") &&
                                                  part.endsWith("**")
                                                ) {
                                                  const boldText = part.slice(
                                                    2,
                                                    -2,
                                                  );
                                                  return (
                                                    <strong
                                                      key={partIdx}
                                                      className="font-semibold text-white"
                                                    >
                                                      {boldText}
                                                    </strong>
                                                  );
                                                }
                                                return (
                                                  <span key={partIdx}>
                                                    {part}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                </div>

                                {message.emailData.suggestions &&
                                  message.emailData.suggestions.length > 0 && (
                                    <div>
                                      <div className="mb-3 text-xs font-medium text-orange-300">
                                        Alternative Suggestions:
                                      </div>
                                      <div className="space-y-3">
                                        {message.emailData.suggestions.map(
                                          (suggestion, idx) => (
                                            <div
                                              key={idx}
                                              className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-3"
                                            >
                                              <div className="mb-2 flex items-start justify-between">
                                                <div className="flex-1">
                                                  <div className="mb-1 text-xs font-medium text-gray-400">
                                                    Subject
                                                  </div>
                                                  <div className="text-xs font-semibold text-white">
                                                    {suggestion.subject}
                                                  </div>
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    copyToClipboard(
                                                      `${suggestion.subject}\n\n${suggestion.body}`,
                                                      `${message.id}-suggestion-${idx}`,
                                                    )
                                                  }
                                                  className="ml-2 flex h-7 w-7 items-center justify-center rounded border border-slate-700 bg-slate-800/50 text-gray-400 transition-all hover:border-slate-600 hover:bg-slate-700/50 hover:text-white"
                                                  title="Copy suggestion"
                                                >
                                                  {copiedId ===
                                                  `${message.id}-suggestion-${idx}` ? (
                                                    <Check className="h-3 w-3 text-green-400" />
                                                  ) : (
                                                    <Copy className="h-3 w-3" />
                                                  )}
                                                </button>
                                              </div>
                                              <div className="mt-2">
                                                <div className="mb-1 text-xs font-medium text-gray-400">
                                                  Body
                                                </div>
                                                <div className="whitespace-pre-wrap text-xs leading-relaxed text-gray-300">
                                                  {suggestion.body
                                                    .split("\n")
                                                    .map((line, idx) => {
                                                      const parts =
                                                        line.split(
                                                          /(\*\*.*?\*\*)/g,
                                                        );
                                                      return (
                                                        <div
                                                          key={idx}
                                                          className="mb-1"
                                                        >
                                                          {parts.map(
                                                            (part, partIdx) => {
                                                              if (
                                                                part.startsWith(
                                                                  "**",
                                                                ) &&
                                                                part.endsWith(
                                                                  "**",
                                                                )
                                                              ) {
                                                                const boldText =
                                                                  part.slice(
                                                                    2,
                                                                    -2,
                                                                  );
                                                                return (
                                                                  <strong
                                                                    key={
                                                                      partIdx
                                                                    }
                                                                    className="font-semibold text-white"
                                                                  >
                                                                    {boldText}
                                                                  </strong>
                                                                );
                                                              }
                                                              return (
                                                                <span
                                                                  key={partIdx}
                                                                >
                                                                  {part}
                                                                </span>
                                                              );
                                                            },
                                                          )}
                                                        </div>
                                                      );
                                                    })}
                                                </div>
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          ) : (
                            <div className="mr-auto max-w-[90%] rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 px-4 py-3 text-sm text-white shadow-lg">
                              <div className="whitespace-pre-wrap break-words">
                                {message.content}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center gap-1 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 px-4 py-3">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
                <div className="mx-auto w-full max-w-4xl space-y-6">
                  <div className="space-y-6 text-center">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-center"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                    </motion.div>
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-white">
                        How can I help you today?
                      </h2>
                      <p className="text-sm text-gray-400">
                        I can answer questions, help with tasks, or generate
                        professional email drafts. Just ask me anything!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      {suggestedQueries.map(({ label, query, icon }) => (
                        <button
                          key={label}
                          onClick={() => handleQuerySuggestion(query)}
                          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20"
                        >
                          <span className="text-base">{icon}</span>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {savedChats.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-semibold text-white">
                        Recent Chats
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {savedChats.map((chat) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative cursor-pointer rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 transition-all hover:border-purple-500/50 hover:bg-slate-800/50"
                            onClick={() => loadSavedChat(chat)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <h4 className="mb-1 truncate text-sm font-semibold text-white">
                                  {chat.heading}
                                </h4>
                                <p className="mb-2 line-clamp-2 text-xs text-gray-400">
                                  {chat.preview}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      chat.timestamp,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => deleteSavedChat(chat.id, e)}
                                className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 text-gray-400 opacity-0 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                                title="Delete chat"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-slate-800 bg-[#0a0a0a]/80 px-4 py-4 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
                <div className="relative flex gap-2">
                  <input
                    type="text"
                    onChange={handleInputChange}
                    value={input}
                    className="h-12 flex-1 rounded-xl border border-slate-700 bg-slate-900/50 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Ask me anything or describe an email you want to write..."
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Send className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  AI Buddy can help with questions or generate email drafts.
                  Review and customize before sending.
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function BuddyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
      }
    >
      <BuddyPageContent />
    </Suspense>
  );
}
