import { z } from "zod";

export const goalSchema = z.enum(["masters", "bachelors", "ausbildung"]);

export const mastersQualificationSchema = z.enum([
  "bs_4year",
  "ba_bsc_2year",
  "ba_bsc_2year_plus_masters",
  "other",
]);

export const bachelorsQualificationSchema = z.enum([
  "fsc_pre_engineering",
  "fsc_pre_medical",
  "fsc_ics",
  "fsc_icom",
  "fsc_fa",
  "a_levels",
  "university_1year",
  "other",
]);

export const ausbildungQualificationSchema = z.enum([
  "matric",
  "fsc_hssc",
  "other",
]);

export const gradeSystemSchema = z.enum(["percentage", "cgpa4", "cgpa5"]);

export const percentagePassMarkSchema = z.union([
  z.literal(33),
  z.literal(40),
  z.literal(50),
]);

export const studyFieldSchema = z.enum([
  "computer_science",
  "engineering",
  "data",
  "business",
  "natural_sciences",
  "health",
  "social_sciences",
  "arts",
  "other",
]);

export const ausbildungFieldSchema = z.enum([
  "it",
  "nursing",
  "mechatronics",
  "hospitality",
  "trades",
  "other",
]);

export const englishTestSchema = z.enum([
  "ielts",
  "toefl",
  "pte",
  "duolingo",
  "none",
]);

export const germanLevelSchema = z.enum([
  "none",
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
]);

export function qualificationSchemaFor(goal: z.infer<typeof goalSchema>) {
  if (goal === "masters") return mastersQualificationSchema;
  if (goal === "bachelors") return bachelorsQualificationSchema;
  return ausbildungQualificationSchema;
}

export function fieldSchemaFor(goal: z.infer<typeof goalSchema>) {
  return goal === "ausbildung" ? ausbildungFieldSchema : studyFieldSchema;
}

export const gradeStepSchema = z
  .object({
    gradeSystem: gradeSystemSchema,
    gradeValue: z.number(),
    percentagePassMark: percentagePassMarkSchema.nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.gradeSystem === "percentage") {
      if (data.percentagePassMark == null) {
        ctx.addIssue({
          code: "custom",
          path: ["percentagePassMark"],
          message: "Choose the pass mark used by your board.",
        });
      }
      if (data.gradeValue < 0 || data.gradeValue > 100) {
        ctx.addIssue({
          code: "custom",
          path: ["gradeValue"],
          message: "Enter a percentage between 0 and 100.",
        });
      }
    } else if (data.gradeSystem === "cgpa4") {
      if (data.gradeValue < 0 || data.gradeValue > 4) {
        ctx.addIssue({
          code: "custom",
          path: ["gradeValue"],
          message: "Enter a CGPA between 0 and 4.0.",
        });
      }
    } else if (data.gradeValue < 0 || data.gradeValue > 5) {
      ctx.addIssue({
        code: "custom",
        path: ["gradeValue"],
        message: "Enter a CGPA between 0 and 5.0.",
      });
    }
  });

export const languageStepSchema = z
  .object({
    englishTest: englishTestSchema,
    englishScore: z.number().nullable(),
    germanLevel: germanLevelSchema,
  })
  .superRefine((data, ctx) => {
    if (data.englishTest === "none") return;
    if (data.englishScore == null) {
      ctx.addIssue({
        code: "custom",
        path: ["englishScore"],
        message: "Enter your score.",
      });
      return;
    }
    const ranges: Record<string, [number, number]> = {
      ielts: [0, 9],
      toefl: [0, 120],
      pte: [0, 90],
      duolingo: [10, 160],
    };
    const range = ranges[data.englishTest];
    if (!range) return;
    const [min, max] = range;
    if (data.englishScore < min || data.englishScore > max) {
      ctx.addIssue({
        code: "custom",
        path: ["englishScore"],
        message: `Enter a score between ${min} and ${max}.`,
      });
    }
  });
