import type { AusbildungEventType } from "@/lib/ausbildung/demand";

/** Defaults: unlock when either threshold is met (override via env). */
export function ausbildungPartnerThresholds() {
  return {
    minChecks: Number(process.env.AUSBILDUNG_PARTNER_MIN_CHECKS ?? "50"),
    minApplyClicks: Number(
      process.env.AUSBILDUNG_PARTNER_MIN_APPLY_CLICKS ?? "25"
    ),
  };
}

export function isAusbildungPartnerUnlocked(
  totals: Record<AusbildungEventType, number>
): boolean {
  if (process.env.AUSBILDUNG_PARTNER_FORCE === "1") return true;
  const { minChecks, minApplyClicks } = ausbildungPartnerThresholds();
  return (
    totals.ausbildung_check_completed >= minChecks ||
    totals.ausbildung_apply_click >= minApplyClicks
  );
}
