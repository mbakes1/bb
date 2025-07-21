import { NextResponse } from "next/server";
import { getFilterStats } from "@/lib/tender-filters";

export async function GET() {
  try {
    const filterStats = await getFilterStats();
    return NextResponse.json(filterStats);
  } catch (error) {
    console.error("Error fetching filter stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter statistics" },
      { status: 500 }
    );
  }
}
