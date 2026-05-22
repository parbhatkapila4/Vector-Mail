"use client";

import { Eye, Send, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { CONFIDENCE_THRESHOLDS } from "@/lib/automation/policy";

export type AutopilotMode = "manual" | "assist" | "auto";

type PendingRow = {
  confidence: number | null;
};

export function AutopilotModeExplainer({
  mode,
  pendingRows,
  isDemo,
}: {
  mode: AutopilotMode;
  pendingRows: ReadonlyArray<PendingRow>;
  isDemo: boolean;
}) {
  const total = pendingRows.length;
  const high = pendingRows.filter((r) => (r.confidence ?? 0) >= CONFIDENCE_THRESHOLDS.HIGH).length;
  const medium = total - high;

  const palette =
    mode === "auto"
      ? {
        icon: <Send className="h-3.5 w-3.5 text-emerald-700" />,
        ring: "border-emerald-500/30 bg-emerald-500/[0.06]",
        title: "text-emerald-900",
        body: "text-emerald-900/80",
      }
      : mode === "assist"
        ? {
          icon: <Sparkles className="h-3.5 w-3.5 text-[#1e2a4a]" />,
          ring: "border-[#1e2a4a]/30 bg-[#1e2a4a]/[0.06]",
          title: "text-[#0e1729]",
          body: "text-[#3a4258]",
        }
        : {
          icon: <Eye className="h-3.5 w-3.5 text-[#4a5572]" />,
          ring: "border-[#d0d5de] bg-[#f4f5f8]",
          title: "text-[#0e1729]",
          body: "text-[#4a5572]",
        };

  const title =
    mode === "auto"
      ? "Auto · Autopilot sends high-confidence replies for you"
      : mode === "assist"
        ? "Assist · Autopilot drafts; you approve every send"
        : "Manual · Autopilot stays out of the way";

  const highPct = Math.round(CONFIDENCE_THRESHOLDS.HIGH * 100);
  const explainer =
    mode === "auto"
      ? `Replies scoring ${highPct}% or higher go out within your daily cap. Anything below stays here for you to approve. You'll always see what was sent in the log.`
      : mode === "assist"
        ? "Every candidate appears below with its reasoning. Nothing leaves your outbox until you click Approve. Best when you want speed without losing control."
        : "No follow-ups are queued or sent. Use this when you're traveling, in a freeze, or want to review behavior before turning automation on.";

  const demoLine =
    !isDemo || total === 0
      ? null
      : mode === "auto"
        ? `In this sample inbox: ${high} would already be sent (high-confidence). ${medium} still ask${medium === 1 ? "s" : ""} for approval below.`
        : mode === "assist"
          ? `In this sample inbox: all ${total} drafts are queued below for your review.`
          : `In this sample inbox: ${total} candidate${total === 1 ? "" : "s"} would normally be queued - but Manual keeps the queue empty.`;

  return (
    <div className={cn("mt-3 rounded-lg border px-3 py-2.5", palette.ring)}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{palette.icon}</div>
        <div className="min-w-0">
          <p className={cn("text-[11.5px] font-semibold leading-tight", palette.title)}>
            {title}
          </p>
          <p className={cn("mt-1 text-[11px] leading-snug", palette.body)}>
            {explainer}
          </p>
          {demoLine && (
            <p className={cn("mt-1.5 text-[10.5px] font-medium leading-snug", palette.body)}>
              {demoLine}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
