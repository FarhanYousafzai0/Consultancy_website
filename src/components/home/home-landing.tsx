"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { AfterEvaluation } from "@/components/home/after-evaluation";
import { HeroFlight } from "@/components/home/hero-flight";
import { HomeFaq } from "@/components/home/home-faq";
import { IntroVideo } from "@/components/home/intro-video";
import { LateNightQuestions } from "@/components/home/late-night-questions";
import { StudentStories } from "@/components/home/student-stories";
import { PackagesGrid } from "@/components/home/packages-grid";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";

const whoWeArePoints = [
  {
    title: "Built for Pakistani degrees",
    text: "4-year BS, 2-year BA/BSc, CGPA or percentage: your evaluation is based on the degree you actually have.",
  },
  {
    title: "Germany only",
    text: "Master's programmes at public and private universities, plus the scholarships for them. One country, known in depth.",
  },
  {
    title: "Facts with a source",
    text: "Every deadline and requirement on this site links to its official source and shows when it was last checked.",
  },
  {
    title: "Free until you want more",
    text: "The tools and your evaluation are free. You only pay if you ask me to handle your applications or review your LOM and CV, and you see the fee in writing first.",
  },
];

/**
 * Hand-drawn arrow curling into the main button from the left. It draws itself
 * once the hero has faded in, then nudges toward the button. Decorative only.
 */
function HeroArrow() {
  const reduceMotion = useReducedMotion();
  const draw = (delay: number) =>
    reduceMotion
      ? { initial: false as const }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 0.7, delay, ease: [0.65, 0, 0.35, 1] as const },
        };

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 80"
      fill="none"
      className="pointer-events-none absolute right-full bottom-1/2 mr-1 h-11 w-14 text-lime-ink md:mr-2 md:h-16 md:w-24"
      animate={reduceMotion ? undefined : { x: [0, 5, 0], y: [0, 2, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
    >
      <motion.path
        d="M6 6 C 10 38, 34 62, 88 60"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        {...draw(1.1)}
      />
      <motion.path
        d="M74 48 L 90 60 L 73 70"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(1.75)}
      />
    </motion.svg>
  );
}

export function HomeLanding() {
  return (
    <>
      {/* No background. The flight runs the full screen width right under the header
          (outside the max-width box); the text stays centred at the usual width.
          overflow-hidden clips the plane as it flies off the right edge. */}
      <section data-home-hero className="relative overflow-hidden px-4 pt-2 md:px-6">
        <HeroFlight />
        <div className="relative mx-auto max-w-[90rem] pb-4 text-center md:pb-6">
          <motion.div
            className="relative z-10 w-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mx-auto mt-1 max-w-5xl text-[40px] leading-[0.92] font-extrabold tracking-[-0.045em] text-balance sm:text-5xl md:text-6xl lg:text-7xl">
              Fill in a short form to find out if you&rsquo;re eligible to study in Germany{" "}
              <span className="whitespace-nowrap text-lime-ink">for free.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-foreground/70 md:text-lg">
              No tuition fees at most public universities. Send me your degree, grades and English
              score, and I&rsquo;ll tell you honestly which programmes you can get into.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <MagneticWrap className="relative">
                <HeroArrow />
                <Button asChild size="lg" className="pr-2">
                  <Link href="/consultation">
                    Get my free evaluation
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
                  className="bg-muted text-foreground hover:bg-border"
                >
                  <Link href="/scholarships">Find scholarships</Link>
                </Button>
              </MagneticWrap>
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium text-foreground/75">
              {["Free, no card needed", "Takes about 5 minutes", "Reply on WhatsApp within 24 hours"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle weight="fill" className="size-4 text-forest" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <IntroVideo />

      <LateNightQuestions />

      <StudentStories />

      <AfterEvaluation />

      <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
        <div>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="section-label justify-center">Packages</p>
            <h2 className="mt-4 text-3xl font-bold text-balance md:text-5xl md:leading-[1.05]">
              Start free. Pay only if you want more.
            </h2>
            <p className="mt-4 text-base text-balance text-foreground/70 md:text-lg">
              Every student starts with the free profile evaluation. Application handling and
              LOM / CV review are there if you want them, with the fee in writing first.
            </p>
          </Reveal>
          <PackagesGrid />
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

      <HomeFaq />

      <section className="mx-auto max-w-[90rem] px-4 pt-16 pb-4 md:px-6 md:pt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-muted">
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/40 blur-3xl" />
            <div className="relative px-6 py-12 md:px-12 md:py-16">
              <div className="mx-auto max-w-2xl text-center">
                <p className="section-label justify-center">Who we are</p>
                <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                  {site.name}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-foreground/75 md:text-base">
                  One consultancy, one goal: getting students from Pakistan into a master&rsquo;s
                  in Germany. Honest advice comes first, so you only spend money when it makes
                  sense. We advise; universities and German authorities decide.
                </p>
              </div>
              <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
                {whoWeArePoints.map((point) => (
                  <li key={point.title} className="rounded-2xl bg-white p-5 text-left">
                    <p className="font-semibold">{point.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{point.text}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex justify-center">
                <MagneticWrap>
                  <Button asChild size="lg" className="group">
                    <Link href="/consultation">
                      Get my free evaluation
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </MagneticWrap>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
