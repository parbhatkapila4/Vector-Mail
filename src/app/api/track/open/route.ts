import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export const runtime = "nodejs";


const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

const TRACKING_ID_REGEX = /^[a-zA-Z0-9_-]{10,64}$/;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id || typeof id !== "string" || !TRACKING_ID_REGEX.test(id.trim())) {
    return new NextResponse(null, { status: 204 });
  }

  const trackingId = id.trim();

  try {
    const record = await db.emailOpen.findUnique({
      where: { trackingId },
      select: { id: true, openedAt: true },
    });

    if (!record) {
      return new NextResponse(null, { status: 204 });
    }

    const userAgent = req.headers.get("user-agent") ?? undefined;
    const forwarded = req.headers.get("x-forwarded-for");
    const ip =
      typeof forwarded === "string"
        ? forwarded.split(",")[0]?.trim()
        : req.headers.get("x-real-ip") ?? undefined;

    if (record.openedAt === null) {
      await db.emailOpen.update({
        where: { trackingId },
        data: {
          openedAt: new Date(),
          userAgent,
          ip,
        },
      });
    }
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(PIXEL_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
    },
  });
}
