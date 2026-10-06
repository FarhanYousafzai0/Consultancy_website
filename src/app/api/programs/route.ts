import { NextResponse } from "next/server";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import { applyProgramFilters, type ProgramFilters } from "@/lib/programs/filters";
import { qualifyPrograms } from "@/lib/matching/match";
import type { EligibilityAnswers } from "@/lib/eligibility/types";

export async function GET(request: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(request.url);

  const filters: ProgramFilters = {
    q: searchParams.get("q") ?? "",
    degree: (searchParams.get("degree") as ProgramFilters["degree"]) || "",
    field: searchParams.get("field") ?? "",
    universityType:
      (searchParams.get("universityType") as ProgramFilters["universityType"]) ||
      "",
    language: (searchParams.get("language") as ProgramFilters["language"]) || "",
    ieltsMax: searchParams.get("ieltsMax")
      ? Number(searchParams.get("ieltsMax"))
      : null,
    germanRequired: searchParams.get("germanRequired") ?? "",
    tuition: (searchParams.get("tuition") as ProgramFilters["tuition"]) || "",
    openDeadline: searchParams.get("openDeadline") === "1",
    international: searchParams.get("international") === "1",
  };

  let programs = await listPrograms({ status: "published" });
  programs = applyProgramFilters(programs, filters);

  const qualify = searchParams.get("qualify") === "1";
  const profileRaw = searchParams.get("profile");
  let tiers: Record<string, string> = {};

  if (qualify && profileRaw) {
    try {
      const answers = JSON.parse(profileRaw) as EligibilityAnswers;
      const qualified = qualifyPrograms(answers, programs);
      tiers = Object.fromEntries(
        qualified.map((m) => [m.program.id, m.tier])
      );
      programs = qualified.map((m) => m.program);
    } catch {
      // ignore bad profile
    }
  }

  return NextResponse.json({
    total: programs.length,
    programs: programs.map((p) => ({
      id: p.id,
      name: p.name,
      university: p.university,
      universityType: p.universityType,
      degreeLevel: p.degreeLevel,
      field: p.field,
      city: p.city,
      state: p.state,
      languageOfInstruction: p.languageOfInstruction,
      internationalProgramme:
        p.languageOfInstruction === "english" ||
        p.languageOfInstruction === "both",
      ieltsMin: p.ieltsMin,
      germanRequired: p.germanRequired,
      tuitionPerSemesterEur: p.tuitionPerSemesterEur,
      semesterFeeEur: p.semesterFeeEur,
      lastVerifiedAt: p.lastVerifiedAt,
      sourceUrl: p.sourceUrl,
      tier: tiers[p.id] ?? null,
    })),
  });
}
