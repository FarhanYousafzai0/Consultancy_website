import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { LeadKind, LeadStatus } from "./types";

const LeadSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["chat_handoff", "sop_review", "ai_credits"] satisfies LeadKind[],
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "paid", "closed"] satisfies LeadStatus[],
      default: "new",
    },
    userId: { type: String, default: null, index: true },
    email: { type: String, default: null },
    name: { type: String, default: null },
    goal: { type: String, default: null },
    lastQuestion: { type: String, default: null },
    transcriptSnippet: { type: String, default: "" },
    shortlistCount: { type: Number, default: 0 },
    profileUrl: { type: String, default: null },
    whatsappOpenedAt: { type: String, default: null },
    notes: { type: String, default: "" },
    creditAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LeadSchema.index({ status: 1, createdAt: -1 });

export type LeadDocument = InferSchemaType<typeof LeadSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const LeadModel: Model<LeadDocument> =
  mongoose.models.Lead ?? mongoose.model<LeadDocument>("Lead", LeadSchema);
