import { db } from "@/db/drizzle";
import { tenders, tenderDocuments } from "@/db/schema";
import type { TendersResponse } from "@/types/tender";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const OCDS_API_BASE = "https://ocds-api.etenders.gov.za/api/OCDSReleases";

// This function can be called by a Vercel Cron Job
export async function GET() {
  // Fetch tenders from the last day to keep data fresh
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const dateFrom = yesterday.toISOString().split("T")[0]; // YYYY-MM-DD
  const dateTo = today.toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    const response = await fetch(
      `${OCDS_API_BASE}?dateFrom=${dateFrom}&dateTo=${dateTo}&PageSize=5000`
    );
    if (!response.ok) {
      throw new Error(`OCDS API error: ${response.status}`);
    }

    const data: TendersResponse = await response.json();
    const releases = data.releases || [];

    if (releases.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new tenders to sync.",
      });
    }

    // Process tenders in batches to handle larger datasets
    const batchSize = 100;
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
    }

    // Handle document upserting in batches
    const allDocuments = [];
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
      }
    }

    return NextResponse.json({ success: true, synced: releases.length });
  } catch (error) {
    console.error("Failed to sync tenders:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
