import { z } from "zod";

export const inboxAssistantTurnSchema = z.object({
  summary: z.string(),
  actions: z.array(z.string()).max(12),
  threads: z
    .array(
      z.object({
        threadId: z.string().min(1),
        label: z.string(),
        reason: z.string().optional(),
        confidence: z.enum(["High", "Medium", "Low"]).optional(),
      }),
    )
    .max(12),
});

export type InboxAssistantTurn = z.infer<typeof inboxAssistantTurnSchema>;
export function stripJsonFenceFromDisplay(raw: string): string {
  const fenceStart = raw.search(/```json\s*/i);
  if (fenceStart === -1) return raw.trimEnd();
  return raw.slice(0, fenceStart).trimEnd();
}

export function extractInboxAssistantTurn(raw: string): InboxAssistantTurn | null {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      const parsed = JSON.parse(fenced[1]!.trim()) as unknown;
      const r = inboxAssistantTurnSchema.safeParse(parsed);
      if (r.success) return r.data;
    } catch {
    }
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const r = inboxAssistantTurnSchema.safeParse(parsed);
      if (r.success) return r.data;
    } catch {
    }
  }

  return null;
}

export function proseFallbackTurn(raw: string): InboxAssistantTurn {
  const prose = stripJsonFenceFromDisplay(raw).trim();
  const lines = prose
    .split(/\n/)
    .map((l) => l.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
  const summary =
    lines[0]?.slice(0, 500) || prose.slice(0, 400) || "Here's what I found.";
  const actions = lines
    .slice(1, 8)
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 0 && l.length < 280);
  return {
    summary,
    actions: actions.length ? actions.slice(0, 5) : [],
    threads: [],
  };
}

export function getInboxAssistantView(raw: string): {
  turn: InboxAssistantTurn;
  detailProse?: string;
} {
  const prose = stripJsonFenceFromDisplay(raw).trim();
  let turn = extractInboxAssistantTurn(raw);
  if (!turn) {
    turn = proseFallbackTurn(raw);
  }

  let detailProse: string | undefined;
  if (
    prose &&
    prose !== turn.summary &&
    prose.length > (turn.summary?.length ?? 0) + 15
  ) {
    detailProse = prose;
  }

  return { turn, detailProse };
}

export function appendStructuredJsonFence(
  visibleText: string,
  turn: InboxAssistantTurn,
): string {
  const body = visibleText.trimEnd();
  const json = JSON.stringify(turn);
  return `${body}\n\n\`\`\`json\n${json}\n\`\`\``;
}
