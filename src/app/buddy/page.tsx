"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Plus, Loader2, Copy, Check, Mail, Inbox, X } from "lucide-react";
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
    label: "Meeting Follow-up",
    query:
      "Write a professional follow-up email after a business meeting summarizing key points and next steps",
    icon: "📋",
  },
  {
    label: "Project Proposal",
    query:
      "Draft a professional project proposal email to a potential client outlining scope, timeline, and deliverables",
    icon: "💼",
  },
  {
    label: "Status Update",
    query:
      "Create a professional status update email to stakeholders about project progress and milestones",
    icon: "📊",
  },
  {
    label: "Client Onboarding",
    query:
      "Write a professional client onboarding email welcoming new clients and outlining next steps",
    icon: "🚀",
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
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const handleQuerySuggestion = useCallback(
    (query: string) => {
      sendMessage(query);
    },
    [sendMessage],
  );

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
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="hidden w-64 border-r border-gray-900 bg-black/50 md:flex md:flex-col">
        <div className="flex items-center gap-3 border-b border-gray-900 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">AI Buddy</h1>
            <p className="text-xs text-gray-500">Email generator</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <button
            onClick={handleNewChat}
            className="mb-3 flex w-full items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800/50 hover:text-white"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>

          {savedChats.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Recent
              </p>
              {savedChats.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-900/50 hover:text-white"
                  onClick={() => loadSavedChat(chat)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 truncate">
                      {chat.heading}
                    </div>
                    <button
                      onClick={(e) => deleteSavedChat(chat.id, e)}
                      className="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-900 p-3">
          <button
            onClick={() => router.push("/mail")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-900/50 hover:text-white"
          >
            <Inbox className="h-4 w-4" />
            Go to Inbox
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-black">
        <div
          className="flex-1 overflow-y-auto bg-black"
          ref={messageContainerRef}
        >
          {messages.length > 0 ? (
            <div className="mx-auto max-w-4xl px-6 py-12">
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className={cn("flex gap-5", {
                        "flex-row-reverse": message.role === "user",
                      })}
                    >
                      <div className="flex shrink-0">
                        {message.role === "assistant" ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-800">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
                          </div>
                        )}
                      </div>

                      <div
                        className={cn("min-w-0 flex-1", {
                          "flex justify-end": message.role === "user",
                        })}
                      >
                        {message.role === "user" ? (
                          <div className="max-w-[80%] rounded-2xl rounded-tr-md border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800 px-5 py-3.5 shadow-lg">
                            <p className="text-sm leading-relaxed text-gray-100">
                              {message.content}
                            </p>
                          </div>
                        ) : message.emailData ? (
                          <div className="max-w-[85%] space-y-4">
                            <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/90 to-black/50 p-6 shadow-xl backdrop-blur-sm">
                              <div className="mb-5 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
                                  <Mail className="h-4 w-4 text-orange-400" />
                                </div>
                                <span className="text-sm font-semibold text-orange-400">
                                  {message.content}
                                </span>
                              </div>

                              <div className="mb-5 rounded-xl border border-gray-800 bg-black/60 p-5 backdrop-blur-sm">
                                <div className="mb-4 flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                      Subject
                                    </div>
                                    <div className="text-base font-bold leading-snug text-white">
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
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-900/50 text-gray-400 transition-all hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400"
                                  >
                                    {copiedId === `${message.id}-main` ? (
                                      <Check className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                                <div className="border-t border-gray-800 pt-4">
                                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Body
                                  </div>
                                  <div className="space-y-2 text-sm leading-relaxed text-gray-300">
                                    {message.emailData.body
                                      .split("\n")
                                      .map((line, idx) => {
                                        const parts =
                                          line.split(/(\*\*.*?\*\*)/g);
                                        return (
                                          <p
                                            key={idx}
                                            className="leading-relaxed"
                                          >
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
                                          </p>
                                        );
                                      })}
                                  </div>
                                </div>
                              </div>

                              {message.emailData.suggestions &&
                                message.emailData.suggestions.length > 0 && (
                                  <div className="border-t border-gray-800 pt-5">
                                    <div className="mb-4 flex items-center gap-2">
                                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
                                      <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                                        Alternatives
                                      </span>
                                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
                                    </div>
                                    <div className="space-y-3">
                                      {message.emailData.suggestions.map(
                                        (suggestion, idx) => (
                                          <div
                                            key={idx}
                                            className="rounded-xl border border-gray-800 bg-black/40 p-4 backdrop-blur-sm transition-all hover:border-gray-700"
                                          >
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                              <div className="min-w-0 flex-1">
                                                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                  Subject
                                                </div>
                                                <div className="text-sm font-semibold text-white">
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
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-900/50 text-gray-500 transition-all hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400"
                                              >
                                                {copiedId ===
                                                `${message.id}-suggestion-${idx}` ? (
                                                  <Check className="h-3.5 w-3.5 text-green-400" />
                                                ) : (
                                                  <Copy className="h-3.5 w-3.5" />
                                                )}
                                              </button>
                                            </div>
                                            <div className="border-t border-gray-800 pt-3">
                                              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Body
                                              </div>
                                              <div className="space-y-1.5 whitespace-pre-wrap text-xs leading-relaxed text-gray-400">
                                                {suggestion.body
                                                  .split("\n")
                                                  .map((line, idx) => {
                                                    const parts =
                                                      line.split(
                                                        /(\*\*.*?\*\*)/g,
                                                      );
                                                    return (
                                                      <p key={idx}>
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
                                                                  key={partIdx}
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
                                                      </p>
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
                          <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-gray-800 bg-gradient-to-br from-gray-900/90 to-black/50 px-5 py-4 shadow-lg">
                            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-200">
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/90 to-black/50 px-5 py-3.5 shadow-lg">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-6">
              <div className="mx-auto w-full max-w-2xl space-y-8 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl shadow-2xl shadow-orange-500/30">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-[140%] w-[140%] scale-110 object-cover"
                      >
                        <source src="/Vectormail-logo.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-400 shadow-lg">
                      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">
                    How can I help you today?
                  </h2>
                  <p className="text-sm text-gray-400">
                    I can answer questions, help with tasks, or generate
                    professional email drafts.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
                  {suggestedQueries.map(({ label, query, icon }, idx) => (
                    <motion.button
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleQuerySuggestion(query)}
                      className="group flex items-center justify-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 px-5 py-3.5 text-sm font-medium text-gray-300 transition-all hover:border-orange-500/50 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-amber-500/10 hover:text-white hover:shadow-lg hover:shadow-orange-500/10"
                    >
                      <span className="text-xl">{icon}</span>
                      <span>{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-900 bg-black/95 px-6 py-5 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <textarea
                  onChange={handleInputChange}
                  value={input}
                  rows={1}
                  className="max-h-32 w-full resize-none rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3.5 pr-12 text-sm text-white transition-all [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 [&::-webkit-scrollbar]:hidden"
                  placeholder="Ask me anything or describe an email you want to write..."
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  style={{
                    height: "auto",
                    minHeight: "48px",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                  }}
                />
                <div className="absolute bottom-3.5 right-3 text-xs text-gray-600">
                  Enter to send
                </div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-12 shrink-0 items-center justify-center self-start rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 px-6 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || !input.trim()}
                style={{ marginTop: "0px" }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <span className="text-white">Send</span>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BuddyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <BuddyPageContent />
    </Suspense>
  );
}
