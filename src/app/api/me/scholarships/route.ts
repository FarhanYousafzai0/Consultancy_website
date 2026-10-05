import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  addSavedScholarship,
  listSavedScholarships,
  removeSavedScholarship,
} from "@/lib/db/saved-scholarships";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await listSavedScholarships(session.userId);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { scholarshipId?: string };
  if (!body.scholarshipId) {
    return NextResponse.json(
      { error: "scholarshipId required" },
      { status: 400 }
    );
  }
  try {
    const item = await addSavedScholarship(session.userId, body.scholarshipId);
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const scholarshipId = searchParams.get("scholarshipId");
  if (!scholarshipId) {
    return NextResponse.json(
      { error: "scholarshipId required" },
      { status: 400 }
    );
  }
  const removed = await removeSavedScholarship(session.userId, scholarshipId);
  return NextResponse.json({ removed });
}
