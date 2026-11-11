import { randomBytes } from "node:crypto";
import { connectMongo } from "./connect";
import {
  ConsultationModel,
  type ConsultationDocument,
  type ConsultationStatus,
} from "./consultation-model";
import type { ConsultationInput } from "@/lib/consultation/schema";

export type ConsultationRecord = {
  id: string;
  reference: string;
  status: ConsultationStatus;
  fullName: string;
  email: string;
  phone: string;
  degreeLevel: string;
  intake: string;
  userId: string | null;
  answers: ConsultationInput;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

function toRecord(doc: ConsultationDocument): ConsultationRecord {
  return {
    id: doc._id.toString(),
    reference: doc.reference,
    status: doc.status,
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    degreeLevel: doc.degreeLevel,
    intake: doc.intake,
    userId: doc.userId ?? null,
    answers: doc.answers as ConsultationInput,
    adminNotes: doc.adminNotes ?? "",
    createdAt: new Date(doc.createdAt ?? Date.now()).toISOString(),
    updatedAt: new Date(doc.updatedAt ?? Date.now()).toISOString(),
  };
}

/** Short, human-readable reference students can quote on WhatsApp, e.g. PZ-7K3F9Q. */
function makeReference() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `PZ-${out}`;
}

export async function createConsultation(input: {
  answers: ConsultationInput;
  userId: string | null;
  userAgent: string;
}): Promise<ConsultationRecord> {
  await connectMongo();
  const { answers } = input;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const doc = await ConsultationModel.create({
        reference: makeReference(),
        fullName: answers.fullName,
        email: answers.email.toLowerCase(),
        phone: answers.phone,
        degreeLevel: answers.degreeLevel,
        intake: answers.intake,
        userId: input.userId,
        answers,
        userAgent: input.userAgent.slice(0, 300),
      });
      return toRecord(doc.toObject() as ConsultationDocument);
    } catch (error) {
      const dup = (error as { code?: number }).code === 11000;
      if (!dup || attempt === 2) throw error;
    }
  }
  throw new Error("Could not create consultation");
}

/** Same email within the last 10 minutes — treat as a double submit. */
export async function findRecentByEmail(email: string) {
  await connectMongo();
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const doc = await ConsultationModel.findOne({
    email: email.toLowerCase(),
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .lean<ConsultationDocument>();
  return doc ? toRecord(doc) : null;
}

export async function listConsultations(status?: ConsultationStatus) {
  await connectMongo();
  const docs = await ConsultationModel.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .limit(300)
    .lean<ConsultationDocument[]>();
  return docs.map(toRecord);
}

export async function getConsultation(id: string) {
  await connectMongo();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const doc = await ConsultationModel.findById(id).lean<ConsultationDocument>();
  return doc ? toRecord(doc) : null;
}

export async function updateConsultation(
  id: string,
  patch: { status?: ConsultationStatus; adminNotes?: string }
) {
  await connectMongo();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const doc = await ConsultationModel.findByIdAndUpdate(
    id,
    { $set: patch },
    { new: true }
  ).lean<ConsultationDocument>();
  return doc ? toRecord(doc) : null;
}
