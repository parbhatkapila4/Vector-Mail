import { db } from '@/server/db';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { env } from '@/env.js';

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

    const recentEmails = await db.email.findMany({
      where: {
        thread: {
          accountId: accountId,
        },
      },
      include: {
        thread: true,
        from: true,
        to: true,
        cc: true,
        attachments: true,
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: 10,
    });

    let emailContext = recentEmails
      .map((email) => {
        const toAddresses = email.to.map(t => t.address).join(', ');
        const fromAddress = email.from.address;
        const bodyText = email.body || email.bodySnippet || 'No content';
        const truncatedBody = bodyText.length > 500 ? bodyText.substring(0, 500) + '...' : bodyText;
        
        return `
Subject: ${email.subject}
From: ${fromAddress}
To: ${toAddresses}
Date: ${email.sentAt.toISOString()}
Body: ${truncatedBody}
---`;
      })
      .join('\n');

    // Check if context is too large (rough estimate: 1 token ≈ 4 characters)
    const contextLength = emailContext.length;
    const maxContextLength = 100000; // ~25k tokens
    
    if (contextLength > maxContextLength) {
      console.log(`Context too large: ${contextLength} chars, truncating...`);
      emailContext = emailContext.substring(0, maxContextLength) + '\n... [Context truncated due to length]';
    }

    const systemPrompt = `You are an AI assistant embedded in an email client app. You help users find information from their emails and answer questions about their email content.

CURRENT TIME: ${new Date().toLocaleString()}

EMAIL CONTEXT:
${emailContext}

INSTRUCTIONS:
- Answer questions based on the provided email context
- If the user asks about specific emails, search through the context to find relevant information
- If you can't find the answer in the email context, politely say so
- Be helpful and concise in your responses
- Focus on factual information from the emails
- If asked about upcoming events, meetings, or deadlines, look for relevant information in the email content
- Don't make up information that isn't in the email context`;

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
