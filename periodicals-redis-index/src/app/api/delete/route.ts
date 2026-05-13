import { NextRequest, NextResponse } from "next/server";
import { deleteRecord } from "@/lib/indexer";

export async function POST(request: NextRequest) {
  try {
    const { id } = (await request.json()) as { id: string };

    if (!id) {
      return NextResponse.json({ ok: false, message: "Record ID required" }, { status: 400 });
    }

    await deleteRecord(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
