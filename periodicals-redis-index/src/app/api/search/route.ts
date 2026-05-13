import { NextResponse } from "next/server";
import { searchRecords } from "@/lib/indexer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const field = searchParams.get("field") ?? "any";
  const mode = searchParams.get("mode") ?? "rootword";

  const results = await searchRecords(query, field as "any" | "title" | "author" | "subject" | "abstract" | "fulltext", mode as "all" | "phrase" | "rootword");

  return NextResponse.json({
    ok: true,
    query,
    field,
    mode,
    total: results.length,
    results,
  });
}
