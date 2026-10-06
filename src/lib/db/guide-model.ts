import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { GuideTopic, ProgramStatus } from "./types";

const GuideSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    topic: {
      type: String,
      enum: [
        "aps",
        "blocked_account",
        "visa",
        "uni_assist",
        "anabin",
        "studienkolleg",
        "faq",
        "other",
      ] satisfies GuideTopic[],
      required: true,
    },
    body: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    lastVerifiedAt: { type: String, default: null },
    status: {
      type: String,
      enum: ["draft", "published"] satisfies ProgramStatus[],
      default: "draft",
    },
  },
  { timestamps: true }
);

GuideSchema.index({ status: 1, topic: 1 });
GuideSchema.index({ title: "text", body: "text" });

export type GuideDocument = InferSchemaType<typeof GuideSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GuideModel: Model<GuideDocument> =
  mongoose.models.Guide ?? mongoose.model<GuideDocument>("Guide", GuideSchema);
