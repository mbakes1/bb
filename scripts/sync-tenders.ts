import { db } from "@/db/drizzle";
import { tenders, tenderDocuments } from "@/db/schema";
import type { Release, TendersResponse } from "@/types/tender";
import { sql } from "drizzle-orm";

const OCDS_API_BASE = "https://ocds-api.etenders.gov.za/api/OCDSReleases";

async function syncTenders() {
  console.log("Starting tender sync...");

  // Fetch tenders from the last 6 months for comprehensive population
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  const dateFrom = sixMonthsAgo.toISOString().split("T")[0]; // YYYY-MM-DD
  const dateTo = today.toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    console.log(`Fetching tenders from ${dateFrom} to ${dateTo}...`);
    const response = await fetch(
      `${OCDS_API_BASE}?dateFrom=${dateFrom}&dateTo=${dateTo}&PageSize=8000`
    );

    if (!response.ok) {
      throw new Error(`OCDS API error: ${response.status}`);
    }

    const data: TendersResponse = await response.json();
    const releases = data.releases || [];

    console.log(`Found ${releases.length} releases to sync`);

    if (releases.length === 0) {
      console.log("No tenders to sync.");
      return;
    }

    // Process tenders in batches to avoid database limits
    console.log("Upserting tenders in batches...");
    const batchSize = 100;
    let processedCount = 0;

    for (let i = 0; i < releases.length; i += batchSize) {
      const batch = releases.slice(i, i + batchSize);

      await db
        .insert(tenders)
        .values(
          batch.map((release) => ({
            ocid: release.ocid,
            id: release.tender?.id,
            title: release.tender?.title || "Untitled Tender",
            description: release.tender?.description,
            procurementMethod: release.tender?.procurementMethod,
            procurementMethodDetails: release.tender?.procurementMethodDetails,
            mainProcurementCategory: release.tender?.mainProcurementCategory,
            publishedDate: release.date ? new Date(release.date) : null,
            startDate: release.tender?.tenderPeriod?.startDate
              ? new Date(release.tender.tenderPeriod.startDate)
              : null,
            endDate: release.tender?.tenderPeriod?.endDate
              ? new Date(release.tender.tenderPeriod.endDate)
              : null,
            procuringEntity:
              release.tender?.procuringEntity || release.buyer || null,
            value: release.tender?.value || null,
            updatedAt: new Date(),
          }))
        )
        .onConflictDoUpdate({
          target: tenders.ocid,
          set: {
            title: sql`excluded.title`,
            description: sql`excluded.description`,
            endDate: sql`excluded.end_date`,
            value: sql`excluded.value`,
            updatedAt: new Date(),
          },
        });

      processedCount += batch.length;
      console.log(
        `   Processed ${processedCount}/${releases.length} tenders...`
      );
    }

    // Handle document upserting in batches
    console.log("Upserting documents in batches...");
    let documentCount = 0;
    const allDocuments = [];

    // Collect all documents first
    for (const release of releases) {
      if (release.tender?.documents && release.tender.documents.length > 0) {
        for (const doc of release.tender.documents) {
          allDocuments.push({
            tenderOcid: release.ocid,
            documentId: doc.id,
            title: doc.title,
            description: doc.description,
            url: doc.url,
            format: doc.format,
            datePublished: doc.datePublished
              ? new Date(doc.datePublished)
              : null,
            dateModified: doc.dateModified ? new Date(doc.dateModified) : null,
          });
        }
      }
    }

    // Process documents in batches
    const docBatchSize = 200;
    for (let i = 0; i < allDocuments.length; i += docBatchSize) {
      const batch = allDocuments.slice(i, i + docBatchSize);

      if (batch.length > 0) {
        await db
          .insert(tenderDocuments)
          .values(batch)
          .onConflictDoUpdate({
            target: [tenderDocuments.tenderOcid, tenderDocuments.documentId],
            set: {
              title: sql`excluded.title`,
              description: sql`excluded.description`,
              url: sql`excluded.url`,
              format: sql`excluded.format`,
              datePublished: sql`excluded.date_published`,
              dateModified: sql`excluded.date_modified`,
            },
          });

        documentCount += batch.length;
        console.log(
          `   Processed ${documentCount}/${allDocuments.length} documents...`
        );
      }
    }

    console.log(
      `✅ Successfully synced ${releases.length} tenders and ${documentCount} documents`
    );
  } catch (error) {
    console.error("❌ Failed to sync tenders:", error);
    throw error;
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncTenders()
    .then(() => {
      console.log("Sync completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Sync failed:", error);
      process.exit(1);
    });
}

export { syncTenders };
