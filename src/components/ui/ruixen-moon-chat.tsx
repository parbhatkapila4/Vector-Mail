"use client";

import { useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Loader2, Trash2 } from "lucide-react";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (reset) {
        ta.style.height = `${minHeight}px`;
        return;
      }
      ta.style.height = `${minHeight}px`;
      ta.style.height = `${Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight ?? Infinity))}px`;
    },
    [minHeight, maxHeight],
  );
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);
  return { textareaRef, adjustHeight };
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
}

export interface QuickActionItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
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
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  quickActions: QuickActionItem[];
  recentChats?: RecentChatItem[];
  onSelectChat?: (c: RecentChatItem) => void;
  onDeleteChat?: (id: string, e: React.MouseEvent) => void;
  formatTime?: (ts: number) => string;
}

export default function RuixenMoonChat({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Describe the email you need…",
  quickActions,
  recentChats = [],
  onSelectChat,
  onDeleteChat,
  formatTime = (t) => new Date(t).toLocaleDateString(),
}: RuixenMoonChatProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 180,
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0c0a09]">

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(180,120,60,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[580px]">

          <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-600/50">
            Buddy
          </span>


          <h1 className="text-[clamp(26px,4.5vw,38px)] font-normal tracking-[-0.025em] text-stone-200">
            {getGreeting()}
          </h1>
          <p className="mt-0.5 text-[clamp(26px,4.5vw,38px)] font-normal tracking-[-0.025em] text-stone-600">
            What do you need to write?
          </p>


          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (value.trim() && !isLoading) onSubmit();
            }}
            className="mt-12"
          >
            <div className="group relative rounded-2xl border border-stone-800/80 bg-stone-900/50 transition-all duration-200 focus-within:border-amber-800/40 focus-within:bg-stone-900/70 focus-within:shadow-[0_0_0_1px_rgba(180,120,60,0.08)]">
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
                  "w-full resize-none border-none bg-transparent px-5 py-4 pr-14 text-[15px] text-stone-200",
                  "placeholder:text-stone-600 focus-visible:ring-0 focus-visible:ring-offset-0",
                  "min-h-[56px] disabled:cursor-not-allowed disabled:opacity-40",
                )}
                style={{ overflow: "hidden" }}
              />
              <button
                type="submit"
                disabled={!value.trim() || isLoading}
                className={cn(
                  "absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                  value.trim() && !isLoading
                    ? "bg-amber-600 text-white shadow-md shadow-amber-900/30 hover:bg-amber-500"
                    : "text-stone-700 cursor-default",
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </form>


          {quickActions.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-3">
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={a.onClick}
                  className="group relative flex items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-150 hover:bg-stone-800/40"
                >
                  <span className="mt-0.5 text-amber-700/60 transition-colors group-hover:text-amber-600/80">
                    {a.icon}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[13px] font-medium text-stone-400 transition-colors group-hover:text-stone-200">
                      {a.label}
                    </span>
                    {a.description && (
                      <span className="mt-0.5 block text-[12px] text-stone-600 transition-colors group-hover:text-stone-500">
                        {a.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {recentChats.length > 0 && (
            <div className="mt-16">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-700">
                Recent
              </span>
              <div className="mt-3 divide-y divide-stone-800/50">
                {recentChats.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectChat?.(c)}
                    className="group flex w-full items-center gap-3 py-3 text-left transition-colors"
                  >
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700/30 transition-colors group-hover:bg-amber-600/60" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-stone-500 transition-colors group-hover:text-stone-300">
                        {c.heading}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-stone-700 transition-colors group-hover:text-stone-500">
                      {formatTime(c.timestamp)}
                    </span>
                    {onDeleteChat && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(c.id, e as unknown as React.MouseEvent);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            onDeleteChat(c.id, e as unknown as React.MouseEvent);
                          }
                        }}
                        className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-stone-800 group-hover:opacity-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-stone-500" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
