"use client";

import Link from "next/link";
import { ArrowRight, Check, CheckCircle, Handshake } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";

const fullProcess = [
  "A final shortlist of programmes you can actually get into",
  "Your motivation letter and German-format CV, written for those programmes",
  "Applications prepared and submitted through uni-assist or the university portal",
  "Every deadline tracked, so nothing is missed",
  "A step-by-step visa checklist. You file it yourself; I tell you exactly what and when.",
];

/** One dotted path from the evaluation pill into the card (desktop only). */
function Path() {
  return (
    <svg aria-hidden viewBox="0 0 2 40" className="hidden h-14 w-2 text-foreground/25 md:block">
      <path
        d="M1 0 V40"
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

export function AfterEvaluation() {
  return (
    <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="section-label justify-center">Your next step</p>
        <h2 className="mt-4 text-3xl font-bold text-balance md:text-5xl md:leading-[1.05]">
          What happens after your evaluation
        </h2>
        <p className="mt-4 text-base text-foreground/70 md:text-lg">
          You know where you stand, and nobody chases you. When you&rsquo;re ready to apply, you
          can hand the whole process to me.
        </p>
      </Reveal>

      <div className="mx-auto mt-10 max-w-5xl">
        <Reveal delay={0.05} className="flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold shadow-card">
            <span className="grid size-5 place-items-center rounded-full bg-primary text-ink">
              <Check weight="bold" className="size-3" />
            </span>
            Your free evaluation
          </span>
          <Path />
        </Reveal>

        <Reveal delay={0.1} className="mt-6 md:mt-0">
          <article className="relative grid overflow-hidden rounded-[2rem] border border-border bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover md:grid-cols-[1fr_1.1fr]">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-primary/30 blur-3xl"
            />

            {/* Offer */}
            <div className="relative flex flex-col p-7 md:p-10">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-ink shadow-card">
                <Handshake className="size-6" />
              </span>
              <h3 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-balance md:text-[2rem] md:leading-[1.1]">
                Hand me the whole admission process
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/70 md:text-base">
                From shortlist to admission letter. You stay in the loop on WhatsApp and I do the
                work.
              </p>

              <div className="mt-6 rounded-2xl bg-muted px-4 py-3.5 text-sm">
                <span className="font-semibold">One fixed fee.</span>{" "}
                <span className="text-foreground/70">
                  You see it in writing before you pay anything.
                </span>
              </div>

              <div className="mt-auto pt-8">
                <MagneticWrap>
                  <Button asChild size="lg" className="group">
                    <Link href="/consultation">
                      Get my free evaluation
                      <ArrowRight
                        weight="bold"
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </Button>
                </MagneticWrap>
              </div>
            </div>

            {/* What's included */}
            <div className="relative border-t border-border bg-muted/60 p-7 md:border-t-0 md:border-l md:p-10">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                What I handle
              </p>
              <ul className="mt-5 space-y-4">
                {fullProcess.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-snug text-foreground/85">
                    <CheckCircle weight="fill" className="mt-0.5 size-5 shrink-0 text-forest" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
