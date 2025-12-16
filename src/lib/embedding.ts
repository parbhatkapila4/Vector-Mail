import { GoogleGenAI } from "@google/genai";

const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getGenerateEmbeddings(summary: string) {
  try {
    const response = await genAi.models.embedContent({
      model: "gemini-embedding-001",
      contents: summary as string,
      config: {
        outputDimensionality: 768,
      },
    });

    if (!response?.embeddings) return [];

    return response.embeddings[0]?.values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return [];
  }
}
