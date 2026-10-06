import mongoose, { Schema, type Model } from "mongoose";
import { connectMongo } from "@/lib/db/connect";

export const AUSBILDUNG_EVENT_TYPES = [
  "ausbildung_check_completed",
  "ausbildung_listing_view",
  "ausbildung_apply_click",
] as const;

export type AusbildungEventType = (typeof AUSBILDUNG_EVENT_TYPES)[number];

const CounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CounterModel =
  mongoose.models.AusbildungDemand ??
  mongoose.model("AusbildungDemand", CounterSchema);

export async function incrementAusbildungEvent(
  event: AusbildungEventType,
  by = 1
): Promise<number> {
  await connectMongo();
  const doc = await CounterModel.findOneAndUpdate(
    { key: event },
    { $inc: { count: by }, $setOnInsert: { key: event } },
    { upsert: true, new: true }
  ).lean();
  return (doc as { count?: number } | null)?.count ?? by;
}

export async function getAusbildungDemandTotals(): Promise<
  Record<AusbildungEventType, number>
> {
  await connectMongo();
  const docs = await CounterModel.find({
    key: { $in: [...AUSBILDUNG_EVENT_TYPES] },
  }).lean();
  const map = Object.fromEntries(
    AUSBILDUNG_EVENT_TYPES.map((k) => [k, 0])
  ) as Record<AusbildungEventType, number>;
  for (const d of docs as { key: string; count?: number }[]) {
    if ((AUSBILDUNG_EVENT_TYPES as readonly string[]).includes(d.key)) {
      map[d.key as AusbildungEventType] = Number(d.count ?? 0);
    }
  }
  return map;
}
