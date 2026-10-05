import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectMongo } from "./connect";
import { getScholarship } from "./scholarships";
import type { ScholarshipRecord } from "./types";

const SavedScholarshipSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    scholarshipId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SavedScholarshipSchema.index(
  { userId: 1, scholarshipId: 1 },
  { unique: true }
);

export type SavedScholarshipDocument = InferSchemaType<
  typeof SavedScholarshipSchema
> & { _id: mongoose.Types.ObjectId };

export const SavedScholarshipModel: Model<SavedScholarshipDocument> =
  mongoose.models.SavedScholarship ??
  mongoose.model<SavedScholarshipDocument>(
    "SavedScholarship",
    SavedScholarshipSchema
  );

export type SavedScholarshipItem = {
  id: string;
  scholarshipId: string;
  createdAt: string;
  scholarship: ScholarshipRecord | null;
};

export async function listSavedScholarships(
  userId: string
): Promise<SavedScholarshipItem[]> {
  await connectMongo();
  const docs = await SavedScholarshipModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  const items: SavedScholarshipItem[] = [];
  for (const doc of docs) {
    const scholarship = await getScholarship(doc.scholarshipId);
    items.push({
      id: doc._id.toString(),
      scholarshipId: doc.scholarshipId,
      createdAt: (doc.createdAt ?? new Date()).toISOString(),
      scholarship,
    });
  }
  return items;
}

export async function addSavedScholarship(
  userId: string,
  scholarshipId: string
): Promise<SavedScholarshipItem> {
  await connectMongo();
  const scholarship = await getScholarship(scholarshipId);
  if (!scholarship) throw new Error("Scholarship not found");
  const doc = await SavedScholarshipModel.findOneAndUpdate(
    { userId, scholarshipId },
    { $setOnInsert: { userId, scholarshipId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return {
    id: (doc as { _id: { toString(): string } })._id.toString(),
    scholarshipId,
    createdAt: (
      (doc as { createdAt?: Date }).createdAt ?? new Date()
    ).toISOString(),
    scholarship,
  };
}

export async function removeSavedScholarship(
  userId: string,
  scholarshipId: string
): Promise<boolean> {
  await connectMongo();
  const result = await SavedScholarshipModel.findOneAndDelete({
    userId,
    scholarshipId,
  });
  return Boolean(result);
}

export async function isScholarshipSaved(
  userId: string,
  scholarshipId: string
): Promise<boolean> {
  await connectMongo();
  const doc = await SavedScholarshipModel.findOne({
    userId,
    scholarshipId,
  }).lean();
  return Boolean(doc);
}
