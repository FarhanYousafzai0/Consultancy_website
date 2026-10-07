import Link from "next/link";
import { Button } from "@/components/ui/button";
import { whatsappLink, site } from "@/lib/site";

export const metadata = {
  title: "Community",
  description:
    "Join the Parwaaz WhatsApp community for Pakistani students planning study or Ausbildung in Germany — not a public forum.",
};

function communityUrl() {
  const custom = process.env.NEXT_PUBLIC_COMMUNITY_WHATSAPP_URL?.trim();
  if (custom) return custom;
  return whatsappLink(
    `Hi ${site.name}! I'd like to join the student community.`
  );
}

export default function CommunityPage() {
  const href = communityUrl();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Community</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
          Students planning Germany together
        </h1>
        <p className="mt-4 text-muted-foreground">
          A light WhatsApp group for questions, webinar reminders, and peer
          updates. Not a public forum — we keep it curated and spam-free.
        </p>
      </div>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-extrabold">How it works</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Ask practical questions about eligibility, documents, and timelines</li>
          <li>Get notified when we host free webinars</li>
          <li>Share wins — admissions stay student-reported, never fake %</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="whatsapp">
            <a href={href} target="_blank" rel="noopener noreferrer">
              Join on WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/webinars">See webinars</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
