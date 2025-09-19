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
                model: "openai/gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by providing suggestions and relevant information based on the context of their previous emails.
                        
                        THE TIME NOW IS ${new Date().toLocaleString()}
                        
                        START CONTEXT BLOCK
                        ${context}
                        END OF CONTEXT BLOCK
                        
                        When responding, please keep in mind:
                        - Be helpful, clever, and articulate. 
                        - Rely on the provided email context to inform your response.
                        - If the context does not contain enough information to fully address the prompt, politely give a draft response.
                        - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
                        - Do not invent or speculate about anything that is not directly supported by the email context.
                        - Keep your response focused and relevant to the user's prompt.
                        - Don't add fluff like 'Heres your email' or 'Here's your email' or anything like that.
                        - Directly output the email, no need to say 'Here is your email' or anything like that.
                        - No need to output subject`
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

export async function generate(input: string) {
    const stream = createStreamableValue('');

    console.log("input", input);
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
                model: "openai/gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `ALWAYS RESPOND IN PLAIN TEXT, no html or markdown.
                        You are a helpful AI embedded in a email client app that is used to autocomplete sentences, similar to google gmail autocomplete
                        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
                        AI is a well-behaved and well-mannered individual.
                        AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
                        I am writing a piece of text in a notion text editor app.
                        Help me complete my train of thought here: <input>${input}</input>
                        keep the tone of the text consistent with the rest of the text.
                        keep the response short and sweet. Act like a copilot, finish my sentence if need be, but don't try to generate a whole new paragraph.
                        Do not add fluff like "I'm here to help you" or "I'm a helpful AI" or anything like that.

                        Example:
                        Dear Alice, I'm sorry to hear that you are feeling down.

                        Output: Unfortunately, I can't help you with that.

                        Your output is directly concatenated to the input, so do not add any new lines or formatting, just plain text.`
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