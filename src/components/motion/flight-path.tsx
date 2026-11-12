"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { Airplane } from "@phosphor-icons/react";

/**
 * Pakistan → Germany flight: a dotted route that lights up lime behind a plane.
 * A small Pakistan flag rides above the plane and flips to Germany at the
 * "Germany point". Used in the home hero (lands and stays) and the footer
 * (flies off-screen).
 *
 * The SVG is stretched to its box, so route coordinates (in a VB_W × VB_H box)
 * map straight to percentages of the box.
 */

export const VB_W = 1200;
export const VB_H = 320;

export type FlightRoute = {
  /** SVG path in the 1200 × 320 box. Start off-screen (x < 0) so the plane flies in. */
  d: string;
  /** Share of the route (0–1) where the flag flips. 1 = the end of the route. */
  germanyAt: number;
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

/** Small rectangular flags (3 : 2) that ride above the plane. */
export function PakistanFlag() {
  return (
    <svg viewBox="0 0 36 24" className="size-full">
      <rect width="36" height="24" fill="#ffffff" />
      <rect x="9" width="27" height="24" fill="#01411c" />
      <circle cx="22.5" cy="12" r="6" fill="#ffffff" />
      <circle cx="24.3" cy="10.8" r="5.2" fill="#01411c" />
      <path
        d="M26.2 7.6 L26.8 9.4 L28.7 9.4 L27.2 10.5 L27.8 12.3 L26.2 11.2 L24.7 12.3 L25.3 10.5 L23.8 9.4 L25.6 9.4 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function GermanyFlag() {
  return (
    <svg viewBox="0 0 36 24" className="size-full">
      <rect width="36" height="8" fill="#000000" />
      <rect y="8" width="36" height="8" fill="#dd0000" />
      <rect y="16" width="36" height="8" fill="#ffce00" />
    </svg>
  );
}

export function FlightPath({
  play,
  reduceMotion,
  wide,
  narrow,
  duration = 7,
  delay = 0.4,
  routeOpacity = 0.14,
}: {
  /** Start flying (once). */
  play: boolean;
  reduceMotion: boolean;
  /** Route from 768px up. */
  wide: FlightRoute;
  /** Route on phones. */
  narrow: FlightRoute;
  duration?: number;
  delay?: number;
  /** Opacity of the faint full route before the plane lights it up. */
  routeOpacity?: number;
}) {
  const maskId = `flight-trail-${useId().replace(/:/g, "")}`;
  const sceneRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const route = useWide() ? wide : narrow;
  const progress = useMotionValue(reduceMotion ? route.germanyAt : 0);
  const [inGermany, setInGermany] = useState(reduceMotion);
  const [germanyPoint, setGermanyPoint] = useState<{ x: number; y: number } | null>(null);

  // Where the Germany point sits on the current route.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const at = path.getPointAtLength(path.getTotalLength() * route.germanyAt);
    setGermanyPoint({ x: at.x, y: at.y });
  }, [route]);

  // Fly once.
  useEffect(() => {
    if (!play) return;
    if (reduceMotion) {
      progress.set(route.germanyAt);
      return;
    }
    const controls = animate(progress, 1, { duration, delay, ease: [0.35, 0, 0.35, 1] });
    return () => controls.stop();
  }, [play, reduceMotion, progress, route, duration, delay]);

  // Move the plane and turn its nose with the curve; the flag stays upright.
  useMotionValueEvent(progress, "change", (v) => {
    if (v >= route.germanyAt - 0.001) setInGermany(true);
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
    <div ref={sceneRef} aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-200" y="-40" width={VB_W + 400} height={VB_H + 80}>
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
        {/* Faint full route, then the lime trail the plane leaves behind (it stays). */}
        <path
          ref={pathRef}
          d={route.d}
          fill="none"
          stroke="white"
          strokeOpacity={routeOpacity}
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
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Germany point: a small dot that pulses when the plane arrives. */}
      {germanyPoint ? (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(germanyPoint.x, VB_W), top: pct(germanyPoint.y, VB_H) }}
        >
          <span
            className={`block size-2.5 rounded-full transition-colors duration-500 ${
              inGermany ? "bg-primary" : "bg-white/30"
            }`}
          />
          {inGermany && !reduceMotion ? (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={{ opacity: 0.9, scale: 1 }}
              animate={{ opacity: 0, scale: 4 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          ) : null}
        </span>
      ) : null}

      {/* The plane, with its flag riding above it. */}
      <div
        ref={planeRef}
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={
          reduceMotion && germanyPoint
            ? { left: pct(germanyPoint.x, VB_W), top: pct(germanyPoint.y, VB_H) }
            : { left: "-10%", top: "50%", opacity: 0 }
        }
      >
        <div className="absolute bottom-full left-1/2 mb-1.5 h-[15px] w-[22px] -translate-x-1/2 [perspective:200px] md:h-[17px] md:w-[26px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={inGermany ? "de" : "pk"}
              className="block size-full overflow-hidden rounded-[3px] shadow-[0_2px_8px_rgb(0_0_0/0.4)] ring-1 ring-white/40"
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
          className="text-primary drop-shadow-[0_4px_10px_rgb(212_245_106/0.35)]"
          style={{ transform: "rotate(90deg)" }}
        >
          <Airplane weight="fill" className="size-7 md:size-8" />
        </div>
      </div>
    </div>
  );
}
