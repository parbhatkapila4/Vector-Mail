import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/mail(.*)", "/buddy(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhook(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const response = NextResponse.next();

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

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev *.clerk.com clerk.parhbat.dev *.parhbat.dev clerk.parbhat.dev *.parbhat.dev",
        "script-src-elem 'self' 'unsafe-inline' *.clerk.accounts.dev *.clerk.com clerk.parhbat.dev *.parhbat.dev clerk.parbhat.dev *.parbhat.dev",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' *.clerk.accounts.dev *.clerk.com *.aurinko.io *.openai.com clerk.parhbat.dev *.parhbat.dev clerk.parbhat.dev *.parbhat.dev",
        "frame-src 'self' *.clerk.accounts.dev *.clerk.com clerk.parhbat.dev *.parhbat.dev clerk.parbhat.dev *.parbhat.dev",
      ].join("; "),
    );
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
