# VectorMail – AI Agent Context (claude.md)

## What this project is

VectorMail is an AI-powered email client that:

- Connects Gmail via Aurinko
- Syncs threads into PostgreSQL
- Uses pgvector for semantic search
- Uses AI (OpenRouter + Gemini) for summaries, compose, and reply

Single codebase. No separate vector DB.

---

## Stack

- Frontend: Next.js 15, React 19, Tailwind
- Backend: tRPC, Prisma, PostgreSQL + pgvector
- Auth: Clerk
- Email: Aurinko
- AI: OpenRouter (chat), Gemini (embeddings)
- Jobs: Inngest

---

## Important folders

- src/app → routes (UI + API)
- src/server/api → tRPC routers
- src/lib → core logic (MOST IMPORTANT)
  - accounts → sync
  - vector-search → semantic search
  - embedding → embeddings
  - email-analysis → summaries
  - inngest → background jobs

- src/components/mail → inbox UI

---

## Core rules (DO NOT BREAK)

1. Always verify account access before data access
2. Never create duplicate emails (internetMessageId is UNIQUE)
3. Never run parallel syncs for same account
4. Always handle missing embeddings (fallback to text search)
5. Do not break demo mode
6. Do not assume AI APIs are available
7. **Clerk:** `<ClerkProvider />` only in `src/components/providers/ProvidersWrapper.tsx` (Server Component, `dynamic`). Never wrap it in a `"use client"` file (that drops SSR auth state and causes long loading / skeleton).

---

## Key concepts

### Account-scoped system

Everything uses accountId and must be authorized.

### Sync

- Uses Aurinko
- Delta sync preferred
- Full sync if no token or empty inbox
- Only ONE sync per account (locked)

### Data model

- User
- Account
- Thread
- Email (has embedding vector)
- ScheduledSend
- EmailOpen

### Semantic search

1. Query → embedding (Gemini)
2. Compare with Email.embedding
3. pgvector similarity search
4. Fallback to text search if needed

### AI features

- Summaries stored in DB
- Compose/reply via OpenRouter
- Rate limited + optional daily cap
- Must always handle failures

### Scheduled sends

- Stored in DB
- Cron endpoint triggers jobs
- Processed via Inngest

### Demo mode

- No real DB writes
- Uses static data
- Mutations disabled

---

## Common tasks

Add inbox feature:

- src/components/mail
- update tRPC account router

Modify sync:

- src/lib/accounts
- be careful (core system)

Modify search:

- src/lib/vector-search
- keep fallback working

Add AI feature:

- use OpenRouter
- track usage
- add rate limiting

---

## Local setup

npm install
npm run db:push
npm run dev

---

## Mental model

Gmail clone + AI layer + semantic DB
Single backend. Keep it simple.

---

## What NOT to do

- No new services unless necessary
- No separate vector DB
- No bypassing tRPC
- No blocking UI on AI
- No tight coupling to AI output

---

## Goal

Fast, clean AI-first email client with semantic search and minimal infra.
