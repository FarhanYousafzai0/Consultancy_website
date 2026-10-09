"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  packagePriceLabel,
  servicePackages,
  type ServicePackage,
} from "@/data/services";
import { whatsappLink } from "@/lib/site";
import { cn } from "cn";

function PackageCard({ pkg }: { pkg: ServicePackage }) {
  const price = packagePriceLabel(pkg);

  return (
    <motion.article
      data-package-card
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="relative flex min-h-[540px] w-[min(340px,82vw)] shrink-0 snap-start flex-col self-stretch rounded-[24px] bg-white p-6 text-ink md:w-[360px]"
    >
      {pkg.badge ? (
        <span className="absolute top-5 right-5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-ink">
          {pkg.badge}
        </span>
      ) : null}
      <h3 className="pr-24 text-lg font-bold text-forest">{pkg.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{pkg.summary}</p>
      <div className="mt-6 shrink-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {price.prefix}
        </p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-[-0.03em]">
            {price.amount}
          </span>
          <span className="text-sm text-muted-foreground">{price.suffix}</span>
        </p>
      </div>
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
        <Button asChild variant="dark" className="w-full">
          <a
            href={whatsappLink(pkg.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get started
          </a>
        </Button>
      </div>
    </motion.article>
  );
}

export function PackagesCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [ready, setReady] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setReady(true);
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-package-card]");
    const step = (card?.offsetWidth ?? 300) + 16;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="relative mt-10">
      <button
        type="button"
        aria-label="Previous packages"
        disabled={!ready || !canPrev}
        onClick={() => scrollByCard(-1)}
        className={cn(
          "absolute top-1/2 left-1 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-primary text-ink shadow-card transition-opacity md:left-2",
          ready && canPrev
            ? "opacity-100 hover:brightness-95"
            : "pointer-events-none opacity-30"
        )}
      >
        <CaretLeft weight="bold" className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next packages"
        disabled={!ready || !canNext}
        onClick={() => scrollByCard(1)}
        className={cn(
          "absolute top-1/2 right-1 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-primary text-ink shadow-card transition-opacity md:right-2",
          ready && canNext
            ? "opacity-100 hover:brightness-95"
            : "pointer-events-none opacity-30"
        )}
      >
        <CaretRight weight="bold" className="size-5" />
      </button>

      <div
        ref={scrollerRef}
        className="scrollbar-none flex items-stretch snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-12 pb-2 md:px-14"
        role="list"
        aria-label="Consultancy packages"
      >
        {servicePackages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </div>
  );
}
