import { db } from "@/server/db";
import type { EmailAddress, EmailAttachment, EmailMessage } from "@/types";
import type { Prisma } from "@prisma/client";

async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  concurrency: number = 5, // Reduced default from 10 to 5 to prevent connection pool exhaustion
): Promise<void> {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    batches.push(items.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    await Promise.all(batch.map(processor));
  }
}

export async function syncEmailsToDatabase(
  emails: EmailMessage[],
  accountId: string,
) {
  if (!emails || emails.length === 0) {
    console.warn(
      `[syncEmailsToDatabase] No emails provided for account ${accountId}`,
    );
    return;
  }

  console.log(
    `[syncEmailsToDatabase] Starting sync for ${emails.length} emails for account ${accountId}`,
  );

  let successCount = 0;
  let errorCount = 0;

  try {
    await processBatch(
      emails,
      async (email) => {
        try {
          await upsertEmail(email, accountId);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `[syncEmailsToDatabase] Failed to upsert email ${email.id}:`,
            error,
          );
        }
      },
      5, // Reduced from 10 to 5 to prevent connection pool exhaustion
    );

    console.log(
      `[syncEmailsToDatabase] EMAIL SAVE LOOP FINISHED - Success: ${successCount}, Errors: ${errorCount}`,
    );

    await recalculateAllThreadStatuses(accountId);

    console.log(
      `[syncEmailsToDatabase] Sync completed for account ${accountId}`,
    );
  } catch (error) {
    console.error(
      `[syncEmailsToDatabase] Fatal sync error for account ${accountId}:`,
      error,
    );
    throw error;
  }
}

export async function recalculateAllThreadStatuses(accountId: string) {
  try {
    console.log(
      `\n========== [recalculateAllThreadStatuses] START ==========`,
    );
    console.log(
      `[recalculateAllThreadStatuses] Recalculating thread statuses for account ${accountId}...`,
    );

    const threads = await db.thread.findMany({
      where: { accountId },
      select: { id: true },
    });

    console.log(
      `[recalculateAllThreadStatuses] Found ${threads.length} threads to recalculate`,
    );

    let inboxCount = 0;
    let sentCount = 0;
    let draftCount = 0;

    for (const thread of threads) {
      const threadEmails = await db.email.findMany({
        where: { threadId: thread.id },
        select: {
          emailLabel: true,
          sysLabels: true,
          sysClassifications: true,
        },
      });

      let hasInboxEmail = false;
      let hasDraftEmail = false;
      let hasSentEmail = false;

      for (const threadEmail of threadEmails) {

        if (
          threadEmail.emailLabel === "draft" ||
          threadEmail.sysLabels?.includes("draft")
        ) {
          hasDraftEmail = true;
          break;
        }


        const hasInboxLabel =
          threadEmail.emailLabel === "inbox" ||
          threadEmail.sysLabels?.includes("inbox") ||
          threadEmail.sysLabels?.includes("unread") ||
          threadEmail.sysLabels?.includes("important") ||
          threadEmail.sysLabels?.includes("starred") ||
          threadEmail.sysLabels?.includes("flagged") ||
          threadEmail.sysLabels?.includes("spam") ||
          threadEmail.sysLabels?.includes("junk") ||
          threadEmail.sysClassifications?.includes("promotions") ||
          threadEmail.sysClassifications?.includes("social") ||
          threadEmail.sysClassifications?.includes("updates") ||
          threadEmail.sysClassifications?.includes("forums");

        if (hasInboxLabel) {
          hasInboxEmail = true;
        }



        const isSent =
          (threadEmail.emailLabel === "sent" ||
            threadEmail.sysLabels?.includes("sent")) &&
          !threadEmail.sysLabels?.includes("draft");

        if (isSent) {
          hasSentEmail = true;
        }


        const isInbox =
          threadEmail.emailLabel === "inbox" ||
          threadEmail.sysLabels?.includes("inbox") ||
          threadEmail.sysLabels?.includes("unread") ||
          threadEmail.sysLabels?.includes("important");

        if (isInbox && !hasDraftEmail) {
          hasInboxEmail = true;
        }
      }

      let threadFolderType = "inbox";
      if (hasDraftEmail) {
        threadFolderType = "draft";
      } else if (hasSentEmail) {

        threadFolderType = "sent";
      } else if (hasInboxEmail) {
        threadFolderType = "inbox";
      }

      const updateData = {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      };

      await db.thread.update({
        where: { id: thread.id },
        data: updateData,
      });


      if (threadFolderType === "inbox") inboxCount++;
      else if (threadFolderType === "sent") sentCount++;
      else if (threadFolderType === "draft") draftCount++;


      if ((inboxCount + sentCount + draftCount) <= 5) {
        console.log(
          `[recalculateAllThreadStatuses] Thread ${thread.id}: ${threadFolderType} (hasInbox: ${hasInboxEmail}, hasSent: ${hasSentEmail}, hasDraft: ${hasDraftEmail})`,
        );
      }
    }

    console.log(
      `[recalculateAllThreadStatuses] COMPLETED recalculating ${threads.length} threads`,
    );
    console.log(
      `[recalculateAllThreadStatuses] COUNTS: Inbox=${inboxCount}, Sent=${sentCount}, Draft=${draftCount}`,
    );


    const dbInboxCount = await db.thread.count({
      where: { accountId, inboxStatus: true },
    });
    const dbSentCount = await db.thread.count({
      where: { accountId, sentStatus: true },
    });
    const dbDraftCount = await db.thread.count({
      where: { accountId, draftStatus: true },
    });

    console.log(
      `[recalculateAllThreadStatuses] DB VERIFICATION: Inbox=${dbInboxCount}, Sent=${dbSentCount}, Draft=${dbDraftCount}`,
    );

    if (dbInboxCount === 0 && threads.length > 0) {
      console.error(
        `[recalculateAllThreadStatuses] WARNING: NO INBOX THREADS FOUND! This is likely the problem!`,
      );
    }


    await db.account.update({
      where: { id: accountId },
      data: { lastInboxSyncAt: new Date() },
    }).catch(err => console.error(`[recalculateAllThreadStatuses] Failed to update lastInboxSyncAt:`, err));

    console.log(
      `========== [recalculateAllThreadStatuses] END ==========\n`,
    );

  } catch (error) {
    console.error("[recalculateAllThreadStatuses] Error:", error);
  }
}

async function upsertEmail(email: EmailMessage, accountId: string) {
  if (!email.id || !email.threadId) {
    console.error(
      `[upsertEmail] Invalid email data - missing id or threadId:`,
      {
        id: email.id,
        threadId: email.threadId,
        subject: email.subject,
      },
    );
    return;
  }

  console.log(`[upsertEmail] SAVING EMAIL:`, {
    id: email.id,
    threadId: email.threadId,
    subject: email.subject,
    accountId,
  });

  try {
    let emailLabelType: "inbox" | "sent" | "draft" = "inbox";


    if (email.sysLabels.includes("draft")) {
      emailLabelType = "draft";
    } else if (email.sysLabels.includes("sent")) {

      emailLabelType = "sent";
    } else {

      emailLabelType = "inbox";

      if (!email.sysLabels.includes("inbox")) {
        email.sysLabels.push("inbox");
      }
    }

    const embeddingVector = null;

    const addressToUpsert = new Map();
    for (const address of [
      email.from,
      ...email.to,
      ...email.cc,
      ...email.bcc,
      ...email.replyTo,
    ]) {
      addressToUpsert.set(address.address, address);
    }

    const upsertedAddresses: (Awaited<
      ReturnType<typeof upsertEmailAddress>
    > | null)[] = [];

    for (const address of addressToUpsert.values()) {
      const upsertedAddress = await upsertEmailAddress(address, accountId);

      upsertedAddresses.push(upsertedAddress);
    }

    const addressMap = new Map(
      upsertedAddresses
        .filter(Boolean)
        .map((address) => [address!.address, address]),
    );

    const fromAddress = addressMap.get(email.from.address);
    if (!fromAddress) {
      console.error(
        `[upsertEmail] Failed to upsert from address for email ${email.id}:`,
        email.from.address,
      );
      return;
    }

    const toAddresses = email.to
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const ccAddresses = email.cc
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const bccAddresses = email.bcc
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const replyToAddresses = email.replyTo
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);

    const thread = await db.thread.upsert({
      where: { id: email.threadId },
      update: {
        subject: email.subject,
        accountId,
        lastMessageDate: new Date(email.sentAt),
        done: false,

        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
      create: {
        id: email.threadId,
        accountId,
        subject: email.subject,
        done: false,

        draftStatus: emailLabelType === "draft",
        inboxStatus: emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
        lastMessageDate: new Date(email.sentAt),
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
    });

    await db.email.upsert({
      where: { id: email.id },
      update: {
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { set: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { set: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { set: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        internetHeaders:
          email.internetHeaders as unknown as Prisma.InputJsonValue[],
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties:
          email.nativeProperties as unknown as Prisma.InputJsonValue,
        folderId: email.folderId,
        omitted: email.omitted,
        emailLabel: emailLabelType,
        summary: null,
      },
      create: {
        id: email.id,
        emailLabel: emailLabelType,
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        internetHeaders:
          email.internetHeaders as unknown as Prisma.InputJsonValue[],
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { connect: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { connect: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties:
          email.nativeProperties as unknown as Prisma.InputJsonValue,
        folderId: email.folderId,
        omitted: email.omitted,
        summary: null,
      },
    });

    if (embeddingVector) {
      await db.$executeRaw`
            UPDATE "Email" 
            SET embedding = ${embeddingVector}::vector
            WHERE id = ${email.id}
        `;
    }

    const threadEmails = await db.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: "asc" },
    });

    let hasInboxEmail = false;
    let hasDraftEmail = false;
    let hasSentEmail = false;

    for (const threadEmail of threadEmails) {
      if (
        threadEmail.emailLabel === "draft" ||
        threadEmail.sysLabels?.includes("draft")
      ) {
        hasDraftEmail = true;
        break;
      }

      if (
        threadEmail.emailLabel === "inbox" ||
        threadEmail.sysLabels?.includes("inbox") ||
        threadEmail.sysLabels?.includes("spam") ||
        threadEmail.sysLabels?.includes("junk") ||
        threadEmail.sysClassifications?.includes("promotions") ||
        threadEmail.sysClassifications?.includes("social") ||
        threadEmail.sysClassifications?.includes("updates") ||
        threadEmail.sysClassifications?.includes("forums")
      ) {
        hasInboxEmail = true;
      }

      if (!hasInboxEmail && threadEmail.emailLabel !== "sent") {
        hasInboxEmail = true;
      }

      if (
        threadEmail.emailLabel === "sent" &&
        !threadEmail.sysLabels?.includes("inbox") &&
        !threadEmail.sysLabels?.includes("spam") &&
        !threadEmail.sysLabels?.includes("junk") &&
        !threadEmail.sysClassifications?.includes("promotions") &&
        !threadEmail.sysClassifications?.includes("social") &&
        !threadEmail.sysClassifications?.includes("updates") &&
        !threadEmail.sysClassifications?.includes("forums")
      ) {
        hasSentEmail = true;
      }
    }



    let threadFolderType = "inbox";
    if (hasDraftEmail) {
      threadFolderType = "draft";
    } else if (hasSentEmail) {

      threadFolderType = "sent";
    } else if (hasInboxEmail) {
      threadFolderType = "inbox";
    }

    await db.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      },
    });

    const metadataOnlyAttachments = email.attachments.map((att) => ({
      ...att,
      content: undefined,
    }));
    for (const attachment of metadataOnlyAttachments) {
      await upsertAttachment(email.id, attachment);
    }

    console.log(
      `[upsertEmail] Successfully saved email ${email.id} (thread: ${thread.id})`,
    );
  } catch (error) {
    console.error(`[upsertEmail] Failed to upsert email ${email.id}:`, error);
    if (error instanceof Error) {
      console.error(`[upsertEmail] Error details:`, {
        message: error.message,
        stack: error.stack,
        emailId: email.id,
        threadId: email.threadId,
      });
    }
  }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    await db.emailAttachment.upsert({
      where: { id: attachment.id ?? "" },
      update: {
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
      create: {
        id: attachment.id,
        emailId,
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
    });
  } catch (error) {
    console.log(`Failed to upsert attachment: ${error}`);
  }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
  try {
    const existingAddress = await db.emailAddress.findUnique({
      where: {
        accountId_address: {
          accountId: accountId,
          address: address.address ?? "",
        },
      },
    });

    if (existingAddress) {
      return await db.emailAddress.update({
        where: { id: existingAddress.id },
        data: { name: address.name, raw: address.raw },
      });
    }

    return await db.emailAddress.create({
      data: {
        address: address.address ?? "",
        name: address.name,
        raw: address.raw,
        accountId,
      },
    });
  } catch (error) {
    console.log(`Failed to upsert address: ${error}`);
    return null;
  }
}
