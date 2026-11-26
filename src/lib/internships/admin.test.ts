import assert from "node:assert/strict";
import test from "node:test";
import { getInternshipAdminPatch, getInternshipEditPatch, isAdminSession, isOfficialApplicationUrl } from "./admin";
import type { InternshipRecord } from "@/lib/db/types";

const base = {
  id: "id",
  title: "Research internship",
  slug: "research-internship",
  organizationName: "Official Lab",
  organizationLogoUrl: null,
  summary: "Summary",
  description: "Description",
  countryCode: "CH",
  city: "Geneva",
  locationLabel: "Geneva, Switzerland",
  workMode: "on_site",
  durationValue: 3,
  durationUnit: "months",
  startDate: null,
  endDate: null,
  durationText: "3 months",
  deadline: "2027-01-01",
  deadlineStatus: "confirmed",
  eligibilityCriteria: ["Students"],
  eligibleNationalities: ["Any"],
  studyFields: ["computer_science"],
  educationLevels: ["undergraduate"],
  experienceRequirements: null,
  fundingStatus: "paid",
  stipendSummary: "Monthly stipend",
  benefits: ["Mentoring"],
  applicationUrl: "https://careers.cern/apply",
  sourceUrl: "https://careers.cern/jobs/example",
  sourceDomain: "official.example",
  sourceOrganizationType: "company",
  canonicalIdentity: "official.example:research-internship",
  lastVerifiedAt: "2026-11-26T00:00:00.000Z",
  lastCheckedAt: "2026-11-26T00:00:00.000Z",
  lastSuccessfulFetchAt: "2026-11-26T00:00:00.000Z",
  sourceContentHash: "hash",
  verificationStatus: "verified",
  publicationStatus: "draft",
  researchProvider: "openai",
  researchModel: "gpt",
  researchError: null,
  evidence: [{ field: "deadline", quote: "1 January 2027", sourceUrl: "https://careers.cern/jobs/example", capturedAt: "2026-11-26T00:00:00.000Z" }],
  notes: "",
  createdAt: "2026-11-26T00:00:00.000Z",
  updatedAt: "2026-11-26T00:00:00.000Z",
} satisfies InternshipRecord;

test("requires an admin role", () => {
    assert.equal(isAdminSession(null), false);
    assert.equal(isAdminSession({ role: "user" }), false);
    assert.equal(isAdminSession({ role: "admin" }), true);
  });

test("publishes only verified records with evidence and official links", () => {
    assert.deepEqual(getInternshipAdminPatch(base, "approve").patch, { publicationStatus: "published" });
    assert.ok(getInternshipAdminPatch({ ...base, verificationStatus: "needs_review" }, "approve").error);
    assert.ok(getInternshipAdminPatch({ ...base, evidence: [] }, "approve").error);
    assert.ok(getInternshipAdminPatch({ ...base, applicationUrl: "https://example.net/apply" }, "approve").error);
  });

test("accepts only HTTPS source-host or explicitly allowlisted application domains", () => {
    assert.equal(isOfficialApplicationUrl("https://official.example/apply", "official.example"), true);
    assert.equal(isOfficialApplicationUrl("https://jobs.official.example/apply", "official.example"), true);
    assert.equal(isOfficialApplicationUrl("http://official.example/apply", "official.example"), false);
    assert.equal(isOfficialApplicationUrl("https://jobs.partner.example/apply", "official.example"), false);
    assert.equal(isOfficialApplicationUrl("https://jobs.partner.example/apply", "official.example", ["partner.example"]), true);
    assert.equal(isOfficialApplicationUrl("https://user:pass@official.example/apply", "official.example"), false);
  });

test("keeps verification and publication transitions explicit", () => {
    assert.deepEqual(getInternshipAdminPatch(base, "reject").patch, { verificationStatus: "rejected", publicationStatus: "draft" });
    assert.deepEqual(getInternshipAdminPatch(base, "archive").patch, { publicationStatus: "archived" });
    assert.deepEqual(getInternshipAdminPatch(base, "expire").patch, { publicationStatus: "expired" });
    assert.deepEqual(getInternshipAdminPatch(base, "force-recheck").patch, { verificationStatus: "needs_review", researchError: null });
  });


test("requires documented human confirmation and a curated source for verification", () => {
  const candidate = { ...base, verificationStatus: "needs_review" as const };
  const review = { note: "Checked the official listing and application link", confirmed: true, reviewer: "admin@example.org", now: "2026-11-27T12:00:00.000Z" };
  assert.ok(getInternshipAdminPatch(candidate, "verify").error);
  assert.ok(getInternshipAdminPatch(candidate, "verify", [], { ...review, confirmed: false }).error);
  assert.ok(getInternshipAdminPatch({ ...candidate, sourceUrl: "https://evil.example/job", sourceDomain: "evil.example", applicationUrl: "https://evil.example/apply" }, "verify", [], review).error);
  assert.ok(getInternshipAdminPatch({ ...candidate, sourceUrl: "http://careers.cern/jobs/example" }, "verify", [], review).error);
  assert.ok(getInternshipAdminPatch({ ...candidate, evidence: [{ ...candidate.evidence[0], sourceUrl: "https://careers.cern/other" }] }, "verify", [], review).error);
  const patch = getInternshipAdminPatch(candidate, "verify", [], review).patch;
  assert.equal(patch?.verificationStatus, "verified");
  assert.equal(patch?.lastVerifiedAt, review.now);
  assert.match(patch?.notes ?? "", /admin@example.org.*Checked the official/);
  assert.equal(patch?.publicationStatus, undefined);
});

test("does not trust a record controlled source domain for publication", () => {
  assert.ok(getInternshipAdminPatch({ ...base, sourceUrl: "https://evil.example/job", sourceDomain: "evil.example", applicationUrl: "https://evil.example/apply" }, "approve").error);
  assert.ok(getInternshipAdminPatch({ ...base, sourceUrl: "https://careers.cern.evil.example/job" }, "approve").error);
  assert.ok(getInternshipAdminPatch({ ...base, sourceUrl: "https://user@careers.cern/jobs/example" }, "approve").error);
  assert.deepEqual(getInternshipAdminPatch({ ...base, applicationUrl: "https://jobs.smartrecruiters.com/example" }, "approve").patch, { publicationStatus: "published" });
});

test("material edits invalidate verification and publication while preserving evidence and timestamps", () => {
  const record = { ...base, publicationStatus: "published" as const };
  assert.deepEqual(getInternshipEditPatch(record, { title: "Changed title", evidence: [], lastVerifiedAt: null, publicationStatus: "published" }), { title: "Changed title", verificationStatus: "needs_review", publicationStatus: "draft" });
  assert.deepEqual(getInternshipEditPatch(record, { title: record.title, notes: "Note" }), { title: record.title, notes: "Note" });
  assert.deepEqual(getInternshipEditPatch(base, { applicationUrl: "https://careers.cern/new" }), { applicationUrl: "https://careers.cern/new", verificationStatus: "needs_review" });
});
