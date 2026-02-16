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
      <div className="border-t border-slate-800 bg-[#0a0a0a] dark:border-neutral-800 dark:bg-neutral-950">
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-orange-500 dark:border-neutral-800 dark:border-t-orange-400" />
            <span className="text-sm font-medium text-slate-400 dark:text-neutral-500">
              Searching…
            </span>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex w-full items-start gap-2 rounded-lg border border-slate-800 bg-slate-900/30 p-3 dark:border-neutral-800 dark:bg-neutral-800/30"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-24 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    <div className="h-3 w-12 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                  </div>
                  <div className="h-3.5 w-[85%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                  <div className="h-3 w-[60%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
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
    <div className="border-t border-slate-800 bg-[#0a0a0a]">
      <div className="p-4">
        <div className="mb-3 text-sm font-medium text-slate-400">
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
                "w-full rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-left transition-all hover:bg-slate-800/50 hover:border-slate-700",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-white truncate">
                      {result.from.name || result.from.address}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(result.sentAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="font-medium text-sm mb-1 line-clamp-1 text-white">
                    {result.subject}
                  </div>
                  {result.snippet && (
                    <div className="text-xs text-slate-400 line-clamp-2">
                      {result.snippet}
                    </div>
                  )}
                </div>
                {result.matchType === "semantic" && (
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 shrink-0">
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

