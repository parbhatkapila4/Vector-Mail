"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { fetchWithAuthRetry } from "@/lib/fetch-with-retry";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import RuixenMoonChat from "@/components/ui/ruixen-moon-chat";
import { BuddyChatInput } from "./BuddyChatInput";

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

const templates = [
  {
    id: "followup",
    title: "Follow-up",
    description: "Post-meeting recap",
    query:
      "Write a professional follow-up email after a business meeting summarizing key points and next steps",
    icon: Calendar,
  },
  {
    id: "proposal",
    title: "Proposal",
    description: "Project outline",
    query:
      "Draft a professional project proposal email to a potential client outlining scope, timeline, and deliverables",
    icon: FileText,
  },
  {
    id: "update",
    title: "Status Update",
    description: "Progress report",
    query:
      "Create a professional status update email to stakeholders about project progress and milestones",
    icon: Users,
  },
  {
    id: "intro",
    title: "Introduction",
    description: "New connection",
    query:
      "Write a professional introduction email to establish a new business relationship",
    icon: MessageSquare,
  },
];

const generateHeading = (messages: ChatMessage[]): string => {
  if (messages.length === 0) return "New Chat";
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (!firstUserMessage) return "New Chat";
  const content = firstUserMessage.content.toLowerCase();
  if (content.includes("follow")) return "Follow-up Email";
  if (content.includes("proposal")) return "Project Proposal";
  if (content.includes("update") || content.includes("status"))
    return "Status Update";
  if (content.includes("intro")) return "Introduction";
  if (content.includes("thank")) return "Thank You Note";
  const words = firstUserMessage.content.split(" ").slice(0, 4);
  return words.join(" ") + "…";
};

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
};


function EmailBody({ body }: { body: string }) {
  return (
    <div className="space-y-3 text-[13.5px] leading-[1.8] text-stone-400">
      {body
        .split(/\n\n+/)
        .filter((p) => p.trim())
        .map((paragraph, i) => {
          const lines = paragraph.split("\n");
          return (
            <p key={i}>
              {lines.map((line, li) => {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <span key={li}>
                    {parts.map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j} className="font-medium text-stone-200">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      ),
                    )}
                    {li < lines.length - 1 && <br />}
                  </span>
                );
              })}
            </p>
          );
        })}
    </div>
  );
}

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
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const fresh = searchParams.get("fresh");
      if (fresh === "true") {
        setMessages([]);
        setInput("");
        setActiveChat(null);
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
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
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
        const response = await fetchWithAuthRetry("/api/buddy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              emailData: msg.emailData,
            })),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            data.message ||
            data.error ||
            "Something went wrong. Please try again.";

          if (data.needsReconnection) {
            toast.error("Session expired", {
              description:
                "Your account needs to be reconnected. Redirecting…",
              duration: 3000,
            });
            setTimeout(() => {
              window.location.href = "/api/connect/google";
            }, 2000);
            return;
          }

          toast.error(errorMessage);
          setMessages([
            ...updatedMessages,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: errorMessage,
              timestamp: Date.now(),
            },
          ]);
          return;
        }

        if (data.emailSent) {
          toast.success(`Email sent successfully to ${data.recipient}!`);
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            data.type === "conversation" ? data.message : "Here's your draft:",
          timestamp: Date.now(),
          emailData: data.subject ? data : undefined,
        };
        setMessages([...updatedMessages, assistantMessage]);
      } catch (error) {
        const isAbort =
          error instanceof DOMException && error.name === "AbortError";
        const errorMessage = isAbort
          ? "Request took too long. Please try again."
          : error instanceof Error
            ? error.message
            : "Failed to generate response";
        toast.error(errorMessage);
        setMessages([
          ...updatedMessages,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Something went wrong. Please try again.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, setMessages],
  );

  const handleSubmit = useCallback(() => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  }, [input, sendMessage, isLoading]);

  const handleNewChat = useCallback(() => {
    if (messages.length > 0) {
      const newChat: SavedChat = {
        id: Date.now().toString(),
        heading: generateHeading(messages),
        messages: [...messages],
        timestamp: Date.now(),
        preview:
          messages.find((m) => m.role === "user")?.content.substring(0, 60) ||
          "",
      };
      setSavedChats([newChat, ...savedChats].slice(0, 20));
    }
    setMessages([]);
    setInput("");
    setActiveChat(null);
  }, [messages, savedChats, setSavedChats, setMessages]);

  const loadChat = useCallback(
    (chat: SavedChat) => {
      setMessages(chat.messages);
      setActiveChat(chat.id);
    },
    [setMessages],
  );

  const deleteChat = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSavedChats(savedChats.filter((c) => c.id !== id));
      if (activeChat === id) {
        setMessages([]);
        setActiveChat(null);
      }
    },
    [savedChats, setSavedChats, activeChat, setMessages],
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isTyping =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isShortcut = isMac
        ? event.metaKey && event.key === "n"
        : event.altKey && event.key === "n";
      if (isShortcut) {
        event.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewChat]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0a09]">
        <Loader2 className="h-4 w-4 animate-spin text-stone-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0c0a09]">
      <main className="relative flex flex-1 flex-col min-h-0">

        <header className="relative z-20 flex items-center justify-between px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/mail")}
              className="flex items-center gap-1.5 text-[13px] text-stone-600 transition-colors hover:text-stone-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Inbox
            </button>
            {messages.length > 0 && (
              <div className="h-3 w-px bg-stone-800" />
            )}
            {messages.length > 0 && (
              <span className="text-[11px] font-medium tracking-wide text-stone-700">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-stone-600 transition-colors hover:bg-stone-800/50 hover:text-stone-400"
                aria-label="New chat"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">New</span>
              </button>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {messages.length > 0 ? (
            <>

              <div
                ref={messageContainerRef}
                className="flex-1 min-h-0 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="mx-auto w-full max-w-[768px] px-4 py-8 sm:px-6">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-6 last:mb-0"
                      >
                        {message.role === "user" ? (

                          <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-[#292524] px-5 py-3.5">
                              <p className="text-[15px] leading-[1.65] text-stone-100">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ) : (

                          <div className="w-full">
                            {message.emailData ? (

                              <div className="w-full overflow-hidden rounded-2xl border border-stone-800 bg-[#1c1917]">

                                <div className="flex items-center justify-between bg-[#292524] px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-stone-500" />
                                    <span className="text-[13px] font-medium text-stone-400">
                                      Email Draft
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        `Subject: ${message.emailData!.subject}\n\n${message.emailData!.body}`,
                                        message.id,
                                      )
                                    }
                                    className="flex items-center gap-1.5 text-[12px] text-stone-500 transition-colors hover:text-stone-200"
                                  >
                                    {copiedId === message.id ? (
                                      <>
                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="px-5 py-5">
                                  <p className="text-[16px] font-semibold leading-snug text-stone-100">
                                    {message.emailData.subject}
                                  </p>

                                  <div className="my-4 h-px bg-stone-800/70" />

                                  <EmailBody body={message.emailData.body} />
                                </div>

                                {message.emailData.suggestions &&
                                  message.emailData.suggestions.length > 0 && (
                                    <div className="border-t border-stone-800 px-5 py-4">
                                      <p className="mb-3 text-[12px] font-medium text-stone-500">
                                        Alternatives
                                      </p>
                                      <div className="space-y-2">
                                        {message.emailData.suggestions.map(
                                          (s, idx) => (
                                            <div
                                              key={idx}
                                              className="group flex items-center justify-between rounded-xl bg-[#292524] px-4 py-3 transition-colors hover:bg-stone-800"
                                            >
                                              <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-medium text-stone-300">
                                                  {s.subject}
                                                </p>
                                                <p className="mt-0.5 line-clamp-1 text-[12px] text-stone-500">
                                                  {s.body}
                                                </p>
                                              </div>
                                              <button
                                                onClick={() =>
                                                  copyToClipboard(
                                                    `Subject: ${s.subject}\n\n${s.body}`,
                                                    `${message.id}-${idx}`,
                                                  )
                                                }
                                                className="ml-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                              >
                                                {copiedId ===
                                                  `${message.id}-${idx}` ? (
                                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                ) : (
                                                  <Copy className="h-3.5 w-3.5 text-stone-500 hover:text-stone-300" />
                                                )}
                                              </button>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <p className="text-[15px] leading-[1.7] text-stone-300">
                                {message.content}
                              </p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 flex flex-col gap-3"
                    >
                      <div className="h-[2px] w-40 overflow-hidden rounded-full bg-stone-800/80">
                        <div className="h-full w-2/5 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-amber-600/70 to-transparent" />
                      </div>
                      <span className="text-[12px] text-stone-600">
                        Generating your email…
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="relative z-10 shrink-0 px-4 pb-4 pt-2 sm:px-6">
                <div className="mx-auto w-full max-w-[768px]">
                  <BuddyChatInput
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    placeholder="Continue…"
                  />
                </div>
              </div>
            </>
          ) : (

            <RuixenMoonChat
              title="VectorMail AI"
              subtitle="Your AI email assistant."
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              placeholder="Describe the email you need…"
              quickActions={templates.map(
                ({ title, description, query, icon: Icon }) => ({
                  icon: <Icon className="h-4 w-4" />,
                  label: title,
                  description,
                  onClick: () => sendMessage(query),
                }),
              )}
              recentChats={savedChats.map((c) => ({
                id: c.id,
                heading: c.heading,
                timestamp: c.timestamp,
                preview: c.preview,
              }))}
              onSelectChat={(chat) => {
                const saved = savedChats.find((c) => c.id === chat.id);
                if (saved) loadChat(saved);
              }}
              onDeleteChat={deleteChat}
              formatTime={formatTime}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function BuddyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#0c0a09]">
          <Loader2 className="h-4 w-4 animate-spin text-stone-600" />
        </div>
      }
    >
      <BuddyPageContent />
    </Suspense>
  );
}
