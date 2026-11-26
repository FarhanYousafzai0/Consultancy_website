import { NextResponse } from "next/server";
import { listInternships } from "@/lib/db/internships";
import { filterPublicInternships } from "@/lib/internships/public";
import { csvListings } from "@/lib/internships/csv-listings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const result = filterPublicInternships([...(await listInternships({ publicationStatus: "published" })), ...csvListings], new URL(request.url).searchParams);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[public internships]", error);
    return NextResponse.json({ error: "Internships could not be loaded." }, { status: 500 });
  }
}
