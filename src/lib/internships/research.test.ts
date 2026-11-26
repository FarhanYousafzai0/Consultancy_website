import assert from "node:assert/strict";
import test from "node:test";
import { internshipSources } from "@/data/internship-sources";
import { extractedInternshipSchema, evidenceMatches, stableInternshipIdentity, validateExtractedInternship, researchInternshipSource } from "./research";

const source = internshipSources[0];
const fixture = {
  title: "Short-Term Data Science Internship",
  organizationName: "CERN",
  summary: "A supervised research internship.",
  description: "Work with a research team on data science.",
  organizationLogoUrl: null,
  country: "Switzerland",
  city: "Geneva",
  locationLabel: "Geneva, Switzerland",
  workMode: "on-site",
  duration: "1 to 6 months",
  startDate: null,
  endDate: null,
  deadline: "2027-01-31",
  deadlineStatus: "confirmed" as const,
  eligibilityCriteria: ["Students enrolled at a university"],
  eligibleNationalities: ["international students"],
  studyFields: ["data" as const],
  educationLevels: ["graduate" as const],
  experienceRequirements: null,
  fundingStatus: "paid" as const,
  stipendSummary: "A monthly allowance is provided.",
  benefits: ["Research experience"],
  applicationUrl: "https://careers.cern/apply/123",
  sourceUrl: "https://careers.cern/jobs/",
  sourceOrganizationType: "international_organization" as const,
  evidence: [
    { field: "deadline", quote: "Apply by 31 January 2027.", sourceUrl: "https://careers.cern/jobs/" },
    { field: "eligibility", quote: "Students enrolled at a university", sourceUrl: "https://careers.cern/jobs/" },
    { field: "duration", quote: "1 to 6 months", sourceUrl: "https://careers.cern/jobs/" },
    { field: "funding", quote: "A monthly allowance is provided.", sourceUrl: "https://careers.cern/jobs/" },
  ],
  notes: "Fixture from official page content.",
};

test("extraction schema requires structured evidence and official URL shapes", () => {
  assert.equal(extractedInternshipSchema.safeParse({ internships: [fixture] }).success, true);
  assert.equal(extractedInternshipSchema.safeParse({ internships: [{ ...fixture, applicationUrl: "not-a-url" }] }).success, false);
});

test("evidence matching is literal and does not accept invented quotes", () => {
  assert.equal(evidenceMatches("Apply by 31 January 2027.", "Apply by 31 January 2027."), true);
  assert.equal(evidenceMatches("Apply by 1 February 2027.", "Apply by 31 January 2027."), false);
});

test("stable identity deduplicates equivalent candidate attributes", () => {
  const first = stableInternshipIdentity(source.id, fixture);
  const second = stableInternshipIdentity(source.id, { ...fixture, title: "  Short-Term Data Science Internship  " });
  assert.equal(first, second);
  assert.notEqual(first, stableInternshipIdentity(source.id, { ...fixture, city: "Zurich" }));
});

test("validation accepts a grounded candidate and rejects an unsupported application URL", () => {
  const pages = [{
    url: source.url,
    text: "Apply by 31 January 2027. Students enrolled at a university. 1 to 6 months. A monthly allowance is provided.",
    links: [{ url: "https://careers.cern/apply/123", label: "Apply" }],
    hash: "fixture",
  }];
  assert.deepEqual(validateExtractedInternship(fixture, source, pages, pages[0].text), { valid: true, reasons: [] });
  const invalid = validateExtractedInternship({ ...fixture, applicationUrl: "https://evil.test/apply" }, source, pages, pages[0].text);
  assert.equal(invalid.valid, false);
  assert.match(invalid.reasons.join(" "), /applicationUrl/);
});

test("research dry-run extracts one verified candidate, deduplicates it, and skips unchanged content", async () => {
  const fetcher: typeof fetch = async () => new Response(
    '<h1>Short-Term Data Science Internship</h1><p>Apply by 31 January 2027. Students enrolled at a university. 1 to 6 months. A monthly allowance is provided.</p><a href="/apply/123">Apply</a>',
    { headers: { "content-type": "text/html" } }
  );
  const extract = async () => ({ provider: "openai" as const, modelId: "fixture", internships: [fixture, fixture] });
  const first = await researchInternshipSource({ source, dryRun: true, fetcher, extract });
  assert.equal(first.extracted, 2);
  assert.equal(first.upserted, 1);
  assert.equal(first.needsReview, 0);

  const hash = first.contentHash;
  const second = await researchInternshipSource({
    source,
    dryRun: false,
    fetcher,
    extract,
    upsert: (async () => { throw new Error("must not upsert unchanged content"); }) as never,
    getState: async () => ({ contentHash: first.contentHash, lastError: null }) as never,
    now: new Date("2026-11-26T00:00:00.000Z"),
  });
  assert.equal(second.contentHash, hash);
  assert.equal(typeof second.contentHash, "string");
  assert.equal(second.skippedUnchanged, true);
});
