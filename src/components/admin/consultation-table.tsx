"use client";

import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDots,
  ClipboardText,
  GraduationCap,
  IdentificationCard,
  Note,
  UserCircle,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { intakeLabel } from "@/lib/consultation/summary";
import { gradeSystemOptions, labelOf, serviceOptions } from "@/lib/consultation/schema";
import type { ConsultationRecord } from "@/lib/db/consultations";

const columns = [
  [CalendarDots, "When"],
  [UserCircle, "Student"],
  [GraduationCap, "Profile"],
  [ClipboardText, "Wants"],
  [IdentificationCard, "Intake"],
  [Note, "Status"],
] as const;

export function ConsultationTable({ items }: { items: ConsultationRecord[] }) {
  const router = useRouter();

  function open(id: string) {
    router.push(`/admin/consultations/${id}`);
  }

  return (
    <div className="overflow-x-auto rounded-[1.35rem] bg-white shadow-card ring-1 ring-black/[0.03]">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map(([Icon, label]) => (
              <th key={label} className="px-4 py-3 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Icon aria-hidden="true" weight="duotone" className="size-4 text-forest" />
                  {label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-muted-foreground">
                No consultation requests yet.
              </td>
            </tr>
          ) : (
            items.map((c) => (
              <tr
                key={c.id}
                tabIndex={0}
                role="link"
                aria-label={`Open consultation for ${c.fullName}`}
                onClick={() => open(c.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open(c.id);
                  }
                }}
                className="group cursor-pointer border-b border-border outline-none transition-colors last:border-0 hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest"
              >
                <td className="px-4 py-4 text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                    <ArrowUpRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-1 font-mono text-xs">{c.reference}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-foreground">{c.fullName}</p>
                  <p className="truncate text-muted-foreground">{c.email}</p>
                  <p className="text-muted-foreground">{c.phone}</p>
                  <p className="text-muted-foreground">{c.answers.city}</p>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  <p className="text-foreground">{c.answers.degreeTitle}</p>
                  <p className="max-w-[13rem] truncate text-xs">{c.answers.university}</p>
                  <p>
                    {c.answers.gradeValue} {labelOf(gradeSystemOptions, c.answers.gradeSystem)}
                    {c.answers.englishScore != null
                      ? ` · ${c.answers.englishTest.toUpperCase()} ${c.answers.englishScore}`
                      : ""}
                  </p>
                </td>
                <td className="max-w-xs px-4 py-4 text-muted-foreground">
                  <span className="capitalize text-foreground">{c.degreeLevel}</span>
                  {" · "}
                  {c.answers.services.map((s) => labelOf(serviceOptions, s)).join(", ")}
                </td>
                <td className="px-4 py-4">{intakeLabel(c.intake)}</td>
                <td className="px-4 py-4">
                  <Badge className={statusClass(c.status)} variant="neutral">
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function statusClass(status: ConsultationRecord["status"]) {
  const colors = {
    new: "bg-[#dafa76] text-[#183000]",
    contacted: "bg-[#c7dafa] text-[#244c8a]",
    booked: "bg-[#bfead3] text-[#1d6b45]",
    paid: "bg-[#bde5e3] text-[#0c6764]",
    closed: "bg-muted text-muted-foreground",
  } satisfies Record<ConsultationRecord["status"], string>;
  return colors[status];
}
