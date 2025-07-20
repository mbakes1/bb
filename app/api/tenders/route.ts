import { NextRequest, NextResponse } from "next/server";

const OCDS_API_BASE = "https://ocds-api.etenders.gov.za/api/OCDSReleases";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Forward all query parameters to the OCDS API
    const queryString = searchParams.toString();
    const targetUrl = `${OCDS_API_BASE}?${queryString}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`OCDS API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
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
