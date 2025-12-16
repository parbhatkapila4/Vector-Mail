import { z } from "zod";
import DOMPurify from "dompurify";

export const emailSchema = z.object({
  to: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one recipient required"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(998, "Subject too long"),
  body: z.string().min(1, "Body is required"),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        size: z
          .number()
          .max(25 * 1024 * 1024, "Attachment too large (max 25MB)"),
        type: z.string(),
      }),
    )
    .optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1, "Search query required").max(500, "Query too long"),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const accountSchema = z.object({
  email: z.string().email("Invalid email address"),
  provider: z.enum(["google", "outlook", "imap"]),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export const threadSchema = z.object({
  threadId: z.string().uuid("Invalid thread ID"),
  limit: z.number().min(1).max(50).default(10),
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

export function sanitizeEmailHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "div",
      "span",
      "table",
      "tbody",
      "thead",
      "tr",
      "td",
      "th",
      "img",
      "hr",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "width",
      "height",
      "style",
      "class",
      "id",
      "align",
      "valign",
      "colspan",
      "rowspan",
      "border",
      "cellpadding",
      "cellspacing",
    ],
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, "").trim().slice(0, 1000);
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
