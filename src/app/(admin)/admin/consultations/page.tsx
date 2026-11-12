import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { listConsultations } from "@/lib/db/consultations";
import {
  CONSULTATION_STATUSES,
  type ConsultationStatus,
} from "@/lib/db/consultation-model";
import { intakeLabel } from "@/lib/consultation/summary";
import { gradeSystemOptions, labelOf, serviceOptions } from "@/lib/consultation/schema";

export const metadata = { title: "Admin · Consultations" };

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = CONSULTATION_STATUSES.includes(status as ConsultationStatus)
    ? (status as ConsultationStatus)
    : undefined;
  const items = await listConsultations(filter);

  return (
    <AdminShell title="Consultation requests">
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/consultations"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!filter ? "bg-ink text-primary" : "bg-muted"}`}
        >
          All
        </Link>
        {CONSULTATION_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/consultations?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${filter === s ? "bg-ink text-primary" : "bg-muted"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Profile</th>
              <th className="px-4 py-3 font-semibold">Wants</th>
              <th className="px-4 py-3 font-semibold">Intake</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-muted-foreground">
                  No consultation requests yet.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                    <p className="font-mono text-xs">{c.reference}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/consultations/${c.id}`} className="font-semibold text-forest hover:underline">
                      {c.fullName}
                    </Link>
                    <p className="text-muted-foreground">{c.phone}</p>
                    <p className="text-muted-foreground">{c.answers.city}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p className="text-foreground">{c.answers.degreeTitle}</p>
                    <p>
                      {c.answers.gradeValue} {labelOf(gradeSystemOptions, c.answers.gradeSystem)}
                      {c.answers.englishScore != null ? ` · ${c.answers.englishTest.toUpperCase()} ${c.answers.englishScore}` : ""}
                    </p>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    <span className="capitalize text-foreground">{c.degreeLevel}</span>
                    {" · "}
                    {c.answers.services.map((s) => labelOf(serviceOptions, s)).join(", ")}
                  </td>
                  <td className="px-4 py-3">{intakeLabel(c.intake)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === "new" ? "predicted" : c.status === "paid" ? "verified" : "neutral"}>
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
