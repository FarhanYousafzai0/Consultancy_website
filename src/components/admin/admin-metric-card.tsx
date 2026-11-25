"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, ChartLineUp, ClipboardText, Clock, Lightning } from "@phosphor-icons/react";

type Tone = "lime" | "blue" | "mint" | "teal";
type IconName = "clipboard" | "clock" | "trend" | "lightning" | "book";

const tones: Record<Tone, { card: string; icon: string; border: string }> = {
  lime: { card: "bg-[#dafa76]", icon: "bg-[#efffb9]", border: "border-[#c8ec61]" },
  blue: { card: "bg-[#c7dafa]", icon: "bg-[#e8f0ff]", border: "border-[#b5ccef]" },
  mint: { card: "bg-[#bfead3]", icon: "bg-[#e3f8ec]", border: "border-[#abdfc3]" },
  teal: { card: "bg-[#bde5e3]", icon: "bg-[#e3f6f5]", border: "border-[#a7d8d6]" },
};

export function AdminMetricCard({ label, value, hint, icon, href, tone }: { label: string; value: number; hint: string; icon: IconName; href: string; tone: Tone }) {
  const colors = tones[tone];
  const icons = { clipboard: ClipboardText, clock: Clock, trend: ChartLineUp, lightning: Lightning, book: BookOpen };
  const Icon = icons[icon];
  return (
    <Link href={href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
      <motion.div whileHover={{ y: -4, scale: 1.012 }} whileTap={{ scale: 0.988 }} transition={{ type: "spring", stiffness: 420, damping: 24 }} className={`h-full rounded-[1.25rem] border p-5 shadow-card transition-shadow group-hover:shadow-card-hover ${colors.card} ${colors.border}`}>
        <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-ink/70">{label}</p><p className="mt-3 text-4xl font-extrabold tracking-[-0.06em] text-ink">{value}</p></div><span className={`grid size-10 place-items-center rounded-2xl ${colors.icon}`}><Icon className="size-5 text-ink" /></span></div>
        <p className="mt-4 text-xs font-medium text-ink/65">{hint}</p>
      </motion.div>
    </Link>
  );
}
