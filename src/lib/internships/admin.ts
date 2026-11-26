import { validateInternshipDates, validateInternshipDeadline } from "./validation";
import { internshipSources, type InternshipSource } from "@/data/internship-sources";
import type {
  InternshipInput,
  InternshipPublicationStatus,
  InternshipRecord,
  InternshipVerificationStatus,
} from "@/lib/db/types";

export type InternshipAdminAction =
  | "verify"
  | "approve"
  | "reject"
  | "archive"
  | "expire"
  | "force-recheck";

export type InternshipAdminPatch = Partial<
  Pick<InternshipRecord, "verificationStatus" | "publicationStatus" | "researchError" | "lastVerifiedAt" | "notes">
>;

export function isAdminSession(session: { role?: string } | null | undefined) {
  return session?.role === "admin";
}

function hostMatchesDomain(hostname: string, domain: string) {
  const normalizedHost = hostname.toLowerCase().replace(/^www\./, "");
  const normalizedDomain = domain.toLowerCase().trim().replace(/^www\./, "");
  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

export function sourceForRecord(sourceUrl: string): InternshipSource | undefined {
  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return internshipSources.find((source) => [source.domain, ...(source.allowedDomains ?? [])]
      .some((domain) => hostMatchesDomain(url.hostname, domain)));
  } catch { return undefined; }
}

export const adminEditableFields = [
  "title", "organizationName", "organizationLogoUrl", "summary", "description", "countryCode", "city",
  "locationLabel", "workMode", "durationText", "startDate", "endDate", "deadline", "deadlineStatus",
  "eligibilityCriteria", "eligibleNationalities", "studyFields", "educationLevels", "experienceRequirements",
  "fundingStatus", "stipendSummary", "benefits", "applicationUrl", "notes",
] as const satisfies readonly (keyof InternshipInput)[];

export function getInternshipEditPatch(record: InternshipRecord, input: Partial<InternshipInput>): Partial<InternshipInput> {
  const patch: Partial<InternshipInput> = {};
  for (const field of adminEditableFields) {
    if (field in input) Object.assign(patch, { [field]: input[field] });
  }
  const material = adminEditableFields.some((field) => field !== "notes" && field in patch &&
    JSON.stringify(patch[field]) !== JSON.stringify(record[field]));
  if (material) {
    patch.verificationStatus = "needs_review";
    if (record.publicationStatus === "published") patch.publicationStatus = "draft";
  }
  return patch;
}

/** Only allow HTTPS application links on the source host or an explicitly curated host. */
export function isOfficialApplicationUrl(
  applicationUrl: string | null,
  sourceDomain: string,
  allowedDomains: readonly string[] = []
) {
  if (!applicationUrl) return false;
  try {
    const url = new URL(applicationUrl);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    return [sourceDomain, ...allowedDomains].some((domain) => hostMatchesDomain(url.hostname, domain));
  } catch {
    return false;
  }
}

export function getInternshipAdminPatch(
  record: InternshipRecord,
  action: InternshipAdminAction,
  allowedApplicationDomains: readonly string[] = [],
  review?: { note?: string; confirmed?: boolean; now?: string; reviewer?: string }
): { patch?: InternshipAdminPatch; error?: string } {
  void allowedApplicationDomains;
  const source = sourceForRecord(record.sourceUrl);
  const officialDomains = source ? [source.domain, ...(source.allowedDomains ?? []), ...(source.applicationDomains ?? [])] : [];
  const validLinks = source && isOfficialApplicationUrl(record.applicationUrl, source.domain, officialDomains);
  const dateErrors = [...validateInternshipDates(record.startDate, record.endDate), ...validateInternshipDeadline(record.deadlineStatus, record.deadline)];
  const validEvidence = record.evidence.some((item) => item.quote.trim() && item.field.trim() && item.sourceUrl === record.sourceUrl);
  switch (action) {
    case "verify": {
      const note = review?.note?.trim();
      if (!review?.confirmed || !note || note.length < 10 || !review.reviewer) return { error: "Confirm the source review and provide a review note of at least 10 characters." };
      if (dateErrors.length) return { error: dateErrors[0] };
      if (!validLinks || !validEvidence) return { error: "Verification requires a curated HTTPS source, an approved application URL, and evidence from that source page." };
      const now = review.now ?? new Date().toISOString();
      return { patch: { verificationStatus: "verified", lastVerifiedAt: now, notes: [record.notes, `[Human verification ${now} by ${review.reviewer}] ${note}`].filter(Boolean).join("\n\n") } };
    }
    case "approve":
      if (dateErrors.length) return { error: dateErrors[0] };
      if (record.verificationStatus !== "verified") {
        return { error: "Only verified internships can be approved." };
      }
      if (!validLinks) {
        return { error: "The application URL must be HTTPS and hosted on the source domain or an explicitly allowlisted official domain." };
      }
      if (!validEvidence) {
        return { error: "At least one source evidence item is required." };
      }
      return { patch: { publicationStatus: "published" } };
    case "reject":
      return {
        patch: {
          verificationStatus: "rejected" satisfies InternshipVerificationStatus,
          publicationStatus: "draft" satisfies InternshipPublicationStatus,
        },
      };
    case "archive":
      return { patch: { publicationStatus: "archived" } };
    case "expire":
      return { patch: { publicationStatus: "expired" } };
    case "force-recheck":
      return {
        patch: {
          verificationStatus: "needs_review",
          researchError: null,
        },
      };
  }
}
