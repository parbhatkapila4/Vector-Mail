import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { arrayToVector } from "@/lib/vector-utils";

export async function POST() {
  try {
    // Create a test email with summary and embedding
    const testEmbedding = new Array(768).fill(0).map(() => Math.random());
    const embeddingVector = arrayToVector(testEmbedding);

    const result = await db.email.create({
      data: {
        id: `test-${Date.now()}`,
        emailLabel: "inbox",
        threadId: `thread-test-${Date.now()}`,
        createdTime: new Date(),
        lastModifiedTime: new Date(),
        sentAt: new Date(),
        receivedAt: new Date(),
        internetMessageId: `<test-${Date.now()}@test.com>`,
        subject: "Test Email with Embedding",
        sysLabels: ["inbox"],
        sysClassifications: [],
        keywords: [],
        internetHeaders: [],
        sensitivity: "normal",
        hasAttachments: false,
        body: "This is a test email body",
        bodySnippet: "This is a test",
        folderId: "INBOX",
        omitted: [],
        summary: "This is a test email to verify embedding storage",
        embedding: embeddingVector,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test email created successfully",
      emailId: result.id,
      hasSummary: !!result.summary,
      hasEmbedding: !!result.embedding,
    });
  } catch (error) {
    console.error("Error creating test email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
