import { LegalDoc } from "@/components/layout/legal-doc";
import { site } from "@/lib/site";

export const metadata = {
  title: "Terms of service",
  description: `Terms for using ${site.name}.`,
};

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of service">
      <p>
        By using {site.name} (the website at parwaazconsultancy.com), you agree
        to these terms. They are written in plain language for students. They
        are not a substitute for professional legal advice.
      </p>

      <h2>What this service is</h2>
      <p>
        We provide eligibility guidance, program and scholarship information, and
        a way to talk to a consultant. We advise. Universities, scholarship
        bodies, and German authorities decide.
      </p>

      <h2>Accounts</h2>
      <p>
        You must give accurate information. Keep your login details private. You
        may sign in with email one-time codes or Google. Do not use someone
        else’s account.
      </p>

      <h2>No admission guarantee</h2>
      <p>
        Match labels, scholarship odds, and check results are estimates based on
        the information you give us and data we have verified as well as we
        can. Always confirm requirements on the official university or
        scholarship website before you apply.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not misuse the site, attempt to break it, scrape it at scale, or
        upload content you do not have the right to share.
      </p>

      <h2>Paid services</h2>
      <p>
        Some consultancy or review services may be paid. Prices and what is
        included will be shown before you pay. Website tools such as the
        eligibility check may stay free.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The “Last updated” date at the top will
        change when we do. Continued use means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: use the WhatsApp button on this site.
      </p>
    </LegalDoc>
  );
}
