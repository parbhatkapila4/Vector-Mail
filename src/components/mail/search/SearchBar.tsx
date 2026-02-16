"use client";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import React from "react";
import useThreads from "@/hooks/use-threads";
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
}

const SearchBar = () => {
  const { accountId } = useThreads();
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
      if (!accountId || !searchValue.trim()) {
        setIsSearchingAPI(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/email/search?q=${encodeURIComponent(searchValue.trim())}&accountId=${accountId}`,
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
  }, [searchValue, accountId, setSearchResults, setIsSearchingAPI]);

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
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-600" />
      <Input
        ref={ref}
        id="mail-search-input"
        placeholder="Search conversations..."
        className="h-10 rounded-xl border-neutral-200/60 bg-neutral-50/50 pl-10 pr-9 text-[13px] font-medium text-neutral-900 backdrop-blur-sm transition-all placeholder:text-neutral-400 focus:border-yellow-500/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-yellow-500/20 dark:border-neutral-800/60 dark:bg-neutral-950/50 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-yellow-400/50 dark:focus:bg-neutral-900 dark:focus-visible:ring-yellow-400/20"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsSearching(true)}
        onBlur={handleBlur}
      />
      {searchValue && (
        <button
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-600" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
