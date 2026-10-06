import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { AnalysisType } from "./types";

const AdvisorReportSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["profile", "sop", "shortlist"] satisfies AnalysisType[],
      required: true,
    },
    inputSummary: { type: String, default: "" },
    result: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

AdvisorReportSchema.index({ userId: 1, createdAt: -1 });

export type AdvisorReportDocument = InferSchemaType<
  typeof AdvisorReportSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const AdvisorReportModel: Model<AdvisorReportDocument> =
  mongoose.models.AdvisorReport ??
  mongoose.model<AdvisorReportDocument>("AdvisorReport", AdvisorReportSchema);
