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
  const url = req.nextUrl ?? new URL(req.url);
  const querySecret = url.searchParams.get("secret")?.trim();
  return bearer === secret || headerSecret === secret || querySecret === secret;
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
      {
        error: "Email sending is disabled",
        message: "Set ENABLE_EMAIL_SEND=true in your environment to allow scheduled sends.",
        enqueued: 0,
        due: 0,
        processedInline: 0,
      },
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
      enqueued = await enqueueScheduledSendJobs(scheduledSendIds);
    } catch (err) {
      console.warn(
        "[process-scheduled-sends] Enqueue failed, running sends inline:",
        err,
      );
    }
    if (enqueued === 0) {
      for (const id of scheduledSendIds) {
        try {
          const result = await runScheduledSend(id);
          if (result.ok) processedInline++;
        } catch (runErr) {
          console.error("[process-scheduled-sends] Inline send failed:", id, runErr);
        }
      }
    }
  }

  return NextResponse.json(
    { enqueued, due: due.length, processedInline },
    { status: 200 },
  );
}
