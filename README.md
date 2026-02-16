<div align="center">

<img src="public/Vector-Mail-Logo.png" alt="VectorMail Logo" width="80" height="80" />

# VectorMail

**AI-powered email client with semantic search and smart composition.**

One app: connect Gmail (via Aurinko), sync threads, search by meaning (pgvector), and compose or reply with AI. Built for developers who want a single codebase for inbox, search, and AI without a separate vector store.

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

**The average professional spends a large share of their workweek on email**: searching, reading, writing, and organizing. Traditional clients are keyword-bound; AI features are often bolted on. VectorMail is built for how we work today: one stack (Next.js, tRPC, Prisma, PostgreSQL + pgvector), one auth (Clerk), one email gateway (Aurinko for Gmail/M365), and optional AI (OpenRouter/Gemini) for summaries, compose, and semantic search.

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

**Keyboard shortcuts**: Gmail-style navigation: `j` / `k` or ↑ / ↓ (next/previous thread), `e` (archive), `#` (delete/trash), `c` (compose), `r` (reply), `/` (focus search), `g` then `i` (go to Inbox), `g` then `s` (go to Sent), `?` (show shortcut help), `Esc` (close thread or help). `x` toggles selection for the current thread (bulk actions). `⌘+N` / `Alt+N` opens Buddy (AI chat). Shortcuts are disabled while typing in inputs.

### Compose, reply & forward

- **Compose & reply**: Rich editor with optional **open tracking** (1×1 pixel in HTML body) and **scheduled send** (date + 24h time picker). Send can be delayed with **undo send**: after sending, a toast offers “Undo” for a few seconds to cancel the actual send.
- **Forward**: Forward emails with optional recipients, subject/body edit, **track opens**, and **schedule send** (same scheduling and tracking as compose).

### Snooze & reminders

- **Snooze Presets**: Later today (6 PM), Tomorrow (9 AM), Next week (Monday 9 AM); or custom date and time (24-hour). Threads reappear in inbox at the chosen time.
- **Remind**: “Remind if no reply” with presets: 1, 3, 5, or 7 days; reminder fires when `remindAt` is reached and there’s been no new message since. Clear reminder from the reminders tab.

### Email open tracking

Optional per-message open tracking: when “Track opens” is enabled for a send (compose, reply, or forward), a tracking pixel is injected into the HTML body. When the recipient opens the email, `GET /api/track/open?id=<trackingId>` is requested; the first hit is stored (`EmailOpen`: `openedAt`, `userAgent`, `ip`). Use `getEmailOpenByMessageId` (tRPC) to check open status by message ID.

### Search

Semantic search over emails: query is embedded (Gemini 768-dim), compared to `Email.embedding` with pgvector `<=>`, scoped by `accountId`. Fallback to text search when embedding is missing or empty. Results are deduplicated and scored by relevance. **Intent detection** classifies natural-language queries (e.g. “summarize the first email”, “open the third result”) into SEARCH, SUMMARIZE, or SELECT and can extract position or date for a better UX. **Conversational summaries** support length preferences (short/medium/long/auto) and optional user phrasing.

### AI

Summaries and classifications (e.g. promotions, social) stored on `Email`; optional AI compose and “chat with inbox” via OpenRouter/Gemini. We use OpenRouter for a single client to multiple models; embeddings are Gemini. No training on user data.

**Per-user rate limits** (at route/procedure boundary only; inbox, sync, getThreads not limited): Search 60/min, AI 100/min. Over limit → 429 with `Retry-After` and `X-RateLimit-Remaining`.

**AI usage tracking:** Token usage per user is stored in `AiUsage` (operation: chat, compose, summary, embedding, buddy). Optional daily cap via `AI_DAILY_CAP_TOKENS` (env); if set, over-cap returns 429 "Daily AI limit reached". Apply DB: `npx prisma generate` then `npm run db:push` (or migrate).

### Integrations

**Aurinko (email)**

- **Features:** OAuth connect (Gmail), sync (delta + full window), send, labels (inbox, sent, trash, unread).
- **Setup:** 1) Create Aurinko app, set redirect to `/api/aurinko/callback`. 2) Set `AURINKO_CLIENT_ID`, `AURINKO_CLIENT_SECRET`; `NEXT_PUBLIC_URL` for redirect. 3) Connect from UI; callback upserts account and runs initial sync (delta token + syncLatestEmails).
- **Endpoints:** `GET /api/aurinko/callback` (OAuth callback, then redirect to `/mail`).

**Clerk (auth)**

- **Features:** Sign-in/sign-up, session, protected routes (`/mail`, `/buddy`).
- **Setup:** 1) Create Clerk application. 2) Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. 3) Middleware protects `/mail(.*)` and `/buddy(.*)`; tRPC uses `ctx.auth.userId` for protected procedures.

**Scheduled sends (cron) & background job queue (Inngest)**

- **Features:** Process due `ScheduledSend` rows; send via tRPC or REST payload (supports `trackOpens` in payload). **Background jobs:** Embedding/email analysis and scheduled sends run as Inngest jobs (no separate worker process). Sync and inbox do not depend on the queue; if the queue is down, sync and getThreads still work.
- **Endpoints:** `GET|POST /api/cron/process-scheduled-sends`: auth: `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>`. Cron fetches due rows and **enqueues** one job per row; the Inngest worker runs the existing send logic. `GET|POST|PUT /api/inngest`: Inngest serve endpoint (register functions and run jobs).
- **Job types:** `email/analyze` (payload: `emailId` or `emailIds`), `scheduled-send/process` (payload: `scheduledSendId`), optional `email/analyze-account` (payload: `accountId`, `limit`) after sync.
- **Setup:** Use [Inngest Cloud](https://www.inngest.com) or run `npx inngest-cli@latest dev` locally. Set `INNGEST_EVENT_KEY` (and `INNGEST_SIGNING_KEY` in production) in env.

**Email open tracking**

- **Endpoint:** `GET /api/track/open?id=<trackingId>`: returns 1×1 transparent GIF and records first open (openedAt, userAgent, ip). No auth; ID is unguessable.

**Health & search (HTTP)**

- **Health:** `GET /api/health` — returns `{ status, database, version }`; 503 if DB unreachable.
- **Search:** `GET /api/email/search?q=<query>&accountId=<id>`: Clerk auth; same vector + text search as tRPC, returns results and timing.

**Dodo Payments (billing)**

- **Features:** Optional subscriptions via Dodo Payments; `create-checkout` API (Dodo checkout), Dodo webhook at `/api/webhook/dodo` for payment/subscription events; subscription status stored in DB. Clerk webhook for user sync is separate. Billing data uses legacy table/field names in the schema (`StripeSubscription`, `User.stripeSubscriptionId`).

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

Core models (Prisma): `User`, `Account` (per-provider token and delta token), `Thread` (inbox/sent/draft/snooze/remind flags), `Email` (labels, summary, optional `vector(768)` embedding), `EmailAddress`, `EmailAttachment`, `ScheduledSend`, `EmailOpen` (open tracking: trackingId, messageId, openedAt, userAgent, ip). Optional billing (Dodo Payments): `StripeSubscription`, `User.stripeSubscriptionId` (legacy/internal names); optional usage: `ChatbotInteraction`.

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

**Sync lock per account.** `lib/accounts` uses an distributed lock (Redis when REDIS_URL is set, else in-memory per process) so only one sync runs per account at a time. Duplicate requests wait on the same promise. At scale we’d replace this with a distributed lock (e.g. Redis).

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

# Inngest (background jobs: embedding/analysis, scheduled sends)
# INNGEST_EVENT_KEY — for sending events (optional in dev)
# INNGEST_SIGNING_KEY — for Inngest Cloud to invoke your app (production)

# Skip env validation (e.g. CI)
SKIP_ENV_VALIDATION="1"
```

**Full reference (grouped)**

All variables the app reads are listed below. Required vs optional is for a minimal run (inbox, sync, list); AI, scheduled sends, and admin features need additional vars.

| Variable                            | Required | Purpose                                                                                                                                                          |
| ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth (Clerk)**                    |          |                                                                                                                                                                  |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk publishable key for sign-in/sign-up.                                                                                                                       |
| `CLERK_SECRET_KEY`                  | Yes      | Clerk secret key for server-side auth.                                                                                                                           |
| `CLERK_WEBHOOK_SECRET`              | No       | Secret for Clerk webhook (e.g. user sync); only if using webhook.                                                                                                |
| **App URL**                         |          |                                                                                                                                                                  |
| `NEXT_PUBLIC_URL`                   | Yes      | Base URL of the app (e.g. `http://localhost:3000`); used for OAuth redirect (Aurinko), OpenRouter Referer, and links.                                            |
| **Database**                        |          |                                                                                                                                                                  |
| `DATABASE_URL`                      | Yes      | PostgreSQL connection string. Must use a DB with pgvector extension.                                                                                             |
| **Email (Aurinko)**                 |          |                                                                                                                                                                  |
| `AURINKO_CLIENT_ID`                 | Yes      | Aurinko OAuth client ID for Gmail connect.                                                                                                                       |
| `AURINKO_CLIENT_SECRET`             | Yes      | Aurinko OAuth client secret.                                                                                                                                     |
| **Redis (sync lock)**               |          |                                                                                                                                                                  |
| `REDIS_URL`                         | No       | Redis connection URL (TCP). When set, sync lock is distributed across instances. Omit for single-instance (in-memory lock).                                      |
| `UPSTASH_REDIS_REST_URL`            | No       | Upstash Redis REST URL. Alternative to `REDIS_URL`; preferred with Upstash.                                                                                      |
| `UPSTASH_REDIS_REST_TOKEN`          | No       | Upstash Redis REST token. Use with `UPSTASH_REDIS_REST_URL`.                                                                                                     |
| **Queue (Inngest)**                 |          |                                                                                                                                                                  |
| `INNGEST_EVENT_KEY`                 | No       | Inngest event key for sending events. Required for scheduled sends and embedding/analysis jobs to run via Inngest.                                               |
| `INNGEST_SIGNING_KEY`               | No       | Inngest signing key for production; required for Inngest Cloud to invoke your app.                                                                               |
| **AI**                              |          |                                                                                                                                                                  |
| `OPENROUTER_API_KEY`                | No       | OpenRouter API key for chat, compose, and summaries. Omit to disable those features; search falls back to text.                                                  |
| `GEMINI_API_KEY`                    | No       | Google Gemini API key for embeddings (e.g. `gemini-embedding-001`). Omit to disable semantic search embedding.                                                   |
| `OPENAI_API_KEY`                    | No       | Optional OpenAI key if used by any integration.                                                                                                                  |
| `AI_DAILY_CAP_TOKENS`               | No       | Daily token cap per user; when set, over-cap returns 429 "Daily AI limit reached". Omit for no cap.                                                              |
| **Cron & admin**                    |          |                                                                                                                                                                  |
| `CRON_SECRET`                       | No       | Secret for `GET/POST /api/cron/process-scheduled-sends`. Required if using scheduled sends; caller must send this (e.g. Bearer token or `x-cron-secret` header). |
| `ADMIN_STATS_SECRET`                | No       | Secret for `GET /api/admin/stats` and admin backfill. Falls back to `CRON_SECRET` if not set.                                                                    |
| `ENABLE_EMAIL_SEND`                 | No       | Set to `"true"` to allow outbound send (tRPC and cron). Default is off.                                                                                          |
| **Other**                           |          |                                                                                                                                                                  |
| `NODE_ENV`                          | No       | `development` \| `test` \| `production`; defaults to `development`.                                                                                              |
| `SKIP_ENV_VALIDATION`               | No       | Set to `"1"` to skip env schema validation (e.g. CI).                                                                                                            |
| `DODO_WEBHOOK_SECRET`               | No       | Optional secret for Dodo webhook integration.                                                                                                                    |

**How to run the stack**

- **App:** Run `npm run dev` (or `npm run build` then `npm run start`). App serves at `NEXT_PUBLIC_URL` (e.g. [http://localhost:3000](http://localhost:3000)).
- **Database:** PostgreSQL with the pgvector extension must be running. Set `DATABASE_URL`. Run `npm run db:push` (and `npx prisma generate` if needed) before first run.
- **Redis:** Optional for a single instance; the sync lock falls back to in-memory per process. For multiple instances or to coordinate sync across deploys, set `REDIS_URL` or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
- **Inngest:** Optional for local development if you do not need scheduled sends or background embedding/summary jobs. For production (or to test jobs locally), use [Inngest Cloud](https://www.inngest.com) or run the Inngest dev server (e.g. `npx inngest-cli@latest dev`) and set `INNGEST_EVENT_KEY`; set `INNGEST_SIGNING_KEY` in production so Inngest can invoke your app.
- **Cron (scheduled sends):** If you use scheduled sends, a scheduler (e.g. Vercel Cron or external cron) must call `GET` or `POST /api/cron/process-scheduled-sends` on an interval (e.g. every minute). Set `CRON_SECRET` and send it in the request (`Authorization: Bearer <CRON_SECRET>` or header `x-cron-secret`). Set `ENABLE_EMAIL_SEND="true"` so the cron route can send.

Secrets: Clerk and Aurinko keys in env (or Vercel/project env). Per-account tokens are stored in the database (`Account.token`). No user-facing “API keys”; auth is session-based (Clerk).

---

## API Reference

**Auth:** All tRPC procedures under the account router that need a user use `protectedProcedure`; context is created with Clerk’s `auth()`. The client sends the session (e.g. Clerk’s default with Next.js); no separate API key.

**Key procedures (account router)**

| Method / type | Procedure / route                          | Description                                                 |
| ------------- | ------------------------------------------ | ----------------------------------------------------------- |
| query         | `getAccounts`                              | List accounts for current user.                             |
| query         | `getThreads`                               | Paginated threads (tab, cursor).                            |
| query         | `getThreadById`                            | Single thread with emails.                                  |
| mutation      | `syncEmails`                               | Trigger sync (accountId, folder, forceFullSync, cursor).    |
| mutation      | `bulkMarkRead` / `bulkMarkUnread`          | Bulk read/unread.                                           |
| mutation      | `bulkArchiveThreads` / `bulkDeleteThreads` | Bulk archive or move to trash.                              |
| mutation      | `scheduleSend` / `cancelScheduledSend`     | Schedule or cancel send (payload can include `trackOpens`). |
| mutation      | `sendEmail`                                | Send now (optional `trackOpens`).                           |
| mutation      | `snoozeThread` / `unsnoozeThread`          | Snooze thread until date/time or clear.                     |
| mutation      | `setReminder` / `clearReminder`            | Remind if no reply (e.g. in N days) or clear.               |
| query         | `getNumThreads`                            | Count threads per tab (for badges).                         |
| query         | `getScheduledSends`                        | List scheduled sends for account.                           |
| query         | `getEmailSuggestions`                      | Recipient suggestions (e.g. for compose).                   |
| query         | `getEmailBody`                             | Full body for an email (e.g. for display).                  |
| query         | `getEmailOpenByMessageId`                  | Open-tracking record for a sent message.                    |

**Example (getThreads)**

```json
// Input
{ "accountId": "...", "tab": "inbox", "important": false, "unread": false, "limit": 15, "cursor": null }

// Response (shape)
{ "threads": [...], "nextCursor": "..." | undefined, "syncStatus": { "success": true, "count": 0 }, "source": "database" }
```

**Cron (scheduled sends) & Inngest**

- **Cron auth:** `Authorization: Bearer <CRON_SECRET>` or header `x-cron-secret: <CRON_SECRET>`.
- **Cron route:** `GET` or `POST` `/api/cron/process-scheduled-sends`.
- **Cron behavior:** Fetches pending `ScheduledSend` rows where `scheduledAt <= now`, **enqueues one Inngest job per row**, returns `{ enqueued, due }`. The job handler runs the existing send logic (REST or tRPC payload), updates status; on final failure the row is set to `failed`. Requires `ENABLE_EMAIL_SEND=true` and `CRON_SECRET` set.
- **Inngest:** `GET|POST|PUT /api/inngest` serves Inngest (register + run). No separate worker; Inngest Cloud or dev server invokes your app. Jobs: `email/analyze`, `scheduled-send/process`, optional `email/analyze-account`.
- **Backfill embeddings:** `GET|POST /api/admin/backfill-embeddings` — auth: same as cron/admin (e.g. `Authorization: Bearer <ADMIN_STATS_SECRET>` or `x-cron-secret`). **GET** returns `{ count }` of emails with `embedding IS NULL` (optional `?accountId=`). **POST** selects up to `limit` (default 50, max 200) emails missing embeddings (optional `accountId`, `summaryNullOnly`), enqueues one Inngest job per email with deterministic id for deduplication; returns `{ enqueued, requested }`. Job handler is idempotent (skips if embedding already set); 5 retries with exponential backoff. Do not trigger from sync or getThreads.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # aurinko/callback, cron, trpc, inngest, chat, email/send, email/search,
│   │                       # track/open, health, create-checkout, backfill-analysis, admin/backfill-embeddings, etc.
│   ├── mail/               # Inbox app (ThreadList, ThreadDisplay)
│   └── buddy/              # AI chat-with-inbox
├── components/
│   ├── mail/               # ThreadList, ReplyBox, SnoozeMenu, RemindMenu, ComposeEmailGmail,
│   │                       # ForwardEmailDialog, MailKeyboardShortcuts, ShortcutHelpModal,
│   │                       # AccountSwitcher, editor/, search/
│   ├── ui/                 # shadcn-style primitives (select, time-input-24, etc.)
│   └── landing/            # Marketing/landing pages
├── server/api/             # tRPC: trpc.ts, routers/account.ts, post
├── lib/                    # accounts, sync-to-db, vector-search, embedding, aurinko,
│                           # email-open-tracking, undo-send, snooze-presets, remind-presets,
│                           # intent-detection, conversational-summary, send-email-rest,
│                           # inngest (client + functions), jobs (run-email-analysis, run-scheduled-send, enqueue)
├── hooks/                  # useThreads, use-inbox, use-mobile
├── contexts/               # PendingSendContext (undo send)
├── provider/               # ThemeProvider (next-themes)
└── env.js                  # T3 env schema
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

## Performance benchmarks

This section describes what to measure for production performance (sync, embeddings, search, scheduled sends) and how to interpret the numbers. Use it for capacity planning and SLA expectations; re-check after major changes. No new instrumentation is required—observe via existing logs, admin stats, or one-off tests.

**Sync: ~1k emails**

Measure the time from the start of a full sync (or a delta run that fetches on the order of 1k emails) until the sync mutation returns. Duration depends on Aurinko latency, network, and DB write throughput. Where to see it: structured logs that record sync duration per account (e.g. from the sync mutation or account router), or a one-off test that triggers sync and times the response. Expectation: typically tens of seconds to a few minutes for ~1k emails; measure and document your baseline for your environment.

**Embedding: ~1k emails**

Measure the time to generate embeddings (and optionally summaries) for about 1k emails, e.g. via the backfill job or batch analysis (`email/analyze` with multiple `emailIds`). This depends on Gemini/LLM rate limits and job concurrency. How to run it: trigger the backfill API (e.g. `POST /api/admin/backfill-embeddings` with a limit or account that yields ~1k unprocessed emails), or enqueue a batch and observe job completion in the Inngest dashboard. Expectation: often several minutes to tens of minutes at safe concurrency; measure and document your baseline.

**Vector search: ~10k rows**

Measure the latency of a single vector search when the account (or DB) has on the order of 10k emails with embeddings—e.g. p95 or average of search request duration. This depends on the pgvector index and DB load. Where to see it: the search route returns timing; admin stats (`GET /api/admin/stats`) exposes `averageSearchTimeMs`; or run one-off requests against an account with ~10k embedded emails. Expectation: sub-second for 10k rows with a proper pgvector index is typical; measure and document your baseline.

**Scheduled send throughput**

Measure how many scheduled sends are processed per minute (or per cron run) when cron is firing regularly (e.g. every minute). This depends on Inngest concurrency and send API (Aurinko) latency. How to observe: count `ScheduledSend` rows that move from `pending` to `sent` in a time window (e.g. via DB query or logs), or use the Inngest dashboard to see job throughput. Expectation: dozens per minute at default concurrency is typical; measure and document your baseline.

---

## AI cost modeling

This section explains how AI usage translates into cost and how the app limits it. VectorMail uses OpenRouter (chat, compose, summaries) and Gemini (embeddings); cost depends on tokens and provider pricing.

**Approximate tokens per email (embeddings and summaries)**

Embeddings use Gemini (model `gemini-embedding-001`): one request per email, 768 dimensions. Gemini embedding is typically billed per request or per 1k input characters, not “tokens” in the same way as chat—treat it as one embedding request per email and see [Gemini pricing](https://ai.google.dev/pricing) for current rates. Summaries use OpenRouter: each summary is one chat completion (a few hundred input + output tokens per email depending on email length and model). Exact numbers depend on email length and the model chosen.

**Estimated cost per 1k emails**

Embedding 1k emails ≈ 1k Gemini embedding requests. Summarizing 1k emails ≈ on the order of a few hundred thousand OpenRouter tokens (in + out). At typical list prices, expect on the order of low single-digit dollars for embedding + summary per 1k emails—adjust for your region and current [OpenRouter](https://openrouter.ai/docs#models) and [Gemini](https://ai.google.dev/pricing) pricing. If the project does not publish exact numbers, measure with your usage and provider pricing.

**Typical daily AI usage per active user**

An “active” user here is one who opens mail, runs search, or uses chat/compose. Daily usage varies: e.g. N chat/buddy requests, M compose or summary calls, and optionally P embedding requests (from backfill or on-demand analysis). The app stores per-user, per-operation token counts in the `AiUsage` table (operations: chat, compose, summary, embedding, buddy). Use that table for actuals, or measure from logs; baseline depends on usage patterns.

**How AI_DAILY_CAP_TOKENS limits cost**

When `AI_DAILY_CAP_TOKENS` is set in env, the app sums that user’s **input + output tokens** for the current day from `AiUsage`. Once the user exceeds the cap, further LLM requests that are subject to the cap (chat, compose, summary, buddy) return 429 “Daily AI limit reached” and are not sent to the provider. Embeddings are recorded in `AiUsage` but may contribute zero to the token sum in the current implementation; provider billing for embeddings is usually per request or per dimensions. The cap prevents a single user or bug from burning unbounded chat/compose/summary spend in one day; operators can set it to a safe ceiling per user.

---

## Production Lessons

**First sync and empty inbox:** Users often saw “0 conversations” after connecting because the OAuth callback did a lightweight sync (e.g. delta only) and new accounts had no token. We added an automatic first sync on the client when the thread list loads empty (once per account/session) and a clear “Syncing your inbox…” state so users know sync is in progress.

**Hooks order:** We had a “Rendered more hooks than during the previous render” error when a `useCallback` (e.g. for keyboard shortcut) was defined after early returns (loading, scheduled tab, no account). We moved all hooks above any conditional return so the hook count is stable every render.

**Thread status consistency:** getThreads and sync both derive inbox/sent/draft from emails and labels. We had edge cases where thread flags were out of sync with email sysLabels. We added `recalculateAllThreadStatuses` after sync and defensive fixes in getThreads (e.g. fallback when zero inbox threads but total threads exist).

**Sync lock:** Sync uses a distributed lock (Redis when `REDIS_URL` is set, else in-memory per process) so only one sync runs per account at a time across instances. Concurrent callers wait (retry until lock acquired, up to 30 min) then run sync after release. Set `REDIS_URL` for multi-instance deployments.

---

## Concurrency & idempotency

This section summarizes how VectorMail stays correct under concurrency and retries: duplicate prevention, idempotent writes, and where uniqueness is enforced.

**Email duplicate prevention**

Each email is uniquely identified by `internetMessageId` in the database (`Email.internetMessageId` has a unique constraint). Sync and email writes use this id so the same message from the provider never creates duplicate rows; repeated syncs of the same data are safe.

**Idempotent upserts**

Writing emails from sync is done via upsert (create-or-update by `internetMessageId`). Re-running sync for the same window or re-processing the same delta does not duplicate or corrupt data; existing rows are updated when the same message is seen again.

**Scheduled sends**

Scheduled sends are stored in the `ScheduledSend` table with a unique `id` and `status` (e.g. pending, sent, failed). Cron and Inngest process sends by `scheduledSendId`, so each row is processed at most once and the same send is not applied twice.

**Job uniqueness per resource**

Background jobs (e.g. email analysis, scheduled-send execution) are keyed by resource id (`emailId`, `scheduledSendId`, or `accountId` for backfill). This allows idempotent processing and clear deduplication: for example, the DLQ (`FailedJob`) stores at most one row per logical job via a unique constraint on `(jobType, resourceId)`.

**Sync lock**

Only one sync runs per account at a time. The app uses a lock in `lib/sync-lock` (Redis when Upstash or `REDIS_URL` is configured, otherwise in-memory per process). Concurrent sync requests for the same account wait until the lock is acquired or time out; two full syncs for the same account do not run in parallel.

---

## If Running at Scale

**Sync:** With `REDIS_URL` set, sync already uses a Redis-based distributed lock (one sync per account across instances). Optionally add a job queue (e.g. Bull, Inngest) for scheduling; one worker per account (or per shard) to avoid thundering herd.

**Search:** Keep pgvector; add read replicas for search-heavy traffic. Consider partitioning `Email` by `accountId` or time if a single table grows very large.

**AI:** Queue summarization and embedding backfill; use a worker pool and rate limits per provider. Cache idempotent LLM responses where safe.

**Observability:** Add tracing (e.g. OpenTelemetry) on tRPC and Aurinko calls; log sync duration and error rates per account. Alert on `needsReconnection` spikes or cron failures.

**Cost:** Monitor OpenRouter/Gemini usage; cap per-user or per-tenant if needed. Sync and embedding jobs are the main levers.

---

## Scaling phases

The table below is a planning guide: it maps approximate user scale to a typical or recommended architecture. Actual limits depend on usage patterns, instance size, and DB capacity.

| Approximate scale | Recommended architecture                                                                                                                                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **~1k users**     | Single instance (one app + Postgres). No Redis or queue required for correctness; optional for sync lock and background jobs.                                                                                                                                                       |
| **~10k users**    | Redis + queue. Use Redis for the distributed sync lock (multi-instance); use Inngest (or equivalent) for scheduled sends and embedding jobs so the app stays responsive.                                                                                                            |
| **~100k users**   | Add read replicas. Postgres read replicas for read-heavy paths (e.g. getThreads, search); write to primary. Tune connection pooling and Inngest concurrency.                                                                                                                        |
| **~1M users**     | Sharded workers. Consider dedicated workers or sharding for sync and embedding jobs (e.g. by account id or tenant); keep API and inbox on separate scaling from heavy background work. Optionally partition tables or use multi-tenant DB if the dataset outgrows a single primary. |

---

## Failure modes

This section describes how VectorMail behaves when key dependencies are down or failing. It is a reference for operators and support, not a full runbook.

**Redis is down or unreachable**

The sync lock uses Redis (Upstash or `REDIS_URL`) when configured; otherwise it uses an in-memory lock per process. If Redis is not configured, only one sync per account per process runs, and multi-instance sync is not coordinated. If Redis is configured but down or unreachable, lock acquire fails: sync requests retry for up to 30 minutes then fail with an error; there is no automatic fallback to in-memory when Redis was previously selected.

**Queue (Inngest) is down or not configured**

Scheduled sends and embedding/analysis jobs run as Inngest jobs. Sync and inbox loading do not depend on the queue: `getThreads`, `getThreadById`, and sync (Aurinko + DB) keep working. When Inngest is down or not configured, scheduled sends do not run (cron may still enqueue jobs that will only execute when Inngest is back), and embedding/summary jobs do not run. The cron route can run sends inline if enqueue fails, so some scheduled sends may still be processed when the queue is unavailable but cron is hitting the endpoint.

**LLM provider (OpenRouter/Gemini) fails or is unavailable**

Summaries, AI compose, and query/email embeddings depend on OpenRouter or Gemini. When the provider fails or is unavailable, those operations can fail; the user sees errors for compose and summaries. Search has a fallback: if the query embedding is missing, empty, or generation fails, the app falls back to text search over subject/body so search continues to work with reduced relevance.

**Aurinko rate limits or API errors**

Sync and send operations call Aurinko. On rate limits or API errors (e.g. auth or provider errors), the app sets the account’s `needsReconnection` flag in the database. The UI shows a reconnection prompt when `needsReconnection` is true. The user may need to reconnect the account (OAuth) or retry later when limits reset.

**Cron fails (scheduled-sends endpoint not called or errors)**

Scheduled sends are processed when the cron job calls `GET` or `POST /api/cron/process-scheduled-sends` with a valid `CRON_SECRET`. If cron is not invoked or the route returns an error, due `ScheduledSend` rows stay in `pending` until a future successful cron run. There is no automatic retry aside from the next cron tick; operators must fix the scheduler or endpoint.

**Embedding/analysis job fails repeatedly (e.g. after retries)**

The `email/analyze` Inngest function has 5 retries. If the job still fails after retries, it ends in a failed state in Inngest; operators can see failed runs in the Inngest dashboard. There is no application-level failed-job table or dead-letter queue. The affected email(s) remain without embedding/summary until a new job is enqueued (e.g. via backfill or manual trigger).

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
<summary><strong>Productivity & UX</strong></summary>
<br />

| Feature                 | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| **Keyboard shortcuts**  | j/k, e, #, c, r, /, g+i/s, ?, x (select); help modal with `?`               |
| **Undo send**           | Cancel a send within a few seconds via toast action                         |
| **Forward**             | Forward with optional schedule send and open tracking                       |
| **Snooze & remind**     | Presets (Later today, Tomorrow, Next week; 1/3/5/7 days) + custom date/time |
| **Email open tracking** | Optional pixel in sent emails; first open recorded (time, user-agent, IP)   |
| **Dark / light theme**  | System-aware theme via next-themes                                          |
| **Account switcher**    | Multi-account UI to switch between connected mailboxes                      |

</details>

<details>
<summary><strong>Productivity Dashboard</strong></summary>
<br />

| Feature                    | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| **Communication Insights** | Understand who you email most and when (planned)        |
| **Action Item Tracking**   | Never miss a follow-up or commitment (planned)          |

_Email analytics (response times, volume patterns) is planned and not yet available._

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

## Tech Stack

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
| **Pro**        | $13/mo | Unlimited AI, advanced search, 5 accounts, priority support |
| **Enterprise** | $60/mo   | Everything + custom AI training, SSO, dedicated support     |

[View Full Pricing →](https://vectormail.space/pricing)

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

- [T3 Stack](https://create.t3.gg/) - Full-stack TypeScript starter
- [shadcn/ui](https://ui.shadcn.com/) - Accessible components
- [Aurinko](https://www.aurinko.io/) - Unified email API
- [OpenAI](https://openai.com/) & [Google Gemini](https://deepmind.google/technologies/gemini/) - AI capabilities

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
