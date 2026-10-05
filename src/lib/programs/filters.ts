import type { ProgramRecord } from "@/lib/db/types";

export type ProgramFilters = {
  q?: string;
  degree?: "bachelor" | "master" | "";
  field?: string;
  universityType?: "public" | "private" | "";
  language?: "english" | "german" | "both" | "";
  ieltsMax?: number | null;
  germanRequired?: string;
  tuition?: "free" | "under_1500" | "any" | "";
  openDeadline?: boolean;
};

export function applyProgramFilters(
  programs: ProgramRecord[],
  filters: ProgramFilters
): ProgramRecord[] {
  const now = Date.now();

  return programs.filter((program) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const hay = `${program.name} ${program.university} ${program.city}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.degree && program.degreeLevel !== filters.degree) return false;
    if (filters.field && filters.field !== "all" && program.field !== filters.field) {
      return false;
    }
    if (
      filters.universityType &&
      program.universityType !== filters.universityType
    ) {
      return false;
    }
    if (filters.language) {
      if (filters.language === "english") {
        if (
          program.languageOfInstruction !== "english" &&
          program.languageOfInstruction !== "both"
        ) {
          return false;
        }
      } else if (program.languageOfInstruction !== filters.language) {
        return false;
      }
    }
    if (filters.ieltsMax != null && filters.ieltsMax > 0) {
      if (program.ieltsMin != null && program.ieltsMin > filters.ieltsMax + 0.01) {
        return false;
      }
    }
    if (
      filters.germanRequired &&
      filters.germanRequired !== "any" &&
      program.germanRequired !== filters.germanRequired
    ) {
      return false;
    }
    if (filters.tuition === "free" && program.tuitionPerSemesterEur > 0) {
      return false;
    }
    if (
      filters.tuition === "under_1500" &&
      program.tuitionPerSemesterEur >= 1500
    ) {
      return false;
    }
    if (filters.openDeadline) {
      const open = program.intakes.some((intake) => {
        if (!intake.deadlineNonEu) return true;
        return new Date(intake.deadlineNonEu).getTime() >= now;
      });
      if (!open) return false;
    }
    return true;
  });
}
