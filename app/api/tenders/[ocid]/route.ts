import { NextRequest, NextResponse } from "next/server";

const OCDS_API_BASE = "https://ocds-api.etenders.gov.za/api/OCDSReleases";

export async function GET(
  request: NextRequest,
  { params }: { params: { ocid: string } }
) {
  try {
    const { ocid } = params;
    if (!ocid) {
      throw new Error("OCID parameter is required");
    }

    const targetUrl = `${OCDS_API_BASE}/release/${encodeURIComponent(ocid)}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Tender not found",
            details: `No tender found with OCID: ${ocid}`,
          },
          { status: 404 }
        );
      }

      throw new Error(`OCDS API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Validate that we received valid data
    if (!data) {
      throw new Error("No data received from OCDS API");
    }

    return NextResponse.json(data, {
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
