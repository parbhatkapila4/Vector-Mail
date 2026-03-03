"use client";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import React from "react";
import useThreads from "@/hooks/use-threads";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";
import { atom, useAtom } from "jotai";

export const isSearchingAtom = atom(false);
export const searchValueAtom = atom("");
export const searchResultsAtom = atom<SearchResult[]>([]);
export const isSearchingAPIAtom = atom(false);

export interface SearchResult {
  id: string;
  subject: string;
  snippet: string;
  from: {
    name: string | null;
    address: string;
  };
  sentAt: string;
  threadId: string;
  relevanceScore: number;
  matchType: "keyword" | "semantic";
  matchedKeywords?: string[];
  snippetHighlighted?: string;
  relevanceScorePercent?: number;
}

const SearchBar = () => {
  const { accountId } = useThreads();
  const isDemo = useDemoMode();
  const effectiveAccountId = isDemo ? DEMO_ACCOUNT_ID : accountId;
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [, setIsSearching] = useAtom(isSearchingAtom);
  const [, setSearchResults] = useAtom(searchResultsAtom);
  const [, setIsSearchingAPI] = useAtom(isSearchingAPIAtom);
  const ref = React.useRef<HTMLInputElement>(null);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleBlur = React.useCallback(() => {
    if (!!searchValue) return;
    setIsSearching(false);
  }, [searchValue, setIsSearching]);

  React.useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!searchValue.trim()) {
      setSearchResults([]);
      setIsSearchingAPI(false);
      return;
    }

    setIsSearchingAPI(true);

    debounceTimerRef.current = setTimeout(async () => {
      if (!effectiveAccountId || !searchValue.trim()) {
        setIsSearchingAPI(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/email/search?q=${encodeURIComponent(searchValue.trim())}&accountId=${effectiveAccountId}`,
        );
        if (!response.ok) throw new Error(`Search failed: ${response.status}`);
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearchingAPI(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchValue, effectiveAccountId, setSearchResults, setIsSearchingAPI]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchValue("");
        handleBlur();
        ref.current?.blur();
      }
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName || "",
        )
      ) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleBlur, setSearchValue]);

  const handleClear = React.useCallback(() => {
    setSearchValue("");
    setIsSearching(false);
    setSearchResults([]);
    ref.current?.blur();
  }, [setSearchValue, setIsSearching, setSearchResults]);

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af] dark:text-[#71717a]" />
      <Input
        ref={ref}
        id="mail-search-input"
        placeholder="Search"
        className="h-8 min-h-[44px] w-full rounded-lg border-0 bg-[#f3f4f6] pl-9 pr-16 text-[13px] text-[#111118] transition-colors placeholder:text-[#9ca3af] focus:bg-white focus-visible:ring-1 focus-visible:ring-[#3b82f6]/30 dark:bg-[#ffffff]/[0.04] dark:text-[#f4f4f5] dark:placeholder:text-[#71717a] dark:focus:bg-[#ffffff]/[0.06] dark:focus-visible:ring-[#3b82f6]/30 sm:min-h-0 [touch-action:manipulation]"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsSearching(true)}
        onBlur={handleBlur}
      />
      {!searchValue && (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-[#e5e7eb] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#9ca3af] dark:border-[#1a1a23] dark:bg-[#18181b] dark:text-[#71717a] sm:flex">
          Ctrl K
        </kbd>
      )}
      {searchValue && (
        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-[#e5e7eb] dark:hover:bg-[#ffffff]/[0.06]"
          onClick={handleClear}
        >
          <X className="h-3 w-3 text-[#6b7280] dark:text-[#a1a1aa]" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
