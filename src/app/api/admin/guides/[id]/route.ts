import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { guideInputSchema } from "@/lib/db/guide-schema";
import { deleteGuide, getGuide, updateGuide } from "@/lib/db/guides";
import { invalidateCatalog } from "@/lib/advisor/catalog";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const guide = await getGuide(id);
  if (!guide) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ guide });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await request.json();
  const parsed = guideInputSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid guide" },
      { status: 400 }
    );
  }
  const guide = await updateGuide(id, parsed.data);
  if (!guide) return NextResponse.json({ error: "Not found" }, { status: 404 });
  invalidateCatalog();
  return NextResponse.json({ guide });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await deleteGuide(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  invalidateCatalog();
  return NextResponse.json({ ok: true });
}
