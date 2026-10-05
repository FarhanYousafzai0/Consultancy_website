import { NextResponse } from "next/server";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import { matchPrograms } from "@/lib/matching/match";

export async function POST(request: Request) {
  const answers = (await request.json()) as EligibilityAnswers;
  await ensureSeeded();
  const programs = await listPrograms({ status: "published" });
  const result = matchPrograms(answers, programs);
  return NextResponse.json({
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
      tier: m.tier,
      reasons: m.reasons,
    })),
  });
}
