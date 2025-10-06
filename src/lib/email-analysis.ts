import OpenAI from 'openai';
import { env } from '@/env.js';
import type { EmailMessage } from "@/types";
import { getGenerateEmbeddings } from './embedding';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    "X-Title": "VectorMail AI",
  },
});

export interface EmailAnalysis {
  summary: string;
  tags: string[];
  vectorEmbedding: number[];
}

/**
 * Generate a comprehensive summary of an email
 */
export async function generateEmailSummary(email: EmailMessage): Promise<string> {
  try {
    // Clean and truncate email body for better processing
    const bodyContent = email.body || email.bodySnippet || 'No content';
    const truncatedBody = bodyContent.length > 3000 
      ? bodyContent.substring(0, 3000) + '...' 
      : bodyContent;

    const emailContent = `
Subject: ${email.subject}
From: ${email.from.name || email.from.address} <${email.from.address}>
To: ${email.to.map(t => t.name || t.address).join(', ')}
Date: ${new Date(email.sentAt).toLocaleString()}
Body: ${truncatedBody}
    `.trim();

    const prompt = `Analyze this email and create a comprehensive, informative summary. Include:

1. **Main Purpose**: What is this email about? (e.g., order confirmation, meeting request, newsletter, promotion)
2. **Key Information**: Important details like names, dates, amounts, locations, or specific items mentioned
3. **Action Items**: Any tasks, requests, or deadlines mentioned
4. **Context**: Who sent it and why it matters (business, personal, automated notification, etc.)

Write 3-5 sentences that capture the essential information someone would need to understand and act on this email. Be specific and include relevant details.

Email content:
${emailContent}

Summary:`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.4,
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    
    // Ensure we have a meaningful summary
    if (!summary || summary.length < 20) {
      return `Email from ${email.from.name || email.from.address} about: ${email.subject}`;
    }

    return summary;
  } catch (error) {
    console.error("Error generating email summary:", error);
    return `Email from ${email.from.name || email.from.address} regarding: ${email.subject}`;
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
      model: "google/gemini-2.0-flash-exp:free",
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
 * Generate vector embedding from summary using Gemini
 * Includes summary and key metadata for richer semantic representation
 */
export async function generateEmailEmbedding(summary: string, email?: EmailMessage): Promise<number[]> {
  try {
    // Create a rich text representation for embedding
    let embeddingText = summary;
    
    // If email context is provided, enhance the embedding with metadata
    if (email) {
      const senderInfo = email.from.name || email.from.address;
      const dateInfo = new Date(email.sentAt).toLocaleDateString();
      
      embeddingText = `${summary}\n\nFrom: ${senderInfo}\nDate: ${dateInfo}\nSubject: ${email.subject}`;
    }
    
    console.log("Generating embedding for:", embeddingText.substring(0, 150) + "...");
    
    // Use Gemini embeddings with 768 dimensions
    const embedding = await getGenerateEmbeddings(embeddingText);
    
    if (!embedding || embedding.length === 0) {
      throw new Error("No embeddings returned from Gemini");
    }

    console.log(`✓ Generated embedding with ${embedding.length} dimensions`);
    return embedding;
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
    console.log(`\n📧 Analyzing email: ${email.subject}`);
    console.log(`   From: ${email.from.name || email.from.address}`);
    
    // First generate comprehensive summary using OpenRouter
    console.log(`   ⚙️  Generating detailed summary...`);
    const summary = await generateEmailSummary(email);
    console.log(`   ✓ Summary (${summary.length} chars): ${summary.substring(0, 100)}...`);
    
    // Generate embedding from the summary + metadata using Gemini
    console.log(`   ⚙️  Generating semantic embedding...`);
    const vectorEmbedding = await generateEmailEmbedding(summary, email);
    
    // Generate tags
    console.log(`   ⚙️  Generating tags...`);
    const tags = await generateEmailTags(email);
    console.log(`   ✓ Tags: ${tags.join(', ')}`);

    console.log(`   ✅ Analysis complete!\n`);

    return {
      summary,
      tags,
      vectorEmbedding
    };
  } catch (error) {
    console.error("❌ Error analyzing email:", error);
    // Return fallback analysis
    return {
      summary: email.subject || "No summary available",
      tags: email.sysLabels.includes('important') ? ['important'] : ['normal'],
      vectorEmbedding: new Array(768).fill(0)
    };
  }
}

/**
 * Generate embedding for search query using Gemini
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    // Use Gemini for query embeddings to match email embeddings
    const embedding = await getGenerateEmbeddings(query);
    
    if (!embedding || embedding.length === 0) {
      throw new Error("No embeddings returned");
    }

    return embedding;
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
