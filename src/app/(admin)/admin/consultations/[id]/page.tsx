import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ConsultationAdminControls } from "@/components/admin/consultation-admin-controls";
import { getConsultation } from "@/lib/db/consultations";
import { summarySections } from "@/lib/consultation/summary";
import {
  ArchiveTrayIcon,
  ArrowLeft,
  EnvelopeSimple,
  FileText,
  IdentificationCard,
  MapPin,
  Phone,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { labelOf, hecOptions, passportOptions } from "@/lib/consultation/schema";

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
      <Link href="/admin/consultations" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline">
        <ArrowLeft aria-hidden="true" className="size-4" /> All consultations
      </Link>

      <section className="mt-6 overflow-hidden rounded-[1.5rem] bg-ink p-6 text-primary shadow-card md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-ink"><UserCircle weight="duotone" className="size-7" /></span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary/60">Student profile</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] md:text-3xl">{c.fullName}</h2>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-primary/75">
              <span className="inline-flex items-center gap-2"><Phone className="size-4" />{c.phone}</span>
              <span className="inline-flex items-center gap-2"><EnvelopeSimple className="size-4" />{c.email}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="size-4" />{c.answers.city}</span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary/60">Reference</p>
            <p className="mt-1 font-mono text-lg font-bold">{c.reference}</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {summarySections(c.answers).map((s) => (
            <section key={s.title} className="rounded-[1.25rem] bg-white p-5 shadow-card ring-1 ring-black/[0.03]">
              <h2 className="flex items-center gap-2 font-extrabold"><FileText aria-hidden="true" className="size-5 text-forest" weight="duotone" />{s.title}</h2>
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
          <div className="rounded-[1.25rem] bg-white p-5 text-sm shadow-card ring-1 ring-black/[0.03]">
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
          <div className="rounded-[1.25rem] bg-white p-5 shadow-card ring-1 ring-black/[0.03]">
            <h2 className="flex items-center gap-2 font-extrabold"><IdentificationCard className="size-5 text-forest" weight="duotone" />Document readiness</h2>
            <p className="mt-2 text-sm text-muted-foreground">The evaluation captures readiness signals. File uploads are not attached to this consultation record yet.</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3"><dt className="text-muted-foreground">Passport</dt><dd className="text-right font-semibold">{labelOf(passportOptions, c.answers.passport)}</dd></div>
              <div className="flex items-start justify-between gap-3"><dt className="text-muted-foreground">HEC attestation</dt><dd className="text-right font-semibold">{labelOf(hecOptions, c.answers.hecAttestation)}</dd></div>
              <div className="flex items-start justify-between gap-3"><dt className="text-muted-foreground">Academic record</dt><dd className="text-right font-semibold">{c.answers.degreeTitle ? "Details captured" : "Not provided"}</dd></div>
              <div className="flex items-start justify-between gap-3"><dt className="text-muted-foreground">Resume / CV</dt><dd className="text-right font-semibold">Not uploaded</dd></div>
            </dl>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground"><ArchiveTrayIcon className="size-4 shrink-0" />Upload storage can be connected here in the next feature pass.</div>
          </div>
          <ConsultationAdminControls id={c.id} status={c.status} adminNotes={c.adminNotes} />
        </aside>
      </div>
    </AdminShell>
  );
}
