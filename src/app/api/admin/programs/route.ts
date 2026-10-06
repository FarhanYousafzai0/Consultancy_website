import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { programInputSchema } from "@/lib/db/program-schema";
import {
  createProgram,
  ensureSeeded,
  listPrograms,
  storageMode,
} from "@/lib/db/programs";
import { invalidateCatalog } from "@/lib/advisor/catalog";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureSeeded();
  const programs = await listPrograms({ status: "all" });
  const mode = await storageMode();
  return NextResponse.json({ programs, storage: mode });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json();
  const parsed = programInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid program" },
      { status: 400 }
    );
  }
  const program = await createProgram(parsed.data);
  invalidateCatalog();
  return NextResponse.json({ program }, { status: 201 });
}
