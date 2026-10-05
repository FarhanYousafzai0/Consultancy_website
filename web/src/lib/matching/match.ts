import { evaluateGrade } from "@/lib/eligibility/grade";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import type { MatchTier, ProgramRecord } from "@/lib/db/types";

export type MatchedProgram = {
  program: ProgramRecord;
  tier: MatchTier;
  score: number;
  reasons: string[];
};

function goalToDegree(goal: EligibilityAnswers["goal"]) {
  if (goal === "masters") return "master" as const;
  if (goal === "bachelors") return "bachelor" as const;
  return null;
}

function englishOk(
  answers: EligibilityAnswers,
  program: ProgramRecord
): { ok: boolean; reason?: string } {
  if (program.languageOfInstruction === "german") {
    return { ok: true };
  }
  if (answers.englishTest === "none" || answers.englishScore == null) {
    return {
      ok: true,
      reason: "English test not taken yet — confirm the program's requirement before applying.",
    };
  }
  if (answers.englishTest === "ielts" && program.ieltsMin != null) {
    if (answers.englishScore + 0.01 < program.ieltsMin) {
      return {
        ok: false,
        reason: `IELTS ${answers.englishScore} is below the published minimum ${program.ieltsMin}.`,
      };
    }
    return { ok: true, reason: `IELTS meets the published minimum (${program.ieltsMin}).` };
  }
  if (answers.englishTest === "toefl" && program.toeflMin != null) {
    if (answers.englishScore + 0.01 < program.toeflMin) {
      return {
        ok: false,
        reason: `TOEFL ${answers.englishScore} is below the published minimum ${program.toeflMin}.`,
      };
    }
    return { ok: true, reason: `TOEFL meets the published minimum (${program.toeflMin}).` };
  }
  return {
    ok: true,
    reason: "English score on file — confirm this test is accepted by the university.",
  };
}

function germanRank(level: string | null | undefined) {
  const order = ["none", "a1", "a2", "b1", "b2", "c1"];
  const idx = order.indexOf(level ?? "none");
  return idx < 0 ? 0 : idx;
}

function tierForGradeGap(gap: number | null): MatchTier {
  if (gap == null) return "match";
  if (gap <= -0.3) return "safety";
  if (gap <= 0.3) return "match";
  return "reach";
}

export function qualifyPrograms(
  answers: EligibilityAnswers,
  programs: ProgramRecord[]
): MatchedProgram[] {
  const degree = goalToDegree(answers.goal);
  if (!degree) return [];

  if (
    answers.goal === "masters" &&
    answers.qualification === "ba_bsc_2year"
  ) {
    return [];
  }

  const grade =
    answers.gradeSystem && answers.gradeValue != null
      ? evaluateGrade(
          answers.gradeSystem,
          answers.gradeValue,
          answers.percentagePassMark ?? 40
        )
      : null;

  const qualified: MatchedProgram[] = [];

  for (const program of programs) {
    if (program.status !== "published") continue;
    if (program.degreeLevel !== degree) continue;

    const reasons: string[] = [];
    let score = 50;

    if (answers.field && program.field === answers.field) {
      score += 25;
      reasons.push("Field matches what you want to study.");
    } else if (answers.field && program.field !== "other") {
      score -= 15;
      reasons.push("Field is adjacent or different — check prerequisites.");
    }

    if (program.universityType === "public") {
      score += 8;
      reasons.push("Public university (usually lower tuition).");
    } else {
      reasons.push(
        `Private university — estimate €${program.tuitionPerSemesterEur}/semester tuition.`
      );
    }

    const eng = englishOk(answers, program);
    if (!eng.ok) continue;
    if (eng.reason) reasons.push(eng.reason);

    if (germanRank(answers.germanLevel) < germanRank(program.germanRequired)) {
      continue;
    }
    if (program.germanRequired !== "none") {
      reasons.push(`German required: ${program.germanRequired.toUpperCase()}.`);
    }

    let gap: number | null = null;
    if (grade && program.typicalGermanGradeMax != null) {
      gap = grade.germanGrade - program.typicalGermanGradeMax;
      if (gap <= 0) {
        score += 20;
        reasons.push(
          `Your German grade ${grade.germanGrade.toFixed(2)} is within the usual intake band (≤ ${program.typicalGermanGradeMax}).`
        );
      } else {
        score += 5;
        reasons.push(
          `Your German grade ${grade.germanGrade.toFixed(2)} is above the usual band (≤ ${program.typicalGermanGradeMax}) — still possible, but competitive.`
        );
      }
    }

    const tier = tierForGradeGap(gap);
    if (tier === "safety") score += 10;
    if (tier === "reach") score -= 5;

    qualified.push({ program, tier, score, reasons });
  }

  qualified.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.program.universityType !== b.program.universityType) {
      return a.program.universityType === "public" ? -1 : 1;
    }
    return a.program.name.localeCompare(b.program.name);
  });

  return qualified;
}

export function matchPrograms(
  answers: EligibilityAnswers,
  programs: ProgramRecord[]
): { matches: MatchedProgram[]; totalQualified: number } {
  const qualified = qualifyPrograms(answers, programs);
  return {
    matches: qualified.slice(0, 3),
    totalQualified: qualified.length,
  };
}
