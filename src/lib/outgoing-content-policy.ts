export type OutgoingPolicyResult =
  | { ok: false; reason: string }
  | { ok: true };

const PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  { regex: /\bnigg(?:er|a)s?\b/i, reason: "a racial slur" },
  { regex: /\bfaggots?\b/i, reason: "a homophobic slur" },
  { regex: /\btrann(?:y|ies)\b/i, reason: "a transphobic slur" },
  { regex: /\bkikes?\b/i, reason: "an anti-semitic slur" },
  { regex: /\bspics?\b/i, reason: "an ethnic slur" },
  { regex: /\bchinks?\b/i, reason: "an ethnic slur" },
  { regex: /\bretards?\b/i, reason: "an ableist slur" },
  { regex: /\bkill\s+yourself\b/i, reason: "a threat" },
  { regex: /\bkys\b/i, reason: "a threat" },
  { regex: /\bi(?:'ll|\s+will)\s+kill\s+you\b/i, reason: "a death threat" },
  { regex: /\bi(?:'ll|\s+will)\s+(?:hurt|harm|murder)\b/i, reason: "a threat" },
  { regex: /\bgo\s+(?:and\s+)?die\b/i, reason: "a threat" },
  { regex: /\bdeath\s+to\s+[a-z]/i, reason: "incitement language" },
  { regex: /\bbomb\s+(?:threat|the\s+)/i, reason: "a violent threat" },
  { regex: /\bshoot\s+up\s+(?:the|a)\b/i, reason: "a violent threat" },
  { regex: /\brape\b/i, reason: "sexual violence" },
  { regex: /\bmolest\b/i, reason: "sexual violence" },

  {
    regex: /\b(?:child\s+porn(?:ography)?|csam|cp\s+video)\b/i,
    reason: "child-exploitation material",
  },
  {
    regex: /\bbuy\s+(?:cocaine|heroin|meth|fentanyl|crack)\b/i,
    reason: "illegal drug trade",
  },
  {
    regex: /\bsell\s+(?:cocaine|heroin|meth|fentanyl|crack)\b/i,
    reason: "illegal drug trade",
  },
  { regex: /\bhire\s+(?:a\s+)?hit\s*man\b/i, reason: "incitement to violence" },
  {
    regex: /\bstolen\s+(?:credit\s+card|ssn|social\s+security|identity)\b/i,
    reason: "fraud-related content",
  },
  { regex: /\bfake\s+passport\b/i, reason: "fraud-related content" },
];

function stripTags(input: string): string {
  return input.replace(/<[^>]+>/g, " ");
}

export function containsOutgoingViolation(text: string): OutgoingPolicyResult {
  if (!text) return { ok: true };
  const normalised = stripTags(text);
  for (const { regex, reason } of PATTERNS) {
    if (regex.test(normalised)) return { ok: false, reason };
  }
  return { ok: true };
}

export class OutgoingContentBlockedError extends Error {
  readonly code = "OUTGOING_CONTENT_BLOCKED" as const;
  readonly reason: string;
  readonly field: "subject" | "body";

  constructor(field: "subject" | "body", reason: string) {
    super(
      `Outgoing content blocked: the ${field} contains ${reason}, which violates the VectorMail usage policy.`,
    );
    this.name = "OutgoingContentBlockedError";
    this.field = field;
    this.reason = reason;
  }
}

export function isOutgoingContentBlockedError(
  err: unknown,
): err is OutgoingContentBlockedError {
  return (
    err instanceof OutgoingContentBlockedError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { code?: unknown }).code === "OUTGOING_CONTENT_BLOCKED")
  );
}

export function enforceOutgoingPolicy(opts: {
  subject: string;
  body: string;
}): void {
  const subjectCheck = containsOutgoingViolation(opts.subject ?? "");
  if (!subjectCheck.ok) {
    throw new OutgoingContentBlockedError("subject", subjectCheck.reason);
  }
  const bodyCheck = containsOutgoingViolation(opts.body ?? "");
  if (!bodyCheck.ok) {
    throw new OutgoingContentBlockedError("body", bodyCheck.reason);
  }
}
