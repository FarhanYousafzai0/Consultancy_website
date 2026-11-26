import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listInternshipAdminRecords } from "@/lib/db/internships";

export const metadata = { title: "Admin · Internships" };

export default async function AdminInternshipsPage() {
  const internships = await listInternshipAdminRecords();
  return <AdminShell title="Internships" headerActions={<p className="text-sm text-muted-foreground">Review provenance and publish only verified opportunities.</p>}>
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Internship</th><th className="px-4 py-3">Verification</th><th className="px-4 py-3">Publication</th><th className="px-4 py-3">Deadline</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{internships.map((item) => <tr key={item.id} className="border-b border-border last:border-0"><td className="px-4 py-3"><p className="font-semibold">{item.title}</p><p className="text-muted-foreground">{item.organizationName} · {item.locationLabel ?? item.countryCode ?? "Location unknown"}</p></td><td className="px-4 py-3"><Badge variant={item.verificationStatus === "verified" ? "verified" : item.verificationStatus === "rejected" ? "error" : "predicted"}>{item.verificationStatus}</Badge></td><td className="px-4 py-3"><Badge variant={item.publicationStatus === "published" ? "verified" : item.publicationStatus === "draft" ? "predicted" : "neutral"}>{item.publicationStatus}</Badge></td><td className="px-4 py-3">{item.deadline ?? item.deadlineStatus.replaceAll("_", " ")}</td><td className="px-4 py-3 text-muted-foreground">{item.sourceDomain}</td><td className="px-4 py-3 text-muted-foreground">{item.updatedAt.slice(0, 10)}</td><td className="px-4 py-3"><Button asChild size="sm" variant="outline"><Link href={`/admin/internships/${item.id}`}>Review</Link></Button></td></tr>)}</tbody></table>{internships.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No internship records require review yet.</p>}</div>
  </AdminShell>;
}
