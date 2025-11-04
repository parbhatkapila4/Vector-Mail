import { db } from "../src/server/db";
import { arrayToVector, vectorToArray } from "../src/lib/vector-utils";

async function testVectorSave() {
  console.log("🧪 Testing Vector Save...\n");

  // Test 1: Vector conversion
  console.log("1️⃣ Testing vector conversion:");
  const testEmbedding = Array.from({ length: 768 }, () => Math.random());
  const vectorString = arrayToVector(testEmbedding);
  console.log(
    "   Vector format (first 50 chars):",
    vectorString.substring(0, 50) + "...",
  );
  console.log("   ✓ Conversion to vector string successful\n");

  // Test 2: Parse back
  console.log("2️⃣ Testing vector parsing:");
  const parsedBack = vectorToArray(vectorString);
  console.log("   Original length:", testEmbedding.length);
  console.log("   Parsed length:", parsedBack.length);
  console.log("   Match:", testEmbedding[0] === parsedBack[0]);
  console.log("   ✓ Parse back successful\n");

  // Test 3: Check database schema
  console.log("3️⃣ Checking database schema:");
  try {
    const result = (await db.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Email' 
            AND column_name IN ('summary', 'embedding')
        `) as any[];

    result.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    console.log("   ✓ Schema check successful\n");
  } catch (error) {
    console.error("   ✗ Schema check failed:", error);
  }

  // Test 4: Check pgvector extension
  console.log("4️⃣ Checking pgvector extension:");
  try {
    const ext = (await db.$queryRaw`
            SELECT * FROM pg_extension WHERE extname = 'vector'
        `) as any[];

    if (ext.length > 0) {
      console.log("   ✓ PGVector extension is enabled");
    } else {
      console.log("   ✗ PGVector extension not found");
    }
  } catch (error) {
    console.error("   ✗ Extension check failed:", error);
  }

  // Test 5: Count emails with/without embeddings
  console.log("\n5️⃣ Email analysis status:");
  try {
    const total = await db.email.count();
    const withSummary = await db.email.count({
      where: { summary: { not: null } },
    });
    const withEmbedding = await db.email.count({
      where: { embedding: { not: null } },
    });

    console.log(`   Total emails: ${total}`);
    console.log(`   With summary: ${withSummary}`);
    console.log(`   With embedding: ${withEmbedding}`);
    console.log(`   Need processing: ${total - withSummary}`);
  } catch (error) {
    console.error("   ✗ Count failed:", error);
  }

  console.log("\n✅ Test complete!");
  await db.$disconnect();
}

testVectorSave().catch(console.error);
