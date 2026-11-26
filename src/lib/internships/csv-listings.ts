import rows from "@/data/internships-2027.json";
import type { InternshipRecord } from "@/lib/db/types";
import { normalizeCountry } from "./normalize";

/** User-supplied snapshot; these entries are not independently verified. */
export const csvListings: InternshipRecord[] = rows.map((row, index) => {
  const sourceUrl = /^https:\/\//i.test(row.source_url) ? row.source_url : "https://www.google.com/";
  return {
    id: `csv-${index}`, title: row.title, slug: `csv-internship-${index}`, organizationName: row.host,
    organizationLogoUrl: null, summary: `${row.status}. ${row.verify_note}`, description: row.deadline_note,
    countryCode: normalizeCountry(row.country), city: null, locationLabel: row.country, workMode: "unknown",
    durationValue: null, durationUnit: "unknown", durationText: row.duration || null,
    startDate: null, endDate: null, deadline: null,
    deadlineStatus: /rolling/i.test(row.status) ? "rolling" : "ambiguous",
    eligibilityCriteria: row.eligibility ? [row.eligibility] : [], eligibleNationalities: [], studyFields: [], educationLevels: [],
    experienceRequirements: null, fundingStatus: "unknown", stipendSummary: row.funding || null, benefits: [],
    applicationUrl: sourceUrl, sourceUrl, sourceDomain: new URL(sourceUrl).hostname,
    sourceOrganizationType: "unknown", canonicalIdentity: `csv:${index}`, lastVerifiedAt: null,
    lastCheckedAt: null, lastSuccessfulFetchAt: null, sourceContentHash: null,
    verificationStatus: "needs_review", publicationStatus: "published", researchProvider: null, researchModel: null,
    researchError: null, evidence: [], notes: "", createdAt: row.last_checked || "2026-11-27", updatedAt: row.last_checked || "2026-11-27",
  };
});

export function csvListingInfo(id: string) {
  const match = /^csv-(\d+)$/.exec(id);
  const row = match ? rows[Number(match[1])] : undefined;
  return row ? { status: row.status, sourceType: row.source_type, checked: row.last_checked, note: row.verify_note, deadline: row.deadline, deadlineNote: row.deadline_note } : null;
}
