import { buildAurinkoGoogleAuthUrl } from "@/lib/aurinko";
import { NextResponse, type NextRequest } from "next/server";
import { generateOAuthState, setOAuthStateCookie } from "@/lib/oauth-state";
import { serverLog } from "@/lib/logging/server-logger";
import {
  ACCESS_GRANT_COOKIE,
  verifyAccessGrant,
} from "@/lib/access-grant";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const approvedEmail = await verifyAccessGrant(
    req.cookies.get(ACCESS_GRANT_COOKIE)?.value,
  );

  if (!approvedEmail) {
    serverLog.info(
      { evt: "oauth_start_denied", at: Date.now() },
      "[api.auth-google]",
    );
    const res = NextResponse.redirect(new URL("/?signin=1", req.url));
    res.cookies.set(ACCESS_GRANT_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  serverLog.info({ evt: "oauth_start", at: Date.now() }, "[api.auth-google]");
  const state = generateOAuthState();
  const url = await buildAurinkoGoogleAuthUrl(state, approvedEmail);
  const res = NextResponse.redirect(url);
  res.cookies.set(ACCESS_GRANT_COOKIE, "", { path: "/", maxAge: 0 });
  setOAuthStateCookie(res, state);
  return res;
}
