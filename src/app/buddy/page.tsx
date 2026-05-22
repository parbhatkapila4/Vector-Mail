"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/trpc/react";
import {
  Loader2,
  Check,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  ArrowLeft,
  Send,
  AtSign,
  SlidersHorizontal,
  Languages,
  ArrowUp,
  ArrowRight,
  TrendingUp,
  Database,
  Clock,
  Cpu,
  Zap,
  Trash2,
  X,
  Search,
} from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { fetchWithAuthRetry } from "@/lib/fetch-with-retry";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/nextjs";
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

const templates = [
  {
    id: "followup",
    title: "Follow-up",
    description: "After a meeting · pulls **calendar context** and attendees",
    query:
      "Follow-up email after a meeting. Recap of decisions, owners, and the next step with a date.",
    icon: Calendar,
    kbd: "⌘1",
  },
  {
    id: "proposal",
    title: "Proposal",
    description: "To a prospect · **scope, timeline,** pricing structure",
    query:
      "Project proposal email to a prospect. Cover scope, timeline, and deliverables. Include next step and a date.",
    icon: FileText,
    kbd: "⌘2",
  },
  {
    id: "update",
    title: "Status update",
    description: "To stakeholders · **weekly progress** + blockers",
    query:
      "Status update to stakeholders. Lead with the headline. Include progress, blockers, and the date of the next update.",
    icon: Users,
    kbd: "⌘3",
  },
  {
    id: "intro",
    title: "Intro",
    description: "Cold or warm · **founder-direct,** under 60 words",
    query:
      "Introduction email to start a working relationship. Brief, specific, with a clear ask.",
    icon: MessageSquare,
    kbd: "⌘4",
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

const formatRecentDate = (timestamp: number) => {
  const d = new Date(timestamp);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}.${dd}`;
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatRelativeSync(date: Date | string | null): string {
  if (!date) return "-";
  const sec = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

function formatRelativeShort(date: Date | string | null): string {
  if (!date) return "never";
  const sec = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
function computeDraftStats(
  current: ChatMessage[],
  saved: SavedChat[],
): {
  draftsToday: number;
  dailyCounts: number[];
  last7Count: number;
  prev7Count: number;
} {
  const timestamps: number[] = [];
  for (const m of current) {
    if (m.role === "assistant" && m.emailData) timestamps.push(m.timestamp);
  }
  for (const c of saved) {
    for (const m of c.messages) {
      if (m.role === "assistant" && m.emailData) timestamps.push(m.timestamp);
    }
  }
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();
  const dailyCounts = Array.from({ length: 7 }, (_, i) => {
    const dayStart = todayStartMs - (6 - i) * dayMs;
    const dayEnd = dayStart + dayMs;
    return timestamps.filter((t) => t >= dayStart && t < dayEnd).length;
  });
  const last7Start = todayStartMs - 6 * dayMs;
  const prev7Start = todayStartMs - 13 * dayMs;
  const todayEnd = todayStartMs + dayMs;
  const last7Count = timestamps.filter(
    (t) => t >= last7Start && t < todayEnd,
  ).length;
  const prev7Count = timestamps.filter(
    (t) => t >= prev7Start && t < last7Start,
  ).length;
  return {
    draftsToday: dailyCounts[6] ?? 0,
    dailyCounts,
    last7Count,
    prev7Count,
  };
}

function renderDescription(raw: string) {
  const parts = raw.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

type MentionItem = { id: string; label: string; address?: string };

const TONE_OPTIONS: Array<{ id: string; label: string; hint: string }> = [
  { id: "professional", label: "Professional", hint: "Polished and business-ready" },
  { id: "friendly", label: "Friendly", hint: "Warm, approachable, human" },
  { id: "formal", label: "Formal", hint: "Strict and respectful" },
  { id: "casual", label: "Casual", hint: "Relaxed, everyday voice" },
  { id: "persuasive", label: "Persuasive", hint: "Builds a clear case" },
  { id: "concise", label: "Concise", hint: "Direct and punchy" },
  { id: "urgent", label: "Urgent", hint: "Conveys time pressure" },
  { id: "apologetic", label: "Apologetic", hint: "Acknowledges and repairs" },
  { id: "confident", label: "Confident", hint: "Assertive and certain" },
  { id: "enthusiastic", label: "Enthusiastic", hint: "Energetic and upbeat" },
];

const LANGUAGE_OPTIONS: Array<{ code: string; label: string; native: string }> = [
  { code: "EN", label: "English", native: "English" },
  { code: "ES", label: "Spanish", native: "Español" },
  { code: "FR", label: "French", native: "Français" },
  { code: "DE", label: "German", native: "Deutsch" },
  { code: "IT", label: "Italian", native: "Italiano" },
  { code: "PT", label: "Portuguese", native: "Português" },
  { code: "NL", label: "Dutch", native: "Nederlands" },
  { code: "HI", label: "Hindi", native: "हिन्दी" },
  { code: "JA", label: "Japanese", native: "日本語" },
  { code: "ZH", label: "Chinese", native: "中文" },
  { code: "KO", label: "Korean", native: "한국어" },
  { code: "AR", label: "Arabic", native: "العربية" },
  { code: "RU", label: "Russian", native: "Русский" },
];

function stripAugmentation(content: string): string {
  const marker = "\n\nAdditional instructions for this draft:\n";
  const idx = content.indexOf(marker);
  return idx === -1 ? content : content.slice(0, idx);
}

const EMAIL_RE =
  /^[A-Za-z0-9](?:[A-Za-z0-9._%+\-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;

function isValidEmail(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_RE.test(trimmed);
}

function buildAugmentedPrompt(
  input: string,
  mentions: MentionItem[],
  tone: string | null,
  language: string,
): string {
  const constraints: string[] = [];
  if (language && language !== "English") {
    constraints.push(
      `Write the entire email — subject line and body — in ${language}. Do not mix in English.`,
    );
  }
  if (tone) {
    constraints.push(
      `Use a ${tone.toLowerCase()} tone throughout the email. The voice should feel ${tone.toLowerCase()} from greeting to sign-off.`,
    );
  }
  if (mentions.length > 0) {
    const labels = mentions
      .map((m) => (m.address ? `${m.label} <${m.address}>` : m.label))
      .join(", ");
    constraints.push(
      `Naturally reference or address the following in the email body: ${labels}. Weave them in where they fit the narrative — do not just list them.`,
    );
  }
  if (constraints.length === 0) return input;
  return `${input}\n\nAdditional instructions for this draft:\n${constraints
    .map((c) => `- ${c}`)
    .join("\n")}`;
}

function BuddyMark({
  size = 11,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/Opus-B.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
      draggable={false}
    />
  );
}

function renderInline(line: string) {
  const parts = line.split(/(\*\*.*?\*\*|\[[^\]]+\])/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j}>{part.slice(2, -2)}</strong>;
    }
    if (
      part.startsWith("[") &&
      part.endsWith("]") &&
      part.length > 2 &&
      part.length < 80
    ) {
      return (
        <span className="email-placeholder" key={j}>
          {part}
        </span>
      );
    }
    return <span key={j}>{part}</span>;
  });
}

function EmailBody({ body }: { body: string }) {
  return (
    <div className="email-body">
      {body
        .split(/\n\n+/)
        .filter((p) => p.trim())
        .map((paragraph, i) => {
          const lines = paragraph.split("\n");
          const isOrderedList =
            lines.length > 1 &&
            lines.every((l) => /^(\d+\.|[a-z]\.)\s+\S/.test(l.trim()));
          if (isOrderedList) {
            return (
              <ol key={i} className="email-list">
                {lines.map((rawLine, li) => {
                  const trimmed = rawLine.trim();
                  const text = trimmed.replace(/^(\d+\.|[a-z]\.)\s+/, "");
                  return <li key={li}>{renderInline(text)}</li>;
                })}
              </ol>
            );
          }
          return (
            <p key={i}>
              {lines.map((line, li) => (
                <span key={li}>
                  {renderInline(line)}
                  {li < lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          );
        })}
    </div>
  );
}

function BuddyPageContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
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
  const composeRef = useRef<HTMLTextAreaElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [tone, setTone] = useLocalStorage<string | null>(
    "buddy-tone",
    null,
  );
  const [language, setLanguage] = useLocalStorage<string>(
    "buddy-language",
    "English",
  );
  const [openMenu, setOpenMenu] = useState<
    null | "mention" | "tone" | "language"
  >(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const menuClusterRef = useRef<HTMLDivElement>(null);

  const [emailActionMenu, setEmailActionMenu] = useState<{
    messageId: string;
    type: "tone" | "recipient";
  } | null>(null);
  const [emailRecipientQuery, setEmailRecipientQuery] = useState("");
  const emailActionMenuRef = useRef<HTMLDivElement>(null);

  const [pendingSend, setPendingSend] = useState<{
    displayText: string;
    recipients: MentionItem[];
    subject: string;
  } | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(
    null,
  );
  const [editingDraft, setEditingDraft] = useState<{
    subject: string;
    body: string;
  } | null>(null);

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

  const openInGmail = useCallback(
    (subject: string, body: string, recipients?: MentionItem[]) => {
      const to = (recipients ?? [])
        .filter((r) => r.address)
        .map((r) => r.address)
        .join(",");
      const url = new URL("https://mail.google.com/mail/");
      url.searchParams.set("view", "cm");
      url.searchParams.set("fs", "1");
      if (to) url.searchParams.set("to", to);
      url.searchParams.set("su", subject);
      url.searchParams.set("body", body);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    },
    [],
  );

  const saveCurrentChat = useCallback(
    (chatMessages: ChatMessage[]) => {
      if (chatMessages.length === 0) return;
      const cleanMessages: ChatMessage[] = chatMessages.map((m) =>
        m.role === "user"
          ? { ...m, content: stripAugmentation(m.content) }
          : m,
      );
      const firstUser = cleanMessages.find((m) => m.role === "user");
      const previewSource = firstUser?.content ?? "";
      const id = activeChat ?? `chat-${Date.now()}`;
      const entry: SavedChat = {
        id,
        heading: generateHeading(cleanMessages),
        messages: cleanMessages,
        timestamp: Date.now(),
        preview: previewSource.substring(0, 60),
      };
      setSavedChats((prev) => {
        const idx = prev.findIndex((c) => c.id === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = entry;
          return next;
        }
        return [entry, ...prev].slice(0, 20);
      });
      if (!activeChat) setActiveChat(id);
    },
    [activeChat, setSavedChats, setActiveChat],
  );

  const sendMessage = useCallback(
    async (displayText: string, sendText?: string) => {
      const apiText = sendText ?? displayText;
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: displayText,
        timestamp: Date.now(),
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      const apiMessages = updatedMessages.map((msg, idx) =>
        idx === updatedMessages.length - 1
          ? { ...msg, content: apiText }
          : msg,
      );

      try {
        const response = await fetchWithAuthRetry("/api/buddy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages.map((msg) => ({
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
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        saveCurrentChat(finalMessages);
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
    [messages, setMessages, saveCurrentChat],
  );

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isLoading) return;

    const trimmed = input.trim().toLowerCase();
    const sendIntent =
      /^(?:send\b|please\s+send\b|now\s+send\b|can\s+you\s+send\b|just\s+send\b)/.test(
        trimmed,
      );

    if (sendIntent) {
      const validRecipients = mentions.filter((m) => !!m.address);
      const lastEmail = [...messages]
        .reverse()
        .find((m) => m.role === "assistant" && m.emailData)?.emailData;

      if (!lastEmail) {
        toast.error(
          "No email draft yet — generate one first, then I can send it.",
        );
        return;
      }
      if (validRecipients.length === 0) {
        toast.error(
          "Add a recipient first — tap 'add recipient' on the draft above.",
        );
        return;
      }

      setPendingSend({
        displayText: input,
        recipients: validRecipients,
        subject: lastEmail.subject,
      });
      setInput("");
      setOpenMenu(null);
      return;
    }

    const augmented = buildAugmentedPrompt(input, mentions, tone, language);
    sendMessage(input, augmented);
    setInput("");
    setMentions([]);
    setOpenMenu(null);
  }, [input, sendMessage, isLoading, mentions, tone, language, messages]);

  const startEditingEmail = useCallback(
    (messageId: string, subject: string, body: string) => {
      setEditingMessageId(messageId);
      setEditingDraft({ subject, body });
      setEmailActionMenu(null);
    },
    [],
  );
  const cancelEditingEmail = useCallback(() => {
    setEditingMessageId(null);
    setEditingDraft(null);
  }, []);
  const saveEditingEmail = useCallback(() => {
    if (!editingMessageId || !editingDraft) return;
    const trimmedSubject = editingDraft.subject.trim();
    const newBody = editingDraft.body;
    if (!trimmedSubject) {
      toast.error("Subject can't be empty.");
      return;
    }
    if (!newBody.trim()) {
      toast.error("Body can't be empty.");
      return;
    }

    const targetId = editingMessageId;
    let foundTarget = false;
    const nextMessages = messages.map((m) => {
      if (m.id === targetId && m.emailData) {
        foundTarget = true;
        return {
          ...m,
          emailData: {
            ...m.emailData,
            subject: trimmedSubject,
            body: newBody,
          },
        };
      }
      return m;
    });

    if (!foundTarget) {
      toast.error(
        "Couldn't find this draft in the conversation. Try regenerating it.",
      );
      return;
    }

    setMessages(nextMessages);
    saveCurrentChat(nextMessages);
    setEditingMessageId(null);
    setEditingDraft(null);
    toast.success("Draft updated");
  }, [
    editingMessageId,
    editingDraft,
    messages,
    setMessages,
    saveCurrentChat,
  ]);

  const confirmPendingSend = useCallback(() => {
    if (!pendingSend) return;
    const addresses = pendingSend.recipients
      .map((r) => r.address!)
      .filter(Boolean);
    if (addresses.length === 0) {
      setPendingSend(null);
      return;
    }
    sendMessage(pendingSend.displayText, `Send to ${addresses.join(", ")}`);
    setPendingSend(null);
  }, [pendingSend, sendMessage]);
  const cancelPendingSend = useCallback(() => {
    setPendingSend(null);
  }, []);

  const handleRegenerate = useCallback(() => {
    if (isLoading) return;
    const display = "Regenerate";
    const send =
      "Rewrite the previous email — same intent and key points, but a fresh angle, different phrasing, and a slightly different structure.";
    sendMessage(display, buildAugmentedPrompt(send, [], tone, language));
  }, [isLoading, sendMessage, tone, language]);

  const useAlternative = useCallback(
    (
      messageId: string,
      alt: { subject: string; body: string },
    ) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === messageId);
        if (idx < 0 || !prev[idx]?.emailData) return prev;
        const target = prev[idx]!;
        const oldEmail = target.emailData!;
        const remaining = (oldEmail.suggestions ?? []).filter(
          (s) =>
            s.subject !== alt.subject || s.body !== alt.body,
        );
        const newSuggestions = [
          { subject: oldEmail.subject, body: oldEmail.body },
          ...remaining,
        ].slice(0, 3);
        const next = [...prev];
        next[idx] = {
          ...target,
          emailData: {
            ...oldEmail,
            subject: alt.subject,
            body: alt.body,
            suggestions: newSuggestions,
          },
        };
        return next;
      });
    },
    [setMessages],
  );

  const handleNewChat = useCallback(() => {
    if (messages.length > 0) saveCurrentChat(messages);
    setMessages([]);
    setInput("");
    setActiveChat(null);
  }, [messages, setMessages, saveCurrentChat]);

  const loadChat = useCallback(
    (chat: SavedChat) => {
      setMessages(chat.messages);
      setActiveChat(chat.id);
    },
    [setMessages],
  );

  const deleteChat = useCallback(
    (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
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
    const ta = composeRef.current;
    if (!ta) return;
    ta.style.height = "26px";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [input]);

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

  const accountsQuery = api.account.getAccounts.useQuery(undefined, {
    enabled: isLoaded && !!isSignedIn,
  });
  const primaryAccountId = accountsQuery.data?.[0]?.id ?? null;
  const railStatsQuery = api.account.getBuddyRailStats.useQuery(
    { accountId: primaryAccountId ?? "" },
    {
      enabled: !!primaryAccountId,
      refetchInterval: 30_000,
      refetchOnWindowFocus: true,
    },
  );
  const railStats = railStatsQuery.data;

  const contactsQuery = api.account.getEmailSuggestions.useQuery(
    { accountId: primaryAccountId ?? "", query: "" },
    {
      enabled: !!primaryAccountId,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const contacts = useMemo(
    () => contactsQuery.data ?? [],
    [contactsQuery.data],
  );
  const filteredContacts = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    if (!q) return contacts.slice(0, 8);
    return contacts
      .filter(
        (c) =>
          c.address.toLowerCase().includes(q) ||
          (c.name ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [contacts, mentionQuery]);

  const addMention = useCallback((item: MentionItem) => {
    setMentions((prev) => {
      const exists = prev.some((m) => m.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
    setMentionQuery("");
  }, []);
  const removeMention = useCallback((id: string) => {
    setMentions((prev) => prev.filter((m) => m.id !== id));
  }, []);
  const addCustomMention = useCallback(() => {
    const text = mentionQuery.trim();
    if (!text) return;
    addMention({ id: `custom-${Date.now()}`, label: text });
  }, [mentionQuery, addMention]);

  const emailFilteredContacts = useMemo(() => {
    const q = emailRecipientQuery.trim().toLowerCase();
    if (!q) return contacts.slice(0, 8);
    return contacts
      .filter(
        (c) =>
          c.address.toLowerCase().includes(q) ||
          (c.name ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [contacts, emailRecipientQuery]);
  const showEmailCustomRecipientRow =
    emailRecipientQuery.trim().length > 0 &&
    !emailFilteredContacts.some(
      (c) =>
        c.address.toLowerCase() === emailRecipientQuery.trim().toLowerCase() ||
        (c.name ?? "").toLowerCase() ===
        emailRecipientQuery.trim().toLowerCase(),
    );

  const currentLangCode =
    LANGUAGE_OPTIONS.find((l) => l.label === language)?.code ?? "EN";
  const showCustomMentionRow =
    mentionQuery.trim().length > 0 &&
    !filteredContacts.some(
      (c) =>
        c.address.toLowerCase() === mentionQuery.trim().toLowerCase() ||
        (c.name ?? "").toLowerCase() === mentionQuery.trim().toLowerCase(),
    );

  useEffect(() => {
    if (!openMenu) return;
    const onPointer = (e: MouseEvent) => {
      if (
        menuClusterRef.current &&
        !menuClusterRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!emailActionMenu) return;
    const onPointer = (e: MouseEvent) => {
      if (
        emailActionMenuRef.current &&
        !emailActionMenuRef.current.contains(e.target as Node)
      ) {
        setEmailActionMenu(null);
        setEmailRecipientQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEmailActionMenu(null);
        setEmailRecipientQuery("");
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [emailActionMenu]);

  const draftStats = useMemo(
    () => computeDraftStats(messages, savedChats),
    [messages, savedChats],
  );
  const sparkline = useMemo(() => {
    const max = Math.max(...draftStats.dailyCounts, 1);
    return draftStats.dailyCounts.map((c) =>
      Math.max(4, Math.round((c / max) * 100)),
    );
  }, [draftStats.dailyCounts]);
  const trendLabel = useMemo(() => {
    const { last7Count, prev7Count } = draftStats;
    if (prev7Count === 0 && last7Count === 0) return "no activity yet";
    if (prev7Count === 0) return `+${last7Count} this week`;
    const pct = Math.round(((last7Count - prev7Count) / prev7Count) * 100);
    if (pct === 0) return "flat vs last week";
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct}% vs last week`;
  }, [draftStats]);
  const trendPositive =
    draftStats.last7Count >= draftStats.prev7Count;

  const lastSyncMin = railStats?.lastInboxSyncAt
    ? Math.round(
      (Date.now() - new Date(railStats.lastInboxSyncAt).getTime()) / 60000,
    )
    : null;
  const indexHealthy =
    lastSyncMin !== null && lastSyncMin < 60 && !!railStats?.embeddingsCount;
  const coveragePct =
    railStats && railStats.totalEmails > 0
      ? Math.round((railStats.embeddingsCount / railStats.totalEmails) * 100)
      : null;
  const providerLabel = (railStats?.provider || "mailbox").toLowerCase();
  const accountEmail = railStats?.email ?? accountsQuery.data?.[0]?.emailAddress;

  if (!mounted || !isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-4 w-4 animate-spin text-[#5a5752]" />
      </div>
    );
  }

  const firstName =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "there";

  const handleComposeKey = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="buddy-page">
      <main className="main">
        <div className="topbar">
          <div className="crumb">
            <button
              type="button"
              className="crumb-back"
              onClick={() => router.push("/mail")}
            >
              <ArrowLeft style={{ width: 13, height: 13 }} />
              <span>Inbox</span>
            </button>
            <div className="crumb-sep" />
            <div className="crumb-tag">
              <span className="pulse-dot" />
              <span>
                {messages.length > 0
                  ? `Buddy · ${messages.length} message${messages.length === 1 ? "" : "s"}`
                  : "Buddy · compose"}
              </span>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              className="topbar-action"
              onClick={handleNewChat}
            >
              <BuddyMark size={12} />
              <span>New chat</span>
            </button>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="canvas">
            <div className="hero">
              <div className="hero-eyebrow">
                <span>Buddy · v2.4</span>
              </div>
              <h1 className="hero-title">
                {getGreeting()}, <em>{firstName}.</em>
              </h1>
              <p className="hero-subtitle">What do you need to write?</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="compose-card"
            >
              <div className="compose-input">
                <div className="draft-chip">
                  <BuddyMark size={12} />
                  <span>Draft</span>
                </div>
                <textarea
                  ref={composeRef}
                  className="compose-text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleComposeKey}
                  placeholder="man just make a mail for…"
                  disabled={isLoading}
                  rows={1}
                />
              </div>
              {mentions.length > 0 && (
                <div className="compose-chips">
                  {mentions.map((m) => (
                    <span key={m.id} className="compose-chip">
                      <AtSign />
                      <span>{m.label}</span>
                      {m.address && (
                        <span className="compose-chip-meta">
                          {m.address}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`Remove ${m.label}`}
                        onClick={() => removeMention(m.id)}
                      >
                        <X />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="compose-actions">
                <div className="action-cluster" ref={menuClusterRef}>
                  <div className="action-wrap">
                    <button
                      type="button"
                      className={`action-btn${openMenu === "mention" ? " active" : ""}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenu === "mention"}
                      onClick={() =>
                        setOpenMenu(openMenu === "mention" ? null : "mention")
                      }
                    >
                      <AtSign />
                      <span>
                        {mentions.length > 0
                          ? `Mention · ${mentions.length}`
                          : "Mention"}
                      </span>
                    </button>
                    {openMenu === "mention" && (
                      <div className="action-menu mention-menu" role="menu">
                        <div className="menu-head">
                          <span>Mention people or topics</span>
                          {mentions.length > 0 && (
                            <button
                              type="button"
                              className="menu-clear-inline"
                              onClick={() => setMentions([])}
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                        <div className="menu-search">
                          <Search />
                          <input
                            autoFocus
                            value={mentionQuery}
                            onChange={(e) => setMentionQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                mentionQuery.trim() &&
                                filteredContacts.length === 0
                              ) {
                                e.preventDefault();
                                addCustomMention();
                              }
                            }}
                            placeholder="Search contacts or type a name…"
                          />
                        </div>
                        <div className="menu-body">
                          {filteredContacts.length === 0 &&
                            !showCustomMentionRow ? (
                            <div className="menu-empty">
                              {contactsQuery.isLoading
                                ? "Loading contacts…"
                                : "No contacts yet. Type a name and press Enter."}
                            </div>
                          ) : null}
                          {filteredContacts.map((c) => {
                            const id = c.address;
                            const isSelected = mentions.some(
                              (m) => m.id === id,
                            );
                            return (
                              <button
                                key={id}
                                type="button"
                                className={`menu-row${isSelected ? " selected" : ""}`}
                                onClick={() =>
                                  isSelected
                                    ? removeMention(id)
                                    : addMention({
                                      id,
                                      label: c.name || c.address,
                                      address: c.address,
                                    })
                                }
                              >
                                <div className="menu-row-main">
                                  <span className="menu-row-label">
                                    {c.name || c.address}
                                  </span>
                                  {c.name && (
                                    <span className="menu-row-hint">
                                      {c.address}
                                    </span>
                                  )}
                                </div>
                                {isSelected && (
                                  <Check className="menu-check" />
                                )}
                              </button>
                            );
                          })}
                          {showCustomMentionRow && (
                            <button
                              type="button"
                              className="menu-row menu-row-custom"
                              onClick={addCustomMention}
                            >
                              <div className="menu-row-main">
                                <span className="menu-row-label">
                                  Mention &ldquo;{mentionQuery.trim()}&rdquo;
                                </span>
                                <span className="menu-row-hint">
                                  Add as a custom reference
                                </span>
                              </div>
                              <span className="menu-row-add">+ add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="action-wrap">
                    <button
                      type="button"
                      className={`action-btn${openMenu === "tone" ? " active" : ""}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenu === "tone"}
                      onClick={() =>
                        setOpenMenu(openMenu === "tone" ? null : "tone")
                      }
                    >
                      <SlidersHorizontal />
                      <span>{tone ? `Tone · ${tone}` : "Tone"}</span>
                    </button>
                    {openMenu === "tone" && (
                      <div className="action-menu tone-menu" role="menu">
                        <div className="menu-head">
                          <span>Choose a tone</span>
                          {tone && (
                            <button
                              type="button"
                              className="menu-clear-inline"
                              onClick={() => {
                                setTone(null);
                                setOpenMenu(null);
                              }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="menu-body">
                          {TONE_OPTIONS.map((t) => {
                            const isSelected = tone === t.label;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                className={`menu-row${isSelected ? " selected" : ""}`}
                                onClick={() => {
                                  setTone(isSelected ? null : t.label);
                                  setOpenMenu(null);
                                }}
                              >
                                <div className="menu-row-main">
                                  <span className="menu-row-label">
                                    {t.label}
                                  </span>
                                  <span className="menu-row-hint">
                                    {t.hint}
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check className="menu-check" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="action-wrap">
                    <button
                      type="button"
                      className={`action-btn${openMenu === "language" ? " active" : ""}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenu === "language"}
                      onClick={() =>
                        setOpenMenu(openMenu === "language" ? null : "language")
                      }
                    >
                      <Languages />
                      <span>{currentLangCode}</span>
                    </button>
                    {openMenu === "language" && (
                      <div className="action-menu language-menu" role="menu">
                        <div className="menu-head">
                          <span>Output language</span>
                        </div>
                        <div className="menu-body">
                          {LANGUAGE_OPTIONS.map((l) => {
                            const isSelected = language === l.label;
                            return (
                              <button
                                key={l.code}
                                type="button"
                                className={`menu-row${isSelected ? " selected" : ""}`}
                                onClick={() => {
                                  setLanguage(l.label);
                                  setOpenMenu(null);
                                }}
                              >
                                <div className="menu-row-main">
                                  <span className="menu-row-label">
                                    {l.label}
                                  </span>
                                  <span className="menu-row-hint">
                                    {l.native}
                                  </span>
                                </div>
                                <span className="menu-row-code">
                                  {l.code}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="submit-cluster">
                  <span className="submit-hint">
                    {isLoading ? "generating…" : "⏎ to generate"}
                  </span>
                  <button
                    type="submit"
                    className="submit-btn"
                    aria-label="Generate"
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2
                        style={{
                          width: 15,
                          height: 15,
                          animation: "spin 0.9s linear infinite",
                        }}
                      />
                    ) : (
                      <ArrowUp />
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="section">
              <div className="section-head">
                <span className="section-label">Quick start</span>
                <span className="section-count">04</span>
                <div className="section-line" />
                <button type="button" className="section-action">
                  Customize <ArrowRight style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div className="quick-grid">
                {templates.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className="quick-card"
                      onClick={() =>
                        sendMessage(
                          t.query,
                          buildAugmentedPrompt(t.query, mentions, tone, language),
                        )
                      }
                      disabled={isLoading}
                    >
                      <div className="quick-top">
                        <div className="quick-icon">
                          <Icon />
                        </div>
                        <span className="quick-kbd">{t.kbd}</span>
                      </div>
                      <div className="quick-title">
                        {t.title}
                        <ArrowRight className="quick-arrow" />
                      </div>
                      <div className="quick-desc">
                        {renderDescription(t.description)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="section">
              <div className="section-head">
                <span className="section-label">Recent drafts</span>
                <span className="section-count">
                  {String(savedChats.length).padStart(2, "0")}
                </span>
                <div className="section-line" />
              </div>
              <div className="recents">
                {savedChats.length === 0 ? (
                  <div className="recents-empty">
                    No drafts yet - generate one above to start building
                    your library.
                  </div>
                ) : (
                  savedChats.slice(0, 6).map((chat, idx) => {
                    const lastAssistant = [...chat.messages]
                      .reverse()
                      .find((m) => m.role === "assistant" && m.emailData);
                    const sent = false; // TODO: track sent state per chat
                    const status: "active" | "sent" | "draft" =
                      idx === 0 ? "active" : sent ? "sent" : "draft";
                    const subject =
                      lastAssistant?.emailData?.subject || chat.heading;
                    const wordCount = lastAssistant?.emailData?.body
                      ? lastAssistant.emailData.body.split(/\s+/).filter(Boolean)
                        .length
                      : null;
                    const cleanPreview = stripAugmentation(chat.preview ?? "");
                    const previewTarget =
                      cleanPreview.length > 60
                        ? cleanPreview.slice(0, 60) + "…"
                        : cleanPreview;
                    const tagWord = chat.heading
                      .toLowerCase()
                      .includes("follow")
                      ? "follow-up"
                      : chat.heading.toLowerCase().includes("proposal")
                        ? "proposal"
                        : chat.heading.toLowerCase().includes("intro")
                          ? "intro"
                          : chat.heading.toLowerCase().includes("status")
                            ? "status"
                            : "draft";
                    return (
                      <div
                        key={chat.id}
                        role="button"
                        tabIndex={0}
                        className="recent-row"
                        onClick={() => loadChat(chat)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            loadChat(chat);
                          }
                        }}
                      >
                        <span className={`recent-status ${status}`} />
                        <div className="recent-main">
                          <div className="recent-title">{subject}</div>
                          <div className="recent-meta">
                            {previewTarget ? (
                              <>
                                <strong>{previewTarget}</strong>
                              </>
                            ) : (
                              <span>{formatTime(chat.timestamp)}</span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`recent-tag${idx === 0 ? " accent" : ""}`}
                        >
                          {tagWord}
                        </span>
                        <span className="recent-stat">
                          {wordCount
                            ? `${wordCount} word${wordCount === 1 ? "" : "s"}`
                            : formatTime(chat.timestamp)}
                        </span>
                        <span className="recent-date">
                          {formatRecentDate(chat.timestamp)}
                        </span>
                        <button
                          type="button"
                          className="recent-delete"
                          aria-label="Delete draft"
                          onClick={(e) => deleteChat(chat.id, e)}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="canvas canvas-chat">
            <div ref={messageContainerRef} className="chat-scroll">
              <div className="chat-stream">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {message.role === "user" ? (
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <div className="chat-bubble-user">
                            {stripAugmentation(message.content)}
                          </div>
                        </div>
                      ) : (
                        <div className="chat-bubble-assistant">
                          {message.emailData ? (
                            (() => {
                              const emailData = message.emailData;
                              const recipients = mentions.filter((m) => m.address);
                              const versionLabel = (() => {
                                const draftCount = messages
                                  .slice(0, messages.indexOf(message) + 1)
                                  .filter(
                                    (m) =>
                                      m.role === "assistant" && m.emailData,
                                  ).length;
                                return `V${draftCount || 1}`;
                              })();
                              const altCount = emailData.suggestions?.length ?? 0;
                              const isEditing =
                                editingMessageId === message.id &&
                                editingDraft !== null;
                              return (
                                <div className="email-card">
                                  <div className="email-card-head">
                                    <div className="email-card-head-left">
                                      <span>Email draft</span>
                                      <span className="email-version">
                                        {versionLabel}
                                      </span>
                                      {isEditing && (
                                        <span className="email-edit-badge">
                                          Editing
                                        </span>
                                      )}
                                    </div>
                                    <div className="email-card-actions">
                                      {isEditing ? (
                                        <>
                                          <button
                                            type="button"
                                            className="email-action"
                                            onClick={cancelEditingEmail}
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            className="email-action email-action-primary"
                                            onClick={saveEditingEmail}
                                          >
                                            Save
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            className="email-action"
                                            onClick={handleRegenerate}
                                            disabled={isLoading}
                                          >
                                            Regenerate
                                          </button>
                                          <button
                                            type="button"
                                            className="email-action"
                                            onClick={() =>
                                              startEditingEmail(
                                                message.id,
                                                emailData.subject,
                                                emailData.body,
                                              )
                                            }
                                            disabled={isLoading}
                                          >
                                            Edit
                                          </button>
                                          <div className="email-action-wrap">
                                            <button
                                              type="button"
                                              className={`email-action${emailActionMenu?.messageId ===
                                                  message.id &&
                                                  emailActionMenu.type === "tone"
                                                  ? " active"
                                                  : ""
                                                }`}
                                              onClick={() =>
                                                setEmailActionMenu(
                                                  emailActionMenu?.messageId ===
                                                    message.id &&
                                                    emailActionMenu.type === "tone"
                                                    ? null
                                                    : {
                                                      messageId: message.id,
                                                      type: "tone",
                                                    },
                                                )
                                              }
                                              disabled={isLoading}
                                            >
                                              {tone ? `Tone · ${tone}` : "Tone"}
                                            </button>
                                            {emailActionMenu?.messageId ===
                                              message.id &&
                                              emailActionMenu.type === "tone" && (
                                                <div
                                                  ref={emailActionMenuRef}
                                                  className="action-menu email-popover-menu"
                                                  role="menu"
                                                >
                                                  <div className="menu-head">
                                                    <span>Choose tone</span>
                                                    {tone && (
                                                      <button
                                                        type="button"
                                                        className="menu-clear-inline"
                                                        onClick={() => {
                                                          setTone(null);
                                                          setEmailActionMenu(null);
                                                          handleRegenerate();
                                                        }}
                                                      >
                                                        Clear
                                                      </button>
                                                    )}
                                                  </div>
                                                  <div className="menu-body">
                                                    {TONE_OPTIONS.map((t) => {
                                                      const isSelected =
                                                        tone === t.label;
                                                      return (
                                                        <button
                                                          key={t.id}
                                                          type="button"
                                                          className={`menu-row${isSelected ? " selected" : ""}`}
                                                          onClick={() => {
                                                            setTone(t.label);
                                                            setEmailActionMenu(null);
                                                            handleRegenerate();
                                                          }}
                                                        >
                                                          <div className="menu-row-main">
                                                            <span className="menu-row-label">
                                                              {t.label}
                                                            </span>
                                                            <span className="menu-row-hint">
                                                              {t.hint}
                                                            </span>
                                                          </div>
                                                          {isSelected && (
                                                            <Check className="menu-check" />
                                                          )}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                          <button
                                            type="button"
                                            className={`email-action${copiedId === message.id ? " copied" : ""}`}
                                            onClick={() =>
                                              copyToClipboard(
                                                `Subject: ${emailData.subject}\n\n${emailData.body}`,
                                                message.id,
                                              )
                                            }
                                          >
                                            {copiedId === message.id
                                              ? "Copied"
                                              : "Copy"}
                                          </button>
                                          <button
                                            type="button"
                                            className="email-action email-action-primary"
                                            onClick={() =>
                                              openInGmail(
                                                emailData.subject,
                                                emailData.body,
                                                recipients,
                                              )
                                            }
                                          >
                                            Open in Gmail
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="email-card-meta">
                                    <div className="email-meta-row">
                                      <span className="email-meta-label">
                                        To
                                      </span>
                                      <div className="email-meta-value">
                                        {recipients.length > 0 ? (
                                          recipients.map((r) => (
                                            <span
                                              key={r.id}
                                              className="email-recipient-chip"
                                            >
                                              {r.label}
                                            </span>
                                          ))
                                        ) : null}
                                        <div className="email-action-wrap">
                                          <button
                                            type="button"
                                            className={`email-add-recipient${emailActionMenu?.messageId ===
                                                message.id &&
                                                emailActionMenu.type === "recipient"
                                                ? " active"
                                                : ""
                                              }`}
                                            onClick={() => {
                                              setEmailRecipientQuery("");
                                              setEmailActionMenu(
                                                emailActionMenu?.messageId ===
                                                  message.id &&
                                                  emailActionMenu.type ===
                                                  "recipient"
                                                  ? null
                                                  : {
                                                    messageId: message.id,
                                                    type: "recipient",
                                                  },
                                              );
                                            }}
                                          >
                                            add recipient
                                          </button>
                                          {emailActionMenu?.messageId ===
                                            message.id &&
                                            emailActionMenu.type ===
                                            "recipient" && (
                                              <div
                                                ref={emailActionMenuRef}
                                                className="action-menu mention-menu email-popover-menu email-popover-recipient"
                                                role="menu"
                                              >
                                                <div className="menu-head">
                                                  <span>Add recipient</span>
                                                </div>
                                                <div className="menu-search">
                                                  <Search />
                                                  <input
                                                    autoFocus
                                                    value={emailRecipientQuery}
                                                    onChange={(e) =>
                                                      setEmailRecipientQuery(
                                                        e.target.value,
                                                      )
                                                    }
                                                    onKeyDown={(e) => {
                                                      if (
                                                        e.key === "Enter" &&
                                                        emailRecipientQuery.trim()
                                                      ) {
                                                        e.preventDefault();
                                                        const text =
                                                          emailRecipientQuery.trim();
                                                        if (!isValidEmail(text)) {
                                                          toast.error(
                                                            "Please enter a valid email address.",
                                                          );
                                                          return;
                                                        }
                                                        addMention({
                                                          id: text,
                                                          label: text,
                                                          address: text,
                                                        });
                                                        setEmailRecipientQuery("");
                                                        setEmailActionMenu(null);
                                                      }
                                                    }}
                                                    placeholder="Search contacts or type a name…"
                                                  />
                                                </div>
                                                <div className="menu-body">
                                                  {emailFilteredContacts.length ===
                                                    0 &&
                                                    !showEmailCustomRecipientRow ? (
                                                    <div className="menu-empty">
                                                      {contactsQuery.isLoading
                                                        ? "Loading contacts…"
                                                        : "No contacts yet. Type a name and press Enter."}
                                                    </div>
                                                  ) : null}
                                                  {emailFilteredContacts.map(
                                                    (c) => {
                                                      const id = c.address;
                                                      const isSelected =
                                                        recipients.some(
                                                          (r) => r.id === id,
                                                        );
                                                      return (
                                                        <button
                                                          key={id}
                                                          type="button"
                                                          className={`menu-row${isSelected ? " selected" : ""}`}
                                                          onClick={() => {
                                                            if (isSelected) {
                                                              removeMention(id);
                                                            } else {
                                                              addMention({
                                                                id,
                                                                label:
                                                                  c.name ||
                                                                  c.address,
                                                                address:
                                                                  c.address,
                                                              });
                                                            }
                                                            setEmailRecipientQuery(
                                                              "",
                                                            );
                                                            setEmailActionMenu(
                                                              null,
                                                            );
                                                          }}
                                                        >
                                                          <div className="menu-row-main">
                                                            <span className="menu-row-label">
                                                              {c.name ||
                                                                c.address}
                                                            </span>
                                                            {c.name && (
                                                              <span className="menu-row-hint">
                                                                {c.address}
                                                              </span>
                                                            )}
                                                          </div>
                                                          {isSelected && (
                                                            <Check className="menu-check" />
                                                          )}
                                                        </button>
                                                      );
                                                    },
                                                  )}
                                                  {showEmailCustomRecipientRow && (
                                                    (() => {
                                                      const candidate =
                                                        emailRecipientQuery.trim();
                                                      const looksValid =
                                                        isValidEmail(candidate);
                                                      return (
                                                        <button
                                                          type="button"
                                                          className={`menu-row menu-row-custom${looksValid ? "" : " menu-row-invalid"}`}
                                                          onClick={() => {
                                                            if (!looksValid) {
                                                              toast.error(
                                                                "Please enter a valid email address.",
                                                              );
                                                              return;
                                                            }
                                                            addMention({
                                                              id: candidate,
                                                              label: candidate,
                                                              address: candidate,
                                                            });
                                                            setEmailRecipientQuery(
                                                              "",
                                                            );
                                                            setEmailActionMenu(
                                                              null,
                                                            );
                                                          }}
                                                        >
                                                          <div className="menu-row-main">
                                                            <span className="menu-row-label">
                                                              {looksValid
                                                                ? `Add "${candidate}"`
                                                                : "Invalid email"}
                                                            </span>
                                                            <span className="menu-row-hint">
                                                              {looksValid
                                                                ? "Custom recipient"
                                                                : "Use the format name@domain.tld"}
                                                            </span>
                                                          </div>
                                                          <span className="menu-row-add">
                                                            {looksValid
                                                              ? "+ add"
                                                              : "—"}
                                                          </span>
                                                        </button>
                                                      );
                                                    })()
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="email-meta-row">
                                      <span className="email-meta-label">
                                        Subject
                                      </span>
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          className="email-edit-subject"
                                          value={editingDraft!.subject}
                                          onChange={(e) =>
                                            setEditingDraft((d) =>
                                              d
                                                ? {
                                                  ...d,
                                                  subject: e.target.value,
                                                }
                                                : d,
                                            )
                                          }
                                          placeholder="Subject"
                                        />
                                      ) : (
                                        <div className="email-meta-value email-meta-subject">
                                          {emailData.subject}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="email-card-body">
                                    {isEditing ? (
                                      <textarea
                                        className="email-edit-body"
                                        value={editingDraft!.body}
                                        onChange={(e) =>
                                          setEditingDraft((d) =>
                                            d
                                              ? { ...d, body: e.target.value }
                                              : d,
                                          )
                                        }
                                        placeholder="Email body"
                                        rows={14}
                                      />
                                    ) : (
                                      <EmailBody body={emailData.body} />
                                    )}
                                  </div>
                                  {altCount > 0 && (
                                    <div className="email-alts">
                                      <div className="email-alts-label">
                                        <span>Alternative drafts</span>
                                        <span className="email-alts-count">
                                          {altCount}
                                        </span>
                                      </div>
                                      <div className="email-alts-list">
                                        {emailData.suggestions!.map((s, idx) => (
                                          <button
                                            key={idx}
                                            type="button"
                                            className="email-alt"
                                            onClick={() =>
                                              useAlternative(message.id, s)
                                            }
                                          >
                                            <div className="email-alt-text">
                                              <p className="email-alt-subject">
                                                {s.subject}
                                              </p>
                                              <p className="email-alt-preview">
                                                {s.body}
                                              </p>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <p style={{ margin: 0 }}>{message.content}</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <div className="loading-row">
                    <div className="loading-bar" />
                    <span className="loading-label">
                      Generating your email…
                    </span>
                  </div>
                )}
                {pendingSend && (
                  <motion.div
                    className="send-confirm"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <div className="send-confirm-head">
                      <h4 className="send-confirm-title">Send this email?</h4>
                      <p className="send-confirm-subtitle">
                        Review the details below, then confirm.
                      </p>
                    </div>
                    <div className="send-confirm-rows">
                      <div className="send-confirm-row">
                        <span className="send-confirm-label">To</span>
                        <div className="send-confirm-recipients">
                          {pendingSend.recipients.map((r) => (
                            <span
                              key={r.id}
                              className="send-confirm-chip"
                            >
                              {r.address}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="send-confirm-row">
                        <span className="send-confirm-label">Subject</span>
                        <span className="send-confirm-subject">
                          {pendingSend.subject}
                        </span>
                      </div>
                    </div>
                    <div className="send-confirm-actions">
                      <button
                        type="button"
                        className="send-confirm-btn ghost"
                        onClick={cancelPendingSend}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="send-confirm-btn primary"
                        onClick={confirmPendingSend}
                        disabled={isLoading}
                      >
                        Send email
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="chat-compose-wrap">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="compose-card compose-card-inline"
              >
                <div className="compose-input">
                  <div className="draft-chip">
                    <BuddyMark size={12} />
                    <span>Reply</span>
                  </div>
                  <textarea
                    ref={composeRef}
                    className="compose-text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleComposeKey}
                    placeholder="Continue…"
                    disabled={isLoading}
                    rows={1}
                  />
                  <div className="submit-cluster">
                    <span className="submit-hint">
                      {isLoading ? "generating…" : "⏎ to send"}
                    </span>
                    <button
                      type="submit"
                      className="submit-btn"
                      aria-label="Send"
                      disabled={!input.trim() || isLoading}
                    >
                      {isLoading ? (
                        <Loader2
                          style={{
                            width: 15,
                            height: 15,
                            animation: "spin 0.9s linear infinite",
                          }}
                        />
                      ) : (
                        <ArrowUp />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <aside className="context-rail">
        <div className="rail-section">
          <div className="rail-head">Today</div>
          <div className="stat-card">
            <div className="stat-label">
              <Send />
              Drafts generated
            </div>
            <div className="stat-value">
              {draftStats.draftsToday}
              <em>{trendPositive ? "↗" : "↘"}</em>
            </div>
            <div
              className="stat-trend"
              style={
                trendPositive
                  ? undefined
                  : { color: "var(--ink-tertiary)" }
              }
            >
              <TrendingUp
                style={
                  trendPositive ? undefined : { transform: "rotate(180deg)" }
                }
              />
              {trendLabel}
            </div>
            <div className="sparkline-wrap">
              {sparkline.map((h, i) => (
                <div
                  key={i}
                  className={`spark-bar${i === 6 ? " active" : ""}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rail-section">
          <div className="rail-head">System</div>
          <div className="index-card">
            <div className="index-row">
              <div className="index-key">
                <Database />
                Index
              </div>
              {railStatsQuery.isLoading ? (
                <span className="index-val">…</span>
              ) : indexHealthy ? (
                <span className="index-val live">healthy</span>
              ) : (
                <span className="index-val">
                  {railStats?.lastInboxSyncAt ? "stale" : "syncing"}
                </span>
              )}
            </div>
            <div className="index-row">
              <div className="index-key">
                <Clock />
                Last sync
              </div>
              <span className="index-val">
                {railStatsQuery.isLoading
                  ? "…"
                  : formatRelativeSync(railStats?.lastInboxSyncAt ?? null)}
              </span>
            </div>
            <div className="index-row">
              <div className="index-key">
                <Cpu />
                Embeddings
              </div>
              <span className="index-val">
                {railStatsQuery.isLoading
                  ? "…"
                  : formatCompact(railStats?.embeddingsCount ?? 0)}
              </span>
            </div>
            <div className="index-row">
              <div className="index-key">
                <Zap />
                Coverage
              </div>
              <span className="index-val">
                {railStatsQuery.isLoading
                  ? "…"
                  : coveragePct !== null
                    ? `${coveragePct}%`
                    : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="rail-section">
          <div className="rail-head">Buddy tip</div>
          <div className="tip-card">
            <div className="tip-head">
              <BuddyMark size={12} />
              <span>Heads up</span>
            </div>
            <div className="tip-body">
              Mention a thread by typing <em>@</em> and Buddy will weave in
              context from prior conversations.
            </div>
          </div>
        </div>

        <div className="rail-section">
          <div className="rail-head">Shortcuts</div>
          <div className="index-card" style={{ fontSize: 11.5 }}>
            <div className="index-row">
              <span style={{ color: "var(--ink-secondary)" }}>New draft</span>
              <span className="index-val">⌘ N</span>
            </div>
            <div className="index-row">
              <span style={{ color: "var(--ink-secondary)" }}>Send</span>
              <span className="index-val">⌘ ⏎</span>
            </div>
            <div className="index-row">
              <span style={{ color: "var(--ink-secondary)" }}>Search</span>
              <span className="index-val">⌘ K</span>
            </div>
            <div className="index-row">
              <span style={{ color: "var(--ink-secondary)" }}>Tone shift</span>
              <span className="index-val">⌘ T</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="footer">
        <div className="footer-left">
          <div className="footer-item">
            <span
              className="footer-live"
              style={
                indexHealthy
                  ? undefined
                  : { background: "var(--ink-tertiary)", boxShadow: "none" }
              }
            />
            <span>
              {providerLabel} · synced{" "}
              {formatRelativeShort(railStats?.lastInboxSyncAt ?? null)}
            </span>
          </div>
          {accountEmail && (
            <>
              <span className="footer-sep">·</span>
              <span>{accountEmail}</span>
            </>
          )}
          <span className="footer-sep">·</span>
          <span>
            {railStats
              ? `${railStats.threadsIndexed.toLocaleString()} threads indexed`
              : "-"}
          </span>
          <span className="footer-sep">·</span>
          <span>pgvector · 768-dim</span>
        </div>
        <div className="footer-right">
          {coveragePct !== null && (
            <span>{coveragePct}% embedded</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuddyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
          <Loader2 className="h-4 w-4 animate-spin text-[#5a5752]" />
        </div>
      }
    >
      <BuddyPageContent />
    </Suspense>
  );
}
