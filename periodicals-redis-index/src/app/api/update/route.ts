import { NextRequest, NextResponse } from "next/server";
import { updateRecord } from "@/lib/indexer";
import type { PeriodicalRecord } from "@/lib/periodicals";

export async function POST(request: NextRequest) {
  try {
    const { id, updates } = (await request.json()) as {
      id: string;
      updates: Partial<PeriodicalRecord>;
    };

    if (!id) {
      return NextResponse.json({ ok: false, message: "Record ID required" }, { status: 400 });
    }

    await updateRecord(id, updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}
