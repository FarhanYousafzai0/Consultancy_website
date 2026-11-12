"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Check,
  CheckCircle,
  Compass,
  Exam,
  Handshake,
  Translate,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";

const freeResources = [
  { label: "IELTS guide", icon: Exam },
  { label: "TOEFL guide", icon: Translate },
  { label: "Germany Guide ebook", icon: BookOpenText },
];

const fullProcess = [
  "A final shortlist of programmes you can actually get into",
  "Your motivation letter and German-format CV, written for those programmes",
  "Applications prepared and submitted through uni-assist or the university portal",
  "Every deadline tracked, so nothing is missed",
  "A step-by-step visa checklist. You file it yourself; I tell you exactly what and when.",
];

/** Two dotted paths from the evaluation pill down to each option (desktop only). */
function Branches() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="hidden h-14 w-full text-foreground/25 md:block"
    >
      <path
        d="M50 0 C50 22, 25 18, 25 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M50 0 C50 22, 75 18, 75 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function OptionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-white px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground shadow-card">
      {children}
    </span>
  );
}

export function AfterEvaluation() {
  return (
    <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="section-label justify-center">Your next step</p>
        <h2 className="mt-4 text-3xl font-bold text-balance md:text-5xl md:leading-[1.05]">
          After your evaluation, you choose
        </h2>
        <p className="mt-4 text-base text-foreground/70 md:text-lg">
          Nobody chases you. Both options are fine with me.
        </p>
      </Reveal>

      <div className="mx-auto mt-10 max-w-5xl">
        {/* Fork: the evaluation splits into two paths */}
        <Reveal delay={0.05} className="flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold shadow-card">
            <span className="grid size-5 place-items-center rounded-full bg-primary text-ink">
              <Check weight="bold" className="size-3" />
            </span>
            Your free evaluation
          </span>
          <Branches />
        </Reveal>

        <div className="mt-6 grid gap-5 md:mt-0 md:grid-cols-2">
          {/* Option 1 — do it yourself */}
          <Reveal delay={0.1} className="h-full">
            <article className="group flex h-full flex-col rounded-[2rem] bg-muted p-7 transition-transform duration-300 hover:-translate-y-1 md:p-9">
              <div className="flex items-center justify-between">
                <OptionTag>Option 1</OptionTag>
                <span className="grid size-11 place-items-center rounded-2xl bg-white text-forest shadow-card">
                  <Compass className="size-5" />
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">
                Do it yourself
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/70">
                Plenty of students do. Take your shortlist, use the free IELTS and TOEFL guides
                and the Germany Guide ebook on this site, and apply.
              </p>

              <ul className="mt-6 space-y-2.5">
                {freeResources.map(({ label, icon: Icon }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium"
                  >
                    <Icon className="size-4 text-forest" />
                    {label}
                    <span className="ml-auto rounded-full bg-primary-200 px-2 py-0.5 text-[11px] font-semibold text-forest">
                      Free
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Link
                  href="/guides"
                  className="inline-flex items-center gap-2 text-[15px] font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Open the free resources
                  <ArrowRight
                    weight="bold"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">No charge and no hard feelings.</p>
              </div>
            </article>
          </Reveal>

          {/* Option 2 — hand over the whole process */}
          <Reveal delay={0.16} className="h-full">
            <article className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover md:p-9">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-primary/30 blur-3xl"
              />
              <div className="relative flex items-center justify-between">
                <OptionTag>Option 2</OptionTag>
                <span className="grid size-11 place-items-center rounded-2xl bg-primary text-ink shadow-card">
                  <Handshake className="size-5" />
                </span>
              </div>
              <h3 className="relative mt-6 text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">
                Hand me the whole admission process
              </h3>
              <p className="relative mt-3 text-[15px] leading-relaxed text-foreground/70">
                From shortlist to admission letter. You stay in the loop on WhatsApp and I do the
                work.
              </p>

              <ul className="relative mt-6 space-y-3">
                {fullProcess.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-snug text-foreground/85">
                    <CheckCircle weight="fill" className="mt-0.5 size-5 shrink-0 text-forest" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-7 rounded-2xl bg-muted px-4 py-3.5 text-sm">
                <span className="font-semibold">One fixed fee.</span>{" "}
                <span className="text-foreground/70">
                  You see it in writing before you pay anything.
                </span>
              </div>

              <div className="relative mt-auto pt-7">
                <MagneticWrap>
                  <Button asChild size="lg" className="group">
                    <Link href="/consultation">
                      Start with the free evaluation
                      <ArrowRight
                        weight="bold"
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </Button>
                </MagneticWrap>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
