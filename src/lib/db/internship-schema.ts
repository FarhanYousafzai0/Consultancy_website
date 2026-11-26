import { z } from "zod";

const urlOrNull = z.string().url().nullable();
const dateOrNull = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "must be a valid date")
  .nullable();

const programFields = [
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
] as const;

const evidenceSchema = z.object({
  field: z.string().min(1),
  quote: z.string().min(1),
  sourceUrl: z.string().url(),
  capturedAt: z.string().refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "must be a valid date"
  ),
});

export const internshipInputSchema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase-kebab"),
  organizationName: z.string().min(2),
  organizationLogoUrl: urlOrNull,
  summary: z.string(),
  description: z.string(),
  countryCode: z.string().min(2).max(3).nullable(),
  city: z.string().min(1).nullable(),
  locationLabel: z.string().min(1).nullable(),
  workMode: z.enum(["remote", "hybrid", "on_site", "unknown"]),
  durationValue: z.number().positive().nullable(),
  durationUnit: z.enum(["weeks", "months", "year", "unknown"]),
  startDate: dateOrNull,
  endDate: dateOrNull,
  durationText: z.string().min(1).nullable(),
  deadline: dateOrNull,
  deadlineStatus: z.enum([
    "confirmed",
    "rolling",
    "not_published",
    "ambiguous",
  ]),
  eligibilityCriteria: z.array(z.string().min(1)),
  eligibleNationalities: z.array(z.string().min(1)),
  studyFields: z.array(z.enum(programFields)),
  educationLevels: z.array(
    z.enum([
      "high_school",
      "undergraduate",
      "graduate",
      "phd",
      "postdoctoral",
      "professional",
      "other",
      "unknown",
    ])
  ),
  experienceRequirements: z.string().min(1).nullable(),
  fundingStatus: z.enum([
    "paid",
    "unpaid",
    "fully_funded",
    "partially_funded",
    "unknown",
  ]),
  stipendSummary: z.string().min(1).nullable(),
  benefits: z.array(z.string().min(1)),
  applicationUrl: urlOrNull,
  sourceUrl: z.string().url(),
  sourceDomain: z.string().min(1).optional(),
  sourceOrganizationType: z.enum([
    "government",
    "international_organization",
    "university",
    "research_institute",
    "company",
    "exchange_program",
    "other",
    "unknown",
  ]),
  canonicalIdentity: z.string().min(1).optional(),
  lastVerifiedAt: dateOrNull,
  lastCheckedAt: dateOrNull.optional(),
  lastSuccessfulFetchAt: dateOrNull.optional(),
  sourceContentHash: z.string().min(1).nullable().optional(),
  verificationStatus: z.enum(["verified", "needs_review", "rejected"]),
  publicationStatus: z.enum(["draft", "published", "expired", "archived"]),
  researchProvider: z.enum(["google", "openai"]).nullable().optional(),
  researchModel: z.string().min(1).nullable().optional(),
  researchError: z.string().min(1).nullable().optional(),
  evidence: z.array(evidenceSchema),
  notes: z.string(),
});

export const internshipUpdateSchema = internshipInputSchema.partial();

export type InternshipInputParsed = z.infer<typeof internshipInputSchema>;
export type InternshipUpdateParsed = z.infer<typeof internshipUpdateSchema>;
