import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  addToShortlist,
  listShortlist,
  removeFromShortlist,
} from "@/lib/db/shortlist";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await listShortlist(session.userId);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { programId?: string };
  if (!body.programId) {
    return NextResponse.json({ error: "programId required" }, { status: 400 });
  }
  try {
    const item = await addToShortlist(session.userId, body.programId);
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
  const programId = searchParams.get("programId");
  if (!programId) {
    return NextResponse.json({ error: "programId required" }, { status: 400 });
  }
  const removed = await removeFromShortlist(session.userId, programId);
  return NextResponse.json({ removed });
}
