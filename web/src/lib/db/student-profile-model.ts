import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { EligibilityAnswers } from "@/lib/eligibility/types";

const StudentProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    goal: { type: String, default: null },
    qualification: { type: String, default: null },
    gradeSystem: { type: String, default: null },
    gradeValue: { type: Number, default: null },
    percentagePassMark: { type: Number, default: null },
    field: { type: String, default: null },
    englishTest: { type: String, default: null },
    englishScore: { type: Number, default: null },
    germanLevel: { type: String, default: null },
    completedAt: { type: String, default: null },
  },
  { timestamps: true }
);

export type StudentProfileDocument = InferSchemaType<
  typeof StudentProfileSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const StudentProfileModel: Model<StudentProfileDocument> =
  mongoose.models.StudentProfile ??
  mongoose.model<StudentProfileDocument>(
    "StudentProfile",
    StudentProfileSchema
  );

export type StudentProfileRecord = EligibilityAnswers & {
  userId: string;
  updatedAt: string;
};

export function docToProfile(doc: {
  userId: string;
  goal?: string | null;
  qualification?: string | null;
  gradeSystem?: string | null;
  gradeValue?: number | null;
  percentagePassMark?: number | null;
  field?: string | null;
  englishTest?: string | null;
  englishScore?: number | null;
  germanLevel?: string | null;
  completedAt?: string | null;
  updatedAt?: Date;
}): StudentProfileRecord {
  return {
    userId: doc.userId,
    goal: (doc.goal as EligibilityAnswers["goal"]) ?? null,
    qualification:
      (doc.qualification as EligibilityAnswers["qualification"]) ?? null,
    gradeSystem: (doc.gradeSystem as EligibilityAnswers["gradeSystem"]) ?? null,
    gradeValue: doc.gradeValue ?? null,
    percentagePassMark:
      (doc.percentagePassMark as EligibilityAnswers["percentagePassMark"]) ??
      null,
    field: (doc.field as EligibilityAnswers["field"]) ?? null,
    englishTest: (doc.englishTest as EligibilityAnswers["englishTest"]) ?? null,
    englishScore: doc.englishScore ?? null,
    germanLevel: (doc.germanLevel as EligibilityAnswers["germanLevel"]) ?? null,
    completedAt: doc.completedAt ?? null,
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}
