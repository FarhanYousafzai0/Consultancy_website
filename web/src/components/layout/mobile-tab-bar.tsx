"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MagnifyingGlass, Medal, Target, User } from "@phosphor-icons/react";
import { cn } from "cn";

const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/programs", label: "Search", icon: MagnifyingGlass },
  { href: "/check", label: "Matches", icon: Target },
  { href: "/scholarships", label: "Scholarships", icon: Medal },
  { href: "/login", label: "Profile", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-muted bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex justify-around px-1 pt-2 pb-3">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 text-[11px] font-semibold",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-14 place-items-center rounded-full transition-colors",
                    active && "bg-primary"
                  )}
                >
                  <Icon weight={active ? "fill" : "regular"} className="size-[22px]" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
