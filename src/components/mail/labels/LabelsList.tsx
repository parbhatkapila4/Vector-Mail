"use client";

import React, { useState } from "react";
import { Tag, Settings, Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ManageLabelsSheet } from "./ManageLabelsSheet";
import { FilterRulesSheet } from "./FilterRulesSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LabelsListProps {
  accountId: string;
  currentTab: string;
  selectedLabelId: string | null;
  onLabelSelect: (labelId: string) => void;
  onLabelUnselect?: () => void;
  className?: string;
}

export function LabelsList({
  accountId,
  currentTab,
  selectedLabelId,
  onLabelSelect,
  onLabelUnselect,
  className,
}: LabelsListProps) {
  const [manageOpen, setManageOpen] = useState(false);
  const [filterRulesOpen, setFilterRulesOpen] = useState(false);

  const { data: labelsWithCounts } = api.account.getLabelsWithCounts.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId },
  );

  if (!accountId) return null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
          Labels
        </span>
        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "rounded p-1.5 text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]",
                  currentTab === "label" && selectedLabelId && "bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#174ea6]/30 dark:text-[#8ab4f8]",
                )}
                title="Filter by label"
              >
                <Filter className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <span className="px-2 py-1.5 text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6]">
                Show emails in label
              </span>
              {(labelsWithCounts ?? []).length === 0 ? (
                <DropdownMenuItem disabled className="text-[#5f6368] dark:text-[#9aa0a6]">
                  No labels. Create one below or in Manage labels.
                </DropdownMenuItem>
              ) : (
                (labelsWithCounts ?? []).map((l) => {
                  const isSelected = currentTab === "label" && selectedLabelId === l.id;
                  return (
                    <DropdownMenuItem
                      key={l.id}
                      onClick={() => onLabelSelect(l.id)}
                      className={cn(
                        "flex items-center gap-2",
                        isSelected && "bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#174ea6]/30 dark:text-[#8ab4f8]",
                      )}
                    >
                      <Tag
                        className="h-3.5 w-3.5 shrink-0"
                        style={l.color ? { color: l.color } : undefined}
                      />
                      <span className="min-w-0 flex-1 truncate">{l.name}</span>
                      <span className="shrink-0 text-[11px] tabular-nums text-[#5f6368] dark:text-[#9aa0a6]">
                        {l.threadCount}
                      </span>
                    </DropdownMenuItem>
                  );
                })
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setFilterRulesOpen(true)}
                className="flex items-center gap-2 text-[#5f6368] dark:text-[#9aa0a6]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter rules (auto-apply labels)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            className="rounded p-1.5 text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
            title="Manage labels"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {(labelsWithCounts ?? []).length === 0 ? (
        <p className="px-2 py-1 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
          No labels. Create one to organize threads.
        </p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {(labelsWithCounts ?? []).map((l) => {
            const isSelected = currentTab === "label" && selectedLabelId === l.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => onLabelSelect(l.id)}
                  onDoubleClick={() => {
                    if (isSelected && onLabelUnselect) onLabelUnselect();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                    isSelected
                      ? "bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#174ea6]/30 dark:text-[#8ab4f8]"
                      : "text-[#202124] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]",
                  )}
                >
                  <Tag
                    className="h-3.5 w-3.5 shrink-0"
                    style={l.color ? { color: l.color } : undefined}
                  />
                  <span className="min-w-0 flex-1 truncate">{l.name}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                      isSelected
                        ? "bg-[#1a73e8]/20 text-[#1a73e8] dark:bg-[#8ab4f8]/25 dark:text-[#8ab4f8]"
                        : "bg-[#f1f3f4] text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]",
                    )}
                  >
                    {l.threadCount}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ManageLabelsSheet
        open={manageOpen}
        onOpenChange={setManageOpen}
        accountId={accountId}
      />
      <FilterRulesSheet
        open={filterRulesOpen}
        onOpenChange={setFilterRulesOpen}
        accountId={accountId}
      />
    </div>
  );
}
