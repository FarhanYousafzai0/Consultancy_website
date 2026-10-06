import { z } from "zod";
import { programInputSchema } from "@/lib/db/program-schema";
import type { ProgramInput } from "@/lib/db/types";

/** Minimal CSV / JSON row used for bulk draft import. */
export const programImportRowSchema = z.object({
  name: z.string().min(2),
  university: z.string().min(2),
  universityType: z.enum(["public", "private"]).default("public"),
  degreeLevel: z.enum(["bachelor", "master"]).default("master"),
  field: z
    .enum([
      "computer_science",
      "engineering",
      "data",
      "business",
      "natural_sciences",
      "health",
      "social_sciences",
      "arts",
      "other",
    ])
    .default("computer_science"),
  city: z.string().min(1),
  state: z.string().min(1).default("Germany"),
  languageOfInstruction: z
    .enum(["english", "german", "both"])
    .default("english"),
  ieltsMin: z.number().min(0).max(9).nullable().optional(),
  toeflMin: z.number().min(0).max(120).nullable().optional(),
  germanRequired: z
    .enum(["none", "a1", "a2", "b1", "b2", "c1"])
    .default("none"),
  applicationRoute: z
    .enum(["direct", "uni_assist", "vpd"])
    .default("uni_assist"),
  tuitionPerSemesterEur: z.number().min(0).default(0),
  semesterFeeEur: z.number().min(0).default(300),
  typicalGermanGradeMax: z.number().min(1).max(4).nullable().optional(),
  sourceUrl: z.string().url(),
  notes: z.string().optional().default(""),
});

export type ProgramImportRow = z.infer<typeof programImportRowSchema>;

export function rowToDraftProgram(row: ProgramImportRow): ProgramInput {
  const input: ProgramInput = {
    name: row.name.trim(),
    university: row.university.trim(),
    universityType: row.universityType,
    degreeLevel: row.degreeLevel,
    field: row.field,
    city: row.city.trim(),
    state: row.state.trim(),
    languageOfInstruction: row.languageOfInstruction,
    ieltsMin: row.ieltsMin ?? null,
    toeflMin: row.toeflMin ?? null,
    germanRequired: row.germanRequired,
    applicationRoute: row.applicationRoute,
    tuitionPerSemesterEur: row.tuitionPerSemesterEur,
    semesterFeeEur: row.semesterFeeEur,
    typicalGermanGradeMax: row.typicalGermanGradeMax ?? null,
    intakes: [],
    requiredDocuments: [],
    sourceUrl: row.sourceUrl.trim(),
    lastVerifiedAt: null,
    status: "draft",
    notes: row.notes?.trim() || "Imported — verify source before publishing.",
  };
  return programInputSchema.parse(input);
}

/** Parse JSON array of import rows. */
export function parseProgramImportJson(raw: string): {
  programs: ProgramInput[];
  errors: string[];
} {
  const errors: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { programs: [], errors: ["Invalid JSON."] };
  }
  if (!Array.isArray(data)) {
    return { programs: [], errors: ["JSON must be an array of program objects."] };
  }
  const programs: ProgramInput[] = [];
  data.forEach((row, i) => {
    const parsed = programImportRowSchema.safeParse(row);
    if (!parsed.success) {
      errors.push(
        `Row ${i + 1}: ${parsed.error.issues[0]?.message ?? "invalid"}`
      );
      return;
    }
    try {
      programs.push(rowToDraftProgram(parsed.data));
    } catch (e) {
      errors.push(
        `Row ${i + 1}: ${e instanceof Error ? e.message : "failed validation"}`
      );
    }
  });
  return { programs, errors };
}

/**
 * Simple CSV: header row required.
 * Columns: name,university,universityType,degreeLevel,field,city,state,sourceUrl,...
 */
export function parseProgramImportCsv(raw: string): {
  programs: ProgramInput[];
  errors: string[];
} {
  const errors: string[] = [];
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return { programs: [], errors: ["CSV needs a header and at least one row."] };
  }
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const programs: ProgramInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      const v = cols[idx]?.trim() ?? "";
      if (v === "") return;
      if (
        [
          "ieltsMin",
          "toeflMin",
          "tuitionPerSemesterEur",
          "semesterFeeEur",
          "typicalGermanGradeMax",
        ].includes(h)
      ) {
        obj[h] = Number(v);
      } else {
        obj[h] = v;
      }
    });
    const parsed = programImportRowSchema.safeParse(obj);
    if (!parsed.success) {
      errors.push(
        `Row ${i + 1}: ${parsed.error.issues[0]?.message ?? "invalid"}`
      );
      continue;
    }
    try {
      programs.push(rowToDraftProgram(parsed.data));
    } catch (e) {
      errors.push(
        `Row ${i + 1}: ${e instanceof Error ? e.message : "failed validation"}`
      );
    }
  }
  return { programs, errors };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export const PROGRAM_IMPORT_TEMPLATE = `[
  {
    "name": "M.Sc. Computer Science",
    "university": "Example Technical University",
    "universityType": "public",
    "degreeLevel": "master",
    "field": "computer_science",
    "city": "Munich",
    "state": "Bavaria",
    "languageOfInstruction": "english",
    "ieltsMin": 6.5,
    "toeflMin": null,
    "germanRequired": "none",
    "applicationRoute": "uni_assist",
    "tuitionPerSemesterEur": 0,
    "semesterFeeEur": 150,
    "typicalGermanGradeMax": 2.5,
    "sourceUrl": "https://www.example-university.de/msc-cs",
    "notes": "Verify before publish"
  }
]
`;
