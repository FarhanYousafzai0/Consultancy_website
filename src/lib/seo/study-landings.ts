import type { ProgramField } from "@/lib/db/types";

export type StudyLanding = {
  slug: string;
  field: ProgramField;
  title: string;
  description: string;
  intro: string;
};

export const STUDY_LANDINGS: StudyLanding[] = [
  {
    slug: "computer-science",
    field: "computer_science",
    title: "English-taught Computer Science Master's in Germany",
    description:
      "Verified CS / IT Master's programs for Pakistani students — filters, eligibility, and official sources.",
    intro:
      "Looking for an English-taught Computer Science or IT Master's in Germany? These published programs on Parwaaz are checked against official university pages. Use Reach / Match / Safety after your eligibility check — never rely on invented acceptance rates.",
  },
  {
    slug: "data",
    field: "data",
    title: "Data Science & AI Master's in Germany for Pakistani students",
    description:
      "Browse verified Data / AI Master's programs with sources and last-verified dates.",
    intro:
      "Data and AI Master's programs in Germany vary widely on math prerequisites and English scores. Start from our verified list, then open each source URL before you apply.",
  },
  {
    slug: "engineering",
    field: "engineering",
    title: "Engineering Master's in Germany for Pakistani students",
    description:
      "Verified engineering Master's listings with honest filters for Pakistani applicants.",
    intro:
      "Engineering Master's routes often need a closely related Bachelor's and clear language proof. Parwaaz shows only programs we have published with a source link.",
  },
  {
    slug: "business",
    field: "business",
    title: "Business & Management Master's in Germany",
    description:
      "English-taught business Master's options for Pakistani graduates — verified where possible.",
    intro:
      "Business and management Master's programs may be public or private. We label costs and never rank by commission. Confirm every deadline on the university site.",
  },
  {
    slug: "economics",
    field: "economics",
    title: "Economics Master's in Germany for Pakistani students",
    description:
      "Verified economics Master's programmes with sources and last-verified dates.",
    intro:
      "Economics programmes are separate from business and management degrees. Start from our verified list, then confirm every deadline and language requirement on the university site.",
  },
];

export const STUDY_LANDING_SLUGS = STUDY_LANDINGS.map((l) => l.slug);

export function getStudyLanding(slug: string): StudyLanding | null {
  return STUDY_LANDINGS.find((l) => l.slug === slug) ?? null;
}
