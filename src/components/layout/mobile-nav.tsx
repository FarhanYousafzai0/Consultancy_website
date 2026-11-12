"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accordion } from "radix-ui";
import { motion } from "motion/react";
import { ArrowRight, CaretDown, List } from "@phosphor-icons/react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navGroups } from "./nav-links";

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const defaultOpen = navGroups.find((g) => g.links.some((l) => pathname.startsWith(l.href) && l.href !== "/"))?.label;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-full bg-muted transition-[background-color,transform] active:scale-90 hover:bg-primary lg:hidden"
        >
          <List weight="bold" className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] max-w-sm gap-0 overflow-y-auto p-0">
        <div className="border-b border-border px-5 py-4">
          <SheetTitle className="text-base font-extrabold">Menu</SheetTitle>
          <p className="text-xs text-muted-foreground">Master&apos;s in Germany, step by step</p>
        </div>

        <div className="space-y-2 px-4 py-4">
          <Button asChild size="lg" className="w-full justify-between pr-2" onClick={() => setOpen(false)}>
            <Link href="/check">
              Check eligibility
              <span className="grid size-8 place-items-center rounded-full bg-ink text-primary">
                <ArrowRight weight="bold" className="size-4" />
              </span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full" onClick={() => setOpen(false)}>
            <Link href="/consultation">Request consultation</Link>
          </Button>
        </div>

        <Accordion.Root type="single" collapsible defaultValue={defaultOpen ?? navGroups[0]?.label} className="px-2 pb-6">
          {navGroups.map((group) => (
            <Accordion.Item key={group.label} value={group.label} className="border-b border-border last:border-0">
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left text-[15px] font-semibold outline-none focus-visible:bg-muted">
                  {group.label}
                  <CaretDown weight="bold" className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <ul className={cn("relative pb-3", group.journey && "pl-1")}>
                  {group.journey ? (
                    <span aria-hidden className="absolute bottom-8 left-[26px] top-5 border-l-2 border-dotted border-ink/40" />
                  ) : null}
                  {group.links.map((link, i) => {
                    const Icon = link.icon;
                    const active = pathname === link.href;
                    return (
                      <motion.li
                        key={link.href + link.label}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i, duration: 0.2 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors active:scale-[0.98] hover:bg-muted",
                            active && "bg-primary/15"
                          )}
                        >
                          <span
                            className={cn(
                              "relative grid size-8 shrink-0 place-items-center bg-white text-foreground/80",
                              group.journey ? "rounded-full border border-border" : "rounded-lg bg-muted"
                            )}
                          >
                            <Icon className="size-4" />
                            {group.journey ? (
                              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary font-mono text-[10px] font-bold">
                                {i + 1}
                              </span>
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">{link.label}</span>
                            {link.description ? (
                              <span className="block truncate text-xs text-muted-foreground">{link.description}</span>
                            ) : null}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        {!signedIn ? (
          <div className="mt-auto border-t border-border px-5 py-4 text-sm">
            <Link href="/login" onClick={() => setOpen(false)} className="font-semibold text-forest">
              Log in
            </Link>
            <span className="text-muted-foreground"> to see your saved shortlist.</span>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
