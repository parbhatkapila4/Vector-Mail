import { TRPCError } from "@trpc/server";
import { z } from "zod";
import OpenAI from "openai";
import type { Prisma } from "@prisma/client";

import { protectedProcedure } from "@/server/api/trpc";
import { withDbRetry } from "@/server/db";
import { env } from "@/env.js";
import { checkUserRateLimit } from "@/lib/rate-limit";
import { checkDailyCap, recordUsage } from "@/lib/ai-usage";
import { isDemoCall } from "@/lib/demo/predicate";
import {
  getDemoNudges,
  getDemoDailyBrief,
  getDemoThreadBrain,
} from "@/lib/demo/seed-demo-data";
import { withCache } from "@/lib/cache";
import { makeTagLogger } from "@/lib/logging/console-shim";
import { isNonRepliable } from "@/lib/automation/non-repliable-detector";

import { authoriseAccountAccess, type AccountAccess } from "./shared";
const REPLY_INTENT_PATTERNS: { re: RegExp; weight: number; label: string }[] = [
  { re: /\?\s*$/m, weight: 10, label: "Ends with a question" },
  { re: /\bplease\s+(review|approve|confirm|sign|send|reply|respond|check|advise|share|provide)\b/i, weight: 9, label: "Direct ask of you" },
  { re: /\bawaiting (your|a) (reply|response|answer|input|approval|confirmation|review|signoff|sign[- ]?off)\b/i, weight: 9, label: "Awaiting your reply" },
  { re: /\bwaiting (on|for) (you|your)\b/i, weight: 9, label: "Waiting on you" },
  { re: /\b(could|can|would|will)\s+you\b/i, weight: 7, label: "Asked you a question" },
  { re: /\blet (me|us) know\b/i, weight: 6, label: "Asked for your input" },
  { re: /\b(your thoughts|any updates?|following up|follow[- ]up|circling back|checking in|wanted to check)\b/i, weight: 5, label: "Following up with you" },
  { re: /\b(when can|when will|what time|what's your|whats your)\b/i, weight: 6, label: "Asked you a question" },
  { re: /\?/, weight: 4, label: "Contains a question" },
];

function scoreReplyIntent(text: string): { score: number; label: string | null } {
  if (!text) return { score: 0, label: null };
  let best = { score: 0, label: null as string | null };
  for (const { re, weight, label } of REPLY_INTENT_PATTERNS) {
    if (re.test(text) && weight > best.score) {
      best = { score: weight, label };
    }
  }
  return best;
}

const briefingLog = makeTagLogger("account-router.briefing");

type ThreadBrainEmailRow = {
  summary: string | null;
  bodySnippet: string | null;
  from: { address: string; name: string | null };
  sentAt: Date;
};

function buildThreadBrainFallback(
  subject: string,
  emails: ThreadBrainEmailRow[],
  accountEmailLower: string,
): {
  about: string;
  expectedFromMe: string;
  expectedReason: string;
  expectedConfidence: "High" | "Medium" | "Low";
} {
  if (emails.length === 0) {
    return {
      about: subject.slice(0, 400),
      expectedFromMe: "Open the messages below to see what might be needed from you.",
      expectedReason: "No message history available yet in this thread.",
      expectedConfidence: "Low",
    };
  }
  let lastInbound: ThreadBrainEmailRow | null = null;
  for (let i = emails.length - 1; i >= 0; i--) {
    const e = emails[i]!;
    if (e.from.address.toLowerCase() !== accountEmailLower) {
      lastInbound = e;
      break;
    }
  }
  const last = emails[emails.length - 1]!;
  const lastIsInbound =
    last.from.address.toLowerCase() !== accountEmailLower;
  const snippetSource = lastInbound ?? last;
  const snippet =
    snippetSource.summary?.trim() || snippetSource.bodySnippet?.trim() || "";
  const about = `${subject}${snippet ? ` - ${snippet.slice(0, 280)}` : ""}`.slice(
    0,
    480,
  );
  const expectedFromMe = lastIsInbound
    ? "Their latest message may need a reply or action from you."
    : "You sent the latest message; you may be waiting on them.";
  const daysAgo = Math.max(
    0,
    Math.round((Date.now() - new Date(last.sentAt).getTime()) / (24 * 60 * 60 * 1000)),
  );
  const expectedReason = lastIsInbound
    ? `Last message is from an external sender ${daysAgo}d ago.`
    : `Latest message was sent by you ${daysAgo}d ago.`;
  return {
    about,
    expectedFromMe,
    expectedReason,
    expectedConfidence: lastIsInbound ? "High" : "Medium",
  };
}

export const briefingProcedures = {
  getInboxIntelligenceCards: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return {
          cards: [
            {
              id: "payments",
              title: "Payments & receipts",
              count: 4,
              subtitle: "4 in last 90 days · tap to search",
              suggestedQuery: "Show receipts and payments",
            },
            {
              id: "travel",
              title: "Travel & flights",
              count: 2,
              subtitle: "2 in last 90 days · tap to search",
              suggestedQuery: "Find my flight bookings",
            },
            {
              id: "orders",
              title: "Orders & delivery",
              count: 3,
              subtitle: "3 in last 90 days · tap to search",
              suggestedQuery: "Show me emails about orders",
            },
          ],
        };
      }
      try {
        await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const since = new Date();
      since.setDate(since.getDate() - 90);
      const since30 = new Date();
      since30.setDate(since30.getDate() - 30);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const clusterDefs = [
        {
          id: "payments",
          title: "Payments & receipts",
          terms: ["payment", "receipt", "invoice", "upi", "debited", "credited", "transaction"],
          suggestedQuery: "Show receipts and payments",
        },
        {
          id: "travel",
          title: "Travel & flights",
          terms: ["flight", "airline", "booking", "itinerary", "pnr", "hotel", "boarding pass"],
          suggestedQuery: "Find my flight bookings",
        },
        {
          id: "orders",
          title: "Orders & delivery",
          terms: ["order", "shipped", "delivery", "tracking", "dispatch", "out for delivery"],
          suggestedQuery: "Show me emails about orders",
        },
        {
          id: "failed",
          title: "Failed / declined",
          terms: ["declined", "failed", "unsuccessful", "could not process", "insufficient"],
          suggestedQuery: "Show failed or declined payments from my emails",
        },
        {
          id: "meetings",
          title: "Meetings & calendar",
          terms: ["meeting", "invite", "calendar", "rsvp", "appointment", "zoom", "google meet"],
          suggestedQuery: "Show me meeting invites and calendar threads",
        },
        {
          id: "newsletters",
          title: "Newsletters",
          terms: ["unsubscribe", "newsletter", "digest", "weekly edition", "subscribed"],
          suggestedQuery: "Show me newsletters and subscriptions",
        },
        {
          id: "security",
          title: "Security & alerts",
          terms: ["security alert", "new sign-in", "verification code", "verify your", "two-factor", "password reset"],
          suggestedQuery: "Show security and account alerts",
        },
        {
          id: "dev",
          title: "Code & dev",
          terms: ["pull request", "github", "gitlab", "deploy", "build failed", "ci/cd", "vercel"],
          suggestedQuery: "Show GitHub and deployment emails",
        },
      ] as const;

      type Card = {
        id: string;
        title: string;
        count: number;
        subtitle: string;
        suggestedQuery: string;
      };
      const cards: Card[] = [];

      const clusterCounts = await Promise.all(
        clusterDefs.map(async (c) => {
          const orConditions: Prisma.EmailWhereInput[] = [];
          for (const t of c.terms) {
            orConditions.push(
              { subject: { contains: t, mode: "insensitive" } },
              { bodySnippet: { contains: t, mode: "insensitive" } },
            );
          }
          const count = await withDbRetry(() =>
            ctx.db.email.count({
              where: {
                thread: { accountId: input.accountId },
                sentAt: { gte: since },
                OR: orConditions,
              },
            }),
          );
          return { def: c, count };
        }),
      );
      for (const { def, count } of clusterCounts) {
        if (count > 0) {
          cards.push({
            id: def.id,
            title: def.title,
            count,
            subtitle: `${count} in last 90 days · tap to search`,
            suggestedQuery: def.suggestedQuery,
          });
        }
      }

      cards.sort((a, b) => b.count - a.count);

      const todayCount = await withDbRetry(() =>
        ctx.db.email.count({
          where: {
            thread: { accountId: input.accountId },
            sentAt: { gte: todayStart },
          },
        }),
      );
      if (todayCount > 0) {
        cards.unshift({
          id: "today",
          title: "Arrived today",
          count: todayCount,
          subtitle:
            todayCount === 1
              ? "1 message · tap to summarize"
              : `${todayCount} messages · tap to summarize`,
          suggestedQuery: "Summarize today's mail",
        });
      }

      try {
        const access = await authoriseAccountAccess(
          input.accountId,
          ctx.auth.userId,
        );
        const ownLower = (access.emailAddress ?? "").toLowerCase();
        const topSenderRows = await withDbRetry(() =>
          ctx.db.email.groupBy({
            by: ["fromId"],
            where: {
              thread: { accountId: input.accountId },
              sentAt: { gte: since30 },
            },
            _count: { _all: true },
            orderBy: { _count: { fromId: "desc" } },
            take: 5,
          }),
        );
        for (const row of topSenderRows) {
          if (row._count._all < 3) continue;
          const from = await withDbRetry(() =>
            ctx.db.emailAddress.findUnique({
              where: { id: row.fromId },
              select: { address: true, name: true },
            }),
          );
          if (!from) continue;
          if (ownLower && from.address.toLowerCase() === ownLower) continue;
          const display =
            (from.name && from.name.trim().split(/\s+/)[0]) ||
            from.address.split("@")[0];
          if (!display) continue;
          cards.unshift({
            id: `top-sender:${from.address}`,
            title: `From ${display}`,
            count: row._count._all,
            subtitle: `${row._count._all} in last 30 days · tap to read`,
            suggestedQuery: `Show me emails from ${from.address}`,
          });
          break;
        }
      } catch {
      }

      return { cards: cards.slice(0, 10) };
    }),

  getNudges: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return { nudges: getDemoNudges() };
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const now = new Date();
      const NUDGE_CAP = 15;
      const UNREPLIED_DAYS = 30;
      const unrepliedCutoff = new Date(now);
      unrepliedCutoff.setDate(unrepliedCutoff.getDate() - UNREPLIED_DAYS);

      const nudges: Array<{
        threadId: string;
        type: "REMINDER" | "UNREPLIED";
        reason: string;
        thread?: {
          subject: string;
          lastMessageDate: Date;
          snippet?: string | null;
          remindAt?: Date | null;
        };
      }> = [];

      const dueReminderThreads = await ctx.db.thread.findMany({
        where: {
          accountId: account.id,
          remindAt: { not: null, lte: now },
          emails: {
            none: { sysLabels: { hasSome: ["trash"] } },
          },
        },
        orderBy: { remindAt: "asc" },
        take: NUDGE_CAP,
        select: {
          id: true,
          subject: true,
          lastMessageDate: true,
          remindAt: true,
          emails: {
            orderBy: { sentAt: "desc" },
            take: 1,
            select: { bodySnippet: true },
          },
        },
      });
      for (const t of dueReminderThreads) {
        nudges.push({
          threadId: t.id,
          type: "REMINDER",
          reason: "Reminder",
          thread: {
            subject: t.subject,
            lastMessageDate: t.lastMessageDate,
            snippet: t.emails[0]?.bodySnippet ?? null,
            remindAt: t.remindAt,
          },
        });
      }

      const candidateUnreplied = await ctx.db.thread.findMany({
        where: {
          accountId: account.id,
          inboxStatus: true,
          lastMessageDate: { gte: unrepliedCutoff },
          OR: [
            { snoozedUntil: null },
            { snoozedUntil: { lte: now } },
          ],
          emails: {
            none: { sysLabels: { hasSome: ["trash"] } },
          },
        },
        orderBy: { lastMessageDate: "desc" },
        take: 200,
        select: {
          id: true,
          subject: true,
          lastMessageDate: true,
          threadLabels: { select: { label: { select: { name: true } } } },
          emails: {
            orderBy: { sentAt: "desc" },
            take: 1,
            select: {
              subject: true,
              bodySnippet: true,
              keywords: true,
              sysClassifications: true,
              from: { select: { address: true } },
            },
          },
        },
      });
      const accountEmailLower = account.emailAddress.toLowerCase();
      const existingReminderIds = new Set(dueReminderThreads.map((t) => t.id));
      let unrepliedAdded = 0;
      for (const t of candidateUnreplied) {
        if (unrepliedAdded >= NUDGE_CAP) break;
        if (existingReminderIds.has(t.id)) continue;

        const latestEmail = t.emails[0];
        if (!latestEmail?.from?.address) continue;
        if (latestEmail.from.address.toLowerCase() === accountEmailLower) continue;

        const sysC = (latestEmail.sysClassifications ?? []).map((c) =>
          String(c).toLowerCase(),
        );
        const labelNames = t.threadLabels.map((tl) =>
          tl.label.name.toLowerCase(),
        );
        const kw = (latestEmail.keywords ?? []).map((k) => String(k).toLowerCase());
        const blob = [
          t.subject ?? "",
          latestEmail.subject ?? "",
          latestEmail.bodySnippet ?? "",
          ...kw,
        ]
          .join(" ")
          .toLowerCase();

        const isPromoLike =
          sysC.some((c) =>
            ["promotions", "social", "updates", "forums"].includes(c),
          ) ||
          labelNames.some((n) =>
            /\b(promotion|promotions|newsletter|marketing|unsubscribe|bulk|social|updates|forums)\b/.test(
              n,
            ),
          ) ||
          /\b(newsletter|promo|promotional|marketing|unsubscribe|sale|offer|discount|deal|profile views?|job (alert|opportunit|recommendation))\b/.test(
            blob,
          );
        if (isPromoLike) continue;

        if (
          isNonRepliable({
            senderAddress: latestEmail.from.address,
            subject: latestEmail.subject ?? t.subject,
            bodySnippet: latestEmail.bodySnippet,
          }).skip
        ) {
          continue;
        }

        nudges.push({
          threadId: t.id,
          type: "UNREPLIED",
          reason: "You haven't replied",
          thread: {
            subject: t.subject,
            lastMessageDate: t.lastMessageDate,
            snippet: latestEmail.bodySnippet ?? null,
          },
        });
        unrepliedAdded++;
      }

      return { nudges };
    }),

  getDailyBrief: protectedProcedure
    .input(z.object({ accountId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return getDemoDailyBrief();
      }
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const cacheKey = `dailyBrief:v3:${ctx.auth.userId}:${account.id}`;
      return withCache(
        cacheKey,
        async () => {
          const now = new Date();
          const BRIEF_CAP = 10;
          const TODAY_WINDOW_MS = 24 * 60 * 60 * 1000;
          const todayCutoff = new Date(now.getTime() - TODAY_WINDOW_MS);

          type BriefRow = {
            threadId: string;
            subject: string;
            lastMessageDate: Date;
            reason: string;
            confidence?: "High" | "Medium" | "Low";
          };

          const needsReply: BriefRow[] = [];
          const needsIds = new Set<string>();

          const dueReminderThreads = await ctx.db.thread.findMany({
            where: {
              accountId: account.id,
              remindAt: { not: null, lte: now },
              emails: {
                none: { sysLabels: { hasSome: ["trash"] } },
              },
            },
            orderBy: { remindAt: "asc" },
            take: BRIEF_CAP,
            select: {
              id: true,
              subject: true,
              lastMessageDate: true,
            },
          });
          for (const t of dueReminderThreads) {
            if (needsReply.length >= BRIEF_CAP) break;
            needsReply.push({
              threadId: t.id,
              subject: t.subject || "(No subject)",
              lastMessageDate: t.lastMessageDate,
              reason: "Reminder due",
              confidence: "High",
            });
            needsIds.add(t.id);
          }

          const candidateUnreplied = await ctx.db.thread.findMany({
            where: {
              accountId: account.id,
              inboxStatus: true,
              lastMessageDate: { gte: todayCutoff },
              OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
              emails: {
                none: { sysLabels: { hasSome: ["trash"] } },
              },
            },
            orderBy: { lastMessageDate: "desc" },
            take: 100,
            select: {
              id: true,
              subject: true,
              lastMessageDate: true,
              threadLabels: {
                select: { label: { select: { name: true } } },
              },
              emails: {
                orderBy: { sentAt: "desc" },
                take: 1,
                select: {
                  from: { select: { address: true, name: true } },
                  subject: true,
                  bodySnippet: true,
                  keywords: true,
                  sysClassifications: true,
                },
              },
            },
          });
          const accountEmailLower = account.emailAddress.toLowerCase();

          const nonRepliableHere = new Set<string>();
          const nonRepliableRows: BriefRow[] = [];
          type ScoredRow = BriefRow & { score: number };
          const scoredCandidates: ScoredRow[] = [];
          for (const t of candidateUnreplied) {
            const latestEmail = t.emails[0];
            if (!latestEmail?.from?.address) continue;
            if (latestEmail.from.address.toLowerCase() === accountEmailLower) continue;
            if (needsIds.has(t.id)) continue;

            const sysC = (latestEmail.sysClassifications ?? []).map((c) =>
              String(c).toLowerCase(),
            );
            const labelNames = t.threadLabels.map((tl) =>
              tl.label.name.toLowerCase(),
            );
            const kw = (latestEmail.keywords ?? []).map((k) =>
              String(k).toLowerCase(),
            );
            const blob = [
              t.subject ?? "",
              latestEmail.subject ?? "",
              latestEmail.bodySnippet ?? "",
              ...kw,
            ]
              .join(" ")
              .toLowerCase();
            const isPromoLike =
              sysC.some((c) =>
                ["promotions", "social", "updates", "forums"].includes(c),
              ) ||
              labelNames.some((n) =>
                /\b(promotion|promotions|newsletter|marketing|unsubscribe|bulk|social|updates|forums)\b/.test(
                  n,
                ),
              ) ||
              /\b(newsletter|promo|promotional|marketing|unsubscribe|sale|offer|discount|deal)\b/.test(
                blob,
              );
            if (isPromoLike) continue;

            const nonRep = isNonRepliable({
              senderAddress: latestEmail.from.address,
              subject: latestEmail.subject ?? t.subject,
              bodySnippet: latestEmail.bodySnippet,
            });
            if (nonRep.skip) {
              if (!nonRepliableHere.has(t.id)) {
                nonRepliableHere.add(t.id);
                nonRepliableRows.push({
                  threadId: t.id,
                  subject: t.subject || "(No subject)",
                  lastMessageDate: t.lastMessageDate,
                  reason: "Automated notice - no human to reply to",
                  confidence: "High",
                });
              }
              continue;
            }

            const replyText = `${latestEmail.subject ?? t.subject ?? ""}\n${latestEmail.bodySnippet ?? ""}`;
            const intent = scoreReplyIntent(replyText);
            const daysAgo = Math.max(
              0,
              Math.round(
                (Date.now() - new Date(t.lastMessageDate).getTime()) /
                (24 * 60 * 60 * 1000),
              ),
            );
            const recencyBoost = Math.max(0, 4 - daysAgo);
            const score = intent.score + recencyBoost;

            const senderDisplay =
              latestEmail.from.name?.trim() ||
              latestEmail.from.address.split("@")[0] ||
              "sender";
            const reason = intent.label
              ? `${intent.label} · ${senderDisplay}`
              : `From ${senderDisplay} · ${daysAgo === 0 ? "today" : `${daysAgo}d ago`}`;
            const confidence: "High" | "Medium" | "Low" =
              intent.score >= 9 ? "High" : intent.score >= 5 ? "Medium" : "Low";

            scoredCandidates.push({
              threadId: t.id,
              subject: t.subject || "(No subject)",
              lastMessageDate: t.lastMessageDate,
              reason,
              confidence,
              score,
            });
          }
          scoredCandidates.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (
              new Date(b.lastMessageDate).getTime() -
              new Date(a.lastMessageDate).getTime()
            );
          });
          for (const row of scoredCandidates) {
            if (needsReply.length >= BRIEF_CAP) break;
            const { score: _score, ...briefRow } = row;
            needsReply.push(briefRow);
            needsIds.add(row.threadId);
          }

          const URGENCY_RE = /\b(urgent|asap|immediately|deadline|eod|eow|invoice|contract|legal|litigation|board|investor|due today|time[\s-]?sensitive)\b/i;
          const LOW_SUBJ_RE = /\b(newsletter|digest|weekly wrap|unsubscribe|promo|black\s*friday|\d+%\s*off|sale ends|your receipt is|no[\s-]?reply)\b/i;

          const briefCandidates = await ctx.db.thread.findMany({
            where: {
              accountId: account.id,
              inboxStatus: true,
              lastMessageDate: { gte: todayCutoff },
              OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
              emails: {
                none: { sysLabels: { hasSome: ["trash"] } },
              },
            },
            orderBy: { lastMessageDate: "desc" },
            take: 100,
            select: {
              id: true,
              subject: true,
              lastMessageDate: true,
              threadLabels: {
                select: { label: { select: { name: true } } },
              },
              emails: {
                orderBy: { sentAt: "desc" },
                take: 1,
                select: {
                  subject: true,
                  bodySnippet: true,
                  keywords: true,
                  sysLabels: true,
                  sysClassifications: true,
                  sensitivity: true,
                  meetingMessageMethod: true,
                  from: { select: { address: true } },
                },
              },
            },
          });

          const important: BriefRow[] = [];
          const lowPriority: BriefRow[] = [];
          for (const row of nonRepliableRows) {
            if (lowPriority.length >= BRIEF_CAP) break;
            lowPriority.push(row);
          }

          const labelImportant = (names: string[]) =>
            names.some((n) => /\bimportant\b/i.test(n));
          const labelLow = (names: string[]) =>
            names.some((n) =>
              /\b(promotion|promotions|newsletter|marketing|unsubscribe|bulk)\b/i.test(n),
            );

          for (const t of briefCandidates) {
            if (needsIds.has(t.id)) continue;
            if (nonRepliableHere.has(t.id)) {
              continue;
            }
            if (important.length >= BRIEF_CAP && lowPriority.length >= BRIEF_CAP) break;

            const latest = t.emails[0];
            if (!latest) continue;
            const labelNames = t.threadLabels.map((tl) => tl.label.name);
            const sysL = (latest.sysLabels ?? []).map((s) => String(s).toLowerCase());
            const sysC = (latest.sysClassifications ?? []).map((s) =>
              String(s).toLowerCase(),
            );
            const kw = (latest.keywords ?? []).map((k) => String(k).toLowerCase());
            const blob = [t.subject, latest.subject, latest.bodySnippet ?? "", ...kw].join(
              " ",
            );

            const senderAddr = latest.from?.address ?? "";
            const isAuto = senderAddr
              ? isNonRepliable({
                senderAddress: senderAddr,
                subject: latest.subject ?? t.subject,
                bodySnippet: latest.bodySnippet,
              }).skip
              : false;

            let impReason: string | null = null;
            let impConfidence: "High" | "Medium" | "Low" | null = null;

            if (labelImportant(labelNames)) {
              impReason = "Marked Important";
              impConfidence = "High";
            }
            else if (sysL.includes("starred")) {
              impReason = "Starred in Gmail";
              impConfidence = "High";
            }
            else if (sysL.includes("important") && !isAuto) {
              impReason = "Flagged important";
              impConfidence = "High";
            }
            else if (
              latest.sensitivity === "confidential" ||
              latest.sensitivity === "private"
            ) {
              impReason = "Sensitive (confidential / private)";
              impConfidence = "Medium";
            }
            else if (latest.meetingMessageMethod) {
              impReason = "Calendar meeting or invite";
              impConfidence = "Medium";
            }
            else if (!isAuto && kw.some((k) => URGENCY_RE.test(k))) {
              impReason = "Keywords look time-sensitive";
              impConfidence = "Medium";
            }
            else if (!isAuto && URGENCY_RE.test(blob)) {
              impReason = "Looks time-sensitive or high-stakes";
              impConfidence = "Medium";
            }

            if (impReason && impConfidence) {
              if (important.length < BRIEF_CAP) {
                important.push({
                  threadId: t.id,
                  subject: t.subject || "(No subject)",
                  lastMessageDate: t.lastMessageDate,
                  reason: impReason,
                  confidence: impConfidence,
                });
              }
              continue;
            }

            if (lowPriority.length >= BRIEF_CAP) continue;

            let lowReason: string | null = null;
            let lowConfidence: "High" | "Medium" | "Low" = "Medium";
            if (sysC.includes("promotions")) {
              lowReason = "Promotions category";
              lowConfidence = "High";
            } else if (sysC.includes("social")) {
              lowReason = "Social category";
              lowConfidence = "High";
            } else if (sysC.includes("forums")) {
              lowReason = "Forums category";
              lowConfidence = "High";
            } else if (labelLow(labelNames)) {
              lowReason = "Bulk / marketing label";
            } else if (
              kw.some((k) =>
                /\b(newsletter|promotional|marketing|unsubscribe|digest)\b/i.test(k),
              )
            ) {
              lowReason = "Newsletter or bulk keywords";
            } else if (LOW_SUBJ_RE.test(blob)) {
              lowReason = "Likely newsletter or promo";
            } else if (isAuto) {
              lowReason = "Automated notice - no human to reply to";
              lowConfidence = "High";
            }

            if (lowReason) {
              lowPriority.push({
                threadId: t.id,
                subject: t.subject || "(No subject)",
                lastMessageDate: t.lastMessageDate,
                reason: lowReason,
                confidence: lowConfidence,
              });
            }
          }

          return { needsReply, important, lowPriority };
        },
        60_000,
      );
    }),

  getThreadBrain: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        accountId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        return getDemoThreadBrain(input.threadId);
      }

      let account: AccountAccess;
      try {
        account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found or access denied",
        });
      }

      const thread = await ctx.db.thread.findFirst({
        where: { id: input.threadId, accountId: account.id },
        select: {
          subject: true,
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              summary: true,
              bodySnippet: true,
              sentAt: true,
              from: { select: { address: true, name: true } },
            },
          },
        },
      });

      if (!thread) {
        return {
          about: "This thread is not available right now.",
          expectedFromMe:
            "Try selecting another thread, or refresh the inbox if this was just synced.",
          expectedReason:
            "The thread may have moved accounts or is still loading from sync.",
          expectedConfidence: "Low" as const,
        };
      }

      const accountEmailLower = account.emailAddress.toLowerCase();
      const fallback = buildThreadBrainFallback(
        thread.subject || "(No subject)",
        thread.emails,
        accountEmailLower,
      );

      const aiLimit = checkUserRateLimit(ctx.auth.userId, "ai");
      if (!aiLimit.allowed || !env.OPENROUTER_API_KEY) {
        return fallback;
      }

      const cap = await checkDailyCap(ctx.auth.userId, env.AI_DAILY_CAP_TOKENS);
      if (!cap.allowed) {
        return fallback;
      }

      try {
        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: env.OPENROUTER_API_KEY,
          defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
            "X-Title": "VectorMail AI",
          },
        });

        const lines = thread.emails.map((e, i) => {
          const from = e.from.name || e.from.address;
          const bit = (e.summary || e.bodySnippet || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 220);
          return `${i + 1}. From ${from} | ${bit || "(no preview)"}`;
        });

        const prompt = `The mailbox owner is the account holder (incoming mail is addressed to them).

Thread subject: ${thread.subject}

Messages in chronological order (oldest to newest):
${lines.join("\n")}

Return JSON only with this shape:
{"about":"1-2 sentences: what this thread is about","expectedFromMe":"1-2 sentences: what the mailbox owner should do next (reply, wait, archive, or say if unclear)","expectedReason":"short plain-English why this recommendation matters","expectedConfidence":"High|Medium|Low"}`;

        const completion = await openai.chat.completions.create({
          model: "anthropic/claude-3.5-haiku",
          messages: [
            {
              role: "system",
              content:
                "You triage email threads for the inbox owner. Use only the provided lines. Output valid JSON only.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 220,
          temperature: 0.2,
          response_format: { type: "json_object" },
        });

        recordUsage({
          userId: ctx.auth.userId,
          accountId: account.id,
          operation: "chat",
          inputTokens: completion.usage?.prompt_tokens ?? 0,
          outputTokens: completion.usage?.completion_tokens ?? 0,
          model: completion.model ?? undefined,
        });

        const raw = completion.choices[0]?.message?.content?.trim() ?? "";
        const parsed = JSON.parse(raw) as {
          about?: string;
          expectedFromMe?: string;
          expectedReason?: string;
          expectedConfidence?: string;
        };
        const about = typeof parsed.about === "string" ? parsed.about.trim() : "";
        const expectedFromMe =
          typeof parsed.expectedFromMe === "string"
            ? parsed.expectedFromMe.trim()
            : "";
        const expectedReason =
          typeof parsed.expectedReason === "string"
            ? parsed.expectedReason.trim()
            : fallback.expectedReason;
        const expectedConfidenceRaw =
          typeof parsed.expectedConfidence === "string"
            ? parsed.expectedConfidence.trim()
            : fallback.expectedConfidence;
        const expectedConfidence: "High" | "Medium" | "Low" =
          expectedConfidenceRaw === "High" ||
            expectedConfidenceRaw === "Medium" ||
            expectedConfidenceRaw === "Low"
            ? expectedConfidenceRaw
            : fallback.expectedConfidence;
        if (about.length > 0 && expectedFromMe.length > 0) {
          return {
            about: about.slice(0, 800),
            expectedFromMe: expectedFromMe.slice(0, 800),
            expectedReason: expectedReason.slice(0, 240),
            expectedConfidence,
          };
        }
      } catch (e) {
        briefingLog.warn("[getThreadBrain] LLM failed, using fallback", e);
      }

      return fallback;
    }),
};
