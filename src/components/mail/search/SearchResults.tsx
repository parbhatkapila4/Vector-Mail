"use client";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useAtom } from "jotai";
import { searchResultsAtom, searchValueAtom, type SearchResult } from "./SearchBar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function SearchResults({
  onResultSelect,
}: {
  onResultSelect?: (threadId: string) => void;
}) {
  const [searchResults] = useAtom(searchResultsAtom);
  const [searchValue] = useAtom(searchValueAtom);

  if (!searchValue.trim() || searchResults.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-background dark:border-gray-700">
      <div className="p-4">
        <div className="mb-3 text-sm font-medium text-muted-foreground">
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
                "w-full rounded-lg border p-3 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800",
                "border-gray-200 dark:border-gray-700",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm truncate">
                      {result.from.name || result.from.address}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(result.sentAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="font-medium text-sm mb-1 line-clamp-1">
                    {result.subject}
                  </div>
                  {result.snippet && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {result.snippet}
                    </div>
                  )}
                </div>
                {result.matchType === "semantic" && (
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 shrink-0">
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
