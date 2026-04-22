import { exchangeAurinkoCodeForToken, getAccountInfo } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Account } from "@/lib/accounts";
import axios from "axios";
import { log as auditLog } from "@/lib/audit/audit-log";

const FAST_FIRST_SYNC_TIMEOUT_MS = 30_000;

function getBaseUrl(req: NextRequest): string {
  try {
    const envUrl = process.env.NEXT_PUBLIC_URL;
    if (envUrl && envUrl.startsWith("http")) return envUrl;
    if (req.url) {
      const u = new URL(req.url);
      return `${u.protocol}//${u.host}`;
    }
  } catch {
  }
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? req.headers.get("x-forwarded-ssl") === "on" ? "https" : "http";
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  let existingUserId: string | null = null;
  try {
    const authResult = await auth();
    existingUserId = authResult.userId;
  } catch (e) {
    console.error("[CALLBACK] auth() failed:", e);
    return NextResponse.json(
      { message: "Authentication check failed" },
      { status: 500 },
    );
  }

  const baseUrl = getBaseUrl(req);

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

  console.log("[CALLBACK] ========== STARTING OAUTH CALLBACK ==========", existingUserId ? "(existing session)" : "(one-click sign-in)");

  try {

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

    let accountInfo: { email: string; name: string };
    try {
      const info = await getAccountInfo(token.accessToken, accountIdStr);
      if (!info || !info.email) {
        console.error("[CALLBACK] ✗ Account verification returned invalid data");
        return NextResponse.json(
          { message: "Failed to verify account" },
          { status: 401 },
        );
      }
      accountInfo = info;
      console.log("[CALLBACK] ✓ Account verified - email:", accountInfo.email);
    } catch (error) {
      console.error("[CALLBACK] ✗ Account verification failed:", error);
      return NextResponse.json(
        { message: "Failed to verify account" },
        { status: 401 },
      );
    }

    const gmailEmail = accountInfo.email.trim().toLowerCase();
    let userId: string;

    if (existingUserId) {
      userId = existingUserId;
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
      if (primaryEmail && gmailEmail !== primaryEmail) {
        console.warn("[CALLBACK] ✗ Account mismatch - Gmail email does not match sign-in Google account");
        const mailUrl = new URL("/mail", baseUrl);
        mailUrl.searchParams.set("error", "account_mismatch");
        return NextResponse.redirect(mailUrl);
      }
      const existingAccount = await db.account.findFirst({
        where: { userId },
        select: { id: true, emailAddress: true },
      });
      if (existingAccount && existingAccount.emailAddress.trim().toLowerCase() !== gmailEmail) {
        console.warn("[CALLBACK] ✗ User already has a connected account; cannot connect a different Google account");
        const mailUrl = new URL("/mail", baseUrl);
        mailUrl.searchParams.set("error", "one_account_only");
        return NextResponse.redirect(mailUrl);
      }
    } else {
      const client = await clerkClient();
      const { data: existingUsers } = await client.users.getUserList({
        emailAddress: [accountInfo.email],
        limit: 1,
      });
      if (existingUsers && existingUsers.length > 0) {
        userId = existingUsers[0]!.id;
        console.log("[CALLBACK] ✓ Found existing Clerk user:", userId);
      } else {
        const nameParts = (accountInfo.name ?? "").trim().split(/\s+/);
        const newUser = await client.users.createUser({
          emailAddress: [accountInfo.email],
          firstName: nameParts[0] ?? undefined,
          lastName: nameParts.slice(1).join(" ") || undefined,
          skipPasswordRequirement: true,
        });
        userId = newUser.id;
        console.log("[CALLBACK] ✓ Created Clerk user:", userId);
      }
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
      const errMessage = error instanceof Error ? error.message : String(error);
      const errCode = error && typeof error === "object" && "code" in error ? String((error as { code: string }).code) : undefined;
      return NextResponse.json(
        {
          message: "Failed to link user account. Please try again or contact support.",
          ...(process.env.NODE_ENV === "development" && { detail: errMessage, code: errCode }),
        },
        { status: 500 },
      );
    }

    const tokenToStore = token.accountToken ?? token.accessToken;
    const refreshTokenToStore = token.refreshToken ?? null;
    const tokenExpiresAt = token.expiresIn
      ? new Date(Date.now() + token.expiresIn * 1000)
      : null;

    try {
      await db.account.upsert({
        where: { id: accountIdStr },
        update: {
          token: tokenToStore,
          refreshToken: refreshTokenToStore,
          userId,
          nextDeltaToken: null,
          needsReconnection: false,
          tokenExpiresAt,
        },
        create: {
          id: accountIdStr,
          token: tokenToStore,
          refreshToken: refreshTokenToStore,
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
      auditLog({
        userId,
        action: "account_connected",
        resourceId: accountIdStr,
        metadata: { provider: "gmail" },
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      const errCode = error && typeof error === "object" && "code" in error ? String((error as { code: string }).code) : undefined;
      console.error("[CALLBACK] ✗ Account upsert failed:", errMessage, errCode ? `(code: ${errCode})` : "", error);
      return NextResponse.json(
        {
          message: "Failed to save account. Please try signing in again or contact support.",
          ...(process.env.NODE_ENV === "development" && { detail: errMessage, code: errCode }),
        },
        { status: 500 },
      );
    }

    console.log("[CALLBACK] Fast first batch (show inbox in 1-3s), then redirect…");
    try {
      const account = new Account(accountIdStr, tokenToStore);

      const getDeltaTokenAndSave = async () => {
        try {
          const response = await axios.post(
            `https://api.aurinko.io/v1/email/sync`,
            {},
            {
              headers: {
                Authorization: `Bearer ${tokenToStore}`,
                "X-Aurinko-Account-Id": accountIdStr,
              },
              timeout: 8000,
            },
          );
          if (response.data?.deltaToken) {
            await db.account.update({
              where: { id: accountIdStr },
              data: {
                nextDeltaToken: response.data.deltaToken,
                needsReconnection: false,
              },
            });
            console.log("[CALLBACK] ✓ Delta token saved (background)");
          }
        } catch (e) {
          console.warn("[CALLBACK] Delta token fetch failed (non-blocking):", e);
        }
      };

      const fastFirstSync = Promise.race([
        account.syncFirstBatchQuick(),
        new Promise<{ count: number }>((_, reject) =>
          setTimeout(() => reject(new Error("Fast first sync timeout")), FAST_FIRST_SYNC_TIMEOUT_MS),
        ),
      ]).catch((err) => {
        console.warn("[CALLBACK] Fast first batch timeout or error:", err);
        return { count: 0 };
      });

      void getDeltaTokenAndSave();
      const firstResult = await fastFirstSync;
      console.log("[CALLBACK] ✓ First batch:", firstResult.count, "emails (rest will sync in background on /mail)");


      void (async () => {
        try {
          const { recalculateAllThreadStatuses } = await import("@/lib/sync-to-db");
          await recalculateAllThreadStatuses(accountIdStr);
          console.log("[CALLBACK] ✓ Thread statuses recalculated (background)");
        } catch (recalcErr) {
          console.warn("[CALLBACK] Thread status recalculation failed (background):", recalcErr);
        }
      })();
    } catch (error) {
      console.error("[CALLBACK] ✗ Post-reconnection sync failed:", error);

      const is401 =
        axios.isAxiosError(error) && error.response?.status === 401;
      if (is401 && existingUserId) {
        console.warn("[CALLBACK] 401 on first sync after reconnect; leaving needsReconnection false, redirecting to /mail");
      }
      if (existingUserId) {
        const mailUrl = new URL("/mail", baseUrl);
        mailUrl.searchParams.set("reconnected", "1");
        return NextResponse.redirect(mailUrl);
      }
    }

    if (!existingUserId) {
      const client = await clerkClient();
      const { token: signInToken } = await client.signInTokens.createSignInToken({
        userId,
        expiresInSeconds: 60 * 10,
      });
      const callbackUrl = new URL("/auth/callback", baseUrl);
      callbackUrl.searchParams.set("ticket", signInToken);
      callbackUrl.searchParams.set("accountId", accountIdStr);
      console.log("[CALLBACK] ========== REDIRECTING TO AUTH CALLBACK (one-click) ==========");
      return NextResponse.redirect(callbackUrl);
    }

    console.log("[CALLBACK] ========== REDIRECTING TO MAIL ==========");
    const mailUrl = new URL("/mail", baseUrl);
    if (existingUserId) {
      mailUrl.searchParams.set("reconnected", "1");
    }
    return NextResponse.redirect(mailUrl);
  } catch (err) {
    console.error("[CALLBACK] Unhandled error:", err);
    return NextResponse.json(
      { message: "Callback failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
