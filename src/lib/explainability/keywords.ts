const MAX_MATCHED_KEYWORDS = 10;

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}

export function tokenizeQuery(query: string): string[] {
  return query
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

export function getMatchedKeywords(
  query: string,
  subject: string,
  snippet: string,
  body: string,
): string[] {
  const terms = tokenizeQuery(query);
  if (terms.length === 0) return [];

  const subjectLower = (subject ?? "").toLowerCase();
  const snippetLower = (snippet ?? "").toLowerCase();
  const bodyLower = (body ?? "").slice(0, 2000).toLowerCase();

  const matched: string[] = [];
  for (const term of terms) {
    if (term.length < 2) continue;
    const inSubject = subjectLower.includes(term);
    const inSnippet = snippetLower.includes(term);
    const inBody = bodyLower.includes(term);
    if (inSubject || inSnippet || inBody) {
      matched.push(term);
      if (matched.length >= MAX_MATCHED_KEYWORDS) break;
    }
  }
  return matched;
}

export function buildHighlightedSnippet(
  snippet: string,
  matchedKeywords: string[],
): string {
  if (!snippet || matchedKeywords.length === 0) return escapeHtml(snippet);

  let out = escapeHtml(snippet);
  const lower = snippet.toLowerCase();

  for (const term of matchedKeywords) {
    if (term.length < 2) continue;
    const idx = lower.indexOf(term);
    if (idx === -1) continue;
    const exact = snippet.slice(idx, idx + term.length);
    const escapedExact = escapeHtml(exact);
    out = out.replace(escapedExact, "<mark>" + escapedExact + "</mark>");
  }
  return out;
}
