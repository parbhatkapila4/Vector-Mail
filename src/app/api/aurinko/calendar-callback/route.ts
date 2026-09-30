import { exchangeAurinkoCodeForToken, getAccountInfo } from "@/lib/aurinko";
import { validateMailScope, validateCalendarScope } from "@/lib/aurinko-calendar";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { log as auditLog } from "@/lib/audit/audit-log";
import {
  checkOAuthState,
  clearOAuthStateCookie,
  isOAuthStateEnforced,
} from "@/lib/oauth-state";
import { encryptToken } from "@/lib/token-crypto";

import {
  SESSION_COOKIE,
  verifySessionCookieValue,
} from "@/lib/session-cookie";

function getBaseUrl(req: NextRequest): string {
  try {
    const envUrl = process.env.NEXT_PUBLIC_URL;
    if (envUrl?.startsWith("http")) return envUrl;
    if (req.url) {
      const u = new URL(req.url);
      return `${u.protocol}//${u.host}`;
    }
  } catch {}
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);

  function mailRedirect(qs: Record<string, string>): NextResponse {
    const u = new URL("/mail", baseUrl);
    Object.entries(qs).forEach(([k, v]) => u.searchParams.set(k, v));
    const res = NextResponse.redirect(u);
    clearOAuthStateCookie(res);
    return res;
  }

  let userId: string | null = null;
  try {
    const { userId: clerkUserId } = await auth();
    const cookieUserId = await verifySessionCookieValue(
      req.cookies.get(SESSION_COOKIE)?.value,
    );
    userId = clerkUserId ?? cookieUserId;
  } catch (e) {
    calCbLog.error("[calendar-callback] auth() failed:", e);
    return NextResponse.json({ message: "Authentication check failed" }, { status: 500 });
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", baseUrl));
  }

  const params = req.nextUrl.searchParams;

  if (params.get("status") !== "success") {
    calCbLog.warn("[calendar-callback] User declined or OAuth failed - status:", params.get("status"));
    return mailRedirect({ error: "calendar_connect_cancelled" });
  }

  const code = params.get("code");
  if (!code) {
    return mailRedirect({ error: "calendar_connect_no_code" });
  }

  const stateCheck = checkOAuthState(req, params.get("state"));
  if (!stateCheck.ok) {
    if (isOAuthStateEnforced()) {
      calCbLog.warn("[calendar-callback] OAuth state rejected:", stateCheck.reason);
      return mailRedirect({ error: "oauth_state" });
    }
    calCbLog.warn("[calendar-callback] State check failed (enforcement disabled):", stateCheck.reason);
  }
  let token: Awaited<ReturnType<typeof exchangeAurinkoCodeForToken>>;
  try {
    token = await exchangeAurinkoCodeForToken(code);
    if (!token?.accessToken || !token?.accountId) {
      calCbLog.error("[calendar-callback] Token exchange missing required fields");
      return mailRedirect({ error: "calendar_token_failed" });
    }
  } catch (e) {
    calCbLog.error("[calendar-callback] Token exchange threw:", e);
    return mailRedirect({ error: "calendar_token_failed" });
  }

  const calendarAccountId = token.accountId;
  const calendarApiToken  = token.accountToken ?? token.accessToken;
  let calendarEmail: string;
  try {
    const info = await getAccountInfo(token.accessToken, calendarAccountId);
    if (!info?.email) {
      calCbLog.error("[calendar-callback] getAccountInfo returned no email - cannot verify identity");
      return mailRedirect({ error: "calendar_account_info_failed" });
    }
    calendarEmail = info.email.trim().toLowerCase();
  } catch (e) {
    calCbLog.error("[calendar-callback] getAccountInfo failed - cannot resolve gate email:", e);
    return mailRedirect({ error: "calendar_account_info_failed" });
  }

  const existingAccount = await db.account.findFirst({
    where: {
      emailAddress: { equals: calendarEmail, mode: "insensitive" },
      userId,
    },
    select: { id: true, emailAddress: true },
  });

  if (!existingAccount) {
    calCbLog.warn(
      "[calendar-callback] Account-match gate FAILED - calendar email has no matching Account for this user",
      { calendarEmail, userId },
    );
    return mailRedirect({ error: "calendar_account_mismatch" });
  }

  calCbLog.log("[calendar-callback] Account-match gate passed (email match)", {
    calendarAccountId,
    mailAccountId: existingAccount.id,
    email: calendarEmail,
  });

  if (calendarAccountId !== existingAccount.id) {
    calCbLog.log(
      "[calendar-callback] Aurinko issued new accountId for calendar scope - expected",
      { mailAccountId: existingAccount.id, calendarAccountId },
    );
  }
  calCbLog.log("[calendar-callback] Validating mail scope on calendar token...");
  const mailOk = await validateMailScope(calendarApiToken, calendarAccountId);
  if (!mailOk) {
    calCbLog.warn("[calendar-callback] Mail scope validation FAILED - no DB writes");
    return mailRedirect({ error: "calendar_scope_mail_missing" });
  }

  calCbLog.log("[calendar-callback] Validating calendar scope on calendar token...");
  const calendarOk = await validateCalendarScope(calendarApiToken, calendarAccountId);
  if (!calendarOk) {
    calCbLog.warn("[calendar-callback] Calendar scope validation FAILED - no DB writes");
    return mailRedirect({ error: "calendar_scope_calendar_missing" });
  }

  calCbLog.log("[calendar-callback] Both scopes confirmed - proceeding to write");
  const encryptedCalendarToken = encryptToken(calendarApiToken);

  await db.account.update({
    where: { id: existingAccount.id },
    data: {
      calendarEnabled: true,
      calendarAccountId,
      calendarToken: encryptedCalendarToken,
    },
  });

  auditLog({
    userId,
    action: "calendar_connected",
    resourceId: existingAccount.id,
    metadata: { emailAddress: existingAccount.emailAddress, calendarAccountId },
  });

  calCbLog.log("[calendar-callback] Calendar connect complete", {
    mailAccountId: existingAccount.id,
    calendarAccountId,
    email: calendarEmail,
  });

  return mailRedirect({ calendarConnected: "1" });
}

export async function POST(req: NextRequest) {
  return GET(req);
}

import { makeTagLogger } from "@/lib/logging/console-shim";
const calCbLog = makeTagLogger("api.calendar-callback");
