"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";

/**
 * YouTube video ID for the founder's 3–5 minute intro (the part after `v=`).
 * Leave empty until the video is recorded: the section then shows a placeholder.
 */
const INTRO_VIDEO_ID = "0-MSMuCZiIA";

const TITLE = "How studying for free in Germany actually works, and who qualifies";

function VideoPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[1.25rem] border border-dashed border-border bg-muted px-6 text-center">
      <span
        aria-hidden
        className="grid size-16 place-items-center rounded-full bg-primary text-ink shadow-card md:size-20"
      >
        <Play weight="fill" className="size-6 translate-x-0.5 md:size-7" />
      </span>
      <p className="max-w-sm text-sm text-muted-foreground">
        Video coming soon: a 3 to 5 minute walk-through of who qualifies for a
        tuition-free Master&rsquo;s in Germany.
      </p>
    </div>
  );
}

function VideoPlayer({ id }: { id: string }) {
  // Load YouTube only after a click, so the home page stays fast.
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="size-full rounded-[1.25rem]"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={TITLE}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${TITLE}`}
      className="group relative size-full overflow-hidden rounded-[1.25rem] bg-black outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-primary text-ink shadow-card transition-transform group-hover:scale-105 md:size-20">
          <Play weight="fill" className="size-6 translate-x-0.5 md:size-7" />
        </span>
      </span>
    </button>
  );
}

export function IntroVideo() {
  return (
    <section className="mx-auto max-w-[90rem] px-4 pt-16 md:px-6 md:pt-24">
      <div>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-label justify-center">Watch this first</p>
          <h2 className="mt-4 text-3xl font-bold text-balance md:text-4xl">
            How studying for free in Germany actually works, and who qualifies
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-10 aspect-video w-full max-w-4xl">
          {INTRO_VIDEO_ID ? <VideoPlayer id={INTRO_VIDEO_ID} /> : <VideoPlaceholder />}
        </Reveal>

        <div className="mt-10 flex justify-center">
          <MagneticWrap>
            <Button asChild size="lg" className="group">
              <Link href="/consultation">
                Get your free profile evaluation
                <ArrowRight weight="bold" className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </MagneticWrap>
        </div>
      </div>
    </section>
  );
}
