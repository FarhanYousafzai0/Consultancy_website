import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import {
  getStudentProfile,
  profileToAnswers,
} from "@/lib/db/student-profile";
import { matchPrograms } from "@/lib/matching/match";
import { isProfileComplete } from "@/lib/eligibility/evaluate";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await getStudentProfile(session.userId);
  const answers = profileToAnswers(profile);
  if (!isProfileComplete(answers)) {
    return NextResponse.json({
      totalQualified: 0,
      matches: [],
      profileComplete: false,
    });
  }
  await ensureSeeded();
  const programs = await listPrograms({ status: "published" });
  const result = matchPrograms(answers, programs);
  return NextResponse.json({
    profileComplete: true,
    totalQualified: result.totalQualified,
    matches: result.matches.map((m) => ({
      id: m.program.id,
      name: m.program.name,
      university: m.program.university,
      universityType: m.program.universityType,
      city: m.program.city,
      field: m.program.field,
      degreeLevel: m.program.degreeLevel,
      ieltsMin: m.program.ieltsMin,
      tuitionPerSemesterEur: m.program.tuitionPerSemesterEur,
      semesterFeeEur: m.program.semesterFeeEur,
      typicalGermanGradeMax: m.program.typicalGermanGradeMax,
      sourceUrl: m.program.sourceUrl,
      lastVerifiedAt: m.program.lastVerifiedAt,
      intakes: m.program.intakes,
      requiredDocuments: m.program.requiredDocuments,
      tier: m.tier,
      reasons: m.reasons,
    })),
  });
}
