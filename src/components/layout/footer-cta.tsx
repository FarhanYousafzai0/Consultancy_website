"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  animate,
  AnimatePresence,
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

/** Route box. The SVG is stretched to the band, so x/y map to percentages. */
const VB_W = 1200;
const VB_H = 320;
const FLIGHT_SECONDS = 7;

type Route = {
  /** Wavy route that starts and ends off-screen, under the button. */
  d: string;
  /** Share of the route (0–1) where the plane "reaches Germany" and the flag flips. */
  germanyAt: number;
};

/** Desktop: gentle zig-zag with several soft bumps. */
const WIDE_ROUTE: Route = {
  d: "M -80 285 C 40 285, 120 245, 240 245 S 420 295, 540 295 S 720 245, 840 245 S 1020 295, 1140 295 S 1260 262, 1300 258",
  germanyAt: 0.72,
};

/** Phones: fewer, wider bumps so the zig-zag stays soft on a narrow screen. */
const NARROW_ROUTE: Route = {
  d: "M -80 292 C 100 292, 200 252, 380 252 S 620 300, 800 300 S 1060 252, 1300 262",
  germanyAt: 0.72,
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

/** Small rectangular flags (3 : 2) that ride above the plane. */
function PakistanFlag() {
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

function GermanyFlag() {
  return (
    <svg viewBox="0 0 36 24" className="size-full">
      <rect width="36" height="8" fill="#000000" />
      <rect y="8" width="36" height="8" fill="#dd0000" />
      <rect y="16" width="36" height="8" fill="#ffce00" />
    </svg>
  );
}

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

/** The wavy route, the trail drawn behind the plane, the plane and its flag. */
function FlightScene({ play, reduceMotion }: { play: boolean; reduceMotion: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const route = useRoute();
  const progress = useMotionValue(reduceMotion ? route.germanyAt : 0);
  const [inGermany, setInGermany] = useState(reduceMotion);
  const [germanyPoint, setGermanyPoint] = useState<{ x: number; y: number } | null>(null);

  // Where the "Germany point" sits on the current route.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const at = path.getPointAtLength(path.getTotalLength() * route.germanyAt);
    setGermanyPoint({ x: at.x, y: at.y });
  }, [route]);

  // Fly once, slowly, when the band comes into view.
  useEffect(() => {
    if (!play) return;
    if (reduceMotion) {
      progress.set(route.germanyAt);
      return;
    }
    const controls = animate(progress, 1, {
      duration: FLIGHT_SECONDS,
      delay: 0.4,
      ease: [0.35, 0, 0.35, 1],
    });
    return () => controls.stop();
  }, [play, reduceMotion, progress, route]);

  // Move the plane along the route and turn its nose with the curve; the flag
  // above it stays upright. The heading is worked out in screen pixels.
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
    <div ref={sceneRef} aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <mask
            id="footer-flight-trail"
            maskUnits="userSpaceOnUse"
            x="-200"
            y="0"
            width={VB_W + 400}
            height={VB_H}
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

      {/* Germany point: a small dot on the route that pulses when the plane arrives. */}
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
            : { left: "-10%", top: pct(285, VB_H), opacity: 0 }
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
        className="relative flex flex-col items-center px-5 pt-20 pb-36 text-center md:px-8 md:pt-24 md:pb-36"
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
