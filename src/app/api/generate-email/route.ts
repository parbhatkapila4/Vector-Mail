import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

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
        "HTTP-Referer": "https://vectormail-ai.vercel.app",
        "X-Title": "VectorMail AI",
      },
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an advanced AI email writing assistant that provides intelligent autocomplete and enhancement suggestions for professional emails.

          EMAIL CONTEXT:
          ${
            context
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
          - Keep paragraphs concise and well-structured`,
        },
        {
          role: "user",
          content: `Complete this email draft. Start with the text I've written: "${prompt}". 

Format the response as a complete email with proper paragraphs. Use \\n\\n between paragraphs. Do not include subject lines or headers.`,
        },
      ],
      stream: false, // Disable streaming
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
