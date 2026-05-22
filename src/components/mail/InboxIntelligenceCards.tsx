"use client";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type Props = {
  accountId: string;
  onRunQuery: (query: string) => void;
  className?: string;
};

export function InboxIntelligenceCards({
  accountId,
  onRunQuery,
  className,
}: Props) {
  const { data, isLoading } = api.account.getInboxIntelligenceCards.useQuery(
    { accountId },
    { enabled: !!accountId, staleTime: 60_000 },
  );

  if (!accountId || isLoading || !data?.cards?.length) return null;

  return (
    <div className={cn("border-b border-[#e4e7ed] px-3 py-2", className)}>
      <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#7a849a]">
        <Sparkles className="h-3 w-3 text-text-[#1e2a4a]" />
        Inbox brain
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.cards.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onRunQuery(c.suggestedQuery)}
            className="shrink-0 rounded-lg border border-[#e4e7ed] bg-[#fafbfc] px-3 py-2 text-left transition hover:border-[#1e2a4a]/30 hover:bg-[#1e2a4a]/5"
          >
            <div className="text-[11px] font-medium text-[#0e1729]">
              {c.title}
            </div>
            <div className="text-[10px] text-[#7a849a]">
              {c.subtitle ?? `${c.count} in last 90 days · tap to search`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
