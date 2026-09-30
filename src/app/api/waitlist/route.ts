import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db, withDbRetry } from "@/server/db";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeEmail, MAX_EMAIL_LENGTH } from "@/lib/email-normalize";
import { notifyWaitlistSignup } from "@/lib/notify-waitlist";
import { makeTagLogger } from "@/lib/logging/console-shim";

const waitlistLog = makeTagLogger("api.waitlist");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ANSWER_LENGTH = 1000;

const bodySchema = z.object({
  email: z.string().max(MAX_EMAIL_LENGTH),
  inboxAnswer: z.string().max(MAX_ANSWER_LENGTH).optional(),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "waitlist");
  if (limited) return limited;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(parsed.data.email);
  if (!email) {
    return NextResponse.json(
      { error: "Invalid email", message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const inboxAnswer = parsed.data.inboxAnswer?.trim() || null;

  try {
    await withDbRetry(() =>
      db.waitlistEntry.upsert({
        where: { email },
        create: { email, inboxAnswer },
        update: inboxAnswer ? { inboxAnswer } : {},
      }),
    );
  } catch (error) {
    waitlistLog.error("failed to record waitlist entry", error);
    return NextResponse.json(
      {
        error: "Could not save",
        message: "Something went wrong saving your request. Please try again.",
      },
      { status: 500 },
    );
  }

  waitlistLog.log("waitlist signup", { email, hasAnswer: Boolean(inboxAnswer) });
  await notifyWaitlistSignup({ email, inboxAnswer });
  return NextResponse.json({ ok: true }, { status: 200 });
}
