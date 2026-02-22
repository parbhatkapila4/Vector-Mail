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
  if (!html || typeof html !== "string") {
    return "";
  }

  let processedHtml = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    processedHtml = bodyMatch[1];
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatch && styleMatch.length > 0) {
      processedHtml = styleMatch.join("") + processedHtml;
    }
  }

  return DOMPurify.sanitize(processedHtml, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "strike",
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
      "tfoot",
      "tr",
      "td",
      "th",
      "img",
      "hr",
      "pre",
      "code",
      "font",
      "b",
      "i",
      "sub",
      "sup",
      "center",
      "section",
      "article",
      "header",
      "footer",
      "main",
      "style",
      "link",
      "button",
      "input",
      "label",
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
      "className",
      "id",
      "align",
      "valign",
      "colspan",
      "rowspan",
      "border",
      "cellpadding",
      "cellspacing",
      "bgcolor",
      "background",
      "color",
      "face",
      "size",
      "dir",
      "lang",
      "title",
      "data-*",
      "aria-*",
      "role",
      "type",
      "media",
      "margin",
      "margin-top",
      "margin-bottom",
      "margin-left",
      "margin-right",
      "padding",
      "padding-top",
      "padding-bottom",
      "padding-left",
      "padding-right",
      "name",
      "value",
      "for",
    ],
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    KEEP_CONTENT: true,
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
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
