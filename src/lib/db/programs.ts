import { seedPrograms } from "@/data/seed-programs";
import { connectMongo } from "./connect";
import { ProgramModel } from "./program-model";
import type { ProgramInput, ProgramRecord, ProgramStatus } from "./types";

function docToRecord(doc: {
  _id: { toString(): string };
  name: string;
  university: string;
  universityType: ProgramRecord["universityType"];
  degreeLevel: ProgramRecord["degreeLevel"];
  field: ProgramRecord["field"];
  city: string;
  state: string;
  languageOfInstruction: ProgramRecord["languageOfInstruction"];
  ieltsMin?: number | null;
  toeflMin?: number | null;
  germanRequired: ProgramRecord["germanRequired"];
  applicationRoute: ProgramRecord["applicationRoute"];
  tuitionPerSemesterEur: number;
  semesterFeeEur: number;
  typicalGermanGradeMax?: number | null;
  intakes: ProgramRecord["intakes"];
  requiredDocuments: string[];
  sourceUrl: string;
  lastVerifiedAt?: string | null;
  status: ProgramStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}): ProgramRecord {
  return {
    id: doc._id.toString(),
    name: doc.name,
    university: doc.university,
    universityType: doc.universityType,
    degreeLevel: doc.degreeLevel,
    field: doc.field,
    city: doc.city,
    state: doc.state,
    languageOfInstruction: doc.languageOfInstruction,
    ieltsMin: doc.ieltsMin ?? null,
    toeflMin: doc.toeflMin ?? null,
    germanRequired: doc.germanRequired,
    applicationRoute: doc.applicationRoute,
    tuitionPerSemesterEur: doc.tuitionPerSemesterEur,
    semesterFeeEur: doc.semesterFeeEur,
    typicalGermanGradeMax: doc.typicalGermanGradeMax ?? null,
    intakes: doc.intakes ?? [],
    requiredDocuments: doc.requiredDocuments ?? [],
    sourceUrl: doc.sourceUrl,
    lastVerifiedAt: doc.lastVerifiedAt ?? null,
    status: doc.status,
    notes: doc.notes ?? "",
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

async function requireMongo() {
  await connectMongo();
}

export async function listPrograms(options?: {
  status?: ProgramStatus | "all";
}): Promise<ProgramRecord[]> {
  await requireMongo();
  const status = options?.status ?? "published";
  const query = status === "all" ? {} : { status };
  const docs = await ProgramModel.find(query).sort({ updatedAt: -1 }).lean();
  return docs.map((doc) => docToRecord(doc as never));
}

export async function getProgram(id: string): Promise<ProgramRecord | null> {
  await requireMongo();
  const doc = await ProgramModel.findById(id).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function createProgram(
  input: ProgramInput
): Promise<ProgramRecord> {
  await requireMongo();
  const doc = await ProgramModel.create(input);
  return docToRecord(doc.toObject() as never);
}

export async function updateProgram(
  id: string,
  input: Partial<ProgramInput>
): Promise<ProgramRecord | null> {
  await requireMongo();
  const doc = await ProgramModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true }
  ).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function deleteProgram(id: string): Promise<boolean> {
  await requireMongo();
  const result = await ProgramModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function storageMode(): Promise<"mongodb"> {
  await requireMongo();
  return "mongodb";
}

export async function ensureSeeded() {
  await requireMongo();
  const count = await ProgramModel.countDocuments();
  if (count === 0) {
    await ProgramModel.insertMany(seedPrograms);
  }
}

export async function importProgramInputs(inputs: ProgramInput[]) {
  await requireMongo();
  let inserted = 0;
  for (const input of inputs) {
    const existing = await ProgramModel.findOne({
      university: input.university,
      name: input.name,
    }).lean();
    if (existing) continue;
    await ProgramModel.create(input);
    inserted += 1;
  }
  return inserted;
}
