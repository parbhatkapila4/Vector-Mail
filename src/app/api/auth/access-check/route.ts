import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeEmail, MAX_EMAIL_LENGTH } from "@/lib/email-normalize";
import {
  ACCESS_GRANT_COOKIE,
  accessGrantCookieOptions,
  signAccessGrant,
} from "@/lib/access-grant";
import { makeTagLogger } from "@/lib/logging/console-shim";

const accessLog = makeTagLogger("api.access-check");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ email: z.string().max(MAX_EMAIL_LENGTH) });

async function isApproved(email: string): Promise<boolean> {
  const clerk = await clerkClient();

  const users = await clerk.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });
  if (users.totalCount > 0) return true;
  const invitations = await clerk.invitations.getInvitationList({
    status: "pending",
    query: email,
    limit: 50,
  });
  return invitations.data.some(
    (invitation) => normalizeEmail(invitation.emailAddress) === email,
  );
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "accessCheck");
  if (limited) return limited;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  const email = parsed.success ? normalizeEmail(parsed.data.email) : null;
  if (!email) {
    return NextResponse.json(
      { error: "Invalid email", message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  let approved = false;
  try {
    approved = await isApproved(email);
  } catch (error) {
    accessLog.error("clerk lookup failed, denying", error);
    approved = false;
  }

  if (!approved) {
    return NextResponse.json({ approved: false }, { status: 200 });
  }
  const grant = await signAccessGrant(email);
  if (!grant) {
    accessLog.error("no signing secret configured; cannot mint access grant");
    return NextResponse.json({ approved: false }, { status: 200 });
  }

  const res = NextResponse.json(
    { approved: true, redirectTo: "/api/auth/google" },
    { status: 200 },
  );
  res.cookies.set(
    ACCESS_GRANT_COOKIE,
    grant,
    accessGrantCookieOptions(req.nextUrl.protocol === "https:"),
  );
  return res;
}
