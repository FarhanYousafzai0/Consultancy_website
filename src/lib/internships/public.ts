import type { InternshipRecord, ProgramField } from "@/lib/db/types";
import { internshipAvailability, type InternshipAvailability } from "./status";
import { normalizeCountry } from "./normalize";
import { csvListingInfo } from "./csv-listings";

export const internshipStatuses = ["open", "closing_soon", "closed", "unknown", "all"] as const;
export type InternshipStatusFilter = (typeof internshipStatuses)[number];
export const internshipSorts = ["open_first", "deadline", "verified", "newest", "title"] as const;
export type InternshipSort = (typeof internshipSorts)[number];

const availabilityRank: Record<InternshipAvailability, number> = {
  open: 0,
  closing_soon: 0,
  unknown: 1,
  closed: 2,
};

const regionByCountry: Record<string, string> = {
  AF: "asia", AL: "europe", AM: "asia", AT: "europe", AU: "oceania", AZ: "asia",
  BD: "asia", BE: "europe", BG: "europe", BR: "americas", CA: "americas", CH: "europe",
  CN: "asia", CZ: "europe", DE: "europe", DK: "europe", EG: "middle_east",
  ES: "europe", FI: "europe", FR: "europe", GB: "europe", GR: "europe", HU: "europe",
  ID: "asia", IE: "europe", IN: "asia", IR: "middle_east", IT: "europe", JP: "asia",
  KE: "africa", KR: "asia", KZ: "asia", MY: "asia", MX: "americas", MN: "asia",
  NG: "africa", NL: "europe", NP: "asia", NO: "europe", NZ: "oceania", PK: "asia",
  PL: "europe", PT: "europe", QA: "middle_east", RO: "europe", RU: "europe", SA: "middle_east",
  SE: "europe", SG: "asia", TH: "asia", TR: "europe", UA: "europe", AE: "middle_east",
  US: "americas", VN: "asia", ZA: "africa",
};

export function countryLabel(country: string | null) {
  if (!country) return "Location not specified";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(country.toUpperCase()) ?? country;
  } catch {
    return country;
  }
}

export function fieldLabel(field: ProgramField) {
  return field.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function publicInternship(record: InternshipRecord, now = new Date()) {
  const availability = internshipAvailability(record, now);
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    organizationName: record.organizationName,
    organizationLogoUrl: record.organizationLogoUrl,
    summary: record.summary,
    description: record.description,
    countryCode: record.countryCode,
    countryLabel: countryLabel(record.countryCode),
    region: record.countryCode ? regionByCountry[record.countryCode.toUpperCase()] ?? "other" : "other",
    city: record.city,
    locationLabel: record.locationLabel,
    workMode: record.workMode,
    durationValue: record.durationValue,
    durationUnit: record.durationUnit,
    durationText: record.durationText,
    deadline: record.deadline,
    deadlineStatus: record.deadlineStatus,
    eligibilityCriteria: record.eligibilityCriteria,
    eligibleNationalities: record.eligibleNationalities,
    studyFields: record.studyFields,
    educationLevels: record.educationLevels,
    experienceRequirements: record.experienceRequirements,
    fundingStatus: record.fundingStatus,
    stipendSummary: record.stipendSummary,
    benefits: record.benefits,
    applicationUrl: record.applicationUrl ?? record.sourceUrl,
    sourceUrl: record.sourceUrl,
    sourceDomain: record.sourceDomain,
    lastVerifiedAt: record.lastVerifiedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    availability,
    csvInfo: csvListingInfo(record.id),
  };
}

export type PublicInternship = ReturnType<typeof publicInternship>;

function matchesQuery(item: PublicInternship, query: string) {
  const haystack = [item.title, item.organizationName, item.summary, item.description, item.countryLabel, item.city ?? "", ...item.studyFields].join(" ").toLowerCase();
  return haystack.includes(query);
}

export function filterPublicInternships(records: InternshipRecord[], params: URLSearchParams, now = new Date()) {
  const status = (params.get("status")?.trim().toLowerCase() || "all") as InternshipStatusFilter;
  const sort = (params.get("sort")?.trim().toLowerCase() || "open_first") as InternshipSort;
  const q = params.get("q")?.trim().toLowerCase() || "";
  const country = normalizeCountry(params.get("country"));
  const region = params.get("region")?.trim().toLowerCase() || "";
  const field = params.get("field")?.trim().toLowerCase() || "";
  const workMode = params.get("workMode")?.trim().toLowerCase() || "";
  const duration = params.get("duration")?.trim().toLowerCase() || "";
  const funding = params.get("funding")?.trim().toLowerCase() || "";

  const published = records.filter((record) => record.publicationStatus === "published").map((record) => publicInternship(record, now));
  const countries = new Map<string, number>();
  const fields = new Map<string, number>();
  const workModes = new Map<string, number>();
  const fundingValues = new Map<string, number>();
  for (const item of published) {
    if (item.countryCode) countries.set(item.countryCode, (countries.get(item.countryCode) ?? 0) + 1);
    for (const value of item.studyFields) fields.set(value, (fields.get(value) ?? 0) + 1);
    workModes.set(item.workMode, (workModes.get(item.workMode) ?? 0) + 1);
    fundingValues.set(item.fundingStatus, (fundingValues.get(item.fundingStatus) ?? 0) + 1);
  }

  const filtered = published.filter((item) => {
    if (q && !matchesQuery(item, q)) return false;
    if (country && item.countryCode !== country) return false;
    if (region && item.region !== region) return false;
    if (field && !item.studyFields.includes(field as ProgramField)) return false;
    if (workMode && item.workMode !== workMode) return false;
    if (duration && item.durationUnit !== duration) return false;
    if (funding && item.fundingStatus !== funding) return false;
    if (status !== "all" && (status === "open" ? !["open", "closing_soon"].includes(item.availability) : item.availability !== status)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sort === "open_first") {
      const rank = availabilityRank[a.availability] - availabilityRank[b.availability];
      if (rank !== 0) return rank;
    }
    if (sort === "deadline" || sort === "open_first") {
      const deadline = (a.deadline ?? "9999-12-31").localeCompare(b.deadline ?? "9999-12-31");
      if (deadline !== 0) return deadline;
    }
    if (sort === "verified") {
      const verified = (b.lastVerifiedAt ?? "").localeCompare(a.lastVerifiedAt ?? "");
      if (verified !== 0) return verified;
    }
    if (sort === "newest") {
      const newest = b.createdAt.localeCompare(a.createdAt);
      if (newest !== 0) return newest;
    }
    return a.title.localeCompare(b.title);
  });

  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize")) || 20));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return {
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
    facets: {
      countries: [...countries.entries()].sort(([a], [b]) => countryLabel(a).localeCompare(countryLabel(b))).map(([value, count]) => ({ value, label: countryLabel(value), count })),
      regions: [...new Set(published.map((item) => item.region))].sort().map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) })),
      fields: [...fields.entries()].sort(([a], [b]) => fieldLabel(a as ProgramField).localeCompare(fieldLabel(b as ProgramField))).map(([value, count]) => ({ value, label: fieldLabel(value as ProgramField), count })),
      workModes: [...workModes.entries()].map(([value, count]) => ({ value, label: value === "on_site" ? "On-site" : value.replace(/\b\w/g, (letter) => letter.toUpperCase()), count })),
      funding: [...fundingValues.entries()].map(([value, count]) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), count })),
    },
    internships: filtered.slice(start, start + pageSize),
  };
}
