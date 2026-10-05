import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectMongo } from "./connect";

const AlertPreferenceSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    emailEnabled: { type: Boolean, default: true },
    /** Keys like `program:ID:30` or `scholarship:ID:14` → ISO timestamp last sent */
    lastSentAt: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

export type AlertPreferenceDocument = InferSchemaType<
  typeof AlertPreferenceSchema
> & { _id: mongoose.Types.ObjectId };

export const AlertPreferenceModel: Model<AlertPreferenceDocument> =
  mongoose.models.AlertPreference ??
  mongoose.model<AlertPreferenceDocument>(
    "AlertPreference",
    AlertPreferenceSchema
  );

export type AlertPreferenceRecord = {
  userId: string;
  emailEnabled: boolean;
  lastSentAt: Record<string, string>;
  updatedAt: string;
};

function toRecord(doc: {
  userId: string;
  emailEnabled?: boolean;
  lastSentAt?: Map<string, string> | Record<string, string>;
  updatedAt?: Date;
}): AlertPreferenceRecord {
  const map =
    doc.lastSentAt instanceof Map
      ? Object.fromEntries(doc.lastSentAt.entries())
      : (doc.lastSentAt ?? {});
  return {
    userId: doc.userId,
    emailEnabled: doc.emailEnabled !== false,
    lastSentAt: map,
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function getAlertPreference(
  userId: string
): Promise<AlertPreferenceRecord> {
  await connectMongo();
  const doc = await AlertPreferenceModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, emailEnabled: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return toRecord(doc as never);
}

export async function setAlertPreference(
  userId: string,
  emailEnabled: boolean
): Promise<AlertPreferenceRecord> {
  await connectMongo();
  const doc = await AlertPreferenceModel.findOneAndUpdate(
    { userId },
    { $set: { emailEnabled }, $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return toRecord(doc as never);
}

export async function markAlertSent(
  userId: string,
  key: string
): Promise<void> {
  await connectMongo();
  await AlertPreferenceModel.findOneAndUpdate(
    { userId },
    {
      $set: { [`lastSentAt.${key}`]: new Date().toISOString() },
      $setOnInsert: { userId, emailEnabled: true },
    },
    { upsert: true }
  );
}

export async function listUsersWithAlertsEnabled(): Promise<
  AlertPreferenceRecord[]
> {
  await connectMongo();
  const docs = await AlertPreferenceModel.find({
    emailEnabled: true,
  }).lean();
  return docs.map((d) => toRecord(d as never));
}
