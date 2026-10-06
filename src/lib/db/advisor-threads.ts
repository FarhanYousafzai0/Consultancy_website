import { connectMongo } from "./connect";
import { AdvisorThreadModel } from "./advisor-thread-model";

export type AdvisorSource = {
  type: string;
  id: string;
  title: string;
  href: string;
  lastVerifiedAt?: string | null;
};

export type AdvisorMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  sources?: AdvisorSource[];
};

export type AdvisorThreadRecord = {
  id: string;
  userId: string | null;
  visitorId: string | null;
  messages: AdvisorMessage[];
  updatedAt: string;
};

function docToRecord(doc: {
  _id: { toString(): string };
  userId?: string | null;
  visitorId?: string | null;
  messages?: AdvisorMessage[];
  updatedAt?: Date;
}): AdvisorThreadRecord {
  return {
    id: doc._id.toString(),
    userId: doc.userId ?? null,
    visitorId: doc.visitorId ?? null,
    messages: (doc.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
      sources: m.sources ?? [],
    })),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function getOrCreateThread(options: {
  userId?: string | null;
  visitorId?: string | null;
  threadId?: string | null;
}): Promise<AdvisorThreadRecord> {
  await connectMongo();
  if (options.threadId) {
    const existing = await AdvisorThreadModel.findById(options.threadId).lean();
    if (existing) return docToRecord(existing as never);
  }
  if (options.userId) {
    const existing = await AdvisorThreadModel.findOne({
      userId: options.userId,
    })
      .sort({ updatedAt: -1 })
      .lean();
    if (existing) return docToRecord(existing as never);
  }
  const created = await AdvisorThreadModel.create({
    userId: options.userId ?? null,
    visitorId: options.visitorId ?? null,
    messages: [],
  });
  return docToRecord(created.toObject() as never);
}

export async function appendMessages(
  threadId: string,
  messages: AdvisorMessage[]
): Promise<AdvisorThreadRecord | null> {
  await connectMongo();
  const doc = await AdvisorThreadModel.findByIdAndUpdate(
    threadId,
    { $push: { messages: { $each: messages } } },
    { new: true }
  ).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function getThread(
  threadId: string
): Promise<AdvisorThreadRecord | null> {
  await connectMongo();
  const doc = await AdvisorThreadModel.findById(threadId).lean();
  return doc ? docToRecord(doc as never) : null;
}
