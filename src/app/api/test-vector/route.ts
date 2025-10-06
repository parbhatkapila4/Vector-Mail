import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { arrayToVector, vectorToArray } from "@/lib/vector-utils";

export async function GET() {
    try {
        const results: any = {
            vectorConversion: false,
            pgvectorEnabled: false,
            schemaCorrect: false,
            emailStats: {}
        };

        // Test 1: Vector conversion
        const testEmbedding = Array.from({ length: 768 }, () => Math.random());
        const vectorString = arrayToVector(testEmbedding);
        const parsedBack = vectorToArray(vectorString);
        results.vectorConversion = parsedBack.length === 768;

        // Test 2: Check pgvector extension
        const ext = await db.$queryRaw`
            SELECT * FROM pg_extension WHERE extname = 'vector'
        ` as any[];
        results.pgvectorEnabled = ext.length > 0;

        // Test 3: Check schema
        const schema = await db.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Email' 
            AND column_name IN ('summary', 'embedding')
        ` as any[];
        
        results.schema = schema;
        results.schemaCorrect = schema.some((col: any) => 
            col.column_name === 'embedding' && col.data_type === 'USER-DEFINED'
        );

        // Test 4: Email stats
        const total = await db.email.count();
        const withSummary = await db.email.count({ where: { summary: { not: null } } });
        const withEmbedding = await db.email.count({ where: { embedding: { not: null } } });
        
        results.emailStats = {
            total,
            withSummary,
            withEmbedding,
            needProcessing: total - withSummary
        };

        return NextResponse.json({
            success: true,
            allTestsPassed: results.vectorConversion && results.pgvectorEnabled && results.schemaCorrect,
            results
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}


