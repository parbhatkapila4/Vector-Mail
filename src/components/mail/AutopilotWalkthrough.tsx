"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONFIDENCE_THRESHOLDS } from "@/lib/automation/policy";

const WALKTHROUGH_STEPS = [
  {
    eyebrow: "Frame 01",
    title: "A signal worth surfacing",
    body:
      "Inbox Brain reads the conversation, your past commitments, and what's at stake. When something matters, it lands in your daily brief - not buried in a folder.",
  },
  {
    eyebrow: "Frame 02",
    title: "Drafted, scored, queued",
    body:
      "Autopilot writes a reply privately, scores it against your guardrails, and queues it here. The thread, the reasoning, and the confidence are all visible before anything leaves.",
  },
  {
    eyebrow: "Frame 03",
    title: "One click. Or zero.",
    body: `In Assist, you approve every send. In Auto, anything above ${Math.round(CONFIDENCE_THRESHOLDS.HIGH * 100)}% confidence ships within your daily cap - the rest still ask. You stay in control of the line.`,
  },
  {
    eyebrow: "Frame 04",
    title: "The send is recorded",
    body:
      "Every approved action is logged with the prompt, the model output, the recipient, and the exact time. In demo, nothing actually leaves your outbox.",
  },
  {
    eyebrow: "Frame 05",
    title: "Counters, audit, replay",
    body:
      "Daily counters refresh in real time. The automation log gives you full audit history - replay, retry, or revoke anything. No magic, just transparency.",
  },
] as const;

const MONO = "var(--font-jetbrains-mono), ui-monospace, monospace";
const SERIF = "var(--font-newsreader), Georgia, serif";
const NAVY_GRADIENT = "linear-gradient(180deg, #1e2a4a 0%, #0d1530 100%)";
const GOLD_RING = "rgba(184,138,63,0.18)";
const GOLD_BORDER_BTN = "1px solid #b88a3f";
const NAVY_SHADOW = "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 6px rgba(212,169,85,0.25)";

export function AutopilotWalkthrough({
  step,
  onStep,
  onClose,
}: {
  step: number;
  onStep: (n: number) => void;
  onClose: () => void;
}) {
  const total = WALKTHROUGH_STEPS.length;
  const current = WALKTHROUGH_STEPS[Math.min(step, total - 1)]!;
  const isLast = step >= total - 1;
  const isFirst = step <= 0;

  return (
    <div className="flex max-h-[88vh] flex-col">
      <div
        className="flex items-center justify-between gap-3 border-b px-5 py-3.5"
        style={{ borderColor: GOLD_RING }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: NAVY_GRADIENT, boxShadow: NAVY_SHADOW }}
          >
            <PlayCircle className="h-3.5 w-3.5 text-[#f5ebd9]" />
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5b554c]"
            style={{ fontFamily: MONO }}
          >
            Autopilot · Walkthrough
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#5b554c] transition-colors hover:bg-[#f4f5f8] hover:text-[#1a1612]"
          aria-label="Close walkthrough"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b88a3f]"
              style={{ fontFamily: MONO }}
            >
              {current.eyebrow}
            </span>
            <h3
              className="mt-2 text-[22px] leading-[1.15] tracking-[-0.012em] text-[#1a1612]"
              style={{ fontFamily: SERIF, fontWeight: 500 }}
            >
              {current.title}
            </h3>
            <p
              className="mt-3 text-[12.5px] leading-[1.55] text-[#3a4258]"
              style={{ letterSpacing: "-0.002em" }}
            >
              {current.body}
            </p>
          </div>
          <div
            className="flex min-h-[200px] items-center justify-center rounded-lg border bg-[#fafbfc] p-4"
            style={{ borderColor: GOLD_RING }}
          >
            <WalkthroughScene step={step} />
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3 border-t px-5 py-3"
        style={{ borderColor: GOLD_RING }}
      >
        <div className="flex items-center gap-1.5">
          {WALKTHROUGH_STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onStep(i)}
              aria-label={`Go to frame ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-[#1e2a4a]" : "w-1.5 bg-[#d0c8b6] hover:bg-[#b88a3f]/60",
              )}
            />
          ))}
          <span
            className="ml-2 text-[10px] font-semibold tracking-[0.12em] text-[#5b554c]"
            style={{ fontFamily: MONO }}
          >
            {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-[11.5px] text-[#3a4258] hover:bg-[#f4f5f8] hover:text-[#1a1612] disabled:opacity-40"
            disabled={isFirst}
            onClick={() => onStep(Math.max(0, step - 1))}
          >
            <ChevronLeft className="mr-0.5 h-3.5 w-3.5" />
            Back
          </Button>
          {isLast ? (
            <Button
              type="button"
              size="sm"
              className="h-8 px-3.5 text-[11.5px] text-[#f5ebd9] hover:opacity-90"
              style={{ background: NAVY_GRADIENT, border: GOLD_BORDER_BTN, boxShadow: NAVY_SHADOW }}
              onClick={onClose}
            >
              Got it
              <CheckCircle2 className="ml-1 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-[11.5px] text-[#f5ebd9] hover:opacity-90"
              style={{ background: NAVY_GRADIENT, border: GOLD_BORDER_BTN, boxShadow: NAVY_SHADOW }}
              onClick={() => onStep(Math.min(total - 1, step + 1))}
            >
              Next
              <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function WalkthroughScene({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="w-full max-w-[320px] space-y-2">
        <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#5b554c]" style={{ fontFamily: MONO }}>
          Today&apos;s brief
        </div>
        <div className="space-y-1.5">
          <div className="rounded-md border border-[#e4e7ed] bg-white px-3 py-2">
            <p className="text-[11px] font-semibold text-[#1a1612]">SaaStr conference confirmation</p>
            <p className="text-[10px] text-[#5b554c]">Deadline tomorrow · 1 reply unlocks the slot</p>
          </div>
          <div
            className="rounded-md border-2 px-3 py-2"
            style={{
              borderColor: "#b88a3f",
              background: "rgba(245,235,217,0.6)",
              boxShadow: "0 4px 12px rgba(184,138,63,0.18)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-[#1a1612]">Founderloop pilot</p>
              <span
                className="rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-[#1a1612]"
                style={{ background: "rgba(184,138,63,0.25)" }}
              >
                Surfaced
              </span>
            </div>
            <p className="text-[10px] text-[#5b554c]">You said you&apos;d reply Tuesday · 2 days quiet</p>
          </div>
          <div className="rounded-md border border-[#e4e7ed] bg-white px-3 py-2 opacity-70">
            <p className="text-[11px] font-semibold text-[#1a1612]">Notion partnership</p>
            <p className="text-[10px] text-[#5b554c]">Quarter locks Friday</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="w-full max-w-[320px] space-y-2">
        <div
          className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.16em] text-[#5b554c]"
          style={{ fontFamily: MONO }}
        >
          <span>Awaiting approval</span>
          <span className="text-[#b88a3f]">1 NEW</span>
        </div>
        <div className="rounded-md border-2 px-3 py-2.5" style={{ borderColor: "#1e2a4a", background: "rgba(30,42,74,0.04)" }}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold text-[#1a1612]">Founderloop pilot</p>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-500/30">
              92%
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#5b554c]">
            Founder said you&apos;d reply by Tuesday; thread has gone two days quiet.
          </p>
          <div className="mt-2 rounded border border-[#e4e7ed] bg-white p-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#5b554c]" style={{ fontFamily: MONO }}>
              Drafted reply
            </p>
            <p className="mt-1 text-[10px] italic leading-snug text-[#3a4258]" style={{ fontFamily: SERIF }}>
              &quot;Hey Alex - sorry for the delay. Sending the architecture overview by EOD...&quot;
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="w-full max-w-[320px] space-y-2">
        <div className="rounded-md border-2 px-3 py-2.5" style={{ borderColor: "#1e2a4a", background: "rgba(30,42,74,0.04)" }}>
          <p className="text-[11px] font-semibold text-[#1a1612]">Founderloop pilot</p>
          <p className="mt-0.5 text-[10px] text-[#5b554c]">Confidence 92% · Assist mode</p>
          <div className="mt-2.5 flex items-center justify-end gap-1.5">
            <button
              type="button"
              className="h-7 rounded-md px-2.5 text-[10px] font-medium text-[#3a4258] hover:bg-[#f4f5f8]"
            >
              Reject
            </button>
            <div
              className="relative inline-flex h-7 items-center rounded-md px-3 text-[10px] font-semibold text-[#f5ebd9]"
              style={{
                background: NAVY_GRADIENT,
                border: GOLD_BORDER_BTN,
                boxShadow: "0 0 0 3px rgba(184,138,63,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              Approve
              <span className="absolute -right-1 -top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b88a3f] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#b88a3f]" />
              </span>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] italic text-[#5b554c]" style={{ fontFamily: SERIF }}>
          One click - or zero, in Auto.
        </p>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="w-full max-w-[320px] space-y-2">
        <div
          className="rounded-md border px-3 py-2.5"
          style={{ borderColor: "rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.06)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold text-[#1a1612]">Founderloop pilot</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Sent · simulated
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#5b554c]">10:42 · alex@founderloop.com</p>
          <div
            className="mt-2 rounded border bg-white p-2 text-[10px] leading-snug text-[#3a4258]"
            style={{ borderColor: "rgba(16,185,129,0.3)", fontFamily: SERIF, fontStyle: "italic" }}
          >
            &quot;Hey Alex - sorry for the delay. Sending the architecture overview by EOD with the cluster diagram and cost notes.&quot;
          </div>
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#5b554c]" style={{ fontFamily: MONO }}>
          Audit trail captured
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[320px] space-y-2">
      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#5b554c]" style={{ fontFamily: MONO }}>
        Autopilot · today
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Sent", value: 5, tone: "text-emerald-700" },
          { label: "Pending", value: 2, tone: "text-[#1e2a4a]" },
          { label: "Failed", value: 0, tone: "text-[#9aa0a6]" },
        ].map(({ label, value, tone }) => (
          <div key={label} className="rounded-md border border-[#e4e7ed] bg-white p-2">
            <p className="text-[8px] font-bold uppercase tracking-wide text-[#5b554c]" style={{ fontFamily: MONO }}>
              {label}
            </p>
            <p className={cn("mt-0.5 text-[18px] font-bold leading-none", tone)}>{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-[#e4e7ed] bg-white p-2.5">
        <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#5b554c]" style={{ fontFamily: MONO }}>
          Recent log
        </div>
        <div className="space-y-1">
          {[
            { label: "Founderloop pilot", status: "success · 10:42", tone: "text-emerald-700" },
            { label: "Notion partnership", status: "success · 09:18", tone: "text-emerald-700" },
            { label: "Acme MSA redline", status: "awaiting · 08:55", tone: "text-[#1e2a4a]" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-[10px]">
              <span className="text-[#1a1612]">{row.label}</span>
              <span className={row.tone}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
