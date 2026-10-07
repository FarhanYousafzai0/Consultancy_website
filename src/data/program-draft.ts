import type {
  GermanRequired,
  InstructionLanguage,
  ProgramField,
  ProgramInput,
} from "@/lib/db/types";

export type ProgramDraft = {
  name: string;
  university: string;
  universityType: "public" | "private";
  degreeLevel: "bachelor" | "master";
  field: ProgramField;
  city: string;
  state: string;
  languageOfInstruction: InstructionLanguage;
  germanRequired: GermanRequired;
  applicationRoute: "direct" | "uni_assist" | "vpd";
  sourceUrl: string;
  ieltsMin?: number | null;
  toeflMin?: number | null;
  tuitionPerSemesterEur?: number;
  semesterFeeEur?: number;
  typicalGermanGradeMax?: number | null;
  deadlineNonEu?: string | null;
  intakeSemester?: "winter" | "summer";
  lastVerifiedAt?: string;
  notes?: string;
};

const DOCS_MASTER = [
  "transcript",
  "degree_certificate",
  "cv",
  "motivation_letter",
  "english_certificate",
  "aps_certificate",
];

const DOCS_BACHELOR = [
  "transcript",
  "secondary_school_certificate",
  "cv",
  "english_certificate",
  "aps_certificate",
];

const DOCS_GERMAN = [
  "transcript",
  "degree_certificate",
  "cv",
  "motivation_letter",
  "german_certificate",
  "aps_certificate",
];

export function programFromDraft(
  draft: ProgramDraft,
  defaultNote: string
): ProgramInput {
  const germanTaught = draft.languageOfInstruction === "german";
  return {
    name: draft.name,
    university: draft.university,
    universityType: draft.universityType,
    degreeLevel: draft.degreeLevel,
    field: draft.field,
    city: draft.city,
    state: draft.state,
    languageOfInstruction: draft.languageOfInstruction,
    ieltsMin: draft.ieltsMin ?? null,
    toeflMin: draft.toeflMin ?? null,
    germanRequired: draft.germanRequired,
    applicationRoute: draft.applicationRoute,
    tuitionPerSemesterEur: draft.tuitionPerSemesterEur ?? 0,
    semesterFeeEur: draft.semesterFeeEur ?? 300,
    typicalGermanGradeMax: draft.typicalGermanGradeMax ?? null,
    intakes: [
      {
        semester: draft.intakeSemester ?? "winter",
        year: 2027,
        deadlineNonEu: draft.deadlineNonEu ?? null,
        status: "predicted",
      },
    ],
    requiredDocuments: germanTaught
      ? DOCS_GERMAN
      : draft.degreeLevel === "bachelor"
        ? DOCS_BACHELOR
        : DOCS_MASTER,
    sourceUrl: draft.sourceUrl,
    lastVerifiedAt: draft.lastVerifiedAt ?? "2026-10-08",
    status: "published",
    notes: draft.notes ?? defaultNote,
  };
}
