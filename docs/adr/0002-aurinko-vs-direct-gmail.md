# ADR 0002 - Aurinko as the email gateway, not direct Gmail API

**Date:** 2026-04-04  •  **Status:** Accepted

## Context

VectorMail connects to user Gmail accounts to read, send, and label messages.
Two options:

1. **Direct Gmail API** via Google's OAuth + `gmail.googleapis.com`.
2. **Aurinko** as a unified email gateway that proxies Gmail (and M365) and
   provides delta-sync primitives, label normalization, and a single REST
   surface.

Direct Gmail is "free" in dollars but expensive in engineering time and
compliance. Highlights:

- **Google CASA assessment** is required for restricted scopes (read/modify
  on user mail). The cheapest tier costs ~$15k and renews annually. For a
  pre-revenue product this is hard to justify.
- Quota management is per-user-per-second; building back-pressure across
  thousands of users is non-trivial.
- Gmail's history-API-based delta sync is finicky; it's the kind of code
  that breaks at the edges and you only find out when a user complains
  about missing messages.

## Decision

We use **Aurinko**. They handle the OAuth flow, take on the CASA exposure,
and expose stable delta tokens. Our `src/lib/accounts.ts` is built around
their primitives.

## Consequences

**Pros**

- We can ship a working Gmail integration without paying CASA up-front.
- One adapter handles Gmail and M365 - Outlook support is mostly free
  later.
- Delta token semantics are stable; resync edge cases are Aurinko's problem
  to debug, not ours.
- Send + label normalization are handled.

**Cons**

- Vendor risk. If Aurinko changes pricing aggressively or has an outage,
  the entire product is offline.
- Per-message cost. Aurinko's pricing scales with volume; at large scale
  the math eventually flips toward direct Gmail.
- We can't access every Gmail-specific feature (e.g. some advanced filter
  primitives) without falling back to direct API calls anyway.

## What we will reconsider

- If our user count crosses ~10k connected mailboxes - direct Gmail starts
  paying back the CASA fee.
- If Aurinko's reliability or pricing materially shifts.
- For features that require Gmail-only primitives Aurinko doesn't expose
  (push notifications, certain advanced filters), we may go direct for
  those paths only.
