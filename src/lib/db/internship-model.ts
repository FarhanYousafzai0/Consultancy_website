import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type {
  InternshipDeadlineStatus,
  InternshipDurationUnit,
  InternshipEducationLevel,
  InternshipFundingStatus,
  InternshipOrganizationType,
  InternshipPublicationStatus,
  InternshipResearchProvider,
  InternshipVerificationStatus,
  InternshipWorkMode,
  ProgramField,
} from "./types";

const EvidenceSchema = new Schema(
  {
    field: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    sourceUrl: { type: String, required: true, trim: true },
    capturedAt: { type: String, required: true },
  },
  { _id: false }
);

const InternshipSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    organizationName: { type: String, required: true, trim: true },
    organizationLogoUrl: { type: String, default: null },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    countryCode: { type: String, default: null, uppercase: true, trim: true },
    city: { type: String, default: null, trim: true },
    locationLabel: { type: String, default: null, trim: true },
    workMode: {
      type: String,
      enum: ["remote", "hybrid", "on_site", "unknown"] satisfies InternshipWorkMode[],
      default: "unknown",
    },
    durationValue: { type: Number, default: null, min: 0 },
    durationUnit: {
      type: String,
      enum: ["weeks", "months", "year", "unknown"] satisfies InternshipDurationUnit[],
      default: "unknown",
    },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    durationText: { type: String, default: null },
    deadline: { type: String, default: null },
    deadlineStatus: {
      type: String,
      enum: ["confirmed", "rolling", "not_published", "ambiguous"] satisfies InternshipDeadlineStatus[],
      default: "not_published",
    },
    eligibilityCriteria: { type: [String], default: [] },
    eligibleNationalities: { type: [String], default: [] },
    studyFields: {
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
    educationLevels: {
      type: [String],
      enum: [
        "high_school",
        "undergraduate",
        "graduate",
        "phd",
        "postdoctoral",
        "professional",
        "other",
        "unknown",
      ] satisfies InternshipEducationLevel[],
      default: ["unknown"],
    },
    experienceRequirements: { type: String, default: null },
    fundingStatus: {
      type: String,
      enum: [
        "paid",
        "unpaid",
        "fully_funded",
        "partially_funded",
        "unknown",
      ] satisfies InternshipFundingStatus[],
      default: "unknown",
    },
    stipendSummary: { type: String, default: null },
    benefits: { type: [String], default: [] },
    applicationUrl: { type: String, default: null },
    sourceUrl: { type: String, required: true, trim: true },
    sourceDomain: { type: String, required: true, trim: true, lowercase: true },
    sourceOrganizationType: {
      type: String,
      enum: [
        "government",
        "international_organization",
        "university",
        "research_institute",
        "company",
        "exchange_program",
        "other",
        "unknown",
      ] satisfies InternshipOrganizationType[],
      default: "unknown",
    },
    // The explicit schema index below is the single source of truth for uniqueness.
    canonicalIdentity: { type: String, required: true, trim: true },
    lastVerifiedAt: { type: String, default: null },
    lastCheckedAt: { type: String, default: null },
    lastSuccessfulFetchAt: { type: String, default: null },
    sourceContentHash: { type: String, default: null },
    verificationStatus: {
      type: String,
      enum: ["verified", "needs_review", "rejected"] satisfies InternshipVerificationStatus[],
      default: "needs_review",
    },
    publicationStatus: {
      type: String,
      enum: ["draft", "published", "expired", "archived"] satisfies InternshipPublicationStatus[],
      default: "draft",
    },
    researchProvider: {
      type: String,
      enum: ["google", "openai", null] satisfies (InternshipResearchProvider | null)[],
      default: null,
    },
    researchModel: { type: String, default: null },
    researchError: { type: String, default: null },
    evidence: { type: [EvidenceSchema], default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

InternshipSchema.index({ publicationStatus: 1, countryCode: 1 });
InternshipSchema.index({ publicationStatus: 1, deadline: 1 });
InternshipSchema.index({ sourceDomain: 1 });
InternshipSchema.index({ organizationName: 1 });
InternshipSchema.index({ canonicalIdentity: 1 }, { unique: true });
InternshipSchema.index({ sourceContentHash: 1 });

export type InternshipDocument = InferSchemaType<typeof InternshipSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InternshipModel: Model<InternshipDocument> =
  (mongoose.models.Internship as Model<InternshipDocument> | undefined) ??
  mongoose.model<InternshipDocument>("Internship", InternshipSchema);
