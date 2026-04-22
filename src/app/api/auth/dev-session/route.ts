import { verifyToken } from "@clerk/backend";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "vectormail_session_user";

export async function GET(req: NextRequest) {
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

  const res = NextResponse.redirect(new URL(safeRedirectTo, req.url));
  res.cookies.set(SESSION_COOKIE, userId, {
    path: "/",
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
