import assert from "node:assert/strict";
import { test } from "node:test";
import { filterPublicInternships, publicInternship } from "./public";
import type { InternshipRecord } from "@/lib/db/types";

function fixture(overrides: Partial<InternshipRecord> = {}): InternshipRecord {
  return { id: "1", title: "Research internship", slug: "research-internship", organizationName: "CERN", organizationLogoUrl: null, summary: "Work with a research team.", description: "A verified opportunity.", countryCode: "CH", city: "Geneva", locationLabel: "Geneva, Switzerland", workMode: "on_site", durationValue: 3, durationUnit: "months", startDate: null, endDate: null, durationText: "3 months", deadline: "2099-12-31", deadlineStatus: "confirmed", eligibilityCriteria: ["Undergraduate students"], eligibleNationalities: [], studyFields: ["computer_science"], educationLevels: ["undergraduate"], experienceRequirements: null, fundingStatus: "paid", stipendSummary: "Monthly stipend", benefits: ["Mentorship"], applicationUrl: "https://careers.cern/apply", sourceUrl: "https://careers.cern/jobs", sourceDomain: "careers.cern", sourceOrganizationType: "international_organization", canonicalIdentity: "careers.cern:research-internship", lastVerifiedAt: "2026-11-26T00:00:00.000Z", lastCheckedAt: null, lastSuccessfulFetchAt: null, sourceContentHash: null, verificationStatus: "verified", publicationStatus: "published", researchProvider: null, researchModel: null, researchError: "internal error", evidence: [{ field: "deadline", quote: "2099", sourceUrl: "https://careers.cern/jobs", capturedAt: "2026-11-26T00:00:00.000Z" }], notes: "internal", createdAt: "2026-11-26T00:00:00.000Z", updatedAt: "2026-11-26T00:00:00.000Z", ...overrides };
}

test("public projection removes internal evidence and errors", () => {
  const item = publicInternship(fixture(), new Date("2026-11-26T00:00:00.000Z"));
  assert.equal("researchError" in item, false);
  assert.equal("evidence" in item, false);
  assert.equal(item.applicationUrl, "https://careers.cern/apply");
  assert.equal(item.availability, "open");
});

test("published API filtering defaults to all and paginates", () => {
  const records = [fixture(), fixture({ id: "2", title: "Closed internship", slug: "closed-internship", deadline: "2020-01-01" }), fixture({ id: "3", title: "Draft internship", slug: "draft-internship", publicationStatus: "draft" })];
  const result = filterPublicInternships(records, new URLSearchParams("page=1&pageSize=1"), new Date("2026-11-26T00:00:00.000Z"));
  assert.equal(result.total, 2);
  assert.equal(result.internships[0]?.title, "Research internship");
  assert.equal(result.hasMore, true);
});

test("country and funding filters use normalized public values", () => {
  const result = filterPublicInternships([fixture(), fixture({ id: "2", slug: "unpaid", fundingStatus: "unpaid", countryCode: "DE" })], new URLSearchParams("status=all&country=Germany&funding=unpaid"), new Date("2026-11-26T00:00:00.000Z"));
  assert.equal(result.total, 1);
  assert.equal(result.internships[0]?.countryCode, "DE");
});
