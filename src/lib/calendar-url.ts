import type { ExtractedEvent } from "./event-extraction";

function toGoogleDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

export function buildGoogleCalendarUrl(
  event: ExtractedEvent,
  options?: { description?: string },
): string {
  const start = toGoogleDate(event.startAt);
  const end = event.endAt ? toGoogleDate(event.endAt) : start;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });
  if (options?.description) {
    params.set("details", options.description);
  }
  if (event.location) {
    params.set("location", event.location);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsContent(
  event: ExtractedEvent,
  options?: { description?: string },
): string {
  const start = toGoogleDate(event.startAt);
  const end = event.endAt ? toGoogleDate(event.endAt) : start;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VectorMail//Event//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];
  if (options?.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(options.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeIcsText(s: string): string {
  return s.replace(/\r/g, "").replace(/\n/g, "\\n").replace(/[,;\\]/g, "\\$&");
}

export function downloadIcs(event: ExtractedEvent, filename: string, options?: { description?: string }): void {
  const content = buildIcsContent(event, options);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
