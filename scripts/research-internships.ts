import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { internshipSources } from "../src/data/internship-sources";
import { researchInternshipSource } from "../src/lib/internships/research";
import { finishResearchRun, startResearchRun } from "../src/lib/db/research-runs";
import { updateResearchSourceState } from "../src/lib/db/research-sources";
import { listInternships } from "../src/lib/db/internships";

export type InternshipResearchArgs = {
  dryRun: boolean;
  force: boolean;
  selection?: string[];
  concurrency: number;
};

export type InternshipResearchMetrics = {
  succeeded: number;
  failed: number;
  google: number;
  openai: number;
  extracted: number;
  records: number;
  needsReview: number;
  active: number;
  skipped: number;
  errors: string[];
};

type InternshipResearchEnv = {
  CRON_SECRET?: string;
  MONGODB_URI?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  AI_RESEARCH_PROVIDER?: string;
};

function valueForArg(argv: readonly string[], name: string) {
  const prefix = `--${name}=`;
  return argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

export function parseInternshipResearchArgs(argv: readonly string[] = process.argv.slice(2)): InternshipResearchArgs {
  const rawSelection = valueForArg(argv, "sources");
  const selection = rawSelection
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const parsedConcurrency = Number(valueForArg(argv, "concurrency"));

  return {
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    selection: selection?.length ? selection : undefined,
    concurrency: Math.max(1, Math.min(8, Number.isFinite(parsedConcurrency) && parsedConcurrency > 0 ? Math.floor(parsedConcurrency) : 4)),
  };
}

export function validateInternshipResearchEnvironment(args: Pick<InternshipResearchArgs, "dryRun">, env: InternshipResearchEnv = process.env as unknown as InternshipResearchEnv) {
  const missing: string[] = [];
  if (!env.CRON_SECRET?.trim()) missing.push("CRON_SECRET");
  if (!args.dryRun && !env.MONGODB_URI?.trim()) missing.push("MONGODB_URI");

  const provider = env.AI_RESEARCH_PROVIDER?.trim().toLowerCase() === "openai" ? "openai" : "google";
  const hasGoogle = Boolean(env.GEMINI_API_KEY?.trim());
  const hasOpenAi = Boolean(env.OPENAI_API_KEY?.trim());
  if (!hasGoogle && !hasOpenAi) missing.push(`${provider === "google" ? "GEMINI_API_KEY" : "OPENAI_API_KEY"} (or fallback provider key)`);

  return [...new Set(missing)];
}

export function createInternshipResearchMetrics(): InternshipResearchMetrics {
  return { succeeded: 0, failed: 0, google: 0, openai: 0, extracted: 0, records: 0, needsReview: 0, active: 0, skipped: 0, errors: [] };
}

export function formatInternshipResearchSummary(args: Pick<InternshipResearchArgs, "dryRun" | "concurrency">, sourceIds: readonly string[], metrics: InternshipResearchMetrics) {
  return { dryRun: args.dryRun, sources: sourceIds, concurrency: args.concurrency, ...metrics };
}

async function runInternshipResearch(args: InternshipResearchArgs) {
  const missing = validateInternshipResearchEnvironment(args);
  if (missing.length) throw new Error(`Missing required environment: ${missing.join(", ")}`);
  if (args.selection?.some((id) => !internshipSources.some((source) => source.id === id))) throw new Error("Unknown internship source ID");
  const sources = internshipSources.filter((source) => args.selection ? args.selection.includes(source.id) : source.id !== "iaeste-exchange-internships");
  if (!sources.length) throw new Error("No internship sources selected");
  console.info(`[internships] ${sources.length} sources, concurrency ${args.concurrency}${args.dryRun ? " (dry-run)" : ""}`);

  const run = args.dryRun ? null : await startResearchRun(sources.length);
  const metrics = createInternshipResearchMetrics();
  const pending = [...sources];
  await Promise.all(Array.from({ length: Math.min(args.concurrency, sources.length) }, async () => {
    for (let source = pending.shift(); source; source = pending.shift()) {
      try {
        const result = await researchInternshipSource({ source, dryRun: args.dryRun, force: args.force });
        metrics.succeeded++;
        metrics.extracted += result.extracted;
        metrics.records += result.upserted;
        metrics.needsReview += result.needsReview;
        if (result.skippedUnchanged) metrics.skipped++;
        if (result.provider) metrics[result.provider]++;
        if (result.failures.length) {
          metrics.failed++;
          metrics.errors.push(...result.failures.map((failure) => `${source.id}: ${failure}`));
          console.warn(`[internships] ${source.id}: incomplete crawl: ${result.failures.join("; ")}`);
        }
        console.info(`[internships] ${source.id}: ${result.pages} pages, ${result.extracted} extracted, ${result.upserted} ${args.dryRun ? "validated" : "upserted"}, ${result.needsReview} needs review${result.skippedUnchanged ? ", unchanged" : ""}`);
      } catch (error) {
        metrics.failed++;
        const message = error instanceof Error ? error.message : "Unknown research failure";
        metrics.errors.push(`${source.id}: ${message}`);
        if (!args.dryRun) await updateResearchSourceState(source.id, { lastCheckedAt: new Date(), lastError: message.slice(0, 2000) });
        console.error(`[internships] ${source.id}: ${message}`);
      }
    }
  }));

  if (!args.dryRun) {
    const records = await listInternships({ publicationStatus: "all" });
    metrics.active = records.filter((record) => record.publicationStatus === "published").length;
    console.info("[internships] records " + JSON.stringify({ total: records.length, published: metrics.active, expired: records.filter((record) => record.publicationStatus === "expired").length }));
  }
  if (run) await finishResearchRun(run._id.toString(), { status: metrics.failed ? "failed" : "completed", succeeded: metrics.succeeded, failed: metrics.failed, google: metrics.google, openai: metrics.openai, records: metrics.records, active: metrics.active, error: metrics.errors.length ? metrics.errors.join("; ").slice(0, 2000) : null });
  console.info("[internships] summary " + JSON.stringify(formatInternshipResearchSummary(args, sources.map((source) => source.id), metrics)));
  if (metrics.failed || metrics.succeeded === 0) process.exitCode = 1;
  return metrics;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  void runInternshipResearch(parseInternshipResearchArgs()).catch((error) => { console.error(error instanceof Error ? error.message : "Internship research failed"); process.exitCode = 1; }).finally(() => mongoose.disconnect());
}
