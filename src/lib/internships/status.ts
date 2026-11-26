import type { InternshipPublicationStatus } from "@/lib/db/types";
import { isValidDateValue } from "./validation";

export type InternshipAvailability = "open" | "closing_soon" | "closed" | "unknown";
export const CLOSING_SOON_DAYS = 14;

function deadlineTime(value: string, boundary: "start" | "end") {
  if (!isValidDateValue(value)) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day, boundary === "end" ? 23 : 0, boundary === "end" ? 59 : 0, boundary === "end" ? 59 : 0, boundary === "end" ? 999 : 0);
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function internshipAvailability(
  internship: {
    deadline: string | null;
    deadlineStatus: "confirmed" | "rolling" | "not_published" | "ambiguous";
    publicationStatus: InternshipPublicationStatus;
  },
  now = new Date()
): InternshipAvailability {
  if (internship.publicationStatus === "expired" || internship.publicationStatus === "archived") return "closed";
  if (internship.publicationStatus !== "published" || internship.deadlineStatus !== "confirmed" || !internship.deadline) return "unknown";
  const close = deadlineTime(internship.deadline, "end");
  if (close === null) return "unknown";
  const nowTime = now.getTime();
  if (close < nowTime) return "closed";
  if (close - nowTime <= CLOSING_SOON_DAYS * 24 * 60 * 60 * 1000) return "closing_soon";
  return "open";
}

export const internshipStatus = internshipAvailability;
