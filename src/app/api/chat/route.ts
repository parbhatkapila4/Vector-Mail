import { db } from '@/server/db';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { env } from '@/env.js';
import { generateQueryEmbedding } from '@/lib/email-analysis';
import { arrayToVector } from '@/lib/vector-utils';

export async function POST(req: Request) {
  try {
    const { messages, accountId } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (!accountId) {
      return new Response('Account ID is required', { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return new Response('No message content provided', { status: 400 });
    }

    const userQuery = lastMessage.content;

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    });

    if (!account) {
      return new Response('Account not found', { status: 404 });
    }

    // 🚀 RAG SYSTEM: Generate embedding for user query
    console.log('🔍 Generating embedding for query:', userQuery);
    const queryEmbedding = await generateQueryEmbedding(userQuery);
    const queryVector = arrayToVector(queryEmbedding);

    // 🎯 RAG SYSTEM: Find semantically similar emails using vector search
    console.log('🔎 Searching for relevant emails using semantic similarity...');
    
    // Calculate date 90 days ago for filtering recent emails
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const relevantEmails = await db.$queryRaw<Array<{
      id: string;
      subject: string;
      summary: string | null;
      body: string | null;
      bodySnippet: string | null;
      sentAt: Date;
      similarity: number;
    }>>`
      SELECT 
        e.id,
        e.subject,
        e.summary,
        e.body,
        e."bodySnippet",
        e."sentAt",
        1 - (e.embedding <=> ${queryVector}::vector) as similarity
      FROM "Email" e
      INNER JOIN "Thread" t ON e."threadId" = t.id
      WHERE 
        t."accountId" = ${accountId}
        AND e.embedding IS NOT NULL
        AND e."sentAt" >= ${ninetyDaysAgo}
      ORDER BY e.embedding <=> ${queryVector}::vector
      LIMIT 10
    `;

    console.log(`✅ Found ${relevantEmails.length} relevant emails (avg similarity: ${
      relevantEmails.length > 0 
        ? (relevantEmails.reduce((sum, e) => sum + e.similarity, 0) / relevantEmails.length).toFixed(3)
        : 0
    })`);

    // Get full email details for the relevant ones
    const emailIds = relevantEmails.map(e => e.id);
    const fullEmails = await db.email.findMany({
      where: {
        id: { in: emailIds },
      },
      include: {
        thread: true,
        from: true,
        to: true,
        cc: true,
        attachments: true,
      },
    });

    // Create context from semantically similar emails
    let emailContext = relevantEmails
      .map((relevantEmail) => {
        const fullEmail = fullEmails.find(e => e.id === relevantEmail.id);
        if (!fullEmail) return '';

        const toAddresses = fullEmail.to.map(t => t.address).join(', ');
        const fromAddress = fullEmail.from.address;
        const fromName = fullEmail.from.name || fromAddress;
        
        // Use summary if available, otherwise use body/snippet
        const content = relevantEmail.summary || 
                       relevantEmail.body || 
                       relevantEmail.bodySnippet || 
                       'No content';
        
        const truncatedContent = content.length > 600 
          ? content.substring(0, 600) + '...' 
          : content;
        
        const similarity = (relevantEmail.similarity * 100).toFixed(1);
        
        return `
[Relevance: ${similarity}%]
Subject: ${relevantEmail.subject}
From: ${fromName} <${fromAddress}>
To: ${toAddresses}
Date: ${new Date(relevantEmail.sentAt).toLocaleDateString()}
${relevantEmail.summary ? 'Summary' : 'Content'}: ${truncatedContent}
---`;
      })
      .filter(Boolean)
      .join('\n');

    // Check if context is too large (rough estimate: 1 token ≈ 4 characters)
    const contextLength = emailContext.length;
    const maxContextLength = 100000; // ~25k tokens
    
    if (contextLength > maxContextLength) {
      console.log(`Context too large: ${contextLength} chars, truncating...`);
      emailContext = emailContext.substring(0, maxContextLength) + '\n... [Context truncated due to length]';
    }

    const systemPrompt = `You are an AI assistant with RAG (Retrieval-Augmented Generation) capabilities embedded in an email client app. You help users find information from their emails using semantic search.

🔍 SEARCH METHOD: The emails below were found using vector similarity search based on the user's query. They are ranked by relevance (similarity score shown).

CURRENT TIME: ${new Date().toLocaleString()}

📧 RELEVANT EMAIL CONTEXT (Sorted by Semantic Similarity):
${emailContext || 'No relevant emails found for this query.'}

INSTRUCTIONS:
- Provide clean, natural language responses - NO formatting, NO asterisks, NO bold text
- DO NOT repeat email metadata (Subject, From, Date) - this is already shown to the user
- Answer questions based on the email context above
- Summarize the key information from relevant emails in a conversational way
- Simply describe what the email is about without repeating headers or formatting
- Be concise and helpful - get straight to the point
- If you can't find the answer, politely say so
- Don't make up information that isn't in the email context

Example good response: "Yes, I found one email from Brilliant. It's a rejection email for a Software Engineer (Growth) position, stating that your past experience wasn't a perfect match for the role."

Example bad response: "**Subject:** ..., **From:** ..., **Date:** ..." (DO NOT DO THIS)`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('API Key present:', !!env.OPENROUTER_API_KEY);
          console.log('API Key length:', env.OPENROUTER_API_KEY?.length);
          
          const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: env.OPENROUTER_API_KEY,
            defaultHeaders: {
              "HTTP-Referer": "https://vectormail-ai.vercel.app",
              "X-Title": "VectorMail AI",
            },
          });

          console.log('Making API call with messages:', messages.length);
          console.log('Email context length:', emailContext.length);
          
          const completion = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              ...messages,
            ],
            stream: true,
          });
          
          console.log('API call successful, starting to stream...');

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Error in chat API:', error);
          console.error('Error details:', {
            message: (error as any)?.message,
            status: (error as any)?.status,
            code: (error as any)?.code,
            type: (error as any)?.type
          });
          controller.enqueue(encoder.encode('Error: Failed to generate response. Please check your OpenRouter API key and try again.'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
