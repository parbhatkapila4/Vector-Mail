import { exchangeAurinkoCodeForToken, getAccountInfo } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Account } from "@/lib/accounts";
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

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 80);

    await db.account.upsert({
      where: { id: accountIdStr },
      update: {
        token: token.accountToken,
        userId,
        nextDeltaToken: null,
        needsReconnection: false,
        tokenExpiresAt,
      },
      create: {
        id: accountIdStr,
        token: token.accountToken,
        emailAddress: accountInfo.email,
        name: accountInfo.name,
        userId,
        provider: "gmail",
        nextDeltaToken: null,
        needsReconnection: false,
        tokenExpiresAt,
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

  console.log("[CALLBACK] Starting FULL sync after reconnection...");
  try {
    const account = new Account(accountIdStr, token.accountToken);



    console.log("[CALLBACK] Getting fresh delta token...");
    const response = await axios.post(
      `https://api.aurinko.io/v1/email/sync`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token.accountToken}`,
          "X-Aurinko-Account-Id": accountIdStr,
        },
      },
    );

    if (response.data?.deltaToken) {
      console.log("[CALLBACK] ✓ Fresh delta token obtained");
      await db.account.update({
        where: { id: accountIdStr },
        data: {
          nextDeltaToken: response.data.deltaToken,
          needsReconnection: false,
        },
      });
      console.log("[CALLBACK] ✓ Delta token and reconnection flag updated");
    }


    console.log("[CALLBACK] Syncing latest emails...");
    const latestResult = await account.syncLatestEmails();
    console.log("[CALLBACK] ✓ Latest sync result:", latestResult);


    console.log("[CALLBACK] Recalculating thread statuses...");
    const { recalculateAllThreadStatuses } = await import("@/lib/sync-to-db");
    await recalculateAllThreadStatuses(accountIdStr);
    console.log("[CALLBACK] ✓ Thread statuses recalculated");
  } catch (error) {
    console.error("[CALLBACK] ✗ Post-reconnection sync failed:", error);
  }

  console.log("[CALLBACK] ========== REDIRECTING TO MAIL ==========");
  return NextResponse.redirect(new URL("/mail", process.env.NEXT_PUBLIC_URL));
}

export async function POST(req: NextRequest) {
  return GET(req);
}
