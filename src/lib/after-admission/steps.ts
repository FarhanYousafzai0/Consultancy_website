import {
  partnersForCategory,
  type PartnerCategory,
  type PartnerOffer,
} from "@/data/partner-offers";

export type AfterAdmissionStepId =
  | "aps"
  | "blocked_account"
  | "insurance"
  | "visa"
  | "housing"
  | "anmeldung";

export type AfterAdmissionStep = {
  id: AfterAdmissionStepId;
  label: string;
  guideSlug: string;
  partnerCategory?: PartnerCategory;
};

export const AFTER_ADMISSION_STEPS: AfterAdmissionStep[] = [
  {
    id: "aps",
    label: "APS certificate",
    guideSlug: "aps-pakistan",
  },
  {
    id: "blocked_account",
    label: "Blocked account",
    guideSlug: "blocked-account",
    partnerCategory: "blocked_account",
  },
  {
    id: "insurance",
    label: "Health insurance",
    guideSlug: "faq-insurance",
    partnerCategory: "insurance",
  },
  {
    id: "visa",
    label: "Student visa",
    guideSlug: "student-visa-overview",
  },
  {
    id: "housing",
    label: "Housing",
    guideSlug: "faq-housing",
  },
  {
    id: "anmeldung",
    label: "Anmeldung (city registration)",
    guideSlug: "anmeldung-germany",
  },
];

export const AFTER_ADMISSION_STEP_IDS = AFTER_ADMISSION_STEPS.map((s) => s.id);

export function isAfterAdmissionStepId(
  value: string
): value is AfterAdmissionStepId {
  return (AFTER_ADMISSION_STEP_IDS as string[]).includes(value);
}

export function filterValidCompletedIds(ids: string[]): AfterAdmissionStepId[] {
  const seen = new Set<AfterAdmissionStepId>();
  for (const id of ids) {
    if (isAfterAdmissionStepId(id)) seen.add(id);
  }
  return AFTER_ADMISSION_STEP_IDS.filter((id) => seen.has(id));
}

export function partnersForStep(
  step: AfterAdmissionStep
): PartnerOffer[] {
  if (!step.partnerCategory) return [];
  return partnersForCategory(step.partnerCategory);
}
