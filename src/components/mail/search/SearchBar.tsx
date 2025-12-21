"use client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X } from "lucide-react";
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
  const { isFetching, accountId } = useThreads();
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [, setIsSearching] = useAtom(isSearchingAtom);
  const [, setSearchResults] = useAtom(searchResultsAtom);
  const [isSearchingAPI, setIsSearchingAPI] = useAtom(isSearchingAPIAtom);
  const ref = React.useRef<HTMLInputElement>(null);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleBlur = React.useCallback(() => {
    if (!!searchValue) return;
    setIsSearching(false);
  }, [searchValue, setIsSearching]);

  React.useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

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

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
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
    <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <motion.div className="relative" layoutId="search-bar">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={ref}
          placeholder="Search emails..."
          className="pl-8"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsSearching(true)}
          onBlur={handleBlur}
        />
        <div className="absolute right-2 top-2.5 flex items-center gap-2">
          {(isSearchingAPI || isFetching) && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {searchValue && (
            <button
              className="rounded-sm hover:bg-gray-800"
              onClick={handleClear}
            >
              <X className="size-4 text-gray-400" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SearchBar;
