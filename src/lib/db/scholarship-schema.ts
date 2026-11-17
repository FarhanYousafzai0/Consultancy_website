import { z } from "zod";

const cycleSchema = z.object({
  openAt: z.string().nullable(),
  closeAt: z.string().nullable(),
  status: z.enum(["confirmed", "predicted"]),
});

export const scholarshipInputSchema = z.object({
  name: z.string().min(2),
  provider: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase-kebab"),
  levels: z.array(z.enum(["bachelor", "master", "phd"])).min(1),
  nationalities: z.array(z.string().min(2)).min(1),
  studyCountries: z.array(z.string().min(2)).default([]),
  fields: z
    .array(
      z.enum([
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
      ])
    )
    .min(1),
  minGermanGrade: z.number().min(1).max(4).nullable(),
  workExperienceYears: z.number().min(0).max(20),
  maxYearsSinceDegree: z.number().min(0).max(30).nullable(),
  ageLimit: z.number().min(16).max(80).nullable(),
  mustBeEnrolled: z.boolean(),
  amountSummary: z.string().min(1),
  coverage: z.string().min(1),
  fundingType: z
    .enum(["fully_funded", "partially_funded", "tuition_only", "stipend", "unknown"])
    .default("unknown"),
  languageRequirements: z.array(z.string()).default([]),
  cycles: z.array(cycleSchema),
  nextCycleStatus: z.enum(["confirmed", "predicted", "unknown"]),
  sourceUrl: z.string().url(),
  applicationUrl: z.string().url().optional(),
  sourceDomain: z.string().optional(),
  lastVerifiedAt: z.string().nullable(),
  lastCheckedAt: z.string().nullable().optional(),
  lastSuccessfulFetchAt: z.string().nullable().optional(),
  sourceContentHash: z.string().nullable().optional(),
  researchProvider: z.enum(["google", "openai"]).nullable().optional(),
  researchModel: z.string().nullable().optional(),
  researchError: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]),
  notes: z.string(),
});

export type ScholarshipInputParsed = z.infer<typeof scholarshipInputSchema>;
