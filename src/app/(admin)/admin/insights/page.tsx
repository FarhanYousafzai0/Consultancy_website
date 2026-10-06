import { AdminShell } from "@/components/admin/admin-shell";
import { getAusbildungDemandTotals } from "@/lib/ausbildung/demand";
import {
  ausbildungPartnerThresholds,
  isAusbildungPartnerUnlocked,
} from "@/lib/ausbildung/partner-gate";
import { getAusbildungPartnerOffers } from "@/data/ausbildung-partner-offers";
import { countOutcomes } from "@/lib/db/shortlist";

export const metadata = { title: "Admin · Insights" };

export default async function AdminInsightsPage() {
  const [demand, outcomes] = await Promise.all([
    getAusbildungDemandTotals(),
    countOutcomes(),
  ]);
  const thresholds = ausbildungPartnerThresholds();
  const partnerUnlocked = isAusbildungPartnerUnlocked(demand);
  const partnerConfigured = getAusbildungPartnerOffers().length > 0;

  return (
    <AdminShell title="Insights">
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-card">
          <p className="section-label">Ausbildung demand</p>
          <h2 className="mt-2 text-lg font-extrabold">Usage counters</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paid partner block on /ausbildung unlocks at{" "}
            {thresholds.minChecks}+ checks or {thresholds.minApplyClicks}+ apply
            clicks (or AUSBILDUNG_PARTNER_FORCE=1).
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Check completed</dt>
              <dd className="font-semibold tabular-nums">
                {demand.ausbildung_check_completed}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Listing views</dt>
              <dd className="font-semibold tabular-nums">
                {demand.ausbildung_listing_view}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Apply clicks</dt>
              <dd className="font-semibold tabular-nums">
                {demand.ausbildung_apply_click}
              </dd>
            </div>
            <div className="flex justify-between gap-2 border-t border-border pt-2">
              <dt className="text-muted-foreground">Partner section</dt>
              <dd className="font-semibold">
                {partnerUnlocked
                  ? partnerConfigured
                    ? "Unlocked + URL set"
                    : "Unlocked — set NEXT_PUBLIC_PARTNER_AUSBILDUNG_URL"
                  : "Locked"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-card">
          <p className="section-label">Application outcomes</p>
          <h2 className="mt-2 text-lg font-extrabold">Reported results</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Student-reported only. Do not publish accept % on program cards.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Admitted</dt>
              <dd className="font-semibold tabular-nums">{outcomes.admitted}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Rejected</dt>
              <dd className="font-semibold tabular-nums">{outcomes.rejected}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Withdrew</dt>
              <dd className="font-semibold tabular-nums">{outcomes.withdrew}</dd>
            </div>
          </dl>
        </section>
      </div>
    </AdminShell>
  );
}
