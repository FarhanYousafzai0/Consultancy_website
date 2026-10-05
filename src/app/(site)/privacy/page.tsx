import { LegalDoc } from "@/components/layout/legal-doc";
import { site } from "@/lib/site";

export const metadata = {
  title: "Privacy policy",
  description: `How ${site.name} collects and uses your information.`,
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy policy">
      <p>
        {site.name} (“we”) helps Pakistani students check eligibility for study in
        Germany. This page explains what we collect and why. It is a simple
        summary, not formal legal advice.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Name and email when you sign up (email code or Google).</li>
        <li>Eligibility answers, saved programs, scholarships, and alert preferences.</li>
        <li>Basic usage data needed to run the website (for example login session cookies).</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use this information to show your matches, send deadline emails you
        opted into, keep you signed in, and so a consultant can help you if you
        contact us.
      </p>

      <h2>Google sign-in</h2>
      <p>
        If you choose “Sign in with Google”, Google shares your name, email, and
        profile picture with us. We do not get your Google password. You can
        revoke access in your Google account settings at any time.
      </p>

      <h2>Where data is stored</h2>
      <p>
        Account and profile data is stored in a cloud database we use to run the
        product. Emails (sign-in codes and deadline alerts) are sent through our
        email provider.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell your data. We share it only with the services needed to
        operate the site (hosting, database, email, Google sign-in) or if the
        law requires it.
      </p>

      <h2>Your choices</h2>
      <p>
        You can update your profile in the dashboard. To delete your account or
        ask what we hold about you, contact us from the website (WhatsApp or
        the contact details we publish).
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy: use the WhatsApp button on this site or email
        the address listed on our contact pages.
      </p>
    </LegalDoc>
  );
}
