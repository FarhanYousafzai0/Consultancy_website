"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardText, House, List, UsersThree } from "@phosphor-icons/react";
import { cn } from "cn";

const tabs = [
  { href: "/admin", label: "Home", icon: House },
  { href: "/admin/consultations", label: "Reviews", icon: ClipboardText },
  { href: "/admin/leads", label: "Leads", icon: UsersThree },
  { href: "/admin/programs", label: "More", icon: List },
] as const;

export function AdminMobileTabBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-muted bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex justify-around px-1 pb-3 pt-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} className={cn("flex flex-col items-center gap-0.5 text-[11px] font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors", active && "bg-primary")}>
                  <Icon weight={active ? "fill" : "regular"} className="size-5" />
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

