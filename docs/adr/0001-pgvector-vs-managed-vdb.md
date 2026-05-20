# ADR 0001 - Postgres + pgvector instead of a managed vector DB

**Date:** 2026-04-01  •  **Status:** Accepted

## Context

VectorMail needs vector search over the user's mail to power semantic queries
("emails about hiring this quarter") and the Inbox Brain chat. The obvious
options were:

1. **Managed vector DB** - Pinecone, Weaviate, Chroma Cloud, Qdrant Cloud.
2. **Postgres + pgvector** - keep everything in one DB.

A second-database design carries non-trivial cost in any small team:
duplicate auth, duplicate observability, duplicate failure modes, and a
two-phase write at every email ingestion (Postgres row + vector upsert) that
needs reconciliation when one half fails.

## Decision

We use **Postgres + pgvector** as the single store. Embeddings live in an
`Email.embedding` column; queries use the `<=>` distance operator with raw
SQL scoped by `accountId`.

## Consequences

**Pros**

- One deployment, one backup, one identity model. The same row holds the
  semantic index and the canonical email - no two-phase writes.
- Account-scoped queries are trivial (`WHERE accountId = ...`); no separate
  multi-tenant story to design in the vector layer.
- pgvector at this scale (single-user inbox, ≤1M emails) is fast enough.
  The bottleneck is Gemini embedding calls, not the index.
- Cost. A managed vector DB at the per-user level is ~$50–100/user/month
  before optimization. Postgres has no incremental cost.

**Cons**

- pgvector at 100M+ vectors needs HNSW tuning we haven't done. If we ship
  team mailboxes that aggregate millions of emails, we'll revisit.
- We don't get an out-of-the-box hybrid-search reranker. If retrieval
  quality degrades on long queries, we'll need to layer one ourselves.
- Schema migrations that rebuild embeddings happen on the same DB the user
  reads from - needs care.

## What we will reconsider

- If a team mailbox exceeds 5M emails per account.
- If embedding-index build time during sync becomes the user-perceived
  bottleneck (today it isn't).
- If we add cross-account search (e.g. shared workspace inbox).
