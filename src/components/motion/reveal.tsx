"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "cn";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
};

export function Reveal({
  className,
  delay = 0,
  y = 18,
  children,
  ...props
}: RevealProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
