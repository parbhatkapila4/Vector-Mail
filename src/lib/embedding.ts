import { GoogleGenAI } from "@google/genai";
import {
  incrementEmbeddingFailure,
  incrementLlmCall,
  recordEmbeddingLatency,
} from "@/lib/metrics/store";
import { recordUsage } from "@/lib/ai-usage";
import { serverLog } from "@/lib/logging/server-logger";
import { env } from "@/env.js";
const genAi = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY! });

export async function getGenerateEmbeddings(
  summary: string,
  options?: { userId?: string; accountId?: string },
) {
  const start = Date.now();
  try {
    const response = await genAi.models.embedContent({
      model: "gemini-embedding-001",
      contents: summary as string,
      config: {
        outputDimensionality: 768,
      },
    });

    if (!response?.embeddings) {
      incrementEmbeddingFailure();
      return [];
    }

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
    recordEmbeddingLatency(Date.now() - start);
    return response.embeddings[0]?.values;
  } catch (error) {
    incrementEmbeddingFailure();
    serverLog.error(
      { err: error instanceof Error ? error.message : String(error), accountId: options?.accountId },
      "embedding: gemini embedContent failed",
    );
    return [];
  }
}
