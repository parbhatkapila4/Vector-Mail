import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { checkDailyCap, recordUsage } from "@/lib/ai-usage";
import {
  checkUserRateLimit,
  rateLimit429Response,
} from "@/lib/rate-limit";
import { env } from "@/env.js";

const COMPLETE_SYSTEM = (context: string, prompt: string) =>
  `You are an advanced AI email writing assistant that provides intelligent autocomplete and enhancement suggestions for professional emails.

          EMAIL CONTEXT:
          ${context
    ? `CONVERSATION HISTORY:
          ${context}
          
          `
    : ""
  }CURRENT DRAFT: "${prompt}"

          YOUR CAPABILITIES:
          1. **Smart Completion**: Complete the current sentence or paragraph naturally
          2. **Tone Matching**: Match the existing tone (formal, casual, friendly, professional)
          3. **Context Awareness**: Use conversation history to provide relevant completions
          4. **Grammar Enhancement**: Fix grammar issues while maintaining the user's voice
          5. **Professional Polish**: Improve clarity and professionalism when appropriate

          COMPLETION RULES:
          - Complete the current thought naturally and coherently
          - Maintain the same tone and style as the existing text
          - Generate a complete, well-structured EMAIL BODY ONLY
          - Use proper grammar, punctuation, and email conventions
          - Sound professional and appropriate for email communication
          - Include appropriate greetings and closings for a complete email body
          - Create a full, coherent response that flows naturally
          - Use the conversation context to provide relevant content
          - NEVER include subject lines, headers, or metadata

          CRITICAL: ONLY GENERATE EMAIL BODY CONTENT - NO SUBJECT LINES, NO HEADERS, NO METADATA

          RESPONSE FORMAT:
          - Output ONLY the email body content
          - Include the original text as the starting point
          - Use proper paragraph breaks with \\n\\n between paragraphs
          - Structure the email with: greeting, main content paragraphs, closing
          - Include professional greeting and closing
          - Use proper email language conventions
          - Ensure the response is contextually relevant and helpful
          - NEVER include subject lines or email headers
          - Use line breaks (\\n) for proper email formatting
          - Keep paragraphs concise and well-structured
          - ⚠️⚠️⚠️ NUMBERED LISTS: Number and text MUST be on SAME line - "1. Text here" NOT "1.\\nText here" ⚠️⚠️⚠️
          - NEVER put line breaks between number and text in lists`;

const COMPOSE_SYSTEM = (context: string) =>
  `You are a professional AI email assistant that helps compose well-structured, professional emails.

                    THE TIME NOW IS ${new Date().toLocaleString()}
                    
                    START CONTEXT BLOCK
                    ${context}
                    END OF CONTEXT BLOCK
                    
                    IMPORTANT FORMATTING RULES:
                    - Always start with a proper greeting (Dear [Name], Hi [Name], Hello, etc.)
                    - Write in clear, professional paragraphs
                    - Use proper grammar, spelling, and punctuation
                    - End with a professional closing (Best regards, Sincerely, Thank you, etc.) followed by the sender's name
                    - Keep sentences complete and coherent
                    - Use proper spacing between paragraphs
                    - ⚠️⚠️⚠️ ABSOLUTELY CRITICAL - NUMBERED LIST FORMATTING ⚠️⚠️⚠️:
                      * The number, period, space, and text MUST ALL be on ONE SINGLE LINE
                      * Format: "1. Text content here" - ALL on the same line with NO line breaks
                      * NEVER put a line break (\\n) between the number and the text
                      * NEVER put a blank line (\\n\\n) between the number and the text
                      * Example CORRECT: "1. First achievement\\n2. Second achievement"
                      * Example WRONG: "1.\\nFirst achievement" or "1.\\n\\nFirst achievement"
                    
                    CONTENT GUIDELINES:
                    - Be helpful, professional, and articulate
                    - Use the email context to inform your response when available
                    - If context is insufficient, compose a professional draft based on the prompt
                    - Keep the tone appropriate for the situation
                    - Be concise but complete
                    - Avoid run-on sentences or fragmented thoughts
                    
                    OUTPUT FORMAT:
                    - Write the complete email body only
                    - Do not include subject line
                    - Do not add meta-commentary like "Here's your email"
                    - Ensure proper paragraph breaks
                    - Use standard email formatting conventions`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiLimit = checkUserRateLimit(userId, "ai");
    if (!aiLimit.allowed) {
      return rateLimit429Response({
        message: "Too many AI requests. Try again later.",
        remaining: aiLimit.remaining,
        limit: aiLimit.limit,
        retryAfterSec: 60,
      });
    }

    const cap = await checkDailyCap(userId, env.AI_DAILY_CAP_TOKENS);
    if (!cap.allowed) {
      const { log: auditLog } = await import("@/lib/audit/audit-log");
      auditLog({ userId, action: "ai_cap_exceeded", metadata: {} });
      return NextResponse.json(
        {
          error: "Daily AI limit reached",
          message: `You have used ${cap.used} of ${cap.limit} tokens today. Try again tomorrow.`,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { prompt, context = "", mode = "complete" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
        "X-Title": "VectorMail AI",
      },
    });

    const isCompose = mode === "compose";
    const systemContent = isCompose
      ? COMPOSE_SYSTEM(context)
      : COMPLETE_SYSTEM(context, prompt);
    const userContent = isCompose
      ? prompt
      : `Complete this email draft. Start with the text I've written: "${prompt}". 

Format the response as a complete email with proper paragraphs. Use \\n\\n between paragraphs. Do not include subject lines or headers.`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
      stream: false,
    });

    const usage = completion.usage;
    recordUsage({
      userId,
      operation: "compose",
      inputTokens: usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completion_tokens ?? 0,
      model: completion.model ?? undefined,
    });

    const content = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error in generate-email:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 },
    );
  }
}
