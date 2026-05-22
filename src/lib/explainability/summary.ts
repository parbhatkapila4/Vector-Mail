const MAX_EXCERPTS = 3;
const MAX_EXCERPT_LENGTH = 200;

function stripHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoSentences(text: string): string[] {
  if (!text.trim()) return [];
  const normalized = text.replace(/\s+/g, " ").trim();
  const parts = normalized.split(/(?<=[.!?])\s+/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1),
  );
}

export function getSummarySourceExcerpts(
  emailBody: string,
  summary: string,
  maxSentences: number = 2,
): string[] {
  const body = stripHtml(emailBody);
  const sum = (summary ?? "").trim();
  if (!body || body.length < 20) return [];
  if (!sum) {
    const sentences = splitIntoSentences(body);
    const first = sentences.slice(0, maxSentences).join(" ");
    if (!first.trim()) return [];
    return [
      first.length > MAX_EXCERPT_LENGTH
        ? first.slice(0, MAX_EXCERPT_LENGTH) + "…"
        : first,
    ];
  }

  const summaryTerms = tokenize(sum);
  const sentences = splitIntoSentences(body);
  if (sentences.length === 0) return [];

  if (summaryTerms.size === 0) {
    const first = sentences.slice(0, maxSentences).join(" ");
    return [
      first.length > MAX_EXCERPT_LENGTH
        ? first.slice(0, MAX_EXCERPT_LENGTH) + "…"
        : first,
    ];
  }

  const scored = sentences.map((sentence) => {
    const words = tokenize(sentence);
    let overlap = 0;
    for (const w of words) {
      if (summaryTerms.has(w)) overlap++;
    }
    return { sentence, overlap };
  });

  const withOverlap = scored.filter((s) => s.overlap > 0);
  const chosen =
    withOverlap.length > 0
      ? withOverlap
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, MAX_EXCERPTS)
        .map((s) => s.sentence)
      : [sentences.slice(0, maxSentences).join(" ")].filter(Boolean);

  return chosen.map((excerpt) =>
    excerpt.length > MAX_EXCERPT_LENGTH
      ? excerpt.slice(0, MAX_EXCERPT_LENGTH) + "…"
      : excerpt,
  );
}
