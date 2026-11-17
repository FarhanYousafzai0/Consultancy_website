import type {
  ScholarshipAvailability,
  ScholarshipRecord,
} from "@/lib/db/types";

export const CLOSING_SOON_DAYS = 14;

function dateValue(value: string | null, boundary: "open" | "close"): number | null {
  if (!value) return null;

  // Date-only values have no timezone semantics in the data contract. Treat
  // them as UTC boundaries so a close date remains valid through that day.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return null;

    return Date.UTC(
      year,
      month - 1,
      day,
      boundary === "close" ? 23 : 0,
      boundary === "close" ? 59 : 0,
      boundary === "close" ? 59 : 0,
      boundary === "close" ? 999 : 0
    );
  }

  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function cycleValues(cycle: ScholarshipRecord["cycles"][number]) {
  const open = dateValue(cycle.openAt, "open");
  const close = dateValue(cycle.closeAt, "close");
  const hasInvalidDate =
    (cycle.openAt !== null && open === null) ||
    (cycle.closeAt !== null && close === null);
  const hasReversedDates = open !== null && close !== null && open > close;

  return { cycle, open, close, hasInvalidDate: hasInvalidDate || hasReversedDates };
}

export function scholarshipAvailability(
  scholarship: Pick<ScholarshipRecord, "cycles">,
  now = new Date()
): ScholarshipAvailability {
  const nowTime = now.getTime();
  const cycles = scholarship.cycles.map(cycleValues);

  if (cycles.length === 0) return "unknown";

  const confirmed = cycles.filter(
    ({ cycle, close, hasInvalidDate }) =>
      cycle.status === "confirmed" && close !== null && !hasInvalidDate
  );

  const current = confirmed
    .filter(
      ({ open, close }) =>
        (open === null || open <= nowTime) && close! >= nowTime
    )
    .sort((a, b) => a.close! - b.close!)[0];
  if (current) {
    if (current.close! - nowTime <= CLOSING_SOON_DAYS * 24 * 60 * 60 * 1000) {
      return "closing_soon";
    }
    return "open";
  }

  const next = confirmed
    .filter(({ open, close }) => open !== null && open > nowTime && close! > open)
    .sort((a, b) => (a.open ?? Infinity) - (b.open ?? Infinity))[0];
  if (next) return "opening_soon";

  if (confirmed.some(({ close }) => close! < nowTime)) return "closed";

  return "unknown";
}

export function scholarshipDeadline(
  scholarship: Pick<ScholarshipRecord, "cycles">,
  now = new Date()
) {
  const nowTime = now.getTime();
  const cycles = scholarship.cycles
    .map(cycleValues)
    .filter(
      ({ cycle, close, hasInvalidDate }) =>
        cycle.status === "confirmed" && close !== null && !hasInvalidDate
    );

  const current = cycles
    .filter(({ open, close }) => (open === null || open <= nowTime) && close! >= nowTime)
    .sort((a, b) => a.close! - b.close!)[0];
  if (current) return current.cycle.closeAt;

  const next = cycles
    .filter(({ open, close }) => open !== null && open > nowTime && close! > open)
    .sort((a, b) => a.open! - b.open!)[0];
  if (next) return next.cycle.closeAt;

  return cycles
    .filter(({ close }) => close! < nowTime)
    .sort((a, b) => b.close! - a.close!)[0]?.cycle.closeAt ?? null;
}

