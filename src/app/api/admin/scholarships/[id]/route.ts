import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { scholarshipInputSchema } from "@/lib/db/scholarship-schema";
import {
  deleteScholarship,
  getScholarship,
  updateScholarship,
} from "@/lib/db/scholarships";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const scholarship = await getScholarship(id);
  if (!scholarship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ scholarship });
}

export async function PUT(request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await request.json();
  const parsed = scholarshipInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid scholarship" },
      { status: 400 }
    );
  }
  const scholarship = await updateScholarship(id, parsed.data);
  if (!scholarship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ scholarship });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await deleteScholarship(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
