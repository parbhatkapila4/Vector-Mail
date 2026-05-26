import { buildAurinkoAuthUrlForService } from "@/lib/aurinko";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  generateOAuthState,
  setOAuthStateCookie,
} from "@/lib/oauth-state";

const SESSION_COOKIE = "vectormail_session_user";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  try {
    const { userId: clerkUserId } = await getAuth(req);
    const cookieUserId = req.cookies.get(SESSION_COOKIE)?.value?.trim() ?? null;
    const userId = clerkUserId ?? cookieUserId;
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", baseUrl));
    }
    const state = generateOAuthState();
    const url = buildAurinkoAuthUrlForService("Google", state);
    const res = NextResponse.redirect(url);
    setOAuthStateCookie(res, state);
    return res;
  } catch (e) {
    apiLog.error("[connect/google]", e);
    return NextResponse.redirect(new URL("/sign-in", baseUrl));
  }
}

import { makeTagLogger } from "@/lib/logging/console-shim";
const apiLog = makeTagLogger("api.connect-google");