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

export type SummaryLength = "short" | "medium" | "long" | "auto";

export async function generateConversationalSummary(
  email: EmailForSummary,
  lengthPreference: SummaryLength = "auto",
  userRequest?: string,
): Promise<string> {
  try {
    let detectedLength: SummaryLength = lengthPreference;
    if (userRequest) {
      const lowerRequest = userRequest.toLowerCase();
      if (
        /(very\s+)?short|brief|quick|one\s+sentence|in\s+short|tl;?dr/i.test(
          lowerRequest,
        )
      ) {
        detectedLength = "short";
      } else if (
        /long|detailed|comprehensive|full|complete|everything/i.test(
          lowerRequest,
        )
      ) {
        detectedLength = "long";
      } else if (
        /medium|normal|standard|regular/i.test(lowerRequest) ||
        lengthPreference === "auto"
      ) {
        detectedLength = "medium";
      }
    }

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

    let lengthInstruction = "";
    let maxTokens = 200;

    switch (detectedLength) {
      case "short":
        lengthInstruction =
          "Summarize this email in ONE SHORT SENTENCE. Be extremely concise - just the essential point.";
        maxTokens = 50;
        break;
      case "long":
        lengthInstruction =
          "Provide a comprehensive summary in 4-6 sentences. Include all important details, context, action items, and key information.";
        maxTokens = 400;
        break;
      case "medium":
      default:
        lengthInstruction =
          "Summarize this email in 2-3 sentences. Focus on the main topic and any action items or important information.";
        maxTokens = 200;
        break;
    }

    const prompt = `${lengthInstruction}

Focus on:
1. What the email is about (main topic)
2. Any action items, deadlines, or important information the recipient needs to know
${detectedLength === "long" ? "3. All relevant details, dates, amounts, names, and context\n4. Any follow-up actions or next steps" : ""}

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
      max_tokens: maxTokens,
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
