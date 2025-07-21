import { db } from "@/db/drizzle";
import { tenderDocuments } from "@/db/schema";
import { sql } from "drizzle-orm";

async function cleanupDuplicateDocuments() {
  console.log("🧹 Cleaning up duplicate documents...");

  try {
    // Delete duplicate documents, keeping only the first occurrence of each unique combination
    const result = await db.execute(sql`
      DELETE FROM tender_documents 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM tender_documents 
        GROUP BY tender_ocid, document_id
      )
    `);

    console.log(
      `✅ Cleaned up duplicate documents. Rows affected: ${result.rowCount}`
    );

    // Check remaining count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenderDocuments);
    console.log(`📊 Remaining documents: ${countResult[0]?.count || 0}`);
  } catch (error) {
    console.error("❌ Failed to cleanup duplicates:", error);
    throw error;
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupDuplicateDocuments()
    .then(() => {
      console.log("✨ Cleanup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Cleanup failed:", error);
      process.exit(1);
    });
}

export { cleanupDuplicateDocuments };
