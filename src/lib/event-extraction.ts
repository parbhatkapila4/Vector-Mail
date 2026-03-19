import OpenAI from "openai";
import { env } from "@/env.js";
import { incrementLlmCall } from "@/lib/metrics/store";
import { recordUsage } from "@/lib/ai-usage";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    "X-Title": "VectorMail AI",
  },
});

const BODY_TRUNCATE = 2000;
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

export interface ExtractedEvent {
  title: string;
  startAt: string;
  endAt?: string;
  location?: string;
}

export interface ExtractEventInput {
  subject: string;
  body: string;
}

export async function extractEventFromEmail(
  email: ExtractEventInput,
  options?: { userId?: string; accountId?: string },
): Promise<ExtractedEvent | null> {
  const bodyContent = email.body?.trim() || "";
  const truncatedBody =
    bodyContent.length > BODY_TRUNCATE
      ? bodyContent.substring(0, BODY_TRUNCATE) + "..."
      : bodyContent;

  const prompt = `From this email, extract a single meeting or event if one is clearly described. Look for: date and time ("Tuesday 3pm", "March 15", "next week at 10", "webinar on Dec 5 at 2pm"), a short title (subject or first line, e.g. "Meeting with John" or "Product Launch"), and optional location ("Room 5", "Zoom", or a meeting URL). Include events mentioned in newsletters or invites (e.g. webinars, calls, demos) if they have a specific date and time.

If there is no clear date/time, return exactly: {"found": false}
If there is an event, return a JSON object only, no other text:
{"found": true, "title": "string", "startAt": "ISO8601 datetime", "endAt": "ISO8601 datetime or null", "location": "string or null"}

Use the current date when interpreting relative times (e.g. "next Tuesday"). If only a date is given with no time, use 09:00 in the user's local time (you may use a reasonable timezone like America/New_York or UTC). If only start time is clear, set endAt to start + 1 hour. Return ISO 8601 for startAt and endAt (e.g. 2026-03-15T15:00:00.000Z).

Email subject: ${email.subject}

Email body:
${truncatedBody}

JSON response:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-haiku",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 256,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (options?.userId) {
      const u = completion.usage;
      recordUsage({
        userId: options.userId,
        accountId: options.accountId ?? undefined,
        operation: "summary",
        inputTokens: u?.prompt_tokens ?? 0,
        outputTokens: u?.completion_tokens ?? 0,
        model: completion.model ?? undefined,
      });
    }
    incrementLlmCall();

    if (!raw) return null;

    const foundFalse = /"found"\s*:\s*false/i.test(raw);
    if (foundFalse && !/"found"\s*:\s*true/i.test(raw)) return null;

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0]! : raw;
    const parsed = JSON.parse(jsonStr) as {
      found?: boolean;
      title?: string;
      startAt?: string;
      endAt?: string | null;
      location?: string | null;
    };

    if (parsed.found === false || !parsed.startAt || !parsed.title) return null;

    const startAt = new Date(parsed.startAt);
    if (Number.isNaN(startAt.getTime())) return null;

    let endAt: string | undefined;
    if (parsed.endAt) {
      const end = new Date(parsed.endAt);
      if (!Number.isNaN(end.getTime())) endAt = end.toISOString();
    }
    if (!endAt) {
      endAt = new Date(startAt.getTime() + DEFAULT_DURATION_MS).toISOString();
    }

    return {
      title: String(parsed.title).trim() || email.subject || "Event",
      startAt: startAt.toISOString(),
      endAt,
      location: parsed.location ? String(parsed.location).trim() : undefined,
    };
  } catch (err) {
    console.error("Event extraction failed:", err);
    return null;
  }
}
