import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo/is-demo-mode";
import { DEMO_COOKIE } from "@/lib/demo/constants";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionCookieValue,
  verifySessionCookieValue,
} from "@/lib/session-cookie";

const REQUEST_ID_HEADER = "x-request-id";
const DEMO_SESSION_USER = "demo-user";

const isProtectedRoute = createRouteMatcher(["/mail(.*)", "/buddy(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhook(.*)"]);
const isClerkAuthEntrance = createRouteMatcher([
  "/sign-in",
  "/sign-in/(.*)",
  "/sign-up",
  "/sign-up/(.*)",
]);
const isClerkAuthCompletion = createRouteMatcher(["/sign-in/sso-callback"]);
async function hasValidSessionCookie(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  return (await verifySessionCookieValue(cookie)) !== null;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev *.clerk.com https://clerk.vectormail.space https://*.vectormail.space",
      "script-src-elem 'self' 'unsafe-inline' *.clerk.accounts.dev *.clerk.com https://clerk.vectormail.space https://*.vectormail.space",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' *.clerk.accounts.dev *.clerk.com https://clerk.vectormail.space https://*.vectormail.space https://clerk-telemetry.com https://*.clerk-telemetry.com *.aurinko.io *.openai.com",
      "frame-src 'self' *.clerk.accounts.dev *.clerk.com https://clerk.vectormail.space https://*.vectormail.space https://accounts.vectormail.space",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' *.clerk.accounts.dev *.clerk.com https://*.vectormail.space",
      "object-src 'none'",
    ].join("; "),
  );
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/next/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/_next" + pathname.slice(5);
    return NextResponse.rewrite(url);
  }

  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  if (isClerkAuthEntrance(req) && !isClerkAuthCompletion(req)) {
    const { userId } = await auth();
    if (!userId) {
      const response = NextResponse.redirect(new URL("/", req.url));
      const requestId = req.headers.get(REQUEST_ID_HEADER);
      if (requestId?.trim()) response.headers.set(REQUEST_ID_HEADER, requestId.trim());
      applySecurityHeaders(response);
      return response;
    }
  }

  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    const isClerkSignedIn = Boolean(userId);
    if (isClerkSignedIn && userId) {
      const response = NextResponse.next();
      response.cookies.delete(DEMO_COOKIE);
      const signed = await signSessionCookieValue(userId);
      if (signed) {
        response.cookies.set(
          SESSION_COOKIE,
          signed,
          sessionCookieOptions(req.nextUrl.protocol === "https:"),
        );
      }
      const requestId = req.headers.get(REQUEST_ID_HEADER);
      if (requestId?.trim()) response.headers.set(REQUEST_ID_HEADER, requestId.trim());
      applySecurityHeaders(response);
      return response;
    }
    if (isDemoMode(req)) {
      const response = NextResponse.next();
      response.cookies.set(DEMO_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 });
      const signedDemo = await signSessionCookieValue(DEMO_SESSION_USER);
      if (signedDemo) {
        response.cookies.set(
          SESSION_COOKIE,
          signedDemo,
          sessionCookieOptions(req.nextUrl.protocol === "https:"),
        );
      }
      const requestId = req.headers.get(REQUEST_ID_HEADER);
      if (requestId?.trim()) response.headers.set(REQUEST_ID_HEADER, requestId.trim());
      applySecurityHeaders(response);
      return response;
    }
    if (!(await hasValidSessionCookie(req))) {
      const landingUrl = new URL("/", req.url).toString();
      await auth.protect({ unauthenticatedUrl: landingUrl });
    }
  }

  const response = NextResponse.next();

  const requestId = req.headers.get(REQUEST_ID_HEADER);
  if (requestId?.trim()) {
    response.headers.set(REQUEST_ID_HEADER, requestId.trim());
  }

  applySecurityHeaders(response);

  return response;
});

export const config = {
  matcher: [
    "/next/(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
