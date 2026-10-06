import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectMongo } from "./connect";
import { getProgram } from "./programs";
import type { ProgramRecord } from "./types";
import {
  APPLICATION_OUTCOMES,
  APPLICATION_STATUSES,
  CLOSED_APPLICATION_STATUSES,
  applicationOutcomeLabel,
  applicationStatusLabel,
  buildTimeline,
  docProgress,
  intakeKey,
  normalizeOutcome,
  normalizeStatus,
  normalizeTargetIntake,
  resolveDeadline,
  shortlistProgressSchema,
  type ApplicationOutcome,
  type ApplicationStatus,
  type ShortlistProgressPatch,
  type TargetIntake,
} from "@/lib/applications/progress";

export {
  APPLICATION_OUTCOMES,
  APPLICATION_STATUSES,
  CLOSED_APPLICATION_STATUSES,
  applicationOutcomeLabel,
  applicationStatusLabel,
  buildTimeline,
  docProgress,
  intakeKey,
  resolveDeadline,
  shortlistProgressSchema,
  type ApplicationOutcome,
  type ApplicationStatus,
  type ShortlistProgressPatch,
  type TargetIntake,
};

const TargetIntakeSchema = new Schema(
  {
    semester: { type: String, enum: ["winter", "summer"], required: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

const ShortlistSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    programId: { type: String, required: true },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "planning",
    },
    completedDocuments: { type: [String], default: [] },
    targetIntake: { type: TargetIntakeSchema, default: null },
    outcome: {
      type: String,
      enum: APPLICATION_OUTCOMES,
      default: null,
    },
    outcomeAt: { type: String, default: null },
  },
  { timestamps: true }
);

ShortlistSchema.index({ userId: 1, programId: 1 }, { unique: true });

export type ShortlistDocument = InferSchemaType<typeof ShortlistSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ShortlistModel: Model<ShortlistDocument> =
  mongoose.models.Shortlist ??
  mongoose.model<ShortlistDocument>("Shortlist", ShortlistSchema);

export type ShortlistItem = {
  id: string;
  programId: string;
  status: ApplicationStatus;
  completedDocuments: string[];
  targetIntake: TargetIntake | null;
  outcome: ApplicationOutcome | null;
  outcomeAt: string | null;
  createdAt: string;
  updatedAt: string;
  program: ProgramRecord | null;
};

function docToItem(
  doc: {
    _id: { toString(): string };
    programId: string;
    status?: string;
    completedDocuments?: string[];
    targetIntake?: TargetIntake | null;
    outcome?: string | null;
    outcomeAt?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  },
  program: ProgramRecord | null
): ShortlistItem {
  return {
    id: doc._id.toString(),
    programId: doc.programId,
    status: normalizeStatus(doc.status),
    completedDocuments: Array.isArray(doc.completedDocuments)
      ? doc.completedDocuments.filter((d): d is string => typeof d === "string")
      : [],
    targetIntake: normalizeTargetIntake(doc.targetIntake),
    outcome: normalizeOutcome(doc.outcome),
    outcomeAt:
      typeof doc.outcomeAt === "string" && doc.outcomeAt
        ? doc.outcomeAt
        : null,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? doc.createdAt ?? new Date()).toISOString(),
    program,
  };
}

export async function listShortlist(userId: string): Promise<ShortlistItem[]> {
  await connectMongo();
  const docs = await ShortlistModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  const items: ShortlistItem[] = [];
  for (const doc of docs) {
    const program = await getProgram(doc.programId);
    items.push(docToItem(doc as never, program));
  }
  return items;
}

export async function addToShortlist(
  userId: string,
  programId: string
): Promise<ShortlistItem> {
  await connectMongo();
  const program = await getProgram(programId);
  if (!program) {
    throw new Error("Program not found");
  }
  const doc = await ShortlistModel.findOneAndUpdate(
    { userId, programId },
    {
      $setOnInsert: {
        userId,
        programId,
        status: "planning",
        completedDocuments: [],
        targetIntake: null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return docToItem(doc as never, program);
}

export async function updateShortlistProgress(
  userId: string,
  patch: ShortlistProgressPatch
): Promise<ShortlistItem | null> {
  await connectMongo();
  const { programId, ...rest } = patch;
  const $set: Record<string, unknown> = {};
  if (rest.status !== undefined) $set.status = rest.status;
  if (rest.completedDocuments !== undefined) {
    $set.completedDocuments = rest.completedDocuments;
  }
  if (rest.targetIntake !== undefined) {
    $set.targetIntake = rest.targetIntake;
  }
  if (rest.outcome !== undefined) {
    $set.outcome = rest.outcome;
    $set.outcomeAt = rest.outcome
      ? new Date().toISOString()
      : null;
  }
  if (Object.keys($set).length === 0) {
    const existing = await ShortlistModel.findOne({ userId, programId }).lean();
    if (!existing) return null;
    const program = await getProgram(programId);
    return docToItem(existing as never, program);
  }

  const doc = await ShortlistModel.findOneAndUpdate(
    { userId, programId },
    { $set },
    { new: true }
  ).lean();
  if (!doc) return null;
  const program = await getProgram(programId);
  const item = docToItem(doc as never, program);
  const progress = docProgress(item);
  if (progress.completed.length !== item.completedDocuments.length) {
    const cleaned = await ShortlistModel.findOneAndUpdate(
      { userId, programId },
      { $set: { completedDocuments: progress.completed } },
      { new: true }
    ).lean();
    if (cleaned) return docToItem(cleaned as never, program);
  }
  return { ...item, completedDocuments: progress.completed };
}

export async function removeFromShortlist(
  userId: string,
  programId: string
): Promise<boolean> {
  await connectMongo();
  const result = await ShortlistModel.findOneAndDelete({ userId, programId });
  return Boolean(result);
}

export async function isOnShortlist(
  userId: string,
  programId: string
): Promise<boolean> {
  await connectMongo();
  const doc = await ShortlistModel.findOne({ userId, programId }).lean();
  return Boolean(doc);
}

export async function countOutcomes(): Promise<
  Record<ApplicationOutcome, number>
> {
  await connectMongo();
  const rows = await ShortlistModel.aggregate<{
    _id: ApplicationOutcome;
    count: number;
  }>([
    { $match: { outcome: { $in: [...APPLICATION_OUTCOMES] } } },
    { $group: { _id: "$outcome", count: { $sum: 1 } } },
  ]);
  const out: Record<ApplicationOutcome, number> = {
    admitted: 0,
    rejected: 0,
    withdrew: 0,
  };
  for (const row of rows) {
    if (row._id in out) out[row._id] = row.count;
  }
  return out;
}
