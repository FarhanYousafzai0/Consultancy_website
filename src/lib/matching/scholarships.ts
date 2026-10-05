import { evaluateGrade } from "@/lib/eligibility/grade";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import type {
  ScholarshipOdds,
  ScholarshipRecord,
} from "@/lib/db/types";

export type MatchedScholarship = {
  scholarship: ScholarshipRecord;
  odds: ScholarshipOdds;
  score: number;
  reasons: string[];
};

function goalToLevels(
  goal: EligibilityAnswers["goal"]
): ScholarshipRecord["levels"] | null {
  if (goal === "masters") return ["master"];
  if (goal === "bachelors") return ["bachelor"];
  return null;
}

function fieldMatches(
  answers: EligibilityAnswers,
  scholarship: ScholarshipRecord
): boolean {
  if (!answers.field) return true;
  // Map ausbildung fields loosely to other
  const studyFields = new Set(scholarship.fields);
  if (studyFields.has(answers.field as never)) return true;
  // Ausbildung field → other / health / engineering heuristics
  if (
    answers.goal === "ausbildung" &&
    (studyFields.has("other") || studyFields.has("health") || studyFields.has("engineering"))
  ) {
    return true;
  }
  return false;
}

function nationalityOk(scholarship: ScholarshipRecord): boolean {
  return (
    scholarship.nationalities.includes("any") ||
    scholarship.nationalities.includes("pakistan")
  );
}

export function matchScholarships(
  answers: EligibilityAnswers,
  scholarships: ScholarshipRecord[]
): { matches: MatchedScholarship[]; bachelorFundingWarning: boolean } {
  const levels = goalToLevels(answers.goal);
  let bachelorFundingWarning = answers.goal === "bachelors";

  if (!levels) {
    return { matches: [], bachelorFundingWarning: false };
  }

  const grade =
    answers.gradeSystem != null && answers.gradeValue != null
      ? evaluateGrade(
          answers.gradeSystem,
          answers.gradeValue,
          answers.percentagePassMark ?? 40
        )
      : null;
  const germanGrade = grade?.germanGrade ?? null;

  const matches: MatchedScholarship[] = [];

  for (const scholarship of scholarships) {
    if (scholarship.status !== "published") continue;
    if (!scholarship.levels.some((l) => levels.includes(l))) continue;
    if (!nationalityOk(scholarship)) continue;
    if (!fieldMatches(answers, scholarship)) continue;

    const reasons: string[] = [];
    let score = 50;
    let hardFail = false;

    if (scholarship.nationalities.includes("pakistan")) {
      reasons.push("Open to Pakistani nationals.");
      score += 10;
    } else {
      reasons.push("Open to international applicants (including Pakistan).");
    }

    if (scholarship.bachelorFundingRareNote && answers.goal === "bachelors") {
      reasons.push(
        "Bachelor funding for non-EU students is rare — treat this as a long shot."
      );
      bachelorFundingWarning = true;
      score -= 15;
    }

    if (scholarship.mustBeEnrolled) {
      reasons.push("Usually requires enrollment at a German university first.");
      score -= 5;
    }

    if (scholarship.workExperienceYears > 0) {
      reasons.push(
        `Typically expects ~${scholarship.workExperienceYears}+ years relevant experience.`
      );
      score -= 10;
    }

    if (
      scholarship.minGermanGrade != null &&
      germanGrade != null
    ) {
      const gap = germanGrade - scholarship.minGermanGrade;
      if (gap > 0.5) {
        reasons.push(
          `Your grade (~${germanGrade.toFixed(1)}) is weaker than the typical band (≤ ${scholarship.minGermanGrade}).`
        );
        score -= 25;
        hardFail = gap > 1.2;
      } else if (gap > 0) {
        reasons.push(
          `Grade is close to the typical band (≤ ${scholarship.minGermanGrade}).`
        );
        score -= 8;
      } else {
        reasons.push(
          `Grade fits the typical academic band (≤ ${scholarship.minGermanGrade}).`
        );
        score += 12;
      }
    }

    if (scholarship.ageLimit != null) {
      reasons.push(`Age limit often around ${scholarship.ageLimit}.`);
    }

    reasons.push(`Amount: ${scholarship.amountSummary}`);

    let odds: ScholarshipOdds;
    if (hardFail || score < 25) odds = "unlikely";
    else if (score < 40) odds = "long_shot";
    else if (score < 60) odds = "possible";
    else odds = "strong";

    if (scholarship.bachelorFundingRareNote && answers.goal === "bachelors") {
      if (odds === "strong") odds = "possible";
      if (odds === "possible") odds = "long_shot";
    }

    matches.push({ scholarship, odds, score, reasons });
  }

  matches.sort((a, b) => b.score - a.score);
  return { matches, bachelorFundingWarning };
}
