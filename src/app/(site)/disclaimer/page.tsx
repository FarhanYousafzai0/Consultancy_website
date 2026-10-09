import { LegalDoc } from "@/components/layout/legal-doc";
import { site } from "@/lib/site";

export const metadata = {
  title: "Disclaimer",
  description: `${site.name} advises Pakistani students on study in Germany. Universities, scholarship bodies, and German authorities decide.`,
};

export default function DisclaimerPage() {
  return (
    <LegalDoc title="Disclaimer">
      <p>
        {site.name} helps Pakistani students understand eligibility, programs,
        scholarships, and next steps for study or Ausbildung in Germany. This
        disclaimer explains the limits of that help.
      </p>

      <h2>We advise — universities decide</h2>
      <p>
        Match labels, scholarship odds, eligibility results, and AI answers are
        guidance based on the information you give us and data we have verified
        as well as we can. They are not admission offers, visa decisions, or
        guarantees of funding.
      </p>

      <h2>Confirm on the official page</h2>
      <p>
        Deadlines, fees, language minimums, and document lists change. Always
        confirm requirements on the official university, scholarship, or
        authority website before you apply or pay. Our cards show a source link
        and a last-verified date so you can re-check.
      </p>

      <h2>No official score verification</h2>
      <p>
        We do not verify IELTS, TOEFL, Duolingo, or German certificates on behalf
        of universities. Institutions check scores themselves through their own
        processes.
      </p>

      <h2>Paid services</h2>
      <p>
        Consultancy packages and paid reviews are separate from free website
        tools. Prices and what is included are agreed before you pay. WhatsApp
        chat for basic questions stays free; the first consultation is paid.
      </p>

      <h2>Partners and affiliates</h2>
      <p>
        When we link to partners (for example blocked-account or insurance
        providers), any affiliation is disclosed. Those links never change how
        programs are ranked or matched.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this disclaimer: use the WhatsApp button on this site or
        the Contact page.
      </p>
    </LegalDoc>
  );
}
