export function emailBodyToPlainTextForDraft(htmlOrText: string): string {
  if (!htmlOrText || typeof htmlOrText !== "string") return "";
  return htmlOrText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
