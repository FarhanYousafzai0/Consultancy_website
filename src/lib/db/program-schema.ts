import { z } from "zod";

export const programInputSchema = z.object({
  name: z.string().min(2),
  university: z.string().min(2),
  universityType: z.enum(["public", "private"]),
  degreeLevel: z.enum(["bachelor", "master"]),
  field: z.enum([
    "computer_science",
    "engineering",
    "data",
    "business",
    "economics",
    "natural_sciences",
    "health",
    "social_sciences",
    "arts",
    "other",
  ]),
  city: z.string().min(1),
  state: z.string().min(1),
  languageOfInstruction: z.enum(["english", "german", "both"]),
  ieltsMin: z.number().min(0).max(9).nullable(),
  toeflMin: z.number().min(0).max(120).nullable(),
  germanRequired: z.enum(["none", "a1", "a2", "b1", "b2", "c1"]),
  applicationRoute: z.enum(["direct", "uni_assist", "vpd"]),
  tuitionPerSemesterEur: z.number().min(0),
  semesterFeeEur: z.number().min(0),
  typicalGermanGradeMax: z.number().min(1).max(4).nullable(),
  intakes: z
    .array(
      z.object({
        semester: z.enum(["winter", "summer"]),
        year: z.number().int().min(2024).max(2040),
        deadlineNonEu: z.string().nullable(),
        status: z.enum(["confirmed", "predicted"]),
      })
    )
    .default([]),
  requiredDocuments: z.array(z.string()).default([]),
  sourceUrl: z.string().url(),
  lastVerifiedAt: z.string().nullable(),
  status: z.enum(["draft", "published"]),
  notes: z.string().default(""),
});
