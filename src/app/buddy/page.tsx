"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Plus,
  Loader2,
  Copy,
  Check,
  Mail,
  ArrowLeft,
  X,
  MessageCircle,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  Send,
  Clock,
} from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { fetchWithAuthRetry } from "@/lib/fetch-with-retry";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
    subtitle: "Post-meeting recap",
    query:
      "Write a professional follow-up email after a business meeting summarizing key points and next steps",
    icon: Calendar,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: "proposal",
    title: "Proposal",
    subtitle: "Project outline",
    query:
      "Draft a professional project proposal email to a potential client outlining scope, timeline, and deliverables",
    icon: FileText,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    id: "update",
    title: "Status Update",
    subtitle: "Progress report",
    query:
      "Create a professional status update email to stakeholders about project progress and milestones",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: "intro",
    title: "Introduction",
    subtitle: "New connection",
    query:
      "Write a professional introduction email to establish a new business relationship",
    icon: MessageSquare,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
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
  return words.join(" ") + "...";
};

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
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
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
              description: "Your account needs to be reconnected. Redirecting...",
              duration: 3000,
            });

            setTimeout(async () => {
              try {
                const { getAurinkoAuthUrl } = await import("@/lib/aurinko");
                const url = await getAurinkoAuthUrl("Google");
                window.location.href = url;
              } catch (error) {
                console.error("Error reconnecting account:", error);
                toast.error("Failed to reconnect", {
                  description: "Please try refreshing the page and reconnecting manually.",
                });
              }
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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        sendMessage(input);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      }
    },
    [input, sendMessage, isLoading],
  );

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


      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isShortcut = isMac
        ? (event.metaKey && event.key === 'n')
        : (event.altKey && event.key === 'n');

      if (isShortcut) {
        event.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0C0C0D]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          <span className="text-sm text-zinc-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="flex h-screen bg-[#0C0C0D]">
      <aside className="hidden w-[260px] flex-col border-r border-zinc-800/60 lg:flex">
        <div className="flex h-14 items-center gap-3 border-b border-zinc-800/60 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-yellow-400 to-yellow-500">
              <video
                src="/Vectormail-logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full scale-[1.8] object-cover"
              />
            </div>
            <span className="text-sm font-semibold text-zinc-100">
              VectorMail
            </span>
          </Link>
          <span className="ml-auto rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">
            AI
          </span>
        </div>

        <div className="p-2">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New chat</span>
            </div>
            <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
              {typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? "Command + N" : "Alt + N"}
            </kbd>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {savedChats.length > 0 ? (
            <div className="space-y-0.5 py-2">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                  Recent
                </span>
                <Clock className="h-3 w-3 text-zinc-700" />
              </div>
              {savedChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors",
                    activeChat === chat.id
                      ? "bg-zinc-800/70 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200",
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px]">{chat.heading}</p>
                    <p className="truncate text-[11px] text-zinc-600">
                      {formatTime(chat.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5 text-zinc-600 hover:text-zinc-400" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-xl bg-zinc-800/50 p-3">
                <MessageSquare className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-[13px] text-zinc-500">No conversations yet</p>
              <p className="text-[12px] text-zinc-600">
                Start a new chat above
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800/60 px-4 pb-4 pt-[22px]">
          <button
            onClick={() => router.push("/mail")}
            className="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[13px] text-zinc-500 transition-colors hover:bg-zinc-800/40 hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inbox
          </button>
          <div className="flex items-center gap-2 px-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-[13px] text-zinc-600">Account</span>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b border-zinc-800/60 px-4 lg:hidden">
          <Link
            href="/"
            className="flex h-6 w-6 items-center justify-center overflow-hidden rounded bg-gradient-to-br from-yellow-400 to-yellow-500"
          >
            <video
              src="/Vectormail-logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full scale-[1.8] object-cover"
            />
          </Link>
          <div className="flex gap-1">
            <button
              onClick={handleNewChat}
              className="rounded-md p-2 text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push("/mail")}
              className="rounded-md p-2 text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
            >
              <Mail className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {messages.length > 0 ? (
            <div className="mx-auto max-w-2xl px-4 py-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-6"
                  >
                    {message.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-yellow-500 px-4 py-2.5">
                          <p className="text-[14px] leading-relaxed text-black">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                          <Bot className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          {message.emailData ? (
                            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80">
                              <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-500/10">
                                    <Mail className="h-3 w-3 text-yellow-400" />
                                  </div>
                                  <span className="text-[12px] font-medium text-zinc-400">
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
                                  className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                                >
                                  {copiedId === message.id ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span className="text-emerald-400">
                                        Copied
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="border-b border-zinc-800/60 px-4 py-3">
                                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                                  Subject
                                </label>
                                <p className="text-[14px] font-medium text-zinc-100">
                                  {message.emailData.subject}
                                </p>
                              </div>

                              <div className="px-4 py-4">
                                <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                                  Body
                                </label>
                                <div className="space-y-2.5 text-[13px] leading-[1.7] text-zinc-300">
                                  {message.emailData.body
                                    .split(/\n\n+/)
                                    .filter((para) => para.trim())
                                    .map((paragraph, i) => {
                                      const lines = paragraph.split("\n");
                                      return (
                                        <p key={i} className="mb-2.5 last:mb-0">
                                          {lines.map((line, lineIdx) => {
                                            const parts =
                                              line.split(/(\*\*.*?\*\*)/g);
                                            return (
                                              <span key={lineIdx}>
                                                {parts.map((part, j) =>
                                                  part.startsWith("**") &&
                                                    part.endsWith("**") ? (
                                                    <strong
                                                      key={j}
                                                      className="font-semibold text-zinc-100"
                                                    >
                                                      {part.slice(2, -2)}
                                                    </strong>
                                                  ) : (
                                                    <span key={j}>{part}</span>
                                                  ),
                                                )}
                                                {lineIdx < lines.length - 1 && (
                                                  <br />
                                                )}
                                              </span>
                                            );
                                          })}
                                        </p>
                                      );
                                    })}
                                </div>
                              </div>

                              {message.emailData.suggestions &&
                                message.emailData.suggestions.length > 0 && (
                                  <div className="border-t border-zinc-800/60 bg-zinc-900/50 px-4 py-3">
                                    <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                                      Alternatives
                                    </label>
                                    <div className="space-y-2">
                                      {message.emailData.suggestions.map(
                                        (s, idx) => (
                                          <div
                                            key={idx}
                                            className="group flex items-start justify-between rounded-lg bg-zinc-800/50 p-3 transition-colors hover:bg-zinc-800"
                                          >
                                            <div className="min-w-0 flex-1">
                                              <p className="text-[13px] font-medium text-zinc-200">
                                                {s.subject}
                                              </p>
                                              <p className="mt-0.5 line-clamp-1 text-[12px] text-zinc-500">
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
                                              className="ml-2 shrink-0 rounded p-1.5 opacity-0 transition-all hover:bg-zinc-700 group-hover:opacity-100"
                                            >
                                              {copiedId ===
                                                `${message.id}-${idx}` ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                              ) : (
                                                <Copy className="h-3.5 w-3.5 text-zinc-500" />
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
                            <p className="text-[14px] leading-relaxed text-zinc-300">
                              {message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                    <Bot className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <div className="w-full max-w-lg">
                <div className="mb-10 text-center">
                  <div className="mb-5 inline-flex items-center justify-center">
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/25">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full scale-[1.7] object-cover"
                        >
                          <source src="/Vectormail-logo.mp4" type="video/mp4" />
                        </video>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0C0C0D]">
                        <MessageCircle className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <h1 className="mb-1.5 text-xl font-semibold tracking-tight text-white">
                    Email Assistant
                  </h1>
                  <p className="text-sm text-zinc-500">
                    Draft professional emails in seconds with AI
                  </p>
                </div>

                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      Quick Start
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(
                      ({
                        id,
                        title,
                        subtitle,
                        query,
                        icon: Icon,
                        color,
                        bg,
                      }) => (
                        <button
                          key={id}
                          onClick={() => sendMessage(query)}
                          className="group flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3 text-left transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                              bg,
                            )}
                          >
                            <Icon className={cn("h-4 w-4", color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-zinc-200 group-hover:text-white">
                              {title}
                            </p>
                            <p className="text-[11px] text-zinc-600">
                              {subtitle}
                            </p>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                    Tips for best results
                  </p>
                  <ul className="space-y-1.5 text-[12px] text-zinc-500">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-600" />
                      Be specific about the context and tone you want
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-600" />
                      Include key points you want to convey
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-600" />
                      Mention the relationship (colleague, client, etc.)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800/60 bg-[#0C0C0D] p-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
            <div className="relative flex items-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-1.5 transition-colors focus-within:border-zinc-700">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                }}
                placeholder="Describe the email you want to write..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-[14px] text-zinc-100 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 [&::-webkit-scrollbar]:hidden"
                style={{ minHeight: "40px" }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-black transition-all hover:bg-yellow-400 disabled:opacity-30"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-zinc-600">
              <span>↵ Send</span>
              <span>⇧↵ New line</span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function BuddyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#0C0C0D]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
            <span className="text-sm text-zinc-500">Loading...</span>
          </div>
        </div>
      }
    >
      <BuddyPageContent />
    </Suspense>
  );
}
