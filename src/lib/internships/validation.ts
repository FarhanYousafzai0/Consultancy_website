import type { InternshipDeadlineStatus } from "@/lib/db/types";

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDateValue(value: string | null | undefined): value is string {
  if (!value) return false;
  const dateOnly = DATE_ONLY.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
  }
  return !Number.isNaN(Date.parse(value));
}

function dateTime(value: string, boundary: "start" | "end") {
  const dateOnly = DATE_ONLY.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    return Date.UTC(year, month - 1, day, boundary === "end" ? 23 : 0, boundary === "end" ? 59 : 0, boundary === "end" ? 59 : 0, boundary === "end" ? 999 : 0);
  }
  return Date.parse(value);
}

export function validateInternshipDates(
  startDate: string | null | undefined,
  endDate: string | null | undefined
) {
  const errors: string[] = [];
  if (startDate && !isValidDateValue(startDate)) errors.push("startDate must be a valid date");
  if (endDate && !isValidDateValue(endDate)) errors.push("endDate must be a valid date");
  if (errors.length === 0 && startDate && endDate && dateTime(startDate, "start") > dateTime(endDate, "end")) {
    errors.push("startDate must be before or equal to endDate");
  }
  return errors;
}

export function validateInternshipDeadline(
  deadlineStatus: InternshipDeadlineStatus,
  deadline: string | null | undefined
) {
  if (deadlineStatus === "confirmed") {
    return isValidDateValue(deadline) ? [] : ["confirmed deadlineStatus requires a valid deadline"];
  }
  return deadline === null || deadline === undefined || deadline === ""
    ? []
    : ["non-confirmed deadlineStatus must not carry a deadline"];
}
