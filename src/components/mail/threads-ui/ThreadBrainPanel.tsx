"use client";

import { useEffect, useState } from "react";
import { Brain, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { trackInboxBrainEvent } from "@/lib/analytics/inbox-brain";
import { useIsMobile } from "@/hooks/use-mobile";

export function ThreadBrainPanel({
  threadId,
  accountId,
}: {
  threadId: string;
  accountId: string;
}) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isMobile) setExpanded(true);
    else setExpanded(false);
  }, [threadId, isMobile]);

  const queryEnabled = Boolean(threadId && accountId && expanded);

  const { data, isLoading, isError, error } =
    api.account.getThreadBrain.useQuery(
      { threadId, accountId },
      {
        enabled: queryEnabled,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
    );

  const headerClass =
    "flex w-full items-center gap-2 px-3 py-2.5 text-left";

  const title = (
    <>
      {isMobile ? (
        expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#6b7280] dark:text-[#9ca3af]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-[#6b7280] dark:text-[#9ca3af]" />
        )
      ) : null}
      <Brain className="h-4 w-4 shrink-0 text-[#2563eb] dark:text-[#60a5fa]" />
      <span className="text-[12px] font-semibold uppercase tracking-wide text-[#6b7280] dark:text-[#9ca3af]">
        Inbox brain
      </span>
    </>
  );

  return (
    <div className="mb-4 rounded-xl border border-[#e5e7eb] bg-[#fafbfc] dark:border-[#27272a] dark:bg-[#0c0c0e]">
      {isMobile ? (
        <button
          type="button"
          className={cn(headerClass, "transition-colors hover:bg-[#f3f4f6] dark:hover:bg-[#ffffff]/[0.04]")}
          onClick={() =>
            setExpanded((e) => {
              const next = !e;
              trackInboxBrainEvent("thread_brain_expanded", {
                expanded: next,
                surface: "mobile",
              });
              return next;
            })
          }
          aria-expanded={expanded}
        >
          {title}
        </button>
      ) : (
        <div className={headerClass}>{title}</div>
      )}

      {expanded && (
        <div className="space-y-3 border-t border-[#e5e7eb] px-3 pb-3 pt-2 dark:border-[#27272a]">
          {isLoading && (
            <div className="flex items-center gap-2 py-1 text-[13px] text-[#6b7280] dark:text-[#9ca3af]">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#2563eb] dark:text-[#60a5fa]" />
              Reading thread…
            </div>
          )}
          {isError && (
            <p className="text-[13px] leading-relaxed text-red-600 dark:text-red-400">
              {error?.message ?? "Couldn’t load inbox brain."}
            </p>
          )}
          {!isLoading && !isError && data && (
            <>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#9ca3af] dark:text-[#71717a]">
                  What this is about
                </p>
                <p className="text-[13px] leading-relaxed text-[#111118] dark:text-[#e8eaed]">
                  {data.about}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#9ca3af] dark:text-[#71717a]">
                  What&apos;s expected from you
                </p>
                <p className="text-[13px] leading-relaxed text-[#111118] dark:text-[#e8eaed]">
                  {data.expectedFromMe}
                </p>
                {(data.expectedReason || data.expectedConfidence) && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {data.expectedReason && (
                      <span className="text-[11px] text-[#6b7280] underline decoration-dotted underline-offset-2 dark:text-[#a1a1aa]">
                        Why this? {data.expectedReason}
                      </span>
                    )}
                    {data.expectedConfidence && (
                      <span className="rounded-full bg-[#eef2ff] px-1.5 py-0.5 text-[10px] font-medium text-[#4f46e5] dark:bg-[#312e81]/40 dark:text-[#c7d2fe]">
                        {data.expectedConfidence}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
