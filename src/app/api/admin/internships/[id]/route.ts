import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { internshipUpdateSchema } from "@/lib/db/internship-schema";
import { getInternship, updateInternship } from "@/lib/db/internships";
import { adminEditableFields, getInternshipAdminPatch, getInternshipEditPatch, isAdminSession, sourceForRecord, type InternshipAdminAction } from "@/lib/internships/admin";
import { researchInternshipSource } from "@/lib/internships/research";

type Ctx = { params: Promise<{ id: string }> };

async function authorized() {
  const session = await getSession();
  return isAdminSession(session) ? session : null;
}

export async function GET(_request: Request, ctx: Ctx) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const record = await getInternship((await ctx.params).id);
  return record ? NextResponse.json({ internship: record }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await ctx.params).id;
  const record = await getInternship(id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => !(adminEditableFields as readonly string[]).includes(key))) {
    return NextResponse.json({ error: "Only review form fields can be edited." }, { status: 400 });
  }
  const parsed = internshipUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid internship" }, { status: 400 });
  const updated = await updateInternship(id, getInternshipEditPatch(record, parsed.data));
  return NextResponse.json({ internship: updated });
}

export async function POST(request: Request, ctx: Ctx) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await ctx.params).id;
  const record = await getInternship(id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as { action?: InternshipAdminAction; note?: string; confirmed?: boolean };
  const action = body.action;
  if (!action || !["verify", "approve", "reject", "archive", "expire", "force-recheck"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const source = sourceForRecord(record.sourceUrl);
  const decision = getInternshipAdminPatch(
    record,
    action,
    [],
    { note: typeof body.note === "string" ? body.note : undefined, confirmed: body.confirmed === true, reviewer: String(session.email) }
  );
  if (decision.error) return NextResponse.json({ error: decision.error }, { status: 400 });
  if (action === "force-recheck") {
    const recheckSource = source;
    if (!recheckSource) return NextResponse.json({ error: "No curated source matches this internship." }, { status: 400 });
    await updateInternship(id, decision.patch ?? {});
    const result = await researchInternshipSource({ source: recheckSource, force: true });
    return NextResponse.json({ internship: await getInternship(id), research: result });
  }
  const updated = await updateInternship(id, decision.patch ?? {});
  return NextResponse.json({ internship: updated });
}
