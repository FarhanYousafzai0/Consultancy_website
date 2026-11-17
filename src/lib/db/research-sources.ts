import { connectMongo } from "./connect";
import { ResearchSourceModel } from "./research-source-model";

export async function getResearchSourceState(sourceId: string) {
  await connectMongo();
  return ResearchSourceModel.findOne({ sourceId }).lean();
}

export async function updateResearchSourceState(
  sourceId: string,
  update: {
    etag?: string | null;
    lastModified?: string | null;
    contentHash?: string | null;
    lastCheckedAt?: Date;
    lastSuccessfulFetchAt?: Date | null;
    lastError?: string | null;
  }
) {
  await connectMongo();
  return ResearchSourceModel.findOneAndUpdate(
    { sourceId },
    { $set: { sourceId, ...update } },
    { upsert: true, new: true }
  );
}
