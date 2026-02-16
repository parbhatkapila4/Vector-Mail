import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";
import {
  generateRequestId,
  runWithRequestIdAsync,
} from "@/lib/correlation";
import { enqueueScheduledSendJobs } from "@/lib/jobs/enqueue";
import { runScheduledSend } from "@/lib/jobs/run-scheduled-send";

export const runtime = "nodejs";
export const maxDuration = 60;

const LIMIT = 50;

function isAuthorized(req: NextRequest): boolean {
  const secret = env.CRON_SECRET?.trim();
  if (!secret) {
    console.warn(
      "[process-scheduled-sends] CRON_SECRET not set; route should be protected",
    );
    return false;
  }
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const headerSecret = req.headers.get("x-cron-secret")?.trim();
  return bearer === secret || headerSecret === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requestId = req.headers.get("x-request-id")?.trim() || generateRequestId();
  return runWithRequestIdAsync(requestId, () => processScheduledSends());
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requestId = req.headers.get("x-request-id")?.trim() || generateRequestId();
  return runWithRequestIdAsync(requestId, () => processScheduledSends());
}

async function processScheduledSends() {
  const enableEmailSend =
    env.ENABLE_EMAIL_SEND ?? process.env.ENABLE_EMAIL_SEND === "true";

  if (!enableEmailSend) {
    return NextResponse.json(
      { error: "Email sending is disabled", enqueued: 0, due: 0, processedInline: 0 },
      { status: 403 },
    );
  }

  const now = new Date();
  const due = await db.scheduledSend.findMany({
    where: {
      status: "pending",
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: LIMIT,
    select: { id: true },
  });

  const scheduledSendIds = due.map((row) => row.id);
  let enqueued = 0;
  let processedInline = 0;

  if (scheduledSendIds.length > 0) {
    try {
      await enqueueScheduledSendJobs(scheduledSendIds);
      enqueued = scheduledSendIds.length;
    } catch (err) {
      console.warn(
        "[process-scheduled-sends] Enqueue failed, running sends inline:",
        err,
      );
      for (const id of scheduledSendIds) {
        const result = await runScheduledSend(id);
        if (result.ok) processedInline++;
      }
    }
  }

  return NextResponse.json(
    { enqueued, due: due.length, processedInline },
    { status: 200 },
  );
}
