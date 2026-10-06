import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    sources: {
      type: [
        {
          type: { type: String },
          id: String,
          title: String,
          href: String,
          lastVerifiedAt: String,
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const AdvisorThreadSchema = new Schema(
  {
    userId: { type: String, default: null, index: true },
    visitorId: { type: String, default: null, index: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

export type AdvisorThreadDocument = InferSchemaType<
  typeof AdvisorThreadSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const AdvisorThreadModel: Model<AdvisorThreadDocument> =
  mongoose.models.AdvisorThread ??
  mongoose.model<AdvisorThreadDocument>("AdvisorThread", AdvisorThreadSchema);
