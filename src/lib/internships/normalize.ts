import {
  normalizeCountry as normalizeScholarshipCountry,
  normalizeOfficialUrl as normalizeScholarshipOfficialUrl,
} from "@/lib/scholarships/normalize";
import type {
  InternshipDurationUnit,
  InternshipEducationLevel,
  InternshipFundingStatus,
  InternshipWorkMode,
  ProgramField,
} from "@/lib/db/types";

const FIELD_ORDER: readonly ProgramField[] = [
  "computer_science",
  "engineering",
  "data",
  "business",
  "economics",
  "natural_sciences",
  "health",
  "social_sciences",
  "arts",
  "other",
];

const EDUCATION_ORDER: readonly InternshipEducationLevel[] = [
  "high_school",
  "undergraduate",
  "graduate",
  "phd",
  "postdoctoral",
  "professional",
  "other",
  "unknown",
];

function key(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[._/-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function normalizeCountry(value: string | null | undefined) {
  return normalizeScholarshipCountry(value);
}

export function normalizeOfficialUrl(
  value: string | null | undefined,
  allowedDomains?: readonly string[]
) {
  return normalizeScholarshipOfficialUrl(value, allowedDomains);
}

export function normalizeWorkMode(value: string | null | undefined): InternshipWorkMode {
  const normalized = key(value ?? "");
  if (/\b(remote|telework|work from home)\b/.test(normalized)) return "remote";
  if (/\b(hybrid|part remote|partly remote)\b/.test(normalized)) return "hybrid";
  if (/\b(on site|onsite|in person|in office|office based)\b/.test(normalized)) {
    return "on_site";
  }
  return "unknown";
}

export function normalizeFundingStatus(value: string | null | undefined): InternshipFundingStatus {
  const normalized = key(value ?? "");
  if (!normalized) return "unknown";
  if (/\bfully funded\b|\bfull funding\b|\bfully supported\b/.test(normalized)) {
    return "fully_funded";
  }
  if (/\bpartially funded\b|\bpartial funding\b|\bpart funded\b/.test(normalized)) {
    return "partially_funded";
  }
  if (/\bunpaid\b|\bno pay\b|\bwithout pay\b/.test(normalized)) return "unpaid";
  if (/\bpaid\b|\bsalaried\b|\bsalary\b|\bwage\b/.test(normalized)) {
    return "paid";
  }
  return "unknown";
}

const FIELD_ALIASES: Record<string, ProgramField> = {
  computer: "computer_science",
  computing: "computer_science",
  "computer science": "computer_science",
  ai: "computer_science",
  "artificial intelligence": "computer_science",
  engineering: "engineering",
  technology: "engineering",
  data: "data",
  "data science": "data",
  analytics: "data",
  business: "business",
  management: "business",
  economics: "economics",
  "natural sciences": "natural_sciences",
  science: "natural_sciences",
  biology: "natural_sciences",
  health: "health",
  healthcare: "health",
  medicine: "health",
  "social sciences": "social_sciences",
  law: "social_sciences",
  arts: "arts",
  humanities: "arts",
};

export function normalizeStudyFields(
  value: string | readonly string[] | null | undefined
): ProgramField[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const result = new Set<ProgramField>();
  for (const item of values) {
    const normalized = key(item);
    result.add(FIELD_ALIASES[normalized] ?? (FIELD_ORDER.includes(normalized as ProgramField) ? normalized as ProgramField : "other"));
  }
  return FIELD_ORDER.filter((field) => result.has(field));
}

const EDUCATION_ALIASES: Record<string, InternshipEducationLevel> = {
  school: "high_school",
  "high school": "high_school",
  secondary: "high_school",
  undergraduate: "undergraduate",
  bachelor: "undergraduate",
  bachelors: "undergraduate",
  "bachelor degree": "undergraduate",
  graduate: "graduate",
  master: "graduate",
  masters: "graduate",
  postgraduate: "graduate",
  phd: "phd",
  doctorate: "phd",
  doctoral: "phd",
  postdoctoral: "postdoctoral",
  postdoc: "postdoctoral",
  professional: "professional",
};

export function normalizeEducationLevels(
  value: string | readonly string[] | null | undefined
): InternshipEducationLevel[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const result = new Set<InternshipEducationLevel>();
  for (const item of values) {
    const normalized = key(item);
    const mapped = EDUCATION_ALIASES[normalized] ??
      (EDUCATION_ORDER.includes(normalized as InternshipEducationLevel)
        ? (normalized as InternshipEducationLevel)
        : null);
    if (mapped) result.add(mapped);
  }
  return EDUCATION_ORDER.filter((level) => result.has(level));
}

export function normalizeDuration(value: string | null | undefined): {
  durationValue: number | null;
  durationUnit: InternshipDurationUnit;
  durationText: string | null;
} {
  if (!value?.trim()) return { durationValue: null, durationUnit: "unknown", durationText: null };
  const text = value.trim();
  const normalized = key(text);
  const unit: InternshipDurationUnit = /\byear|annual|yr\b/.test(normalized)
    ? "year"
    : /\bmonth|monthly|mo\b/.test(normalized)
      ? "months"
      : /\bweek|weekly|wk\b/.test(normalized)
        ? "weeks"
        : "unknown";
  const numberMatch = normalized.match(/\d+(?:\.\d+)?/);
  const durationValue = numberMatch
    ? Number(numberMatch[0])
    : /\bone\b/.test(normalized)
      ? 1
      : null;
  return { durationValue, durationUnit: unit, durationText: text };
}
