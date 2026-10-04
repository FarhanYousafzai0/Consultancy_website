import type {
  AusbildungField,
  AusbildungQualification,
  BachelorsQualification,
  EnglishTest,
  GermanLevel,
  Goal,
  GradeSystem,
  MastersQualification,
  PercentagePassMark,
  StudyField,
} from "./types";

export const goalOptions: { value: Goal; label: string; description: string }[] = [
  {
    value: "masters",
    label: "Master's",
    description: "I have (or will have) a BS / BSc degree",
  },
  {
    value: "bachelors",
    label: "Bachelor's",
    description: "I have FSc, HSSC or A-levels",
  },
  {
    value: "ausbildung",
    label: "Ausbildung",
    description: "Paid vocational training in Germany",
  },
];

export const mastersQualificationOptions: {
  value: MastersQualification;
  label: string;
}[] = [
  { value: "bs_4year", label: "4-year BS / BSc (16 years of education)" },
  { value: "ba_bsc_2year", label: "2-year BA / BSc (14 years of education)" },
  {
    value: "ba_bsc_2year_plus_masters",
    label: "2-year BA / BSc + 2-year MA / MSc",
  },
  { value: "other", label: "Other" },
];

export const bachelorsQualificationOptions: {
  value: BachelorsQualification;
  label: string;
}[] = [
  { value: "fsc_pre_engineering", label: "FSc / HSSC — Pre-engineering" },
  { value: "fsc_pre_medical", label: "FSc / HSSC — Pre-medical" },
  { value: "fsc_ics", label: "FSc / HSSC — ICS" },
  { value: "fsc_icom", label: "FSc / HSSC — ICom" },
  { value: "fsc_fa", label: "FSc / HSSC — FA" },
  { value: "a_levels", label: "A-levels" },
  { value: "university_1year", label: "1+ year of university completed" },
  { value: "other", label: "Other" },
];

export const ausbildungQualificationOptions: {
  value: AusbildungQualification;
  label: string;
}[] = [
  { value: "matric", label: "Matric" },
  { value: "fsc_hssc", label: "FSc / HSSC" },
  { value: "other", label: "Other" },
];

export const studyFieldOptions: { value: StudyField; label: string }[] = [
  { value: "computer_science", label: "Computer Science" },
  { value: "engineering", label: "Engineering" },
  { value: "data", label: "Data / AI" },
  { value: "business", label: "Business / Management" },
  { value: "natural_sciences", label: "Natural Sciences" },
  { value: "health", label: "Health / Medicine-related" },
  { value: "social_sciences", label: "Social Sciences" },
  { value: "arts", label: "Arts / Design" },
  { value: "other", label: "Other" },
];

export const ausbildungFieldOptions: { value: AusbildungField; label: string }[] =
  [
    { value: "it", label: "IT / Software" },
    { value: "nursing", label: "Nursing / Care" },
    { value: "mechatronics", label: "Mechatronics / Engineering trades" },
    { value: "hospitality", label: "Hospitality / Hotel" },
    { value: "trades", label: "Skilled trades" },
    { value: "other", label: "Other" },
  ];

export const gradeSystemOptions: { value: GradeSystem; label: string }[] = [
  { value: "percentage", label: "Percentage" },
  { value: "cgpa4", label: "CGPA out of 4.0" },
  { value: "cgpa5", label: "CGPA out of 5.0" },
];

export const passMarkOptions: { value: PercentagePassMark; label: string }[] = [
  { value: 33, label: "33% pass" },
  { value: 40, label: "40% pass" },
  { value: 50, label: "50% pass" },
];

export const englishTestOptions: { value: EnglishTest; label: string }[] = [
  { value: "ielts", label: "IELTS" },
  { value: "toefl", label: "TOEFL iBT" },
  { value: "pte", label: "PTE Academic" },
  { value: "duolingo", label: "Duolingo English Test" },
  { value: "none", label: "Not taken yet" },
];

export const germanLevelOptions: { value: GermanLevel; label: string }[] = [
  { value: "none", label: "No German yet" },
  { value: "a1", label: "A1" },
  { value: "a2", label: "A2" },
  { value: "b1", label: "B1" },
  { value: "b2", label: "B2" },
  { value: "c1", label: "C1 or higher" },
];

export function labelForGoal(goal: Goal): string {
  return goalOptions.find((o) => o.value === goal)?.label ?? goal;
}

export function labelForQualification(goal: Goal, value: string): string {
  const list =
    goal === "masters"
      ? mastersQualificationOptions
      : goal === "bachelors"
        ? bachelorsQualificationOptions
        : ausbildungQualificationOptions;
  return list.find((o) => o.value === value)?.label ?? value;
}

export function labelForField(goal: Goal, value: string): string {
  const list = goal === "ausbildung" ? ausbildungFieldOptions : studyFieldOptions;
  return list.find((o) => o.value === value)?.label ?? value;
}

export function labelForEnglish(test: EnglishTest, score: number | null): string {
  if (test === "none") return "Not taken yet";
  const name = englishTestOptions.find((o) => o.value === test)?.label ?? test;
  return score == null ? name : `${name} ${score}`;
}

export function labelForGerman(level: GermanLevel): string {
  return germanLevelOptions.find((o) => o.value === level)?.label ?? level;
}

export function labelForGradeSystem(system: GradeSystem): string {
  return gradeSystemOptions.find((o) => o.value === system)?.label ?? system;
}
