import { exchangeAurinkoCodeForToken, getAccountInfo } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { Account } from "@/lib/accounts";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success") {
    return NextResponse.json(
      { message: "Failed to connect account" },
      { status: 401 },
    );
  }

  const code = params.get("code");
  if (!code) {
    return NextResponse.json({ message: "No code provided" }, { status: 401 });
  }

  console.log("[CALLBACK] ========== STARTING OAUTH CALLBACK ==========");

  let token;
  try {
    token = await exchangeAurinkoCodeForToken(code);
    if (!token || !token.accessToken || !token.accountId) {
      console.error(
        "[CALLBACK] ✗ Token exchange failed - missing required fields",
      );
      console.error(
        "[CALLBACK] Token received:",
        token ? Object.keys(token) : "null",
      );
      return NextResponse.json(
        {
          message: "Failed to exchange code for token",
          error: "Missing required token fields",
          details: token ? Object.keys(token) : "No token received",
        },
        { status: 401 },
      );
    }

    if (!token.accountToken) {
      console.warn(
        "[CALLBACK] ⚠ accountToken missing, using accessToken as fallback",
      );
    }
  } catch (error: unknown) {
    console.error("[CALLBACK] ✗ Token exchange threw error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorDetails = axios.isAxiosError(error)
      ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        }
      : null;

    console.error("[CALLBACK] Error details:", errorDetails);

    return NextResponse.json(
      {
        message: "Token exchange failed",
        error: errorMessage,
        details: errorDetails,
      },
      { status: 401 },
    );
  }

  const accountIdStr = token.accountId.toString();
  console.log(
    "[CALLBACK] ✓ Token exchange successful - accountId:",
    accountIdStr,
  );

  let accountInfo;
  try {
    accountInfo = await getAccountInfo(token.accessToken, accountIdStr);
    if (!accountInfo || !accountInfo.email) {
      console.error("[CALLBACK] ✗ Account verification returned invalid data");
      return NextResponse.json(
        { message: "Failed to verify account" },
        { status: 401 },
      );
    }
    console.log("[CALLBACK] ✓ Account verified - email:", accountInfo.email);
  } catch (error) {
    console.error("[CALLBACK] ✗ Account verification failed:", error);
    return NextResponse.json(
      { message: "Failed to verify account" },
      { status: 401 },
    );
  }

  try {
    await db.user.upsert({
      where: { emailAddress: accountInfo.email },
      update: { id: userId },
      create: {
        id: userId,
        emailAddress: accountInfo.email,
      },
    });
    console.log("[CALLBACK] ✓ User upserted");
  } catch (error) {
    console.error("[CALLBACK] ✗ User upsert failed:", error);
  }

  try {
    await db.account.upsert({
      where: { id: accountIdStr },
      update: {
        token: token.accountToken,
        userId,
        nextDeltaToken: null,
      },
      create: {
        id: accountIdStr,
        token: token.accountToken,
        emailAddress: accountInfo.email,
        name: accountInfo.name,
        userId,
        provider: "gmail",
        nextDeltaToken: null,
      },
    });
    console.log("[CALLBACK] ✓ Account upserted");
  } catch (error) {
    console.error("[CALLBACK] ✗ Account upsert failed:", error);
    return NextResponse.json(
      { message: "Failed to save account" },
      { status: 500 },
    );
  }

  console.log("[CALLBACK] Starting immediate email sync...");
  try {
    const account = new Account(accountIdStr, token.accountToken);
    const syncResult = await account.performInitialSync();

    console.log("===== AURINKO RAW RESPONSE =====");
    console.log("syncResult:", syncResult ? "EXISTS" : "NULL");
    console.log("emails length:", syncResult?.emails?.length ?? 0);
    console.log("data:", JSON.stringify(syncResult, null, 2));
    console.log("================================");

    if (syncResult && syncResult.emails.length > 0) {
      console.log(
        `[CALLBACK] ✓ Fetched ${syncResult.emails.length} emails from Aurinko`,
      );

      await syncEmailsToDatabase(syncResult.emails, accountIdStr);
      console.log(
        `[CALLBACK] ✓ Saved ${syncResult.emails.length} emails to database`,
      );

      await db.account.update({
        where: { id: accountIdStr },
        data: { nextDeltaToken: syncResult.deltaToken },
      });
      console.log("[CALLBACK] ✓ Delta token saved for future syncs");
    } else {
      console.log("[CALLBACK] ⚠ No emails returned from sync");
    }
  } catch (error) {
    console.error("[CALLBACK] ✗ Initial sync failed:", error);
  }

  waitUntil(
    (async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const account = new Account(accountIdStr, token.accountToken);
        await account.syncEmails(true);
        console.log("[CALLBACK] ✓ Background sync completed");
      } catch (error) {
        console.error("[CALLBACK] ✗ Background sync failed:", error);
      }
    })(),
  );

  console.log("[CALLBACK] ========== REDIRECTING TO MAIL ==========");
  return NextResponse.redirect(new URL("/mail", process.env.NEXT_PUBLIC_URL));
}
