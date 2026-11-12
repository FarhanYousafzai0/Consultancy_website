import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ConsultationAdminControls } from "@/components/admin/consultation-admin-controls";
import { getConsultation } from "@/lib/db/consultations";
import { summarySections } from "@/lib/consultation/summary";

export const metadata = { title: "Admin · Consultation" };

export default async function AdminConsultationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getConsultation(id);
  if (!c) notFound();

  const waNumber = c.phone.replace(/[^0-9]/g, "").replace(/^0/, "92");

  return (
    <AdminShell title={`${c.fullName} · ${c.reference}`}>
      <Link href="/admin/consultations" className="text-sm text-forest hover:underline">
        ← All consultations
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {summarySections(c.answers).map((s) => (
            <section key={s.title} className="rounded-2xl bg-white p-5 shadow-card">
              <h2 className="font-extrabold">{s.title}</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[180px_1fr]">
                {s.rows.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="whitespace-pre-wrap break-words font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-5 text-sm shadow-card">
            <p className="text-muted-foreground">Submitted {new Date(c.createdAt).toLocaleString()}</p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                className="font-semibold text-forest hover:underline"
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${c.fullName.split(" ")[0]}, this is Parwaaz Consultancy about your request ${c.reference}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {c.phone}
              </a>
              <a className="font-semibold text-forest hover:underline" href={`mailto:${c.email}?subject=${encodeURIComponent(`Your Parwaaz consultation (${c.reference})`)}`}>
                {c.email}
              </a>
            </div>
          </div>
          <ConsultationAdminControls id={c.id} status={c.status} adminNotes={c.adminNotes} />
        </aside>
      </div>
    </AdminShell>
  );
}
