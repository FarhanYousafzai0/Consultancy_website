import Link from "next/link";
import { ArrowUpRight, CheckCircle, Prohibit } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { PackageCta } from "@/components/services/package-cta";
import {
  freeTools,
  notSold,
  pricingNote,
  servicePackages,
} from "@/data/services";
import { site, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "Services",
  description: `Consultancy from ${site.name}: a free profile evaluation, full application handling, and a 1-1 call for LOM and CV review. Free tools and WhatsApp chat stay free.`,
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label justify-center">Consultancy</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
          Free tools. Real human help when you need it.
        </h1>
        <p className="mt-4 text-muted-foreground">{pricingNote}</p>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servicePackages.map((pkg) => {
          return (
            <li
              key={pkg.id}
              className="relative flex flex-col rounded-[24px] border border-border bg-white p-6"
            >
              {pkg.badge ? (
                <span className="absolute top-5 right-5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-ink">
                  {pkg.badge}
                </span>
              ) : null}
              <h2 className={`${pkg.badge ? "pr-24 " : ""}text-xl font-extrabold tracking-[-0.02em] text-forest`}>
                {pkg.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pkg.summary}
              </p>
              <div className="my-5 h-px bg-border" />
              <ul className="flex-1 space-y-2">
                {pkg.includes.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-foreground/85"
                  >
                    <CheckCircle
                      weight="fill"
                      className="mt-0.5 size-4 shrink-0 text-forest"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <PackageCta pkg={pkg} size="lg" className="mt-6 w-full" />
            </li>
          );
        })}
      </ul>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-[20px] bg-muted p-6">
          <p className="section-label">What stays free</p>
          <ul className="mt-4 space-y-2">
            {freeTools.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-foreground/85">
                <CheckCircle
                  weight="fill"
                  className="mt-0.5 size-4 shrink-0 text-forest"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="mt-6 pr-2">
            <Link href="/check">
              Check eligibility
              <span className="grid size-6 place-items-center rounded-full bg-ink text-primary">
                <ArrowUpRight weight="bold" className="size-3.5" />
              </span>
            </Link>
          </Button>
        </div>

        <div className="rounded-[20px] border border-border bg-white p-6">
          <p className="section-label">What we do not sell</p>
          <ul className="mt-4 space-y-2">
            {notSold.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-foreground/85">
                <Prohibit className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Free guides cover uni-assist, blocked account, and visa steps. Ausbildung
            stays self-serve.
          </p>
          <Button asChild variant="dark" className="mt-6">
            <Link href="/guides">Read guides</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12 overflow-hidden rounded-3xl bg-ink px-6 py-10 text-white md:px-10">
        <h2 className="text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">
          Ready to talk?
        </h2>
        <p className="mt-3 max-w-xl text-sm text-white/70 md:text-base">
          Message us on WhatsApp with your background and goal. Chat for basic
          questions is free, and so is your first profile evaluation. Paid
          packages come next when you want us to do the work.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="whatsapp">
            <a
              href={whatsappLink(
                "Hi! I'd like to talk about consultancy services on Parwaaz."
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="size-[18px]" />
              Message on WhatsApp
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-white text-ink hover:bg-white/90"
          >
            <Link href="/contact">Contact details</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
