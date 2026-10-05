export type Goal = "masters" | "bachelors" | "ausbildung";

export type MastersQualification =
  | "bs_4year"
  | "ba_bsc_2year"
  | "ba_bsc_2year_plus_masters"
  | "other";

export type BachelorsQualification =
  | "fsc_pre_engineering"
  | "fsc_pre_medical"
  | "fsc_ics"
  | "fsc_icom"
  | "fsc_fa"
  | "a_levels"
  | "university_1year"
  | "other";

export type AusbildungQualification = "matric" | "fsc_hssc" | "other";

export type Qualification =
  | MastersQualification
  | BachelorsQualification
  | AusbildungQualification;

export type GradeSystem = "percentage" | "cgpa4" | "cgpa5";

export type PercentagePassMark = 33 | 40 | 50;

export type StudyField =
  | "computer_science"
  | "engineering"
  | "data"
  | "business"
  | "natural_sciences"
  | "health"
  | "social_sciences"
  | "arts"
  | "other";

export type AusbildungField =
  | "it"
  | "nursing"
  | "mechatronics"
  | "hospitality"
  | "trades"
  | "other";

export type Field = StudyField | AusbildungField;

export type EnglishTest = "ielts" | "toefl" | "pte" | "duolingo" | "none";

export type GermanLevel = "none" | "a1" | "a2" | "b1" | "b2" | "c1";

export type GradeBand =
  | "strong"
  | "meets_many"
  | "limited_public"
  | "unlikely_public";

export type OutcomeKind =
  | "masters_eligible"
  | "masters_not_enough"
  | "bachelors_studienkolleg"
  | "bachelors_likely_direct"
  | "ausbildung_ready"
  | "ausbildung_need_german"
  | "cannot_judge";

export type StudienkollegKurs = "T-Kurs" | "M-Kurs" | "W-Kurs";

export type EligibilityAnswers = {
  goal: Goal | null;
  qualification: Qualification | null;
  gradeSystem: GradeSystem | null;
  gradeValue: number | null;
  percentagePassMark: PercentagePassMark | null;
  field: Field | null;
  englishTest: EnglishTest | null;
  englishScore: number | null;
  germanLevel: GermanLevel | null;
  completedAt: string | null;
};

export type GradeResult = {
  germanGrade: number;
  band: GradeBand;
  bandLabel: string;
  bandNote: string;
};

export type EligibilityResult = {
  kind: OutcomeKind;
  headline: string;
  reasons: string[];
  nextSteps: string[];
  studienkollegKurs?: StudienkollegKurs;
  showConsultant: boolean;
  grade: GradeResult | null;
  englishNote: string | null;
  disclaimer: string;
};

export const emptyAnswers = (): EligibilityAnswers => ({
  goal: null,
  qualification: null,
  gradeSystem: null,
  gradeValue: null,
  percentagePassMark: null,
  field: null,
  englishTest: null,
  englishScore: null,
  germanLevel: null,
  completedAt: null,
});
