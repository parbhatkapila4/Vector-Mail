"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  Inbox,
  Loader2,
  MousePointerClick,
  ScrollText,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Mode = "manual" | "assist" | "auto";

function ConfidenceTag({ value }: { value: number | null }) {
  const pct = value == null ? null : Math.round(value * 100);
  const label = value == null ? "-" : `${pct}%`;
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

export function AutopilotSection({ accountId, isDemo = false }: { accountId: string; isDemo?: boolean }) {
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [pendingModeChoice, setPendingModeChoice] = useState<Mode | null>(null);
  const [demoStoryStep, setDemoStoryStep] = useState(0);
  const [logPage, setLogPage] = useState(0);
  const [logStatus, setLogStatus] = useState<"" | "pending" | "awaiting_approval" | "running" | "success" | "failed" | "cancelled">("");
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [guardrailPaused, setGuardrailPaused] = useState(false);
  const [guardrailCap, setGuardrailCap] = useState("5");
  const [guardrailDomains, setGuardrailDomains] = useState("");
  const [guardrailSenders, setGuardrailSenders] = useState("");

  const { data: prefs, isLoading: prefsLoading } = api.automation.getPrefs.useQuery(
    { accountId },
    { enabled: accountId.trim().length > 0, staleTime: 10_000 },
  );

  const awaitingApproval = prefs?.awaitingApproval ?? 0;
  const mode = (prefs?.automationMode ?? "manual") as Mode;
  const requiresAutoConsent = prefs?.requiresAutoConsent ?? true;
  const capFromPrefs = prefs?.maxAutoSendsPerDay ?? (Number.parseInt(guardrailCap, 10) || 5);

  const setModeMutation = api.automation.setMode.useMutation({
    onSuccess: async () => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
      await utils.automation.getTodaySummary.invalidate({ accountId });
      await utils.automation.listRecentFailures.invalidate();
      await utils.automation.getThreadAutoFollowUpBadges.invalidate();
      await utils.automation.getThreadFollowUpSummary.invalidate();
      await utils.automation.listExecutions.invalidate();
      await utils.automation.getExecutionDetail.invalidate();
    },
  });

  const listPendingQuery = api.automation.listPending.useQuery(
    { accountId, limit: 25 },
    { enabled: open && accountId.trim().length > 0, staleTime: 2_000 },
  );
  const guardrailsQuery = api.automation.getGuardrails.useQuery(
    { accountId },
    { enabled: accountId.trim().length > 0, staleTime: 10_000 },
  );
  useEffect(() => {
    const g = guardrailsQuery.data;
    if (!g) return;
    setGuardrailPaused(g.paused);
    setGuardrailCap(String(g.maxAutoSendsPerDay));
    setGuardrailDomains(g.blockedDomains.join(", "));
    setGuardrailSenders(g.blockedSenderSubstrings.join(", "));
  }, [guardrailsQuery.data]);

  const approveMutation = api.automation.approve.useMutation({
    onSuccess: async () => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
      await utils.automation.getTodaySummary.invalidate({ accountId });
      await utils.automation.listRecentFailures.invalidate();
      await utils.automation.getThreadAutoFollowUpBadges.invalidate();
      await utils.automation.getThreadFollowUpSummary.invalidate();
      await utils.automation.listExecutions.invalidate();
      await utils.automation.getExecutionDetail.invalidate();
    },
  });

  const rejectMutation = api.automation.reject.useMutation({
    onSuccess: async () => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
      await utils.automation.getTodaySummary.invalidate({ accountId });
      await utils.automation.listRecentFailures.invalidate();
      await utils.automation.getThreadAutoFollowUpBadges.invalidate();
      await utils.automation.getThreadFollowUpSummary.invalidate();
    },
  });
  const runDetectorNowMutation = api.automation.runDetectorNow.useMutation({
    onSuccess: async (res) => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
      await utils.automation.getTodaySummary.invalidate({ accountId });
      await utils.automation.listRecentFailures.invalidate();
      await utils.automation.getThreadAutoFollowUpBadges.invalidate();
      await utils.automation.getThreadFollowUpSummary.invalidate();
      await utils.automation.listExecutions.invalidate();
      await utils.automation.getExecutionDetail.invalidate();
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
        description: "Try Scan now again, or open Automation log for details. You can also pause Autopilot from Guardrails.",
      });
    },
  });
  const setGuardrailsMutation = api.automation.setGuardrails.useMutation({
    onSuccess: async () => {
      await utils.automation.getGuardrails.invalidate({ accountId });
      toast.success("Guardrails saved");
    },
    onError: (error) => {
      toast.error("Failed to save guardrails", { description: error.message });
    },
  });

  const busy =
    prefsLoading ||
    setModeMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    runDetectorNowMutation.isPending ||
    setGuardrailsMutation.isPending;

  const pendingRows = listPendingQuery.data ?? [];
  const listExecutionsQuery = api.automation.listExecutions.useQuery(
    {
      accountId,
      page: logPage,
      limit: 12,
      ...(logStatus ? { status: logStatus } : {}),
    },
    { enabled: open && logOpen && accountId.trim().length > 0, staleTime: 4_000 },
  );
  const selectedDetailQuery = api.automation.getExecutionDetail.useQuery(
    { executionId: selectedExecutionId ?? "" },
    { enabled: open && logOpen && !!selectedExecutionId, staleTime: 4_000 },
  );
  const pendingCount = useMemo(
    () => (open ? pendingRows.length : awaitingApproval),
    [open, pendingRows.length, awaitingApproval],
  );
  const executionRows = listExecutionsQuery.data?.items ?? [];
  const logTotalPages = Math.max(
    1,
    Math.ceil((listExecutionsQuery.data?.total ?? 0) / Math.max(1, listExecutionsQuery.data?.limit ?? 12)),
  );

  const statusChipClass = (status: string) =>
    status === "success"
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
      : status === "failed"
        ? "bg-rose-500/15 text-rose-300 ring-rose-500/30"
        : status === "cancelled"
          ? "bg-zinc-500/15 text-zinc-300 ring-white/20"
          : status === "awaiting_approval"
            ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
            : "bg-sky-500/15 text-sky-300 ring-sky-500/30";

  const requestModeChange = async (nextMode: Mode) => {
    if (nextMode === "auto" && requiresAutoConsent) {
      setPendingModeChoice(nextMode);
      setConsentOpen(true);
      return;
    }
    await setModeMutation.mutateAsync({ accountId, mode: nextMode });
  };

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
  const copyExecutionId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Execution ID copied");
    } catch {
      toast.error("Unable to copy execution ID");
    }
  };

  const confirmAutoConsent = async () => {
    if (!pendingModeChoice) return;
    await setModeMutation.mutateAsync({
      accountId,
      mode: pendingModeChoice,
      autoConsentConfirmed: true,
    });
    setConsentOpen(false);
    setConsentChecked(false);
    setPendingModeChoice(null);
    toast.success("Auto mode enabled with explicit consent");
  };

  const saveGuardrails = async () => {
    const cap = Number.parseInt(guardrailCap, 10);
    if (!Number.isFinite(cap) || cap < 1 || cap > 50) {
      toast.error("Daily cap must be between 1 and 50");
      return;
    }
    const blockedDomains = guardrailDomains
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const blockedSenderSubstrings = guardrailSenders
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    await setGuardrailsMutation.mutateAsync({
      accountId,
      paused: guardrailPaused,
      maxAutoSendsPerDay: cap,
      blockedDomains,
      blockedSenderSubstrings,
    });
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
            Candidate follow-ups are scored by confidence. Assist asks you first; Auto can send high-confidence follow-ups within your daily cap.
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
                subtitle="Review only. No automation actions run."
                onSelect={(m) => void requestModeChange(m)}
                disabled={busy}
              />
              <ModePill
                selected={mode === "assist"}
                mode="assist"
                title="Assist"
                subtitle="Draft suggestions, always waits for your approval."
                onSelect={(m) => void requestModeChange(m)}
                disabled={busy}
              />
              <ModePill
                selected={mode === "auto"}
                mode="auto"
                title="Auto"
                subtitle="High confidence can send, medium still asks."
                onSelect={(m) => void requestModeChange(m)}
                disabled={busy}
              />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400">
              <CircleHelp className="h-3.5 w-3.5" />
              Confidence: High (at least 85%) can run in Auto, Medium (60-84%) asks for approval.
            </p>

            <div className="mt-4">
              <div className="mb-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-white">Guardrails</span>
                  <button
                    type="button"
                    onClick={() => setGuardrailPaused((v) => !v)}
                    className={cn(
                      "inline-flex h-6 items-center rounded-full px-2 text-[10px] font-semibold transition-colors",
                      guardrailPaused
                        ? "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/40"
                        : "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40",
                    )}
                  >
                    {guardrailPaused ? "Paused" : "Active"}
                  </button>
                </div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-400">
                  Max real auto-sends/day
                </label>
                <input
                  value={guardrailCap}
                  onChange={(e) => setGuardrailCap(e.target.value)}
                  inputMode="numeric"
                  className="mb-2 h-8 w-full rounded-md border border-white/[0.1] bg-black/30 px-2 text-[12px] text-white outline-none ring-offset-0 focus:border-[#3b82f6]/50"
                />
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-400">
                  Blocked domains (comma-separated)
                </label>
                <textarea
                  value={guardrailDomains}
                  onChange={(e) => setGuardrailDomains(e.target.value)}
                  rows={2}
                  className="mb-2 w-full rounded-md border border-white/[0.1] bg-black/30 px-2 py-1.5 text-[12px] text-white outline-none focus:border-[#3b82f6]/50"
                  placeholder="example.com, vendor.io"
                />
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-400">
                  Blocked sender substrings (comma-separated)
                </label>
                <textarea
                  value={guardrailSenders}
                  onChange={(e) => setGuardrailSenders(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-white/[0.1] bg-black/30 px-2 py-1.5 text-[12px] text-white outline-none focus:border-[#3b82f6]/50"
                  placeholder="noreply@, do-not-reply"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 bg-[#3b82f6] px-3 text-[11px] text-white hover:bg-[#2563eb]"
                    disabled={busy}
                    onClick={() => void saveGuardrails()}
                  >
                    {setGuardrailsMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
              {isDemo && (
                <div className="mb-3 rounded-lg border border-sky-500/30 bg-sky-500/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[12px] font-semibold text-sky-100">Demo walkthrough</p>
                      <p className="text-[11px] text-sky-200/90">
                        Deterministic path: Brief to approval queue to approve to simulated send to log and badge update.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 bg-sky-600 px-2 text-[11px] text-white hover:bg-sky-500"
                      onClick={() => {
                        const next = (demoStoryStep + 1) % 5;
                        setDemoStoryStep(next);
                        const labels = [
                          "Step 1: Brief highlights a follow-up opportunity.",
                          "Step 2: Follow-up appears in awaiting approval.",
                          "Step 3: Approve action to continue.",
                          "Step 4: Action is simulated sent (no real email in demo).",
                          "Step 5: Badge and automation log reflect completion.",
                        ];
                        toast.message(labels[next] ?? labels[0]);
                      }}
                    >
                      {demoStoryStep === 0 ? "Start demo story" : "Next step"}
                    </Button>
                  </div>
                </div>
              )}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white">
                  Awaiting approval
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    disabled={busy}
                    onClick={() => {
                      setLogPage(0);
                      setSelectedExecutionId(null);
                      setLogOpen(true);
                    }}
                  >
                    Automation log
                  </Button>
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
                            <span
                              className="ml-1 cursor-help text-zinc-500 underline decoration-dotted underline-offset-2"
                              title={`Why this action: ${row.reason ?? "Needs follow-up based on conversation signals."}`}
                            >
                              Why this action?
                            </span>
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
        <Dialog
          open={logOpen}
          onOpenChange={(next) => {
            setLogOpen(next);
            if (!next) setSelectedExecutionId(null);
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="max-h-[90vh] w-[95vw] max-w-5xl overflow-hidden border-neutral-800 bg-[#0b0b0d] text-white p-0 gap-0"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Automation log</DialogTitle>
              <DialogDescription>Recent executions and outcomes.</DialogDescription>
            </DialogHeader>
            <div className="grid h-[78vh] grid-cols-1 md:grid-cols-[1.15fr_0.85fr]">
              <div className="flex min-h-0 flex-col border-b border-white/[0.08] md:border-b-0 md:border-r">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.06] ring-1 ring-white/[0.08]">
                      <ScrollText className="h-3.5 w-3.5 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold leading-tight">Automation log</h3>
                      <p className="text-[11px] leading-tight text-zinc-400">Recent executions and outcomes.</p>
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <select
                      className="h-8 appearance-none rounded-md border border-white/[0.1] bg-black/40 pl-2.5 pr-7 text-[12px] text-zinc-200 outline-none transition-colors hover:border-white/[0.18] focus:border-[#3b82f6]/50"
                      value={logStatus}
                      onChange={(e) => {
                        setLogStatus(e.target.value as typeof logStatus);
                        setLogPage(0);
                      }}
                    >
                      <option value="">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="running">Running</option>
                      <option value="awaiting_approval">Awaiting approval</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                  {listExecutionsQuery.isLoading ? (
                    <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-[12px] text-zinc-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading execution log…
                    </div>
                  ) : listExecutionsQuery.isError ? (
                    <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-[12px] text-rose-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Failed to load execution log.
                    </div>
                  ) : executionRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] px-4 py-10 text-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/[0.08]">
                        <Inbox className="h-4 w-4 text-zinc-400" />
                      </div>
                      <p className="text-[12px] font-medium text-zinc-200">No executions yet</p>
                      <p className="max-w-[260px] text-[11px] leading-snug text-zinc-500">
                        Nothing matches this filter. Try another status, or run a scan from the Autopilot panel.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {executionRows.map((row) => (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() => setSelectedExecutionId(row.id)}
                          className={cn(
                            "group w-full rounded-lg border p-3 text-left transition-all",
                            selectedExecutionId === row.id
                              ? "border-[#3b82f6]/50 bg-[#3b82f6]/[0.08] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.15)]"
                              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-[12px] font-semibold text-white">
                              {row.thread?.subject ?? "(No thread subject)"}
                            </p>
                            <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", statusChipClass(row.status))}>
                              <span className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                row.status === "success" ? "bg-emerald-400"
                                  : row.status === "failed" ? "bg-rose-400"
                                    : row.status === "cancelled" ? "bg-zinc-400"
                                      : row.status === "awaiting_approval" ? "bg-amber-400"
                                        : "bg-sky-400",
                              )} />
                              {row.status.replaceAll("_", " ")}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-400">
                            <span>{new Date(row.createdAt).toLocaleString()}</span>
                            <span className="text-zinc-600">·</span>
                            <span className={cn(
                              "rounded px-1.5 py-[1px] text-[9px] font-medium uppercase tracking-wide",
                              row.dryRun ? "bg-zinc-500/15 text-zinc-300" : "bg-emerald-500/15 text-emerald-300",
                            )}>
                              {row.dryRun ? "dry-run" : "real-send"}
                            </span>
                            <span className="text-zinc-600">·</span>
                            <span className="font-mono text-zinc-500">{row.id.slice(0, 10)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[11px] text-zinc-400">
                  <span>
                    Page {Math.min(logPage + 1, logTotalPages)} / {logTotalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-zinc-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                      disabled={logPage <= 0}
                      onClick={() => setLogPage((p) => Math.max(0, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-zinc-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                      disabled={!listExecutionsQuery.data?.hasMore}
                      onClick={() => setLogPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
              <div className="relative flex min-h-0 flex-col">
                <DialogClose
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </DialogClose>
                {!selectedExecutionId ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/[0.08]">
                      <MousePointerClick className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="text-[12px] font-medium text-zinc-200">No execution selected</p>
                    <p className="max-w-[280px] text-[11px] leading-snug text-zinc-500">
                      Select an execution on the left to inspect its timeline, retries, errors, and payload.
                    </p>
                  </div>
                ) : selectedDetailQuery.isLoading ? (
                  <div className="p-4">
                    <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-[12px] text-zinc-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading detail…
                    </div>
                  </div>
                ) : selectedDetailQuery.isError || !selectedDetailQuery.data ? (
                  <div className="p-4">
                    <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-[12px] text-rose-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Failed to load execution detail.
                    </div>
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-white">
                          {selectedDetailQuery.data.thread?.subject ?? "(No subject)"}
                        </p>
                        <p className="text-[11px] text-zinc-400">Thread: {selectedDetailQuery.data.thread?.id ?? "-"}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => void copyExecutionId(selectedDetailQuery.data.id)}
                      >
                        <Copy className="mr-1 h-3.5 w-3.5" />
                        Copy execution ID
                      </Button>
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-md border border-white/[0.08] bg-white/[0.02] p-2">Status: <span className="font-semibold">{selectedDetailQuery.data.status}</span></div>
                      <div className="rounded-md border border-white/[0.08] bg-white/[0.02] p-2">Retries: <span className="font-semibold">{selectedDetailQuery.data.retryCount}</span></div>
                      <div className="rounded-md border border-white/[0.08] bg-white/[0.02] p-2">Mode: <span className="font-semibold">{selectedDetailQuery.data.dryRun ? "dry-run" : "real-send"}</span></div>
                      <div className="rounded-md border border-white/[0.08] bg-white/[0.02] p-2">Confidence: <span className="font-semibold">{selectedDetailQuery.data.confidence == null ? "-" : `${Math.round(selectedDetailQuery.data.confidence * 100)}%`}</span></div>
                    </div>
                    {selectedDetailQuery.data.reason && (
                      <p className="mb-3 text-[11px] text-zinc-300">Reason: {selectedDetailQuery.data.reason}</p>
                    )}
                    {selectedDetailQuery.data.lastError && (
                      <div className="mb-3 rounded-md border border-rose-500/35 bg-rose-500/10 p-2 text-[11px] text-rose-200">
                        Last error: {selectedDetailQuery.data.lastError}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px] text-rose-100 hover:bg-rose-500/20"
                            onClick={() => void handleScanNow()}
                          >
                            Retry scan
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px] text-rose-100 hover:bg-rose-500/20"
                            onClick={() => {
                              setLogOpen(true);
                            }}
                          >
                            Open log
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px] text-rose-100 hover:bg-rose-500/20"
                            onClick={() => {
                              setGuardrailPaused(true);
                              void setGuardrailsMutation.mutateAsync({
                                accountId,
                                paused: true,
                                maxAutoSendsPerDay: Number.parseInt(guardrailCap, 10) || 5,
                                blockedDomains: guardrailDomains.split(",").map((v) => v.trim()).filter(Boolean),
                                blockedSenderSubstrings: guardrailSenders.split(",").map((v) => v.trim()).filter(Boolean),
                              });
                            }}
                          >
                            Pause autopilot
                          </Button>
                        </div>
                      </div>
                    )}
                    <h4 className="mb-2 text-[12px] font-semibold text-white">Timeline</h4>
                    <div className="mb-3 space-y-2">
                      {selectedDetailQuery.data.timeline.map((t, idx) => (
                        <div key={`${t.at}-${idx}`} className="flex items-start gap-2 rounded-md border border-white/[0.08] bg-white/[0.02] p-2">
                          {t.kind === "audit" ? (
                            <Clock3 className="mt-0.5 h-3.5 w-3.5 text-zinc-400" />
                          ) : t.status === "success" ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                          ) : t.status === "failed" ? (
                            <XCircle className="mt-0.5 h-3.5 w-3.5 text-rose-400" />
                          ) : (
                            <Clock3 className="mt-0.5 h-3.5 w-3.5 text-sky-400" />
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] text-white capitalize">{t.label}</p>
                            <p className="text-[10px] text-zinc-400">{new Date(t.at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <h4 className="mb-2 text-[12px] font-semibold text-white">Payload preview (sanitized)</h4>
                    <pre className="max-h-[220px] overflow-auto rounded-md border border-white/[0.08] bg-black/30 p-2 text-[10px] text-zinc-300">
                      {JSON.stringify(selectedDetailQuery.data.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
          <DialogContent className="max-w-md border-neutral-800 bg-[#0b0b0d] text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[14px]">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Confirm Auto mode
              </DialogTitle>
              <DialogDescription className="text-[12px] text-zinc-400">
                Auto mode can send high-confidence follow-ups on your behalf.
                Daily cap is currently <span className="font-semibold text-zinc-200">{capFromPrefs}</span>, and pause control is available in Guardrails.
              </DialogDescription>
            </DialogHeader>
            <label className="mt-2 flex items-start gap-2 text-[12px] text-zinc-300">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span>I understand auto follow-ups can be sent when confidence is high.</span>
            </label>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[11px]"
                onClick={() => {
                  setConsentOpen(false);
                  setPendingModeChoice(null);
                  setConsentChecked(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 bg-[#3b82f6] px-3 text-[11px] text-white hover:bg-[#2563eb]"
                disabled={!consentChecked || setModeMutation.isPending}
                onClick={() => void confirmAutoConsent()}
              >
                {setModeMutation.isPending ? "Enabling…" : "Enable Auto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

