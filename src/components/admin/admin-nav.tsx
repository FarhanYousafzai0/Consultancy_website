"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardText,
  GraduationCap,
  House,
  UsersThree,
} from "@phosphor-icons/react";
import { cn } from "cn";

const nav = [
  { href: "/admin", label: "Overview", icon: House },
  { href: "/admin/consultations", label: "Consultations", icon: ClipboardText },
  { href: "/admin/leads", label: "Leads", icon: UsersThree },
  { href: "/admin/programs", label: "Programs", icon: GraduationCap },
  { href: "/admin/scholarships", label: "Scholarships", icon: BookOpen },
] as const;

export function AdminNav({ consultationCount = 0, newConsultationCount = 0 }: { consultationCount?: number; newConsultationCount?: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="space-y-1">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

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
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">{label}{label === "Consultations" && <span className="inline-flex items-center gap-1.5"><span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold leading-none">{consultationCount}</span>{newConsultationCount > 0 && <span title={`${newConsultationCount} new consultation${newConsultationCount === 1 ? "" : "s"}`} aria-label={`${newConsultationCount} new consultations`} className="size-2 rounded-full bg-[#dafa76] ring-2 ring-background" />}</span>}</span>
          </Link>
        );
      })}
    </nav>
  );
}

