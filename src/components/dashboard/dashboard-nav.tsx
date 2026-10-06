"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookmarkSimple,
  ChatCircleDots,
  FileText,
  House,
  ListChecks,
  Medal,
  Target,
  User,
} from "@phosphor-icons/react";
import { cn } from "cn";

const nav = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/dashboard/matches", label: "Matches", icon: Target },
  { href: "/dashboard/shortlist", label: "Applications", icon: BookmarkSimple },
  { href: "/dashboard/next-steps", label: "Next steps", icon: ListChecks },
  { href: "/dashboard/scholarships", label: "Scholarships", icon: Medal },
  { href: "/dashboard/advisor", label: "Advisor", icon: ChatCircleDots },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="space-y-1">
      {nav.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-muted"
            )}
          >
            <Icon weight={active ? "fill" : "regular"} className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
