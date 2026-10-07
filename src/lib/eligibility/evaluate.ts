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
  BachelorsQualification,
  EligibilityAnswers,
  EligibilityResult,
  GermanLevel,
  StudienkollegKurs,
} from "./types";

/**
 * Pakistan HZB / APS path guidance for the usual cases.
 * Sources to confirm later with official pages: anabin (KMK), DAAD Pakistan,
 * APS Pakistan. Universities always decide; this is the common route only.
 */

const DISCLAIMER =
  "Universities decide. This is the usual path for Pakistani students — not an offer of admission.";

function studienkollegKurs(
  qualification: BachelorsQualification
): StudienkollegKurs | undefined {
  switch (qualification) {
    case "fsc_pre_engineering":
    case "fsc_ics":
      return "T-Kurs";
    case "fsc_pre_medical":
      return "M-Kurs";
    case "fsc_icom":
    case "fsc_fa":
      return "W-Kurs";
    default:
      return undefined;
  }
}

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
    if (answers.goal === "bachelors") {
      return "You have not taken an English test yet. English-taught Bachelor's programs usually ask for IELTS or an equivalent score.";
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
          "You need an APS certificate from APS Pakistan before you apply.",
          "Your subject should match or closely relate to the Master's you want.",
        ],
        nextSteps: [
          "Start your APS Pakistan application early — it often takes months.",
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
          "Or explore Bachelor's / Studienkolleg routes if you want to start earlier.",
          "Message a consultant if your case is unusual (e.g. additional diplomas).",
        ],
        showConsultant: true,
      };
    }
  }

  if (answers.goal === "bachelors") {
    const fsc = [
      "fsc_pre_engineering",
      "fsc_pre_medical",
      "fsc_ics",
      "fsc_icom",
      "fsc_fa",
    ] as const;

    if ((fsc as readonly string[]).includes(answers.qualification)) {
      const kurs = studienkollegKurs(
        answers.qualification as BachelorsQualification
      );
      return {
        ...base,
        kind: "bachelors_studienkolleg",
        headline: "FSc / HSSC is not direct entry to a public Bachelor's",
        reasons: [
          "Pakistani FSc / HSSC usually does not give direct Hochschulzugangsberechtigung for a public Bachelor's in Germany.",
          kurs
            ? `For your stream, the usual Studienkolleg course is ${kurs}.`
            : "You would usually need a Studienkolleg course matched to your subjects.",
          "You will still need APS for the university application path that applies to you.",
        ],
        nextSteps: [
          `Look at Studienkolleg programs${kurs ? ` (${kurs})` : ""} and the entrance exam (Aufnahmeprüfung).`,
          "Or complete 1 year of a relevant Bachelor's in Pakistan, then reassess for direct entry.",
          "Or compare private universities / foundation years and their total cost.",
        ],
        studienkollegKurs: kurs,
        showConsultant: true,
      };
    }

    if (
      answers.qualification === "a_levels" ||
      answers.qualification === "university_1year"
    ) {
      return {
        ...base,
        kind: "bachelors_likely_direct",
        headline:
          answers.qualification === "a_levels"
            ? "A-levels usually open a direct or subject-restricted route"
            : "One year of university can open a direct route — confirm your subjects",
        reasons: [
          answers.qualification === "a_levels"
            ? "A-levels are often recognised for Bachelor's entry when subjects and grades match the program."
            : "Completing at least one year of a recognised university program in Pakistan can open direct Bachelor's entry for related subjects.",
          "The exact subjects, grades, and university still have to match what each German university accepts.",
          "APS still applies for Pakistani applicants on this path.",
        ],
        nextSteps: [
          "Confirm your subjects and grades against anabin / the university's country rules.",
          "Start APS Pakistan if you have not already.",
          "Shortlist English-taught Bachelor's programs and check language requirements.",
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
