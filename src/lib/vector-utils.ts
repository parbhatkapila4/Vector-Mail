export function arrayToVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export function vectorToArray(vector: string | null | undefined): number[] {
  if (!vector) return [];

  const cleaned = vector.replace(/^\[|\]$/g, "").trim();
  if (!cleaned) return [];

  return cleaned.split(",").map((v) => parseFloat(v.trim()));
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const valA = vecA[i] || 0;
    const valB = vecB[i] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}
