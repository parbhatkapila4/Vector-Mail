"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Mode = "manual" | "assist" | "auto";

function ConfidenceTag({ value }: { value: number | null }) {
  const pct = value == null ? null : Math.round(value * 100);
  const label = value == null ? "—" : `${pct}%`;
  const tone =
    value != null && value >= 0.85 ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
      : value != null && value >= 0.6 ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
        : "bg-zinc-500/10 text-zinc-300 ring-white/10";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", tone)}>
      {label}
    </span>
  );
}

function ModePill({
  selected,
  mode,
  title,
  subtitle,
  onSelect,
  disabled,
}: {
  selected: boolean;
  mode: Mode;
  title: string;
  subtitle: string;
  onSelect: (mode: Mode) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(mode)}
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors",
        selected
          ? "border-[#3b82f6]/40 bg-[#3b82f6]/[0.08]"
          : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]",
        disabled && "opacity-60",
      )}
    >
      <span className="text-[12px] font-semibold text-white">{title}</span>
      <span className="text-[10px] text-zinc-400">{subtitle}</span>
    </button>
  );
}

export function AutopilotSection({ accountId }: { accountId: string }) {
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);

  const { data: prefs, isLoading: prefsLoading } = api.automation.getPrefs.useQuery(
    { accountId },
    { enabled: accountId.trim().length > 0, staleTime: 10_000 },
  );

  const awaitingApproval = prefs?.awaitingApproval ?? 0;
  const mode = (prefs?.automationMode ?? "manual") as Mode;

  const setModeMutation = api.automation.setMode.useMutation({
    onSuccess: async () => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
    },
  });

  const listPendingQuery = api.automation.listPending.useQuery(
    { accountId, limit: 25 },
    { enabled: open && accountId.trim().length > 0, staleTime: 2_000 },
  );

  const approveMutation = api.automation.approve.useMutation({
    onSuccess: async () => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
    },
  });

  const rejectMutation = api.automation.reject.useMutation({
    onSuccess: async () => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
    },
  });
  const runDetectorNowMutation = api.automation.runDetectorNow.useMutation({
    onSuccess: async (res) => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
      if (res.mode === "manual") {
        toast.info("Autopilot is in manual mode", {
          description: "Switch to Assist or Auto, then run scan.",
        });
        return;
      }
      const created = res.created ?? 0;
      const eligible = res.eligibleThreads ?? 0;
      const duplicates = res.duplicates ?? 0;
      if (created > 0) {
        toast.success("Autopilot scan complete", {
          description: `Created ${created} approval item${created > 1 ? "s" : ""}${duplicates > 0 ? `, ${duplicates} duplicate${duplicates > 1 ? "s" : ""} skipped` : ""}.`,
        });
      } else {
        toast.info("No new approvals found", {
          description:
            eligible > 0
              ? "Candidates were found but were already created in this idempotency window."
              : "No eligible follow-up candidates right now.",
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to run Autopilot scan", {
        description: error.message,
      });
    },
  });

  const busy =
    prefsLoading ||
    setModeMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    runDetectorNowMutation.isPending;

  const pendingRows = listPendingQuery.data ?? [];
  const pendingCount = useMemo(
    () => (open ? pendingRows.length : awaitingApproval),
    [open, pendingRows.length, awaitingApproval],
  );

  const handleScanNow = async () => {
    try {
      if (mode === "manual") {
        await setModeMutation.mutateAsync({ accountId, mode: "assist" });
        toast.info("Autopilot switched to Assist", {
          description: "Manual mode cannot create candidates, so scan now uses Assist.",
        });
      }
      await runDetectorNowMutation.mutateAsync({ accountId });
    } catch {
    }
  };

  return (
    <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-white">Autopilot</span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#3b82f6]/[0.14] px-2 py-0.5 text-[10px] font-medium text-[#93c5fd] ring-1 ring-[#3b82f6]/30">
                {pendingCount} awaiting approval
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-zinc-400">
            Follow-up candidates from Needs reply. Still dry-run — nothing is sent.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-lg bg-white/[0.06] text-[12px] text-white hover:bg-white/[0.1]"
              disabled={busy}
            >
              Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[520px] border-neutral-800 bg-[#0b0b0d] text-white">
            <DialogHeader>
              <DialogTitle className="text-[14px]">Autopilot</DialogTitle>
              <DialogDescription className="text-[12px] text-zinc-400">
                Set your automation mode and approve pending follow-ups.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-1 flex gap-2">
              <ModePill
                selected={mode === "manual"}
                mode="manual"
                title="Manual"
                subtitle="No candidates"
                onSelect={(m) => setModeMutation.mutate({ accountId, mode: m })}
                disabled={busy}
              />
              <ModePill
                selected={mode === "assist"}
                mode="assist"
                title="Assist"
                subtitle="Always approve"
                onSelect={(m) => setModeMutation.mutate({ accountId, mode: m })}
                disabled={busy}
              />
              <ModePill
                selected={mode === "auto"}
                mode="auto"
                title="Auto"
                subtitle="High runs, medium asks"
                onSelect={(m) => setModeMutation.mutate({ accountId, mode: m })}
                disabled={busy}
              />
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white">
                  Awaiting approval
                </span>
                <div className="flex items-center gap-2">
                  {listPendingQuery.isFetching && (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    disabled={busy}
                    onClick={() => void handleScanNow()}
                  >
                    {runDetectorNowMutation.isPending ? "Scanning…" : "Scan now"}
                  </Button>
                </div>
              </div>

              {listPendingQuery.isLoading ? (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-[12px] text-zinc-400">
                  Loading…
                </div>
              ) : pendingRows.length === 0 ? (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-[12px] text-zinc-400">
                  Nothing waiting right now.
                </div>
              ) : (
                <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {pendingRows.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-white line-clamp-2">
                            {row.subject}
                          </div>
                          <div className="mt-1 text-[11px] text-zinc-400 line-clamp-2">
                            {row.reason ?? "Pending approval"}
                          </div>
                        </div>
                        <ConfidenceTag value={row.confidence ?? null} />
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                          disabled={busy}
                          onClick={() =>
                            rejectMutation.mutate({
                              executionId: row.id,
                              reason: "Not appropriate",
                            })
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 bg-[#3b82f6] text-white hover:bg-[#2563eb]"
                          disabled={busy}
                          onClick={() => approveMutation.mutate({ executionId: row.id })}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

