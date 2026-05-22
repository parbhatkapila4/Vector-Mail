import { TRPCError } from "@trpc/server";
import { z } from "zod";
import pLimit from "p-limit";

import { protectedProcedure } from "@/server/api/trpc";
import { isDemoCall, isDemoCallFor } from "@/lib/demo/predicate";
import { getDemoUpcomingEvents } from "@/lib/demo/seed-demo-data";

import { authoriseAccountAccess } from "./shared";

const PROVIDER_LINK_RE =
  /\b(?:https?:\/\/)?(?:meet\.google\.com\/[a-z0-9-]+|[\w.-]+\.zoom\.us\/(?:j|my|w|s)\/[^\s<>"')]+|teams\.microsoft\.com\/l\/meetup-join\/[^\s<>"')]+)\b/i;
const PROVIDER_HINT_RE =
  /\b(google meet|meet\.google\.com|zoom|teams\.microsoft\.com|microsoft teams)\b/i;

const UPCOMING_LOOKBACK_DAYS = 60;
const EXTRACTION_CONCURRENCY = 4;

export const eventProcedures = {
  getEventForThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isDemoCallFor(ctx, input, (i) => i.threadId.startsWith("demo-"))) {
        return null;
      }
      const thread = await ctx.db.thread.findUnique({
        where: { id: input.threadId },
        include: {
          emails: {
            orderBy: { sentAt: "desc" },
            take: 1,
            select: {
              id: true,
              subject: true,
              body: true,
              bodySnippet: true,
            },
          },
        },
      });
      if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });

      const userAccountIds = await ctx.db.account
        .findMany({
          where: { userId: ctx.auth.userId },
          select: { id: true },
        })
        .then((rows) => new Set(rows.map((r) => r.id)));
      if (!userAccountIds.has(thread.accountId)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      const email = thread.emails[0];
      if (!email) return null;

      const body = email.body ?? email.bodySnippet ?? "";
      const { extractEventFromEmail } = await import("@/lib/event-extraction");
      const event = await extractEventFromEmail(
        { subject: email.subject, body },
        { userId: ctx.auth.userId, accountId: thread.accountId },
      );
      if (!event) return null;

      return {
        ...event,
        sourceEmailId: email.id,
        sourceThreadId: thread.id,
      };
    }),

  getUpcomingEventsFromEmails: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return { events: getDemoUpcomingEvents() };
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - UPCOMING_LOOKBACK_DAYS);

      const inboxEmails = await ctx.db.email.findMany({
        where: {
          sentAt: { gte: cutoff },
          OR: [
            { sysLabels: { hasSome: ["inbox"] } },
            { sysLabels: { hasSome: ["INBOX"] } },
            { sysLabels: { hasSome: ["sent"] } },
            { sysLabels: { hasSome: ["SENT"] } },
          ],
          NOT: {
            OR: [
              { sysLabels: { hasSome: ["trash", "spam", "junk"] } },
              { sysLabels: { hasSome: ["TRASH", "SPAM", "JUNK"] } },
            ],
          },
          thread: {
            accountId: account.id,
          },
        },
        orderBy: { sentAt: "desc" },
        select: {
          id: true,
          subject: true,
          bodySnippet: true,
          from: true,
          keywords: true,
          sysClassifications: true,
          meetingMessageMethod: true,
          sentAt: true,
          threadId: true,
        },
      });

      const candidateEmailIds: string[] = [];
      const candidateMeta = new Map<
        string,
        { threadId: string; sentAt: Date; subject: string; shouldFallbackToHeuristicEvent: boolean }
      >();
      for (const email of inboxEmails) {
        const subject = email.subject ?? "";
        const snippet = email.bodySnippet ?? "";
        const fromName = email.from?.name ?? "";
        const fromAddress = email.from?.address ?? "";
        const blob = `${subject}\n${snippet}\n${fromName}\n${fromAddress}\n${(email.keywords ?? []).join(" ")}`;
        const explicitMeeting = Boolean(email.meetingMessageMethod);
        const hasProviderHint = PROVIDER_HINT_RE.test(blob);
        if (!explicitMeeting && !hasProviderHint) continue;
        const shouldFallbackToHeuristicEvent = explicitMeeting;
        candidateEmailIds.push(email.id);
        candidateMeta.set(email.id, {
          threadId: email.threadId,
          sentAt: email.sentAt,
          subject: subject || "(No subject)",
          shouldFallbackToHeuristicEvent,
        });
      }

      if (candidateEmailIds.length === 0) {
        return { events: [] };
      }

      const candidateEmails = await ctx.db.email.findMany({
        where: { id: { in: candidateEmailIds } },
        select: {
          id: true,
          threadId: true,
          subject: true,
          body: true,
          bodySnippet: true,
          sentAt: true,
          meetingMessageMethod: true,
        },
      });

      const { extractEventFromEmail } = await import("@/lib/event-extraction");
      const limit = pLimit(EXTRACTION_CONCURRENCY);
      const results = await Promise.all(
        candidateEmails.map((email) =>
          limit(async () => {
            const bodyText = `${email.subject ?? ""}\n${email.bodySnippet ?? ""}\n${email.body ?? ""}`;
            const hasProviderLink = PROVIDER_LINK_RE.test(bodyText);
            if (!hasProviderLink) return null;
            const event = await extractEventFromEmail(
              { subject: email.subject, body: email.body ?? email.bodySnippet ?? "" },
              { userId: ctx.auth.userId, accountId: account.id },
            );
            if (event) {
              return {
                ...event,
                sourceEmailId: email.id,
                sourceThreadId: email.threadId,
              };
            }
            const meta = candidateMeta.get(email.id);
            if (email.meetingMessageMethod || meta?.shouldFallbackToHeuristicEvent) {
              return {
                title: email.subject || "Meeting email",
                startAt: email.sentAt.toISOString(),
                endAt: new Date(email.sentAt.getTime() + 60 * 60 * 1000).toISOString(),
                sourceEmailId: email.id,
                sourceThreadId: email.threadId,
              };
            }
            return null;
          }),
        ),
      );
      const events = results.filter((r): r is NonNullable<typeof r> => r !== null);
      const upcoming = events.filter((e) => new Date(e.startAt).getTime() >= now.getTime());
      const past = events.filter((e) => new Date(e.startAt).getTime() < now.getTime());
      upcoming.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      past.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
      const sorted = [...upcoming, ...past];
      const seen = new Set<string>();
      const deduped = sorted.filter((e) => {
        const key = `${e.title.slice(0, 40)}|${new Date(e.startAt).getTime()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      type EventItem = { title: string; startAt: string; endAt?: string; sourceEmailId: string; sourceThreadId: string };
      const saved = await ctx.db.savedCalendarEvent.findMany({
        where: { accountId: account.id, userId: ctx.auth.userId },
        orderBy: { startAt: "desc" },
        take: 30,
      });
      const savedMapped: EventItem[] = saved.map((s: { title: string; startAt: Date; endAt: Date | null; threadId: string }) => ({
        title: s.title,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt?.toISOString(),
        sourceEmailId: "",
        sourceThreadId: s.threadId,
      }));
      const byThread = new Map<string, EventItem>();
      savedMapped.forEach((e) => {
        if (!byThread.has(e.sourceThreadId)) byThread.set(e.sourceThreadId, e);
      });
      deduped.forEach((e) => {
        const existing = byThread.get(e.sourceThreadId);
        if (!existing) {
          byThread.set(e.sourceThreadId, { ...e, sourceEmailId: e.sourceEmailId });
          return;
        }
        const existingTs = new Date(existing.startAt).getTime();
        const nextTs = new Date(e.startAt).getTime();
        if (!Number.isNaN(nextTs) && (Number.isNaN(existingTs) || nextTs > existingTs)) {
          byThread.set(e.sourceThreadId, { ...e, sourceEmailId: e.sourceEmailId });
        }
      });
      const combined = Array.from(byThread.values());
      combined.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      const upcomingOnly = combined.filter((event) => {
        const endTs = event.endAt ? new Date(event.endAt).getTime() : Number.NaN;
        const startTs = new Date(event.startAt).getTime();
        if (Number.isFinite(endTs)) return endTs > now.getTime();
        return startTs > now.getTime();
      });

      return { events: upcomingOnly.slice(0, 20) };
    }),

  saveEventToCalendarList: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        threadId: z.string().min(1),
        title: z.string().min(1),
        startAt: z.string(),
        endAt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return { ok: true };
      }
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const startAt = new Date(input.startAt);
      const endAt = input.endAt ? new Date(input.endAt) : null;
      if (Number.isNaN(startAt.getTime())) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid startAt" });
      await ctx.db.savedCalendarEvent.create({
        data: {
          userId: ctx.auth.userId,
          accountId: input.accountId,
          threadId: input.threadId,
          title: input.title,
          startAt,
          endAt,
        },
      });
      return { ok: true };
    }),
};
