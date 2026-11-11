import mongoose, { Schema, type Model } from "mongoose";
import {
  CONSULTATION_STATUSES,
  type ConsultationStatus,
} from "@/lib/consultation/status";

export { CONSULTATION_STATUSES, type ConsultationStatus };

/**
 * Answers are validated by `consultationSchema` before insert, so the
 * document stores them as a flexible sub-object; the top-level fields are
 * the ones the admin list sorts and filters on.
 */
const ConsultationSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: CONSULTATION_STATUSES,
      default: "new",
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    degreeLevel: { type: String, required: true, index: true },
    intake: { type: String, required: true },
    userId: { type: String, default: null, index: true },
    answers: { type: Schema.Types.Mixed, required: true },
    adminNotes: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true, minimize: false }
);

ConsultationSchema.index({ status: 1, createdAt: -1 });

export type ConsultationDocument = {
  _id: mongoose.Types.ObjectId;
  reference: string;
  status: ConsultationStatus;
  fullName: string;
  email: string;
  phone: string;
  degreeLevel: string;
  intake: string;
  userId: string | null;
  answers: Record<string, unknown>;
  adminNotes: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ConsultationModel: Model<ConsultationDocument> =
  (mongoose.models.Consultation as Model<ConsultationDocument>) ??
  mongoose.model<ConsultationDocument>("Consultation", ConsultationSchema);
