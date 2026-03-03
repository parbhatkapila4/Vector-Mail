"use client";

import { useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
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
        Math.min(textarea.scrollHeight, maxHeight)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

function useResetHeightWhenEmpty(value: string, adjustHeight: (reset?: boolean) => void) {
  useEffect(() => {
    if (value === "") adjustHeight(true);
  }, [value, adjustHeight]);
}

interface BuddyChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function BuddyChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Describe the email you want to write...",
  disabled = false,
}: BuddyChatInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(60, 200);
  useResetHeightWhenEmpty(value, adjustHeight);

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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative rounded-xl border-x border-b border-white/20 bg-black/30 backdrop-blur-md">
        <div className="overflow-y-auto">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 resize-none bg-transparent border-none",
              "text-white text-sm placeholder:text-neutral-500 placeholder:text-sm",
              "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              "min-h-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{ overflow: "hidden" }}
          />
        </div>
        <div className="flex items-center justify-end p-3">
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-center gap-1.5",
              value.trim() && !isLoading
                ? "bg-white text-black border-white hover:bg-zinc-200"
                : "text-zinc-400"
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
  );
}

export interface BuddyActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function BuddyActionButton({
  icon,
  label,
  onClick,
}: BuddyActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
