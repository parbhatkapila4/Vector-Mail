import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { arrayToVector } from "@/lib/vector-utils";

export async function POST() {
  try {
    const testEmbedding = new Array(768).fill(0).map(() => Math.random());
    const embeddingVector = arrayToVector(testEmbedding);

    const createData = {
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
    };
    const result = await db.email.create({
      data: createData as unknown as Parameters<typeof db.email.create>[0]["data"],
    });

    const created = result as { id: string; summary: string | null; embedding?: unknown };
    return NextResponse.json({
      success: true,
      message: "Test email created successfully",
      emailId: created.id,
      hasSummary: !!created.summary,
      hasEmbedding: !!created.embedding,
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
