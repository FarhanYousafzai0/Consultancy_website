"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "cn";

export function MagneticWrap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 280, damping: 18, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.22);
        y.set((e.clientY - r.top - r.height / 2) * 0.22);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
