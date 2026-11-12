"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Play,
  Quotes,
  SealCheck,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { testimonials, type Testimonial } from "@/data/testimonials";
import { cn } from "cn";

/** Soft site tints, one per card, so the three proof panels read as a set. */
const tints = ["bg-primary-200", "bg-slate-soft", "bg-amber-soft"];

function initials(name: string) {
  return name.slice(0, 1).toUpperCase();
}

/* ---------- Proof panels ---------- */

function LetterProof({ t }: { t: Testimonial }) {
  return (
    <div className="relative grid h-full place-items-center p-6">
      <div className="w-[82%] -rotate-3 rounded-xl bg-white p-4 shadow-card-hover transition-transform duration-500 group-hover:rotate-0 group-hover:scale-[1.02]">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          Letter of admission
        </p>
        <p className="mt-1 text-sm font-bold text-ink">{t.university}</p>
        <div aria-hidden className="mt-3 space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-muted" />
          <div className="h-1.5 w-5/6 rounded-full bg-muted" />
          <div className="h-1.5 w-2/3 rounded-full bg-muted" />
        </div>
        <p className="mt-3 text-xs text-foreground/70">
          {t.programme} · {t.intake}
        </p>
      </div>
      <span className="absolute right-[10%] bottom-[14%] rotate-[10deg] rounded-full border-2 border-forest bg-primary px-3 py-1 font-mono text-[11px] font-bold tracking-[0.12em] text-forest shadow-card transition-transform duration-500 group-hover:rotate-0">
        ADMITTED
      </span>
    </div>
  );
}

function WhatsAppProof({ messages }: { messages: { from: "student" | "parwaaz"; text: string }[] }) {
  return (
    <div className="flex h-full flex-col justify-end gap-2 p-5">
      {messages.map((m, i) => (
        <p
          key={i}
          className={cn(
            "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug shadow-card transition-transform duration-500",
            m.from === "student"
              ? "self-end rounded-br-md bg-whatsapp-dark text-white group-hover:-translate-x-1"
              : "self-start rounded-bl-md bg-white text-ink group-hover:translate-x-1"
          )}
        >
          {m.text}
          <span className="ml-2 inline-flex translate-y-0.5 items-center text-[10px] opacity-70">
            {m.from === "student" ? <CheckCircle weight="fill" className="size-3" /> : null}
          </span>
        </p>
      ))}
    </div>
  );
}

function VideoProof({ t, youtubeId, duration }: { t: Testimonial; youtubeId?: string; duration?: string }) {
  const [playing, setPlaying] = useState(false);

  if (youtubeId && playing) {
    return (
      <iframe
        className="size-full"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title={`${t.firstName}'s story`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  const content = (
    <>
      {youtubeId ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail
        <img
          src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center font-display text-[7rem] leading-none font-semibold text-ink/[0.07]"
        >
          {initials(t.firstName)}
        </span>
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-14 place-items-center rounded-full bg-ink text-primary shadow-card-hover transition-transform duration-300 group-hover:scale-110">
          <Play weight="fill" className="size-5 translate-x-0.5" />
        </span>
      </span>
      {duration ? (
        <span className="absolute right-3 bottom-3 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[11px] text-white">
          {duration}
        </span>
      ) : null}
    </>
  );

  return youtubeId ? (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${t.firstName}'s story`}
      className="relative size-full"
    >
      {content}
    </button>
  ) : (
    <div className="relative size-full">{content}</div>
  );
}

function Proof({ t }: { t: Testimonial }) {
  const { proof } = t;
  if (proof.kind !== "video" && proof.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- student-supplied screenshot
      <img src={proof.image} alt={`${t.firstName}'s ${proof.kind === "letter" ? "admission letter" : "message"}`} className="size-full object-cover" />
    );
  }
  if (proof.kind === "letter") return <LetterProof t={t} />;
  if (proof.kind === "whatsapp") return <WhatsAppProof messages={proof.messages} />;
  return <VideoProof t={t} youtubeId={proof.youtubeId} duration={proof.duration} />;
}

/* ---------- Card ---------- */

function StoryCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <article className="group relative flex h-full flex-col rounded-[1.75rem] border border-border bg-white p-2.5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
      <div className={cn("relative aspect-[4/3] overflow-hidden rounded-[1.35rem]", tints[index % tints.length])}>
        <Proof t={t} />
        {t.sample ? (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur-sm">
            Sample story
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
        <Quotes weight="fill" aria-hidden className="size-7 text-primary" />
        <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-foreground/85">
          {t.quote}
        </blockquote>

        <div className="mt-6 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-bold text-primary">
            {initials(t.firstName)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 font-semibold">
              {t.firstName}
              {t.sample ? null : (
                <SealCheck weight="fill" aria-label="Verified student" className="size-4 text-forest" />
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {t.bachelors} · CGPA {t.cgpa}
            </p>
          </div>
        </div>

        {/* Where they started → where they got in */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-muted p-3">
          <ArrowRight weight="bold" aria-hidden className="size-4 shrink-0 text-forest" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{t.programme}</p>
            <p className="truncate text-xs text-muted-foreground">{t.university}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-forest">
            {t.intake}
          </span>
        </div>
      </div>
    </article>
  );
}

export function StudentStories() {
  return (
    <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="section-label justify-center">Student stories</p>
        <h2 className="mt-4 text-3xl font-bold text-balance md:text-5xl md:leading-[1.05]">
          Students who started exactly where you are
        </h2>
      </Reveal>

      <div
        className="scrollbar-none -mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0"
        role="list"
      >
        {testimonials.map((t, index) => (
          <Reveal
            key={t.id}
            delay={index * 0.08}
            role="listitem"
            className="w-[min(340px,84vw)] shrink-0 snap-start md:w-auto"
          >
            <StoryCard t={t} index={index} />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
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
  );
}
