import { addDays, setHours, setMinutes, startOfDay } from "date-fns";
import { format } from "date-fns";

export function getRemindAtInDays(days: number): Date {
  const d = addDays(new Date(), days);
  return setHours(setMinutes(startOfDay(d), 0), 9);
}

export const REMIND_PRESETS = [
  { days: 1, label: "In 1 day" },
  { days: 3, label: "In 3 days" },
  { days: 5, label: "In 5 days" },
  { days: 7, label: "In 1 week" },
] as const;

export function getRemindPresetLabel(days: number): string {
  const date = getRemindAtInDays(days);
  return `In ${days} day${days === 1 ? "" : "s"} (${format(date, "MMM d")})`;
}
