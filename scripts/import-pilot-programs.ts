/**
 * Import the 50-programme pilot batch into MongoDB.
 * Skips rows that already exist (same university + name).
 *
 * Usage: npx tsx --env-file=.env.local scripts/import-pilot-programs.ts
 */
import { pilotPrograms } from "../src/data/pilot-programs";
import { connectMongo } from "../src/lib/db/connect";
import { importProgramInputs } from "../src/lib/db/programs";

async function main() {
  await connectMongo();
  const inserted = await importProgramInputs(pilotPrograms);
  console.info(
    `[pilot] Inserted ${inserted} of ${pilotPrograms.length} pilot programmes (rest already present).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("[pilot] Failed:", error);
  process.exit(1);
});
