import { NextResponse } from "next/server";
import { getAllRecords } from "@/lib/indexer";

export async function GET() {
  try {
    const records = await getAllRecords();
    return NextResponse.json({
      ok: true,
      records,
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to fetch records",
      },
      { status: 500 }
    );
  }
}