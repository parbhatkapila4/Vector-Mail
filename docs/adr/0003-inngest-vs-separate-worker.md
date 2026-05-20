# ADR 0003 - Inngest for background jobs, not a separate worker

**Date:** 2026-04-08  •  **Status:** Accepted

## Context

VectorMail has three job kinds:

1. **Embedding/email analysis** - generate the vector and metadata for a
   newly synced email. Bursty (whole-inbox after first sync).
2. **Scheduled sends** - fire a `ScheduledSend` row at its `scheduledAt`
   time.
3. **Account-wide analysis** - re-run analysis after large syncs.

The naive options:

1. **In-process** (`Promise` chains inside the request handler) - easy,
   but blocks the UI thread on first sync and dies on serverless cold
   starts.
2. **Separate worker process** + queue (BullMQ on Redis, or a dedicated
   service) - robust but doubles the deployment story.
3. **Inngest** - define functions inline in the Next.js app, register them
   on a single endpoint (`/api/inngest`), and let Inngest handle scheduling,
   retries, fan-out, and observability.

## Decision

We use **Inngest**. Functions live in `src/lib/inngest/functions.ts` and
are served via `/api/inngest`. Cron-driven entry points (`/api/cron/...`)
enqueue events; Inngest invokes the right function.

## Consequences

**Pros**

- Single deployment. No separate worker container to operate, scale, or
  observe.
- Retries, exponential backoff, and dead-letter handling are built in.
- The Inngest dashboard gives us per-event runs, durations, and failure
  rates without us building it.
- Local dev is one CLI: `npx inngest-cli@latest dev`.
- If Inngest is offline, the user-facing path (sync, threads, send-now)
  still works; only deferred jobs queue up.

**Cons**

- Vendor lock-in for orchestration. Migrating off requires reimplementing
  job semantics (retries, fan-out) in something else.
- Cold-start risk on Vercel: Inngest invokes our function via HTTP, so the
  first job after idle pays a serverless cold start.
- Cost scales with event volume. At very high throughput a self-hosted
  queue is cheaper.

## What we will reconsider

- If we cross the Inngest free-tier ceiling on a sustained basis and the
  paid tier becomes a meaningful line item.
- If we need extremely low-latency job dispatch (sub-second) - Inngest
  isn't built for that.
- If we add stateful workflows (e.g. multi-step inbox automations with
  human-in-the-loop) that outgrow event-driven semantics.
