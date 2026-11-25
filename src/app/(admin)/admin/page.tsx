import { AdminOverviewChart } from "@/components/admin/admin-overview-chart";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/db/admin-overview";

export const metadata = { title: "Admin · Overview" };

export default async function AdminIndexPage() {
  const data = await getAdminOverview();
  const contacted = data.consultationCounts.contacted + data.leadCounts.contacted;
  const activeQueue = data.consultationCounts.new + data.leadCounts.new;

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard label="All evaluations" value={data.consultationCounts.all} hint="Every student request" icon="clipboard" href="/admin/consultations" tone="lime" />
        <AdminMetricCard label="Need response" value={activeQueue} hint="New evaluations and leads" icon="clock" href="/admin/consultations?status=new" tone="blue" />
        <AdminMetricCard label="Contacted" value={contacted} hint="Active conversations" icon="trend" href="/admin/consultations?status=contacted" tone="mint" />
        <AdminMetricCard label="Scholarships" value={data.scholarshipCount} hint="Available opportunities" icon="book" href="/admin/scholarships" tone="teal" />
      </div>

      <Card className="mt-7 overflow-hidden rounded-[1.35rem] border-[#e1efb0] bg-white shadow-[0_10px_30px_rgb(47_93_10_/_0.045)] ring-1 ring-[#eff8d3]/70">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-5"><div><p className="section-label">Student pipeline</p><h2 className="mt-1 text-xl font-extrabold">Evaluation activity</h2><p className="mt-1 text-sm text-muted-foreground">Requests and consultant leads received over the last seven days.</p></div><div className="flex items-center gap-4 pt-1 text-xs font-semibold text-muted-foreground"><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-primary" />Evaluations</span><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#9cbaf0]" />Leads</span></div></div>
        <CardContent className="p-6"><AdminOverviewChart data={data.dailyActivity} /></CardContent>
      </Card>

    </AdminShell>
  );
}
