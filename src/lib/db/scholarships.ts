import { seedScholarships } from "@/data/seed-scholarships";
import { connectMongo } from "./connect";
import { ScholarshipModel } from "./scholarship-model";
import type {
  ScholarshipInput,
  ScholarshipRecord,
  ProgramStatus,
} from "./types";

function docToRecord(doc: {
  _id: { toString(): string };
  name: string;
  provider: string;
  slug: string;
  levels: ScholarshipRecord["levels"];
  nationalities: ScholarshipRecord["nationalities"];
  studyCountries?: string[];
  fields: ScholarshipRecord["fields"];
  minGermanGrade?: number | null;
  workExperienceYears: number;
  maxYearsSinceDegree?: number | null;
  ageLimit?: number | null;
  mustBeEnrolled: boolean;
  amountSummary: string;
  coverage: string;
  fundingType?: ScholarshipRecord["fundingType"];
  languageRequirements?: string[];
  cycles: ScholarshipRecord["cycles"];
  nextCycleStatus: ScholarshipRecord["nextCycleStatus"];
  sourceUrl: string;
  applicationUrl?: string;
  sourceDomain?: string;
  lastVerifiedAt?: string | null;
  lastCheckedAt?: string | null;
  lastSuccessfulFetchAt?: string | null;
  sourceContentHash?: string | null;
  researchProvider?: ScholarshipRecord["researchProvider"];
  researchModel?: string | null;
  researchError?: string | null;
  status: ProgramStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}): ScholarshipRecord {
  return {
    id: doc._id.toString(),
    name: doc.name,
    provider: doc.provider,
    slug: doc.slug,
    levels: doc.levels ?? [],
    nationalities: doc.nationalities ?? ["any"],
    studyCountries: doc.studyCountries ?? [],
    fields: doc.fields ?? [],
    minGermanGrade: doc.minGermanGrade ?? null,
    workExperienceYears: doc.workExperienceYears ?? 0,
    maxYearsSinceDegree: doc.maxYearsSinceDegree ?? null,
    ageLimit: doc.ageLimit ?? null,
    mustBeEnrolled: doc.mustBeEnrolled ?? false,
    amountSummary: doc.amountSummary ?? "",
    coverage: doc.coverage ?? "",
    fundingType: doc.fundingType ?? "unknown",
    languageRequirements: doc.languageRequirements ?? [],
    cycles: doc.cycles ?? [],
    nextCycleStatus: doc.nextCycleStatus ?? "unknown",
    sourceUrl: doc.sourceUrl,
    applicationUrl: doc.applicationUrl || doc.sourceUrl,
    sourceDomain: doc.sourceDomain || new URL(doc.sourceUrl).hostname,
    lastVerifiedAt: doc.lastVerifiedAt ?? null,
    lastCheckedAt: doc.lastCheckedAt ?? doc.lastVerifiedAt ?? null,
    lastSuccessfulFetchAt: doc.lastSuccessfulFetchAt ?? doc.lastVerifiedAt ?? null,
    sourceContentHash: doc.sourceContentHash ?? null,
    researchProvider: doc.researchProvider ?? null,
    researchModel: doc.researchModel ?? null,
    researchError: doc.researchError ?? null,
    status: doc.status,
    notes: doc.notes ?? "",
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function listScholarships(options?: {
  status?: ProgramStatus | "all";
}): Promise<ScholarshipRecord[]> {
  await connectMongo();
  const status = options?.status ?? "published";
  const query = status === "all" ? {} : {
    status,
    // Old illustrative fixtures remain available in admin, never as real listings.
    $nor: [{ slug: { $in: seedScholarships.map((item) => item.slug) }, researchProvider: null }],
  };
  const docs = await ScholarshipModel.find(query).sort({ updatedAt: -1 }).lean();
  return docs.map((doc) => docToRecord(doc as never));
}

export async function getScholarship(
  id: string
): Promise<ScholarshipRecord | null> {
  await connectMongo();
  const doc = await ScholarshipModel.findOne({ _id: id }).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function getScholarshipBySlug(
  slug: string
): Promise<ScholarshipRecord | null> {
  await connectMongo();
  const doc = await ScholarshipModel.findOne({ slug }).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function createScholarship(
  input: ScholarshipInput
): Promise<ScholarshipRecord> {
  await connectMongo();
  const doc = await ScholarshipModel.create(input);
  return docToRecord(doc.toObject() as never);
}

export async function updateScholarship(
  id: string,
  input: Partial<ScholarshipInput>
): Promise<ScholarshipRecord | null> {
  await connectMongo();
  const doc = await ScholarshipModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true }
  ).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function deleteScholarship(id: string): Promise<boolean> {
  await connectMongo();
  const result = await ScholarshipModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function ensureScholarshipsSeeded() {
  if (process.env.SEED_DEMO_SCHOLARSHIPS !== "true") return;
  await connectMongo();
  const count = await ScholarshipModel.countDocuments();
  if (count === 0) {
    await ScholarshipModel.insertMany(seedScholarships);
  }
}

export async function importScholarshipInputs(inputs: ScholarshipInput[]) {
  await connectMongo();
  let inserted = 0;
  for (const input of inputs) {
    const existing = await ScholarshipModel.findOne({ slug: input.slug }).lean();
    if (existing) continue;
    await ScholarshipModel.create(input);
    inserted += 1;
  }
  return inserted;
}

export async function upsertScholarshipFromResearch(
  input: ScholarshipInput & { applicationUrl: string }
) {
  await connectMongo();
  const sourceDomain = input.sourceDomain || new URL(input.sourceUrl).hostname;
  const payload = {
    ...input,
    sourceDomain,
    lastCheckedAt: input.lastCheckedAt ?? new Date().toISOString(),
    lastSuccessfulFetchAt:
      input.lastSuccessfulFetchAt ?? new Date().toISOString(),
    researchError: null,
  };
  const doc = await ScholarshipModel.findOneAndUpdate(
    { slug: input.slug },
    { $set: payload },
    { upsert: true, new: true, runValidators: true }
  ).lean();
  return doc ? docToRecord(doc as never) : null;
}

/**
 * A source re-read can rename or regroup its scholarships, which yields new
 * slugs. Unpublish that source's records from older reads so it never shows
 * duplicates. Records stay in admin as drafts.
 */
export async function retireStaleResearchScholarships(sourceId: string, currentHash: string) {
  await connectMongo();
  const prefix = sourceId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const result = await ScholarshipModel.updateMany(
    {
      slug: { $regex: `^${prefix}-[0-9a-f]{16}$` },
      researchProvider: { $ne: null },
      sourceContentHash: { $ne: currentHash },
      status: "published",
    },
    { $set: { status: "draft" } }
  );
  return result.modifiedCount;
}

export async function hasScholarshipContentHash(hash: string) {
  await connectMongo();
  return Boolean(await ScholarshipModel.exists({ sourceContentHash: hash }));
}
