"use client";

import { useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "@phosphor-icons/react";
import { cn } from "cn";

type RailStep = {
  key: string;
  short: string;
  icon: ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>;
};

type Geometry = { x: number; ys: number[]; width: number; height: number };

const DOTS = "1.6 9";
const DOT_PERIOD = 10.6;

/**
 * Vertical step list joined by a dotted trail (same language as the home page's
 * "how it works" trail). The completed part of the trail draws in and flows toward
 * the current step; a marker glides between steps.
 */
export function StepRail({
  steps,
  current,
  maxReached,
  onSelect,
}: {
  steps: readonly RailStep[];
  current: number;
  maxReached: number;
  onSelect: (index: number) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const bounds = list.getBoundingClientRect();
      const centers = dotRefs.current.map((el) => {
        const r = el?.getBoundingClientRect();
        return r ? { x: r.left - bounds.left + r.width / 2, y: r.top - bounds.top + r.height / 2 } : null;
      });
      if (centers.some((c) => !c)) return;
      setGeo({
        x: centers[0]!.x,
        ys: centers.map((c) => c!.y),
        width: bounds.width,
        height: bounds.height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => observer.disconnect();
  }, [steps.length]);

  const first = geo?.ys[0] ?? 0;
  const last = geo?.ys[geo.ys.length - 1] ?? 0;
  const progress = geo && last > first ? (geo.ys[current]! - first) / (last - first) : 0;
  const trail = geo ? `M ${geo.x} ${first} L ${geo.x} ${last}` : "";
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 120, damping: 20, mass: 0.9 };

  return (
    <ol ref={listRef} className="relative space-y-1">
      {geo ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          width={geo.width}
          height={geo.height}
        >
          <defs>
            <mask id="step-rail-progress" maskUnits="userSpaceOnUse" x="0" y="0" width={geo.width} height={geo.height}>
              <motion.path
                d={trail}
                fill="none"
                stroke="white"
                strokeWidth="14"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress }}
                transition={spring}
              />
            </mask>
          </defs>
          {/* Upcoming: faint dots */}
          <path d={trail} fill="none" stroke="var(--border)" strokeWidth="2.25" strokeLinecap="round" strokeDasharray={DOTS} />
          {/* Completed: ink dots flowing toward the current step */}
          <motion.path
            d={trail}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeDasharray={DOTS}
            mask="url(#step-rail-progress)"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -DOT_PERIOD] }}
            transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
          />
          {/* Marker gliding to the current step */}
          <motion.circle
            cx={geo.x}
            r="5"
            fill="var(--primary)"
            stroke="var(--ink)"
            strokeWidth="2"
            initial={{ cy: geo.ys[0] }}
            animate={{ cy: geo.ys[current] }}
            transition={spring}
            style={{ opacity: current === 0 ? 0 : 1 }}
          />
        </svg>
      ) : null}

      {steps.map((s, i) => {
        const Icon = s.icon;
        const done = i < current;
        const active = i === current;
        const reachable = i <= maxReached;
        return (
          <li key={s.key} className="relative">
            <button
              type="button"
              disabled={!reachable || active}
              onClick={() => onSelect(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                !active && reachable && "hover:bg-white/70",
                !reachable && "cursor-default"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="step-rail-active"
                  className="absolute inset-0 rounded-xl bg-white shadow-card"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}

              <span
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className={cn(
                  "relative z-10 grid size-9 shrink-0 place-items-center rounded-full ring-4 ring-background transition-colors duration-300",
                  done && "bg-primary text-ink",
                  active && "bg-ink text-primary",
                  !done && !active && "border border-border bg-white text-muted-foreground"
                )}
              >
                {active && !reduceMotion ? (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-primary"
                    initial={{ scale: 1, opacity: 0.55 }}
                    animate={{ scale: 1.75, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                ) : null}
                  {done ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 22 }}
                      className="relative"
                    >
                      <Check weight="bold" className="size-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="icon"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: reduceMotion ? 0 : 0.18 }}
                      className="relative transition-transform group-hover:-rotate-6 group-hover:scale-110"
                    >
                      <Icon className="size-4" weight={active ? "bold" : "regular"} />
                    </motion.span>
                  )}
              </span>

              <span
                className={cn(
                  "relative flex-1 transition-[color,transform] duration-200",
                  active ? "font-semibold text-foreground" : reachable ? "text-foreground/80 group-hover:translate-x-0.5" : "text-muted-foreground/70"
                )}
              >
                {s.short}
              </span>
              <span
                className={cn(
                  "relative font-mono text-xs transition-colors",
                  active ? "text-foreground" : "text-muted-foreground/70"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
