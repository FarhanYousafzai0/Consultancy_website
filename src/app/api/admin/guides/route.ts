import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { guideInputSchema } from "@/lib/db/guide-schema";
import {
  createGuide,
  ensureGuidesSeeded,
  listGuides,
} from "@/lib/db/guides";
import { invalidateCatalog } from "@/lib/advisor/catalog";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureGuidesSeeded();
  const guides = await listGuides({ status: "all" });
  return NextResponse.json({ guides });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json();
  const parsed = guideInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid guide" },
      { status: 400 }
    );
  }
  const guide = await createGuide(parsed.data);
  invalidateCatalog();
  return NextResponse.json({ guide }, { status: 201 });
}
