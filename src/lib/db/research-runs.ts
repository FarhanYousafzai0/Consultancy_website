import { connectMongo } from "./connect";
import { ResearchRunModel } from "./research-run-model";

export async function startResearchRun(sourceCount: number) {
  await connectMongo();
  return ResearchRunModel.create({
    startedAt: new Date(),
    status: "running",
    sourceCount,
  });
}

export async function finishResearchRun(
  id: string,
  result: {
    status: "completed" | "failed";
    succeeded: number;
    failed: number;
    google: number;
    openai: number;
    records?: number;
    active?: number;
    error?: string | null;
  }
) {
  await connectMongo();
  return ResearchRunModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...result,
        providerUsage: { google: result.google, openai: result.openai },
        completedAt: new Date(),
      },
    },
    { new: true }
  );
}
