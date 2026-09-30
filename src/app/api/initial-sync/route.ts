import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";
import { Account } from "@/lib/accounts";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { env } from "@/env";
import { anySafeSecretEqual } from "@/lib/timing-safe-secret";
import { makeTagLogger } from "@/lib/logging/console-shim";

const apiLog = makeTagLogger("api.initial-sync");
function isAuthorized(req: NextRequest): boolean {
  const secret = env.CRON_SECRET?.trim();
  if (!secret) {
    apiLog.warn("[initial-sync] CRON_SECRET not set; refusing all requests");
    return false;
  }
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const headerSecret = req.headers.get("x-cron-secret")?.trim();
  return anySafeSecretEqual([bearer, headerSecret], secret);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, accountId } = await req.json();
  if (!userId || !accountId) {
    return NextResponse.json(
      { message: "Missing userId or accountId" },
      { status: 400 },
    );
  }
  const dbAccount = await db.account.findUnique({
    where: { id: accountId, userId: userId },
  });
  if (!dbAccount) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }
  const account = new Account(dbAccount.id, dbAccount.token);

  const response = await account.performInitialSync();

  if (!response) {
    return NextResponse.json(
      { message: "Failed to perform initial sync" },
      { status: 500 },
    );
  }

  const { emails, deltaToken } = response;

  await db.account.update({
    where: { id: accountId },
    data: {
      nextDeltaToken: deltaToken,
    },
  });

  await syncEmailsToDatabase(emails, accountId);

  return NextResponse.json(
    { message: "Initial sync completed" },
    { status: 200 },
  );
}
