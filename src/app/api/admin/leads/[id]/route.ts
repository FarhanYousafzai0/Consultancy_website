import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateLeadStatus, getLead } from "@/lib/db/leads";
import {
  setSopReviewUnlocked,
  addAiCredits,
} from "@/lib/db/student-profile";
import type { LeadStatus } from "@/lib/db/types";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES: LeadStatus[] = ["new", "contacted", "paid", "closed"];

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await request.json()) as {
    status?: string;
    creditAmount?: number;
  };
  if (!body.status || !STATUSES.includes(body.status as LeadStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const status = body.status as LeadStatus;
  const lead = await updateLeadStatus(id, status);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (status === "paid" && lead.kind === "sop_review" && lead.userId) {
    await setSopReviewUnlocked(lead.userId, true);
  }

  if (status === "paid" && lead.kind === "ai_credits" && lead.userId) {
    const credits =
      (typeof body.creditAmount === "number" && body.creditAmount > 0
        ? body.creditAmount
        : null) ??
      (lead.creditAmount > 0 ? lead.creditAmount : null) ??
      Number(process.env.AI_CREDIT_PACK_SIZE ?? 5);
    if (credits > 0) {
      await addAiCredits(lead.userId, credits);
    }
  }

  return NextResponse.json({ lead: await getLead(id) });
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead });
}
