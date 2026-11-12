"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-button";
import { FlightPath, type FlightRoute } from "@/components/motion/flight-path";

/** Pages where "Start the check" would point to the page itself. */
const HIDDEN_ON = ["/check"];

/** Footer: a gentle zig-zag under the button that runs off both edges; the plane flies off. */
const WIDE_ROUTE: FlightRoute = {
  d: "M -80 285 C 40 285, 120 245, 240 245 S 420 295, 540 295 S 720 245, 840 245 S 1020 295, 1140 295 S 1260 262, 1300 258",
  germanyAt: 0.72,
};

const NARROW_ROUTE: FlightRoute = {
  d: "M -80 292 C 100 292, 200 252, 380 252 S 620 300, 800 300 S 1060 252, 1300 262",
  germanyAt: 0.72,
};

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
      <FlightPath
        play={inView}
        reduceMotion={reduceMotion}
        wide={WIDE_ROUTE}
        narrow={NARROW_ROUTE}
        duration={7}
      />

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
