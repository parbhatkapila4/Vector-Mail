import { emailBodyToPlainTextForDraft } from "@/lib/automation/draft-plain-text";

export const AUTOMATION_DRAFT_MAX_SUBJECT_CHARS = 240;
export const AUTOMATION_DRAFT_MAX_BODY_CHARS = 24_000;

const HIGH_RISK_PATTERNS: RegExp[] = [
  /\bwire\s+transfer\b/i,
  /\bwestern\s+union\b/i,
  /\bgift\s+card\b/i,
  /\bcrypto\s+wallet\b/i,
  /\bvenmo\b.*\b(send|transfer)\b/i,
  /\bpassword\b/i,
  /\bpassphrase\b/i,
  /\b2fa\b.*\b(code|disable)\b/i,
  /\bignore\s+(all\s+)?(previous|prior)\s+instructions\b/i,
  /\bdisregard\s+(all\s+)?(previous|prior)\s+instructions\b/i,
  /\bignore\s+the\s+above\b/i,
  /\bnew\s+instructions\s*:/i,
  /\bsystem\s*prompt\b/i,
  /\bdeveloper\s+mode\b/i,
];

export type AutomationDraftSafetyResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export function validateAutomationDraft(params: {
  draftSubject: string;
  draftBodyPlain: string;
}): AutomationDraftSafetyResult {
  const subject = params.draftSubject.trim();
  const body = params.draftBodyPlain.trim();

  if (!subject) {
    return { ok: false, code: "empty_subject", message: "Draft subject is empty" };
  }
  if (!body) {
    return { ok: false, code: "empty_body", message: "Draft body is empty" };
  }
  if (subject.length > AUTOMATION_DRAFT_MAX_SUBJECT_CHARS) {
    return {
      ok: false,
      code: "subject_too_long",
      message: `Draft subject exceeds ${AUTOMATION_DRAFT_MAX_SUBJECT_CHARS} characters`,
    };
  }
  if (body.length > AUTOMATION_DRAFT_MAX_BODY_CHARS) {
    return {
      ok: false,
      code: "body_too_long",
      message: `Draft body exceeds ${AUTOMATION_DRAFT_MAX_BODY_CHARS} characters`,
    };
  }

  const haystack = emailBodyToPlainTextForDraft(`${subject}\n${body}`).toLowerCase();
  for (const re of HIGH_RISK_PATTERNS) {
    if (re.test(haystack)) {
      return {
        ok: false,
        code: "high_risk_pattern",
        message: "Draft matched a blocked safety pattern",
      };
    }
  }

  return { ok: true };
}
