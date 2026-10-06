import { connectMongo } from "./connect";
import { LeadModel } from "./lead-model";
import type { LeadInput, LeadRecord, LeadStatus } from "./types";

function docToRecord(doc: {
  _id: { toString(): string };
  kind: LeadRecord["kind"];
  status: LeadStatus;
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  goal?: string | null;
  lastQuestion?: string | null;
  transcriptSnippet?: string;
  shortlistCount?: number;
  profileUrl?: string | null;
  whatsappOpenedAt?: string | null;
  notes?: string;
  creditAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}): LeadRecord {
  return {
    id: doc._id.toString(),
    kind: doc.kind,
    status: doc.status,
    userId: doc.userId ?? null,
    email: doc.email ?? null,
    name: doc.name ?? null,
    goal: doc.goal ?? null,
    lastQuestion: doc.lastQuestion ?? null,
    transcriptSnippet: doc.transcriptSnippet ?? "",
    shortlistCount: doc.shortlistCount ?? 0,
    profileUrl: doc.profileUrl ?? null,
    whatsappOpenedAt: doc.whatsappOpenedAt ?? null,
    notes: doc.notes ?? "",
    creditAmount: doc.creditAmount ?? 0,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function createLead(
  input: Omit<LeadInput, "status"> & { status?: LeadStatus }
): Promise<LeadRecord> {
  await connectMongo();
  const { creditAmount, status, ...rest } = input;
  const doc = await LeadModel.create({
    ...rest,
    status: status ?? "new",
    creditAmount: creditAmount ?? 0,
  });
  return docToRecord(doc.toObject() as never);
}

export async function listLeads(): Promise<LeadRecord[]> {
  await connectMongo();
  const docs = await LeadModel.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return docs.map((d) => docToRecord(d as never));
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<LeadRecord | null> {
  await connectMongo();
  const doc = await LeadModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  ).lean();
  return doc ? docToRecord(doc as never) : null;
}

export async function getLead(id: string): Promise<LeadRecord | null> {
  await connectMongo();
  const doc = await LeadModel.findById(id).lean();
  return doc ? docToRecord(doc as never) : null;
}
