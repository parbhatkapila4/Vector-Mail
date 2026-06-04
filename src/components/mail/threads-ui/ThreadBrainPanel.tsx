"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
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

  const toggleMobile = () =>
    setExpanded((e) => {
      const next = !e;
      trackInboxBrainEvent("thread_brain_expanded", {
        expanded: next,
        surface: "mobile",
      });
      return next;
    });

  return (
    <div className="ai-brief">
      {isMobile ? (
        <button
          type="button"
          onClick={toggleMobile}
          aria-expanded={expanded}
          className="ai-brief-head -mx-1.5 -my-1 flex w-[calc(100%+0.75rem)] cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 text-left transition-colors active:bg-[#f4f5f8] [touch-action:manipulation]"
        >
          <span className="ai-brief-icon" />
          <span className="ai-brief-label">Inbox Brain</span>
          <span className="ai-brief-time !ml-auto">live</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[#8a8278] transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>
      ) : (
        <div className="ai-brief-head">
          <span className="ai-brief-icon" />
          <span className="ai-brief-label">Inbox Brain</span>
          <span className="ai-brief-time">live</span>
        </div>
      )}

      {expanded && (
        <div className="ai-brief-body">
          {isLoading && (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading thread...
            </span>
          )}
          {isError && (error?.message ?? "Couldn’t load inbox brain.")}
          {!isLoading && !isError && data && (
            <>
              <div className="ai-brief-section">
                <div className="ai-brief-section-label">
                  WHAT THIS IS ABOUT
                </div>
                <div className="ai-brief-section-body">{data.about}</div>
              </div>
              <div className="ai-brief-section">
                <div className="ai-brief-section-label">
                  WHAT&apos;S EXPECTED FROM YOU
                </div>
                <div className="ai-brief-section-body">
                  {data.expectedFromMe}
                </div>
              </div>
              {data.expectedReason && (
                <div className="ai-brief-why">
                  Why this? {data.expectedReason}{" "}
                  <span
                    className={cn(
                      "ai-brief-priority",
                      `ai-brief-priority-${data.expectedPriority.toLowerCase()}`,
                    )}
                    title="How urgently this needs your reply"
                  >
                    {data.expectedPriority}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
