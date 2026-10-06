import { NextResponse } from "next/server";
import { searchJobsuche } from "@/lib/ausbildung/jobsuche";

export const dynamic = "force-dynamic";

const hits = new Map<string, { count: number; at: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 40;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.at > WINDOW_MS) {
    hits.set(ip, { count: 1, at: now });
    return true;
  }
  if (cur.count >= MAX_PER_WINDOW) return false;
  cur.count += 1;
  return true;
}

export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anon";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many Ausbildung searches. Try again in a minute." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const field = searchParams.get("field") ?? undefined;
  const where = searchParams.get("where") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const size = Number(searchParams.get("size") ?? "20");

  try {
    const result = await searchJobsuche({
      q,
      field,
      where,
      page: Number.isFinite(page) ? page : 1,
      size: Number.isFinite(size) ? size : 20,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ausbildung/search]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load Ausbildung listings.",
      },
      { status: 502 }
    );
  }
}
