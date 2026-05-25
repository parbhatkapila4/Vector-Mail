"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Inbox,
  Loader2,
  PlayCircle,
  RefreshCw,
  ScrollText,
  Send,
  Settings,
  X,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

const HUMAN_STATUS_LABEL: Record<string, string> = {
  pending: "Working on it",
  running: "Running",
  awaiting_approval: "Waiting for you",
  success: "Done",
  failed: "Failed",
  cancelled: "Skipped",
};
const humanStatus = (s: string): string =>
  HUMAN_STATUS_LABEL[s] ?? s.replaceAll("_", " ");

function humanTimelineLabel(raw: string): string {
  const k = raw.toLowerCase().trim();
  if (k === "created") return "Detected this thread";
  if (k === "candidate created") return "Picked as a candidate";
  if (k.startsWith("status: pending")) return "Working on a draft";
  if (k.startsWith("status: running")) return "Running";
  if (k.startsWith("status: awaiting_approval")) return "Waiting for your approval";
  if (k.startsWith("status: success")) return "Done";
  if (k.startsWith("status: failed")) return "Failed";
  if (k.startsWith("status: cancelled")) return "Skipped";
  if (k.startsWith("status:")) return raw.slice("status:".length).trim() || raw;
  if (k === "execution approved") return "You approved this";
  if (k === "execution rejected") return "You rejected this";
  if (k === "scan started") return "Scan started";
  if (k === "scan finished") return "Scan finished";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function relativeTime(input: string | number | Date): string {
  const d = new Date(input);
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 24 * 60 * 60 * 1000 && diffMs >= 0) {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  return format(d, "MMM d 'at' h:mm a");
}

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { CONFIDENCE_THRESHOLDS, bandForConfidence } from "@/lib/automation/policy";
import { AutopilotWalkthrough } from "./AutopilotWalkthrough";
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

const MODE_ORDER: Mode[] = ["manual", "assist", "auto"];
const MODE_LABEL: Record<Mode, string> = {
  manual: "Off",
  assist: "Suggest",
  auto: "Auto-send",
};
const MODE_TAGLINE: Record<Mode, string> = {
  manual: "Autopilot stays out of the way. Nothing is queued or sent.",
  assist: "Drafts follow-ups for you, then asks before sending each one.",
  auto: "Sends high-confidence follow-ups for you. Medium-confidence still asks.",
};

function TrustSegmented({
  mode,
  onSelect,
  disabled,
}: {
  mode: Mode;
  onSelect: (mode: Mode) => void;
  disabled: boolean;
}) {
  const activeIndex = MODE_ORDER.indexOf(mode);
  return (
    <div className="relative grid grid-cols-3 rounded-xl border border-[#e4e7ed] bg-[#f4f5f8] p-1">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 rounded-lg bg-white shadow-sm ring-1 ring-[#1e2a4a]/15 transition-transform duration-300 ease-out"
        style={{
          width: "calc((100% - 0.5rem) / 3)",
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {MODE_ORDER.map((m) => {
        const selected = m === mode;
        return (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(m)}
            className={cn(
              "relative z-10 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
              selected ? "text-[#0e1729]" : "text-[#7a849a] hover:text-[#1e2a44]",
              disabled && "opacity-60",
            )}
          >
            {MODE_LABEL[m]}
          </button>
        );
      })}
    </div>
  );
}

function ConfidenceBar({ value }: { value: number | null }) {
  const v = value ?? 0;
  const pct = Math.round(v * 100);
  const band = bandForConfidence(value);
  const filledSegments = Math.max(0, Math.min(5, Math.round(v * 5)));
  const fillClass =
    band === "HIGH"
      ? "bg-emerald-500"
      : band === "MEDIUM"
        ? "bg-amber-500"
        : "bg-[#a8b0c0]";
  const labelClass =
    band === "HIGH"
      ? "text-emerald-700"
      : band === "MEDIUM"
        ? "text-amber-700"
        : "text-[#7a849a]";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-3 rounded-sm transition-colors",
              i < filledSegments ? fillClass : "bg-[#e4e7ed]",
            )}
          />
        ))}
      </div>
      <span className={cn("text-[10.5px] font-semibold tabular-nums", labelClass)}>
        {value == null ? "-" : `${pct}%`}
      </span>
    </div>
  );
}

function HeroStats({
  sentToday,
  pendingApproval,
  failedToday,
}: {
  sentToday: number;
  pendingApproval: number;
  failedToday: number;
}) {
  const hasActivity = sentToday > 0 || pendingApproval > 0 || failedToday > 0;
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1e2a4a]/15 bg-gradient-to-br from-[#1e2a4a]/[0.08] via-[#1e2a4a]/[0.04] to-transparent p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#1e2a4a] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Opus-B.png"
            alt="Autopilot"
            className="h-full w-full object-cover"
          />
        </div>
        {hasActivity ? (
          <div className="flex flex-1 items-center gap-4 text-[12px]">
            <span className="flex items-baseline gap-1">
              <span className="text-[16px] font-semibold tabular-nums text-[#0e1729]">
                {sentToday}
              </span>
              <span className="text-[10.5px] text-[#4a5572]">sent</span>
            </span>
            <span className="flex items-baseline gap-1">
              <span className="text-[16px] font-semibold tabular-nums text-[#0e1729]">
                {pendingApproval}
              </span>
              <span className="text-[10.5px] text-[#4a5572]">waiting</span>
            </span>
            {failedToday > 0 && (
              <span className="flex items-baseline gap-1">
                <span className="text-[16px] font-semibold tabular-nums text-rose-600">
                  {failedToday}
                </span>
                <span className="text-[10.5px] text-[#4a5572]">failed</span>
              </span>
            )}
            <span className="ml-auto text-[10px] text-[#7a849a]">today</span>
          </div>
        ) : (
          <p className="flex-1 text-[12px] leading-snug text-[#4a5572]">
            <span className="font-semibold text-[#0e1729]">First time? </span>
            Pick a trust level below - drafts will appear here when ready.
          </p>
        )}
      </div>
    </div>
  );
}

export function AutopilotSection({ accountId, isDemo = false }: { accountId: string; isDemo?: boolean }) {
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [pendingModeChoice, setPendingModeChoice] = useState<Mode | null>(null);
  const [logPage, setLogPage] = useState(0);
  const [logStatus, setLogStatus] = useState<"" | "pending" | "awaiting_approval" | "running" | "success" | "failed" | "cancelled">("");
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [guardrailPaused, setGuardrailPaused] = useState(false);
  const [guardrailCap, setGuardrailCap] = useState("5");
  const [guardrailDomains, setGuardrailDomains] = useState("");
  const [guardrailSenders, setGuardrailSenders] = useState("");
  const [demoModeOverride, setDemoModeOverride] = useState<Mode | null>(null);
  const [demoHandledIds, setDemoHandledIds] = useState<Record<string, "approved" | "rejected">>({});
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  type FilteredExample = {
    subject: string;
    sender: string;
    reason: "non_repliable" | "promo";
  };
  type LastScanInfo = {
    scanned: number;
    skippedPromo: number;
    skippedNonRepliable: number;
    skippedRecentOutbound: number;
    skippedSelfSent: number;
    skippedMissingData: number;
    skippedBlockedSender: number;
    eligibleNoneCreated: boolean;
    examples: FilteredExample[];
    totalInboxThreads: number;
    threadsInWindow: number;
  };
  const [lastScan, setLastScan] = useState<LastScanInfo | null>(null);
  const [examplesExpanded, setExamplesExpanded] = useState(false);

  const { data: prefs, isLoading: prefsLoading } = api.automation.getPrefs.useQuery(
    { accountId },
    { enabled: accountId.trim().length > 0, staleTime: 10_000 },
  );

  const { data: todaySummary } = api.automation.getTodaySummary.useQuery(
    { accountId },
    { enabled: accountId.trim().length > 0, staleTime: 5_000 },
  );

  const awaitingApproval = prefs?.awaitingApproval ?? 0;
  const mode = (isDemo ? (demoModeOverride ?? prefs?.automationMode ?? "manual") : (prefs?.automationMode ?? "manual")) as Mode;
  const requiresAutoConsent = prefs?.requiresAutoConsent ?? true;
  const capFromPrefs = prefs?.maxAutoSendsPerDay ?? (Number.parseInt(guardrailCap, 10) || 5);
  const realSendEnabled = prefs?.realSendEnabled ?? false;
  const showRealSendDisabledBanner =
    !isDemo && !prefsLoading && !realSendEnabled && mode !== "manual";

  const setModeMutation = api.automation.setMode.useMutation({
    onSuccess: async () => {
      await utils.automation.getPrefs.invalidate({ accountId });
      await utils.automation.listPending.invalidate({ accountId, limit: 25 });
      await utils.automation.getTodaySummary.invalidate({ accountId });
      await utils.automation.getMetrics.invalidate({ accountId });
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
      await utils.automation.getMetrics.invalidate({ accountId });
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
      await utils.automation.getMetrics.invalidate({ accountId });
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
      await utils.automation.getMetrics.invalidate({ accountId });
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
      const scanned = res.scannedThreads ?? 0;
      const skippedPromo =
        (res as { skippedPromo?: number }).skippedPromo ?? 0;
      const skippedNonRepliable =
        (res as { skippedNonRepliable?: number }).skippedNonRepliable ?? 0;
      const skippedRecentOutbound = res.skippedRecentOutbound ?? 0;

      const examples =
        (res as { filteredExamples?: FilteredExample[] }).filteredExamples ?? [];
      const totalInboxThreads =
        (res as { totalInboxThreads?: number }).totalInboxThreads ?? 0;
      const threadsInWindow =
        (res as { threadsInWindow?: number }).threadsInWindow ?? 0;
      const skippedSelfSent =
        (res as { skippedSelfSent?: number }).skippedSelfSent ?? 0;
      const skippedMissingData =
        (res as { skippedMissingData?: number }).skippedMissingData ?? 0;
      const skippedBlockedSender =
        (res as { skippedBlockedSender?: number }).skippedBlockedSender ?? 0;
      setLastScan({
        scanned,
        skippedPromo,
        skippedNonRepliable,
        skippedRecentOutbound,
        skippedSelfSent,
        skippedMissingData,
        skippedBlockedSender,
        eligibleNoneCreated: created === 0 && eligible > 0,
        examples,
        totalInboxThreads,
        threadsInWindow,
      });
      setExamplesExpanded(false);

      if (created > 0) {
        toast.success("Autopilot scan complete", {
          description: `Created ${created} approval item${created > 1 ? "s" : ""}${duplicates > 0 ? `, ${duplicates} duplicate${duplicates > 1 ? "s" : ""} skipped` : ""}.`,
        });
      } else if (eligible > 0) {
        toast.info("No new approvals found", {
          description:
            "Candidates were found but were already created in this idempotency window. Wait a few hours, or skip the existing ones in the queue.",
        });
      } else {
        const filteredTotal = skippedPromo + skippedNonRepliable;
        let description: string;
        if (scanned === 0) {
          description =
            "No fresh inbox threads to check. Autopilot looks at threads from the last 14 days where you haven't replied.";
        } else if (filteredTotal >= scanned) {
          const bits: string[] = [];
          if (skippedNonRepliable > 0) {
            bits.push(
              `${skippedNonRepliable} OTP / banking / no-reply`,
            );
          }
          if (skippedPromo > 0) {
            bits.push(`${skippedPromo} promo / newsletter`);
          }
          description = `Scanned ${scanned} thread${scanned === 1 ? "" : "s"}, all filtered out (${bits.join(", ")}). Nothing left to follow up on.`;
        } else if (skippedRecentOutbound > 0) {
          description = `Scanned ${scanned} thread${scanned === 1 ? "" : "s"}; ${skippedRecentOutbound} already had a recent outbound from you so were skipped.`;
        } else {
          description = `Scanned ${scanned} thread${scanned === 1 ? "" : "s"}, nothing qualified for a follow-up right now.`;
        }
        toast.info("No new approvals found", { description });
      }
    },
    onError: () => {
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

  const requestModeChange = async (nextMode: Mode) => {
    if (isDemo) {
      setDemoModeOverride(nextMode);
      toast.success(
        nextMode === "manual"
          ? "Manual mode (demo)"
          : nextMode === "assist"
            ? "Assist mode (demo)"
            : "Auto mode (demo)",
      );
      return;
    }
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
    <div className="w-full rounded-xl border border-[#e4e7ed] bg-[#fafbfc] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#0e1729]">Autopilot</span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#fff4e1] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00] ring-1 ring-[#f3cc7a]">
                {pendingCount} awaiting approval
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-[#4a5572]">
            Candidate follow-ups are scored by confidence. Assist asks you first; Auto can send high-confidence follow-ups within your daily cap.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-lg bg-[#f4f5f8] text-[12px] text-[#0e1729] hover:bg-[#ebedf2]"
              disabled={busy}
            >
              Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[520px] border-[#e4e7ed] bg-white text-[#0e1729]">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 pr-6">
                <DialogTitle className="text-[14px]">Autopilot</DialogTitle>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  disabled={busy}
                  className="absolute right-10 top-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#4a5572] transition-colors hover:bg-[#f4f5f8] hover:text-[#0e1729] disabled:opacity-50"
                  title="Settings: cap, blocked senders, pause"
                  aria-label="Autopilot settings"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
              <DialogDescription className="sr-only">
                Set your trust level and approve pending follow-ups.
              </DialogDescription>
            </DialogHeader>

            <HeroStats
              sentToday={
                (todaySummary?.sentRealToday ?? 0) +
                (todaySummary?.simulatedToday ?? 0)
              }
              pendingApproval={todaySummary?.pendingApproval ?? awaitingApproval}
              failedToday={todaySummary?.failedToday ?? 0}
            />

            <div className="mt-3">
              <TrustSegmented
                mode={mode}
                onSelect={(m) => void requestModeChange(m)}
                disabled={busy}
              />
              <p className="mt-2 px-1 text-[11px] leading-snug text-[#4a5572]">
                {MODE_TAGLINE[mode]}
                {mode === "auto" && (
                  <span className="ml-1 text-[#7a849a]">
                    ({Math.round(CONFIDENCE_THRESHOLDS.HIGH * 100)}%+ sends, {Math.round(CONFIDENCE_THRESHOLDS.MEDIUM * 100)}–{Math.round(CONFIDENCE_THRESHOLDS.HIGH * 100) - 1}% asks)
                  </span>
                )}
              </p>
              {showRealSendDisabledBanner && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-50 px-2.5 py-2 text-[11px] leading-snug text-amber-900">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <div className="min-w-0">
                    <p className="font-semibold">Real sends are off - everything stays as Preview.</p>
                    <p className="mt-0.5 text-amber-800/85">
                      Set <span className="rounded bg-amber-100 px-1 font-mono text-[10px]">AUTOMATION_REAL_SEND_ENABLED=true</span> in your <code>.env</code> and restart the server to let Autopilot actually send.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              {isDemo && (
                <div
                  className="mb-3 overflow-hidden rounded-lg border"
                  style={{
                    borderColor: "rgba(184,138,63,0.35)",
                    background:
                      "linear-gradient(135deg, rgba(245,235,217,0.65) 0%, rgba(255,255,255,0.4) 100%)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                        style={{
                          background:
                            "linear-gradient(180deg, #1e2a4a 0%, #0d1530 100%)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 6px rgba(212,169,85,0.32)",
                        }}
                      >
                        <PlayCircle className="h-4 w-4 text-[#f5ebd9]" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-[11.5px] font-semibold leading-tight text-[#1a1612]"
                          style={{ letterSpacing: "-0.005em" }}
                        >
                          See the loop, end to end
                        </p>
                        <p
                          className="mt-0.5 text-[10.5px] leading-snug text-[#5b554c]"
                          style={{
                            fontFamily: "var(--font-newsreader), Georgia, serif",
                            fontStyle: "italic",
                          }}
                        >
                          Five frames: brief, queue, approve, simulated send, log.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 shrink-0 px-2.5 text-[11px] text-[#f5ebd9] hover:opacity-90"
                      style={{
                        background:
                          "linear-gradient(180deg, #1e2a4a 0%, #0d1530 100%)",
                        border: "1px solid #b88a3f",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 6px rgba(212,169,85,0.25)",
                      }}
                      onClick={() => {
                        setWalkthroughStep(0);
                        setWalkthroughOpen(true);
                      }}
                    >
                      Watch walkthrough
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] font-semibold text-[#0e1729]">
                    Waiting on you
                  </span>
                  {pendingRows.length > 0 && (
                    <span className="text-[11px] tabular-nums text-[#7a849a]">
                      ({pendingRows.length})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {listPendingQuery.isFetching && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4a5572]" />
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setLogPage(0);
                      setSelectedExecutionId(null);
                      setLogOpen(true);
                    }}
                    className="rounded-md px-2 py-1 text-[11px] text-[#4a5572] transition-colors hover:bg-[#f4f5f8] hover:text-[#0e1729] disabled:opacity-50"
                  >
                    Log
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleScanNow()}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#1e2a4a] transition-colors hover:bg-[#1e2a4a]/10 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3 w-3",
                        runDetectorNowMutation.isPending && "animate-spin",
                      )}
                    />
                    {runDetectorNowMutation.isPending ? "Scanning…" : "Scan now"}
                  </button>
                </div>
              </div>

              {listPendingQuery.isLoading ? (
                <div className="flex items-center gap-2 rounded-xl border border-[#e4e7ed] bg-[#fafbfc] p-3 text-[12px] text-[#4a5572]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </div>
              ) : pendingRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e4e7ed] bg-[#fafbfc] px-4 py-5">
                  <div className="flex flex-col items-center justify-center gap-1 text-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-[#e4e7ed]">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="mt-1 text-[12px] font-semibold text-[#0e1729]">
                      You're all caught up
                    </p>
                    <p className="max-w-[280px] text-[11px] leading-snug text-[#7a849a]">
                      Nothing waiting on you. Hit Scan now to look for new follow-ups.
                    </p>
                  </div>
                  {lastScan && (() => {
                    const totalSkipped =
                      lastScan.skippedPromo +
                      lastScan.skippedNonRepliable +
                      lastScan.skippedSelfSent +
                      lastScan.skippedMissingData +
                      lastScan.skippedBlockedSender +
                      lastScan.skippedRecentOutbound;
                    return (
                      <div className="mt-3 rounded-lg border border-[#e4e7ed] bg-white px-3 py-2.5 text-left">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#7a849a]">
                          Last scan
                        </p>
                        {lastScan.totalInboxThreads === 0 ? (
                          <p className="mt-1 text-[11px] leading-snug text-[#4a5572]">
                            Your indexed inbox has <span className="font-semibold text-[#0e1729]">0</span> threads marked as inbox. Sync may not have finished, or all threads got marked done/archived. Try a fresh sync.
                          </p>
                        ) : lastScan.threadsInWindow === 0 ? (
                          <p className="mt-1 text-[11px] leading-snug text-[#4a5572]">
                            You have <span className="font-semibold text-[#0e1729]">{lastScan.totalInboxThreads}</span> inbox threads, but none from the last 14 days. Autopilot only chases recent unreplied conversations.
                          </p>
                        ) : lastScan.eligibleNoneCreated ? (
                          <p className="mt-1 text-[11px] leading-snug text-[#4a5572]">
                            <span className="font-semibold tabular-nums text-[#0e1729]">{lastScan.threadsInWindow}</span> threads in window. Candidates were found, but they're already in your queue from a recent scan - try again later or skip the existing ones.
                          </p>
                        ) : totalSkipped === 0 && lastScan.scanned === 0 ? (
                          <p className="mt-1 text-[11px] leading-snug text-[#4a5572]">
                            <span className="font-semibold tabular-nums text-[#0e1729]">{lastScan.threadsInWindow}</span> threads in window but none reached the filter - possibly all duplicates from the reminder pass.
                          </p>
                        ) : (
                          <div className="mt-1 space-y-1 text-[11px] leading-snug text-[#4a5572]">
                            <p>
                              <span className="font-semibold tabular-nums text-[#0e1729]">{lastScan.threadsInWindow}</span> thread{lastScan.threadsInWindow === 1 ? "" : "s"} in window; <span className="font-semibold tabular-nums text-[#0e1729]">{lastScan.scanned}</span> qualified.
                            </p>
                            <ul className="space-y-0.5 pl-1">
                              {lastScan.skippedSelfSent > 0 && (
                                <li>
                                  <span className="font-medium tabular-nums text-[#1e2a44]">{lastScan.skippedSelfSent}</span> already had YOU as the last sender (you replied last)
                                </li>
                              )}
                              {lastScan.skippedMissingData > 0 && (
                                <li>
                                  <span className="font-medium tabular-nums text-[#1e2a44]">{lastScan.skippedMissingData}</span> have missing sender data (sync gap)
                                </li>
                              )}
                              {lastScan.skippedBlockedSender > 0 && (
                                <li>
                                  <span className="font-medium tabular-nums text-[#1e2a44]">{lastScan.skippedBlockedSender}</span> matched your blocked senders / domains
                                </li>
                              )}
                              {lastScan.skippedNonRepliable > 0 && (
                                <li>
                                  <span className="font-medium tabular-nums text-[#1e2a44]">{lastScan.skippedNonRepliable}</span> filtered as OTP / banking / no-reply
                                </li>
                              )}
                              {lastScan.skippedPromo > 0 && (
                                <li>
                                  <span className="font-medium tabular-nums text-[#1e2a44]">{lastScan.skippedPromo}</span> filtered as promo / newsletter
                                </li>
                              )}
                              {lastScan.skippedRecentOutbound > 0 && (
                                <li>
                                  <span className="font-medium tabular-nums text-[#1e2a44]">{lastScan.skippedRecentOutbound}</span> already had your reply in the last 8h
                                </li>
                              )}
                            </ul>
                            {lastScan.examples.length > 0 && (
                              <div className="mt-2 border-t border-[#e4e7ed] pt-2">
                                <button
                                  type="button"
                                  onClick={() => setExamplesExpanded((v) => !v)}
                                  className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-0.5 text-[10.5px] font-medium text-[#1e2a4a] hover:bg-[#f4f5f8]"
                                  aria-expanded={examplesExpanded}
                                >
                                  <span>
                                    {examplesExpanded ? "Hide" : "Show"} what got filtered ({lastScan.examples.length} example{lastScan.examples.length === 1 ? "" : "s"})
                                  </span>
                                  <ChevronRight
                                    className={cn(
                                      "h-3 w-3 transition-transform duration-200",
                                      examplesExpanded && "rotate-90",
                                    )}
                                  />
                                </button>
                                {examplesExpanded && (
                                  <ul className="mt-1.5 space-y-1.5">
                                    {lastScan.examples.map((ex, i) => (
                                      <li
                                        key={i}
                                        className="rounded-md border border-[#e4e7ed] bg-[#fafbfc] px-2 py-1.5"
                                      >
                                        <p className="truncate text-[11px] font-medium text-[#0e1729]">
                                          {ex.subject}
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#7a849a]">
                                          <span className="truncate">{ex.sender}</span>
                                          <span className="text-[#a8b0c0]">·</span>
                                          <span className={cn(
                                            "rounded px-1 py-px text-[9.5px] font-medium",
                                            ex.reason === "non_repliable"
                                              ? "bg-amber-100 text-amber-800"
                                              : "bg-[#1e2a4a]/10 text-[#1e2a44]",
                                          )}>
                                            {ex.reason === "non_repliable" ? "OTP / banking / no-reply" : "promo"}
                                          </span>
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {pendingRows.map((row) => {
                    const conf = row.confidence ?? 0;
                    const handled = isDemo ? demoHandledIds[row.id] : undefined;
                    const autoSentInDemo = isDemo && mode === "auto" && conf >= CONFIDENCE_THRESHOLDS.HIGH;
                    const manualInDemo = isDemo && mode === "manual";
                    const isResolved = handled || autoSentInDemo || manualInDemo;
                    return (
                      <div
                        key={row.id}
                        className={cn(
                          "group rounded-xl border p-3 transition-all",
                          handled === "approved"
                            ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                            : handled === "rejected"
                              ? "border-rose-500/30 bg-rose-500/[0.06] opacity-70"
                              : autoSentInDemo
                                ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                                : manualInDemo
                                  ? "border-[#e4e7ed] bg-[#fafbfc] opacity-80"
                                  : "border-[#e4e7ed] bg-white hover:border-[#d0d5de] hover:shadow-sm",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <ConfidenceBar value={row.confidence ?? null} />
                          {autoSentInDemo && !handled && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-500/30">
                              <Send className="h-3 w-3" />
                              Auto-sent
                            </span>
                          )}
                          {manualInDemo && !handled && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#7a849a]/15 px-2 py-0.5 text-[10px] font-medium text-[#1e2a44] ring-1 ring-[#d0d5de]">
                              <Eye className="h-3 w-3" />
                              Suggestion only
                            </span>
                          )}
                          {handled === "approved" && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </span>
                          )}
                          {handled === "rejected" && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-rose-500/30">
                              <XCircle className="h-3 w-3" />
                              Skipped
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-[#0e1729]">
                          {row.subject}
                        </p>
                        {row.reason && (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#4a5572]">
                            {row.reason}
                          </p>
                        )}
                        {!isResolved && (
                          <div className="mt-2.5 flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                if (isDemo) {
                                  setDemoHandledIds((prev) => ({ ...prev, [row.id]: "rejected" }));
                                  toast.message("Skipped (simulated)");
                                  return;
                                }
                                rejectMutation.mutate({
                                  executionId: row.id,
                                  reason: "Not appropriate",
                                });
                              }}
                              className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#4a5572] transition-colors hover:bg-[#f4f5f8] hover:text-[#0e1729] disabled:opacity-50"
                            >
                              Skip
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                if (isDemo) {
                                  setDemoHandledIds((prev) => ({ ...prev, [row.id]: "approved" }));
                                  toast.success("Approved (simulated send)");
                                  return;
                                }
                                approveMutation.mutate({ executionId: row.id });
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#1e2a4a] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-[#0d1530] hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve & send
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
            className="max-h-[85vh] w-[95vw] max-w-lg overflow-hidden border-[#e4e7ed] bg-white text-[#0e1729] p-0 gap-0"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Activity</DialogTitle>
              <DialogDescription>What Autopilot has done recently.</DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between gap-2 border-b border-[#e4e7ed] px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1e2a4a]/10 ring-1 ring-[#1e2a4a]/15">
                  <ScrollText className="h-3.5 w-3.5 text-[#1e2a44]" />
                </div>
                <h3 className="truncate text-[14px] font-semibold leading-tight">
                  Activity
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <select
                    aria-label="Filter by status"
                    className="h-8 appearance-none rounded-md border border-[#e4e7ed] bg-[#fafbfc] pl-2.5 pr-7 text-[12px] text-[#0e1729] outline-none transition-colors hover:border-[#d0d5de] focus:border-[#1e2a4a]/50"
                    value={logStatus}
                    onChange={(e) => {
                      setLogStatus(e.target.value as typeof logStatus);
                      setLogPage(0);
                      setSelectedExecutionId(null);
                    }}
                  >
                    <option value="">All</option>
                    <option value="awaiting_approval">Waiting on you</option>
                    <option value="success">Done</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Skipped</option>
                    <option value="pending">Working on it</option>
                    <option value="running">Running</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#4a5572]" />
                </div>
                <DialogClose
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#4a5572] transition-colors hover:bg-[#f4f5f8] hover:text-[#0e1729] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2a4a]/40"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </DialogClose>
              </div>
            </div>

            <div className="min-h-0 max-h-[60vh] overflow-y-auto px-3 py-3">
              {listExecutionsQuery.isLoading ? (
                <div className="flex items-center gap-2 rounded-xl border border-[#e4e7ed] bg-[#fafbfc] p-3 text-[12px] text-[#4a5572]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </div>
              ) : listExecutionsQuery.isError ? (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12px] text-rose-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Failed to load activity.
                </div>
              ) : executionRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#e4e7ed] bg-[#fafbfc] px-4 py-10 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-[#e4e7ed]">
                    <Inbox className="h-4 w-4 text-[#4a5572]" />
                  </div>
                  <p className="mt-1 text-[12px] font-semibold text-[#0e1729]">
                    Nothing here yet
                  </p>
                  <p className="max-w-[280px] text-[11px] leading-snug text-[#7a849a]">
                    {logStatus
                      ? "No activity matches this filter. Try another."
                      : "Once Autopilot starts working, every action shows up here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {executionRows.map((row) => {
                    const isOpen = selectedExecutionId === row.id;
                    const detail = isOpen ? selectedDetailQuery.data : null;
                    const detailLoading = isOpen && selectedDetailQuery.isLoading;
                    const detailError = isOpen && selectedDetailQuery.isError;
                    return (
                      <div
                        key={row.id}
                        className={cn(
                          "overflow-hidden rounded-xl border transition-all",
                          isOpen
                            ? "border-[#1e2a4a]/30 bg-[#fafbfc] shadow-sm"
                            : "border-[#e4e7ed] bg-white hover:border-[#d0d5de]",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowTechDetails(false);
                            setSelectedExecutionId(isOpen ? null : row.id);
                          }}
                          className="flex w-full items-center gap-3 p-3 text-left"
                          aria-expanded={isOpen}
                        >
                          <span
                            className={cn(
                              "mt-1 h-2 w-2 shrink-0 rounded-full",
                              row.status === "success"
                                ? "bg-emerald-500"
                                : row.status === "failed"
                                  ? "bg-rose-500"
                                  : row.status === "cancelled"
                                    ? "bg-[#a8b0c0]"
                                    : row.status === "awaiting_approval"
                                      ? "bg-amber-500"
                                      : "bg-sky-500",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold leading-snug text-[#0e1729]">
                              {row.thread?.subject ?? "(No subject)"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#4a5572]">
                              <span>{humanStatus(row.status)}</span>
                              <span className="mx-1.5 text-[#a8b0c0]">·</span>
                              <span>{relativeTime(row.createdAt)}</span>
                              {row.dryRun && (
                                <>
                                  <span className="mx-1.5 text-[#a8b0c0]">·</span>
                                  <span className="text-amber-700">Preview</span>
                                </>
                              )}
                            </p>
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 shrink-0 text-[#7a849a] transition-transform duration-200",
                              isOpen && "rotate-90",
                            )}
                          />
                        </button>

                        {isOpen && (
                          <div className="border-t border-[#e4e7ed] bg-white px-3 py-3">
                            {detailLoading ? (
                              <div className="flex items-center gap-2 text-[12px] text-[#4a5572]">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Loading detail…
                              </div>
                            ) : detailError || !detail ? (
                              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-[12px] text-rose-700">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Failed to load detail.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-[12px] leading-relaxed text-[#0e1729]">
                                  {detail.dryRun ? (
                                    <>
                                      VectorMail prepared a follow-up.{" "}
                                      <span className="font-semibold">Nothing was sent</span> - this is a preview.
                                    </>
                                  ) : (
                                    <>VectorMail prepared a follow-up, ready to be sent.</>
                                  )}
                                </p>

                                {detail.reason && (
                                  <p className="text-[12px] leading-relaxed text-[#4a5572]">
                                    <span className="font-semibold text-[#1e2a44]">Why: </span>
                                    {detail.reason}
                                  </p>
                                )}

                                {detail.confidence != null && (
                                  <div>
                                    <div className="mb-1 flex items-center justify-between text-[10.5px] text-[#4a5572]">
                                      <span>Confidence</span>
                                      <span className="font-semibold text-[#0e1729]">
                                        {Math.round(detail.confidence * 100)}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-[#e4e7ed]">
                                      <div
                                        className={cn(
                                          "h-full rounded-full transition-[width] duration-300",
                                          detail.confidence >= 0.75
                                            ? "bg-emerald-500"
                                            : detail.confidence >= 0.5
                                              ? "bg-amber-500"
                                              : "bg-rose-500",
                                        )}
                                        style={{ width: `${Math.round(detail.confidence * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {detail.retryCount > 0 && (
                                  <p className="text-[10.5px] text-[#7a849a]">
                                    Retried {detail.retryCount} time
                                    {detail.retryCount === 1 ? "" : "s"}.
                                  </p>
                                )}

                                {detail.lastError && (
                                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5">
                                    <p className="mb-1 text-[11.5px] font-semibold text-rose-700">
                                      Something went wrong
                                    </p>
                                    <p className="text-[11px] leading-relaxed text-rose-700/90">
                                      {detail.lastError}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      <button
                                        type="button"
                                        className="rounded-md px-2 py-1 text-[11px] font-medium text-rose-700 transition-colors hover:bg-rose-500/15"
                                        onClick={() => void handleScanNow()}
                                      >
                                        Try again
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded-md px-2 py-1 text-[11px] font-medium text-rose-700 transition-colors hover:bg-rose-500/15"
                                        onClick={() => {
                                          setGuardrailPaused(true);
                                          void setGuardrailsMutation.mutateAsync({
                                            accountId,
                                            paused: true,
                                            maxAutoSendsPerDay: Number.parseInt(guardrailCap, 10) || 5,
                                            blockedDomains: guardrailDomains
                                              .split(",")
                                              .map((v) => v.trim())
                                              .filter(Boolean),
                                            blockedSenderSubstrings: guardrailSenders
                                              .split(",")
                                              .map((v) => v.trim())
                                              .filter(Boolean),
                                          });
                                        }}
                                      >
                                        Pause Autopilot
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {detail.timeline.length > 0 && (
                                  <div>
                                    <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a849a]">
                                      What happened
                                    </h4>
                                    <ol className="relative space-y-2 border-l-2 border-[#e4e7ed] pl-3.5">
                                      {detail.timeline.map((t, idx) => (
                                        <li key={`${t.at}-${idx}`} className="relative">
                                          <span
                                            className={cn(
                                              "absolute -left-[1.05rem] top-0.5 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-white",
                                              t.kind === "audit"
                                                ? "bg-[#4a5572]"
                                                : t.status === "success"
                                                  ? "bg-emerald-500"
                                                  : t.status === "failed"
                                                    ? "bg-rose-500"
                                                    : "bg-sky-500",
                                            )}
                                          >
                                            {t.status === "success" ? (
                                              <CheckCircle2 className="h-2 w-2 text-white" />
                                            ) : t.status === "failed" ? (
                                              <XCircle className="h-2 w-2 text-white" />
                                            ) : null}
                                          </span>
                                          <p className="text-[12px] font-medium text-[#0e1729]">
                                            {humanTimelineLabel(t.label)}
                                          </p>
                                          <p className="text-[10.5px] text-[#7a849a]">
                                            {relativeTime(t.at)}
                                          </p>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setShowTechDetails((v) => !v)}
                                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-medium text-[#7a849a] transition-colors hover:bg-[#f4f5f8] hover:text-[#1e2a44]"
                                  aria-expanded={showTechDetails}
                                >
                                  <span className="flex items-center gap-1">
                                    {showTechDetails ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    Technical details
                                  </span>
                                </button>
                                {showTechDetails && (
                                  <div className="space-y-2 rounded-md border border-[#e4e7ed] bg-[#fafbfc] p-2.5">
                                    <div className="flex items-center justify-between gap-2 text-[10.5px]">
                                      <span className="text-[#7a849a]">Execution ID</span>
                                      <button
                                        type="button"
                                        onClick={() => void copyExecutionId(detail.id)}
                                        className="inline-flex max-w-[200px] items-center gap-1 truncate rounded border border-[#e4e7ed] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#1e2a44] hover:bg-[#f4f5f8]"
                                        title="Copy"
                                      >
                                        <span className="truncate">{detail.id}</span>
                                        <Copy className="h-2.5 w-2.5 shrink-0 text-[#7a849a]" />
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 text-[10.5px]">
                                      <span className="text-[#7a849a]">Raw status</span>
                                      <span className="font-mono text-[10px] text-[#1e2a44]">
                                        {detail.status}
                                      </span>
                                    </div>
                                    <details>
                                      <summary className="cursor-pointer text-[10.5px] text-[#7a849a] hover:text-[#1e2a44]">
                                        Payload
                                      </summary>
                                      <pre className="mt-1.5 max-h-[160px] overflow-auto rounded border border-[#e4e7ed] bg-white p-2 font-mono text-[9.5px] text-[#1e2a44]">
                                        {JSON.stringify(detail.payload, null, 2)}
                                      </pre>
                                    </details>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {executionRows.length > 0 && logTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#e4e7ed] px-4 py-2 text-[11px] text-[#4a5572]">
                <span className="tabular-nums">
                  {logPage + 1} / {logTotalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={logPage <= 0}
                    onClick={() => {
                      setLogPage((p) => Math.max(0, p - 1));
                      setSelectedExecutionId(null);
                    }}
                    className="rounded-md px-2 py-1 text-[#1e2a44] transition-colors hover:bg-[#f4f5f8] disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={!listExecutionsQuery.data?.hasMore}
                    onClick={() => {
                      setLogPage((p) => p + 1);
                      setSelectedExecutionId(null);
                    }}
                    className="rounded-md px-2 py-1 text-[#1e2a44] transition-colors hover:bg-[#f4f5f8] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-md border-[#e4e7ed] bg-white text-[#0e1729]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[14px]">
                <Settings className="h-4 w-4 text-[#1e2a4a]" />
                Autopilot settings
              </DialogTitle>
              <DialogDescription className="text-[12px] text-[#4a5572]">
                Guardrails apply across all modes.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-[#e4e7ed] bg-[#fafbfc] px-3 py-2.5">
                <div>
                  <p className="text-[12px] font-semibold text-[#0e1729]">
                    Status
                  </p>
                  <p className="text-[10.5px] text-[#7a849a]">
                    Pause stops Autopilot from queuing or sending anything.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGuardrailPaused((v) => !v)}
                  className={cn(
                    "inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-semibold transition-colors",
                    guardrailPaused
                      ? "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/30 hover:bg-rose-500/20"
                      : "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20",
                  )}
                >
                  {guardrailPaused ? "Paused" : "Active"}
                </button>
              </div>

              <div className="rounded-lg border border-[#e4e7ed] bg-[#fafbfc] p-3">
                <label
                  htmlFor="ap-cap"
                  className="mb-1 flex items-center justify-between text-[11px] text-[#1e2a44]"
                >
                  <span className="font-semibold">Daily send limit</span>
                  <span className="text-[10px] text-[#7a849a]">max real auto-sends</span>
                </label>
                <input
                  id="ap-cap"
                  value={guardrailCap}
                  onChange={(e) => setGuardrailCap(e.target.value)}
                  inputMode="numeric"
                  className="h-9 w-full rounded-md border border-[#e4e7ed] bg-white px-2.5 text-[13px] text-[#0e1729] outline-none focus:border-[#1e2a4a]/50 focus:ring-1 focus:ring-[#1e2a4a]/20"
                />
              </div>

              <div className="rounded-lg border border-[#e4e7ed] bg-[#fafbfc] p-3">
                <label
                  htmlFor="ap-domains"
                  className="mb-1 flex items-center justify-between text-[11px] text-[#1e2a44]"
                >
                  <span className="font-semibold">Never auto-reply to</span>
                  <span className="text-[10px] text-[#7a849a]">domains, comma-separated</span>
                </label>
                <textarea
                  id="ap-domains"
                  value={guardrailDomains}
                  onChange={(e) => setGuardrailDomains(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-md border border-[#e4e7ed] bg-white px-2.5 py-1.5 text-[12px] text-[#0e1729] outline-none focus:border-[#1e2a4a]/50 focus:ring-1 focus:ring-[#1e2a4a]/20"
                  placeholder="example.com, vendor.io"
                />
              </div>

              <div className="rounded-lg border border-[#e4e7ed] bg-[#fafbfc] p-3">
                <label
                  htmlFor="ap-senders"
                  className="mb-1 flex items-center justify-between text-[11px] text-[#1e2a44]"
                >
                  <span className="font-semibold">Skip senders containing</span>
                  <span className="text-[10px] text-[#7a849a]">substring, comma-separated</span>
                </label>
                <textarea
                  id="ap-senders"
                  value={guardrailSenders}
                  onChange={(e) => setGuardrailSenders(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-md border border-[#e4e7ed] bg-white px-2.5 py-1.5 text-[12px] text-[#0e1729] outline-none focus:border-[#1e2a4a]/50 focus:ring-1 focus:ring-[#1e2a4a]/20"
                  placeholder="noreply@, do-not-reply"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[12px]"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 bg-[#1e2a4a] px-3 text-[12px] text-white hover:bg-[#0d1530]"
                disabled={busy}
                onClick={async () => {
                  await saveGuardrails();
                  if (!setGuardrailsMutation.error) setSettingsOpen(false);
                }}
              >
                {setGuardrailsMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={walkthroughOpen}
          onOpenChange={(next) => {
            setWalkthroughOpen(next);
            if (!next) setWalkthroughStep(0);
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="max-w-[640px] overflow-hidden border-[#e4e7ed] bg-white p-0 text-[#0e1729]"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Autopilot walkthrough</DialogTitle>
              <DialogDescription>
                Five-frame walkthrough of how Autopilot turns a brief into a sent reply.
              </DialogDescription>
            </DialogHeader>
            <AutopilotWalkthrough
              step={walkthroughStep}
              onStep={setWalkthroughStep}
              onClose={() => {
                setWalkthroughOpen(false);
                setWalkthroughStep(0);
              }}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
          <DialogContent className="max-w-md border-[#e4e7ed] bg-white text-[#0e1729]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[14px]">
                <AlertTriangle className="h-4 w-4 text-text-[#1e2a4a]" />
                Confirm Auto mode
              </DialogTitle>
              <DialogDescription className="text-[12px] text-[#4a5572]">
                Auto-send can send high-confidence follow-ups on your behalf.
                Daily cap is currently <span className="font-semibold text-[#0e1729]">{capFromPrefs}</span>; you can adjust or pause anytime from settings.
              </DialogDescription>
            </DialogHeader>
            <label className="mt-2 flex items-start gap-2 text-[12px] text-[#1e2a44]">
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
                className="h-8 bg-[#1e2a4a] px-3 text-[11px] text-white hover:bg-[#0d1530]"
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

