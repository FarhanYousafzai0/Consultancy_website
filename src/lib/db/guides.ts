import { seedGuides } from "@/data/seed-guides";
import { connectMongo } from "./connect";
import { GuideModel } from "./guide-model";
import type { GuideInput, GuideRecord, ProgramStatus } from "./types";

function docToRecord(doc: {
  _id: { toString(): string };
  title: string;
  slug: string;
  topic: GuideRecord["topic"];
  body: string;
  sourceUrl: string;
  lastVerifiedAt?: string | null;
  status: ProgramStatus;
  createdAt?: Date;
  updatedAt?: Date;
}): GuideRecord {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    topic: doc.topic,
    body: doc.body,
    sourceUrl: doc.sourceUrl,
    lastVerifiedAt: doc.lastVerifiedAt ?? null,
    status: doc.status,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function listGuides(options?: {
  status?: ProgramStatus | "all";
  topic?: GuideRecord["topic"];
}): Promise<GuideRecord[]> {
  await connectMongo();
  const query: Record<string, unknown> = {};
  const status = options?.status ?? "published";
  if (status !== "all") query.status = status;
  if (options?.topic) query.topic = options.topic;
  const docs = await GuideModel.find(query).sort({ title: 1 }).lean();
  return docs.map((doc) => docToRecord(doc as never));
}

export async function getGuide(id: string): Promise<GuideRecord | null> {
  await connectMongo();
  const doc = await GuideModel.findById(id).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function getGuideBySlug(
  slug: string
): Promise<GuideRecord | null> {
  await connectMongo();
  const doc = await GuideModel.findOne({ slug }).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function createGuide(input: GuideInput): Promise<GuideRecord> {
  await connectMongo();
  const doc = await GuideModel.create(input);
  return docToRecord(doc.toObject() as never);
}

export async function updateGuide(
  id: string,
  input: Partial<GuideInput>
): Promise<GuideRecord | null> {
  await connectMongo();
  const doc = await GuideModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true }
  ).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function deleteGuide(id: string): Promise<boolean> {
  await connectMongo();
  const res = await GuideModel.findByIdAndDelete(id);
  return Boolean(res);
}

/** Keyword / text search for advisor retrieval. */
export async function searchGuides(
  query: string,
  limit = 5
): Promise<GuideRecord[]> {
  await connectMongo();
  const q = query.trim();
  if (!q) return listGuides({ status: "published" }).then((g) => g.slice(0, limit));

  try {
    const textDocs = await GuideModel.find(
      { $text: { $search: q }, status: "published" },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();
    if (textDocs.length > 0) {
      return textDocs.map((doc) => docToRecord(doc as never));
    }
  } catch {
    // text index may not exist yet — fall through to regex
  }

  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 6);
  const regex =
    tokens.length > 0
      ? new RegExp(tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i")
      : new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const docs = await GuideModel.find({
    status: "published",
    $or: [{ title: regex }, { body: regex }, { topic: regex }],
  })
    .limit(limit)
    .lean();
  return docs.map((doc) => docToRecord(doc as never));
}

export async function ensureGuidesSeeded(): Promise<void> {
  await connectMongo();
  const count = await GuideModel.countDocuments();
  if (count > 0) return;
  await GuideModel.insertMany(seedGuides);
  console.info(`[db] Seeded ${seedGuides.length} guides`);
}
