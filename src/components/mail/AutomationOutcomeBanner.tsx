"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FlaskConical,
  Sparkles,
  XCircle,
} from "lucide-react";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  accountId: string;
  isDemo: boolean;
  onOpenThread?: (threadId: string) => void;
  className?: string;
};

export function AutomationOutcomeBanner({
  accountId,
  isDemo,
  onOpenThread,
  className,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [failuresOpen, setFailuresOpen] = useState(false);

  const trimmed = accountId?.trim() ?? "";
  const enabled = trimmed.length > 0;

  const summaryQuery = api.automation.getTodaySummary.useQuery(
    { accountId: trimmed },
    {
      enabled,
      staleTime: isDemo ? 60_000 : 8_000,
      refetchInterval: isDemo ? false : expanded ? 30_000 : 60_000,
      refetchOnWindowFocus: true,
    },
  );

  const metricsQuery = api.automation.getMetrics.useQuery(
    { accountId: trimmed },
    {
      enabled: enabled && expanded,
      staleTime: isDemo ? 60_000 : 10_000,
      refetchInterval: isDemo ? false : 30_000,
      refetchOnWindowFocus: true,
    },
  );

  const failuresQuery = api.automation.listRecentFailures.useQuery(
    { accountId: trimmed, limit: 15 },
    {
      enabled: enabled && failuresOpen,
      staleTime: 10_000,
    },
  );

  if (!enabled) return null;

  const s = summaryQuery.data;
  const sent = s?.sentRealToday ?? 0;
  const sim = s?.simulatedToday ?? 0;
  const fail = s?.failedToday ?? 0;
  const pend = s?.pendingApproval ?? 0;
  const hasFailures = fail > 0;
  const totalActions = sent + sim + pend + fail;

  const m = metricsQuery.data;

  const header = (
    <button
      type="button"
      onClick={() => setExpanded((e) => !e)}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all",
        "hover:bg-[#ffffff]/40 dark:hover:bg-[#1e2a4a]/[0.06]",
      )}
      aria-expanded={expanded}
    >
      {expanded ? (
        <ChevronDown className="h-3 w-3 shrink-0 text-[#b88a3f] dark:text-[#1e2a4a] transition-transform" />
      ) : (
        <ChevronRight className="h-3 w-3 shrink-0 text-[#8a8278] transition-transform group-hover:text-[#b88a3f] dark:group-hover:text-[#1e2a4a]" />
      )}
      <span
        className={cn(
          "flex-1 truncate text-[#8a8278] dark:text-[#8a8278]",
          hasFailures && "text-text-[#1e2a4a] dark:text-text-[#1e2a4a]",
        )}
        style={{
          fontFamily:
            "var(--font-jetbrains-mono), ui-monospace, monospace",
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.16em",
        }}
      >
        <span className="text-[#b88a3f] dark:text-[#1e2a4a]">✦</span>{" "}
        AUTOPILOT
      </span>
      {hasFailures && !expanded ? (
        <span
          className="rounded-full bg-text-[#1e2a4a] px-1.5 py-0.5 text-text-[#1e2a4a] dark:bg-text-[#1e2a4a] dark:text-text-[#1e2a4a]"
          style={{
            fontFamily:
              "var(--font-jetbrains-mono), ui-monospace, monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          {fail} FAILED
        </span>
      ) : (
        <span
          style={{
            fontFamily:
              "var(--font-jetbrains-mono), ui-monospace, monospace",
            fontSize: 9.5,
            color: expanded ? "#b88a3f" : "#8a8278",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
          className="dark:text-[#1e2a4a]"
        >
          · {summaryQuery.isLoading && !s ? "…" : totalActions}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div
        className={cn(
          "shrink-0 border-b border-[#dadce0] px-2 py-2 dark:border-[#3c4043]",
          className,
        )}
      >
        {header}

        {expanded && (
          <div className="mt-1 space-y-2 px-1 pb-1">
            {summaryQuery.isLoading && !s ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#1e2a4a]" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatTile
                    icon={
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    }
                    label="Sent"
                    value={sent}
                  />
                  <StatTile
                    icon={
                      <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    }
                    label="Pending"
                    value={pend}
                  />
                  <StatTile
                    icon={
                      <XCircle
                        className={cn(
                          "h-3.5 w-3.5",
                          hasFailures
                            ? "text-text-[#1e2a4a] dark:text-text-[#1e2a4a]"
                            : "text-[#9aa0a6] dark:text-[#5f6368]",
                        )}
                      />
                    }
                    label="Failed"
                    value={fail}
                    tone={hasFailures ? "warning" : "default"}
                  />
                  <StatTile
                    icon={
                      <FlaskConical className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    }
                    label="Simulated"
                    value={sim}
                  />
                </div>

                <div
                  className={cn(
                    "flex flex-col gap-1.5 rounded-md border border-[#e5e7eb] bg-[#f8f9fa] px-2.5 py-2",
                    "dark:border-[#3c4043] dark:bg-[#2a2b2e]",
                  )}
                  title="Handled % = real follow-ups sent / eligible needs-reply opportunities today. Time saved uses a ~3 min per handled thread heuristic."
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#202124] dark:text-[#e8eaed]">
                    <Sparkles className="h-3 w-3 text-[#1a73e8] dark:text-[#1e2a4a]" />
                    Inbox handled
                    <span className="tabular-nums">
                      {metricsQuery.isLoading && !m ? "…" : `${m?.autoHandledPercent ?? 0}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-[#5f6368] dark:text-[#9aa0a6]">
                    <span>
                      <span className="tabular-nums font-medium text-[#202124] dark:text-[#e8eaed]">
                        {m?.actionsExecuted ?? 0}
                      </span>{" "}
                      follow-ups
                    </span>
                    <span>
                      ~
                      <span className="tabular-nums font-medium text-[#202124] dark:text-[#e8eaed]">
                        {m?.estTimeSavedMinutes ?? 0}
                      </span>{" "}
                      min saved
                    </span>
                  </div>
                </div>

                {hasFailures && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFailuresOpen(true)}
                    className={cn(
                      "h-8 w-full justify-center gap-1.5 rounded-md px-2 text-[11px] font-medium",
                      "text-text-[#1e2a4a] hover:bg-text-[#1e2a4a] hover:text-text-[#1e2a4a]",
                      "dark:text-text-[#1e2a4a] dark:hover:bg-text-[#1e2a4a] dark:hover:text-text-[#1e2a4a]",
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    View {fail} failure{fail === 1 ? "" : "s"}
                  </Button>
                )}

                {!hasFailures && totalActions === 0 && (
                  <p className="px-1 py-1 text-center text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                    No autopilot activity yet today. Once the engine sends or queues follow-ups, you&apos;ll see the breakdown here.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={failuresOpen} onOpenChange={setFailuresOpen}>
        <DialogContent className="max-h-[85vh] max-w-md overflow-hidden border-[#e5e7eb] bg-white p-0 dark:border-[#27272a] dark:bg-[#18181b]">
          <DialogHeader className="border-b border-[#e5e7eb] px-4 py-3 dark:border-[#27272a]">
            <DialogTitle className="flex items-center gap-2 text-left text-[15px] text-[#111118] dark:text-[#f4f4f5]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-text-[#1e2a4a] dark:text-text-[#1e2a4a]" />
              Recent follow-up failures
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
            {failuresQuery.isLoading ? (
              <p className="px-2 py-6 text-center text-[13px] text-[#6b7280] dark:text-[#a1a1aa]">
                Loading…
              </p>
            ) : !failuresQuery.data?.length ? (
              <p className="px-2 py-6 text-center text-[13px] text-[#6b7280] dark:text-[#a1a1aa]">
                No failures to show.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {failuresQuery.data.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-lg border border-[#f4f4f5] bg-[#fafafa] px-3 py-2.5 dark:border-[#27272a] dark:bg-[#202023]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#18181b] dark:text-[#e4e4e7]">
                        {row.thread?.subject ?? "(No subject)"}
                      </p>
                      {row.thread?.id && onOpenThread && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 shrink-0 px-2 text-[11px] text-[#1e2a4a] dark:text-[#1e2a4a]"
                          onClick={() => {
                            onOpenThread(row.thread!.id);
                            setFailuresOpen(false);
                          }}
                        >
                          Open
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-[#52525b] dark:text-[#a1a1aa]">
                      {row.lastErrorTruncated || row.lastError || "-"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

type StatTileProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "warning";
};

function StatTile({ icon, label, value, tone = "default" }: StatTileProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-2 py-1.5",
        tone === "warning"
          ? "border-text-[#1e2a4a] bg-text-[#1e2a4a] dark:border-text-[#1e2a4a] dark:bg-text-[#1e2a4a]"
          : "border-[#e5e7eb] bg-white dark:border-[#3c4043] dark:bg-[#2a2b2e]",
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="tabular-nums text-[13px] font-semibold text-[#202124] dark:text-[#e8eaed]">
          {value}
        </span>
        <span className="truncate text-[10px] uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
          {label}
        </span>
      </div>
    </div>
  );
}
