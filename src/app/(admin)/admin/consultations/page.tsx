import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ConsultationTable } from "@/components/admin/consultation-table";
import { listConsultationsPage } from "@/lib/db/consultations";
import {
  CONSULTATION_STATUSES,
  type ConsultationStatus,
} from "@/lib/db/consultation-model";

export const metadata = { title: "Admin · Consultations" };

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const { status, page: pageParam, search = "" } = await searchParams;
  const filter = CONSULTATION_STATUSES.includes(status as ConsultationStatus)
    ? (status as ConsultationStatus)
    : undefined;
  const page = Number.parseInt(pageParam ?? "1", 10);
  const result = await listConsultationsPage(filter, Number.isFinite(page) ? page : 1, 10, search);
  const query = `${filter ? `&status=${filter}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

  return (
    <AdminShell title="Consultation requests" headerActions={<div className="flex flex-wrap gap-2">
        <Link
          href="/admin/consultations"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!filter ? "bg-ink text-primary" : "bg-muted"}`}
        >
          All
        </Link>
        {CONSULTATION_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/consultations?status=${s}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${filter === s ? "bg-ink text-primary" : "bg-muted"}`}
          >
            {s}
          </Link>
        ))}
      </div>}>

      {search && <p className="mb-4 text-sm text-muted-foreground">Search results for <span className="font-semibold text-foreground">“{search}”</span></p>}

      <ConsultationTable items={result.items} />
      {result.pages > 1 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm shadow-card">
        <p className="text-muted-foreground">Showing {(result.page - 1) * result.pageSize + 1}-{Math.min(result.page * result.pageSize, result.total)} of {result.total}</p>
        <nav aria-label="Consultation pages" className="flex items-center gap-1.5">
          {result.page > 1 && <Link className="rounded-full bg-muted px-3 py-1.5 font-semibold hover:bg-primary/30" href={`/admin/consultations?page=${result.page - 1}${query}`}>Previous</Link>}
          {pageNumbers(result.page, result.pages).map((number, index) => number === "ellipsis" ? <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">…</span> : <Link key={number} aria-current={number === result.page ? "page" : undefined} className={`grid size-8 place-items-center rounded-full font-semibold ${number === result.page ? "bg-ink text-primary" : "bg-muted hover:bg-primary/30"}`} href={`/admin/consultations?page=${number}${query}`}>{number}</Link>)}
          {result.page < result.pages && <Link className="rounded-full bg-muted px-3 py-1.5 font-semibold hover:bg-primary/30" href={`/admin/consultations?page=${result.page + 1}${query}`}>Next</Link>}
        </nav>
      </div>}
    </AdminShell>
  );
}

function pageNumbers(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, 4, "ellipsis", total];
  if (current >= total - 2) return [1, "ellipsis", total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}
