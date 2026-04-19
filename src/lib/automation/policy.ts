import type { AutomationMode } from "@prisma/client";

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.6,
} as const;

export type ConfidenceBand = "HIGH" | "MEDIUM" | "LOW";

export function bandForConfidence(confidence: number | null | undefined): ConfidenceBand {
  const c = typeof confidence === "number" && Number.isFinite(confidence) ? confidence : 0;
  if (c >= CONFIDENCE_THRESHOLDS.HIGH) return "HIGH";
  if (c >= CONFIDENCE_THRESHOLDS.MEDIUM) return "MEDIUM";
  return "LOW";
}

export function decisionForModeAndConfidence(mode: AutomationMode, confidence: number | null | undefined): {
  status: "pending" | "awaiting_approval" | "cancelled";
  band: ConfidenceBand;
} {
  const band = bandForConfidence(confidence);
  if (mode === "manual") {
    return { status: "cancelled", band };
  }
  if (mode === "assist") {
    return { status: "awaiting_approval", band };
  }
  if (band === "HIGH") return { status: "pending", band };
  if (band === "MEDIUM") return { status: "awaiting_approval", band };
  return { status: "cancelled", band };
}

