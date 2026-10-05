import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import { DeleteProgramButton } from "@/components/admin/delete-program-button";

export const metadata = {
  title: "Admin · Programs",
};

export default async function AdminProgramsPage() {
  await ensureSeeded();
  const programs = await listPrograms({ status: "all" });

  return (
    <AdminShell title="Programs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {programs.length} programs · storage:{" "}
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
            {programs.map((program) => (
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
    </AdminShell>
  );
}
