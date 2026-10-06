import { NextResponse } from "next/server";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import {
  ensureScholarshipsSeeded,
  listScholarships,
} from "@/lib/db/scholarships";
import {
  isInternationalProgramme,
  relatedScholarships,
} from "@/lib/daad/catalog";
import { qualifyPrograms } from "@/lib/matching/match";

export async function POST(request: Request) {
  const answers = (await request.json()) as EligibilityAnswers;
  await ensureSeeded();
  await ensureScholarshipsSeeded();
  const [programs, scholarships] = await Promise.all([
    listPrograms({ status: "published" }),
    listScholarships({ status: "published" }),
  ]);
  const qualified = qualifyPrograms(answers, programs);
  const shown = qualified.slice(0, 3);

  const level =
    answers.goal === "masters"
      ? "master"
      : answers.goal === "bachelors"
        ? "bachelor"
        : null;
  const fieldScholarships =
    level && answers.field
      ? relatedScholarships(level, answers.field, scholarships)
      : [];

  const matches = shown.map((m) => {
    const related = relatedScholarships(
      m.program.degreeLevel,
      m.program.field,
      scholarships
    );
    return {
      id: m.program.id,
      name: m.program.name,
      university: m.program.university,
      universityType: m.program.universityType,
      city: m.program.city,
      field: m.program.field,
      degreeLevel: m.program.degreeLevel,
      languageOfInstruction: m.program.languageOfInstruction,
      internationalProgramme: isInternationalProgramme(
        m.program.languageOfInstruction
      ),
      ieltsMin: m.program.ieltsMin,
      tuitionPerSemesterEur: m.program.tuitionPerSemesterEur,
      semesterFeeEur: m.program.semesterFeeEur,
      typicalGermanGradeMax: m.program.typicalGermanGradeMax,
      sourceUrl: m.program.sourceUrl,
      lastVerifiedAt: m.program.lastVerifiedAt,
      tier: m.tier,
      reasons: m.reasons,
      scholarships: related,
    };
  });

  return NextResponse.json({
    totalQualified: qualified.length,
    publicCount: qualified.filter((m) => m.program.universityType === "public")
      .length,
    privateCount: qualified.filter((m) => m.program.universityType === "private")
      .length,
    internationalCount: qualified.filter((m) =>
      isInternationalProgramme(m.program.languageOfInstruction)
    ).length,
    scholarships: fieldScholarships,
    matches,
  });
}
