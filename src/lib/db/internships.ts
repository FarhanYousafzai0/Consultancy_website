import { connectMongo } from "./connect";
import { internshipInputSchema, internshipUpdateSchema } from "./internship-schema";
import { InternshipModel } from "./internship-model";
import type {
  InternshipInput,
  InternshipPublicationStatus,
  InternshipRecord,
  InternshipResearchFailure,
  InternshipVerificationStatus,
} from "./types";

type InternshipDocumentLike = {
  _id: { toString(): string };
  title: string;
  slug: string;
  organizationName: string;
  organizationLogoUrl?: string | null;
  summary?: string;
  description?: string;
  countryCode?: string | null;
  city?: string | null;
  locationLabel?: string | null;
  workMode: InternshipRecord["workMode"];
  durationValue?: number | null;
  durationUnit: InternshipRecord["durationUnit"];
  startDate?: string | null;
  endDate?: string | null;
  durationText?: string | null;
  deadline?: string | null;
  deadlineStatus: InternshipRecord["deadlineStatus"];
  eligibilityCriteria?: string[];
  eligibleNationalities?: string[];
  studyFields?: InternshipRecord["studyFields"];
  educationLevels?: InternshipRecord["educationLevels"];
  experienceRequirements?: string | null;
  fundingStatus: InternshipRecord["fundingStatus"];
  stipendSummary?: string | null;
  benefits?: string[];
  applicationUrl?: string | null;
  sourceUrl: string;
  sourceDomain: string;
  sourceOrganizationType: InternshipRecord["sourceOrganizationType"];
  canonicalIdentity: string;
  lastVerifiedAt?: string | null;
  lastCheckedAt?: string | null;
  lastSuccessfulFetchAt?: string | null;
  sourceContentHash?: string | null;
  verificationStatus: InternshipVerificationStatus;
  publicationStatus: InternshipPublicationStatus;
  researchProvider?: InternshipRecord["researchProvider"];
  researchModel?: string | null;
  researchError?: string | null;
  evidence?: InternshipRecord["evidence"];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

function sourceDomainFromUrl(sourceUrl: string) {
  return new URL(sourceUrl).hostname.toLowerCase();
}

function canonicalIdentityFor(input: Pick<InternshipInput, "slug" | "sourceUrl"> & { canonicalIdentity?: string }) {
  return input.canonicalIdentity || `${sourceDomainFromUrl(input.sourceUrl)}:${input.slug}`;
}

export function docToInternshipRecord(doc: InternshipDocumentLike): InternshipRecord {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    organizationName: doc.organizationName,
    organizationLogoUrl: doc.organizationLogoUrl ?? null,
    summary: doc.summary ?? "",
    description: doc.description ?? "",
    countryCode: doc.countryCode ?? null,
    city: doc.city ?? null,
    locationLabel: doc.locationLabel ?? null,
    workMode: doc.workMode ?? "unknown",
    durationValue: doc.durationValue ?? null,
    durationUnit: doc.durationUnit ?? "unknown",
    startDate: doc.startDate ?? null,
    endDate: doc.endDate ?? null,
    durationText: doc.durationText ?? null,
    deadline: doc.deadline ?? null,
    deadlineStatus: doc.deadlineStatus ?? "not_published",
    eligibilityCriteria: doc.eligibilityCriteria ?? [],
    eligibleNationalities: doc.eligibleNationalities ?? [],
    studyFields: doc.studyFields ?? [],
    educationLevels: doc.educationLevels ?? ["unknown"],
    experienceRequirements: doc.experienceRequirements ?? null,
    fundingStatus: doc.fundingStatus ?? "unknown",
    stipendSummary: doc.stipendSummary ?? null,
    benefits: doc.benefits ?? [],
    applicationUrl: doc.applicationUrl ?? null,
    sourceUrl: doc.sourceUrl,
    sourceDomain: doc.sourceDomain || sourceDomainFromUrl(doc.sourceUrl),
    sourceOrganizationType: doc.sourceOrganizationType ?? "unknown",
    canonicalIdentity: doc.canonicalIdentity,
    lastVerifiedAt: doc.lastVerifiedAt ?? null,
    lastCheckedAt: doc.lastCheckedAt ?? null,
    lastSuccessfulFetchAt: doc.lastSuccessfulFetchAt ?? null,
    sourceContentHash: doc.sourceContentHash ?? null,
    verificationStatus: doc.verificationStatus ?? "needs_review",
    publicationStatus: doc.publicationStatus ?? "draft",
    researchProvider: doc.researchProvider ?? null,
    researchModel: doc.researchModel ?? null,
    researchError: doc.researchError ?? null,
    evidence: doc.evidence ?? [],
    notes: doc.notes ?? "",
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function listInternships(options?: {
  publicationStatus?: InternshipPublicationStatus | "all";
  verificationStatus?: InternshipVerificationStatus;
  sourceDomain?: string;
  limit?: number;
}): Promise<InternshipRecord[]> {
  await connectMongo();
  const query: Record<string, unknown> = {};
  if (options?.publicationStatus && options.publicationStatus !== "all") {
    query.publicationStatus = options.publicationStatus;
  }
  if (options?.verificationStatus) query.verificationStatus = options.verificationStatus;
  if (options?.sourceDomain) query.sourceDomain = options.sourceDomain.toLowerCase();

  let request = InternshipModel.find(query).sort({ updatedAt: -1 });
  if (options?.limit !== undefined) request = request.limit(Math.max(0, options.limit));
  const docs = await request.lean();
  return docs.map((doc) => docToInternshipRecord(doc as never));
}

export async function getInternship(id: string): Promise<InternshipRecord | null> {
  await connectMongo();
  const doc = await InternshipModel.findById(id).lean();
  return doc ? docToInternshipRecord(doc as never) : null;
}

export async function listInternshipAdminRecords() {
  return listInternships({ publicationStatus: "all", limit: 500 });
}

export async function getInternshipBySlug(slug: string): Promise<InternshipRecord | null> {
  await connectMongo();
  const doc = await InternshipModel.findOne({ slug }).lean();
  return doc ? docToInternshipRecord(doc as never) : null;
}

export async function createInternship(input: InternshipInput): Promise<InternshipRecord> {
  await connectMongo();
  const sourceDomain = input.sourceDomain || sourceDomainFromUrl(input.sourceUrl);
  const parsed = internshipInputSchema.parse({
    ...input,
    sourceDomain,
    canonicalIdentity: canonicalIdentityFor(input),
  });
  const doc = await InternshipModel.create(parsed);
  return docToInternshipRecord(doc.toObject() as never);
}

export async function updateInternship(
  id: string,
  input: Partial<InternshipInput>
): Promise<InternshipRecord | null> {
  await connectMongo();
  const parsed = internshipUpdateSchema.parse(input);
  const doc = await InternshipModel.findByIdAndUpdate(
    id,
    { $set: parsed },
    { new: true, runValidators: true }
  ).lean();
  return doc ? docToInternshipRecord(doc as never) : null;
}

export async function deleteInternship(id: string): Promise<boolean> {
  await connectMongo();
  return Boolean(await InternshipModel.findByIdAndDelete(id));
}

export async function upsertInternshipFromResearch(input: InternshipInput): Promise<InternshipRecord>;
export async function upsertInternshipFromResearch(
  input: InternshipResearchFailure
): Promise<InternshipRecord | null>;
export async function upsertInternshipFromResearch(
  input: InternshipInput | InternshipResearchFailure
): Promise<InternshipRecord | null> {
  await connectMongo();

  if ("researchError" in input && !("title" in input)) {
    const doc = await InternshipModel.findOneAndUpdate(
      { canonicalIdentity: input.canonicalIdentity },
      {
        $set: {
          lastCheckedAt: input.lastCheckedAt ?? new Date().toISOString(),
          researchError: input.researchError,
        },
      },
      { returnDocument: "after", runValidators: true }
    ).lean();
    return doc ? docToInternshipRecord(doc as never) : null;
  }

  const successInput = input as InternshipInput;
  const sourceDomain = successInput.sourceDomain || sourceDomainFromUrl(successInput.sourceUrl);
  const parsed = internshipInputSchema.parse({
    ...successInput,
    sourceDomain,
    canonicalIdentity: canonicalIdentityFor(successInput),
    lastCheckedAt: successInput.lastCheckedAt ?? new Date().toISOString(),
    lastSuccessfulFetchAt:
      successInput.lastSuccessfulFetchAt ?? new Date().toISOString(),
    researchError: null,
    publicationStatus: "draft",
  });
  // Existing drafts may also contain editor decisions; there is no edit marker.
  // The unique identity index arbitrates concurrent inserts without a read/write race.
  try {
    const doc = await InternshipModel.create(parsed);
    return docToInternshipRecord(doc.toObject() as never);
  } catch (error) {
    if (typeof error !== "object" || error === null || !("code" in error) || error.code !== 11000) throw error;
    const existing = await InternshipModel.findOne({ canonicalIdentity: parsed.canonicalIdentity }).lean();
    if (!existing) throw error; // A different record may own the slug.
    return docToInternshipRecord(existing as never);
  }
}

export async function hasInternshipContentHash(hash: string) {
  await connectMongo();
  return Boolean(await InternshipModel.exists({ sourceContentHash: hash }));
}

export async function markInternshipExpired(id: string) {
  await connectMongo();
  const doc = await InternshipModel.findByIdAndUpdate(
    id,
    { $set: { publicationStatus: "expired" } },
    { new: true, runValidators: true }
  ).lean();
  return doc ? docToInternshipRecord(doc as never) : null;
}

/** Keep the last verified payload, but make source failures visible for review. */
export async function markInternshipsSourceFailure(sourceDomains: string | readonly string[], researchError: string) {
  await connectMongo();
  return InternshipModel.updateMany(
    { sourceDomain: { $in: (Array.isArray(sourceDomains) ? sourceDomains : [sourceDomains]).map((domain) => domain.toLowerCase()) } },
    {
      $set: {
        lastCheckedAt: new Date().toISOString(),
        researchError,
      },
    }
  );
}

/** Expire only records from a successfully re-read source that were not seen in the new content. */
export async function retireStaleResearchInternships(sourceDomains: string | readonly string[], contentHash: string) {
  await connectMongo();
  const result = await InternshipModel.updateMany(
    {
      sourceDomain: { $in: (Array.isArray(sourceDomains) ? sourceDomains : [sourceDomains]).map((domain) => domain.toLowerCase()) },
      sourceContentHash: { $ne: contentHash },
      publicationStatus: { $in: ["published", "draft"] },
    },
    { $set: { publicationStatus: "expired", verificationStatus: "needs_review" } }
  );
  return result.modifiedCount;
}
