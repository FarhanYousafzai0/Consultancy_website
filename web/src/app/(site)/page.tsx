import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  ChatCircleDots,
  CheckCircle,
  GraduationCap,
  ListChecks,
  MagnifyingGlass,
  Student,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { whatsappLink } from "@/lib/site";

const goals = [
  {
    goal: "masters",
    title: "Master's",
    description: "I have (or will have) a BS / BSc degree",
    icon: GraduationCap,
  },
  {
    goal: "bachelors",
    title: "Bachelor's",
    description: "I have FSc, HSSC or A-levels",
    icon: Student,
  },
  {
    goal: "ausbildung",
    title: "Ausbildung",
    description: "Paid vocational training in Germany",
    icon: Briefcase,
  },
];

const steps = [
  {
    icon: ListChecks,
    title: "Answer 5 quick questions",
    text: "Your degree, grade, field and English score. No sign-up needed.",
  },
  {
    icon: CheckCircle,
    title: "Get an honest answer",
    text: "Can you apply directly, or do you need Studienkolleg (a one-year foundation course) or APS first? We tell you straight.",
  },
  {
    icon: MagnifyingGlass,
    title: "See programs you can get into",
    text: "Matched against each program's published requirements, grouped into Reach, Match and Safety.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-4 md:px-6 md:pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#dcebf7_0%,#f4f8ec_60%,#eefbc9_100%)] px-5 py-10 md:px-12 md:py-16">
          <p className="section-label">For Pakistani students</p>
          <h1 className="mt-5 max-w-3xl text-[34px] leading-[1.05] font-extrabold tracking-[-0.03em] md:text-6xl">
            Study in Germany.
            <br />
            <span className="text-forest">Know where you stand.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-foreground/75 md:text-lg">
            Find out in 60 seconds if you can study in Germany — and which programs you can actually get into. Verified data. Real consultants.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="pr-2">
              <Link href="/check">
                Check my eligibility
                <span className="grid size-9 place-items-center rounded-full bg-ink text-primary">
                  <ArrowUpRight weight="bold" className="size-4" />
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/programs">
                <MagnifyingGlass />
                Browse programs
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {goals.map(({ goal, title, description, icon: Icon }) => (
              <Link
                key={goal}
                href={`/check?goal=${goal}`}
                className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover md:p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted transition-colors group-hover:bg-primary">
                  <Icon className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm text-muted-foreground">{description}</span>
                </span>
                <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust cards */}
      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
        <p className="section-label">Why students trust us</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold md:text-4xl">
          Honest answers, built on verified data
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex min-h-52 flex-col justify-between rounded-2xl bg-muted p-6">
            <Badge variant="verified" className="bg-white">
              <CheckCircle weight="bold" /> Verified · source linked
            </Badge>
            <p className="text-lg font-semibold leading-snug">
              Every deadline and requirement has a source link and a verified date.
            </p>
          </div>
          <div className="flex min-h-52 flex-col justify-between rounded-2xl bg-primary p-6">
            <p className="text-sm font-medium">Free forever</p>
            <div>
              <p className="text-5xl font-bold tracking-[-0.03em]">100%</p>
              <p className="mt-2 text-sm">Eligibility check and matching are never behind a paywall.</p>
            </div>
          </div>
          <div className="flex min-h-52 flex-col justify-between rounded-2xl bg-ink p-6 text-white">
            <p className="text-sm text-white/60">Built for Pakistan</p>
            <p className="text-lg font-semibold leading-snug">
              FSc, HSSC, A-levels, 2-year vs 4-year degrees and APS — the rules that actually apply to you.
            </p>
          </div>
          <div className="flex min-h-52 flex-col justify-between rounded-2xl bg-muted p-6">
            <span className="grid size-11 place-items-center rounded-full bg-white">
              <ChatCircleDots className="size-5" />
            </span>
            <p className="text-lg font-semibold leading-snug">
              A real consultant is one tap away on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
        <p className="section-label">How it works</p>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">Three steps, about a minute</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-2xl bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-full bg-primary">
                  <Icon className="size-6" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
        <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-ink p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/50">Ready?</p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold md:text-4xl">
              Find out where you stand — free, in 60 seconds.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="pr-2">
              <Link href="/check">
                Start the check
                <span className="grid size-9 place-items-center rounded-full bg-ink text-primary">
                  <ArrowUpRight weight="bold" className="size-4" />
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="whatsapp">
              <Link
                href={whatsappLink("Hi! I'd like help applying to Germany.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="text-white" />
                Let&apos;s have a chat!
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
