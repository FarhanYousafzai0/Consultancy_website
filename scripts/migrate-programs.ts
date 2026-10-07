/**
 * One-shot: import seed programs + scholarships into MongoDB.
 * Usage: npm run db:migrate
 */
import { readFile } from "node:fs/promises";
import { pilotPrograms } from "../src/data/pilot-programs";
import { scalePrograms } from "../src/data/scale-programs";
import { scaleProgramsB } from "../src/data/scale-programs-b";
import { seedPrograms } from "../src/data/seed-programs";
import { seedScholarships } from "../src/data/seed-scholarships";
import { connectMongo } from "../src/lib/db/connect";
import { importProgramInputs } from "../src/lib/db/programs";
import { importScholarshipInputs } from "../src/lib/db/scholarships";
import type { ProgramInput, ProgramRecord } from "../src/lib/db/types";

async function loadFilePrograms(): Promise<ProgramInput[]> {
  const file =
    process.env.PROGRAMS_FILE?.trim() ||
    "D:\\dev-cache\\parwaz\\programs.json";
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as ProgramRecord[];
    return parsed.map((record) => {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = record;
      void _id;
      void _c;
      void _u;
      return rest;
    });
  } catch {
    console.info(`[migrate] No file at ${file} — using built-in seed only.`);
    return [];
  }
}

async function main() {
  await connectMongo();
  const fromFile = await loadFilePrograms();
  const combined = [
    ...seedPrograms,
    ...pilotPrograms,
    ...scalePrograms,
    ...scaleProgramsB,
    ...fromFile,
  ];
  const insertedPrograms = await importProgramInputs(combined);
  const insertedScholarships = await importScholarshipInputs(seedScholarships);
  console.info(
    `[migrate] Programs: inserted ${insertedPrograms} (${combined.length} candidates).`
  );
  console.info(
    `[migrate] Scholarships: inserted ${insertedScholarships} (${seedScholarships.length} candidates).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("[migrate] Failed:", error);
  process.exit(1);
});
