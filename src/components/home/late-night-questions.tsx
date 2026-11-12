"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpLeft,
  LockSimple,
  MagnifyingGlass,
  Microphone,
  MoonStars,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "cn";

const questions = [
  "Is my CGPA enough for a public university?",
  "Do I need IELTS, or will an MOI letter work?",
  "APS first, or apply first?",
  "uni-assist or directly to the university?",
  "Does my study gap kill my chances?",
  "Which intake can I still make?",
];

type Phase = "typing" | "searching" | "pause" | "deleting";

/** Milliseconds per step of the typing loop. */
const TIMING = {
  start: 500,
  type: () => 35 + Math.random() * 40,
  searching: 650,
  pause: 1100,
  delete: 14,
};

/**
 * Types each question into the search box one by one, "searches" it, adds it to
 * the suggestion list, deletes it and moves on. Loops once every question is in.
 */
function useTypingLoop(active: boolean, reduceMotion: boolean) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [revealed, setRevealed] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const target = questions[index]!;
    let timer: number;

    if (phase === "typing") {
      const delay = !started.current ? TIMING.start : TIMING.type();
      started.current = true;
      timer = window.setTimeout(() => {
        if (text.length < target.length) {
          setText(target.slice(0, text.length + 1));
        } else {
          setPhase("searching");
        }
      }, delay);
    } else if (phase === "searching") {
      timer = window.setTimeout(() => {
        setRevealed((count) => Math.max(count, index + 1));
        setPhase("pause");
      }, TIMING.searching);
    } else if (phase === "pause") {
      timer = window.setTimeout(() => setPhase("deleting"), TIMING.pause);
    } else {
      timer = window.setTimeout(() => {
        if (text.length > 0) {
          setText(text.slice(0, -1));
        } else {
          setIndex((index + 1) % questions.length);
          setPhase("typing");
        }
      }, TIMING.delete);
    }

    return () => window.clearTimeout(timer);
  }, [active, reduceMotion, index, text, phase]);

  if (reduceMotion) {
    return { index: -1, text: questions[0]!, phase: "pause" as Phase, revealed: questions.length };
  }
  return { index, text, phase, revealed };
}

/** Google's "G" mark, drawn inline so it stays crisp at any size. */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function BrowserSearch() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion() ?? false;
  const { index, text, phase, revealed } = useTypingLoop(inView, reduceMotion);
  const target = questions[index] ?? text;
  const query = text.trim().toLowerCase().replace(/[?,]/g, "").replace(/\s+/g, "+");

  return (
    // min-w-0: lets the grid column shrink so the long address-bar URL truncates on phones.
    <Reveal delay={0.08} className="min-w-0">
      <div
        ref={ref}
        className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-card-hover"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
          <div aria-hidden className="flex shrink-0 gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-muted-foreground">
            <LockSimple weight="bold" className="size-3 shrink-0" />
            <span className="truncate">
              google.com/search?q=<span className="text-foreground/80">{query}</span>
            </span>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 font-mono text-xs text-muted-foreground sm:inline-flex">
            <MoonStars weight="fill" className="size-3.5 text-forest" />
            2:07 AM
          </span>
        </div>

        <div className="p-4 md:p-6">
          {/* Search box with suggestions dropdown */}
          <div className="rounded-[1.6rem] border border-border bg-white shadow-card">
            <div aria-hidden className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-3.5">
              <GoogleG className="size-5 shrink-0" />
              {/* The whole question shows light; letters turn dark as they are "typed". */}
              <p className="min-w-0 flex-1 truncate text-[15px] md:text-base">
                <span className="text-foreground">{text}</span>
                <span className="mx-px inline-block h-[1.15em] w-[2px] translate-y-[3px] parwaz-caret bg-foreground" />
                <span className="text-foreground/30">{target.slice(text.length)}</span>
              </p>
              <Microphone weight="fill" className="size-5 shrink-0 text-forest" />
            </div>
            <div
              aria-hidden
              className={cn(
                "mx-4 h-0.5 overflow-hidden rounded-full bg-transparent md:mx-5",
                phase === "searching" && "bg-muted"
              )}
            >
              <div
                className={cn(
                  "h-full w-1/3 rounded-full bg-primary",
                  phase === "searching" ? "animate-[search-sweep_0.7s_ease-in-out_infinite]" : "opacity-0"
                )}
              />
            </div>

            <ul className="border-t border-border px-2 py-2" aria-label="Questions students search for">
              {questions.map((question, i) => {
                const shown = i < revealed;
                const current = i === index && (phase === "searching" || phase === "pause");
                return (
                  <li
                    key={question}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-500",
                      // Not typed yet: ghosted, so the box never looks empty.
                      shown ? "opacity-100" : "opacity-35",
                      current && "bg-primary-200/60"
                    )}
                  >
                    <MagnifyingGlass
                      className={cn("size-4 shrink-0", current ? "text-forest" : "text-muted-foreground")}
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-sm md:text-[15px]",
                        current ? "font-semibold text-foreground" : "text-foreground/80"
                      )}
                    >
                      {question}
                    </span>
                    <ArrowUpLeft aria-hidden className="size-4 shrink-0 text-muted-foreground/60" />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function LateNightQuestions() {
  return (
    <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal>
          <p className="section-label">Sound familiar?</p>
          <h2 className="mt-4 text-3xl font-bold text-balance md:text-5xl md:leading-[1.05]">
            You&rsquo;ve probably Googled all of this at 2&nbsp;a.m.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/75 md:text-lg">
            Every one of these has a real answer. The catch is that the answer depends on{" "}
            <strong className="font-semibold text-foreground">your</strong> degree,{" "}
            <strong className="font-semibold text-foreground">your</strong> transcript and the
            exact programme.
          </p>
          <p className="mt-6 text-xl font-bold tracking-[-0.02em] md:text-2xl">
            A YouTube video can&rsquo;t see your transcript.{" "}
            <span className="whitespace-nowrap bg-[linear-gradient(transparent_58%,var(--primary)_58%)] px-0.5">
              I can.
            </span>
          </p>
          <MagneticWrap className="mt-8">
            <Button asChild size="lg" className="group">
              <Link href="/consultation">
                Get your free profile evaluation
                <ArrowRight
                  weight="bold"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Button>
          </MagneticWrap>
        </Reveal>

        <BrowserSearch />
      </div>
    </section>
  );
}
