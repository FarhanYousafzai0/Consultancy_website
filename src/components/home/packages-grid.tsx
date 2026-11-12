"use client";

import { motion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import { PackageCta } from "@/components/services/package-cta";
import { servicePackages, type ServicePackage } from "@/data/services";

function PackageCard({ pkg }: { pkg: ServicePackage }) {
  return (
    <motion.article
      data-package-card
      role="listitem"
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="relative flex w-[min(340px,82vw)] shrink-0 snap-start flex-col self-stretch rounded-[24px] bg-white p-6 text-ink md:w-auto"
    >
      {pkg.badge ? (
        <span className="absolute top-5 right-5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-ink">
          {pkg.badge}
        </span>
      ) : null}
      <h3 className={`text-lg font-bold text-forest ${pkg.badge ? "pr-24" : ""}`}>
        {pkg.title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{pkg.summary}</p>
      <div className="my-5 h-px shrink-0 bg-border" />
      <ul className="min-h-0 flex-1 space-y-2.5">
        {pkg.includes.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground/85">
            <CheckCircle
              weight="fill"
              className="mt-0.5 size-4 shrink-0 text-forest"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto shrink-0 pt-6">
        <PackageCta pkg={pkg} className="w-full" />
      </div>
    </motion.article>
  );
}

/** Three packages: swipe row on mobile, 3-column grid from md up. */
export function PackagesGrid() {
  return (
    <div
      className="scrollbar-none -mx-5 mt-10 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
      role="list"
      aria-label="Consultancy packages"
    >
      {servicePackages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}
