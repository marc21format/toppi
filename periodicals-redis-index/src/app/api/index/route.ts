import { NextResponse } from "next/server";
import { indexRecords } from "@/lib/indexer";
import { samplePeriodicals, type PeriodicalRecord } from "@/lib/periodicals";

export async function POST(request: Request) {
  let records: PeriodicalRecord[] = samplePeriodicals;

  try {
    const body = (await request.json()) as { records?: PeriodicalRecord[] };
    if (Array.isArray(body.records) && body.records.length > 0) {
      records = body.records;
    }
  } catch {
    records = samplePeriodicals;
  }

  const summary = await indexRecords(records);

  return NextResponse.json({
    ok: true,
    records: summary.indexed,
    uniqueTerms: summary.uniqueTerms,
  });
}
