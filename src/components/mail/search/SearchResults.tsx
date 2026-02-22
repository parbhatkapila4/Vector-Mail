"use client";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useAtom } from "jotai";
import {
  searchResultsAtom,
  searchValueAtom,
  isSearchingAPIAtom,
  type SearchResult,
} from "./SearchBar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function SearchResults({
  onResultSelect,
}: {
  onResultSelect?: (threadId: string) => void;
}) {
  const [searchResults] = useAtom(searchResultsAtom);
  const [searchValue] = useAtom(searchValueAtom);
  const [isSearchingAPI] = useAtom(isSearchingAPIAtom);

  if (!searchValue.trim()) {
    return null;
  }

  const showLoading = searchValue.trim().length > 0 && isSearchingAPI;

  if (showLoading) {
    return (
      <div className="border-t border-[#f1f3f4] bg-white dark:border-[#3c4043] dark:bg-[#202124]">
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#8ab4f8]" />
            <span className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">Searching…</span>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex w-full items-start gap-2 rounded-lg border border-[#f1f3f4] bg-[#f8f9fa] p-3 dark:border-[#3c4043] dark:bg-[#292a2d]"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-24 rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
                    <div className="h-3 w-12 rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
                  </div>
                  <div className="h-3.5 w-[85%] rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
                  <div className="h-3 w-[60%] rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-[#f1f3f4] bg-white dark:border-[#3c4043] dark:bg-[#202124]">
      <div className="p-4">
        <div className="mb-3 text-sm text-[#5f6368] dark:text-[#9aa0a6]">
          {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
        </div>
        <div className="space-y-2">
          {searchResults.map((result: SearchResult, index: number) => (
            <motion.button
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onResultSelect?.(result.threadId)}
              className={cn(
                "w-full rounded-lg border border-[#f1f3f4] bg-[#f8f9fa] p-3 text-left transition-colors hover:bg-[#e8f0fe] hover:border-[#dadce0] dark:border-[#3c4043] dark:bg-[#292a2d] dark:hover:bg-[#174ea6]/20 dark:hover:border-[#5f6368]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="truncate text-sm font-medium text-[#202124] dark:text-[#e8eaed]">
                      {result.from.name || result.from.address}
                    </span>
                    <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                      {formatDistanceToNow(new Date(result.sentAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="font-medium text-sm mb-1 line-clamp-1 text-[#202124] dark:text-[#e8eaed]">
                    {result.subject}
                  </div>
                  {result.snippet && (
                    <div className="text-xs text-[#5f6368] line-clamp-2 dark:text-[#9aa0a6]">
                      {result.snippet}
                    </div>
                  )}
                </div>
                {result.matchType === "semantic" && (
                  <span className="shrink-0 rounded px-2 py-0.5 text-xs bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#174ea6]/30 dark:text-[#8ab4f8]">
                    AI
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

