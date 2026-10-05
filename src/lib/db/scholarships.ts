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
  fields: ScholarshipRecord["fields"];
  minGermanGrade?: number | null;
  workExperienceYears: number;
  maxYearsSinceDegree?: number | null;
  ageLimit?: number | null;
  mustBeEnrolled: boolean;
  amountSummary: string;
  coverage: string;
  cycles: ScholarshipRecord["cycles"];
  nextCycleStatus: ScholarshipRecord["nextCycleStatus"];
  sourceUrl: string;
  lastVerifiedAt?: string | null;
  status: ProgramStatus;
  notes?: string;
  bachelorFundingRareNote?: boolean;
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
    fields: doc.fields ?? [],
    minGermanGrade: doc.minGermanGrade ?? null,
    workExperienceYears: doc.workExperienceYears ?? 0,
    maxYearsSinceDegree: doc.maxYearsSinceDegree ?? null,
    ageLimit: doc.ageLimit ?? null,
    mustBeEnrolled: doc.mustBeEnrolled ?? false,
    amountSummary: doc.amountSummary ?? "",
    coverage: doc.coverage ?? "",
    cycles: doc.cycles ?? [],
    nextCycleStatus: doc.nextCycleStatus ?? "unknown",
    sourceUrl: doc.sourceUrl,
    lastVerifiedAt: doc.lastVerifiedAt ?? null,
    status: doc.status,
    notes: doc.notes ?? "",
    bachelorFundingRareNote: Boolean(doc.bachelorFundingRareNote),
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function listScholarships(options?: {
  status?: ProgramStatus | "all";
}): Promise<ScholarshipRecord[]> {
  await connectMongo();
  const status = options?.status ?? "published";
  const query = status === "all" ? {} : { status };
  const docs = await ScholarshipModel.find(query).sort({ updatedAt: -1 }).lean();
  return docs.map((doc) => docToRecord(doc as never));
}

export async function getScholarship(
  id: string
): Promise<ScholarshipRecord | null> {
  await connectMongo();
  const doc = await ScholarshipModel.findById(id).lean();
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
