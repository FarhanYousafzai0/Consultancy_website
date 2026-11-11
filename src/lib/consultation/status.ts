export const CONSULTATION_STATUSES = [
  "new",
  "contacted",
  "booked",
  "paid",
  "closed",
] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];
