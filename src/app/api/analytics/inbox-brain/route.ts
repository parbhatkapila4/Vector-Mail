import { NextResponse } from "next/server";
import { z } from "zod";
import { INBOX_BRAIN_ANALYTICS_EVENTS } from "@/lib/analytics/inbox-brain";

const allowedEvents = new Set<string>([...INBOX_BRAIN_ANALYTICS_EVENTS]);

const bodySchema = z.object({
  event: z.string(),
  properties: z.record(z.unknown()).optional(),
});

function sanitizeProperties(
  raw: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!raw) return out;
  for (const [key, value] of Object.entries(raw)) {
    if (key.length > 48) continue;
    if (typeof value === "boolean") {
      out[key] = value;
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
      continue;
    }
    if (typeof value === "string" && value.length <= 64) {
      out[key] = value;
    }
  }
  return out;
}
export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") {
    return new NextResponse(null, { status: 204 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!allowedEvents.has(parsed.data.event)) {
    return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  const properties = sanitizeProperties(parsed.data.properties);

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.info("[inbox-brain-analytics]", parsed.data.event, properties);
  } else {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        kind: "inbox_brain_analytics",
        event: parsed.data.event,
        properties,
        ts: Date.now(),
      }),
    );
  }

  return NextResponse.json({ ok: true });
}
