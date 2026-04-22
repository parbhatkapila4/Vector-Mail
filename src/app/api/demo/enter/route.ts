import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo/constants";

const SESSION_COOKIE = "vectormail_session_user";
const DEMO_SESSION_USER = "demo-user";

export function GET() {
  const response = NextResponse.redirect(new URL("/mail?demo=1", process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"));
  response.cookies.set(DEMO_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 });
  response.cookies.set(SESSION_COOKIE, DEMO_SESSION_USER, { path: "/", maxAge: 60 * 60 * 24 });
  return response;
}
