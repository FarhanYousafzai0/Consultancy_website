import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type {
  ApplicationRoute,
  DegreeLevel,
  GermanRequired,
  InstructionLanguage,
  ProgramField,
  ProgramStatus,
  UniversityType,
} from "./types";

const IntakeSchema = new Schema(
  {
    semester: { type: String, enum: ["winter", "summer"], required: true },
    year: { type: Number, required: true },
    deadlineNonEu: { type: String, default: null },
    status: { type: String, enum: ["confirmed", "predicted"], required: true },
  },
  { _id: false }
);

const ProgramSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    universityType: {
      type: String,
      enum: ["public", "private"] satisfies UniversityType[],
      required: true,
    },
    degreeLevel: {
      type: String,
      enum: ["bachelor", "master"] satisfies DegreeLevel[],
      required: true,
    },
    field: {
      type: String,
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
      required: true,
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    languageOfInstruction: {
      type: String,
      enum: ["english", "german", "both"] satisfies InstructionLanguage[],
      required: true,
    },
    ieltsMin: { type: Number, default: null },
    toeflMin: { type: Number, default: null },
    germanRequired: {
      type: String,
      enum: ["none", "a1", "a2", "b1", "b2", "c1"] satisfies GermanRequired[],
      default: "none",
    },
    applicationRoute: {
      type: String,
      enum: ["direct", "uni_assist", "vpd"] satisfies ApplicationRoute[],
      required: true,
    },
    tuitionPerSemesterEur: { type: Number, default: 0 },
    semesterFeeEur: { type: Number, default: 0 },
    typicalGermanGradeMax: { type: Number, default: null },
    intakes: { type: [IntakeSchema], default: [] },
    requiredDocuments: { type: [String], default: [] },
    sourceUrl: { type: String, required: true },
    lastVerifiedAt: { type: String, default: null },
    status: {
      type: String,
      enum: ["draft", "published"] satisfies ProgramStatus[],
      default: "draft",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

ProgramSchema.index({ status: 1, degreeLevel: 1, field: 1 });
ProgramSchema.index({ university: 1, name: 1 }, { unique: true });

export type ProgramDocument = InferSchemaType<typeof ProgramSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProgramModel: Model<ProgramDocument> =
  mongoose.models.Program ??
  mongoose.model<ProgramDocument>("Program", ProgramSchema);
