"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Compass,
  FileMagnifyingGlass,
  Wallet,
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
    icon: GraduationCap,
    label: "YOUR STARTING POINT",
    title: "Built for Pakistani degrees",
    text: "4-year BS, 2-year BA/BSc, CGPA or percentage: your evaluation is based on the degree you actually have.",
  },
  {
    icon: Compass,
    label: "OUR FOCUS",
    title: "Germany only",
    text: "Master's programmes at public and private universities, plus the scholarships for them. One country, known in depth.",
  },
  {
    icon: FileMagnifyingGlass,
    label: "HOW WE WORK",
    title: "Facts with a source",
    text: "Every deadline and requirement on this site links to its official source and shows when it was last checked.",
  },
  {
    icon: Wallet,
    label: "NO SURPRISES",
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
  const reduceMotion = useReducedMotion();
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
                  className="border border-[#c2c7bc] bg-muted text-foreground hover:border-[#9aa392] hover:bg-border"
                >
                  <Link href="/scholarships"><GraduationCap aria-hidden="true" className="size-5" />Find scholarships</Link>
                </Button>
              </MagneticWrap>
              <MagneticWrap>
                <Button
                  asChild
                  size="lg"
                  className="border border-[#c2c7bc] bg-muted text-foreground hover:border-[#9aa392] hover:bg-border"
                >
                  <Link href="/internships"><Briefcase aria-hidden="true" className="size-5" />Find internships</Link>
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
          <div className="relative overflow-hidden rounded-[2rem] bg-[#e9eee8]">
            <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative px-6 py-12 md:px-12 md:py-16">
              <div className="text-center">
                <p className="section-label">Who we are</p>
              </div>
              <h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-extrabold leading-[1.04] tracking-[-0.04em] md:text-5xl">
                Your journey, <span className="text-lime-ink">clearly mapped.</span>
              </h2>
              <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div className="flex flex-col items-start lg:pt-6">
                <p className="max-w-md text-base leading-relaxed text-foreground/75">
                  {site.name} helps students from Pakistan understand their path to a master&rsquo;s in Germany. We advise; universities and German authorities decide.
                </p>
                <div className="relative mt-7 w-full max-w-sm overflow-hidden rounded-2xl border border-forest/10 bg-white/65 px-5 py-4">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-forest/70">YOUR JOURNEY</p>
                  <svg aria-hidden="true" viewBox="0 0 320 62" fill="none" className="mt-2 h-16 w-full overflow-visible">
                    <path d="M16 31 C 80 -4, 135 64, 200 29 S 278 8, 304 31" stroke="currentColor" className="text-forest/25" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
                    <motion.circle cx="16" cy="31" r="5" className="fill-forest" initial={false} whileInView={reduceMotion ? undefined : { scale: [1, 1.3, 1] }} viewport={{ once: true }} transition={{ duration: 0.7 }} />
                    <circle cx="304" cy="31" r="9" className="fill-primary" />
                    <circle cx="304" cy="31" r="3" className="fill-forest" />
                  </svg>
                  <div className="flex justify-between text-xs font-bold text-forest"><span>Pakistan</span><span>Germany</span></div>
                </div>
                <div className="mt-7">
                  <MagneticWrap><Button asChild size="lg" className="group"><Link href="/consultation">Get my free evaluation<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></Link></Button></MagneticWrap>
                </div>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {whoWeArePoints.map((point, index) => (
                  <li key={point.title} className="group relative flex min-h-44 flex-col rounded-2xl border border-forest/10 bg-white/80 p-5 transition-colors hover:border-forest/30 hover:bg-white md:p-6">
                    <div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-xl bg-[#e9f4db] text-forest"><point.icon aria-hidden="true" weight="duotone" className="size-6" /></span><span aria-hidden="true" className="font-mono text-xs text-forest/40">0{index + 1}</span></div>
                    <p className="mt-5 text-[10px] font-bold tracking-[0.15em] text-forest/65">{point.label}</p>
                    <h3 className="mt-1 text-base font-bold tracking-tight">{point.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/65">{point.text}</p>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
