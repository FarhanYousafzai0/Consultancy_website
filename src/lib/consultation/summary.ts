import {
  applicationStageOptions,
  backlogOptions,
  contactChannelOptions,
  contactTimeOptions,
  degreeLevelOptions,
  degreeStatusOptions,
  englishTestOptions,
  fieldOptions,
  fundingOptions,
  fundingSourceOptions,
  germanLevelOptions,
  gmatGreOptions,
  gradeSystemOptions,
  hecOptions,
  labelOf,
  passportOptions,
  qualificationOptions,
  referralOptions,
  refusalOptions,
  serviceOptions,
  teachingLanguageOptions,
  universityTypeOptions,
  workExperienceOptions,
  type ConsultationInput,
} from "./schema";

export type SummarySection = { title: string; rows: [string, string][] };

export function intakeLabel(value: string) {
  if (value === "undecided") return "Not decided";
  const [sem, year] = value.split("_");
  const y = Number(year);
  if (!y) return value;
  return sem === "winter" ? `Winter ${y}/${String(y + 1).slice(2)}` : `Summer ${y}`;
}

/** Human-readable sections, used by the review step, admin detail and emails. */
export function summarySections(a: Partial<ConsultationInput>): SummarySection[] {
  const list = (vals: string[] | undefined, opts: readonly { value: string; label: string }[]) =>
    vals && vals.length ? vals.map((v) => labelOf(opts, v)).join(", ") : "—";
  const grade =
    a.gradeValue != null
      ? `${a.gradeValue} (${labelOf(gradeSystemOptions, a.gradeSystem)})`
      : "—";
  const english =
    a.englishTest && a.englishScore != null
      ? `${labelOf(englishTestOptions, a.englishTest)} · ${a.englishTest === "ielts" ? a.englishScore.toFixed(1) : a.englishScore}`
      : labelOf(englishTestOptions, a.englishTest);
  const gre =
    a.gmatGre && a.gmatGreScore != null
      ? `${labelOf(gmatGreOptions, a.gmatGre)} · ${a.gmatGreScore}`
      : labelOf(gmatGreOptions, a.gmatGre);

  return [
    {
      title: "Goal",
      rows: [
        ["Help with", list(a.services, serviceOptions)],
        ["Degree", labelOf(degreeLevelOptions, a.degreeLevel)],
        ["Target intake", a.intake ? intakeLabel(a.intake) : "—"],
      ],
    },
    {
      title: "About",
      rows: [
        ["Name", a.fullName || "—"],
        ["Email", a.email || "—"],
        ["WhatsApp", a.phone || "—"],
        ["City", a.city || "—"],
        ["Birth year", a.birthYear ? String(a.birthYear) : "—"],
      ],
    },
    {
      title: "Academics",
      rows: [
        ["Qualification", labelOf(qualificationOptions, a.qualification)],
        ["Degree", a.degreeTitle || "—"],
        ["University", a.university || "—"],
        ["Status", `${labelOf(degreeStatusOptions, a.degreeStatus)}${a.graduationYear ? ` · ${a.graduationYear}` : ""}`],
        ["Grade", grade],
        ["Backlogs", labelOf(backlogOptions, a.backlogs)],
        ["HEC attestation", labelOf(hecOptions, a.hecAttestation)],
      ],
    },
    {
      title: "Tests & experience",
      rows: [
        ["English", english],
        ["German", labelOf(germanLevelOptions, a.germanLevel)],
        ["GRE / GMAT", gre],
        ["Work experience", `${labelOf(workExperienceOptions, a.workExperience)}${a.workRole ? ` · ${a.workRole}` : ""}`],
      ],
    },
    {
      title: "Plan & funding",
      rows: [
        ["Fields", list(a.fields, fieldOptions)],
        ["Programmes in mind", a.targetProgrammes || "—"],
        ["Teaching language", labelOf(teachingLanguageOptions, a.teachingLanguage)],
        ["University type", labelOf(universityTypeOptions, a.universityType)],
        ["Funding", labelOf(fundingOptions, a.funding)],
        ["Funding sources", list(a.fundingSources, fundingSourceOptions)],
        ["Passport", labelOf(passportOptions, a.passport)],
        ["Visa refusals", labelOf(refusalOptions, a.visaRefusal)],
        ["Stage", labelOf(applicationStageOptions, a.applicationStage)],
      ],
    },
    {
      title: "Contact",
      rows: [
        ["Channel", labelOf(contactChannelOptions, a.contactChannel)],
        ["Best time (PKT)", labelOf(contactTimeOptions, a.contactTime)],
        ["Heard about us", labelOf(referralOptions, a.referral)],
        ["Notes", a.notes || "—"],
      ],
    },
  ];
}

export function summaryLines(a: Partial<ConsultationInput>) {
  return summarySections(a).flatMap((s) => [
    "",
    s.title.toUpperCase(),
    ...s.rows.map(([k, v]) => `• ${k}: ${v}`),
  ]);
}
