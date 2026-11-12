import { evaluateGrade } from "./grade";
import {
  labelForEnglish,
  labelForField,
  labelForGerman,
  labelForGoal,
  labelForGradeSystem,
  labelForQualification,
} from "./labels";
import type {
  EligibilityAnswers,
  EligibilityResult,
  GermanLevel,
} from "./types";

/**
 * Pakistan HZB path guidance for the usual cases.
 * Sources to confirm later with official pages: anabin (KMK), DAAD Pakistan,
 * German Missions in Pakistan. There is no APS for Pakistan — do not add APS
 * steps unless the German embassy introduces one. Universities always decide;
 * this is the common route only.
 */

const DISCLAIMER =
  "Universities decide. This is the usual path for Pakistani students — not an offer of admission.";

function germanReady(level: GermanLevel): boolean {
  return level === "b1" || level === "b2" || level === "c1";
}

function englishNote(
  answers: EligibilityAnswers
): string | null {
  if (!answers.englishTest) return null;
  if (answers.englishTest === "none") {
    if (answers.goal === "masters") {
      return "You have not taken an English test yet. Many English-taught Master's programs ask for about IELTS 6.5 or equivalent.";
    }
    return "You have not taken an English test yet. Ausbildung employers care more about German, but some ask for basic English.";
  }
  const scoreLabel = labelForEnglish(answers.englishTest, answers.englishScore);
  if (answers.goal === "masters") {
    return `Your English score: ${scoreLabel}. Many English-taught Master's programs ask for about IELTS 6.5 or equivalent.`;
  }
  return `Your English score: ${scoreLabel}.`;
}

function gradePart(answers: EligibilityAnswers) {
  if (
    answers.gradeSystem == null ||
    answers.gradeValue == null ||
    (answers.gradeSystem === "percentage" && answers.percentagePassMark == null)
  ) {
    return null;
  }
  return evaluateGrade(
    answers.gradeSystem,
    answers.gradeValue,
    answers.percentagePassMark ?? 40
  );
}

export function isProfileComplete(answers: EligibilityAnswers): boolean {
  if (!answers.goal || !answers.qualification || !answers.field) return false;
  if (
    answers.gradeSystem == null ||
    answers.gradeValue == null ||
    answers.englishTest == null ||
    answers.germanLevel == null
  ) {
    return false;
  }
  if (answers.gradeSystem === "percentage" && answers.percentagePassMark == null) {
    return false;
  }
  if (answers.englishTest !== "none" && answers.englishScore == null) {
    return false;
  }
  return answers.completedAt != null;
}

export function evaluateEligibility(
  answers: EligibilityAnswers
): EligibilityResult | null {
  if (!answers.goal || !answers.qualification || !answers.germanLevel) {
    return null;
  }

  const grade = gradePart(answers);
  const eng = englishNote(answers);
  const base = {
    grade,
    englishNote: eng,
    disclaimer: DISCLAIMER,
  };

  if (answers.qualification === "other") {
    return {
      ...base,
      kind: "cannot_judge",
      headline: "We need more detail about your qualification",
      reasons: [
        "Your certificate is outside the usual Pakistan cases we cover in this check.",
        "A consultant can look at your documents and tell you the realistic route.",
      ],
      nextSteps: [
        "Message a consultant with your certificate name, years of study, and subjects.",
        "Keep scanned copies of your mark sheets ready.",
      ],
      showConsultant: answers.goal !== "ausbildung",
    };
  }

  if (answers.goal === "masters") {
    if (
      answers.qualification === "bs_4year" ||
      answers.qualification === "ba_bsc_2year_plus_masters"
    ) {
      return {
        ...base,
        kind: "masters_eligible",
        headline: "You can apply for a Master's in a related field",
        reasons: [
          "A 4-year BS/BSc (or a 2-year degree plus a 2-year Master's) usually meets the education length German universities expect for Master's entry.",
          "Your subject should match or closely relate to the Master's you want.",
          "Pakistani applicants do not need an APS certificate — the university or uni-assist checks your degree directly.",
        ],
        nextSteps: [
          "Get your degree and transcripts attested by HEC, and keep certified copies ready.",
          "Shortlist English-taught Master's programs in your field and check each university's exact requirements.",
          "Book an English test if you still need one (many ask for about IELTS 6.5).",
        ],
        showConsultant: true,
      };
    }

    if (answers.qualification === "ba_bsc_2year") {
      return {
        ...base,
        kind: "masters_not_enough",
        headline: "A 2-year degree alone is usually not enough for a German Master's",
        reasons: [
          "German Master's programs typically expect 16 years of education (a 4-year Bachelor's or equivalent).",
          "A 2-year BA/BSc alone usually does not meet that length.",
        ],
        nextSteps: [
          "Complete a 2-year Master's in Pakistan first, then reassess for Germany.",
          "Message a consultant if your case is unusual (e.g. additional diplomas).",
        ],
        showConsultant: true,
      };
    }
  }

  if (answers.goal === "ausbildung") {
    if (germanReady(answers.germanLevel)) {
      return {
        ...base,
        kind: "ausbildung_ready",
        headline: "Your German level is ready to start looking for Ausbildung places",
        reasons: [
          "B1 or higher is the usual minimum employers and visa paths expect for Ausbildung.",
          "Matric or FSc / HSSC can both start this path; the employer still checks your certificate.",
          "This is a self-serve path on Parwaaz — we do not hand off Ausbildung to a consultant yet.",
        ],
        nextSteps: [
          "Search live Ausbildung listings by field and city on /ausbildung.",
          "Prepare a German-style CV and short cover letter.",
          "Read guides on certificate recognition and the Ausbildung visa.",
        ],
        showConsultant: false,
      };
    }

    return {
      ...base,
      kind: "ausbildung_need_german",
      headline: "You need German B1 (or higher) before most Ausbildung places",
      reasons: [
        `Your current level: ${labelForGerman(answers.germanLevel)}.`,
        "Most Ausbildung employers and the visa path expect at least B1.",
        "Matric or FSc / HSSC can both start this path once your German is ready.",
      ],
      nextSteps: [
        "Plan a German course path to B1 (often several months of focused study).",
        "Keep learning while you research occupations that fit your interests.",
        "Read our guides on certificate recognition once your level is closer.",
      ],
      showConsultant: false,
    };
  }

  return {
    ...base,
    kind: "cannot_judge",
    headline: "We could not finish this check",
    reasons: ["Something in your answers did not match a known path."],
    nextSteps: ["Start the check again or message a consultant with your details."],
    showConsultant: true,
  };
}

export function whatsappSummary(answers: EligibilityAnswers): string {
  const goal = answers.goal ? labelForGoal(answers.goal) : "—";
  const qual =
    answers.goal && answers.qualification
      ? labelForQualification(answers.goal, answers.qualification)
      : "—";
  const field =
    answers.goal && answers.field
      ? labelForField(answers.goal, answers.field)
      : "—";
  let grade = "—";
  if (answers.gradeSystem != null && answers.gradeValue != null) {
    const system = labelForGradeSystem(answers.gradeSystem);
    grade =
      answers.gradeSystem === "percentage"
        ? `${answers.gradeValue}% (${system}${
            answers.percentagePassMark != null
              ? `, ${answers.percentagePassMark}% pass`
              : ""
          })`
        : `${answers.gradeValue} (${system})`;
  }
  const english =
    answers.englishTest != null
      ? labelForEnglish(answers.englishTest, answers.englishScore)
      : "—";

  return [
    "Hi! I'd like help applying to Germany.",
    `• Target: ${goal}${field !== "—" ? ` in ${field}` : ""}`,
    `• Degree: ${qual}, ${grade}`,
    `• English: ${english}`,
  ].join("\n");
}
