import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ResearchRunSchema = new Schema(
  {
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    status: { type: String, enum: ["running", "completed", "failed"], required: true },
    sourceCount: { type: Number, required: true },
    succeeded: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    records: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    providerUsage: {
      google: { type: Number, default: 0 },
      openai: { type: Number, default: 0 },
    },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

export type ResearchRunDocument = InferSchemaType<typeof ResearchRunSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ResearchRunModel: Model<ResearchRunDocument> =
  mongoose.models.ResearchRun ??
  mongoose.model<ResearchRunDocument>("ResearchRun", ResearchRunSchema);
