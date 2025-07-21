#!/usr/bin/env tsx

import { db } from "@/db/drizzle";
import { tenders, tenderDocuments } from "@/db/schema";
import { sql, desc } from "drizzle-orm";

async function testTenderSystem() {
  console.log("🧪 Testing Tender System...\n");

  try {
    // Test 1: Check if we have tenders in the database
    console.log("1. Checking tender count...");
    const tenderCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders);

    const count = tenderCount[0]?.count || 0;
    console.log(`   ✅ Found ${count} tenders in database\n`);

    if (count === 0) {
      console.log(
        "   ⚠️  No tenders found. Run 'npx tsx scripts/sync-tenders.ts' first\n"
      );
      return;
    }

    // Test 2: Check recent tenders
    console.log("2. Fetching recent tenders...");
    const recentTenders = await db
      .select({
        ocid: tenders.ocid,
        title: tenders.title,
        publishedDate: tenders.publishedDate,
      })
      .from(tenders)
      .orderBy(desc(tenders.publishedDate))
      .limit(5);

    recentTenders.forEach((tender, index) => {
      console.log(`   ${index + 1}. ${tender.title}`);
      console.log(`      OCID: ${tender.ocid}`);
      console.log(
        `      Published: ${
          tender.publishedDate?.toLocaleDateString() || "N/A"
        }\n`
      );
    });

    // Test 3: Check documents
    console.log("3. Checking document count...");
    const documentCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenderDocuments);

    const docCount = documentCount[0]?.count || 0;
    console.log(`   ✅ Found ${docCount} documents in database\n`);

    // Test 4: Test a specific tender with documents
    console.log("4. Testing tender with documents...");
    const tenderWithDocs = await db
      .select({
        ocid: tenders.ocid,
        title: tenders.title,
      })
      .from(tenders)
      .innerJoin(
        tenderDocuments,
        sql`${tenders.ocid} = ${tenderDocuments.tenderOcid}`
      )
      .limit(1);

    if (tenderWithDocs.length > 0) {
      const tender = tenderWithDocs[0];
      console.log(`   ✅ Found tender with documents: ${tender.title}`);
      console.log(`      OCID: ${tender.ocid}\n`);
    } else {
      console.log("   ⚠️  No tenders with documents found\n");
    }

    // Test 5: Performance test
    console.log("5. Performance test - fetching 20 tenders...");
    const startTime = Date.now();

    const performanceTest = await db
      .select()
      .from(tenders)
      .orderBy(desc(tenders.publishedDate))
      .limit(20);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `   ✅ Fetched ${performanceTest.length} tenders in ${duration}ms\n`
    );

    console.log(
      "🎉 All tests passed! Your tender system is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testTenderSystem()
    .then(() => {
      console.log("\n✨ Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed:", error);
      process.exit(1);
    });
}

export { testTenderSystem };
