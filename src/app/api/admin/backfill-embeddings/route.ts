import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";
import { log as auditLog } from "@/lib/audit/audit-log";
import { enqueueBackfillEmbeddingJobs } from "@/lib/jobs/enqueue";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function getAdminSecret(): string | undefined {
  return env.ADMIN_STATS_SECRET ?? env.CRON_SECRET;
}

function isAuthorized(req: NextRequest): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;
  const bearer =
    req.headers.get("authorization")?.startsWith("Bearer ") === true
      ? req.headers.get("authorization")!.slice(7).trim()
      : undefined;
  const headerSecret = req.headers.get("x-admin-secret")?.trim();
  const cronSecret = req.headers.get("x-cron-secret")?.trim();
  return bearer === secret || headerSecret === secret || cronSecret === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId") ?? undefined;

    const countResult = accountId
      ? await db.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint as count FROM "Email" e
          JOIN "Thread" t ON e."threadId" = t.id
          WHERE t."accountId" = ${accountId} AND e."embedding" IS NULL
        `
      : await db.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint as count FROM "Email" e WHERE e."embedding" IS NULL
        `;

    const count = Number(countResult[0]?.count ?? 0);
    return NextResponse.json({ count, accountId: accountId ?? null }, { status: 200 });
  } catch (err) {
    console.error("[backfill-embeddings GET]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Count failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Backfill not configured (set ADMIN_STATS_SECRET or CRON_SECRET)" },
      { status: 503 },
    );
  }

  try {
    let accountId: string | undefined;
    let limit = DEFAULT_LIMIT;
    let summaryNullOnly = false;

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      accountId = typeof body.accountId === "string" ? body.accountId : undefined;
      limit =
        typeof body.limit === "number"
          ? Math.min(Math.max(1, body.limit), MAX_LIMIT)
          : typeof body.limit === "string"
            ? Math.min(Math.max(1, parseInt(body.limit, 10) || DEFAULT_LIMIT), MAX_LIMIT)
            : DEFAULT_LIMIT;
      summaryNullOnly = body.summaryNullOnly === true;
    } else {
      const url = new URL(req.url);
      accountId = url.searchParams.get("accountId") ?? undefined;
      const limitParam = url.searchParams.get("limit");
      limit =
        limitParam != null
          ? Math.min(Math.max(1, parseInt(limitParam, 10) || DEFAULT_LIMIT), MAX_LIMIT)
          : DEFAULT_LIMIT;
      summaryNullOnly = url.searchParams.get("summaryNullOnly") === "true";
    }

    if (accountId) {
      const account = await db.account.findFirst({
        where: { id: accountId },
        select: { id: true },
      });
      if (!account) {
        return NextResponse.json(
          { error: "Account not found", accountId },
          { status: 404 },
        );
      }
    }

    auditLog({
      userId: "system",
      action: "backfill_started",
      resourceId: accountId ?? "global",
      metadata: { limit },
    });

    let emailIds: Array<{ id: string }>;
    if (accountId && summaryNullOnly) {
      emailIds = await db.$queryRaw<Array<{ id: string }>>`
        SELECT e.id FROM "Email" e
        JOIN "Thread" t ON e."threadId" = t.id
        WHERE t."accountId" = ${accountId} AND e."embedding" IS NULL AND e."summary" IS NULL
        ORDER BY e."sentAt" DESC LIMIT ${limit}
      `;
    } else if (accountId) {
      emailIds = await db.$queryRaw<Array<{ id: string }>>`
        SELECT e.id FROM "Email" e
        JOIN "Thread" t ON e."threadId" = t.id
        WHERE t."accountId" = ${accountId} AND e."embedding" IS NULL
        ORDER BY e."sentAt" DESC LIMIT ${limit}
      `;
    } else if (summaryNullOnly) {
      emailIds = await db.$queryRaw<Array<{ id: string }>>`
        SELECT e.id FROM "Email" e
        WHERE e."embedding" IS NULL AND e."summary" IS NULL
        ORDER BY e."sentAt" DESC LIMIT ${limit}
      `;
    } else {
      emailIds = await db.$queryRaw<Array<{ id: string }>>`
        SELECT e.id FROM "Email" e
        WHERE e."embedding" IS NULL
        ORDER BY e."sentAt" DESC LIMIT ${limit}
      `;
    }

    const ids = emailIds.map((r) => r.id);
    const enqueued = await enqueueBackfillEmbeddingJobs(ids);

    return NextResponse.json(
      { enqueued, requested: ids.length },
      { status: 200 },
    );
  } catch (err) {
    console.error("[backfill-embeddings]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Backfill enqueue failed",
      },
      { status: 500 },
    );
  }
}
