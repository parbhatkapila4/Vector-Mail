import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { arrayToVector, vectorToArray } from "@/lib/vector-utils";

interface VectorTestResults {
  vectorConversion: boolean;
  pgvectorEnabled: boolean;
  schemaCorrect: boolean;
  schema?: Array<{ column_name: string; data_type: string }>;
  emailStats: { total: number; withSummary: number; withEmbedding: number; needProcessing: number };
}

export async function GET() {
  try {
    const results: VectorTestResults = {
      vectorConversion: false,
      pgvectorEnabled: false,
      schemaCorrect: false,
      emailStats: { total: 0, withSummary: 0, withEmbedding: 0, needProcessing: 0 },
    };


    const testEmbedding = Array.from({ length: 768 }, () => Math.random());
    const vectorString = arrayToVector(testEmbedding);
    const parsedBack = vectorToArray(vectorString);
    results.vectorConversion = parsedBack.length === 768;

    const ext = await db.$queryRaw<unknown[]>`SELECT * FROM pg_extension WHERE extname = 'vector'`;
    results.pgvectorEnabled = ext.length > 0;

    const schema = await db.$queryRaw<Array<{ column_name: string; data_type: string }>>`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Email' 
            AND column_name IN ('summary', 'embedding')
        `;

    results.schema = schema;
    results.schemaCorrect = schema.some(
      (col) => col.column_name === "embedding" && col.data_type === "USER-DEFINED",
    );

    const total = await db.email.count();
    const withSummary = await db.email.count({
      where: { summary: { not: null } },
    });
    const embeddingCountResult = await db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM "Email" WHERE embedding IS NOT NULL
    `;
    const withEmbedding = Number(embeddingCountResult[0]?.count ?? 0);

    results.emailStats = {
      total,
      withSummary,
      withEmbedding,
      needProcessing: total - withSummary,
    };

    return NextResponse.json({
      success: true,
      allTestsPassed:
        results.vectorConversion &&
        results.pgvectorEnabled &&
        results.schemaCorrect,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    );
  }
}
