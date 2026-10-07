import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
          Funding for students living in Pakistan. Filter by who it is for,
          subject, and purpose. Bachelor funding for non-EU students is rare.
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
    <div className="min-h-screen">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="section-label">Admin</p>
            <h1 className="mt-1 text-xl font-extrabold tracking-[-0.03em]">
              {title}
            </h1>
            <Skeleton className="mt-1 h-4 w-40" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Skeleton className="mb-6 h-4 w-56" />
        <TableSkeleton />
      </main>
    </div>
  );
}
