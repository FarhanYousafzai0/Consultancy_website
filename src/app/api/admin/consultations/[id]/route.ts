import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateConsultation } from "@/lib/db/consultations";
import {
  CONSULTATION_STATUSES,
  type ConsultationStatus,
} from "@/lib/db/consultation-model";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await request.json()) as { status?: string; adminNotes?: string };

  const patch: { status?: ConsultationStatus; adminNotes?: string } = {};
  if (body.status !== undefined) {
    if (!CONSULTATION_STATUSES.includes(body.status as ConsultationStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status as ConsultationStatus;
  }
  if (typeof body.adminNotes === "string") {
    patch.adminNotes = body.adminNotes.slice(0, 5000);
  }

  const record = await updateConsultation(id, patch);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ consultation: record });
}
