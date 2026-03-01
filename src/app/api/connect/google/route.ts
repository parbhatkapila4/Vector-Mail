import { buildAurinkoAuthUrlForService } from "@/lib/aurinko";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "vectormail_session_user";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  try {
    const { userId: clerkUserId } = await getAuth(req);
    const cookieUserId = req.cookies.get(SESSION_COOKIE)?.value?.trim() ?? null;
    const userId = clerkUserId ?? cookieUserId;
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", baseUrl));
    }
    const url = buildAurinkoAuthUrlForService("Google");
    return NextResponse.redirect(url);
  } catch (e) {
    console.error("[connect/google]", e);
    return NextResponse.redirect(new URL("/sign-in", baseUrl));
  }
}
