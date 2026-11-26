/** Parwaaz lists master's programmes only. */
export type DegreeLevel = "master";
export type UniversityType = "public" | "private";
export type InstructionLanguage = "english" | "german" | "both";
export type GermanRequired = "none" | "a1" | "a2" | "b1" | "b2" | "c1";
export type ApplicationRoute = "direct" | "uni_assist" | "vpd";
export type ProgramStatus = "draft" | "published";
export type MatchTier = "reach" | "match" | "safety";

export type ProgramField =
  | "computer_science"
  | "engineering"
  | "data"
  | "business"
  | "economics"
  | "natural_sciences"
  | "health"
  | "social_sciences"
  | "arts"
  | "other";

export type ProgramIntake = {
  semester: "winter" | "summer";
  year: number;
  deadlineNonEu: string | null;
  status: "confirmed" | "predicted";
};

export type ProgramRecord = {
  id: string;
  name: string;
  university: string;
  universityType: UniversityType;
  degreeLevel: DegreeLevel;
  field: ProgramField;
  city: string;
  state: string;
  languageOfInstruction: InstructionLanguage;
  ieltsMin: number | null;
  toeflMin: number | null;
  germanRequired: GermanRequired;
  applicationRoute: ApplicationRoute;
  tuitionPerSemesterEur: number;
  semesterFeeEur: number;
  typicalGermanGradeMax: number | null;
  intakes: ProgramIntake[];
  requiredDocuments: string[];
  sourceUrl: string;
  lastVerifiedAt: string | null;
  status: ProgramStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgramInput = Omit<
  ProgramRecord,
  "id" | "createdAt" | "updatedAt"
>;

/** Scholarships */
export type ScholarshipLevel = "bachelor" | "master" | "phd";
export type ScholarshipNationality = string;
export type ScholarshipFundingType =
  | "fully_funded"
  | "partially_funded"
  | "tuition_only"
  | "stipend"
  | "unknown";
export type ScholarshipAvailability =
  | "open"
  | "closing_soon"
  | "opening_soon"
  | "closed"
  | "unknown";
export type ScholarshipOdds =
  | "strong"
  | "possible"
  | "long_shot"
  | "unlikely";
export type CycleStatus = "confirmed" | "predicted";
export type NextCycleStatus = "confirmed" | "predicted" | "unknown";

export type ScholarshipCycle = {
  openAt: string | null;
  closeAt: string | null;
  status: CycleStatus;
};

export type ScholarshipRecord = {
  id: string;
  name: string;
  provider: string;
  slug: string;
  levels: ScholarshipLevel[];
  nationalities: ScholarshipNationality[];
  studyCountries: string[];
  fields: ProgramField[];
  minGermanGrade: number | null;
  workExperienceYears: number;
  maxYearsSinceDegree: number | null;
  ageLimit: number | null;
  mustBeEnrolled: boolean;
  amountSummary: string;
  coverage: string;
  fundingType: ScholarshipFundingType;
  languageRequirements: string[];
  cycles: ScholarshipCycle[];
  nextCycleStatus: NextCycleStatus;
  sourceUrl: string;
  applicationUrl: string;
  sourceDomain: string;
  lastVerifiedAt: string | null;
  lastCheckedAt: string | null;
  lastSuccessfulFetchAt: string | null;
  sourceContentHash: string | null;
  researchProvider: "google" | "openai" | null;
  researchModel: string | null;
  researchError: string | null;
  status: ProgramStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ScholarshipInput = Omit<
  ScholarshipRecord,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "studyCountries"
  | "fundingType"
  | "languageRequirements"
  | "applicationUrl"
  | "sourceDomain"
  | "lastCheckedAt"
  | "lastSuccessfulFetchAt"
  | "sourceContentHash"
  | "researchProvider"
  | "researchModel"
  | "researchError"
> &
  Partial<
    Pick<
      ScholarshipRecord,
      | "studyCountries"
      | "fundingType"
      | "languageRequirements"
      | "applicationUrl"
      | "sourceDomain"
      | "lastCheckedAt"
      | "lastSuccessfulFetchAt"
      | "sourceContentHash"
      | "researchProvider"
      | "researchModel"
      | "researchError"
    >
  >;

/** International internships */
export type InternshipWorkMode = "remote" | "hybrid" | "on_site" | "unknown";
export type InternshipDurationUnit = "weeks" | "months" | "year" | "unknown";
export type InternshipDeadlineStatus =
  | "confirmed"
  | "rolling"
  | "not_published"
  | "ambiguous";
export type InternshipFundingStatus =
  | "paid"
  | "unpaid"
  | "fully_funded"
  | "partially_funded"
  | "unknown";
export type InternshipVerificationStatus =
  | "verified"
  | "needs_review"
  | "rejected";
export type InternshipPublicationStatus =
  | "draft"
  | "published"
  | "expired"
  | "archived";
export type InternshipOrganizationType =
  | "government"
  | "international_organization"
  | "university"
  | "research_institute"
  | "company"
  | "exchange_program"
  | "other"
  | "unknown";
export type InternshipEducationLevel =
  | "high_school"
  | "undergraduate"
  | "graduate"
  | "phd"
  | "postdoctoral"
  | "professional"
  | "other"
  | "unknown";
export type InternshipResearchProvider = "google" | "openai";

export type InternshipEvidence = {
  field: string;
  quote: string;
  sourceUrl: string;
  capturedAt: string;
};

export type InternshipRecord = {
  id: string;
  title: string;
  slug: string;
  organizationName: string;
  organizationLogoUrl: string | null;
  summary: string;
  description: string;
  countryCode: string | null;
  city: string | null;
  locationLabel: string | null;
  workMode: InternshipWorkMode;
  durationValue: number | null;
  durationUnit: InternshipDurationUnit;
  startDate: string | null;
  endDate: string | null;
  durationText: string | null;
  deadline: string | null;
  deadlineStatus: InternshipDeadlineStatus;
  eligibilityCriteria: string[];
  eligibleNationalities: string[];
  studyFields: ProgramField[];
  educationLevels: InternshipEducationLevel[];
  experienceRequirements: string | null;
  fundingStatus: InternshipFundingStatus;
  stipendSummary: string | null;
  benefits: string[];
  applicationUrl: string | null;
  sourceUrl: string;
  sourceDomain: string;
  sourceOrganizationType: InternshipOrganizationType;
  canonicalIdentity: string;
  lastVerifiedAt: string | null;
  lastCheckedAt: string | null;
  lastSuccessfulFetchAt: string | null;
  sourceContentHash: string | null;
  verificationStatus: InternshipVerificationStatus;
  publicationStatus: InternshipPublicationStatus;
  researchProvider: InternshipResearchProvider | null;
  researchModel: string | null;
  researchError: string | null;
  evidence: InternshipEvidence[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type InternshipInput = Omit<
  InternshipRecord,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "sourceDomain"
  | "canonicalIdentity"
  | "lastCheckedAt"
  | "lastSuccessfulFetchAt"
  | "researchError"
> &
  Partial<
    Pick<
      InternshipRecord,
      | "sourceDomain"
      | "canonicalIdentity"
      | "lastCheckedAt"
      | "lastSuccessfulFetchAt"
      | "researchError"
    >
  >;

export type InternshipResearchFailure = {
  canonicalIdentity: string;
  lastCheckedAt?: string;
  researchError: string;
};

/** Guides / knowledge base */
export type GuideTopic =
  | "aps"
  | "blocked_account"
  | "visa"
  | "uni_assist"
  | "anabin"
  | "studienkolleg"
  | "faq"
  | "other";

export type GuideRecord = {
  id: string;
  title: string;
  slug: string;
  topic: GuideTopic;
  body: string;
  sourceUrl: string;
  lastVerifiedAt: string | null;
  status: ProgramStatus;
  createdAt: string;
  updatedAt: string;
};

export type GuideInput = Omit<GuideRecord, "id" | "createdAt" | "updatedAt">;

/** Consultant leads */
export type LeadKind = "chat_handoff" | "sop_review" | "ai_credits";
export type LeadStatus = "new" | "contacted" | "paid" | "closed";

export type LeadRecord = {
  id: string;
  kind: LeadKind;
  status: LeadStatus;
  userId: string | null;
  email: string | null;
  name: string | null;
  goal: string | null;
  lastQuestion: string | null;
  transcriptSnippet: string;
  shortlistCount: number;
  profileUrl: string | null;
  whatsappOpenedAt: string | null;
  notes: string;
  /** Credits to grant when an ai_credits lead is marked paid. */
  creditAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type AnalysisType = "profile" | "sop" | "shortlist";

export type AdvisorReportRecord = {
  id: string;
  userId: string;
  type: AnalysisType;
  inputSummary: string;
  result: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type LeadInput = Omit<LeadRecord, "id" | "createdAt" | "updatedAt">;
