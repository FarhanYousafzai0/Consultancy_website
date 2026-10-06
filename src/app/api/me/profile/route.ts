import { NextResponse } from "next/server";
import { z } from "zod";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import { getSession } from "@/lib/auth/session";
import {
  getStudentProfile,
  setAfterAdmissionCompleted,
  upsertStudentProfile,
} from "@/lib/db/student-profile";
import { AFTER_ADMISSION_STEP_IDS } from "@/lib/after-admission/steps";

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

const afterAdmissionPatchSchema = z.object({
  afterAdmissionCompleted: z.array(
    z.enum(AFTER_ADMISSION_STEP_IDS as [string, ...string[]])
  ),
});

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json();
  const parsed = afterAdmissionPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid after-admission progress.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const profile = await setAfterAdmissionCompleted(
    session.userId,
    parsed.data.afterAdmissionCompleted
  );
  return NextResponse.json({ profile });
}
