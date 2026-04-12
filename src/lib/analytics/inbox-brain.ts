export const INBOX_BRAIN_ANALYTICS_EVENTS = [
  "inbox_brain_panel_opened",
  "daily_brief_refreshed",
  "daily_brief_focus_changed",
  "daily_brief_copied",
  "structured_chat_thread_chip_clicked",
  "thread_brain_expanded",
] as const;

export type InboxBrainAnalyticsEventName =
  (typeof INBOX_BRAIN_ANALYTICS_EVENTS)[number];

export type InboxBrainPanelOpenSource =
  | "sidebar"
  | "keyboard"
  | "toolbar_new_chat";

export type DailyBriefFilterKey =
  | "all"
  | "needsReply"
  | "important"
  | "lowPriority";

export function isInboxBrainAnalyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

export function trackInboxBrainEvent(
  name: InboxBrainAnalyticsEventName,
  properties?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isInboxBrainAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;

  const payload = {
    event: name,
    properties: Object.fromEntries(
      Object.entries(properties ?? {}).filter(
        ([, v]) => v !== undefined && v !== null,
      ),
    ) as Record<string, string | number | boolean>,
  };

  try {
    void fetch("/api/analytics/inbox-brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { });
  } catch {
  }
}
