"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, MagnifyingGlass, X } from "@phosphor-icons/react";

export function AdminTopHeader({ title, actions, showTools = false }: { title: string; actions?: React.ReactNode; showTools?: boolean }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/admin/consultations?search=${encodeURIComponent(value)}` : "/admin/consultations");
  }

  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] border border-white/90 bg-white/60 px-5 py-4 shadow-[0_8px_30px_rgb(15_17_16_/_0.035)] md:px-6 md:py-5">
      <div className="min-w-0 flex-1"><p className="section-label">Admin workspace</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em]">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(new Date())}</p>{actions && <div className="mt-4">{actions}</div>}</div>
      {showTools && <div className="flex items-center gap-3">
        {searchOpen ? (
          <form onSubmit={submit} className="flex h-10 items-center gap-2 rounded-xl bg-white px-3 shadow-card ring-1 ring-border">
            <MagnifyingGlass className="size-[18px] text-muted-foreground" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students..." aria-label="Search students" className="w-44 bg-transparent text-sm outline-none placeholder:text-muted-foreground md:w-64" />
            <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X className="size-4 text-muted-foreground" /></button>
          </form>
        ) : <button type="button" aria-label="Search consultations" title="Search consultations" onClick={() => setSearchOpen(true)} className="grid size-10 place-items-center rounded-xl bg-white text-foreground shadow-card transition-colors hover:bg-primary"><MagnifyingGlass className="size-[18px]" /></button>}
        <Link href="/admin/consultations?status=new" aria-label="View new notifications" title="View new notifications" className="grid size-10 place-items-center rounded-xl bg-white text-foreground shadow-card transition-colors hover:bg-primary"><Bell className="size-[18px]" /></Link>
      </div>}
    </div>
  );
}
