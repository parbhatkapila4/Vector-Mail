import type { Prisma } from "@prisma/client";

export const DEFAULT_MAX_AUTO_SENDS_PER_DAY = 5;
export const MAX_ALLOWED_AUTO_SENDS_PER_DAY = 50;

export type AutomationGuardrails = {
  paused: boolean;
  maxAutoSendsPerDay: number;
  blockedDomains: string[];
  blockedSenderSubstrings: string[];
  autoConsentAcknowledgedAt: string | null;
  autoConsentGuardrailsHash: string | null;
};

function uniq(values: string[]): string[] {
  return [...new Set(values)];
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^@+/, "");
}

function normalizeSubstring(value: string): string {
  return value.trim().toLowerCase();
}

function clampCap(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_MAX_AUTO_SENDS_PER_DAY;
  }
  const n = Math.floor(value);
  if (n < 1) return 1;
  if (n > MAX_ALLOWED_AUTO_SENDS_PER_DAY) return MAX_ALLOWED_AUTO_SENDS_PER_DAY;
  return n;
}

export function normalizeAutomationGuardrails(
  raw: Prisma.JsonValue | null | undefined,
): AutomationGuardrails {
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const paused = obj.paused === true;
  const maxAutoSendsPerDay = clampCap(obj.maxAutoSendsPerDay);
  const blockedDomains = Array.isArray(obj.blockedDomains)
    ? uniq(
        obj.blockedDomains
          .filter((v): v is string => typeof v === "string")
          .map(normalizeDomain)
          .filter(Boolean),
      )
    : [];
  const blockedSenderSubstrings = Array.isArray(obj.blockedSenderSubstrings)
    ? uniq(
        obj.blockedSenderSubstrings
          .filter((v): v is string => typeof v === "string")
          .map(normalizeSubstring)
          .filter(Boolean),
      )
    : [];
  const autoConsentObj =
    obj.autoConsent &&
    typeof obj.autoConsent === "object" &&
    !Array.isArray(obj.autoConsent)
      ? (obj.autoConsent as Record<string, unknown>)
      : null;
  const autoConsentAcknowledgedAt =
    autoConsentObj && typeof autoConsentObj.acknowledgedAt === "string"
      ? autoConsentObj.acknowledgedAt
      : null;
  const autoConsentGuardrailsHash =
    autoConsentObj && typeof autoConsentObj.guardrailsHash === "string"
      ? autoConsentObj.guardrailsHash
      : null;
  return {
    paused,
    maxAutoSendsPerDay,
    blockedDomains,
    blockedSenderSubstrings,
    autoConsentAcknowledgedAt,
    autoConsentGuardrailsHash,
  };
}

export function toGuardrailsJson(
  guardrails: AutomationGuardrails,
): Prisma.InputJsonValue {
  return {
    paused: guardrails.paused,
    maxAutoSendsPerDay: guardrails.maxAutoSendsPerDay,
    blockedDomains: guardrails.blockedDomains,
    blockedSenderSubstrings: guardrails.blockedSenderSubstrings,
    autoConsent: {
      acknowledgedAt: guardrails.autoConsentAcknowledgedAt,
      guardrailsHash: guardrails.autoConsentGuardrailsHash,
    },
  } as Prisma.InputJsonValue;
}

export function blockReasonForSender(
  senderAddress: string,
  guardrails: AutomationGuardrails,
): string | null {
  const sender = senderAddress.trim().toLowerCase();
  if (!sender) return null;
  const domain = sender.includes("@") ? sender.slice(sender.lastIndexOf("@") + 1) : "";
  if (domain && guardrails.blockedDomains.includes(domain)) {
    return "blocked_domain";
  }
  for (const piece of guardrails.blockedSenderSubstrings) {
    if (piece && sender.includes(piece)) {
      return "blocked_sender_substring";
    }
  }
  return null;
}

