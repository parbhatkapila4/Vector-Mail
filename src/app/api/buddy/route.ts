import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { env } from "@/env.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

function isEmailRequest(message: string): boolean {
  const emailKeywords = [
    "email",
    "write an email",
    "compose",
    "draft",
    "send",
    "subject",
    "follow up",
    "thank you",
    "meeting",
    "introduction",
    "request",
    "reply",
    "response",
  ];
  const lowerMessage = message.toLowerCase();
  return emailKeywords.some((keyword) => lowerMessage.includes(keyword));
}

function removeAllSymbols(text: string): string {
  text = text.replace(/\*+/g, "");

  text = text.replace(/^\s*-\s+/gm, "");

  text = text.replace(/•/g, "");

  text = text.replace(/^\s*[▪▫◦‣⁃]\s+/gm, "");

  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");

  return text;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: ChatRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return new Response(
        JSON.stringify({ error: "No message content provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not configured");
      return new Response(
        JSON.stringify({
          error:
            "OpenRouter API key is not configured. Please configure OPENROUTER_API_KEY in your environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://vectormail-ai.vercel.app",
        "X-Title": "VectorMail AI",
      },
    });

    const userMessage = lastMessage.content;
    const isEmail = isEmailRequest(userMessage);

    let systemPrompt: string;
    let userPrompt: string;

    if (isEmail) {
      systemPrompt = `You are a professional AI email assistant that generates complete email drafts based on user summaries.

Your task is to generate a professional email with a clear subject line and well-written body, plus provide 2-3 alternative suggestions.

IMPORTANT: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations - just pure JSON.

The JSON structure must be:
{
  "subject": "Email subject line here",
  "body": "Complete email body with proper greeting, content, and closing",
  "suggestions": [
    {
      "subject": "Alternative subject 1",
      "body": "Alternative email body 1"
    },
    {
      "subject": "Alternative subject 2", 
      "body": "Alternative email body 2"
    }
  ]
}

FORMATTING RULES - ABSOLUTELY CRITICAL - NO SYMBOLS ALLOWED:
- FORBIDDEN: Do NOT use ANY symbols - NO asterisks (*), NO double asterisks (**), NO triple asterisks (***), NO dashes (-), NO dots (•), NO special characters
- For lists, use ONLY numbers (1., 2., 3.) or letters (a., b., c.) - NO symbols
- NEVER use asterisks (*), dashes (-), dots (•), or any other symbols for lists or emphasis
- Use proper paragraph breaks with \\n\\n between paragraphs
- Keep formatting clean and professional with plain text only - NO markdown symbols at all

CORRECT LIST FORMAT EXAMPLES:
1. First item
2. Second item
3. Third item

Or using letters:
a. First point
b. Second point
c. Third point

ABSOLUTELY FORBIDDEN - DO NOT USE:
* Asterisks
- Dashes
• Dots
Any symbols at all

GUIDELINES:
- Write professional, clear, and concise emails
- Use appropriate greetings (Dear, Hi, Hello) and closings (Best regards, Sincerely, Thank you)
- Make the subject line specific and actionable
- Ensure the body is well-structured with proper paragraphs
- Suggestions should offer different tones (formal/casual) or approaches
- Return ONLY the JSON object, nothing else`;

      userPrompt = `Generate an email based on this summary. Return ONLY valid JSON in the exact format specified.

ABSOLUTELY CRITICAL RULES - NO SYMBOLS:
- NEVER use asterisks (*), double asterisks (**), triple asterisks (***), dashes (-), dots (•), or ANY symbols in the email body
- For lists, use ONLY numbers (1., 2., 3.) or letters (a., b., c.) - NO symbols
- Use plain text formatting only - NO markdown symbols, NO special characters

Summary: ${userMessage}`;
    } else {
      systemPrompt = `You are a helpful, friendly, and knowledgeable AI assistant named AI Buddy. You can help with a wide variety of tasks including:
1. Answering questions on any topic
2. Providing explanations and tutorials
3. Writing and editing content
4. Solving problems and brainstorming
5. Coding assistance and debugging
6. General conversation and companionship

IMPORTANT FORMATTING RULES - NO SYMBOLS ALLOWED:
- FORBIDDEN: Do NOT use ANY symbols - NO asterisks (*), NO double asterisks (**), NO triple asterisks (***), NO dashes (-), NO dots (•), NO special characters
- For lists, use ONLY numbers (1., 2., 3.) or letters (a., b., c.) - NO symbols
- NEVER use asterisks (*), dashes (-), dots (•), or any other symbols for lists or emphasis
- Use plain text formatting only - NO markdown symbols at all
- Keep formatting clean and professional with plain text only

Be conversational, clear, and helpful. If you don't know something, admit it honestly. Always aim to be accurate and helpful. Respond naturally like a human would.`;

      userPrompt = userMessage;
    }

    let completion;
    try {
      const completionMessages = isEmail
        ? [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: userPrompt },
          ]
        : [
            { role: "system" as const, content: systemPrompt },
            ...messages
              .filter((msg) => msg.role !== "system")
              .map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
              })),
          ];

      completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: completionMessages,
        max_tokens: isEmail ? 2000 : 1500,
        temperature: 0.7,
        ...(isEmail && { response_format: { type: "json_object" } }),
      });
    } catch (apiError) {
      console.error("OpenRouter API error:", apiError);
      const errorMessage =
        apiError instanceof Error
          ? apiError.message
          : "Failed to create chat completion";
      return new Response(
        JSON.stringify({
          error: "Failed to connect to AI service",
          details: errorMessage,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const content = completion.choices[0]?.message?.content || "";

    if (isEmail) {
      let emailData;
      try {
        emailData = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);

        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          try {
            emailData = JSON.parse(jsonMatch[1]!);
          } catch {
            return new Response(
              JSON.stringify({
                error: "Failed to parse AI response",
                details: "The AI returned an invalid format",
              }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        } else {
          return new Response(
            JSON.stringify({
              error: "Failed to parse AI response",
              details: "The AI returned an invalid format",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      }

      if (!emailData.subject || !emailData.body) {
        return new Response(
          JSON.stringify({
            error: "Invalid email structure",
            details: "The AI response is missing required fields",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      emailData.body = removeAllSymbols(emailData.body);
      if (emailData.suggestions && Array.isArray(emailData.suggestions)) {
        emailData.suggestions = emailData.suggestions.map(
          (suggestion: { subject: string; body: string }) => ({
            subject: suggestion.subject,
            body: removeAllSymbols(suggestion.body),
          }),
        );
      }

      return new Response(JSON.stringify(emailData), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
    } else {
      const cleanedContent = removeAllSymbols(content);

      return new Response(
        JSON.stringify({
          message: cleanedContent,
          type: "conversation",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      );
    }
  } catch (error) {
    console.error("Buddy chat error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
