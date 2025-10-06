import type { EmailAddress, EmailMessage, syncResponse, syncUpdateResponse } from "@/types"
import axios from "axios"
import { syncEmailsToDatabase } from "./sync-to-db"
import { db } from "@/server/db"

export class Account {
    private token: string

    constructor(token: string) {
        this.token = token
    }

    async performInitialSync() {
        try {
            let syncResponse = await this.startSync()
            while (!syncResponse.ready) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                syncResponse = await this.startSync()
            }

            let storedDeltaToken:string = syncResponse.syncUpdatedToken

            let updatedResponse = await this.getUpdatedEmails(storedDeltaToken)

            if(updatedResponse.nextDeltaToken) {
                storedDeltaToken = updatedResponse.nextDeltaToken
            }

            let allEmails : EmailMessage[] = updatedResponse.records

            while(updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails(storedDeltaToken, updatedResponse.nextPageToken)
                allEmails = allEmails.concat(updatedResponse.records)
                if(updatedResponse.nextDeltaToken) {
                    storedDeltaToken = updatedResponse.nextDeltaToken
                }
            }

            console.log('initial sync complete' , allEmails.length)

            await this.getUpdatedEmails(storedDeltaToken)

            return {
                emails: allEmails,
                deltaToken: storedDeltaToken
            }

        } catch (error) {
            if(axios.isAxiosError(error)) {
                console.error("Error performing initial sync:", error.response?.data)
            }
            console.error("Error performing initial sync:", error)
        }
    }

    private async startSync() {
        const response = await axios.post<syncResponse>(`https://api.aurinko.io/v1/email/sync`, {}, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            },
            params: {
                daysWithin: 30,
                bodyType: "html"
            }
        })
        return response.data
    }

    private async getUpdatedEmails(deltaToken?: string, pageToken?: string) {
        let params: Record<string, string> = {}
        if(pageToken) {
            params.pageToken = pageToken
        } else if(deltaToken) {
            params.deltaToken = deltaToken
        }
        const response = await axios.get<syncUpdateResponse>(`https://api.aurinko.io/v1/email/sync/updated`, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            },
            params
        })
        return response.data
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
                        returnIds: true
                    },
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );

            console.log('sendmail', response.data)
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error sending email:', JSON.stringify(error.response?.data, null, 2));
            } else {
                console.error('Error sending email:', error);
            }
            throw error;
        }
    }

    async syncEmails() {
        const account = await db.account.findUnique({
            where: {
                token: this.token
            },
        })
        if (!account) throw new Error("Invalid token")
        if (!account.nextDeltaToken) throw new Error("No delta token")
        let response = await this.getUpdatedEmails(account.nextDeltaToken)
        let allEmails: EmailMessage[] = response.records
        let storedDeltaToken = account.nextDeltaToken
        if (response.nextDeltaToken) {
            storedDeltaToken = response.nextDeltaToken
        }
        while (response.nextPageToken) {
            response = await this.getUpdatedEmails( "", response.nextPageToken);
            allEmails = allEmails.concat(response.records);
            if (response.nextDeltaToken) {
                storedDeltaToken = response.nextDeltaToken
            }
        }

        if (!response) throw new Error("Failed to sync emails")


        try {
            await syncEmailsToDatabase(allEmails, account.id)
        } catch (error) {
            console.log('error', error)
        }

        await db.account.update({
            where: {
                id: account.id,
            },
            data: {
                nextDeltaToken: storedDeltaToken,
            }
        })
    }
}

