import { db } from "@/server/db";
import type { EmailAddress, EmailAttachment, EmailMessage } from "@/types";
import type { Prisma } from "@prisma/client";

async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  concurrency: number = 10,
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
  try {
    await processBatch(emails, (email) => upsertEmail(email, accountId), 10);
    console.log("EMAIL SAVE LOOP FINISHED");
  } catch (error) {
    console.log("Sync error:", error);
  }
}

async function upsertEmail(email: EmailMessage, accountId: string) {
  console.log("SAVING EMAIL:", {
    id: email.id,
    threadId: email.threadId,
    subject: email.subject,
  });
  try {
    let emailLabelType: "inbox" | "sent" | "draft" = "inbox";
    if (email.sysLabels.includes("draft")) {
      emailLabelType = "draft";
    } else if (email.sysLabels.includes("sent")) {
      emailLabelType = "sent";
    } else if (
      email.sysLabels.includes("inbox") ||
      email.sysLabels.includes("important")
    ) {
      emailLabelType = "inbox";
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
      console.log(`Failed to upsert from address`);
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
        // FIX: Update status flags on UPDATE too, not just CREATE
        // This ensures threads show up in the correct tab when new emails are added
        draftStatus: emailLabelType === "draft",
        inboxStatus: emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
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

    let threadFolderType = "sent";

    for (const threadEmail of threadEmails) {
      if (
        threadEmail.emailLabel === "inbox" ||
        threadEmail.sysLabels?.includes("inbox")
      ) {
        threadFolderType = "inbox";
        break;
      } else if (
        threadEmail.emailLabel === "draft" ||
        threadEmail.sysLabels?.includes("draft")
      ) {
        threadFolderType = "draft";
      }
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
  } catch (error) {
    console.log("Upsert email failed:", error);
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
