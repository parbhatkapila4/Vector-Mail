"use client";

import { useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, MessageSquare, X } from "lucide-react";

const RUIXEN_BG_IMAGE =
  "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current)
      textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export interface QuickActionItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export interface RecentChatItem {
  id: string;
  heading: string;
  timestamp: number;
  preview: string;
}

interface RuixenMoonChatProps {
  title?: string;
  subtitle?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  quickActions: QuickActionItem[];
  recentChats?: RecentChatItem[];
  onSelectChat?: (chat: RecentChatItem) => void;
  onDeleteChat?: (id: string, e: React.MouseEvent) => void;
  formatTime?: (timestamp: number) => string;
}

export default function RuixenMoonChat({
  title = "VectorMail AI",
  subtitle = "Build something amazing, just start typing below.",
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Type your request...",
  quickActions,
  recentChats = [],
  onSelectChat,
  onDeleteChat,
  formatTime = (t) => new Date(t).toLocaleDateString(),
}: RuixenMoonChatProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 200,
    maxHeight: 480,
  });

  useEffect(() => {
    if (value === "") adjustHeight(true);
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
        adjustHeight(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) onSubmit();
  };

  return (
    <div className="relative flex min-h-screen w-full min-w-0 flex-1 flex-col items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale contrast-[1.05] brightness-90"
        style={{
          backgroundImage: `url('${RUIXEN_BG_IMAGE}')`,
          backgroundAttachment: "fixed",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex min-h-0 flex-1 w-full flex-col items-center justify-center pt-48 md:pt-64">
        <div className="flex w-full max-w-4xl flex-col items-center px-4">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {title}
            </h1>
            <p className="mt-2 text-neutral-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              {subtitle}
            </p>
          </div>

          <div className="mt-8 w-full shrink-0 pb-[15vh] ml-6 md:ml-10">
            <form onSubmit={handleSubmit}>
              <div className="relative rounded-xl border-x border-b border-white/20 bg-black/30 shadow-xl backdrop-blur-md">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className={cn(
                    "w-full px-5 py-4 resize-none border-none",
                    "bg-transparent text-white text-base",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                    "placeholder:text-neutral-400 min-h-[200px]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  style={{ overflow: "hidden" }}
                />

                <div className="flex items-center justify-end p-4">
                  <button
                    type="submit"
                    disabled={!value.trim() || isLoading}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      value.trim() && !isLoading
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex items-center justify-center flex-wrap gap-3 mt-10">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  onClick={action.onClick}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-5 py-2.5 text-sm text-neutral-200 shadow-lg backdrop-blur-sm hover:border-white/30 hover:bg-black/50 hover:text-white"
                >
                  {action.icon}
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {recentChats.length > 0 && (
          <div className="mt-auto w-full shrink-0 border-t border-white/15 bg-black/50 backdrop-blur-md py-3">
            <div className="mx-auto max-w-4xl px-4">
              <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {recentChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => onSelectChat?.(chat)}
                    className="group relative flex shrink-0 items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-2 transition-colors hover:bg-white/25 hover:border-white/35"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-neutral-300" />
                    <span className="max-w-[120px] truncate text-xs font-medium text-white">
                      {chat.heading}
                    </span>
                    <span className="text-[10px] text-neutral-300">
                      {formatTime(chat.timestamp)}
                    </span>
                    {onDeleteChat && (
                      <button
                        type="button"
                        onClick={(e) => onDeleteChat(chat.id, e)}
                        className="ml-0.5 rounded p-0.5 opacity-0 hover:bg-white/10 group-hover:opacity-70"
                        aria-label="Delete"
                      >
                        <X className="h-3 w-3 text-neutral-500" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
