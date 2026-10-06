import { z } from "zod";

export const guideInputSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  topic: z.enum([
    "aps",
    "blocked_account",
    "visa",
    "uni_assist",
    "anabin",
    "studienkolleg",
    "faq",
    "other",
  ]),
  body: z.string().min(20),
  sourceUrl: z.string().url(),
  lastVerifiedAt: z.string().nullable(),
  status: z.enum(["draft", "published"]),
});
