import { verifyToken } from "@clerk/backend";
import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionCookieValue,
} from "@/lib/session-cookie";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const token = req.nextUrl.searchParams.get("token");
  const redirectToParam = req.nextUrl.searchParams.get("redirectTo");
  const safeRedirectTo =
    redirectToParam && redirectToParam.startsWith("/")
      ? redirectToParam
      : "/mail";
  if (!token?.trim()) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const baseUrl = req.nextUrl.origin;
  const isSecure = req.nextUrl.protocol === "https:";
  const parties = [baseUrl, "http://localhost:3000", "https://localhost:3000", "https://app.vectormail.ai", "http://127.0.0.1:3000"];

  let userId: string | null = null;
  for (const useParties of [true, false]) {
    try {
      const verified = await verifyToken(token.trim(), {
        secretKey: process.env.CLERK_SECRET_KEY,
        ...(useParties ? { authorizedParties: parties } : {}),
      });
      const sub = (verified as { data?: { sub?: string } }).data?.sub;
      if (sub) {
        userId = sub;
        break;
      }
    } catch {
      if (!useParties) return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));
  const signed = await signSessionCookieValue(userId);
  if (!signed) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const res = NextResponse.redirect(new URL(safeRedirectTo, req.url));
  res.cookies.set(SESSION_COOKIE, signed, sessionCookieOptions(isSecure));
  return res;
}
