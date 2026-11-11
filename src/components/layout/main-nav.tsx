"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "radix-ui";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, CaretDown } from "@phosphor-icons/react";
import { cn } from "cn";
import { navGroups, type NavGroup, type NavLink } from "./nav-links";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname() ?? "/";
  const [openMenu, setOpenMenu] = useState("");

  return (
    <NavigationMenu.Root
      aria-label="Main"
      className="relative hidden lg:block"
      delayDuration={80}
      value={openMenu}
      onValueChange={setOpenMenu}
    >
      <NavigationMenu.List className="flex items-center gap-0.5">
        {navGroups.map((group) => {
          const groupActive = group.links.some((l) => isActive(pathname, l.href));
          return (
            <NavigationMenu.Item key={group.label} value={group.label}>
              <NavigationMenu.Trigger
                data-nav-trigger=""
                onClick={(e) => {
                  // Clicking a trigger always opens its menu. Radix would toggle, so a click
                  // right after hover-open closed it again. Close with Esc, outside click or leave.
                  e.preventDefault();
                  setOpenMenu(group.label);
                }}
                className={cn(
                  "group relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 outline-none transition-colors",
                  "hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "data-[state=open]:bg-muted data-[state=open]:text-foreground"
                )}
              >
                {group.label}
                <CaretDown
                  weight="bold"
                  className="size-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
                {groupActive ? (
                  <span aria-hidden className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-forest" />
                ) : null}
              </NavigationMenu.Trigger>
              <NavigationMenu.Content
                onPointerDownOutside={(e) => {
                  // Clicking another menu trigger switches menus; don't treat it as "close".
                  if ((e.target as Element | null)?.closest?.("[data-nav-trigger]")) e.preventDefault();
                }}
                onFocusOutside={(e) => {
                  if ((e.target as Element | null)?.closest?.("[data-nav-trigger]")) e.preventDefault();
                }}
                className={cn(
                  "absolute left-0 top-0 w-auto p-3",
                  "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
                  "data-[motion=from-end]:slide-in-from-right-16 data-[motion=from-start]:slide-in-from-left-16",
                  "data-[motion=to-end]:slide-out-to-right-16 data-[motion=to-start]:slide-out-to-left-16"
                )}
              >
                <Panel group={group} pathname={pathname} />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          );
        })}
        <NavigationMenu.Indicator className="top-full z-[1] flex h-2 items-end justify-center overflow-hidden transition-[width,transform] duration-200 data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in">
          <div className="relative top-[60%] size-2.5 rotate-45 rounded-tl-sm border-l border-t border-border bg-white" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className="absolute left-1/2 top-full flex -translate-x-1/2 justify-center pt-2">
        <NavigationMenu.Viewport
          className={cn(
            "relative h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)] origin-[top_center] overflow-hidden rounded-3xl border border-border bg-white shadow-card-hover",
            "transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        />
      </div>
    </NavigationMenu.Root>
  );
}

function Panel({ group, pathname }: { group: NavGroup; pathname: string }) {
  if (group.journey) return <JourneyPanel group={group} pathname={pathname} />;

  return (
    <div className={cn("flex gap-3", group.feature ? "w-[740px]" : "w-[560px]")}>
      {group.feature ? (
        <NavigationMenu.Link asChild>
          <Link
            href={group.feature.href}
            className="group/feature relative flex w-[220px] shrink-0 flex-col justify-end overflow-hidden rounded-2xl bg-ink p-5 text-white outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <span aria-hidden className="absolute -right-10 -top-10 size-36 rounded-full bg-primary/25 blur-2xl transition-transform duration-500 group-hover/feature:scale-125" />
            <span className="relative text-lg font-extrabold leading-tight tracking-[-0.02em]">
              {group.feature.title}
            </span>
            <span className="relative mt-2 text-sm text-white/70">{group.feature.text}</span>
            <span className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              {group.feature.cta}
              <ArrowRight weight="bold" className="size-4 transition-transform duration-200 group-hover/feature:translate-x-1" />
            </span>
          </Link>
        </NavigationMenu.Link>
      ) : null}
      <ul className="grid flex-1 grid-cols-2 content-start gap-1">
        {group.links.map((link) => (
          <li key={link.href + link.label}>
            <MenuLink link={link} active={isActive(pathname, link.href)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MenuLink({ link, active }: { link: NavLink; active: boolean }) {
  const Icon = link.icon;
  return (
    <NavigationMenu.Link asChild active={active}>
      <Link
        href={link.href}
        className={cn(
          "group/link flex items-start gap-3 rounded-2xl p-2.5 outline-none transition-colors",
          "hover:bg-muted focus-visible:bg-muted data-[active]:bg-primary/15"
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-foreground/80 transition-[background-color,color,transform] duration-200 group-hover/link:-rotate-6 group-hover/link:scale-105 group-hover/link:bg-primary group-hover/link:text-ink group-data-[active]/link:bg-primary">
          <Icon className="size-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-sm font-semibold">
            {link.label}
            <ArrowUpRight weight="bold" className="size-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100" />
          </span>
          {link.description ? (
            <span className="mt-0.5 block text-xs text-muted-foreground">{link.description}</span>
          ) : null}
        </span>
      </Link>
    </NavigationMenu.Link>
  );
}

/** Numbered steps joined by a dotted trail — the order students actually go through. */
function JourneyPanel({ group, pathname }: { group: NavGroup; pathname: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="w-[560px] p-1">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Your path to a German master&apos;s
      </p>
      <ol className="relative grid grid-cols-2 gap-x-2">
        {group.links.map((link, i) => {
          const Icon = link.icon;
          const active = isActive(pathname, link.href);
          const isLastInColumn = i === 2 || i === group.links.length - 1;
          return (
            <motion.li
              key={link.href}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.04 * i, duration: 0.25 }}
              className={cn("relative", i < 3 ? "col-start-1" : "col-start-2")}
              style={{ gridRow: (i % 3) + 1 }}
            >
              {!isLastInColumn ? (
                <motion.span
                  aria-hidden
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: reduceMotion ? 0 : 0.12 + 0.06 * i, duration: 0.35 }}
                  className="absolute left-[27px] top-[46px] h-[calc(100%-30px)] w-0 origin-top border-l-2 border-dotted border-ink/45"
                />
              ) : null}
              <NavigationMenu.Link asChild active={active}>
                <Link
                  href={link.href}
                  className="group/link relative flex items-start gap-3 rounded-2xl p-2.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted data-[active]:bg-primary/15"
                >
                  <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-border bg-white text-foreground/80 transition-[background-color,color,transform,border-color] duration-200 group-hover/link:scale-110 group-hover/link:border-ink group-hover/link:bg-ink group-hover/link:text-primary">
                    <Icon className="size-[18px]" />
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary font-mono text-[10px] font-bold text-ink">
                      {i + 1}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{link.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{link.description}</span>
                  </span>
                </Link>
              </NavigationMenu.Link>
            </motion.li>
          );
        })}
      </ol>
      {group.footer ? (
        <NavigationMenu.Link asChild>
          <Link
            href={group.footer.href}
            className="group/foot mt-2 flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm font-semibold outline-none transition-colors hover:bg-primary/30 focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {group.footer.label}
            <ArrowRight weight="bold" className="size-4 transition-transform group-hover/foot:translate-x-1" />
          </Link>
        </NavigationMenu.Link>
      ) : null}
    </div>
  );
}
