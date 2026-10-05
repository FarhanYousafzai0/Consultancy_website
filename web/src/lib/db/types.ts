export type DegreeLevel = "bachelor" | "master";
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
