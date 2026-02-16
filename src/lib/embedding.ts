import { GoogleGenAI } from "@google/genai";
import { incrementLlmCall } from "@/lib/metrics/store";
import { recordUsage } from "@/lib/ai-usage";

const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getGenerateEmbeddings(
  summary: string,
  options?: { userId?: string; accountId?: string },
) {
  try {
    const response = await genAi.models.embedContent({
      model: "gemini-embedding-001",
      contents: summary as string,
      config: {
        outputDimensionality: 768,
      },
    });

    if (!response?.embeddings) return [];

    if (options?.userId) {
      recordUsage({
        userId: options.userId,
        accountId: options.accountId,
        operation: "embedding",
        inputTokens: 0,
        outputTokens: 0,
        model: "gemini-embedding-001",
      });
    }

    incrementLlmCall();
    return response.embeddings[0]?.values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return [];
  }
}
