import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo/is-demo-mode";
import { DEMO_COOKIE } from "@/lib/demo/constants";

const REQUEST_ID_HEADER = "x-request-id";
const SESSION_COOKIE = "vectormail_session_user";
const DEMO_SESSION_USER = "demo-user";

const isProtectedRoute = createRouteMatcher(["/mail(.*)", "/buddy(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhook(.*)"]);

function hasSessionCookie(req: NextRequest): boolean {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  return Boolean(cookie?.trim());
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
      "connect-src 'self' *.clerk.accounts.dev *.clerk.com https://clerk.vectormail.space https://*.vectormail.space *.aurinko.io *.openai.com",
      "frame-src 'self' *.clerk.accounts.dev *.clerk.com https://clerk.vectormail.space https://*.vectormail.space https://accounts.vectormail.space",
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

  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    const isClerkSignedIn = Boolean(userId);
    if (isClerkSignedIn && userId) {
      const response = NextResponse.next();
      response.cookies.delete(DEMO_COOKIE);
      response.cookies.set(SESSION_COOKIE, userId, {
        path: "/",
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        secure: req.nextUrl.protocol === "https:",
        sameSite: "lax",
      });
      const requestId = req.headers.get(REQUEST_ID_HEADER);
      if (requestId?.trim()) response.headers.set(REQUEST_ID_HEADER, requestId.trim());
      applySecurityHeaders(response);
      return response;
    }
    if (isDemoMode(req)) {
      const response = NextResponse.next();
      response.cookies.set(DEMO_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 });
      response.cookies.set(SESSION_COOKIE, DEMO_SESSION_USER, { path: "/", maxAge: 60 * 60 * 24 });
      const requestId = req.headers.get(REQUEST_ID_HEADER);
      if (requestId?.trim()) response.headers.set(REQUEST_ID_HEADER, requestId.trim());
      applySecurityHeaders(response);
      return response;
    }
    if (!hasSessionCookie(req)) {
      const signInUrl = new URL("/sign-in", req.url).toString();
      await auth.protect({ unauthenticatedUrl: signInUrl });
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
