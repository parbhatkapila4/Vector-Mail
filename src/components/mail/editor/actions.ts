"use server";
import OpenAI from "openai";

export async function generateEmail(
  context: string,
  prompt: string,
): Promise<{ content: string }> {
  console.log("context", context);

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not configured");
    throw new Error(
      "OpenRouter API key is not configured. Please configure OPENROUTER_API_KEY in your environment variables.",
    );
  }

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
        "X-Title": "VectorMail AI",
      },
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a professional AI email assistant that helps compose well-structured, professional emails. 

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
                    - Use standard email formatting conventions`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    const content = completion.choices[0]?.message?.content || "";
    return { content };
  } catch (error) {
    console.error("Error in generateEmail:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate email: ${error.message}`
        : "Failed to generate email. Please check your OpenRouter API key and try again.",
    );
  }
}

export async function generate(
  input: string,
  context?: string,
): Promise<{ content: string }> {
  console.log("input", input);
  console.log("context", context?.substring(0, 200) + "...");

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not configured");
    throw new Error(
      "OpenRouter API key is not configured. Please configure OPENROUTER_API_KEY in your environment variables.",
    );
  }

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      timeout: 30000,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_URL || "https://vectormail.space",
        "X-Title": "VectorMail AI",
      },
    });

    const limitedContext = context
      ? context.length > 1500
        ? context.substring(0, 1500) + "...[truncated]"
        : context
      : "";

    const systemPrompt = `You are an advanced AI email writing assistant that provides intelligent autocomplete and enhancement suggestions for professional emails.

EMAIL CONTEXT:
${
  limitedContext
    ? `CONVERSATION HISTORY:
${limitedContext}

`
    : ""
}CURRENT DRAFT: "${input}"

COMPLETION RULES:
- Complete the current thought naturally and coherently
- Maintain the same tone and style as the existing text
- Generate a complete, well-structured EMAIL BODY ONLY
- Use proper grammar, punctuation, and email conventions
- Include appropriate greetings and closings
- Keep response concise (2-4 paragraphs max)
- Use \\n\\n between paragraphs
- NEVER include subject lines, headers, or metadata`;

    const userPrompt = `Complete this email draft. Start with: "${input}". Format as complete email with proper paragraphs.`;

    const models = [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.5-flash",
      "anthropic/claude-3-haiku:beta",
      "openai/gpt-3.5-turbo",
    ];

    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const completion = await Promise.race([
          openai.chat.completions.create({
            model,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: userPrompt,
              },
            ],
            stream: false,
            max_tokens: 400,
            temperature: 0.7,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error("Request timeout: AI generation took too long"),
                ),
              25000,
            ),
          ),
        ]);

        const content = completion.choices[0]?.message?.content || "";
        if (content.trim()) {
          console.log(`[AI] Successfully generated with model: ${model}`);
          return { content };
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const errorMsg = lastError.message.toLowerCase();

        if (
          errorMsg.includes("429") ||
          errorMsg.includes("rate limit") ||
          errorMsg.includes("too many requests") ||
          errorMsg.includes("404") ||
          errorMsg.includes("no endpoints found") ||
          errorMsg.includes("not found") ||
          errorMsg.includes("timeout")
        ) {
          console.warn(
            `[AI] Model ${model} failed: ${lastError.message}, trying next model...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        console.error(
          `[AI] Model ${model} failed with unrecoverable error: ${lastError.message}`,
        );
        throw lastError;
      }
    }

    throw lastError || new Error("All AI models failed");
  } catch (error) {
    console.error("[AI] Error in generate:", error);

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();

      if (errorMsg.includes("timeout")) {
        throw new Error("AI generation timed out. Please try again.");
      }
      if (errorMsg.includes("429") || errorMsg.includes("rate limit")) {
        throw new Error(
          "AI service is temporarily rate-limited. Please wait a moment and try again.",
        );
      }
      if (errorMsg.includes("404") || errorMsg.includes("no endpoints found")) {
        throw new Error(
          "AI model not available. Please try again in a moment.",
        );
      }
      if (errorMsg.includes("401") || errorMsg.includes("unauthorized")) {
        throw new Error(
          "AI service authentication failed. Please contact support.",
        );
      }
      if (errorMsg.includes("all ai models failed")) {
        throw new Error(
          "All AI models are currently unavailable. Please try again later.",
        );
      }
    }

    throw new Error(
      error instanceof Error
        ? `AI generation failed: ${error.message}`
        : "AI generation failed. Please try again.",
    );
  }
}
