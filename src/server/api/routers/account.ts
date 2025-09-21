import { Account } from "@/lib/accounts";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { emailAddressSchema } from "@/types";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const authoriseAccountAccess = async (accountId: string, userId: string) => {
    const account = await db.account.findFirst({
        where: {
            id: accountId,
            userId
        },
        select: {
            id: true,
            emailAddress: true,
            name: true,
            token: true
        }
    });
    if (!account) throw new Error('Account not found');
    return account;
};


export const accountRouter = createTRPCRouter({
    getAccounts: protectedProcedure.query(async ({ ctx }) => {
        const accounts = await ctx.db.account.findMany({
            where: {
                userId: ctx.auth.userId,
            },
            select: {
                id: true,
                emailAddress: true,
                name: true,
            },
        });
        return accounts;
    }),
    getNumThreads: protectedProcedure.input(z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "drafts", "sent"]),
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
        let filters = {
            inboxStatus: input.tab === "inbox" ? true : false,
            draftStatus: input.tab === "drafts" ? true : false,
            sentStatus: input.tab === "sent" ? true : false,
        }
        return await ctx.db.thread.count({
            where: { accountId: account.id, ...filters },
        });
    }),
    getThreads: protectedProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string(),
        important: z.boolean(),
        unread: z.boolean(),
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().nullish(),
    })).query(async ({ ctx, input }) => {

        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
        const acc = new Account(account.token)
        acc.syncEmails().then(() => {
            console.log('synced emails')
        }).catch((error) => {
            console.log('error', error)
        })
        let filters: Prisma.ThreadWhereInput = {
            inboxStatus: input.tab === "inbox" ? true : false,
            draftStatus: input.tab === "drafts" ? true : false,
            sentStatus: input.tab === "sent" ? true : false,
        }

        if (input.important) {
            filters.emails = {
                some: {
                    sysLabels: {
                        has: "important"
                    }
                }
            }
        }

        if (input.unread) {
            filters.emails = {
                some: {
                    sysLabels: {
                        has: "unread"
                    }
                }
            }
        }

        const threads = await ctx.db.thread.findMany({
            where: { ...filters },
            include: {
                emails: {
                    orderBy: {
                        sentAt: 'desc',
                    },
                    select: {
                        from: true,
                        body: true,
                        subject: true,
                        bodySnippet: true,
                        sysLabels: true,
                        emailLabel: true,
                        id: true,
                        sentAt: true,
                    },
                },
            },
            take: input.limit + 1,
            cursor: input.cursor ? { id: input.cursor } : undefined,
            orderBy: {
                lastMessageDate: 'desc',
            },
        });

        let nextCursor: typeof input.cursor | undefined = undefined;
        if (threads.length > input.limit) {
            const nextItem = threads.pop();
            nextCursor = nextItem!.id;
        }

        return {
            threads,
            nextCursor,
        };
    }),
    getThreadById: protectedProcedure.input(z.object({
        accountId: z.string(),
        threadId: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        return await ctx.db.thread.findUnique({
            where: { id: input.threadId },
            include: {
                emails: {
                    orderBy: {
                        sentAt: "asc"
                    },
                    select: {
                        from: true,
                        body: true,
                        subject: true,
                        bodySnippet: true,
                        emailLabel: true,
                        sysLabels: true,
                        id: true,
                        sentAt: true
                    }
                }
            },
        })
    }),
    getEmailSuggestions: protectedProcedure.input(z.object({
        accountId: z.string(),
        query: z.string(),
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        return await ctx.db.emailAddress.findMany({
            where: {
                accountId: input.accountId,
                OR: [
                    {
                        address: {
                            contains: input.query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        name: {
                            contains: input.query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            select: {
                address: true,
                name: true,
            },
            take: 10,
        })
    }),
    getReplyDetails: protectedProcedure.input(z.object({
        accountId: z.string(),
        threadId: z.string(),
        replyType: z.enum(['reply', 'replyAll'])
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)

        const thread = await ctx.db.thread.findUnique({
            where: { id: input.threadId },
            include: {
                emails: {
                    orderBy: { sentAt: 'asc' },
                    select: {
                        from: true,
                        to: true,
                        cc: true,
                        bcc: true,
                        sentAt: true,
                        subject: true,
                        internetMessageId: true,
                    },
                },
            },
        });

        if (!thread || thread.emails.length === 0) {
            throw new Error("Thread not found or empty");
        }

        // Find the last email that's not from the current account (external email)
        const lastExternalEmail = thread.emails
            .slice()
            .reverse()
            .find(email => email.from.id !== account.id);

        if (!lastExternalEmail) {
            // If no external email found, use the last email in the thread
            const lastEmail = thread.emails[thread.emails.length - 1];
            if (!lastEmail) {
                throw new Error("No emails found in thread");
            }
            
            // For threads with only internal emails, we'll use the last email
            // This handles cases where the user is replying to their own emails
            const lastEmailForReply = lastEmail;
            
            if (input.replyType === 'reply') {
                return {
                    to: [lastEmailForReply.from],
                    cc: [],
                    from: { name: account.name, address: account.emailAddress },
                    subject: `${lastEmailForReply.subject}`,
                    id: lastEmailForReply.internetMessageId
                };
            } else if (input.replyType === 'replyAll') {
                return {
                    to: [lastEmailForReply.from, ...lastEmailForReply.to.filter(addr => addr.id !== account.id)],
                    cc: lastEmailForReply.cc.filter(addr => addr.id !== account.id),
                    from: { name: account.name, address: account.emailAddress },
                    subject: `${lastEmailForReply.subject}`,
                    id: lastEmailForReply.internetMessageId
                };
            }
        }

        const allRecipients = new Set([
            ...thread.emails.flatMap(e => [e.from, ...e.to, ...e.cc]),
        ]);

        if (input.replyType === 'reply') {
            return {
                to: [lastExternalEmail.from],
                cc: [],
                from: { name: account.name, address: account.emailAddress },
                subject: `${lastExternalEmail.subject}`,
                id: lastExternalEmail.internetMessageId
            };
        } else if (input.replyType === 'replyAll') {
            return {
                to: [lastExternalEmail.from, ...lastExternalEmail.to.filter(addr => addr.id !== account.id)],
                cc: lastExternalEmail.cc.filter(addr => addr.id !== account.id),
                from: { name: account.name, address: account.emailAddress },
                subject: `${lastExternalEmail.subject}`,
                id: lastExternalEmail.internetMessageId
            };
        }
    }),
    sendEmail: protectedProcedure.input(z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        to: z.array(emailAddressSchema),
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        const acc = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const account = new Account(acc.token)
        console.log('sendmail', input)
        await account.sendEmail({
            body: input.body,
            subject: input.subject,
            threadId: input.threadId,
            to: input.to,
            bcc: input.bcc,
            cc: input.cc,
            replyTo: input.replyTo,
            from: input.from,
            inReplyTo: input.inReplyTo,
        })
    }),
    getMyAccount: protectedProcedure.input(z.object({
        accountId: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        return account
    }),
    getChatbotInteraction: protectedProcedure.query(async ({ ctx }) => {
        const chatbotInteraction = await ctx.db.chatbotInteraction.findUnique({
            where: {
                day: new Date().toDateString(),
                userId: ctx.auth.userId
            }, select: { count: true }
        })
        const remainingCredits = 100 - (chatbotInteraction?.count || 0)
        return {
            remainingCredits
        }
    }),
});