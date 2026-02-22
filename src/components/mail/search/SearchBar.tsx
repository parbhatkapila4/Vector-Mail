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
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f6368] dark:text-[#9aa0a6]" />
      <Input
        ref={ref}
        id="mail-search-input"
        placeholder="Search mail"
        className="h-9 w-full rounded-full border-0 bg-[#f1f3f4] pl-9 pr-9 text-[14px] text-[#202124] transition-colors placeholder:text-[#5f6368] focus:bg-white focus-visible:ring-1 focus-visible:ring-[#dadce0] dark:bg-[#3c4043] dark:text-[#e8eaed] dark:placeholder:text-[#9aa0a6] dark:focus:bg-[#303134] dark:focus-visible:ring-[#5f6368]"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsSearching(true)}
        onBlur={handleBlur}
      />
      {searchValue && (
        <button
          type="button"
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-[#e8eaed] dark:hover:bg-[#5f6368]"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5 text-[#5f6368] dark:text-[#9aa0a6]" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
