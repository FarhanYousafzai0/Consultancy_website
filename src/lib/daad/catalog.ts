import type { InstructionLanguage, ProgramField, ScholarshipLevel } from "@/lib/db/types";

/** DAAD International Programmes — course types we can search in our catalogue. */
export const supportedCourseTypes = [
  { value: "bachelor", label: "Bachelor's degree", degree: "bachelor" as const },
  { value: "master", label: "Master's degree", degree: "master" as const },
] as const;

/** Listed the way DAAD does. We do not invent results for types we do not hold. */
export const unsupportedCourseTypes = [
  { value: "phd", label: "PhD / Doctorate" },
  { value: "graduate_school", label: "Cross-faculty graduate and research school" },
  { value: "prep", label: "Prep course" },
  { value: "language", label: "Language course" },
  { value: "short", label: "Short course" },
  { value: "joint", label: "Joint degree / double degree programme" },
] as const;

export const courseTypeOptions = [
  ...supportedCourseTypes.map(({ value, label }) => ({ value, label, supported: true })),
  ...unsupportedCourseTypes.map(({ value, label }) => ({ value, label, supported: false })),
];

export const courseLanguageOptions = [
  { value: "english", label: "English only" },
  { value: "german", label: "German only" },
  { value: "both", label: "German & English" },
] as const;

/**
 * DAAD subject groups, mapped onto our fields.
 * Computer science and data are extra — DAAD folds them into engineering or natural sciences.
 */
export const subjectGroupOptions: {
  value: ProgramField;
  label: string;
  extra?: boolean;
}[] = [
  {
    value: "engineering",
    label:
      "Engineering (electrical, mechanical, civil, environmental, renewable, architecture)",
  },
  { value: "computer_science", label: "Computer science / IT", extra: true },
  { value: "data", label: "Data and AI", extra: true },
  { value: "business", label: "Business / Management", extra: true },
  { value: "economics", label: "Economics", extra: true },
  {
    value: "natural_sciences",
    label:
      "Natural sciences (maths, physics, chemistry, biology, agriculture, food)",
  },
  { value: "health", label: "Public health / health sciences" },
  { value: "social_sciences", label: "Psychology / social sciences" },
  { value: "arts", label: "Art, music, design, languages" },
  { value: "other", label: "Public administration, teaching, other" },
];

export const universityTypeOptions = [
  { value: "public", label: "Public universities" },
  { value: "private", label: "Private universities" },
] as const;

export const tuitionOptions = [
  { value: "free", label: "No tuition (€0)" },
  { value: "under_1500", label: "Under €1,500 / semester" },
] as const;

/** DAAD "Programmes for" — mapped to our scholarship levels. */
export const scholarshipAudienceOptions: {
  value: ScholarshipLevel;
  label: string;
}[] = [
  { value: "bachelor", label: "Undergraduates" },
  { value: "master", label: "Graduates" },
  { value: "phd", label: "Doctoral candidates / PhD" },
];

export const scholarshipPurposeOptions = [
  { value: "study", label: "Study scholarship" },
  { value: "research", label: "Research grant" },
  { value: "language", label: "Language / short course" },
] as const;

export type ScholarshipPurpose = (typeof scholarshipPurposeOptions)[number]["value"];

export const DAAD_PROGRAMMES_URL =
  "https://www2.daad.de/deutschland/studienangebote/international-programmes/en/";
export const DAAD_SCHOLARSHIPS_URL =
  "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/";

export function isSupportedCourseType(value: string): boolean {
  return supportedCourseTypes.some((item) => item.value === value);
}

export function degreeForCourseType(value: string): "bachelor" | "master" | null {
  const found = supportedCourseTypes.find((item) => item.value === value);
  return found?.degree ?? null;
}

export function courseTypeLabel(value: string): string | null {
  return courseTypeOptions.find((item) => item.value === value)?.label ?? null;
}

/** DAAD international programmes are taught in English, or in German and English. */
export function isInternationalProgramme(language: InstructionLanguage): boolean {
  return language === "english" || language === "both";
}

export function scholarshipPurposeOf(record: {
  name: string;
  coverage: string;
  levels: string[];
}): ScholarshipPurpose {
  const text = `${record.name} ${record.coverage}`.toLowerCase();
  if (
    text.includes("language") ||
    text.includes("summer course") ||
    text.includes("short course")
  ) {
    return "language";
  }
  if (
    record.levels.includes("phd") ||
    text.includes("research") ||
    text.includes("doctoral") ||
    text.includes("postdoc")
  ) {
    return "research";
  }
  return "study";
}

export function isDaadProvider(provider: string): boolean {
  return provider.toLowerCase().includes("daad");
}

export function relatedScholarships<
  T extends {
    id: string;
    name: string;
    provider: string;
    levels: string[];
    fields: string[];
  },
>(degreeLevel: string, field: string, scholarships: T[], limit = 3) {
  return scholarships
    .filter(
      (scholarship) =>
        scholarship.levels.includes(degreeLevel) &&
        scholarship.fields.includes(field)
    )
    .sort(
      (a, b) =>
        Number(isDaadProvider(b.provider)) - Number(isDaadProvider(a.provider))
    )
    .slice(0, limit)
    .map((scholarship) => ({
      id: scholarship.id,
      name: scholarship.name,
      provider: scholarship.provider,
      daad: isDaadProvider(scholarship.provider),
    }));
}
