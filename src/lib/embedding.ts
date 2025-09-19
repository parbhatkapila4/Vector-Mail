import { GoogleGenAI } from "@google/genai";


const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })


export async function getGenerateEmbeddings(summary: String) {
    console.log("Generating embeddings")
    try {
        const response = await genAi.models.embedContent({
            model: 'gemini-embedding-001',
            contents: summary as string,
            config: {
                outputDimensionality: 1536,
            },
        });
        if (!response?.embeddings) {
            return []
        }
        const embeddingLength = response?.embeddings[0]?.values;

        return embeddingLength
    } catch (error) {
        console.error("Error generating embeddings:", error)
        return []
    }
}

console.log(await getGenerateEmbeddings("Hello, world!"))