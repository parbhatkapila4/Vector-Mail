export type SourceLine = {
  index: number;
  subject: string;
  from: string;
  dateLabel: string;
  reason?: string;
  snippet?: string;
};

export function buildSourcesFooter(sources: SourceLine[]): string {
  if (sources.length === 0) return "";

  const lines = sources.map((s) => {
    const reason = s.reason ? ` | Match: ${s.reason}` : "";
    const snip = s.snippet
      ? `\n   Preview: ${s.snippet.slice(0, 160)}${s.snippet.length > 160 ? "…" : ""}`
      : "";
    return `${s.index}. ${s.subject}\n   From: ${s.from} | Date: ${s.dateLabel}${reason}${snip}`;
  });

  return `\n\n---\nSources (grounding)\n${lines.join("\n\n")}\n---`;
}

export function sourcesFromStoredEmail(
  emails: Array<{
    subject: string;
    from: { name: string | null; address: string };
    date: Date;
    snippet?: string;
  }>,
  matchReasons?: string[],
): SourceLine[] {
  return emails.slice(0, 5).map((e, i) => ({
    index: i + 1,
    subject: e.subject || "(No subject)",
    from: e.from.name || e.from.address,
    dateLabel: new Date(e.date).toLocaleDateString(),
    reason: matchReasons?.[i],
    snippet: e.snippet,
  }));
}
