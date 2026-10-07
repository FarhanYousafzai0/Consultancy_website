/**
 * Import scale programme batches into MongoDB.
 * Skips rows that already exist (same university + name).
 *
 * Usage: npm run db:import-scale
 */
import { scalePrograms } from "../src/data/scale-programs";
import { scaleProgramsB } from "../src/data/scale-programs-b";
import { connectMongo } from "../src/lib/db/connect";
import { importProgramInputs } from "../src/lib/db/programs";

async function main() {
  await connectMongo();
  const batch = [...scalePrograms, ...scaleProgramsB];
  const inserted = await importProgramInputs(batch);
  console.info(
    `[scale] Inserted ${inserted} of ${batch.length} scale programmes (rest already present).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("[scale] Failed:", error);
  process.exit(1);
});
