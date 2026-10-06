import { NextResponse } from "next/server";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import {
  ensureScholarshipsSeeded,
  listScholarships,
} from "@/lib/db/scholarships";
import { matchScholarships } from "@/lib/matching/scholarships";
import { scholarshipPurposeOf } from "@/lib/daad/catalog";
import type { ProgramField, ScholarshipLevel } from "@/lib/db/types";

export async function GET(request: Request) {
  await ensureScholarshipsSeeded();
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") as ScholarshipLevel | null;
  const field = searchParams.get("field") as ProgramField | null;
  const provider = searchParams.get("provider")?.trim().toLowerCase() || null;
  const purpose = searchParams.get("purpose")?.trim().toLowerCase() || null;
  const q = searchParams.get("q")?.trim().toLowerCase() || null;
  const qualify = searchParams.get("qualify") === "1";

  let scholarships = await listScholarships({ status: "published" });

  if (level) {
    scholarships = scholarships.filter((s) => s.levels.includes(level));
  }
  if (field) {
    scholarships = scholarships.filter((s) => s.fields.includes(field));
  }
  if (provider) {
    scholarships = scholarships.filter((s) =>
      s.provider.toLowerCase().includes(provider)
    );
  }
  if (purpose === "study" || purpose === "research" || purpose === "language") {
    scholarships = scholarships.filter(
      (s) => scholarshipPurposeOf(s) === purpose
    );
  }
  if (q) {
    scholarships = scholarships.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.amountSummary.toLowerCase().includes(q)
    );
  }

  if (qualify) {
    const answersRaw = searchParams.get("answers");
    if (!answersRaw) {
      return NextResponse.json(
        { error: "answers required when qualify=1" },
        { status: 400 }
      );
    }
    let answers: EligibilityAnswers;
    try {
      answers = JSON.parse(answersRaw) as EligibilityAnswers;
    } catch {
      return NextResponse.json({ error: "Invalid answers JSON" }, { status: 400 });
    }
    const { matches, bachelorFundingWarning } = matchScholarships(
      answers,
      scholarships
    );
    return NextResponse.json({
      total: matches.length,
      bachelorFundingWarning,
      scholarships: matches.map((m) => ({
        ...m.scholarship,
        odds: m.odds,
        reasons: m.reasons,
      })),
    });
  }

  return NextResponse.json({
    total: scholarships.length,
    bachelorFundingWarning: false,
    scholarships: scholarships.map((s) => ({
      ...s,
      odds: null,
      reasons: [],
    })),
  });
}
