import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type {
  CycleStatus,
  NextCycleStatus,
  ProgramField,
  ProgramStatus,
  ScholarshipLevel,
  ScholarshipNationality,
} from "./types";

const CycleSchema = new Schema(
  {
    openAt: { type: String, default: null },
    closeAt: { type: String, default: null },
    status: {
      type: String,
      enum: ["confirmed", "predicted"] satisfies CycleStatus[],
      required: true,
    },
  },
  { _id: false }
);

const ScholarshipSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    levels: {
      type: [String],
      enum: ["bachelor", "master", "phd"] satisfies ScholarshipLevel[],
      default: [],
    },
    nationalities: {
      type: [String],
      enum: ["pakistan", "any"] satisfies ScholarshipNationality[],
      default: ["any"],
    },
    fields: {
      type: [String],
      enum: [
        "computer_science",
        "engineering",
        "data",
        "business",
        "economics",
        "natural_sciences",
        "health",
        "social_sciences",
        "arts",
        "other",
      ] satisfies ProgramField[],
      default: [],
    },
    minGermanGrade: { type: Number, default: null },
    workExperienceYears: { type: Number, default: 0 },
    maxYearsSinceDegree: { type: Number, default: null },
    ageLimit: { type: Number, default: null },
    mustBeEnrolled: { type: Boolean, default: false },
    amountSummary: { type: String, default: "" },
    coverage: { type: String, default: "" },
    cycles: { type: [CycleSchema], default: [] },
    nextCycleStatus: {
      type: String,
      enum: ["confirmed", "predicted", "unknown"] satisfies NextCycleStatus[],
      default: "unknown",
    },
    sourceUrl: { type: String, required: true },
    lastVerifiedAt: { type: String, default: null },
    status: {
      type: String,
      enum: ["draft", "published"] satisfies ProgramStatus[],
      default: "draft",
    },
    notes: { type: String, default: "" },
    bachelorFundingRareNote: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ScholarshipSchema.index({ status: 1, provider: 1 });

export type ScholarshipDocument = InferSchemaType<typeof ScholarshipSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ScholarshipModel: Model<ScholarshipDocument> =
  mongoose.models.Scholarship ??
  mongoose.model<ScholarshipDocument>("Scholarship", ScholarshipSchema);
