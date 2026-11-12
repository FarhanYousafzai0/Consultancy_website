"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
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
import { aboutIntro, aboutPoints } from "@/data/about";
import { site } from "@/lib/site";

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
              Study your Master&rsquo;s at a German public university{" "}
              <span className="whitespace-nowrap text-primary">for free.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-foreground/70 md:text-lg">
              Most public universities in Germany charge no tuition fees. Get your free profile
              evaluation and know exactly where you stand. I reply on WhatsApp within 24 hours.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <MagneticWrap>
                <Button asChild size="lg" className="pr-2">
                  <Link href="/consultation">
                    Get your free profile evaluation
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
                  <Link href="/check">Check my eligibility</Link>
                </Button>
              </MagneticWrap>
            </div>
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
              Choose the help you need
            </h2>
            <p className="mt-4 text-base text-balance text-foreground/70 md:text-lg">
              Start with a free profile evaluation. Then choose the help you
              want, or do it yourself.
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
                  {aboutIntro}
                </p>
              </div>
              <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
                {aboutPoints.map((point) => (
                  <li key={point.title} className="rounded-2xl bg-white p-5 text-left">
                    <p className="font-semibold">{point.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{point.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
