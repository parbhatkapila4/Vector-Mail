"use client";
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
    <div className="search-bar">
      <Search className="h-[13px] w-[13px]" strokeWidth={1.6} aria-hidden />
      <input
        ref={ref}
        id="mail-search-input"
        placeholder="ask anything · find what you need"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsSearching(true)}
        onBlur={handleBlur}
      />
      {!searchValue && <span className="search-kbd">⌘K</span>}
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: 999,
            border: 0,
            background: "transparent",
            cursor: "pointer",
            color: "var(--ink-3)",
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
