import { NextResponse } from "next/server";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import { getSession } from "@/lib/auth/session";
import {
  getStudentProfile,
  upsertStudentProfile,
} from "@/lib/db/student-profile";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await getStudentProfile(session.userId);
  return NextResponse.json({ profile, session });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<EligibilityAnswers>;
  const profile = await upsertStudentProfile(session.userId, body);
  return NextResponse.json({ profile });
}
