<div align="center">

<img src="public/Red Midern Wings Box Delivery Logo.png" alt="VectorMail Logo" width="80" height="80" />

# VectorMail

**AI-powered email client with semantic search and smart composition.**

One app: connect Gmail (via Aurinko), sync threads, search by meaning (pgvector), and compose or reply with AI. Built for developers who want a single codebase for inbox, search, and AI—without a separate vector store.

[Demo](https://vectormail.space) · [Documentation](#quick-start) · [API](#api-reference)

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=flat-square)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791?style=flat-square&logo=postgresql)](https://postgresql.org/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)](https://clerk.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Overview

**The average professional spends a large share of their workweek on email**—searching, reading, writing, and organizing. Traditional clients are keyword-bound; AI features are often bolted on. VectorMail is built for how we work today: one stack (Next.js, tRPC, Prisma, PostgreSQL + pgvector), one auth (Clerk), one email gateway (Aurinko for Gmail/M365), and optional AI (OpenRouter/Gemini) for summaries, compose, and semantic search.

We use PostgreSQL with the pgvector extension for embeddings so we don’t run a separate vector store. Sync is delta-token–driven where possible; first sync and empty-inbox cases trigger a full window sync. The app is designed to run as a single deployment (e.g. Vercel) with a Postgres DB; cron is used only for scheduled sends.

---

## Core Capabilities

### Inbox & threads

Thread list (inbox, sent, archive, trash, snoozed, reminders), infinite scroll, and first-time automatic sync after account connect. Threads are stored per account; `getThreads` is tab-filtered (inboxStatus, sentStatus, draftStatus, sysLabels). Bulk actions: mark read/unread, archive, delete (move to trash); multi-select with optional keyboard shortcut (`x` to toggle selection).

| Tab       | Filter / behavior                                      |
| --------- | ------------------------------------------------------ |
| inbox     | `inboxStatus: true`, snoozed/reminder filters          |
| sent      | `sentStatus: true`, inboxStatus: false                 |
| archive   | inboxStatus: false, no trash label                     |
| trash     | emails.sysLabels has "trash"                           |
| snoozed   | inboxStatus: true, snoozedUntil > now                  |
| reminders | remindAt ≤ now, lastMessageDate ≤ remindIfNoReplySince |

### Search

Semantic search over emails: query is embedded (Gemini 768-dim), compared to `Email.embedding` with pgvector `<=>`, scoped by `accountId`. Fallback to text search when embedding is missing or empty. Results are deduplicated and scored by relevance.

### AI

Summaries and classifications (e.g. promotions, social) stored on `Email`; optional AI compose and “chat with inbox” via OpenRouter/Gemini. We use OpenRouter for a single client to multiple models; embeddings are Gemini. No training on user data.

### Integrations

**Aurinko (email)**

- **Features:** OAuth connect (Gmail), sync (delta + full window), send, labels (inbox, sent, trash, unread).
- **Setup:** 1) Create Aurinko app, set redirect to `/api/aurinko/callback`. 2) Set `AURINKO_CLIENT_ID`, `AURINKO_CLIENT_SECRET`; `NEXT_PUBLIC_URL` for redirect. 3) Connect from UI; callback upserts account and runs initial sync (delta token + syncLatestEmails).
- **Endpoints:** `GET /api/aurinko/callback` (OAuth callback, then redirect to `/mail`).

**Clerk (auth)**

- **Features:** Sign-in/sign-up, session, protected routes (`/mail`, `/buddy`).
- **Setup:** 1) Create Clerk application. 2) Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. 3) Middleware protects `/mail(.*)` and `/buddy(.*)`; tRPC uses `ctx.auth.userId` for protected procedures.

**Scheduled sends (cron)**

- **Features:** Process due `ScheduledSend` rows; send via tRPC or REST payload.
- **Endpoints:** `GET|POST /api/cron/process-scheduled-sends` — auth: `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>`.

---

## Quick Start

1. **Clone and install**

   ```bash
   git clone https://github.com/parbhatkapila4/Vector-Mail.git
   cd Vector-Mail
   npm install
   ```

2. **Environment**  
   Copy `.env.example` to `.env.local` if present; otherwise create `.env.local` and add the variables listed under [Environment Variables](#environment-variables).

3. **Database**

   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   App runs at [http://localhost:3000](http://localhost:3000). Sign in with Clerk, connect Gmail via Aurinko, then open Inbox (first sync runs automatically when thread list is empty).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION                                                   │
│  Next.js 15 (App Router) · React 19 · Tailwind · Radix · Jotai  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION                                                    │
│  tRPC (account, post routers) · Clerk (auth) · React Query      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────┐
│  SERVICES                                                          │
│  lib/accounts (sync, Aurinko) · lib/sync-to-db · lib/vector-search │
│  lib/embedding (Gemini) · lib/email-analysis · OpenRouter (AI)     │
└────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  DATA                                                           │
│  PostgreSQL 16+ · Prisma · pgvector (Email.embedding)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

Core models (Prisma): `User`, `Account` (per-provider token and delta token), `Thread` (inbox/sent/draft/snooze/remind flags), `Email` (labels, summary, optional `vector(768)` embedding), `EmailAddress`, `EmailAttachment`, `ScheduledSend`.

```prisma
model Account {
  id                String    @id @default(cuid())
  userId            String
  token             String    @unique
  provider          String
  nextDeltaToken    String?
  needsReconnection Boolean   @default(false)
  user              User      @relation(...)
  threads           Thread[]
  scheduledSends     ScheduledSend[]
}

model Thread {
  id              String    @id @default(cuid())
  subject         String
  lastMessageDate DateTime
  accountId       String
  inboxStatus     Boolean   @default(true)
  sentStatus      Boolean   @default(false)
  draftStatus     Boolean   @default(false)
  snoozedUntil    DateTime?
  remindAt        DateTime?
  remindIfNoReplySince DateTime?
  emails          Email[]
  account         Account   @relation(...)
}

model Email {
  id                 String    @id @default(cuid())
  threadId           String
  internetMessageId  String    @unique
  sysLabels          String[]
  sysClassifications String[]
  summary            String?
  embedding          Unsupported("vector(768)")?
  thread             Thread    @relation(...)
  from               EmailAddress @relation(...)
  to                 EmailAddress[] @relation(...)
  // ... cc, bcc, replyTo, attachments
}
```

---

## Technology Decisions

| Component     | Choice                  | Rationale                                                     |
| ------------- | ----------------------- | ------------------------------------------------------------- |
| Framework     | Next.js 15 (App Router) | RSC, API routes, single deploy; Turbopack for dev.            |
| API           | tRPC                    | End-to-end types, one client for queries/mutations.           |
| Auth          | Clerk                   | OAuth, MFA, session; minimal custom code.                     |
| DB            | PostgreSQL + Prisma     | One DB for app + vectors via pgvector; no separate vector DB. |
| Vectors       | pgvector 768-dim        | Gemini embedding size; index for cosine distance.             |
| Email gateway | Aurinko                 | Single API for Gmail (and M365); delta sync, send, labels.    |
| AI            | OpenRouter + Gemini     | One client for chat/compose; Gemini for embeddings.           |

---

## Design Philosophy

**PostgreSQL + pgvector, no separate vector store.** We keep embeddings on `Email` and query with `<=>` so one database handles threads, metadata, and search. That reduces ops and keeps consistency (e.g. thread scoping) in SQL.

**Account-scoped everything.** All tRPC procedures that touch threads or emails resolve the account via `authoriseAccountAccess(accountId, ctx.auth.userId)`. Sync, search, and bulk actions are per-account; no cross-tenant leakage.

**Delta-first sync, full window when needed.** We use Aurinko delta tokens for incremental sync. When inbox is empty or we have no token, we run a full-window sync (e.g. 60-day). First connect triggers sync in the OAuth callback and again on the client if the list is still empty (one-time auto first sync).

**Sync lock per account.** `lib/accounts` uses an in-process `syncLocks` map so only one sync runs per account at a time. Duplicate requests wait on the same promise. At scale we’d replace this with a distributed lock (e.g. Redis).

---

## Engineering Constraints & Tradeoffs

**Sync frequency vs provider rate limits.** We sync on user action (e.g. “Sync” button) and once automatically after first connect. We don’t poll in the background; that keeps us within Aurinko/Google limits and avoids unnecessary load. Heavier usage would need backoff and possibly a queue.

**Accuracy vs latency in search.** Vector search is best-effort: we embed the query and take top-k by distance. If embeddings are missing (e.g. backfill not run), we fall back to text search. We prefer fast, good-enough results over blocking until every email is embedded.

**Optional AI.** OpenRouter and Gemini keys are optional. The app works for connect, sync, and list without them; search degrades to text, and compose/summaries require keys. That keeps the default deploy simple and cost-controlled.

**Embeddings backfill.** New or historical emails may not have `embedding` set. We have backfill tooling; production would run it as a job and/or on a schedule. Until then, semantic search only covers embedded emails.

**Non-determinism from LLMs.** Summaries and AI compose depend on external APIs; outputs can vary. We don’t cache LLM responses in the README scope; at scale we’d consider caching for idempotent operations and clear TTLs.

---

## Local Development

**Prerequisites**

- Node.js 20+
- PostgreSQL 16+ with pgvector extension
- npm, yarn, or bun

**Setup**

1. Clone the repo and install dependencies (see [Quick Start](#quick-start)).
2. Copy `.env.example` to `.env.local` and set required variables.
3. Run `npm run db:push` then `npm run db:generate`.
4. Run `npm run dev`.

App runs at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

**Required (example)**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/vectormail"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_URL="http://localhost:3000"
# Aurinko (Gmail connect)
AURINKO_CLIENT_ID="..."
AURINKO_CLIENT_SECRET="..."
```

**Optional**

```bash
# AI (OpenRouter for chat/compose; Gemini for embeddings)
OPENROUTER_API_KEY="..."
GEMINI_API_KEY="..."

# Enable outbound send (default false)
ENABLE_EMAIL_SEND="true"

# Cron for scheduled sends; must match caller secret
CRON_SECRET="your-random-secret"

# Skip env validation (e.g. CI)
SKIP_ENV_VALIDATION="1"
```

Secrets: Clerk and Aurinko keys in env (or Vercel/project env). Per-account tokens are stored in the database (`Account.token`). No user-facing “API keys”; auth is session-based (Clerk).

---

## API Reference

**Auth:** All tRPC procedures under the account router that need a user use `protectedProcedure`; context is created with Clerk’s `auth()`. The client sends the session (e.g. Clerk’s default with Next.js); no separate API key.

**Key procedures (account router)**

| Method / type | Procedure / route                          | Description                                              |
| ------------- | ------------------------------------------ | -------------------------------------------------------- |
| query         | `getAccounts`                              | List accounts for current user.                          |
| query         | `getThreads`                               | Paginated threads (tab, cursor).                         |
| query         | `getThreadById`                            | Single thread with emails.                               |
| mutation      | `syncEmails`                               | Trigger sync (accountId, folder, forceFullSync, cursor). |
| mutation      | `bulkMarkRead` / `bulkMarkUnread`          | Bulk read/unread.                                        |
| mutation      | `bulkArchiveThreads` / `bulkDeleteThreads` | Bulk archive or move to trash.                           |
| mutation      | `scheduleSend` / `cancelScheduledSend`     | Schedule or cancel send.                                 |

**Example (getThreads)**

```json
// Input
{ "accountId": "...", "tab": "inbox", "important": false, "unread": false, "limit": 15, "cursor": null }

// Response (shape)
{ "threads": [...], "nextCursor": "..." | undefined, "syncStatus": { "success": true, "count": 0 }, "source": "database" }
```

**Cron (scheduled sends)**

- **Auth:** `Authorization: Bearer <CRON_SECRET>` or header `x-cron-secret: <CRON_SECRET>`.
- **Route:** `GET` or `POST` `/api/cron/process-scheduled-sends`.
- **Behavior:** Fetches pending `ScheduledSend` rows where `scheduledAt <= now`, sends each (REST or tRPC payload), updates status. Requires `ENABLE_EMAIL_SEND=true` and `CRON_SECRET` set.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Route handlers: aurinko/callback, cron, trpc, chat, email/send, etc.
│   ├── mail/               # Inbox app (ThreadList, ThreadDisplay)
│   └── buddy/              # AI chat-with-inbox
├── components/
│   ├── mail/               # Mail UI: ThreadList, ReplyBox, SnoozeMenu, RemindMenu, ComposeEmailGmail
│   ├── ui/                  # shadcn-style primitives
│   └── landing/             # Marketing/landing pages
├── server/api/             # tRPC: trpc.ts (context, protectedProcedure), routers/account.ts, post
├── lib/                    # Core logic
│   ├── accounts.ts         # Aurinko client, sync (delta + full), performInitialSync
│   ├── sync-to-db.ts       # Upsert emails/threads, recalculate thread status
│   ├── vector-search.ts    # pgvector search + text fallback
│   ├── embedding.ts        # Gemini 768-dim embeddings
│   └── aurinko.ts          # OAuth, token exchange
├── hooks/                  # useThreads, use-inbox, use-mobile
├── contexts/               # PendingSendContext
└── env.js                  # T3 env schema (DATABASE_URL, CRON_SECRET, etc.)
```

---

## Testing

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run test`      | Jest unit tests (watch). |
| `npm run test:ci`   | Jest with coverage.      |
| `npm run test:e2e`  | Playwright E2E.          |
| `npm run typecheck` | `tsc --noEmit`.          |
| `npm run lint`      | Next.js ESLint.          |

Tests: `src/__tests__/` (components, lib); E2E in repo root (e.g. `e2e/`).

---

## Deployment

**Vercel (recommended)**  
Connect the repo, set env vars, deploy. Use Vercel Cron or an external scheduler to hit `/api/cron/process-scheduled-sends` every minute if you use scheduled sends; set `CRON_SECRET` and match it in the scheduler.

**Docker**

```bash
docker-compose up -d
```

Runs the app and PostgreSQL (with pgvector). Configure env via `.env` or Docker env.

---

## Security

- **Auth:** Clerk; protected routes and tRPC `protectedProcedure`; no anonymous access to mail data.
- **Scoping:** All thread/email access is gated by `authoriseAccountAccess(accountId, ctx.auth.userId)`.
- **Headers:** Middleware sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP, HSTS.
- **Cron:** Scheduled-send route requires `CRON_SECRET`; no user token.
- **Validation:** Inputs validated with Zod on tRPC; no raw user input in SQL.

---

## Performance

| Concern     | Approach                                                                |
| ----------- | ----------------------------------------------------------------------- |
| Thread list | Infinite query (cursor), React Query cache; refetch on sync invalidate. |
| Search      | pgvector index on `Email.embedding`; limit top-k; fallback to text.     |
| Sync        | One sync at a time per account (in-process lock); delta when possible.  |
| AI          | Optional; no RSC streaming in README scope; at scale we’d cache/queue.  |

Indexes (Prisma): `Thread` (accountId, lastMessageDate, inboxStatus, snoozedUntil, remindAt); `Email` (threadId, emailLabel, sentAt). pgvector uses distance index for `<=>`.

---

## Production Lessons

**First sync and empty inbox:** Users often saw “0 conversations” after connecting because the OAuth callback did a lightweight sync (e.g. delta only) and new accounts had no token. We added an automatic first sync on the client when the thread list loads empty (once per account/session) and a clear “Syncing your inbox…” state so users know sync is in progress.

**Hooks order:** We had a “Rendered more hooks than during the previous render” error when a `useCallback` (e.g. for keyboard shortcut) was defined after early returns (loading, scheduled tab, no account). We moved all hooks above any conditional return so the hook count is stable every render.

**Thread status consistency:** getThreads and sync both derive inbox/sent/draft from emails and labels. We had edge cases where thread flags were out of sync with email sysLabels. We added `recalculateAllThreadStatuses` after sync and defensive fixes in getThreads (e.g. fallback when zero inbox threads but total threads exist).

**Sync lock:** Duplicate sync requests (e.g. double-click or fast navigation) used to run in parallel and could hit rate limits or duplicate work. We introduced a per-account promise lock in `lib/accounts` so concurrent callers share one sync run.

---

## If Running at Scale

**Sync:** Move from in-process lock to a distributed lock (e.g. Redis) and/or a job queue (e.g. Bull, Inngest). One worker per account (or per shard) to avoid thundering herd.

**Search:** Keep pgvector; add read replicas for search-heavy traffic. Consider partitioning `Email` by `accountId` or time if a single table grows very large.

**AI:** Queue summarization and embedding backfill; use a worker pool and rate limits per provider. Cache idempotent LLM responses where safe.

**Observability:** Add tracing (e.g. OpenTelemetry) on tRPC and Aurinko calls; log sync duration and error rates per account. Alert on `needsReconnection` spikes or cron failures.

**Cost:** Monitor OpenRouter/Gemini usage; cap per-user or per-tenant if needed. Sync and embedding jobs are the main levers.

---

## Impact on Engineering Teams

**Onboarding:** One README and one stack (Next, tRPC, Prisma, Clerk, Aurinko). New devs run `db:push`, set env, and hit `/mail`; no separate vector service or auth server to run.

**Code reviews:** tRPC procedures and types are in one place; reviewers can follow account scoping and sync flow without hunting across services. Bulk actions and first-sync logic live in a few files (ThreadList, account router).

**Documentation:** This README doubles as a technical spec: data model, auth, sync strategy, and tradeoffs are explicit. Design philosophy and production lessons reduce “why did we do it this way?” questions.

---

## The Problem We Solve

> **The average professional spends 28% of their workweek on email.** That's 11+ hours searching, reading, writing, and organizing. Time that should go to actual work.

Traditional email clients were built for the 1990s. VectorMail is built for how we work today.

---

## Why VectorMail?

<table>
<tr>
<td width="50%">

### Semantic Search That Actually Works

Search by **meaning**, not just keywords. Ask "emails about the budget meeting last month" and actually find them. Powered by vector embeddings and pgvector.

</td>
<td width="50%">

### AI That Understands Context

Every email gets an intelligent summary, automatic categorization, and smart tagging. Know what's important at a glance without reading everything.

</td>
</tr>
<tr>
<td width="50%">

### Write Emails in Seconds

Describe what you want to say, and our AI composes it with the right tone, context from previous conversations, and your writing style.

</td>
<td width="50%">

### Chat With Your Inbox

"Show me all receipts from last quarter" or "Find the email where John mentioned the deadline." Natural language meets your inbox.

</td>
</tr>
</table>

---

## Key Features

<details open>
<summary><strong> AI-Powered Intelligence</strong></summary>
<br />

| Feature                 | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Smart Summaries**     | Every email automatically summarized with key points, action items, and context |
| **Intelligent Tagging** | AI categorizes emails as urgent, informational, promotional, or action-required |
| **Vector Embeddings**   | 768-dimensional embeddings for each email enable true semantic understanding    |
| **Priority Detection**  | Automatically surfaces what matters and deprioritizes noise                     |

</details>

<details open>
<summary><strong> Next-Gen Search</strong></summary>
<br />

| Feature               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| **Semantic Search**   | Find emails by meaning, not exact words               |
| **Natural Language**  | Search like you'd ask a colleague                     |
| **Relevance Scoring** | Results ranked by actual importance, not just recency |
| **Instant Results**   | Sub-100ms search across thousands of emails           |

</details>

<details open>
<summary><strong> AI Composition</strong></summary>
<br />

| Feature                   | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| **Context-Aware Writing** | AI reads the thread and writes appropriate responses |
| **Tone Adjustment**       | Professional, casual, or custom—match any situation  |
| **One-Click Replies**     | Generate complete, thoughtful responses instantly    |
| **Smart Suggestions**     | Real-time writing assistance as you type             |

</details>

<details>
<summary><strong>Productivity Dashboard</strong></summary>
<br />

| Feature                    | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| **Email Analytics**        | Track response times, volume patterns, and productivity |
| **Communication Insights** | Understand who you email most and when                  |
| **Action Item Tracking**   | Never miss a follow-up or commitment                    |

</details>

<details>
<summary><strong>Enterprise-Ready Security</strong></summary>
<br />

| Feature                  | Description                                         |
| ------------------------ | --------------------------------------------------- |
| **Clerk Authentication** | Enterprise-grade auth with MFA, SSO support         |
| **Data Encryption**      | Encryption for stored data                          |
| **Privacy First**        | Your data stays yours—we don't train on your emails |
| **SOC 2 Ready**          | Built with compliance requirements in mind          |

</details>

---

##  Tech Stack

| Category     | Technologies                                                            |
| ------------ | ----------------------------------------------------------------------- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Radix UI |
| **Backend**  | tRPC, Prisma ORM, PostgreSQL 16+, pgvector                              |
| **AI/ML**    | Google Gemini (embeddings), OpenRouter (chat/compose)                   |
| **Auth**     | Clerk (OAuth, MFA, Session Management)                                  |
| **Email**    | Aurinko API (Google, Microsoft 365)                                     |
| **Testing**  | Jest, React Testing Library, Playwright                                 |
| **DevOps**   | Docker, GitHub Actions                                                  |

---

## Docker Deployment

```bash
docker-compose up -d
```

This spins up PostgreSQL with pgvector and the VectorMail application with auto-configured networking.

---

## Available Scripts

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start development server with Turbopack |
| `npm run build`     | Build for production                    |
| `npm run start`     | Start production server                 |
| `npm run lint`      | Run ESLint                              |
| `npm run typecheck` | Run TypeScript type checking            |
| `npm run test`      | Run unit tests (watch mode)             |
| `npm run test:ci`   | Run tests with coverage                 |
| `npm run test:e2e`  | Run Playwright E2E tests                |
| `npm run db:studio` | Open Prisma Studio                      |

---

## Pricing

| Plan           | Price    | Features                                                    |
| -------------- | -------- | ----------------------------------------------------------- |
| **Basic**      | Free     | 5 AI summaries/day, basic search, single account            |
| **Pro**        | $9.99/mo | Unlimited AI, advanced search, 5 accounts, priority support |
| **Enterprise** | $60/mo   | Everything + custom AI training, SSO, dedicated support     |

[View Full Pricing →](https://vectormail.space/pricing)

---

##  Roadmap

- [x] **Semantic Search** - Vector-based email search
- [x] **AI Summaries** - Automatic email summarization
- [x] **AI Compose** - Context-aware email writing
- [x] **Multi-Account** - Support for multiple email accounts
- [ ] **Mobile App** - iOS & Android native apps
- [ ] **Calendar Integration** - Smart scheduling from emails
- [ ] **Team Workspaces** - Shared inboxes & collaboration
- [ ] **Plugins/Extensions** - CRM, Slack, Notion integrations
- [ ] **On-Premise** - Self-hosted enterprise deployment

---

## Contributing

We welcome contributions. VectorMail is open source and community-driven.

```bash
# 1. Fork the repo
git clone https://github.com/YOUR_USERNAME/Vector-Mail.git

# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes and commit
git commit -m "feat: add amazing feature"

# 4. Push and open a PR
git push origin feature/amazing-feature
```

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## Support

- **Documentation:** [Quick Start](#quick-start), [API Reference](#api-reference)
- **Bug reports:** [GitHub Issues](https://github.com/parbhatkapila4/Vector-Mail/issues)
- **Feature requests:** [GitHub Discussions](https://github.com/parbhatkapila4/Vector-Mail/issues)
- **Email:** [parbhat@parbhat.dev](mailto:parbhat@parbhat.dev)

---

## Acknowledgments

- [T3 Stack](https://create.t3.gg/) — Full-stack TypeScript starter
- [shadcn/ui](https://ui.shadcn.com/) — Accessible components
- [Aurinko](https://www.aurinko.io/) — Unified email API
- [OpenAI](https://openai.com/) & [Google Gemini](https://deepmind.google/technologies/gemini/) — AI capabilities

---

## License

VectorMail is open-source software licensed under the [MIT License](LICENSE).

---

<div align="center">

**VectorMail** - _Email, reimagined with AI_

Built by [Parbhat Kapila](https://github.com/parbhatkapila4)

[Website](https://vectormail.space/) · [GitHub](https://github.com/parbhatkapila4/Vector-Mail) · [Twitter](https://x.com/Parbhat03)

If VectorMail helped you, consider giving it a star on GitHub.

[![GitHub Stars](https://img.shields.io/github/stars/parbhatkapila4/Vector-Mail?style=flat-square&logo=github&color=yellow)](https://github.com/parbhatkapila4/Vector-Mail)

</div>
