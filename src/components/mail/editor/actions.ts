'use server';
import OpenAI from 'openai';

export async function generateEmail(context: string, prompt: string) {
    console.log("context", context)
    
    try {
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
                    - Use standard email formatting conventions`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            stream: false, // DISABLE STREAMING
        });

        const content = completion.choices[0]?.message?.content || "";
        return { content };
    } catch (error) {
        console.error('Error in generateEmail:', error);
        return { content: 'Error: Failed to generate email. Please check your OpenRouter API key and try again.' };
    }
}

export async function generate(input: string, context?: string) {
    console.log("input", input);
    console.log("context", context?.substring(0, 200) + '...');
    
    try {
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
                    ${context ? `CONVERSATION HISTORY:
                    ${context}
                    
                    ` : ''}CURRENT DRAFT: "${input}"

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
                    - Keep paragraphs concise and well-structured`
                },
                {
                    role: "user",
                    content: `Complete this email draft. Start with the text I've written: "${input}". 

Format the response as a complete email with proper paragraphs. Use \\n\\n between paragraphs. Do not include subject lines or headers.`
                }
            ],
            stream: false, // DISABLE STREAMING
        });

        const content = completion.choices[0]?.message?.content || "";
        return { content };
    } catch (error) {
        console.error('Error in generate:', error);
        return { content: 'Error: Failed to generate text. Please check your OpenRouter API key and try again.' };
    }
}