"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { Airplane, ArrowUpRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-button";

/** Pages where "Start the check" would point to the page itself. */
const HIDDEN_ON = ["/check"];

/** Arc from Pakistan (left) over the heading to Germany (right), in a 1200 × 320 box. */
const VB_W = 1200;
const VB_H = 320;
const FLIGHT_SECONDS = 5.5;

type Route = { start: { x: number; y: number }; end: { x: number; y: number }; d: string };

/** Desktop: a tall arc over the heading. */
const WIDE_ROUTE: Route = {
  start: { x: 80, y: 248 },
  end: { x: 1120, y: 248 },
  d: "M 80 248 C 260 -40, 940 -40, 1120 248",
};

/** Phones: the heading fills the width, so the plane flies a low arc under the button. */
const NARROW_ROUTE: Route = {
  start: { x: 140, y: 285 },
  end: { x: 1060, y: 285 },
  d: "M 140 285 C 400 215, 800 215, 1060 285",
};

function useRoute(): Route {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide ? WIDE_ROUTE : NARROW_ROUTE;
}

/** Pakistan flag, drawn for a round badge. */
function PakistanFlag() {
  return (
    <svg viewBox="0 0 36 36" className="size-full">
      <rect width="36" height="36" fill="#ffffff" />
      <rect x="9" width="27" height="36" fill="#01411c" />
      <circle cx="23" cy="18" r="8" fill="#ffffff" />
      <circle cx="25.4" cy="16.4" r="6.9" fill="#01411c" />
      <path
        d="M27.6 12.4 L28.4 14.9 L31 14.9 L28.9 16.4 L29.7 18.9 L27.6 17.4 L25.5 18.9 L26.3 16.4 L24.2 14.9 L26.8 14.9 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

/** Germany flag, drawn for a round badge. */
function GermanyFlag() {
  return (
    <svg viewBox="0 0 36 36" className="size-full">
      <rect width="36" height="12" fill="#000000" />
      <rect y="12" width="36" height="12" fill="#dd0000" />
      <rect y="24" width="36" height="12" fill="#ffce00" />
    </svg>
  );
}

function FlagPin({
  at,
  label,
  arrived = false,
  children,
}: {
  at: { x: number; y: number };
  label: string;
  arrived?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-[18px] flex-col items-center gap-1.5 md:-translate-y-[22px]"
      style={{ left: `${(at.x / VB_W) * 100}%`, top: `${(at.y / VB_H) * 100}%` }}
    >
      <span className="relative">
        <motion.span
          className="block size-9 overflow-hidden rounded-full ring-2 ring-white/80 md:size-11"
          animate={arrived ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.span>
        {arrived ? (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 2.4 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ) : null}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
        {label}
      </span>
    </div>
  );
}

/** The arc, the trail drawn behind the plane, the plane and the two flags. */
function FlightScene({ play, reduceMotion }: { play: boolean; reduceMotion: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(reduceMotion ? 1 : 0);
  const [arrived, setArrived] = useState(false);
  const route = useRoute();

  // Fly once, slowly, when the band comes into view.
  useEffect(() => {
    if (!play) return;
    if (reduceMotion) {
      progress.set(1);
      return;
    }
    const controls = animate(progress, 1, {
      duration: FLIGHT_SECONDS,
      delay: 0.5,
      ease: [0.42, 0, 0.3, 1],
    });
    return () => controls.stop();
  }, [play, reduceMotion, progress]);

  // Move and turn the plane along the arc. The SVG stretches to the band, so
  // viewBox units map to percentages; the heading is worked out in screen pixels.
  useMotionValueEvent(progress, "change", (v) => {
    const path = pathRef.current;
    const plane = planeRef.current;
    const scene = sceneRef.current;
    if (v >= 0.985) setArrived(true);
    if (!path || !plane || !scene) return;

    const length = path.getTotalLength();
    const at = path.getPointAtLength(v * length);
    const ahead = path.getPointAtLength(Math.min(length, v * length + 2));
    const behind = path.getPointAtLength(Math.max(0, v * length - 2));
    const { width, height } = scene.getBoundingClientRect();
    const dx = (ahead.x - behind.x) * (width / VB_W);
    const dy = (ahead.y - behind.y) * (height / VB_H);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // the icon's nose points up
    const fade = v < 0.04 ? v / 0.04 : v > 0.93 ? Math.max(0, (1 - v) / 0.07) : 1;

    plane.style.left = `${(at.x / VB_W) * 100}%`;
    plane.style.top = `${(at.y / VB_H) * 100}%`;
    plane.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    plane.style.opacity = String(fade);
  });

  return (
    <div ref={sceneRef} aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        <defs>
          <mask
            id="footer-flight-trail"
            maskUnits="userSpaceOnUse"
            x="0"
            y="-60"
            width={VB_W}
            height={VB_H + 120}
          >
            <motion.path
              d={route.d}
              fill="none"
              stroke="white"
              strokeWidth="24"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </mask>
        </defs>
        {/* Faint full route, then the lime trail the plane leaves behind. */}
        <path
          ref={pathRef}
          d={route.d}
          fill="none"
          stroke="white"
          strokeOpacity="0.14"
          strokeWidth="1.5"
          strokeDasharray="2 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={route.d}
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.85"
          strokeWidth="2"
          strokeDasharray="2 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          mask="url(#footer-flight-trail)"
        />
      </svg>

      <FlagPin at={route.start} label="Pakistan">
        <PakistanFlag />
      </FlagPin>
      <FlagPin at={route.end} label="Germany" arrived={arrived}>
        <GermanyFlag />
      </FlagPin>

      {reduceMotion ? null : (
        <div
          ref={planeRef}
          className="absolute text-primary drop-shadow-[0_4px_10px_rgb(212_245_106/0.35)]"
          style={{
            left: `${(route.start.x / VB_W) * 100}%`,
            top: `${(route.start.y / VB_H) * 100}%`,
            opacity: 0,
          }}
        >
          <Airplane weight="fill" className="size-7 md:size-9" />
        </div>
      )}
    </div>
  );
}

/** "Ready to start?" band at the top of the site footer. */
export function FooterCta() {
  const pathname = usePathname() ?? "/";
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion() ?? false;

  if (HIDDEN_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  return (
    <div ref={ref} className="relative overflow-hidden border-b border-white/10">
      <FlightScene play={inView} reduceMotion={reduceMotion} />

      <motion.div
        className="relative flex flex-col items-center px-5 pt-20 pb-36 text-center md:px-8 md:pt-24 md:pb-28"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{
          duration: reduceMotion ? 0 : 0.6,
          delay: reduceMotion ? 0 : 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/50">
          Ready to start?
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold text-balance md:text-5xl md:leading-[1.05]">
          Find out if you can study in Germany — free, in 60 seconds
        </h2>
        <MagneticWrap className="mt-8">
          <Button asChild size="lg" className="group pr-2">
            <Link href="/check">
              Start the check
              <span className="grid size-9 place-items-center rounded-full bg-ink text-primary transition-transform duration-200 group-hover:rotate-45">
                <ArrowUpRight weight="bold" className="size-4" />
              </span>
            </Link>
          </Button>
        </MagneticWrap>
      </motion.div>
    </div>
  );
}
