import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { withDbRetry } from "@/server/db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Account } from "@/lib/accounts";
import type { EmailMessage } from "@/types";

async function fetchEmailsForAnalytics(
  account: { id: string; token: string },
  days: number,
): Promise<EmailMessage[]> {
  const accountInstance = new Account(account.id, account.token);

  const allEmails = await accountInstance.fetchAllEmailsDirectly();

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setUTCHours(0, 0, 0, 0);

  return allEmails.filter((email) => {
    const emailDate = email.sysLabels.includes("sent")
      ? new Date(email.sentAt)
      : new Date(email.receivedAt);
    return emailDate >= startDate;
  });
}

export const analyticsRouter = createTRPCRouter({
  getEmailVolume: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().min(7).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: {
            id: input.accountId,
            userId: ctx.auth.userId,
          },
          select: {
            id: true,
            token: true,
          },
        }),
      );

      if (!account || !account.token) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const allEmails = await fetchEmailsForAnalytics(account, input.days);

      const dateMap = new Map<string, { received: number; sent: number }>();

      allEmails.forEach((email) => {
        const isInbox = email.sysLabels.includes("inbox") ||
          (!email.sysLabels.includes("sent") && !email.sysLabels.includes("draft"));
        const isSent = email.sysLabels.includes("sent") && !email.sysLabels.includes("draft");

        const emailDate = isSent
          ? new Date(email.sentAt)
          : new Date(email.receivedAt);
        const dateStr = emailDate.toISOString().split('T')[0]!;

        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { received: 0, sent: 0 });
        }
        const entry = dateMap.get(dateStr)!;

        if (isInbox) entry.received++;
        if (isSent) entry.sent++;
      });

      return Array.from(dateMap.entries())
        .map(([date, counts]) => ({
          date,
          received: counts.received,
          sent: counts.sent,
          total: counts.received + counts.sent,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }),

  getResponseTimes: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().min(7).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: {
            id: input.accountId,
            userId: ctx.auth.userId,
          },
        }),
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const now = new Date();
      const startDate = new Date(now.getTime() - input.days * 24 * 60 * 60 * 1000);
      startDate.setUTCHours(0, 0, 0, 0);

      const responseTimes = await withDbRetry(() =>
        ctx.db.$queryRaw<
          Array<{
            date_str: string;
            avg_response_hours: number | null;
            median_response_hours: number | null;
            response_count: bigint;
          }>
        >`
        WITH reply_emails AS (
          SELECT 
            e1.id,
            e1."receivedAt" as reply_received,
            e2."sentAt" as original_sent,
            EXTRACT(EPOCH FROM (e1."receivedAt" - e2."sentAt")) / 3600 as response_hours
          FROM "Email" e1
          INNER JOIN "Thread" t1 ON e1."threadId" = t1.id
          INNER JOIN "Email" e2 ON e1."inReplyTo" = e2."internetMessageId"
          WHERE t1."accountId" = ${input.accountId}
            AND e1."emailLabel" = 'inbox'
            AND e1."receivedAt" >= ${startDate}
            AND e1."inReplyTo" IS NOT NULL
            AND e1."inReplyTo" != ''
        )
        SELECT 
          DATE_TRUNC('day', reply_received)::date::text as date_str,
          AVG(response_hours) as avg_response_hours,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_hours) as median_response_hours,
          COUNT(*)::bigint as response_count
        FROM reply_emails
        WHERE response_hours >= 0
        GROUP BY DATE_TRUNC('day', reply_received)
        ORDER BY date_str ASC
      `);

      return responseTimes.map((row) => ({
        date: row.date_str || '',
        avgResponseHours: row.avg_response_hours ? Number(row.avg_response_hours) : 0,
        medianResponseHours: row.median_response_hours ? Number(row.median_response_hours) : 0,
        responseCount: Number(row.response_count),
      }));
    }),

  getProductivityMetrics: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().min(7).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: {
            id: input.accountId,
            userId: ctx.auth.userId,
          },
        }),
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const now = new Date();
      const startDate = new Date(now.getTime() - input.days * 24 * 60 * 60 * 1000);
      startDate.setUTCHours(0, 0, 0, 0);

      const metricsArray = await withDbRetry(() =>
        ctx.db.$queryRaw<
          Array<{
            total_emails: bigint;
            received_emails: bigint;
            sent_emails: bigint;
            avg_response_hours: number | null;
            threads_with_replies: bigint;
            emails_per_day: number;
          }>
        >`
        WITH email_stats AS (
          SELECT 
            COUNT(*)::bigint as total_emails,
            COUNT(CASE WHEN e."emailLabel" = 'inbox' THEN 1 END)::bigint as received_emails,
            COUNT(CASE WHEN e."emailLabel" = 'sent' THEN 1 END)::bigint as sent_emails,
            COUNT(DISTINCT CASE WHEN e."inReplyTo" IS NOT NULL AND e."inReplyTo" != '' THEN e."threadId" END)::bigint as threads_with_replies
          FROM "Email" e
          INNER JOIN "Thread" t ON e."threadId" = t.id
          WHERE t."accountId" = ${input.accountId}
            AND (
              (e."emailLabel" = 'inbox' AND DATE_TRUNC('day', e."receivedAt") >= DATE_TRUNC('day', ${startDate}::timestamp))
              OR 
              (e."emailLabel" = 'sent' AND DATE_TRUNC('day', e."sentAt") >= DATE_TRUNC('day', ${startDate}::timestamp))
            )
        ),
        response_stats AS (
          SELECT 
            AVG(EXTRACT(EPOCH FROM (e1."receivedAt" - e2."sentAt")) / 3600) as avg_response_hours
          FROM "Email" e1
          INNER JOIN "Thread" t1 ON e1."threadId" = t1.id
          INNER JOIN "Email" e2 ON e1."inReplyTo" = e2."internetMessageId"
          WHERE t1."accountId" = ${input.accountId}
            AND e1."emailLabel" = 'inbox'
            AND e1."receivedAt" >= ${startDate}
            AND e1."inReplyTo" IS NOT NULL
            AND e1."inReplyTo" != ''
            AND e1."receivedAt" >= e2."sentAt"
        )
        SELECT 
          es.total_emails,
          es.received_emails,
          es.sent_emails,
          COALESCE(rs.avg_response_hours, 0) as avg_response_hours,
          es.threads_with_replies,
          CASE 
            WHEN ${input.days} > 0 THEN es.total_emails::numeric / ${input.days}
            ELSE 0
          END as emails_per_day
        FROM email_stats es
        CROSS JOIN response_stats rs
      `);

      const metrics = metricsArray[0];

      if (!metrics) {
        return {
          totalEmails: 0,
          receivedEmails: 0,
          sentEmails: 0,
          avgResponseHours: 0,
          threadsWithReplies: 0,
          emailsPerDay: 0,
        };
      }

      return {
        totalEmails: Number(metrics.total_emails),
        receivedEmails: Number(metrics.received_emails),
        sentEmails: Number(metrics.sent_emails),
        avgResponseHours: metrics.avg_response_hours ? Number(metrics.avg_response_hours) : 0,
        threadsWithReplies: Number(metrics.threads_with_replies),
        emailsPerDay: Number(metrics.emails_per_day) || 0,
      };
    }),

  getTopContacts: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().min(7).max(365).default(30),
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: {
            id: input.accountId,
            userId: ctx.auth.userId,
          },
        }),
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const now = new Date();
      const startDate = new Date(now.getTime() - input.days * 24 * 60 * 60 * 1000);
      startDate.setUTCHours(0, 0, 0, 0);

      const topContacts = await withDbRetry(() =>
        ctx.db.$queryRaw<
          Array<{
            email_address: string;
            name: string | null;
            email_count: bigint;
            last_contact: Date;
          }>
        >`
        SELECT 
          ea.address as email_address,
          ea.name,
          COUNT(*)::bigint as email_count,
          MAX(e."receivedAt") as last_contact
        FROM "Email" e
        INNER JOIN "Thread" t ON e."threadId" = t.id
        INNER JOIN "EmailAddress" ea ON e."fromId" = ea.id
        WHERE t."accountId" = ${input.accountId}
          AND e."emailLabel" = 'inbox'
          AND DATE_TRUNC('day', e."receivedAt") >= DATE_TRUNC('day', ${startDate}::timestamp)
        GROUP BY ea.address, ea.name
        HAVING COUNT(*) > 0
        ORDER BY email_count DESC
        LIMIT ${input.limit}
      `);

      return topContacts.map((contact) => ({
        email: contact.email_address,
        name: contact.name || contact.email_address,
        emailCount: Number(contact.email_count),
        lastContact: contact.last_contact,
      }));
    }),

  getEmailDistribution: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().min(7).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: {
            id: input.accountId,
            userId: ctx.auth.userId,
          },
        }),
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const now = new Date();
      const startDate = new Date(now.getTime() - input.days * 24 * 60 * 60 * 1000);
      startDate.setUTCHours(0, 0, 0, 0);

      const distribution = await withDbRetry(() =>
        ctx.db.$queryRaw<
          Array<{
            label: string;
            count: bigint;
          }>
        >`
        SELECT 
          e."emailLabel" as label,
          COUNT(*)::bigint as count
        FROM "Email" e
        INNER JOIN "Thread" t ON e."threadId" = t.id
        WHERE t."accountId" = ${input.accountId}
          AND (
            (e."emailLabel" = 'inbox' AND DATE_TRUNC('day', e."receivedAt") >= DATE_TRUNC('day', ${startDate}::timestamp))
            OR 
            (e."emailLabel" = 'sent' AND DATE_TRUNC('day', e."sentAt") >= DATE_TRUNC('day', ${startDate}::timestamp))
            OR
            (e."emailLabel" = 'draft' AND DATE_TRUNC('day', e."receivedAt") >= DATE_TRUNC('day', ${startDate}::timestamp))
          )
        GROUP BY e."emailLabel"
        HAVING COUNT(*) > 0
      `);

      return distribution.map((row) => ({
        label: row.label,
        value: Number(row.count),
      }));
    }),

  getHourlyDistribution: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().min(7).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: {
            id: input.accountId,
            userId: ctx.auth.userId,
          },
        }),
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const now = new Date();
      const startDate = new Date(now.getTime() - input.days * 24 * 60 * 60 * 1000);
      startDate.setUTCHours(0, 0, 0, 0);

      const hourlyRaw = await withDbRetry(() =>
        ctx.db.$queryRaw<
          Array<{
            hour: number;
            received: bigint;
            sent: bigint;
          }>
        >`
        SELECT 
          hours.hour::int as hour,
          COALESCE(i.count, 0::bigint) as received,
          COALESCE(s.count, 0::bigint) as sent
        FROM (
          SELECT 0 as hour UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
          UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
          UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
          UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
        ) hours
        LEFT JOIN (
          SELECT 
            EXTRACT(HOUR FROM e."receivedAt")::int as hour,
            COUNT(*)::bigint as count
          FROM "Email" e
          INNER JOIN "Thread" t ON e."threadId" = t.id
          WHERE t."accountId" = ${input.accountId}
            AND e."emailLabel" = 'inbox'
            AND DATE_TRUNC('day', e."receivedAt") >= DATE_TRUNC('day', ${startDate}::timestamp)
          GROUP BY EXTRACT(HOUR FROM e."receivedAt")
        ) i ON hours.hour = i.hour
        LEFT JOIN (
          SELECT 
            EXTRACT(HOUR FROM e."sentAt")::int as hour,
            COUNT(*)::bigint as count
          FROM "Email" e
          INNER JOIN "Thread" t ON e."threadId" = t.id
          WHERE t."accountId" = ${input.accountId}
          AND e."emailLabel" = 'sent'
          AND DATE_TRUNC('day', e."sentAt") >= DATE_TRUNC('day', ${startDate}::timestamp)
          GROUP BY EXTRACT(HOUR FROM e."sentAt")
        ) s ON hours.hour = s.hour
        ORDER BY hours.hour ASC
      `);

      return hourlyRaw.map((row) => ({
        hour: Number(row.hour),
        received: Number(row.received),
        sent: Number(row.sent),
        total: Number(row.received) + Number(row.sent),
      }));
    }),

  getWeeklyActivity: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().min(7).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: {
            id: input.accountId,
            userId: ctx.auth.userId,
          },
        }),
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const now = new Date();
      const startDate = new Date(now.getTime() - input.days * 24 * 60 * 60 * 1000);
      startDate.setUTCHours(0, 0, 0, 0);

      const weeklyRaw = await withDbRetry(() =>
        ctx.db.$queryRaw<
          Array<{
            day_of_week: number;
            day_name: string;
            received: bigint;
            sent: bigint;
          }>
        >`
        SELECT 
          d.day_of_week,
          d.day_name,
          COALESCE(i.count, 0::bigint) as received,
          COALESCE(s.count, 0::bigint) as sent
        FROM (
          SELECT 0 as day_of_week, 'Sunday' as day_name
          UNION ALL SELECT 1, 'Monday'
          UNION ALL SELECT 2, 'Tuesday'
          UNION ALL SELECT 3, 'Wednesday'
          UNION ALL SELECT 4, 'Thursday'
          UNION ALL SELECT 5, 'Friday'
          UNION ALL SELECT 6, 'Saturday'
        ) d
        LEFT JOIN (
          SELECT 
            EXTRACT(DOW FROM e."receivedAt")::int as day_of_week,
            COUNT(*)::bigint as count
          FROM "Email" e
          INNER JOIN "Thread" t ON e."threadId" = t.id
          WHERE t."accountId" = ${input.accountId}
            AND e."emailLabel" = 'inbox'
            AND DATE_TRUNC('day', e."receivedAt") >= DATE_TRUNC('day', ${startDate}::timestamp)
          GROUP BY EXTRACT(DOW FROM e."receivedAt")
        ) i ON d.day_of_week = i.day_of_week
        LEFT JOIN (
          SELECT 
            EXTRACT(DOW FROM e."sentAt")::int as day_of_week,
            COUNT(*)::bigint as count
          FROM "Email" e
          INNER JOIN "Thread" t ON e."threadId" = t.id
          WHERE t."accountId" = ${input.accountId}
          AND e."emailLabel" = 'sent'
          AND DATE_TRUNC('day', e."sentAt") >= DATE_TRUNC('day', ${startDate}::timestamp)
          GROUP BY EXTRACT(DOW FROM e."sentAt")
        ) s ON d.day_of_week = s.day_of_week
        ORDER BY d.day_of_week ASC
      `);

      return weeklyRaw.map((row) => ({
        dayOfWeek: Number(row.day_of_week),
        dayName: row.day_name.trim(),
        received: Number(row.received),
        sent: Number(row.sent),
        total: Number(row.received) + Number(row.sent),
      }));
    }),

  getEmailWithAttachments: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().min(7).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await withDbRetry(() =>
        ctx.db.account.findFirst({
          where: {
            id: input.accountId,
            userId: ctx.auth.userId,
          },
        }),
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const now = new Date();
      const startDate = new Date(now.getTime() - input.days * 24 * 60 * 60 * 1000);
      startDate.setUTCHours(0, 0, 0, 0);

      const attachmentStatsArray = await withDbRetry(() =>
        ctx.db.$queryRaw<
          Array<{
            with_attachments: bigint;
            without_attachments: bigint;
            total_attachments: bigint;
          }>
        >`
        SELECT 
          COUNT(CASE WHEN e."hasAttachments" = true THEN 1 END)::bigint as with_attachments,
          COUNT(CASE WHEN e."hasAttachments" = false OR e."hasAttachments" IS NULL THEN 1 END)::bigint as without_attachments,
          COUNT(CASE WHEN e."hasAttachments" = true THEN 1 END)::bigint as total_attachments
        FROM "Email" e
        INNER JOIN "Thread" t ON e."threadId" = t.id
        WHERE t."accountId" = ${input.accountId}
          AND (
            (e."emailLabel" = 'inbox' AND DATE_TRUNC('day', e."receivedAt") >= DATE_TRUNC('day', ${startDate}::timestamp))
            OR 
            (e."emailLabel" = 'sent' AND DATE_TRUNC('day', e."sentAt") >= DATE_TRUNC('day', ${startDate}::timestamp))
          )
      `);

      const attachmentStats = attachmentStatsArray[0];

      if (!attachmentStats) {
        return {
          withAttachments: 0,
          withoutAttachments: 0,
          percentageWithAttachments: 0,
        };
      }

      const total = Number(attachmentStats.with_attachments) + Number(attachmentStats.without_attachments);
      const percentage = total > 0
        ? (Number(attachmentStats.with_attachments) / total) * 100
        : 0;

      return {
        withAttachments: Number(attachmentStats.with_attachments),
        withoutAttachments: Number(attachmentStats.without_attachments),
        percentageWithAttachments: percentage,
      };
    }),
});
