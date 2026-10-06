import { z } from "zod";
import type { ProgramIntake, ProgramRecord } from "@/lib/db/types";

export const APPLICATION_STATUSES = [
  "planning",
  "gathering_docs",
  "ready_to_apply",
  "submitted",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const CLOSED_APPLICATION_STATUSES: ApplicationStatus[] = [
  "withdrawn",
  "rejected",
];

export type TargetIntake = {
  semester: "winter" | "summer";
  year: number;
};

export type ShortlistProgressFields = {
  status: ApplicationStatus;
  completedDocuments: string[];
  targetIntake: TargetIntake | null;
};

export const shortlistProgressSchema = z.object({
  programId: z.string().min(1),
  status: z.enum(APPLICATION_STATUSES).optional(),
  completedDocuments: z.array(z.string()).optional(),
  targetIntake: z
    .object({
      semester: z.enum(["winter", "summer"]),
      year: z.number().int().min(2020).max(2100),
    })
    .nullable()
    .optional(),
});

export type ShortlistProgressPatch = z.infer<typeof shortlistProgressSchema>;

/** Prefer target intake deadline; else earliest non-EU deadline on the program. */
export function resolveDeadline(item: {
  targetIntake?: TargetIntake | null;
  program: Pick<ProgramRecord, "intakes"> | null;
}): string | null {
  const intakes = item.program?.intakes ?? [];
  if (item.targetIntake) {
    const match = intakes.find(
      (i) =>
        i.semester === item.targetIntake!.semester &&
        i.year === item.targetIntake!.year
    );
    if (match?.deadlineNonEu) return match.deadlineNonEu;
  }
  const dates = intakes
    .map((i) => i.deadlineNonEu)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates[0] ?? null;
}

/** Keep only completed docs that still exist on the program checklist. */
export function docProgress(item: {
  completedDocuments: string[];
  program: Pick<ProgramRecord, "requiredDocuments"> | null;
}): {
  required: string[];
  completed: string[];
  done: number;
  total: number;
} {
  const required = item.program?.requiredDocuments ?? [];
  const completedSet = new Set(item.completedDocuments);
  const completed = required.filter((d) => completedSet.has(d));
  return {
    required,
    completed,
    done: completed.length,
    total: required.length,
  };
}

export function applicationStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case "planning":
      return "Planning";
    case "gathering_docs":
      return "Gathering docs";
    case "ready_to_apply":
      return "Ready to apply";
    case "submitted":
      return "Submitted";
    case "offer":
      return "Offer";
    case "rejected":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
  }
}

export function intakeKey(intake: Pick<ProgramIntake, "semester" | "year">) {
  return `${intake.semester}:${intake.year}`;
}

export function buildTimeline(
  items: Array<{
    programId: string;
    status: ApplicationStatus;
    targetIntake?: TargetIntake | null;
    program: Pick<
      ProgramRecord,
      "name" | "university" | "intakes"
    > | null;
  }>,
  now = new Date()
): Array<{
  programId: string;
  name: string;
  university: string;
  status: ApplicationStatus;
  deadline: string;
  daysLeft: number;
}> {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const rows: Array<{
    programId: string;
    name: string;
    university: string;
    status: ApplicationStatus;
    deadline: string;
    daysLeft: number;
  }> = [];

  for (const item of items) {
    if (CLOSED_APPLICATION_STATUSES.includes(item.status)) continue;
    const deadline = resolveDeadline(item);
    if (!deadline) continue;
    const d = new Date(`${deadline}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) continue;
    const daysLeft = Math.round((d.getTime() - today) / (24 * 60 * 60 * 1000));
    rows.push({
      programId: item.programId,
      name: item.program?.name ?? "Program",
      university: item.program?.university ?? "",
      status: item.status,
      deadline,
      daysLeft,
    });
  }

  return rows.sort((a, b) => a.deadline.localeCompare(b.deadline));
}

export function normalizeStatus(raw: unknown): ApplicationStatus {
  if (
    typeof raw === "string" &&
    (APPLICATION_STATUSES as readonly string[]).includes(raw)
  ) {
    return raw as ApplicationStatus;
  }
  return "planning";
}

export function normalizeTargetIntake(raw: unknown): TargetIntake | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as { semester?: string; year?: number };
  if (
    (t.semester === "winter" || t.semester === "summer") &&
    typeof t.year === "number" &&
    Number.isFinite(t.year)
  ) {
    return { semester: t.semester, year: t.year };
  }
  return null;
}
