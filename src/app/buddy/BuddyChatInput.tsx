"use client";

import { useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";

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
      textarea.style.height = `${Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight))}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

function useResetHeightWhenEmpty(
  value: string,
  adjustHeight: (reset?: boolean) => void,
) {
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
  placeholder = "Reply…",
  disabled = false,
}: BuddyChatInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(48, 160);
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && !isLoading) onSubmit();
      }}
      className="w-full"
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
          disabled={disabled}
          className={cn(
            "w-full resize-none border-none bg-transparent px-5 py-3.5 pr-14 text-[14px] text-stone-200",
            "placeholder:text-stone-600 focus-visible:ring-0 focus-visible:ring-offset-0",
            "min-h-[48px] disabled:cursor-not-allowed disabled:opacity-40",
          )}
          style={{ overflow: "hidden" }}
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={cn(
            "absolute bottom-2.5 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
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
      className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] text-stone-500 transition-colors hover:bg-stone-800/40 hover:text-stone-300"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
