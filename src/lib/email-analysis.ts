import OpenAI from 'openai';
import { env } from '@/env.js';
import type { EmailMessage } from "@/types";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://vectormail-ai.vercel.app",
    "X-Title": "VectorMail AI",
  },
});

export interface EmailAnalysis {
  summary: string;
  tags: string[];
  vectorEmbedding: number[];
}

/**
 * Generate a concise summary of an email
 */
export async function generateEmailSummary(email: EmailMessage): Promise<string> {
  try {
    const emailContent = `
Subject: ${email.subject}
From: ${email.from.address}
To: ${email.to.map(t => t.address).join(', ')}
Date: ${new Date(email.sentAt).toLocaleString()}
Body: ${email.body || email.bodySnippet || 'No content'}
    `.trim();

    const prompt = `Please provide a concise summary of this email in 1-2 sentences. Focus on the main purpose, key information, and any action items. Keep it under 100 words.

Email content:
${emailContent}`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content?.trim() || email.subject || "No summary available";
  } catch (error) {
    console.error("Error generating email summary:", error);
    return email.subject || "No summary available";
  }
}

/**
 * Generate relevant tags for an email using AI
 */
export async function generateEmailTags(email: EmailMessage): Promise<string[]> {
  try {
    const emailContent = `
Subject: ${email.subject}
From: ${email.from.address}
Body: ${email.body || email.bodySnippet || 'No content'}
    `.trim();

    const prompt = `Analyze this email and generate 3-5 relevant tags. Choose from these categories and add specific tags:
- Type: spam, important, promotion, personal, work, newsletter, notification, meeting, invoice, receipt, travel, event
- Priority: urgent, high, normal, low
- Action: needs-reply, read-only, follow-up, archive
- Category: finance, shopping, social, professional, travel, health, education

Email content:
${emailContent}

Return only the tags as a comma-separated list, no other text.`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const tagsText = completion.choices[0]?.message?.content?.trim() || '';
    
    return tagsText.split(',').map((tag: string) => tag.trim().toLowerCase()).filter(Boolean);
  } catch (error) {
    console.error("Error generating email tags:", error);
    // Fallback tags based on email properties
    const fallbackTags = [];
    if (email.sysLabels.includes('important')) fallbackTags.push('important');
    if (email.sysLabels.includes('junk')) fallbackTags.push('spam');
    if (email.sysClassifications.includes('promotions')) fallbackTags.push('promotion');
    if (email.hasAttachments) fallbackTags.push('attachment');
    return fallbackTags.length > 0 ? fallbackTags : ['normal'];
  }
}

/**
 * Generate vector embedding for email content
 */
export async function generateEmailEmbedding(email: EmailMessage): Promise<number[]> {
  try {
    // Create a comprehensive text for embedding
    const embeddingText = `
Subject: ${email.subject}
From: ${email.from.address}
To: ${email.to.map(t => t.address).join(', ')}
Body: ${email.body || email.bodySnippet || ''}
Keywords: ${email.keywords.join(', ')}
Classifications: ${email.sysClassifications.join(', ')}
    `.trim();

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Using OpenRouter's embedding model
      input: embeddingText,
      dimensions: 768, // Using 768 dimensions for better performance
    });

    if (!response?.data || response.data.length === 0) {
      throw new Error("No embeddings returned");
    }

    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error("Error generating email embedding:", error);
    // Return a zero vector as fallback
    return new Array(768).fill(0);
  }
}

/**
 * Analyze an email and generate summary, tags, and embedding
 */
export async function analyzeEmail(email: EmailMessage): Promise<EmailAnalysis> {
  try {
    console.log(`Analyzing email: ${email.subject}`);
    
    // Run all analyses in parallel for better performance
    const [summary, tags, vectorEmbedding] = await Promise.all([
      generateEmailSummary(email),
      generateEmailTags(email),
      generateEmailEmbedding(email)
    ]);

    return {
      summary,
      tags,
      vectorEmbedding
    };
  } catch (error) {
    console.error("Error analyzing email:", error);
    // Return fallback analysis
    return {
      summary: email.subject || "No summary available",
      tags: email.sysLabels.includes('important') ? ['important'] : ['normal'],
      vectorEmbedding: new Array(768).fill(0)
    };
  }
}

/**
 * Generate embedding for search query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      dimensions: 768,
    });

    if (!response?.data || response.data.length === 0) {
      throw new Error("No embeddings returned");
    }

    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error("Error generating query embedding:", error);
    // Return a zero vector as fallback
    return new Array(768).fill(0);
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const valA = vecA[i] || 0;
    const valB = vecB[i] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}
