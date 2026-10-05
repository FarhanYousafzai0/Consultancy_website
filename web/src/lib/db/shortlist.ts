import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectMongo } from "./connect";
import { getProgram } from "./programs";
import type { ProgramRecord } from "./types";

const ShortlistSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    programId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
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
  createdAt: string;
  program: ProgramRecord | null;
};

export async function listShortlist(userId: string): Promise<ShortlistItem[]> {
  await connectMongo();
  const docs = await ShortlistModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  const items: ShortlistItem[] = [];
  for (const doc of docs) {
    const program = await getProgram(doc.programId);
    items.push({
      id: doc._id.toString(),
      programId: doc.programId,
      createdAt: (doc.createdAt ?? new Date()).toISOString(),
      program,
    });
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
    { $setOnInsert: { userId, programId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return {
    id: (doc as { _id: { toString(): string } })._id.toString(),
    programId,
    createdAt: (
      (doc as { createdAt?: Date }).createdAt ?? new Date()
    ).toISOString(),
    program,
  };
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
