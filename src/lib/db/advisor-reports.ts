import { connectMongo } from "./connect";
import { AdvisorReportModel } from "./advisor-report-model";
import type { AdvisorReportRecord, AnalysisType } from "./types";

function docToRecord(doc: {
  _id: { toString(): string };
  userId: string;
  type: AnalysisType;
  inputSummary?: string;
  result: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}): AdvisorReportRecord {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    type: doc.type,
    inputSummary: doc.inputSummary ?? "",
    result: doc.result ?? {},
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function createAdvisorReport(input: {
  userId: string;
  type: AnalysisType;
  inputSummary: string;
  result: Record<string, unknown>;
}): Promise<AdvisorReportRecord> {
  await connectMongo();
  const doc = await AdvisorReportModel.create(input);
  return docToRecord(doc.toObject() as never);
}

export async function listAdvisorReports(
  userId: string,
  limit = 20
): Promise<AdvisorReportRecord[]> {
  await connectMongo();
  const docs = await AdvisorReportModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) => docToRecord(d as never));
}

export async function getAdvisorReport(
  id: string,
  userId?: string
): Promise<AdvisorReportRecord | null> {
  await connectMongo();
  const doc = await AdvisorReportModel.findOne(
    userId ? { _id: id, userId } : { _id: id }
  ).lean();
  return doc ? docToRecord(doc as never) : null;
}
