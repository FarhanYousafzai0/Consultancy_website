"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ChatCircleDots,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { PackagesGrid } from "@/components/home/packages-grid";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { aboutIntro, aboutPoints } from "@/data/about";
import { successStories } from "@/data/success-stories";
import { site } from "@/lib/site";

const steps = [
  {
    n: "01",
    title: "Answer 5 questions",
    text: "Degree, grade, field, and English score. No sign-up.",
    card: "bg-primary-200",
    num: "text-forest",
    place: "lg:max-w-sm lg:justify-self-start",
  },
  {
    n: "02",
    title: "Get an honest answer",
    text: "Ready for a Master's now, a few steps away — or not yet.",
    card: "bg-slate-soft",
    num: "text-slate-ink",
    place: "lg:mt-32 lg:max-w-sm lg:justify-self-end",
  },
  {
    n: "03",
    title: "See what fits",
    text: "Reach, Match, and Safety against published requirements.",
    card: "bg-amber-soft",
    num: "text-amber-ink",
    place: "lg:max-w-sm lg:justify-self-start",
  },
  {
    n: "04",
    title: "Ask a consultant",
    text: "WhatsApp a real person with your result. The check itself stays free.",
    card: "bg-whatsapp/15",
    num: "text-whatsapp-dark",
    place: "lg:mt-32 lg:max-w-sm lg:justify-self-end",
  },
];

const featuredStory = successStories[0]!;
const secondStory = successStories[1]!;

type StepAnchor = { x: number; y: number };

function CheckSteps() {
  const listRef = useRef<HTMLOListElement>(null);
  const shown = useInView(listRef, { once: true, amount: 0.12 });
  const reduceMotion = useReducedMotion();
  const [trail, setTrail] = useState<{
    d: string;
    anchors: StepAnchor[];
    width: number;
    height: number;
  } | null>(null);
  const stagger = reduceMotion ? 0 : 0.2;
  const enter = reduceMotion ? 0 : 0.55;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const draw = () => {
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      const cards = [...list.querySelectorAll<HTMLElement>("[data-step-card]")];
      if (!wide || cards.length < 2) {
        setTrail(null);
        return;
      }

      const bounds = list.getBoundingClientRect();
      const boxes = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          left: rect.left - bounds.left,
          right: rect.right - bounds.left,
          midY: rect.top - bounds.top + rect.height / 2,
        };
      });
      const first = boxes[0];
      const second = boxes[1];
      if (!first || !second || second.left - first.right < 120) {
        setTrail(null);
        return;
      }

      const anchors = boxes.map((box, index) => ({
        x: index % 2 === 0 ? box.right + 10 : box.left - 10,
        y: box.midY,
      }));
      let d = `M ${anchors[0]!.x} ${anchors[0]!.y}`;
      for (let index = 1; index < anchors.length; index += 1) {
        const previous = anchors[index - 1]!;
        const next = anchors[index]!;
        const bend = (previous.x + next.x) / 2;
        d += ` C ${bend} ${previous.y}, ${bend} ${next.y}, ${next.x} ${next.y}`;
      }
      setTrail({ d, anchors, width: bounds.width, height: bounds.height });
    };

    draw();
    const timers = [160, 420, 800].map((ms) => window.setTimeout(draw, ms));
    const observer = new ResizeObserver(draw);
    observer.observe(list);
    list.querySelectorAll("[data-step-card]").forEach((card) => observer.observe(card));
    window.addEventListener("resize", draw);
    document.fonts?.ready.then(draw).catch(() => undefined);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, []);

  return (
    <ol
      ref={listRef}
      className="relative mx-auto mt-16 grid max-w-5xl gap-5 lg:grid-cols-2 lg:gap-x-32 lg:gap-y-14"
    >
      {trail ? (
        <svg
          className="pointer-events-none absolute inset-0 hidden h-full w-full text-ink/40 lg:block"
          aria-hidden
        >
          <defs>
            <mask
              id="check-step-trail"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={trail.width}
              height={trail.height}
            >
              <motion.path
                d={trail.d}
                fill="none"
                stroke="white"
                strokeWidth="16"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: shown ? 1 : 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 1.45,
                  delay: reduceMotion ? 0 : 0.12,
                  ease: [0.45, 0, 0.2, 1],
                }}
              />
            </mask>
          </defs>
          <path
            d={trail.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeDasharray="1.6 12"
            mask="url(#check-step-trail)"
          />
          {trail.anchors.map((point, index) => (
            <motion.circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r="5.5"
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2 }}
              transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : 0.08 + index * stagger,
              }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          ))}
        </svg>
      ) : null}
      {steps.map(({ n, title, text, card, num, place }, index) => (
        <li key={title} className={place}>
          <motion.article
            data-step-card
            className={`relative z-10 rounded-[1.75rem] p-6 shadow-card md:p-8 ${card}`}
            initial={{ opacity: 0, y: 36 }}
            animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
            transition={{
              duration: enter,
              delay: shown ? index * stagger : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className={`font-display text-[4.25rem] leading-none font-semibold tracking-[-0.045em] md:text-[4.75rem] ${num}`}>
              {n}
            </p>
            <h3 className="mt-4 text-xl font-bold tracking-[-0.02em] text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{text}</p>
          </motion.article>
        </li>
      ))}
    </ol>
  );
}

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
                4-year BS, 2-year vs 4-year degrees, CGPA conversion, and HEC attestation.
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

      <section className="relative mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-label justify-center">How the free check works</p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            Four steps. About one minute.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Answer a few questions about your degree and scores. We tell you if you can apply, which programmes fit, and a consultant is there if you want one.
          </p>
        </Reveal>
        <CheckSteps />
        <div className="mt-16 flex justify-center lg:mt-20">
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
            <div className="relative mx-4 mb-4 rounded-3xl bg-ink px-6 py-10 text-center text-white md:mx-6 md:mb-6 md:px-12 md:py-12">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/50">
                Ready to start?
              </p>
              <h3 className="mx-auto mt-3 max-w-xl text-2xl font-bold md:text-3xl">
                Find out if you can study in Germany — free, in 60 seconds
              </h3>
              <div className="mt-6 flex justify-center">
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
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
