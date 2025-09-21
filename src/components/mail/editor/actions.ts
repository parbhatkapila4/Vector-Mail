'use server';
import TurndownService from 'turndown'
import OpenAI from 'openai';
import { createStreamableValue } from '@ai-sdk/rsc';

export async function generateEmail(context: string, prompt: string) {
    console.log("context", context)
    const stream = createStreamableValue('');

    (async () => {
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
                stream: true,
            });

            for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    stream.update(content);
                }
            }

            stream.done();
        } catch (error) {
            console.error('Error in generateEmail:', error);
            stream.update('Error: Failed to generate email. Please check your OpenRouter API key and try again.');
            stream.done();
        }
    })();

    return { output: stream.value };
}

export async function generate(input: string, context?: string) {
    const stream = createStreamableValue('');

    console.log("input", input);
    console.log("context", context?.substring(0, 200) + '...');
    
    (async () => {
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
                        - Keep completions concise (1-3 sentences maximum)
                        - Use proper grammar, punctuation, and email conventions
                        - Sound professional and appropriate for email communication
                        - Do NOT add greetings, closings, or meta-commentary
                        - Do NOT start new paragraphs or topics unless the sentence is complete
                        - Simply continue where the user left off

                        ENHANCEMENT EXAMPLES:
                        Input: "Thank you for your email regarding"
                        Output: "the project proposal. I've reviewed the details and have a few questions that I'd like to discuss."

                        Input: "I wanted to follow up on"
                        Output: "our meeting last week and discuss the next steps for moving forward with the implementation."

                        Input: "Please let me know if you need"
                        Output: "any additional information or have any questions about the proposal."

                        Input: "I think we should"
                        Output: "schedule a follow-up meeting to discuss the implementation timeline and address any concerns."

                        RESPONSE FORMAT:
                        - Output ONLY the completion text
                        - No newlines, formatting, or extra text
                        - Match the existing tone (formal/casual)
                        - Keep it relevant and helpful
                        - Use proper email language conventions
                        - Ensure the completion flows naturally from the input`
                    }
                ],
                stream: true,
            });

            for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    stream.update(content);
                }
            }

            stream.done();
        } catch (error) {
            console.error('Error in generate:', error);
            stream.update('Error: Failed to generate text. Please check your OpenRouter API key and try again.');
            stream.done();
        }
    })();

    return { output: stream.value };
}