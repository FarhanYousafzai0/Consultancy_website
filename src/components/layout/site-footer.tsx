import Link from "next/link";
import { site } from "@/lib/site";
import { FooterCta } from "./footer-cta";
import { Logo } from "./logo";

const groups = [
  {
    title: "Explore",
    links: [
      { href: "/check", label: "Eligibility check" },
      { href: "/scholarships", label: "Scholarship finder" },
      { href: "/ausbildung", label: "Ausbildung" },
      { href: "/stories", label: "Stories" },
      { href: "/community", label: "Community" },
      { href: "/webinars", label: "Webinars" },
    ],
  },
  {
    title: "Tools & guides",
    links: [
      { href: "/tools/grade-converter", label: "Grade converter" },
      { href: "/tools/cost-calculator", label: "Cost calculator" },
      { href: "/guides", label: "Guides" },
      { href: "/study/computer-science", label: "CS Master's hub" },
      { href: "/how-we-verify", label: "How we verify" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/services", label: "Services" },
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
    // One solid colour to the bottom of the page. The mobile bottom padding keeps
    // content clear of the tab bar and stays the same ink colour.
    <footer className="mt-24 rounded-t-[28px] bg-ink pb-24 text-white md:rounded-t-[36px] md:pb-0">
      <div className="mx-auto max-w-[90rem] overflow-hidden">
        <FooterCta />
        <div className="grid gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-8">
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="max-w-xs text-sm text-white/60">
              Honest answers for Pakistani students planning to study in Germany. We advise — universities decide.
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-white/50">
                {group.title}
              </p>
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
          <div className="flex flex-col items-start gap-3 px-5 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8">
            <p className="shrink-0">Developed with ❤️ by <a href="https://muhammadfarhan.dev/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/80 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Muhammad Farhan</a></p>
            <p className="md:text-right">© {new Date().getFullYear()} {site.name}. Program data is verified against official sources — always confirm on the university website before applying.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
