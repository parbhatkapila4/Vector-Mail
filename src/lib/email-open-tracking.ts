import { db } from "@/server/db";

const TRACKING_PIXEL_HTML = (url: string) =>
  `<img src="${url}" width="1" height="1" alt="" style="display:none" />`;

export function injectTrackingPixel(htmlBody: string, pixelUrl: string): string {
  const pixel = TRACKING_PIXEL_HTML(pixelUrl);
  const trimmed = htmlBody.trim();
  if (/<\/body\s*>/i.test(trimmed)) {
    return trimmed.replace(/<\/body\s*>/i, `${pixel}</body>`);
  }
  return trimmed + pixel;
}

export function getTrackingPixelUrl(trackingId: string): string {
  const base =
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://vectormail.space");
  return `${base}/api/track/open?id=${encodeURIComponent(trackingId)}`;
}

export async function createTrackingRecord(accountId: string): Promise<string> {
  const trackingId = crypto.randomUUID();
  await db.emailOpen.create({
    data: {
      trackingId,
      accountId,
    },
  });
  return trackingId;
}

export async function updateTrackingMessageId(
  trackingId: string,
  messageId: string,
): Promise<void> {
  await db.emailOpen.update({
    where: { trackingId },
    data: { messageId },
  });
}
