import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { tenders } from "@/db/schema";
import { desc, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("PageSize")) || 20;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const limit = Math.min(pageSize, 1000); // Cap at 1000 for performance
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    if (dateFrom) {
      whereConditions.push(gte(tenders.publishedDate, new Date(dateFrom)));
    }
    if (dateTo) {
      whereConditions.push(lte(tenders.publishedDate, new Date(dateTo)));
    }

    // Fetch data from Neon database
    const [tendersData, totalCountResult] = await Promise.all([
      db
        .select()
        .from(tenders)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(tenders.publishedDate))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tenders)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        ),
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    // Transform to match the original OCDS API format
    const releases = tendersData.map((tender) => ({
      ocid: tender.ocid,
      id: tender.id,
      date: tender.publishedDate?.toISOString(),
      tender: {
        id: tender.id,
        title: tender.title,
        description: tender.description,
        procurementMethod: tender.procurementMethod,
        procurementMethodDetails: tender.procurementMethodDetails,
        mainProcurementCategory: tender.mainProcurementCategory,
        tenderPeriod: {
          startDate: tender.startDate?.toISOString(),
          endDate: tender.endDate?.toISOString(),
        },
        procuringEntity: tender.procuringEntity,
        value: tender.value,
      },
      buyer: tender.procuringEntity,
    }));

    return NextResponse.json(
      {
        releases,
        totalCount,
        page,
        pageSize: limit,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching tenders:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenders" },
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
