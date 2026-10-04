import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./logo";

const groups = [
  {
    title: "Explore",
    links: [
      { href: "/check", label: "Eligibility check" },
      { href: "/programs", label: "Programs" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/ausbildung", label: "Ausbildung" },
    ],
  },
  {
    title: "Tools & guides",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/tools/grade-converter", label: "Grade converter" },
      { href: "/tools/cost-calculator", label: "Cost calculator" },
      { href: "/how-we-verify", label: "How we verify" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink pb-28 text-white md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-6">
        <div className="space-y-4">
          <Logo variant="light" />
          <p className="max-w-xs text-sm text-white/60">
            Honest answers for Pakistani students planning to study in Germany. We advise — universities decide.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-white/50">{group.title}</p>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/80 hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-white/50 md:px-6">
          © {new Date().getFullYear()} {site.name}. Program data is verified against official sources — always confirm on the university website before applying.
        </p>
      </div>
    </footer>
  );
}
