import type {
  EmailAddress,
  EmailMessage,
  syncResponse,
  syncUpdateResponse,
} from "@/types";
import axios from "axios";
import { syncEmailsToDatabase } from "./sync-to-db";
import { db } from "@/server/db";

export class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async performInitialSync() {
    try {
      console.log("[Initial Sync] Starting sync initialization...");

      let syncResponse = await this.startSync();
      while (!syncResponse.ready) {
        console.log("[Initial Sync] Waiting for sync to be ready...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        syncResponse = await this.startSync();
      }

      console.log("[Initial Sync] Sync ready, starting to fetch emails...");
      let storedDeltaToken: string = syncResponse.syncUpdatedToken;

      let updatedResponse = await this.getUpdatedEmails(storedDeltaToken);
      let allEmails: EmailMessage[] = updatedResponse.records || [];
      let pageCount = 1;

      console.log(
        `[Initial Sync] Page ${pageCount}: ${allEmails.length} emails (total: ${allEmails.length})`,
      );

      if (updatedResponse.nextDeltaToken) {
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }

      while (updatedResponse.nextPageToken) {
        pageCount++;
        console.log(
          `[Initial Sync] Fetching page ${pageCount} with token: ${updatedResponse.nextPageToken.substring(0, 20)}...`,
        );

        updatedResponse = await this.getUpdatedEmails(
          undefined,
          updatedResponse.nextPageToken,
        );

        const pageEmails = updatedResponse.records || [];
        allEmails = allEmails.concat(pageEmails);

        console.log(
          `[Initial Sync] Page ${pageCount}: ${pageEmails.length} emails (total: ${allEmails.length})`,
        );

        if (updatedResponse.nextDeltaToken) {
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }

        if (pageCount > 1000) {
          console.warn(
            `[Initial Sync] Safety limit reached (1000 pages), stopping pagination`,
          );
          break;
        }
      }

      const inboxCount = allEmails.filter(
        (e) =>
          e.sysLabels.includes("inbox") || e.sysLabels.includes("important"),
      ).length;
      const sentCount = allEmails.filter(
        (e) => e.sysLabels.includes("sent") && !e.sysLabels.includes("draft"),
      ).length;
      const draftCount = allEmails.filter((e) =>
        e.sysLabels.includes("draft"),
      ).length;

      console.log(
        `[Initial Sync] Complete! Fetched ${allEmails.length} emails across ${pageCount} pages (Inbox: ${inboxCount}, Sent: ${sentCount}, Drafts: ${draftCount})`,
      );

      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "[Initial Sync] API error:",
          error.response?.status,
          error.response?.data,
        );
      } else {
        console.error("[Initial Sync] Error:", error);
      }
      throw error;
    }
  }

  private async startSync() {
    const response = await axios.post<syncResponse>(
      `https://api.aurinko.io/v1/email/sync`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          daysWithin: 30,
          bodyType: "text",
        },
      },
    );
    return response.data;
  }

  private async getUpdatedEmails(
    deltaToken?: string,
    pageToken?: string,
    metadataOnly: boolean = false,
  ) {
    const params: Record<string, string> = {};

    if (pageToken) {
      params.pageToken = pageToken;
    } else if (deltaToken) {
      params.deltaToken = deltaToken;
    }

    if (metadataOnly) {
      params.bodyType = "text";
    }

    const response = await axios.get<syncUpdateResponse>(
      `https://api.aurinko.io/v1/email/sync/updated`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params,
      },
    );
    return response.data;
  }

  async sendEmail({
    from,
    subject,
    body,
    inReplyTo,
    references,
    threadId,
    to,
    cc,
    bcc,
    replyTo,
  }: {
    from: EmailAddress;
    subject: string;
    body: string;
    inReplyTo?: string;
    references?: string;
    threadId?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo?: EmailAddress;
  }) {
    try {
      const response = await axios.post(
        `https://api.aurinko.io/v1/email/messages`,
        {
          from,
          subject,
          body,
          inReplyTo,
          references,
          threadId,
          to,
          cc,
          bcc,
          replyTo: [replyTo],
        },
        {
          params: {
            returnIds: true,
          },
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );

      console.log("sendmail", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error sending email:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error sending email:", error);
      }
      throw error;
    }
  }

  async getEmailById(emailId: string): Promise<EmailMessage | null> {
    try {
      const response = await axios.get<EmailMessage>(
        `https://api.aurinko.io/v1/email/messages/${emailId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            bodyType: "html",
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `Error fetching email ${emailId}:`,
          error.response?.status,
          error.response?.data,
        );
      } else {
        console.error(`Error fetching email ${emailId}:`, error);
      }
      return null;
    }
  }

  async syncEmails(forceFullSync = false) {
    void forceFullSync;
    const account = await db.account.findUnique({
      where: {
        token: this.token,
      },
    });
    if (!account) throw new Error("Invalid token");

    console.log(`Starting email sync for account ${account.id}`);

    let allEmails: EmailMessage[] = [];
    let storedDeltaToken: string;

    if (!account.nextDeltaToken) {
      console.log("Performing full initial sync (first connection)...");
      const initialSyncResult = await this.performInitialSync();
      allEmails = initialSyncResult?.emails ?? [];
      storedDeltaToken = initialSyncResult?.deltaToken ?? "";
    } else {
      console.log(`Using delta token: ${account.nextDeltaToken}`);
      let response = await this.getUpdatedEmails(account.nextDeltaToken);
      allEmails = response.records;
      storedDeltaToken = account.nextDeltaToken;

      console.log(`Delta sync response: ${allEmails.length} emails found`);

      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
        console.log(`Updated delta token: ${storedDeltaToken}`);
      }

      while (response.nextPageToken) {
        console.log(`Fetching next page with token: ${response.nextPageToken}`);
        response = await this.getUpdatedEmails("", response.nextPageToken);
        allEmails = allEmails.concat(response.records);
        console.log(
          `Page response: ${response.records.length} emails, total: ${allEmails.length}`,
        );
        if (response.nextDeltaToken) {
          storedDeltaToken = response.nextDeltaToken;
        }
      }
    }

    console.log(`Total emails to sync: ${allEmails.length}`);

    try {
      await syncEmailsToDatabase(allEmails, account.id);
      console.log(`Successfully synced ${allEmails.length} emails to database`);
    } catch (error) {
      console.error("Error syncing emails to database:", error);
    }

    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaToken: storedDeltaToken,
      },
    });

    console.log(`Email sync completed for account ${account.id}`);
  }

  async syncLatestEmails(): Promise<{ success: boolean; count: number }> {
    const account = await db.account.findUnique({
      where: {
        token: this.token,
      },
    });
    if (!account) {
      throw new Error("Invalid token");
    }

    if (!account.nextDeltaToken) {
      console.log(
        `Skipping latest sync - account ${account.id} needs initial sync first`,
      );
      return { success: false, count: 0 };
    }

    try {
      console.log(
        `[Latest Sync] Starting lightweight sync for account ${account.id}`,
      );
      const startTime = Date.now();

      const response = await this.getUpdatedEmails(
        account.nextDeltaToken,
        undefined,
        true,
      );

      const newEmails = response.records || [];
      let storedDeltaToken = account.nextDeltaToken;

      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }

      if (newEmails.length > 0) {
        const inboxCount = newEmails.filter(
          (e) =>
            e.sysLabels.includes("inbox") || e.sysLabels.includes("important"),
        ).length;
        const sentCount = newEmails.filter(
          (e) => e.sysLabels.includes("sent") && !e.sysLabels.includes("draft"),
        ).length;
        const draftCount = newEmails.filter((e) =>
          e.sysLabels.includes("draft"),
        ).length;

        console.log(
          `[Latest Sync] Found ${newEmails.length} new emails (Inbox: ${inboxCount}, Sent: ${sentCount}, Drafts: ${draftCount}), syncing...`,
        );

        await syncEmailsToDatabase(newEmails, account.id);

        await db.account.update({
          where: { id: account.id },
          data: { nextDeltaToken: storedDeltaToken },
        });

        const duration = Date.now() - startTime;
        console.log(
          `[Latest Sync] Completed in ${duration}ms - synced ${newEmails.length} emails`,
        );

        return { success: true, count: newEmails.length };
      } else {
        if (response.nextDeltaToken) {
          await db.account.update({
            where: { id: account.id },
            data: { nextDeltaToken: storedDeltaToken },
          });
        }

        const duration = Date.now() - startTime;
        console.log(`[Latest Sync] No new emails (${duration}ms)`);
        return { success: true, count: 0 };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        if (status === 400 || status === 410) {
          console.warn(
            `[Latest Sync] Delta token invalid/expired for account ${account.id}, resetting...`,
          );

          await db.account.update({
            where: { id: account.id },
            data: { nextDeltaToken: null },
          });

          console.log(
            `[Latest Sync] Delta token reset - will use full sync on next regular sync`,
          );
          return { success: false, count: 0 };
        }

        console.error(
          `[Latest Sync] API error for account ${account.id}:`,
          errorData,
        );
      } else {
        console.error(
          `[Latest Sync] Error syncing latest emails for account ${account.id}:`,
          error,
        );
      }

      return { success: false, count: 0 };
    }
  }
}
