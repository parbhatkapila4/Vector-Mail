import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";
import { makeTagLogger } from "@/lib/logging/console-shim";
import { anySafeSecretEqual } from "@/lib/timing-safe-secret";
import {
  encryptToken,
  isEncryptedToken,
  isTokenEncryptionEnabled,
} from "@/lib/token-crypto";

const apiLog = makeTagLogger("api.admin.encrypt-tokens");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  return anySafeSecretEqual([bearer, headerSecret, cronSecret], secret);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.account.findMany({ select: { id: true, token: true } });
  let plaintext = 0;
  let encrypted = 0;
  for (const r of rows) {
    if (!r.token) continue;
    if (isEncryptedToken(r.token)) encrypted++;
    else plaintext++;
  }
  return NextResponse.json({
    encryptionEnabled: isTokenEncryptionEnabled(),
    total: rows.length,
    plaintext,
    encrypted,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isTokenEncryptionEnabled()) {
    return NextResponse.json(
      {
        error:
          "TOKEN_ENCRYPTION_KEY is not set (or invalid). Set it before backfilling.",
      },
      { status: 400 },
    );
  }

  const rows = await db.account.findMany({ select: { id: true, token: true } });
  let migrated = 0;
  let skipped = 0;
  for (const r of rows) {
    if (!r.token || isEncryptedToken(r.token)) {
      skipped++;
      continue;
    }
    const enc = encryptToken(r.token);
    if (enc === r.token) {
      skipped++;
      continue;
    }
    await db.account.update({ where: { id: r.id }, data: { token: enc } });
    migrated++;
  }

  apiLog.info(`[encrypt-tokens] migrated=${migrated} skipped=${skipped}`);
  return NextResponse.json({ migrated, skipped, total: rows.length });
}
