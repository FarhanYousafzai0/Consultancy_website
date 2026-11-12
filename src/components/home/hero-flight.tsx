"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { Airplane } from "@phosphor-icons/react";
import { GermanyFlag, PakistanFlag } from "@/components/motion/flight-path";

/**
 * Hero flight (light background). Sits under the hero buttons, full width.
 * Plays once on page load: the plane flies in from the left carrying a Pakistan
 * flag, the flag flips to Germany about halfway, and the plane keeps going off
 * the right edge. The dotted trail and the Germany point stay lit.
 *
 * Separate from the footer's FlightPath so the hero can have its own look.
 * Route coordinates are in a 1200 × 320 box that stretches to the strip.
 */

const VB_W = 1200;
const VB_H = 320;
// Starts almost at once so visitors see it straight away.
const DURATION = 5;
const DELAY = 0.1;

type Route = { d: string; germanyAt: number };

/** Desktop: soft waves from off-screen left to off-screen right. */
const WIDE: Route = {
  d: "M -80 250 C 60 250, 160 140, 320 140 S 560 250, 720 250 S 980 140, 1120 150 S 1250 210, 1300 215",
  germanyAt: 0.55,
};

/** Phones: fewer, wider waves. */
const NARROW: Route = {
  d: "M -80 262 C 80 262, 200 150, 420 150 S 820 240, 1000 200 S 1220 150, 1300 160",
  germanyAt: 0.5,
};

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

export function HeroFlight() {
  const reduceMotion = useReducedMotion() ?? false;
  const route = useWide() ? WIDE : NARROW;
  const maskId = `hero-flight-${useId().replace(/:/g, "")}`;

  const sceneRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(reduceMotion ? 1 : 0);
  const [inGermany, setInGermany] = useState(reduceMotion);
  const [germanyPoint, setGermanyPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const at = path.getPointAtLength(path.getTotalLength() * route.germanyAt);
    setGermanyPoint({ x: at.x, y: at.y });
  }, [route]);

  // Fly once on page load.
  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }
    const controls = animate(progress, 1, {
      duration: DURATION,
      delay: DELAY,
      ease: [0.35, 0, 0.35, 1],
    });
    return () => controls.stop();
  }, [reduceMotion, progress, route]);

  // Move the plane and turn its nose with the curve; the flag stays upright.
  useMotionValueEvent(progress, "change", (v) => {
    if (v >= route.germanyAt) setInGermany(true);
    const path = pathRef.current;
    const plane = planeRef.current;
    const icon = iconRef.current;
    const scene = sceneRef.current;
    if (!path || !plane || !icon || !scene) return;

    const length = path.getTotalLength();
    const at = path.getPointAtLength(v * length);
    const ahead = path.getPointAtLength(Math.min(length, v * length + 2));
    const behind = path.getPointAtLength(Math.max(0, v * length - 2));
    const { width, height } = scene.getBoundingClientRect();
    const dx = (ahead.x - behind.x) * (width / VB_W);
    const dy = (ahead.y - behind.y) * (height / VB_H);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // the icon's nose points up

    plane.style.left = pct(at.x, VB_W);
    plane.style.top = pct(at.y, VB_H);
    plane.style.opacity = "1";
    icon.style.transform = `rotate(${angle}deg)`;
  });

  return (
    // Negative margins cancel the hero's side padding so the route runs edge to edge.
    <div
      ref={sceneRef}
      aria-hidden
      className="pointer-events-none relative -mx-4 h-24 md:-mx-6 md:h-32"
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="-200"
            y="-40"
            width={VB_W + 400}
            height={VB_H + 80}
          >
            <motion.path
              d={route.d}
              fill="none"
              stroke="white"
              strokeWidth="30"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </mask>
        </defs>
        {/* Faint full route, then the green trail the plane leaves behind. */}
        <path
          ref={pathRef}
          d={route.d}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.15"
          strokeWidth="1.5"
          strokeDasharray="2 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={route.d}
          fill="none"
          stroke="var(--forest)"
          strokeWidth="2.25"
          strokeDasharray="2 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Germany point: lime dot with a pulse when the plane passes. */}
      {germanyPoint ? (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(germanyPoint.x, VB_W), top: pct(germanyPoint.y, VB_H) }}
        >
          <span
            className={`block size-3 rounded-full ring-2 ring-white transition-colors duration-500 ${
              inGermany ? "bg-primary" : "bg-ink/20"
            }`}
          />
          {inGermany && !reduceMotion ? (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-forest"
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 4 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          ) : null}
        </span>
      ) : null}

      {/* The plane, with its flag riding above it. */}
      {reduceMotion ? null : (
        <div
          ref={planeRef}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: "-10%", top: "50%", opacity: 0 }}
        >
          <div className="absolute bottom-full left-1/2 mb-1.5 h-[15px] w-[22px] -translate-x-1/2 [perspective:200px] md:h-[17px] md:w-[26px]">
            {/* No "wait" mode: the German flag flips in the moment the plane passes the point. */}
            <AnimatePresence initial={false}>
              <motion.span
                key={inGermany ? "de" : "pk"}
                className="absolute inset-0 overflow-hidden rounded-[3px] shadow-[0_2px_6px_rgb(15_17_16/0.25)] ring-1 ring-ink/10"
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: -90 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {inGermany ? <GermanyFlag /> : <PakistanFlag />}
              </motion.span>
            </AnimatePresence>
          </div>
          <div
            ref={iconRef}
            className="text-ink drop-shadow-[0_6px_10px_rgb(15_17_16/0.2)]"
            style={{ transform: "rotate(90deg)" }}
          >
            <Airplane weight="fill" className="size-7 md:size-8" />
          </div>
        </div>
      )}
    </div>
  );
}
