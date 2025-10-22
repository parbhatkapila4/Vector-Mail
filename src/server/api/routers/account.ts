import { Account } from "@/lib/accounts"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { db } from "@/server/db"
import { emailAddressSchema } from "@/types"
import { Prisma } from "@prisma/client"
import { z } from "zod"

interface AccountAccess {
  id: string
  emailAddress: string
  name: string
  token: string
}

const THREAD_FILTERS = {
  INBOX: { inboxStatus: true, draftStatus: false, sentStatus: false },
  DRAFTS: { inboxStatus: false, draftStatus: true, sentStatus: false },
  SENT: { inboxStatus: false, draftStatus: false, sentStatus: true },
} as const

const SYNC_CONFIG = {
  DEFAULT_LIMIT: 15,
  MAX_LIMIT: 50,
  REFETCH_INTERVAL: 5000,
} as const

export const authoriseAccountAccess = async (accountId: string, userId: string): Promise<AccountAccess> => {
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
  })
  
  if (!account) {
    throw new Error('Account not found')
  }
  
  return account
}

export const accountRouter = createTRPCRouter({
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
      },
    })
  }),

  getNumThreads: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      tab: z.enum(["inbox", "drafts", "sent"]),
    }))
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
      
      const filters = input.tab === "inbox" 
        ? THREAD_FILTERS.INBOX 
        : input.tab === "drafts" 
        ? THREAD_FILTERS.DRAFTS 
        : THREAD_FILTERS.SENT

      return await ctx.db.thread.count({
        where: { 
          accountId: account.id, 
          ...filters 
        },
      })
    }),

  syncEmails: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      forceFullSync: z.boolean().optional().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
      const emailAccount = new Account(account.token)
      
      try {
        console.log(`Manual email sync triggered (forceFullSync: ${input.forceFullSync})...`)
        await emailAccount.syncEmails(input.forceFullSync)
        console.log('Manual email sync completed successfully')
        return { 
          success: true, 
          message: 'Emails synced successfully' 
        }
      } catch (error) {
        console.error('Manual email sync failed:', error)
        throw new Error(`Failed to sync emails: ${error}`)
      }
    }),

  processEmailsForAI: protectedProcedure
    .input(z.object({
      accountId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId)
      
      try {
        console.log('Processing emails for AI analysis...')
        const { processExistingEmails } = await import('@/lib/process-existing-emails')
        await processExistingEmails(input.accountId, 5) // Process 5 emails at a time
        console.log('Email processing completed successfully')
        return { 
          success: true, 
          message: 'Emails processed for AI analysis' 
        }
      } catch (error) {
        console.error('Email processing failed:', error)
        throw new Error(`Failed to process emails: ${error}`)
      }
    }),

  debugEmails: protectedProcedure
    .input(z.object({
      accountId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId)
      
      try {
        const recentEmails = await ctx.db.email.findMany({
          where: {
            thread: {
              accountId: input.accountId
            }
          },
          include: {
            thread: true,
            from: true
          },
          orderBy: {
            sentAt: 'desc'
          },
          take: 10
        })

        return {
          totalEmails: recentEmails.length,
          emails: recentEmails.map(email => ({
            id: email.id,
            subject: email.subject,
            from: email.from.address,
            sentAt: email.sentAt,
            hasEmbedding: !!email.vectorEmbedding
          }))
        }
      } catch (error) {
        console.error('Debug query failed:', error)
        throw new Error(`Failed to debug emails: ${error}`)
      }
    }),

  getThreads: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      tab: z.string(),
      important: z.boolean(),
      unread: z.boolean(),
      limit: z.number().min(1).max(50).default(SYNC_CONFIG.DEFAULT_LIMIT),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
      const emailAccount = new Account(account.token)
      
      // Force sync emails before returning threads
      try {
        console.log('Starting email sync...')
        await emailAccount.syncEmails(true) // Force full sync
        console.log('Email sync completed successfully')
      } catch (error) {
        console.error('Email sync failed:', error)
        // Continue with existing data even if sync fails
      }

      const baseFilters: Prisma.ThreadWhereInput = {
        inboxStatus: input.tab === "inbox" ? true : false,
        draftStatus: input.tab === "drafts" ? true : false,
        sentStatus: input.tab === "sent" ? true : false,
      }

      const filters: Prisma.ThreadWhereInput = { ...baseFilters }

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

      const limit = Math.min(input.limit ?? SYNC_CONFIG.DEFAULT_LIMIT, SYNC_CONFIG.MAX_LIMIT)
      const { cursor } = input

      const threads = await ctx.db.thread.findMany({
        take: limit + 1,
        where: { 
          accountId: account.id, 
          ...filters 
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          lastMessageDate: "desc",
        },
        include: {
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              replyTo: true,
            },
            orderBy: {
              sentAt: "desc",
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (threads.length > limit) {
        const lastThread = threads.pop()
        nextCursor = lastThread?.id
      }

      return {
        threads,
        nextCursor,
      }
    }),

  getThreadById: protectedProcedure
    .input(z.object({
      threadId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.thread.findUnique({
        where: { id: input.threadId },
        include: {
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              replyTo: true,
              attachments: true,
            },
            orderBy: {
              sentAt: "asc",
            },
          },
        },
      })

      if (!thread) {
        throw new Error("Thread not found")
      }

      return thread
    }),
})