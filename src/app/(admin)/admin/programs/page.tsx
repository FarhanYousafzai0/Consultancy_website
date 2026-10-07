import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import { DeleteProgramButton } from "@/components/admin/delete-program-button";

export const metadata = {
  title: "Admin · Programs",
};

const PAGE_SIZE = 25;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminProgramsPage({ searchParams }: Props) {
  await ensureSeeded();
  const programs = await listPrograms({ status: "all" });
  const sp = await searchParams;
  const totalPages = Math.max(1, Math.ceil(programs.length / PAGE_SIZE));
  const requested = Number.parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(1, requested), totalPages)
    : 1;
  const start = (page - 1) * PAGE_SIZE;
  const pagePrograms = programs.slice(start, start + PAGE_SIZE);
  const showingFrom = programs.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, programs.length);

  return (
    <AdminShell title="Programs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {programs.length} programs · showing {showingFrom}–{showingTo} ·
            storage:{" "}
            <span className="font-semibold text-foreground">MongoDB</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Seed rows are illustrative until you verify each source URL.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/programs/new">Add program</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Program</th>
              <th className="px-4 py-3 font-semibold">Level</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Verified</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagePrograms.map((program) => (
              <tr key={program.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{program.name}</p>
                  <p className="text-muted-foreground">
                    {program.university} · {program.city}
                  </p>
                </td>
                <td className="px-4 py-3 capitalize">{program.degreeLevel}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={program.status === "published" ? "verified" : "predicted"}
                  >
                    {program.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {program.lastVerifiedAt ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/programs/${program.id}`}>Edit</Link>
                    </Button>
                    <DeleteProgramButton id={program.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={
                    page === 2 ? "/admin/programs" : `/admin/programs?page=${page - 1}`
                  }
                >
                  Previous
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                Previous
              </Button>
            )}
            {page < totalPages ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/programs?page=${page + 1}`}>Next</Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                Next
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
