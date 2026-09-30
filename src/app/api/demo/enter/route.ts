import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo/constants";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionCookieValue,
} from "@/lib/session-cookie";

const DEMO_SESSION_USER = "demo-user";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/mail?demo=1", request.url));
  response.cookies.set(DEMO_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 });
  const signed = await signSessionCookieValue(DEMO_SESSION_USER);
  if (signed) {
    const isSecure = new URL(request.url).protocol === "https:";
    response.cookies.set(SESSION_COOKIE, signed, sessionCookieOptions(isSecure));
  }

  return response;
}
