import { buildCalendarAuthUrl } from "@/lib/aurinko-calendar";
import { db } from "@/server/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateOAuthState, setOAuthStateCookie } from "@/lib/oauth-state";
import {
  SESSION_COOKIE,
  verifySessionCookieValue,
} from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  try {
    const { userId: clerkUserId } = await getAuth(req);
    const cookieUserId = await verifySessionCookieValue(
      req.cookies.get(SESSION_COOKIE)?.value,
    );
    const userId = clerkUserId ?? cookieUserId;

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", baseUrl));
    }


    const existing = await db.account.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.redirect(new URL("/mail?error=no_mail_account", baseUrl));
    }

    const state = generateOAuthState();
    const url = buildCalendarAuthUrl(state);
    const res = NextResponse.redirect(url);
    setOAuthStateCookie(res, state);
    return res;
  } catch (e) {
    calLog.error("[connect/calendar] Unhandled error:", e);
    return NextResponse.redirect(new URL("/mail?error=calendar_connect_failed", baseUrl));
  }
}

import { makeTagLogger } from "@/lib/logging/console-shim";
const calLog = makeTagLogger("api.connect-calendar");
