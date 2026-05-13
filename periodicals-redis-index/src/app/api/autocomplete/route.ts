import { NextResponse } from "next/server";
import { getAutocompleteSuggestions } from "@/lib/indexer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("q") ?? "";

  const suggestions = await getAutocompleteSuggestions(prefix);

  return NextResponse.json({
    ok: true,
    prefix,
    suggestions,
  });
}
