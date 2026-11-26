import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/layout/logo";
import { AdminNav } from "@/components/admin/admin-nav";

function Bars({
  count,
  card,
}: {
  count: number;
  card: (index: number) => ReactNode;
}) {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>{card(index)}</li>
      ))}
    </ul>
  );
}

export function ProgramCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card md:p-5">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-44 rounded-full" />
        <Skeleton className="h-7 w-36 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-6 w-3/4 max-w-md" />
      <Skeleton className="mt-2 h-4 w-1/2 max-w-xs" />
      <Skeleton className="mt-2 h-4 w-2/3 max-w-sm" />
    </div>
  );
}

export function ProgramCardSkeletonList({ count = 4 }: { count?: number }) {
  return <Bars count={count} card={() => <ProgramCardSkeleton />} />;
}

export function ScholarshipCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-2 h-6 w-3/4 max-w-md" />
      <Skeleton className="mt-2 h-4 w-40" />
      <Skeleton className="mt-2 h-4 w-2/3 max-w-sm" />
    </div>
  );
}

export function ScholarshipCardSkeletonList({ count = 4 }: { count?: number }) {
  return <Bars count={count} card={() => <ScholarshipCardSkeleton />} />;
}

export function ScholarshipResultsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[440px] flex-col rounded-3xl border border-border bg-white p-6 shadow-card"
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="size-11 rounded-2xl" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-3 w-40" />
          <Skeleton className="mt-3 h-6 w-full" />
          <Skeleton className="mt-2 h-6 w-4/5" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
          </div>
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="mt-auto pt-6">
            <Skeleton className="mb-4 h-3 w-2/3" />
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="mt-2 h-11 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InternshipResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[500px] flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-card"
        >
          <div className="flex items-center justify-between gap-3 bg-ink px-5 py-4">
            <Skeleton className="size-11 rounded-2xl bg-white/15" />
            <Skeleton className="h-7 w-24 rounded-full bg-white/15" />
          </div>
          <div className="flex flex-1 flex-col p-5 md:p-6">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-3 h-6 w-full" />
            <Skeleton className="mt-2 h-6 w-4/5" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <div className="mt-5 flex gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="mt-5 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-11/12" />
            </div>
            <div className="mt-auto pt-6">
              <Skeleton className="mb-4 h-3 w-2/3" />
              <Skeleton className="h-11 w-full rounded-full" />
              <Skeleton className="mt-2 h-8 w-2/5 self-center rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InternshipPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl bg-background px-4 pb-16 pt-12 md:px-6 md:pt-16" aria-busy="true">
      <div className="mx-auto max-w-3xl text-center">
        <Skeleton className="mx-auto h-4 w-40" />
        <Skeleton className="mx-auto mt-4 h-12 w-96 max-w-full" />
        <Skeleton className="mx-auto mt-4 h-4 w-full max-w-2xl" />
        <Skeleton className="mx-auto mt-2 h-4 w-4/5 max-w-xl" />
      </div>
      <div className="mt-10 rounded-3xl border border-border bg-white p-4 md:p-6">
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <FilterFieldSkeleton key={index} />)}
        </div>
      </div>
      <div className="mt-8">
        <Skeleton className="mb-5 h-4 w-36" />
        <InternshipResultsSkeleton />
      </div>
    </div>
  );
}

export function ScholarshipPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl bg-background px-4 pb-16 pt-12 md:px-6 md:pt-16" aria-busy="true">
      <div className="mx-auto max-w-2xl text-center">
        <Skeleton className="mx-auto h-12 w-80 max-w-full" />
        <Skeleton className="mx-auto mt-4 h-4 w-full max-w-xl" />
        <Skeleton className="mx-auto mt-2 h-4 w-4/5 max-w-lg" />
      </div>
      <div className="mt-10 rounded-3xl border border-border bg-white p-4 md:p-6">
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <FilterFieldSkeleton key={index} />)}
        </div>
      </div>
      <div className="mt-7">
        <Skeleton className="mb-5 h-4 w-32" />
        <ScholarshipResultsSkeleton />
      </div>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <Skeleton className="h-5 w-4/5 max-w-md" />
      <Skeleton className="mt-2 h-4 w-1/2 max-w-xs" />
      <Skeleton className="mt-3 h-4 w-32" />
    </div>
  );
}

export function ListingCardSkeletonList({ count = 4 }: { count?: number }) {
  return <Bars count={count} card={() => <ListingCardSkeleton />} />;
}

export function AusbildungCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="flex min-h-[300px] flex-col rounded-3xl border border-border bg-white p-5 shadow-card"
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="size-9 rounded-xl" />
          </div>
          <Skeleton className="mt-5 h-6 w-full" />
          <Skeleton className="mt-2 h-5 w-4/5" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="mt-auto h-11 w-full rounded-full" />
        </li>
      ))}
    </ul>
  );
}

export function AusbildungPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14" aria-busy="true">
      <section className="rounded-[2rem] bg-muted px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto h-4 w-24" />
          <Skeleton className="mx-auto mt-4 h-12 w-full max-w-xl" />
          <Skeleton className="mx-auto mt-4 h-4 w-full max-w-2xl" />
          <Skeleton className="mx-auto mt-2 h-4 w-4/5 max-w-xl" />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Skeleton className="h-11 w-40 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </section>
      <section className="mt-10 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <div className="pt-3">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-11 flex-1 rounded-full" />
            <Skeleton className="h-11 flex-1 rounded-full" />
            <Skeleton className="h-11 flex-1 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
          </div>
          <AusbildungCardSkeletonList />
        </div>
      </section>
    </div>
  );
}

export function GuideRowSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-10" aria-hidden>
      {Array.from({ length: 3 }, (_, section) => (
        <section key={section}>
          <Skeleton className="h-6 w-32" />
          <ul className="mt-3 space-y-2">
            {Array.from({ length: count }, (_, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-card"
              >
                <Skeleton className="h-5 w-2/3 max-w-sm" />
                <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function MatchCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <ul className="mt-6 space-y-4" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="rounded-2xl bg-muted/50 p-4 md:p-5">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-6 w-3/4 max-w-md" />
          <Skeleton className="mt-2 h-4 w-1/2 max-w-xs" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-1.5 h-4 w-5/6" />
        </li>
      ))}
    </ul>
  );
}

export function RecordDetailSkeleton({
  variant = "facts",
}: {
  variant?: "facts" | "article";
}) {
  return (
    <div
      className="mx-auto max-w-3xl px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-8"
      aria-busy="true"
    >
      <Skeleton className="mb-4 h-8 w-36 rounded-full" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-10 w-4/5 max-w-xl" />
      <Skeleton className="mt-3 h-6 w-1/2 max-w-sm" />
      {variant === "facts" ? (
        <div className="mt-8 grid gap-4 rounded-2xl bg-white p-6 shadow-card sm:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-36" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-9 w-64 max-w-full" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-6 w-2/3 max-w-sm" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-2 h-4 w-4/6" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-16 w-full rounded-xl" />
          <Skeleton className="mt-3 h-16 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-16 w-full rounded-xl" />
          <Skeleton className="mt-3 h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card" aria-hidden>
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterFieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

export function ProgramsBrowseSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">International programmes</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
          International programmes in Germany
        </h1>
        <p className="mt-2 text-muted-foreground">
          Programmes Parwaaz has checked against university pages — English-taught,
          bilingual, and German-taught, at public and private universities.
        </p>
      </div>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-border bg-white p-4 shadow-card">
          {Array.from({ length: 8 }, (_, index) => (
            <FilterFieldSkeleton key={index} />
          ))}
        </aside>
        <section>
          <Skeleton className="mb-4 h-5 w-24" />
          <ProgramCardSkeletonList />
        </section>
      </div>
    </div>
  );
}

export function ScholarshipsBrowseSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Scholarships for Germany</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
          Fully funded scholarships for Germany
        </h1>
        <p className="mt-3 text-muted-foreground">
          Funding for Pakistani graduates heading to a Master&apos;s in Germany.
          Filter by subject and purpose.
        </p>
      </div>
      <div className="mt-8 flex flex-col items-start gap-6 lg:flex-row">
        <aside className="w-full space-y-4 rounded-2xl border border-border bg-white p-4 shadow-card lg:w-80">
          {Array.from({ length: 5 }, (_, index) => (
            <FilterFieldSkeleton key={index} />
          ))}
        </aside>
        <div className="min-w-0 flex-1 space-y-4">
          <Skeleton className="h-5 w-28" />
          <ScholarshipCardSkeletonList />
        </div>
      </div>
    </div>
  );
}

export function AdminPageSkeleton({ title }: { title: string }) {
  return (
    <AdminLoadingFrame title={title}>
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-9 w-20 rounded-full" />)}
      </div>
      <TableSkeleton rows={7} />
    </AdminLoadingFrame>
  );
}

export function AdminOverviewSkeleton() {
  return (
    <AdminLoadingFrame title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-[1.25rem] bg-white p-5 shadow-card">
            <div className="flex items-start justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="size-10 rounded-2xl" /></div>
            <Skeleton className="mt-4 h-11 w-16" />
            <Skeleton className="mt-4 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-7 overflow-hidden rounded-[1.25rem] bg-white shadow-card"><div className="border-b border-border px-6 py-5"><Skeleton className="h-3 w-28" /><Skeleton className="mt-3 h-6 w-48" /><Skeleton className="mt-2 h-3 w-72 max-w-full" /></div><div className="p-6"><Skeleton className="h-[250px] w-full rounded-xl" /></div></div>
    </AdminLoadingFrame>
  );
}

export function AdminConsultationDetailSkeleton() {
  return (
    <AdminLoadingFrame title="Consultation profile">
      <Skeleton className="h-5 w-40" />
      <div className="mt-6 rounded-[1.5rem] bg-ink p-8"><Skeleton className="h-10 w-64 bg-white/15" /><Skeleton className="mt-5 h-4 w-96 max-w-full bg-white/15" /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">{Array.from({ length: 5 }, (_, index) => <div key={index} className="rounded-[1.25rem] bg-white p-5 shadow-card"><Skeleton className="h-5 w-32" /><Skeleton className="mt-5 h-20 w-full" /></div>)}</div>
        <div className="space-y-4"><div className="rounded-[1.25rem] bg-white p-5 shadow-card"><Skeleton className="h-20 w-full" /></div><div className="rounded-[1.25rem] bg-white p-5 shadow-card"><Skeleton className="h-32 w-full" /></div></div>
      </div>
    </AdminLoadingFrame>
  );
}

function AdminLoadingFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#edf1ee] p-0 md:p-4" aria-busy="true">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border border-border bg-background md:inset-y-4 md:left-4 md:flex md:rounded-[1.5rem] md:shadow-card">
        <div className="flex h-full flex-col px-4 py-6"><Logo /><p className="mt-8 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p><div className="mt-3"><AdminNav /></div></div>
      </aside>
      <main className="mx-auto max-w-[1440px] px-4 py-6 pb-24 md:pl-[19rem] md:py-5 md:pb-5">
        <div className="mb-7 px-1 py-1 md:px-2 md:py-2"><p className="section-label">Admin workspace</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em]">{title}</h1><Skeleton className="mt-2 h-3 w-28" /></div>
        {children}
      </main>
    </div>
  );
}
