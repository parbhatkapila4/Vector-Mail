import { db } from "@/server/db";
import { analyzeEmail } from "./email-analysis";
import type { EmailMessage } from "@/types";
import { arrayToVector } from "./vector-utils";

/**
 * Backfill analysis (summary and embeddings) for existing emails that don't have them
 */
export async function backfillEmailAnalysis(
  accountId: string,
  limit: number = 50,
) {
  console.log(`Starting backfill for account ${accountId}`);

  try {
    // Find emails without summaries
    const emailsWithoutAnalysis = await db.email.findMany({
      where: {
        thread: {
          accountId: accountId,
        },
        summary: null, // Only process emails without summary
      },
      include: {
        from: true,
        to: true,
        cc: true,
        bcc: true,
        replyTo: true,
      },
      take: limit,
      orderBy: {
        sentAt: "desc", // Process most recent first
      },
    });

    console.log(
      `Found ${emailsWithoutAnalysis.length} emails without analysis`,
    );

    let processed = 0;
    let failed = 0;

    for (const email of emailsWithoutAnalysis) {
      try {
        // Convert database email to EmailMessage format
        const emailMessage: EmailMessage = {
          id: email.id,
          threadId: email.threadId,
          createdTime: email.createdTime.toISOString(),
          lastModifiedTime: email.lastModifiedTime.toISOString(),
          sentAt: email.sentAt.toISOString(),
          receivedAt: email.receivedAt.toISOString(),
          internetMessageId: email.internetMessageId,
          subject: email.subject,
          sysLabels: email.sysLabels as (
            | "inbox"
            | "sent"
            | "important"
            | "unread"
            | "draft"
            | "junk"
            | "trash"
            | "flagged"
          )[],
          keywords: email.keywords,
          sysClassifications: email.sysClassifications as (
            | "personal"
            | "social"
            | "promotions"
            | "updates"
            | "forums"
          )[],
          sensitivity: email.sensitivity,
          meetingMessageMethod: email.meetingMessageMethod || undefined,
          from: {
            name: email.from.name || "",
            address: email.from.address,
            raw: email.from.raw || "",
          },
          to: email.to.map((addr: any) => ({
            name: addr.name || "",
            address: addr.address,
            raw: addr.raw || "",
          })),
          cc: email.cc.map((addr: any) => ({
            name: addr.name || "",
            address: addr.address,
            raw: addr.raw || "",
          })),
          bcc: email.bcc.map((addr: any) => ({
            name: addr.name || "",
            address: addr.address,
            raw: addr.raw || "",
          })),
          replyTo: email.replyTo.map((addr: any) => ({
            name: addr.name || "",
            address: addr.address,
            raw: addr.raw || "",
          })),
          hasAttachments: email.hasAttachments,
          body: email.body ?? undefined,
          bodySnippet: email.bodySnippet ?? undefined,
          attachments: [],
          inReplyTo: email.inReplyTo ?? undefined,
          references: email.references ?? undefined,
          threadIndex: email.threadIndex ?? undefined,
          internetHeaders: [],
          nativeProperties: {},
          folderId: email.folderId ?? undefined,
          omitted: email.omitted as (
            | "body"
            | "threadId"
            | "internetHeaders"
            | "attachments"
            | "recipients"
          )[],
        };

        console.log(
          `Analyzing email ${processed + 1}/${emailsWithoutAnalysis.length}: ${email.subject}`,
        );

        // Generate analysis
        const analysis = await analyzeEmail(emailMessage);

        // Convert embedding array to pgvector format
        const embeddingVector = arrayToVector(analysis.vectorEmbedding);

        // Update email with analysis
        await db.email.update({
          where: { id: email.id },
          data: {
            summary: analysis.summary,
          },
        });

        // Update embedding separately using raw SQL since it's an Unsupported type
        await db.$executeRaw`
                    UPDATE "Email" 
                    SET embedding = ${embeddingVector}::vector
                    WHERE id = ${email.id}
                `;

        processed++;
        console.log(`✓ Processed: ${email.subject.substring(0, 50)}...`);

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        failed++;
        console.error(`✗ Failed to process email ${email.id}:`, error);
      }
    }

    console.log(
      `\nBackfill complete: ${processed} processed, ${failed} failed`,
    );

    return {
      processed,
      failed,
      total: emailsWithoutAnalysis.length,
    };
  } catch (error) {
    console.error("Error during backfill:", error);
    throw error;
  }
}

/**
 * Get count of emails without analysis for an account
 */
export async function getEmailsNeedingAnalysisCount(
  accountId: string,
): Promise<number> {
  return await db.email.count({
    where: {
      thread: {
        accountId: accountId,
      },
      summary: null,
    },
  });
}
