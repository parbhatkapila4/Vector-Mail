import { z } from "zod";

export interface syncResponse {
  syncUpdatedToken: string;
  syncDeletedToken: string;
  ready: boolean;
}

export interface syncUpdateResponse {
  nextPageToken?: string;
  nextDeltaToken?: string;
  records: EmailMessage[];
}

export const emailAddressSchema = z.object({
  address: z.string(),
  name: z.string(),
});

export interface EmailMessage {
  id: string;
  threadId: string;
  createdTime: string;
  lastModifiedTime: string;
  sentAt: string;
  receivedAt: string;
  internetMessageId: string;
  subject: string;
  sysLabels: Array<
    | "junk"
    | "spam"
    | "trash"
    | "sent"
    | "inbox"
    | "unread"
    | "flagged"
    | "important"
    | "draft"
  >;
  keywords: string[];
  sysClassifications: Array<
    "personal" | "social" | "promotions" | "updates" | "forums"
  >;
  sensitivity: "normal" | "private" | "personal" | "confidential";
  meetingMessageMethod?: "request" | "reply" | "cancel" | "counter" | "other";
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  replyTo: EmailAddress[];
  hasAttachments: boolean;
  body?: string;
  bodySnippet?: string;
  attachments: EmailAttachment[];
  inReplyTo?: string;
  references?: string;
  threadIndex?: string;
  internetHeaders: EmailHeader[];
  nativeProperties: Record<string, string>;
  folderId?: string;
  omitted: Array<
    "threadId" | "body" | "attachments" | "recipients" | "internetHeaders"
  >;
}

export interface EmailAddress {
  name?: string;
  address: string;
  raw?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  inline: boolean;
  contentId?: string;
  content?: string;
  contentLocation?: string;
}

export interface EmailHeader {
  name: string;
  value: string;
}
