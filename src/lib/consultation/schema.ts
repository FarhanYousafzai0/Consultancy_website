import { z } from "zod";

/**
 * Consultation request — shared by the /consultation form (client) and
 * POST /api/consultation (server). Germany-only, master's-first.
 */

export const serviceOptions = [
  {
    value: "full_application",
    label: "Full master's application support",
    description: "Shortlist, documents, uni-assist / direct applications, visa",
  },
  {
    value: "shortlisting",
    label: "Programme shortlisting",
    description: "Which German master's programmes fit my profile",
  },
  {
    value: "scholarships",
    label: "Scholarships",
    description: "DAAD and other funding I can realistically win",
  },
  {
    value: "documents",
    label: "SOP, CV & documents",
    description: "Motivation letter, Europass CV, LORs review",
  },
  {
    value: "visa",
    label: "Student visa & blocked account",
    description: "Appointment, Sperrkonto, insurance, interview prep",
  },
  {
    value: "profile_evaluation",
    label: "Profile evaluation only",
    description: "An honest read of my chances before I commit",
  },
] as const;

export const degreeLevelOptions = [
  { value: "master", label: "Master's", description: "MSc, MA, MBA, MEng, LLM" },
  { value: "bachelor", label: "Bachelor's", description: "Undergraduate study" },
  { value: "phd", label: "PhD", description: "Doctoral research" },
] as const;

export const qualificationOptions = [
  { value: "bs_4year", label: "4-year BS / BSc / BE (16 years of education)" },
  { value: "ba_bsc_2year", label: "2-year BA / BSc (14 years of education)" },
  { value: "ba_bsc_2year_plus_masters", label: "2-year BA / BSc + 2-year MA / MSc" },
  { value: "masters_done", label: "Master's / MPhil already completed" },
  { value: "intermediate", label: "Intermediate / A Levels" },
  { value: "other", label: "Other" },
] as const;

export const degreeStatusOptions = [
  { value: "completed", label: "Completed" },
  { value: "final_year", label: "In final year" },
  { value: "earlier", label: "Still studying (not final year)" },
] as const;

export const gradeSystemOptions = [
  { value: "cgpa4", label: "CGPA / 4.0" },
  { value: "cgpa5", label: "CGPA / 5.0" },
  { value: "percentage", label: "Percentage" },
] as const;

export const backlogOptions = [
  { value: "none", label: "None" },
  { value: "1_2", label: "1–2 courses" },
  { value: "3_plus", label: "3 or more" },
] as const;

export const hecOptions = [
  { value: "done", label: "Attested" },
  { value: "in_progress", label: "In progress" },
  { value: "not_started", label: "Not started" },
  { value: "unsure", label: "Not sure what this is" },
] as const;

export const englishTestOptions = [
  { value: "ielts", label: "IELTS Academic" },
  { value: "toefl", label: "TOEFL iBT" },
  { value: "pte", label: "PTE Academic" },
  { value: "duolingo", label: "Duolingo" },
  { value: "moi", label: "English-medium letter (MOI)" },
  { value: "planned", label: "Planning to take one" },
  { value: "none", label: "None yet" },
] as const;

export const germanLevelOptions = [
  { value: "none", label: "None" },
  { value: "a1", label: "A1" },
  { value: "a2", label: "A2" },
  { value: "b1", label: "B1" },
  { value: "b2", label: "B2" },
  { value: "c1", label: "C1+" },
] as const;

export const gmatGreOptions = [
  { value: "none", label: "Not taken" },
  { value: "planned", label: "Planning to" },
  { value: "gre", label: "GRE taken" },
  { value: "gmat", label: "GMAT taken" },
] as const;

export const workExperienceOptions = [
  { value: "none", label: "None" },
  { value: "lt1", label: "Under 1 year" },
  { value: "1_2", label: "1–2 years" },
  { value: "2_5", label: "2–5 years" },
  { value: "5_plus", label: "5+ years" },
] as const;

export const fieldOptions = [
  { value: "computer_science", label: "Computer Science / IT" },
  { value: "data", label: "Data Science / AI" },
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business / Management / MBA" },
  { value: "economics", label: "Economics / Finance" },
  { value: "natural_sciences", label: "Natural sciences" },
  { value: "health", label: "Public health / Health sciences" },
  { value: "social_sciences", label: "Social sciences / Psychology" },
  { value: "arts", label: "Arts / Design / Architecture" },
  { value: "other", label: "Other / not sure" },
] as const;

export const teachingLanguageOptions = [
  { value: "english_only", label: "English-taught only" },
  { value: "german_ok", label: "German-taught is fine too" },
] as const;

export const universityTypeOptions = [
  { value: "public_only", label: "Public universities only" },
  { value: "private_ok", label: "Private is fine too" },
  { value: "unsure", label: "Not sure" },
] as const;

export const fundingOptions = [
  { value: "full", label: "I can fund the blocked account and first year" },
  { value: "partial", label: "I can fund part of it" },
  { value: "scholarship_needed", label: "I need a scholarship to go" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const fundingSourceOptions = [
  { value: "self", label: "Own savings" },
  { value: "family", label: "Family / sponsor" },
  { value: "loan", label: "Education loan" },
  { value: "scholarship", label: "Scholarship" },
] as const;

export const passportOptions = [
  { value: "valid", label: "Valid passport" },
  { value: "applying", label: "Applying / renewing" },
  { value: "none", label: "No passport yet" },
] as const;

export const refusalOptions = [
  { value: "none", label: "Never refused" },
  { value: "germany", label: "Refused for Germany" },
  { value: "schengen", label: "Refused for another Schengen country" },
  { value: "other", label: "Refused for another country" },
] as const;

export const applicationStageOptions = [
  { value: "exploring", label: "Just exploring" },
  { value: "preparing", label: "Preparing documents" },
  { value: "applied", label: "Applied, waiting for results" },
  { value: "admitted", label: "Have an admission letter" },
] as const;

export const contactChannelOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call", label: "Phone call" },
  { value: "email", label: "Email" },
] as const;

export const contactTimeOptions = [
  { value: "morning", label: "Morning (9–12)" },
  { value: "afternoon", label: "Afternoon (12–5)" },
  { value: "evening", label: "Evening (5–9)" },
  { value: "any", label: "Any time" },
] as const;

export const referralOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "google", label: "Google search" },
  { value: "friend", label: "Friend / family" },
  { value: "other", label: "Other" },
] as const;

type Opt = readonly { value: string }[];
const oneOf = <T extends Opt>(opts: T) =>
  z.enum(opts.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]]);

/** Next four intakes from a given date. Winter starts Oct, summer starts Apr. */
export function upcomingIntakes(now = new Date()): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  let year = now.getFullYear();
  // Applications for an intake close months earlier, so start from the next realistic one.
  let semester: "summer" | "winter" = now.getMonth() < 6 ? "winter" : "summer";
  if (semester === "summer") year += 1;
  while (out.length < 4) {
    out.push(
      semester === "winter"
        ? { value: `winter_${year}`, label: `Winter ${year}/${String(year + 1).slice(2)}` }
        : { value: `summer_${year}`, label: `Summer ${year}` }
    );
    if (semester === "winter") {
      semester = "summer";
      year += 1;
    } else {
      semester = "winter";
    }
  }
  out.push({ value: "undecided", label: "Not decided" });
  return out;
}

const phoneRe = /^\+?[0-9][0-9\s-]{8,16}$/;

export const stepSchemas = {
  service: z.object({
    services: z
      .array(oneOf(serviceOptions), { message: "Pick at least one thing we can help with." })
      .min(1, "Pick at least one thing we can help with."),
    degreeLevel: oneOf(degreeLevelOptions),
    intake: z.string().min(1, "Choose your target intake."),
  }),
  about: z.object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().regex(phoneRe, "Enter a valid WhatsApp number, e.g. +92 300 1234567."),
    city: z.string().trim().min(2, "Enter your city.").max(80),
    birthYear: z
      .number()
      .int()
      .min(1960, "Check your birth year.")
      .max(new Date().getFullYear() - 14, "Check your birth year.")
      .nullish()
      .transform((v) => v ?? null),
  }),
  academics: z.object({
    qualification: oneOf(qualificationOptions),
    degreeTitle: z.string().trim().min(2, "Enter your degree, e.g. BS Computer Science.").max(160),
    university: z.string().trim().min(2, "Enter your university.").max(160),
    degreeStatus: oneOf(degreeStatusOptions),
    graduationYear: z.number().int().min(1980).max(2035, "Check the year."),
    gradeSystem: oneOf(gradeSystemOptions),
    gradeValue: z.number({ message: "Enter your grade." }).positive("Enter your grade."),
    backlogs: oneOf(backlogOptions),
    hecAttestation: oneOf(hecOptions),
  }),
  tests: z.object({
    englishTest: oneOf(englishTestOptions),
    englishScore: z.number().positive().nullish().transform((v) => v ?? null),
    germanLevel: oneOf(germanLevelOptions),
    gmatGre: oneOf(gmatGreOptions),
    gmatGreScore: z.number().positive().nullish().transform((v) => v ?? null),
    workExperience: oneOf(workExperienceOptions),
    workRole: z.string().trim().max(160).default(""),
  }),
  plan: z.object({
    fields: z
      .array(oneOf(fieldOptions), { message: "Pick at least one field." })
      .min(1, "Pick at least one field.")
      .max(3, "Pick up to three."),
    targetProgrammes: z.string().trim().max(400).default(""),
    teachingLanguage: oneOf(teachingLanguageOptions),
    universityType: oneOf(universityTypeOptions),
    funding: oneOf(fundingOptions),
    fundingSources: z.array(oneOf(fundingSourceOptions)).default([]),
    passport: oneOf(passportOptions),
    visaRefusal: oneOf(refusalOptions),
    applicationStage: oneOf(applicationStageOptions),
  }),
  contact: z.object({
    contactChannel: oneOf(contactChannelOptions),
    contactTime: oneOf(contactTimeOptions),
    referral: z.union([oneOf(referralOptions), z.literal("")]).default(""),
    notes: z.string().trim().max(1500).default(""),
    consent: z.literal(true, { message: "Please allow us to contact you about this request." }),
  }),
} as const;

export const consultationSchema = stepSchemas.service
  .extend(stepSchemas.about.shape)
  .extend(stepSchemas.academics.shape)
  .extend(stepSchemas.tests.shape)
  .extend(stepSchemas.plan.shape)
  .extend(stepSchemas.contact.shape)
  .superRefine((v, ctx) => {
    const max = v.gradeSystem === "cgpa4" ? 4 : v.gradeSystem === "cgpa5" ? 5 : 100;
    if (v.gradeValue > max) {
      ctx.addIssue({ code: "custom", path: ["gradeValue"], message: `Grade can't be above ${max}.` });
    }
  });

export type ConsultationInput = z.infer<typeof consultationSchema>;

export function labelOf(opts: readonly { value: string; label: string }[], value: string | null | undefined) {
  if (!value) return "—";
  return opts.find((o) => o.value === value)?.label ?? value;
}
