import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { tenders, tenderDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { ocid: string } }
) {
  try {
    const { ocid } = params;
    if (!ocid) {
      throw new Error("OCID parameter is required");
    }

    // Fetch the tender and its documents from Neon database
    const [tenderResults, documentsData] = await Promise.all([
      db.select().from(tenders).where(eq(tenders.ocid, ocid)).limit(1),
      db
        .select()
        .from(tenderDocuments)
        .where(eq(tenderDocuments.tenderOcid, ocid)),
    ]);

    const tenderData = tenderResults[0];

    if (!tenderData) {
      return NextResponse.json(
        {
          error: "Tender not found",
          details: `No tender found with OCID: ${ocid}`,
        },
        { status: 404 }
      );
    }

    // Transform to match the original OCDS API format
    const release = {
      ocid: tenderData.ocid,
      id: tenderData.id,
      date: tenderData.publishedDate?.toISOString(),
      tender: {
        id: tenderData.id,
        title: tenderData.title,
        description: tenderData.description,
        procurementMethod: tenderData.procurementMethod,
        procurementMethodDetails: tenderData.procurementMethodDetails,
        mainProcurementCategory: tenderData.mainProcurementCategory,
        tenderPeriod: {
          startDate: tenderData.startDate?.toISOString(),
          endDate: tenderData.endDate?.toISOString(),
        },
        procuringEntity: tenderData.procuringEntity,
        value: tenderData.value,
        documents: documentsData.map((doc) => ({
          id: doc.documentId,
          title: doc.title,
          description: doc.description,
          url: doc.url,
          format: doc.format,
          datePublished: doc.datePublished?.toISOString(),
          dateModified: doc.dateModified?.toISOString(),
        })),
      },
      buyer: tenderData.procuringEntity,
    };

    return NextResponse.json(release, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error fetching tender detail:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tender detail",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
