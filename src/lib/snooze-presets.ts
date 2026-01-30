import {
  addDays,
  isAfter,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";

export function getLaterToday(): Date {
  const now = new Date();
  const today6pm = setHours(setMinutes(startOfDay(now), 0), 18);
  return isAfter(now, today6pm)
    ? addDays(today6pm, 1)
    : today6pm;
}

export function getTomorrow(): Date {
  const tomorrow = addDays(new Date(), 1);
  return setHours(setMinutes(startOfDay(tomorrow), 0), 9);
}

export function getNextWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday =
    day === 0 ? 1 : day === 1 ? 7 : (8 - day) % 7;
  const nextMonday = addDays(now, daysUntilMonday);
  return setHours(setMinutes(startOfDay(nextMonday), 0), 9);
}
