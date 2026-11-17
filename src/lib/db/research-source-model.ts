import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ResearchSourceSchema = new Schema(
  {
    sourceId: { type: String, required: true, unique: true },
    etag: { type: String, default: null },
    lastModified: { type: String, default: null },
    contentHash: { type: String, default: null },
    lastCheckedAt: { type: Date, default: null },
    lastSuccessfulFetchAt: { type: Date, default: null },
    lastError: { type: String, default: null },
  },
  { timestamps: true }
);

export type ResearchSourceDocument = InferSchemaType<typeof ResearchSourceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ResearchSourceModel: Model<ResearchSourceDocument> =
  mongoose.models.ResearchSource ??
  mongoose.model<ResearchSourceDocument>("ResearchSource", ResearchSourceSchema);
