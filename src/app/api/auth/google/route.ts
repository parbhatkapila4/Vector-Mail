import { buildAurinkoGoogleAuthUrl } from "@/lib/aurinko";
import { NextResponse } from "next/server";
import {
  generateOAuthState,
  setOAuthStateCookie,
} from "@/lib/oauth-state";

export async function GET() {
  const state = generateOAuthState();
  const url = await buildAurinkoGoogleAuthUrl(state);
  const res = NextResponse.redirect(url);
  setOAuthStateCookie(res, state);
  return res;
}
