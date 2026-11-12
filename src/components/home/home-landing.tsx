"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { AfterEvaluation } from "@/components/home/after-evaluation";
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
            <h1 className="mx-auto max-w-5xl text-[40px] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl md:text-6xl lg:text-7xl">
              Study your Master&rsquo;s at a German public university{" "}
              <span className="text-primary">for free.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/80 md:text-lg">
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
                  className="bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
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
