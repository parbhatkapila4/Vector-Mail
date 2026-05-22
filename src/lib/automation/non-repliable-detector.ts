export type NonRepliableResult = {
  skip: boolean;
  reason: string | null;
};

const AUTOMATED_LOCALPART_SUBSTRINGS = [
  "noreply",
  "no-reply",
  "no_reply",
  "donotreply",
  "do-not-reply",
  "do_not_reply",
  "noresponse",
  "no-response",
  "mailer-daemon",
  "auto-reply",
  "autoreply",
  "auto-confirm",
  "auto-notify",
];

const AUTOMATED_LOCALPART_TOKENS = [
  "notify",
  "notifications",
  "notification",
  "alerts",
  "alert",
  "postmaster",
  "bounces",
  "bounce",
  "automated",
  "transactional",
  "transactions",
  "statements",
  "newsletter",
  "newsletters",
];

function localpartHasAutomatedToken(localpart: string): boolean {
  for (const token of AUTOMATED_LOCALPART_TOKENS) {
    if (localpart === token) return true;
    const re = new RegExp(`(^|[._\\-])${token}([._\\-]|$)`, "i");
    if (re.test(localpart)) return true;
  }
  return false;
}

const AUTOMATED_DOMAIN_PREFIX_PATTERN =
  /^(mail|mailing|mailer|email|e|em|notify|notifications?|alerts?|news|newsletter|info|services?|comms|crm|loyalty|marketing|promo|promotions|transactions?|transactional|bounces?|reply|return|delivery|shipping|orders|receipts|billing|account|accounts|secure|security|auth|verify|verification|noreply|no-reply|t)\./;

const TRANSACTIONAL_SUBJECT_PATTERNS: RegExp[] = [
  /\b(otp|one[- ]?time[- ]?password|one[- ]?time[- ]?code)\b/i,
  /\b(verification|security|sign[- ]?in|login|access|auth(?:orization)?|confirm(?:ation)?) code\b/i,
  /\b(your )?(login|verification|sign[- ]?in|access|otp|2fa|one[- ]?time) code (is|was)\b/i,
  /\bcode (is|for|to)\b.*\b(verify|verification|login|sign[- ]?in)\b/i,
  /\b(your )?code:?\s*\d{4,10}\b/i,
  /\byour login code is\b/i,
  /\bverify (your|the) (email|account|identity|address|phone|number|sign[- ]?in|sign[- ]?up)\b/i,
  /\bconfirm (your|the) (email|account|identity|address|phone|number|sign[- ]?up|registration|signup|subscription)\b/i,
  /\b2[- ]?fa\b/i,
  /\btwo[- ]?factor\b/i,
  /\btwo[- ]?step\s+verification\b/i,

  /\b(transaction|payment|debit|credit|fund|funds)\s+(alert|notification|notice|received|confirmed|failed|declined?|processed|reversed|debited|credited|posted)\b/i,
  /\b(account|card)\s+(statement|update|alert|summary|activity|balance)\b/i,
  /\bdebit\s+card\s+(statement|alert|notification|transaction|charged|expired|expiring|update|blocked|swiped|used)\b/i,
  /\bcredit\s+card\s+(statement|alert|notification|transaction|charged|expired|expiring|update|blocked|bill|due)\b/i,
  /\byour\s+(statement|invoice|receipt|bill|payment|transaction)\s+(is|was|for|of|from|has)\b/i,
  /\bview\s*:\s*(account|card|statement|transaction)\b/i,
  /\b(amount|sum)\s+(debited|credited|received|paid|withdrawn|deducted)\b/i,
  /\b(rs|inr|usd|eur|gbp|aud|cad|sgd)\.?\s*[\d,]+(?:\.\d+)?\s+(debited|credited|paid|received|transferred|deducted|charged|spent|withdrawn|refunded)\b/i,
  /\b(debited|credited|paid|received|transferred|deducted|charged|spent|withdrawn|refunded)\s+(rs|inr|usd|eur|gbp|aud|cad|sgd)\.?\s*[\d,]+/i,

  /\b(order|delivery|shipping|tracking|shipment)\s+(confirmation|update|notification|placed|shipped|delivered|out for delivery|dispatched|in transit)\b/i,
  /\byour\s+(order|delivery|package|shipment|receipt|invoice|tracking|parcel)\b/i,
  /\b(invoice|receipt|order)\s*[#:]?\s*\d/i,
  /\breceipt:?\s*for\b/i,

  /\b(password|email|phone|mobile)\s+(has been\s+|was\s+)?(changed|reset|updated|verified|confirmed|set)\b/i,
  /\b(new|unusual|suspicious)\s+(sign[- ]?in|login|activity|access|device|location)\b/i,
  /\bsecurity\s+(alert|notification|warning|notice)\b/i,
  /\bwelcome\s+to\b/i,
  /\bgetting\s+started\s+with\b/i,
  /\b(subscription|trial|membership)\s+(?:is\s+|has\s+|was\s+|will\s+)?(renewed|expiring|expir(?:es|ed)|cancell?ed|active|started|ended)\b/i,
  /\bunsubscribe\b/i,

  /\b(job\s+match|job\s+alert|new\s+opportunities\s+for\s+you|jobs\s+for\s+you)\b/i,
  /\b\d+\s+new\s+jobs?\b/i,
];

const AUTOMATED_BODY_PATTERNS: RegExp[] = [
  /\bdo\s+not\s+reply\s+to\s+this\s+(email|message|mail)\b/i,
  /\bplease\s+do\s+not\s+reply\s+to\s+this\b/i,
  /\bthis\s+(is|was)\s+(an\s+)?(auto(matic)?|automated|system[- ]?generated|computer[- ]?generated)\b/i,
  /\bsent\s+automatically\b/i,
  /\bunmonitored\s+(mailbox|inbox)\b/i,
  /\bnot\s+(actively\s+)?monitored\b/i,
  /\bfor\s+(help|assistance|support|queries|questions),\s+(please\s+)?(contact|visit|call|email|reach\s+out\s+to)\b/i,
  /\bthis\s+email\s+was\s+sent\s+from\s+a\s+notification[- ]only\s+address\b/i,
];

function isAutomatedSenderAddress(addr: string): boolean {
  const lower = addr.toLowerCase().trim();
  if (!lower) return true;
  const atIdx = lower.lastIndexOf("@");
  if (atIdx <= 0 || atIdx === lower.length - 1) return false;

  const localpart = lower.slice(0, atIdx);
  const domain = lower.slice(atIdx + 1);

  for (const keyword of AUTOMATED_LOCALPART_SUBSTRINGS) {
    if (localpart.includes(keyword)) return true;
  }

  if (localpartHasAutomatedToken(localpart)) return true;

  if (AUTOMATED_DOMAIN_PREFIX_PATTERN.test(domain)) return true;

  return false;
}

function matchesTransactionalSubject(subject: string): boolean {
  for (const pattern of TRANSACTIONAL_SUBJECT_PATTERNS) {
    if (pattern.test(subject)) return true;
  }
  return false;
}

function matchesAutomatedBody(bodyHead: string): boolean {
  for (const pattern of AUTOMATED_BODY_PATTERNS) {
    if (pattern.test(bodyHead)) return true;
  }
  return false;
}

export function isNonRepliable(opts: {
  senderAddress: string | null | undefined;
  subject: string | null | undefined;
  bodySnippet: string | null | undefined;
  body?: string | null | undefined;
}): NonRepliableResult {
  const senderAddress = opts.senderAddress?.trim() ?? "";

  if (!senderAddress) {
    return { skip: true, reason: "missing_sender" };
  }

  if (isAutomatedSenderAddress(senderAddress)) {
    return { skip: true, reason: "automated_sender" };
  }

  const subject = (opts.subject ?? "").trim();
  if (subject && matchesTransactionalSubject(subject)) {
    return { skip: true, reason: "transactional_subject" };
  }

  const bodyHead = (opts.body ?? opts.bodySnippet ?? "").slice(0, 800).trim();
  if (bodyHead && matchesAutomatedBody(bodyHead)) {
    return { skip: true, reason: "automated_body" };
  }

  return { skip: false, reason: null };
}
