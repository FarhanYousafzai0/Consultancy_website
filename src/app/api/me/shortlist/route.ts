import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  addToShortlist,
  listShortlist,
  removeFromShortlist,
  shortlistProgressSchema,
  updateShortlistProgress,
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

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json();
  const parsed = shortlistProgressSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid progress update" },
      { status: 400 }
    );
  }
  const item = await updateShortlistProgress(session.userId, parsed.data);
  if (!item) {
    return NextResponse.json(
      { error: "Program not on your shortlist" },
      { status: 404 }
    );
  }
  return NextResponse.json({ item });
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
