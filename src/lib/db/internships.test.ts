import assert from "node:assert/strict";
import test from "node:test";
import { tmpdir } from "node:os";
import path from "node:path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { InternshipModel } from "./internship-model";
import { internshipInputSchema } from "./internship-schema";
import { docToInternshipRecord, upsertInternshipFromResearch } from "./internships";

const validInternship = {
  title: "Global Research Internship",
  slug: "global-research-internship",
  organizationName: "Example Institute",
  organizationLogoUrl: null,
  summary: "A research placement for international students.",
  description: "Work with an international research team.",
  countryCode: "DE",
  city: "Berlin",
  locationLabel: "Berlin, Germany",
  workMode: "hybrid" as const,
  durationValue: 3,
  durationUnit: "months" as const,
  startDate: "2027-06-01",
  endDate: "2027-08-31",
  durationText: "Three months",
  deadline: "2027-03-31",
  deadlineStatus: "confirmed" as const,
  eligibilityCriteria: ["Current university students"],
  eligibleNationalities: ["any"],
  studyFields: ["computer_science" as const],
  educationLevels: ["undergraduate" as const],
  experienceRequirements: null,
  fundingStatus: "fully_funded" as const,
  stipendSummary: "Monthly stipend and travel support",
  benefits: ["Travel support"],
  applicationUrl: "https://example.org/apply",
  sourceUrl: "https://example.org/internships",
  sourceOrganizationType: "research_institute" as const,
  lastVerifiedAt: "2026-11-26T10:00:00.000Z",
  sourceContentHash: null,
  researchProvider: null,
  researchModel: null,
  verificationStatus: "verified" as const,
  publicationStatus: "draft" as const,
  evidence: [
    {
      field: "deadline",
      quote: "Applications close on 31 March 2027.",
      sourceUrl: "https://example.org/internships",
      capturedAt: "2026-11-26T10:00:00.000Z",
    },
  ],
  notes: "Official institute source.",
};

test("internship input accepts a complete verified record", () => {
  const result = internshipInputSchema.safeParse(validInternship);

  assert.equal(result.success, true);
});

test("internship input rejects invalid URLs, dates, and enum values", () => {
  const result = internshipInputSchema.safeParse({
    ...validInternship,
    applicationUrl: "not-a-url",
    deadline: "not-a-date",
    fundingStatus: "guaranteed" as never,
  });

  assert.equal(result.success, false);
});

test("internship model exposes identity and public listing indexes", () => {
  const indexKeys = InternshipModel.schema.indexes().map(([keys]) => Object.keys(keys).sort().join(","));

  assert.ok(indexKeys.includes("canonicalIdentity"));
  assert.ok(indexKeys.includes("countryCode,publicationStatus"));
  assert.ok(indexKeys.includes("deadline,publicationStatus"));
  assert.ok(indexKeys.includes("sourceDomain"));
  assert.ok(indexKeys.includes("organizationName"));
});

test("document conversion preserves explicit unknowns and nulls", () => {
  const record = docToInternshipRecord({
    ...validInternship,
    _id: { toString: () => "internship-id" },
    sourceDomain: "example.org",
    canonicalIdentity: "example.org:global-research-internship",
    verificationStatus: "needs_review",
    publicationStatus: "draft",
    workMode: "unknown",
    durationUnit: "unknown",
    deadlineStatus: "not_published",
    fundingStatus: "unknown",
    researchProvider: null,
    researchModel: null,
    researchError: null,
    lastCheckedAt: null,
    lastSuccessfulFetchAt: null,
    sourceContentHash: null,
    createdAt: new Date("2026-11-26T10:00:00.000Z"),
    updatedAt: new Date("2026-11-26T10:00:00.000Z"),
  });

  assert.equal(record.id, "internship-id");
  assert.equal(record.applicationUrl, "https://example.org/apply");
  assert.equal(record.deadlineStatus, "not_published");
  assert.equal(record.fundingStatus, "unknown");
  assert.equal(record.lastSuccessfulFetchAt, null);
});

test("research inserts atomically and preserves every existing editorial state", async () => {
  // Always use a newly started, isolated database, regardless of configured env vars.
  assert.equal(mongoose.connection.readyState, 0, "test requires an unconnected mongoose instance");
  const server = await MongoMemoryServer.create({ binary: { downloadDir: path.join(tmpdir(), "parwaz-mongodb-binaries") } });
  try {
    await mongoose.connect(server.getUri(), { bufferCommands: false });
    await InternshipModel.init();
    for (const [index, state] of ([
      { publicationStatus: "draft", verificationStatus: "needs_review" },
      { publicationStatus: "draft", verificationStatus: "rejected" },
      { publicationStatus: "published", verificationStatus: "verified" },
      { publicationStatus: "archived", verificationStatus: "verified" },
      { publicationStatus: "expired", verificationStatus: "verified" },
    ] as const).entries()) {
      const input = { ...validInternship, slug: `existing-${index}`, canonicalIdentity: `example:${index}` };
      await InternshipModel.create({ ...input, sourceDomain: "example.org", ...state, title: "Editor title", notes: "Editor notes" });
      const before = await InternshipModel.findOne({ canonicalIdentity: input.canonicalIdentity }).lean();
      const result = await upsertInternshipFromResearch(input);
      const after = await InternshipModel.findOne({ canonicalIdentity: input.canonicalIdentity }).lean();
      assert.deepEqual(after, before);
      assert.equal(result.title, "Editor title");
      await upsertInternshipFromResearch({ canonicalIdentity: input.canonicalIdentity, researchError: "Fetch failed" });
      const failed = await InternshipModel.findOne({ canonicalIdentity: input.canonicalIdentity }).lean();
      assert.equal(failed?.verificationStatus, state.verificationStatus);
      assert.equal(failed?.publicationStatus, state.publicationStatus);
      assert.equal(failed?.notes, "Editor notes");
    }
    const input = { ...validInternship, slug: "concurrent", canonicalIdentity: "example:concurrent", publicationStatus: "published" as const };
    const results = await Promise.all(Array.from({ length: 8 }, () => upsertInternshipFromResearch(input)));
    assert.equal(new Set(results.map((item) => item.id)).size, 1);
    assert.equal(results[0].publicationStatus, "draft");
    assert.equal(await InternshipModel.countDocuments({ canonicalIdentity: input.canonicalIdentity }), 1);
    await assert.rejects(upsertInternshipFromResearch({ ...input, canonicalIdentity: "example:other" }));
    assert.equal(await upsertInternshipFromResearch({ canonicalIdentity: "missing", researchError: "Fetch failed" }), null);
  } finally {
    await mongoose.disconnect();
    await server.stop();
  }
});
