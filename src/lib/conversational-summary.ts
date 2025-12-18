import OpenAI from "openai";
import { env } from "@/env.js";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    "X-Title": "VectorMail AI",
  },
});

interface EmailForSummary {
  subject: string;
  from: {
    name: string | null;
    address: string;
  };
  date: Date;
  body: string;
}

export async function generateConversationalSummary(
  email: EmailForSummary,
): Promise<string> {
  try {
    const truncatedBody =
      email.body.length > 3000
        ? email.body.substring(0, 3000) + "..."
        : email.body;

    const emailContent = `
Subject: ${email.subject}
From: ${email.from.name || email.from.address} <${email.from.address}>
Date: ${new Date(email.date).toLocaleDateString()}
Body: ${truncatedBody}
    `.trim();

    const prompt = `Summarize this email in 2-3 sentences. Focus on:
1. What the email is about (main topic)
2. Any action items, deadlines, or important information the recipient needs to know

Be conversational and direct. Write as if you're telling a friend what the email says.

Email:
${emailContent}

Summary:`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary || summary.length < 20) {
      const fromStr = email.from.name || email.from.address;
      const dateStr = new Date(email.date).toLocaleDateString();
      return `This email from ${fromStr} (${dateStr}) is about "${email.subject}". ${email.body.substring(0, 150)}...`;
    }

    return summary;
  } catch (error) {
    console.error("Failed to generate conversational summary:", error);
    const fromStr = email.from.name || email.from.address;
    const dateStr = new Date(email.date).toLocaleDateString();
    return `This email from ${fromStr} dated ${dateStr} is about "${email.subject}". ${email.body.substring(0, 150)}...`;
  }
}
