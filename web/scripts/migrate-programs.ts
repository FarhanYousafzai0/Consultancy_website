/**
 * One-shot: import seed programs + optional programs.json into MongoDB.
 * Usage: npm run db:migrate
 */
import { readFile } from "node:fs/promises";
import { seedPrograms } from "../src/data/seed-programs";
import { connectMongo } from "../src/lib/db/connect";
import { importProgramInputs } from "../src/lib/db/programs";
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
  const combined = [...seedPrograms, ...fromFile];
  const inserted = await importProgramInputs(combined);
  console.info(
    `[migrate] Done. Inserted ${inserted} new program(s) (${combined.length} candidates).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("[migrate] Failed:", error);
  process.exit(1);
});
