import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";
import {
  getAverageSearchTimeMs,
  getSyncFailures,
  getLlmCallsCount,
} from "@/lib/metrics/store";
import { getFailedJobCount } from "@/lib/jobs/failed-job";

const ADMIN_SECRET_HEADER = "x-admin-secret";

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
  const headerSecret = req.headers.get(ADMIN_SECRET_HEADER)?.trim();
  return bearer === secret || headerSecret === secret;
}

export async function GET(req: NextRequest) {
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Admin stats not configured" },
      { status: 503 },
    );
  }

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalEmails, embeddingResult, dlqCount] = await Promise.all([
      db.email.count(),
      db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "Email" WHERE embedding IS NOT NULL
      `,
      getFailedJobCount(),
    ]);

    const totalEmbeddings = Number(embeddingResult[0]?.count ?? 0);
    const averageSearchTimeMs = getAverageSearchTimeMs();
    const llmCallsCount = getLlmCallsCount();
    const syncFailures = getSyncFailures();

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      totalEmails,
      totalEmbeddings,
      averageSearchTimeMs,
      llmCallsCount,
      syncFailures,
      dlqCount,
    });
  } catch (err) {
    console.error("[admin/stats] Error computing stats:", err);
    return NextResponse.json(
      { error: "Failed to compute stats" },
      { status: 500 },
    );
  }
}
