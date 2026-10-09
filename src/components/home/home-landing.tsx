"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Bank,
  BookOpenText,
  Buildings,
  Calculator,
  ChatCircleDots,
  CheckCircle,
  GraduationCap,
  GlobeHemisphereWest,
  ListChecks,
  MagnifyingGlass,
  MapTrifold,
  Seal,
  Wrench,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { PackagesCarousel } from "@/components/home/packages-carousel";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { successStories } from "@/data/success-stories";
import { whatsappLink } from "@/lib/site";

const entries = [
  {
    href: "/programs?international=1",
    title: "International programmes",
    description: "Public and private universities — language, subject, and route.",
    kind: "programmes" as const,
  },
  {
    href: "/scholarships",
    title: "Scholarships for Germany",
    description: "DAAD and other funding, with honest odds for Pakistani students.",
    kind: "scholarships" as const,
  },
];

const steps = [
  {
    n: "01",
    icon: ListChecks,
    title: "Answer 5 questions",
    text: "Degree, grade, field, and English score. No sign-up.",
  },
  {
    n: "02",
    icon: CheckCircle,
    title: "Get an honest answer",
    text: "Direct entry, Studienkolleg, APS first — or not yet.",
  },
  {
    n: "03",
    icon: MagnifyingGlass,
    title: "See what fits",
    text: "Reach, Match, and Safety against published requirements.",
  },
];

const tools = [
  {
    value: "ausbildung",
    href: "/ausbildung",
    title: "Ausbildung",
    description:
      "Check German-level eligibility, then browse live Jobsuche listings. Self-serve — no placement handoff.",
    cta: "Open Ausbildung",
    icon: Wrench,
  },
  {
    value: "guides",
    href: "/guides",
    title: "Guides",
    description:
      "APS, blocked account, visa, uni-assist, anabin, and Studienkolleg — written in plain English.",
    cta: "Read guides",
    icon: BookOpenText,
  },
  {
    value: "grades",
    href: "/tools/grade-converter",
    title: "Grade converter",
    description:
      "Convert a Pakistani CGPA or percentage to a German grade with the modified Bavarian formula.",
    cta: "Convert grades",
    icon: Calculator,
  },
  {
    value: "cost",
    href: "/tools/cost-calculator",
    title: "Cost calculator",
    description:
      "Tuition, semester fee, blocked account, and living costs — so you can plan money honestly.",
    cta: "Estimate costs",
    icon: Buildings,
  },
];

const featuredStory = successStories[0]!;
const secondStory = successStories[1]!;

export function HomeLanding() {
  return (
    <>
      <section data-home-hero className="relative px-1.5 pt-2 md:px-2 md:pt-3">
        <div className="relative flex min-h-[min(92svh,920px)] flex-col justify-end overflow-hidden rounded-[1.25rem] px-5 pb-10 pt-24 text-center text-white md:min-h-[min(88svh,960px)] md:rounded-[1.75rem] md:px-12 md:pb-16 md:pt-28">
          <Image
            src="/hero-sky.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_20%]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_17_16/0.2)_0%,rgb(15_17_16/0.45)_45%,rgb(15_17_16/0.72)_100%)]"
            aria-hidden
          />
          <motion.div
            className="relative z-10 w-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mx-auto max-w-3xl text-[34px] leading-[1.05] font-extrabold tracking-[-0.03em] md:text-6xl">
              Study in Germany.
              <br />
              Know where you stand.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/80 md:text-lg">
              Check if you can study in Germany, then find programmes and scholarships that fit your Pakistani degree and scores.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <MagneticWrap>
                <Button asChild size="lg" className="pr-2">
                  <Link href="/check">
                    Check my eligibility
                    <span className="grid size-9 place-items-center rounded-full bg-ink text-primary">
                      <ArrowUpRight weight="bold" className="size-4" />
                    </span>
                  </Link>
                </Button>
              </MagneticWrap>
              <MagneticWrap>
                <Button
                  asChild
                  size="lg"
                  className="bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
                >
                  <Link href="/programs">
                    <MagnifyingGlass />
                    Browse programs
                  </Link>
                </Button>
              </MagneticWrap>
            </div>

            <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 text-left md:flex-row">
              {entries.map(({ href, title, description, kind }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-1 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors hover:bg-white/15"
                >
                  <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-primary text-ink">
                    {kind === "programmes" ? (
                      <>
                        <GlobeHemisphereWest className="size-5" />
                        <Bank className="absolute right-1.5 bottom-1.5 size-3" weight="bold" />
                      </>
                    ) : (
                      <>
                        <MapTrifold className="size-5" />
                        <Seal className="absolute right-1.5 bottom-1.5 size-3" weight="bold" />
                      </>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{title}</span>
                    <span className="mt-0.5 block text-sm text-white/70">
                      {description}
                    </span>
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-label justify-center">Why students trust us</p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            We check the facts before we show them
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Deadlines, fees, and language scores come from official pages — with a source link and the date we last checked.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-primary-200 p-6">
              <dt className="font-mono text-xs uppercase tracking-[0.08em] text-forest">
                Matching
              </dt>
              <dd className="mt-2 text-4xl font-extrabold tracking-[-0.03em]">100%</dd>
              <p className="mt-2 text-sm text-foreground/70">
                Eligibility check and matching stay free. Never behind a paywall.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-soft p-6">
              <dt className="font-mono text-xs uppercase tracking-[0.08em] text-slate-ink">
                Data
              </dt>
              <dd className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-slate-ink">
                Verified
              </dd>
              <p className="mt-2 text-sm text-slate-ink/80">
                Every deadline and requirement has a source and a last-checked date.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-soft p-6">
              <dt className="font-mono text-xs uppercase tracking-[0.08em] text-amber-ink">
                Built for
              </dt>
              <dd className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-amber-ink">
                Pakistan
              </dd>
              <p className="mt-2 text-sm text-amber-ink/80">
                FSc, HSSC, A-levels, 2-year vs 4-year degrees, and APS.
              </p>
            </div>
            <div className="rounded-2xl bg-whatsapp/20 p-6">
              <dt className="font-mono text-xs uppercase tracking-[0.08em] text-whatsapp-dark">
                Help
              </dt>
              <dd className="mt-2 flex items-center gap-2 text-4xl font-extrabold tracking-[-0.03em] text-whatsapp-dark">
                <ChatCircleDots className="size-8" />
                Live
              </dd>
              <p className="mt-2 text-sm text-whatsapp-dark/80">
                A real consultant is one tap away on WhatsApp.
              </p>
            </div>
          </dl>
        </Reveal>
        <div className="mt-8 flex justify-center">
          <MagneticWrap>
            <Button asChild variant="dark">
              <Link href="/how-we-verify">
                How we verify data
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </MagneticWrap>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-label justify-center">How the free check works</p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            Three steps. About one minute.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Answer a few questions about your degree and scores. We tell you if you can apply, and which programmes fit.
          </p>
        </Reveal>
        <ol className="relative mx-auto mt-12 max-w-3xl">
          <span
            className="absolute top-3 bottom-3 left-[15px] w-px bg-border md:left-[19px]"
            aria-hidden
          />
          {steps.map(({ n, icon: Icon, title, text }, i) => (
            <li key={title} className="relative flex gap-5 pb-10 last:pb-0">
              <Reveal delay={i * 0.08} className="flex w-full gap-5">
                <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-ink md:size-10">
                  <Icon className="size-4 md:size-5" weight="bold" />
                </span>
                <div className="pt-0.5">
                  <p className="font-mono text-xs text-muted-foreground">{n}</p>
                  <h3 className="mt-1 text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex justify-center">
          <MagneticWrap>
            <Button asChild size="lg" className="pr-2">
              <Link href="/check">
                Start the free check
                <span className="grid size-9 place-items-center rounded-full bg-ink text-primary">
                  <ArrowUpRight weight="bold" className="size-4" />
                </span>
              </Link>
            </Button>
          </MagneticWrap>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
        <div className="overflow-hidden rounded-[28px] bg-ink px-5 py-10 text-white md:px-10 md:py-14">
          <Reveal className="flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-primary">
                Packages
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-5xl">
                Choose the help you need
              </h2>
            </div>
            <p className="mx-auto max-w-sm text-sm text-white/65 md:mx-0 md:text-right">
              Free tools stay free. Paid packages start after a consultation.
              Message us for the current price.
            </p>
          </Reveal>
          <PackagesCarousel />
        </div>
        <div className="mt-8 flex justify-center">
          <MagneticWrap>
            <Button asChild variant="dark">
              <Link href="/services">
                See full package details
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </MagneticWrap>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-label justify-center">More free tools</p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            Ausbildung, guides, and calculators
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Use these on your own — no sign-up needed for most of them.
          </p>
        </Reveal>
        <Reveal delay={0.06} className="mx-auto mt-10 max-w-3xl">
          <Tabs defaultValue="ausbildung">
            <TabsList className="mx-auto h-auto min-h-11 w-full flex-wrap justify-center gap-1 rounded-full bg-muted p-1">
              {tools.map((tool) => (
                <TabsTrigger
                  key={tool.value}
                  value={tool.value}
                  className="h-auto flex-none rounded-full px-4 py-2 after:hidden data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  <tool.icon className="size-4" />
                  {tool.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {tools.map((tool) => (
              <TabsContent key={tool.value} value={tool.value} className="mt-8">
                <div className="flex flex-col items-center text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-primary text-ink">
                    <tool.icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-2xl font-bold">{tool.title}</h3>
                  <p className="mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
                    {tool.description}
                  </p>
                  <MagneticWrap className="mt-6">
                    <Button asChild variant="dark">
                      <Link href={tool.href}>
                        {tool.cta}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </MagneticWrap>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="section-label justify-center">Student stories</p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            How other Pakistani students used Parwaaz
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <blockquote className="mx-auto mt-10 max-w-3xl border-l-4 border-primary pl-6 text-left md:pl-8">
            <p className="text-xl leading-snug font-semibold tracking-[-0.02em] md:text-2xl">
              “{featuredStory.body}”
            </p>
            <footer className="mt-5 text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{featuredStory.initials}</span>
              {" · "}
              {featuredStory.path}
            </footer>
          </blockquote>
          <p className="mx-auto mt-8 max-w-3xl text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{secondStory.initials}</span>
            {" — "}
            {secondStory.body}
          </p>
        </Reveal>
        <div className="mt-8 flex justify-center">
          <MagneticWrap>
            <Button asChild variant="dark">
              <Link href="/stories">
                Read more stories
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </MagneticWrap>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-muted px-6 py-12 md:px-12 md:py-16">
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/40 blur-3xl" />
            <div className="relative mx-auto max-w-2xl text-center">
              <p className="section-label justify-center">Who we are</p>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                A Germany consultancy for Pakistani students
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-foreground/75 md:text-base">
                Free software helps you check eligibility and find programmes. When you need human help, a real consultant is on WhatsApp. Pakistan only at launch. Germany only.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  { icon: GraduationCap, text: "Master's, Bachelor's & Ausbildung" },
                  { icon: Seal, text: "Verified data" },
                  { icon: ChatCircleDots, text: "Free chat, paid packages later" },
                ].map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium"
                  >
                    <Icon className="size-4 text-forest" weight="bold" />
                    {text}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <MagneticWrap>
                  <Button asChild>
                    <Link href="/about">
                      About Parwaaz
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </MagneticWrap>
                <MagneticWrap>
                  <Button asChild variant="dark">
                    <Link href="/contact">Contact us</Link>
                  </Button>
                </MagneticWrap>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pt-16 pb-4 md:px-6 md:pt-24">
        <Reveal>
          <div className="rounded-3xl bg-ink px-6 py-10 text-center text-white md:px-12 md:py-14">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/50">
              Ready to start?
            </p>
            <h2 className="mx-auto mt-3 max-w-xl text-3xl font-bold md:text-4xl">
              Find out if you can study in Germany — free, in 60 seconds
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <MagneticWrap>
                <Button asChild size="lg" className="pr-2">
                  <Link href="/check">
                    Start the check
                    <span className="grid size-9 place-items-center rounded-full bg-ink text-primary">
                      <ArrowUpRight weight="bold" className="size-4" />
                    </span>
                  </Link>
                </Button>
              </MagneticWrap>
              <MagneticWrap>
                <Button asChild size="lg" variant="whatsapp">
                  <Link
                    href={whatsappLink("Hi! I'd like help applying to Germany.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon className="text-white" />
                    Chat on WhatsApp
                  </Link>
                </Button>
              </MagneticWrap>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
